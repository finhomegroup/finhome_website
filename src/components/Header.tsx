
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

import Logo from './header/Logo';
import DesktopNavigation from './header/DesktopNavigation';
import SearchBar from './header/SearchBar';
import UserMenu from './header/UserMenu';
import AuthButtons from './header/AuthButtons';
import MobileMenu from './header/MobileMenu';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();


  return (
    <header className="w-full py-3 flex justify-center sticky top-0 z-50 relative">
             <div className="flex items-center w-full max-w-7xl px-6 py-2 rounded-full bg-white shadow-sm">
        <div className="flex items-center justify-between w-full">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo />
          </div>
          
          {/* Search Bar */}
          <div className="hidden sm:flex items-center flex-1 max-w-md mx-4">
            <SearchBar />
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center">
            <DesktopNavigation />
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4 ml-4">
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
