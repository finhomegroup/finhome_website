import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const data = [
  { name: 'Ideation', value: 25, color: '#3B82F6' },
  { name: 'MVP Development', value: 30, color: '#10B981' },
  { name: 'Market Validation', value: 20, color: '#F59E0B' },
  { name: 'Growth', value: 15, color: '#EF4444' },
  { name: 'Scale', value: 10, color: '#8B5CF6' },
];

const StartupStageChart: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Startup Stages Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>Distribution of startups across different development stages</p>
        </div>
      </CardContent>
    </Card>
  );
};

export { StartupStageChart }; 