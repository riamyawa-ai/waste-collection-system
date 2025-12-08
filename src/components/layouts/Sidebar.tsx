"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/constants";
import {
  LayoutDashboard,
  FileText,
  Map,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  Recycle,
  Users,
  Truck,
  BarChart3,
  Calendar,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

interface SidebarProps {
  role: "client" | "staff" | "collector" | "admin";
}

const navItemsByRole: Record<string, NavItem[]> = {
  client: [
    { label: "Dashboard", href: "/client/dashboard", icon: LayoutDashboard },
    { label: "My Requests", href: "/client/requests", icon: FileText },
    { label: "New Request", href: "/client/requests/new", icon: Recycle },
    { label: "Notifications", href: "/client/notifications", icon: Bell },
    { label: "Settings", href: "/client/settings", icon: Settings },
  ],
  staff: [
    { label: "Dashboard", href: "/staff/dashboard", icon: LayoutDashboard },
    { label: "All Requests", href: "/staff/requests", icon: FileText },
    { label: "Collectors", href: "/staff/collectors", icon: Truck },
    { label: "Schedule", href: "/staff/schedule", icon: Calendar },
    { label: "Map View", href: "/staff/map", icon: Map },
    { label: "Reports", href: "/staff/reports", icon: BarChart3 },
    { label: "Settings", href: "/staff/settings", icon: Settings },
  ],
  collector: [
    { label: "Dashboard", href: "/collector/dashboard", icon: LayoutDashboard },
    { label: "My Assignments", href: "/collector/assignments", icon: FileText },
    { label: "Route Map", href: "/collector/map", icon: Map },
    { label: "History", href: "/collector/history", icon: Calendar },
    { label: "Notifications", href: "/collector/notifications", icon: Bell },
    { label: "Settings", href: "/collector/settings", icon: Settings },
  ],
  admin: [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Requests", href: "/admin/requests", icon: FileText },
    { label: "Collectors", href: "/admin/collectors", icon: Truck },
    { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { label: "Map Overview", href: "/admin/map", icon: Map },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ],
};

export function Sidebar({ role }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const navItems = navItemsByRole[role] || [];

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-white border-r border-neutral-200 transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-200">
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
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
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
          const isActive = pathname === item.href;
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
      <div className="p-3 border-t border-neutral-200 space-y-1">
        <Link
          href="/help"
          className="flex items-center gap-3 px-3 py-2.5 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 rounded-lg transition-colors"
        >
          <HelpCircle className="w-5 h-5 shrink-0 text-neutral-400" />
          {!collapsed && <span className="font-medium">Help</span>}
        </Link>
        <button className="flex items-center gap-3 w-full px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="font-medium">Log out</span>}
        </button>
      </div>
    </aside>
  );
}
