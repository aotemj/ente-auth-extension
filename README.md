# AuthVault 2FA - OTP Autofill for Ente Auth

[中文说明](README_CN.md)

A browser extension that brings your Ente Auth 2FA codes directly into your browser with smart autofill.

> **Note**: This is a modified fork of [ente-auth-extension](https://github.com/aheimowitz/ente-auth-extension) by aheimowitz, redistributed under AGPL-3.0. It is not officially affiliated with the Ente team.

## Features

- **View and copy** your 2FA codes from the browser toolbar
- **Autofill** - automatic detection of MFA input fields on websites
- **Smart matching** - domain matching to suggest relevant codes
- **One-click fill** with optional auto-submit
- **Create new codes** manually or by scanning QR codes from the current page
- **Edit and delete** existing codes
- **Organize with tags** - create, rename, delete, and filter by tags
- **Pin codes** to keep your most-used codes at the top
- **Sort by** issuer, recently used, or most used (usage stats synced across devices)
- **Custom domain mappings** with import/export support
- **Syncs** with your Ente Auth account
- **Passkey support** - authenticate with passkeys via Ente Accounts
- **Self-hosted support** - configure a custom server endpoint
- **Cross-browser** - works with Chrome, Edge, and Firefox

## Installation

### From Edge Add-ons Store

Search for **AuthVault 2FA** in the [Edge Add-ons Store](https://microsoftedge.microsoft.com/addons/) or install directly from the store listing page.

> Edge extensions also work in Chrome if you enable "Allow extensions from other stores" in `chrome://extensions`.

### From Release (Manual Install)

1. Download the latest release from the [Releases page](../../releases):
   - **Chrome / Edge**: `authvault-chrome-x.x.x.zip`
   - **Firefox**: `authvault-firefox-x.x.x.xpi` (recommended) or `.zip`

2. Install the extension:

   **Chrome / Edge:**
   1. Extract the zip file
   2. Open `chrome://extensions` (Chrome) or `edge://extensions` (Edge)
   3. Enable "Developer mode" (toggle in top right)
   4. Click "Load unpacked"
   5. Select the extracted folder

   **Firefox:**
   1. Open the `.xpi` file in Firefox - it will prompt you to install
   2. Click "Add" to install the extension

   > The `.xpi` file is signed by Mozilla and installs permanently. If you use the `.zip` instead, you'll need to load it as a temporary add-on via `about:debugging`, and it will be removed when Firefox closes.

### From Source

1. Clone this repository
2. Install dependencies:
   ```sh
   npm install
   ```
3. Build the extension:
   ```sh
   # Build for both browsers (outputs to dist-chrome/ and dist-firefox/)
   npm run build

   # Build for a specific browser
   npm run build:chrome
   npm run build:firefox
   ```
4. Load the extension using the manual install steps above, selecting the `dist-chrome` or `dist-firefox` directory

## Development

Start the development build with file watching:

```sh
npm run dev

# Watch a specific browser
npm run dev:chrome
npm run dev:firefox
```

This will rebuild the extension automatically when you make changes.

## Directory Structure

```
authvault/
├── assets/            # Extension icons and store assets
├── manifests/         # Browser-specific manifest files
├── src/
│   ├── background/    # Service worker (Chrome) / background script (Firefox)
│   ├── content/       # Content scripts for MFA detection and autofill
│   ├── login/         # Built-in login page (SRP, passkey, email OTT)
│   ├── options/       # Extension options page
│   ├── popup/         # Browser toolbar popup UI
│   └── shared/        # Shared utilities (crypto, OTP, API, SRP)
└── dist-*/            # Build outputs
```

## Authentication

The extension has a built-in login page that supports:

- **SRP (Secure Remote Password)** — your password is verified without ever being sent to the server
- **Email OTT** — one-time token sent to your email as a fallback
- **Passkeys** — redirects to Ente Accounts for WebAuthn verification, then polls for the result
- **TOTP two-factor** — standard authenticator app codes

For self-hosted Ente instances, you can configure a custom server endpoint on the login page or in the extension options.

## How Autofill Works

When you visit a website with an MFA input field:

1. The content script detects the field using common patterns
2. If matching codes are found, a popup appears offering to fill them
3. Clicking "Fill" inserts the code and optionally submits the form

The extension matches codes to websites using the issuer name, domain hints, and custom domain mappings.

## Privacy

See [PRIVACY.md](PRIVACY.md) for our privacy policy. In short: your codes stay encrypted and are only decrypted locally. No data is sent to third-party servers.

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

AGPL-3.0. Based on work from the [Ente](https://github.com/ente-io/ente) ecosystem.

## Acknowledgments

- [Ente](https://ente.io) for the Ente Auth app and open source ecosystem
- [aheimowitz](https://github.com/aheimowitz/ente-auth-extension) for the original browser extension
