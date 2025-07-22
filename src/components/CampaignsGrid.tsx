
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Heart, Share2, Clock, Users, MapPin, Eye } from 'lucide-react';

const CampaignsGrid = () => {
  const navigate = useNavigate();
  
  const { data: campaigns, isLoading, error } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const formatCampaignData = (campaign: any) => {
    // Calculate days left from end_date
    const daysLeft = campaign.end_date 
      ? Math.max(0, Math.ceil((new Date(campaign.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
      : 30; // Default to 30 days if no end date

    // Calculate backers (for now, we'll use a placeholder since we don't have a backers table yet)
    const backers = Math.floor(Math.random() * 500) + 50; // Temporary placeholder

    return {
      id: campaign.id,
      title: campaign.title,
      description: campaign.description || '',
      category: campaign.category || 'General',
      location: 'Various Locations', // Placeholder since we don't have location in the schema
      imageUrl: campaign.image_url || '',
      currentAmount: campaign.current_amount || 0,
      goalAmount: campaign.goal_amount,
      backers: backers,
      daysLeft: daysLeft,
      creator: 'Campaign Creator', // Placeholder since we don't have creator info linked yet
      featured: false
    };
  };

  const handleViewCampaign = (campaignId: string) => {
    navigate(`/campaign/${campaignId}`);
  };

  // Helper function to strip HTML tags
  const stripHtmlTags = (html: string): string => {
    return html.replace(/<[^>]*>/g, '').trim();
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Discover Amazing Projects
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From cutting-edge technology to community initiatives, explore campaigns that are making a difference
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded mb-4"></div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex space-x-4 mb-4">
                  <div className="h-16 w-16 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Discover Amazing Projects
          </h2>
          <p className="text-red-600 mb-4">Failed to load campaigns. Please try again later.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Discover Amazing Projects
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From cutting-edge technology to community initiatives, explore campaigns that are making a difference
          </p>
        </div>

        {/* Categories Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {['All', 'Technology', 'Environment', 'Film', 'Community', 'Product', 'Music'].map((category) => (
            <button
              key={category}
              className="px-4 py-2 rounded-full text-sm font-medium transition-colors hover:bg-brand-600 hover:text-white bg-white text-gray-700 border border-gray-300"
            >
              {category}
            </button>
          ))}
        </div>

        {/* Campaigns Table */}
        {campaigns && campaigns.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Image</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Amount Raised</TableHead>
                  <TableHead className="text-center">
                    <Users className="h-4 w-4 inline mr-1" />
                    Backers
                  </TableHead>
                  <TableHead className="text-center">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Days Left
                  </TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => {
                  const formattedCampaign = formatCampaignData(campaign);
                  const progressPercentage = (formattedCampaign.currentAmount / formattedCampaign.goalAmount) * 100;
                  const isFullyFunded = progressPercentage >= 100;
                  const cleanDescription = stripHtmlTags(formattedCampaign.description);

                  return (
                    <TableRow key={campaign.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                          {formattedCampaign.imageUrl ? (
                            <img 
                              src={formattedCampaign.imageUrl} 
                              alt={formattedCampaign.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className={`w-full h-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center ${formattedCampaign.imageUrl ? 'hidden' : 'flex'}`}
                          >
                            <span className="text-white text-sm font-semibold">
                              {formattedCampaign.title.charAt(0)}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="max-w-xs">
                        <div>
                          <h3 
                            className="font-semibold text-gray-900 hover:text-brand-600 cursor-pointer mb-1"
                            onClick={() => handleViewCampaign(formattedCampaign.id)}
                          >
                            {formattedCampaign.title}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {cleanDescription}
                          </p>
                          <div className="flex items-center text-xs text-gray-500">
                            <MapPin className="h-3 w-3 mr-1" />
                            {formattedCampaign.location}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            by {formattedCampaign.creator}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {formattedCampaign.category}
                        </Badge>
                      </TableCell>
                      
                      <TableCell className="w-[120px]">
                        <div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${
                                isFullyFunded 
                                  ? 'bg-gradient-to-r from-green-500 to-green-600' 
                                  : 'bg-gradient-to-r from-brand-500 to-brand-600'
                              }`}
                              style={{width: `${Math.min(progressPercentage, 100)}%`}}
                            ></div>
                          </div>
                          <span className={`text-xs font-medium ${isFullyFunded ? 'text-green-600' : 'text-brand-600'}`}>
                            {Math.round(progressPercentage)}%
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div>
                          <div className="font-semibold text-gray-900">
                            ${formattedCampaign.currentAmount.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            of ${formattedCampaign.goalAmount.toLocaleString()}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <span className="font-medium text-gray-900">
                          {formattedCampaign.backers}
                        </span>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <span className={`font-medium ${formattedCampaign.daysLeft <= 7 ? 'text-red-600' : 'text-gray-900'}`}>
                          {formattedCampaign.daysLeft}
                        </span>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex space-x-2 justify-center">
                          <Button 
                            size="sm" 
                            onClick={() => handleViewCampaign(formattedCampaign.id)}
                            className="h-8 px-3 bg-brand-600 hover:bg-brand-700"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            <Heart className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            <Share2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-600 text-lg mb-4">No campaigns found.</p>
            <p className="text-gray-500">Be the first to create a campaign and make a difference!</p>
          </div>
        )}

        {/* Load More Button - Hidden for now since we're showing all campaigns */}
        {campaigns && campaigns.length > 10 && (
          <div className="text-center mt-8">
            <Button className="px-8 py-3 bg-white border-2 border-brand-600 text-brand-600 rounded-full hover:bg-brand-600 hover:text-white transition-colors font-medium">
              Load More Campaigns
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default CampaignsGrid;
