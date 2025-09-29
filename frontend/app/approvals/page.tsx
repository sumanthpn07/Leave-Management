'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/frontend/components/auth/protected-route';
import { usePendingApprovals, useApproveLeave } from '@/hooks/use-leaves';
import { Button } from '@/frontend/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/frontend/components/ui/card';
import { Badge } from '@/frontend/components/ui/badge';
import { Separator } from '@/frontend/components/ui/separator';
import { CircleCheck as CheckCircle, Circle as XCircle, Clock, User, Calendar, FileText, Paperclip } from 'lucide-react';
import { format } from 'date-fns';
import { LeaveRequest } from '@/types/leave';
import { ApprovalModal } from '@/frontend/components/approvals/approval-modal';

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
                  <span className="text-sm font-medium text-gray-700">
                    {isLoading ? 'Loading...' : `${pendingApprovals?.length || 0} pending approval${(pendingApprovals?.length || 0) !== 1 ? 's' : ''}`}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Approvals List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Pending Approvals
              </CardTitle>
              <CardDescription>
                Leave requests awaiting approval at your level
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-32 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : !pendingApprovals || pendingApprovals.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    All caught up!
                  </h3>
                  <p className="text-gray-500">
                    There are no pending leave requests requiring your approval.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingApprovals.map((leave) => (
                    <div
                      key={leave.id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {leave.user?.firstName} {leave.user?.lastName}
                            </h3>
                            <p className="text-sm text-gray-600">{leave.user?.department}</p>
                          </div>
                        </div>
                        <Badge className={getLeaveTypeColor(leave.leaveType?.name || '')}>
                          {leave.leaveType?.name}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Duration</p>
                            <p className="text-sm text-gray-600">
                              {format(new Date(leave.startDate), 'MMM dd')} - {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Total Days</p>
                            <p className="text-sm text-gray-600">
                              {leave.totalDays} business day{leave.totalDays !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Applied</p>
                            <p className="text-sm text-gray-600">
                              {format(new Date(leave.appliedAt), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Reason</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {leave.reason}
                        </p>
                      </div>

                      {/* Mock attachments indicator */}
                      {leave.leaveType?.name === 'Sick Leave' && leave.totalDays > 3 && (
                        <div className="mb-4">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Paperclip className="h-4 w-4" />
                            <span>medical_certificate.pdf (2.1 MB)</span>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end space-x-3">
                        <Button
                          variant="outline"
                          onClick={() => handleReject(leave)}
                          disabled={approveLeaveMutation.isPending}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                        <Button
                          onClick={() => handleApprove(leave)}
                          disabled={approveLeaveMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Approval Modal */}
      {selectedLeave && modalMode && (
        <ApprovalModal
          mode={modalMode}
          employeeName={`${selectedLeave.user?.firstName} ${selectedLeave.user?.lastName}`}
          leaveDetails={{
            type: selectedLeave.leaveType?.name || '',
            startDate: selectedLeave.startDate,
            endDate: selectedLeave.endDate,
            totalDays: selectedLeave.totalDays,
            reason: selectedLeave.reason,
          }}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          isLoading={approveLeaveMutation.isPending}
        />
      )}
    </ProtectedRoute>
  );
}