'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, leaveApi } from '@/lib/api';
import { LeaveRequest, CreateLeaveRequest, UpdateLeaveRequest, LeaveBalance, LeaveType } from '@/types/leave';
import { toast } from 'sonner';

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

// Apply for new leave
export const useApplyLeave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateLeaveRequest | FormData): Promise<LeaveRequest> => {
      let leaveData: any;
      
      if (data instanceof FormData) {
        leaveData = {
          leaveType: data.get('leaveTypeId'), // Map leaveTypeId to leaveType for backend
          startDate: data.get('startDate'),
          endDate: data.get('endDate'),
          reason: data.get('reason'),
          documents: data.get('file') ? 'uploaded_document.pdf' : undefined, // Handle file upload
        };
      } else {
        leaveData = {
          leaveType: data.leaveTypeId, // Map leaveTypeId to leaveType for backend
          startDate: data.startDate,
          endDate: data.endDate,
          reason: data.reason,
        };
      }
      
      const response = await leaveApi.applyLeave(leaveData);
      return response.data?.data || response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myLeaves'] });
      queryClient.invalidateQueries({ queryKey: ['leaveBalances'] });
      queryClient.invalidateQueries({ queryKey: ['leaveHistory'] });
      toast.success('Leave application submitted successfully');
    },
    onError: (error: any) => {
      console.error('Leave application error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit leave application');
    },
  });
};

// Get pending approvals (for managers)
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
            maxDays: 25,
            carryForward: true,
            requiresApproval: true,
          },
          reportingManagerId: leave.employee?.reportingManagerId,
          hrManagerId: undefined,
          user: leave.employee ? {
            id: leave.employee.id,
            email: leave.employee.email,
            firstName: leave.employee.name?.split(' ')[0] || '',
            lastName: leave.employee.name?.split(' ').slice(1).join(' ') || '',
            role: leave.employee.role,
            department: leave.employee.department,
          } : undefined,
        }));
        
        return mappedLeaves;
      } catch (error) {
        console.error('Error fetching pending approvals:', error);
        return [];
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Approve or reject leave request
export const useApproveLeave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateLeaveRequest & { approvalComment?: string } }): Promise<LeaveRequest> => {
      const response = await leaveApi.approveLeave(id, {
        comments: data.approvalComment,
      });
      return response.data?.data || response.data;
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
          maxDays: 25,
          carryForward: true,
          requiresApproval: true,
        },
        reportingManagerId: leave.employee?.reportingManagerId,
        hrManagerId: undefined,
      };
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
      // Use the same API as myLeaves but with filters
      const response = await leaveApi.getMyLeaves();
      const apiLeaves = response.data?.data || response.data;
      
      let filteredLeaves = apiLeaves.map((leave: any) => ({
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
          maxDays: 25,
          carryForward: true,
          requiresApproval: true,
        },
        reportingManagerId: leave.employee?.reportingManagerId,
        hrManagerId: undefined,
      }));
      
      if (filters?.status) {
        filteredLeaves = filteredLeaves.filter(leave => leave.status === filters.status);
      }
      
      if (filters?.year) {
        filteredLeaves = filteredLeaves.filter(leave => 
          new Date(leave.startDate).getFullYear() === filters.year
        );
      }
      
      return filteredLeaves;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useLeaveTypes = () => {
  return useQuery({
    queryKey: ['leaveTypes'],
    queryFn: async (): Promise<LeaveType[]> => {
      // Return static leave types for now
      const leaveTypes: LeaveType[] = [
        { id: 'ANNUAL', name: 'Annual Leave', maxDays: 18, carryForward: true, requiresApproval: true },
        { id: 'SICK', name: 'Sick Leave', maxDays: 10, carryForward: false, requiresApproval: true },
        { id: 'PERSONAL', name: 'Personal Leave', maxDays: 12, carryForward: false, requiresApproval: true },
        { id: 'MATERNITY_PATERNITY', name: 'Maternity/Paternity Leave', maxDays: 90, carryForward: false, requiresApproval: true },
      ];
      return leaveTypes;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Integrate leave balances with backend
export const useLeaveBalances = (userId?: string) => {
  return useQuery({
    queryKey: ['leaveBalances', userId],
    queryFn: async (): Promise<LeaveBalance[]> => {
      try {
        const response = await leaveApi.getLeaveBalances(); // GET /leaves/balances
        const apiBalances = response.data?.data || response.data;
        
        // Map backend entity to frontend type
        const mapped: LeaveBalance[] = apiBalances.map((b: any) => ({
          id: b.id,
          userId: b.employeeId,
          leaveTypeId: String(b.leaveType),
          totalDays: b.allocated ?? 0,
          usedDays: b.used ?? 0,
          remainingDays: b.remaining ?? Math.max((b.allocated ?? 0) - (b.used ?? 0), 0),
          year: b.year,
          leaveType: {
            id: String(b.leaveType),
            name: String(b.leaveType),
            maxDays: b.allocated ?? 0,
            carryForward: !!b.carryForward,
            requiresApproval: true,
          },
        }));
        return mapped;
      } catch (error) {
        console.error('Error fetching leave balances:', error);
        return [];
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Cancel leave request
export const useCancelLeave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await leaveApi.cancelLeave(id);
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

// Update leave request
export const useUpdateLeave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CreateLeaveRequest | FormData }): Promise<LeaveRequest> => {
      let leaveData: any;
      
      if (data instanceof FormData) {
        leaveData = {
          leaveType: data.get('leaveTypeId'), // Map leaveTypeId to leaveType for backend
          startDate: data.get('startDate'),
          endDate: data.get('endDate'),
          reason: data.get('reason'),
          documents: data.get('file') ? 'uploaded_document.pdf' : undefined, // Handle file upload
        };
      } else {
        leaveData = {
          leaveType: data.leaveTypeId, // Map leaveTypeId to leaveType for backend
          startDate: data.startDate,
          endDate: data.endDate,
          reason: data.reason,
        };
      }
      
      const response = await leaveApi.updateLeave(id, leaveData);
      return response.data?.data || response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myLeaves'] });
      queryClient.invalidateQueries({ queryKey: ['leaveDetails'] });
      queryClient.invalidateQueries({ queryKey: ['pendingApprovals'] });
      queryClient.invalidateQueries({ queryKey: ['leaveBalances'] });
      queryClient.invalidateQueries({ queryKey: ['leaveHistory'] });
      toast.success('Leave request updated successfully');
    },
    onError: (error: any) => {
      console.error('Leave update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update leave request');
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
      const response = await leaveApi.approveLeave(id, {
        comments: data.rejectionReason,
      });
      return response.data?.data || response.data;
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

// Get approval history for a leave
export const useApprovalHistory = (id: string) => {
  return useQuery({
    queryKey: ['approvalHistory', id],
    queryFn: async (): Promise<Array<{ id: string; action: string; comments?: string; timestamp: string; approver?: { name?: string; role?: string } }>> => {
      const response = await leaveApi.getApprovalHistory(id);
      const data = response.data?.data || response.data;
      const approvals = Array.isArray(data?.approvals) ? data.approvals : data;
      return approvals?.map((a: any) => ({
        id: a.id,
        action: String(a.action || a.status || '').toUpperCase(),
        comments: a.comments,
        timestamp: a.timestamp || a.createdAt || a.updatedAt,
        approver: a.approver || a.employee ? {
          name: a.approver?.name || a.employee?.name,
          role: a.approver?.role || a.employee?.role,
        } : undefined,
      })) || [];
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};
