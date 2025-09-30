import { Suspense } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { LeaveDetailsClient } from '@/components/leaves/leave-details-client';

export async function generateStaticParams() {
  // Return the IDs from the mock data in useLeaveDetails hook
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
  ];
}

interface PageProps {
  params: {
    id: string;
  };
}

export default function LeaveDetailsPage({ params }: PageProps) {
  return (
    <ProtectedRoute>
      <Suspense fallback={<LeaveDetailsLoading />}>
        <LeaveDetailsClient leaveId={params.id} />
      </Suspense>
    </ProtectedRoute>
  );
}

function LeaveDetailsLoading() {
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