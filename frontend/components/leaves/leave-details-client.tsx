'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLeaveDetails, useCancelLeave } from '@/hooks/use-leaves';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ArrowLeft, Calendar, Clock, FileText, User, X, CircleCheck as CheckCircle, Circle as XCircle, CircleAlert as AlertCircle, CreditCard as Edit } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

// Mock approval history data
const mockApprovalHistory = [
  {
    id: '1',
    action: 'SUBMITTED',
    timestamp: '2024-12-20T10:00:00Z',
    user: { firstName: 'John', lastName: 'Doe', role: 'EMPLOYEE' },
    comments: 'Leave application submitted for review',
  },
  {
    id: '2',
    action: 'APPROVED',
    timestamp: '2024-12-21T14:30:00Z',
    user: { firstName: 'Jane', lastName: 'Smith', role: 'MANAGER' },
    comments: 'Approved - enjoy your vacation!',
  },
];

interface LeaveDetailsClientProps {
  leaveId: string;
}

export function LeaveDetailsClient({ leaveId }: LeaveDetailsClientProps) {
  const router = useRouter();
  const { user } = useAuth();
  
  const { data: leave, isLoading, error } = useLeaveDetails(leaveId);
  const cancelLeaveMutation = useCancelLeave();

  const canCancelLeave = leave && 
    leave.userId === user?.id && 
    ['PENDING_RM', 'PENDING_HR'].includes(leave.status) && 
    new Date(leave.startDate) >= new Date();

  const handleCancelLeave = async () => {
    if (!leave) return;
    
    try {
      await cancelLeaveMutation.mutateAsync(leave.id);
      router.push('/leaves');
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING_RM: { className: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertCircle },
      PENDING_HR: { className: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertCircle },
      APPROVED: { className: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
      REJECTED: { className: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
      CANCELLED: { className: 'bg-gray-100 text-gray-800 border-gray-200', icon: X },
    };
    
    const variant = variants[status as keyof typeof variants] || variants.PENDING_RM;
    const Icon = variant.icon;
    
    const statusText = status === 'PENDING_RM' ? 'Pending RM' : 
                     status === 'PENDING_HR' ? 'Pending HR' : 
                     status.toLowerCase();
    
    return (
      <Badge className={variant.className}>
        <Icon className="h-3 w-3 mr-1" />
        {statusText}
      </Badge>
    );
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'SUBMITTED': return <FileText className="h-4 w-4 text-blue-600" />;
      case 'APPROVED': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'REJECTED': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'CANCELLED': return <X className="h-4 w-4 text-gray-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

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
              <Link href="/leaves">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Leaves
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/leaves">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Leaves
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Leave Request Details</h1>
                <p className="text-gray-600">Request ID: {leave.id}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {canCancelLeave && (
                <Button variant="outline" asChild>
                  <Link href={`/leaves/${leave.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Request
                  </Link>
                </Button>
              )}
              {canCancelLeave && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="text-red-600 hover:text-red-700">
                      <X className="h-4 w-4 mr-2" />
                      Delete Request
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
                        onClick={handleCancelLeave}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Leave Information
                  </CardTitle>
                  {getStatusBadge(leave.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Leave Type</h4>
                    <p className="text-gray-600">{leave.leaveType?.name || 'Unknown'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Total Days</h4>
                    <p className="text-gray-600">{leave.totalDays} business day{leave.totalDays !== 1 ? 's' : ''}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Start Date</h4>
                    <p className="text-gray-600">{format(new Date(leave.startDate), 'EEEE, MMMM dd, yyyy')}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">End Date</h4>
                    <p className="text-gray-600">{format(new Date(leave.endDate), 'EEEE, MMMM dd, yyyy')}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Reason</h4>
                  <p className="text-gray-600 leading-relaxed">{leave.reason}</p>
                </div>

                {leave.attachmentUrl && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Supporting Document</h4>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {leave.attachmentUrl.split('/').pop()}
                          </p>
                          <p className="text-xs text-gray-500">Uploaded document</p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={leave.attachmentUrl} download target="_blank" rel="noopener noreferrer">
                            <FileText className="h-4 w-4 mr-1" />
                            Download
                          </a>
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {leave.rejectionReason && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium text-red-900 mb-2">Rejection Reason</h4>
                      <p className="text-red-600 leading-relaxed">{leave.rejectionReason}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Approval History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Approval History
                </CardTitle>
                <CardDescription>
                  Timeline of actions taken on this leave request
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockApprovalHistory.map((entry, index) => (
                    <div key={entry.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getActionIcon(entry.action)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {entry.action.charAt(0) + entry.action.slice(1).toLowerCase()}
                          </span>
                          <span className="text-sm text-gray-500">
                            by {entry.user.firstName} {entry.user.lastName}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {entry.user.role.toLowerCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{entry.comments}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(entry.timestamp), 'MMM dd, yyyy at h:mm a')}
                        </p>
                      </div>
                      {index < mockApprovalHistory.length - 1 && (
                        <div className="absolute left-6 mt-8 w-px h-8 bg-gray-200"></div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Applicant Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Name</h4>
                  <p className="text-gray-600">
                    {leave.user?.firstName} {leave.user?.lastName}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Department</h4>
                  <p className="text-gray-600">{leave.user?.department}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Role</h4>
                  <Badge variant="outline">{leave.user?.role.toLowerCase()}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Application Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Applied On</h4>
                  <p className="text-gray-600">
                    {format(new Date(leave.appliedAt), 'MMM dd, yyyy at h:mm a')}
                  </p>
                </div>
                {leave.approvedAt && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">
                      RM {leave.status === 'APPROVED' ? 'Approved On' : 'Processed On'}
                    </h4>
                    <p className="text-gray-600">
                      {leave.rmApprovedAt && format(new Date(leave.rmApprovedAt), 'MMM dd, yyyy at h:mm a')}
                    </p>
                  </div>
                )}
                {leave.hrApprovedAt && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">HR Approved On</h4>
                    <p className="text-gray-600">
                      {format(new Date(leave.hrApprovedAt), 'MMM dd, yyyy at h:mm a')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}