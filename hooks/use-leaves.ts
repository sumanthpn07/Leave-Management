'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { LeaveRequest, CreateLeaveRequest, UpdateLeaveRequest, LeaveBalance, LeaveType } from '@/types/leave';
import { toast } from 'sonner';

export const useLeaveTypes = () => {
  return useQuery({
    queryKey: ['leaveTypes'],
    queryFn: async (): Promise<LeaveType[]> => {
      const response = await api.get('/leave-types');
      return response.data;
    },
  });
};

export const useLeaveRequests = (status?: string, userId?: string) => {
  return useQuery({
    queryKey: ['leaveRequests', status, userId],
    queryFn: async (): Promise<LeaveRequest[]> => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (userId) params.append('userId', userId);
      
      const response = await api.get(`/leave-requests?${params.toString()}`);
      return response.data;
    },
  });
};

export const useLeaveBalances = (userId?: string) => {
  return useQuery({
    queryKey: ['leaveBalances', userId],
    queryFn: async (): Promise<LeaveBalance[]> => {
      const endpoint = userId ? `/leave-balances/${userId}` : '/leave-balances';
      const response = await api.get(endpoint);
      return response.data;
    },
  });
};

export const useCreateLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateLeaveRequest): Promise<LeaveRequest> => {
      const response = await api.post('/leave-requests', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      queryClient.invalidateQueries({ queryKey: ['leaveBalances'] });
      toast.success('Leave request submitted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit leave request');
    },
  });
};

export const useUpdateLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateLeaveRequest }): Promise<LeaveRequest> => {
      const response = await api.patch(`/leave-requests/${id}`, data);
      return response.data;
    },
    onSuccess: (_, { data }) => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      queryClient.invalidateQueries({ queryKey: ['leaveBalances'] });
      const action = data.status === 'APPROVED' ? 'approved' : 'rejected';
      toast.success(`Leave request ${action} successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update leave request');
    },
  });
};

export const useCancelLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/leave-requests/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      queryClient.invalidateQueries({ queryKey: ['leaveBalances'] });
      toast.success('Leave request cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel leave request');
    },
  });
};