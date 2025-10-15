import { useState, useCallback, useMemo } from 'react';
import { SlideElement } from '../types/canvas';

interface UseActionManagerReturn {
  elements: SlideElement[];
  addElement: (element: Omit<SlideElement, 'id'>) => void;
  updateElement: (elementId: string, updates: Partial<SlideElement>) => void;
  deleteElement: (elementId: string) => void;
  duplicateElement: (elementId: string) => void;
  clearSlide: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const useActionManager = (): UseActionManagerReturn => {
  const [elements, setElements] = useState<SlideElement[]>([]);
  const [history, setHistory] = useState<SlideElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Save state to history
  const saveToHistory = useCallback((newElements: SlideElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newElements]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // Add element
  const addElement = useCallback((element: Omit<SlideElement, 'id'>) => {
    const newElement: SlideElement = {
      ...element,
      id: `${element.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    const newElements = [...elements, newElement];
    setElements(newElements);
    saveToHistory(newElements);
  }, [elements, saveToHistory]);

  // Update element
  const updateElement = useCallback((elementId: string, updates: Partial<SlideElement>) => {
    const newElements = elements.map(element =>
      element.id === elementId ? { ...element, ...updates } : element
    );
    setElements(newElements);
    saveToHistory(newElements);
  }, [elements, saveToHistory]);

  // Delete element
  const deleteElement = useCallback((elementId: string) => {
    const newElements = elements.filter(element => element.id !== elementId);
    setElements(newElements);
    saveToHistory(newElements);
  }, [elements, saveToHistory]);

  // Duplicate element
  const duplicateElement = useCallback((elementId: string) => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    const duplicatedElement: SlideElement = {
      ...element,
      id: `${element.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      x: element.x + 20,
      y: element.y + 20
    };

    const newElements = [...elements, duplicatedElement];
    setElements(newElements);
    saveToHistory(newElements);
  }, [elements, saveToHistory]);

  // Clear slide
  const clearSlide = useCallback(() => {
    setElements([]);
    saveToHistory([]);
  }, [saveToHistory]);

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setElements([...history[newIndex]]);
    }
  }, [historyIndex, history]);

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setElements([...history[newIndex]]);
    }
  }, [historyIndex, history]);

  // Can undo/redo
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return {
    elements,
    addElement,
    updateElement,
    deleteElement,
    duplicateElement,
    clearSlide,
    undo,
    redo,
    canUndo,
    canRedo
  };
};
