import React from 'react';
import { Button } from "@/components/ui/button";
import { Play, TrendingUp, Users, DollarSign } from 'lucide-react';
import { TypeAnimation } from 'react-type-animation';

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-brand-50 via-white to-brand-100 overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        /* Mobile video optimizations */
        @media (max-width: 768px) {
          video {
            object-fit: cover !important;
            width: 100% !important;
            height: 100% !important;
          }
        }
        
        /* Hide fallback by default, show only if video fails */
        .video-fallback {
          display: none;
        }
        
        /* Ensure video plays on mobile */
        video::-webkit-media-controls {
          display: none !important;
        }
        
        video::-webkit-media-controls-panel {
          display: none !important;
        }
      ` }} />
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover bg-white"
        onLoadStart={() => {
          // Hide fallback when video starts loading
          const fallback = document.querySelector('.video-fallback');
          if (fallback) {
            (fallback as HTMLElement).style.display = 'none';
          }
        }}
        onError={() => {
          // Show fallback if video fails to load
          const fallback = document.querySelector('.video-fallback');
          if (fallback) {
            (fallback as HTMLElement).style.display = 'block';
          }
        }}
      >
        <source
          src="https://n8nskilluptest.s3.ap-southeast-1.amazonaws.com/vlic_video.mp4"
          type="video/mp4"
        />
        {/* Fallback for browsers that don't support video */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-brand-100"></div>
      </video>
      
      {/* Fallback background for devices that don't support video - only show if video fails to load */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-brand-100 video-fallback"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="animate-fade-in">
            <h1 className="mb-6">
              <div className="text-4xl lg:text-8xl font-extrabold text-white leading-tight">
                <TypeAnimation
                  sequence={[
                    "VLIC",
                    2000,
                  ]}
                  speed={50}
                  wrapper="span"
                  repeat={Infinity}
                  cursor={false}
                />
              </div>
              <div className="text-2xl lg:text-6xl font-extrabold text-white leading-tight mt-2 whitespace-nowrap">
                <TypeAnimation
                  sequence={[
                    "THE #1 STARTUP ACCELERATOR",
                    2000,
                  ]}
                  speed={50}
                  wrapper="span"
                  repeat={Infinity}
                  cursor={false}
                />
              </div>
              <div className="text-2xl lg:text-6xl font-extrabold text-white leading-tight mt-2">
                <TypeAnimation
                  sequence={[
                    "in South East Asia",
                    2000,
                  ]}
                  speed={50}
                  wrapper="span"
                  repeat={Infinity}
                  cursor={false}
                />
              </div>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            </p>
          </div>

          {/* Right Content - Hero Image Placeholder */}
          <div className="relative animate-scale-in">
            {/* Removed the selected div element */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
