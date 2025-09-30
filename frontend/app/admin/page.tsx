'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, Calendar, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">
              Manage leave policies, view reports, and oversee the leave management system
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                  Leave Summary
                </CardTitle>
                <CardDescription>
                  Department-wise leave statistics and reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  View comprehensive leave reports across all departments
                </p>
                <Button asChild className="w-full">
                  <Link href="/admin/leave-summary">
                    View Reports
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-green-600" />
                  Employee Management
                </CardTitle>
                <CardDescription>
                  Manage employee profiles and leave balances
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Add, edit, and manage employee information
                </p>
                <Button variant="outline" className="w-full" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                  Pending Approvals
                </CardTitle>
                <CardDescription>
                  Review all pending leave requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  View and manage all pending approvals across the organization
                </p>
                <Button asChild className="w-full">
                  <Link href="/approvals">
                    View Approvals
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-orange-600" />
                  Analytics
                </CardTitle>
                <CardDescription>
                  Leave trends and usage analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Analyze leave patterns and trends
                </p>
                <Button variant="outline" className="w-full" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
