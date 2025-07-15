
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Search, Building2, Users, DollarSign, Calendar } from 'lucide-react';

interface Campaign {
  id: string;
  title: string;
  category: string | null;
  status: string | null;
  goal_amount: number;
  current_amount: number | null;
  end_date: string | null;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string | null;
    email: string;
  } | null;
}

export const StartupsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['dashboard-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          profiles!campaigns_user_id_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Campaign[];
    },
  });

  const filteredCampaigns = campaigns?.filter(campaign =>
    campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (campaign.category && campaign.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Campaigns Management</h2>
          <p className="text-muted-foreground">
            Manage and monitor all campaign projects
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="mr-2 h-5 w-5" />
            All Campaigns ({filteredCampaigns?.length || 0})
          </CardTitle>
          <CardDescription>
            Complete list of all campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>Goal Amount</TableHead>
                <TableHead>Raised Amount</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>End Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns?.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold">{campaign.title}</div>
                      <div className="text-sm text-muted-foreground">
                        Created: {new Date(campaign.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{campaign.category || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(campaign.status)}>
                      {campaign.status?.toUpperCase() || 'DRAFT'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {campaign.profiles?.full_name || campaign.profiles?.email || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <DollarSign className="mr-1 h-4 w-4" />
                      {Number(campaign.goal_amount).toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <DollarSign className="mr-1 h-4 w-4" />
                      {Number(campaign.current_amount || 0).toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${Math.min(((campaign.current_amount || 0) / campaign.goal_amount) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {Math.round(((campaign.current_amount || 0) / campaign.goal_amount) * 100)}%
                    </div>
                  </TableCell>
                  <TableCell>
                    {campaign.end_date ? (
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        {new Date(campaign.end_date).toLocaleDateString()}
                      </div>
                    ) : (
                      'No end date'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
