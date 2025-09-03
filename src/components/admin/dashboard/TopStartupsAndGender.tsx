import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Tạo supabase client không generic để truy vấn bảng data_total
const supabaseRaw = createClient(
  'https://oxfekjjqaeyjkzmhodhb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94ZmVrampxYWV5amt6bWhvZGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5ODM0NTEsImV4cCI6MjA2NzU1OTQ1MX0.t9uTB9geW5bYa1MTsDv18QesPh0Y23WOAMgnrKY6Tig'
);

// Dữ liệu tĩnh cho biểu đồ giới tính (50% Nữ, 50% Nam)
const genderData = [
  { name: 'Nữ', value: 50, color: '#4ECDC4' }, // Màu xanh ngọc đậm hơn cho Nữ
  { name: 'Nam', value: 50, color: '#81D4FA' }, // Màu xanh ngọc nhạt hơn cho Nam
];

export const TopStartupsAndGender: React.FC = () => {
  // Lấy dữ liệu top 5 startups theo giá trị giải thưởng
  const { data: topStartupsData, isLoading: isLoadingTopStartups } = useQuery({
    queryKey: ['top-startups'],
    queryFn: async () => {
      const { data, error } = await supabaseRaw
        .from('data_total')
        .select('"Tên đề tài/dự án/ý tưởng", "Họ và tên lót", "Tên", "Giá trị giải thưởng ", "MSSV"')
        .not('"Giá trị giải thưởng "', 'is', null)
        .gt('"Giá trị giải thưởng "', 0)
        .order('"Giá trị giải thưởng "', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      const result = (data ?? []).map((row: any, index: number) => {
        const projectName = row['Tên đề tài/dự án/ý tưởng']?.trim();
        const leaderName = `${row['Họ và tên lót']?.trim() || ''} ${row['Tên']?.trim() || ''}`.trim();
        
        return {
          rank: index + 1,
          name: (projectName || `Dự án ${index + 1}`).substring(0, 20) + (projectName && projectName.length > 20 ? '...' : ''),
          leader: leaderName || 'Không có tên',
          prize: Number(row['Giá trị giải thưởng '] ?? 0),
          mssv: row['MSSV']?.trim() || ''
        };
      });
      
      return result;
    },
  });

  if (isLoadingTopStartups) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Startups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Number of students by gender</CardTitle>
            <p className="text-sm text-gray-600">
            Số lượng sinh viên theo giới tính
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] flex items-center justify-center">
              <div className="animate-pulse">
                <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Performing Startups */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Startups</CardTitle>
          <p className="text-sm text-gray-600">
            Các Startup có giá trị giải thưởng cao nhất
            </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topStartupsData?.map((startup, index) => (
              <div key={startup.mssv} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                    <span className="text-sm font-semibold text-red-600">#{startup.rank}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{startup.name}</h4>
                    <p className="text-sm text-gray-500">{startup.leader}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-gray-900">
                      ₫{startup.prize.toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {startup.mssv}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Number of students by gender */}
      <Card>
        <CardHeader>
          <CardTitle>Number of students by gender</CardTitle>
          <p className="text-sm text-gray-600">
            Số lượng sinh viên theo giới tính
            </p>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <Pie
                data={genderData}
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
                {genderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
