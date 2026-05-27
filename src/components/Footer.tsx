import React from 'react';
import { Facebook, Instagram, Linkedin, Twitter, MapPin, Mail, Headphones } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();
  
  return (
    <footer id="contact" className="text-white w-full" style={{ backgroundColor: '#252525' }}>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Brand Name */}
          <div className="flex  mb-3 sm:mb-4">
                <img
                  src="/Logo_7.png"
                  alt="VLU Logo"
                  className="h-6 sm:h-8 w-auto"
                />
              </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Contact Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">{t.footer.contact}</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-400" />
                  <p className="text-gray-300 text-sm">{t.footer.address}</p>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-400" />
                  <p className="text-gray-300 text-sm">{t.footer.email}</p>
                </div>
                <div className="flex items-start gap-3">
                  <Headphones className="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-400" />
                  <p className="text-gray-300 text-sm">{t.footer.phone}</p>
                </div>
              </div>
            </div>

            {/* Features Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">{t.footer.features}</h3>
              <ul className="space-y-2">
                <li className="text-gray-300 text-sm">{t.footer.featureCompass}</li>
                <li className="text-gray-300 text-sm">{t.footer.featureLighthouse}</li>
                <li className="text-gray-300 text-sm">{t.footer.featureHarbor}</li>
              </ul>
            </div>

            {/* About Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">FinHome</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors">
                    {t.footer.aboutUs}
                  </a>
                </li>
                <li>
                  <Link to="/privacy-policy" className="text-gray-300 hover:text-white text-sm transition-colors">
                    {t.footer.privacyPolicy}
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-gray-300 hover:text-white text-sm transition-colors">
                    {t.footer.termsOfUse}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Social Media Icons */}
          <div className="flex  md:justify-start gap-4 ">
            <a href="#" className="text-gray-300 hover:text-white transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="X (Twitter)">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="LinkedIn">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Facebook">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Instagram">
              <Instagram className="w-5 h-5" />
            </a>
          </div>

          {/* Copyright */}
          <div className="border-t  border-gray-700 ">
            <p className="text-gray-400 mt-1 text-sm">
              © 2025 FinHome. {t.footer.allRightsReserved}.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
