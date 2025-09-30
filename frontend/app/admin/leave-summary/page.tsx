'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAdminLeaveSummary, useAdminPendingApprovals } from '@/hooks/use-leaves';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, Users, Calendar, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function AdminLeaveSummaryPage() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('current');
  
  const { data: leaveSummary, isLoading: summaryLoading, error: summaryError } = useAdminLeaveSummary();
  const { data: pendingApprovals, isLoading: approvalsLoading } = useAdminPendingApprovals();

  if (summaryError) {
    return (
      <ProtectedRoute requiredRole="ADMIN">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <p className="text-red-600 mb-4">Failed to load leave summary</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Leave Summary Report</h1>
            <p className="text-gray-600">
              Comprehensive leave statistics and department-wise analysis
            </p>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="hr">Human Resources</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Period
              </label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Employees</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {summaryLoading ? '...' : leaveSummary?.totalEmployees || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Calendar className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Leaves</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {summaryLoading ? '...' : leaveSummary?.activeLeaves || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {approvalsLoading ? '...' : pendingApprovals?.length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Approval Rate</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {summaryLoading ? '...' : `${leaveSummary?.approvalRate || 0}%`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Department-wise Breakdown */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Department-wise Leave Statistics
              </CardTitle>
              <CardDescription>
                Leave usage and patterns across different departments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : leaveSummary?.departments && leaveSummary.departments.length > 0 ? (
                <div className="space-y-4">
                  {leaveSummary.departments.map((dept: any) => (
                    <div key={dept.name} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{dept.name}</h3>
                        <Badge variant="outline">{dept.employeeCount} employees</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">{dept.totalLeaves}</p>
                          <p className="text-sm text-gray-600">Total Leaves</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">{dept.approvedLeaves}</p>
                          <p className="text-sm text-gray-600">Approved</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-yellow-600">{dept.pendingLeaves}</p>
                          <p className="text-sm text-gray-600">Pending</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
                  <p className="text-gray-600">No leave data found for the selected criteria.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Recent Leave Activity
              </CardTitle>
              <CardDescription>
                Latest leave requests and approvals across the organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              {approvalsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center space-x-3">
                      <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : pendingApprovals && pendingApprovals.length > 0 ? (
                <div className="space-y-3">
                  {pendingApprovals.slice(0, 5).map((leave: any) => (
                    <div key={leave.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {leave.user?.name || 'Unknown User'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {leave.leaveType?.name || 'Unknown'} • {leave.totalDays} days
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <Badge variant="outline" className="text-xs">
                          {format(new Date(leave.appliedAt), 'MMM dd')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Activity</h3>
                  <p className="text-gray-600">No recent leave requests found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
