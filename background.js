// Background script for blocking websites

let blocklists = {};

// Get all blocked sites from enabled blocklists
function getAllBlockedSites() {
  const sites = [];
  if (!blocklists || typeof blocklists !== 'object') {
    return sites;
  }
  for (const id of Object.keys(blocklists)) {
    const list = blocklists[id];
    // Default to enabled if not explicitly disabled
    const isEnabled = list && list.enabled !== false;
    if (isEnabled && Array.isArray(list.sites)) {
      sites.push(...list.sites);
    }
  }
  return sites;
}

// Load blocklists from storage on startup
browser.storage.local.get(['blocklists', 'blockedSites']).then((result) => {
  // Migrate from old format if needed
  if (result.blockedSites && !result.blocklists) {
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    blocklists = {
      [id]: {
        name: 'Default',
        sites: result.blockedSites,
        enabled: true
      }
    };
    browser.storage.local.set({ blocklists });
    browser.storage.local.remove('blockedSites');
  } else {
    blocklists = result.blocklists || {};
  }
  updateBlockingRules();
});

// Listen for storage changes
browser.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.blocklists) {
    blocklists = changes.blocklists.newValue || {};
    updateBlockingRules();
  }
});

// Check if a URL should be blocked
function shouldBlock(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    const blockedSites = getAllBlockedSites();

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
  const blockedSites = getAllBlockedSites();
  if (blockedSites.length > 0) {
    browser.webRequest.onBeforeRequest.addListener(
      blockRequest,
      { urls: ["<all_urls>"], types: ["main_frame"] },
      ["blocking"]
    );
  }
}

