interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items in cache
}

interface CacheItem<T> {
  value: T;
  expiry: number;
}

export class Cache<T> {
  private cache: Map<string, CacheItem<T>>;
  private maxSize: number;
  private defaultTTL: number;

  constructor(options: CacheOptions = {}) {
    this.cache = new Map();
    this.maxSize = options.maxSize || 1000;
    this.defaultTTL = options.ttl || 5 * 60 * 1000; // 5 minutes default
  }

  set(key: string, value: T, ttl: number = this.defaultTTL): void {
    this.cleanup();

    if (this.cache.size >= this.maxSize) {
      const keys = Array.from(this.cache.keys());
      if (keys.length > 0) {
        this.cache.delete(keys[0]);
      }
    }

    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl
    });
  }

  get<R = T>(key: string): R | null {
    this.cleanup();

    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value as unknown as R;
  }

  has(key: string): boolean {
    this.cleanup();
    return this.cache.has(key);
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    Array.from(this.cache.entries()).forEach(([key, item]) => {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    });
  }
}

// Create cache instances for different types of data
export const productCache = new Cache<any>({ ttl: 5 * 60 * 1000 }); // 5 minutes
export const categoryCache = new Cache<any>({ ttl: 15 * 60 * 1000 }); // 15 minutes
export const userCache = new Cache<any>({ ttl: 30 * 60 * 1000 }); // 30 minutes
export const settingsCache = new Cache<any>({ ttl: 60 * 60 * 1000 }); // 1 hour

// Helper function to generate cache keys
export function generateCacheKey(prefix: string, params?: Record<string, any>): string {
  if (!params) return prefix;
  
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      if (params[key] !== undefined) {
        acc[key] = params[key];
      }
      return acc;
    }, {} as Record<string, any>);

  return `${prefix}:${JSON.stringify(sortedParams)}`;
} 