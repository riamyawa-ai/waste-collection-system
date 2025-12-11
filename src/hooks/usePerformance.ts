/**
 * Performance Optimization Utilities
 * Provides reusable hooks and utilities for optimizing React component performance
 */

import { useCallback, useMemo, useRef, useEffect, useState, DependencyList } from 'react';

/**
 * Debounce hook - delays function execution until after wait time has elapsed
 * Useful for search inputs, API calls, and expensive operations
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

/**
 * Debounced callback hook - creates a debounced version of a callback
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => void>(
    callback: T,
    delay: number,
    deps: DependencyList = []
): T {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const debouncedCallback = useCallback(
        (...args: Parameters<T>) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
                callback(...args);
            }, delay);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [callback, delay, ...deps]
    ) as T;

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return debouncedCallback;
}

/**
 * Throttle hook - limits function execution to once per specified time period
 * Useful for scroll events, resize handlers, etc.
 */
export function useThrottle<T>(value: T, limit: number): T {
    const [throttledValue, setThrottledValue] = useState<T>(value);
    const lastRan = useRef<number>(Date.now());

    useEffect(() => {
        const handler = setTimeout(() => {
            if (Date.now() - lastRan.current >= limit) {
                setThrottledValue(value);
                lastRan.current = Date.now();
            }
        }, limit - (Date.now() - lastRan.current));

        return () => {
            clearTimeout(handler);
        };
    }, [value, limit]);

    return throttledValue;
}

/**
 * Intersection Observer hook - for lazy loading and virtualization
 */
export function useIntersectionObserver(
    elementRef: React.RefObject<Element>,
    options: IntersectionObserverInit = {}
): boolean {
    const [isIntersecting, setIsIntersecting] = useState(false);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(([entry]) => {
            setIsIntersecting(entry.isIntersecting);
        }, {
            threshold: 0.1,
            ...options
        });

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [elementRef, options.threshold, options.root, options.rootMargin]);

    return isIntersecting;
}

/**
 * Previous value hook - useful for comparing values and preventing unnecessary updates
 */
export function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T | undefined>(undefined);
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref.current;
}

/**
 * Stable callback hook - memoizes callback reference while updating implementation
 */
export function useStableCallback<T extends (...args: unknown[]) => unknown>(callback: T): T {
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    return useCallback(
        ((...args) => callbackRef.current(...args)) as T,
        []
    );
}

/**
 * Memoized comparison hook - only updates when deep comparison shows change
 */
export function useDeepMemo<T>(factory: () => T, deps: DependencyList): T {
    const ref = useRef<{ deps: DependencyList; value: T } | null>(null);

    if (ref.current === null || !depsAreEqual(ref.current.deps, deps)) {
        ref.current = { deps, value: factory() };
    }

    return ref.current.value;
}

function depsAreEqual(oldDeps: DependencyList, newDeps: DependencyList): boolean {
    if (oldDeps.length !== newDeps.length) return false;
    for (let i = 0; i < oldDeps.length; i++) {
        if (!Object.is(oldDeps[i], newDeps[i])) return false;
    }
    return true;
}

/**
 * Window size hook with throttled updates - prevents excessive re-renders
 */
export function useWindowSize(throttleMs: number = 200): { width: number; height: number } {
    const [size, setSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 0,
        height: typeof window !== 'undefined' ? window.innerHeight : 0,
    });

    const lastRan = useRef(Date.now());

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            if (Date.now() - lastRan.current >= throttleMs) {
                setSize({
                    width: window.innerWidth,
                    height: window.innerHeight,
                });
                lastRan.current = Date.now();
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [throttleMs]);

    return size;
}

/**
 * Mount state hook - helps prevent state updates on unmounted components
 */
export function useIsMounted(): () => boolean {
    const isMountedRef = useRef(false);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    return useCallback(() => isMountedRef.current, []);
}

/**
 * Lazy initialization hook - for expensive initial computations
 */
export function useLazyInit<T>(factory: () => T): T {
    const ref = useRef<T | null>(null);
    if (ref.current === null) {
        ref.current = factory();
    }
    return ref.current;
}

/**
 * Event listener hook with automatic cleanup
 */
export function useEventListener<K extends keyof WindowEventMap>(
    eventName: K,
    handler: (event: WindowEventMap[K]) => void,
    element: Window | HTMLElement | null = typeof window !== 'undefined' ? window : null,
    options?: AddEventListenerOptions
): void {
    const savedHandler = useRef(handler);

    useEffect(() => {
        savedHandler.current = handler;
    }, [handler]);

    useEffect(() => {
        if (!element) return;

        const eventListener = (event: Event) => savedHandler.current(event as WindowEventMap[K]);
        element.addEventListener(eventName, eventListener, options);

        return () => {
            element.removeEventListener(eventName, eventListener, options);
        };
    }, [eventName, element, options]);
}

