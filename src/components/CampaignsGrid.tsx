
import React from 'react';
import CampaignCard from './CampaignCard';

const CampaignsGrid = () => {
  // Mock data for campaigns
  const campaigns = [
    {
      id: '1',
      title: 'Revolutionary Smart Home Device',
      description: 'An AI-powered device that learns your routines and automates your entire home for maximum efficiency and comfort.',
      category: 'Technology',
      location: 'San Francisco, CA',
      imageUrl: '',
      currentAmount: 125000,
      goalAmount: 200000,
      backers: 847,
      daysLeft: 15,
      creator: 'TechInnovate Team',
      featured: true
    },
    {
      id: '2',
      title: 'Sustainable Urban Farming Kit',
      description: 'Grow fresh vegetables in your apartment with our compact, soil-free growing system powered by renewable energy.',
      category: 'Environment',
      location: 'Portland, OR',
      imageUrl: '',
      currentAmount: 75000,
      goalAmount: 100000,
      backers: 523,
      daysLeft: 8,
      creator: 'GreenGrow Solutions'
    },
    {
      id: '3',
      title: 'Independent Art Documentary',
      description: 'Following emerging artists in rural communities and how they\'re transforming their local art scenes.',
      category: 'Film',
      location: 'Austin, TX',
      imageUrl: '',
      currentAmount: 45000,
      goalAmount: 80000,
      backers: 321,
      daysLeft: 22,
      creator: 'Sarah Mitchell'
    },
    {
      id: '4',
      title: 'Community Makerspace',
      description: 'A collaborative workspace equipped with 3D printers, woodworking tools, and electronics for local creators.',
      category: 'Community',
      location: 'Denver, CO',
      imageUrl: '',
      currentAmount: 180000,
      goalAmount: 150000,
      backers: 956,
      daysLeft: 5,
      creator: 'Denver Makers Collective'
    },
    {
      id: '5',
      title: 'Eco-Friendly Travel Gear',
      description: 'Lightweight, durable travel accessories made from recycled ocean plastic and sustainable materials.',
      category: 'Product',
      location: 'Seattle, WA',
      imageUrl: '',
      currentAmount: 32000,
      goalAmount: 60000,
      backers: 198,
      daysLeft: 18,
      creator: 'EcoNomad'
    },
    {
      id: '6',
      title: 'Local Music Festival',
      description: 'Supporting local musicians and bringing the community together for a weekend of music, food, and art.',
      category: 'Music',
      location: 'Nashville, TN',
      imageUrl: '',
      currentAmount: 28000,
      goalAmount: 50000,
      backers: 342,
      daysLeft: 12,
      creator: 'Music City Collective'
    }
  ];

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="animate-fade-in">
              <CampaignCard {...campaign} />
            </div>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <button className="px-8 py-3 bg-white border-2 border-brand-600 text-brand-600 rounded-lg hover:bg-brand-600 hover:text-white transition-colors font-medium">
            Load More Campaigns
          </button>
        </div>
      </div>
    </section>
  );
};

export default CampaignsGrid;
