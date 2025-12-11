'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database.types';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [userRole, setUserRole] = useState<'admin' | 'staff'>('admin');

    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createBrowserClient<Database>(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/login');
                return;
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            // Allow both admin and staff to access admin pages
            // Admin pages include: users, collections, settings, reports, logs
            if (!profile || !['admin', 'staff'].includes(profile.role)) {
                router.push('/unauthorized');
                return;
            }

            // Store the actual user role for sidebar display
            setUserRole(profile.role as 'admin' | 'staff');
            setIsAuthorized(true);
            setIsLoading(false);
        };

        checkAuth();
    }, [router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!isAuthorized) {
        return null;
    }

    return <DashboardLayout role={userRole}>{children}</DashboardLayout>;
}
