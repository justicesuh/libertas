// Popup script for managing blocklists

const listInput = document.getElementById('list-input');
const addBtn = document.getElementById('add-btn');
const blocklistsEl = document.getElementById('blocklists');
const countEl = document.getElementById('count');
const emptyState = document.getElementById('empty-state');

let blocklists = {};

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Create default blocklists from presets
function createDefaultBlocklists() {
  const defaults = {};
  for (const name of Object.keys(presets)) {
    defaults[generateId()] = {
      name,
      sites: [...presets[name]],
      enabled: false
    };
  }
  return defaults;
}

// Load blocklists on popup open
async function loadBlocklists() {
  const result = await browser.storage.local.get(['blocklists', 'blockedSites']);

  // Migrate from old format if needed
  if (result.blockedSites && !result.blocklists) {
    blocklists = {
      [generateId()]: {
        name: 'Default',
        sites: result.blockedSites,
        enabled: true
      }
    };
    await saveBlocklists();
    await browser.storage.local.remove('blockedSites');
  } else if (!result.blocklists) {
    // First install - create default blocklists
    blocklists = createDefaultBlocklists();
    await saveBlocklists();
  } else {
    blocklists = result.blocklists;
  }

  renderList();
}

// Save blocklists to storage
async function saveBlocklists() {
  await browser.storage.local.set({ blocklists });
}

// Add a new blocklist
async function addBlocklist() {
  const name = listInput.value.trim();

  if (!name) return;

  const id = generateId();
  blocklists[id] = {
    name,
    sites: [],
    enabled: true
  };

  await saveBlocklists();
  renderList();
  listInput.value = '';
}

// Toggle blocklist enabled state
async function toggleBlocklist(id) {
  blocklists[id].enabled = !blocklists[id].enabled;
  await saveBlocklists();
  renderList();
}

// Open blocklist editor
function openBlocklist(id) {
  window.location.href = `blocklist.html?id=${id}`;
}

// Render the blocklists
function renderList() {
  blocklistsEl.innerHTML = '';
  const ids = Object.keys(blocklists);
  countEl.textContent = ids.length;

  if (ids.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  ids.forEach(id => {
    const list = blocklists[id];
    const li = document.createElement('li');
    li.className = 'blocklist-item';
    li.innerHTML = `
      <div class="blocklist-info" data-id="${id}">
        <span class="blocklist-name">${list.name}</span>
        <span class="blocklist-count">${list.sites.length} ${list.sites.length === 1 ? 'site' : 'sites'}</span>
      </div>
      <label class="toggle">
        <input type="checkbox" ${list.enabled ? 'checked' : ''} data-id="${id}" class="toggle-checkbox">
        <span class="toggle-slider"></span>
      </label>
    `;
    blocklistsEl.appendChild(li);
  });
}

// Event listeners
addBtn.addEventListener('click', addBlocklist);

listInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addBlocklist();
  }
});

blocklistsEl.addEventListener('click', (e) => {
  if (e.target.classList.contains('blocklist-info') ||
      e.target.classList.contains('blocklist-name') ||
      e.target.classList.contains('blocklist-count')) {
    const infoEl = e.target.closest('.blocklist-info');
    if (infoEl) {
      openBlocklist(infoEl.dataset.id);
    }
  }
});

blocklistsEl.addEventListener('change', (e) => {
  if (e.target.classList.contains('toggle-checkbox')) {
    toggleBlocklist(e.target.dataset.id);
  }
});

// Initialize
loadBlocklists();
