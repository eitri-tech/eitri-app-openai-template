import { useState, useCallback } from "react";
import { useOpenAI } from "./useOpenAI";

interface UseCompletionOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook para gerenciar chamadas de completion com estado de loading e erro
 */
export function useCompletion<T = any>(
  defaultInput?: string,
  options: UseCompletionOptions<T> = {}
) {
  const { callCompletion } = useOpenAI();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (input: string = defaultInput || "") => {
      setLoading(true);
      setError(null);

      try {
        const result = await callCompletion<T>({ input });

        if (result === null) {
          throw new Error("Failed to call completion");
        }

        setData(result);
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        options.onError?.(error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [defaultInput, callCompletion, options]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}
