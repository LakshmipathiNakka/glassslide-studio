import { useEffect, useRef } from 'react';
import { Slide } from '@/types/slide-thumbnails';

export const useSlideSync = ({
  canvas,
  currentSlide,
  onSlideUpdate,
  debounceTime = 300
}: {
  canvas: fabric.Canvas | null;
  currentSlide: Slide | null;
  onSlideUpdate: (elements: any[]) => void;
  debounceTime?: number;
}) => {
  const updateTimeout = useRef<number>();
  const isUpdating = useRef(false);

  // Handle canvas changes and debounce updates
  const handleCanvasChange = () => {
    if (!canvas || isUpdating.current) return;

    // Clear any pending updates
    if (updateTimeout.current) {
      window.clearTimeout(updateTimeout.current);
    }

    // Schedule update with debounce
    updateTimeout.current = window.setTimeout(() => {
      if (!canvas) return;
      
      isUpdating.current = true;
      try {
        // Get all objects (excluding background and other non-content elements)
        const objects = canvas.getObjects()
          .filter(obj => !obj.excludeFromExport)
          .map(obj => obj.toObject(['data', 'selectable', 'evented']));
        
        onSlideUpdate(objects);
      } finally {
        isUpdating.current = false;
      }
    }, debounceTime);
  };

  // Set up canvas event listeners
  useEffect(() => {
    if (!canvas) return;

    const events = [
      'object:added',
      'object:modified',
      'object:removed',
      'object:moving',
      'object:scaling',
      'object:rotating',
      'object:skewing',
      'text:changed',
      'text:editing:exited',
      'path:created',
      'selection:created',
      'selection:updated',
      'selection:cleared'
    ];

    // Attach all event listeners
    events.forEach(event => {
      canvas.on(event, handleCanvasChange);
    });

    // Initial sync
    handleCanvasChange();

    // Cleanup
    return () => {
      if (updateTimeout.current) {
        clearTimeout(updateTimeout.current);
      }
      
      events.forEach(event => {
        canvas.off(event, handleCanvasChange);
      });
    };
  }, [canvas]);

  // Force update when slide changes
  useEffect(() => {
    if (canvas) {
      // Small delay to ensure canvas is ready
      const timer = setTimeout(() => {
        handleCanvasChange();
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [currentSlide?.id, canvas]);

  return { forceUpdate: handleCanvasChange };
};
