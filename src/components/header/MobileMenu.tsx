
import React from 'react';
import { Button } from "@/components/ui/button";
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MobileMenuProps {
  isOpen: boolean;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen }) => {
  const navigate = useNavigate();

  const handleAuthClick = () => {
    navigate('/auth');
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
          <button 
            onClick={() => navigate('/events')} 
            className="text-gray-700 hover:text-brand-600 transition-colors font-medium py-2 text-left"
          >
            Events
          </button>
        </nav>
        <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
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
            className="bg-brand-600 hover:bg-brand-700 rounded-full"
          >
            Sign up
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
