import React from 'react';

interface DashboardMetricProps {
  title: string;
  value: string | number;
  subtitle?: string;
  className?: string;
}

const DashboardMetric: React.FC<DashboardMetricProps> = ({ title, value, subtitle, className = '' }) => {
  return (
    <div className={`bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700/50 ${className}`}>
      <h3 className="text-sm font-medium text-gray-400 truncate">{title}</h3>
      <p className="mt-1 text-2xl md:text-3xl font-semibold text-white">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
};

export default DashboardMetric;
