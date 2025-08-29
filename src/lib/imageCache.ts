const CACHE_NAME = 'shop-images';

export async function cacheImage(url: string): Promise<void> {
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.add(url);
  } catch (error) {
    console.error('Failed to cache image:', url, error);
  }
}

export async function getCachedImage(url: string): Promise<Response | null> {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(url);
    return response || null;
  } catch (error) {
    console.error('Failed to get cached image:', url, error);
    return null;
  }
}

export async function getImageUrl(url: string): Promise<string> {
  try {
    const cached = await getCachedImage(url);
    if (cached) {
      return URL.createObjectURL(await cached.blob());
    }
  } catch (error) {
    console.error('Failed to create object URL for cached image:', url, error);
  }
  return url;
}

export async function clearImageCache(): Promise<void> {
  try {
    await caches.delete(CACHE_NAME);
  } catch (error) {
    console.error('Failed to clear image cache:', error);
  }
} 