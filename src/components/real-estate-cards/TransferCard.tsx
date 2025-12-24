import React from 'react';
import { ArrowDown, Building2 } from 'lucide-react';

export interface TransferCardProps {
  amount: string;
  fromPropertyName: string;
  fromPropertyId: string;
  toPropertyName: string;
  toPropertyId: string;
  activeBgColor: string;
  className?: string;
}

export const TransferCard: React.FC<TransferCardProps> = ({
  amount,
  fromPropertyName,
  fromPropertyId,
  toPropertyName,
  toPropertyId,
  activeBgColor,
  className,
}) => {
  return (
    <div className={`bg-white/75 backdrop-blur-xl rounded-lg p-5 h-fit flex flex-col shadow-[0_0_0_1px_rgba(255,255,255,1)_inset] ${className || ''}`}>
      <div className="flex flex-col">
        {/* From Property */}
        <div className="flex gap-4 items-center">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center shadow-[0_0_0_1px_rgba(0,0,0,0.05)_inset]"
            style={{ backgroundColor: activeBgColor }}
          >
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center justify-between gap-1">
              <p className="font-medium text-xs text-gray-600">{fromPropertyName}</p>
              <p className="font-medium text-xs text-gray-600 opacity-50">ID: {fromPropertyId}</p>
            </div>
            <div className="flex items-center gap-1">
              <h3 className="font-semibold text-base text-gray-700">
                -${amount} <span className="text-gray-700 opacity-40">USD</span>
              </h3>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="grid grid-cols-[32px_auto] items-center gap-4 py-2">
          <div className="flex items-center justify-center opacity-20">
            <ArrowDown className="w-4 h-4 text-cyan-800" />
          </div>
          <div className="w-full h-px bg-cyan-800/10" />
        </div>

        {/* To Property */}
        <div className="flex gap-4 items-center">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center shadow-[0_0_0_1px_rgba(0,0,0,0.05)_inset]"
            style={{ backgroundColor: activeBgColor }}
          >
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center justify-between gap-1">
              <p className="font-medium text-xs text-gray-600">{toPropertyName}</p>
              <p className="font-medium text-xs text-gray-600 opacity-50">ID: {toPropertyId}</p>
            </div>
            <div className="flex items-center gap-1">
              <h3 className="font-semibold text-base text-gray-700">
                ${amount} <span className="text-gray-700 opacity-40">USD</span>
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferCard;

