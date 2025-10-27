import { useEffect, useMemo } from 'react';
import type { Slide } from '@/types/slide-thumbnails';
import { captureElementToThumbnail, createDebounced } from '@/utils/thumbnail';

interface UseThumbnailSyncParams {
  slides: Slide[];
  currentSlideIndex: number;
  slideContainerRef: React.RefObject<HTMLElement | null>;
  onUpdateSlide: (index: number, updates: Partial<Slide>) => void;
  width?: number;
  height?: number;
  debounceMs?: number;
}

// Hook: captures the active slide DOM to a base64 thumbnail, debounced
export function useThumbnailSync({
  slides,
  currentSlideIndex,
  slideContainerRef,
  onUpdateSlide,
  width = 200,
  height = 112,
  debounceMs = 500,
}: UseThumbnailSyncParams) {
  // Debounced capture function (stable across renders)
  const debouncedCapture = useMemo(
    () =>
      createDebounced(async (el: HTMLElement) => {
        try {
          const dataUrl = await captureElementToThumbnail(el, { width, height, scale: 2, backgroundColor: null });
          // Smooth update: only set if changed
          const slide = slides[currentSlideIndex];
          if (!slide) return;
          if (slide.thumbnail !== dataUrl) {
            onUpdateSlide(currentSlideIndex, { thumbnail: dataUrl, lastUpdated: Date.now() });
          }
        } catch (e) {
          // Silent fail – thumbnails are non-critical
          // console.debug('Thumbnail capture failed', e);
        }
      }, debounceMs),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentSlideIndex, width, height, debounceMs, slides]
  );

  useEffect(() => {
    const slide = slides[currentSlideIndex];
    const el = slideContainerRef.current as HTMLElement | null;
    if (!slide || !el) return;

    // Trigger when slide content updated
    // lastUpdated is bumped by editor updates; also trigger on elements length/background change
    debouncedCapture(el);
  }, [slides, currentSlideIndex, slideContainerRef, debouncedCapture]);
}
