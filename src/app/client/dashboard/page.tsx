import { DashboardLayout } from "@/components/layouts";
import { PageHeader, StatCard, EcoCard, EcoCardContent } from "@/components/ui";
import { FileText, Clock, CheckCircle2, Truck } from "lucide-react";

export default function ClientDashboard() {
  return (
    <DashboardLayout role="client">
      <PageHeader
        title="Welcome back!"
        description="Here's an overview of your waste collection requests."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <StatCard
          title="Total Requests"
          value={12}
          icon={FileText}
          trend={{ value: 8, isPositive: true }}
          description="this month"
        />
        <StatCard
          title="Pending"
          value={2}
          icon={Clock}
          description="awaiting pickup"
        />
        <StatCard
          title="Completed"
          value={9}
          icon={CheckCircle2}
          trend={{ value: 12, isPositive: true }}
          description="this month"
        />
        <StatCard
          title="In Progress"
          value={1}
          icon={Truck}
          description="being collected"
        />
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          Recent Requests
        </h2>
        <EcoCard>
          <EcoCardContent className="p-8 text-center text-neutral-500">
            Your recent collection requests will appear here.
            <br />
            <span className="text-sm">(Coming in Day 2+)</span>
          </EcoCardContent>
        </EcoCard>
      </div>
    </DashboardLayout>
  );
}
