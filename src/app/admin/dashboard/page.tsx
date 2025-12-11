'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database.types';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Users,
  TrendingUp,
  DollarSign,
  Truck,
  UserCheck,
  Activity,
  Settings,
  FileText,
  Shield,
  ClipboardList,
  Bell,
  BarChart3,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface AdminStats {
  totalUsers: number;
  userGrowthRate: number;
  totalRevenueAllTime: number;
  revenueThisMonth: number;
  activeUsersOnline: number;
  totalCollectionsToday: number;
  totalCollectionsThisWeek: number;
  totalCollectionsThisMonth: number;
  pendingRequests: number;
  activeCollectors: number;
  usersByRole: {
    admin: number;
    staff: number;
    client: number;
    collector: number;
  };
}

interface RecentActivity {
  id: string;
  type: 'registration' | 'request' | 'payment' | 'collection';
  description: string;
  timestamp: string;
  user?: string;
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
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Fetch all stats in parallel
      const [
        profilesResult,
        requestsResult,
        paymentsResult,
        attendanceResult,
        recentProfilesResult,
        recentRequestsResult,
      ] = await Promise.all([
        supabase.from('profiles').select('role, status, created_at'),
        supabase.from('collection_requests').select('status, completed_at, created_at'),
        supabase.from('payments').select('amount, status, created_at'),
        supabase.from('collector_attendance').select('collector_id, date, logout_time').eq('date', today).is('logout_time', null),
        supabase.from('profiles').select('id, full_name, role, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('collection_requests').select('id, request_number, status, created_at, client:profiles!collection_requests_client_id_fkey(full_name)').order('created_at', { ascending: false }).limit(5),
      ]);

      const profiles = profilesResult.data || [];
      const requests = requestsResult.data || [];
      const payments = paymentsResult.data || [];

      // Calculate user role distribution
      const usersByRole = profiles.reduce((acc, p) => {
        acc[p.role as keyof typeof acc] = (acc[p.role as keyof typeof acc] || 0) + 1;
        return acc;
      }, { admin: 0, staff: 0, client: 0, collector: 0 });

      // Calculate user growth rate (users created this month vs last month)
      const thisMonthUsers = profiles.filter(p => p.created_at && p.created_at >= monthAgo).length;
      const totalUsers = profiles.length;
      const userGrowthRate = totalUsers > 0 ? Math.round((thisMonthUsers / totalUsers) * 100) : 0;

      // Calculate collections
      const completedRequests = requests.filter(r => r.status === 'completed');
      const collectionsToday = completedRequests.filter(r => r.completed_at?.startsWith(today)).length;
      const collectionsThisWeek = completedRequests.filter(r => r.completed_at && r.completed_at >= weekAgo).length;
      const collectionsThisMonth = completedRequests.filter(r => r.completed_at && r.completed_at >= monthAgo).length;

      // Calculate revenue
      const completedPayments = payments.filter(p => p.status === 'completed');
      const totalRevenueAllTime = completedPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      const revenueThisMonth = completedPayments
        .filter(p => p.created_at && p.created_at >= monthAgo)
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

      // Pending requests
      const pendingRequests = requests.filter(r => r.status === 'pending').length;

      // Active collectors (currently logged in)
      const activeCollectors = attendanceResult.data?.length || 0;

      setStats({
        totalUsers,
        userGrowthRate,
        totalRevenueAllTime,
        revenueThisMonth,
        activeUsersOnline: activeCollectors, // Simplified - just collectors for now
        totalCollectionsToday: collectionsToday,
        totalCollectionsThisWeek: collectionsThisWeek,
        totalCollectionsThisMonth: collectionsThisMonth,
        pendingRequests,
        activeCollectors,
        usersByRole,
      });

      // Build recent activities
      const activities: RecentActivity[] = [];

      recentProfilesResult.data?.forEach(p => {
        activities.push({
          id: `reg-${p.id}`,
          type: 'registration',
          description: `New ${p.role} registered: ${p.full_name}`,
          timestamp: p.created_at || '',
          user: p.full_name || undefined,
        });
      });

      recentRequestsResult.data?.forEach(r => {
        const clientName = (r.client as { full_name: string } | null)?.full_name;
        activities.push({
          id: `req-${r.id}`,
          type: 'request',
          description: `Request ${r.request_number} - ${r.status}`,
          timestamp: r.created_at || '',
          user: clientName || undefined,
        });
      });

      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentActivities(activities.slice(0, 10));

      setIsLoading(false);
    };

