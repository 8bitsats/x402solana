import {
  useCallback,
  useState,
} from 'react';

import { handleApiError } from '../utils/apiError';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export const useApi = <T>(options: UseApiOptions<T> = {}) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(
    async (promise: Promise<T>) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await promise;
        setData(result);
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        const error = handleApiError(err);
        setError(error);
        options.onError?.(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    error,
    isLoading,
    execute,
    reset,
  };
}; 