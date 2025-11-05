import { useState, useEffect, useCallback, useRef } from 'react';
import { Slide } from '@/types/slide-thumbnails';

export interface PresentationEditingState {
  slides: Slide[];
  hasUnsavedChanges: boolean;
  lastSavedAt: number | null;
  isSaving: boolean;
  saveError: string | null;
}

export interface SaveOptions {
  immediate?: boolean;
  skipBackend?: boolean;
}

export interface BackendSaveResult {
  success: boolean;
  error?: string;
  timestamp?: number;
}

const STORAGE_KEY = 'glassslide-presentation';
const AUTO_SAVE_DELAY = 2000; // 2 seconds debounce
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Hook for managing presentation editing with auto-save functionality
 * Supports both localStorage and backend API persistence
 */
export function usePresentationEditing(
  initialSlides: Slide[],
  deckId: string | null,
  backendSaveCallback?: (slides: Slide[]) => Promise<BackendSaveResult>
) {
  const [slides, setSlides] = useState<Slide[]>(initialSlides);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const pendingSaveRef = useRef(false);

  /**
   * Save to localStorage
   */
  const saveToLocalStorage = useCallback((slidesToSave: Slide[]) => {
    try {
      console.log('[PresentationEditing] Saving to localStorage:', slidesToSave.length, 'slides');
      
      // Save to main editor storage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(slidesToSave));
      
      // Also update the deck snapshot if deckId exists
      if (deckId) {
        const deckData = {
          id: deckId,
          slides: slidesToSave,
          lastUpdated: Date.now(),
        };
        localStorage.setItem(`glassslide-deck-${deckId}`, JSON.stringify(deckData));
      }
      
      console.log('[PresentationEditing] localStorage save successful');
      return true;
    } catch (error) {
      console.error('[PresentationEditing] localStorage save failed:', error);
      return false;
    }
  }, [deckId]);

  /**
   * Save to backend with retry logic
   */
  const saveToBackend = useCallback(async (
    slidesToSave: Slide[],
    attempt: number = 1
  ): Promise<BackendSaveResult> => {
    if (!backendSaveCallback) {
      return { success: true }; // No backend configured
    }

    try {
      console.log(`[PresentationEditing] Saving to backend (attempt ${attempt}/${MAX_RETRY_ATTEMPTS})`);
      const result = await backendSaveCallback(slidesToSave);
      
      if (result.success) {
        console.log('[PresentationEditing] Backend save successful');
        retryCountRef.current = 0;
        return result;
      } else {
        throw new Error(result.error || 'Backend save failed');
      }
    } catch (error) {
      console.error('[PresentationEditing] Backend save failed:', error);
      
      // Retry logic
      if (attempt < MAX_RETRY_ATTEMPTS) {
        console.log(`[PresentationEditing] Retrying in ${RETRY_DELAY}ms...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return saveToBackend(slidesToSave, attempt + 1);
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }, [backendSaveCallback]);

  /**
   * Main save function
   */
  const saveChanges = useCallback(async (options: SaveOptions = {}) => {
    if (isSaving && !options.immediate) {
      console.log('[PresentationEditing] Save already in progress, queuing...');
      pendingSaveRef.current = true;
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    pendingSaveRef.current = false;

    console.log('[PresentationEditing] Starting save operation');

    try {
      // Always save to localStorage first (fast, synchronous)
      const localSaveSuccess = saveToLocalStorage(slides);
      
      if (!localSaveSuccess) {
        throw new Error('Failed to save to localStorage');
      }

      // Save to backend if configured and not skipped
      if (!options.skipBackend && backendSaveCallback) {
        const backendResult = await saveToBackend(slides);
        
        if (!backendResult.success) {
          throw new Error(backendResult.error || 'Backend save failed');
        }
      }

      // Success
      setHasUnsavedChanges(false);
      setLastSavedAt(Date.now());
      console.log('[PresentationEditing] Save completed successfully');

      // If there was a pending save, execute it now
      if (pendingSaveRef.current) {
        console.log('[PresentationEditing] Executing queued save');
        setTimeout(() => saveChanges(options), 100);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[PresentationEditing] Save failed:', errorMessage);
      setSaveError(errorMessage);
      // Keep hasUnsavedChanges as true
    } finally {
      setIsSaving(false);
    }
  }, [slides, isSaving, saveToLocalStorage, saveToBackend, backendSaveCallback]);

  /**
   * Update slides with auto-save
   */
  const updateSlides = useCallback((newSlides: Slide[] | ((prev: Slide[]) => Slide[]), autoSave = true) => {
    setSlides(prevSlides => {
      const updatedSlides = typeof newSlides === 'function' ? newSlides(prevSlides) : newSlides;
      
      console.log('[PresentationEditing] Slides updated:', updatedSlides.length);
      
      if (autoSave) {
        setHasUnsavedChanges(true);
        
        // Clear existing timer
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current);
        }
        
        // Set new auto-save timer
        autoSaveTimerRef.current = setTimeout(() => {
          console.log('[PresentationEditing] Auto-save triggered');
          saveChanges();
        }, AUTO_SAVE_DELAY);
      }
      
      return updatedSlides;
    });
  }, [saveChanges]);

  /**
   * Force immediate save (for ESC handler, etc.)
   */
  const forceSave = useCallback(async (): Promise<boolean> => {
    console.log('[PresentationEditing] Force save requested');
    
    // Clear auto-save timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }

    // Save immediately
    await saveChanges({ immediate: true });
    
    return !saveError;
  }, [saveChanges, saveError]);

  /**
   * Retry failed save
   */
  const retrySave = useCallback(() => {
    console.log('[PresentationEditing] Retrying failed save');
    setSaveError(null);
    saveChanges({ immediate: true });
  }, [saveChanges]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  return {
    slides,
    updateSlides,
    hasUnsavedChanges,
    lastSavedAt,
    isSaving,
    saveError,
    forceSave,
    retrySave,
    saveChanges,
  };
}
