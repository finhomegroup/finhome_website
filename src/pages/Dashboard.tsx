
import React from 'react';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome to VLIC Dashboard. Here's what's happening with your startups today.
        </p>
      </div>
      <DashboardOverview />
    </div>
  );
};

export default Dashboard;
