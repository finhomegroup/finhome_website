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
        <p className="text-sm text-gray-600">
            Phân bố các giai đoạn phát triển của các Startup
            </p>
      </CardHeader>
      <CardContent className="h-[400px]">
        <div className="h-full flex flex-col">
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
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
          
        </div>
      </CardContent>
    </Card>
  );
};

export { StartupStageChart }; 