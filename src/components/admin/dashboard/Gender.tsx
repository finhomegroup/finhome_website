import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// Dữ liệu tĩnh cho biểu đồ giới tính (50% Nữ, 50% Nam)
const data = [
  { name: 'Nữ', value: 50, color: '#4ECDC4' }, // Màu xanh ngọc đậm hơn cho Nữ
  { name: 'Nam', value: 50, color: '#81D4FA' }, // Màu xanh ngọc nhạt hơn cho Nam
];

export const Gender: React.FC = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Number of students by gender</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px] flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              fill="#8884d8"
              paddingAngle={2}
              dataKey="value"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
