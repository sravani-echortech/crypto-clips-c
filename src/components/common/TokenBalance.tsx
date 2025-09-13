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

  // Balance formatting function
  const formatBalance = React.useCallback((value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  }, []);

  // Delta component
  const renderDelta = React.useCallback(() => {
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
  }, [showDelta, delta, colors.success, colors.danger]);

  // Style calculations
  const compactContainerStyle = React.useMemo(() => [
    styles.compactContainer,
    { backgroundColor: colors.surface }
  ], [colors.surface]);

  const compactBalanceStyle = React.useMemo(() => [
    styles.compactBalance,
    { color: colors.text }
  ], [colors.text]);

  const containerStyle = React.useMemo(() => [
    styles.container,
    { backgroundColor: colors.surface }
  ], [colors.surface]);

  const titleStyle = React.useMemo(() => [
    styles.title,
    { color: colors.text }
  ], [colors.text]);

  const balanceStyle = React.useMemo(() => [
    styles.balance,
    { color: colors.text }
  ], [colors.text]);

  const subtitleStyle = React.useMemo(() => [
    styles.subtitle,
    { color: colors.textSecondary }
  ], [colors.textSecondary]);

  if (compact) {
    return (
      <TouchableOpacity 
        onPress={onPress}
        style={compactContainerStyle}
        accessibilityRole="button"
        accessibilityLabel={`Token balance: ${balance}`}
        disabled={!onPress}
      >
        <Ionicons name="diamond" size={16} color={colors.warning} />
        <Text style={compactBalanceStyle}>
          {formatBalance(balance)}
        </Text>
        {renderDelta()}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      onPress={onPress}
      style={containerStyle}
      accessibilityRole="button"
      accessibilityLabel={`Token balance: ${balance}`}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <Ionicons name="diamond" size={20} color={colors.warning} />
        <Text style={titleStyle}>
          Tokens
        </Text>
      </View>
      
      <View style={styles.balanceRow}>
        <Text style={balanceStyle}>
          {formatBalance(balance)}
        </Text>
        {renderDelta()}
      </View>
      
      <Text style={subtitleStyle}>
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