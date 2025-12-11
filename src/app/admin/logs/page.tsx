'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getActivityLogs } from '@/lib/actions/admin';
import { format } from 'date-fns';
import { Activity, Search, Filter, User, Clock, FileText, CheckCircle2, XCircle, Settings } from 'lucide-react';

interface ActivityLog {
    id: string;
    user_id: string;
    action: string;
    entity_type: string;
    entity_id: string | null;
    details: Record<string, unknown> | null;
    ip_address: string | null;
    created_at: string;
}

export default function AdminLogsPage() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterAction, setFilterAction] = useState('all');
    const [filterEntity, setFilterEntity] = useState('all');

    useEffect(() => {
        const fetchLogs = async () => {
            setIsLoading(true);
            const result = await getActivityLogs({ limit: 100 });
            if (result.data) {
                setLogs(result.data as unknown as ActivityLog[]);
            }
            setIsLoading(false);
        };
        fetchLogs();
    }, []);

    const getActionIcon = (action: string) => {
        if (action.includes('create') || action.includes('insert')) return <CheckCircle2 className="h-4 w-4 text-green-500" />;
        if (action.includes('delete') || action.includes('remove')) return <XCircle className="h-4 w-4 text-red-500" />;
        if (action.includes('update') || action.includes('edit')) return <Settings className="h-4 w-4 text-blue-500" />;
        if (action.includes('login') || action.includes('auth')) return <User className="h-4 w-4 text-purple-500" />;
        return <Activity className="h-4 w-4 text-gray-500" />;
    };

    const getActionColor = (action: string) => {
        if (action.includes('create')) return 'bg-green-100 text-green-700';
        if (action.includes('delete')) return 'bg-red-100 text-red-700';
        if (action.includes('update')) return 'bg-blue-100 text-blue-700';
        if (action.includes('login')) return 'bg-purple-100 text-purple-700';
        return 'bg-gray-100 text-gray-700';
    };

    const filteredLogs = logs.filter(log => {
        if (searchQuery && !JSON.stringify(log).toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (filterAction !== 'all' && !log.action.includes(filterAction)) return false;
        if (filterEntity !== 'all' && log.entity_type !== filterEntity) return false;
        return true;
    });

    const uniqueActions = [...new Set(logs.map(l => l.action.split('_')[0]))];
    const uniqueEntities = [...new Set(logs.map(l => l.entity_type).filter(Boolean))];

    return (
        <div className="space-y-6 p-6">
            <PageHeader title="System Logs" description="View activity logs and audit trail" />

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input placeholder="Search logs..." className="pl-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                            </div>
                        </div>
                        <Select value={filterAction} onValueChange={setFilterAction}>
                            <SelectTrigger className="w-[150px]"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Action" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Actions</SelectItem>
                                {uniqueActions.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={filterEntity} onValueChange={setFilterEntity}>
                            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Entity" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Entities</SelectItem>
                                {uniqueEntities.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Logs Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-green-600" />
                        Activity Logs ({filteredLogs.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-12"><Clock className="h-12 w-12 mx-auto animate-spin text-green-600" /></div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No logs found</p>
                        </div>
                    ) : (
                        <ScrollArea className="h-[600px]">
                            <div className="space-y-2">
                                {filteredLogs.map(log => (
                                    <div key={log.id} className="flex items-start gap-4 p-4 rounded-lg border hover:bg-gray-50">
                                        <div className="mt-1">{getActionIcon(log.action)}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge className={getActionColor(log.action)}>{log.action}</Badge>
                                                {log.entity_type && <Badge variant="outline">{log.entity_type}</Badge>}
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                {log.entity_id && <span>ID: {log.entity_id.slice(0, 8)}...</span>}
                                                {log.details && <span className="ml-2">{JSON.stringify(log.details).slice(0, 100)}...</span>}
                                            </p>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                                <span className="flex items-center gap-1"><User className="h-3 w-3" />{log.user_id.slice(0, 8)}...</span>
                                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{format(new Date(log.created_at), 'MMM d, h:mm a')}</span>
                                                {log.ip_address && <span>IP: {log.ip_address}</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
