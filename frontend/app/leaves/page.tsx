'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useMyLeaves, useCancelLeave } from '@/hooks/use-leaves';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Eye, X, Calendar, Filter, Clock, CreditCard as Edit } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { LeaveRequest } from '@/types/leave';
import { getStatusDisplayName } from '@/lib/utils';
import { Sidebar } from '@/components/navigation/sidebar';

export default function LeavesPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Use real API data with status filtering
  const { data: leaves, isLoading, error } = useMyLeaves(statusFilter === 'all' ? undefined : statusFilter);
  const cancelLeaveMutation = useCancelLeave();

  // Filter leaves based on status
  const filteredLeaves = leaves || [];
  
  // Paginate results
  const totalPages = Math.ceil(filteredLeaves.length / pageSize);
  const paginatedLeaves = filteredLeaves.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING_RM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      PENDING_HR: 'bg-orange-100 text-orange-800 border-orange-200',
      APPROVED: 'bg-green-100 text-green-800 border-green-200',
      REJECTED: 'bg-red-100 text-red-800 border-red-200',
      CANCELLED: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    
    const statusText = status === 'PENDING_RM' ? 'Pending RM' : 
                     status === 'PENDING_HR' ? 'Pending HR' : 
                     status.toLowerCase();
    
    return (
      <Badge className={variants[status as keyof typeof variants] || variants.PENDING_RM}>
        {statusText}
      </Badge>
    );
  };

  const canCancelLeave = (leave: LeaveRequest) => {
    return ['PENDING_RM', 'PENDING_HR'].includes(leave.status) && new Date(leave.startDate) >= new Date();
  };

  const handleCancelLeave = async (leaveId: string) => {
    try {
      await cancelLeaveMutation.mutateAsync(leaveId);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex">
          <div className="w-64 flex-shrink-0">
            <Sidebar />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <Card className="max-w-md">
              <CardContent className="p-6 text-center">
                <p className="text-red-600">Failed to load leave requests</p>
                <Button onClick={() => window.location.reload()} className="mt-4">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="px-6 py-4">
              <h1 className="text-xl font-semibold text-gray-900">My Leave Requests</h1>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">My Leave Requests</h1>
                <p className="text-gray-600">
                  View and manage your leave applications
                </p>
              </div>
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Link href="/leaves/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Apply for Leave
                </Link>
              </Button>
            </div>

            {/* Filters */}
            <div className="mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filter by status:</span>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="PENDING_RM">Pending RM</SelectItem>
                    <SelectItem value="PENDING_HR">Pending HR</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Leave Requests List */}
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : paginatedLeaves.length > 0 ? (
              <div className="space-y-4">
                {paginatedLeaves.map((leave) => (
                  <Card key={leave.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {leave.leaveType?.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {format(new Date(leave.startDate), 'MMM dd, yyyy')} - {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                              </p>
                            </div>
                            {getStatusBadge(leave.status)}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">Duration</p>
                                <p className="text-sm text-gray-600">
                                  {leave.totalDays} day{leave.totalDays !== 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">Applied On</p>
                                <p className="text-sm text-gray-600">
                                  {format(new Date(leave.appliedAt), 'MMM dd, yyyy')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">Reason</p>
                                <p className="text-sm text-gray-600 truncate">
                                  {leave.reason}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/leaves/${leave.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Link>
                          </Button>
                          {canCancelLeave(leave) && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                  <X className="h-4 w-4 mr-1" />
                                  Cancel
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancel Leave Request</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to cancel this leave request? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Keep Request</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleCancelLeave(leave.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                    disabled={cancelLeaveMutation.isPending}
                                  >
                                    {cancelLeaveMutation.isPending ? 'Cancelling...' : 'Cancel Request'}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Leave Requests</h3>
                  <p className="text-gray-600 mb-6">
                    You haven't applied for any leave requests yet.
                  </p>
                  <Button asChild>
                    <Link href="/leaves/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Apply for Leave
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
