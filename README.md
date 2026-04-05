# Darija Translator Project

This repository contains a full translator solution with:

- A **Jakarta EE web service** (`Translator-web-service`) that translates input text to Moroccan Arabic (Darija) using Google Gemini.
- A **Chrome extension** (`chrome-extension`) that translates selected text from web pages.
- A **React Native (Expo) mobile app** (`mobile-app`) that calls the same backend API.

## Repository Structure

```text
Paradigms-Project-2-Translator-Web-Service/
├── Translator-web-service/   # Java backend (WAR)
├── chrome-extension/         # Chrome extension (Manifest V3)
└── mobile-app/               # Expo React Native app
```

## High-Level Architecture

1. Client sends text to:
   `POST /Project2-1.0-SNAPSHOT/api/translator`
2. Backend enforces **HTTP Basic Auth** (`@RolesAllowed("user")`).
3. Backend calls Gemini model (`gemini-2.5-flash`) and returns translated Darija text (plain text response).

## Prerequisites

- **Java 22**
- **Maven 3.9+**
- A **Jakarta EE-compatible server** for WAR deployment (with BASIC auth realm configured)
- **Google API key** for Gemini (`GOOGLE_API_KEY`)
- For mobile app:
  - **Node.js 18+**
  - npm
  - Expo CLI/runtime (installed via dependencies)
- For browser extension:
  - Google Chrome

## 1) Backend Setup (`Translator-web-service`)

### Key tech

- Jakarta REST (`jakarta.ws.rs`)
- Servlet + security constraints (`web.xml`)
- `google-genai` Java SDK

### Configure environment variable

Set your Google API key before running/deploying:

```powershell
$env:GOOGLE_API_KEY="your_api_key_here"
```

### Build

From `Translator-web-service`:

```powershell
.\mvnw.cmd clean package
```

This produces:

`target\Project2-1.0-SNAPSHOT.war`

### Deploy

Deploy the WAR to your Jakarta EE server.

Default API path in this project:

`http://localhost:8080/Project2-1.0-SNAPSHOT/api/translator`

### Security requirement

`web.xml` protects `/api/*` using **BASIC** auth and role `user`.
Your application server must define a user mapped to role `user` in realm `ApplicationRealm` (or equivalent server-specific setup).

## 2) Chrome Extension Setup (`chrome-extension`)

### What it does

- Adds context menu item: **Translate to Darija**
- Reads selected text
- Opens side panel login UI
- Sends request to backend with Basic Auth
- Shows translated result page in extension panel

### Load extension in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `chrome-extension` folder

### Important backend endpoint note

The extension currently calls:

`http://localhost:8080/Project2-1.0-SNAPSHOT/api/translator`

Make sure backend is running there, or update URL in:

- `chrome-extension\manifest.json` (`host_permissions`)
- `chrome-extension\sidepanel.js` (fetch URL)

## 3) Mobile App Setup (`mobile-app`)

### Install dependencies

From `mobile-app`:

```powershell
npm install
```

### Run

```powershell
npm run start
```

Optional:

```powershell
npm run android
npm run ios
npm run web
```

### Endpoint configuration

Default endpoint in `App.js`:

`http://localhost:8080/Project2-1.0-SNAPSHOT/api/translator`

In the app UI, you can edit endpoint, username, and password.
If testing on a physical phone/emulator, replace `localhost` with your machine LAN IP.

## API Contract

### Request

- Method: `POST`
- URL: `/api/translator`
- Headers:
  - `Content-Type: text/plain`
  - `Authorization: Basic <base64(username:password)>`
- Body: raw text to translate

### Response

- `200 OK` + translated Darija plain text
- `401 Unauthorized` for invalid/missing credentials

## Quick End-to-End Test

1. Start/deploy backend WAR with `GOOGLE_API_KEY` set.
2. Ensure valid BASIC auth user has role `user`.
3. Test with:
   - Postman, cURL, Thunder Client, or any other HTTP tool.
   - Chrome extension (select text on any web page), or
   - Mobile app UI.
5. Confirm translated text is returned.

## Troubleshooting

- **401 Unauthorized**
  - Verify username/password.
  - Verify server user is in role `user`.
- **Network error / cannot connect**
  - Confirm backend is running on `localhost:8080`.
  - For mobile devices, use machine LAN IP instead of `localhost`.
- **Gemini call fails**
  - Verify `GOOGLE_API_KEY` is set in the backend runtime environment.
