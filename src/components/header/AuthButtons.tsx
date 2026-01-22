
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const AuthButtons = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleAuthClick = () => {
    navigate('/auth');
  };

  return (
    <>
      <Button 
        onClick={handleAuthClick}
        variant="ghost" 
        size="sm"
        className="rounded-full"
      >
        {t.common.logIn}
      </Button>
      <Button 
        onClick={handleAuthClick}
        size="sm"
        className="bg-brand-600 hover:bg-brand-700 rounded-full"
      >
        {t.common.signUp}
      </Button>
    </>
  );
};

export default AuthButtons;
