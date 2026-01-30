// Blocklist page script for managing sites in a blocklist

const backBtn = document.getElementById('back-btn');
const deleteListBtn = document.getElementById('delete-list-btn');
const listNameEl = document.getElementById('list-name');
const siteInput = document.getElementById('site-input');
const addBtn = document.getElementById('add-btn');
const blockedList = document.getElementById('blocked-list');
const countEl = document.getElementById('count');
const emptyState = document.getElementById('empty-state');

// Get blocklist ID from URL
const urlParams = new URLSearchParams(window.location.search);
const listId = urlParams.get('id');

let blocklists = {};

// Load blocklist data
async function loadBlocklist() {
  const result = await browser.storage.local.get('blocklists');
  blocklists = result.blocklists || {};

  if (!blocklists[listId]) {
    window.location.href = 'popup.html';
    return;
  }

  listNameEl.textContent = blocklists[listId].name;
  renderList();
}

// Save blocklists to storage
async function saveBlocklists() {
  await browser.storage.local.set({ blocklists });
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

  const sites = blocklists[listId].sites;

  if (sites.includes(site)) {
    siteInput.value = '';
    return;
  }

  sites.push(site);
  await saveBlocklists();
  renderList();
  siteInput.value = '';
}

// Remove a site from the block list
async function removeSite(site) {
  blocklists[listId].sites = blocklists[listId].sites.filter(s => s !== site);
  await saveBlocklists();
  renderList();
}

// Render the blocked sites list
function renderList() {
  const sites = blocklists[listId].sites;
  blockedList.innerHTML = '';
  countEl.textContent = sites.length;

  if (sites.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  sites.forEach(site => {
    const li = document.createElement('li');

    const siteName = document.createElement('span');
    siteName.className = 'site-name';
    siteName.textContent = site;

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.dataset.site = site;
    removeBtn.textContent = '\u00D7';

    li.appendChild(siteName);
    li.appendChild(removeBtn);
    blockedList.appendChild(li);
  });
}

// Delete the entire blocklist
async function deleteBlocklist() {
  delete blocklists[listId];
  await saveBlocklists();
  window.location.href = 'popup.html';
}

// Event listeners
backBtn.addEventListener('click', () => {
  window.location.href = 'popup.html';
});

deleteListBtn.addEventListener('click', deleteBlocklist);

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
loadBlocklist();
