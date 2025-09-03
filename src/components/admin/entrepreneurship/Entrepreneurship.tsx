import React from 'react';

const Entrepreneurship = () => {
  const entrepreneurshipPartners = [
    {
      id: 1,
      image: '/partner01.png',
      name: 'VNEI',
      fullName: 'Connect - Cooperate - Co-innovate',
      url: 'https://vnei.edu.vn/'
    },
    {
      id: 2,
      image: '/partner02.png',
      name: 'NIC',
      fullName: 'Vietnam National Innovation Center',
      url: 'https://nic.gov.vn/'
    },
    {
      id: 3,
      image: '/partner03.png',
      name: 'Nhịp cầu đầu tư',
      fullName: 'Investment Bridge Platform',
      url: 'https://nhipcaudautu.vn/'
    },
    {
      id: 4,
      image: '/partner04.png',
      name: 'Simple English',
      fullName: 'Hệ thống anh ngữ toàn diện',
      url: 'https://simpleenglish.com.vn/'
    },
    {
      id: 5,
      image: '/partner05.png',
      name: 'AIM Academy',
      fullName: 'Advanced Innovation Management',
      url: 'https://aimacademy.vn/'
    },
    {
      id: 6,
      image: '/partner06.png',
      name: 'Jaxtina EnglishZone',
      fullName: 'English Education Platform',
      url: 'https://jaxtina.com'
    },
    {
      id: 7,
      image: '/partner07.png',
      name: 'Coder School',
      fullName: 'Software Engineering Bootcamp',
      url: 'https://www.coderschool.vn/vi'
    },
    {
      id: 8,
      image: '/partner08.png',
      name: 'ZONE Startups Vietnam',
      fullName: 'Vietnam Startup Ecosystem',
      url: 'https://vietnam.zonestartups.com/'
    },
    {
      id: 9,
      image: '/partner09.png',
      name: 'Coursera',
      fullName: 'Online Learning Platform',
      url: 'https://www.coursera.org/'
    },
    {
      id: 10,
      image: '/partner10.png',
      name: 'NovaEdu',
      fullName: 'The Innovative Education Company',
      url: 'https://novaduca.com/'
    },
    {
      id: 11,
      image: '/partner11.png',
      name: 'Daru Foundation',
      fullName: 'Innovation & Entrepreneurship Foundation',
      url: 'https://dariu.org/'
    },
    {
      id: 12,
      image: '/partner12.png',
      name: 'Saigon Innovation Hub',
      fullName: 'SIHUB - Ho Chi Minh City Innovation Hub',
      url: 'https://sihub.gov.vn/'
    }
  ];

  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl lg:text-4xl xl:text-5xl font-semibold text-gray-900 mb-4">
          Entrepreneurship Ecosystem
        </h2>
        <div className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed mt-3 sm:mt-4 max-w-2xl sm:max-w-3xl mx-auto px-2">
          Building a thriving entrepreneurship network with<br />
          leading organizations and innovation hubs
        </div>
        
        <div className="mt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {entrepreneurshipPartners.map((partner) => (
              <div
                key={partner.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group"
              >
                {/* Logo container - Clickable */}
                <div 
                  className="flex items-center justify-center h-32 mb-4 bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => partner.url && window.open(partner.url, '_blank')}
                >
                  <img
                    src={partner.image}
                    alt={partner.name}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="80" viewBox="0 0 120 80"%3E%3Crect width="120" height="80" fill="%23f3f4f6"/%3E%3Ctext x="60" y="40" text-anchor="middle" dy=".3em" fill="%236b7280" font-size="12"%3E' + partner.name + '%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
                
                {/* Content */}
                <div className="text-left">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 truncate" title={partner.name}>
                    {partner.name}
                  </h3>
                  {partner.fullName && (
                    <p className="text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis" title={partner.fullName}>
                      {partner.fullName}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Entrepreneurship;
