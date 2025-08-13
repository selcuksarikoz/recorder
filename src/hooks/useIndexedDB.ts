// Minimal IndexedDB helpers to store audio chunks (low RAM usage)

const DB_NAME = "AudioRecorderDB";
const STORE = "chunks";

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE))
        db.createObjectStore(STORE, { autoIncrement: true });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function clearChunks() {
  const db = await openDB();
  const tx = db.transaction(STORE, "readwrite");
  tx.objectStore(STORE).clear();
  await new Promise((res, rej) => {
    tx.oncomplete = () => res(null);
    tx.onerror = () => rej(tx.error);
  });
}

export async function addChunk(chunk: Blob) {
  const db = await openDB();
  const tx = db.transaction(STORE, "readwrite");
  tx.objectStore(STORE).add(chunk);
  await new Promise((res, rej) => {
    tx.oncomplete = () => res(null);
    tx.onerror = () => rej(tx.error);
  });
}

export function readAllChunks(): Promise<Blob[]> {
  return new Promise(async (resolve, reject) => {
    const db = await openDB();
    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as Blob[]);
    req.onerror = () => reject(req.error);
  });
}
