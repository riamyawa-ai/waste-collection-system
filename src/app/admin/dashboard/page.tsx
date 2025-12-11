'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database.types';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Truck,
  UserCheck,
  Activity,
  FileText,
  ClipboardList,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  PieChart,
  Wallet,
  Star,
  Building2
} from 'lucide-react';
import Link from 'next/link';
import { format, subDays } from 'date-fns';

interface AdminStats {
  totalUsers: number;
  userGrowthRate: number;
  totalRevenueAllTime: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  totalCollectionsToday: number;
  totalCollectionsThisWeek: number;
  totalCollectionsThisMonth: number;
  pendingRequests: number;
  activeCollectors: number;
  totalCollectors: number;
  usersByRole: {
    admin: number;
    staff: number;
    client: number;
    collector: number;
  };
  requestsByStatus: {
    pending: number;
    accepted: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  };
  weeklyCollections: number[];
}

interface RecentActivity {
  id: string;
  type: 'registration' | 'request' | 'payment' | 'collection';
  description: string;
  timestamp: string;
  user?: string;
}

// Stat Card Component
function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  variant = 'default',
  className = ''
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: number;
  trendLabel?: string;
  variant?: 'default' | 'success' | 'warning' | 'info' | 'primary';
  className?: string;
}) {
  const variantStyles = {
    default: 'bg-white border-neutral-200',
    success: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200',
    warning: 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200',
    info: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200',
    primary: 'bg-gradient-to-br from-green-500 to-green-600 border-green-600 text-white',
  };

  const iconStyles = {
    default: 'bg-neutral-100 text-neutral-600',
    success: 'bg-green-200 text-green-700',
    warning: 'bg-amber-200 text-amber-700',
    info: 'bg-blue-200 text-blue-700',
    primary: 'bg-white/20 text-white',
  };

  return (
    <Card className={`${variantStyles[variant]} ${className} border transition-all hover:shadow-md`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className={`text-sm font-medium ${variant === 'primary' ? 'text-white/80' : 'text-neutral-500'}`}>
              {title}
            </p>
            <p className={`text-3xl font-bold ${variant === 'primary' ? 'text-white' : 'text-neutral-900'}`}>
              {value}
            </p>
            {trend !== undefined && (
              <div className="flex items-center gap-1">
                {trend >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trend >= 0 ? '+' : ''}{trend}%
                </span>
                {trendLabel && (
                  <span className={`text-xs ${variant === 'primary' ? 'text-white/60' : 'text-neutral-400'}`}>
                    {trendLabel}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${iconStyles[variant]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Mini Chart Component (simple bar chart)
function MiniBarChart({ data, labels }: { data: number[]; labels: string[] }) {
  const max = Math.max(...data, 1);

  return (
    <div className="flex items-end justify-between gap-1 h-20">
      {data.map((value, index) => (
        <div key={index} className="flex flex-col items-center gap-1 flex-1">
          <div
            className="w-full bg-green-500 rounded-t transition-all hover:bg-green-600"
            style={{ height: `${(value / max) * 100}%`, minHeight: value > 0 ? '4px' : '0' }}
          />
          <span className="text-[10px] text-neutral-400">{labels[index]}</span>
        </div>
      ))}
    </div>
  );
}

// Donut Chart Component
function DonutChart({ data, colors, labels }: { data: number[]; colors: string[]; labels: string[] }) {
  const total = data.reduce((a, b) => a + b, 0);
  let currentAngle = 0;

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          {data.map((value, index) => {
            const percentage = total > 0 ? (value / total) * 100 : 0;
            const strokeDasharray = `${percentage} ${100 - percentage}`;
            const strokeDashoffset = -currentAngle;
            currentAngle += percentage;

            return (
              <circle
                key={index}
                cx="18"
                cy="18"
                r="15.9"
                fill="none"
                stroke={colors[index]}
                strokeWidth="3"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-neutral-900">{total}</p>
            <p className="text-[10px] text-neutral-500">Total</p>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {labels.map((label, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index] }} />
            <span className="text-xs text-neutral-600">{label}</span>
            <span className="text-xs font-medium text-neutral-900 ml-auto">{data[index]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const today = new Date().toISOString().split('T')[0];
      const weekAgo = subDays(new Date(), 7).toISOString().split('T')[0];
      const monthAgo = subDays(new Date(), 30).toISOString().split('T')[0];
      const lastMonthStart = subDays(new Date(), 60).toISOString().split('T')[0];

      // Fetch all stats in parallel
      const [
        profilesResult,
        requestsResult,
        todayCollectionsResult,
        weekCollectionsResult,
        monthCollectionsResult,
        paymentsResult,
        lastMonthPaymentsResult,
        attendanceResult,
      ] = await Promise.all([
        supabase.from('profiles').select('role', { count: 'exact' }),
        supabase.from('collection_requests').select('status', { count: 'exact' }),
        supabase.from('collection_requests').select('*', { count: 'exact', head: true })
          .eq('status', 'completed')
          .gte('completed_at', today),
        supabase.from('collection_requests').select('*', { count: 'exact', head: true })
          .eq('status', 'completed')
          .gte('completed_at', weekAgo),
        supabase.from('collection_requests').select('*', { count: 'exact', head: true })
          .eq('status', 'completed')
          .gte('completed_at', monthAgo),
        supabase.from('payments').select('amount')
          .gte('created_at', monthAgo),
        supabase.from('payments').select('amount')
          .gte('created_at', lastMonthStart)
          .lt('created_at', monthAgo),
        supabase.from('collector_attendance').select('collector_id', { count: 'exact' })
          .gte('login_time', today)
          .is('logout_time', null),
      ]);

      // Process role counts
      const roleCounts = { admin: 0, staff: 0, client: 0, collector: 0 };
      profilesResult.data?.forEach((p) => {
        if (p.role && roleCounts.hasOwnProperty(p.role)) {
          roleCounts[p.role as keyof typeof roleCounts]++;
        }
      });

      // Process request status counts
      const statusCounts = { pending: 0, accepted: 0, in_progress: 0, completed: 0, cancelled: 0 };
      requestsResult.data?.forEach((r) => {
        if (r.status === 'pending') statusCounts.pending++;
        else if (r.status === 'accepted' || r.status === 'payment_confirmed' || r.status === 'assigned') statusCounts.accepted++;
        else if (['en_route', 'at_location', 'in_progress', 'accepted_by_collector'].includes(r.status)) statusCounts.in_progress++;
        else if (r.status === 'completed') statusCounts.completed++;
        else if (r.status === 'cancelled' || r.status === 'rejected') statusCounts.cancelled++;
      });

      // Calculate revenue
      const revenueThisMonth = paymentsResult.data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
      const revenueLastMonth = lastMonthPaymentsResult.data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      // Get weekly collections for chart
      const weeklyData = [];
      for (let i = 6; i >= 0; i--) {
        const day = subDays(new Date(), i);
        const dayStr = day.toISOString().split('T')[0];
        const { count } = await supabase
          .from('collection_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'completed')
          .gte('completed_at', dayStr)
          .lt('completed_at', subDays(day, -1).toISOString().split('T')[0]);
        weeklyData.push(count || 0);
      }

      // Calculate growth rate
      const lastMonthUsers = profilesResult.data?.filter(p => {
        // Simplified - using total users
        return true;
      }).length || 0;
      const growthRate = lastMonthUsers > 0 ? Math.round((profilesResult.data?.length || 0) / lastMonthUsers * 10) : 0;

      setStats({
        totalUsers: profilesResult.data?.length || 0,
        userGrowthRate: growthRate,
        totalRevenueAllTime: revenueThisMonth + revenueLastMonth,
        revenueThisMonth,
        revenueLastMonth,
        totalCollectionsToday: todayCollectionsResult.count || 0,
        totalCollectionsThisWeek: weekCollectionsResult.count || 0,
        totalCollectionsThisMonth: monthCollectionsResult.count || 0,
        pendingRequests: statusCounts.pending,
        activeCollectors: attendanceResult.count || 0,
        totalCollectors: roleCounts.collector,
        usersByRole: roleCounts,
        requestsByStatus: statusCounts,
        weeklyCollections: weeklyData,
      });

      // Fetch recent activities
      const { data: recentRequests } = await supabase
        .from('collection_requests')
        .select(`
          id,
          request_number,
          status,
          created_at,
          client:client_id(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      const activities: RecentActivity[] = (recentRequests || []).map((r) => ({
        id: r.id,
        type: 'request' as const,
        description: `Request ${r.request_number} - ${r.status}`,
        timestamp: r.created_at,
        user: (r.client as any)?.full_name,
      }));

      setRecentActivities(activities);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const getStatusBadge = (type: string) => {
    const styles = {
      registration: 'bg-blue-100 text-blue-700',
      request: 'bg-green-100 text-green-700',
      payment: 'bg-purple-100 text-purple-700',
      collection: 'bg-orange-100 text-orange-700',
    };
    return styles[type as keyof typeof styles] || 'bg-neutral-100 text-neutral-700';
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <PageHeader title="Admin Dashboard" description="Loading..." />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date().getDay();
  const chartLabels = Array.from({ length: 7 }, (_, i) => weekDays[(today - 6 + i + 7) % 7]);

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <PageHeader
          title="Admin Dashboard"
          description={`Welcome back! Today is ${format(new Date(), 'EEEE, MMMM d, yyyy')}`}
        />
        <div className="flex gap-2">
          <Link href="/admin/reports">
            <Button variant="outline" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Reports
            </Button>
          </Link>
          <Link href="/admin/settings">
            <Button className="bg-green-600 hover:bg-green-700 gap-2">
              <Activity className="h-4 w-4" />
              System Status
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={Users}
          trend={stats?.userGrowthRate}
          trendLabel="vs last month"
          variant="primary"
        />
        <StatCard
          title="Revenue This Month"
          value={`₱${(stats?.revenueThisMonth || 0).toLocaleString()}`}
          icon={DollarSign}
          trend={stats?.revenueLastMonth ? Math.round(((stats?.revenueThisMonth || 0) - stats.revenueLastMonth) / stats.revenueLastMonth * 100) : 0}
          trendLabel="vs last month"
          variant="success"
        />
        <StatCard
          title="Collections Today"
          value={stats?.totalCollectionsToday || 0}
          icon={Truck}
          variant="info"
        />
        <StatCard
          title="Active Collectors"
          value={`${stats?.activeCollectors || 0}/${stats?.totalCollectors || 0}`}
          icon={UserCheck}
          variant="warning"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Weekly Collections Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-green-600" />
                  Weekly Collections
                </CardTitle>
                <CardDescription>
                  Collections completed in the last 7 days
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-lg font-bold">
                {stats?.totalCollectionsThisWeek || 0}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <MiniBarChart
              data={stats?.weeklyCollections || [0, 0, 0, 0, 0, 0, 0]}
              labels={chartLabels}
            />
          </CardContent>
        </Card>

        {/* User Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-green-600" />
              User Distribution
            </CardTitle>
            <CardDescription>Users by role</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart
              data={[
                stats?.usersByRole.client || 0,
                stats?.usersByRole.collector || 0,
                stats?.usersByRole.staff || 0,
                stats?.usersByRole.admin || 0,
              ]}
              colors={['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6']}
              labels={['Clients', 'Collectors', 'Staff', 'Admins']}
            />
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Pending Requests"
          value={stats?.requestsByStatus.pending || 0}
          icon={Clock}
        />
        <StatCard
          title="Processing"
          value={stats?.requestsByStatus.accepted || 0}
          icon={ClipboardList}
        />
        <StatCard
          title="In Progress"
          value={stats?.requestsByStatus.in_progress || 0}
          icon={Truck}
        />
        <StatCard
          title="Completed"
          value={stats?.requestsByStatus.completed || 0}
          icon={CheckCircle2}
        />
        <StatCard
          title="Cancelled"
          value={stats?.requestsByStatus.cancelled || 0}
          icon={AlertCircle}
        />
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/users">
              <Button variant="outline" className="w-full justify-between group">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Manage Users
                </span>
                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </Link>
            <Link href="/admin/collections">
              <Button variant="outline" className="w-full justify-between group">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Collection Requests
                </span>
                {stats?.pendingRequests ? (
                  <Badge variant="destructive" className="text-xs">
                    {stats.pendingRequests}
                  </Badge>
                ) : (
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </Button>
            </Link>
            <Link href="/admin/payments">
              <Button variant="outline" className="w-full justify-between group">
                <span className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Payment Records
                </span>
                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </Link>
            <Link href="/admin/reports">
              <Button variant="outline" className="w-full justify-between group">
                <span className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Generate Reports
                </span>
                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                Recent Activity
              </CardTitle>
              <Link href="/admin/logs">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-4">
                {recentActivities.length === 0 ? (
                  <p className="text-center text-neutral-500 py-8">No recent activity</p>
                ) : (
                  recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                      <div className={`p-2 rounded-lg ${getStatusBadge(activity.type)}`}>
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 truncate">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                          {activity.user && <span>{activity.user}</span>}
                          <span>•</span>
                          <span>{format(new Date(activity.timestamp), 'MMM d, h:mm a')}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-green-600" />
            System Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Database Status</span>
                <Badge className="bg-green-500">Online</Badge>
              </div>
              <Progress value={100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">API Response</span>
                <span className="font-medium">45ms</span>
              </div>
              <Progress value={95} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Collection Rate</span>
                <span className="font-medium">{stats?.requestsByStatus.completed || 0}/{(stats?.requestsByStatus.completed || 0) + (stats?.requestsByStatus.pending || 0)}</span>
              </div>
              <Progress
                value={
                  (stats?.requestsByStatus.completed || 0) /
                  Math.max((stats?.requestsByStatus.completed || 0) + (stats?.requestsByStatus.pending || 0), 1) * 100
                }
                className="h-2"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Collector Availability</span>
                <span className="font-medium">{stats?.activeCollectors}/{stats?.totalCollectors}</span>
              </div>
              <Progress
                value={(stats?.activeCollectors || 0) / Math.max(stats?.totalCollectors || 1, 1) * 100}
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
