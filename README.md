# Libertas

A Firefox browser extension that blocks distracting websites to improve focus and productivity.

## Features

- **Multiple Blocklists**: Organize blocked sites into named lists (e.g., Social Media, News, Gaming)
- **Preset Blocklists**: Comes with predefined blocklists for common distractions:
  - Social Media (Facebook, Twitter/X, Instagram, TikTok, Reddit, etc.)
  - Video Streaming (YouTube, Netflix, Twitch, etc.)
  - News (CNN, BBC, NYTimes, etc.)
  - Gaming (Steam, Epic Games, etc.)
  - Shopping (Amazon, eBay, etc.)
- **Enable/Disable Lists**: Toggle individual blocklists on or off without deleting them
- **Subdomain Blocking**: Blocking a domain automatically blocks all its subdomains
- **Inspirational Quotes**: Blocked page displays motivational quotes to encourage productivity

## Installation

1. Open Firefox and navigate to `about:debugging`
2. Click "This Firefox" in the sidebar
3. Click "Load Temporary Add-on"
4. Select any file in the `libertas` directory (e.g., `manifest.json`)

For permanent installation, the extension needs to be signed and installed through Firefox Add-ons.

## Usage

1. Click the Libertas icon in the browser toolbar to open the popup
2. **Create a blocklist**: Enter a name and click "Add"
3. **Add sites to a blocklist**: Click on a blocklist name to open it, then enter domains to block
4. **Enable/Disable a blocklist**: Use the toggle switch on the right side of each blocklist
5. **Delete a blocklist**: Open the blocklist and click the × button in the header

## How It Works

When you try to visit a blocked site, Libertas redirects you to a blocked page displaying an inspirational quote. The extension uses Firefox's `webRequest` API to intercept navigation requests before they complete.

## Permissions

- `webRequest` / `webRequestBlocking`: Required to intercept and block requests
- `storage`: Required to save your blocklists
- `<all_urls>`: Required to check all URLs against your blocklists

## License

MIT
