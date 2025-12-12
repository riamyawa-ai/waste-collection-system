import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce, useThrottle } from '@/hooks/usePerformance';

describe('usePerformance Hooks', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('useDebounce', () => {
        it('should return initial value immediately', () => {
            const { result } = renderHook(() => useDebounce('test', 500));
            expect(result.current).toBe('test');
        });

        it('should debounce value changes', () => {
            const { result, rerender } = renderHook(({ val, delay }) => useDebounce(val, delay), {
                initialProps: { val: 'test', delay: 500 },
            });

            rerender({ val: 'updated', delay: 500 });
            // Should still be old value immediately
            expect(result.current).toBe('test');

            act(() => {
                vi.advanceTimersByTime(250);
            });
            // Should still be old value halfway
            expect(result.current).toBe('test');

            act(() => {
                vi.advanceTimersByTime(250);
            });
            // Should be updated after delay
            expect(result.current).toBe('updated');
        });
    });

    describe('useThrottle', () => {
        it('should return initial value immediately', () => {
            const { result } = renderHook(() => useThrottle('test', 500));
            expect(result.current).toBe('test');
        });

        it('should throttle value updates', () => {
            const { result, rerender } = renderHook(({ val, limit }) => useThrottle(val, limit), {
                initialProps: { val: 'initial', limit: 1000 },
            });

            expect(result.current).toBe('initial');

            // Update 1 (should be ignored if within limit, but hooks work slightly differently)
            // actually useThrottle implementation updates state.

            rerender({ val: 'update1', limit: 1000 });
            // It shouldn't update immediately if time hasn't passed, 
            // BUT the initial implementation sets lastRan to Date.now().
            // If we update immediately, Date.now() - lastRan < limit.
            // It sets a timeout.

            expect(result.current).toBe('initial');

            act(() => {
                vi.advanceTimersByTime(500);
            });
            expect(result.current).toBe('initial');

            act(() => {
                vi.advanceTimersByTime(500);
            });
            expect(result.current).toBe('update1');
        });
    });
});
