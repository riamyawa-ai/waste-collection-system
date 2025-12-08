"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  LayoutDashboard,
  FileText,
  Map,
  Bell,
  Settings,
  Recycle,
  Users,
  Truck,
  BarChart3,
  Calendar,
  LogOut,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface MobileNavProps {
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
  ],
  collector: [
    { label: "Dashboard", href: "/collector/dashboard", icon: LayoutDashboard },
    { label: "My Assignments", href: "/collector/assignments", icon: FileText },
    { label: "Route Map", href: "/collector/map", icon: Map },
    { label: "Notifications", href: "/collector/notifications", icon: Bell },
  ],
  admin: [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Requests", href: "/admin/requests", icon: FileText },
    { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  ],
};

export function MobileNav({ role }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const navItems = navItemsByRole[role] || [];

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-200">
        <div className="flex items-center justify-between h-14 px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600">
              <Recycle className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-neutral-900">
              EcoCollect
            </span>
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-neutral-600"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={cn(
          "md:hidden fixed top-14 left-0 bottom-0 z-50 w-72 bg-white border-r border-neutral-200 transform transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors",
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "text-neutral-600 hover:bg-neutral-100"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5",
                    isActive ? "text-primary-600" : "text-neutral-400"
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-200">
          <button className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Log out</span>
          </button>
        </div>
      </div>
    </>
  );
}
