
import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar, AdminHeader } from '@/components/admin/layout';
import HappyChatbot from '@/components/admin/HappyChatbot';

export const AdminLayout: React.FC = () => {
  // Temporarily disable authentication checks for testing
  console.log('AdminLayout - Bypassing auth checks for testing');

  // Commented out auth checks temporarily
  /*
  const { role, loading } = useUserRole();
  const { user, loading: authLoading } = useAuth();

  console.log('AdminLayout - Role:', role, 'Loading:', loading, 'User:', user?.email, 'AuthLoading:', authLoading);

  // Show loading while auth or role is loading
  if (loading || authLoading) {
    console.log('AdminLayout - Still loading, showing spinner');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    console.log('AdminLayout - No user found, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  // Check admin/staff access
  if (role !== 'admin' && role !== 'staff') {
    console.log('AdminLayout - Access denied, redirecting to home. Current role:', role);
    return <Navigate to="/" replace />;
  }
  */

  console.log('AdminLayout - Access granted (bypassed), rendering admin layout');

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
      {/* AI Chatbot - Only visible in admin pages */}
      <HappyChatbot />
    </div>
  );
};
