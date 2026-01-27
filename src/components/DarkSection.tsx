import React from 'react';

const DarkSection = () => {
  return (
    <section 
      className="py-12 lg:py-16 overflow-hidden"
      style={{ backgroundColor: '#f0f0f0' }}
    >
      <div className="max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-6">
        {/* Border container with background image */}
        <div 
          className="relative min-h-[600px] lg:min-h-[700px] rounded-xl border-2 overflow-hidden"
          style={{            
            backgroundImage: 'url(/finhome_dark.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/20"></div>
          
          <div className="relative z-10 h-full min-h-[600px] lg:min-h-[700px] flex items-center px-4 sm:px-8 lg:px-12">
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Left side - Content */}
              <div className="flex justify-center lg:justify-start">
                <div 
                  className="max-w-xl p-8 lg:p-12 rounded-3xl border-2 border-white/20 backdrop-blur-sm"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.05)',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
                  }}
                >
                  {/* Tag */}
                  <div className="mb-6">
                    <span className="inline-block px-4 py-1.5 text-xs lg:text-sm font-medium tracking-wider uppercase"
                      style={{ 
                        color: '#4dd4ac',
                        letterSpacing: '0.15em'
                      }}
                    >
                      INFRASTRUCTURE
                    </span>
                  </div>
                  
                  {/* Main heading */}
                  <h2 className="text-3xl lg:text-4xl xl:text-5xl font-semibold mb-6 leading-tight">
                    <span style={{ color: '#4dd4ac' }}>Flexible building</span>
                    <br />
                    <span className="text-gray-300">blocks built on USD</span>
                  </h2>
                  
                  {/* Description */}
                  <p className="text-gray-400 text-base lg:text-lg leading-relaxed">
                    Unlike existing banks, Column was built from day one to provide you with fast, programmable infrastructure for the dollar. Our built from scratch technology allows you to build the product you want.
                  </p>
                </div>
              </div>
              
              {/* Right side - Orbit image */}
              <div className="flex justify-center items-center mt-8 lg:mt-0">
                <img
                  src="/finhome_orbit.png"
                  alt="Finhome ecosystem with Compass, Harbor and Lighthouse"
                  className="w-full max-w-2xl h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DarkSection;

