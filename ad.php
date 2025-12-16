<?php
require 'vendor/autoload.php';

use Firebase\JWT\JWT;

header('Content-Type: application/json');

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Auth-Token');
    exit(0);
}

header('Access-Control-Allow-Origin: *');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    file_put_contents('debug.log', "Method not allowed: " . $_SERVER['REQUEST_METHOD'] . "\n", FILE_APPEND);
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

try {
    // Get Input
    $rawInput = file_get_contents('php://input');
    file_put_contents('debug.log', "Received input: " . $rawInput . "\n", FILE_APPEND);
    $input = json_decode($rawInput, true);
    $adId = $input['ad_id'] ?? '';

    if (empty($adId)) {
        throw new Exception('Ad ID is required');
    }

    // Generate JWT
    $privateKey = file_get_contents('keys/mraid_ad_loader_private.pem');
    if (!$privateKey) {
        throw new Exception('Private key not found');
    }

    $payload = [
        'iss' => 'mraid-ad-loader',
        'aud' => 'advenue',
        'iat' => time(),
        'exp' => time() + 3600, // 1 hour expiration
        'ad_id' => $adId
    ];

    $jwt = JWT::encode($payload, $privateKey, 'RS256');
    // file_put_contents('debug.log', "Generated JWT: " . substr($jwt, 0, 20) . "...\n", FILE_APPEND);

    // Call Advenue (Mock)
    // Since we are local, we can't easily curl localhost if not configured, 
    // but let's assume standard setup. 
    // Alternatively, since it's in the same folder, we could require it, 
    // but the spec says "post curl call to Advenue".
    
    // $path = dirname($_SERVER['PHP_SELF']);
    // // Fix Windows paths (replace backslash with forward slash)
    // $path = str_replace('\\', '/', $path);
    
    // $url = 'http://' . $_SERVER['HTTP_HOST'] . $path . '/advenue.php';
    
    // // Remove double slashes if any (e.g. if path is just /)
    // $url = str_replace('//advenue.php', '/advenue.php', $url);

    $url = 'https://www.advenueplatform.com/adv2/get-ad-tag/';

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $jwt,
        'X-Auth-Token: Bearer ' . $jwt, // Fallback for server stripping Authorization header
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['adid' => $adId]));
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    if (curl_errno($ch)) {
        throw new Exception('Curl error: ' . curl_error($ch));
    }
    
    curl_close($ch);

    // Pass through the response
    http_response_code($httpCode);
    echo $response;

} catch (Exception $e) {
    file_put_contents('debug.log', $e->getMessage() . "\n", FILE_APPEND);
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
