
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export const AdminLayout: React.FC = () => {
  const { role, loading } = useUserRole();

  console.log('AdminLayout - Role:', role, 'Loading:', loading); // Debug log

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (role !== 'admin' && role !== 'staff') {
    console.log('Access denied - redirecting to home. Current role:', role); // Debug log
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
