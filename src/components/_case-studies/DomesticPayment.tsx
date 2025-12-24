import React from 'react';
import styled from 'styled-components';
import { Flex } from '~/elements/Flex';
import { Text } from '~/components/Typography';
import { Icon } from '~/elements/Icon';

export interface DomesticPaymentProps {
  amount: string;
  fromAccountName: string;
  fromAccountLast4: string;
  toAccountName: string;
  toAccountLast4: string;
  activeBgColor: string;
  className?: string;
}

const Card = styled.div`
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 8px;
  padding: 20px;
  height: fit-content;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 1) inset;
`;

const AccountAvatar = styled.div<{ $activeBgColor: string }>`
  background-color: ${({ $activeBgColor }) => $activeBgColor || '#000000'};
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 500;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05) inset;
  svg {
    width: 16px;
    height: 16px;
  }
`;

const PaymentParty = styled(Flex)`
  position: relative;
`;

const Divider = styled.div`
  display: grid;
  grid-template-columns: 32px auto;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
  &:after {
    content: '';
    display: block;
    width: 100%;
    height: 1px;
    background-color: rgba(var(--rgb-cyan-800), 0.1);
  }
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.2;
`;

export const DomesticPayment: React.FC<DomesticPaymentProps> = ({
  amount,
  fromAccountName,
  fromAccountLast4,
  toAccountName,
  toAccountLast4,
  activeBgColor,
  className,
}) => {
  return (
    <Card className={className}>
      <Flex flexDirection="column">
        <PaymentParty gap="16px" alignItems="center">
          <AccountAvatar $activeBgColor={activeBgColor}>
            <Icon.Business color="white" />
          </AccountAvatar>
          <Flex flexDirection="column" gap="4px" flex="1">
            <Flex alignItems="center" gap="4px" justifyContent="space-between">
              <Text fontWeight="medium" size={12} color="gray-600">
                {fromAccountName}
              </Text>
              <Text fontWeight="medium" size={12} color="gray-600" opacity={0.5}>
                ••• {fromAccountLast4}
              </Text>
            </Flex>
            <Flex alignItems="center" gap="4px">
              <Text as="h3" fontWeight="semibold" size={16} color="gray-700">
                -${amount}{' '}
                <Text color="gray-700" opacity={0.4}>
                  USD
                </Text>
              </Text>
            </Flex>
          </Flex>
        </PaymentParty>
        <Divider>
          <IconContainer>
            <Icon.ArrowDown color="cyan-800" />
          </IconContainer>
        </Divider>
        <PaymentParty gap="16px" alignItems="center">
          <AccountAvatar $activeBgColor={activeBgColor}>
            <Icon.Business color="white" />
          </AccountAvatar>
          <Flex flexDirection="column" gap="4px" flex="1">
            <Flex alignItems="center" gap="4px" justifyContent="space-between">
              <Text fontWeight="medium" size={12} color="gray-600">
                {toAccountName}
              </Text>
              <Text fontWeight="medium" size={12} color="gray-600" opacity={0.5}>
                ••• {toAccountLast4}
              </Text>
            </Flex>
            <Flex alignItems="center" gap="4px">
              <Text as="h3" fontWeight="semibold" size={16} color="gray-700">
                ${amount}{' '}
                <Text color="gray-700" opacity={0.4}>
                  USD
                </Text>
              </Text>
            </Flex>
          </Flex>
        </PaymentParty>
      </Flex>
    </Card>
  );
};

export default DomesticPayment;
