import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStatusDisplayName(status: string) {
  switch (status) {
    case 'PENDING_RM': return 'Pending RM';
    case 'PENDING_HR': return 'Pending HR';
    case 'APPROVED': return 'Approved';
    case 'REJECTED': return 'Rejected';
    case 'CANCELLED': return 'Cancelled';
    default: return status.toLowerCase();
  }
}