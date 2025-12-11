"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Menu,
  X,
  LayoutDashboard,
  FileText,

  Bell,
  Settings,
  Recycle,
  Users,
  Truck,
  BarChart3,
  Calendar,
  LogOut,
  CreditCard,
  MessageSquare,
  Megaphone,
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
