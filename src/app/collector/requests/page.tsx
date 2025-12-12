'use client';

import { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { acceptRequest, declineRequest, updateRequestStatus, completeRequest, getAssignedRequests } from '@/lib/actions/collector';
import { ClipboardList, Clock, CheckCircle2, XCircle, MapPin, Phone, User, Calendar, Navigation, AlertCircle, Truck } from 'lucide-react';
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_COLORS, PRIORITY_LABELS } from '@/constants/status';

interface Request {
    id: string;
    request_number: string;
    status: string;
    priority: string;
    barangay: string;
    address: string;
    preferred_date: string;
    preferred_time_slot: string;
    special_instructions: string | null;
    requester_name: string;
    contact_number: string;
    client: { full_name: string; phone: string } | null;
}

const DECLINE_REASONS = [
    { value: 'capacity', label: 'Already at capacity' },
    { value: 'outside_area', label: 'Outside service area' },
    { value: 'schedule_conflict', label: 'Schedule conflict' },
    { value: 'vehicle_issue', label: 'Vehicle/equipment issue' },
    { value: 'other', label: 'Other' },
];

export default function CollectorRequestsPage() {
    const [requests, setRequests] = useState<Request[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
    const [showDeclineDialog, setShowDeclineDialog] = useState(false);
    const [showCompleteDialog, setShowCompleteDialog] = useState(false);
    const [declineReason, setDeclineReason] = useState('');
    const [declineOtherReason, setDeclineOtherReason] = useState('');
    const [completionNotes, setCompletionNotes] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchRequests = useCallback(async () => {
        // Fetch all requests including completed ones
        const result = await getAssignedRequests({ limit: 100, status: 'all' });
        if (result.data) setRequests(result.data as unknown as Request[]);
    }, []);

    useEffect(() => {
        let isMounted = true;
        const loadData = async () => {
            setIsLoading(true);
            await fetchRequests();
            if (isMounted) setIsLoading(false);
        };
        loadData();
        return () => { isMounted = false; };
    }, [fetchRequests]);

    const handleAccept = async (request: Request) => {
        setIsProcessing(true);
        const result = await acceptRequest(request.id);
        if (result.error) toast.error(result.error);
        else { toast.success('Request accepted!'); fetchRequests(); }
        setIsProcessing(false);
    };

    const handleDecline = async () => {
        if (!selectedRequest) return;
        const reason = declineReason === 'other' ? declineOtherReason : DECLINE_REASONS.find(r => r.value === declineReason)?.label || declineReason;
        if (!reason) { toast.error('Please provide a reason'); return; }
        setIsProcessing(true);
        const result = await declineRequest(selectedRequest.id, reason);
        if (result.error) toast.error(result.error);
        else { toast.success('Request declined'); setShowDeclineDialog(false); fetchRequests(); }
        setIsProcessing(false);
    };

    const handleStatusUpdate = async (request: Request, newStatus: 'en_route' | 'at_location' | 'in_progress') => {
        setIsProcessing(true);
        const result = await updateRequestStatus(request.id, newStatus);
        if (result.error) toast.error(result.error);
        else { toast.success('Status updated'); fetchRequests(); }
        setIsProcessing(false);
    };

    const handleComplete = async () => {
        if (!selectedRequest) return;
        setIsProcessing(true);
        const result = await completeRequest(selectedRequest.id, completionNotes);
        if (result.error) toast.error(result.error);
        else { toast.success('Collection completed!'); setShowCompleteDialog(false); fetchRequests(); }
        setIsProcessing(false);
    };

    const getStatusBadge = (status: string) => {
        const colors = STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.pending;
        return <Badge className={`${colors.bg} ${colors.text}`}>{STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status}</Badge>;
    };

    const getPriorityBadge = (priority: string) => {
        const colors = PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.low;
        return <Badge variant="outline" className={`${colors.bg} ${colors.text}`}>{PRIORITY_LABELS[priority as keyof typeof PRIORITY_LABELS] || priority}</Badge>;
    };

    const getActionButtons = (req: Request) => {
        switch (req.status) {
            case 'assigned':
                return (<div className="flex gap-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleAccept(req)} disabled={isProcessing}><CheckCircle2 className="h-4 w-4 mr-1" />Accept</Button>
                    <Button size="sm" variant="destructive" onClick={() => { setSelectedRequest(req); setShowDeclineDialog(true); }} disabled={isProcessing}><XCircle className="h-4 w-4 mr-1" />Decline</Button>
                </div>);
            case 'accepted_by_collector':
                return <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => handleStatusUpdate(req, 'en_route')} disabled={isProcessing}><Navigation className="h-4 w-4 mr-1" />Start</Button>;
            case 'en_route':
                return <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => handleStatusUpdate(req, 'at_location')} disabled={isProcessing}><MapPin className="h-4 w-4 mr-1" />Arrived</Button>;
            case 'at_location':
                return <Button size="sm" className="bg-orange-600 hover:bg-orange-700" onClick={() => handleStatusUpdate(req, 'in_progress')} disabled={isProcessing}>Start Collection</Button>;
            case 'in_progress':
                return <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => { setSelectedRequest(req); setShowCompleteDialog(true); }} disabled={isProcessing}><CheckCircle2 className="h-4 w-4 mr-1" />Complete</Button>;
            default: return null;
        }
    };

    const filteredRequests = (() => {
        if (activeTab === 'all') return requests;
        if (activeTab === 'in_progress') {
            return requests.filter(r => ['en_route', 'at_location', 'in_progress', 'accepted_by_collector'].includes(r.status));
        }
        return requests.filter(r => r.status === activeTab);
    })();

    return (
        <div className="space-y-6 p-6">
            <PageHeader title="My Requests" description="Manage your assigned pickup requests" />

            <div className="grid gap-4 md:grid-cols-4">
                <Card className="border-yellow-200 bg-yellow-50"><CardContent className="pt-6 flex items-center gap-3"><AlertCircle className="h-8 w-8 text-yellow-600" /><div><p className="text-2xl font-bold">{requests.filter(r => r.status === 'assigned').length}</p><p className="text-sm text-yellow-700">Pending</p></div></CardContent></Card>
                <Card className="border-blue-200 bg-blue-50"><CardContent className="pt-6 flex items-center gap-3"><CheckCircle2 className="h-8 w-8 text-blue-600" /><div><p className="text-2xl font-bold">{requests.filter(r => r.status === 'accepted_by_collector').length}</p><p className="text-sm text-blue-700">Accepted</p></div></CardContent></Card>
                <Card className="border-orange-200 bg-orange-50"><CardContent className="pt-6 flex items-center gap-3"><Truck className="h-8 w-8 text-orange-600" /><div><p className="text-2xl font-bold">{requests.filter(r => ['en_route', 'at_location', 'in_progress'].includes(r.status)).length}</p><p className="text-sm text-orange-700">In Progress</p></div></CardContent></Card>
                <Card className="border-green-200 bg-green-50"><CardContent className="pt-6 flex items-center gap-3"><CheckCircle2 className="h-8 w-8 text-green-600" /><div><p className="text-2xl font-bold">{requests.filter(r => r.status === 'completed').length}</p><p className="text-sm text-green-700">Completed</p></div></CardContent></Card>
            </div>

            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5 text-green-600" />Assigned Requests</CardTitle></CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="mb-4">
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="assigned">Pending</TabsTrigger>
                            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                            <TabsTrigger value="completed">Completed</TabsTrigger>
                        </TabsList>
                        <TabsContent value={activeTab}>
                            {isLoading ? <div className="text-center py-12"><Clock className="h-12 w-12 mx-auto animate-spin text-green-600" /></div> :
                                filteredRequests.length === 0 ? <div className="text-center py-12 text-gray-500"><ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No requests found</p></div> :
                                    <ScrollArea className="h-[500px]"><div className="space-y-4">
                                        {filteredRequests.map((req) => (
                                            <div key={req.id} className="p-4 rounded-lg border bg-white hover:shadow-md transition-shadow">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2"><span className="font-bold">{req.request_number}</span>{getStatusBadge(req.status)}{getPriorityBadge(req.priority)}</div>
                                                        <div className="text-sm space-y-1">
                                                            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gray-400" /><span>{req.barangay} - {req.address}</span></div>
                                                            <div className="flex items-center gap-4">
                                                                <span className="flex items-center gap-1"><User className="h-4 w-4 text-gray-400" />{req.requester_name}</span>
                                                                <a href={`tel:${req.contact_number}`} className="flex items-center gap-1 text-green-600"><Phone className="h-4 w-4" />{req.contact_number}</a>
                                                            </div>
                                                            <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-gray-400" />{req.preferred_date} • {req.preferred_time_slot}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">{getActionButtons(req)}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div></ScrollArea>}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <Dialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Decline Request</DialogTitle><DialogDescription>Select a reason for declining.</DialogDescription></DialogHeader>
                    <RadioGroup value={declineReason} onValueChange={setDeclineReason}>{DECLINE_REASONS.map((r) => (<div key={r.value} className="flex items-center space-x-2"><RadioGroupItem value={r.value} id={r.value} /><Label htmlFor={r.value}>{r.label}</Label></div>))}</RadioGroup>
                    {declineReason === 'other' && <Textarea value={declineOtherReason} onChange={(e) => setDeclineOtherReason(e.target.value)} placeholder="Specify reason..." />}
                    <DialogFooter><Button variant="outline" onClick={() => setShowDeclineDialog(false)}>Cancel</Button><Button variant="destructive" onClick={handleDecline} disabled={isProcessing}>Decline</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Complete Collection</DialogTitle><DialogDescription>Mark this collection as complete.</DialogDescription></DialogHeader>
                    <Label>Notes (Optional)</Label><Textarea value={completionNotes} onChange={(e) => setCompletionNotes(e.target.value)} placeholder="Any notes..." rows={3} />
                    <DialogFooter><Button variant="outline" onClick={() => setShowCompleteDialog(false)}>Cancel</Button><Button className="bg-green-600 hover:bg-green-700" onClick={handleComplete} disabled={isProcessing}>Complete</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
