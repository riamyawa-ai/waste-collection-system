import { DashboardLayout } from "@/components/layouts";
import { PageHeader, StatCard, EcoCard, EcoCardContent } from "@/components/ui";
import { FileText, Map, CheckCircle2, Clock } from "lucide-react";

export default function CollectorDashboard() {
  return (
    <DashboardLayout role="collector">
      <PageHeader
        title="Collector Dashboard"
        description="View your assignments and optimize your collection route."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <StatCard
          title="Today's Assignments"
          value={8}
          icon={FileText}
        />
        <StatCard
          title="Completed"
          value={3}
          icon={CheckCircle2}
        />
        <StatCard
          title="Remaining"
          value={5}
          icon={Clock}
        />
        <StatCard
          title="Distance Left"
          value="12 km"
          icon={Map}
        />
      </div>

      {/* Map Placeholder */}
      <div className="mt-8">
        <EcoCard>
          <EcoCardContent className="p-8">
            <h3 className="font-semibold text-neutral-900 mb-4">
              Route Map
            </h3>
            <div className="h-64 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-500">
              MapBox integration coming in Day 5...
            </div>
          </EcoCardContent>
        </EcoCard>
      </div>
    </DashboardLayout>
  );
}
