'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database.types';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { Bell, AlertTriangle, Info, Wrench, Calendar, CheckCircle2 } from 'lucide-react';
import { ANNOUNCEMENT_TYPE_COLORS } from '@/constants/status';

interface Announcement {
    id: string;
    title: string;
    content: string;
    type: string;
    priority: string;
    publish_date: string;
    expiry_date: string | null;
    image_url: string | null;
    is_priority: boolean;
}

export default function CollectorAnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [readIds, setReadIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            const supabase = createBrowserClient<Database>(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            const { data } = await supabase
                .from('announcements')
                .select('*')
                .eq('is_published', true)
                .or('target_audience.cs.{all},target_audience.cs.{collector}')
                .lte('publish_date', new Date().toISOString())
                .order('is_priority', { ascending: false })
                .order('publish_date', { ascending: false });

            if (data) {
                setAnnouncements(data.filter(a => !a.expiry_date || new Date(a.expiry_date) > new Date()) as unknown as Announcement[]);
            }
            setIsLoading(false);
        };

        fetchAnnouncements();
    }, []);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
            case 'maintenance': return <Wrench className="h-5 w-5 text-orange-600" />;
            case 'event': return <Calendar className="h-5 w-5 text-purple-600" />;
            case 'success': return <CheckCircle2 className="h-5 w-5 text-green-600" />;
            default: return <Info className="h-5 w-5 text-blue-600" />;
        }
    };

    const toggleRead = (id: string) => {
        setReadIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const unreadCount = announcements.filter(a => !readIds.has(a.id)).length;

    return (
        <div className="space-y-6 p-6">
            <PageHeader
                title="Announcements"
                description="Important notices and updates"
            />

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="pt-6 flex items-center gap-3">
                        <Bell className="h-8 w-8 text-blue-600" />
                        <div>
                            <p className="text-2xl font-bold">{announcements.length}</p>
                            <p className="text-sm text-gray-500">Total Announcements</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 flex items-center gap-3">
                        <AlertTriangle className="h-8 w-8 text-yellow-600" />
                        <div>
                            <p className="text-2xl font-bold">{unreadCount}</p>
                            <p className="text-sm text-gray-500">Unread</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 flex items-center gap-3">
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                        <div>
                            <p className="text-2xl font-bold">{readIds.size}</p>
                            <p className="text-sm text-gray-500">Acknowledged</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Priority Announcements */}
            {announcements.filter(a => a.is_priority).length > 0 && (
                <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-700">
                            <AlertTriangle className="h-5 w-5" />
                            Priority Announcements
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {announcements.filter(a => a.is_priority).map(announcement => (
                            <div key={announcement.id} className="p-4 rounded-lg bg-white border border-red-200">
                                <div className="flex items-start gap-3">
                                    {getTypeIcon(announcement.type)}
                                    <div className="flex-1">
                                        <h4 className="font-bold text-red-900">{announcement.title}</h4>
                                        <p className="text-sm text-red-700 mt-1">{announcement.content}</p>
                                        <p className="text-xs text-red-500 mt-2">{format(new Date(announcement.publish_date), 'MMM d, yyyy h:mm a')}</p>
                                    </div>
                                    <Checkbox checked={readIds.has(announcement.id)} onCheckedChange={() => toggleRead(announcement.id)} />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* All Announcements */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-green-600" />
                        All Announcements
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-12">Loading...</div>
                    ) : announcements.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No announcements</p>
                        </div>
                    ) : (
                        <ScrollArea className="h-[500px]">
                            <div className="space-y-4">
                                {announcements.filter(a => !a.is_priority).map(announcement => {
                                    const typeColors = ANNOUNCEMENT_TYPE_COLORS[announcement.type as keyof typeof ANNOUNCEMENT_TYPE_COLORS] || ANNOUNCEMENT_TYPE_COLORS.info;
                                    const isRead = readIds.has(announcement.id);

                                    return (
                                        <div key={announcement.id} className={`p-4 rounded-lg border transition-colors ${isRead ? 'bg-gray-50 opacity-75' : 'bg-white'}`}>
                                            <div className="flex items-start gap-3">
                                                {getTypeIcon(announcement.type)}
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-medium">{announcement.title}</h4>
                                                        <Badge className={`${typeColors.bg} ${typeColors.text}`}>{announcement.type}</Badge>
                                                    </div>
                                                    <p className="text-sm text-gray-600">{announcement.content}</p>
                                                    <p className="text-xs text-gray-400 mt-2">{format(new Date(announcement.publish_date), 'MMM d, yyyy')}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-500">{isRead ? 'Read' : 'Mark as read'}</span>
                                                    <Checkbox checked={isRead} onCheckedChange={() => toggleRead(announcement.id)} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
