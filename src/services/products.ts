import type { Product } from '../models/Product';
import { getCache, setCache, clearCache } from '../lib/idb';
import { cacheImage } from '../lib/imageCache';

const API_BASE = 'https://dummyjson.com';
const TTL_MS = 1000 * 60 * 10; // 10 minutes

function isFresh(ts: number): boolean {
  return Date.now() - ts < TTL_MS;
}

async function cacheProductImages(products: Product[]): Promise<void> {
  await Promise.allSettled(
    products.map(product => cacheImage(product.thumbnail))
  );
}

async function refreshProductsCache(): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/products?limit=30`);
    if (!res.ok) return;
    const json = await res.json();
    const products = (json?.products ?? []) as Product[];
    await setCache('products', 'list:default', products);
    void cacheProductImages(products);
  } catch {}
}

async function refreshProductCache(id: number): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/products/${id}`);
    if (!res.ok) return;
    const product = await res.json() as Product;
    await setCache('products', `item:${id}`, product);
    void cacheImage(product.thumbnail);
  } catch {}
}

export async function getProducts(): Promise<Product[]> {
  const cacheKey = 'list:default';

  try {
    const cached = await getCache<Product[]>('products', cacheKey);
    if (cached && isFresh(cached.ts)) {
      void refreshProductsCache();
      return cached.data;
    }
  } catch (error) {
    console.warn('Cache error, clearing cache:', error);
    try {
      await clearCache();
    } catch {}
  }

  try {
    const res = await fetch(`${API_BASE}/products?limit=30`);
    if (!res.ok) throw new Error('Network error');
    const json = await res.json();
    const products = (json?.products ?? []) as Product[];
    try {
      await setCache('products', cacheKey, products);
      void cacheProductImages(products);
    } catch (cacheError) {
      console.warn('Failed to cache products:', cacheError);
    }
    return products;
  } catch (error) {
    try {
      const cached = await getCache<Product[]>('products', cacheKey);
      if (cached) {
        return cached.data;
      }
    } catch {}
    throw new Error('Failed to load products (no cache available).');
  }
}

export async function getProduct(id: number): Promise<Product> {
  const cacheKey = `item:${id}`;

  try {
    const cached = await getCache<Product>('products', cacheKey);
    if (cached && isFresh(cached.ts)) {
      void refreshProductCache(id);
      return cached.data;
    }
  } catch (error) {
    console.warn('Cache error, clearing cache:', error);
    try {
      await clearCache();
    } catch {}
  }

  try {
    const res = await fetch(`${API_BASE}/products/${id}`);
    if (!res.ok) throw new Error('Network error');
    const product = await res.json() as Product;
    try {
      await setCache('products', cacheKey, product);
      void cacheImage(product.thumbnail);
    } catch (cacheError) {
      console.warn('Failed to cache product:', cacheError);
    }
    return product;
  } catch (error) {
    try {
      const cached = await getCache<Product>('products', cacheKey);
      if (cached) {
        return cached.data;
      }
    } catch {}
    throw new Error('Failed to load product (no cache available).');
  }
} 