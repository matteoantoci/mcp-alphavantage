// src/cacheService.ts
import { LRUCache } from 'lru-cache';
import { getToolTTL } from './cacheConfig.js';

// Define the cache options
const options = {
  max: 500, // Maximum number of items in the cache
  ttl: 1000 * 60 * 60, // Default TTL in milliseconds (1 hour)
};

// Create a new LRU cache instance
const cache = new LRUCache(options);

export const getFromCache = (toolName: string, params: any): any | undefined => {
  const cacheKey = generateCacheKey(toolName, params);
  return cache.get(cacheKey);
};

export const setToCache = (toolName: string, params: any, data: any): void => {
  const cacheKey = generateCacheKey(toolName, params);
  const ttl = getToolTTL(toolName);
  cache.set(cacheKey, data, { ttl });
};

const generateCacheKey = (toolName: string, params: any): string => {
  // Sort parameters alphabetically for consistent key generation
  const sortedParams = Object.fromEntries(Object.entries(params).sort());
  return `${toolName}::${JSON.stringify(sortedParams)}`;
};

export const clearCache = (): void => {
  cache.clear();
};
