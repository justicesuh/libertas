// Popup script for managing blocklists

const listInput = document.getElementById('list-input');
const addBtn = document.getElementById('add-btn');
const blocklistsEl = document.getElementById('blocklists');
const countEl = document.getElementById('count');
const emptyState = document.getElementById('empty-state');

let blocklists = {};
let order = [];
let draggedId = null;

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Create default blocklists from presets
function createDefaultBlocklists() {
  const defaults = {};
  const defaultOrder = [];
  for (const name of Object.keys(presets)) {
    const id = generateId();
    defaults[id] = {
      name,
      sites: [...presets[name]],
      enabled: false
    };
    defaultOrder.push(id);
  }
  return { blocklists: defaults, order: defaultOrder };
}

// Load blocklists on popup open
async function loadBlocklists() {
  const result = await browser.storage.local.get(['blocklists', 'blocklistOrder', 'blockedSites']);

  // Migrate from old format if needed
  if (result.blockedSites && !result.blocklists) {
    const id = generateId();
    blocklists = {
      [id]: {
        name: 'Default',
        sites: result.blockedSites,
        enabled: true
      }
    };
    order = [id];
    await saveBlocklists();
    await browser.storage.local.remove('blockedSites');
  } else if (!result.blocklists) {
    // First install - create default blocklists
    const defaults = createDefaultBlocklists();
    blocklists = defaults.blocklists;
    order = defaults.order;
    await saveBlocklists();
  } else {
    blocklists = result.blocklists;
    // Migrate order if not present
    if (result.blocklistOrder) {
      order = result.blocklistOrder;
    } else {
      order = Object.keys(blocklists);
      await saveBlocklists();
    }
    // Clean up order array (remove deleted IDs, add missing IDs)
    order = order.filter(id => blocklists[id]);
    const missingIds = Object.keys(blocklists).filter(id => !order.includes(id));
    order = [...order, ...missingIds];
  }

  renderList();
}

// Save blocklists to storage
async function saveBlocklists() {
  await browser.storage.local.set({ blocklists, blocklistOrder: order });
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
  order.push(id);

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

// Drag and drop handlers
function handleDragStart(e) {
  draggedId = e.target.dataset.id;
  e.target.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
  e.target.classList.remove('dragging');
  draggedId = null;
  document.querySelectorAll('.blocklist-item').forEach(item => {
    item.classList.remove('drag-over');
  });
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
  const li = e.target.closest('.blocklist-item');
  if (li && li.dataset.id !== draggedId) {
    li.classList.add('drag-over');
  }
}

function handleDragLeave(e) {
  const li = e.target.closest('.blocklist-item');
  if (li) {
    li.classList.remove('drag-over');
  }
}

async function handleDrop(e) {
  e.preventDefault();
  const li = e.target.closest('.blocklist-item');
  if (!li || !draggedId) return;

  const targetId = li.dataset.id;
  if (targetId === draggedId) return;

  // Reorder
  const draggedIndex = order.indexOf(draggedId);
  const targetIndex = order.indexOf(targetId);

  order.splice(draggedIndex, 1);
  order.splice(targetIndex, 0, draggedId);

  await saveBlocklists();
  renderList();
}

// Render the blocklists
function renderList() {
  blocklistsEl.innerHTML = '';
  countEl.textContent = order.length;

  if (order.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  order.forEach(id => {
    const list = blocklists[id];
    if (!list) return;

    const li = document.createElement('li');
    li.className = 'blocklist-item';
    li.draggable = true;
    li.dataset.id = id;

    const dragHandle = document.createElement('span');
    dragHandle.className = 'drag-handle';
    dragHandle.textContent = '\u2807\u2807';

    const info = document.createElement('div');
    info.className = 'blocklist-info';
    info.dataset.id = id;

    const name = document.createElement('span');
    name.className = 'blocklist-name';
    name.textContent = list.name;

    const count = document.createElement('span');
    count.className = 'blocklist-count';
    count.textContent = `${list.sites.length} ${list.sites.length === 1 ? 'site' : 'sites'}`;

    info.appendChild(name);
    info.appendChild(count);

    const toggle = document.createElement('label');
    toggle.className = 'toggle';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = list.enabled;
    checkbox.dataset.id = id;
    checkbox.className = 'toggle-checkbox';

    const slider = document.createElement('span');
    slider.className = 'toggle-slider';

    toggle.appendChild(checkbox);
    toggle.appendChild(slider);

    li.appendChild(dragHandle);
    li.appendChild(info);
    li.appendChild(toggle);

    // Drag event listeners
    li.addEventListener('dragstart', handleDragStart);
    li.addEventListener('dragend', handleDragEnd);
    li.addEventListener('dragover', handleDragOver);
    li.addEventListener('dragenter', handleDragEnter);
    li.addEventListener('dragleave', handleDragLeave);
    li.addEventListener('drop', handleDrop);

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
