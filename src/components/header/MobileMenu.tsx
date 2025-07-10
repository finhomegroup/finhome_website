
import React from 'react';
import { Button } from "@/components/ui/button";
import { Search, User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MobileMenuProps {
  isOpen: boolean;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAuthClick = () => {
    navigate('/auth');
  };

  const handleStartCampaign = () => {
    navigate('/create-campaign');
  };

  if (!isOpen) return null;

  return (
    <div className="md:hidden py-4 border-t border-gray-200 animate-fade-in">
      <div className="flex flex-col space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search campaigns..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>
        <nav className="flex flex-col space-y-2">
          <a href="#" className="text-gray-700 hover:text-brand-600 transition-colors font-medium py-2">
            Discover
          </a>
          <a href="#" className="text-gray-700 hover:text-brand-600 transition-colors font-medium py-2">
            Categories
          </a>
          <a href="#" className="text-gray-700 hover:text-brand-600 transition-colors font-medium py-2">
            How it Works
          </a>
        </nav>
        <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
          {user ? (
            <>
              <div className="flex items-center space-x-2 px-2 py-1">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback>
                    {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">
                  {user.user_metadata?.full_name || user.email}
                </span>
              </div>
              <Button variant="ghost" size="sm" className="justify-start" onClick={() => navigate('/my-campaigns')}>
                <User className="h-4 w-4 mr-2" />
                My Campaigns
              </Button>
              <Button variant="ghost" size="sm" className="justify-start">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
              <Button 
                onClick={handleSignOut}
                variant="outline" 
                size="sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button 
                onClick={handleAuthClick}
                variant="ghost" 
                size="sm"
              >
                Log in
              </Button>
              <Button 
                onClick={handleAuthClick}
                size="sm"
                className="bg-brand-600 hover:bg-brand-700"
              >
                Sign up
              </Button>
            </>
          )}
          <Button 
            onClick={handleStartCampaign}
            className="bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white"
          >
            Start a Campaign
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
