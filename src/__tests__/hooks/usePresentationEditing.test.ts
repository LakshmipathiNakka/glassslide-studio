import { renderHook, act, waitFor } from '@testing-library/react';
import { usePresentationEditing, BackendSaveResult } from '@/hooks/usePresentationEditing';
import { Slide } from '@/types/slide-thumbnails';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('usePresentationEditing', () => {
  const mockSlides: Slide[] = [
    {
      id: '1',
      elements: [],
      background: '#ffffff',
      createdAt: new Date(),
      lastUpdated: Date.now(),
    },
    {
      id: '2',
      elements: [],
      background: '#000000',
      createdAt: new Date(),
      lastUpdated: Date.now(),
    },
  ];

  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Initialization', () => {
    it('should initialize with provided slides', () => {
      const { result } = renderHook(() =>
        usePresentationEditing(mockSlides, 'test-deck-1')
      );

      expect(result.current.slides).toEqual(mockSlides);
      expect(result.current.hasUnsavedChanges).toBe(false);
      expect(result.current.isSaving).toBe(false);
      expect(result.current.saveError).toBeNull();
    });

    it('should initialize without deck ID', () => {
      const { result } = renderHook(() =>
        usePresentationEditing(mockSlides, null)
      );

      expect(result.current.slides).toEqual(mockSlides);
    });
  });

  describe('Auto-save functionality', () => {
    it('should auto-save after 2 seconds when slides are updated', async () => {
      const { result } = renderHook(() =>
        usePresentationEditing(mockSlides, 'test-deck-1')
      );

      const newSlides = [
        ...mockSlides,
        {
          id: '3',
          elements: [],
          background: '#ff0000',
          createdAt: new Date(),
          lastUpdated: Date.now(),
        },
      ];

      act(() => {
        result.current.updateSlides(newSlides);
      });

      expect(result.current.hasUnsavedChanges).toBe(true);

      // Fast-forward time by 2 seconds
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(result.current.hasUnsavedChanges).toBe(false);
        expect(result.current.lastSavedAt).not.toBeNull();
      });
    });

    it('should debounce multiple rapid updates', async () => {
      const { result } = renderHook(() =>
        usePresentationEditing(mockSlides, 'test-deck-1')
      );

      // Make multiple rapid updates
      act(() => {
        result.current.updateSlides([...mockSlides, { id: '3' } as Slide]);
      });

      act(() => {
        jest.advanceTimersByTime(1000); // 1 second
      });

      act(() => {
        result.current.updateSlides([...mockSlides, { id: '4' } as Slide]);
      });

      act(() => {
        jest.advanceTimersByTime(1000); // Another 1 second
      });

      // Should still have unsaved changes after 2 seconds total
      expect(result.current.hasUnsavedChanges).toBe(true);

      // Fast-forward to complete the debounce
      act(() => {
        jest.advanceTimersByTime(1000); // Final 1 second
      });

      await waitFor(() => {
        expect(result.current.hasUnsavedChanges).toBe(false);
      });
    });

    it('should skip auto-save when autoSave is false', () => {
      const { result } = renderHook(() =>
        usePresentationEditing(mockSlides, 'test-deck-1')
      );

      act(() => {
        result.current.updateSlides([...mockSlides], false); // autoSave = false
      });

      expect(result.current.hasUnsavedChanges).toBe(false);

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(result.current.lastSavedAt).toBeNull();
    });
  });

  describe('localStorage persistence', () => {
    it('should save to localStorage on auto-save', async () => {
      const { result } = renderHook(() =>
        usePresentationEditing(mockSlides, 'test-deck-1')
      );

      const newSlides = [...mockSlides, { id: '3' } as Slide];

      act(() => {
        result.current.updateSlides(newSlides);
      });

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        const saved = localStorage.getItem('glassslide-presentation');
        expect(saved).not.toBeNull();
        expect(JSON.parse(saved!)).toEqual(newSlides);
      });
    });

    it('should update deck snapshot in localStorage', async () => {
      const deckId = 'test-deck-123';
      const { result } = renderHook(() =>
        usePresentationEditing(mockSlides, deckId)
      );

      act(() => {
        result.current.updateSlides(mockSlides);
      });

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        const deckData = localStorage.getItem(`glassslide-deck-${deckId}`);
        expect(deckData).not.toBeNull();
        const parsed = JSON.parse(deckData!);
        expect(parsed.slides).toEqual(mockSlides);
      });
    });
  });

  describe('Backend sync', () => {
    it('should call backend save callback', async () => {
      const mockBackendSave = jest.fn().mockResolvedValue({
        success: true,
        timestamp: Date.now(),
      } as BackendSaveResult);

      const { result } = renderHook(() =>
        usePresentationEditing(mockSlides, 'test-deck-1', mockBackendSave)
      );

      act(() => {
        result.current.updateSlides([...mockSlides]);
      });

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(mockBackendSave).toHaveBeenCalledWith(mockSlides);
      });
    });

    it('should retry on backend failure', async () => {
      let callCount = 0;
      const mockBackendSave = jest.fn().mockImplementation(async () => {
        callCount++;
        if (callCount < 3) {
          throw new Error('Network error');
        }
        return { success: true, timestamp: Date.now() };
      });

      const { result } = renderHook(() =>
        usePresentationEditing(mockSlides, 'test-deck-1', mockBackendSave)
      );

      act(() => {
        result.current.updateSlides([...mockSlides]);
      });

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(mockBackendSave).toHaveBeenCalledTimes(3);
        expect(result.current.hasUnsavedChanges).toBe(false);
      }, { timeout: 5000 });
    });

    it('should set error after max retries', async () => {
      const mockBackendSave = jest.fn().mockRejectedValue(new Error('Persistent error'));

      const { result } = renderHook(() =>
        usePresentationEditing(mockSlides, 'test-deck-1', mockBackendSave)
      );

      act(() => {
        result.current.updateSlides([...mockSlides]);
      });

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(result.current.saveError).not.toBeNull();
        expect(result.current.hasUnsavedChanges).toBe(true);
      }, { timeout: 5000 });
    });
  });

  describe('Force save', () => {
    it('should save immediately when forceSave is called', async () => {
      const { result } = renderHook(() =>
        usePresentationEditing(mockSlides, 'test-deck-1')
      );

      const newSlides = [...mockSlides, { id: '3' } as Slide];

      act(() => {
        result.current.updateSlides(newSlides);
      });

      expect(result.current.hasUnsavedChanges).toBe(true);

      let saveResult: boolean = false;
      await act(async () => {
        saveResult = await result.current.forceSave();
      });

      expect(saveResult).toBe(true);
      expect(result.current.hasUnsavedChanges).toBe(false);
      expect(result.current.lastSavedAt).not.toBeNull();
    });

    it('should cancel pending auto-save when forceSave is called', async () => {
      const { result } = renderHook(() =>
        usePresentationEditing(mockSlides, 'test-deck-1')
      );

      act(() => {
        result.current.updateSlides([...mockSlides]);
      });

      // Don't wait for auto-save, force immediately
      await act(async () => {
        await result.current.forceSave();
      });

      expect(result.current.hasUnsavedChanges).toBe(false);

      // Advance time to where auto-save would have triggered
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // Should not trigger another save
      expect(result.current.lastSavedAt).not.toBeNull();
    });
  });

  describe('Retry save', () => {
    it('should retry failed save', async () => {
      const mockBackendSave = jest
        .fn()
        .mockRejectedValueOnce(new Error('Error'))
        .mockResolvedValueOnce({ success: true, timestamp: Date.now() });

      const { result } = renderHook(() =>
        usePresentationEditing(mockSlides, 'test-deck-1', mockBackendSave)
      );

      act(() => {
        result.current.updateSlides([...mockSlides]);
      });

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(result.current.saveError).not.toBeNull();
      });

      // Retry
      act(() => {
        result.current.retrySave();
      });

      await waitFor(() => {
        expect(result.current.saveError).toBeNull();
        expect(result.current.hasUnsavedChanges).toBe(false);
      });
    });
  });

  describe('State synchronization', () => {
    it('should track isSaving state correctly', async () => {
      const mockBackendSave = jest.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return { success: true, timestamp: Date.now() };
      });

      const { result } = renderHook(() =>
        usePresentationEditing(mockSlides, 'test-deck-1', mockBackendSave)
      );

      act(() => {
        result.current.updateSlides([...mockSlides]);
      });

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // Should be saving
      await waitFor(() => {
        expect(result.current.isSaving).toBe(true);
      });

      // Wait for save to complete
      await waitFor(() => {
        expect(result.current.isSaving).toBe(false);
      }, { timeout: 3000 });
    });

    it('should handle multiple pending saves', async () => {
      const { result } = renderHook(() =>
        usePresentationEditing(mockSlides, 'test-deck-1')
      );

      // Start first save
      act(() => {
        result.current.updateSlides([...mockSlides, { id: '3' } as Slide]);
      });

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      // Start second save while first is pending
      act(() => {
        result.current.updateSlides([...mockSlides, { id: '4' } as Slide]);
      });

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(result.current.hasUnsavedChanges).toBe(false);
      });
    });
  });
});
