'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, leaveApi } from '@/lib/api';
import { LeaveRequest, CreateLeaveRequest, UpdateLeaveRequest, LeaveBalance, LeaveType } from '@/types/leave';
import { toast } from 'sonner';

// Get user's own leave requests
export const useMyLeaves = (status?: string) => {
  return useQuery({
    queryKey: ['myLeaves', status],
    queryFn: async (): Promise<LeaveRequest[]> => {
      // Mock data for demo - replace with actual API call
      const mockLeaves: LeaveRequest[] = [
        {
          id: '1',
          userId: '1',
          leaveTypeId: '1',
          startDate: '2025-02-15',
          endDate: '2025-02-19',
          totalDays: 5,
          reason: 'Family vacation to celebrate anniversary',
          status: 'APPROVED',
          appliedAt: '2024-12-20T10:00:00Z',
          approvedAt: '2024-12-21T14:30:00Z',
          leaveType: { id: '1', name: 'Annual Leave', maxDays: 25, carryForward: true, requiresApproval: true },
        },
        {
          id: '2',
          userId: '1',
          leaveTypeId: '2',
          startDate: '2024-12-18',
          endDate: '2024-12-18',
          totalDays: 1,
          reason: 'Flu symptoms and fever',
          status: 'APPROVED',
          appliedAt: '2024-12-17T09:00:00Z',
          approvedAt: '2024-12-17T11:30:00Z',
          leaveType: { id: '2', name: 'Sick Leave', maxDays: 10, carryForward: false, requiresApproval: true },
        },
        {
          id: '3',
          userId: '1',
          leaveTypeId: '1',
          startDate: '2025-03-15',
          endDate: '2025-03-17',
          totalDays: 3,
          reason: 'Spring break with family',
          status: 'APPROVED',
          appliedAt: '2024-12-22T15:00:00Z',
          approvedAt: '2024-12-23T09:15:00Z',
          leaveType: { id: '1', name: 'Annual Leave', maxDays: 25, carryForward: true, requiresApproval: true },
        },
        {
          id: '4',
          userId: '1',
          leaveTypeId: '3',
          startDate: '2025-01-28',
          endDate: '2025-01-28',
          totalDays: 1,
          reason: 'Personal appointment that cannot be rescheduled',
          status: 'PENDING',
          appliedAt: '2024-12-23T10:00:00Z',
          leaveType: { id: '3', name: 'Personal Leave', maxDays: 5, carryForward: false, requiresApproval: true },
        },
        {
          id: '5',
          userId: '1',
          leaveTypeId: '1',
          startDate: '2024-11-28',
          endDate: '2024-11-29',
          totalDays: 2,
          reason: 'Thanksgiving holiday with extended family',
          status: 'APPROVED',
          appliedAt: '2024-11-20T15:00:00Z',
          approvedAt: '2024-11-21T09:15:00Z',
          leaveType: { id: '1', name: 'Annual Leave', maxDays: 25, carryForward: true, requiresApproval: true },
        },
        {
          id: '6',
          userId: '1',
          leaveTypeId: '2',
          startDate: '2024-10-15',
          endDate: '2024-10-16',
          totalDays: 2,
          reason: 'Medical procedure and recovery',
          status: 'APPROVED',
          appliedAt: '2024-10-10T08:30:00Z',
          approvedAt: '2024-10-10T16:45:00Z',
          leaveType: { id: '2', name: 'Sick Leave', maxDays: 10, carryForward: false, requiresApproval: true },
        },
        {
          id: '7',
          userId: '1',
          leaveTypeId: '1',
          startDate: '2024-09-20',
          endDate: '2024-09-22',
          totalDays: 3,
          reason: 'Weekend getaway extension',
          status: 'REJECTED',
          appliedAt: '2024-09-15T12:00:00Z',
          approvedAt: '2024-09-16T10:30:00Z',
          rejectionReason: 'Insufficient leave balance for this period',
          leaveType: { id: '1', name: 'Annual Leave', maxDays: 25, carryForward: true, requiresApproval: true },
        },
        {
          id: '8',
          userId: '1',
          leaveTypeId: '1',
          startDate: '2025-04-10',
          endDate: '2025-04-14',
          totalDays: 5,
          reason: 'Planned vacation to visit relatives overseas',
          status: 'PENDING',
          appliedAt: '2024-12-24T14:00:00Z',
          leaveType: { id: '1', name: 'Annual Leave', maxDays: 25, carryForward: true, requiresApproval: true },
        },
        {
          id: '9',
          userId: '1',
          leaveTypeId: '3',
          startDate: '2025-01-15',
          endDate: '2025-01-15',
          totalDays: 1,
          reason: 'Moving to new apartment',
          status: 'PENDING',
          appliedAt: '2024-12-25T09:00:00Z',
          leaveType: { id: '3', name: 'Personal Leave', maxDays: 5, carryForward: false, requiresApproval: true },
        },
        {
          id: '10',
          userId: '1',
          leaveTypeId: '2',
          startDate: '2024-08-12',
          endDate: '2024-08-14',
          totalDays: 3,
          reason: 'Food poisoning recovery',
          status: 'APPROVED',
          appliedAt: '2024-08-11T07:30:00Z',
          approvedAt: '2024-08-11T13:45:00Z',
          attachmentUrl: '/uploads/medical_certificate_aug.pdf',
          leaveType: { id: '2', name: 'Sick Leave', maxDays: 10, carryForward: false, requiresApproval: true },
        },
        {
          id: '11',
          userId: '1',
          leaveTypeId: '4',
          startDate: '2024-07-01',
          endDate: '2024-08-30',
          totalDays: 45,
          reason: 'Paternity leave for newborn child',
          status: 'APPROVED',
          appliedAt: '2024-06-15T10:00:00Z',
          approvedAt: '2024-06-16T14:30:00Z',
          attachmentUrl: '/uploads/birth_certificate.pdf',
          leaveType: { id: '4', name: 'Maternity/Paternity Leave', maxDays: 90, carryForward: false, requiresApproval: true },
        },
        {
          id: '12',
          userId: '1',
          leaveTypeId: '1',
          startDate: '2024-05-20',
          endDate: '2024-05-24',
          totalDays: 5,
          reason: 'Summer vacation with friends',
          status: 'CANCELLED',
          appliedAt: '2024-05-10T12:00:00Z',
          leaveType: { id: '1', name: 'Annual Leave', maxDays: 25, carryForward: true, requiresApproval: true },
        },
        {
          id: '5',
          userId: '1',
          leaveTypeId: '1',
          startDate: '2024-11-28',
          endDate: '2024-11-29',
          totalDays: 2,
          reason: 'Thanksgiving holiday with extended family',
          status: 'APPROVED',
          appliedAt: '2024-11-20T15:00:00Z',
          approvedAt: '2024-11-21T09:15:00Z',
          leaveType: { id: '1', name: 'Annual Leave', maxDays: 25, carryForward: true, requiresApproval: true },
        },
        {
          id: '6',
          userId: '1',
          leaveTypeId: '2',
          startDate: '2024-10-15',
          endDate: '2024-10-16',
          totalDays: 2,
          reason: 'Medical procedure and recovery',
          status: 'APPROVED',
          appliedAt: '2024-10-10T08:30:00Z',
          approvedAt: '2024-10-10T16:45:00Z',
          leaveType: { id: '2', name: 'Sick Leave', maxDays: 10, carryForward: false, requiresApproval: true },
        },
        {
          id: '7',
          userId: '1',
          leaveTypeId: '1',
          startDate: '2024-09-20',
          endDate: '2024-09-22',
          totalDays: 3,
          reason: 'Weekend getaway extension',
          status: 'REJECTED',
          appliedAt: '2024-09-15T12:00:00Z',
          approvedAt: '2024-09-16T10:30:00Z',
          rejectionReason: 'Insufficient leave balance for this period',
          leaveType: { id: '1', name: 'Annual Leave', maxDays: 25, carryForward: true, requiresApproval: true },
        },
        {
          id: '8',
          userId: '1',
          leaveTypeId: '1',
          startDate: '2025-04-10',
          endDate: '2025-04-14',
          totalDays: 5,
          reason: 'Planned vacation to visit relatives overseas',
          status: 'PENDING',
          appliedAt: '2024-12-24T14:00:00Z',
          leaveType: { id: '1', name: 'Annual Leave', maxDays: 25, carryForward: true, requiresApproval: true },
        },
        {
          id: '9',
          userId: '1',
          leaveTypeId: '3',
          startDate: '2025-01-15',
          endDate: '2025-01-15',
          totalDays: 1,
          reason: 'Moving to new apartment',
          status: 'PENDING',
          appliedAt: '2024-12-25T09:00:00Z',
          leaveType: { id: '3', name: 'Personal Leave', maxDays: 5, carryForward: false, requiresApproval: true },
        },
      ];
      
      return status ? mockLeaves.filter(leave => leave.status === status) : mockLeaves;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Apply for new leave
export const useApplyLeave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateLeaveRequest | FormData): Promise<LeaveRequest> => {
      // Mock implementation - replace with actual API call
      let leaveData: any;
      
      if (data instanceof FormData) {
        // Handle FormData for file uploads
        leaveData = {
          leaveTypeId: data.get('leaveTypeId'),
          startDate: data.get('startDate'),
          endDate: data.get('endDate'),
          reason: data.get('reason'),
          totalDays: parseInt(data.get('totalDays') as string),
          file: data.get('file'),
        };
      } else {
        leaveData = data;
      }
      
      const newLeave: LeaveRequest = {
        id: Date.now().toString(),
        userId: '1',
        leaveTypeId: leaveData.leaveTypeId,
        startDate: leaveData.startDate,
        endDate: leaveData.endDate,
        totalDays: leaveData.totalDays,
        reason: leaveData.reason,
        status: 'PENDING',
        appliedAt: new Date().toISOString(),
        attachmentUrl: leaveData.file ? `/uploads/${leaveData.file.name}` : undefined,
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return newLeave;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myLeaves'] });
      queryClient.invalidateQueries({ queryKey: ['leaveBalances'] });
      queryClient.invalidateQueries({ queryKey: ['leaveHistory'] });
      toast.success('Leave application submitted successfully');
    },
    onError: (error: any) => {
      // Don't show toast error here as we handle it in the component
      console.error('Leave application error:', error);
    },
  });
};

// Get pending approvals (for managers)
export const usePendingApprovals = () => {
  return useQuery({
    queryKey: ['pendingApprovals'],
    queryFn: async (): Promise<LeaveRequest[]> => {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{"id":"2","role":"MANAGER"}');
      
      // Mock data for demo - replace with actual API call
      const mockPendingApprovals: LeaveRequest[] = [
        {
          id: '10',
          userId: '4',
          leaveTypeId: '1',
          startDate: '2025-01-15',
          endDate: '2025-01-19',
          totalDays: 5,
          reason: 'Planning a family trip to celebrate my parents\' 25th wedding anniversary. This is a once-in-a-lifetime celebration and we have already made non-refundable bookings.',
          status: 'PENDING_RM',
          appliedAt: '2024-12-20T11:00:00Z',
          user: { id: '4', email: 'sarah@company.com', firstName: 'Sarah', lastName: 'Wilson', role: 'EMPLOYEE', department: 'Engineering' },
          leaveType: { id: '1', name: 'Annual Leave', maxDays: 25, carryForward: true, requiresApproval: true },
          reportingManagerId: '2',
          hrManagerId: '3',
        },
        {
          id: '11',
          userId: '5',
          leaveTypeId: '2',
          startDate: '2025-01-20',
          endDate: '2025-01-24',
          totalDays: 5,
          reason: 'Diagnosed with severe flu and doctor has recommended complete bed rest for recovery. Medical certificate will be provided.',
          status: 'PENDING_HR',
          appliedAt: '2024-12-21T08:30:00Z',
          user: { id: '5', email: 'mike@company.com', firstName: 'Mike', lastName: 'Chen', role: 'EMPLOYEE', department: 'Engineering' },
          leaveType: { id: '2', name: 'Sick Leave', maxDays: 10, carryForward: false, requiresApproval: true },
          reportingManagerId: '2',
          hrManagerId: '3',
          rmApprovedAt: '2024-12-21T14:30:00Z',
          rmApprovedBy: '2',
        },
        {
          id: '12',
          userId: '6',
          leaveTypeId: '3',
          startDate: '2025-02-03',
          endDate: '2025-02-03',
          totalDays: 1,
          reason: 'Need to attend my child\'s school parent-teacher conference which is scheduled during work hours.',
          status: 'PENDING_RM',
          appliedAt: '2024-12-22T14:15:00Z',
          user: { id: '6', email: 'alex@company.com', firstName: 'Alex', lastName: 'Johnson', role: 'EMPLOYEE', department: 'Marketing' },
          leaveType: { id: '3', name: 'Personal Leave', maxDays: 5, carryForward: false, requiresApproval: true },
          reportingManagerId: '7', // Different manager
          hrManagerId: '3',
        },
        {
          id: '13',
          userId: '7',
          leaveTypeId: '1',
          startDate: '2025-03-10',
          endDate: '2025-03-14',
          totalDays: 5,
          reason: 'Spring break vacation with family. We have planned this trip months in advance and have already booked flights and accommodation.',
          status: 'PENDING_HR',
          appliedAt: '2024-12-23T16:45:00Z',
          user: { id: '7', email: 'emma@company.com', firstName: 'Emma', lastName: 'Davis', role: 'EMPLOYEE', department: 'Design' },
          leaveType: { id: '1', name: 'Annual Leave', maxDays: 25, carryForward: true, requiresApproval: true },
          reportingManagerId: '8', // Different manager
          hrManagerId: '3',
          rmApprovedAt: '2024-12-23T18:30:00Z',
          rmApprovedBy: '8',
        },
        {
          id: '14',
          userId: '8',
          leaveTypeId: '2',
          startDate: '2025-01-27',
          endDate: '2025-01-28',
          totalDays: 2,
          reason: 'Medical procedure scheduled at the hospital. Recovery time recommended by doctor.',
          status: 'PENDING_RM',
          appliedAt: '2024-12-24T09:20:00Z',
          user: { id: '8', email: 'david@company.com', firstName: 'David', lastName: 'Brown', role: 'EMPLOYEE', department: 'Engineering' },
          leaveType: { id: '2', name: 'Sick Leave', maxDays: 10, carryForward: false, requiresApproval: true },
          reportingManagerId: '2',
          hrManagerId: '3',
        },
        {
          id: '15',
          userId: '9',
          leaveTypeId: '4',
          startDate: '2025-02-10',
          endDate: '2025-04-10',
          totalDays: 45,
          reason: 'Maternity leave for upcoming childbirth. Expected delivery date is February 15th.',
          status: 'PENDING_HR',
          appliedAt: '2024-12-25T10:30:00Z',
          user: { id: '9', email: 'lisa@company.com', firstName: 'Lisa', lastName: 'Martinez', role: 'EMPLOYEE', department: 'HR' },
          leaveType: { id: '4', name: 'Maternity/Paternity Leave', maxDays: 90, carryForward: false, requiresApproval: true },
          reportingManagerId: '10', // Different manager
          hrManagerId: '3',
          rmApprovedAt: '2024-12-25T12:45:00Z',
          rmApprovedBy: '10',
        },
        {
          id: '16',
          userId: '10',
          leaveTypeId: '1',
          startDate: '2025-01-30',
          endDate: '2025-02-02',
          totalDays: 4,
          reason: 'Long weekend trip to attend cousin\'s wedding out of state.',
          status: 'PENDING_RM',
          appliedAt: '2024-12-26T15:20:00Z',
          user: { id: '10', email: 'tom@company.com', firstName: 'Tom', lastName: 'Anderson', role: 'EMPLOYEE', department: 'Finance' },
          leaveType: { id: '1', name: 'Annual Leave', maxDays: 25, carryForward: true, requiresApproval: true },
          reportingManagerId: '11', // Different manager
          hrManagerId: '3',
        },
        {
          id: '17',
          userId: '11',
          leaveTypeId: '3',
          startDate: '2025-02-14',
          endDate: '2025-02-14',
          totalDays: 1,
          reason: 'Valentine\'s Day - special anniversary celebration with spouse.',
          status: 'PENDING_RM',
          appliedAt: '2024-12-27T11:45:00Z',
          user: { id: '11', email: 'rachel@company.com', firstName: 'Rachel', lastName: 'Kim', role: 'EMPLOYEE', department: 'Marketing' },
          leaveType: { id: '3', name: 'Personal Leave', maxDays: 5, carryForward: false, requiresApproval: true },
          reportingManagerId: '7', // Different manager
          hrManagerId: '3',
        },
      ];
      
      // Filter based on user role and permissions
      return mockPendingApprovals.filter(leave => {
        if (currentUser.role === 'MANAGER') {
          // Managers can only see leaves where they are the reporting manager and status is PENDING_RM
          return leave.status === 'PENDING_RM' && leave.reportingManagerId === currentUser.id;
        } else if (currentUser.role === 'ADMIN') {
          // HR/Admin can only see leaves with status PENDING_HR
          return leave.status === 'PENDING_HR';
        }
        return false;
      });
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Approve or reject leave request
export const useApproveLeave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateLeaveRequest & { approvalComment?: string } }): Promise<LeaveRequest> => {
      // Mock implementation - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const updatedLeave: LeaveRequest = {
        id,
        userId: '1',
        leaveTypeId: '1',
        startDate: '2025-01-28',
        endDate: '2025-01-28',
        totalDays: 5,
        reason: 'Personal appointment that cannot be rescheduled',
        status: data.status,
        appliedAt: '2024-12-23T10:00:00Z',
        approvedAt: new Date().toISOString(),
        approvedBy: '2', // Manager ID
        rejectionReason: data.rejectionReason,
      };
      
      return updatedLeave;
    },
    onSuccess: (_, { data }) => {
      queryClient.invalidateQueries({ queryKey: ['pendingApprovals'] });
      queryClient.invalidateQueries({ queryKey: ['myLeaves'] });
      queryClient.invalidateQueries({ queryKey: ['leaveHistory'] });
      const action = data.status === 'APPROVED' ? 'approved' : 'rejected';
      toast.success(`Leave request ${action} successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update leave request');
    },
  });
};

// Get leave details by ID
export const useLeaveDetails = (id: string) => {
  return useQuery({
    queryKey: ['leaveDetails', id],
    queryFn: async (): Promise<LeaveRequest> => {
      // Mock implementation - replace with actual API call
      const mockLeaveDetails: { [key: string]: LeaveRequest } = {
        '1': {
          id: '1',
          userId: '1',
          leaveTypeId: '1',
          startDate: '2025-02-15',
          endDate: '2025-02-19',
          totalDays: 5,
          reason: 'Family vacation to celebrate our wedding anniversary. We have planned this trip for months and have already made non-refundable bookings.',
          status: 'PENDING_RM',
          appliedAt: '2024-12-20T10:00:00Z',
          user: { id: '1', email: 'demo@company.com', firstName: 'John', lastName: 'Doe', role: 'EMPLOYEE', department: 'Engineering' },
          leaveType: { id: '1', name: 'Annual Leave', maxDays: 25, carryForward: true, requiresApproval: true },
          reportingManagerId: '2',
          hrManagerId: '3',
        },
        '2': {
          id: '2',
          userId: '1',
          leaveTypeId: '2',
          startDate: '2024-12-18',
          endDate: '2024-12-18',
          totalDays: 1,
          reason: 'Flu symptoms and fever - doctor recommended rest',
          status: 'PENDING_HR',
          appliedAt: '2024-12-17T09:00:00Z',
          user: { id: '1', email: 'demo@company.com', firstName: 'John', lastName: 'Doe', role: 'EMPLOYEE', department: 'Engineering' },
          leaveType: { id: '2', name: 'Sick Leave', maxDays: 10, carryForward: false, requiresApproval: true },
          reportingManagerId: '2',
          hrManagerId: '3',
          rmApprovedAt: '2024-12-17T11:30:00Z',
          rmApprovedBy: '2',
        },
        '10': {
          id: '10',
          userId: '1',
          leaveTypeId: '2',
          startDate: '2024-08-12',
          endDate: '2024-08-14',
          totalDays: 3,
          reason: 'Food poisoning recovery - medical certificate attached',
          status: 'APPROVED',
          appliedAt: '2024-08-11T07:30:00Z',
          rmApprovedAt: '2024-08-11T13:45:00Z',
          rmApprovedBy: '2',
          hrApprovedAt: '2024-08-11T15:30:00Z',
          hrApprovedBy: '3',
          attachmentUrl: '/uploads/medical_certificate_aug.pdf',
          user: { id: '1', email: 'demo@company.com', firstName: 'John', lastName: 'Doe', role: 'EMPLOYEE', department: 'Engineering' },
          leaveType: { id: '2', name: 'Sick Leave', maxDays: 10, carryForward: false, requiresApproval: true },
          reportingManagerId: '2',
          hrManagerId: '3',
        },
        '11': {
          id: '11',
          userId: '1',
          leaveTypeId: '4',
          startDate: '2024-07-01',
          endDate: '2024-08-30',
          totalDays: 45,
          reason: 'Paternity leave for newborn child - birth certificate attached',
          status: 'APPROVED',
          appliedAt: '2024-06-15T10:00:00Z',
          rmApprovedAt: '2024-06-16T14:30:00Z',
          rmApprovedBy: '2',
          hrApprovedAt: '2024-06-16T16:45:00Z',
          hrApprovedBy: '3',
          attachmentUrl: '/uploads/birth_certificate.pdf',
          user: { id: '1', email: 'demo@company.com', firstName: 'John', lastName: 'Doe', role: 'EMPLOYEE', department: 'Engineering' },
          leaveType: { id: '4', name: 'Maternity/Paternity Leave', maxDays: 90, carryForward: false, requiresApproval: true },
          reportingManagerId: '2',
          hrManagerId: '3',
        },
        '7': {
          id: '7',
          userId: '1',
          leaveTypeId: '1',
          startDate: '2024-09-20',
          endDate: '2024-09-22',
          totalDays: 3,
          reason: 'Weekend getaway extension - requested additional day off',
          status: 'REJECTED',
          appliedAt: '2024-09-15T12:00:00Z',
          rmApprovedAt: '2024-09-16T10:30:00Z',
          rmApprovedBy: '2',
          rejectionReason: 'Insufficient leave balance for this period. You have already used 15 days this year and only have 10 remaining.',
          user: { id: '1', email: 'demo@company.com', firstName: 'John', lastName: 'Doe', role: 'EMPLOYEE', department: 'Engineering' },
          leaveType: { id: '1', name: 'Annual Leave', maxDays: 25, carryForward: true, requiresApproval: true },
          reportingManagerId: '2',
          hrManagerId: '3',
        },
      };
      
      const leave = mockLeaveDetails[id];
      if (!leave) {
        throw new Error('Leave request not found');
      }
      
      return leave;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get leave history with filters
export const useLeaveHistory = (filters?: { year?: number; status?: string; userId?: string }) => {
  return useQuery({
    queryKey: ['leaveHistory', filters],
    queryFn: async (): Promise<LeaveRequest[]> => {
      // Mock implementation - replace with actual API call
      const mockHistory: LeaveRequest[] = [
        {
          id: '1',
          userId: '1',
          leaveTypeId: '1',
          startDate: '2024-11-28',
          endDate: '2024-11-29',
          totalDays: 2,
          reason: 'Thanksgiving holiday with extended family',
          status: 'APPROVED',
          appliedAt: '2024-11-20T15:00:00Z',
          rmApprovedAt: '2024-11-21T09:15:00Z',
          rmApprovedBy: '2',
          hrApprovedAt: '2024-11-21T16:45:00Z',
          hrApprovedBy: '3',
          leaveType: { id: '1', name: 'Annual Leave', maxDays: 25, carryForward: true, requiresApproval: true },
          reportingManagerId: '2',
          hrManagerId: '3',
        },
        {
          id: '2',
          userId: '1',
          leaveTypeId: '2',
          startDate: '2024-10-15',
          endDate: '2024-10-16',
          totalDays: 2,
          reason: 'Medical procedure and recovery',
          status: 'APPROVED',
          appliedAt: '2024-10-10T08:30:00Z',
          rmApprovedAt: '2024-10-10T16:45:00Z',
          rmApprovedBy: '2',
          hrApprovedAt: '2024-10-11T09:30:00Z',
          hrApprovedBy: '3',
          leaveType: { id: '2', name: 'Sick Leave', maxDays: 10, carryForward: false, requiresApproval: true },
          reportingManagerId: '2',
          hrManagerId: '3',
        },
        {
          id: '3',
          userId: '1',
          leaveTypeId: '1',
          startDate: '2024-09-20',
          endDate: '2024-09-22',
          totalDays: 3,
          reason: 'Weekend getaway extension',
          status: 'REJECTED',
          appliedAt: '2024-09-15T12:00:00Z',
          rmApprovedAt: '2024-09-16T10:30:00Z',
          rmApprovedBy: '2',
          rejectionReason: 'Insufficient leave balance for this period',
          leaveType: { id: '1', name: 'Annual Leave', maxDays: 25, carryForward: true, requiresApproval: true },
          reportingManagerId: '2',
          hrManagerId: '3',
        },
        {
          id: '4',
          userId: '1',
          leaveTypeId: '2',
          startDate: '2024-08-12',
          endDate: '2024-08-14',
          totalDays: 3,
          reason: 'Food poisoning recovery',
          status: 'APPROVED',
          appliedAt: '2024-08-11T07:30:00Z',
          rmApprovedAt: '2024-08-11T13:45:00Z',
          rmApprovedBy: '2',
          hrApprovedAt: '2024-08-11T15:30:00Z',
          hrApprovedBy: '3',
          attachmentUrl: '/uploads/medical_certificate_aug.pdf',
          leaveType: { id: '2', name: 'Sick Leave', maxDays: 10, carryForward: false, requiresApproval: true },
          reportingManagerId: '2',
          hrManagerId: '3',
        },
        {
          id: '5',
          userId: '1',
          leaveTypeId: '4',
          startDate: '2024-07-01',
          endDate: '2024-08-30',
          totalDays: 45,
          reason: 'Paternity leave for newborn child',
          status: 'APPROVED',
          appliedAt: '2024-06-15T10:00:00Z',
          rmApprovedAt: '2024-06-16T14:30:00Z',
          rmApprovedBy: '2',
          hrApprovedAt: '2024-06-16T16:45:00Z',
          hrApprovedBy: '3',
          attachmentUrl: '/uploads/birth_certificate.pdf',
          leaveType: { id: '4', name: 'Maternity/Paternity Leave', maxDays: 90, carryForward: false, requiresApproval: true },
          reportingManagerId: '2',
          hrManagerId: '3',
        },
        {
          id: '6',
          userId: '1',
          leaveTypeId: '1',
          startDate: '2024-05-20',
          endDate: '2024-05-24',
          totalDays: 5,
          reason: 'Summer vacation with friends',
          status: 'CANCELLED',
          appliedAt: '2024-05-10T12:00:00Z',
          leaveType: { id: '1', name: 'Annual Leave', maxDays: 25, carryForward: true, requiresApproval: true },
          reportingManagerId: '2',
          hrManagerId: '3',
        },
        {
          id: '7',
          userId: '1',
          leaveTypeId: '3',
          startDate: '2024-04-22',
          endDate: '2024-04-22',
          totalDays: 1,
          reason: 'Personal appointment with lawyer',
          status: 'APPROVED',
          appliedAt: '2024-04-18T14:20:00Z',
          rmApprovedAt: '2024-04-19T10:15:00Z',
          rmApprovedBy: '2',
          hrApprovedAt: '2024-04-19T14:30:00Z',
          hrApprovedBy: '3',
          leaveType: { id: '3', name: 'Personal Leave', maxDays: 5, carryForward: false, requiresApproval: true },
          reportingManagerId: '2',
          hrManagerId: '3',
        },
        {
          id: '8',
          userId: '1',
          leaveTypeId: '1',
          startDate: '2024-03-15',
          endDate: '2024-03-18',
          totalDays: 4,
          reason: 'Spring break vacation',
          status: 'APPROVED',
          appliedAt: '2024-03-01T11:30:00Z',
          rmApprovedAt: '2024-03-02T16:45:00Z',
          rmApprovedBy: '2',
          hrApprovedAt: '2024-03-03T09:15:00Z',
          hrApprovedBy: '3',
          leaveType: { id: '1', name: 'Annual Leave', maxDays: 25, carryForward: true, requiresApproval: true },
          reportingManagerId: '2',
          hrManagerId: '3',
        },
      ];
      
      let filteredHistory = mockHistory;
      
      if (filters?.status) {
        filteredHistory = filteredHistory.filter(leave => leave.status === filters.status);
      }
      
      if (filters?.year) {
        filteredHistory = filteredHistory.filter(leave => 
          new Date(leave.startDate).getFullYear() === filters.year
        );
      }
      
      return filteredHistory;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useLeaveTypes = () => {
  return useQuery({
    queryKey: ['leaveTypes'],
    queryFn: async (): Promise<LeaveType[]> => {
      // Mock data for demo - replace with actual API call
      const mockLeaveTypes: LeaveType[] = [
        { id: '1', name: 'Annual Leave', maxDays: 25, carryForward: true, requiresApproval: true },
        { id: '2', name: 'Sick Leave', maxDays: 10, carryForward: false, requiresApproval: true },
        { id: '3', name: 'Personal Leave', maxDays: 5, carryForward: false, requiresApproval: true },
        { id: '4', name: 'Maternity/Paternity Leave', maxDays: 90, carryForward: false, requiresApproval: true },
      ];
      return mockLeaveTypes;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useLeaveBalances = (userId?: string) => {
  return useQuery({
    queryKey: ['leaveBalances', userId],
    queryFn: async (): Promise<LeaveBalance[]> => {
      // Mock data for demo - replace with actual API call
      const mockBalances: LeaveBalance[] = [
        {
          id: '1',
          userId: userId || '1',
          leaveTypeId: '1',
          totalDays: 25,
          usedDays: 7,
          remainingDays: 18,
          year: 2024,
          leaveType: { id: '1', name: 'Annual Leave', maxDays: 25, carryForward: true, requiresApproval: true },
        },
        {
          id: '2',
          userId: userId || '1',
          leaveTypeId: '2',
          totalDays: 10,
          usedDays: 3,
          remainingDays: 7,
          year: 2024,
          leaveType: { id: '2', name: 'Sick Leave', maxDays: 10, carryForward: false, requiresApproval: true },
        },
        {
          id: '3',
          userId: userId || '1',
          leaveTypeId: '3',
          totalDays: 5,
          usedDays: 0,
          remainingDays: 5,
          year: 2024,
          leaveType: { id: '3', name: 'Personal Leave', maxDays: 5, carryForward: false, requiresApproval: true },
        },
      ];
      return mockBalances;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Cancel leave request
export const useCancelLeave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      // Mock implementation - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myLeaves'] });
      queryClient.invalidateQueries({ queryKey: ['pendingApprovals'] });
      queryClient.invalidateQueries({ queryKey: ['leaveBalances'] });
      queryClient.invalidateQueries({ queryKey: ['leaveHistory'] });
      toast.success('Leave request cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel leave request');
    },
  });
};

// Legacy hooks for backward compatibility
export const useLeaveRequests = (status?: string, userId?: string) => {
  return useMyLeaves(status);
};

export const useCreateLeaveRequest = () => {
  return useApplyLeave();
};

export const useUpdateLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateLeaveRequest }): Promise<LeaveRequest> => {
      // Mock implementation - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const updatedLeave: LeaveRequest = {
        id,
        userId: '1',
        leaveTypeId: '1',
        startDate: '2024-12-20',
        endDate: '2024-12-22',
        totalDays: 3,
        reason: 'Family vacation',
        status: data.status,
        appliedAt: '2024-12-15T10:00:00Z',
        approvedAt: new Date().toISOString(),
        rejectionReason: data.rejectionReason,
      };
      
      return updatedLeave;
    },
    onSuccess: (_, { data }) => {
      queryClient.invalidateQueries({ queryKey: ['myLeaves'] });
      queryClient.invalidateQueries({ queryKey: ['pendingApprovals'] });
      queryClient.invalidateQueries({ queryKey: ['leaveBalances'] });
      queryClient.invalidateQueries({ queryKey: ['leaveHistory'] });
      const action = data.status === 'APPROVED' ? 'approved' : 'rejected';
      toast.success(`Leave request ${action} successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update leave request');
    },
  });
};

export const useCancelLeaveRequest = () => {
  return useCancelLeave();
};