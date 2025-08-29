import { openDB, DBSchema, IDBPDatabase } from 'idb';

export type CacheRecord<T> = {
  data: T;
  ts: number;
};

interface ShopDB extends DBSchema {
  products: {
    key: string;
    value: CacheRecord<any>;
  };
}

let dbPromise: Promise<IDBPDatabase<ShopDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<ShopDB>> {
  if (!dbPromise) {
    dbPromise = openDB<ShopDB>('shop-db', 3, {
      upgrade(db, oldVersion, newVersion) {
        if (oldVersion < 1) {
          db.createObjectStore('products');
        }
      },
    });
  }
  return dbPromise;
}

export async function setCache<T>(store: 'products', key: string, data: T): Promise<void> {
  const db = await getDB();
  await db.put(store, { data, ts: Date.now() }, key);
}

export async function getCache<T>(store: 'products', key: string): Promise<CacheRecord<T> | undefined> {
  const db = await getDB();
  const rec = await db.get(store, key);
  return rec as CacheRecord<T> | undefined;
}

export async function clearCache(): Promise<void> {
  const db = await getDB();
  await db.clear('products');
}

export async function deleteDB(): Promise<void> {
  if (dbPromise) {
    const db = await dbPromise;
    db.close();
    dbPromise = null;
  }
  await indexedDB.deleteDatabase('shop-db');
} 