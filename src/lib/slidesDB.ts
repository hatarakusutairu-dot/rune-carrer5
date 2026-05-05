// IndexedDB wrapper for slide storage
// 端末ローカルにスライド画像（PNG/JPG/PDF→PNG変換後）を保存

export type SlideRecord = {
  id?: number;
  order: number;
  name: string;
  blob: Blob;
  mime: string;
  width: number;
  height: number;
  createdAt: number;
};

const DB_NAME = 'rune-carrer5-slides';
const DB_VERSION = 1;
const STORE = 'slides';

const openDb = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
        store.createIndex('order', 'order', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

const tx = async <T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => Promise<T> | T): Promise<T> => {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const store = t.objectStore(STORE);
    Promise.resolve(fn(store))
      .then((v) => {
        t.oncomplete = () => resolve(v);
        t.onerror = () => reject(t.error);
        t.onabort = () => reject(t.error);
      })
      .catch(reject);
  });
};

export const listSlides = async (): Promise<SlideRecord[]> =>
  tx('readonly', (store) =>
    new Promise<SlideRecord[]>((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => {
        const arr = (req.result as SlideRecord[]).slice().sort((a, b) => a.order - b.order);
        resolve(arr);
      };
      req.onerror = () => reject(req.error);
    }),
  );

export const addSlide = async (rec: Omit<SlideRecord, 'id'>): Promise<number> =>
  tx('readwrite', (store) =>
    new Promise<number>((resolve, reject) => {
      const req = store.add(rec);
      req.onsuccess = () => resolve(req.result as number);
      req.onerror = () => reject(req.error);
    }),
  );

export const deleteSlide = async (id: number): Promise<void> =>
  tx('readwrite', (store) =>
    new Promise<void>((resolve, reject) => {
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    }),
  );

export const updateSlideOrder = async (entries: Array<{ id: number; order: number }>): Promise<void> =>
  tx('readwrite', async (store) => {
    await Promise.all(
      entries.map(
        ({ id, order }) =>
          new Promise<void>((resolve, reject) => {
            const getReq = store.get(id);
            getReq.onsuccess = () => {
              const rec = getReq.result as SlideRecord | undefined;
              if (!rec) return resolve();
              rec.order = order;
              const putReq = store.put(rec);
              putReq.onsuccess = () => resolve();
              putReq.onerror = () => reject(putReq.error);
            };
            getReq.onerror = () => reject(getReq.error);
          }),
      ),
    );
  });

export const clearSlides = async (): Promise<void> =>
  tx('readwrite', (store) =>
    new Promise<void>((resolve, reject) => {
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    }),
  );

export const totalBytes = async (): Promise<number> => {
  const slides = await listSlides();
  return slides.reduce((sum, s) => sum + s.blob.size, 0);
};
