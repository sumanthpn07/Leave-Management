import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const leaveApi = {
  // Get user's own leave requests
  getMyLeaves: () => api.get('/leaves/my'),
  
  // Apply for new leave
  applyLeave: (data: any) => api.post('/leaves', data),
  
  // Get pending approvals (for managers)
  getPendingApprovals: () => api.get('/leaves/pending'),
  
  // Approve/reject leave request
  approveLeave: (id: string, data: any) => api.patch(`/leaves/${id}/approve`, data),
  
  // Get leave details by ID
  getLeaveDetails: (id: string) => api.get(`/leaves/${id}`),
  
  // Get leave history
  getLeaveHistory: (params?: any) => api.get('/leaves/history', { params }),
  
  // Get leave types
  getLeaveTypes: () => api.get('/leave-types'),
  
  // Get leave balances
  getLeaveBalances: () => api.get('/leaves/balances'),
  
  // Cancel leave request
  cancelLeave: (id: string) => api.delete(`/leaves/${id}`),
};