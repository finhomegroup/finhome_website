import React from 'react';
import { Facebook, Instagram, Linkedin, Send, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="text-white w-full" style={{ backgroundColor: '#252525' }}>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 justify-items-center">
            {/* Logo */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-3 sm:mb-4">
                <img
                  src="/vlu_logo.png"
                  alt="VLU Logo"
                  className="h-6 sm:h-8 w-auto"
                />
              </div>
              <p className="text-gray-300 text-xs sm:text-sm">
                Finhome - Real Estate Financing Platform
              </p>
            </div>

            {/* Quick Links */}
            <div className="text-center">
              <h3 className="text-base sm:text-lg mb-2 sm:mb-4">Email</h3>
              <p className="text-gray-300 hover:text-white text-sm sm:text-base">
                support@finhome.group.vn
              </p>
            </div>

            {/* Contact */}
            <div className="text-center">
              <h3 className="text-base sm:text-lg mb-2 sm:mb-4">Contact</h3>
              <p className="text-gray-300 hover:text-white text-sm sm:text-base">
                028 7109 9999
              </p>
            </div>



            {/* Contact Info */}
            <div className="text-center">
              <h3 className="text-base sm:text-lg mb-1">Subscribe</h3>
              <p className="text-gray-400 mb-3 sm:mb-4 text-xs sm:text-sm">Get the latest updates and career tips</p>
              <form className="flex justify-center">
                <div
                  className="flex items-center w-full max-w-xs sm:max-w-sm rounded-full border border-gray-600 px-4 sm:px-5 py-2 sm:py-2.5"
                  style={{ backgroundColor: '#323330' }}
                >
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="flex-1 bg-transparent text-gray-200 placeholder-gray-500 focus:outline-none text-sm sm:text-base"
                  />
                  <button
                    type="submit"
                    className="ml-3 inline-flex items-center gap-3 text-gray-200 hover:text-white transition-colors"
                    aria-label="Subscribe"
                  >
                    <span className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-600">
                      <Send className="w-4 h-4" />
                    </span>
                    <span className="text-sm sm:text-base font-semibold">Sent</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center md:justify-start gap-4">
            <a href="#" className="text-gray-300 hover:text-white transition-colors" aria-label="X">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors" aria-label="LinkedIn">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors" aria-label="Facebook">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors" aria-label="Instagram">
              <Instagram className="w-5 h-5" />
            </a>
          </div>

          <div className="mt-8 border-t border-gray-700 pt-6">
            <div className="flex flex-col gap-4 sm:gap-5 md:flex-row md:items-center md:justify-between">
              <p className="text-center md:text-left text-gray-400 text-xs sm:text-sm">
                © {new Date().getFullYear()} Finhome – powered by VIB. All rights reserved.
              </p>

              <div className="flex items-center justify-center md:justify-end gap-6 text-xs sm:text-sm">
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
