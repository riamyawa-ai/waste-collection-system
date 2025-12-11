"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { BarangaySelect } from "@/components/ui/barangay-select";
import { PasswordStrengthMeter } from "@/components/ui/password-strength";
import { PhoneInput } from "@/components/ui/phone-input";
import { createUser } from "@/lib/actions/staff";
import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/types/database.types";
import { Loader2, Eye, EyeOff, Shuffle } from "lucide-react";
import { toast } from "sonner";

interface AddUserModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function AddUserModal({ open, onClose, onSuccess }: AddUserModalProps) {
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [currentUserRole, setCurrentUserRole] = useState<"admin" | "staff" | null>(null);

    // Get default role based on current user's role
    const getDefaultRole = () => {
        if (currentUserRole === "admin") return "staff";
        if (currentUserRole === "staff") return "collector";
        return "collector";
    };

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        barangay: "",
        role: "collector" as "staff" | "collector",
        status: "active" as "active" | "inactive" | "suspended",
        password: "",
        confirmPassword: "",
        sendWelcomeEmail: true,
    });

    // Fetch current user's role
    useEffect(() => {
        const fetchCurrentUserRole = async () => {
            const supabase = createBrowserClient<Database>(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (profile?.role === 'admin' || profile?.role === 'staff') {
                    setCurrentUserRole(profile.role as "admin" | "staff");
                    // Set default role based on current user
                    if (profile.role === 'admin') {
                        setFormData(f => ({ ...f, role: 'staff' }));
                    } else {
                        setFormData(f => ({ ...f, role: 'collector' }));
                    }
                }
            }
        };

        if (open) {
            fetchCurrentUserRole();
        }
    }, [open]);

    const generatePassword = () => {
        const chars =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        let password = "";
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData((f) => ({ ...f, password, confirmPassword: password }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (formData.password.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        setLoading(true);
        try {
            const result = await createUser({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address || undefined,
                barangay: formData.barangay || undefined,
                role: formData.role,
                status: formData.status,
                password: formData.password,
                autoVerify: false, // Never auto-verify, always require email confirmation
                sendWelcomeEmail: formData.sendWelcomeEmail,
            });

            if (result.success) {
                toast.success("User created successfully! They can now log in with their credentials.");
                onSuccess();
                onClose();
                resetForm();
            } else {
                toast.error(result.error || "Failed to create user");
            }
        } catch {
            toast.error("An unexpected error occurred");
        }
        setLoading(false);
    };

    const resetForm = () => {
        setFormData({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            address: "",
            barangay: "",
            role: getDefaultRole() as "staff" | "collector",
            status: "active",
            password: "",
            confirmPassword: "",
            sendWelcomeEmail: true,
        });
    };

    // Get available roles based on current user's role
    const getAvailableRoles = () => {
        if (currentUserRole === "admin") {
            // Admins can only create staff
            return [{ value: "staff", label: "Staff" }];
        } else if (currentUserRole === "staff") {
            // Staff can only create collectors
            return [{ value: "collector", label: "Collector" }];
        }
        return [];
    };

    const availableRoles = getAvailableRoles();

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>
                        {currentUserRole === "admin"
                            ? "Create a new Staff account. The account will be automatically verified."
                            : "Create a new Collector account. The account will be automatically verified."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-neutral-900">
                            Personal Information
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name *</Label>
                                <Input
                                    id="firstName"
                                    value={formData.firstName}
                                    onChange={(e) =>
                                        setFormData((f) => ({ ...f, firstName: e.target.value }))
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name *</Label>
                                <Input
                                    id="lastName"
                                    value={formData.lastName}
                                    onChange={(e) =>
                                        setFormData((f) => ({ ...f, lastName: e.target.value }))
                                    }
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData((f) => ({ ...f, email: e.target.value }))
                                }
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number *</Label>
                            <PhoneInput
                                value={formData.phone}
                                onChange={(value) => setFormData((f) => ({ ...f, phone: value }))}
                            />
                        </div>
                    </div>

                    {/* Address Information */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-neutral-900">
                            Address Information
                        </h4>
                        <div className="space-y-2">
                            <Label htmlFor="address">Complete Address</Label>
                            <Textarea
                                id="address"
                                value={formData.address}
                                onChange={(e) =>
                                    setFormData((f) => ({ ...f, address: e.target.value }))
                                }
                                placeholder="Street, Building, Landmarks..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Barangay</Label>
                            <BarangaySelect
                                value={formData.barangay}
                                onChange={(value) =>
                                    setFormData((f) => ({ ...f, barangay: value }))
                                }
                            />
                        </div>
                    </div>

                    {/* Role & Status */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-neutral-900">
                            Role & Status
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Role *</Label>
                                <Select
                                    value={formData.role}
                                    onValueChange={(value) =>
                                        setFormData((f) => ({
                                            ...f,
                                            role: value as "staff" | "collector",
                                        }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableRoles.map((role) => (
                                            <SelectItem key={role.value} value={role.value}>
                                                {role.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-neutral-500">
                                    {currentUserRole === "admin"
                                        ? "As an Admin, you can only create Staff accounts."
                                        : "As Staff, you can only create Collector accounts."}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label>Status *</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) =>
                                        setFormData((f) => ({
                                            ...f,
                                            status: value as "active" | "inactive" | "suspended",
                                        }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="suspended">Suspended</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-neutral-900">Password</h4>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={generatePassword}
                            >
                                <Shuffle className="w-4 h-4 mr-2" />
                                Generate
                            </Button>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password *</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData((f) => ({ ...f, password: e.target.value }))
                                    }
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                            <PasswordStrengthMeter password={formData.password} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password *</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) =>
                                    setFormData((f) => ({ ...f, confirmPassword: e.target.value }))
                                }
                                required
                            />
                            {formData.confirmPassword &&
                                formData.password !== formData.confirmPassword && (
                                    <p className="text-xs text-red-600">Passwords do not match</p>
                                )}
                        </div>
                    </div>

                    {/* Options */}
                    <div className="space-y-3 pt-2 border-t">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="sendWelcomeEmail"
                                checked={formData.sendWelcomeEmail}
                                onCheckedChange={(checked) =>
                                    setFormData((f) => ({
                                        ...f,
                                        sendWelcomeEmail: checked === true,
                                    }))
                                }
                            />
                            <Label htmlFor="sendWelcomeEmail" className="text-sm font-normal">
                                Send welcome email with login credentials
                            </Label>
                        </div>
                        <p className="text-xs text-green-600 bg-green-50 p-2 rounded">
                            ✓ The account will be automatically verified and ready to use immediately.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || availableRoles.length === 0}>
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Create {currentUserRole === "admin" ? "Staff" : "Collector"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
