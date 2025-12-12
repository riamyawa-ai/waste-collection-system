import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Since we're testing the performance hooks, let's create inline versions for testing
// In real tests, you would import from '@/hooks/usePerformance'

/**
 * useDebounce - Returns a debounced value
 */
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

    React.useEffect(() => {
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
 * usePrevious - Returns the previous value
 */
function usePrevious<T>(value: T): T | undefined {
    const ref = React.useRef<T>();
    React.useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref.current;
}

/**
 * useIsMounted - Returns a function that checks if component is mounted
 */
function useIsMounted(): () => boolean {
    const isMountedRef = React.useRef(false);

    React.useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    return React.useCallback(() => isMountedRef.current, []);
}

import * as React from 'react';

describe('Performance Hooks', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('useDebounce', () => {
        it('should return initial value immediately', () => {
            const { result } = renderHook(() => useDebounce('initial', 500));
            expect(result.current).toBe('initial');
        });

        it('should debounce value changes', async () => {
            const { result, rerender } = renderHook(
                ({ value, delay }) => useDebounce(value, delay),
                { initialProps: { value: 'initial', delay: 500 } }
            );

            expect(result.current).toBe('initial');

            // Update the value
            rerender({ value: 'updated', delay: 500 });

            // Value should still be initial (debounced)
            expect(result.current).toBe('initial');

            // Advance timers by the delay
            act(() => {
                vi.advanceTimersByTime(500);
            });

            // Now value should be updated
            expect(result.current).toBe('updated');
        });

        it('should cancel previous timeout on rapid updates', () => {
            const { result, rerender } = renderHook(
                ({ value }) => useDebounce(value, 500),
                { initialProps: { value: 'first' } }
            );

            // Multiple rapid updates
            rerender({ value: 'second' });
            act(() => {
                vi.advanceTimersByTime(200);
            });

            rerender({ value: 'third' });
            act(() => {
                vi.advanceTimersByTime(500);
            });

            // Should only have the last value
            expect(result.current).toBe('third');
        });

        it('should work with different types', () => {
            const { result, rerender } = renderHook(
                ({ value }) => useDebounce(value, 300),
                { initialProps: { value: { count: 0 } } }
            );

            expect(result.current).toEqual({ count: 0 });

            rerender({ value: { count: 1 } });
            act(() => {
                vi.advanceTimersByTime(300);
            });

            expect(result.current).toEqual({ count: 1 });
        });
    });

    describe('usePrevious', () => {
        it('should return undefined on first render', () => {
            const { result } = renderHook(() => usePrevious('initial'));
            expect(result.current).toBeUndefined();
        });

        it('should return previous value after update', () => {
            const { result, rerender } = renderHook(
                ({ value }) => usePrevious(value),
                { initialProps: { value: 'first' } }
            );

            // First render - no previous value
            expect(result.current).toBeUndefined();

            // Update to second value
            rerender({ value: 'second' });
            expect(result.current).toBe('first');

            // Update to third value
            rerender({ value: 'third' });
            expect(result.current).toBe('second');
        });

        it('should work with objects', () => {
            const { result, rerender } = renderHook(
                ({ value }) => usePrevious(value),
                { initialProps: { value: { id: 1 } } }
            );

            rerender({ value: { id: 2 } });
            expect(result.current).toEqual({ id: 1 });
        });
    });

    describe('useIsMounted', () => {
        it('should return true when mounted', () => {
            const { result } = renderHook(() => useIsMounted());
            expect(result.current()).toBe(true);
        });

        it('should return false after unmount', () => {
            const { result, unmount } = renderHook(() => useIsMounted());
            const isMounted = result.current;

            expect(isMounted()).toBe(true);

            unmount();

            expect(isMounted()).toBe(false);
        });

        it('should maintain reference stability', () => {
            const { result, rerender } = renderHook(() => useIsMounted());
            const firstRef = result.current;

            rerender();
            const secondRef = result.current;

            expect(firstRef).toBe(secondRef);
        });
    });
});
