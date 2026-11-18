import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';

// GET a path on mount and hand back { data, loading, error, reload }
export default function useApi(path, enabled = true) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!enabled) return;
    try {
      setData(await api(path));
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [path, enabled]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}
