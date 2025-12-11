"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { resetUserPassword } from "@/lib/actions/staff";
import { toast } from "sonner";
import { Loader2, Key } from "lucide-react";

interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
}

interface ResetPasswordModalProps {
    open: boolean;
    onClose: () => void;
    user: User | null;
}

export function ResetPasswordModal({ open, onClose, user }: ResetPasswordModalProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleReset = async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            const result = await resetUserPassword(user.id);

            if (result.success) {
                toast.success("Password reset initiated successfully");
                onClose();
            } else {
                toast.error(result.error || "Failed to reset password");
            }
        } catch (_error) {
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5 text-neutral-500" />
                        Reset Password
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to reset the password for <strong>{user.first_name} {user.last_name}</strong>?
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-sm text-neutral-600">
                        This will generate a password reset link and send it to <strong>{user.email}</strong>.
                        The user will need to check their email to creating a new password.
                    </p>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button onClick={handleReset} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Send Reset Link
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
