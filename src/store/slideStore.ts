import { create } from 'zustand';

export interface SlideElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'chart';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  content?: string;
  shapeType?: 'rectangle' | 'circle';
  fill?: string;
  chartType?: 'bar' | 'line' | 'pie';
  chartData?: any;
  zIndex: number;
}

interface HistoryState {
  elements: SlideElement[];
  timestamp: number;
}

interface SlideStore {
  elements: SlideElement[];
  selectedId: string | null;
  history: HistoryState[];
  historyIndex: number;

  setElements: (elements: SlideElement[]) => void;
  updateElement: (id: string, updates: Partial<SlideElement>) => void;
  addElement: (element: SlideElement) => void;
  deleteElement: (id: string) => void;
  setSelectedId: (id: string | null) => void;

  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  pushHistory: () => void;
}

export const useSlideStore = create<SlideStore>((set, get) => ({
  elements: [],
  selectedId: null,
  history: [],
  historyIndex: -1,

  setElements: (elements) => {
    set({ elements });
    get().pushHistory();
  },

  updateElement: (id, updates) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      ),
    }));
  },

  addElement: (element) => {
    set((state) => ({
      elements: [...state.elements, element],
    }));
    get().pushHistory();
  },

  deleteElement: (id) => {
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
    }));
    get().pushHistory();
  },

  setSelectedId: (id) => {
    set({ selectedId: id });
  },

  pushHistory: () => {
    const { elements, history, historyIndex } = get();

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      elements: JSON.parse(JSON.stringify(elements)),
      timestamp: Date.now(),
    });

    if (newHistory.length > 50) {
      newHistory.shift();
    }

    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  undo: () => {
    const { history, historyIndex } = get();

    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      set({
        elements: JSON.parse(JSON.stringify(history[newIndex].elements)),
        historyIndex: newIndex,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();

    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      set({
        elements: JSON.parse(JSON.stringify(history[newIndex].elements)),
        historyIndex: newIndex,
      });
    }
  },

  canUndo: () => {
    const { historyIndex } = get();
    return historyIndex > 0;
  },

  canRedo: () => {
    const { history, historyIndex } = get();
    return historyIndex < history.length - 1;
  },
}));
