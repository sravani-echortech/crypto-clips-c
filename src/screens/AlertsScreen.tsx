import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeContainer, EmptyState } from '@/components';
import { useTheme } from '@/contexts/ThemeContext';
import { useStore } from '@/store';
import { format } from 'date-fns';

interface PriceAlert {
  id: string;
  coin: string;
  symbol: string;
  condition: 'above' | 'below';
  price: number;
  currentPrice?: number;
  enabled: boolean;
  createdAt: Date;
  triggeredAt?: Date;
  triggered: boolean;
}

interface NewsAlert {
  id: string;
  keywords: string[];
  sources: string[];
  categories: string[];
  enabled: boolean;
  frequency: 'instant' | 'hourly' | 'daily';
  createdAt: Date;
  lastTriggered?: Date;
}

const AlertsScreen: React.FC = () => {
  const { colors } = useTheme();
  const { preferences, addTokens, updatePreferences, priceAlerts: storedPriceAlerts, newsAlerts: storedNewsAlerts } = useStore();
  
  const [activeTab, setActiveTab] = useState<'price' | 'news'>('price');
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([
    {
      id: '1',
      coin: 'Bitcoin',
      symbol: 'BTC',
      condition: 'above',
      price: 100000,
      currentPrice: 98500,
      enabled: true,
      createdAt: new Date(),
      triggered: false,
    },
    {
      id: '2',
      coin: 'Ethereum',
      symbol: 'ETH',
      condition: 'below',
      price: 3000,
      currentPrice: 3250,
      enabled: true,
      createdAt: new Date(),
      triggered: false,
    },
  ]);

  const [newsAlerts, setNewsAlerts] = useState<NewsAlert[]>([
    {
      id: '1',
      keywords: ['Bitcoin', 'ETF', 'SEC'],
      sources: ['CoinDesk', 'Bloomberg'],
      categories: ['Regulation'],
      enabled: true,
      frequency: 'instant',
      createdAt: new Date(),
    },
    {
      id: '2',
      keywords: ['DeFi', 'hack', 'exploit'],
      sources: [],
      categories: ['Security', 'DeFi'],
      enabled: false,
      frequency: 'hourly',
      createdAt: new Date(),
    },
  ]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const toggleAlert = useCallback((id: string, type: 'price' | 'news') => {
    if (type === 'price') {
      setPriceAlerts(prev => prev.map(alert =>
        alert.id === id ? { ...alert, enabled: !alert.enabled } : alert
      ));
    } else {
      setNewsAlerts(prev => prev.map(alert =>
        alert.id === id ? { ...alert, enabled: !alert.enabled } : alert
      ));
    }
  }, []);

  const deleteAlert = useCallback((id: string, type: 'price' | 'news') => {
    Alert.alert(
      'Delete Alert',
      'Are you sure you want to delete this alert?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (type === 'price') {
              setPriceAlerts(prev => prev.filter(alert => alert.id !== id));
            } else {
              setNewsAlerts(prev => prev.filter(alert => alert.id !== id));
            }
            addTokens(-1, 'Alert deleted');
          },
        },
      ]
    );
  }, [addTokens]);

  const renderPriceAlert = ({ item }: { item: PriceAlert }) => {
    const priceColor = item.condition === 'above' ? '#6B7280' : '#94A3B8';
    const isApproaching = item.currentPrice && (
      (item.condition === 'above' && item.currentPrice >= item.price * 0.95) ||
      (item.condition === 'below' && item.currentPrice <= item.price * 1.05)
    );

    return (
      <View style={[styles.alertCard, { backgroundColor: colors.card }]}>
        <View style={styles.alertHeader}>
          <View style={styles.coinInfo}>
            <View style={[styles.coinIcon, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.coinSymbol, { color: colors.primary }]}>
                {item.symbol}
              </Text>
            </View>
            <View>
              <Text style={[styles.coinName, { color: colors.text }]}>{item.coin}</Text>
              <Text style={[styles.condition, { color: priceColor }]}>
                {item.condition === 'above' ? '↑' : '↓'} {item.condition} ${item.price.toLocaleString()}
              </Text>
            </View>
          </View>
          <Switch
            value={item.enabled}
            onValueChange={() => toggleAlert(item.id, 'price')}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={item.enabled ? '#3B82F6' : '#E2E8F0'}
          />
        </View>
        
        {item.currentPrice && (
          <View style={[styles.currentPrice, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
            <Text style={[styles.currentLabel, { color: colors.textSecondary }]}>
              Current Price:
            </Text>
            <Text style={[styles.currentValue, { color: colors.text }]}>
              ${item.currentPrice.toLocaleString()}
            </Text>
            {isApproaching && (
              <View style={[styles.badge, { backgroundColor: priceColor }]}>
                <Text style={styles.badgeText}>Approaching</Text>
              </View>
            )}
          </View>
        )}
        
        <View style={styles.alertFooter}>
          <Text style={[styles.createdDate, { color: colors.textSecondary }]}>
            Created {format(item.createdAt, 'MMM dd, yyyy')}
          </Text>
          <TouchableOpacity onPress={() => deleteAlert(item.id, 'price')}>
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderNewsAlert = ({ item }: { item: NewsAlert }) => (
    <View style={[styles.alertCard, { backgroundColor: colors.card }]}>
      <View style={styles.alertHeader}>
        <View style={styles.newsInfo}>
          <Ionicons name="newspaper-outline" size={24} color={colors.primary} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            {item.keywords.length > 0 && (
              <View style={styles.tagContainer}>
                {item.keywords.map((keyword, index) => (
                  <View key={index} style={[styles.tag, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.tagText, { color: colors.primary }]}>{keyword}</Text>
                  </View>
                ))}
              </View>
            )}
            <Text style={[styles.frequency, { color: colors.textSecondary }]}>
              {item.frequency === 'instant' ? '⚡ Instant' : 
               item.frequency === 'hourly' ? '🕐 Hourly' : '📅 Daily'} notifications
            </Text>
          </View>
        </View>
        <Switch
          value={item.enabled}
          onValueChange={() => toggleAlert(item.id, 'news')}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={item.enabled ? '#fff' : '#f4f3f4'}
        />
      </View>
      
      {item.sources.length > 0 && (
        <View style={[styles.metaInfo, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
          <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Sources:</Text>
          <Text style={[styles.metaValue, { color: colors.text }]}>
            {item.sources.join(', ')}
          </Text>
        </View>
      )}
      
      {item.categories.length > 0 && (
        <View style={[styles.metaInfo, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
          <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Categories:</Text>
          <Text style={[styles.metaValue, { color: colors.text }]}>
            {item.categories.join(', ')}
          </Text>
        </View>
      )}
      
      <View style={styles.alertFooter}>
        <Text style={[styles.createdDate, { color: colors.textSecondary }]}>
          Created {format(item.createdAt, 'MMM dd, yyyy')}
        </Text>
        <TouchableOpacity onPress={() => deleteAlert(item.id, 'news')}>
          <Ionicons name="trash-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.background }]}>
      <View style={[styles.tabContainer, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'price' && { backgroundColor: colors.primary }
          ]}
          onPress={() => setActiveTab('price')}
        >
          <Ionicons 
            name="trending-up" 
            size={20} 
            color={activeTab === 'price' ? '#FFFFFF' : colors.text}
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'price' ? '#FFFFFF' : colors.text }
          ]}>
            Price Alerts ({priceAlerts.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'news' && { backgroundColor: colors.primary }
          ]}
          onPress={() => setActiveTab('news')}
        >
          <Ionicons 
            name="newspaper" 
            size={20} 
            color={activeTab === 'news' ? '#FFFFFF' : colors.text}
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'news' ? '#FFFFFF' : colors.text }
          ]}>
            News Alerts ({newsAlerts.length})
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.notificationSettings, { backgroundColor: colors.card }]}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="notifications" size={20} color={colors.text} />
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Push Notifications
            </Text>
          </View>
          <Switch
            value={preferences.notifications.priceAlerts}
            onValueChange={(value) => updatePreferences({ 
              notifications: { ...preferences.notifications, priceAlerts: value }
            })}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={preferences.notifications.priceAlerts ? '#3B82F6' : '#E2E8F0'}
          />
        </View>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="mail" size={20} color={colors.text} />
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Email Notifications
            </Text>
          </View>
          <Switch
            value={false}
            onValueChange={() => {}}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={'#E2E8F0'}
          />
        </View>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="phone-portrait" size={20} color={colors.text} />
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Vibration
            </Text>
          </View>
          <Switch
            value={preferences.haptics}
            onValueChange={(value) => updatePreferences({ haptics: value })}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={preferences.haptics ? '#3B82F6' : '#E2E8F0'}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.createButton, { backgroundColor: colors.primary }]}
        onPress={() => {
          addTokens(5, 'New alert created');
          Alert.alert('Create Alert', 'Alert creation will be implemented with API integration');
        }}
      >
        <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
        <Text style={styles.createButtonText}>
          Create New {activeTab === 'price' ? 'Price' : 'News'} Alert
        </Text>
      </TouchableOpacity>
    </View>
  );

  const currentAlerts = activeTab === 'price' ? priceAlerts : newsAlerts;
  const emptyMessage = activeTab === 'price' 
    ? 'Set price alerts to track crypto movements'
    : 'Create news alerts to stay informed';

  return (
    <SafeContainer style={{ backgroundColor: colors.background }}>
      <FlatList
        data={currentAlerts as any}
        renderItem={activeTab === 'price' ? renderPriceAlert : renderNewsAlert as any}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            emoji={activeTab === 'price' ? '📈' : '📰'}
            title={`No ${activeTab === 'price' ? 'Price' : 'News'} Alerts`}
            message={emptyMessage}
            actionText="Create Alert"
            onAction={() => {
              addTokens(5, 'New alert created');
              Alert.alert('Create Alert', 'Alert creation will be implemented with API integration');
            }}
          />
        }
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
    paddingTop: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  notificationSettings: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    paddingBottom: 100,
  },
  alertCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  coinInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  coinIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinSymbol: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  coinName: {
    fontSize: 16,
    fontWeight: '600',
  },
  condition: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  currentPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  currentLabel: {
    fontSize: 14,
  },
  currentValue: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  badge: {
    marginLeft: 'auto',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  newsInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  frequency: {
    fontSize: 14,
  },
  metaInfo: {
    flexDirection: 'row',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  metaLabel: {
    fontSize: 12,
    marginRight: 8,
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  createdDate: {
    fontSize: 12,
  },
});

export default AlertsScreen;