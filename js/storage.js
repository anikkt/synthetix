async function probeStorage() {
  try {
    await idbSet('__dvp_probe__', 1);
    const v = await idbGet('__dvp_probe__');
    return v === 1;
  } catch (e) {
    return false;
  }
}


function showStorageBanner(message) {
  const el = document.getElementById('storageBanner');
  el.innerHTML = message;
  el.style.display = 'block';
}

function clearStorageBanner() {
  document.getElementById('storageBanner').style.display = 'none';
}


function setSaveStatus(text) {
  const el = document.getElementById('saveStatus');
  if (el) el.textContent = text;
}


async function saveStateToStorage() {
  if (!storageOK) return;
  try {
    await idbSet('appState', { tables: State.tables, dashboards: State.dashboards, processFlows: State.processFlows, theme: State.theme });
    const t = new Date();
    setSaveStatus('Saved ' + t.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', second: '2-digit' }));
    clearStorageBanner();
  } catch (e) {
    setSaveStatus('Auto-save failed — see banner');
    showStorageBanner(
      '<b>Auto-save just failed.</b> Your data in memory is still fine. ' +
      'Use <b>User Profile &gt; Export workspace (.json)</b> now as a backup. ' +
      '(Error: ' + (e && e.message ? e.message : 'unknown') + ')'
    );
    console.warn('Auto-save write failed:', e);
  }
}


async function loadStateFromStorage() {
  try {
    const saved = await idbGet('appState');
    if (!saved) return;
    State.tables = saved.tables || {};
    State.dashboards = saved.dashboards || [];
    State.processFlows = saved.processFlows || [];
    State.theme = saved.theme || 'dark';
  } catch (e) {
    console.warn('Could not load saved state', e);
  }
}


async function initStorage() {
  storageOK = await probeStorage();
  if (!storageOK) {
    setSaveStatus('Auto-save unavailable');
    showStorageBanner(
      '<b>Auto-save is not available right now.</b> This usually means the page is running inside a sandboxed preview/embed, ' +
      'a private/incognito window, or a corporate browser policy that blocks local storage (IndexedDB). ' +
      'Open the downloaded <code>.html</code> file directly in a normal Chrome or Edge tab (not inside any preview panel) to enable it. ' +
      'Until then, use <b>User Profile &gt; Export workspace (.json)</b> to save your work manually, and Import to restore it.'
    );
  } else {
    setSaveStatus('Auto-save ready');
  }
}

/* ============================================================
   LOCAL FOLDER — File System Access API (Chrome/Edge only).
   Connect once; the directory handle is cached in IndexedDB so
   later visits only need a one-click "Reconnect", not a re-browse.
   ============================================================ */

const IDB_NAME = 'dvp-store', IDB_STORE = 'handles';

function idbOpen() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(key, value) {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbGet(key) {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readonly');
    const req = tx.objectStore(IDB_STORE).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

