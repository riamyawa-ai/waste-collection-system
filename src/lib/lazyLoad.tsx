'use client';

import dynamic from 'next/dynamic';
import { ComponentType, ReactNode, useEffect, useState, Component, ErrorInfo, ReactElement } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

/**
 * Loading spinner component for lazy-loaded components
 */
function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-10 w-10',
    };

    return (
        <div
            className="flex items-center justify-center p-8"
            role="status"
            aria-label="Loading"
        >
            <RefreshCw className={`${sizeClasses[size]} animate-spin text-primary-600`} />
            <span className="sr-only">Loading...</span>
        </div>
    );
}

/**
 * Full page loading component
 */
function FullPageLoading({ message = 'Loading...' }: { message?: string }) {
    return (
        <div
            className="flex items-center justify-center min-h-[400px]"
            role="status"
            aria-label={message}
        >
            <div className="text-center">
                <RefreshCw className="h-10 w-10 animate-spin text-primary-600 mx-auto mb-4" />
                <p className="text-neutral-500">{message}</p>
            </div>
        </div>
    );
}

/**
 * Modal loading component
 */
function ModalLoading() {
    return (
        <div
            className="flex items-center justify-center py-12"
            role="status"
            aria-label="Loading modal content"
        >
            <RefreshCw className="h-6 w-6 animate-spin text-primary-600" />
            <span className="sr-only">Loading...</span>
        </div>
    );
}

/**
 * Skeleton loading placeholder
 */
function SkeletonLoader({
    className = '',
    height = 'h-32',
    width = 'w-full',
}: {
    className?: string;
    height?: string;
    width?: string;
}) {
    return (
        <div
            className={`animate-pulse bg-neutral-200 rounded ${height} ${width} ${className}`}
            role="status"
            aria-label="Loading content"
        >
            <span className="sr-only">Loading...</span>
        </div>
    );
}

/**
 * Error Fallback component for failed lazy loads
 */
function ErrorFallback({
    error,
    retry
}: {
    error?: Error;
    retry?: () => void;
}) {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
            <AlertTriangle className="h-10 w-10 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-neutral-700 mb-2">
                Failed to load component
            </h3>
            <p className="text-sm text-neutral-500 mb-4">
                {error?.message || 'An unexpected error occurred'}
            </p>
            {retry && (
                <button
                    onClick={retry}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                    Try Again
                </button>
            )}
        </div>
    );
}

/**
 * Error Boundary for lazy-loaded components
 */
interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactElement;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

class LazyErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        this.props.onError?.(error, errorInfo);
        console.error('Lazy load error:', error, errorInfo);
    }

    handleRetry = (): void => {
        this.setState({ hasError: false, error: undefined });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return (
                <ErrorFallback
                    error={this.state.error}
                    retry={this.handleRetry}
                />
            );
        }

        return this.props.children;
    }
}

/**
 * Lazy load options interface
 */
interface LazyLoadOptions {
    loading?: ReactNode;
    ssr?: boolean;
    errorFallback?: ReactElement;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * Creates a lazy-loaded component with a loading fallback
 */
export function lazyLoad<P extends object>(
    importFn: () => Promise<{ default: ComponentType<P> }>,
    options: LazyLoadOptions = {}
): ComponentType<P> {
    const {
        loading = <LoadingSpinner />,
        ssr = false,
        errorFallback,
        onError,
    } = options;

    const LazyComponent = dynamic(importFn, {
        loading: () => <>{loading}</>,
        ssr,
    });

    // Wrap with error boundary
    const WrappedComponent = (props: P) => (
        <LazyErrorBoundary fallback={errorFallback} onError={onError}>
            <LazyComponent {...props} />
        </LazyErrorBoundary>
    );

    return WrappedComponent as ComponentType<P>;
}

/**
 * Pre-configured lazy loaders for common use cases
 */
export const LazyLoaders = {
    /**
     * For modals and dialogs - no SSR, small loading indicator
     */
    modal: <P extends object>(importFn: () => Promise<{ default: ComponentType<P> }>) =>
        lazyLoad<P>(importFn, { loading: <ModalLoading />, ssr: false }),

    /**
     * For full page components - no SSR, larger loading indicator
     */
    page: <P extends object>(importFn: () => Promise<{ default: ComponentType<P> }>) =>
        lazyLoad<P>(importFn, { loading: <FullPageLoading />, ssr: false }),

    /**
     * For components that should be SSR rendered - with loading fallback
     */
    ssr: <P extends object>(importFn: () => Promise<{ default: ComponentType<P> }>) =>
        lazyLoad<P>(importFn, { loading: <LoadingSpinner />, ssr: true }),

    /**
     * For charts and heavy visualizations - with skeleton placeholder
     */
    chart: <P extends object>(importFn: () => Promise<{ default: ComponentType<P> }>) =>
        lazyLoad<P>(importFn, {
            loading: <SkeletonLoader height="h-64" />,
            ssr: false
        }),

    /**
     * For map components - no SSR, custom loading
     */
    map: <P extends object>(importFn: () => Promise<{ default: ComponentType<P> }>) =>
        lazyLoad<P>(importFn, {
            loading: <SkeletonLoader height="h-96" className="rounded-lg" />,
            ssr: false
        }),
};

/**
 * Preload a lazy component (useful for route prefetching)
 */
export function preloadComponent<P extends object>(
    importFn: () => Promise<{ default: ComponentType<P> }>
): void {
    importFn().catch(() => {
        // Silently fail preload
    });
}

/**
 * Hook to preload components on hover or focus
 */
export function usePreload<P extends object>(
    importFn: () => Promise<{ default: ComponentType<P> }>
): { onMouseEnter: () => void; onFocus: () => void } {
    const [preloaded, setPreloaded] = useState(false);

    const preload = () => {
        if (!preloaded) {
            preloadComponent(importFn);
            setPreloaded(true);
        }
    };

    return {
        onMouseEnter: preload,
        onFocus: preload,
    };
}

/**
 * Intersection observer based lazy loading trigger
 */
export function useLazyLoadTrigger(
    importFn: () => Promise<unknown>,
    options: IntersectionObserverInit = {}
): {
    ref: (node: Element | null) => void;
    isLoaded: boolean;
} {
    const [isLoaded, setIsLoaded] = useState(false);
    const [element, setElement] = useState<Element | null>(null);

    useEffect(() => {
        if (!element || isLoaded) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    importFn().finally(() => setIsLoaded(true));
                    observer.disconnect();
                }
            },
            { rootMargin: '100px', ...options }
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [element, isLoaded, importFn, options]);

    return {
        ref: setElement,
        isLoaded,
    };
}

// Export loading components for custom use
export {
    LoadingSpinner,
    FullPageLoading,
    ModalLoading,
    SkeletonLoader,
    ErrorFallback,
    LazyErrorBoundary,
};
