
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/contexts/AuthContext';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export const AdminLayout: React.FC = () => {
  const { role, loading } = useUserRole();
  const { user, loading: authLoading } = useAuth();

  console.log('AdminLayout - Role:', role, 'Loading:', loading, 'User:', user?.email, 'AuthLoading:', authLoading); // Debug log

  // Show loading while auth or role is loading
  if (loading || authLoading) {
    console.log('AdminLayout - Still loading, showing spinner'); // Debug log
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    console.log('AdminLayout - No user found, redirecting to auth'); // Debug log
    return <Navigate to="/auth" replace />;
  }

  // Check admin/staff access
  if (role !== 'admin' && role !== 'staff') {
    console.log('AdminLayout - Access denied, redirecting to home. Current role:', role); // Debug log
    return <Navigate to="/" replace />;
  }

  console.log('AdminLayout - Access granted, rendering admin layout'); // Debug log

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
