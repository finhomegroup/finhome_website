import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getSEOConfig, updateSEO } from '@/utils/seo';

/**
 * Hook to automatically update SEO meta tags based on current route
 * Usage: Call useSEO() in your page components
 */
export function useSEO() {
  const location = useLocation();
  
  useEffect(() => {
    const config = getSEOConfig(location.pathname);
    updateSEO(config);
  }, [location.pathname]);
}
