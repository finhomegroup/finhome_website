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

// Dữ liệu cho biểu đồ Funding & Investment dựa theo ảnh
const data = [
  {
    year: '2020-2021',
    fundingAmount: 12.9, // Số tiền tài trợ/hỗ trợ (tỷ VNĐ) - màu xanh
    investmentAmount: 8.5, // Số tiền đầu tư (tỷ VNĐ) - màu xám
    fundedProjects: 19.5, // Số lượng dự án được tài trợ/hỗ trợ (đường đỏ)
    investedProjects: 20.8 // Số lượng dự án nhận được đầu tư (đường vàng)
  },
  {
    year: '2021-2022',
    fundingAmount: 14.9,
    investmentAmount: 12.5,
    fundedProjects: 21.2,
    investedProjects: 22.5
  },
  {
    year: '2022-2023',
    fundingAmount: 18.8,
    investmentAmount: 15.8,
    fundedProjects: 24.2,
    investedProjects: 23.8
  },
  {
    year: '2023-2024',
    fundingAmount: 22.3,
    investmentAmount: 18.2,
    fundedProjects: 26.9,
    investedProjects: 26.5
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
          if (entry.dataKey === 'fundingAmount' || entry.dataKey === 'investmentAmount') {
            unit = ' tỷ VNĐ';
          } else {
            unit = ' dự án';
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

export const FundingInvestmentChart: React.FC = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Funding & Investment in Startup Projects Over the Years</CardTitle>
        <p className="text-sm text-gray-600">
          Tài trợ và đầu tư vào các dự án khởi nghiệp qua các năm
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
                value: 'Số tiền (tỷ VNĐ)', 
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
                value: 'Số dự án', 
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
            
            {/* Cột xanh - Số tiền tài trợ/hỗ trợ */}
            <Bar 
              yAxisId="left"
              dataKey="fundingAmount" 
              name="Số tiền tài trợ/hỗ trợ"
              fill="#3B82F6"
              radius={[2, 2, 0, 0]}
            />
            
            {/* Cột đỏ - Số tiền đầu tư */}
            <Bar 
              yAxisId="left"
              dataKey="investmentAmount" 
              name="Số tiền đầu tư"
              fill="#EF4444"
              radius={[2, 2, 0, 0]}
            />
            
            {/* Đường đỏ - Số lượng dự án được tài trợ/hỗ trợ */}
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="fundedProjects" 
              name="Số lượng dự án được tài trợ/hỗ trợ"
              stroke="#EF4444" 
              strokeWidth={3}
              dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#EF4444', strokeWidth: 2 }}
            />
            
            {/* Đường vàng - Số lượng dự án nhận được đầu tư */}
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="investedProjects" 
              name="Số lượng dự án nhận được đầu tư"
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
