
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
    <header className="w-full py-3 flex justify-center sticky top-0 z-50 relative">
             <div className="flex items-center w-full max-w-7xl px-6 py-2 rounded-full bg-white shadow-sm">
        <div className="flex items-center justify-between w-full">
          {/* Logo - Responsive sizing */}
          <div className="flex-shrink-0">
            <Logo />
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center">
            <DesktopNavigation />
          </div>
          
          {/* Search Bar - Hidden on very small screens */}
          <div className="hidden sm:flex items-center flex-1 max-w-md mx-4">
            <SearchBar />
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline"
                  className="border-brand-600 text-brand-600 hover:bg-brand-50 rounded-full text-sm"
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
                <DropdownMenuItem onClick={() => navigate('/ai-chatbot')}>
                  AI chatbot
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              onClick={handleStartCampaign}
              className="bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white rounded-full text-sm"
            >
              Start a Campaign
            </Button>
            {user ? <UserMenu /> : <AuthButtons />}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2"
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
