import React from 'react';

const HomeTrapSection: React.FC = () => {
  return (
    <section className="relative py-24 bg-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-10 left-0 w-full h-40 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.25),_transparent_60%)]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 mb-3">
            When Home Becomes A Trap
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            The real risk is not choosing the wrong home,
            <br className="hidden sm:block" />
            it's not seeing the risk at all.
          </p>
        </div>

        <div className="relative max-w-5xl mt-10 lg:mt-12">
          {/* Large background illustration */}
          <img
            src="/1-01.png"
            alt="Home risk map illustration"
            className="w-full max-w-3xl h-auto mx-auto lg:ml-auto lg:mr-0"
          />

          {/* Text overlay on image */}
          <div className="absolute inset-y-0 left-0 flex items-center">
            <div className="max-w-md px-4 sm:px-6 py-4 sm:py-6 m-4 sm:m-8">
              <p className="text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed mb-4">
                In one of the world's fastest-moving property markets, buying a home means navigating a maze of prices,
                sales agents, interest rates, legal details, and financial promises.
              </p>
              <p className="text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed mb-6">
                Most people are forced to guess. Some get lucky. Many quietly fall into debt traps they never intended.
              </p>

              <button className="inline-flex items-center px-5 py-2 rounded-full bg-[#3CB550] hover:bg-[#2d9a42] text-white text-xs sm:text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300">
                You deserve clarity
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeTrapSection;
