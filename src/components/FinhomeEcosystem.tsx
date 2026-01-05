import React from 'react';

const FinhomeEcosystem: React.FC = () => {
  return (
    <section className="relative py-24 bg-gray-50 overflow-hidden">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        {/* Left side - Ecosystem illustration */}
        <div className="w-full max-w-2xl flex justify-center lg:justify-start">
          <img
            src="/2-02.png"
            alt="Finhome ecosystem illustration"
            className="w-full max-w-xl h-auto"
          />
        </div>

        {/* Right text content */}
        <div className="max-w-xl text-left">
          <h2 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-semibold text-gray-900 mb-3">
            Finhome Ecosystem
          </h2>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 mb-4">
            One platform. Three forces shaping every real estate decision.
          </p>

          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-700 leading-relaxed mb-3">
            Finhome is not a listing site. It is a living financial ecosystem built around you, your income,
            your goals, and your future.
          </p>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-700 leading-relaxed mb-5">
            At the center is your financial reality. Around it, three forces work in harmony:
          </p>

          <div className="flex flex-wrap gap-3">
            <span className="px-4 py-1.5 rounded-full border border-gray-200 bg-white text-xs sm:text-sm text-gray-800 shadow-sm">
              One to understand
            </span>
            <span className="px-4 py-1.5 rounded-full border border-gray-200 bg-white text-xs sm:text-sm text-gray-800 shadow-sm">
              One to reveal
            </span>
            <span className="px-4 py-1.5 rounded-full border border-gray-200 bg-white text-xs sm:text-sm text-gray-800 shadow-sm">
              One to move
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinhomeEcosystem;
