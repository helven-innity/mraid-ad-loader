# 📄 MRAID Ad Loader

A lightweight ad preview and testing tool for developers to load and test MRAID ads from external systems or custom HTML/JavaScript code.

## ✨ Features

- **🔗 Load Ad from Advenue**: Fetch ads from external ad platform using Ad ID with JWT authentication
- **📝 Load Custom Script**: Test custom HTML/JavaScript ad tags directly
- **📐 Placement Options**: Support for inline (300x250, 300x600, 320x480) and interstitial placements
- **⚡ Real-time Preview**: Instant ad rendering with loading animations
- **🚀 No Build Required**: Pure JavaScript with Tailwind CSS from CDN

## 🛠️ Technologies

- **Frontend**: Vanilla JavaScript (ad.js)
- **Backend**: PHP with JWT authentication
- **Styling**: Tailwind CSS (CDN)
- **Authentication**: Firebase PHP-JWT (RS256)

## 🚀 Installation

### Prerequisites

- PHP 7.4 or higher
- Composer
- Web server (Apache/Nginx) or PHP built-in server

### Setup

1. 📥 Clone the repository:
```bash
git clone <repository-url>
cd mraid-ad-loader
```

2. 📚 Install PHP dependencies:
```bash
composer install
```

3. 🔐 Generate RSA key pair for JWT authentication:
```bash
mkdir keys
openssl genrsa -out keys/mraid_ad_loader_private.pem 2048
openssl rsa -in keys/mraid_ad_loader_private.pem -pubout -out keys/mraid_ad_loader_public.pem
```

4. 🚀 Start the development server:
```bash
php -S localhost:8000
```

5. 🌐 Open `http://localhost:8000/index.html` in your browser

## 📖 Usage

### Load Ad from Advenue

1. Select the **Load Ad from Advenue** tab
2. Choose placement type (Inline or Interstitial)
3. For inline placement, select size (300x250, 300x600, or 320x480)
4. Enter an Ad ID or select from preset options
5. Click **Load Ad** button
6. The ad will render in the preview area

### Load Custom Script

1. Select the **Load Script** tab
2. Choose placement type and size
3. Paste your HTML/JavaScript ad tag in the textarea
4. Click **Load Script** button
5. The ad will render immediately

### 📄 Example Ad Tag

```html
<script>
// Example ad tag structure
var adNetwork = adNetwork || {};
adNetwork.ad = adNetwork.ad || [];
adNetwork.ad.push({ 
  id: "<AD_ID>", 
  slot: "ad_slot_<AD_ID>", 
  path: "<AD_PATH>", 
  country: "<COUNTRY_CODE>", 
  ord: "[timestamp]" 
});
(function() {
  var script = document.createElement("script");
  script.async = true; 
  script.src = "<AD_NETWORK_URL>";
  document.body.appendChild(script);
})();
</script>
```

## 🏗️ Architecture

### Frontend (ad.js)

- Pure JavaScript implementation with no framework dependencies
- Dynamic UI generation using `document.createElement()`
- Handles ad loading, rendering, and state management
- Communicates with backend via Fetch API

### Backend (ad.php)

- Receives ad ID from frontend
- Generates JWT token with RS256 algorithm
- Makes authenticated request to Advenue platform
- Returns ad tag HTML to frontend

### Advenue Integration (advenue.php)

- Verifies JWT token from incoming requests
- Validates token signature, expiration, and claims
- Returns ad tag HTML upon successful authentication
- Comprehensive error handling and logging

## 🔄 JWT Authentication Flow

1. Frontend sends Ad ID to `ad.php`
2. `ad.php` generates JWT signed with private key
3. JWT sent to Advenue platform with Authorization header
4. Advenue verifies JWT with public key
5. Upon success, Advenue returns ad tag HTML
6. Frontend renders the ad tag

### JWT Payload Structure

```json
{
  "iss": "<issuer>",
  "aud": "<audience>",
  "iat": 1234567890,
  "exp": 1234571490,
  "ad_id": "<ad_id>"
}
```

## 🔗 API Endpoints

### POST /ad.php

Request ad tag from Advenue platform.

**Request:**
```json
{
  "ad_id": "12345"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "html": "<script>...</script>"
  }
}
```

### POST /advenue.php

Verify JWT and return ad tag (for Advenue platform integration).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "html": "<script>...</script>"
  }
}
```

## 📁 File Structure

```
mraid-ad-loader/
├── ad.js              # Main frontend application
├── ad.php             # Backend API for ad loading
├── advenue.php        # JWT verification endpoint
├── index.html         # Development entry point
├── composer.json      # PHP dependencies
├── keys/              # RSA key pairs (gitignored)
│   ├── mraid_ad_loader_private.pem
│   └── mraid_ad_loader_public.pem
├── assets/
│   └── favicon.ico
└── tests/
```

## 🔒 Security

- RSA-256 JWT signing for secure authentication
- Private keys stored locally and excluded from version control
- Token expiration set to 1 hour
- CORS headers configured for cross-origin requests
- Input validation on both frontend and backend

## 🛠️ Development

### Debug Mode

Debug logs are written to `debug.log` for troubleshooting JWT and API issues.

### Preset Ad IDs

The application includes preset ad IDs for quick testing of various ad formats and sizes.

## 🛠️ Testing

Refer to `tests/UAT_TEST_CASES.md` for comprehensive scenarios and expected results.

## 📜 License

Proprietary - Internal Development Tool

## 📞 Support

For issues or questions, please contact R&D Team.
