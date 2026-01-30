// Background script for blocking websites

let blockedSites = [];

// Load blocked sites from storage on startup
browser.storage.local.get('blockedSites').then((result) => {
  blockedSites = result.blockedSites || [];
  updateBlockingRules();
});

// Listen for storage changes
browser.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.blockedSites) {
    blockedSites = changes.blockedSites.newValue || [];
    updateBlockingRules();
  }
});

// Check if a URL should be blocked
function shouldBlock(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    return blockedSites.some(site => {
      const pattern = site.toLowerCase();
      // Match exact domain or subdomain
      return hostname === pattern || hostname.endsWith('.' + pattern);
    });
  } catch (e) {
    return false;
  }
}

// Handle web requests
function blockRequest(details) {
  if (shouldBlock(details.url)) {
    // Redirect to blocked page
    return {
      redirectUrl: browser.runtime.getURL('blocked.html')
    };
  }
  return {};
}

// Update blocking rules
function updateBlockingRules() {
  // Remove existing listener if any
  if (browser.webRequest.onBeforeRequest.hasListener(blockRequest)) {
    browser.webRequest.onBeforeRequest.removeListener(blockRequest);
  }

  // Only add listener if there are sites to block
  if (blockedSites.length > 0) {
    browser.webRequest.onBeforeRequest.addListener(
      blockRequest,
      { urls: ["<all_urls>"], types: ["main_frame"] },
      ["blocking"]
    );
  }
}

// Initialize blocking
updateBlockingRules();
