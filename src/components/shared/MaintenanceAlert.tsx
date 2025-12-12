'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { getMaintenanceMode } from '@/lib/actions/settings';

interface MaintenanceAlertProps {
    userRole?: string;
    onClose?: () => void;
}

export function MaintenanceAlert({ userRole, onClose }: MaintenanceAlertProps) {
    const [maintenance, setMaintenance] = useState<{
        enabled: boolean;
        message: string;
        allowedRoles: string[];
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        async function checkMaintenance() {
            try {
                const result = await getMaintenanceMode();
                setMaintenance(result);
            } catch (error) {
                console.error('Error checking maintenance mode:', error);
            } finally {
                setIsLoading(false);
            }
        }
        checkMaintenance();
    }, []);

    // Don't show if loading, not enabled, or dismissed
    if (isLoading || !maintenance?.enabled || isDismissed) {
        return null;
    }

    // Don't show if user has a role that's allowed during maintenance
    if (userRole && maintenance.allowedRoles.includes(userRole)) {
        return null;
    }

    const handleDismiss = () => {
        setIsDismissed(true);
        onClose?.();
    };

    return (
        <Alert
            variant="destructive"
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-xl shadow-lg bg-amber-50 text-amber-800 border-amber-300"
        >
            <AlertTriangle className="h-5 w-5" />
            <div className="flex-1">
                <AlertTitle className="font-semibold">System Maintenance</AlertTitle>
                <AlertDescription className="mt-1">
                    {maintenance.message}
                </AlertDescription>
            </div>
            <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-6 w-6 p-0 text-amber-600 hover:text-amber-800"
                onClick={handleDismiss}
            >
                <X className="h-4 w-4" />
            </Button>
        </Alert>
    );
}

/**
 * Banner version for login page
 */
export function MaintenanceBanner() {
    const [maintenance, setMaintenance] = useState<{
        enabled: boolean;
        message: string;
        allowedRoles: string[];
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function checkMaintenance() {
            try {
                const result = await getMaintenanceMode();
                setMaintenance(result);
            } catch (error) {
                console.error('Error checking maintenance mode:', error);
            } finally {
                setIsLoading(false);
            }
        }
        checkMaintenance();
    }, []);

    if (isLoading || !maintenance?.enabled) {
        return null;
    }

    return (
        <div className="bg-amber-500 text-white py-3 px-4 text-center">
            <div className="flex items-center justify-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">System Maintenance:</span>
                <span>{maintenance.message}</span>
            </div>
        </div>
    );
}
