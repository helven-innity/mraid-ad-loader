<?php
require 'vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\SignatureInvalidException;
use Firebase\JWT\BeforeValidException;

header('Content-Type: application/json');

try {
    // Debug Logging
    $log = "Headers received:\n";
    foreach ($_SERVER as $key => $value) {
        if (strpos($key, 'HTTP_') === 0) {
            $log .= "$key: $value\n";
        }
    }
    file_put_contents('debug.log', $log . "\n", FILE_APPEND);

    // Get JWT from Authorization header
    $authHeader = '';
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    } elseif (isset($_SERVER['HTTP_X_AUTH_TOKEN'])) {
        $authHeader = $_SERVER['HTTP_X_AUTH_TOKEN'];
    } elseif (function_exists('getallheaders')) {
        $headers = getallheaders();
        $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
        if (empty($authHeader)) {
             $authHeader = isset($headers['X-Auth-Token']) ? $headers['X-Auth-Token'] : '';
        }
    }
    
    if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        throw new Exception('No token provided');
    }

    $jwt = $matches[1];
    
    // Load Public Key
    $publicKey = file_get_contents('keys/mraid_ad_loader_public.pem');
    if (!$publicKey) {
        throw new Exception('Public key not found');
    }

    // Verify Token
    try {
        $decoded = JWT::decode($jwt, new Key($publicKey, 'RS256'));
    } catch (ExpiredException $e) {
        file_put_contents('debug.log', "JWT Expired: " . $e->getMessage() . "\n", FILE_APPEND);
        echo json_encode(['success' => false, 'message' => 'Token Expired']);
        exit;
    } catch (SignatureInvalidException $e) {
        file_put_contents('debug.log', "JWT Signature Invalid: " . $e->getMessage() . "\n", FILE_APPEND);
        echo json_encode(['success' => false, 'message' => 'Invalid Signature']);
        exit;
    } catch (BeforeValidException $e) {
        file_put_contents('debug.log', "JWT Not Yet Valid: " . $e->getMessage() . "\n", FILE_APPEND);
        echo json_encode(['success' => false, 'message' => 'Token Not Yet Valid']);
        exit;
    } catch (\UnexpectedValueException $e) {
        file_put_contents('debug.log', "JWT Unexpected Value: " . $e->getMessage() . "\n", FILE_APPEND);
        echo json_encode(['success' => false, 'message' => 'Invalid Token Structure']);
        exit;
    } catch (Exception $e) {
        // Catch other JWT specific errors that might not fall into above
        file_put_contents('debug.log', "JWT Generic Error: " . $e->getMessage() . "\n", FILE_APPEND);
        echo json_encode(['success' => false, 'message' => 'Verification Failed']);
        exit;
    }

    // If verification successful, return Ad Tag
    // Sample Ad Tag from Spec
    $adTag = <<<HTML
<!-- Ad Tag: Innity - Innity Generic Test Campaign 2017/18/19 -->
<div id="innity_adslot_351210"></div>
<script type="text/javascript">
var _innity = _innity || {};
_innity.ad = _innity.ad || [];
_innity.ad.push({ id: "351210", slot: "innity_adslot_351210", path: "/201612_18315/106352/351210/", country: "MY", ord: "[timestamp]" });
(function() {
	var _ia = document.createElement("script"), el = document.getElementsByTagName("script")[0];
	_ia.async = true; _ia.src = "https://cdn.innity.net/global-async.js";
	el.parentNode.insertBefore(_ia, el);
})();
</script>
<noscript><a href="https://avn.innity.com/click/?adid=BANNER_ID&cb=[timestamp]" target="_blank">
<img src="https://avn.innity.com/view/alt/?campaignid=CAMPAIGN_ID&adid=BANNER_ID&cb=[timestamp]" border="0" title="Click Here"></a></noscript>
HTML;

    echo json_encode([
        'success' => true,
        'data' => [
            'html' => $adTag
        ]
    ]);

} catch (Exception $e) {
    // Log the actual error for debugging
    file_put_contents('debug.log', "General Error: " . $e->getMessage() . "\n", FILE_APPEND);

    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
