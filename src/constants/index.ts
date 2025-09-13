// ============================================================================
// CATEGORIES
// ============================================================================

export const CATEGORIES = [
  { id: 'all', name: 'All', slug: 'all', icon: '🌐' },
  { id: 'bitcoin', name: 'Bitcoin', slug: 'BTC', icon: '₿' },
  { id: 'ethereum', name: 'Ethereum', slug: 'ETH', icon: '🪙' },
  { id: 'solana', name: 'Solana', slug: 'SOL', icon: '🪙' },
  { id: 'trading', name: 'Trading', slug: 'TRADING', icon: '📊' },
  { id: 'market', name: 'Market', slug: 'MARKET', icon: '📈' },
  { id: 'cryptocurrency', name: 'Cryptocurrency', slug: 'CRYPTOCURRENCY', icon: '🪙' },
  { id: 'business', name: 'Business', slug: 'BUSINESS', icon: '💼' },
  { id: 'regulation', name: 'Regulation', slug: 'REGULATION', icon: '⚖️' },
  { id: 'exchanges', name: 'Exchanges', slug: 'EXCHANGE', icon: '💱' },
  { id: 'blockchain', name: 'Blockchain', slug: 'BLOCKCHAIN', icon: '🔗' },
];

// ============================================================================
// THEMES
// ============================================================================

export const THEMES = {
  // Clean Light Theme for News App
  light: {
    background: '#FFFFFF', // Pure white background
    surface: '#F8FAFC', // Very light gray surface
    card: '#FFFFFF', // White cards
    text: '#1E293B', // Dark slate text
    textSecondary: '#64748B', // Medium gray secondary text
    border: '#E2E8F0', // Light gray borders
    primary: '#3B82F6', // Blue primary
    primaryGradient: ['#3B82F6', '#2563EB'],
    secondary: '#10B981', // Green secondary
    secondaryGradient: ['#10B981', '#059669'],
    success: '#10B981', // Green success
    successGradient: ['#10B981', '#059669'],
    danger: '#EF4444', // Red danger
    dangerGradient: ['#EF4444', '#DC2626'],
    error: '#EF4444',
    warning: '#F59E0B', // Orange warning
    accent: '#F59E0B', // Orange accent
    accentGradient: ['#F59E0B', '#D97706'],
    cardShadow: 'rgba(0, 0, 0, 0.1)',
    cardBorder: '#E2E8F0',
    priceUp: '#10B981', // Green for positive
    priceDown: '#EF4444', // Red for negative
  },
  
  // Modern Dark Theme for Crypto App
  dark: {
    background: '#0F172A', // Dark slate background
    surface: '#1E293B', // Darker surface
    card: '#334155', // Dark cards
    text: '#F8FAFC', // Light text
    textSecondary: '#94A3B8', // Muted light text
    border: '#475569', // Dark borders
    primary: '#3B82F6', // Blue primary (same as light)
    primaryGradient: ['#3B82F6', '#2563EB'],
    secondary: '#10B981', // Green secondary (same as light)
    secondaryGradient: ['#10B981', '#059669'],
    success: '#10B981', // Green success
    successGradient: ['#10B981', '#059669'],
    danger: '#EF4444', // Red danger
    dangerGradient: ['#EF4444', '#DC2626'],
    error: '#EF4444',
    warning: '#F59E0B', // Orange warning
    accent: '#F59E0B', // Orange accent
    accentGradient: ['#F59E0B', '#D97706'],
    cardShadow: 'rgba(0, 0, 0, 0.3)',
    cardBorder: '#475569',
    priceUp: '#10B981', // Green for positive
    priceDown: '#EF4444', // Red for negative
  },
};

export const THEME_METADATA = {
  light: {
    name: 'Light',
    description: 'Clean and readable light theme',
    category: 'Classic',
    isDark: false,
  },
  dark: {
    name: 'Dark',
    description: 'Modern dark theme for crypto trading',
    category: 'Modern',
    isDark: true,
  },
};

// ============================================================================
// MOCK CONFIGURATION
// ============================================================================

export const MOCK_CONFIG = {
  USE_MOCK_DATA: true,
  MOCK_DELAY: 500,
  MOCK_ERROR_RATE: 0.05, // 5% chance of error for testing
};
