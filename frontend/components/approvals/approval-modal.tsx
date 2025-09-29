'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/frontend/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/frontend/components/ui/dialog';
import { Textarea } from '@/frontend/components/ui/textarea';
import { Label } from '@/frontend/components/ui/label';
import { CircleCheck as CheckCircle, Circle as XCircle, Calendar, Clock, FileText } from 'lucide-react';
import { format } from 'date-fns';

const approveSchema = z.object({
  comment: z.string().optional(),
});

const rejectSchema = z.object({
  comment: z.string().min(10, 'Please provide a detailed reason for rejection (minimum 10 characters)'),
});

interface ApprovalModalProps {
  mode: 'approve' | 'reject';
  employeeName: string;
  leaveDetails: {
    type: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    reason: string;
  };
  onConfirm: (comment?: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function ApprovalModal({
  mode,
  employeeName,
  leaveDetails,
  onConfirm,
  onCancel,
  isLoading,
}: ApprovalModalProps) {
  const schema = mode === 'reject' ? rejectSchema : approveSchema;
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: { comment?: string }) => {
    onConfirm(data.comment);
  };

  const isApprove = mode === 'approve';
  const title = isApprove ? 'Approve Leave Request' : 'Reject Leave Request';
  const description = isApprove 
    ? `Are you sure you want to approve this leave request for ${employeeName}?`
    : `Please provide a reason for rejecting this leave request for ${employeeName}.`;
  
  const buttonText = isApprove ? 'Approve Request' : 'Reject Request';
  const buttonClass = isApprove 
    ? 'bg-green-600 hover:bg-green-700' 
    : 'bg-red-600 hover:bg-red-700';

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {isApprove ? (
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600 mr-2" />
            )}
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        {/* Leave Details Summary */}
        <div className="bg-gray-50 rounded-lg p-4 my-4">
          <h4 className="font-medium text-gray-900 mb-3">Leave Request Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <div>
                <span className="font-medium text-gray-700">Type:</span>
                <span className="ml-1 text-gray-600">{leaveDetails.type}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <div>
                <span className="font-medium text-gray-700">Duration:</span>
                <span className="ml-1 text-gray-600">{leaveDetails.totalDays} day{leaveDetails.totalDays !== 1 ? 's' : ''}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 md:col-span-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <span className="font-medium text-gray-700">Dates:</span>
                <span className="ml-1 text-gray-600">
                  {format(new Date(leaveDetails.startDate), 'MMM dd, yyyy')} - {format(new Date(leaveDetails.endDate), 'MMM dd, yyyy')}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <span className="font-medium text-gray-700">Reason:</span>
            <p className="text-gray-600 mt-1 text-sm leading-relaxed">
              {leaveDetails.reason}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="comment">
              {isApprove ? 'Comment (Optional)' : 'Rejection Reason *'}
            </Label>
            <Textarea
              id="comment"
              placeholder={
                isApprove 
                  ? 'Add an optional comment for the employee...'
                  : 'Please explain why this leave request is being rejected...'
              }
              {...register('comment')}
              className={errors.comment ? 'border-red-500' : ''}
              rows={3}
            />
            {errors.comment && (
              <p className="text-sm text-red-500">{errors.comment.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={buttonClass}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                buttonText
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}