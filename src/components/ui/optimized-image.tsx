'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    fill?: boolean;
    className?: string;
    priority?: boolean;
    quality?: number;
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    sizes?: string;
    onLoad?: () => void;
    onError?: () => void;
}

/**
 * Optimized Image Component
 * - Uses Next.js Image optimization
 * - Implements lazy loading with intersection observer
 * - Shows skeleton placeholder while loading
 * - Handles error states gracefully
 */
export function OptimizedImage({
    src,
    alt,
    width,
    height,
    fill = false,
    className,
    priority = false,
    quality = 75,
    placeholder = 'empty',
    blurDataURL,
    sizes,
    onLoad,
    onError,
}: OptimizedImageProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [isInView, setIsInView] = useState(priority);
    const imgRef = useRef<HTMLDivElement>(null);

    // Lazy loading with Intersection Observer
    useEffect(() => {
        if (priority) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: '50px',
                threshold: 0.01,
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, [priority]);

    const handleLoad = () => {
        setIsLoading(false);
        onLoad?.();
    };

    const handleError = () => {
        setIsLoading(false);
        setHasError(true);
        onError?.();
    };

    // Default blur placeholder
    const defaultBlurDataURL =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+';

    // Error fallback
    if (hasError) {
        return (
            <div
                ref={imgRef}
                className={cn(
                    'flex items-center justify-center bg-neutral-100',
                    fill ? 'absolute inset-0' : '',
                    className
                )}
                style={!fill ? { width, height } : undefined}
            >
                <div className="text-center text-neutral-400 text-sm">
                    <svg
                        className="mx-auto h-8 w-8 mb-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                    </svg>
                    <span>Image unavailable</span>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={imgRef}
            className={cn('relative overflow-hidden', fill ? '' : 'inline-block', className)}
            style={!fill && width && height ? { width, height } : undefined}
        >
            {/* Skeleton placeholder */}
            {isLoading && (
                <div
                    className={cn(
                        'absolute inset-0 animate-pulse bg-neutral-200',
                        fill ? '' : 'rounded'
                    )}
                />
            )}

            {/* Actual image */}
            {isInView && (
                <Image
                    src={src}
                    alt={alt}
                    width={fill ? undefined : width}
                    height={fill ? undefined : height}
                    fill={fill}
                    priority={priority}
                    quality={quality}
                    placeholder={placeholder}
                    blurDataURL={placeholder === 'blur' ? (blurDataURL || defaultBlurDataURL) : undefined}
                    sizes={sizes || (fill ? '100vw' : undefined)}
                    onLoad={handleLoad}
                    onError={handleError}
                    className={cn(
                        'transition-opacity duration-300',
                        isLoading ? 'opacity-0' : 'opacity-100',
                        fill ? 'object-cover' : ''
                    )}
                />
            )}
        </div>
    );
}

/**
 * Optimized Avatar image component with fallback initials
 */
interface OptimizedAvatarImageProps {
    src?: string | null;
    alt: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    fallbackInitials?: string;
    className?: string;
}

export function OptimizedAvatarImage({
    src,
    alt,
    size = 'md',
    fallbackInitials,
    className,
}: OptimizedAvatarImageProps) {
    const [hasError, setHasError] = useState(false);

    const sizeClasses = {
        sm: 'h-8 w-8 text-xs',
        md: 'h-10 w-10 text-sm',
        lg: 'h-12 w-12 text-base',
        xl: 'h-16 w-16 text-lg',
    };

    const sizePx = {
        sm: 32,
        md: 40,
        lg: 48,
        xl: 64,
    };

    // Generate initials from alt text if not provided
    const initials =
        fallbackInitials ||
        alt
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

    if (!src || hasError) {
        return (
            <div
                className={cn(
                    'flex items-center justify-center rounded-full bg-primary-100 text-primary-700 font-medium',
                    sizeClasses[size],
                    className
                )}
            >
                {initials}
            </div>
        );
    }

    return (
        <div className={cn('relative rounded-full overflow-hidden', sizeClasses[size], className)}>
            <Image
                src={src}
                alt={alt}
                width={sizePx[size]}
                height={sizePx[size]}
                className="object-cover"
                onError={() => setHasError(true)}
            />
        </div>
    );
}
