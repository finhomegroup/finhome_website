import React from 'react';
import styled from 'styled-components';
import { Flex } from '~/elements/Flex';
import { Text } from '~/components/Typography';
import Chip from '~/assets/svg/index/chip.svg';
import CardLogo from '~/assets/svg/index/card-logo.svg';

export interface CreditCardProps {
  cardholderName: string;
  activeBgColor: string;
  className?: string;
}

const Card = styled.div`
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05) inset;
`;

const CreditCardContainer = styled(Card)<{ $activeBgColor: string }>`
  aspect-ratio: 1.65/1;
  width: 100%;
  padding: 24px;
  position: relative;
  box-sizing: border-box;
  overflow: hidden;
  background-color: ${({ $activeBgColor }) => $activeBgColor};
  transform: translateZ(0); /* avoid creating stacking context beyond own wrapper */
  will-change: transform;
  .card-logo {
    position: absolute;
    top: 24px;
    left: auto;
    right: 24px;
  }
`;

export const CreditCard: React.FC<CreditCardProps> = ({ cardholderName, activeBgColor, className }) => {
  const isLight = ['#E4F223', '#9FE870', '#A1C5E6'].includes(activeBgColor);
  const balanceColor = isLight ? 'rgba(var(--rgb-cyan-800), 0.35)' : 'rgba(var(--rgb-white), .5)';

  return (
    <CreditCardContainer $activeBgColor={activeBgColor} className={className}>
      <CardLogo className="card-logo" />
      <Flex flexDirection="column" height="100%">
        <Flex flexDirection="column" justifyContent="end" height="60%">
          <Chip />
        </Flex>
        <Flex flexDirection="column" justifyContent="end" height="40%">
          <Text
            size={14}
            fontWeight="medium"
            color={balanceColor}
            textShadow={isLight ? '0 1px 0 rgba(255,255,255,0.3)' : '0 -1px 0 rgba(0,0,0,0.05)'}
          >
            {cardholderName}
          </Text>
        </Flex>
      </Flex>
    </CreditCardContainer>
  );
};

export default CreditCard;
