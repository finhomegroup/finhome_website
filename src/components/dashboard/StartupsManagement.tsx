
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Edit, Trash2 } from 'lucide-react';

export const StartupsManagement: React.FC = () => {
  const { data: startups, isLoading } = useQuery({
    queryKey: ['startups-management'],
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
          team_size,
          founded_date,
          created_at,
          campaigns (
            id,
            title,
            current_amount,
            goal_amount,
            status
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Startups Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Startups Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Startup Name</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Valuation</TableHead>
              <TableHead>Team Size</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {startups?.map((startup) => (
              <TableRow key={startup.id}>
                <TableCell className="font-medium">{startup.startup_name}</TableCell>
                <TableCell>{startup.industry}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {startup.stage?.replace('_', ' ').toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>${(startup.valuation || 0).toLocaleString()}</TableCell>
                <TableCell>{startup.team_size}</TableCell>
                <TableCell>
                  <Badge variant={startup.campaigns?.status === 'active' ? 'default' : 'secondary'}>
                    {startup.campaigns?.status || 'No Campaign'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
