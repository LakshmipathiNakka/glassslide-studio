import { useState, useCallback } from 'react';

export interface Slide {
  id: string;
  elements: any[];
  background: string;
  createdAt: Date;
  thumbnail?: string;
}

export interface SlideManagerState {
  slides: Slide[];
  currentSlideIndex: number;
  isReordering: boolean;
}

export const useSlideManager = (initialSlides: Slide[] = []) => {
  const [state, setState] = useState<SlideManagerState>({
    slides: initialSlides.length > 0 ? initialSlides : [{
      id: 'slide-1',
      elements: [],
      background: '#FFFFFF',
      createdAt: new Date(),
    }],
    currentSlideIndex: 0,
    isReordering: false,
  });

  const addSlide = useCallback((afterIndex?: number) => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      elements: [],
      background: '#FFFFFF',
      createdAt: new Date(),
    };

    setState(prev => {
      const insertIndex = afterIndex !== undefined ? afterIndex + 1 : prev.slides.length;
      const newSlides = [...prev.slides];
      newSlides.splice(insertIndex, 0, newSlide);
      
      return {
        ...prev,
        slides: newSlides,
        currentSlideIndex: insertIndex,
      };
    });

    return newSlide;
  }, []);

  const duplicateSlide = useCallback((slideIndex: number) => {
    setState(prev => {
      const slideToDuplicate = prev.slides[slideIndex];
      const duplicatedSlide: Slide = {
        ...slideToDuplicate,
        id: `slide-${Date.now()}`,
        createdAt: new Date(),
      };

      const newSlides = [...prev.slides];
      newSlides.splice(slideIndex + 1, 0, duplicatedSlide);

      return {
        ...prev,
        slides: newSlides,
        currentSlideIndex: slideIndex + 1,
      };
    });
  }, []);

  const deleteSlide = useCallback((slideIndex: number) => {
    setState(prev => {
      if (prev.slides.length <= 1) return prev; // Don't delete the last slide

      const newSlides = prev.slides.filter((_, index) => index !== slideIndex);
      const newCurrentIndex = Math.min(prev.currentSlideIndex, newSlides.length - 1);

      return {
        ...prev,
        slides: newSlides,
        currentSlideIndex: newCurrentIndex,
      };
    });
  }, []);

  const reorderSlides = useCallback((fromIndex: number, toIndex: number) => {
    setState(prev => {
      const newSlides = [...prev.slides];
      const [movedSlide] = newSlides.splice(fromIndex, 1);
      newSlides.splice(toIndex, 0, movedSlide);

      const newCurrentIndex = fromIndex === prev.currentSlideIndex ? toIndex : prev.currentSlideIndex;

      return {
        ...prev,
        slides: newSlides,
        currentSlideIndex: newCurrentIndex,
      };
    });
  }, []);

  const setCurrentSlide = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      currentSlideIndex: Math.max(0, Math.min(index, prev.slides.length - 1)),
    }));
  }, []);

  const updateSlide = useCallback((slideIndex: number, updates: Partial<Slide>) => {
    setState(prev => ({
      ...prev,
      slides: prev.slides.map((slide, index) => 
        index === slideIndex ? { ...slide, ...updates } : slide
      ),
    }));
  }, []);

  const updateCurrentSlide = useCallback((updates: Partial<Slide>) => {
    updateSlide(state.currentSlideIndex, updates);
  }, [state.currentSlideIndex, updateSlide]);

  const setReordering = useCallback((isReordering: boolean) => {
    setState(prev => ({ ...prev, isReordering }));
  }, []);

  const currentSlide = state.slides[state.currentSlideIndex];

  return {
    ...state,
    currentSlide,
    addSlide,
    duplicateSlide,
    deleteSlide,
    reorderSlides,
    setCurrentSlide,
    updateSlide,
    updateCurrentSlide,
    setReordering,
  };
};
