'use client'

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { adminService } from '@/lib/admin-service';
import {
  Users,
  UserCheck,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Calendar,
  Activity
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  expiringUsers: number;
  totalRevenue: number;
  newUsersThisMonth: number;
}

interface RecentActivity {
  id: string;
  action_type: string;
  action_description: string;
  created_at: string;
}

function StatCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  color = 'blue',
  trend 
}: {
  title: string;
  value: string | number;
  description: string;
  icon: any;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  trend?: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    green: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    red: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          {value}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {description}
          </p>
          {trend && (
            <Badge variant="secondary" className="text-xs">
              {trend}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Quick Actions
        </CardTitle>
        <CardDescription>
          Common administrative tasks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button asChild variant="outline" className="justify-start h-12">
            <Link href="/admin/users/new">
              <Users className="mr-2 h-4 w-4" />
              Add New User
            </Link>
          </Button>
          <Button asChild variant="outline" className="justify-start h-12">
            <Link href="/admin/users">
              <UserCheck className="mr-2 h-4 w-4" />
              Manage Users
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentActivityCard({ activities, loading }: { activities: RecentActivity[]; loading: boolean }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'user_created':
        return <Users className="h-4 w-4 text-green-600" />;
      case 'membership_updated':
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case 'league_granted':
        return <Activity className="h-4 w-4 text-purple-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest administrative actions
            </CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/logs">View All</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getActionIcon(activity.action_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {activity.action_description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(activity.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recent activity</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsResult, activityResult] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getActivityLogs(1, 5)
        ]);
        
        setStats(statsResult);
        setRecentActivity(activityResult.logs);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return (
      <ProtectedRoute>
        <AdminLayout>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Error Loading Dashboard
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Dashboard Overview
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Monitor Psychobet's key metrics and activity
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </CardContent>
                </Card>
              ))
            ) : stats ? (
              <>
                <StatCard
                  title="Total Users"
                  value={stats.totalUsers}
                  description="Registered users"
                  icon={Users}
                  color="blue"
                />
                <StatCard
                  title="Active Users"
                  value={stats.activeUsers}
                  description="With active memberships"
                  icon={UserCheck}
                  color="green"
                />
                <StatCard
                  title="Expiring Soon"
                  value={stats.expiringUsers}
                  description="Within 30 days"
                  icon={AlertTriangle}
                  color="orange"
                />
                <StatCard
                  title="Monthly Revenue"
                  value={`$${stats.totalRevenue.toFixed(2)}`}
                  description="Active subscriptions"
                  icon={DollarSign}
                  color="green"
                />
                <StatCard
                  title="New This Month"
                  value={stats.newUsersThisMonth}
                  description="User registrations"
                  icon={TrendingUp}
                  color="purple"
                />
              </>
            ) : null}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <QuickActions />

            {/* Recent Activity */}
            <RecentActivityCard activities={recentActivity} loading={loading} />
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}