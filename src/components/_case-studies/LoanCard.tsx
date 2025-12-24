import React from 'react';
import styled from 'styled-components';
import { Flex } from '~/elements/Flex';
import { Text } from '~/components/Typography';

export interface LoanCardProps {
  loanName: string;
  amount: string;
  date: string;
  tag: string;
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

const Tag = styled(Text)`
  border-radius: 6px;
`;

export const LoanCard: React.FC<LoanCardProps> = ({ loanName, amount, date, tag, activeBgColor, className }) => {
  return (
    <Card className={className}>
      <Flex flexDirection="column" gap="8px" minHeight="130px">
        <Flex alignItems="center" gap="12px">
          <Text fontWeight="medium" size={16} color="gray-500">
            {loanName}
          </Text>
        </Flex>
        <Flex flex="1">
          <Text size={20} weight="semibold" color="gray-800">
            {amount}
          </Text>
        </Flex>
        <Flex alignItems="center" justifyContent="space-between">
          <Tag
            size={12}
            color={['#E4F223', '#9FE870'].includes(activeBgColor) ? 'gray-800' : 'white'}
            weight="medium"
            px={3}
            py={2}
            bg={activeBgColor}
          >
            {tag}
          </Tag>
          <Text fontWeight="normal" size={12} color="gray-800" opacity={0.6}>
            {date}
          </Text>
        </Flex>
      </Flex>
    </Card>
  );
};

export default LoanCard;
