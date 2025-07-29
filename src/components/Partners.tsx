import React from 'react';

const Partners = () => {
  const partners = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    image: `/partner${(i + 1).toString().padStart(2, '0')}.png`,
    name: `Partner ${i + 1}`,
    url: i === 0 ? 'https://nic.gov.vn/' : 
         i === 1 ? 'https://vietnam.zonestartups.com/' :
         i === 2 ? 'https://nhipcaudautu.vn/' :
         i === 3 ? 'https://dariu.org/' :
         i === 4 ? 'https://aimacademy.vn/' :
         i === 5 ? 'https://jaxtina.com/' :
         i === 6 ? 'https://www.coderschool.vn/vi' :
         i === 7 ? 'https://simpleenglish.com.vn/' : 
         i === 8 ? 'https://www.coursera.org/' : 
         i === 9 ? 'https://novaedu.vn/' :
         i === 10 ? 'https://vnei.edu.vn/' :
         i === 11 ? 'https://sihub.gov.vn/' :undefined
  }));

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
          Partners
        </h2>
        
        <div className="mt-12">
          <div className="grid grid-cols-4 gap-8 items-center justify-items-center">
            {partners.map((partner) => (
              <div
                key={partner.id}
                className={`flex items-center justify-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-300 w-full h-24 ${partner.url ? 'cursor-pointer' : ''}`}
                onClick={() => partner.url && window.open(partner.url, '_blank')}
              >
                <img
                  src={partner.image}
                  alt={partner.name}
                  className="max-w-full max-h-full object-contain transition-all duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="60" viewBox="0 0 120 60"%3E%3Crect width="120" height="60" fill="%23f3f4f6"/%3E%3Ctext x="60" y="30" text-anchor="middle" dy=".3em" fill="%236b7280" font-size="12"%3EPartner ' + partner.id + '%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Partners; 