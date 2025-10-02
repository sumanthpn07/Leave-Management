'use client';

import { useState } from 'react';
import { useLeaveDetails, useApprovalHistory, useCancelLeave } from '@/hooks/use-leaves';
import { useAuthContext } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, User, FileText, Download, AlertTriangle, CheckCircle, XCircle, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface LeaveDetailsClientProps {
  leaveId: string;
}

export function LeaveDetailsClient({ leaveId }: LeaveDetailsClientProps) {
  const { user } = useAuthContext();
  const router = useRouter();
  const [approvalComments, setApprovalComments] = useState('');
  const [rejectionComments, setRejectionComments] = useState('');

  const { data: leave, isLoading, error } = useLeaveDetails(leaveId);
  const { data: approvalHistory, isLoading: historyLoading } = useApprovalHistory(leaveId);
  const cancelLeaveMutation = useCancelLeave();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>

            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !leave) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Leave Not Found</h1>
            <p className="text-gray-600 mb-4">The leave request you're looking for doesn't exist or you don't have permission to view it.</p>
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'PENDING_RM':
        return 'bg-yellow-100 text-yellow-800';
      case 'PENDING_HR':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING_RM':
        return 'Pending Reporting Manager';
      case 'PENDING_HR':
        return 'Pending HR Manager';
      case 'APPROVED':
        return 'Approved';
      case 'REJECTED':
        return 'Rejected';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const canEdit = leave.status === 'PENDING_RM' && user?.id === leave.userId;
  const canCancel = (leave.status === 'PENDING_RM' || leave.status === 'PENDING_HR') && user?.id === leave.userId;
  const canApprove = (user?.role === 'MANAGER' || user?.role === 'HR_MANAGER' || user?.role === 'REPORTING_MANAGER' || user?.role === 'ADMIN') && 
                    leave.status !== 'APPROVED' && leave.status !== 'REJECTED' && leave.status !== 'CANCELLED';

  const handleCancel = async () => {
    try {
      await cancelLeaveMutation.mutateAsync(leaveId);
      toast.success('Leave request cancelled successfully');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Failed to cancel leave request');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="space-y-6">
          {/* Leave Details Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Leave Request Details</CardTitle>
                  <CardDescription>
                    {leave.leaveType?.name || leave.leaveTypeId} • {leave.totalDays} day{leave.totalDays !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(leave.status)}>
                  {getStatusText(leave.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Leave Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Start Date</p>
                      <p className="text-sm text-gray-600">{format(new Date(leave.startDate), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">End Date</p>
                      <p className="text-sm text-gray-600">{format(new Date(leave.endDate), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Applied On</p>
                      <p className="text-sm text-gray-600">{format(new Date(leave.appliedAt), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Leave Type</p>
                      <p className="text-sm text-gray-600">{leave.leaveType?.name || leave.leaveTypeId}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Duration</p>
                      <p className="text-sm text-gray-600">{leave.totalDays} day{leave.totalDays !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  {leave.attachmentUrl && (
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Attachment</p>
                        <Button variant="outline" size="sm" asChild>
                          <a href={leave.attachmentUrl} download target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </a>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Reason */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Reason</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{leave.reason}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {canEdit && (
                  <Link href={`/leaves/${leaveId}/edit`}>
                    <Button variant="outline" size="sm" className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                )}
                {canCancel && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200">
                        <Trash2 className="h-4 w-4 mr-2" />
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
                        <AlertDialogCancel>No, keep it</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleCancel}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Yes, cancel it
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Approval History */}
          {approvalHistory && approvalHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Approval History</CardTitle>
                <CardDescription>
                  Track the progress of your leave request through the approval process
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {approvalHistory.map((approval, index) => (
                    <div key={approval.id || index} className="flex items-start space-x-3 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        {approval.action === 'APPLIED' ? (
                          <Clock className="h-5 w-5 text-blue-500" />
                        ) : approval.action === 'APPROVE' ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">
                            {approval.approver} ({approval.approverType})
                          </h4>
                          <span className="text-sm text-gray-500">
                            {format(new Date(approval.timestamp), 'MMM dd, yyyy at h:mm a')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {approval.action === 'APPLIED' ? 'Applied for leave' :
                           approval.action === 'APPROVE' ? 'Approved' : 'Rejected'}
                          {approval.comments && ` - ${approval.comments}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Manager Actions */}
          {canApprove && (
            <Card>
              <CardHeader>
                <CardTitle>Manager Actions</CardTitle>
                <CardDescription>
                  Review and take action on this leave request
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label
                    htmlFor="approval-comments"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Approval Comments (Optional)
                  </label>
                  <Textarea
                    id="approval-comments"
                    placeholder="Add any comments about this approval..."
                    value={approvalComments}
                    onChange={(e) => setApprovalComments(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex space-x-3">
                  <Button
                    onClick={() => {
                      // Handle approve logic here
                      toast.success('Leave request approved');
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      // Handle reject logic here
                      toast.error('Leave request rejected');
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
