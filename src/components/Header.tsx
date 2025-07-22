
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Logo from './header/Logo';
import DesktopNavigation from './header/DesktopNavigation';
import SearchBar from './header/SearchBar';
import UserMenu from './header/UserMenu';
import AuthButtons from './header/AuthButtons';
import MobileMenu from './header/MobileMenu';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleStartCampaign = () => {
    navigate('/create-campaign');
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo />
          <DesktopNavigation />
          <SearchBar />

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? <UserMenu /> : <AuthButtons />}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline"
                  className="border-brand-600 text-brand-600 hover:bg-brand-50 rounded-full"
                >
                  Mentor/Lecturer
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/mentor-profile')}>
                  Mentor's profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/lecturer-profile')}>
                  Lecturer's profile
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              onClick={handleStartCampaign}
              className="bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white rounded-full"
            >
              Start a Campaign
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <MobileMenu isOpen={isMenuOpen} />
      </div>
    </header>
  );
};

export default Header;
