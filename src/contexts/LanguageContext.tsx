import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations } from '@/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.vi;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'finhome_language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Get from localStorage or browser language
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY) as Language;
        if (saved && (saved === 'vi' || saved === 'en')) {
          return saved;
        }
      } catch (e) {
        // localStorage might not be available (private browsing, etc.)
        console.warn('localStorage not available:', e);
      }
      
      // Detect browser language - check navigator exists
      if (typeof navigator !== 'undefined' && navigator.language) {
        const browserLang = navigator.language.toLowerCase();
        if (browserLang.startsWith('vi')) {
          return 'vi';
        }
      }
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch (e) {
        // localStorage might not be available
        console.warn('localStorage not available:', e);
      }
      // Update HTML lang attribute
      document.documentElement.lang = lang;
    }
  };

  // Update HTML lang attribute on mount and language change
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
