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
