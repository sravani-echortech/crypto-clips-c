import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

export const formatPrice = (price: number): string => {
  if (price < 0.01) {
    return `$${price.toFixed(6)}`;
  } else if (price < 1) {
    return `$${price.toFixed(4)}`;
  } else if (price < 100) {
    return `$${price.toFixed(2)}`;
  } else if (price < 1000000) {
    return `$${price.toLocaleString()}`;
  } else {
    return `$${(price / 1000000).toFixed(2)}M`;
  }
};

export const formatPercentage = (percentage: number, showSign: boolean = true): string => {
  const sign = showSign && percentage >= 0 ? '+' : '';
  return `${sign}${percentage.toFixed(2)}%`;
};

export const formatMarketCap = (marketCap: number): string => {
  if (marketCap >= 1e12) {
    return `$${(marketCap / 1e12).toFixed(2)}T`;
  } else if (marketCap >= 1e9) {
    return `$${(marketCap / 1e9).toFixed(2)}B`;
  } else if (marketCap >= 1e6) {
    return `$${(marketCap / 1e6).toFixed(2)}M`;
  } else if (marketCap >= 1e3) {
    return `$${(marketCap / 1e3).toFixed(2)}K`;
  } else {
    return `$${marketCap.toFixed(2)}`;
  }
};

export const formatTokenCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  } else {
    return count.toString();
  }
};

export const formatTimeAgo = (date: Date): string => {
  if (isToday(date)) {
    return formatDistanceToNow(date, { addSuffix: true });
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else {
    return format(date, 'MMM d');
  }
};

export const formatReadTime = (minutes: number): string => {
  if (minutes < 1) {
    return '< 1 min read';
  } else if (minutes === 1) {
    return '1 min read';
  } else {
    return `${minutes} min read`;
  }
};

export const formatViewCount = (views: number): string => {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M views`;
  } else if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K views`;
  } else if (views === 1) {
    return '1 view';
  } else {
    return `${views} views`;
  }
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export default {
  formatPrice,
  formatPercentage,
  formatMarketCap,
  formatTokenCount,
  formatTimeAgo,
  formatReadTime,
  formatViewCount,
  truncateText,
  formatCurrency,
};