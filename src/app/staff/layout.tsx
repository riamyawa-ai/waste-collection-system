"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/types/database.types";
import { DashboardLayout } from "@/components/layouts";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface StaffLayoutProps {
  children: ReactNode;
}

export default function StaffLayout({ children }: StaffLayoutProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userRole, setUserRole] = useState<"staff" | "admin">("staff");

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

      // Allow both admin and staff to access staff pages
      if (profile?.role !== 'admin' && profile?.role !== 'staff') {
        router.push('/unauthorized');
        return;
      }

      // Keep the original role so the sidebar shows correct items
      setUserRole(profile?.role as "staff" | "admin");
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

  // Use the actual user role for the dashboard layout
  return (
    <DashboardLayout role={userRole}>
      {children}
    </DashboardLayout>
  );
}
