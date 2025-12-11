"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/constants";
import {
  LayoutDashboard,
  FileText,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  Recycle,
  Users,
  CreditCard,
  MessageSquare,
  Megaphone,
  Calendar,
  Truck,
  BarChart3,
  Map,
} from "lucide-react";
import { signOut } from "@/lib/auth/actions";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

interface SidebarProps {
  role: "client" | "staff" | "collector" | "admin";
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const navItemsByRole: Record<string, NavItem[]> = {
  client: [
    { label: "Dashboard", href: "/client/dashboard", icon: LayoutDashboard },
    { label: "My Requests", href: "/client/requests", icon: FileText },
    { label: "Payments", href: "/client/payments", icon: CreditCard },
    { label: "Schedule", href: "/client/schedule", icon: Calendar },
    { label: "Announcements", href: "/client/announcements", icon: Megaphone },
    { label: "Feedback", href: "/client/feedback", icon: MessageSquare },
    { label: "Notifications", href: "/client/notifications", icon: Bell },
    { label: "Settings", href: "/client/profile", icon: Settings },
  ],
  staff: [
    { label: "Dashboard", href: "/staff/dashboard", icon: LayoutDashboard },
    { label: "Collections", href: "/staff/collections", icon: Truck },
    { label: "Manage Users", href: "/staff/users", icon: Users },
    { label: "Payments", href: "/staff/payments", icon: CreditCard },
    { label: "Announcements", href: "/staff/announcements", icon: Megaphone },
    { label: "Feedback", href: "/staff/feedback", icon: MessageSquare },
    { label: "Schedule", href: "/staff/schedule", icon: Calendar },
    { label: "Notifications", href: "/staff/notifications", icon: Bell },
    { label: "Profile", href: "/staff/profile", icon: Settings },
  ],
  collector: [
    { label: "Dashboard", href: "/collector/dashboard", icon: LayoutDashboard },
    { label: "My Requests", href: "/collector/requests", icon: FileText },
    { label: "Schedule", href: "/collector/schedule", icon: Calendar },
    { label: "Feedback", href: "/collector/feedback", icon: MessageSquare },
    { label: "Announcements", href: "/collector/announcements", icon: Megaphone },
    { label: "Notifications", href: "/collector/notifications", icon: Bell },
    { label: "Profile", href: "/collector/profile", icon: Settings },
  ],
  admin: [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
    { label: "Reports", href: "/admin/reports", icon: BarChart3 },
    { label: "System Logs", href: "/admin/logs", icon: Bell },
    { label: "Notifications", href: "/admin/notifications", icon: Bell },
    { label: "Settings", href: "/admin/settings", icon: Settings },
    { label: "Profile", href: "/admin/profile", icon: Settings },
  ],
};

export function Sidebar({ role, collapsed = false, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navItems = navItemsByRole[role] || [];

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

  const toggleCollapsed = () => {
    onCollapsedChange?.(!collapsed);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-white border-r border-neutral-200 transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-200 shrink-0">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-eco shrink-0">
            <Recycle className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-neutral-900 truncate">
              {APP_NAME}
            </span>
          )}
        </Link>
        <button
          onClick={toggleCollapsed}
          className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            className={cn(
              "w-5 h-5 transition-transform",
              collapsed && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 group",
                isActive
                  ? "bg-primary-50 text-primary-700"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 shrink-0 transition-colors",
                  isActive
                    ? "text-primary-600"
                    : "text-neutral-400 group-hover:text-neutral-600"
                )}
              />
              {!collapsed && (
                <>
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto px-2 py-0.5 text-xs font-semibold bg-primary-500 text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-neutral-200 space-y-1 shrink-0">
        <Link
          href="/help"
          className="flex items-center gap-3 px-3 py-2.5 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 rounded-lg transition-colors"
          title={collapsed ? "Help" : undefined}
        >
          <HelpCircle className="w-5 h-5 shrink-0 text-neutral-400" />
          {!collapsed && <span className="font-medium">Help</span>}
        </Link>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          title={collapsed ? "Log out" : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="font-medium">{isLoggingOut ? 'Logging out...' : 'Log out'}</span>}
        </button>
      </div>
    </aside>
  );
}
