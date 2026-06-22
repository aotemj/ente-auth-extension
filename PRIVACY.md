# Privacy Policy - AuthVault 2FA

**Last updated:** June 22, 2026

## Overview

AuthVault 2FA is a browser extension that autofills 2FA/OTP codes from your Ente Auth account. Your privacy is important to us.

## Data Collection

This extension collects and stores the following data **locally on your device**:

- **Authentication token** — Used to communicate with the Ente Auth API server
- **Encrypted OTP codes** — Cached locally for instant display
- **Extension settings** — Theme, sort order, autofill preferences
- **Custom domain mappings** — User-defined domain-to-issuer associations
- **Usage statistics** — Code usage count and last-used timestamps (synced via browser sync storage)

## Data Transmission

- The extension communicates **only** with the Ente Auth API (`api.ente.io`) to authenticate and fetch encrypted OTP codes.
- No data is sent to any third-party analytics, advertising, or tracking services.
- No personally identifiable information is collected or transmitted beyond what is required for Ente Auth authentication.

## Data Storage

- All sensitive data (authentication tokens, encrypted codes) is stored in the browser's local storage.
- Custom mappings and usage statistics use the browser's sync storage feature, which syncs across your own devices via your browser account.
- No data is stored on external servers controlled by this extension's developer.

## Data Sharing

We do **not** sell, transfer, or share user data with any third parties.

## Open Source

This extension is open source. You can review the complete source code at:
https://github.com/aotemj/ente-auth-extension

## Contact

For privacy concerns, please open an issue on the GitHub repository.
