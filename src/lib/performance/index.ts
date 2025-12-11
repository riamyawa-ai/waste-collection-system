/**
 * Performance Optimization Utilities
 * 
 * Centralized exports for all performance-related utilities across the application.
 * Import from this file for convenient access to caching, lazy loading, and React hooks.
 */

// ============================================
// CACHING UTILITIES
// ============================================
export {
    // Cache instance and class
    appCache,

    // TTL presets
    CACHE_TTL,
    STALE_TIME,

    // Cache operations
    withCache,
    withSWR,
    prefetch,
    batchPrefetch,
    getCacheKey,
    invalidateCache,

    // Pre-built cache keys
    CacheKeys,
} from '@/lib/cache';

// ============================================
// LAZY LOADING UTILITIES
// ============================================
export {
    // Main lazy load function
    lazyLoad,

    // Pre-configured loaders
    LazyLoaders,

    // Preload utilities
    preloadComponent,
    usePreload,
    useLazyLoadTrigger,

    // Loading components
    LoadingSpinner,
    FullPageLoading,
    ModalLoading,
    SkeletonLoader,
    ErrorFallback,
    LazyErrorBoundary,
} from '@/lib/lazyLoad';

// ============================================
// PERFORMANCE HOOKS
// ============================================
export {
    // Debounce hooks
    useDebounce,
    useDebouncedCallback,

    // Throttle hooks
    useThrottle,
    useThrottledCallback,

    // Intersection Observer
    useIntersectionObserver,

    // Value tracking
    usePrevious,
    useDeferredValue,

    // Callback optimization
    useStableCallback,

    // Memoization
    useDeepMemo,
    useLazyInit,

    // Window utilities
    useWindowSize,
    useEventListener,

    // Component lifecycle
    useIsMounted,
    useAsyncState,
    useIsFirstRender,

    // Browser features
    useIdleCallback,
    useNetworkStatus,

    // Debugging
    useRenderCount,
} from '@/hooks/usePerformance';

// ============================================
// REALTIME HOOKS
// ============================================
export {
    useRequestRealtime,
    useNotificationsRealtime,
    useCollectorAssignments,
    useAnnouncementsRealtime,
    useRealtimeSubscription,
    useRealtimeStatus,
} from '@/hooks/useRealtime';

// ============================================
// TYPE EXPORTS
// ============================================
export type { } from '@/lib/cache';
