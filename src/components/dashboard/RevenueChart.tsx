
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

export const RevenueChart: React.FC = () => {
  const { data: chartData, isLoading } = useQuery({
    queryKey: ['revenue-chart'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('investments')
        .select('amount, investment_date')
        .order('investment_date', { ascending: true });
      
      if (error) throw error;

      // Group by month and calculate cumulative revenue
      const monthlyData = data.reduce((acc: any, investment) => {
        const month = new Date(investment.investment_date).toLocaleDateString('vi-VN', { 
          year: 'numeric', 
          month: 'short' 
        });
        
        if (!acc[month]) {
          acc[month] = 0;
        }
        acc[month] += investment.amount;
        return acc;
      }, {});

      return Object.entries(monthlyData).map(([month, amount]) => ({
        month,
        amount,
      }));
    },
  });

  const chartConfig = {
    amount: {
      label: "Revenue",
      color: "#3b82f6",
    },
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 animate-pulse bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
