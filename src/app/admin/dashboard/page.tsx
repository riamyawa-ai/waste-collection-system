import { DashboardLayout } from "@/components/layouts";
import { PageHeader, StatCard, EcoCard, EcoCardContent, Button } from "@/components/ui";
import { Users, FileText, Truck, BarChart3, TrendingUp, AlertTriangle } from "lucide-react";

export default function AdminDashboard() {
  return (
    <DashboardLayout role="admin">
      <PageHeader
        title="Admin Dashboard"
        description="System-wide overview and management."
      >
        <Button variant="outline">Generate Report</Button>
        <Button>Add User</Button>
      </PageHeader>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mt-6">
        <StatCard
          title="Total Users"
          value="1,234"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Total Requests"
          value="5,678"
          icon={FileText}
        />
        <StatCard
          title="Active Collectors"
          value={15}
          icon={Truck}
        />
        <StatCard
          title="Completion Rate"
          value="94%"
          icon={TrendingUp}
          trend={{ value: 3, isPositive: true }}
        />
        <StatCard
          title="Avg Response Time"
          value="2.4h"
          icon={BarChart3}
        />
        <StatCard
          title="Issues"
          value={3}
          icon={AlertTriangle}
        />
      </div>

      {/* Content Grid */}
      <div className="mt-8 grid lg:grid-cols-3 gap-6">
        <EcoCard className="lg:col-span-2">
          <EcoCardContent>
            <h3 className="font-semibold text-neutral-900 mb-4">
              Collection Analytics
            </h3>
            <div className="h-64 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-500">
              Charts coming in Day 7...
            </div>
          </EcoCardContent>
        </EcoCard>
        <EcoCard>
          <EcoCardContent>
            <h3 className="font-semibold text-neutral-900 mb-4">
              System Health
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">API Status</span>
                <span className="text-green-600 font-medium">● Online</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Database</span>
                <span className="text-green-600 font-medium">● Healthy</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">MapBox</span>
                <span className="text-green-600 font-medium">● Connected</span>
              </div>
            </div>
          </EcoCardContent>
        </EcoCard>
      </div>
    </DashboardLayout>
  );
}
