// src/alphaVantageClient.ts
import { LRUCache } from 'lru-cache';
import { getToolTTL } from './cacheConfig.js';

export type AlphaVantageApiParams = {
  apiFunction: string; // e.g., 'GLOBAL_QUOTE', 'TIME_SERIES_INTRADAY'
  [key: string]: string | number | boolean | undefined;
};

export type AlphaVantageClient = {
  fetchApiData: (params: AlphaVantageApiParams) => Promise<any>;
};

type CacheOptions = {
  max: number;
  defaultTTL: number;
};

export const createAlphaVantageClient = (
  apiKey: string,
  cacheOptions: CacheOptions = { max: 500, defaultTTL: 60 * 60 * 1000 }
): AlphaVantageClient => {
  const cache = new LRUCache<string, any>({
    max: cacheOptions.max,
    ttl: cacheOptions.defaultTTL,
  });

  const generateCacheKey = (params: AlphaVantageApiParams): string => {
    const { apiFunction, ...otherParams } = params;
    // Only include params that are actually sent to the API
    const sortedParams = Object.fromEntries(Object.entries(otherParams).sort());
    return `${apiFunction}::${JSON.stringify(sortedParams)}`;
  };

  const fetchApiData = async (params: AlphaVantageApiParams): Promise<any> => {
    const { apiFunction, ...otherParams } = params;
    if (!apiFunction) throw new Error('apiFunction is required');

    const cacheKey = generateCacheKey(params);
    const ttl = getToolTTL(apiFunction);

    // Check cache
    const cached = cache.get(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    // Build query params for Alpha Vantage API
    const baseUrl = 'https://www.alphavantage.co/query';
    const urlParams = new URLSearchParams({
      function: apiFunction,
      apikey: apiKey,
      datatype: 'json',
    });
    for (const [k, v] of Object.entries(otherParams)) {
      if (v !== undefined) urlParams.append(k, String(v));
    }
    const url = `${baseUrl}?${urlParams.toString()}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Alpha Vantage API request failed: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();

    // Alpha Vantage error handling
    if (data['Error Message']) {
      throw new Error(`Alpha Vantage API Error: ${data['Error Message']}`);
    }
    if (data['Note']) {
      // Still cache the result, but warn
      console.warn(`Alpha Vantage API Note: ${data['Note']}`);
    }

    cache.set(cacheKey, data, { ttl });
    return data;
  };

  return {
    fetchApiData,
  };
};
