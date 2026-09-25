import { useEffect, useState } from 'react';

/**
 * Fetches an authenticated receipt blob and exposes a transient object URL.
 * The caller MUST revoke it (we do automatically on unmount + on URL change).
 */
export function useReceiptObjectUrl(
  fetcher: (() => Promise<{ blob: Blob; contentType: string }>) | null,
): { url: string | null; contentType: string | null; loading: boolean; error: Error | null } {
  const [url, setUrl] = useState<string | null>(null);
  const [contentType, setContentType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    let current: string | null = null;
    if (!fetcher) {
      setUrl(null);
      setContentType(null);
      return;
    }
    setLoading(true);
    setError(null);
    fetcher()
      .then(({ blob, contentType }) => {
        if (cancelled) return;
        const u = URL.createObjectURL(blob);
        current = u;
        setUrl(u);
        setContentType(contentType);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
      if (current) URL.revokeObjectURL(current);
    };
  }, [fetcher]);

  return { url, contentType, loading, error };
}