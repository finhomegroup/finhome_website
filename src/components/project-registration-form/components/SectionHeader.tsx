
import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="border-b-2 border-teal-400/50 pb-3 mb-6">
      <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-sky-400">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-gray-400">{subtitle}</p>}
    </div>
  );
};

export default SectionHeader;
