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

export default function LeavesPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <p className="text-red-600">Failed to load leave requests</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filter by status:</span>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Requests</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-sm text-gray-500">
                  {filteredLeaves.length} request{filteredLeaves.length !== 1 ? 's' : ''} found
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leave Requests List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Leave Requests
              </CardTitle>
              <CardDescription>
                Your leave application history and current requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : filteredLeaves.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {statusFilter === 'all' ? 'No leave requests found' : `No ${statusFilter === 'PENDING_RM' ? 'pending RM' : statusFilter === 'PENDING_HR' ? 'pending HR' : statusFilter.toLowerCase()} requests`}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {statusFilter === 'all' 
                      ? "You haven't submitted any leave requests yet."
                      : `You don't have any ${statusFilter === 'PENDING_RM' ? 'pending RM' : statusFilter === 'PENDING_HR' ? 'pending HR' : statusFilter.toLowerCase()} leave requests.`
                    }
                  </p>
                  <Button asChild>
                    <Link href="/leaves/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Apply for Leave
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {paginatedLeaves.map((leave) => (
                    <div
                      key={leave.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-medium text-gray-900">
                              {leave.leaveType?.name || 'Unknown Leave Type'}
                            </h3>
                            {getStatusBadge(leave.status)}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Duration:</span>
                              <br />
                              {format(new Date(leave.startDate), 'MMM dd, yyyy')} - {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                            </div>
                            <div>
                              <span className="font-medium">Total Days:</span>
                              <br />
                              {leave.totalDays} business day{leave.totalDays !== 1 ? 's' : ''}
                            </div>
                            <div>
                              <span className="font-medium">Applied:</span>
                              <br />
                              {format(new Date(leave.appliedAt), 'MMM dd, yyyy')}
                            </div>
                          </div>
                          <div className="mt-2">
                            <span className="font-medium text-sm text-gray-600">Reason:</span>
                            <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                              {leave.reason}
                            </p>
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
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/leaves/${leave.id}/edit`}>
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Link>
                            </Button>
                          )}
                          {canCancelLeave(leave) && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                  <X className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Leave Request</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this leave request? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Keep Request</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleCancelLeave(leave.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                    disabled={cancelLeaveMutation.isPending}
                                  >
                                    {cancelLeaveMutation.isPending ? 'Deleting...' : 'Delete Request'}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="text-sm text-gray-500">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredLeaves.length)} of {filteredLeaves.length} requests
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}