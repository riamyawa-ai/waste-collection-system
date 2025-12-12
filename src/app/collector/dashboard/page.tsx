'use client';

import { useEffect, useState, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database.types';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { clockIn, clockOut, getCollectorDashboardStats, getAssignedRequests } from '@/lib/actions/collector';
import { getProfile } from '@/lib/actions/profile';
import { toast } from 'sonner';
import { format } from 'date-fns';
import Link from 'next/link';
import {
  Truck,
  ClipboardList,
  Clock,
  CheckCircle2,
  Star,
  MapPin,
  Play,
  LogIn,
  LogOut,
  AlertCircle,
  Calendar,
  Navigation,
  Phone,
  User,
  ChevronRight,
  Timer
} from 'lucide-react';
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_COLORS, PRIORITY_LABELS } from '@/constants/status';

interface CollectorStats {
  todays_routes: number;
  assigned_requests: number;
  in_progress: number;
  completed_today: number;
  average_rating: number;
  pending_feedback: number;
}

interface AttendanceStatus {
  isClockedIn: boolean;
  clockInTime: string | null;
  totalDurationToday: string;
}

interface AssignedRequest {
  id: string;
  request_number: string;
  status: string;
  priority: string;
  barangay: string;
  address: string;
  preferred_date: string;
  preferred_time_slot: string;
  client: {
    full_name: string;
    phone: string;
  } | null;
}

