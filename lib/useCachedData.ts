import { useState, useEffect, useRef } from "react";

/**
 * Custom hook để cache dữ liệu client-side (TTL = Time To Live)
 * Giảm số lần fetch từ Supabase khi user xem lại
 */
export function useCachedData<T>(
  fetchFn: () => Promise<T>,
  cacheKey: string,
  ttlMs = 5 * 60 * 1000, // Default 5 phút
): {
  data: T | null;
  loading: boolean;
  error: any;
  revalidate: () => void;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const cacheRef = useRef<{
    data: T | null;
    timestamp: number;
  }>({
    data: null,
    timestamp: 0,
  });

  const revalidate = async () => {
    try {
      setLoading(true);
      const result = await fetchFn();
      setData(result);
      cacheRef.current = { data: result, timestamp: Date.now() };
      setError(null);
    } catch (err) {
      setError(err);
      console.warn(`Error fetching ${cacheKey}:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const now = Date.now();
    const cached = cacheRef.current;

    // Check cache validity
    if (cached.data && now - cached.timestamp < ttlMs) {
      // Use cached data
      setData(cached.data);
      setLoading(false);
      return;
    }

    // Fetch new data
    revalidate();
  }, [cacheKey]);

  return { data, loading, error, revalidate };
}
