/**
 * SEO Configuration and Utilities
 * Provides dynamic meta tags and structured data for different routes
 */

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
  noindex?: boolean;
}

export const SEO_CONFIG: Record<string, SEOConfig> = {
  home: {
    title: "Finhome - Sustainable, Transparent & Responsible Property Ownership in Vietnam | 2030 Vision",
    description: "By 2030, sustainable, transparent, and responsible property ownership will be the norm in Vietnam — powered by data clarity, disciplined finance, and trust across buyers, lenders, and developers. Finhome empowers every property buyer to build wealth safely.",
    keywords: "Vietnam real estate, sustainable property ownership, transparent property investment, real estate finance, Finhome, property ownership Vietnam, sustainable real estate, transparent property investment, real estate finance, property data analytics, responsible property development, Vietnam real estate 2030, responsible real estate, property data analysis, safe property investment, real estate transparency, property finance Vietnam, real estate technology, property investment platform, Vietnam property market",
    ogImage: "https://finhome.vn/vlu_logo.png",
    ogType: "website",
    canonicalUrl: "https://finhome.vn/",
  },
  auth: {
    title: "Sign In | Finhome - Property Investment Platform",
    description: "Access your Finhome account to manage your property investments, track portfolio performance, and explore sustainable real estate opportunities in Vietnam.",
    keywords: "Finhome login, property investment account, real estate platform login, Vietnam property investment",
    ogImage: "https://finhome.vn/vlu_logo.png",
    ogType: "website",
    canonicalUrl: "https://finhome.vn/auth",
    noindex: true, // Login pages typically shouldn't be indexed
  },
  mentors: {
    title: "Mentors & Lecturers | Finhome - Expert Guidance for Property Investment",
    description: "Learn from industry experts and experienced mentors in real estate investment. Get professional guidance on sustainable property ownership and transparent investment strategies in Vietnam.",
    keywords: "real estate mentors, property investment experts, Vietnam real estate advisors, property investment guidance, real estate lecturers",
    ogImage: "https://finhome.vn/vlu_logo.png",
    ogType: "website",
    canonicalUrl: "https://finhome.vn/mentors-lecturers",
  },
  notFound: {
    title: "Page Not Found | Finhome",
    description: "The page you are looking for does not exist. Return to Finhome homepage to explore sustainable property investment opportunities in Vietnam.",
    canonicalUrl: "https://finhome.vn/404",
    noindex: true,
  },
};

/**
 * Get SEO config for a specific route
 */
export function getSEOConfig(pathname: string): SEOConfig {
  // Remove leading slash and normalize
  const route = pathname.replace(/^\//, '') || 'home';
  
  // Map route paths to config keys
  const routeMap: Record<string, string> = {
    '': 'home',
    '/': 'home',
    'auth': 'auth',
    'mentors-lecturers': 'mentors',
    '404': 'notFound',
  };
  
  const configKey = routeMap[route] || 'home';
  return SEO_CONFIG[configKey] || SEO_CONFIG.home;
}

/**
 * Update document title and meta tags
 * This should be called in route components or via a hook
 */
export function updateSEO(config: SEOConfig) {
  if (typeof document === 'undefined') return;
  
  // Update title
  document.title = config.title;
  
  // Update meta description
  let metaDescription = document.querySelector('meta[name="description"]');
  if (!metaDescription) {
    metaDescription = document.createElement('meta');
    metaDescription.setAttribute('name', 'description');
    document.head.appendChild(metaDescription);
  }
  metaDescription.setAttribute('content', config.description);
  
  // Update meta keywords if provided
  if (config.keywords) {
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', config.keywords);
  }
  
  // Update robots meta
  let metaRobots = document.querySelector('meta[name="robots"]');
  if (config.noindex) {
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute('content', 'noindex, nofollow');
  }
  
  // Update canonical URL
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (config.canonicalUrl) {
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', config.canonicalUrl);
  }
  
  // Update Open Graph tags
  const updateOGTag = (property: string, content: string) => {
    let ogTag = document.querySelector(`meta[property="${property}"]`);
    if (!ogTag) {
      ogTag = document.createElement('meta');
      ogTag.setAttribute('property', property);
      document.head.appendChild(ogTag);
    }
    ogTag.setAttribute('content', content);
  };
  
  updateOGTag('og:title', config.title);
  updateOGTag('og:description', config.description);
  if (config.ogImage) {
    updateOGTag('og:image', config.ogImage);
  }
  if (config.ogType) {
    updateOGTag('og:type', config.ogType);
  }
  if (config.canonicalUrl) {
    updateOGTag('og:url', config.canonicalUrl);
  }
  
  // Update Twitter Card tags
  const updateTwitterTag = (name: string, content: string) => {
    let twitterTag = document.querySelector(`meta[name="${name}"]`);
    if (!twitterTag) {
      twitterTag = document.createElement('meta');
      twitterTag.setAttribute('name', name);
      document.head.appendChild(twitterTag);
    }
    twitterTag.setAttribute('content', content);
  };
  
  updateTwitterTag('twitter:title', config.title);
  updateTwitterTag('twitter:description', config.description);
  if (config.ogImage) {
    updateTwitterTag('twitter:image', config.ogImage);
  }
}
