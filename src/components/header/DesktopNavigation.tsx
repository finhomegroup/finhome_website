
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const DesktopNavigation = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className="flex items-center space-x-6 lg:space-x-8 ml-4">
      <button 
        onClick={() => scrollToSection('home-trap')}
        className="text-gray-900 hover:text-[#3CB550] transition-colors font-medium text-sm sm:text-base"
      >
        {t.nav.context}
      </button>
      <button 
        onClick={() => scrollToSection('ecosystem')}
        className="text-gray-900 hover:text-[#3CB550] transition-colors font-medium text-sm sm:text-base"
      >
        {t.nav.ecosystem}
      </button>
      <button 
        onClick={() => scrollToSection('contact')}
        className="text-gray-900 hover:text-[#3CB550] transition-colors font-medium text-sm sm:text-base"
      >
        {t.nav.contact}
      </button>
    </nav>
  );
};

export default DesktopNavigation;
