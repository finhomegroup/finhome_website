
import React from 'react';
import { StartupsManagement } from '@/components/dashboard/StartupsManagement';

const StartupsManagementPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Startups Management</h1>
        <p className="text-gray-600 mt-2">
          Manage and track all startups in the VLIC ecosystem
        </p>
      </div>
      
      <StartupsManagement />
    </div>
  );
};

export default StartupsManagementPage;
