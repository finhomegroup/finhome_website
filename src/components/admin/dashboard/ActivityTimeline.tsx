
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export const ActivityTimeline: React.FC = () => {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['recent-activities'],
    queryFn: async () => {
      // Get recent campaigns
      const { data: campaigns, error: campaignError } = await supabase
        .from('campaigns')
        .select('id, title, created_at, status')
        .order('created_at', { ascending: false })
        .limit(5);

      if (campaignError) throw campaignError;

      // Get recent investments
      const { data: investments, error: investmentError } = await supabase
        .from('investments')
        .select('id, amount, investment_date, campaign_id')
        .order('investment_date', { ascending: false })
        .limit(5);

      if (investmentError) throw investmentError;

      // Combine and sort activities
      const allActivities = [
        ...campaigns.map(c => ({
          id: c.id,
          type: 'campaign',
          title: `New campaign: ${c.title}`,
          date: c.created_at,
          status: c.status,
        })),
        ...investments.map(i => ({
          id: i.id,
          type: 'investment',
          title: `Investment of $${i.amount.toLocaleString()}`,
          date: i.investment_date,
          status: 'completed',
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return allActivities.slice(0, 10);
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
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
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities?.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between border-b pb-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(activity.date), { addSuffix: true, locale: vi })}
                </p>
              </div>
              <Badge variant={activity.status === 'active' ? 'default' : 'secondary'}>
                {activity.type}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
