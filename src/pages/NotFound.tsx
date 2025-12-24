import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Home } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-200">404</h1>
        <h2 className="text-3xl font-semibold text-gray-900 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Sorry, we couldn't find the page you're looking for. Perhaps you've mistyped the URL or the page has been moved.
        </p>
        <Button
          onClick={() => navigate('/')}
          className="bg-brand-600 hover:bg-brand-700 rounded-full"
        >
          <Home className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;

