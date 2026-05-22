"use client";
import { useEffect, useState, useCallback } from 'react';

interface UseOptimizedFetchOptions {
  cache?: RequestCache;
  revalidateOnFocus?: boolean;
  dedupingInterval?: number;
}

export function useOptimizedFetch<T = any>(url: string, options: UseOptimizedFetchOptions = {}) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const {
    cache = 'force-cache',
    revalidateOnFocus = false,
    dedupingInterval = 60000, // 1 minute
  } = options;

  const fetchData = useCallback(async () => {
    if (!url) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        cache,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown fetch error'));
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [url, cache]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
