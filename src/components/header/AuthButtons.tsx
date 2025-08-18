
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const AuthButtons = () => {
  const navigate = useNavigate();

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
        Log in
      </Button>
      <Button 
        onClick={handleAuthClick}
        size="sm"
        className="bg-brand-600 hover:bg-brand-700 rounded-full"
      >
        Sign up
      </Button>
    </>
  );
};

export default AuthButtons;
