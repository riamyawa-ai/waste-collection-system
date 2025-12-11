'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Lock,
    Shield,
    Bell,
    Camera,
    Save,
    Eye,
    EyeOff,
    Calendar,
    FileText,
    RefreshCw,
    Users,
    Activity,
    Clock,
    CheckCircle2,
    Settings,
    Building2,
    Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PasswordStrengthMeter as PasswordStrength } from '@/components/ui/password-strength';
import { cn } from '@/lib/utils';
import {
    getProfile,
    updateProfile,
    changePassword,
} from '@/lib/actions/profile';
import { format } from 'date-fns';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database.types';

interface Profile {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    barangay: string;
    avatar_url: string | null;
    created_at: string;
    role: string;
    status: string;
}

interface AdminStats {
    totalUsers: number;
    totalRequests: number;
    totalCollectors: number;
    totalStaff: number;
    actionsThisMonth: number;
}

export default function AdminProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [editedProfile, setEditedProfile] = useState<Partial<Profile>>({});

    // Password state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const supabase = createBrowserClient<Database>(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            const profileResult = await getProfile();
            if (profileResult.success && profileResult.data) {
                setProfile(profileResult.data as Profile);
                setEditedProfile(profileResult.data as Profile);
            }

            // Fetch admin-specific stats
            const [usersResult, requestsResult, collectorsResult, staffResult] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('collection_requests').select('*', { count: 'exact', head: true }),
                supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'collector'),
                supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'staff'),
            ]);

            setStats({
                totalUsers: usersResult.count || 0,
                totalRequests: requestsResult.count || 0,
                totalCollectors: collectorsResult.count || 0,
                totalStaff: staffResult.count || 0,
                actionsThisMonth: 0,
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSaveProfile = async () => {
        setIsSaving(true);
        setSaveMessage(null);
        try {
            const result = await updateProfile({
                first_name: editedProfile.first_name,
                last_name: editedProfile.last_name,
                phone: editedProfile.phone,
                address: editedProfile.address,
                barangay: editedProfile.barangay,
            });

            if (result.success) {
                setSaveMessage({ type: 'success', text: 'Profile updated successfully!' });
                setIsEditingProfile(false);
                fetchData();
            } else {
                setSaveMessage({ type: 'error', text: result.error || 'Failed to update profile' });
            }
        } catch {
            setSaveMessage({ type: 'error', text: 'An unexpected error occurred' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'Passwords do not match!' });
            return;
        }
        setIsChangingPassword(true);
        setPasswordMessage(null);
        try {
            const result = await changePassword({
                currentPassword,
                newPassword,
            });

            if (result.success) {
                setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setPasswordMessage({ type: 'error', text: result.error || 'Failed to change password' });
            }
        } catch {
            setPasswordMessage({ type: 'error', text: 'An unexpected error occurred' });
        } finally {
            setIsChangingPassword(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <p className="text-neutral-500">Unable to load profile</p>
                <Button onClick={fetchData} className="mt-4">
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Profile Header */}
            <div className="relative">
                {/* Cover Image */}
                <div className="h-32 md:h-48 bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 rounded-xl" />

                {/* Profile Info */}
                <div className="relative -mt-16 ml-6 flex flex-col md:flex-row md:items-end gap-4">
                    <div className="relative">
                        <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                            <AvatarImage src={profile.avatar_url || undefined} />
                            <AvatarFallback className="bg-green-600 text-white text-3xl font-bold">
                                {profile.first_name?.[0]}{profile.last_name?.[0]}
                            </AvatarFallback>
                        </Avatar>
                        <button className="absolute bottom-2 right-2 h-10 w-10 rounded-full bg-white shadow-md text-green-600 flex items-center justify-center hover:bg-green-50 transition-colors border border-neutral-200">
                            <Camera className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="pb-4 flex-1">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold text-neutral-900">
                                        {profile.first_name} {profile.last_name}
                                    </h1>
                                    <Badge className="bg-purple-100 text-purple-700 capitalize">
                                        <Shield className="h-3 w-3 mr-1" />
                                        {profile.role}
                                    </Badge>
                                </div>
                                <p className="text-neutral-500">{profile.email}</p>
                            </div>
                            <Button
                                variant={isEditingProfile ? 'outline' : 'default'}
                                onClick={() => setIsEditingProfile(!isEditingProfile)}
                                className={cn(!isEditingProfile && 'bg-green-600 hover:bg-green-700')}
                            >
                                {isEditingProfile ? 'Cancel' : 'Edit Profile'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-xl">
                                <Users className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-neutral-500">Total Users</p>
                                <p className="text-2xl font-bold text-neutral-900">{stats?.totalUsers || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <FileText className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-neutral-500">Total Requests</p>
                                <p className="text-2xl font-bold text-neutral-900">{stats?.totalRequests || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-200">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-100 rounded-xl">
                                <Activity className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm text-neutral-500">Active Staff</p>
                                <p className="text-2xl font-bold text-neutral-900">{stats?.totalStaff || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <Award className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-neutral-500">Collectors</p>
                                <p className="text-2xl font-bold text-neutral-900">{stats?.totalCollectors || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto gap-1 p-1 bg-neutral-100">
                    <TabsTrigger value="profile" className="gap-2">
                        <User className="h-4 w-4" />
                        Profile
                    </TabsTrigger>
                    <TabsTrigger value="security" className="gap-2">
                        <Lock className="h-4 w-4" />
                        Security
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="gap-2">
                        <Activity className="h-4 w-4" />
                        Activity Log
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="gap-2">
                        <Bell className="h-4 w-4" />
                        Notifications
                    </TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Update your personal details here.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {saveMessage && (
                                <div className={cn(
                                    'p-3 rounded-lg text-sm',
                                    saveMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                )}>
                                    {saveMessage.text}
                                </div>
                            )}

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                        <Input
                                            id="firstName"
                                            value={isEditingProfile ? editedProfile.first_name : profile.first_name}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, first_name: e.target.value })}
                                            disabled={!isEditingProfile}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                        <Input
                                            id="lastName"
                                            value={isEditingProfile ? editedProfile.last_name : profile.last_name}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, last_name: e.target.value })}
                                            disabled={!isEditingProfile}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={profile.email}
                                            disabled
                                            className="pl-10 bg-neutral-50"
                                        />
                                    </div>
                                    <p className="text-xs text-neutral-500">Email cannot be changed</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                        <Input
                                            id="phone"
                                            value={isEditingProfile ? editedProfile.phone : profile.phone}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                                            disabled={!isEditingProfile}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="address">Complete Address</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                                        <Input
                                            id="address"
                                            value={isEditingProfile ? editedProfile.address : profile.address}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, address: e.target.value })}
                                            disabled={!isEditingProfile}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                            </div>

                            {isEditingProfile && (
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setIsEditingProfile(false);
                                            setEditedProfile(profile);
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleSaveProfile}
                                        disabled={isSaving}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        {isSaving ? 'Saving...' : (
                                            <>
                                                <Save className="h-4 w-4 mr-2" />
                                                Save Changes
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Account Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-green-600" />
                                Account Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="p-4 bg-neutral-50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar className="h-4 w-4 text-neutral-500" />
                                        <span className="text-sm text-neutral-500">Member Since</span>
                                    </div>
                                    <p className="font-semibold">
                                        {profile.created_at ? format(new Date(profile.created_at), 'MMMM d, yyyy') : 'N/A'}
                                    </p>
                                </div>
                                <div className="p-4 bg-neutral-50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Shield className="h-4 w-4 text-neutral-500" />
                                        <span className="text-sm text-neutral-500">Account Role</span>
                                    </div>
                                    <p className="font-semibold capitalize">{profile.role}</p>
                                </div>
                                <div className="p-4 bg-neutral-50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle2 className="h-4 w-4 text-neutral-500" />
                                        <span className="text-sm text-neutral-500">Account Status</span>
                                    </div>
                                    <Badge className={cn(
                                        profile.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    )}>
                                        {profile.status}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="h-5 w-5 text-green-600" />
                                Change Password
                            </CardTitle>
                            <CardDescription>
                                Update your password to keep your account secure.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {passwordMessage && (
                                <div className={cn(
                                    'p-3 rounded-lg text-sm',
                                    passwordMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                )}>
                                    {passwordMessage.text}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Current Password</Label>
                                <div className="relative">
                                    <Input
                                        id="currentPassword"
                                        type={showCurrentPassword ? 'text' : 'password'}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Enter current password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                                    >
                                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="newPassword"
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                                    >
                                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {newPassword && <PasswordStrength password={newPassword} />}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                />
                                {confirmPassword && newPassword !== confirmPassword && (
                                    <p className="text-sm text-red-500">Passwords do not match</p>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                onClick={handleChangePassword}
                                disabled={!currentPassword || !newPassword || newPassword !== confirmPassword || isChangingPassword}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {isChangingPassword ? 'Changing...' : 'Change Password'}
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Security Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-green-600" />
                                Security Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                                <div>
                                    <p className="font-medium">Two-Factor Authentication</p>
                                    <p className="text-sm text-neutral-500">Add an extra layer of security to your account</p>
                                </div>
                                <Switch />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                                <div>
                                    <p className="font-medium">Login Notifications</p>
                                    <p className="text-sm text-neutral-500">Get notified when someone logs into your account</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Activity Log Tab */}
                <TabsContent value="activity" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-green-600" />
                                Recent Activity
                            </CardTitle>
                            <CardDescription>Your recent actions and login history</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { action: 'Logged in', time: '2 hours ago', ip: '192.168.1.1' },
                                    { action: 'Updated system settings', time: '1 day ago', ip: '192.168.1.1' },
                                    { action: 'Created new staff account', time: '2 days ago', ip: '192.168.1.1' },
                                    { action: 'Generated monthly report', time: '3 days ago', ip: '192.168.1.1' },
                                    { action: 'Logged in', time: '3 days ago', ip: '192.168.1.1' },
                                ].map((activity, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 hover:bg-neutral-50 rounded-lg transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-green-100 rounded-lg">
                                                <Clock className="h-4 w-4 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{activity.action}</p>
                                                <p className="text-xs text-neutral-500">IP: {activity.ip}</p>
                                            </div>
                                        </div>
                                        <span className="text-sm text-neutral-400">{activity.time}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5 text-green-600" />
                                Notification Preferences
                            </CardTitle>
                            <CardDescription>Manage how you receive notifications</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <h4 className="font-medium">Email Notifications</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium">System Alerts</p>
                                            <p className="text-xs text-neutral-500">Critical system issues and updates</p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium">New User Registrations</p>
                                            <p className="text-xs text-neutral-500">When new users sign up</p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium">Daily Summary</p>
                                            <p className="text-xs text-neutral-500">Daily digest of system activity</p>
                                        </div>
                                        <Switch />
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium">Weekly Reports</p>
                                            <p className="text-xs text-neutral-500">Automated weekly performance reports</p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="bg-green-600 hover:bg-green-700">
                                <Save className="h-4 w-4 mr-2" />
                                Save Preferences
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
