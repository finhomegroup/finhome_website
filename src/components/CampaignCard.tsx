
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Heart, Share2, Clock, Users, MapPin } from 'lucide-react';

interface CampaignCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  imageUrl: string;
  currentAmount: number;
  goalAmount: number;
  backers: number;
  daysLeft: number;
  creator: string;
  featured?: boolean;
}

const CampaignCard: React.FC<CampaignCardProps> = ({
  id,
  title,
  description,
  category,
  location,
  imageUrl,
  currentAmount,
  goalAmount,
  backers,
  daysLeft,
  creator,
  featured = false
}) => {
  const navigate = useNavigate();
  const progressPercentage = (currentAmount / goalAmount) * 100;
  const isFullyFunded = progressPercentage >= 100;

  const handleViewCampaign = () => {
    navigate(`/campaign/${id}`);
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group hover:-translate-y-1 ${featured ? 'ring-2 ring-brand-200' : ''}`}>
      {/* Image */}
      <div className="relative h-48 overflow-hidden cursor-pointer" onClick={handleViewCampaign}>
        <div 
          className="w-full h-full bg-gradient-to-br from-brand-100 to-brand-200 bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
          style={{backgroundImage: `url(${imageUrl})`}}
        >
          {/* Fallback gradient when no image */}
          <div className="w-full h-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
            <span className="text-white text-lg font-semibold">{title.charAt(0)}</span>
          </div>
        </div>
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700">
            {category}
          </span>
        </div>
        
        {/* Featured Badge */}
        {featured && (
          <div className="absolute top-3 right-3">
            <span className="bg-brand-600 text-white px-3 py-1 rounded-full text-xs font-medium">
              Featured
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="absolute bottom-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button size="sm" variant="secondary" className="h-8 w-8 p-0 bg-white/90 hover:bg-white">
            <Heart className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="secondary" className="h-8 w-8 p-0 bg-white/90 hover:bg-white">
            <Share2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <MapPin className="h-3 w-3 mr-1" />
          {location}
        </div>
        
        <h3 
          className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-brand-600 transition-colors cursor-pointer"
          onClick={handleViewCampaign}
        >
          {title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {description}
        </p>
        
        <div className="text-sm text-gray-500 mb-4">
          by <span className="font-medium text-gray-700">{creator}</span>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                isFullyFunded 
                  ? 'bg-gradient-to-r from-success-600 to-success-700' 
                  : 'bg-gradient-to-r from-brand-600 to-brand-700'
              }`}
              style={{width: `${Math.min(progressPercentage, 100)}%`}}
            ></div>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <div>
              <span className="font-semibold text-gray-900">
                ${currentAmount.toLocaleString()}
              </span>
              <span className="text-gray-500 ml-1">
                raised of ${goalAmount.toLocaleString()}
              </span>
            </div>
            <span className={`font-medium ${isFullyFunded ? 'text-success-600' : 'text-brand-600'}`}>
              {Math.round(progressPercentage)}%
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span>{backers} backers</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{daysLeft} days left</span>
          </div>
        </div>

        {/* Action Button */}
        <Button 
          onClick={handleViewCampaign}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white"
          disabled={daysLeft === 0 && !isFullyFunded}
        >
          {isFullyFunded ? 'View Campaign' : 'Back this project'}
        </Button>
      </div>
    </div>
  );
};

export default CampaignCard;
