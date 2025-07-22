import React from 'react';

interface ChartData {
  label: string;
  value: number;
}

interface BarChartProps {
  data: ChartData[];
  title: string;
}

export const BarChart: React.FC<BarChartProps> = ({ data, title }) => {
  if (!data || data.length === 0) {
    return (
        <div className="bg-gray-800 p-4 rounded-lg h-64 flex flex-col">
            <h4 className="font-bold text-gray-300 mb-2">{title}</h4>
            <div className="flex-grow flex items-center justify-center text-gray-500">
                Không có dữ liệu
            </div>
        </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 0);

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h4 className="font-bold text-gray-300 mb-4">{title}</h4>
      <div className="space-y-2">
        {data.map(({ label, value }) => (
          <div key={label} className="grid grid-cols-4 gap-2 items-center text-sm">
            <span className="col-span-1 text-gray-400 truncate pr-2">{label}</span>
            <div className="col-span-3 bg-gray-700 rounded-full h-6">
              <div
                className="bg-gradient-to-r from-teal-500 to-blue-500 h-6 rounded-full flex items-center justify-between px-2"
                style={{ width: `${maxValue > 0 ? (value / maxValue) * 100 : 0}%` }}
              >
                <span className="font-medium text-white text-xs">{value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
