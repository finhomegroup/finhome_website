
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CampaignCard } from '@/components/campaigns/CampaignCard';
import { StatusLegend } from '@/components/campaigns/StatusLegend';
import 'react-quill/dist/quill.snow.css';

interface Campaign {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  goal_amount: number;
  current_amount: number | null;
  status: string | null;
  image_url: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string | null;
}

const PersonalCampaigns = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editingCampaign, setEditingCampaign] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Campaign>>({});

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['user-campaigns', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Campaign[];
    },
    enabled: !!user,
  });

  const updateCampaignMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Campaign> }) => {
      const { error } = await supabase
        .from('campaigns')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-campaigns'] });
      toast({
        title: "Campaign updated",
        description: "Your campaign has been saved successfully.",
      });
      setEditingCampaign(null);
      setEditForm({});
    },
    onError: (error) => {
      toast({
        title: "Error updating campaign",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const submitForApprovalMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const { error } = await supabase
        .from('campaigns')
        .update({ status: 'pending_approval' })
        .eq('id', campaignId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-campaigns'] });
      toast({
        title: "Submitted for approval",
        description: "Your campaign has been sent to admin for review.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error submitting campaign",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign.id);
    setEditForm(campaign);
  };

  const handleSave = () => {
    if (!editingCampaign || !editForm) return;
    
    updateCampaignMutation.mutate({
      id: editingCampaign,
      updates: {
        title: editForm.title,
        description: editForm.description,
        category: editForm.category,
        goal_amount: editForm.goal_amount,
        image_url: editForm.image_url,
        end_date: editForm.end_date,
        updated_at: new Date().toISOString(),
      },
    });
  };

  const handleCancel = () => {
    setEditingCampaign(null);
    setEditForm({});
  };

  const handleSubmitForApproval = (campaignId: string) => {
    submitForApprovalMutation.mutate(campaignId);
  };

  const handleInputChange = (field: keyof Campaign, value: any) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>Please log in to view your campaigns.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/auth')}>Log In</Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">My Campaigns</h1>
          <p className="text-gray-600 mt-2">
            Manage your fundraising campaigns. You can edit draft campaigns and submit them for admin approval.
          </p>
        </div>

        <StatusLegend />

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-20 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : campaigns && campaigns.length > 0 ? (
          <div className="space-y-6">
            {campaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                editingCampaign={editingCampaign}
                editForm={editForm}
                isUpdating={updateCampaignMutation.isPending}
                isSubmitting={submitForApprovalMutation.isPending}
                onEdit={handleEdit}
                onSave={handleSave}
                onCancel={handleCancel}
                onSubmitForApproval={handleSubmitForApproval}
                onInputChange={handleInputChange}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
              <p className="text-gray-600 mb-4">You haven't created any campaigns yet.</p>
              <Button onClick={() => navigate('/create-campaign')}>
                Create Your First Campaign
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default PersonalCampaigns;
