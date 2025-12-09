'use client';

import { useState, useTransition, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    X,
    Edit,
    User,
    Phone,
    MapPin,
    Calendar,
    Clock,
    AlertCircle,
    FileText,
    Loader2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/ui/phone-input';
import { BarangaySelect } from '@/components/ui/barangay-select';
import { cn } from '@/lib/utils';

import { updateRequest } from '@/lib/actions/requests';
import { updateRequestSchema, type UpdateRequestInput } from '@/lib/validators/request';
import { PRIORITY_LEVELS, TIME_SLOTS } from '@/constants/status';
import type { PriorityLevel } from '@/constants/status';

interface EditRequestModalProps {
    isOpen: boolean;
    request: {
        id: string;
        request_number: string;
        barangay: string;
        address: string;
        priority: PriorityLevel;
        preferred_date: string;
        preferred_time_slot: string;
        contact_number: string;
        alt_contact_number?: string;
        special_instructions?: string;
        requester_name?: string;
    } | null;
    onClose: () => void;
    onSuccess?: () => void;
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

export function EditRequestModal({
    isOpen,
    request,
    onClose,
    onSuccess,
}: EditRequestModalProps) {
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    // Get tomorrow's date as minimum
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];

    const {
        register,
        handleSubmit,
        control,
        reset,
        watch,
        formState: { errors },
    } = useForm<UpdateRequestInput>({
        resolver: zodResolver(updateRequestSchema),
        defaultValues: {
            id: request?.id || '',
            requester_name: request?.requester_name || '',
            barangay: request?.barangay || '',
            address: request?.address || '',
            priority: request?.priority || PRIORITY_LEVELS.LOW,
            preferred_date: request?.preferred_date || '',
            preferred_time_slot: request?.preferred_time_slot || '',
            contact_number: request?.contact_number || '',
            alt_contact_number: request?.alt_contact_number || undefined,
            special_instructions: request?.special_instructions || undefined,
        },
    });

    const selectedPriority = watch('priority');
    const specialInstructions = watch('special_instructions') || '';

    // Reset form when request changes or modal opens
    useEffect(() => {
        if (isOpen && request) {
            reset({
                id: request.id,
                requester_name: request.requester_name || '',
                barangay: request.barangay,
                address: request.address,
                priority: request.priority,
                preferred_date: request.preferred_date,
                preferred_time_slot: request.preferred_time_slot,
                contact_number: request.contact_number,
                alt_contact_number: request.alt_contact_number || undefined,
                special_instructions: request.special_instructions || undefined,
            });
            setError(null);
        }
    }, [isOpen, request, reset]);

    if (!isOpen || !request) return null;

    const onSubmit = (data: UpdateRequestInput) => {
        setError(null);
        startTransition(async () => {
            const result = await updateRequest({ ...data, id: request.id });
            if (result.success) {
                onSuccess?.();
                onClose();
            } else {
                setError(result.error || 'Failed to update request');
            }
        });
    };

    const handleClose = () => {
        if (!isPending) {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-3xl mx-4 my-8 bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg">
                            <Edit className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Edit Request</h2>
                            <p className="text-sm text-white/80">
                                {request.request_number}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={isPending}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {/* Error Alert */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 mb-6">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    <div className="space-y-6">
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
                                    <textarea
                                        id="address"
                                        rows={2}
                                        placeholder="Street name, building/house number, landmarks, etc."
                                        disabled={isPending}
                                        className="flex w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-none"
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
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                        <select
                                            id="preferred_time_slot"
                                            className="flex w-full h-10 rounded-lg border border-neutral-300 bg-white pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                            disabled={isPending}
                                            {...register('preferred_time_slot')}
                                        >
                                            <option value="">Select time slot</option>
                                            <optgroup label="Morning">
                                                {TIME_SLOTS.MORNING.map((slot) => (
                                                    <option key={slot} value={slot}>
                                                        {slot}
                                                    </option>
                                                ))}
                                            </optgroup>
                                            <optgroup label="Afternoon">
                                                {TIME_SLOTS.AFTERNOON.map((slot) => (
                                                    <option key={slot} value={slot}>
                                                        {slot}
                                                    </option>
                                                ))}
                                            </optgroup>
                                            <optgroup label="Flexible">
                                                {TIME_SLOTS.FLEXIBLE.map((slot) => (
                                                    <option key={slot} value={slot}>
                                                        {slot}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        </select>
                                    </div>
                                    {errors.preferred_time_slot && (
                                        <p className="text-sm text-red-600">{errors.preferred_time_slot.message}</p>
                                    )}
                                </div>
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
                                <textarea
                                    id="special_instructions"
                                    rows={4}
                                    placeholder="Provide any special instructions:&#10;• Access codes or gate information&#10;• Waste type and volume description&#10;• Specific location details&#10;• Safety precautions&#10;• Best approach routes"
                                    disabled={isPending}
                                    maxLength={500}
                                    className="flex w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                    {...register('special_instructions')}
                                />
                                <div className="flex justify-between text-xs text-neutral-500">
                                    <span>Include any helpful information for the collector</span>
                                    <span>{specialInstructions.length}/500</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 mt-6 border-t border-neutral-200">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isPending}
                            className="flex-1 sm:flex-none"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="flex-1 sm:flex-none sm:min-w-[200px]"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving Changes...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
