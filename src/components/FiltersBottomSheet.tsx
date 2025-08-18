import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useStore } from '@/store';

interface FiltersBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
}

export interface FilterOptions {
  categories: string[];
  sources: string[];
  timeRange: 'all' | '1h' | '24h' | '7d' | '30d';
  sentiment: 'all' | 'bullish' | 'bearish' | 'neutral';
  readStatus: 'all' | 'unread' | 'read';
  bookmarked: boolean;
  hasVideo: boolean;
  minReadTime: number;
  maxReadTime: number;
}

const FiltersBottomSheet: React.FC<FiltersBottomSheetProps> = ({
  isVisible,
  onClose,
  onApply,
}) => {
  const { colors } = useTheme();
  const { preferences } = useStore();

  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    sources: [],
    timeRange: 'all',
    sentiment: 'all',
    readStatus: 'all',
    bookmarked: false,
    hasVideo: false,
    minReadTime: 0,
    maxReadTime: 15,
  });

  const categories = [
    'Market Analysis',
    'DeFi',
    'NFTs',
    'Regulation',
    'Technology',
    'Trading',
    'Mining',
    'Exchanges',
    'Web3',
    'Metaverse',
  ];

  const sources = [
    'CoinDesk',
    'CoinTelegraph',
    'The Block',
    'Decrypt',
    'CryptoSlate',
    'Bloomberg',
    'Reuters',
    'Bitcoin Magazine',
  ];

  const timeRanges = [
    { label: 'All Time', value: 'all' },
    { label: 'Last Hour', value: '1h' },
    { label: 'Last 24h', value: '24h' },
    { label: 'Last 7 Days', value: '7d' },
    { label: 'Last 30 Days', value: '30d' },
  ];

  const sentiments = [
    { label: 'All', value: 'all', icon: 'analytics' },
    { label: 'Bullish', value: 'bullish', icon: 'trending-up', color: '#4CAF50' },
    { label: 'Bearish', value: 'bearish', icon: 'trending-down', color: '#F44336' },
    { label: 'Neutral', value: 'neutral', icon: 'remove', color: '#9E9E9E' },
  ];

  const toggleCategory = (category: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category],
    }));
  };

  const toggleSource = (source: string) => {
    setFilters(prev => ({
      ...prev,
      sources: prev.sources.includes(source)
        ? prev.sources.filter(s => s !== source)
        : [...prev.sources, source],
    }));
  };

  const handleReset = () => {
    setFilters({
      categories: [],
      sources: [],
      timeRange: 'all',
      sentiment: 'all',
      readStatus: 'all',
      bookmarked: false,
      hasVideo: false,
      minReadTime: 0,
      maxReadTime: 15,
    });
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const activeFiltersCount = 
    filters.categories.length + 
    filters.sources.length + 
    (filters.timeRange !== 'all' ? 1 : 0) +
    (filters.sentiment !== 'all' ? 1 : 0) +
    (filters.readStatus !== 'all' ? 1 : 0) +
    (filters.bookmarked ? 1 : 0) +
    (filters.hasVideo ? 1 : 0);

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection="down"
      style={styles.modal}
      backdropOpacity={0.5}
      propagateSwipe
    >
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        <View style={styles.handle}>
          <View style={[styles.handleBar, { backgroundColor: colors.border }]} />
        </View>

        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Filters</Text>
          {activeFiltersCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeText}>{activeFiltersCount}</Text>
            </View>
          )}
          <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
            <Text style={[styles.resetText, { color: colors.primary }]}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
          {/* Time Range */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Time Range</Text>
            <View style={styles.optionsRow}>
              {timeRanges.map(range => (
                <TouchableOpacity
                  key={range.value}
                  style={[
                    styles.chip,
                    { 
                      backgroundColor: filters.timeRange === range.value 
                        ? colors.primary 
                        : colors.background,
                      borderColor: colors.border,
                    }
                  ]}
                  onPress={() => setFilters(prev => ({ ...prev, timeRange: range.value as any }))}
                >
                  <Text style={[
                    styles.chipText,
                    { color: filters.timeRange === range.value ? '#fff' : colors.text }
                  ]}>
                    {range.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sentiment */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Sentiment</Text>
            <View style={styles.optionsRow}>
              {sentiments.map(sentiment => (
                <TouchableOpacity
                  key={sentiment.value}
                  style={[
                    styles.sentimentChip,
                    { 
                      backgroundColor: filters.sentiment === sentiment.value 
                        ? (sentiment.color || colors.primary)
                        : colors.background,
                      borderColor: sentiment.color || colors.border,
                    }
                  ]}
                  onPress={() => setFilters(prev => ({ ...prev, sentiment: sentiment.value as any }))}
                >
                  <Ionicons 
                    name={sentiment.icon as any} 
                    size={16} 
                    color={filters.sentiment === sentiment.value ? '#fff' : (sentiment.color || colors.text)}
                  />
                  <Text style={[
                    styles.chipText,
                    { color: filters.sentiment === sentiment.value ? '#fff' : colors.text }
                  ]}>
                    {sentiment.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Categories */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Categories</Text>
            <View style={styles.optionsGrid}>
              {categories.map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.chip,
                    { 
                      backgroundColor: filters.categories.includes(category)
                        ? colors.primary 
                        : colors.background,
                      borderColor: colors.border,
                    }
                  ]}
                  onPress={() => toggleCategory(category)}
                >
                  <Text style={[
                    styles.chipText,
                    { color: filters.categories.includes(category) ? '#fff' : colors.text }
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sources */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Sources</Text>
            <View style={styles.optionsGrid}>
              {sources.map(source => (
                <TouchableOpacity
                  key={source}
                  style={[
                    styles.chip,
                    { 
                      backgroundColor: filters.sources.includes(source)
                        ? colors.primary 
                        : colors.background,
                      borderColor: colors.border,
                    }
                  ]}
                  onPress={() => toggleSource(source)}
                >
                  <Text style={[
                    styles.chipText,
                    { color: filters.sources.includes(source) ? '#fff' : colors.text }
                  ]}>
                    {source}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Additional Filters */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Additional Filters</Text>
            
            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Ionicons name="bookmark" size={20} color={colors.text} />
                <Text style={[styles.toggleLabel, { color: colors.text }]}>
                  Bookmarked Only
                </Text>
              </View>
              <Switch
                value={filters.bookmarked}
                onValueChange={(value) => setFilters(prev => ({ ...prev, bookmarked: value }))}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={filters.bookmarked ? '#fff' : '#f4f3f4'}
              />
            </View>

            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Ionicons name="videocam" size={20} color={colors.text} />
                <Text style={[styles.toggleLabel, { color: colors.text }]}>
                  Has Video
                </Text>
              </View>
              <Switch
                value={filters.hasVideo}
                onValueChange={(value) => setFilters(prev => ({ ...prev, hasVideo: value }))}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={filters.hasVideo ? '#fff' : '#f4f3f4'}
              />
            </View>

            <View style={styles.readStatusContainer}>
              <Text style={[styles.subLabel, { color: colors.textSecondary }]}>Read Status</Text>
              <View style={styles.optionsRow}>
                {['all', 'unread', 'read'].map(status => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.chip,
                      { 
                        backgroundColor: filters.readStatus === status 
                          ? colors.primary 
                          : colors.background,
                        borderColor: colors.border,
                      }
                    ]}
                    onPress={() => setFilters(prev => ({ ...prev, readStatus: status as any }))}
                  >
                    <Text style={[
                      styles.chipText,
                      { color: filters.readStatus === status ? '#fff' : colors.text }
                    ]}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.background }]}
            onPress={onClose}
          >
            <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.applyButton, { backgroundColor: colors.primary }]}
            onPress={handleApply}
          >
            <Text style={[styles.buttonText, styles.applyButtonText]}>
              Apply Filters
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  handle: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  badge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  resetButton: {
    marginLeft: 'auto',
  },
  resetText: {
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  sentimentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleLabel: {
    fontSize: 16,
  },
  readStatusContainer: {
    marginTop: 8,
  },
  subLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButton: {
    flex: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  applyButtonText: {
    color: '#fff',
  },
});

export default FiltersBottomSheet;