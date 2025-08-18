import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { TokenTransaction } from '@/types';
import { typography } from '@/styles/global';
import { formatDistanceToNow } from 'date-fns';

interface WalletEntryProps {
  transaction: TokenTransaction;
  showDate?: boolean;
}

const WalletEntry: React.FC<WalletEntryProps> = ({
  transaction,
  showDate = true,
}) => {
  const { colors } = useTheme();

  const getIcon = () => {
    switch (transaction.type) {
      case 'earned':
        return 'add-circle';
      case 'spent':
        return 'remove-circle';
      case 'bonus':
        return 'gift';
      default:
        return 'ellipse';
    }
  };

  const getIconColor = () => {
    switch (transaction.type) {
      case 'earned':
        return colors.success;
      case 'spent':
        return colors.danger;
      case 'bonus':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const formatAmount = (amount: number) => {
    const sign = amount >= 0 ? '+' : '';
    return `${sign}${amount}`;
  };

  const timeAgo = formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true });

  return (
    <View style={[styles.container, { borderBottomColor: colors.border }]}>
      <View style={styles.iconContainer}>
        <Ionicons
          name={getIcon()}
          size={24}
          color={getIconColor()}
        />
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.reason, { color: colors.text }]}>
          {transaction.reason}
        </Text>
        
        {showDate && (
          <Text style={[styles.date, { color: colors.textSecondary }]}>
            {timeAgo}
          </Text>
        )}
      </View>
      
      <Text style={[
        styles.amount,
        {
          color: transaction.amount >= 0 ? colors.success : colors.danger,
        }
      ]}>
        {formatAmount(transaction.amount)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  iconContainer: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  reason: {
    ...typography.body,
    marginBottom: 2,
  },
  date: {
    ...typography.footnote,
  },
  amount: {
    ...typography.bodyBold,
    textAlign: 'right',
  },
});

export default WalletEntry;