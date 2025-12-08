import { DashboardLayout } from "@/components/layouts";
import { PageHeader, StatCard, EcoCard, EcoCardContent, Button } from "@/components/ui";
import { FileText, Clock, CheckCircle2, Truck, Users, AlertTriangle } from "lucide-react";

export default function StaffDashboard() {
  return (
    <DashboardLayout role="staff">
      <PageHeader
        title="Staff Dashboard"
        description="Manage collection requests and coordinate with collectors."
      >
        <Button>View All Requests</Button>
      </PageHeader>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mt-6">
        <StatCard
          title="Total Requests"
          value={156}
          icon={FileText}
        />
        <StatCard
          title="Pending"
          value={23}
          icon={Clock}
        />
        <StatCard
          title="Scheduled"
          value={45}
          icon={Truck}
        />
        <StatCard
          title="Completed"
          value={82}
          icon={CheckCircle2}
        />
        <StatCard
          title="Urgent"
          value={6}
          icon={AlertTriangle}
        />
        <StatCard
          title="Active Collectors"
          value={8}
          icon={Users}
        />
      </div>

      {/* Content Area */}
      <div className="mt-8 grid lg:grid-cols-2 gap-6">
        <EcoCard>
          <EcoCardContent>
            <h3 className="font-semibold text-neutral-900 mb-4">
              Today&apos;s Schedule
            </h3>
            <p className="text-neutral-500 text-sm">
              Schedule management coming in Day 4...
            </p>
          </EcoCardContent>
        </EcoCard>
        <EcoCard>
          <EcoCardContent>
            <h3 className="font-semibold text-neutral-900 mb-4">
              Recent Activity
            </h3>
            <p className="text-neutral-500 text-sm">
              Activity feed coming in Day 4...
            </p>
          </EcoCardContent>
        </EcoCard>
      </div>
    </DashboardLayout>
  );
}
