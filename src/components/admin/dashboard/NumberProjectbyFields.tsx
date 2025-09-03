import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// Tạo supabase client không generic để truy vấn bảng aug_data_total_break
const supabaseRaw = createClient(
  'https://oxfekjjqaeyjkzmhodhb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94ZmVrampxYWV5amt6bWhvZGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5ODM0NTEsImV4cCI6MjA2NzU1OTQ1MX0.t9uTB9geW5bYa1MTsDv18QesPh0Y23WOAMgnrKY6Tig'
);

// Định nghĩa màu sắc cho các lĩnh vực theo yêu cầu
const COLORS = [
  '#39bec5', // Business Innovation – Đổi mới mô hình kinh doanh
  '#e94449', // MedTech – Công nghệ Y tế
  '#ffd263', // EduTech – Công nghệ Giáo dục
  '#49e785', // AgriTech – Nông nghiệp thông minh
  '#22696b', // GreenTech – Công nghệ xanh & môi trường
  '#426ab7', // FinTech – Tài chính số
  '#f27c3d', // Art & Design – Nghệ thuật & Thiết kế
  '#6a50a4', // Tourism & Culture – Du lịch và văn hóa
  '#ff5959', // Social Impact – Tác động xã hội
  '#2470a4', // AI & Data Applications – Ứng dụng trí tuệ nhân tạo và dữ liệu
  '#fe6f23', // E-commerce & RetailTech
  '#f5c44b', // Blockchain / Web3
  '#71d172', // BioTech
  '#4aa4e0', // EnergyTech
  '#fd9a9c', // Khác
];

export const NumberProjectbyFields: React.FC = () => {
  const { data: chartData, isLoading } = useQuery({
    queryKey: ['projects-by-fields'],
    queryFn: async () => {
      const { data, error } = await supabaseRaw
        .from('aug_data_total_break')
        .select('linh_vuc');
      
      if (error) throw error;

      // Đếm số lượng dự án theo lĩnh vực chính xác từ database
      const fieldCounts: Record<string, number> = {};
      (data ?? []).forEach((row: any) => {
        const field = row.linh_vuc?.trim() || 'Khác';
        fieldCounts[field] = (fieldCounts[field] || 0) + 1;
      });

      // Chuyển đổi thành format cho pie chart
      const total = Object.values(fieldCounts).reduce((sum, count) => sum + count, 0);
      
      return Object.entries(fieldCounts)
        .map(([field, count]) => ({
          name: field,
          value: count,
          percentage: ((count / total) * 100).toFixed(1)
        }))
        .sort((a, b) => b.value - a.value); // Sắp xếp theo số lượng giảm dần
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Number of projects by field</CardTitle>          
        </CardHeader>
        <CardContent>
          <div className="h-[400px] animate-pulse bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{data.name}</p>
          <p className="text-sm text-gray-600">
            Số lượng: {data.value} dự án
          </p>
          <p className="text-sm text-gray-600">
            Tỷ lệ: {data.percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Number of projects by field</CardTitle>
        <p className="text-sm text-gray-600">
            Số lượng dự án theo lĩnh vực
            </p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-8 h-[400px]">
          {/* Pie Chart bên trái */}
          <div className="flex-1 h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData?.map((entry: any, index: number) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend bên phải */}
          <div className="flex-1">
            <div className="flex flex-col gap-3">
              {chartData?.map((entry: any, index: number) => (
                <div key={entry.name} className="flex items-center gap-3 text-sm">
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div className="flex-1">
                    <span className="text-gray-700 font-medium">{entry.name}</span>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="text-gray-500 font-semibold">
                      {entry.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
