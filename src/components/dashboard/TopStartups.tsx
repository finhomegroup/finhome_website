
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';

export const TopStartups: React.FC = () => {
  const { data: startups, isLoading } = useQuery({
    queryKey: ['top-startups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('startups')
        .select(`
          id,
          startup_name,
          industry,
          stage,
          valuation,
          revenue,
          campaign_id,
          campaigns (
            current_amount,
            goal_amount
          )
        `)
        .order('valuation', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
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
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Performing Startups</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {startups?.map((startup, index) => (
            <div key={startup.id} className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                  <span className="text-sm font-bold text-primary">#{index + 1}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{startup.startup_name}</p>
                  <p className="text-xs text-gray-500">{startup.industry}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">${(startup.valuation || 0).toLocaleString()}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {startup.stage?.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
