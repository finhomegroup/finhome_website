import React, { memo } from 'react';
import { AccountCard, AccountCardProps } from './AccountCard';
import { DomesticPayment, DomesticPaymentProps } from './DomesticPayment';
import { InternationalPayment, InternationalPaymentProps } from './InternationalPayment';
import { LoanCard, LoanCardProps } from './LoanCard';
import { CreditCard as CreditCardComponent, CreditCardProps } from './CreditCard';

export type SceneCardConfig =
  | { type: 'account'; props: AccountCardProps }
  | { type: 'transfer'; props: DomesticPaymentProps }
  | { type: 'intl'; props: InternationalPaymentProps }
  | { type: 'loan'; props: LoanCardProps }
  | { type: 'credit'; props: CreditCardProps };

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
          case 'account':
            return <AccountCard key={key} {...card.props} className={className} />;
          case 'transfer':
            return <DomesticPayment key={key} {...card.props} className={className} />;
          case 'intl':
            return <InternationalPayment key={key} {...card.props} className={className} />;
          case 'loan':
            return <LoanCard key={key} {...card.props} className={className} />;
          case 'credit':
            return <CreditCardComponent key={key} {...card.props} className={className} />;
          default:
            return null;
        }
      })}
    </div>
  );
});

Scene.displayName = 'Scene';

export default Scene;
