'use client';

import { useCallback, useEffect, useRef, useState, useMemo, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface VirtualListProps<T> {
    items: T[];
    itemHeight: number;
    containerHeight: number;
    renderItem: (item: T, index: number) => ReactNode;
    overscan?: number;
    className?: string;
    emptyMessage?: string;
    keyExtractor?: (item: T, index: number) => string | number;
}

/**
 * Virtual List Component
 * Efficiently renders large lists by only mounting visible items
 */
export function VirtualList<T>({
    items,
    itemHeight,
    containerHeight,
    renderItem,
    overscan = 3,
    className,
    emptyMessage = 'No items to display',
    keyExtractor = (_, index) => index,
}: VirtualListProps<T>) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scrollTop, setScrollTop] = useState(0);

    const totalHeight = items.length * itemHeight;

    // Calculate visible range with overscan
    const { startIndex, visibleItems } = useMemo(() => {
        const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
        const visibleCount = Math.ceil(containerHeight / itemHeight);
        const end = Math.min(items.length - 1, start + visibleCount + 2 * overscan);

        return {
            startIndex: start,
            endIndex: end,
            visibleItems: items.slice(start, end + 1),
        };
    }, [items, scrollTop, itemHeight, containerHeight, overscan]);

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop);
    }, []);

    if (items.length === 0) {
        return (
            <div
                className={cn('flex items-center justify-center text-neutral-500', className)}
                style={{ height: containerHeight }}
            >
                {emptyMessage}
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={cn('overflow-auto', className)}
            style={{ height: containerHeight }}
            onScroll={handleScroll}
        >
            <div style={{ height: totalHeight, position: 'relative' }}>
                {visibleItems.map((item, idx) => {
                    const actualIndex = startIndex + idx;
                    return (
                        <div
                            key={keyExtractor(item, actualIndex)}
                            style={{
                                position: 'absolute',
                                top: actualIndex * itemHeight,
                                left: 0,
                                right: 0,
                                height: itemHeight,
                            }}
                        >
                            {renderItem(item, actualIndex)}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

interface InfiniteScrollProps<T> {
    items: T[];
    loadMore: () => Promise<void>;
    hasMore: boolean;
    isLoading: boolean;
    renderItem: (item: T, index: number) => ReactNode;
    keyExtractor?: (item: T, index: number) => string | number;
    threshold?: number;
    className?: string;
    loadingComponent?: ReactNode;
    endMessage?: string;
}

/**
 * Infinite Scroll Component
 * Loads more items as user scrolls to bottom
 */
export function InfiniteScroll<T>({
    items,
    loadMore,
    hasMore,
    isLoading,
    renderItem,
    keyExtractor = (_, index) => index,
    threshold = 100,
    className,
    loadingComponent,
    endMessage,
}: InfiniteScrollProps<T>) {
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadingRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isLoading || !hasMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMore();
                }
            },
            { rootMargin: `${threshold}px` }
        );

        if (loadingRef.current) {
            observer.observe(loadingRef.current);
        }

        observerRef.current = observer;

        return () => {
            observer.disconnect();
        };
    }, [loadMore, hasMore, isLoading, threshold]);

    return (
        <div className={className}>
            {items.map((item, index) => (
                <div key={keyExtractor(item, index)}>{renderItem(item, index)}</div>
            ))}

            {/* Loading trigger element */}
            <div ref={loadingRef} className="w-full">
                {isLoading &&
                    (loadingComponent || (
                        <div className="flex justify-center py-4">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
                        </div>
                    ))}
                {!hasMore && items.length > 0 && endMessage && (
                    <div className="py-4 text-center text-neutral-500 text-sm">{endMessage}</div>
                )}
            </div>
        </div>
    );
}

interface PaginatedListProps<T> {
    items: T[];
    itemsPerPage: number;
    renderItem: (item: T, index: number) => ReactNode;
    keyExtractor?: (item: T, index: number) => string | number;
    className?: string;
    emptyMessage?: string;
}

/**
 * Paginated List with client-side pagination
 */
export function PaginatedList<T>({
    items,
    itemsPerPage,
    renderItem,
    keyExtractor = (_, index) => index,
    className,
    emptyMessage = 'No items to display',
}: PaginatedListProps<T>) {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(items.length / itemsPerPage);

    const paginatedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return items.slice(startIndex, startIndex + itemsPerPage);
    }, [items, currentPage, itemsPerPage]);

    // Reset to page 1 if items change significantly
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(1);
        }
    }, [totalPages, currentPage]);

    if (items.length === 0) {
        return (
            <div className={cn('flex items-center justify-center py-8 text-neutral-500', className)}>
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className={className}>
            {/* Items */}
            <div>
                {paginatedItems.map((item, idx) => {
                    const actualIndex = (currentPage - 1) * itemsPerPage + idx;
                    return (
                        <div key={keyExtractor(item, actualIndex)}>{renderItem(item, actualIndex)}</div>
                    );
                })}
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="text-sm text-neutral-500">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                        {Math.min(currentPage * itemsPerPage, items.length)} of {items.length}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50"
                        >
                            Previous
                        </button>
                        <span className="px-3 py-1 text-sm">
                            {currentPage} / {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
