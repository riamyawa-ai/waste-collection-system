/**
 * Client-side caching utilities for API responses
 * Provides memory caching with TTL support, LRU eviction, and stale-while-revalidate
 */

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
    lastAccessed: number;
    staleTime?: number; // For stale-while-revalidate pattern
}

interface CacheStats {
    size: number;
    hits: number;
    misses: number;
    hitRate: number;
    keys: string[];
}

class MemoryCache {
    private cache = new Map<string, CacheEntry<unknown>>();
    private maxSize: number;
    private hits = 0;
    private misses = 0;

    constructor(maxSize = 100) {
        this.maxSize = maxSize;
    }

    /**
     * Get value from cache with LRU tracking
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key) as CacheEntry<T> | undefined;

        if (!entry) {
            this.misses++;
            return null;
        }

        const now = Date.now();

        // Check if expired
        if (now - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            this.misses++;
            return null;
        }

        // Update last accessed time for LRU
        entry.lastAccessed = now;
        this.hits++;

        return entry.data;
    }

    /**
     * Get stale entry (for stale-while-revalidate pattern)
     */
    getStale<T>(key: string): { data: T; isStale: boolean } | null {
        const entry = this.cache.get(key) as CacheEntry<T> | undefined;

        if (!entry) {
            return null;
        }

        const now = Date.now();
        const isStale = now - entry.timestamp > (entry.staleTime || entry.ttl);
        const isExpired = now - entry.timestamp > entry.ttl;

        if (isExpired) {
            this.cache.delete(key);
            return null;
        }

        entry.lastAccessed = now;
        return { data: entry.data, isStale };
    }

    /**
     * Set value in cache with TTL and LRU eviction
     */
    set<T>(key: string, data: T, ttlMs: number = 60000, staleTimeMs?: number): void {
        // Evict LRU entries if at max size
        if (this.cache.size >= this.maxSize) {
            this.evictLRU();
        }

        const now = Date.now();
        this.cache.set(key, {
            data,
            timestamp: now,
            ttl: ttlMs,
            lastAccessed: now,
            staleTime: staleTimeMs,
        });
    }

    /**
     * Evict least recently used entry
     */
    private evictLRU(): void {
        let oldestKey: string | null = null;
        let oldestTime = Infinity;

        for (const [key, entry] of this.cache.entries()) {
            if (entry.lastAccessed < oldestTime) {
                oldestTime = entry.lastAccessed;
                oldestKey = key;
            }
        }

        if (oldestKey) {
            this.cache.delete(oldestKey);
        }
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
        const keysToDelete: string[] = [];
        for (const key of this.cache.keys()) {
            if (key.includes(pattern)) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach(key => this.cache.delete(key));
    }

    /**
     * Delete expired entries (manual cleanup)
     */
    cleanup(): number {
        const now = Date.now();
        let removed = 0;

        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > entry.ttl) {
                this.cache.delete(key);
                removed++;
            }
        }

        return removed;
    }

    /**
     * Clear entire cache
     */
    clear(): void {
        this.cache.clear();
        this.hits = 0;
        this.misses = 0;
    }

    /**
     * Get cache stats with hit rate
     */
    getStats(): CacheStats {
        const total = this.hits + this.misses;
        return {
            size: this.cache.size,
            hits: this.hits,
            misses: this.misses,
            hitRate: total > 0 ? (this.hits / total) * 100 : 0,
            keys: Array.from(this.cache.keys()),
        };
    }

    /**
     * Check if key exists (without affecting stats)
     */
    has(key: string): boolean {
        const entry = this.cache.get(key);
        if (!entry) return false;
        return Date.now() - entry.timestamp <= entry.ttl;
    }

    /**
     * Get remaining TTL for a key
     */
    getTTL(key: string): number | null {
        const entry = this.cache.get(key);
        if (!entry) return null;
        const remaining = entry.ttl - (Date.now() - entry.timestamp);
        return remaining > 0 ? remaining : null;
    }
}

// Singleton instance for app-wide caching
export const appCache = new MemoryCache(200);

// Cache TTL presets (in milliseconds)
export const CACHE_TTL = {
    INSTANT: 5 * 1000,      // 5 seconds (for rapidly changing data)
    SHORT: 30 * 1000,       // 30 seconds
    MEDIUM: 5 * 60 * 1000,  // 5 minutes  
    LONG: 15 * 60 * 1000,   // 15 minutes
    HOUR: 60 * 60 * 1000,   // 1 hour
    DAY: 24 * 60 * 60 * 1000, // 24 hours (for static data)
} as const;

// Stale time presets (for stale-while-revalidate)
export const STALE_TIME = {
    INSTANT: 0,
    SHORT: 10 * 1000,       // 10 seconds
    MEDIUM: 60 * 1000,      // 1 minute
    LONG: 5 * 60 * 1000,    // 5 minutes
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
 * Stale-while-revalidate cache strategy
 * Returns stale data immediately while fetching fresh data in background
 */
export async function withSWR<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: {
        ttl?: number;
        staleTime?: number;
        onRevalidate?: (data: T) => void;
    } = {}
): Promise<T> {
    const { ttl = CACHE_TTL.MEDIUM, staleTime = STALE_TIME.MEDIUM, onRevalidate } = options;

    const cached = appCache.getStale<T>(key);

    if (cached) {
        if (cached.isStale) {
            // Return stale data immediately, revalidate in background
            fetchFn().then((freshData) => {
                appCache.set(key, freshData, ttl, staleTime);
                onRevalidate?.(freshData);
            }).catch(() => {
                // Silently fail background revalidation
            });
        }
        return cached.data;
    }

    // No cache, fetch fresh
    const data = await fetchFn();
    appCache.set(key, data, ttl, staleTime);
    return data;
}

/**
 * Prefetch data into cache (for warming)
 */
export async function prefetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = CACHE_TTL.MEDIUM
): Promise<void> {
    if (!appCache.has(key)) {
        const data = await fetchFn();
        appCache.set(key, data, ttl);
    }
}

/**
 * Batch prefetch multiple cache entries
 */
export async function batchPrefetch(
    entries: Array<{ key: string; fetchFn: () => Promise<unknown>; ttl?: number }>
): Promise<void> {
    await Promise.allSettled(
        entries.map(({ key, fetchFn, ttl }) => prefetch(key, fetchFn, ttl))
    );
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
    collectors: (status?: string) =>
        `collectors:${status || 'all'}`,
    barangays: () => 'barangays:list',
    dashboard: (role: string, userId: string) =>
        `dashboard:${role}:${userId}`,
};
