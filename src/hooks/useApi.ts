import { useState, useCallback } from 'react';
import type { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import type { ApiResponse } from '../types';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: AxiosError) => void;
  showSuccessToast?: boolean;
  successMessage?: string;
  showErrorToast?: boolean;
}

interface UseApiReturn<T> {
  loading: boolean;
  error: AxiosError | null;
  data: T | null;
  execute: (apiCall: () => Promise<T>, options?: UseApiOptions<T>) => Promise<T | undefined>;
  setData: (data: T | null) => void;
}

export function useApi<T = unknown>(): UseApiReturn<T> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AxiosError | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(
    async (
      apiCall: () => Promise<T>,
      options?: UseApiOptions<T>
    ): Promise<T | undefined> => {
      setLoading(true);
      setError(null);

      try {
        const result = await apiCall();
        setData(result);
        
        if (options?.showSuccessToast) {
          toast.success(options.successMessage || 'Opération réussie');
        }
        
        options?.onSuccess?.(result);
        return result;
      } catch (err) {
        const axiosError = err as AxiosError;
        setError(axiosError);
        
        if (options?.showErrorToast !== false) {
          const responseData = axiosError.response?.data as ApiResponse | undefined;
          const errorMessage = 
            responseData?.error || 
            (responseData?.data as { message?: string })?.message || 
            'Une erreur est survenue';
          
          toast.error(errorMessage);
        }
        
        options?.onError?.(axiosError);
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    data,
    execute,
    setData
  };
}