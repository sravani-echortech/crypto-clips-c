import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';

import { SafeContainer, ResponsiveAppHeader, ResponsiveTokenBalance } from '@/components';
import { useTheme } from '@/contexts/ThemeContext';
import { useStore } from '@/store';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface Reward {
  id: string;
  name: string;
  description: string;
  cost: number;
  category: 'merchandise' | 'subscription' | 'donation' | 'nft' | 'experience';
  imageUrl?: string;
  icon: string;
  color: string;
  stock?: number;
  expiresAt?: Date;
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  popular?: boolean;
}

const RewardsCatalogScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { tokens, streak, redeemReward, preferences } = useStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'cost' | 'popular' | 'new'>('popular');

  const rewards: Reward[] = [
    {
      id: '1',
      name: 'Pro Subscription - 1 Month',
      description: 'Ad-free experience, advanced analytics, and priority news',
      cost: 500,
      category: 'subscription',
      icon: 'star',
      color: '#FFD700',
      popular: true,
      tier: 'gold',
    },
    {
      id: '2',
      name: 'CryptoClips T-Shirt',
      description: 'Exclusive branded merchandise',
      cost: 300,
      category: 'merchandise',
      icon: 'shirt',
      color: '#4CAF50',
      stock: 50,
    },
    {
      id: '3',
      name: 'Donate to Charity',
      description: 'We\'ll donate $5 to blockchain education initiatives',
      cost: 200,
      category: 'donation',
      icon: 'heart',
      color: '#E91E63',
    },
    {
      id: '4',
      name: 'Custom News NFT',
      description: 'Mint your reading history as an NFT',
      cost: 1000,
      category: 'nft',
      icon: 'cube',
      color: '#9C27B0',
      tier: 'platinum',
    },
    {
      id: '5',
      name: 'Virtual Coffee Chat',
      description: '30-min video call with crypto experts',
      cost: 800,
      category: 'experience',
      icon: 'videocam',
      color: '#2196F3',
      tier: 'gold',
    },
    {
      id: '6',
      name: 'Premium Sticker Pack',
      description: 'Exclusive digital stickers for messaging apps',
      cost: 100,
      category: 'merchandise',
      icon: 'happy',
      color: '#FF9800',
      popular: true,
    },
    {
      id: '7',
      name: 'Early Access Pass',
      description: 'Get new features before everyone else',
      cost: 400,
      category: 'subscription',
      icon: 'rocket',
      color: '#00BCD4',
      tier: 'silver',
    },
    {
      id: '8',
      name: 'Plant a Tree',
      description: 'Offset crypto carbon footprint',
      cost: 150,
      category: 'donation',
      icon: 'leaf',
      color: '#4CAF50',
    },
  ];

  const categories = [
    { id: 'all', name: 'All', icon: 'apps' },
    { id: 'subscription', name: 'Subscriptions', icon: 'star' },
    { id: 'merchandise', name: 'Merch', icon: 'shirt' },
    { id: 'donation', name: 'Charity', icon: 'heart' },
    { id: 'nft', name: 'NFTs', icon: 'cube' },
    { id: 'experience', name: 'Experiences', icon: 'sparkles' },
  ];

  const filteredRewards = useMemo(() => {
    let filtered = selectedCategory === 'all' 
      ? rewards 
      : rewards.filter(r => r.category === selectedCategory);

    switch (sortBy) {
      case 'cost':
        return filtered.sort((a, b) => a.cost - b.cost);
      case 'popular':
        return filtered.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
      case 'new':
        return filtered.reverse();
      default:
        return filtered;
    }
  }, [selectedCategory, sortBy]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleRedeem = useCallback((reward: Reward) => {
    if (tokens.balance < reward.cost) {
      Alert.alert(
        'Insufficient Tokens',
        `You need ${reward.cost - tokens.balance} more tokens to redeem this reward.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Earn More', onPress: () => navigation.navigate('Feed' as any) }
        ]
      );
      return;
    }

    Alert.alert(
      'Confirm Redemption',
      `Redeem "${reward.name}" for ${reward.cost} tokens?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Redeem',
          onPress: () => {
            if (preferences.haptics) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            redeemReward(reward.cost, reward.name);
            Alert.alert('Success! 🎉', `You've redeemed ${reward.name}!`);
          }
        }
      ]
    );
  }, [tokens.balance, redeemReward, preferences.haptics, navigation]);

  const renderRewardCard = ({ item }: { item: Reward }) => {
    const canAfford = tokens.balance >= item.cost;
    const tierColors = {
      bronze: ['#CD7F32', '#8B4513'],
      silver: ['#C0C0C0', '#808080'],
      gold: ['#FFD700', '#FFA500'],
      platinum: ['#E5E4E2', '#BCC6CC'],
    };

    return (
      <Animated.View
        entering={ZoomIn.duration(300)}
      >
        <TouchableOpacity
          style={[
            styles.rewardCard,
            { 
              backgroundColor: colors.card,
              opacity: canAfford ? 1 : 0.7,
            }
          ]}
          onPress={() => handleRedeem(item)}
          disabled={!canAfford}
        >
          {item.tier && (
            <LinearGradient
              colors={tierColors[item.tier]}
              style={styles.tierBadge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.tierText}>{item.tier.toUpperCase()}</Text>
            </LinearGradient>
          )}

          {item.popular && (
            <View style={[styles.popularBadge, { backgroundColor: colors.primary }]}>
              <Ionicons name="flame" size={12} color="#fff" />
              <Text style={styles.popularText}>HOT</Text>
            </View>
          )}

          <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
            <Ionicons name={item.icon as any} size={32} color={item.color} />
          </View>

          <Text style={[styles.rewardName, { color: colors.text }]} numberOfLines={2}>
            {item.name}
          </Text>

          <Text style={[styles.rewardDescription, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.description}
          </Text>

          {item.stock && (
            <Text style={[styles.stockText, { color: colors.warning }]}>
              Only {item.stock} left!
            </Text>
          )}

          <View style={styles.costContainer}>
            <View style={[styles.tokenIcon, { backgroundColor: colors.primary + '20' }]}>
              <Text style={{ color: colors.primary }}>🪙</Text>
            </View>
            <Text style={[styles.costText, { color: canAfford ? colors.primary : colors.error }]}>
              {item.cost}
            </Text>
          </View>

          {!canAfford && (
            <Text style={[styles.insufficientText, { color: colors.error }]}>
              Need {item.cost - tokens.balance} more
            </Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary, colors.primary + '80']}
        style={styles.balanceCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.balanceContent}>
          <Text style={styles.balanceLabel}>Your Balance</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceAmount}>🪙 {tokens.balance}</Text>
            <Text style={styles.balanceSubtext}>tokens</Text>
          </View>
          <Text style={styles.streakText}>
            🔥 {streak.current} day streak
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.earnButton}
          onPress={() => navigation.navigate('Feed' as any)}
        >
          <Text style={styles.earnButtonText}>Earn More</Text>
          <Ionicons name="arrow-forward" size={16} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              { 
                backgroundColor: selectedCategory === category.id 
                  ? colors.primary 
                  : colors.card,
                borderColor: colors.border,
              }
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Ionicons 
              name={category.icon as any} 
              size={18} 
              color={selectedCategory === category.id ? '#fff' : colors.text}
            />
            <Text style={[
              styles.categoryText,
              { color: selectedCategory === category.id ? '#fff' : colors.text }
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.sortContainer}>
        <Text style={[styles.sortLabel, { color: colors.textSecondary }]}>Sort by:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(['popular', 'cost', 'new'] as const).map(option => (
            <TouchableOpacity
              key={option}
              style={[
                styles.sortChip,
                { 
                  backgroundColor: sortBy === option ? colors.primary + '20' : colors.card,
                  borderColor: sortBy === option ? colors.primary : colors.border,
                }
              ]}
              onPress={() => setSortBy(option)}
            >
              <Text style={[
                styles.sortChipText,
                { color: sortBy === option ? colors.primary : colors.text }
              ]}>
                {option === 'cost' ? 'Lowest Cost' : option === 'popular' ? 'Most Popular' : 'Newest'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  return (
    <SafeContainer>
      <ResponsiveAppHeader 
        title="Rewards Catalog" 
        subtitle="Redeem your tokens"
        showBack={false}
      />
      
      <FlatList
        data={filteredRewards}
        renderItem={renderRewardCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />
    </SafeContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
  },
  balanceCard: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceContent: {
    flex: 1,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 4,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  balanceSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  streakText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginTop: 8,
  },
  earnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  earnButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    gap: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sortLabel: {
    fontSize: 14,
    marginRight: 12,
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
  },
  sortChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  list: {
    paddingBottom: 100,
  },
  row: {
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  rewardCard: {
    width: (width - 48) / 2,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    position: 'relative',
  },
  tierBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tierText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  popularBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 2,
  },
  popularText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    alignSelf: 'center',
  },
  rewardName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  rewardDescription: {
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 16,
  },
  stockText: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  costContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  tokenIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  costText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  insufficientText: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default RewardsCatalogScreen;