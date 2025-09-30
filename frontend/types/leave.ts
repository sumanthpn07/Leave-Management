export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'EMPLOYEE' | 'MANAGER' | 'ADMIN';
  department: string;
  managerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LeaveType {
  id: string;
  name: string;
  maxDays: number;
  carryForward: boolean;
  requiresApproval: boolean;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'PENDING' | 'PENDING_RM' | 'PENDING_HR' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  appliedAt: string;
  rmApprovedAt?: string;
  rmApprovedBy?: string;
  hrApprovedAt?: string;
  hrApprovedBy?: string;
  rejectionReason?: string;
  attachmentUrl?: string;
  reportingManagerId?: string;
  hrManagerId?: string;
  user?: User;
  leaveType?: LeaveType;
  rmApprover?: User;
  hrApprover?: User;
}

export interface LeaveBalance {
  id: string;
  userId: string;
  leaveTypeId: string;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  year: number;
  leaveType?: LeaveType;
}

export interface CreateLeaveRequest {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface UpdateLeaveRequest {
  status: 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}