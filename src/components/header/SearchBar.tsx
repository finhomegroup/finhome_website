
import React from 'react';
import { Search } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const SearchBar = () => {
  const { t } = useLanguage();
  
  return (
    <div className="hidden md:flex items-center max-w-md mx-8 flex-1">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder={t.nav.search}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-full bg-gray-50 focus:ring-2 focus:ring-[#3CB550] focus:border-[#3CB550] outline-none text-sm"
        />
      </div>
    </div>
  );
};

export default SearchBar;
