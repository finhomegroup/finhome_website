
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Save, Send, Eye, EyeOff } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ReactQuill from 'react-quill';
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

  const handleSubmitForApproval = (campaignId: string) => {
    submitForApprovalMutation.mutate(campaignId);
  };

  const handleInputChange = (field: keyof Campaign, value: any) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string | null) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'pending_approval':
        return 'Pending Approval';
      case 'draft':
        return 'Draft';
      case 'rejected':
        return 'Rejected';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Draft';
    }
  };

  const canSubmitForApproval = (status: string | null) => {
    return status === 'draft' || status === 'rejected' || status === null;
  };

  const canEdit = (status: string | null) => {
    return status === 'draft' || status === 'rejected' || status === null;
  };

  const quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      [{ 'align': [] }],
      ['clean']
    ],
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

        {/* Status Legend */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Campaign Status Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
                <span>Editable, not visible to public</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-yellow-100 text-yellow-800">Pending Approval</Badge>
                <span>Submitted for admin review</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800">Active</Badge>
                <span>Live and accepting donations</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-red-100 text-red-800">Rejected</Badge>
                <span>Needs revision, can be resubmitted</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
                <span>Goal reached or campaign ended</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-gray-100 text-gray-600">Cancelled</Badge>
                <span>Campaign cancelled by owner</span>
              </div>
            </div>
          </CardContent>
        </Card>

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
              <Card key={campaign.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {editingCampaign === campaign.id ? (
                          <Input
                            value={editForm.title || ''}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            className="text-lg font-semibold"
                          />
                        ) : (
                          campaign.title
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getStatusColor(campaign.status)}>
                          {getStatusText(campaign.status)}
                        </Badge>
                        {campaign.category && (
                          <Badge variant="outline">{campaign.category}</Badge>
                        )}
                        {campaign.status === 'active' && (
                          <div className="flex items-center gap-1 text-green-600">
                            <Eye className="h-4 w-4" />
                            <span className="text-sm">Visible to public</span>
                          </div>
                        )}
                        {(campaign.status === 'draft' || campaign.status === 'rejected') && (
                          <div className="flex items-center gap-1 text-gray-500">
                            <EyeOff className="h-4 w-4" />
                            <span className="text-sm">Not visible to public</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {editingCampaign === campaign.id ? (
                        <>
                          <Button 
                            onClick={handleSave}
                            disabled={updateCampaignMutation.isPending}
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Save
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => {
                              setEditingCampaign(null);
                              setEditForm({});
                            }}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          {canEdit(campaign.status) && (
                            <Button 
                              variant="outline"
                              onClick={() => handleEdit(campaign)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          )}
                          {canSubmitForApproval(campaign.status) && (
                            <Button 
                              onClick={() => handleSubmitForApproval(campaign.id)}
                              disabled={submitForApprovalMutation.isPending}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Send to Admin
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label>Description</Label>
                        {editingCampaign === campaign.id ? (
                          <div className="border rounded-md mt-2">
                            <ReactQuill
                              theme="snow"
                              value={editForm.description || ''}
                              onChange={(content) => handleInputChange('description', content)}
                              modules={quillModules}
                              style={{ minHeight: '150px' }}
                            />
                          </div>
                        ) : (
                          <div className="mt-2 p-3 bg-gray-50 rounded-md">
                            <div 
                              dangerouslySetInnerHTML={{ 
                                __html: campaign.description || 'No description available' 
                              }} 
                            />
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Category</Label>
                          {editingCampaign === campaign.id ? (
                            <Input
                              value={editForm.category || ''}
                              onChange={(e) => handleInputChange('category', e.target.value)}
                              className="mt-2"
                            />
                          ) : (
                            <p className="mt-2">{campaign.category || 'No category'}</p>
                          )}
                        </div>
                        <div>
                          <Label>Goal Amount</Label>
                          {editingCampaign === campaign.id ? (
                            <Input
                              type="number"
                              value={editForm.goal_amount || ''}
                              onChange={(e) => handleInputChange('goal_amount', parseFloat(e.target.value))}
                              className="mt-2"
                            />
                          ) : (
                            <p className="mt-2">${campaign.goal_amount?.toLocaleString()}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label>Image URL</Label>
                        {editingCampaign === campaign.id ? (
                          <Input
                            value={editForm.image_url || ''}
                            onChange={(e) => handleInputChange('image_url', e.target.value)}
                            className="mt-2"
                          />
                        ) : (
                          <p className="mt-2 text-sm text-gray-600">
                            {campaign.image_url || 'No image'}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label>End Date</Label>
                        {editingCampaign === campaign.id ? (
                          <Input
                            type="date"
                            value={editForm.end_date ? editForm.end_date.split('T')[0] : ''}
                            onChange={(e) => handleInputChange('end_date', e.target.value ? new Date(e.target.value).toISOString() : null)}
                            className="mt-2"
                          />
                        ) : (
                          <p className="mt-2">
                            {campaign.end_date 
                              ? new Date(campaign.end_date).toLocaleDateString()
                              : 'No end date'
                            }
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">Campaign Stats</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Current Amount:</span>
                            <span className="font-medium">
                              ${campaign.current_amount?.toLocaleString() || '0'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Goal Amount:</span>
                            <span className="font-medium">
                              ${campaign.goal_amount?.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Progress:</span>
                            <span className="font-medium">
                              {Math.round(((campaign.current_amount || 0) / campaign.goal_amount) * 100)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Created:</span>
                            <span className="font-medium">
                              {new Date(campaign.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {campaign.image_url && (
                        <div>
                          <Label>Campaign Image</Label>
                          <div className="mt-2">
                            <img 
                              src={campaign.image_url} 
                              alt={campaign.title}
                              className="w-full h-32 object-cover rounded-md"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
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
