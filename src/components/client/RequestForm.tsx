'use client';

import { useState, useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    User,
    MapPin,
    Calendar,
    Clock,
    AlertCircle,
    AlertTriangle,
    FileText,
    Loader2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PhoneInput } from '@/components/ui/phone-input';
import { BarangaySelect } from '@/components/ui/barangay-select';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { PhotoUploader } from './PhotoUploader';
import { cn } from '@/lib/utils';

import {
    createRequestSchema,
    type CreateRequestInput,
} from '@/lib/validators/request';
import { createRequest } from '@/lib/actions/requests';
import { PRIORITY_LEVELS, TIME_SLOTS } from '@/constants/status';

interface RequestFormProps {
    defaultValues?: Partial<CreateRequestInput>;
    onSuccess?: (requestId: string) => void;
    onCancel?: () => void;
}

const PRIORITY_OPTIONS = [
    {
        value: PRIORITY_LEVELS.LOW,
        label: 'Low',
        description: 'Regular pickup, no urgency',
        color: 'bg-green-100 border-green-300 text-green-700',
        selectedColor: 'ring-green-400',
    },
    {
        value: PRIORITY_LEVELS.MEDIUM,
        label: 'Medium',
        description: 'Moderate volume or time-sensitive',
        color: 'bg-yellow-100 border-yellow-300 text-yellow-700',
        selectedColor: 'ring-yellow-400',
    },
    {
        value: PRIORITY_LEVELS.URGENT,
        label: 'Urgent',
        description: 'Immediate attention needed',
        color: 'bg-red-100 border-red-300 text-red-700',
        selectedColor: 'ring-red-400',
    },
];

