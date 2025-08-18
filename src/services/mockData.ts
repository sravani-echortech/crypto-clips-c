import { 
  NewsArticle, 
  Coin, 
  Category, 
  Source, 
  Reward, 
  TokenTransaction,
  User 
} from '@/types';

export const MOCK_COINS: Coin[] = [
  {
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    logo: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    currentPrice: 43250.80,
    priceChange24h: 1890.45,
    priceChangePercentage24h: 4.57,
    marketCap: 850234567890,
    rank: 1,
  },
  {
    id: 'ethereum',
    symbol: 'ETH',
    name: 'Ethereum',
    logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    currentPrice: 2640.32,
    priceChange24h: -85.67,
    priceChangePercentage24h: -3.14,
    marketCap: 318456789012,
    rank: 2,
  },
  {
    id: 'binance-coin',
    symbol: 'BNB',
    name: 'Binance Coin',
    logo: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
    currentPrice: 315.67,
    priceChange24h: 12.45,
    priceChangePercentage24h: 4.10,
    marketCap: 48234567890,
    rank: 3,
  },
  {
    id: 'solana',
    symbol: 'SOL',
    name: 'Solana',
    logo: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
    currentPrice: 98.45,
    priceChange24h: 7.23,
    priceChangePercentage24h: 7.94,
    marketCap: 42345678901,
    rank: 4,
  },
  {
    id: 'cardano',
    symbol: 'ADA',
    name: 'Cardano',
    logo: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
    currentPrice: 0.487,
    priceChange24h: -0.023,
    priceChangePercentage24h: -4.51,
    marketCap: 17234567890,
    rank: 5,
  },
];

export const MOCK_CATEGORIES: Category[] = [
  { id: 'bitcoin', name: 'Bitcoin', slug: 'bitcoin', icon: '₿', color: '#f7931a' },
  { id: 'altcoins', name: 'Altcoins', slug: 'altcoins', icon: '🪙', color: '#6366f1' },
  { id: 'defi', name: 'DeFi', slug: 'defi', icon: '🏦', color: '#10b981' },
  { id: 'nft', name: 'NFTs', slug: 'nft', icon: '🖼️', color: '#8b5cf6' },
  { id: 'regulation', name: 'Regulation', slug: 'regulation', icon: '⚖️', color: '#ef4444' },
  { id: 'exchanges', name: 'Exchanges', slug: 'exchanges', icon: '💱', color: '#f59e0b' },
  { id: 'tech', name: 'Technology', slug: 'tech', icon: '💻', color: '#3b82f6' },
  { id: 'analysis', name: 'Analysis', slug: 'analysis', icon: '📊', color: '#06b6d4' },
];

export const MOCK_SOURCES: Source[] = [
  {
    id: 'coindesk',
    name: 'CoinDesk',
    domain: 'coindesk.com',
    logo: 'https://www.coindesk.com/favicon.ico',
    credibilityScore: 95,
    description: 'Leading cryptocurrency news platform',
  },
  {
    id: 'cointelegraph',
    name: 'Cointelegraph',
    domain: 'cointelegraph.com',
    logo: 'https://cointelegraph.com/favicon.ico',
    credibilityScore: 92,
    description: 'Independent cryptocurrency news',
  },
  {
    id: 'decrypt',
    name: 'Decrypt',
    domain: 'decrypt.co',
    logo: 'https://decrypt.co/favicon.ico',
    credibilityScore: 89,
    description: 'Crypto and blockchain media',
  },
  {
    id: 'theblock',
    name: 'The Block',
    domain: 'theblock.co',
    logo: 'https://www.theblock.co/favicon.ico',
    credibilityScore: 94,
    description: 'Institutional crypto news',
  },
];

