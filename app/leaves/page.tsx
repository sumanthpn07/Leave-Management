'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';

export default function LeavesPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">My Leaves</h1>
          <p className="text-gray-600">Leave requests and history will be displayed here.</p>
        </div>
      </div>
    </ProtectedRoute>
  );
}