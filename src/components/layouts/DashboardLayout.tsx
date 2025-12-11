"use client";

import { useState, useEffect, createContext } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { Search, User, LogOut, ChevronDown, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/lib/auth/actions";
import { NotificationsCenter } from "@/components/shared/NotificationsCenter";

// Context for sidebar state
export const SidebarContext = createContext<{
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}>({
  collapsed: false,
  setCollapsed: () => { },
});

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "client" | "staff" | "collector" | "admin";
}

interface UserProfile {
  full_name: string;
  email: string;
  avatar_url: string | null;
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Fetch user profile on mount
  useEffect(() => {
    async function fetchUser() {
      try {
        const supabase = createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (authUser) {
          // First set from auth metadata (always available)
          const authName = authUser.user_metadata?.full_name ||
            `${authUser.user_metadata?.first_name || ''} ${authUser.user_metadata?.last_name || ''}`.trim() ||
            authUser.email?.split('@')[0] ||
            'User';

          setUser({
            full_name: authName,
            email: authUser.email || '',
            avatar_url: null,
          });

          // Then try to get from profiles table (may fail due to RLS)
          try {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('full_name, email, avatar_url')
              .eq('id', authUser.id)
              .single();

            if (profile && !error) {
              setUser({
                full_name: profile.full_name || authName,
                email: profile.email || authUser.email || '',
                avatar_url: profile.avatar_url,
              });
            }
          } catch {
            // Ignore profile fetch errors, we already have auth data
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser({
          full_name: 'User',
          email: '',
          avatar_url: null,
        });
      }
    }

    fetchUser();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .filter(Boolean)
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <div className="min-h-screen bg-neutral-50">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar role={role} collapsed={collapsed} onCollapsedChange={setCollapsed} />
        </div>

        {/* Mobile Navigation */}
        <MobileNav role={role} />

        {/* Main Content - Responds to sidebar collapse */}
        <div
          className={cn(
            "transition-all duration-300",
            collapsed ? "md:pl-20" : "md:pl-64"
          )}
        >
          {/* Top Bar */}
          <header className="hidden md:flex items-center justify-between h-16 px-6 bg-white border-b border-neutral-200 sticky top-0 z-30">
            {/* Search */}
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full h-10 pl-10 pr-4 rounded-lg border border-neutral-200 bg-neutral-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Notifications Center */}
              <NotificationsCenter role={role} />

              <div className="h-8 w-px bg-neutral-200" />

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 p-1.5 pr-3 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                    {user?.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt={user.full_name}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-primary-600">
                        {user ? getInitials(user.full_name) : <User className="w-4 h-4" />}
                      </span>
                    )}
                  </div>
                  <div className="text-left hidden lg:block">
                    <div className="text-sm font-medium text-neutral-900">
                      {user?.full_name || 'User'}
                    </div>
                    <div className="text-xs text-neutral-500 capitalize">{role}</div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-neutral-400 hidden lg:block" />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-neutral-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-neutral-100">
                        <p className="text-sm font-medium text-neutral-900">{user?.full_name}</p>
                        <p className="text-xs text-neutral-500">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          href={`/${role}/profile`}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User className="w-4 h-4" />
                          Profile Settings
                        </Link>
                        <Link
                          href={`/${role}/notifications`}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Settings className="w-4 h-4" />
                          View All Notifications
                        </Link>
                      </div>
                      <div className="border-t border-neutral-100 py-1">
                        <button
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          <LogOut className="w-4 h-4" />
                          {isLoggingOut ? 'Logging out...' : 'Log out'}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-4 md:p-6 pt-18 md:pt-6">{children}</main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
