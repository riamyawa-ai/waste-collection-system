"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateUser } from "@/lib/actions/staff";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    role: "admin" | "staff" | "client" | "collector";
    status: "active" | "inactive" | "suspended";
    barangay?: string;
    address?: string;
}

interface EditUserModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    user: User | null;
}

// Common barangays for dropdown
const BARANGAYS = [
    "Poblacion", "Alangilan", "Banaba", "Batangs", "Bolbok",
    "Calicanto", "Kumintang Ibaba", "Kumintang Ilaya", "Libjo",
    "Malitam", "Pallocan Kanluran", "Pallocan Silangan",
    "Sampaga", "Santa Clara", "Santa Rita Kweba", "Santa Rita Aplaya", "Wawa"
];

export function EditUserModal({ open, onClose, onSuccess, user }: EditUserModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        address: "",
        barangay: "",
        role: "client" as User["role"],
        status: "active" as User["status"],
    });

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.first_name || "",
                lastName: user.last_name || "",
                phone: user.phone || "",
                address: user.address || "",
                barangay: user.barangay || "",
                role: user.role,
                status: user.status,
            });
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsLoading(true);
        try {
            const result = await updateUser({
                id: user.id,
                ...formData,
            });

            if (result.success) {
                toast.success("User updated successfully");
                onSuccess?.();
                onClose();
            } else {
                toast.error(result.error || "Failed to update user");
            }
        } catch (error) {
            toast.error("An error occurred while updating the user");
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogDescription>
                        Update user details for {user.email}. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="firstName">First name</Label>
                            <Input
                                id="firstName"
                                value={formData.firstName}
                                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="lastName">Last name</Label>
                            <Input
                                id="lastName"
                                value={formData.lastName}
                                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                                required
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="09123456789"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                            id="address"
                            value={formData.address}
                            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                            placeholder="Street address, etc."
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="barangay">Barangay</Label>
                        <Select
                            value={formData.barangay}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, barangay: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select barangay" />
                            </SelectTrigger>
                            <SelectContent>
                                {BARANGAYS.map((b) => (
                                    <SelectItem key={b} value={b}>{b}</SelectItem>
                                ))}
                                <SelectItem value="Others">Others</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="role">Role</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as User["role"] }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="client">Client</SelectItem>
                                    <SelectItem value="collector">Collector</SelectItem>
                                    <SelectItem value="staff">Staff</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as User["status"] }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="suspended">Suspended</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
