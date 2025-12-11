/**
 * Client-side caching utilities for API responses
 * Provides memory caching with TTL support
 */

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

class MemoryCache {
    private cache = new Map<string, CacheEntry<unknown>>();
    private maxSize: number;

    constructor(maxSize = 100) {
        this.maxSize = maxSize;
    }

    /**
     * Get value from cache
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key) as CacheEntry<T> | undefined;

        if (!entry) {
            return null;
        }

        // Check if expired
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    /**
     * Set value in cache with TTL
     */
    set<T>(key: string, data: T, ttlMs: number = 60000): void {
        // Evict oldest entries if at max size
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey) {
                this.cache.delete(firstKey);
            }
        }

        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl: ttlMs,
        });
    }

    /**
     * Delete specific key from cache
     */
    delete(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Delete all keys matching a pattern
     */
    deletePattern(pattern: string): void {
        for (const key of this.cache.keys()) {
            if (key.includes(pattern)) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Clear entire cache
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Get cache stats
     */
    getStats(): { size: number; keys: string[] } {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
        };
    }
}

// Singleton instance for app-wide caching
export const appCache = new MemoryCache(200);

// Cache TTL presets (in milliseconds)
export const CACHE_TTL = {
    SHORT: 30 * 1000,       // 30 seconds
    MEDIUM: 5 * 60 * 1000,  // 5 minutes  
    LONG: 15 * 60 * 1000,   // 15 minutes
    HOUR: 60 * 60 * 1000,   // 1 hour
} as const;

/**
 * Wrapper function for cached async operations
 */
export async function withCache<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = CACHE_TTL.MEDIUM
): Promise<T> {
    // Check cache first
    const cached = appCache.get<T>(key);
    if (cached !== null) {
        return cached;
    }

    // Fetch fresh data
    const data = await fetchFn();

    // Cache the result
    appCache.set(key, data, ttl);

    return data;
}

/**
 * Generate cache key from function name and arguments
 */
export function getCacheKey(fn: string, ...args: unknown[]): string {
    return `${fn}:${JSON.stringify(args)}`;
}

/**
 * Invalidate cache entries related to a specific entity type
 */
export function invalidateCache(entityType: string): void {
    appCache.deletePattern(entityType);
}

// Create cache keys for common entity types
export const CacheKeys = {
    profile: (userId: string) => `profile:${userId}`,
    requests: (userId?: string, filters?: object) =>
        `requests:${userId || 'all'}:${JSON.stringify(filters || {})}`,
    payments: (userId?: string, filters?: object) =>
        `payments:${userId || 'all'}:${JSON.stringify(filters || {})}`,
    notifications: (userId: string, limit?: number) =>
        `notifications:${userId}:${limit || 'all'}`,
    announcements: (filters?: object) =>
        `announcements:${JSON.stringify(filters || {})}`,
    schedules: (userId?: string) =>
        `schedules:${userId || 'all'}`,
    stats: (type: string, userId?: string) =>
        `stats:${type}:${userId || 'all'}`,
};
