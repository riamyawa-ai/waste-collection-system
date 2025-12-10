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
import { Trash2, Route, Map, List, MapPin } from 'lucide-react';
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

    const steps = [
        { id: 1, label: 'Route Details' },
        { id: 2, label: 'Schedule Info' },
        { id: 3, label: 'Review' }
    ];

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-gray-50/50">
                <DialogHeader className="p-6 pb-2 bg-white border-b border-gray-100">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <Route className="h-5 w-5 text-emerald-600" />
                        Create Collection Schedule
                    </DialogTitle>
                </DialogHeader>

                {/* Progress Stepper */}
                <div className="bg-white px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center justify-between relative">
                        {/* Connecting Line */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-100 -z-10" />

                        {steps.map((s) => {
                            const isCompleted = step > s.id;
                            const isCurrent = step === s.id;

                            return (
                                <div key={s.id} className="flex flex-col items-center gap-2 bg-white px-2">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-300 ${isCompleted
                                            ? 'bg-emerald-600 border-emerald-600 text-white'
                                            : isCurrent
                                                ? 'bg-white border-emerald-600 text-emerald-600 shadow-sm scale-110'
                                                : 'bg-white border-gray-300 text-gray-400'
                                            }`}
                                    >
                                        {isCompleted ? (
                                            <Route className="h-4 w-4" />
                                        ) : (
                                            s.id
                                        )}
                                    </div>
                                    <span className={`text-xs font-medium ${isCurrent ? 'text-emerald-700' : 'text-gray-500'
                                        }`}>
                                        {s.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {/* Step 1: Basic Info & Route Selection */}
                    {step === 1 && (
                        <div className="space-y-6 max-w-3xl mx-auto">
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 border-b pb-3">Route Information</h3>
                                <div className="grid gap-4">
                                    <div>
                                        <Label className="text-gray-700">Schedule Name *</Label>
                                        <Input
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="e.g., Downtown Morning Collection"
                                            className="mt-1.5 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-gray-700">Description</Label>
                                        <Textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Optional description of the route and collection targets..."
                                            className="mt-1.5 bg-gray-50 border-gray-200 focus:bg-white transition-colors resize-none"
                                            rows={2}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                                <div className="flex items-center justify-between border-b pb-3">
                                    <h3 className="text-lg font-semibold text-gray-900">Stops Selection</h3>
                                    <span className="text-sm text-gray-500">{stops.length} stops added</span>
                                </div>

                                <Tabs defaultValue="map" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2 bg-gray-100 mb-4 p-1">
                                        <TabsTrigger value="map" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                            <Map className="h-4 w-4 mr-2" />
                                            Interactive Map
                                        </TabsTrigger>
                                        <TabsTrigger value="list" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                            <List className="h-4 w-4 mr-2" />
                                            Quick Select
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="map" className="mt-0">
                                        <div className="rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                                            <MapboxRouteEditor
                                                stops={stops.map(s => ({
                                                    ...s,
                                                    latitude: s.latitude || 0,
                                                    longitude: s.longitude || 0,
                                                }))}
                                                onStopsChange={(newStops) => setStops(newStops)}
                                                showSampleLocations={true}
                                                height="350px"
                                            />
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="list" className="mt-0">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {LOCATION_TYPES.map((type) => {
                                                const isSelected = selectedTypes.includes(type.id);
                                                return (
                                                    <button
                                                        key={type.id}
                                                        onClick={() => handleTypeToggle(type.id)}
                                                        className={`p-4 rounded-xl border-2 text-sm font-medium transition-all text-left flex flex-col gap-3 hover:shadow-md ${isSelected
                                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm'
                                                            : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200'
                                                            }`}
                                                    >
                                                        <span
                                                            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors`}
                                                            style={{
                                                                backgroundColor: isSelected ? type.color + '20' : '#f3f4f6',
                                                                color: type.color
                                                            }}
                                                        >
                                                            <MapPin className="w-5 h-5" />
                                                        </span>
                                                        <div className="flex items-center justify-between w-full">
                                                            <span className={isSelected ? 'font-semibold' : ''}>{type.label}</span>
                                                            {isSelected && (
                                                                <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                </span>
                                                            )}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </TabsContent>
                                </Tabs>

                                {stops.length > 0 && (
                                    <div className="bg-gray-50/50 rounded-lg border border-gray-200">
                                        <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                                            <Label className="text-gray-600 font-medium">Selected Stops Sequence</Label>
                                            <span className="text-xs text-gray-400">Drag map markers to reorder (coming soon)</span>
                                        </div>
                                        <ScrollArea className="h-40 p-2">
                                            <div className="space-y-1">
                                                {stops.map((stop, index) => (
                                                    <div
                                                        key={stop.id}
                                                        className="group flex items-center gap-3 p-2 bg-white rounded-md border border-gray-100 hover:border-emerald-200 transition-colors shadow-sm"
                                                    >
                                                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">
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
                                                            className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
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
                        </div>
                    )}

                    {/* Step 2: Schedule Details */}
                    {step === 2 && (
                        <div className="space-y-6 max-w-3xl mx-auto">
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
                                <h3 className="text-lg font-semibold text-gray-900 border-b pb-3">Timing & Frequency</h3>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2 md:col-span-1">
                                        <Label className="text-gray-700">Frequency *</Label>
                                        <Select value={scheduleType} onValueChange={(v) => setScheduleType(v as typeof scheduleType)}>
                                            <SelectTrigger className="mt-1.5 bg-gray-50 border-gray-200">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="one-time">One-time Collection</SelectItem>
                                                <SelectItem value="weekly">Weekly Recurring</SelectItem>
                                                <SelectItem value="bi-weekly">Bi-weekly Recurring</SelectItem>
                                                <SelectItem value="monthly">Monthly Recurring</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="col-span-2 grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-gray-700">Start Date *</Label>
                                            <Input
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                className="mt-1.5 bg-gray-50 border-gray-200"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-gray-700">End Date</Label>
                                            <Input
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                className="mt-1.5 bg-gray-50 border-gray-200"
                                            />
                                        </div>
                                    </div>

                                    <div className="col-span-2 grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-gray-700">Start Time *</Label>
                                            <Input
                                                type="time"
                                                value={startTime}
                                                onChange={(e) => setStartTime(e.target.value)}
                                                className="mt-1.5 bg-gray-50 border-gray-200"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-gray-700">End Time *</Label>
                                            <Input
                                                type="time"
                                                value={endTime}
                                                onChange={(e) => setEndTime(e.target.value)}
                                                className="mt-1.5 bg-gray-50 border-gray-200"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 border-b pb-3">Assignment</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label className="text-gray-700">Primary Collector</Label>
                                        <Select value={collectorId} onValueChange={setCollectorId}>
                                            <SelectTrigger className="mt-1.5 bg-gray-50 border-gray-200">
                                                <SelectValue placeholder="Select collector" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="unassigned">Unassigned</SelectItem>
                                                {collectors.map((c) => (
                                                    <SelectItem key={c.id} value={c.id}>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`w-2 h-2 rounded-full ${c.isOnDuty ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                                                            {c.full_name}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-gray-500 mt-1">Responsible for the main route.</p>
                                    </div>
                                    <div>
                                        <Label className="text-gray-700">Backup Collector</Label>
                                        <Select value={backupCollectorId} onValueChange={setBackupCollectorId}>
                                            <SelectTrigger className="mt-1.5 bg-gray-50 border-gray-200">
                                                <SelectValue placeholder="Optional backup" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">None</SelectItem>
                                                {collectors.filter(c => c.id !== collectorId).map((c) => (
                                                    <SelectItem key={c.id} value={c.id}>
                                                        {c.full_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-gray-500 mt-1">Optional backup assignment.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Review & Confirm */}
                    {step === 3 && (
                        <div className="max-w-3xl mx-auto space-y-6">
                            <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-4 flex items-start gap-3">
                                <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">
                                    <Route className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-emerald-900">Ready to Create Schedule</h4>
                                    <p className="text-sm text-emerald-700 mt-1">
                                        Please review the details below. Once created, collectors will be notified of their new assignment.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                                    <h3 className="font-semibold text-gray-900 border-b pb-2">Overview</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</span>
                                            <p className="text-gray-900 font-medium">{name}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</span>
                                            <p className="text-gray-900 font-medium capitalize flex items-center gap-2">
                                                {scheduleType}
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</span>
                                                <p className="text-gray-900">{startDate}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Time</span>
                                                <p className="text-gray-900">{startTime} - {endTime}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                                    <h3 className="font-semibold text-gray-900 border-b pb-2">Logistics</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Stops</span>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-2xl font-bold text-emerald-600">{stops.length}</span>
                                                <span className="text-gray-500 text-sm">locations</span>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Assigned Team</span>
                                            <div className="mt-1 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                                    <span className="text-gray-900 font-medium">
                                                        {collectors.find(c => c.id === collectorId)?.full_name || 'Unassigned'}
                                                    </span>
                                                    <span className="text-xs text-gray-400">(Primary)</span>
                                                </div>
                                                {backupCollectorId && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-gray-300" />
                                                        <span className="text-gray-700">
                                                            {collectors.find(c => c.id === backupCollectorId)?.full_name}
                                                        </span>
                                                        <span className="text-xs text-gray-400">(Backup)</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                <Label className="text-gray-700 mb-2 block">Special Instructions</Label>
                                <Textarea
                                    value={specialInstructions}
                                    onChange={(e) => setSpecialInstructions(e.target.value)}
                                    placeholder="Any final notes or instructions..."
                                    className="bg-gray-50 border-gray-200"
                                    rows={3}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="bg-white p-4 border-t border-gray-100 flex justify-between items-center">
                    <Button
                        variant="ghost"
                        onClick={() => step > 1 ? setStep(step - 1) : onClose()}
                        className="text-gray-500 hover:text-gray-900"
                    >
                        {step > 1 ? 'Back' : 'Cancel'}
                    </Button>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 mr-2">Step {step} of 3</span>
                        <Button
                            onClick={() => step < 3 ? setStep(step + 1) : handleSubmit()}
                            disabled={loading || (step === 1 && (!name || stops.length === 0))}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[120px]"
                        >
                            {loading ? 'Creating...' : step < 3 ? 'Next Step' : 'Create Schedule'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
