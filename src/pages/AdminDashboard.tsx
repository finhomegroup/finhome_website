
import React from 'react';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { StartupStageChart } from '@/components/dashboard/StartupStageChart';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';
import { TopStartups } from '@/components/dashboard/TopStartups';

const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">
          Comprehensive view of VLIC startup ecosystem
        </p>
      </div>

      <DashboardStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart />
        <StartupStageChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityTimeline />
        <TopStartups />
      </div>
    </div>
  );
};

export default AdminDashboard;
