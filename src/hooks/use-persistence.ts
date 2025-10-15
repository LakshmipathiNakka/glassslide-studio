import { useEffect } from 'react';

const STORAGE_KEY = 'glassslide-presentation';

export function usePersistence<T>(data: T, onLoad: (data: T) => void) {
  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedData = JSON.parse(saved);
        onLoad(parsedData);
      }
    } catch (error) {
      console.error('Failed to load data from localStorage:', error);
    }
  }, [onLoad]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save data to localStorage:', error);
    }
  }, [data]);

  // Clear data function
  const clearData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear data from localStorage:', error);
    }
  };

  return { clearData };
}
