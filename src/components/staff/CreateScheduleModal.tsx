'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Trash2, Route } from 'lucide-react';
import { createSchedule } from '@/lib/actions/schedule';
import { getAvailableCollectors } from '@/lib/actions/staff';
import { LOCATION_TYPES, SAMPLE_LOCATIONS } from '@/lib/mapbox/utils';

interface CreateScheduleModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface Stop {
    id: string;
    locationName: string;
    locationType: string;
    address: string;
    barangay: string;
    latitude?: number;
    longitude?: number;
}

interface Collector {
    id: string;
    full_name: string;
    phone: string;
    isOnDuty: boolean;
    activeAssignments: number;
    completedToday: number;
    averageRating: number;
}

export function CreateScheduleModal({ open, onClose, onSuccess }: CreateScheduleModalProps) {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [collectors, setCollectors] = useState<Collector[]>([]);

    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [scheduleType, setScheduleType] = useState<'one-time' | 'weekly' | 'bi-weekly' | 'monthly'>('one-time');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [startTime, setStartTime] = useState('07:00');
    const [endTime, setEndTime] = useState('17:00');
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [stops, setStops] = useState<Stop[]>([]);
    const [collectorId, setCollectorId] = useState('');
    const [backupCollectorId, setBackupCollectorId] = useState('');
    const [specialInstructions, setSpecialInstructions] = useState('');

    useEffect(() => {
        if (open) {
            loadCollectors();
        }
    }, [open]);

    useEffect(() => {
        // Filter locations based on selected types
        if (selectedTypes.length > 0 && !selectedTypes.includes('all')) {
            const filtered = SAMPLE_LOCATIONS.filter(loc => selectedTypes.includes(loc.type));
            // Auto-add filtered locations as stops
            setStops(filtered.map((loc, index) => ({
                id: loc.id,
                locationName: loc.name,
                locationType: loc.type,
                address: loc.address,
                barangay: loc.barangay,
                latitude: loc.lat,
                longitude: loc.lng,
            })));
        } else if (selectedTypes.includes('all')) {
            setStops(SAMPLE_LOCATIONS.map(loc => ({
                id: loc.id,
                locationName: loc.name,
                locationType: loc.type,
                address: loc.address,
                barangay: loc.barangay,
                latitude: loc.lat,
                longitude: loc.lng,
            })));
        }
    }, [selectedTypes]);

    const loadCollectors = async () => {
        const result = await getAvailableCollectors();
        if (result.success && result.data) {
            setCollectors(result.data);
        }
    };

    const handleTypeToggle = (typeId: string) => {
        setSelectedTypes(prev => {
            if (typeId === 'all') {
                return prev.includes('all') ? [] : ['all'];
            }
            const newTypes = prev.filter(t => t !== 'all');
            if (newTypes.includes(typeId)) {
                return newTypes.filter(t => t !== typeId);
            }
            return [...newTypes, typeId];
        });
    };

    const removeStop = (stopId: string) => {
        setStops(prev => prev.filter(s => s.id !== stopId));
    };

    const handleSubmit = async () => {
        if (!name || !startDate || !startTime || !endTime) {
            toast.error('Please fill in required fields');
            return;
        }

        if (stops.length === 0) {
            toast.error('Please add at least one stop');
            return;
        }

        setLoading(true);
        try {
            const result = await createSchedule({
                name,
                description,
                scheduleType,
                startDate,
                endDate: endDate || undefined,
                startTime,
                endTime,
                collectorId: collectorId || undefined,
                backupCollectorId: backupCollectorId || undefined,
                specialInstructions,
                stops: stops.map((stop, index) => ({
                    locationName: stop.locationName,
                    locationType: stop.locationType,
                    address: stop.address,
                    barangay: stop.barangay,
                    latitude: stop.latitude,
                    longitude: stop.longitude,
                    stopOrder: index + 1,
                })),
            });

            if (result.success) {
                toast.success('Schedule created successfully');
                resetForm();
                onSuccess();
            } else {
                toast.error(result.error || 'Failed to create schedule');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setStep(1);
        setName('');
        setDescription('');
        setScheduleType('one-time');
        setStartDate('');
        setEndDate('');
        setStartTime('07:00');
        setEndTime('17:00');
        setSelectedTypes([]);
        setStops([]);
        setCollectorId('');
        setBackupCollectorId('');
        setSpecialInstructions('');
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-w-4xl max-h-[90vh] bg-slate-800 border-slate-700 text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <Route className="h-5 w-5 text-emerald-400" />
                        Create Collection Schedule
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="max-h-[70vh] pr-4">
                    {/* Step Indicator */}
                    <div className="flex items-center gap-2 mb-6">
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className={`flex items-center ${s < 3 ? 'flex-1' : ''}`}
                            >
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= s
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-slate-700 text-slate-400'
                                        }`}
                                >
                                    {s}
                                </div>
                                {s < 3 && (
                                    <div
                                        className={`flex-1 h-1 mx-2 rounded ${step > s ? 'bg-emerald-500' : 'bg-slate-700'
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Step 1: Basic Info & Route Selection */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <Label className="text-slate-300">Schedule Name *</Label>
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g., Morning Route - Schools"
                                        className="bg-slate-700/50 border-slate-600 text-white mt-1"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <Label className="text-slate-300">Description</Label>
                                    <Textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Brief description of this schedule..."
                                        className="bg-slate-700/50 border-slate-600 text-white mt-1"
                                        rows={2}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label className="text-slate-300 mb-3 block">Quick Route Selection</Label>
                                <div className="grid grid-cols-4 gap-2">
                                    {LOCATION_TYPES.map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => handleTypeToggle(type.id)}
                                            className={`p-3 rounded-lg border text-sm font-medium transition-all ${selectedTypes.includes(type.id)
                                                ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                                                : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                                                }`}
                                        >
                                            {type.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {stops.length > 0 && (
                                <div>
                                    <Label className="text-slate-300 mb-3 block">
                                        Selected Stops ({stops.length})
                                    </Label>
                                    <ScrollArea className="h-48 border border-slate-600 rounded-lg p-3">
                                        <div className="space-y-2">
                                            {stops.map((stop, index) => (
                                                <div
                                                    key={stop.id}
                                                    className="flex items-center gap-3 p-2 bg-slate-700/50 rounded-lg"
                                                >
                                                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-white text-sm font-medium truncate">
                                                            {stop.locationName}
                                                        </p>
                                                        <p className="text-slate-400 text-xs truncate">
                                                            {stop.address}, {stop.barangay}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeStop(stop.id)}
                                                        className="text-slate-400 hover:text-red-400"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Schedule Details */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-slate-300">Schedule Type *</Label>
                                    <Select value={scheduleType} onValueChange={(v) => setScheduleType(v as typeof scheduleType)}>
                                        <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-slate-700">
                                            <SelectItem value="one-time">One-time</SelectItem>
                                            <SelectItem value="weekly">Weekly</SelectItem>
                                            <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="text-slate-300">Start Date *</Label>
                                    <Input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="bg-slate-700/50 border-slate-600 text-white mt-1"
                                    />
                                </div>
                                <div>
                                    <Label className="text-slate-300">End Date</Label>
                                    <Input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="bg-slate-700/50 border-slate-600 text-white mt-1"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <Label className="text-slate-300">Start Time *</Label>
                                        <Input
                                            type="time"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            className="bg-slate-700/50 border-slate-600 text-white mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-slate-300">End Time *</Label>
                                        <Input
                                            type="time"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            className="bg-slate-700/50 border-slate-600 text-white mt-1"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label className="text-slate-300 mb-3 block">Assign Collector</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-slate-400 text-sm">Primary Collector</Label>
                                        <Select value={collectorId} onValueChange={setCollectorId}>
                                            <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white mt-1">
                                                <SelectValue placeholder="Select collector" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-800 border-slate-700">
                                                <SelectItem value="">None</SelectItem>
                                                {collectors.map((c) => (
                                                    <SelectItem key={c.id} value={c.id}>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`w-2 h-2 rounded-full ${c.isOnDuty ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                                                            {c.full_name}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label className="text-slate-400 text-sm">Backup Collector</Label>
                                        <Select value={backupCollectorId} onValueChange={setBackupCollectorId}>
                                            <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white mt-1">
                                                <SelectValue placeholder="Select backup" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-800 border-slate-700">
                                                <SelectItem value="">None</SelectItem>
                                                {collectors.filter(c => c.id !== collectorId).map((c) => (
                                                    <SelectItem key={c.id} value={c.id}>
                                                        {c.full_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Review & Confirm */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="bg-slate-700/50 rounded-lg p-4 space-y-4">
                                <h3 className="font-semibold text-white">Schedule Summary</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-slate-400">Name</p>
                                        <p className="text-white font-medium">{name}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400">Type</p>
                                        <p className="text-white font-medium capitalize">{scheduleType}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400">Date</p>
                                        <p className="text-white font-medium">{startDate}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400">Time</p>
                                        <p className="text-white font-medium">{startTime} - {endTime}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400">Stops</p>
                                        <p className="text-white font-medium">{stops.length} locations</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400">Collector</p>
                                        <p className="text-white font-medium">
                                            {collectors.find(c => c.id === collectorId)?.full_name || 'Not assigned'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label className="text-slate-300">Special Instructions</Label>
                                <Textarea
                                    value={specialInstructions}
                                    onChange={(e) => setSpecialInstructions(e.target.value)}
                                    placeholder="Any special instructions for the collector..."
                                    className="bg-slate-700/50 border-slate-600 text-white mt-1"
                                    rows={3}
                                />
                            </div>
                        </div>
                    )}
                </ScrollArea>

                {/* Actions */}
                <div className="flex justify-between pt-4 border-t border-slate-700">
                    <Button
                        variant="outline"
                        onClick={() => step > 1 ? setStep(step - 1) : onClose()}
                        className="border-slate-600 text-slate-300"
                    >
                        {step > 1 ? 'Back' : 'Cancel'}
                    </Button>
                    <Button
                        onClick={() => step < 3 ? setStep(step + 1) : handleSubmit()}
                        disabled={loading || (step === 1 && (!name || stops.length === 0))}
                        className="bg-emerald-600 hover:bg-emerald-700"
                    >
                        {loading ? 'Creating...' : step < 3 ? 'Next' : 'Create Schedule'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
