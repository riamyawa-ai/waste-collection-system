"use client";

import { useState, useEffect, useCallback } from "react";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Lock,
    Shield,
    Bell,
    Trash2,
    Camera,
    Save,
    Eye,
    EyeOff,
    Check,
    AlertTriangle,
    Calendar,
    FileText,
    RefreshCw,
} from "lucide-react";
import { DashboardLayout } from "@/components/layouts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PANABO_BARANGAYS } from "@/constants/barangays";
import { PasswordStrengthMeter as PasswordStrength } from "@/components/ui/password-strength";
import { cn } from "@/lib/utils";
import {
    getProfile,
    updateProfile,
    changePassword,
    getAccountStats,
    deleteAccount,
} from "@/lib/actions/profile";

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

interface AccountStats {
    memberSince: string;
    totalRequests: number;
    completedRequests: number;
}

interface UnifiedProfilePageProps {
    role: "admin" | "staff" | "client" | "collector";
}

export function UnifiedProfilePage({ role }: UnifiedProfilePageProps) {
    // Profile state
    const [profile, setProfile] = useState<Profile | null>(null);
    const [stats, setStats] = useState<AccountStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Editable profile fields
    const [editedProfile, setEditedProfile] = useState<Partial<Profile>>({});

    // Password state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Notification settings
    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        requestUpdates: true,
        paymentAlerts: true,
        collectionReminders: true,
        systemAnnouncements: true,
    });

    // Delete account state
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteConfirmPassword, setDeleteConfirmPassword] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [profileResult, statsResult] = await Promise.all([
                getProfile(),
                getAccountStats(),
            ]);

            if (profileResult.success && profileResult.data) {
                setProfile(profileResult.data as Profile);
                setEditedProfile(profileResult.data as Profile);
            }
            if (statsResult.success && statsResult.data) {
                setStats(statsResult.data);
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
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
        } catch (error) {
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
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                setPasswordMessage({ type: 'error', text: result.error || 'Failed to change password' });
            }
        } catch (error) {
            setPasswordMessage({ type: 'error', text: 'An unexpected error occurred' });
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteAccount(deleteConfirmPassword);

            if (result.success) {
                window.location.href = '/login';
            } else {
                alert(result.error || 'Failed to delete account');
            }
        } catch (error) {
            alert('An unexpected error occurred');
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout role={role}>
                <div className="flex items-center justify-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin text-primary-600" />
                </div>
            </DashboardLayout>
        );
    }

    if (!profile) {
        return (
            <DashboardLayout role={role}>
                <div className="flex flex-col items-center justify-center py-12">
                    <p className="text-neutral-500">Unable to load profile</p>
                    <Button onClick={fetchData} className="mt-4">
                        Try Again
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role={role}>
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900">
                        Profile & Settings
                    </h1>
                    <p className="text-neutral-500">
                        Manage your account settings and preferences.
                    </p>
                </div>

                <Tabs defaultValue="profile" className="space-y-6">
                    <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto gap-1 p-1">
                        <TabsTrigger value="profile" className="gap-2">
                            <User className="h-4 w-4" />
                            <span className="hidden sm:inline">Profile</span>
                        </TabsTrigger>
                        <TabsTrigger value="password" className="gap-2">
                            <Lock className="h-4 w-4" />
                            <span className="hidden sm:inline">Password</span>
                        </TabsTrigger>
                        <TabsTrigger value="security" className="gap-2">
                            <Shield className="h-4 w-4" />
                            <span className="hidden sm:inline">Security</span>
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="gap-2">
                            <Bell className="h-4 w-4" />
                            <span className="hidden sm:inline">Notifications</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Profile Tab */}
                    <TabsContent value="profile" className="space-y-6">
                        {/* Profile Card */}
                        <Card className="border-neutral-200">
                            <CardHeader>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <Avatar className="h-20 w-20">
                                                <AvatarImage src={profile.avatar_url || undefined} />
                                                <AvatarFallback className="bg-primary-100 text-primary-700 text-xl font-bold">
                                                    {profile.first_name?.[0]}{profile.last_name?.[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 transition-colors">
                                                <Camera className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl">
                                                {profile.first_name} {profile.last_name}
                                            </CardTitle>
                                            <CardDescription>{profile.email}</CardDescription>
                                            <CardDescription className="uppercase text-xs font-semibold mt-1 bg-neutral-100 w-fit px-2 py-0.5 rounded text-neutral-600">
                                                {profile.role}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <Button
                                        variant={isEditingProfile ? "outline" : "default"}
                                        onClick={() => setIsEditingProfile(!isEditingProfile)}
                                        className={cn(!isEditingProfile && "bg-primary-600 hover:bg-primary-700")}
                                    >
                                        {isEditingProfile ? "Cancel" : "Edit Profile"}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {saveMessage && (
                                    <div className={cn(
                                        "p-3 rounded-lg text-sm",
                                        saveMessage.type === 'success' ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                                    )}>
                                        {saveMessage.text}
                                    </div>
                                )}

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input
                                            id="firstName"
                                            value={isEditingProfile ? editedProfile.first_name : profile.first_name}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, first_name: e.target.value })}
                                            disabled={!isEditingProfile}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input
                                            id="lastName"
                                            value={isEditingProfile ? editedProfile.last_name : profile.last_name}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, last_name: e.target.value })}
                                            disabled={!isEditingProfile}
                                        />
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
                                    <div className="space-y-2 sm:col-span-2">
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
                                    <div className="space-y-2">
                                        <Label htmlFor="barangay">Barangay</Label>
                                        <Select
                                            value={isEditingProfile ? editedProfile.barangay : profile.barangay}
                                            onValueChange={(value) => setEditedProfile({ ...editedProfile, barangay: value })}
                                            disabled={!isEditingProfile}
                                        >
                                            <SelectTrigger id="barangay">
                                                <SelectValue placeholder="Select barangay" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {PANABO_BARANGAYS.map((barangay) => (
                                                    <SelectItem key={barangay} value={barangay}>
                                                        {barangay}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
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
                                            className="bg-primary-600 hover:bg-primary-700"
                                        >
                                            {isSaving ? "Saving..." : (
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

                        {/* Account Statistics */}
                        <Card className="border-neutral-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-primary-600" />
                                    Account Statistics
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 sm:grid-cols-3">
                                    <div className="bg-neutral-50 rounded-lg p-4 text-center">
                                        <Calendar className="h-6 w-6 mx-auto text-primary-600 mb-2" />
                                        <p className="text-sm text-neutral-500">Member Since</p>
                                        <p className="font-semibold">
                                            {stats?.memberSince
                                                ? new Date(stats.memberSince).toLocaleDateString()
                                                : '—'}
                                        </p>
                                    </div>
                                    <div className="bg-neutral-50 rounded-lg p-4 text-center">
                                        <FileText className="h-6 w-6 mx-auto text-blue-600 mb-2" />
                                        <p className="text-sm text-neutral-500">Total Requests</p>
                                        <p className="font-semibold text-xl">{stats?.totalRequests || 0}</p>
                                    </div>
                                    <div className="bg-neutral-50 rounded-lg p-4 text-center">
                                        <Check className="h-6 w-6 mx-auto text-green-600 mb-2" />
                                        <p className="text-sm text-neutral-500">Completed</p>
                                        <p className="font-semibold text-xl">{stats?.completedRequests || 0}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Password Tab */}
                    <TabsContent value="password" className="space-y-6">
                        <Card className="border-neutral-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Lock className="h-5 w-5 text-primary-600" />
                                    Change Password
                                </CardTitle>
                                <CardDescription>
                                    Update your password to keep your account secure.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {passwordMessage && (
                                    <div className={cn(
                                        "p-3 rounded-lg text-sm",
                                        passwordMessage.type === 'success' ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                                    )}>
                                        {passwordMessage.text}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Current Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="currentPassword"
                                            type={showCurrentPassword ? "text" : "password"}
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
                                            type={showNewPassword ? "text" : "password"}
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
                                    className="bg-primary-600 hover:bg-primary-700"
                                >
                                    {isChangingPassword ? "Changing..." : "Change Password"}
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    {/* Security Tab */}
                    <TabsContent value="security" className="space-y-6">
                        {/* Delete Account */}
                        <Card className="border-red-200 bg-red-50/30">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-red-700">
                                    <AlertTriangle className="h-5 w-5" />
                                    Delete Account
                                </CardTitle>
                                <CardDescription>
                                    Permanently delete your account and all associated data.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-neutral-600 mb-4">
                                    Once you delete your account, there is no going back. Your account will be suspended
                                    and you will have a 30-day grace period to contact support if you change your mind.
                                </p>
                                <Button
                                    variant="destructive"
                                    onClick={() => setShowDeleteDialog(true)}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Account
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Notifications Tab */}
                    <TabsContent value="notifications" className="space-y-6">
                        <Card className="border-neutral-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Bell className="h-5 w-5 text-primary-600" />
                                    Notification Preferences
                                </CardTitle>
                                <CardDescription>
                                    Choose how you want to receive notifications.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <h4 className="font-medium text-neutral-900">Notification Channels</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-sm">Email Notifications</p>
                                                <p className="text-xs text-neutral-500">Receive updates via email</p>
                                            </div>
                                            <Switch
                                                checked={notificationSettings.emailNotifications}
                                                onCheckedChange={(checked) =>
                                                    setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                                                }
                                            />
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-sm">Push Notifications</p>
                                                <p className="text-xs text-neutral-500">Receive browser push notifications</p>
                                            </div>
                                            <Switch
                                                checked={notificationSettings.pushNotifications}
                                                onCheckedChange={(checked) =>
                                                    setNotificationSettings({ ...notificationSettings, pushNotifications: checked })
                                                }
                                            />
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-sm">SMS Notifications</p>
                                                <p className="text-xs text-neutral-500">Receive SMS alerts</p>
                                            </div>
                                            <Switch
                                                checked={notificationSettings.smsNotifications}
                                                onCheckedChange={(checked) =>
                                                    setNotificationSettings({ ...notificationSettings, smsNotifications: checked })
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <h4 className="font-medium text-neutral-900">Notification Types</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm">Request Status Updates</p>
                                            <Switch
                                                checked={notificationSettings.requestUpdates}
                                                onCheckedChange={(checked) =>
                                                    setNotificationSettings({ ...notificationSettings, requestUpdates: checked })
                                                }
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm">Payment Alerts</p>
                                            <Switch
                                                checked={notificationSettings.paymentAlerts}
                                                onCheckedChange={(checked) =>
                                                    setNotificationSettings({ ...notificationSettings, paymentAlerts: checked })
                                                }
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm">Collection Reminders</p>
                                            <Switch
                                                checked={notificationSettings.collectionReminders}
                                                onCheckedChange={(checked) =>
                                                    setNotificationSettings({ ...notificationSettings, collectionReminders: checked })
                                                }
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm">System Announcements</p>
                                            <Switch
                                                checked={notificationSettings.systemAnnouncements}
                                                onCheckedChange={(checked) =>
                                                    setNotificationSettings({ ...notificationSettings, systemAnnouncements: checked })
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="bg-primary-600 hover:bg-primary-700">
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Preferences
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Delete Account Confirmation Dialog */}
                <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-red-700">
                                <AlertTriangle className="h-5 w-5" />
                                Delete Account
                            </DialogTitle>
                            <DialogDescription>
                                This action cannot be undone. Your account will be suspended and data will be permanently deleted after 30 days.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <p className="text-sm text-neutral-600">
                                Please enter your password to confirm account deletion:
                            </p>
                            <Input
                                type="password"
                                placeholder="Enter your password"
                                value={deleteConfirmPassword}
                                onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                            />
                        </div>
                        <DialogFooter className="flex-col sm:flex-row gap-2">
                            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteAccount}
                                disabled={!deleteConfirmPassword || isDeleting}
                            >
                                {isDeleting ? "Deleting..." : (
                                    <>
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete Account
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}
