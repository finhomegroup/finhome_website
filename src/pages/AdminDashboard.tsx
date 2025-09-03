
import React from 'react';
import {
  DashboardStats,
  NumberProjectbyFields,
  ProjectCards,
  StartupStageChart,
  ProjectSurvivalDuration,
  FundingCards,
  FundingInvestmentChart,
  CompetitionCards,
  CompetitionAwardsChart,
  StudentParticipationTable,
  TopStartupsAndGender,
  ActivityTimeline
} from '@/components/admin/dashboard';

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

      <NumberProjectbyFields />

      <TopStartupsAndGender />

      <ProjectCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StartupStageChart />
        <ProjectSurvivalDuration />
      </div>

      <FundingCards />

      <FundingInvestmentChart />

      <CompetitionCards />

      <CompetitionAwardsChart />

      <StudentParticipationTable />

      <ActivityTimeline />
    </div>
  );
};

export default AdminDashboard;
