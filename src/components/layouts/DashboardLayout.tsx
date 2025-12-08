"use client";

import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { Bell, Search, User } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "client" | "staff" | "collector" | "admin";
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar role={role} />
      </div>

      {/* Mobile Navigation */}
      <MobileNav role={role} />

      {/* Main Content */}
      <div className="md:pl-64">
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
            <button className="relative p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" />
            </button>

            <div className="h-8 w-px bg-neutral-200" />

            <button className="flex items-center gap-3 p-1.5 pr-3 hover:bg-neutral-100 rounded-lg transition-colors">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="w-4 h-4 text-primary-600" />
              </div>
              <div className="text-left hidden lg:block">
                <div className="text-sm font-medium text-neutral-900">
                  Juan dela Cruz
                </div>
                <div className="text-xs text-neutral-500 capitalize">{role}</div>
              </div>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6 pt-18 md:pt-6">{children}</main>
      </div>
    </div>
  );
}
