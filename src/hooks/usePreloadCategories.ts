import { useEffect, useRef } from 'react';
import { CATEGORIES } from '@/constants';
import ApiService from '@/services/api';

interface PreloadCache {
  [categoryId: string]: {
    articles: any[];
    timestamp: number;
  };
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const preloadCache: PreloadCache = {};

export const usePreloadCategories = (currentCategoryId: string) => {
  const preloadingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Find current category index
    const currentIndex = CATEGORIES.findIndex(c => c.id === currentCategoryId);
    if (currentIndex === -1) return;

    // Determine adjacent categories to preload
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : null;
    const nextIndex = currentIndex < CATEGORIES.length - 1 ? currentIndex + 1 : null;

    const categoriesToPreload = [];
    if (prevIndex !== null) categoriesToPreload.push(CATEGORIES[prevIndex]);
    if (nextIndex !== null) categoriesToPreload.push(CATEGORIES[nextIndex]);

    // Preload adjacent categories
    categoriesToPreload.forEach(category => {
      // Skip if already preloading or cached recently
      if (preloadingRef.current.has(category.id)) return;
      
      const cached = preloadCache[category.id];
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) return;

      // Mark as preloading
      preloadingRef.current.add(category.id);

      // Preload in background (don't await)
      const filters = category.id === 'all' 
        ? {
            categories: [],
            coins: [],
            sources: [],
            highImpactOnly: false,
            timeRange: 'all' as const
          }
        : {
            categories: [category.slug],
            coins: [],
            sources: [],
            highImpactOnly: false,
            timeRange: 'all' as const
          };

      ApiService.getFeed(filters)
        .then(response => {
          preloadCache[category.id] = {
            articles: response.articles,
            timestamp: Date.now(),
          };
          console.log(`✅ Preloaded ${response.articles.length} articles for ${category.name}`);
        })
        .catch(error => {
          console.error(`Failed to preload ${category.name}:`, error);
        })
        .finally(() => {
          preloadingRef.current.delete(category.id);
        });
    });
  }, [currentCategoryId]);

  // Return function to get preloaded data
  const getPreloadedData = (categoryId: string) => {
    const cached = preloadCache[categoryId];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`📦 Using preloaded data for ${categoryId}`);
      return cached.articles;
    }
    return null;
  };

  return { getPreloadedData };
};