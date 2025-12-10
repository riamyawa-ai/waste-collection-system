"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteUser } from "@/lib/actions/staff";
import { toast } from "sonner";
import { Loader2, AlertTriangle } from "lucide-react";

interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
}

interface DeleteUserModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    user: User | null;
}

export function DeleteUserModal({ open, onClose, onSuccess, user }: DeleteUserModalProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            const result = await deleteUser(user.id);

            if (result.success) {
                toast.success("User deleted successfully");
                onSuccess?.();
                onClose();
            } else {
                toast.error(result.error || "Failed to delete user");
            }
        } catch (error) {
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
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                        Delete User
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete <strong>{user.first_name} {user.last_name}</strong>?
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-sm text-neutral-600 border-l-4 border-red-500 pl-4 py-2 bg-red-50 rounded-r">
                        This action cannot be undone. The user will be permanently deactivated and unable to access the system.
                    </p>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Delete User
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
