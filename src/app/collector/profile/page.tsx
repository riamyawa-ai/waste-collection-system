'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database.types';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { User, Phone, Mail, MapPin, Shield, Bell, Calendar, Clock, Star, Save, LogOut, CheckCircle2 } from 'lucide-react';

interface Profile {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    barangay: string | null;
    address: string | null;
    avatar_url: string | null;
}

interface AttendanceRecord {
    date: string;
    login_time: string;
    logout_time: string | null;
    total_duration: string | null;
}

export default function CollectorProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [stats, setStats] = useState({ completedToday: 0, completedWeek: 0, completedMonth: 0, avgRating: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [notifications, setNotifications] = useState({ push: true, email: true, sms: false });

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createBrowserClient<Database>(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch profile
            const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            if (profileData) setProfile(profileData as unknown as Profile);

            // Fetch attendance (last 30 days)
            const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');
            const { data: attendanceData } = await supabase
                .from('collector_attendance')
                .select('*')
                .eq('collector_id', user.id)
                .gte('date', monthStart)
                .order('date', { ascending: false });
            if (attendanceData) setAttendance(attendanceData as unknown as AttendanceRecord[]);

            // Fetch performance stats
            const { data: requests } = await supabase
                .from('collection_requests')
                .select('status, completed_at')
                .eq('assigned_collector_id', user.id)
                .eq('status', 'completed');

            const today = new Date().toISOString().split('T')[0];
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            if (requests) {
                setStats({
                    completedToday: requests.filter(r => r.completed_at?.startsWith(today)).length,
                    completedWeek: requests.filter(r => r.completed_at && r.completed_at >= weekAgo).length,
                    completedMonth: requests.filter(r => r.completed_at && r.completed_at >= monthAgo).length,
                    avgRating: 0,
                });
            }

            // Fetch average rating
            const { data: feedback } = await supabase.from('feedback').select('overall_rating').eq('collector_id', user.id);
            if (feedback && feedback.length > 0) {
                const avg = feedback.reduce((sum, f) => sum + f.overall_rating, 0) / feedback.length;
                setStats(s => ({ ...s, avgRating: Math.round(avg * 10) / 10 }));
            }

            setIsLoading(false);
        };

        fetchData();
    }, []);

    const handleSaveProfile = async () => {
        if (!profile) return;
        setIsSaving(true);

        const supabase = createBrowserClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { error } = await supabase
            .from('profiles')
            .update({ first_name: profile.first_name, last_name: profile.last_name, phone: profile.phone })
            .eq('id', profile.id);

        if (error) toast.error('Failed to save profile');
        else toast.success('Profile saved successfully');
        setIsSaving(false);
    };

    const attendanceDays = attendance.length;
    const attendancePercentage = Math.round((attendanceDays / 22) * 100); // ~22 working days/month

    if (isLoading) return <div className="p-6"><PageHeader title="My Profile" /><div className="animate-pulse">Loading...</div></div>;

    return (
        <div className="space-y-6 p-6">
            <PageHeader title="My Profile" description="Manage your profile and settings" />

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Profile Card */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <Avatar className="w-24 h-24 mx-auto mb-4">
                                <AvatarImage src={profile?.avatar_url || ''} />
                                <AvatarFallback className="bg-green-100 text-green-700 text-2xl">
                                    {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                                </AvatarFallback>
                            </Avatar>
                            <h2 className="text-xl font-bold">{profile?.first_name} {profile?.last_name}</h2>
                            <p className="text-gray-500">Collector</p>
                            <div className="flex items-center justify-center gap-1 mt-2">
                                {[1, 2, 3, 4, 5].map(s => <Star key={s} className={`h-4 w-4 ${s <= Math.round(stats.avgRating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />)}
                                <span className="ml-1 text-sm text-gray-600">{stats.avgRating.toFixed(1)}</span>
                            </div>
                        </div>
                        <Separator className="my-4" />
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-gray-400" />{profile?.email}</div>
                            <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-gray-400" />{profile?.phone || 'Not set'}</div>
                            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gray-400" />{profile?.barangay || 'Not set'}</div>
                        </div>
                    </CardContent>
                </Card>

                {/* Performance & Attendance */}
                <Card className="lg:col-span-2">
                    <CardHeader><CardTitle>Performance Dashboard</CardTitle></CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4 mb-6">
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <p className="text-3xl font-bold text-green-600">{stats.completedToday}</p>
                                <p className="text-xs text-green-700">Today</p>
                            </div>
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <p className="text-3xl font-bold text-blue-600">{stats.completedWeek}</p>
                                <p className="text-xs text-blue-700">This Week</p>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <p className="text-3xl font-bold text-purple-600">{stats.completedMonth}</p>
                                <p className="text-xs text-purple-700">This Month</p>
                            </div>
                            <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                <p className="text-3xl font-bold text-yellow-600">{stats.avgRating.toFixed(1)}</p>
                                <p className="text-xs text-yellow-700">Avg Rating</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-medium flex items-center gap-2"><Calendar className="h-4 w-4" />Attendance This Month</h4>
                            <div className="flex items-center gap-4">
                                <Progress value={attendancePercentage} className="flex-1" />
                                <span className="text-sm font-medium">{attendanceDays} days ({attendancePercentage}%)</span>
                            </div>
                            <div className="grid grid-cols-7 gap-1 mt-4">
                                {Array.from({ length: 31 }, (_, i) => {
                                    const day = i + 1;
                                    const hasAttendance = attendance.some(a => new Date(a.date).getDate() === day);
                                    return (
                                        <div key={day} className={`h-8 rounded flex items-center justify-center text-xs ${hasAttendance ? 'bg-green-500 text-white' : 'bg-gray-100'}`}>
                                            {day}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="personal">
                <TabsList><TabsTrigger value="personal">Personal Info</TabsTrigger><TabsTrigger value="security">Security</TabsTrigger><TabsTrigger value="notifications">Notifications</TabsTrigger></TabsList>

                <TabsContent value="personal" className="mt-4">
                    <Card>
                        <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div><Label>First Name</Label><Input value={profile?.first_name || ''} onChange={e => setProfile(p => p ? { ...p, first_name: e.target.value } : null)} /></div>
                                <div><Label>Last Name</Label><Input value={profile?.last_name || ''} onChange={e => setProfile(p => p ? { ...p, last_name: e.target.value } : null)} /></div>
                                <div><Label>Phone Number</Label><Input value={profile?.phone || ''} onChange={e => setProfile(p => p ? { ...p, phone: e.target.value } : null)} /></div>
                                <div><Label>Email</Label><Input value={profile?.email || ''} disabled /></div>
                            </div>
                            <Button onClick={handleSaveProfile} disabled={isSaving} className="bg-green-600 hover:bg-green-700"><Save className="h-4 w-4 mr-2" />{isSaving ? 'Saving...' : 'Save Changes'}</Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security" className="mt-4">
                    <Card>
                        <CardHeader><CardTitle>Account Security</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <Button variant="outline"><Shield className="h-4 w-4 mr-2" />Change Password</Button>
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div><Label>Two-Factor Authentication</Label><p className="text-sm text-gray-500">Add extra security to your account</p></div>
                                <Switch />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications" className="mt-4">
                    <Card>
                        <CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 border rounded"><div><Label>Push Notifications</Label></div><Switch checked={notifications.push} onCheckedChange={v => setNotifications(n => ({ ...n, push: v }))} /></div>
                            <div className="flex items-center justify-between p-4 border rounded"><div><Label>Email Notifications</Label></div><Switch checked={notifications.email} onCheckedChange={v => setNotifications(n => ({ ...n, email: v }))} /></div>
                            <div className="flex items-center justify-between p-4 border rounded"><div><Label>SMS Notifications</Label></div><Switch checked={notifications.sms} onCheckedChange={v => setNotifications(n => ({ ...n, sms: v }))} /></div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
