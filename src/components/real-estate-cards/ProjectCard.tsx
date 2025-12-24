import React from 'react';

export interface ProjectCardProps {
  projectName: string;
  totalValue: string;
  completionDate: string;
  tag: string;
  activeBgColor: string;
  className?: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ 
  projectName, 
  totalValue, 
  completionDate, 
  tag, 
  activeBgColor, 
  className 
}) => {
  const isLight = ['#E4F223', '#9FE870', '#A1C5E6'].includes(activeBgColor);
  const tagTextColor = isLight ? 'text-gray-800' : 'text-white';

  return (
    <div className={`bg-white/75 backdrop-blur-xl rounded-lg p-5 h-fit flex flex-col shadow-[0_0_0_1px_rgba(255,255,255,1)_inset] ${className || ''}`}>
      <div className="flex flex-col gap-2 min-h-[130px]">
        <div className="flex items-center gap-3">
          <p className="font-medium text-base text-gray-500">{projectName}</p>
        </div>
        
        <div className="flex-1">
          <p className="text-xl font-semibold text-gray-800">{totalValue}</p>
        </div>
        
        <div className="flex items-center justify-between">
          <span 
            className={`text-xs font-medium px-3 py-2 rounded-md ${tagTextColor}`}
            style={{ backgroundColor: activeBgColor }}
          >
            {tag}
          </span>
          <p className="font-normal text-xs text-gray-800 opacity-60">{completionDate}</p>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;