export const MOCK_ARTICLES: NewsArticle[] = [
  {
    id: '1',
    sourceId: 'coindesk',
    sourceName: 'CoinDesk',
    sourceAvatar: 'https://www.coindesk.com/favicon.ico',
    headline: 'Bitcoin Surges Past $43K as Institutional Interest Grows',
    summary: 'Bitcoin price reaches new monthly high amid increasing institutional adoption and positive regulatory developments in major markets.',
    content: 'Full article content would go here...',
    url: 'https://www.coindesk.com/markets/2024/bitcoin-surges-past-43k',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    coins: [MOCK_COINS[0]], // Bitcoin
    categories: [MOCK_CATEGORIES[0], MOCK_CATEGORIES[7]], // Bitcoin, Analysis
    thumbnail: 'https://picsum.photos/400/200?random=1',
    reactions: { bull: 234, bear: 45, neutral: 67 },
    userReaction: 'bull',
    isBookmarked: true,
    viewCount: 1523,
    readTime: 3,
  },
  {
    id: '2',
    sourceId: 'cointelegraph',
    sourceName: 'Cointelegraph',
    sourceAvatar: 'https://cointelegraph.com/favicon.ico',
    headline: 'Ethereum Layer 2 Solutions See Record TVL Growth',
    summary: 'Total value locked in Ethereum Layer 2 protocols reaches all-time high as scaling solutions gain traction among users and developers.',
    content: 'Full article content would go here...',
    url: 'https://cointelegraph.com/news/ethereum-layer-2-record-tvl',
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    coins: [MOCK_COINS[1]], // Ethereum
    categories: [MOCK_CATEGORIES[1], MOCK_CATEGORIES[6]], // Altcoins, Tech
    thumbnail: 'https://picsum.photos/400/200?random=2',
    reactions: { bull: 156, bear: 23, neutral: 89 },
    viewCount: 892,
    readTime: 4,
  },
  {
    id: '3',
    sourceId: 'decrypt',
    sourceName: 'Decrypt',
    sourceAvatar: 'https://decrypt.co/favicon.ico',
    headline: 'New DeFi Protocol Launches with $50M TVL in First Week',
    summary: 'Innovative decentralized finance protocol attracts significant liquidity following its mainnet launch, offering competitive yields for liquidity providers.',
    content: 'Full article content would go here...',
    url: 'https://decrypt.co/defi-protocol-launches-50m-tvl',
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    coins: [MOCK_COINS[1], MOCK_COINS[3]], // Ethereum, Solana
    categories: [MOCK_CATEGORIES[2]], // DeFi
    thumbnail: 'https://picsum.photos/400/200?random=3',
    reactions: { bull: 98, bear: 12, neutral: 34 },
    viewCount: 567,
    readTime: 5,
  },
  {
    id: '4',
    sourceId: 'theblock',
    sourceName: 'The Block',
    sourceAvatar: 'https://www.theblock.co/favicon.ico',
    headline: 'Major Exchange Announces New Crypto Trading Pairs',
    summary: 'Leading cryptocurrency exchange adds support for several new trading pairs, expanding options for traders and institutional clients.',
    content: 'Full article content would go here...',
    url: 'https://www.theblock.co/exchange-announces-new-pairs',
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    coins: [MOCK_COINS[2], MOCK_COINS[4]], // BNB, ADA
    categories: [MOCK_CATEGORIES[5]], // Exchanges
    thumbnail: 'https://picsum.photos/400/200?random=4',
    reactions: { bull: 76, bear: 8, neutral: 45 },
    viewCount: 423,
    readTime: 2,
  },
  {
    id: '5',
    sourceId: 'coindesk',
    sourceName: 'CoinDesk',
    sourceAvatar: 'https://www.coindesk.com/favicon.ico',
    headline: 'Regulatory Clarity Boosts Crypto Market Sentiment',
    summary: 'Clear regulatory guidelines from major jurisdictions provide confidence boost to cryptocurrency markets and institutional investors.',
    content: 'Full article content would go here...',
    url: 'https://www.coindesk.com/policy/regulatory-clarity-boosts-sentiment',
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    coins: [],
    categories: [MOCK_CATEGORIES[4]], // Regulation
    thumbnail: 'https://picsum.photos/400/200?random=5',
    reactions: { bull: 189, bear: 34, neutral: 67 },
    viewCount: 1234,
    readTime: 4,
  },
];

export const MOCK_REWARDS: Reward[] = [
  {
    id: '1',
    title: 'CryptoClips Sticker Pack',
    description: 'Exclusive digital stickers for your collection',
    image: 'https://picsum.photos/200/200?random=10',
    tokenCost: 50,
    category: 'sticker',
    inventory: 100,
    isAvailable: true,
    terms: 'Digital stickers will be delivered to your account within 24 hours.',
  },
  {
    id: '2',
    title: 'Dark Mode Theme',
    description: 'Premium dark theme with custom colors',
    image: 'https://picsum.photos/200/200?random=11',
    tokenCost: 150,
    category: 'theme',
    inventory: undefined, // unlimited
    isAvailable: true,
    terms: 'Theme will be automatically applied to your account.',
  },
  {
    id: '3',
    title: 'Monthly Raffle Ticket',
    description: 'Enter our monthly prize raffle for exclusive rewards',
    image: 'https://picsum.photos/200/200?random=12',
    tokenCost: 200,
    category: 'raffle',
    inventory: 1000,
    isAvailable: true,
    terms: 'Raffle drawing occurs on the last day of each month.',
  },
  {
    id: '4',
    title: 'CryptoClips T-Shirt',
    description: 'Official branded merchandise shipped to your door',
    image: 'https://picsum.photos/200/200?random=13',
    tokenCost: 500,
    category: 'merch',
    inventory: 25,
    isAvailable: true,
    terms: 'Please allow 2-3 weeks for shipping. Size selection required.',
  },
  {
    id: '5',
    title: 'Premium Features (1 Month)',
    description: 'Access to premium analytics and features',
    image: 'https://picsum.photos/200/200?random=14',
    tokenCost: 800,
    category: 'premium',
    inventory: undefined,
    isAvailable: true,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    terms: 'Premium features activated immediately for 30 days.',
  },
];

export const MOCK_TOKEN_TRANSACTIONS: TokenTransaction[] = [
  {
    id: '1',
    type: 'earned',
    amount: 10,
    reason: 'Daily app open',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
  },
  {
    id: '2',
    type: 'earned',
    amount: 2,
    reason: 'Article reaction',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
  },
  {
    id: '3',
    type: 'earned',
    amount: 5,
    reason: 'Shared article',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
  },
  {
    id: '4',
    type: 'spent',
    amount: -50,
    reason: 'Redeemed: CryptoClips Sticker Pack',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: '5',
    type: 'earned',
    amount: 50,
    reason: 'Weekly streak milestone',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
];

export const MOCK_USER: User = {
  id: 'user123',
  email: 'user@cryptoclips.com',
  displayName: 'Crypto Enthusiast',
  avatar: 'https://picsum.photos/100/100?random=user',
  createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
  lastActiveAt: new Date(),
};

// Search suggestions
export const MOCK_SEARCH_SUGGESTIONS = [
  'Bitcoin price prediction',
  'Ethereum 2.0 update',
  'DeFi protocols',
  'NFT marketplace',
  'Solana ecosystem',
  'Regulatory news',
  'Mining difficulty',
  'Staking rewards',
];

export const MOCK_TRENDING_QUERIES = [
  'Bitcoin ETF approval',
  'Ethereum layer 2',
  'Central bank digital currency',
  'Cryptocurrency regulation',
  'DeFi security',
];