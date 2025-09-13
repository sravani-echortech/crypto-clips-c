import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { Coin } from '@/types';
import { typography } from '@/styles/global';

interface PriceChipProps {
  coin: Coin;
  showChange?: boolean;
  showIcon?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  compact?: boolean;
  refreshing?: boolean;
}

const PriceChip: React.FC<PriceChipProps> = ({
  coin,
  showChange = true,
  showIcon = false,
  onPress,
  style,
  compact = false,
  refreshing = false,
}) => {
  const { colors } = useTheme();
  const [isStale, setIsStale] = useState(false);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (refreshing) {
      rotation.value = withRepeat(withTiming(360, { duration: 1000 }), -1, false);
    } else {
      rotation.value = 0;
    }
  }, [refreshing]);

  useEffect(() => {
    // Simulate price staleness check
    const timer = setTimeout(() => {
      setIsStale(true);
    }, 60000); // 1 minute

    return () => clearTimeout(timer);
  }, []);

  // Formatting utilities
  const formatPrice = React.useCallback((price: number) => {
    if (price < 0.01) {
      return `$${price.toFixed(6)}`;
    } else if (price < 1) {
      return `$${price.toFixed(4)}`;
    } else if (price < 100) {
      return `$${price.toFixed(2)}`;
    } else {
      return `$${price.toLocaleString()}`;
    }
  }, []);

  const formatPercentage = React.useCallback((percentage: number) => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  }, []);

  // Style calculations
  const chipStyles = React.useMemo(() => {
    const hasPriceChange = coin.priceChangePercentage24h !== undefined;
    const isPositive = coin.priceChangePercentage24h && coin.priceChangePercentage24h >= 0;
    
    const changeColor = !hasPriceChange ? colors.textSecondary : 
      isPositive ? colors.success : colors.danger;
    
    const backgroundColor = !showChange || !hasPriceChange ? colors.surface :
      isPositive ? colors.success + '15' : colors.danger + '15';
    
    return { changeColor, backgroundColor };
  }, [colors, showChange, coin.priceChangePercentage24h]);

  const renderContent = () => (
    <View style={[
      styles.container,
      { 
        backgroundColor: chipStyles.backgroundColor,
        borderColor: colors.border,
      },
      compact && styles.compactContainer,
      style,
    ]}>
      {showIcon && coin.logo && (
        <Image 
          source={{ uri: coin.logo }}
          style={styles.coinIcon}
        />
      )}
      
      <View style={styles.content}>
        <View style={styles.symbolRow}>
          <Text style={[
            styles.symbol, 
            { color: colors.text },
            compact && styles.compactSymbol,
          ]}>
            {coin.symbol}
          </Text>
          
          {isStale && !refreshing && (
            <Text style={[styles.staleIndicator, { color: colors.textSecondary }]}>
              Delayed
            </Text>
          )}
          
          {refreshing && (
            <Animated.View
              style={useAnimatedStyle(() => ({
                transform: [{ rotate: rotation.value + 'deg' }]
              }))}
            >
              <Ionicons 
                name="refresh" 
                size={12} 
                color={colors.textSecondary} 
              />
            </Animated.View>
          )}
        </View>
        
        <View style={styles.priceRow}>
          {coin.currentPrice && (
            <Text style={[
              styles.price, 
              { color: colors.text },
              compact && styles.compactPrice,
            ]}>
              {formatPrice(coin.currentPrice)}
            </Text>
          )}
          
          {showChange && coin.priceChangePercentage24h !== undefined && (
            <Text style={[
              styles.change,
              { color: chipStyles.changeColor },
              compact && styles.compactChange,
            ]}>
              {formatPercentage(coin.priceChangePercentage24h)}
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${coin.name} price: ${coin.currentPrice ? formatPrice(coin.currentPrice) : 'unavailable'}`}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  return renderContent();
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  compactContainer: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
  },
  coinIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
    borderRadius: 8,
  },
  content: {
    flex: 1,
  },
  symbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  symbol: {
    ...typography.footnote,
    fontWeight: '600',
    marginRight: 4,
  },
  compactSymbol: {
    fontSize: 10,
  },
  staleIndicator: {
    fontSize: 8,
    fontWeight: '500',
    marginLeft: 4,
    opacity: 0.7,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    ...typography.footnote,
    fontWeight: '500',
    marginRight: 6,
  },
  compactPrice: {
    fontSize: 10,
  },
  change: {
    ...typography.footnote,
    fontWeight: '600',
  },
  compactChange: {
    fontSize: 10,
  },
});

export default PriceChip;