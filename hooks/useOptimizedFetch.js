"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

// Simple in-memory cache for API responses
const apiCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useOptimizedFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    // Check cache first (unless force refresh)
    const cacheKey = `${url}?${JSON.stringify(options)}`;
    const cached = apiCache.get(cacheKey);
    
    if (!forceRefresh && cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setData(cached.data);
      setLoading(false);
      return cached.data;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        ...options,
        signal: abortControllerRef.current.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Cache the result
      apiCache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      });

      setData(result);
      setLoading(false);
      return result;
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Request was aborted');
        return;
      }
      
      console.error('Fetch error:', err);
      setError(err);
      setLoading(false);
      throw err;
    }
  }, [url, JSON.stringify(options)]);

  useEffect(() => {
    fetchData();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  // Clear cache function
  const clearCache = useCallback(() => {
    const cacheKey = `${url}?${JSON.stringify(options)}`;
    apiCache.delete(cacheKey);
  }, [url, JSON.stringify(options)]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(true),
    clearCache,
  };
}

// Global cache management
export const clearAllCache = () => {
  apiCache.clear();
};

export const getCacheSize = () => {
  return apiCache.size;
};
