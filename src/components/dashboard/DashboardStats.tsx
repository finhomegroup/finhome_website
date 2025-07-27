
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, TrendingUp, Users, DollarSign } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';

// Tạo supabase client không generic để truy vấn bảng data_total
const supabaseRaw = createClient(
  'https://oxfekjjqaeyjkzmhodhb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94ZmVrampxYWV5amt6bWhvZGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5ODM0NTEsImV4cCI6MjA2NzU1OTQ1MX0.t9uTB9geW5bYa1MTsDv18QesPh0Y23WOAMgnrKY6Tig'
);

export const DashboardStats: React.FC = () => {
  // Lấy số nhóm trưởng duy nhất từ bảng data_total
  const { data: totalStartups, isLoading: isLoadingStartups } = useQuery({
    queryKey: ['total-startups'],
    queryFn: async () => {
      const { count, error } = await supabaseRaw
        .from('data_total')
        .select('MSSV', { count: 'exact', head: true })
        .eq('Chức vụ', 'Nhóm trưởng');
      if (error) throw error;
      return count ?? 0;
    },
  });

  // Lấy các thống kê khác như cũ
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dashboard_stats')
        .select('*')
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Lấy tổng số Họ và tên lót (không trùng lặp) từ bảng data_total bằng RPC function
  const { data: totalUsers, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['total-users'],
    queryFn: async () => {
      const { data, error } = await supabaseRaw.rpc('count_distinct_ho_va_ten_lot');
      if (error) throw error;
      return data ?? 0;
    },
  });

  // Lấy tổng số tiền từ Giá trị giải thưởng và Kinh phí VLU hỗ trợ phát triển bằng RPC function
  const { data: totalRaised, isLoading: isLoadingRaised } = useQuery({
    queryKey: ['total-raised'],
    queryFn: async () => {
      const { data, error } = await supabaseRaw.rpc('total_raised_vlu');
      if (error) throw error;
      return data ?? 0;
    },
  });

  // Lấy dữ liệu revenue theo năm học
  const { data: revenueData, isLoading: isLoadingRevenue } = useQuery({
    queryKey: ['revenue-over-time'],
    queryFn: async () => {
      const { data, error } = await supabaseRaw
        .from('data_total')
        .select('"Năm học", "Giá trị giải thưởng ", "Kinh phí VLU hỗ trợ phát triển"');
      if (error) throw error;
      // Gom nhóm theo năm học và tính tổng
      const revenueByYear: Record<string, number> = {};
      (data ?? []).forEach((row: any) => {
        const year = row['Năm học']?.trim() || 'Khác';
        const prize = Number(row['Giá trị giải thưởng '] ?? 0);
        const vlu = Number(row['Kinh phí VLU hỗ trợ phát triển'] ?? 0);
        revenueByYear[year] = (revenueByYear[year] || 0) + prize + vlu;
      });
      return Object.entries(revenueByYear)
        .map(([year, value]) => ({ year, value }))
        .sort((a, b) => a.year.localeCompare(b.year, 'vi', { numeric: true }));
    },
  });

  // Lấy dữ liệu chương trình/cuộc thi theo năm học
  const { data: programsData, isLoading: isLoadingPrograms } = useQuery({
    queryKey: ['programs-by-year'],
    queryFn: async () => {
      const { data, error } = await supabaseRaw
        .from('data_total')
        .select('"Năm học", "Tên chương trình/cuộc thi"');
      if (error) throw error;
      // Gom nhóm theo năm học và đếm số chương trình unique
      const programsByYear: Record<string, Set<string>> = {};
      (data ?? []).forEach((row: any) => {
        const year = row['Năm học']?.trim() || 'Khác';
        const program = row['Tên chương trình/cuộc thi']?.trim();
        if (program) {
          if (!programsByYear[year]) {
            programsByYear[year] = new Set();
          }
          programsByYear[year].add(program);
        }
      });
      
      return Object.entries(programsByYear)
        .map(([year, programs]) => ({ year, count: programs.size }))
        .sort((a, b) => a.year.localeCompare(b.year, 'vi', { numeric: true }));
    },
  });

  // Lấy dữ liệu số lượng đề tài theo năm học (đếm nhóm trưởng)
  const { data: projectsData, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects-by-year'],
    queryFn: async () => {
      const { data, error } = await supabaseRaw
        .from('data_total')
        .select('"Năm học", "Chức vụ", "MSSV"');
      if (error) throw error;
      // Gom nhóm theo năm học và đếm số nhóm trưởng unique
      const projectsByYear: Record<string, Set<string>> = {};
      (data ?? []).forEach((row: any) => {
        const year = row['Năm học']?.trim() || 'Khác';
        const position = row['Chức vụ']?.trim();
        const mssv = row['MSSV']?.trim();
        // Chỉ đếm những người có chức vụ là nhóm trưởng
        if (position && mssv && position === 'Nhóm trưởng') {
          if (!projectsByYear[year]) {
            projectsByYear[year] = new Set();
          }
          // Sử dụng MSSV để đảm bảo unique
          projectsByYear[year].add(mssv);
        }
      });
      
      return Object.entries(projectsByYear)
        .map(([year, projects]) => ({ year, count: projects.size }))
        .sort((a, b) => a.year.localeCompare(b.year, 'vi', { numeric: true }));
    },
  });

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
      
      console.log('Top startups data:', result);
      return result;
    },
  });

  if (isLoadingStartups || isLoadingStats || isLoadingUsers || isLoadingRaised) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      title: 'Total Raised',
      value: `₫${Number(totalRaised || 0).toLocaleString('vi-VN')}`,
      icon: DollarSign,
      color: 'text-emerald-600',
    },
    {
      title: 'Total Startups',
      value: totalStartups || 0,
      icon: Building2,
      color: 'text-blue-600',
    },
    {
      title: 'Active Campaigns',
      value: totalStartups || 0, // Sử dụng lại số nhóm trưởng
      icon: TrendingUp,
      color: 'text-green-600',
    },
    {
      title: 'Total Users',
      value: totalUsers || 0,
      icon: Users,
      color: 'text-purple-600',
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statItems.map((item) => (
          <Card key={item.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {item.title}
              </CardTitle>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Card Revenue Over Time */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={revenueData ?? []} margin={{ top: 16, right: 32, left: 60, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis 
                    tickFormatter={v => `${(v / 1000000).toFixed(1)}M`}
                    width={50}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip formatter={v => `₫${Number(v).toLocaleString('vi-VN')}`} />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card Programs/Competitions by Year */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Programs/Competitions by Year</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={programsData ?? []} margin={{ top: 16, right: 32, left: 60, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis 
                    width={50}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip formatter={v => `${v} programs`} />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card Projects by Year */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Projects by Year</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={projectsData ?? []} margin={{ top: 16, right: 32, left: 60, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis 
                    width={50}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip formatter={v => `${v} projects`} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card Top 5 Performance Startups */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Startups</CardTitle>
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
      </div>
    </>
  );
};
