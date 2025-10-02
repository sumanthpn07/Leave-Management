'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, leaveApi } from '@/lib/api';
import { LeaveRequest, CreateLeaveRequest, UpdateLeaveRequest, LeaveBalance, LeaveType } from '@/types/leave';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/auth-context';

// Get user's own leave requests - INTEGRATED WITH BACKEND
export const useMyLeaves = (status?: string) => {
  return useQuery({
    queryKey: ['myLeaves', status],
    queryFn: async (): Promise<LeaveRequest[]> => {
      try {
        const response = await leaveApi.getMyLeaves(); // GET /leaves
        const apiLeaves = response.data?.data || response.data;
        
        // Map backend response to frontend type
        const mappedLeaves: LeaveRequest[] = apiLeaves.map((leave: any) => ({
          id: leave.id,
          userId: leave.employeeId,
          leaveTypeId: String(leave.leaveType),
          startDate: leave.startDate,
          endDate: leave.endDate,
          totalDays: leave.totalDays,
          reason: leave.reason,
          status: leave.status,
          appliedAt: leave.appliedAt,
          attachmentUrl: leave.documents,
          leaveType: {
            id: String(leave.leaveType),
            name: String(leave.leaveType),
            maxDays: 25, // Default value
            carryForward: true,
            requiresApproval: true,
          },
          reportingManagerId: leave.employee?.reportingManagerId,
          hrManagerId: undefined, // Not in backend response
        }));
        
        return status ? mappedLeaves.filter(leave => leave.status === status) : mappedLeaves;
      } catch (error) {
        console.error('Error fetching leaves:', error);
        // Fallback to empty array on error
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get pending approvals for managers - INTEGRATED WITH BACKEND
export const usePendingApprovals = () => {
  return useQuery({
    queryKey: ['pendingApprovals'],
    queryFn: async (): Promise<LeaveRequest[]> => {
      try {
        const response = await leaveApi.getPendingApprovals(); // GET /approvals/pending
        const apiLeaves = response.data?.data || response.data;
        
        // Map backend response to frontend type
        const mappedLeaves: LeaveRequest[] = apiLeaves.map((leave: any) => ({
          id: leave.id,
          userId: leave.employeeId,
          leaveTypeId: String(leave.leaveType),
          startDate: leave.startDate,
          endDate: leave.endDate,
          totalDays: leave.totalDays,
          reason: leave.reason,
          status: leave.status,
          appliedAt: leave.appliedAt,
          attachmentUrl: leave.documents,
          leaveType: {
            id: String(leave.leaveType),
            name: String(leave.leaveType),
            maxDays: 25, // Default value
            carryForward: true,
            requiresApproval: true,
          },
          user: leave.employee, // Include employee details for pending approvals
          reportingManagerId: leave.employee?.reportingManagerId,
          hrManagerId: undefined, // Not in backend response
        }));
        
        return mappedLeaves;
      } catch (error) {
        console.error('Error fetching pending approvals:', error);
        // Fallback to empty array on error
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get leave balances - INTEGRATED WITH BACKEND
export const useLeaveBalances = () => {
  return useQuery({
    queryKey: ['leaveBalances'],
    queryFn: async (): Promise<LeaveBalance[]> => {
      try {
        const response = await leaveApi.getLeaveBalances(); // GET /leaves/balances
        const apiBalances = response.data?.data || response.data;
        
        // Map backend response to frontend type
        const mappedBalances: LeaveBalance[] = apiBalances.map((balance: any) => ({
          id: balance.id,
          leaveTypeId: String(balance.leaveType),
          allocated: balance.allocated,
          used: balance.used,
          remaining: balance.remaining,
          carryForward: balance.carryForward,
          year: balance.year,
          leaveType: {
            id: String(balance.leaveType),
            name: String(balance.leaveType),
            maxDays: balance.allocated,
            carryForward: balance.carryForward > 0,
            requiresApproval: true,
          },
        }));
        
        return mappedBalances;
      } catch (error) {
        console.error('Error fetching leave balances:', error);
        // Fallback to empty array on error
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get leave types - STATIC DATA
export const useLeaveTypes = () => {
  return useQuery({
    queryKey: ['leaveTypes'],
    queryFn: async (): Promise<LeaveType[]> => {
      const leaveTypes: LeaveType[] = [
        { id: 'ANNUAL', name: 'Annual Leave', maxDays: 18, carryForward: true, requiresApproval: true },
        { id: 'SICK', name: 'Sick Leave', maxDays: 10, carryForward: false, requiresApproval: true },
        { id: 'PERSONAL', name: 'Personal Leave', maxDays: 18, carryForward: false, requiresApproval: true },
      ];
      return leaveTypes;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Apply for leave - INTEGRATED WITH BACKEND
export const useApplyLeave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData): Promise<LeaveRequest> => {
      const response = await leaveApi.applyLeave(formData);
      return response.data?.data || response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myLeaves'] });
      queryClient.invalidateQueries({ queryKey: ['leaveBalances'] });
      toast.success('Leave request submitted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit leave request');
    },
  });
};

// Update leave - INTEGRATED WITH BACKEND
export const useUpdateLeave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }): Promise<LeaveRequest> => {
      const response = await leaveApi.updateLeave(id, formData);
      return response.data?.data || response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myLeaves'] });
      queryClient.invalidateQueries({ queryKey: ['leaveDetails'] });
      toast.success('Leave request updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update leave request');
    },
  });
};

// Cancel leave - INTEGRATED WITH BACKEND
export const useCancelLeave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await leaveApi.cancelLeave(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myLeaves'] });
      queryClient.invalidateQueries({ queryKey: ['leaveDetails'] });
      toast.success('Leave request cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel leave request');
    },
  });
};

// Approve/Reject leave - INTEGRATED WITH BACKEND
export const useApproveLeave = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { status: string; approvalComment?: string; rejectionReason?: string } }): Promise<LeaveRequest> => {
      // Determine the approver type based on current user role
      let approverType = 'REPORTING_MANAGER'; // Default
      
      if (user?.role === 'HR_MANAGER') {
        approverType = 'HR_MANAGER';
      } else if (user?.role === 'REPORTING_MANAGER') {
        approverType = 'REPORTING_MANAGER';
      } else if (user?.role === 'ADMIN') {
        // Admin can act as either approver type, default to REPORTING_MANAGER
        approverType = 'REPORTING_MANAGER';
      }
      
      if (data.status === 'APPROVED') {
        const response = await leaveApi.approveLeave(id, {
          action: 'approve',
          approverType: approverType,
          comments: data.approvalComment,
        });
        return response.data?.data || response.data;
      } else {
        const response = await leaveApi.rejectLeave(id, {
          action: 'reject',
          approverType: approverType,
          comments: data.rejectionReason,
        });
        return response.data?.data || response.data;
      }
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

// Get leave details by ID - INTEGRATED WITH BACKEND
export const useLeaveDetails = (id: string) => {
  return useQuery({
    queryKey: ['leaveDetails', id],
    queryFn: async (): Promise<LeaveRequest> => {
      const response = await leaveApi.getLeaveDetails(id);
      const leave = response.data?.data || response.data;
      
      return {
        id: leave.id,
        userId: leave.employeeId,
        leaveTypeId: String(leave.leaveType),
        startDate: leave.startDate,
        endDate: leave.endDate,
        totalDays: leave.totalDays,
        reason: leave.reason,
        status: leave.status,
        appliedAt: leave.appliedAt,
        attachmentUrl: leave.documents,
        leaveType: {
          id: String(leave.leaveType),
          name: String(leave.leaveType),
          maxDays: 25, // Default value
          carryForward: true,
          requiresApproval: true,
        },
        reportingManagerId: leave.employee?.reportingManagerId,
        hrManagerId: undefined, // Not in backend response
      };
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get approval history for a leave request - INTEGRATED WITH BACKEND
export const useApprovalHistory = (id: string) => {
  return useQuery({
    queryKey: ['approvalHistory', id],
    queryFn: async (): Promise<any[]> => {
      const response = await leaveApi.getApprovalHistory(id);
      const history = response.data?.data || response.data;
      
      // Return the history array directly (backend now includes "Applied" entry)
      return history.approvals || [];
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
