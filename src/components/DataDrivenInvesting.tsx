import React from 'react';

const DataDrivenInvesting: React.FC = () => {
  return (
    <section className="relative py-20 bg-white overflow-hidden">
      {/* Subtle dot background */}
      <div
        className="absolute inset-0 opacity-60 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(209,213,219,0.7) 1px, transparent 0)',
          backgroundSize: '10px 10px',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Left text content */}
          <div className="w-full max-w-2xl">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-900 mb-3">
              Data-driven Home & Investing
            </h2>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 mb-6">
              Understand your finances before you choose a home.
            </p>

            <p className="text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed mb-4">
              FinHome brings real-time housing, interest-rate, and market-cycle data into your financial world.
            </p>
            <p className="text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed mb-6">
              By combining macro signals with micro-level affordability, risk appetite, and cashflow, we help you see
              when to buy, what to buy, and how much to borrow, with clarity instead of guesswork.
            </p>

            <button className="inline-flex items-center px-5 py-2 rounded-full border border-gray-300 bg-white text-xs sm:text-sm md:text-base text-gray-900 shadow-sm hover:border-[#3CB550] hover:text-[#3CB550] transition-colors duration-200">
              Find your risk profile
              <span className="ml-1">&#8594;</span>
            </button>
          </div>

          {/* Right chart illustration */}
          <div className="w-full flex justify-center lg:justify-end mt-24 lg:mt-32">
            <img
              src="/3-03.png"
              alt="Data-driven investing chart"
              className="w-full max-w-5xl h-auto lg:scale-150 lg:origin-right"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DataDrivenInvesting;
