
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import CampaignCard from './CampaignCard';

const CampaignsGrid = () => {
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                <div className="h-2 bg-gray-200 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
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

        {/* Campaigns Grid */}
        {campaigns && campaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="animate-fade-in">
                <CampaignCard {...formatCampaignData(campaign)} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">No campaigns found.</p>
            <p className="text-gray-500">Be the first to create a campaign and make a difference!</p>
          </div>
        )}

        {/* Load More Button - Hidden for now since we're showing all campaigns */}
        {campaigns && campaigns.length > 6 && (
          <div className="text-center mt-12">
            <button className="px-8 py-3 bg-white border-2 border-brand-600 text-brand-600 rounded-lg hover:bg-brand-600 hover:text-white transition-colors font-medium">
              Load More Campaigns
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default CampaignsGrid;
