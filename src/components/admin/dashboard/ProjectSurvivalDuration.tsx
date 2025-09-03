import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// Dữ liệu cho biểu đồ Project Survival Duration
const data = [
  { 
    name: 'Dừng ngay sau cuộc thi', 
    value: 20.3, 
    color: '#4DD0E1',
    displayValue: 20
  },
  { 
    name: 'Dừng sau 6 tháng đến 1 năm', 
    value: 45.5, 
    color: '#26C6DA',
    displayValue: 40
  },
  { 
    name: 'Dừng sau 1 năm', 
    value: 19.2, 
    color: '#0277BD',
    displayValue: 10
  },
  { 
    name: 'Dừng sau 2 năm', 
    value: 15.0, 
    color: '#01579B',
    displayValue: 5
  }
];

// Custom label function để hiển thị số và phần trăm
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, displayValue, value, index }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize="12"
      fontWeight="bold"
    >
      {`${displayValue}`}
    </text>
  );
};

// Custom label cho phần trăm bên ngoài
const renderOutsideLabel = ({ cx, cy, midAngle, outerRadius, value, index }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 30;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="#666" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize="12"
      fontWeight="500"
    >
      {`${value}%`}
    </text>
  );
};

export const ProjectSurvivalDuration: React.FC = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Project Survival Duration</CardTitle>
        <p className="text-sm text-gray-600">
            Thời gian duy trì dự án
            </p>        
      </CardHeader>
      <CardContent className="h-[400px]">
        <div className="h-full flex items-center justify-between">
          {/* Biểu đồ tròn */}
          <div className="flex-1 h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={2}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value}%`, 'Tỷ lệ']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend tùy chỉnh */}
          <div className="flex-shrink-0 ml-6 w-48">
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-gray-800 mb-3">Chú thích</h3>
              {data.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-xs text-gray-600 leading-tight">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
