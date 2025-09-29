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
          startDate: '2025-01-20',
          endDate: '2025-01-22',
          totalDays: 3,
          reason: 'Winter vacation',
          status: 'APPROVED',
          appliedAt: '2024-12-18T10:00:00Z',
          approvedAt: '2024-12-19T14:30:00Z',
          leaveType: { id: '1', name: 'Annual Leave', maxDays: 25, carryForward: true, requiresApproval: true },
        },
        {
          id: '2',
          userId: '1',
          leaveTypeId: '2',
          startDate: '2024-12-18',
          endDate: '2024-12-18',
          totalDays: 1,
          reason: 'Flu symptoms',
          status: 'APPROVED',
          appliedAt: '2024-12-17T09:00:00Z',
          approvedAt: '2024-12-17T11:30:00Z',
          leaveType: { id: '2', name: 'Sick Leave', maxDays: 10, carryForward: false, requiresApproval: true },
        },
        {
          id: '7',
          userId: '1',
          leaveTypeId: '1',
          startDate: '2025-03-15',
          endDate: '2025-03-17',
          totalDays: 3,
          reason: 'Spring break',
          status: 'APPROVED',
          appliedAt: '2024-12-20T15:00:00Z',
          approvedAt: '2024-12-21T09:15:00Z',
          leaveType: { id: '1', name: 'Annual Leave', maxDays: 25, carryForward: true, requiresApproval: true },
        },
        {
          id: '8',
          userId: '1',
          leaveTypeId: '3',
          startDate: '2025-02-14',
          endDate: '2025-02-14',
          totalDays: 1,
          reason: 'Personal matters',
          status: 'PENDING',
          appliedAt: '2024-12-22T10:00:00Z',
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
    mutationFn: async (data: CreateLeaveRequest): Promise<LeaveRequest> => {
      // Mock implementation - replace with actual API call
      const newLeave: LeaveRequest = {
        id: Date.now().toString(),
        userId: '1',
        leaveTypeId: data.leaveTypeId,
        startDate: data.startDate,
        endDate: data.endDate,
        totalDays: Math.ceil((new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1,
        reason: data.reason,
        status: 'PENDING',
        appliedAt: new Date().toISOString(),
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
      toast.error(error.response?.data?.message || 'Failed to submit leave application');
    },
  });
};

// Get pending approvals (for managers)
export const usePendingApprovals = () => {
  return useQuery({
    queryKey: ['pendingApprovals'],
    queryFn: async (): Promise<LeaveRequest[]> => {
      // Mock data for demo - replace with actual API call
      const mockPendingApprovals: LeaveRequest[] = [
        {
          id: '3',
          userId: '4',
          leaveTypeId: '1',
          startDate: '2025-01-15',
          endDate: '2025-01-19',
          totalDays: 5,
          reason: 'Winter vacation',
          status: 'PENDING',
          appliedAt: '2024-12-18T11:00:00Z',
          user: { id: '4', email: 'sarah@company.com', firstName: 'Sarah', lastName: 'Wilson', role: 'EMPLOYEE', department: 'Engineering' },
          leaveType: { id: '1', name: 'Annual Leave', maxDays: 25, carryForward: true, requiresApproval: true },
        },
        {
          id: '4',
          userId: '5',
          leaveTypeId: '2',
          startDate: '2024-12-18',
          endDate: '2024-12-18',
          totalDays: 1,
          reason: 'Flu symptoms',
          status: 'PENDING',
          appliedAt: '2024-12-17T08:30:00Z',
          user: { id: '5', email: 'mike@company.com', firstName: 'Mike', lastName: 'Chen', role: 'EMPLOYEE', department: 'Engineering' },
          leaveType: { id: '2', name: 'Sick Leave', maxDays: 10, carryForward: false, requiresApproval: true },
        },
      ];
      
      return mockPendingApprovals;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Approve or reject leave request
export const useApproveLeave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateLeaveRequest }): Promise<LeaveRequest> => {
      // Mock implementation - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const updatedLeave: LeaveRequest = {
        id,
        userId: '4',
        leaveTypeId: '1',
        startDate: '2025-01-15',
        endDate: '2025-01-19',
        totalDays: 5,
        reason: 'Winter vacation',
        status: data.status,
        appliedAt: '2024-12-18T11:00:00Z',
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
      const mockLeaveDetails: LeaveRequest = {
        id,
        userId: '1',
        leaveTypeId: '1',
        startDate: '2024-12-20',
        endDate: '2024-12-22',
        totalDays: 3,
        reason: 'Family vacation - visiting relatives for holidays',
        status: 'PENDING',
        appliedAt: '2024-12-15T10:00:00Z',
        user: { id: '1', email: 'demo@company.com', firstName: 'John', lastName: 'Doe', role: 'EMPLOYEE', department: 'Engineering' },
        leaveType: { id: '1', name: 'Annual Leave', maxDays: 25, carryForward: true, requiresApproval: true },
      };
      
      return mockLeaveDetails;
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
          startDate: '2024-12-20',
          endDate: '2024-12-22',
          totalDays: 3,
          reason: 'Family vacation',
          status: 'PENDING',
          appliedAt: '2024-12-15T10:00:00Z',
          leaveType: { id: '1', name: 'Annual Leave', maxDays: 25, carryForward: true, requiresApproval: true },
        },
        {
          id: '2',
          userId: '1',
          leaveTypeId: '2',
          startDate: '2024-12-15',
          endDate: '2024-12-15',
          totalDays: 1,
          reason: 'Medical appointment',
          status: 'APPROVED',
          appliedAt: '2024-12-10T09:00:00Z',
          approvedAt: '2024-12-11T14:30:00Z',
          leaveType: { id: '2', name: 'Sick Leave', maxDays: 10, carryForward: false, requiresApproval: true },
        },
        {
          id: '6',
          userId: '1',
          leaveTypeId: '1',
          startDate: '2024-11-28',
          endDate: '2024-11-29',
          totalDays: 2,
          reason: 'Thanksgiving break',
          status: 'APPROVED',
          appliedAt: '2024-11-20T15:00:00Z',
          approvedAt: '2024-11-21T09:15:00Z',
          leaveType: { id: '1', name: 'Annual Leave', maxDays: 25, carryForward: true, requiresApproval: true },
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
          usedDays: 5,
          remainingDays: 20,
          year: 2024,
          leaveType: { id: '1', name: 'Annual Leave', maxDays: 25, carryForward: true, requiresApproval: true },
        },
        {
          id: '2',
          userId: userId || '1',
          leaveTypeId: '2',
          totalDays: 10,
          usedDays: 1,
          remainingDays: 9,
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