export function RequestForm({ defaultValues, onSuccess, onCancel }: RequestFormProps) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [_photos, setPhotos] = useState<File[]>([]);

    // Get tomorrow's date as minimum
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];

    const {
        register,
        handleSubmit,
        control,
        watch,
        formState: { errors },
    } = useForm<CreateRequestInput>({
        resolver: zodResolver(createRequestSchema),
        defaultValues: {
            requester_name: defaultValues?.requester_name || '',
            contact_number: defaultValues?.contact_number || '',
            alt_contact_number: defaultValues?.alt_contact_number || '',
            barangay: defaultValues?.barangay,
            address: defaultValues?.address || '',
            priority: defaultValues?.priority || PRIORITY_LEVELS.LOW,
            preferred_date: defaultValues?.preferred_date || '',
            preferred_time_slot: defaultValues?.preferred_time_slot || '',
            special_instructions: defaultValues?.special_instructions || '',
        },
    });

    // eslint-disable-next-line react-hooks/incompatible-library -- react-hook-form's watch() is expected to not be memoizable
    const selectedPriority = watch('priority');
    const specialInstructions = watch('special_instructions') || '';

    const onSubmit = (data: CreateRequestInput) => {
        setError(null);

        startTransition(async () => {
            const result = await createRequest(data);

            if (result.success && result.data) {
                // TODO: Upload photos if any
                onSuccess?.(result.data.id);
            } else {
                setError(result.error || 'Failed to create request');
            }
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Error Alert */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Section 1: Requester Information */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary-600" />
                    Requester Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="requester_name" required>
                            Name / Facility Name
                        </Label>
                        <Input
                            id="requester_name"
                            placeholder="Enter your name or facility name"
                            disabled={isPending}
                            {...register('requester_name')}
                        />
                        {errors.requester_name && (
                            <p className="text-sm text-red-600">{errors.requester_name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="contact_number" required>
                            Contact Number
                        </Label>
                        <Controller
                            name="contact_number"
                            control={control}
                            render={({ field }) => (
                                <PhoneInput
                                    id="contact_number"
                                    value={field.value}
                                    onChange={field.onChange}
                                    disabled={isPending}
                                    error={errors.contact_number?.message}
                                />
                            )}
                        />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="alt_contact_number">
                            Alternative Contact Number <span className="text-neutral-400">(Optional)</span>
                        </Label>
                        <Controller
                            name="alt_contact_number"
                            control={control}
                            render={({ field }) => (
                                <PhoneInput
                                    id="alt_contact_number"
                                    value={field.value || ''}
                                    onChange={field.onChange}
                                    disabled={isPending}
                                    error={errors.alt_contact_number?.message}
                                />
                            )}
                        />
                    </div>
                </div>
            </div>

            {/* Section 2: Location Details */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary-600" />
                    Location Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="barangay" required>
                            Barangay
                        </Label>
                        <Controller
                            name="barangay"
                            control={control}
                            render={({ field }) => (
                                <BarangaySelect
                                    value={field.value}
                                    onChange={field.onChange}
                                    disabled={isPending}
                                    error={errors.barangay?.message}
                                />
                            )}
                        />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="address" required>
                            Complete Address
                        </Label>
                        <Textarea
                            id="address"
                            rows={2}
                            placeholder="Street name, building/house number, landmarks, etc."
                            disabled={isPending}
                            className="resize-none"
                            {...register('address')}
                        />
                        {errors.address && (
                            <p className="text-sm text-red-600">{errors.address.message}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Section 3: Schedule Preferences */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary-600" />
                    Schedule Preferences
                </h3>

                {/* Priority Selection */}
                <div className="space-y-2">
                    <Label required>Priority Level</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {PRIORITY_OPTIONS.map((option) => (
                            <label
                                key={option.value}
                                className={cn(
                                    'relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all',
                                    selectedPriority === option.value
                                        ? `${option.color} ring-2 ${option.selectedColor}`
                                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                                )}
                            >
                                <input
                                    type="radio"
                                    value={option.value}
                                    className="sr-only"
                                    disabled={isPending}
                                    {...register('priority')}
                                />
                                <span
                                    className={cn(
                                        'font-medium',
                                        selectedPriority === option.value
                                            ? option.color
                                            : 'text-neutral-900'
                                    )}
                                >
                                    {option.label}
                                </span>
                                <span className="text-sm text-neutral-500 mt-0.5">
                                    {option.description}
                                </span>
                            </label>
                        ))}
                    </div>
                    {errors.priority && (
                        <p className="text-sm text-red-600">{errors.priority.message}</p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="preferred_date" required>
                            Preferred Date
                        </Label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                            <Input
                                id="preferred_date"
                                type="date"
                                min={minDate}
                                className="pl-10"
                                disabled={isPending}
                                {...register('preferred_date')}
                            />
                        </div>
                        {errors.preferred_date && (
                            <p className="text-sm text-red-600">{errors.preferred_date.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="preferred_time_slot" required>
                            Preferred Time
                        </Label>
                        <Controller
                            name="preferred_time_slot"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    disabled={isPending}
                                >
                                    <SelectTrigger className="w-full pl-10">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 z-10" />
                                        <SelectValue placeholder="Select time slot" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Morning</SelectLabel>
                                            {TIME_SLOTS.MORNING.map((slot) => (
                                                <SelectItem key={slot} value={slot}>
                                                    {slot}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                        <SelectGroup>
                                            <SelectLabel>Afternoon</SelectLabel>
                                            {TIME_SLOTS.AFTERNOON.map((slot) => (
                                                <SelectItem key={slot} value={slot}>
                                                    {slot}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                        <SelectGroup>
                                            <SelectLabel>Flexible</SelectLabel>
                                            {TIME_SLOTS.FLEXIBLE.map((slot) => (
                                                <SelectItem key={slot} value={slot}>
                                                    {slot}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                    {errors.preferred_time_slot && (
                        <p className="text-sm text-red-600">{errors.preferred_time_slot.message}</p>
                    )}
                </div>
            </div>

            {/* Section 4: Request Details */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary-600" />
                    Request Details
                </h3>

                <div className="space-y-2">
                    <Label htmlFor="special_instructions">
                        Special Instructions <span className="text-neutral-400">(Optional)</span>
                    </Label>
                    <Textarea
                        id="special_instructions"
                        rows={4}
                        placeholder="Provide any special instructions:&#10;• Access codes or gate information&#10;• Waste type and volume description&#10;• Specific location details&#10;• Safety precautions&#10;• Best approach routes"
                        disabled={isPending}
                        maxLength={500}
                        className="resize-none"
                        {...register('special_instructions')}
                    />
                    <div className="flex justify-between text-xs text-neutral-500">
                        <span>Include any helpful information for the collector</span>
                        <span>{specialInstructions.length}/500</span>
                    </div>
                </div>
            </div>

            {/* Section 5: Photo Upload */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-primary-600" />
                    Photos <span className="text-neutral-400 font-normal text-sm">(Optional)</span>
                </h3>
                <PhotoUploader
                    maxPhotos={5}
                    maxSizeMB={5}
                    onPhotosChange={setPhotos}
                    disabled={isPending}
                />
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-neutral-200">
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isPending}
                        className="flex-1 sm:flex-none"
                    >
                        Cancel
                    </Button>
                )}
                <Button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 sm:flex-none sm:min-w-[200px]"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        'Submit Request'
                    )}
                </Button>
            </div>
        </form >
    );
}
