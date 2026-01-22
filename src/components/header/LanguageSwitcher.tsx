import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-lg gap-2 px-3 py-2 text-gray-900 force-stroke-dark"
          aria-label="Change language"
        >
          <span className="text-lg">
            {language === 'vi' ? '🇻🇳' : '🇬🇧'}
          </span>
          <span className="text-sm font-medium text-gray-900">
            {language === 'vi' ? 'VN' : 'EN'}
          </span>
          <svg 
            className="h-4 w-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="#111827"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </Button>


      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[150px]">
        <DropdownMenuItem
          onClick={() => setLanguage('vi')}
          className={language === 'vi' ? 'bg-gray-100' : ''}
        >
          <span className="mr-2">🇻🇳</span>
          Tiếng Việt
          {language === 'vi' && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage('en')}
          className={language === 'en' ? 'bg-gray-100' : ''}
        >
          <span className="mr-2">🇬🇧</span>
          English
          {language === 'en' && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
