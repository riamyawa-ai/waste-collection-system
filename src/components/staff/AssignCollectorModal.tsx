"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getAvailableCollectors, assignCollector } from "@/lib/actions/staff";
import { Users, Loader2, Star, Truck, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface Collector {
    id: string;
    full_name: string;
    phone: string;
    isOnDuty: boolean;
    activeAssignments: number;
    completedToday: number;
    averageRating: number;
}

interface AssignCollectorModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    request: {
        id: string;
        request_number: string;
        barangay: string;
        preferred_date: string;
        preferred_time_slot: string;
    } | null;
}

export function AssignCollectorModal({
    open,
    onClose,
    onSuccess,
    request,
}: AssignCollectorModalProps) {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [collectors, setCollectors] = useState<Collector[]>([]);
    const [selectedCollector, setSelectedCollector] = useState<string>("");
    const [instructions, setInstructions] = useState("");

    const fetchCollectors = useCallback(async () => {
        setLoading(true);
        const result = await getAvailableCollectors();
        if (result.success && result.data) {
            setCollectors(result.data);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        if (open) {
            // Use void to handle the promise and avoid setState synchronously warning
            void fetchCollectors();
        }
    }, [open, fetchCollectors]);

    const handleSubmit = async () => {
        if (!request || !selectedCollector) {
            toast.error("Please select a collector");
            return;
        }

        setSubmitting(true);
        try {
            const result = await assignCollector(
                request.id,
                selectedCollector,
                instructions
            );

            if (result.success) {
                toast.success("Collector assigned successfully");
                onSuccess();
                onClose();
                resetForm();
            } else {
                toast.error(result.error || "Failed to assign collector");
            }
        } catch {
            toast.error("An error occurred");
        }
        setSubmitting(false);
    };

    const resetForm = () => {
        setSelectedCollector("");
        setInstructions("");
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    if (!request) return null;

    const onDutyCollectors = collectors.filter((c) => c.isOnDuty);
    const offDutyCollectors = collectors.filter((c) => !c.isOnDuty);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary-600" />
                        Assign Collector
                    </DialogTitle>
                    <DialogDescription>
                        Select a collector to handle this collection request.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                    {/* Request Summary */}
                    <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-100">
                        <div className="grid grid-cols-3 gap-3 text-sm">
                            <div>
                                <p className="text-neutral-500">Request #</p>
                                <p className="font-mono font-medium">{request.request_number}</p>
                            </div>
                            <div>
                                <p className="text-neutral-500">Location</p>
                                <p className="font-medium">{request.barangay}</p>
                            </div>
                            <div>
                                <p className="text-neutral-500">Schedule</p>
                                <p className="font-medium">
                                    {request.preferred_date
                                        ? new Date(request.preferred_date).toLocaleDateString()
                                        : "Flexible"}
                                </p>
                                <p className="text-xs text-neutral-500">
                                    {request.preferred_time_slot}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Collector Selection */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label>Select Collector *</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={fetchCollectors}
                            >
                                Refresh List
                            </Button>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                            </div>
                        ) : collectors.length === 0 ? (
                            <div className="text-center py-8 text-neutral-500">
                                <Users className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                                <p>No collectors available</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* On Duty Collectors */}
                                {onDutyCollectors.length > 0 && (
                                    <div>
                                        <p className="text-sm font-medium text-green-700 mb-2 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-green-500" />
                                            On Duty ({onDutyCollectors.length})
                                        </p>
                                        <RadioGroup
                                            value={selectedCollector}
                                            onValueChange={setSelectedCollector}
                                            className="space-y-2"
                                        >
                                            {onDutyCollectors.map((collector) => (
                                                <label
                                                    key={collector.id}
                                                    className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all ${selectedCollector === collector.id
                                                        ? "border-primary-500 bg-primary-50"
                                                        : "border-neutral-200 hover:border-primary-300"
                                                        }`}
                                                >
                                                    <RadioGroupItem value={collector.id} />
                                                    <Avatar className="w-10 h-10">
                                                        <AvatarFallback className="bg-primary-100 text-primary-700">
                                                            {getInitials(collector.full_name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <p className="font-medium text-neutral-900">
                                                            {collector.full_name}
                                                        </p>
                                                        <p className="text-xs text-neutral-500">
                                                            {collector.phone}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm">
                                                        <div className="flex items-center gap-1 text-yellow-600">
                                                            <Star className="w-4 h-4 fill-yellow-400" />
                                                            {collector.averageRating.toFixed(1)}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-blue-600">
                                                            <Truck className="w-4 h-4" />
                                                            {collector.activeAssignments} active
                                                        </div>
                                                        <div className="flex items-center gap-1 text-green-600">
                                                            <CheckCircle className="w-4 h-4" />
                                                            {collector.completedToday} today
                                                        </div>
                                                    </div>
                                                </label>
                                            ))}
                                        </RadioGroup>
                                    </div>
                                )}

                                {/* Off Duty Collectors */}
                                {offDutyCollectors.length > 0 && (
                                    <div>
                                        <p className="text-sm font-medium text-neutral-500 mb-2 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-neutral-400" />
                                            Off Duty ({offDutyCollectors.length})
                                        </p>
                                        <RadioGroup
                                            value={selectedCollector}
                                            onValueChange={setSelectedCollector}
                                            className="space-y-2"
                                        >
                                            {offDutyCollectors.map((collector) => (
                                                <label
                                                    key={collector.id}
                                                    className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all opacity-60 ${selectedCollector === collector.id
                                                        ? "border-primary-500 bg-primary-50"
                                                        : "border-neutral-200 hover:border-primary-300"
                                                        }`}
                                                >
                                                    <RadioGroupItem value={collector.id} />
                                                    <Avatar className="w-10 h-10">
                                                        <AvatarFallback className="bg-neutral-100 text-neutral-700">
                                                            {getInitials(collector.full_name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <p className="font-medium text-neutral-900">
                                                            {collector.full_name}
                                                        </p>
                                                        <p className="text-xs text-neutral-500">
                                                            {collector.phone}
                                                        </p>
                                                    </div>
                                                    <Badge variant="outline" className="bg-neutral-100">
                                                        Off Duty
                                                    </Badge>
                                                </label>
                                            ))}
                                        </RadioGroup>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Special Instructions */}
                    <div className="space-y-2">
                        <Label htmlFor="instructions">Special Instructions (Optional)</Label>
                        <Textarea
                            id="instructions"
                            placeholder="Any special instructions for the collector..."
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            rows={2}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2 border-t">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={submitting || !selectedCollector}
                        >
                            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Assign Collector
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
