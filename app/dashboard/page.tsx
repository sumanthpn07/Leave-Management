'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/hooks/use-auth';
import { useLeaveBalances, useMyLeaves } from '@/hooks/use-leaves';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, User, Calendar, Clock, Plus, Umbrella, Heart, Plane } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { data: leaveBalances, isLoading: balancesLoading } = useLeaveBalances();
  const { data: myLeaves, isLoading: leavesLoading } = useMyLeaves();

  // Filter for upcoming approved leaves
  const upcomingLeaves = myLeaves?.filter(leave => 
    leave.status === 'APPROVED' && 
    new Date(leave.startDate) > new Date()
  ).slice(0, 3) || [];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">
                  Leave Management System
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    {user?.firstName} {user?.lastName}
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {user?.role}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.firstName}!
              </h2>
              <p className="text-gray-600">
                Manage your leave requests and view your leave balance.
              </p>
            </div>
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link href="/leaves/new">
                <Plus className="h-4 w-4 mr-2" />
                Apply for Leave
              </Link>
            </Button>
          </div>

          {/* Leave Balance Cards */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave Balance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {balancesLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                leaveBalances?.map((balance) => {
                  const getLeaveIcon = (name: string) => {
                    if (name.toLowerCase().includes('annual') || name.toLowerCase().includes('vacation')) {
                      return <Plane className="h-5 w-5 text-blue-600" />;
                    }
                    if (name.toLowerCase().includes('sick')) {
                      return <Heart className="h-5 w-5 text-red-600" />;
                    }
                    return <Umbrella className="h-5 w-5 text-green-600" />;
                  };

                  const getProgressColor = (remaining: number, total: number) => {
                    const percentage = (remaining / total) * 100;
                    if (percentage > 60) return 'bg-green-500';
                    if (percentage > 30) return 'bg-yellow-500';
                    return 'bg-red-500';
                  };

                  return (
                    <Card key={balance.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            {getLeaveIcon(balance.leaveType?.name || '')}
                            <span className="font-medium text-gray-900">
                              {balance.leaveType?.name}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Remaining</span>
                            <span className="font-semibold">{balance.remainingDays} days</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getProgressColor(balance.remainingDays, balance.totalDays)}`}
                              style={{ width: `${(balance.remainingDays / balance.totalDays) * 100}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Used: {balance.usedDays}</span>
                            <span>Total: {balance.totalDays}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Requests
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {user?.role === 'MANAGER' ? '5' : user?.role === 'ADMIN' ? '12' : '2'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {user?.role === 'EMPLOYEE' ? 'Awaiting approval' : 'Require your approval'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Available Days
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {user?.role === 'MANAGER' ? '22' : user?.role === 'ADMIN' ? '25' : '18'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Days remaining this year
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Used This Year
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {user?.role === 'MANAGER' ? '3' : user?.role === 'ADMIN' ? '0' : '7'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Days taken so far
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Leaves and Recent Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Approved Leaves</CardTitle>
                <CardDescription>
                  Your scheduled time off
                </CardDescription>
              </CardHeader>
              <CardContent>
                {leavesLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : upcomingLeaves.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingLeaves.map((leave) => (
                      <div key={leave.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {leave.leaveType?.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {format(new Date(leave.startDate), 'MMM dd')} - {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-semibold text-gray-900">
                            {leave.totalDays} day{leave.totalDays > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No upcoming leaves scheduled</p>
                    <Button asChild variant="outline" size="sm" className="mt-2">
                      <Link href="/leaves/new">Plan your time off</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest leave requests and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                {leavesLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myLeaves?.slice(0, 3).map((leave) => {
                      const getStatusColor = (status: string) => {
                        switch (status) {
                          case 'APPROVED': return 'bg-green-100 text-green-800';
                          case 'REJECTED': return 'bg-red-100 text-red-800';
                          case 'PENDING': return 'bg-yellow-100 text-yellow-800';
                          default: return 'bg-gray-100 text-gray-800';
                        }
                      };

                      return (
                        <div key={leave.id} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">{leave.leaveType?.name}</p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(leave.startDate), 'MMM dd')} - {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(leave.status)}`}>
                            {leave.status.toLowerCase()}
                          </span>
                        </div>
                      );
                    }) || (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500">No recent activity</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks you can perform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button variant="outline" className="justify-start" asChild>
                    <Link href="/leaves">
                      <Clock className="h-4 w-4 mr-2" />
                      View All Leaves
                    </Link>
                  </Button>
                  {(user?.role === 'MANAGER' || user?.role === 'ADMIN') && (
                    <Button variant="outline" className="justify-start" asChild>
                      <Link href="/approvals">
                        <User className="h-4 w-4 mr-2" />
                        Pending Approvals
                      </Link>
                    </Button>
                  )}
                  {user?.role === 'ADMIN' && (
                    <Button variant="outline" className="justify-start" asChild>
                      <Link href="/admin">
                        <Calendar className="h-4 w-4 mr-2" />
                        Admin Panel
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}