    fetchData();
  }, []);

  const quickActions = [
    { label: 'System Configuration', icon: Settings, href: '/admin/settings', color: 'text-purple-600' },
    { label: 'View System Logs', icon: Activity, href: '/admin/logs', color: 'text-blue-600' },
    { label: 'Generate Reports', icon: FileText, href: '/admin/reports', color: 'text-green-600' },
    { label: 'Manage Roles', icon: Shield, href: '/admin/roles', color: 'text-orange-600' },
    { label: 'User Management', icon: Users, href: '/staff/users', color: 'text-indigo-600' },
    { label: 'View All Requests', icon: ClipboardList, href: '/staff/collections', color: 'text-teal-600' },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'registration': return <Users className="h-4 w-4 text-blue-500" />;
      case 'request': return <ClipboardList className="h-4 w-4 text-green-500" />;
      case 'payment': return <DollarSign className="h-4 w-4 text-emerald-500" />;
      case 'collection': return <Truck className="h-4 w-4 text-orange-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <PageHeader title="Admin Dashboard" description="Loading..." />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-100 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Admin Dashboard"
        description="System overview and administration controls"
      />

      {/* Primary Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={Users}
          trend={`+${stats?.userGrowthRate || 0}% this month`}
          trendUp={true}
          variant="primary"
        />
        <StatCard
          title="Revenue (All Time)"
          value={`₱${(stats?.totalRevenueAllTime || 0).toLocaleString()}`}
          icon={DollarSign}
          description={`₱${(stats?.revenueThisMonth || 0).toLocaleString()} this month`}
          variant="success"
        />
        <StatCard
          title="Collections Today"
          value={stats?.totalCollectionsToday || 0}
          icon={Truck}
          description={`${stats?.totalCollectionsThisWeek || 0} this week`}
          variant="info"
        />
        <StatCard
          title="Active Collectors"
          value={stats?.activeCollectors || 0}
          icon={UserCheck}
          description="Currently on duty"
          variant="warning"
        />
      </div>

      {/* Secondary Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Pending Requests"
          value={stats?.pendingRequests || 0}
          icon={Clock}
          description="Awaiting review"
          variant="warning"
        />
        <StatCard
          title="Collections This Month"
          value={stats?.totalCollectionsThisMonth || 0}
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          title="User Growth"
          value={`${stats?.userGrowthRate || 0}%`}
          icon={TrendingUp}
          description="This month"
          variant="primary"
        />
        <StatCard
          title="System Status"
          value="Online"
          icon={Activity}
          description="All systems operational"
          variant="success"
        />
      </div>

      {/* User Distribution & Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* User Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              Users by Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats?.usersByRole || {}).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {role}
                    </Badge>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-green-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {quickActions.map((action) => (
                <Link key={action.label} href={action.href}>
                  <Button
                    variant="outline"
                    className="w-full h-auto py-4 flex flex-col items-center gap-2 hover:bg-green-50 hover:border-green-300 transition-colors"
                  >
                    <action.icon className={`h-6 w-6 ${action.color}`} />
                    <span className="text-sm text-center">{action.label}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-green-600" />
            Recent Activity
          </CardTitle>
          <Link href="/admin/logs">
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4 mr-1" />
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              {recentActivities.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No recent activity</p>
              ) : (
                recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.description}
                      </p>
                      {activity.user && (
                        <p className="text-xs text-gray-500">by {activity.user}</p>
                      )}
                    </div>
                    <time className="text-xs text-gray-400 whitespace-nowrap">
                      {activity.timestamp && format(new Date(activity.timestamp), 'MMM d, h:mm a')}
                    </time>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
