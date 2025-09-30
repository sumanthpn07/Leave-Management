'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { usePendingApprovals, useApproveLeave } from '@/hooks/use-leaves';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CircleCheck as CheckCircle, Circle as XCircle, Clock, User, Calendar, FileText, Paperclip, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { LeaveRequest } from '@/types/leave';
import { ApprovalModal } from '@/components/approvals/approval-modal';
import Link from 'next/link';
import { BackButton } from '@/components/ui/back-button';

export default function ApprovalsPage() {
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [modalMode, setModalMode] = useState<'approve' | 'reject' | null>(null);
  
  const { data: pendingApprovals, isLoading, error } = usePendingApprovals();
  const approveLeaveMutation = useApproveLeave();

  const handleApprove = (leave: LeaveRequest) => {
    setSelectedLeave(leave);
    setModalMode('approve');
  };

  const handleReject = (leave: LeaveRequest) => {
    setSelectedLeave(leave);
    setModalMode('reject');
  };

  const handleConfirm = async (comment?: string) => {
    if (!selectedLeave || !modalMode) return;

    try {
      await approveLeaveMutation.mutateAsync({
        id: selectedLeave.id,
        data: {
          status: modalMode === 'approve' ? 'APPROVED' : 'REJECTED',
          rejectionReason: modalMode === 'reject' ? comment : undefined,
          approvalComment: modalMode === 'approve' ? comment : undefined,
        }
      });
      
      setSelectedLeave(null);
      setModalMode(null);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleCancel = () => {
    setSelectedLeave(null);
    setModalMode(null);
  };

  const getLeaveTypeColor = (type: string) => {
    const colors = {
      'Annual Leave': 'bg-blue-100 text-blue-800',
      'Sick Leave': 'bg-red-100 text-red-800',
      'Personal Leave': 'bg-purple-100 text-purple-800',
      'Maternity/Paternity Leave': 'bg-green-100 text-green-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (error) {
    return (
      <ProtectedRoute requiredRole="MANAGER">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <p className="text-red-600 mb-4">Failed to load pending approvals</p>
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
    <ProtectedRoute requiredRole="MANAGER">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Leave Approvals</h1>
            <p className="text-gray-600">
              Review and approve pending leave requests from your team
            </p>
          </div>

          {/* Stats Card */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm font-medium text-gray-600">Pending Approvals</span>
                  <Badge variant="outline" className="ml-2">
                    {pendingApprovals?.length || 0}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">Team Members</span>
                  <Badge variant="outline" className="ml-2">
                    {new Set(pendingApprovals?.map(leave => leave.userId)).size || 0}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
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
          ) : pendingApprovals && pendingApprovals.length > 0 ? (
            <div className="space-y-4">
              {pendingApprovals.map((leave) => (
                <Card key={leave.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {leave.user?.name || 'Unknown User'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {leave.user?.department || 'Unknown Department'}
                            </p>
                          </div>
                          <Badge className={getLeaveTypeColor(leave.leaveType?.name || 'Unknown')}>
                            {leave.leaveType?.name || 'Unknown'}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Start Date</p>
                              <p className="text-sm text-gray-600">
                                {format(new Date(leave.startDate), 'MMM dd, yyyy')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">End Date</p>
                              <p className="text-sm text-gray-600">
                                {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Duration</p>
                              <p className="text-sm text-gray-600">
                                {leave.totalDays} day{leave.totalDays !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-900 mb-1">Reason</p>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {leave.reason}
                          </p>
                        </div>

                        {leave.attachmentUrl && (
                          <div className="flex items-center space-x-2 mb-4">
                            <Paperclip className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Supporting document attached</span>
                            <Button variant="outline" size="sm" asChild>
                              <a href={leave.attachmentUrl} download target="_blank" rel="noopener noreferrer">
                                <FileText className="h-4 w-4 mr-1" />
                                Download
                              </a>
                            </Button>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Badge variant="outline" className="text-xs">
                              Applied {format(new Date(leave.appliedAt), 'MMM dd, yyyy')}
                            </Badge>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/leaves/${leave.id}`}>
                                <FileText className="h-4 w-4 mr-1" />
                                View Details
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <Button
                          onClick={() => handleApprove(leave)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          disabled={approveLeaveMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleReject(leave)}
                          variant="outline"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                          disabled={approveLeaveMutation.isPending}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Approvals</h3>
                <p className="text-gray-600 mb-6">
                  There are no leave requests waiting for your approval at the moment.
                </p>
                <Button asChild>
                  <Link href="/dashboard">
                    Back to Dashboard
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Approval Modal */}
          {selectedLeave && modalMode && (
            <ApprovalModal
              leave={selectedLeave}
              mode={modalMode}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
              isLoading={approveLeaveMutation.isPending}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
