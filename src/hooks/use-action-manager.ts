import { useCallback, useRef } from 'react';
import { usePowerPointHistory } from './use-powerpoint-history';

export interface Element {
  id: string;
  type: 'text' | 'image' | 'shape' | 'chart';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  text?: string;
  placeholder?: string;
  shapeType?: 'rectangle' | 'circle' | 'triangle';
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  chartType?: 'bar' | 'line' | 'pie';
  chartData?: any;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'medium' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right';
  textDecoration?: string;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  letterSpacing?: number;
  padding?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'double';
  opacity?: number;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  lineHeight?: number;
  hyperlink?: string;
  transform?: string;
  clipPath?: string;
  zIndex?: number;
  imageUrl?: string;
  selected?: boolean;
  rotation?: number;
}

interface Slide {
  id: string;
  elements: Element[];
  background: string;
  createdAt: Date;
}

interface ActionManagerProps {
  slides: Slide[];
  currentSlideIndex: number;
  onSlidesChange: (slides: Slide[]) => void;
  onSlideIndexChange: (index: number) => void;
}

export function useActionManager({ slides, currentSlideIndex, onSlidesChange, onSlideIndexChange }: ActionManagerProps) {
  const history = usePowerPointHistory(100); // Increased history size for PowerPoint-like experience
  const previousState = useRef<{ slides: Slide[]; slideIndex: number } | null>(null);

  // Track state changes for undo/redo
  const trackStateChange = useCallback((actionType: string, description: string, data: any) => {
    history.addAction({
      type: actionType as any,
      description,
      data,
      slideIndex: currentSlideIndex,
    });
  }, [history, currentSlideIndex]);

  // Apply undo/redo state
  const applyHistoryState = useCallback(() => {
    const currentAction = history.getCurrentState();
    if (currentAction && currentAction.data) {
      // This would be implemented based on the specific action type
      // For now, we'll use a simple approach where we store the full state
      if (currentAction.data.slides) {
        onSlidesChange(currentAction.data.slides);
        if (currentAction.data.slideIndex !== undefined) {
          onSlideIndexChange(currentAction.data.slideIndex);
        }
      }
    }
  }, [history, onSlidesChange, onSlideIndexChange]);

  // Enhanced action tracking
  const addElement = useCallback((element: Element) => {
    const newSlides = [...slides];
    newSlides[currentSlideIndex] = {
      ...newSlides[currentSlideIndex],
      elements: [...newSlides[currentSlideIndex].elements, element]
    };
    
    // Store previous state for undo
    previousState.current = { slides, slideIndex: currentSlideIndex };
    
    // Track action
    history.addAction({
      type: 'add',
      description: `Add ${element.type}`,
      data: { 
        elementType: element.type, 
        elementId: element.id,
        slides: newSlides,
        slideIndex: currentSlideIndex,
        previousState: previousState.current
      },
      slideIndex: currentSlideIndex,
      elementId: element.id,
    });
    
    onSlidesChange(newSlides);
  }, [slides, currentSlideIndex, onSlidesChange, history]);

  const deleteElement = useCallback((elementId: string) => {
    const element = slides[currentSlideIndex]?.elements.find(el => el.id === elementId);
    if (!element) return;

    const newSlides = [...slides];
    newSlides[currentSlideIndex] = {
      ...newSlides[currentSlideIndex],
      elements: newSlides[currentSlideIndex].elements.filter(el => el.id !== elementId)
    };
    
    // Store previous state for undo
    previousState.current = { slides, slideIndex: currentSlideIndex };
    
    // Track action
    history.addAction({
      type: 'delete',
      description: `Delete ${element.type}`,
      data: { 
        elementType: element.type, 
        elementId: element.id,
        element,
        slides: newSlides,
        slideIndex: currentSlideIndex,
        previousState: previousState.current
      },
      slideIndex: currentSlideIndex,
      elementId: element.id,
    });
    
    onSlidesChange(newSlides);
  }, [slides, currentSlideIndex, onSlidesChange, history]);

  const moveElement = useCallback((elementId: string, newX: number, newY: number) => {
    const element = slides[currentSlideIndex]?.elements.find(el => el.id === elementId);
    if (!element) return;

    const fromPos = { x: element.x, y: element.y };
    const toPos = { x: newX, y: newY };

    const newSlides = [...slides];
    newSlides[currentSlideIndex] = {
      ...newSlides[currentSlideIndex],
      elements: newSlides[currentSlideIndex].elements.map(el => 
        el.id === elementId ? { ...el, x: newX, y: newY } : el
      )
    };
    
    // Store previous state for undo
    previousState.current = { slides, slideIndex: currentSlideIndex };
    
    // Track action
    history.addAction({
      type: 'move',
      description: `Move ${element.type}`,
      data: { 
        elementType: element.type, 
        elementId: element.id,
        fromPos,
        toPos,
        slides: newSlides,
        slideIndex: currentSlideIndex,
        previousState: previousState.current
      },
      slideIndex: currentSlideIndex,
      elementId: element.id,
    });
    
    onSlidesChange(newSlides);
  }, [slides, currentSlideIndex, onSlidesChange, history]);

  const resizeElement = useCallback((elementId: string, newWidth: number, newHeight: number, newX?: number, newY?: number) => {
    const element = slides[currentSlideIndex]?.elements.find(el => el.id === elementId);
    if (!element) return;

    const fromSize = { width: element.width, height: element.height };
    const toSize = { width: newWidth, height: newHeight };

    const newSlides = [...slides];
    newSlides[currentSlideIndex] = {
      ...newSlides[currentSlideIndex],
      elements: newSlides[currentSlideIndex].elements.map(el => 
        el.id === elementId ? { 
          ...el, 
          width: newWidth, 
          height: newHeight,
          x: newX !== undefined ? newX : el.x,
          y: newY !== undefined ? newY : el.y
        } : el
      )
    };
    
    // Store previous state for undo
    previousState.current = { slides, slideIndex: currentSlideIndex };
    
    // Track action
    history.addAction({
      type: 'resize',
      description: `Resize ${element.type}`,
      data: { 
        elementType: element.type, 
        elementId: element.id,
        fromSize,
        toSize,
        slides: newSlides,
        slideIndex: currentSlideIndex,
        previousState: previousState.current
      },
      slideIndex: currentSlideIndex,
      elementId: element.id,
    });
    
    onSlidesChange(newSlides);
  }, [slides, currentSlideIndex, onSlidesChange, history]);

  const editElement = useCallback((elementId: string, updates: Partial<Element>) => {
    const element = slides[currentSlideIndex]?.elements.find(el => el.id === elementId);
    if (!element) return;

    const newSlides = [...slides];
    newSlides[currentSlideIndex] = {
      ...newSlides[currentSlideIndex],
      elements: newSlides[currentSlideIndex].elements.map(el => 
        el.id === elementId ? { ...el, ...updates } : el
      )
    };
    
    // Store previous state for undo
    previousState.current = { slides, slideIndex: currentSlideIndex };
    
    // Track action
    history.addAction({
      type: 'edit',
      description: `Edit ${element.type}`,
      data: { 
        elementType: element.type, 
        elementId: element.id,
        updates,
        slides: newSlides,
        slideIndex: currentSlideIndex,
        previousState: previousState.current
      },
      slideIndex: currentSlideIndex,
      elementId: element.id,
    });
    
    onSlidesChange(newSlides);
  }, [slides, currentSlideIndex, onSlidesChange, history]);

  const duplicateElement = useCallback((elementId: string) => {
    const element = slides[currentSlideIndex]?.elements.find(el => el.id === elementId);
    if (!element) return;

    const duplicatedElement = {
      ...element,
      id: `${element.type}-${Date.now()}`,
      x: element.x + 20,
      y: element.y + 20,
    };

    const newSlides = [...slides];
    newSlides[currentSlideIndex] = {
      ...newSlides[currentSlideIndex],
      elements: [...newSlides[currentSlideIndex].elements, duplicatedElement]
    };
    
    // Store previous state for undo
    previousState.current = { slides, slideIndex: currentSlideIndex };
    
    // Track action
    history.addAction({
      type: 'duplicate',
      description: `Duplicate ${element.type}`,
      data: { 
        elementType: element.type, 
        elementId: element.id,
        duplicatedElement,
        slides: newSlides,
        slideIndex: currentSlideIndex,
        previousState: previousState.current
      },
      slideIndex: currentSlideIndex,
      elementId: element.id,
    });
    
    onSlidesChange(newSlides);
  }, [slides, currentSlideIndex, onSlidesChange, history]);

  const addSlide = useCallback(() => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      elements: [],
      background: '#FFFFFF',
      createdAt: new Date(),
    };
    const newSlides = [...slides, newSlide];
    
    // Store previous state for undo
    previousState.current = { slides, slideIndex: currentSlideIndex };
    
    // Track action
    history.addAction({
      type: 'add',
      description: 'Add slide',
      data: { 
        elementType: 'slide',
        slides: newSlides,
        slideIndex: newSlides.length - 1,
        previousState: previousState.current
      },
      slideIndex: currentSlideIndex,
    });
    
    onSlidesChange(newSlides);
    onSlideIndexChange(newSlides.length - 1);
  }, [slides, currentSlideIndex, onSlidesChange, onSlideIndexChange, history]);

  const deleteSlide = useCallback((slideIndex: number) => {
    if (slides.length <= 1) return; // Don't delete the last slide
    
    const newSlides = slides.filter((_, index) => index !== slideIndex);
    const newCurrentIndex = Math.min(currentSlideIndex, newSlides.length - 1);
    
    // Store previous state for undo
    previousState.current = { slides, slideIndex: currentSlideIndex };
    
    // Track action
    history.addAction({
      type: 'delete',
      description: 'Delete slide',
      data: { 
        elementType: 'slide',
        deletedSlideIndex: slideIndex,
        slides: newSlides,
        slideIndex: newCurrentIndex,
        previousState: previousState.current
      },
      slideIndex: currentSlideIndex,
    });
    
    onSlidesChange(newSlides);
    onSlideIndexChange(newCurrentIndex);
  }, [slides, currentSlideIndex, onSlidesChange, onSlideIndexChange, history]);

  const reorderSlides = useCallback((fromIndex: number, toIndex: number) => {
    const newSlides = [...slides];
    const [movedSlide] = newSlides.splice(fromIndex, 1);
    newSlides.splice(toIndex, 0, movedSlide);
    
    const newCurrentIndex = fromIndex === currentSlideIndex ? toIndex : currentSlideIndex;
    
    // Store previous state for undo
    previousState.current = { slides, slideIndex: currentSlideIndex };
    
    // Track action
    history.addAction({
      type: 'reorder',
      description: 'Reorder slides',
      data: { 
        fromIndex,
        toIndex,
        slides: newSlides,
        slideIndex: newCurrentIndex,
        previousState: previousState.current
      },
      slideIndex: currentSlideIndex,
    });
    
    onSlidesChange(newSlides);
    onSlideIndexChange(newCurrentIndex);
  }, [slides, currentSlideIndex, onSlidesChange, onSlideIndexChange, history]);

  // Undo/Redo with state restoration
  const undo = useCallback(() => {
    if (!history.canUndo) return;
    
    history.undo();
    const currentAction = history.getCurrentState();
    if (currentAction?.data?.previousState) {
      onSlidesChange(currentAction.data.previousState.slides);
      onSlideIndexChange(currentAction.data.previousState.slideIndex);
    }
  }, [history, onSlidesChange, onSlideIndexChange]);

  const redo = useCallback(() => {
    if (!history.canRedo) return;
    
    history.redo();
    const currentAction = history.getCurrentState();
    if (currentAction?.data?.slides) {
      onSlidesChange(currentAction.data.slides);
      onSlideIndexChange(currentAction.data.slideIndex);
    }
  }, [history, onSlidesChange, onSlideIndexChange]);

  return {
    // History state
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    undoDescription: history.getUndoDescription(),
    redoDescription: history.getRedoDescription(),
    historyList: history.getHistoryList(),
    
    // Actions
    undo,
    redo,
    addElement,
    deleteElement,
    moveElement,
    resizeElement,
    editElement,
    duplicateElement,
    addSlide,
    deleteSlide,
    reorderSlides,
    
    // History management
    clearHistory: history.clear,
    currentIndex: history.currentIndex,
    totalActions: history.totalActions,
  };
}
