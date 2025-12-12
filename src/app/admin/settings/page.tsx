'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
    Building,
    Mail,
    Shield,
    Clock,
    Save,
    RefreshCw,
    Key,
    AlertTriangle,
    Loader2
} from 'lucide-react';
import { getSystemSettings, updateSettings } from '@/lib/actions/settings';

export default function SystemSettingsPage() {
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // General Settings State
    const [generalSettings, setGeneralSettings] = useState({
        systemName: 'Waste Collection Management System',
        organizationName: 'Panabo City CENRO',
        contactEmail: 'cenro@panabocity.gov.ph',
        contactPhone: '(084) 822-1234',
        address: 'City Hall, Panabo City, Davao del Norte',
        timezone: 'Asia/Manila',
    });

    // Service Settings State
    const [serviceSettings, setServiceSettings] = useState({
        workingHoursStart: '07:00',
        workingHoursEnd: '17:00',
        workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        maxRequestsPerDay: '50',
        advanceBookingDays: '1',
        maxPhotosPerRequest: '5',
    });

    // Security Settings State
    const [securitySettings, setSecuritySettings] = useState({
        sessionTimeout: '30',
        maxLoginAttempts: '5',
        lockoutDuration: '15',
        requireTwoFactor: false,
        passwordMinLength: '8',
        passwordRequireSpecial: true,
        passwordRequireNumbers: true,
        passwordRequireUppercase: true,
    });

    // Email Settings State
    const [emailSettings, setEmailSettings] = useState({
        smtpHost: '',
        smtpPort: '587',
        smtpUser: '',
        smtpPassword: '',
        fromEmail: 'noreply@panabocity.gov.ph',
        fromName: 'Waste Collection System',
        enableNotifications: true,
    });

    // Fetch settings on mount
    const fetchSettings = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await getSystemSettings();
            if (result.success && result.data) {
                setGeneralSettings(result.data.general);
                setServiceSettings(result.data.service);
                setSecuritySettings(result.data.security);
                setEmailSettings(result.data.email);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error('Failed to load settings');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleSave = async (section: 'general' | 'service' | 'security' | 'email') => {
        setIsSaving(true);
        try {
            const settingsMap = {
                general: generalSettings,
                service: serviceSettings,
                security: securitySettings,
                email: emailSettings,
            };

            const result = await updateSettings(section, settingsMap[section]);

            if (result.success) {
                toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully`);
            } else {
                toast.error(result.error || 'Failed to save settings');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 p-6">
            <PageHeader
                title="System Configuration"
                description="Manage system settings and preferences"
            />

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                    <span className="ml-2 text-gray-500">Loading settings...</span>
                </div>
            ) : (
                <Tabs defaultValue="general" className="space-y-6">
                    <TabsList className="grid w-full max-w-2xl grid-cols-4">
                        <TabsTrigger value="general" className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            General
                        </TabsTrigger>
                        <TabsTrigger value="service" className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Service
                        </TabsTrigger>
                        <TabsTrigger value="security" className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Security
                        </TabsTrigger>
                        <TabsTrigger value="email" className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Email
                        </TabsTrigger>
                    </TabsList>

                    {/* General Settings */}
                    <TabsContent value="general">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building className="h-5 w-5 text-green-600" />
                                    General Settings
                                </CardTitle>
                                <CardDescription>Basic system and organization information</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="systemName">System Name</Label>
                                        <Input
                                            id="systemName"
                                            value={generalSettings.systemName}
                                            onChange={(e) => setGeneralSettings(s => ({ ...s, systemName: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="orgName">Organization Name</Label>
                                        <Input
                                            id="orgName"
                                            value={generalSettings.organizationName}
                                            onChange={(e) => setGeneralSettings(s => ({ ...s, organizationName: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="contactEmail">Contact Email</Label>
                                        <Input
                                            id="contactEmail"
                                            type="email"
                                            value={generalSettings.contactEmail}
                                            onChange={(e) => setGeneralSettings(s => ({ ...s, contactEmail: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="contactPhone">Contact Phone</Label>
                                        <Input
                                            id="contactPhone"
                                            value={generalSettings.contactPhone}
                                            onChange={(e) => setGeneralSettings(s => ({ ...s, contactPhone: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="address">Address</Label>
                                        <Textarea
                                            id="address"
                                            value={generalSettings.address}
                                            onChange={(e) => setGeneralSettings(s => ({ ...s, address: e.target.value }))}
                                            rows={2}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="timezone">Timezone</Label>
                                        <Select
                                            value={generalSettings.timezone}
                                            onValueChange={(v) => setGeneralSettings(s => ({ ...s, timezone: v }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Asia/Manila">Asia/Manila (GMT+8)</SelectItem>
                                                <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex justify-end">
                                    <Button onClick={() => handleSave('general')} disabled={isSaving}>
                                        <Save className="h-4 w-4 mr-2" />
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Service Settings */}
                    <TabsContent value="service">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-green-600" />
                                    Service Configuration
                                </CardTitle>
                                <CardDescription>Configure service hours and operational settings</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="workStart">Working Hours Start</Label>
                                        <Input
                                            id="workStart"
                                            type="time"
                                            value={serviceSettings.workingHoursStart}
                                            onChange={(e) => setServiceSettings(s => ({ ...s, workingHoursStart: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="workEnd">Working Hours End</Label>
                                        <Input
                                            id="workEnd"
                                            type="time"
                                            value={serviceSettings.workingHoursEnd}
                                            onChange={(e) => setServiceSettings(s => ({ ...s, workingHoursEnd: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="maxRequests">Max Requests Per Day</Label>
                                        <Input
                                            id="maxRequests"
                                            type="number"
                                            value={serviceSettings.maxRequestsPerDay}
                                            onChange={(e) => setServiceSettings(s => ({ ...s, maxRequestsPerDay: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="advanceBooking">Advance Booking (Days)</Label>
                                        <Input
                                            id="advanceBooking"
                                            type="number"
                                            value={serviceSettings.advanceBookingDays}
                                            onChange={(e) => setServiceSettings(s => ({ ...s, advanceBookingDays: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="maxPhotos">Max Photos Per Request</Label>
                                        <Input
                                            id="maxPhotos"
                                            type="number"
                                            value={serviceSettings.maxPhotosPerRequest}
                                            onChange={(e) => setServiceSettings(s => ({ ...s, maxPhotosPerRequest: e.target.value }))}
                                        />
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex justify-end">
                                    <Button onClick={() => handleSave('service')} disabled={isSaving}>
                                        <Save className="h-4 w-4 mr-2" />
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Security Settings */}
                    <TabsContent value="security">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-green-600" />
                                    Security Settings
                                </CardTitle>
                                <CardDescription>Configure authentication and security policies</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-6">
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                                            <Input
                                                id="sessionTimeout"
                                                type="number"
                                                value={securitySettings.sessionTimeout}
                                                onChange={(e) => setSecuritySettings(s => ({ ...s, sessionTimeout: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="maxAttempts">Max Login Attempts</Label>
                                            <Input
                                                id="maxAttempts"
                                                type="number"
                                                value={securitySettings.maxLoginAttempts}
                                                onChange={(e) => setSecuritySettings(s => ({ ...s, maxLoginAttempts: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
                                            <Input
                                                id="lockoutDuration"
                                                type="number"
                                                value={securitySettings.lockoutDuration}
                                                onChange={(e) => setSecuritySettings(s => ({ ...s, lockoutDuration: e.target.value }))}
                                            />
                                        </div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <h4 className="font-medium mb-4 flex items-center gap-2">
                                            <Key className="h-4 w-4" />
                                            Password Policy
                                        </h4>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="passwordLength">Minimum Password Length</Label>
                                                <Input
                                                    id="passwordLength"
                                                    type="number"
                                                    value={securitySettings.passwordMinLength}
                                                    onChange={(e) => setSecuritySettings(s => ({ ...s, passwordMinLength: e.target.value }))}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between rounded-lg border p-4">
                                                <div>
                                                    <Label htmlFor="twoFactor">Require Two-Factor Auth</Label>
                                                    <p className="text-sm text-gray-500">For all staff and admin users</p>
                                                </div>
                                                <Switch
                                                    id="twoFactor"
                                                    checked={securitySettings.requireTwoFactor}
                                                    onCheckedChange={(v) => setSecuritySettings(s => ({ ...s, requireTwoFactor: v }))}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between rounded-lg border p-4">
                                                <Label htmlFor="requireSpecial">Require Special Characters</Label>
                                                <Switch
                                                    id="requireSpecial"
                                                    checked={securitySettings.passwordRequireSpecial}
                                                    onCheckedChange={(v) => setSecuritySettings(s => ({ ...s, passwordRequireSpecial: v }))}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between rounded-lg border p-4">
                                                <Label htmlFor="requireNumbers">Require Numbers</Label>
                                                <Switch
                                                    id="requireNumbers"
                                                    checked={securitySettings.passwordRequireNumbers}
                                                    onCheckedChange={(v) => setSecuritySettings(s => ({ ...s, passwordRequireNumbers: v }))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex justify-end">
                                    <Button onClick={() => handleSave('security')} disabled={isSaving}>
                                        <Save className="h-4 w-4 mr-2" />
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Email Settings */}
                    <TabsContent value="email">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Mail className="h-5 w-5 text-green-600" />
                                    Email Configuration
                                </CardTitle>
                                <CardDescription>Configure SMTP settings for email notifications</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                                    <div className="flex items-center gap-2 text-yellow-700">
                                        <AlertTriangle className="h-5 w-5" />
                                        <span className="font-medium">Email configuration requires valid SMTP credentials</span>
                                    </div>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="smtpHost">SMTP Host</Label>
                                        <Input
                                            id="smtpHost"
                                            placeholder="smtp.example.com"
                                            value={emailSettings.smtpHost}
                                            onChange={(e) => setEmailSettings(s => ({ ...s, smtpHost: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="smtpPort">SMTP Port</Label>
                                        <Input
                                            id="smtpPort"
                                            type="number"
                                            value={emailSettings.smtpPort}
                                            onChange={(e) => setEmailSettings(s => ({ ...s, smtpPort: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="smtpUser">SMTP Username</Label>
                                        <Input
                                            id="smtpUser"
                                            value={emailSettings.smtpUser}
                                            onChange={(e) => setEmailSettings(s => ({ ...s, smtpUser: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="smtpPassword">SMTP Password</Label>
                                        <Input
                                            id="smtpPassword"
                                            type="password"
                                            value={emailSettings.smtpPassword}
                                            onChange={(e) => setEmailSettings(s => ({ ...s, smtpPassword: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="fromEmail">From Email</Label>
                                        <Input
                                            id="fromEmail"
                                            type="email"
                                            value={emailSettings.fromEmail}
                                            onChange={(e) => setEmailSettings(s => ({ ...s, fromEmail: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="fromName">From Name</Label>
                                        <Input
                                            id="fromName"
                                            value={emailSettings.fromName}
                                            onChange={(e) => setEmailSettings(s => ({ ...s, fromName: e.target.value }))}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div>
                                        <Label htmlFor="enableNotifications">Enable Email Notifications</Label>
                                        <p className="text-sm text-gray-500">Send email notifications for system events</p>
                                    </div>
                                    <Switch
                                        id="enableNotifications"
                                        checked={emailSettings.enableNotifications}
                                        onCheckedChange={(v) => setEmailSettings(s => ({ ...s, enableNotifications: v }))}
                                    />
                                </div>
                                <Separator />
                                <div className="flex justify-between">
                                    <Button variant="outline">
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Test Connection
                                    </Button>
                                    <Button onClick={() => handleSave('email')} disabled={isSaving}>
                                        <Save className="h-4 w-4 mr-2" />
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}
