import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { ZoomIn, ZoomOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { typography } from '@/styles/global';

interface TokenBalanceProps {
  balance: number;
  delta?: number;
  compact?: boolean;
  onPress?: () => void;
  showDelta?: boolean;
}

const TokenBalance: React.FC<TokenBalanceProps> = ({
  balance,
  delta = 0,
  compact = false,
  onPress,
  showDelta = false,
}) => {
  const { colors } = useTheme();

  const formatBalance = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  const renderDelta = () => {
    if (!showDelta || delta === 0) return null;
    
    return (
      <Animated.View
        entering={ZoomIn.duration(200)}
        exiting={ZoomOut.duration(200)}
        style={[
          styles.deltaContainer,
          {
            backgroundColor: delta > 0 ? colors.success : colors.danger,
          }
        ]}
      >
        <Ionicons 
          name={delta > 0 ? 'arrow-up' : 'arrow-down'} 
          size={12} 
          color="white" 
        />
        <Text style={styles.deltaText}>
          {Math.abs(delta)}
        </Text>
      </Animated.View>
    );
  };

  if (compact) {
    return (
      <TouchableOpacity 
        onPress={onPress}
        style={[styles.compactContainer, { backgroundColor: colors.surface }]}
        accessibilityRole="button"
        accessibilityLabel={`Token balance: ${balance}`}
        disabled={!onPress}
      >
        <Ionicons name="diamond" size={16} color={colors.warning} />
        <Text style={[styles.compactBalance, { color: colors.text }]}>
          {formatBalance(balance)}
        </Text>
        {renderDelta()}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      onPress={onPress}
      style={[styles.container, { backgroundColor: colors.surface }]}
      accessibilityRole="button"
      accessibilityLabel={`Token balance: ${balance}`}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <Ionicons name="diamond" size={20} color={colors.warning} />
        <Text style={[styles.title, { color: colors.text }]}>
          Tokens
        </Text>
      </View>
      
      <View style={styles.balanceRow}>
        <Text style={[styles.balance, { color: colors.text }]}>
          {formatBalance(balance)}
        </Text>
        {renderDelta()}
      </View>
      
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Available
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 120,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    ...typography.captionBold,
    marginLeft: 4,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balance: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  },
  compactBalance: {
    ...typography.captionBold,
    marginLeft: 4,
  },
  subtitle: {
    ...typography.footnote,
    marginTop: 2,
  },
  deltaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  deltaText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
  },
});

export default TokenBalance;