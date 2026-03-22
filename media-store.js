(function () {
  const DB_NAME = "pf_media_db_v1";
  const STORE_NAME = "media_files";
  const DB_VERSION = 1;

  function openDb() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error("IndexedDB not supported"));
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("Failed to open IndexedDB"));
    });
  }

  async function putFile(file) {
    const db = await openDb();
    const id = `media-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.put({ id, blob: file, type: file.type, name: file.name, createdAt: Date.now() });

      tx.oncomplete = () => resolve({ id, type: file.type, name: file.name });
      tx.onerror = () => reject(tx.error || new Error("Failed to save media"));
    });
  }

  async function saveFiles(files) {
    const refs = [];
    for (const file of files) {
      try {
        const ref = await putFile(file);
        refs.push(ref);
      } catch {
        // Skip failed files while preserving successful ones.
      }
    }
    return refs;
  }

  async function getBlob(id) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        const row = request.result;
        resolve(row && row.blob ? row.blob : null);
      };
      request.onerror = () => reject(request.error || new Error("Failed to load media"));
    });
  }

  async function getObjectUrl(id) {
    try {
      const blob = await getBlob(id);
      if (!blob) return null;
      return URL.createObjectURL(blob);
    } catch {
      return null;
    }
  }

  window.MediaStore = {
    saveFiles,
    getObjectUrl
  };
})();
