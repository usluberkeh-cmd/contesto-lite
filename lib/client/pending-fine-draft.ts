const DB_NAME = "contesto-submit-fine";
const STORE_NAME = "pending-drafts";
const DRAFT_KEY = "submit-fine";
const DB_VERSION = 1;
const MAX_DRAFT_AGE_MS = 60 * 60 * 1000;

export type PendingFineDraftInput = {
  file: File;
  additionalInfo: string;
};

export type PendingFineDraft = PendingFineDraftInput & {
  createdAt: number;
};

const ensureBrowser = () => {
  if (typeof window === "undefined" || !window.indexedDB) {
    throw new Error("IndexedDB is not available in this environment.");
  }
};

const openDraftDB = async (): Promise<IDBDatabase> => {
  ensureBrowser();

  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error ?? new Error("Failed to open draft database."));
    };

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });
};

const runWriteTransaction = async (
  action: (store: IDBObjectStore) => IDBRequest
): Promise<void> => {
  const database = await openDraftDB();

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    action(store);

    transaction.oncomplete = () => {
      resolve();
    };
    transaction.onerror = () => {
      reject(transaction.error ?? new Error("Draft write transaction failed."));
    };
    transaction.onabort = () => {
      reject(transaction.error ?? new Error("Draft write transaction aborted."));
    };
  });

  database.close();
};

const runReadTransaction = async <T>(
  action: (store: IDBObjectStore) => IDBRequest
): Promise<T | null> => {
  const database = await openDraftDB();

  const result = await new Promise<T | null>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = action(store);

    request.onsuccess = () => {
      resolve((request.result as T | undefined) ?? null);
    };
    request.onerror = () => {
      reject(request.error ?? new Error("Draft read request failed."));
    };
  });

  database.close();
  return result;
};

export const savePendingFineDraft = async (
  input: PendingFineDraftInput
): Promise<void> => {
  const payload: PendingFineDraft = {
    ...input,
    createdAt: Date.now(),
  };

  await runWriteTransaction((store) => store.put(payload, DRAFT_KEY));
};

export const clearPendingFineDraft = async (): Promise<void> => {
  await runWriteTransaction((store) => store.delete(DRAFT_KEY));
};

export const getPendingFineDraft = async (): Promise<PendingFineDraft | null> => {
  const draft = await runReadTransaction<PendingFineDraft>((store) =>
    store.get(DRAFT_KEY)
  );

  if (!draft) {
    return null;
  }

  if (Date.now() - draft.createdAt > MAX_DRAFT_AGE_MS) {
    await clearPendingFineDraft();
    return null;
  }

  return draft;
};
