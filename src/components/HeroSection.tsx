import React from 'react';
import { Button } from "@/components/ui/button";
import { Play, TrendingUp, Users, DollarSign } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-brand-50 via-white to-brand-100 overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source
          src="https://cdn.prod.website-files.com/63f3e085b054e9e3120238f1/6441ca38ca57b7e1bace784f_Website%20Header-transcode.mp4"
          type="video/mp4"
        />
      </video>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="animate-fade-in">
            <h1 className="mb-6">
              <div className="text-4xl lg:text-8xl font-extrabold text-white leading-tight">VLIC</div>
              <div className="text-2xl lg:text-6xl font-extrabold text-white leading-tight mt-2 whitespace-nowrap">THE #1 STARTUP ACCELERATOR</div>
              <div className="text-2xl lg:text-6xl font-extrabold text-white leading-tight mt-2">in South East Asia</div>
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
