# Changelog

## v0.5.0

### New Features
- **Usage-based sorting** — Sort codes by "Most used" (use count) or "Recently used" (last used time), with usage statistics synced across devices via browser sync storage
- **Usage count display** — Each code card shows how many times it's been used (×N indicator)
- **Custom mapping import/export** — Export all custom domain mappings as JSON, import from file with merge support
- **"Most used" sort option** — New sort option in the popup dropdown menu

### Bug Fixes
- **Fixed "Recently used" sort** — Previously sorted by code ID (meaningless), now correctly sorts by actual last-used timestamp

### Branding
- Renamed to AuthVault with Emerald Green theme
- New Digital Lock icon
- Published to Edge Add-ons Store

## v0.4.1

- Initial fork with custom domain mappings
- Path-prefix matching for custom mappings
- Sync custom mappings across devices via browser sync storage
