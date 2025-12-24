import React from 'react';
import { Building2 } from 'lucide-react';

export interface InvestmentCardProps {
  investorName: string;
  activeBgColor: string;
  className?: string;
}

export const InvestmentCard: React.FC<InvestmentCardProps> = ({ 
  investorName, 
  activeBgColor, 
  className 
}) => {
  const isLight = ['#E4F223', '#9FE870', '#A1C5E6'].includes(activeBgColor);
  const textColor = isLight ? 'rgba(31, 41, 55, 0.35)' : 'rgba(255, 255, 255, 0.5)';

  return (
    <div 
      className={`rounded-lg p-6 flex flex-col aspect-[1.65/1] w-full relative overflow-hidden shadow-[0_0_0_1px_rgba(0,0,0,0.05)_inset] ${className || ''}`}
      style={{ backgroundColor: activeBgColor }}
    >
      <Building2 
        className="absolute top-6 right-6 w-8 h-8 text-white/30" 
      />
      
      <div className="flex flex-col h-full">
        <div className="flex flex-col justify-end h-[60%]">
          <div className="w-12 h-8 rounded bg-white/20" />
        </div>
        <div className="flex flex-col justify-end h-[40%]">
          <p 
            className="text-sm font-medium"
            style={{ 
              color: textColor,
              textShadow: isLight ? '0 1px 0 rgba(255,255,255,0.3)' : '0 -1px 0 rgba(0,0,0,0.05)'
            }}
          >
            {investorName}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvestmentCard;

