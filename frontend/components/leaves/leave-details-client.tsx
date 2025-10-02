'use client';

import { useState } from 'react';
import { useLeaveDetails, useApprovalHistory } from '@/hooks/use-leaves';
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
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
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Leave Request Not Found</h1>
            <p className="text-gray-600 mb-6">The leave request you're looking for doesn't exist or you don't have permission to view it.</p>
            <Button asChild>
              <Link href="/leaves">Back to Leaves</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

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

  const canEditLeave = () => {
    if (!leave) return false;
    const isPending = ['PENDING_RM', 'PENDING_HR'].includes(leave.status);
    const isFuture = new Date(leave.startDate) > new Date();
    return isPending && isFuture;
  };

  const canCancelLeave = () => {
    if (!leave) return false;
    const isPending = ['PENDING_RM', 'PENDING_HR'].includes(leave.status);
    const isFuture = new Date(leave.startDate) > new Date();
    return isPending && isFuture;
  };

  const handleApprove = async () => {
    try {
      // TODO: Implement approval logic
      toast.success('Leave request approved successfully');
    } catch (error) {
      toast.error('Failed to approve leave request');
    }
  };

  const handleReject = async () => {
    try {
      // TODO: Implement rejection logic
      toast.success('Leave request rejected');
    } catch (error) {
      toast.error('Failed to reject leave request');
    }
  };

  const handleCancel = async () => {
    try {
      // TODO: Implement cancellation logic
      toast.success('Leave request cancelled');
      router.push('/leaves');
    } catch (error) {
      toast.error('Failed to cancel leave request');
    }
  };

  const handleEdit = () => {
    router.push(`/leaves/${leave.id}/edit`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Leave Request Details</h1>
                <p className="text-gray-600">Request ID: {leave.id}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusBadge(leave.status)}
              {canEditLeave() && (
                <Button variant="outline" onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              {canCancelLeave() && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="text-red-600 hover:text-red-700">
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
                      <AlertDialogCancel>Keep Request</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleCancel}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Cancel Request
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Leave Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Leave Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Leave Type</h4>
                  <p className="text-gray-600">{leave.leaveType?.name || 'Unknown'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Duration</h4>
                  <p className="text-gray-600">
                    {format(new Date(leave.startDate), 'MMM dd, yyyy')} - {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                    <span className="ml-2 text-sm text-gray-500">
                      ({leave.totalDays} day{leave.totalDays !== 1 ? 's' : ''})
                    </span>
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Applied On</h4>
                  <p className="text-gray-600">
                    {format(new Date(leave.appliedAt), 'MMM dd, yyyy at h:mm a')}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Status</h4>
                  {getStatusBadge(leave.status)}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Reason</h4>
                <p className="text-gray-600">{leave.reason}</p>
              </div>

              {leave.attachmentUrl && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Supporting Document</h4>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <Button variant="outline" size="sm" asChild>
                      <a href={leave.attachmentUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-1" />
                        Download Document
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Approval History */}
          {approvalHistory && approvalHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Approval History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {approvalHistory.map((approval, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        {approval.action === 'APPROVE' ? (
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
                          {approval.action === 'APPROVE' ? 'Approved' : 'Rejected'}
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
          {user?.role === 'MANAGER' || user?.role === 'HR_MANAGER' || user?.role === 'REPORTING_MANAGER' || user?.role === 'ADMIN' ? (
            <Card>
              <CardHeader>
                <CardTitle>Manager Actions</CardTitle>
                <CardDescription>
                  Review and take action on this leave request
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comments (Optional)
                  </label>
                  <Textarea
                    placeholder="Add your comments here..."
                    value={approvalComments}
                    onChange={(e) => setApprovalComments(e.target.value)}
                    className="mb-4"
                  />
                </div>
                <div className="flex space-x-3">
                  <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="text-red-600 hover:text-red-700">
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reject Leave Request</AlertDialogTitle>
                        <AlertDialogDescription>
                          Please provide a reason for rejecting this leave request.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="py-4">
                        <Textarea
                          placeholder="Enter rejection reason..."
                          value={rejectionComments}
                          onChange={(e) => setRejectionComments(e.target.value)}
                        />
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleReject}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Reject Request
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