export default function CollectorDashboardPage() {
  const [stats, setStats] = useState<CollectorStats | null>(null);
  const [attendance, setAttendance] = useState<AttendanceStatus>({
    isClockedIn: false,
    clockInTime: null,
    totalDurationToday: '0h 0m',
  });
  const [assignedRequests, setAssignedRequests] = useState<AssignedRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClockingIn, setIsClockingIn] = useState(false);
  const [isClockingOut, setIsClockingOut] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState('Welcome back!');

  const fetchData = useCallback(async () => {
    const supabase = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch stats
    const statsResult = await getCollectorDashboardStats();
    if (statsResult.data) {
      setStats(statsResult.data);
    }

    // Fetch profile for welcome message
    const profileResult = await getProfile();
    if (profileResult.success && profileResult.data) {
      const isFirstVisit = !profileResult.data.last_login_at;
      const firstName = profileResult.data.first_name || '';
      setWelcomeMessage(isFirstVisit
        ? `Welcome${firstName ? `, ${firstName}` : ''}!`
        : `Welcome back${firstName ? `, ${firstName}` : ''}!`);
    }

    // Fetch assigned requests
    const requestsResult = await getAssignedRequests({ limit: 5 });
    if (requestsResult.data) {
      setAssignedRequests(requestsResult.data as unknown as AssignedRequest[]);
    }

    // Check attendance status
    const today = new Date().toISOString().split('T')[0];
    const { data: attendanceData } = await supabase
      .from('collector_attendance')
      .select('*')
      .eq('collector_id', user.id)
      .eq('date', today)
      .order('login_time', { ascending: false })
      .limit(1)
      .single();

    if (attendanceData) {
      const isClockedIn = !attendanceData.logout_time;
      let totalDuration = '0h 0m';

      if (attendanceData.login_time) {
        const start = new Date(attendanceData.login_time);
        const end = attendanceData.logout_time ? new Date(attendanceData.logout_time) : new Date();
        const diffMs = end.getTime() - start.getTime();
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        totalDuration = `${hours}h ${minutes}m`;
      }

      setAttendance({
        isClockedIn,
        clockInTime: attendanceData.login_time,
        totalDurationToday: totalDuration,
      });
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      await fetchData();
      if (isMounted) {
        setIsLoading(false);
      }
    };

    loadData();

    // Refresh every minute for duration updates
    const interval = setInterval(fetchData, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [fetchData]);

  const handleClockIn = async () => {
    setIsClockingIn(true);
    const result = await clockIn();
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Clocked in successfully!');
      fetchData();
    }
    setIsClockingIn(false);
  };

  const handleClockOut = async () => {
    setIsClockingOut(true);
    const result = await clockOut();
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Clocked out successfully!');
      fetchData();
    }
    setIsClockingOut(false);
  };

  const getStatusBadge = (status: string) => {
    const colors = STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.pending;
    return (
      <Badge className={`${colors.bg} ${colors.text} ${colors.border}`}>
        {STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors = PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.low;
    return (
      <Badge variant="outline" className={`${colors.bg} ${colors.text} ${colors.border}`}>
        {PRIORITY_LABELS[priority as keyof typeof PRIORITY_LABELS] || priority}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <PageHeader title="Collector Dashboard" description="Loading..." />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map(i => (
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
      <div className="flex items-center justify-between">
        <PageHeader
          title="Collector Dashboard"
          description={`${welcomeMessage} Today is ${format(new Date(), 'EEEE, MMMM d, yyyy')}`}
        />

        {/* Attendance Clock In/Out */}
        <div className="flex items-center gap-4">
          {attendance.isClockedIn ? (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Clocked in at</p>
                <p className="font-medium text-green-600">
                  {attendance.clockInTime && format(new Date(attendance.clockInTime), 'h:mm a')}
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={handleClockOut}
                disabled={isClockingOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                {isClockingOut ? 'Clocking Out...' : 'Clock Out'}
              </Button>
            </div>
          ) : (
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleClockIn}
              disabled={isClockingIn}
            >
              <LogIn className="h-4 w-4 mr-2" />
              {isClockingIn ? 'Clocking In...' : 'Clock In'}
            </Button>
          )}
        </div>
      </div>

      {/* Attendance Warning */}
      {!attendance.isClockedIn && (
        <Card className="border-yellow-300 bg-yellow-50">
          <CardContent className="py-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <p className="text-yellow-800">
              You are not clocked in. Please clock in to start receiving assignments.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Today's Routes"
          value={stats?.todays_routes || 0}
          icon={Truck}
        />
        <StatCard
          title="Assigned Requests"
          value={stats?.assigned_requests || 0}
          icon={ClipboardList}
          description="Pending acceptance"
        />
        <StatCard
          title="In Progress"
          value={stats?.in_progress || 0}
          icon={Clock}
          description="Currently servicing"
        />
        <StatCard
          title="Completed Today"
          value={stats?.completed_today || 0}
          icon={CheckCircle2}
        />
        <StatCard
          title="Average Rating"
          value={stats?.average_rating?.toFixed(1) || '0.0'}
          icon={Star}
          description="From clients"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Attendance & Shift Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-green-600" />
              Today&apos;s Shift
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Status</span>
              <Badge className={attendance.isClockedIn ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                {attendance.isClockedIn ? 'On Duty' : 'Off Duty'}
              </Badge>
            </div>
            {attendance.isClockedIn && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Clock In Time</span>
                  <span className="font-medium">
                    {attendance.clockInTime && format(new Date(attendance.clockInTime), 'h:mm a')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-medium text-green-600">{attendance.totalDurationToday}</span>
                </div>
              </>
            )}
            <div className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Shift Progress</span>
                <span className="text-sm font-medium">75%</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-green-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/collector/schedule">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                View Full Schedule
              </Button>
            </Link>
            <Link href="/collector/requests">
              <Button variant="outline" className="w-full justify-start">
                <ClipboardList className="h-4 w-4 mr-2" />
                View All Requests
              </Button>
            </Link>
            <Button variant="outline" className="w-full justify-start" disabled={!attendance.isClockedIn}>
              <Navigation className="h-4 w-4 mr-2" />
              Navigate to Next Stop
            </Button>
            <Link href="/collector/feedback">
              <Button variant="outline" className="w-full justify-start">
                <Star className="h-4 w-4 mr-2" />
                View Feedback
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-green-600" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-4">
              <div className="text-5xl font-bold text-green-600 mb-2">
                {stats?.average_rating?.toFixed(1) || '0.0'}
              </div>
              <div className="flex items-center justify-center gap-1 text-yellow-500 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${star <= Math.round(stats?.average_rating || 0) ? 'fill-current' : ''}`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500">Average Rating</p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{stats?.completed_today || 0}</p>
                <p className="text-xs text-gray-500">Completed Today</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-xs text-gray-500">This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-green-600" />
              Assigned Requests
            </CardTitle>
            <CardDescription>Pending pickups requiring your action</CardDescription>
          </div>
          <Link href="/collector/requests">
            <Button variant="outline" size="sm">
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {assignedRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No assigned requests</p>
              <p className="text-sm">New assignments will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {assignedRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-green-100">
                      <MapPin className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{request.request_number}</span>
                        {getStatusBadge(request.status)}
                        {getPriorityBadge(request.priority)}
                      </div>
                      <p className="text-sm text-gray-600">{request.barangay}</p>
                      <p className="text-xs text-gray-500">{request.address}</p>
                      {request.client && (
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="flex items-center gap-1 text-gray-500">
                            <User className="h-3 w-3" />
                            {request.client.full_name}
                          </span>
                          <span className="flex items-center gap-1 text-gray-500">
                            <Phone className="h-3 w-3" />
                            {request.client.phone}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right text-sm">
                      <p className="font-medium">{request.preferred_date}</p>
                      <p className="text-gray-500">{request.preferred_time_slot}</p>
                    </div>
                    <Link href={`/collector/requests?id=${request.id}`}>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
