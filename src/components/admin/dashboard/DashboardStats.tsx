
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, TrendingUp, Users, DollarSign, Trophy, Award, Lightbulb } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, ComposedChart, Legend } from 'recharts';

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

  // Lấy dữ liệu số lượng sinh viên tham gia theo năm học
  const { data: studentsData, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['students-by-year'],
    queryFn: async () => {
      const { data, error } = await supabaseRaw
        .from('data_total')
        .select('"Năm học", "MSSV"');
      if (error) throw error;
      // Gom nhóm theo năm học và đếm số sinh viên unique
      const studentsByYear: Record<string, Set<string>> = {};
      (data ?? []).forEach((row: any) => {
        const year = row['Năm học']?.trim() || 'Khác';
        const mssv = row['MSSV']?.trim();
        if (mssv) {
          if (!studentsByYear[year]) {
            studentsByYear[year] = new Set();
          }
          studentsByYear[year].add(mssv);
        }
      });
      
      return Object.entries(studentsByYear)
        .map(([year, students]) => ({ year, count: students.size }))
        .sort((a, b) => a.year.localeCompare(b.year, 'vi', { numeric: true }));
    },
  });



  if (isLoadingStartups || isLoadingStats || isLoadingUsers || isLoadingRaised || isLoadingPrograms || isLoadingProjects || isLoadingStudents) {
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
      title: 'Total Startup',
      subtitle: 'Entrepreneurial projects',
      value: '250',
      icon: Lightbulb,
      iconColor: 'text-yellow-600',
      iconBg: 'bg-yellow-50',
    },
    {
      title: 'Total students',
      subtitle: 'Participation in Startup',
      value: '188',
      icon: Users,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
    },
    {
      title: 'Competitions',
      subtitle: 'Startup competitions held',
      value: '4',
      icon: Trophy,
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-50',
    },
    {
      title: 'Active Projects',
      subtitle: 'Ongoing Startup Projects',
      value: '10',
      icon: Award,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-50',
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statItems.map((item) => (
          <Card key={item.title} className="bg-white border border-gray-200 h-full">
            <CardContent className="p-6 h-full">
              <div className="flex items-start space-x-4 h-full">
                <div className={`${item.iconBg} p-3 rounded-lg flex-shrink-0`}>
                  <item.icon className={`h-6 w-6 ${item.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-2xl font-bold text-gray-900 mb-1">{item.value}</div>
                  <div className="text-sm font-medium text-gray-700 mb-1 leading-tight">{item.title}</div>
                  <div className="text-xs text-gray-500 leading-tight">{item.subtitle}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>


      {/* Card Combined Programs, Projects and Students by Year */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Number of competitions/ projects and student participation</CardTitle>
            <p className="text-sm text-gray-600">
            Số lượng cuộc thi/ dự án và sinh viên tham gia
            </p>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 400 }}>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart 
                  data={programsData?.map((program, index) => ({
                    year: program.year,
                    programs: program.count,
                    projects: projectsData?.[index]?.count || 0,
                    students: studentsData?.[index]?.count || 0
                  })) ?? []} 
                  margin={{ top: 16, right: 32, left: 60, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis 
                    yAxisId="left"
                    width={50}
                    axisLine={false}
                    tickLine={false}
                    label={{ value: 'Số lượng cuộc thi/ dự án', angle: -90, position: 'insideLeft' }}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    width={50}
                    axisLine={false}
                    tickLine={false}
                    label={{ value: 'Số lượng sinh viên', angle: 90, position: 'insideRight' }}
                  />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'programs') return [`${value} cuộc thi`, 'Tổng số cuộc thi'];
                      if (name === 'projects') return [`${value} dự án`, 'Tổng số dự án'];
                      if (name === 'students') return [`${value} sinh viên`, 'Tổng số sinh viên tham gia'];
                      return [value, name];
                    }}
                    labelFormatter={(label) => `Năm: ${label}`}
                  />
                  <Bar yAxisId="left" dataKey="programs" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Tổng số cuộc thi" />
                  <Bar yAxisId="left" dataKey="projects" fill="#4ECDC4" radius={[4, 4, 0, 0]} name="Tổng số dự án" />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="students" 
                    stroke="#ef4444" 
                    strokeWidth={3} 
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                    name="Tổng số sinh viên tham gia"
                  />
                  <Legend />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>


    </>
  );
};
