import { 
  NewsArticle, 
  Coin, 
  Category
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
  { id: 'bitcoin', name: 'Bitcoin', slug: 'bitcoin', icon: '₿', color: '#3B82F6' },
  { id: 'altcoins', name: 'Altcoins', slug: 'altcoins', icon: '🪙', color: '#8B5CF6' },
  { id: 'defi', name: 'DeFi', slug: 'defi', icon: '🏦', color: '#6B7280' },
  { id: 'nft', name: 'NFTs', slug: 'nft', icon: '🖼️', color: '#94A3B8' },
  { id: 'regulation', name: 'Regulation', slug: 'regulation', icon: '⚖️', color: '#ef4444' },
  { id: 'exchanges', name: 'Exchanges', slug: 'exchanges', icon: '💱', color: '#64748B' },
  { id: 'tech', name: 'Technology', slug: 'tech', icon: '💻', color: '#3b82f6' },
  { id: 'analysis', name: 'Analysis', slug: 'analysis', icon: '📊', color: '#06b6d4' },
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
  {
    id: '6',
    sourceId: 'cointelegraph',
    sourceName: 'Cointelegraph',
    sourceAvatar: 'https://cointelegraph.com/favicon.ico',
    headline: 'Solana Network Achieves 100K TPS Milestone',
    summary: 'Solana blockchain reaches unprecedented transaction throughput, demonstrating its scalability potential for mainstream adoption.',
    content: 'Full article content would go here...',
    url: 'https://cointelegraph.com/news/solana-100k-tps-milestone',
    publishedAt: new Date(Date.now() - 14 * 60 * 60 * 1000), // 14 hours ago
    updatedAt: new Date(Date.now() - 14 * 60 * 60 * 1000),
    coins: [MOCK_COINS[3]], // Solana
    categories: [MOCK_CATEGORIES[1], MOCK_CATEGORIES[6]], // Altcoins, Tech
    thumbnail: 'https://picsum.photos/400/200?random=6',
    reactions: { bull: 312, bear: 45, neutral: 78 },
    viewCount: 2341,
    readTime: 3,
  },
  {
    id: '7',
    sourceId: 'decrypt',
    sourceName: 'Decrypt',
    sourceAvatar: 'https://decrypt.co/favicon.ico',
    headline: 'NFT Market Sees Surge in Gaming-Related Collections',
    summary: 'Gaming-focused NFT collections dominate trading volume as play-to-earn games gain popularity among mainstream audiences.',
    content: 'Full article content would go here...',
    url: 'https://decrypt.co/nft-gaming-collections-surge',
    publishedAt: new Date(Date.now() - 16 * 60 * 60 * 1000), // 16 hours ago
    updatedAt: new Date(Date.now() - 16 * 60 * 60 * 1000),
    coins: [MOCK_COINS[1]], // Ethereum
    categories: [MOCK_CATEGORIES[3]], // NFTs
    thumbnail: 'https://picsum.photos/400/200?random=7',
    reactions: { bull: 89, bear: 23, neutral: 56 },
    viewCount: 987,
    readTime: 4,
  },
  {
    id: '8',
    sourceId: 'theblock',
    sourceName: 'The Block',
    sourceAvatar: 'https://www.theblock.co/favicon.ico',
    headline: 'Central Bank Digital Currency Pilot Programs Expand Globally',
    summary: 'Major economies accelerate CBDC development as digital payment systems become increasingly important in global finance.',
    content: 'Full article content would go here...',
    url: 'https://www.theblock.co/cbdc-pilot-programs-expand',
    publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000), // 18 hours ago
    updatedAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
    coins: [],
    categories: [MOCK_CATEGORIES[4], MOCK_CATEGORIES[6]], // Regulation, Tech
    thumbnail: 'https://picsum.photos/400/200?random=8',
    reactions: { bull: 145, bear: 67, neutral: 123 },
    viewCount: 1567,
    readTime: 5,
  },
  {
    id: '9',
    sourceId: 'coindesk',
    sourceName: 'CoinDesk',
    sourceAvatar: 'https://www.coindesk.com/favicon.ico',
    headline: 'Cardano Smart Contracts Show Promising Growth Metrics',
    summary: 'Cardano network demonstrates strong development activity with increasing smart contract deployments and user adoption.',
    content: 'Full article content would go here...',
    url: 'https://www.coindesk.com/markets/cardano-smart-contracts-growth',
    publishedAt: new Date(Date.now() - 20 * 60 * 60 * 1000), // 20 hours ago
    updatedAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
    coins: [MOCK_COINS[4]], // Cardano
    categories: [MOCK_CATEGORIES[1], MOCK_CATEGORIES[6]], // Altcoins, Tech
    thumbnail: 'https://picsum.photos/400/200?random=9',
    reactions: { bull: 234, bear: 89, neutral: 67 },
    viewCount: 1892,
    readTime: 4,
  },
  {
    id: '10',
    sourceId: 'cointelegraph',
    sourceName: 'Cointelegraph',
    sourceAvatar: 'https://cointelegraph.com/favicon.ico',
    headline: 'Binance Coin Surges on New Exchange Features Launch',
    summary: 'BNB price rallies as Binance announces innovative trading features and enhanced security measures for institutional clients.',
    content: 'Full article content would go here...',
    url: 'https://cointelegraph.com/news/binance-coin-surges-new-features',
    publishedAt: new Date(Date.now() - 22 * 60 * 60 * 1000), // 22 hours ago
    updatedAt: new Date(Date.now() - 22 * 60 * 60 * 1000),
    coins: [MOCK_COINS[2]], // BNB
    categories: [MOCK_CATEGORIES[5]], // Exchanges
    thumbnail: 'https://picsum.photos/400/200?random=10',
    reactions: { bull: 178, bear: 34, neutral: 89 },
    viewCount: 1345,
    readTime: 3,
  },
];

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
