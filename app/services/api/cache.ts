interface CacheItem<T> {
  data: T;
  timestamp: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items to store
}

class ApiCache {
  private cache: Map<string, CacheItem<any>> = new Map();
  private readonly defaultTTL: number = 5 * 60 * 1000; // 5 minutes
  private readonly maxSize: number = 100;

  constructor(private options: CacheOptions = {}) {
    this.options.ttl = options.ttl || this.defaultTTL;
    this.options.maxSize = options.maxSize || this.maxSize;
  }

  set<T>(key: string, data: T): void {
    // Remove oldest item if cache is full
    if (this.cache.size >= this.options.maxSize!) {
      const oldestKey = this.getOldestKey();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if item has expired
    if (Date.now() - item.timestamp > this.options.ttl!) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private getOldestKey(): string | null {
    let oldestKey: string | null = null;
    let oldestTimestamp = Infinity;

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp;
        oldestKey = key;
      }
    }

    return oldestKey;
  }
}

// Create cache instances for different types of data
export const productCache = new ApiCache({ ttl: 5 * 60 * 1000 }); // 5 minutes
export const categoryCache = new ApiCache({ ttl: 30 * 60 * 1000 }); // 30 minutes
export const cartCache = new ApiCache({ ttl: 1 * 60 * 1000 }); // 1 minute
export const wishlistCache = new ApiCache({ ttl: 1 * 60 * 1000 }); // 1 minute

// Helper function to generate cache keys
export const generateCacheKey = (prefix: string, params?: Record<string, any>): string => {
  if (!params) return prefix;
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {} as Record<string, any>);
  return `${prefix}:${JSON.stringify(sortedParams)}`;
}; 