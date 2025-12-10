"use client";

import { PageHeader } from "@/components/ui";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  StaffDashboardStats,
  StaffQuickActions,
  StaffRecentActivity,
} from "@/components/staff";
import { EcoCard, EcoCardContent } from "@/components/ui";
import { Plus, FileText, Users } from "lucide-react";

export default function StaffDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Dashboard"
        description="Manage collection requests, users, and coordinate with collectors."
      >
        <div className="flex gap-3">
          <Link href="/staff/collections">
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              View Requests
            </Button>
          </Link>
          <Link href="/staff/users">
            <Button>
              <Users className="w-4 h-4 mr-2" />
              Manage Users
            </Button>
          </Link>
        </div>
      </PageHeader>

      {/* Stats */}
      <StaffDashboardStats />

      {/* Quick Actions */}
      <section>
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          Quick Actions
        </h2>
        <StaffQuickActions />
      </section>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <StaffRecentActivity />

        {/* Announcements Quick Access */}
        <EcoCard>
          <EcoCardContent>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">
                Announcements
              </h3>
              <Link href="/staff/announcements">
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-blue-600">💡</span>
                  <span className="text-sm font-medium text-blue-900">
                    System Update Available
                  </span>
                </div>
                <p className="text-xs text-blue-700">
                  New features have been added to the collection management
                  module.
                </p>
              </div>
              <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-yellow-600">⚠️</span>
                  <span className="text-sm font-medium text-yellow-900">
                    Holiday Schedule
                  </span>
                </div>
                <p className="text-xs text-yellow-700">
                  Remember to update collection schedules for the upcoming
                  holiday.
                </p>
              </div>
            </div>
            <Link
              href="/staff/announcements"
              className="block text-center text-sm text-primary-600 hover:text-primary-700 mt-4"
            >
              View all announcements →
            </Link>
          </EcoCardContent>
        </EcoCard>
      </div>
    </div>
  );
}
