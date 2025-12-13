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
    Sparkles,
    FileText,
    AlertCircle,
    Loader2,
    Star,
    LayoutGrid,
    Navigation,
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
        if (selectedTypes.length > 0 && !selectedTypes.includes('all')) {
            const filtered = SAMPLE_LOCATIONS.filter(loc => selectedTypes.includes(loc.type));
            // Add unique stops from selection
            const manualStops = filtered.map((loc) => ({
                id: loc.id,
                locationName: loc.name,
                locationType: loc.type,
                address: loc.address,
                barangay: loc.barangay,
                latitude: loc.lat,
                longitude: loc.lng,
            }));
            setStops(manualStops);
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
                collectorId: (collectorId && collectorId !== 'unassigned') ? collectorId : undefined,
                backupCollectorId: (backupCollectorId && backupCollectorId !== 'none') ? backupCollectorId : undefined,
                specialInstructions,
                stops: stops.map((stop, index) => ({
                    locationName: stop.locationName,
                    locationType: stop.locationType,
                    address: stop.address,
                    barangay: stop.barangay,
                    latitude: stop.latitude || 0,
                    longitude: stop.longitude || 0,
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
            <DialogContent className="max-w-[95vw] w-full h-[90vh] p-0 gap-0 bg-white overflow-hidden flex flex-col shadow-2xl">
                {/* Header */}
                <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-white z-10 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <Route className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold text-gray-900">Create Collection Schedule</DialogTitle>
                            <p className="text-sm text-gray-500">Design a route and assign collectors</p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex flex-1 min-h-0 overflow-hidden flex-col lg:flex-row">
                    {/* Left Sidebar - Form Controls */}
                    <div className="w-full lg:w-[450px] border-r border-gray-200 bg-gray-50/50 flex flex-col min-h-0 lg:h-full flex-shrink-0 z-10 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] max-h-[300px] lg:max-h-none overflow-hidden">
                        <ScrollArea className="flex-1">
                            <div className="p-6 space-y-8">
                                {/* Basic Info Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm uppercase tracking-wider">
                                        <FileText className="h-4 w-4 text-emerald-600" />
                                        Route Details
                                    </div>
                                    <div className="space-y-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                        <div>
                                            <Label className="text-xs font-medium text-gray-500 mb-1.5 block">Schedule Name *</Label>
                                            <Input
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="e.g. Downtown Sector A"
                                                className="h-10 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs font-medium text-gray-500 mb-1.5 block">Description</Label>
                                            <Textarea
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                placeholder="Brief description..."
                                                className="resize-none min-h-[60px] border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs font-medium text-gray-500 mb-1.5 block">Type</Label>
                                            <Select value={scheduleType} onValueChange={(v) => setScheduleType(v as typeof scheduleType)}>
                                                <SelectTrigger className="h-10 border-gray-200">
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
                                    </div>
                                </div>

                                {/* Timing Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm uppercase tracking-wider">
                                        <Clock className="h-4 w-4 text-purple-600" />
                                        Timing
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <Label className="text-xs font-medium text-gray-500 mb-1.5 block">Start Date *</Label>
                                                <Input
                                                    type="date"
                                                    value={startDate}
                                                    onChange={(e) => setStartDate(e.target.value)}
                                                    className="h-9 border-gray-200 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs font-medium text-gray-500 mb-1.5 block">End Date</Label>
                                                <Input
                                                    type="date"
                                                    value={endDate}
                                                    onChange={(e) => setEndDate(e.target.value)}
                                                    className="h-9 border-gray-200 text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <Label className="text-xs font-medium text-gray-500 mb-1.5 block">Start Time</Label>
                                                <Input
                                                    type="time"
                                                    value={startTime}
                                                    onChange={(e) => setStartTime(e.target.value)}
                                                    className="h-9 border-gray-200 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs font-medium text-gray-500 mb-1.5 block">End Time</Label>
                                                <Input
                                                    type="time"
                                                    value={endTime}
                                                    onChange={(e) => setEndTime(e.target.value)}
                                                    className="h-9 border-gray-200 text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Stops Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm uppercase tracking-wider">
                                            <MapPin className="h-4 w-4 text-blue-600" />
                                            Stops ({stops.length})
                                        </div>
                                        <Badge variant="outline" className="bg-white">
                                            {stops.length > 0 ? `${stops.length} Selected` : 'None'}
                                        </Badge>
                                    </div>

                                    {/* Quick Select Types */}
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
                                        <Label className="text-xs font-medium text-gray-500 block">Quick Filters</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {LOCATION_TYPES.map((type) => {
                                                const isSelected = selectedTypes.includes(type.id);
                                                return (
                                                    <button
                                                        key={type.id}
                                                        onClick={() => handleTypeToggle(type.id)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border flex items-center gap-1.5 ${isSelected
                                                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                                            }`}
                                                    >
                                                        <span
                                                            className="w-2 h-2 rounded-full"
                                                            style={{ backgroundColor: type.color }}
                                                        />
                                                        {type.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Stops List */}
                                    {stops.length > 0 && (
                                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                            <div className="max-h-[200px] overflow-y-auto p-2 space-y-1">
                                                {stops.map((stop, index) => (
                                                    <div key={stop.id} className="group flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">
                                                            {index + 1}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">{stop.locationName}</p>
                                                            <p className="text-xs text-gray-500 truncate">{stop.barangay}</p>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeStop(stop.id)}
                                                            className="h-7 w-7 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Assignment Section */}
                                <div className="space-y-4 pb-4">
                                    <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm uppercase tracking-wider">
                                        <Users className="h-4 w-4 text-orange-600" />
                                        Assignment
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
                                        <div>
                                            <Label className="text-xs font-medium text-gray-500 mb-1.5 block">Primary Collector</Label>
                                            <Select value={collectorId} onValueChange={setCollectorId}>
                                                <SelectTrigger className="h-10 border-gray-200">
                                                    <SelectValue placeholder="Select collector" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="unassigned">Unassigned</SelectItem>
                                                    {collectors.map(c => (
                                                        <SelectItem
                                                            key={c.id}
                                                            value={c.id}
                                                            disabled={!c.isOnDuty}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <span className={`w-2 h-2 rounded-full ${c.isOnDuty ? 'bg-green-500' : 'bg-gray-300'}`} />
                                                                <span className={!c.isOnDuty ? 'text-gray-400' : ''}>
                                                                    {c.full_name}
                                                                </span>
                                                                {!c.isOnDuty && <span className="text-xs text-gray-400 ml-1">(Not clocked in)</span>}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label className="text-xs font-medium text-gray-500 mb-1.5 block">Backup (Optional)</Label>
                                            <Select value={backupCollectorId} onValueChange={setBackupCollectorId}>
                                                <SelectTrigger className="h-10 border-gray-200">
                                                    <SelectValue placeholder="No backup" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">None</SelectItem>
                                                    {collectors.filter(c => c.id !== collectorId).map(c => (
                                                        <SelectItem
                                                            key={c.id}
                                                            value={c.id}
                                                            disabled={!c.isOnDuty}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <span className={`w-2 h-2 rounded-full ${c.isOnDuty ? 'bg-green-500' : 'bg-gray-300'}`} />
                                                                <span className={!c.isOnDuty ? 'text-gray-400' : ''}>
                                                                    {c.full_name}
                                                                </span>
                                                                {!c.isOnDuty && <span className="text-xs text-gray-400 ml-1">(Not clocked in)</span>}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label className="text-xs font-medium text-gray-500 mb-1.5 block flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                Special Instructions
                                            </Label>
                                            <Textarea
                                                value={specialInstructions}
                                                onChange={(e) => setSpecialInstructions(e.target.value)}
                                                placeholder="Instructions for the team..."
                                                className="resize-none h-20 border-gray-200 text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>

                        {/* Footer Actions */}
                        <div className="p-4 border-t border-gray-200 bg-white space-y-3">
                            <Button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11 font-medium shadow-lg shadow-emerald-200/50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-4 w-4 mr-2" />
                                        Create Schedule
                                    </>
                                )}
                            </Button>
                            <Button variant="ghost" onClick={onClose} className="w-full text-gray-500 h-9 text-sm">Cancel</Button>
                        </div>
                    </div>

                    {/* Right Side - Interactive Map */}
                    <div className="hidden lg:block flex-1 relative bg-emerald-50 min-h-0">
                        <MapboxRouteEditor
                            stops={stops.map(s => ({
                                id: s.id,
                                locationName: s.locationName,
                                locationType: s.locationType,
                                address: s.address,
                                barangay: s.barangay,
                                latitude: s.latitude || 0,
                                longitude: s.longitude || 0,
                            }))}
                            onStopsChange={(newStops) => {
                                // Map back to full Stop objects
                                const updatedStops: Stop[] = newStops.map(ns => ({
                                    id: ns.id,
                                    locationName: ns.locationName,
                                    locationType: ns.locationType,
                                    address: ns.address,
                                    barangay: ns.barangay,
                                    latitude: ns.latitude,
                                    longitude: ns.longitude
                                }));
                                setStops(updatedStops);
                            }}
                            showSampleLocations={true}
                            height="calc(90vh - 80px)"
                        />

                        {/* Map Overlay Instructions */}
                        <div className="absolute top-16 left-4 z-10 pointer-events-none">
                            <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-gray-200 shadow-sm inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                                <Navigation className="h-4 w-4 text-emerald-600" />
                                Click on map or markers to add route stops
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
