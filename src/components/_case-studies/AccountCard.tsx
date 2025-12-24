import React from 'react';
import styled from 'styled-components';
import { Flex } from '~/elements/Flex';
import { Text } from '~/components/Typography';

export interface AccountCardProps {
  amount: string;
  currency?: string;
  accountName: string;
  accountNumberLast4: string;
  activeBgColor: string;
  className?: string;
  hasTransfers?: boolean;
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

const BalanceSection = styled.div<{ $activeBgColor: string }>`
  background: ${({ $activeBgColor }) => $activeBgColor};
  border-radius: 6px;
  padding: 20px;
  gap: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow:
    0 4px 8px 0 rgba(0, 0, 0, 0.1),
    0 2px 4px 0 rgba(0, 0, 0, 0.1),
    0 1px 1px 0 rgba(0, 0, 0, 0.25);
  transition: background-color 0.3s ease;
`;

const LineGraph = styled.div<{ $activeBgColor: string }>`
  position: relative;
  svg {
    width: 100%;
    height: 100%;
    margin-bottom: 8px;
  }
  path {
    stroke: ${({ $activeBgColor }) => {
      const isLight = ['#E4F223', '#9FE870', '#A1C5E6'].includes($activeBgColor);
      return isLight ? '#1f2937' : 'white';
    }};
  }
`;

const TransfersList = styled.div<{ $isLight: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 8px;
  color: ${({ $isLight }) => ($isLight ? 'var(--color-cyan-800)' : 'var(--color-white)')};
`;

const TransferRow = styled.div<{ $isLight: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  line-height: 16px;
  opacity: 0.9;
  border-radius: 4px;
  padding: 8px 8px;
  background: ${({ $isLight }) => ($isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.08)')};
`;

const GraphSvg: React.FC = () => (
  <svg width="249" height="53" viewBox="0 0 249 53" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M1 41.5L31 31.5L61 51.5L91 41.5L121 21.5L151 11.5L181 21.5L211 1.5"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M211 1.5L241 8" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 6" />
  </svg>
);

export const AccountCard: React.FC<AccountCardProps> = ({
  amount,
  currency = 'USD',
  accountName,
  accountNumberLast4,
  activeBgColor,
  className,
  hasTransfers,
}) => {
  const isLight = ['#E4F223', '#9FE870', '#A1C5E6'].includes(activeBgColor);
  const balanceColor = isLight ? 'cyan-800' : 'white';
  const transfers = [
    { name: 'Payroll Clearing', amount: '-$4,920.21' },
    { name: 'Vendor (EUR)', amount: '-$2,410.00' },
    { name: 'Reimbursement', amount: '+$350.00' },
  ];
  return (
    <Card className={className}>
      <Flex alignItems="center" gap="4px" mb="16px" justifyContent="space-between">
        <Text fontWeight="medium" size={14} color="blue-800">
          {accountName}
        </Text>
        <Text fontWeight="medium" size={12} color="blue-800" opacity={0.6}>
          ••• {accountNumberLast4}
        </Text>
      </Flex>
      <BalanceSection $activeBgColor={activeBgColor}>
        <Flex alignItems="baseline" gap="4px">
          <Text size={16} weight="semibold" color={balanceColor}>
            {amount}
          </Text>
          <Text size={14} weight="semibold" color={balanceColor} opacity={0.6}>
            {currency}
          </Text>
        </Flex>
        <LineGraph $activeBgColor={activeBgColor}>
          <GraphSvg />
        </LineGraph>
        {hasTransfers && (
          <TransfersList $isLight={isLight}>
            {transfers.map((t, i) => (
              <TransferRow key={i} $isLight={isLight}>
                <Text size={12} weight="medium" color={balanceColor} opacity={0.9}>
                  {t.name}
                </Text>
                <Text size={12} weight="medium" color={balanceColor} opacity={0.9}>
                  {t.amount}
                </Text>
              </TransferRow>
            ))}
          </TransfersList>
        )}
      </BalanceSection>
    </Card>
  );
};

export default AccountCard;
