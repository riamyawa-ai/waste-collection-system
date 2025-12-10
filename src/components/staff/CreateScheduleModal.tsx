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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Trash2, Route, Map, List } from 'lucide-react';
import { createSchedule } from '@/lib/actions/schedule';
import { getAvailableCollectors } from '@/lib/actions/staff';
import { LOCATION_TYPES, SAMPLE_LOCATIONS } from '@/lib/mapbox/utils';
import { MapboxRouteEditor } from './MapboxRouteEditor';

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
            <DialogContent className="max-w-4xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <Route className="h-5 w-5 text-emerald-600" />
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
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-gray-200 text-gray-500'
                                        }`}
                                >
                                    {s}
                                </div>
                                {s < 3 && (
                                    <div
                                        className={`flex-1 h-1 mx-2 rounded ${step > s ? 'bg-emerald-600' : 'bg-gray-200'
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
                                    <Label className="text-gray-700">Schedule Name *</Label>
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g., Morning Route - Schools"
                                        className="mt-1"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <Label className="text-gray-700">Description</Label>
                                    <Textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Brief description of this schedule..."
                                        className="mt-1"
                                        rows={2}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label className="text-gray-700 mb-3 block">Route Selection</Label>
                                <Tabs defaultValue="map" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                                        <TabsTrigger value="map" className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm">
                                            <Map className="h-4 w-4 mr-2" />
                                            Map View
                                        </TabsTrigger>
                                        <TabsTrigger value="list" className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm">
                                            <List className="h-4 w-4 mr-2" />
                                            Quick Select
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="map" className="mt-4">
                                        <div className="rounded-lg overflow-hidden border border-gray-200">
                                            <MapboxRouteEditor
                                                stops={stops.map(s => ({
                                                    ...s,
                                                    latitude: s.latitude || 0,
                                                    longitude: s.longitude || 0,
                                                }))}
                                                onStopsChange={(newStops) => setStops(newStops)}
                                                showSampleLocations={true}
                                                height="300px"
                                            />
                                        </div>
                                        <p className="text-gray-500 text-sm mt-2">
                                            Click on markers to add stops. Use the filter buttons to show specific location types.
                                        </p>
                                    </TabsContent>

                                    <TabsContent value="list" className="mt-4">
                                        <div className="grid grid-cols-4 gap-2">
                                            {LOCATION_TYPES.map((type) => (
                                                <button
                                                    key={type.id}
                                                    onClick={() => handleTypeToggle(type.id)}
                                                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${selectedTypes.includes(type.id)
                                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                                        }`}
                                                >
                                                    {type.label}
                                                </button>
                                            ))}
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>

                            {stops.length > 0 && (
                                <div>
                                    <Label className="text-gray-700 mb-3 block">
                                        Selected Stops ({stops.length})
                                    </Label>
                                    <ScrollArea className="h-32 border border-gray-200 rounded-lg p-3">
                                        <div className="space-y-2">
                                            {stops.map((stop, index) => (
                                                <div
                                                    key={stop.id}
                                                    className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-100"
                                                >
                                                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-gray-900 text-sm font-medium truncate">
                                                            {stop.locationName}
                                                        </p>
                                                        <p className="text-gray-500 text-xs truncate">
                                                            {stop.address}, {stop.barangay}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeStop(stop.id)}
                                                        className="text-gray-400 hover:text-red-600 hover:bg-red-50"
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
                                    <Label className="text-gray-700">Schedule Type *</Label>
                                    <Select value={scheduleType} onValueChange={(v) => setScheduleType(v as typeof scheduleType)}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="one-time">One-time</SelectItem>
                                            <SelectItem value="weekly">Weekly</SelectItem>
                                            <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="text-gray-700">Start Date *</Label>
                                    <Input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label className="text-gray-700">End Date</Label>
                                    <Input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="mt-1"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <Label className="text-gray-700">Start Time *</Label>
                                        <Input
                                            type="time"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-gray-700">End Time *</Label>
                                        <Input
                                            type="time"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label className="text-gray-700 mb-3 block">Assign Collector</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-gray-500 text-sm">Primary Collector</Label>
                                        <Select value={collectorId} onValueChange={setCollectorId}>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Select collector" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">None</SelectItem>
                                                {collectors.map((c) => (
                                                    <SelectItem key={c.id} value={c.id}>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`w-2 h-2 rounded-full ${c.isOnDuty ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                                                            {c.full_name}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label className="text-gray-500 text-sm">Backup Collector</Label>
                                        <Select value={backupCollectorId} onValueChange={setBackupCollectorId}>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Select backup" />
                                            </SelectTrigger>
                                            <SelectContent>
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
                            <div className="bg-gray-50 rounded-lg p-4 space-y-4 border border-gray-200">
                                <h3 className="font-semibold text-gray-900">Schedule Summary</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Name</p>
                                        <p className="text-gray-900 font-medium">{name}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Type</p>
                                        <p className="text-gray-900 font-medium capitalize">{scheduleType}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Date</p>
                                        <p className="text-gray-900 font-medium">{startDate}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Time</p>
                                        <p className="text-gray-900 font-medium">{startTime} - {endTime}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Stops</p>
                                        <p className="text-gray-900 font-medium">{stops.length} locations</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Collector</p>
                                        <p className="text-gray-900 font-medium">
                                            {collectors.find(c => c.id === collectorId)?.full_name || 'Not assigned'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label className="text-gray-700">Special Instructions</Label>
                                <Textarea
                                    value={specialInstructions}
                                    onChange={(e) => setSpecialInstructions(e.target.value)}
                                    placeholder="Any special instructions for the collector..."
                                    className="mt-1"
                                    rows={3}
                                />
                            </div>
                        </div>
                    )}
                </ScrollArea>

                {/* Actions */}
                <div className="flex justify-between pt-4 border-t border-gray-200">
                    <Button
                        variant="outline"
                        onClick={() => step > 1 ? setStep(step - 1) : onClose()}
                    >
                        {step > 1 ? 'Back' : 'Cancel'}
                    </Button>
                    <Button
                        onClick={() => step < 3 ? setStep(step + 1) : handleSubmit()}
                        disabled={loading || (step === 1 && (!name || stops.length === 0))}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        {loading ? 'Creating...' : step < 3 ? 'Next' : 'Create Schedule'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
