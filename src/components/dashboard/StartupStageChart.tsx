
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const StartupStageChart: React.FC = () => {
  const { data: chartData, isLoading } = useQuery({
    queryKey: ['startup-stages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('startups')
        .select('stage');
      
      if (error) throw error;

      // Count by stage
      const stageCount = data.reduce((acc: any, startup) => {
        const stage = startup.stage || 'seed';
        acc[stage] = (acc[stage] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(stageCount).map(([stage, count]) => ({
        stage: stage.replace('_', ' ').toUpperCase(),
        count,
        percentage: ((count as number) / data.length * 100).toFixed(1),
      }));
    },
  });

  const chartConfig = {
    count: {
      label: "Startups",
    },
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Startup Stages Distribution</CardTitle>
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
        <CardTitle>Startup Stages Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ stage, percentage }) => `${stage} (${percentage}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {chartData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
