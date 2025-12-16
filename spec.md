I need a simple app, it a ad loaded/ad preview for our dev, 2 core feature
1. user to load ad from external system with ad id input in textbox, click Load Ad button
2. user type html code and click Load Script button

## User journey:
Initilally, user will see 2 tabs, Load Ad, Load Script tabs with access to 1 and 2
On click Load Ad button, a nice loading animation will pop and remove until the external app/script is loaded

## UI:
Size 300x600
logo on top center
tabs and tab content
Entry point: ad.js, no html file, everything is generated with document.createElement()
Use simple tailwindcss styling, no build, just load it from CDN
for development purpose, create a index.html file and load the ad.js, <script src="ad.js"></script>, UI should not be handled in index.html

## Feature 1
A textbox for user to enter number(ad id), 
A submit button (Load Ad)
On submit, it post it to ad.php, under same folder
ad.php is the backend communicator that calls the external system (Advenue), Advenue will return a full ad tag in html <script> tag, below are a sample ad tag that it returns
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

How the call works:
we will be using JWT as the token that carries secret, thus we need firebas jwt, thus, composer install jwt and ad.php loads the autoload.php
then it will generate a JWT and do a post curl call to Advenue and wait for response, something looks like this JWT::encode($payload, $privateKey, 'RS256');
I need you suggest the response scheme, industrial practice
ad tag is then return to the UI which is ad.js
ad.js will render this ad tag and the ad tag is taking over then entire app, user need to hit refresh to see the UI again

next, on Advenue part, I need you to create advenue.php, inside with the function that verify JWT and returns the ad tag which i will use it in Advenue

## Feature 2
This simpler after Feature 1 is ready
A textarea to input ad tag like above, or as simple as below
<script>
ts = document.createElement('script');
ts.src = '//network.innity.com/html5/irv_plus/ad.js';
document.body.appendChild(ts);
</script>
or
<script>
    innity_pcu = '%%PCU%%';
</script>
<script src="//network.innity.com/html5/irv_plus/ad.js"></script>

The it will show loading pop up and load the ad, same as Feature 1, no Advenue call needed, so we will be reusing the same load ad tag function from Feature 1

## Summary
Feature 1: User input ad id, load from Advenue, load it into the app
Feature 2: User input ad tag, load it into the app

## Test:
Please advice on test plan and how you will implement test for this app
### Test Case:
1. user enter ad id, click Load Ad
2. user enter html code, click Load Script  

#### Test for Feature 1
since it calls Advenue externally, on, test you may assume the JWT verification is successful and return the ad tag on the sample above, you do no need to call Advenue for now until i implement it in Advenue