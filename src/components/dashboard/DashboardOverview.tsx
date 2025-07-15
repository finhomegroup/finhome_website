
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Building2, Users, DollarSign, TrendingUp, Target, Award } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const DashboardOverview = () => {
  const { data: stats } = useQuery({
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

  const { data: monthlyData } = useQuery({
    queryKey: ['monthly-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('created_at, current_amount')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Group by month
      const grouped = data.reduce((acc: any, campaign) => {
        const month = new Date(campaign.created_at!).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
        if (!acc[month]) {
          acc[month] = { month, amount: 0, count: 0 };
        }
        acc[month].amount += Number(campaign.current_amount || 0);
        acc[month].count += 1;
        return acc;
      }, {});
      
      return Object.values(grouped).slice(-6); // Last 6 months
    },
  });

  const { data: statusData } = useQuery({
    queryKey: ['campaign-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('status');
      
      if (error) throw error;
      
      const grouped = data.reduce((acc: any, campaign) => {
        const status = campaign.status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      
      return Object.entries(grouped).map(([name, value]) => ({ name, value }));
    },
  });

  const statCards = [
    {
      title: "Total Startups",
      value: stats?.total_startups || 0,
      icon: Building2,
      description: "Active startups",
      color: "text-blue-600"
    },
    {
      title: "Active Campaigns",
      value: stats?.active_campaigns || 0,
      icon: Target,
      description: "Currently running",
      color: "text-green-600"
    },
    {
      title: "Total Raised",
      value: `$${Number(stats?.total_raised || 0).toLocaleString()}`,
      icon: DollarSign,
      description: "Funds raised",
      color: "text-yellow-600"
    },
    {
      title: "Total Users",
      value: stats?.total_users || 0,
      icon: Users,
      description: "Registered users",
      color: "text-purple-600"
    },
    {
      title: "Investments",
      value: stats?.total_investments || 0,
      icon: TrendingUp,
      description: "Investment deals",
      color: "text-red-600"
    },
    {
      title: "Active Mentors",
      value: stats?.active_mentors || 0,
      icon: Award,
      description: "Mentoring startups",
      color: "text-indigo-600"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Funding Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Funding Trend</CardTitle>
            <CardDescription>
              Total amount raised per month over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Amount']} />
                <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Campaign Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Status Distribution</CardTitle>
            <CardDescription>
              Current status of all campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Campaign Count */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Campaign Activity</CardTitle>
            <CardDescription>
              Number of campaigns created per month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
