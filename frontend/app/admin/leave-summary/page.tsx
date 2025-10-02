'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Calendar, FileText, ChartBar as BarChart3 } from 'lucide-react';
import { api } from '@/lib/api';

interface DepartmentStats {
  department: string;
  totalEmployees: number;
  totalLeaves: number;
  pendingLeaves: number;
  approvedLeaves: number;
  rejectedLeaves: number;
  averageLeaveDays: number;
}

interface LeaveSummaryData {
  departments: DepartmentStats[];
  totalStats: {
    totalEmployees: number;
    totalLeaves: number;
    pendingLeaves: number;
    approvedLeaves: number;
    rejectedLeaves: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function LeaveSummaryPage() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [showChart, setShowChart] = useState(false);

  const { data: summaryData, isLoading, error } = useQuery({
    queryKey: ['leaveSummary', selectedYear],
    queryFn: async (): Promise<LeaveSummaryData> => {
      // Mock data for demo - replace with actual API call
      const mockData: LeaveSummaryData = {
        departments: [
          {
            department: 'Engineering',
            totalEmployees: 25,
            totalLeaves: 45,
            pendingLeaves: 8,
            approvedLeaves: 32,
            rejectedLeaves: 5,
            averageLeaveDays: 12.5,
          },
          {
            department: 'Marketing',
            totalEmployees: 12,
            totalLeaves: 28,
            pendingLeaves: 3,
            approvedLeaves: 22,
            rejectedLeaves: 3,
            averageLeaveDays: 15.2,
          },
          {
            department: 'HR',
            totalEmployees: 8,
            totalLeaves: 18,
            pendingLeaves: 2,
            approvedLeaves: 14,
            rejectedLeaves: 2,
            averageLeaveDays: 11.8,
          },
          {
            department: 'Finance',
            totalEmployees: 10,
            totalLeaves: 22,
            pendingLeaves: 4,
            approvedLeaves: 16,
            rejectedLeaves: 2,
            averageLeaveDays: 13.1,
          },
          {
            department: 'Design',
            totalEmployees: 6,
            totalLeaves: 15,
            pendingLeaves: 1,
            approvedLeaves: 12,
            rejectedLeaves: 2,
            averageLeaveDays: 14.3,
          },
        ],
        totalStats: {
          totalEmployees: 61,
          totalLeaves: 128,
          pendingLeaves: 18,
          approvedLeaves: 96,
          rejectedLeaves: 14,
        },
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      return mockData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const chartData = summaryData?.departments.map(dept => ({
    name: dept.department,
    totalLeaves: dept.totalLeaves,
    pendingLeaves: dept.pendingLeaves,
    approvedLeaves: dept.approvedLeaves,
    rejectedLeaves: dept.rejectedLeaves,
  })) || [];

  const pieData = summaryData?.departments.map((dept, index) => ({
    name: dept.department,
    value: dept.totalLeaves,
    color: COLORS[index % COLORS.length],
  })) || [];

  if (error) {
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
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Leave Summary</h1>
              <p className="text-gray-600">
                Department-wise leave statistics and analytics
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => setShowChart(!showChart)}
                className="flex items-center"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                {showChart ? 'Hide Charts' : 'Show Charts'}
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          {summaryData && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summaryData.totalStats.totalEmployees}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Leaves</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summaryData.totalStats.totalLeaves}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{summaryData.totalStats.pendingLeaves}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round((summaryData.totalStats.approvedLeaves / summaryData.totalStats.totalLeaves) * 100)}%
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Charts */}
          {showChart && summaryData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Leave Distribution by Department</CardTitle>
                  <CardDescription>Total leaves across departments</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="approvedLeaves" fill="#10B981" name="Approved" />
                      <Bar dataKey="pendingLeaves" fill="#F59E0B" name="Pending" />
                      <Bar dataKey="rejectedLeaves" fill="#EF4444" name="Rejected" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Department Leave Share</CardTitle>
                  <CardDescription>Percentage of total leaves by department</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Department Statistics Table */}
          <Card>
            <CardHeader>
              <CardTitle>Department Statistics</CardTitle>
              <CardDescription>
                Detailed leave statistics by department for {selectedYear}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-12 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Department</TableHead>
                        <TableHead className="text-center">Employees</TableHead>
                        <TableHead className="text-center">Total Leaves</TableHead>
                        <TableHead className="text-center">Pending</TableHead>
                        <TableHead className="text-center">Approved</TableHead>
                        <TableHead className="text-center">Rejected</TableHead>
                        <TableHead className="text-center">Avg Days/Employee</TableHead>
                        <TableHead className="text-center">Approval Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summaryData?.departments.map((dept) => {
                        const approvalRate = Math.round((dept.approvedLeaves / dept.totalLeaves) * 100);
                        
                        return (
                          <TableRow key={dept.department}>
                            <TableCell className="font-medium">{dept.department}</TableCell>
                            <TableCell className="text-center">{dept.totalEmployees}</TableCell>
                            <TableCell className="text-center">{dept.totalLeaves}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                {dept.pendingLeaves}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                {dept.approvedLeaves}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                {dept.rejectedLeaves}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">{dept.averageLeaveDays}</TableCell>
                            <TableCell className="text-center">
                              <span className={`font-medium ${approvalRate >= 80 ? 'text-green-600' : approvalRate >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {approvalRate}%
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}