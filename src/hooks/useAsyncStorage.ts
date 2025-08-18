import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UseAsyncStorageReturn<T> {
  value: T | null;
  loading: boolean;
  error: Error | null;
  setValue: (value: T) => Promise<void>;
  remove: () => Promise<void>;
}

export default function useAsyncStorage<T>(
  key: string,
  initialValue?: T
): UseAsyncStorageReturn<T> {
  const [value, setValue] = useState<T | null>(initialValue || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const getValue = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const item = await AsyncStorage.getItem(key);
      if (item !== null) {
        setValue(JSON.parse(item));
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [key]);

  const setStorageValue = useCallback(
    async (newValue: T) => {
      try {
        setValue(newValue);
        await AsyncStorage.setItem(key, JSON.stringify(newValue));
      } catch (err) {
        setError(err as Error);
      }
    },
    [key]
  );

  const removeValue = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(key);
      setValue(null);
    } catch (err) {
      setError(err as Error);
    }
  }, [key]);

  useEffect(() => {
    getValue();
  }, [getValue]);

  return {
    value,
    loading,
    error,
    setValue: setStorageValue,
    remove: removeValue,
  };
}