import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const JoinExperience = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Email submitted:', email);
    setEmail('');
  };

  return (
    <section className="relative  md:py-24  overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Section - Text and Signup Form */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 mb-1 sm:mb-4 animate-fade-in">
            {t.joinExperience.title}
          </h2>
          <div
            className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed sm:mt-4 max-w-2xl sm:max-w-3xl mx-auto px-2 mb-8"
            style={{
              fontFamily: "'Maison Neue', 'Inter', 'Segoe UI', 'Roboto', 'Noto Sans', 'Helvetica Neue', Arial, sans-serif",
              fontSize: "14px",
              lineHeight: "130%"
            }}
          >
            {t.joinExperience.description}
          </div>

          {/* Email Input with Button Inside */}
          <form onSubmit={handleSubmit} className="flex justify-center items-center max-w-md mx-auto mb-6">
            <div className="relative w-full">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.joinExperience.emailPlaceholder}
                className="w-full px-4 py-3 pr-32 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3CB550] focus:border-transparent text-base"
                required
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[#3CB550] to-[#2d9a42] hover:from-[#2d9a42] hover:to-[#3CB550] text-white font-bold px-4 py-2 rounded-full transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span className="text-sm sm:text-base">{t.joinExperience.button}</span>
              </button>
            </div>
          </form>

          {/* Sign-up Count with Avatars */}
          <div className="flex items-center justify-center gap-3">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden"
                >
                  <img
                    src={`/ava_mentor0${i}.png`}
                    alt={`User ${i}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"%3E%3Ccircle cx="16" cy="16" r="16" fill="%23e5e7eb"/%3E%3Ctext x="16" y="20" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="10"%3EU%3C/text%3E%3C/svg%3E`;
                    }}
                  />
                </div>
              ))}
            </div>
            <p className="text-sm sm:text-base text-gray-600">
              {t.joinExperience.signupCount}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Section - Full Width Image */}
      <div className="w-full  md:mt-12 overflow-hidden">
        <div className="md:hidden w-full" style={{ transform: 'scale(1.3) translateX(5%)', transformOrigin: 'center bottom' }}>
          <img
            src="/iphone_icon.png"
            alt="FinHome App Mockups"
            className="w-full h-auto object-cover"
            style={{
              objectPosition: '95% bottom',
              minHeight: '300px'
            }}
          />
        </div>
        <div className="hidden md:block w-full">
          <img
            src="/iphone_icon.png"
            alt="FinHome App Mockups"
            className="w-full h-auto object-contain"
          />
        </div>
      </div>
    </section>
  );
};

export default JoinExperience;
