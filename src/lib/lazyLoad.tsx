'use client';

import dynamic from 'next/dynamic';
import { ComponentType, ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

/**
 * Loading spinner component for lazy-loaded components
 */
function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-8 w-8 animate-spin text-primary-600" />
        </div>
    );
}

/**
 * Full page loading component
 */
function FullPageLoading() {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
                <RefreshCw className="h-10 w-10 animate-spin text-primary-600 mx-auto mb-4" />
                <p className="text-neutral-500">Loading...</p>
            </div>
        </div>
    );
}

/**
 * Modal loading component
 */
function ModalLoading() {
    return (
        <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin text-primary-600" />
        </div>
    );
}

/**
 * Creates a lazy-loaded component with a loading fallback
 */
export function lazyLoad<T extends ComponentType<object>>(
    importFn: () => Promise<{ default: T }>,
    options: {
        loading?: ReactNode;
        ssr?: boolean;
    } = {}
): T {
    const { loading = <LoadingSpinner />, ssr = false } = options;

    return dynamic(importFn, {
        loading: () => <>{loading}</>,
        ssr,
    }) as unknown as T;
}

/**
 * Pre-configured lazy loaders for common use cases
 */
export const LazyLoaders = {
    /**
     * For modals and dialogs - no SSR, small loading indicator
     */
    modal: <T extends ComponentType<object>>(importFn: () => Promise<{ default: T }>) =>
        lazyLoad(importFn, { loading: <ModalLoading />, ssr: false }),

    /**
     * For full page components - no SSR, larger loading indicator
     */
    page: <T extends ComponentType<object>>(importFn: () => Promise<{ default: T }>) =>
        lazyLoad(importFn, { loading: <FullPageLoading />, ssr: false }),

    /**
     * For components that should be SSR rendered - with loading fallback
     */
    ssr: <T extends ComponentType<object>>(importFn: () => Promise<{ default: T }>) =>
        lazyLoad(importFn, { loading: <LoadingSpinner />, ssr: true }),
};

// Export loading components for custom use
export { LoadingSpinner, FullPageLoading, ModalLoading };
