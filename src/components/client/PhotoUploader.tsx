'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface PhotoUploaderProps {
    maxPhotos?: number;
    maxSizeMB?: number;
    onPhotosChange: (files: File[]) => void;
    error?: string;
    disabled?: boolean;
}

export function PhotoUploader({
    maxPhotos = 5,
    maxSizeMB = 5,
    onPhotosChange,
    error,
    disabled = false,
}: PhotoUploaderProps) {
    const [photos, setPhotos] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const onDrop = useCallback(
        (acceptedFiles: File[], _rejectedFiles: unknown[]) => {
            setUploadError(null);

            // Check if adding files would exceed max
            if (photos.length + acceptedFiles.length > maxPhotos) {
                setUploadError(`Maximum ${maxPhotos} photos allowed`);
                return;
            }

            // Check file sizes
            const oversizedFiles = acceptedFiles.filter(
                (file) => file.size > maxSizeMB * 1024 * 1024
            );
            if (oversizedFiles.length > 0) {
                setUploadError(`Some files exceed ${maxSizeMB}MB limit`);
                return;
            }

            // Create previews
            const newPreviews = acceptedFiles.map((file) => URL.createObjectURL(file));

            const updatedPhotos = [...photos, ...acceptedFiles];
            const updatedPreviews = [...previews, ...newPreviews];

            setPhotos(updatedPhotos);
            setPreviews(updatedPreviews);
            onPhotosChange(updatedPhotos);
        },
        [photos, previews, maxPhotos, maxSizeMB, onPhotosChange]
    );

    const removePhoto = (index: number) => {
        // Revoke the object URL to free memory
        URL.revokeObjectURL(previews[index]);

        const updatedPhotos = photos.filter((_, i) => i !== index);
        const updatedPreviews = previews.filter((_, i) => i !== index);

        setPhotos(updatedPhotos);
        setPreviews(updatedPreviews);
        onPhotosChange(updatedPhotos);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
        },
        maxFiles: maxPhotos - photos.length,
        disabled: disabled || photos.length >= maxPhotos,
    });

    const canAddMore = photos.length < maxPhotos;

    return (
        <div className="space-y-4">
            {/* Dropzone */}
            {canAddMore && (
                <div
                    {...getRootProps()}
                    className={cn(
                        'border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer',
                        isDragActive
                            ? 'border-primary-400 bg-primary-50'
                            : 'border-neutral-300 hover:border-primary-400 hover:bg-neutral-50',
                        disabled && 'opacity-50 cursor-not-allowed'
                    )}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                            <Upload className="w-6 h-6 text-primary-600" />
                        </div>
                        {isDragActive ? (
                            <p className="text-primary-600 font-medium">Drop photos here...</p>
                        ) : (
                            <>
                                <p className="text-neutral-700 font-medium">
                                    Drag & drop photos here
                                </p>
                                <p className="text-sm text-neutral-500">
                                    or click to browse
                                </p>
                            </>
                        )}
                        <p className="text-xs text-neutral-400 mt-2">
                            Maximum {maxPhotos} photos • {maxSizeMB}MB per photo • JPG, PNG
                        </p>
                    </div>
                </div>
            )}

            {/* Error message */}
            {(uploadError || error) && (
                <Alert variant="destructive">
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>{uploadError || error}</AlertDescription>
                </Alert>
            )}

            {/* Photo previews */}
            {previews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {previews.map((preview, index) => (
                        <div
                            key={preview}
                            className="relative aspect-square rounded-lg overflow-hidden border border-neutral-200 group"
                        >
                            <Image
                                src={preview}
                                alt={`Upload preview ${index + 1}`}
                                fill
                                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                                className="object-cover"
                            />
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={() => removePhoto(index)}
                                className="absolute top-1 right-1 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-3 h-3" />
                            </Button>
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 px-2 truncate">
                                {photos[index]?.name}
                            </div>
                        </div>
                    ))}

                    {/* Add more placeholder */}
                    {canAddMore && (
                        <div
                            {...getRootProps()}
                            className="aspect-square rounded-lg border-2 border-dashed border-neutral-300 flex items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-neutral-50 transition-colors"
                        >
                            <input {...getInputProps()} />
                            <div className="text-center">
                                <ImageIcon className="w-6 h-6 text-neutral-400 mx-auto mb-1" />
                                <span className="text-xs text-neutral-500">Add more</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Photo count */}
            <p className="text-xs text-neutral-500 text-right">
                {photos.length} / {maxPhotos} photos
            </p>
        </div>
    );
}
