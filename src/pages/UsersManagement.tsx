
import React from 'react';
import { UsersManagement } from '@/components/admin/dashboard';

const UsersManagementPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
        <p className="text-gray-600 mt-2">
          Manage users, mentors, and investors in the platform
        </p>
      </div>
      
      <UsersManagement />
    </div>
  );
};

export default UsersManagementPage;
