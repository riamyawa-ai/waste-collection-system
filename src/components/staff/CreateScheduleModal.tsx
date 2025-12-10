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
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
    Trash2,
    Route,
    Map,
    List,
    MapPin,
    Calendar,
    Clock,
    Users,
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    Sparkles,
    FileText,
    AlertCircle,
    Loader2,
    Star,
} from 'lucide-react';
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
    const [activeTab, setActiveTab] = useState<'map' | 'list'>('map');

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
            setStops(filtered.map((loc) => ({
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
        } catch {
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
        { id: 1, label: 'Route Details', icon: Route, description: 'Name & select stops' },
        { id: 2, label: 'Schedule Info', icon: Calendar, description: 'Date, time & assign' },
        { id: 3, label: 'Review & Create', icon: CheckCircle2, description: 'Confirm details' }
    ];

    const canProceedToStep2 = name.trim() !== '' && stops.length > 0;
    const canProceedToStep3 = startDate !== '' && startTime !== '' && endTime !== '';

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-w-5xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 border-0 shadow-2xl">
                {/* Glowing Header */}
                <DialogHeader className="relative px-8 py-6 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImRvdHMiIHg9IjAiIHk9IjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNkb3RzKSIvPjwvc3ZnPg==')] opacity-50" />
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-teal-400/20 rounded-full blur-2xl" />

                    <div className="relative z-10 flex items-center gap-4">
                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg">
                            <Route className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-bold text-white tracking-tight">
                                Create Collection Schedule
                            </DialogTitle>
                            <p className="text-emerald-100 text-sm mt-1">
                                Design an optimized waste collection route
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                {/* Modern Step Indicator */}
                <div className="px-8 py-5 bg-white/80 backdrop-blur-sm border-b border-gray-100/80">
                    <div className="flex items-center justify-between max-w-2xl mx-auto">
                        {steps.map((s, index) => {
                            const isCompleted = step > s.id;
                            const isCurrent = step === s.id;
                            const StepIcon = s.icon;

                            return (
                                <div key={s.id} className="flex items-center">
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isCompleted
                                                    ? 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-200/50'
                                                    : isCurrent
                                                        ? 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-200/50 ring-4 ring-emerald-100 scale-110'
                                                        : 'bg-gray-100 text-gray-400'
                                                }`}
                                        >
                                            {isCompleted ? (
                                                <CheckCircle2 className="h-6 w-6 text-white" />
                                            ) : (
                                                <StepIcon className={`h-5 w-5 ${isCurrent ? 'text-white' : 'text-gray-400'}`} />
                                            )}
                                            {isCurrent && (
                                                <span className="absolute -inset-1 rounded-2xl animate-ping bg-emerald-400/30" />
                                            )}
                                        </div>
                                        <span className={`mt-2 text-xs font-semibold tracking-wide ${isCurrent ? 'text-emerald-700' : isCompleted ? 'text-emerald-600' : 'text-gray-400'
                                            }`}>
                                            {s.label}
                                        </span>
                                        <span className={`text-[10px] ${isCurrent ? 'text-gray-500' : 'text-gray-400'}`}>
                                            {s.description}
                                        </span>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className={`w-20 h-1 mx-3 rounded-full transition-all duration-500 ${step > s.id ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gray-200'
                                            }`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto px-8 py-6">
                    {/* Step 1: Route Details */}
                    {step === 1 && (
                        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
                            {/* Route Information Card */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-50 bg-gradient-to-r from-gray-50 to-white">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-100 rounded-xl">
                                            <FileText className="h-5 w-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Route Information</h3>
                                            <p className="text-sm text-gray-500">Basic details about this collection route</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 space-y-5">
                                    <div>
                                        <Label className="text-gray-700 font-medium text-sm">Schedule Name *</Label>
                                        <Input
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="e.g., Downtown Morning Collection"
                                            className="mt-2 h-12 bg-gray-50/50 border-gray-200 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500/20 transition-all rounded-xl text-gray-900 placeholder:text-gray-400"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-gray-700 font-medium text-sm">Description</Label>
                                        <Textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Optional description of the route and collection targets..."
                                            className="mt-2 bg-gray-50/50 border-gray-200 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500/20 transition-all resize-none rounded-xl min-h-[80px]"
                                            rows={2}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Stops Selection Card */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-50 bg-gradient-to-r from-gray-50 to-white">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 rounded-xl">
                                                <MapPin className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">Collection Stops</h3>
                                                <p className="text-sm text-gray-500">Select locations for waste collection</p>
                                            </div>
                                        </div>
                                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-0 font-semibold px-3 py-1">
                                            {stops.length} stops
                                        </Badge>
                                    </div>
                                </div>

                                {/* Tab Switcher */}
                                <div className="px-6 pt-5">
                                    <div className="inline-flex p-1 bg-gray-100 rounded-xl">
                                        <button
                                            onClick={() => setActiveTab('map')}
                                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'map'
                                                    ? 'bg-white text-emerald-700 shadow-sm'
                                                    : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                        >
                                            <Map className="h-4 w-4" />
                                            Interactive Map
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('list')}
                                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'list'
                                                    ? 'bg-white text-emerald-700 shadow-sm'
                                                    : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                        >
                                            <List className="h-4 w-4" />
                                            Quick Select
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6">
                                    {activeTab === 'map' && (
                                        <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-inner bg-gray-50">
                                            <MapboxRouteEditor
                                                stops={stops.map(s => ({
                                                    ...s,
                                                    latitude: s.latitude || 0,
                                                    longitude: s.longitude || 0,
                                                }))}
                                                onStopsChange={(newStops) => setStops(newStops)}
                                                showSampleLocations={true}
                                                height="450px"
                                            />
                                        </div>
                                    )}

                                    {activeTab === 'list' && (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {LOCATION_TYPES.map((type) => {
                                                const isSelected = selectedTypes.includes(type.id);
                                                return (
                                                    <button
                                                        key={type.id}
                                                        onClick={() => handleTypeToggle(type.id)}
                                                        className={`group p-4 rounded-xl border-2 text-sm font-medium transition-all text-left flex flex-col gap-3 hover:shadow-lg hover:-translate-y-0.5 ${isSelected
                                                                ? 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-800 shadow-md shadow-emerald-100'
                                                                : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200'
                                                            }`}
                                                    >
                                                        <span
                                                            className="w-11 h-11 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                                                            style={{
                                                                backgroundColor: isSelected ? type.color + '25' : '#f3f4f6',
                                                                color: type.color
                                                            }}
                                                        >
                                                            <MapPin className="w-5 h-5" />
                                                        </span>
                                                        <div className="flex items-center justify-between w-full">
                                                            <span className={isSelected ? 'font-semibold' : ''}>{type.label}</span>
                                                            {isSelected && (
                                                                <span className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-sm">
                                                                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                                                </span>
                                                            )}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Selected Stops List */}
                                    {stops.length > 0 && (
                                        <div className="mt-6 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-200 overflow-hidden">
                                            <div className="px-4 py-3 border-b border-gray-200/80 flex justify-between items-center bg-white/50">
                                                <Label className="text-gray-700 font-semibold flex items-center gap-2">
                                                    <Route className="h-4 w-4 text-emerald-600" />
                                                    Selected Stops Sequence
                                                </Label>
                                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                                                    Drag map markers to reorder
                                                </span>
                                            </div>
                                            <ScrollArea className="h-44 p-3">
                                                <div className="space-y-2">
                                                    {stops.map((stop, index) => (
                                                        <div
                                                            key={stop.id}
                                                            className="group flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all"
                                                        >
                                                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
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
                                                                className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all rounded-lg"
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
                        </div>
                    )}

                    {/* Step 2: Schedule Details */}
                    {step === 2 && (
                        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
                            {/* Timing & Frequency Card */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-50 bg-gradient-to-r from-gray-50 to-white">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-100 rounded-xl">
                                            <Clock className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Timing & Frequency</h3>
                                            <p className="text-sm text-gray-500">When should this collection happen?</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 space-y-5">
                                    <div>
                                        <Label className="text-gray-700 font-medium text-sm">Frequency *</Label>
                                        <Select value={scheduleType} onValueChange={(v) => setScheduleType(v as typeof scheduleType)}>
                                            <SelectTrigger className="mt-2 h-12 bg-gray-50/50 border-gray-200 focus:border-emerald-500 rounded-xl">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                <SelectItem value="one-time" className="rounded-lg">One-time Collection</SelectItem>
                                                <SelectItem value="weekly" className="rounded-lg">Weekly Recurring</SelectItem>
                                                <SelectItem value="bi-weekly" className="rounded-lg">Bi-weekly Recurring</SelectItem>
                                                <SelectItem value="monthly" className="rounded-lg">Monthly Recurring</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-gray-700 font-medium text-sm">Start Date *</Label>
                                            <Input
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                className="mt-2 h-12 bg-gray-50/50 border-gray-200 focus:border-emerald-500 rounded-xl"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-gray-700 font-medium text-sm">End Date</Label>
                                            <Input
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                className="mt-2 h-12 bg-gray-50/50 border-gray-200 focus:border-emerald-500 rounded-xl"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-gray-700 font-medium text-sm">Start Time *</Label>
                                            <Input
                                                type="time"
                                                value={startTime}
                                                onChange={(e) => setStartTime(e.target.value)}
                                                className="mt-2 h-12 bg-gray-50/50 border-gray-200 focus:border-emerald-500 rounded-xl"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-gray-700 font-medium text-sm">End Time *</Label>
                                            <Input
                                                type="time"
                                                value={endTime}
                                                onChange={(e) => setEndTime(e.target.value)}
                                                className="mt-2 h-12 bg-gray-50/50 border-gray-200 focus:border-emerald-500 rounded-xl"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Assignment Card */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-50 bg-gradient-to-r from-gray-50 to-white">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-orange-100 rounded-xl">
                                            <Users className="h-5 w-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Team Assignment</h3>
                                            <p className="text-sm text-gray-500">Assign collectors to this route</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <Label className="text-gray-700 font-medium text-sm">Primary Collector</Label>
                                            <Select value={collectorId} onValueChange={setCollectorId}>
                                                <SelectTrigger className="mt-2 h-12 bg-gray-50/50 border-gray-200 focus:border-emerald-500 rounded-xl">
                                                    <SelectValue placeholder="Select collector" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl">
                                                    <SelectItem value="unassigned" className="rounded-lg">Unassigned</SelectItem>
                                                    {collectors.map((c) => (
                                                        <SelectItem key={c.id} value={c.id} className="rounded-lg">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`w-2 h-2 rounded-full ${c.isOnDuty ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                                                                {c.full_name}
                                                                {c.averageRating > 0 && (
                                                                    <span className="flex items-center gap-0.5 text-xs text-amber-600">
                                                                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                                                        {c.averageRating.toFixed(1)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                Responsible for the main route
                                            </p>
                                        </div>
                                        <div>
                                            <Label className="text-gray-700 font-medium text-sm">Backup Collector</Label>
                                            <Select value={backupCollectorId} onValueChange={setBackupCollectorId}>
                                                <SelectTrigger className="mt-2 h-12 bg-gray-50/50 border-gray-200 focus:border-emerald-500 rounded-xl">
                                                    <SelectValue placeholder="Optional backup" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl">
                                                    <SelectItem value="none" className="rounded-lg">None</SelectItem>
                                                    {collectors.filter(c => c.id !== collectorId).map((c) => (
                                                        <SelectItem key={c.id} value={c.id} className="rounded-lg">
                                                            {c.full_name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                Optional backup assignment
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Review & Confirm */}
                    {step === 3 && (
                        <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
                            {/* Success Banner */}
                            <div className="relative bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500 rounded-2xl p-6 text-white overflow-hidden">
                                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImRvdHMiIHg9IjAiIHk9IjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNkb3RzKSIvPjwvc3ZnPg==')] opacity-30" />
                                <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                                <div className="relative flex items-start gap-4">
                                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                        <Sparkles className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-lg">Ready to Create Schedule</h4>
                                        <p className="text-emerald-100 text-sm mt-1">
                                            Review the details below. Once created, collectors will be notified of their new assignment.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Review Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Overview Card */}
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                    <h3 className="font-semibold text-gray-900 pb-4 border-b border-gray-100 flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-emerald-600" />
                                        Schedule Overview
                                    </h3>
                                    <div className="space-y-4 pt-4">
                                        <div>
                                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</span>
                                            <p className="text-gray-900 font-semibold mt-1">{name}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</span>
                                            <p className="text-gray-900 font-medium capitalize mt-1 flex items-center gap-2">
                                                <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-0">
                                                    {scheduleType.replace('-', ' ')}
                                                </Badge>
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</span>
                                                <p className="text-gray-900 font-medium mt-1">{startDate}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Time</span>
                                                <p className="text-gray-900 font-medium mt-1">{startTime} - {endTime}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Logistics Card */}
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                    <h3 className="font-semibold text-gray-900 pb-4 border-b border-gray-100 flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-blue-600" />
                                        Route Logistics
                                    </h3>
                                    <div className="space-y-4 pt-4">
                                        <div>
                                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Stops</span>
                                            <div className="flex items-baseline gap-2 mt-1">
                                                <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{stops.length}</span>
                                                <span className="text-gray-500 text-sm">locations</span>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Assigned Team</span>
                                            <div className="mt-2 space-y-2">
                                                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                                    <span className="text-gray-900 font-medium text-sm">
                                                        {collectors.find(c => c.id === collectorId)?.full_name || 'Unassigned'}
                                                    </span>
                                                    <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700 border-0 ml-auto">
                                                        Primary
                                                    </Badge>
                                                </div>
                                                {backupCollectorId && backupCollectorId !== 'none' && (
                                                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                                        <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                                                        <span className="text-gray-700 text-sm">
                                                            {collectors.find(c => c.id === backupCollectorId)?.full_name}
                                                        </span>
                                                        <Badge variant="secondary" className="text-xs bg-gray-200 text-gray-600 border-0 ml-auto">
                                                            Backup
                                                        </Badge>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Special Instructions */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                <Label className="text-gray-700 font-semibold mb-3 flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-amber-500" />
                                    Special Instructions
                                </Label>
                                <Textarea
                                    value={specialInstructions}
                                    onChange={(e) => setSpecialInstructions(e.target.value)}
                                    placeholder="Any final notes or instructions for the collection team..."
                                    className="bg-gray-50/50 border-gray-200 focus:border-emerald-500 rounded-xl min-h-[100px]"
                                    rows={3}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Modern Footer Actions */}
                <div className="bg-white/90 backdrop-blur-sm px-8 py-5 border-t border-gray-100 flex justify-between items-center">
                    <Button
                        variant="ghost"
                        onClick={() => step > 1 ? setStep(step - 1) : onClose()}
                        className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl h-11 px-5"
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        {step > 1 ? 'Back' : 'Cancel'}
                    </Button>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-400 font-medium">
                            Step {step} of 3
                        </span>
                        <Button
                            onClick={() => step < 3 ? setStep(step + 1) : handleSubmit()}
                            disabled={loading || (step === 1 && !canProceedToStep2) || (step === 2 && !canProceedToStep3)}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white min-w-[160px] h-11 rounded-xl shadow-lg shadow-emerald-200/50 transition-all hover:shadow-xl hover:shadow-emerald-200/60 disabled:opacity-50 disabled:shadow-none"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : step < 3 ? (
                                <>
                                    Next Step
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Create Schedule
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
