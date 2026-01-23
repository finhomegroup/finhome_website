import React from 'react';

export interface PropertyCardProps {
  price: string;
  currency?: string;
  propertyName: string;
  propertyId: string;
  activeBgColor: string;
  className?: string;
  hasTransactions?: boolean;
}

const GraphSvg: React.FC<{ strokeColor?: string }> = ({ strokeColor = 'white' }) => (
  <svg width="249" height="53" viewBox="0 0 249 53" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M1 41.5L31 31.5L61 51.5L91 41.5L121 21.5L151 11.5L181 21.5L211 1.5"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke={strokeColor}
    />
    <path d="M211 1.5L241 8" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 6" stroke={strokeColor} />
  </svg>
);

export const PropertyCard: React.FC<PropertyCardProps> = ({
  price,
  currency = 'VND',
  propertyName,
  propertyId,
  activeBgColor,
  className,
  hasTransactions,
}) => {
  const isLight = ['#E4F223', '#9FE870', '#A1C5E6'].includes(activeBgColor);
  const textColor = isLight ? 'text-cyan-800' : 'text-white';
  
  const transactions = [
    { name: 'Investor A', amount: '+$250,000' },
    { name: 'Investor B', amount: '+$180,000' },
    { name: 'Investor C', amount: '+$95,000' },
  ];

  return (
    <div className={`bg-white/75 backdrop-blur-xl rounded-lg p-5 h-fit flex flex-col shadow-[0_0_0_1px_rgba(255,255,255,1)_inset] ${className || ''}`}>
      <div className="flex items-center justify-between mb-4">
        <p className="font-medium text-sm text-gray-800">{propertyName}</p>
        <p className="font-medium text-xs text-gray-800 opacity-60">ID: {propertyId}</p>
      </div>
      
      <div 
        className="rounded-md p-5 flex-1 flex flex-col justify-between gap-5 shadow-[0_4px_8px_0_rgba(0,0,0,0.1),0_2px_4px_0_rgba(0,0,0,0.1),0_1px_1px_0_rgba(0,0,0,0.25)] transition-colors duration-300"
        style={{ backgroundColor: activeBgColor }}
      >
        <div className="flex items-baseline gap-1">
          <p className={`text-base font-semibold ${textColor}`}>{price}</p>
          <p className={`text-sm font-semibold ${textColor} opacity-60`}>{currency}</p>
        </div>
        
        <div className="relative mb-2">
          <GraphSvg strokeColor={isLight ? '#1f2937' : 'white'} />
        </div>
        
        {hasTransactions && (
          <div className="flex flex-col gap-0.5 mt-2">
            {transactions.map((t, i) => (
              <div 
                key={i}
                className={`flex items-center justify-between text-xs leading-4 opacity-90 rounded px-2 py-2 ${
                  isLight ? 'bg-black/5' : 'bg-white/10'
                }`}
              >
                <span className={`font-medium ${textColor}`}>{t.name}</span>
                <span className={`font-medium ${textColor}`}>{t.amount}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyCard;

