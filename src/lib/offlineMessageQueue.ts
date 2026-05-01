export type OfflineQueuedFile = {
  name: string;
  size: number;
  type: string;
  file: File;
};

export type OfflineTextMessage = {
  id: string;
  sessionId: string | null;
  content: string;
  gradeLevel?: string;
  createdAt: string;
  files: OfflineQueuedFile[];
};

const DB_NAME = "sinlearn-offline";
const DB_VERSION = 1;
const STORE_NAME = "queuedMessages";

function openQueueDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("Offline queue storage is not available"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Failed to open offline queue"));
  });
}

function transact<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openQueueDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode);
        const store = tx.objectStore(STORE_NAME);
        const request = run(store);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () =>
          reject(request.error ?? new Error("Offline queue operation failed"));
        tx.oncomplete = () => db.close();
        tx.onerror = () => {
          db.close();
          reject(tx.error ?? new Error("Offline queue transaction failed"));
        };
      }),
  );
}

function isOfflineTextMessage(value: unknown): value is OfflineTextMessage {
  const item = value as OfflineTextMessage;
  return (
    !!item &&
    typeof item.id === "string" &&
    (typeof item.sessionId === "string" || item.sessionId === null) &&
    typeof item.content === "string" &&
    typeof item.createdAt === "string" &&
    Array.isArray(item.files)
  );
}

export async function getQueuedTextMessages(
  sessionId?: string | null,
): Promise<OfflineTextMessage[]> {
  const messages = await transact<OfflineTextMessage[]>("readonly", (store) =>
    store.getAll(),
  );

  const valid = messages.filter(isOfflineTextMessage);
  if (sessionId === undefined) return valid;
  return valid.filter((item) => item.sessionId === sessionId);
}

export async function enqueueTextMessage(params: {
  sessionId: string | null;
  content: string;
  gradeLevel?: string;
  files?: File[];
}): Promise<OfflineTextMessage> {
  const message: OfflineTextMessage = {
    id: `offline-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    sessionId: params.sessionId,
    content: params.content,
    gradeLevel: params.gradeLevel,
    createdAt: new Date().toISOString(),
    files: (params.files ?? []).map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      file,
    })),
  };

  await transact("readwrite", (store) => store.put(message));
  return message;
}

export async function removeQueuedTextMessage(id: string): Promise<void> {
  await transact("readwrite", (store) => store.delete(id));
}
