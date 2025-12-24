import React, { memo } from 'react';
import { PropertyCard, PropertyCardProps } from './PropertyCard';
import { TransferCard, TransferCardProps } from './TransferCard';
import { InternationalTransferCard, InternationalTransferCardProps } from './InternationalTransferCard';
import { ProjectCard, ProjectCardProps } from './ProjectCard';
import { InvestmentCard, InvestmentCardProps } from './InvestmentCard';

export type SceneCardConfig =
  | { type: 'property'; props: PropertyCardProps }
  | { type: 'transfer'; props: TransferCardProps }
  | { type: 'intl'; props: InternationalTransferCardProps }
  | { type: 'project'; props: ProjectCardProps }
  | { type: 'investment'; props: InvestmentCardProps };

export interface SceneConfig {
  cards: SceneCardConfig[];
}

export interface SceneProps {
  config: SceneConfig;
}

export const Scene: React.FC<SceneProps> = memo(({ config }) => {
  // Safety check for undefined config
  if (!config || !config.cards) {
    return null;
  }

  return (
    <div>
      {config.cards.map((card, index) => {
        const key = `card-${index}`;
        const className = "anim-target";
        
        switch (card.type) {
          case 'property':
            return <PropertyCard key={key} {...card.props} className={className} />;
          case 'transfer':
            return <TransferCard key={key} {...card.props} className={className} />;
          case 'intl':
            return <InternationalTransferCard key={key} {...card.props} className={className} />;
          case 'project':
            return <ProjectCard key={key} {...card.props} className={className} />;
          case 'investment':
            return <InvestmentCard key={key} {...card.props} className={className} />;
          default:
            return null;
        }
      })}
    </div>
  );
});

Scene.displayName = 'Scene';

export default Scene;