/**
 * Async state hook - safely updates state after async operations
 * Prevents "setState on unmounted component" warnings
 */
export function useAsyncState<T>(initialValue: T): [
    T,
    (value: T | ((prev: T) => T)) => void,
    boolean
] {
    const [state, setState] = useState<T>(initialValue);
    const [isLoading, setIsLoading] = useState(false);
    const isMounted = useIsMounted();

    const safeSetState = useCallback((value: T | ((prev: T) => T)) => {
        if (isMounted()) {
            setState(value);
        }
    }, [isMounted]);

    return [state, safeSetState, isLoading];
}

/**
 * Throttled callback hook - limits callback execution rate
 */
export function useThrottledCallback<T extends (...args: unknown[]) => void>(
    callback: T,
    limit: number,
    deps: DependencyList = []
): T {
    const lastRan = useRef<number>(0);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastArgs = useRef<Parameters<T> | null>(null);

    const throttledCallback = useCallback(
        (...args: Parameters<T>) => {
            const now = Date.now();

            if (now - lastRan.current >= limit) {
                callback(...args);
                lastRan.current = now;
            } else {
                // Store args and schedule execution at limit
                lastArgs.current = args;

                if (!timeoutRef.current) {
                    timeoutRef.current = setTimeout(() => {
                        if (lastArgs.current) {
                            callback(...lastArgs.current);
                            lastRan.current = Date.now();
                            lastArgs.current = null;
                        }
                        timeoutRef.current = null;
                    }, limit - (now - lastRan.current));
                }
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [callback, limit, ...deps]
    ) as T;

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return throttledCallback;
}

/**
 * Idle callback hook - executes callback during browser idle time
 * Useful for non-critical operations like analytics, prefetching
 */
export function useIdleCallback(
    callback: () => void,
    options: { timeout?: number } = {}
): void {
    const { timeout = 1000 } = options;
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        let handle: number;

        if ('requestIdleCallback' in window) {
            handle = window.requestIdleCallback(
                () => callbackRef.current(),
                { timeout }
            );

            return () => window.cancelIdleCallback(handle);
        } else {
            // Fallback for Safari
            const timeoutHandle = setTimeout(() => callbackRef.current(), 1);
            return () => clearTimeout(timeoutHandle);
        }
    }, [timeout]);
}

/**
 * Network status hook - for connection-aware features
 */
export function useNetworkStatus(): {
    isOnline: boolean;
    isSlowConnection: boolean;
    connectionType: string | null;
} {
    const [status, setStatus] = useState({
        isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
        isSlowConnection: false,
        connectionType: null as string | null,
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const updateNetworkStatus = () => {
            const connection = (navigator as Navigator & {
                connection?: { effectiveType?: string; saveData?: boolean }
            }).connection;

            setStatus({
                isOnline: navigator.onLine,
                isSlowConnection: connection?.effectiveType === '2g' ||
                    connection?.effectiveType === 'slow-2g' ||
                    connection?.saveData === true,
                connectionType: connection?.effectiveType || null,
            });
        };

        updateNetworkStatus();

        window.addEventListener('online', updateNetworkStatus);
        window.addEventListener('offline', updateNetworkStatus);

        const connection = (navigator as Navigator & {
            connection?: EventTarget
        }).connection;

        if (connection) {
            connection.addEventListener('change', updateNetworkStatus);
        }

        return () => {
            window.removeEventListener('online', updateNetworkStatus);
            window.removeEventListener('offline', updateNetworkStatus);
            if (connection) {
                connection.removeEventListener('change', updateNetworkStatus);
            }
        };
    }, []);

    return status;
}

/**
 * Deferred value hook - defers non-urgent updates
 * Similar to React 18's useDeferredValue but with control
 */
export function useDeferredValue<T>(value: T, delay: number = 300): T {
    const [deferredValue, setDeferredValue] = useState(value);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDeferredValue(value);
        }, delay);

        return () => clearTimeout(timeoutId);
    }, [value, delay]);

    return deferredValue;
}

/**
 * Render count hook - for debugging performance issues
 */
export function useRenderCount(componentName?: string): number {
    const renderCount = useRef(0);

    useEffect(() => {
        renderCount.current += 1;
        if (componentName && process.env.NODE_ENV === 'development') {
            console.log(`${componentName} rendered ${renderCount.current} times`);
        }
    });

    return renderCount.current;
}

/**
 * Previous render performed check - for optimistic UI
 */
export function useIsFirstRender(): boolean {
    const isFirst = useRef(true);

    useEffect(() => {
        isFirst.current = false;
    }, []);

    return isFirst.current;
}
