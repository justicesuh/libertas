// Popup script for managing blocked sites

const siteInput = document.getElementById('site-input');
const addBtn = document.getElementById('add-btn');
const blockedList = document.getElementById('blocked-list');
const countEl = document.getElementById('count');
const emptyState = document.getElementById('empty-state');

let blockedSites = [];

// Load blocked sites on popup open
async function loadBlockedSites() {
  const result = await browser.storage.local.get('blockedSites');
  blockedSites = result.blockedSites || [];
  renderList();
}

// Save blocked sites to storage
async function saveBlockedSites() {
  await browser.storage.local.set({ blockedSites });
}

// Normalize site input (remove protocol, www, trailing slashes)
function normalizeSite(site) {
  let normalized = site.trim().toLowerCase();
  normalized = normalized.replace(/^(https?:\/\/)?(www\.)?/, '');
  normalized = normalized.replace(/\/.*$/, '');
  return normalized;
}

// Add a site to the block list
async function addSite() {
  const site = normalizeSite(siteInput.value);

  if (!site) return;

  if (blockedSites.includes(site)) {
    siteInput.value = '';
    return;
  }

  blockedSites.push(site);
  await saveBlockedSites();
  renderList();
  siteInput.value = '';
}

// Remove a site from the block list
async function removeSite(site) {
  blockedSites = blockedSites.filter(s => s !== site);
  await saveBlockedSites();
  renderList();
}

// Render the blocked sites list
function renderList() {
  blockedList.innerHTML = '';
  countEl.textContent = blockedSites.length;

  if (blockedSites.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  blockedSites.forEach(site => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="site-name">${site}</span>
      <button class="remove-btn" data-site="${site}">&times;</button>
    `;
    blockedList.appendChild(li);
  });
}

// Event listeners
addBtn.addEventListener('click', addSite);

siteInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addSite();
  }
});

blockedList.addEventListener('click', (e) => {
  if (e.target.classList.contains('remove-btn')) {
    const site = e.target.dataset.site;
    removeSite(site);
  }
});

// Initialize
loadBlockedSites();
