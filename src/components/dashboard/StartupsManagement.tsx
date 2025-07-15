
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

interface Startup {
  id: string;
  startup_name: string;
  industry: string | null;
  stage: string | null;
  valuation: number | null;
  employees_count: number;
  founded_date: string | null;
  is_active: boolean;
  created_at: string;
  founder_id: string;
  mentor_id: string | null;
  profiles: {
    full_name: string | null;
    email: string;
  } | null;
  mentor_profile: {
    full_name: string | null;
    email: string;
  } | null;
}

export const StartupsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: startups, isLoading } = useQuery({
    queryKey: ['dashboard-startups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('startups')
        .select(`
          *,
          profiles!startups_founder_id_fkey(full_name),
          mentor_profile:profiles!startups_mentor_id_fkey(full_name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Startup[];
    },
  });

  const filteredStartups = startups?.filter(startup =>
    startup.startup_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (startup.industry && startup.industry.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStageColor = (stage: string | null) => {
    switch (stage) {
      case 'idea': return 'bg-gray-100 text-gray-800';
      case 'seed': return 'bg-blue-100 text-blue-800';
      case 'series_a': return 'bg-green-100 text-green-800';
      case 'series_b': return 'bg-yellow-100 text-yellow-800';
      case 'series_c': return 'bg-purple-100 text-purple-800';
      case 'ipo': return 'bg-gold-100 text-gold-800';
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
          <h2 className="text-3xl font-bold tracking-tight">Startups Management</h2>
          <p className="text-muted-foreground">
            Manage and monitor all startup projects
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
                placeholder="Search startups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Startups Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="mr-2 h-5 w-5" />
            All Startups ({filteredStartups?.length || 0})
          </CardTitle>
          <CardDescription>
            Complete list of registered startups
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Startup Name</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Founder</TableHead>
                <TableHead>Mentor</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Valuation</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStartups?.map((startup) => (
                <TableRow key={startup.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold">{startup.startup_name}</div>
                      <div className="text-sm text-muted-foreground">
                        Founded: {startup.founded_date ? new Date(startup.founded_date).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{startup.industry || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge className={getStageColor(startup.stage)}>
                      {startup.stage?.replace('_', ' ').toUpperCase() || 'IDEA'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {startup.profiles?.full_name || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    {startup.mentor_profile?.full_name || 'No mentor assigned'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Users className="mr-1 h-4 w-4" />
                      {startup.employees_count}
                    </div>
                  </TableCell>
                  <TableCell>
                    {startup.valuation ? (
                      <div className="flex items-center">
                        <DollarSign className="mr-1 h-4 w-4" />
                        {Number(startup.valuation).toLocaleString()}
                      </div>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={startup.is_active ? 'default' : 'secondary'}>
                      {startup.is_active ? 'Active' : 'Inactive'}
                    </Badge>
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
