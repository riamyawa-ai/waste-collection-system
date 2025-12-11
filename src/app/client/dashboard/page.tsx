import { Suspense } from 'react';
import { PageHeader } from '@/components/ui';
import {
  DashboardStats,
  DashboardStatsSkeleton,
  CollectionCalendar,
  CollectionCalendarSkeleton,
  QuickActions,
  RecentActivity,
  RecentActivitySkeleton,
} from '@/components/client';
import {
  getClientDashboardStats,
  getClientRecentActivity,
  getClientRequests,
} from '@/lib/actions/requests';
import type { RequestStatus } from '@/constants/status';

// Force dynamic rendering since this page uses authentication
export const dynamic = 'force-dynamic';

// Server component for fetching stats
async function DashboardStatsWrapper() {
  const result = await getClientDashboardStats();

  if (!result.success || !result.data) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-700">
        Unable to load statistics
      </div>
    );
  }

  return <DashboardStats stats={result.data} />;
}

// Server component for fetching calendar events
async function CalendarWrapper() {
  const result = await getClientRequests({ limit: 100 });

  const events = result.success && result.data?.requests
    ? result.data.requests.map((req: { id: string; preferred_date: string; status: string; request_number: string; barangay?: string; preferred_time_slot?: string }) => ({
      id: req.id,
      date: req.preferred_date,
      status: req.status as RequestStatus,
      title: req.request_number,
      barangay: req.barangay,
      time_slot: req.preferred_time_slot,
    }))
    : [];

  return <CollectionCalendar events={events} />;
}

// Server component for fetching recent activity
async function RecentActivityWrapper() {
  const result = await getClientRecentActivity(5);

  if (!result.success || !result.data) {
    return (
      <RecentActivity activities={[]} />
    );
  }

  return <RecentActivity activities={result.data as never[]} />;
}

export default function ClientDashboard() {
  return (
    <>
      <PageHeader
        title="Welcome back!"
        description="Here's an overview of your waste collection requests."
      />

      {/* Stats Grid */}
      <div className="mt-6">
        <Suspense fallback={<DashboardStatsSkeleton />}>
          <DashboardStatsWrapper />
        </Suspense>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Calendar and Activity - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Calendar */}
          <Suspense fallback={<CollectionCalendarSkeleton />}>
            <CalendarWrapper />
          </Suspense>

          {/* Recent Activity */}
          <Suspense fallback={<RecentActivitySkeleton />}>
            <RecentActivityWrapper />
          </Suspense>
        </div>

        {/* Quick Actions - Takes 1 column */}
        <div className="space-y-6">
          <QuickActions />

          {/* Announcements placeholder */}
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <div className="p-4 border-b border-neutral-200">
              <h3 className="font-semibold text-neutral-900">Announcements</h3>
            </div>
            <div className="p-6 text-center text-neutral-500">
              <p className="text-sm">No announcements at this time</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
