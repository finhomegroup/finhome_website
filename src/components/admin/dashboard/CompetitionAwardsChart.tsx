import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Dữ liệu cho biểu đồ dựa theo ảnh
const data = [
  {
    year: '2020-2021',
    externalCompetitions: 12, // Số cuộc thi ngoài trường (màu xanh)
    internalCompetitions: 8, // Số cuộc thi trong trường (màu đỏ)
    awardsWon: 8 // Số giải thưởng đạt được (đường vàng)
  },
  {
    year: '2021-2022',
    externalCompetitions: 18,
    internalCompetitions: 6,
    awardsWon: 9.5
  },
  {
    year: '2022-2023',
    externalCompetitions: 55,
    internalCompetitions: 35,
    awardsWon: 8.5
  },
  {
    year: '2023-2024',
    externalCompetitions: 8,
    internalCompetitions: 35,
    awardsWon: 10.5
  }
];

// Custom tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800 mb-2">{`Năm học: ${label}`}</p>
        {payload.map((entry: any, index: number) => {
          let unit = '';
          if (entry.dataKey === 'awardsWon') {
            unit = ' giải thưởng';
          } else {
            unit = ' cuộc thi';
          }
          return (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: ${entry.value}${unit}`}
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

export const CompetitionAwardsChart: React.FC = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Number of competitions and awards won each year</CardTitle>
        <p className="text-sm text-gray-600">
          Số lượng cuộc thi và giải thưởng đạt được qua các năm
        </p>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              bottom: 20,
              left: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="year" 
              tick={{ fontSize: 12 }}
              stroke="#666"
            />
            <YAxis 
              yAxisId="left"
              orientation="left"
              tick={{ fontSize: 12 }}
              stroke="#666"
              label={{ 
                value: 'Số cuộc thi', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle' }
              }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12 }}
              stroke="#666"
              label={{ 
                value: 'Số giải thưởng đạt được', 
                angle: 90, 
                position: 'insideRight',
                style: { textAnchor: 'middle' }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="rect"
            />
            
            {/* Cột xanh - Số cuộc thi ngoài trường */}
            <Bar 
              yAxisId="left"
              dataKey="externalCompetitions" 
              name="Số cuộc thi ngoài trường"
              fill="#3B82F6"
              radius={[2, 2, 0, 0]}
            />
            
            {/* Cột đỏ - Số cuộc thi trong trường */}
            <Bar 
              yAxisId="left"
              dataKey="internalCompetitions" 
              name="Số cuộc thi trong trường"
              fill="#EF4444"
              radius={[2, 2, 0, 0]}
            />
            
            {/* Đường vàng - Số giải thưởng đạt được */}
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="awardsWon" 
              name="Số giải thưởng đạt được"
              stroke="#F59E0B" 
              strokeWidth={3}
              dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#F59E0B', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
