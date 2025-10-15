// Zustand store for canvas state management
import { create } from 'zustand';
import { CanvasState, SlideElement, SnapGuide } from '../types/canvas';

interface CanvasStore extends CanvasState {
  // Actions
  setElements: (elements: SlideElement[]) => void;
  addElement: (element: SlideElement) => void;
  updateElement: (id: string, updates: Partial<SlideElement>) => void;
  deleteElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  
  // Selection
  selectElement: (id: string, multi?: boolean) => void;
  selectElements: (ids: string[]) => void;
  clearSelection: () => void;
  
  // Clipboard
  copyElements: (ids: string[]) => void;
  cutElements: (ids: string[]) => void;
  pasteElements: () => void;
  
  // History
  undo: () => void;
  redo: () => void;
  saveState: () => void;
  
  // Canvas
  setCanvasSize: (width: number, height: number) => void;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  
  // Snap settings
  toggleSnapping: () => void;
  setSnapSettings: (settings: Partial<CanvasState['snapSettings']>) => void;
  
  // Snap guides
  showSnapGuides: (guides: SnapGuide[]) => void;
  hideSnapGuides: () => void;
}

const initialState: CanvasState = {
  elements: [],
  selectedElements: [],
  clipboard: [],
  history: {
    past: [],
    present: [],
    future: []
  },
  canvas: {
    width: 1280,
    height: 720,
    zoom: 1,
    panX: 0,
    panY: 0
  },
  snapSettings: {
    enabled: true,
    gridSize: 20,
    objectSnapping: true,
    guideLines: true
  }
};

export const useCanvasStore = create<CanvasStore>()((set, get) => ({
      ...initialState,

      setElements: (elements) => set({ elements }),

      addElement: (element) => {
        const state = get();
        const newElements = [...state.elements, element];
        set({ elements: newElements });
        get().saveState();
      },

      updateElement: (id, updates) => {
        const state = get();
        const newElements = state.elements.map(el =>
          el.id === id ? { ...el, ...updates } : el
        );
        set({ elements: newElements });
      },

      deleteElement: (id) => {
        const state = get();
        const newElements = state.elements.filter(el => el.id !== id);
        const newSelected = state.selectedElements.filter(selectedId => selectedId !== id);
        set({ elements: newElements, selectedElements: newSelected });
        get().saveState();
      },

      duplicateElement: (id) => {
        const state = get();
        const element = state.elements.find(el => el.id === id);
        if (element) {
          const duplicated = {
            ...element,
            id: `${id}-copy-${Date.now()}`,
            x: element.x + 20,
            y: element.y + 20,
            selected: false
          };
          get().addElement(duplicated);
        }
      },

      selectElement: (id, multi = false) => {
        const state = get();
        if (multi) {
          const isSelected = state.selectedElements.includes(id);
          const newSelected = isSelected
            ? state.selectedElements.filter(selectedId => selectedId !== id)
            : [...state.selectedElements, id];
          set({ selectedElements: newSelected });
        } else {
          set({ selectedElements: [id] });
        }
      },

      selectElements: (ids) => set({ selectedElements: ids }),

      clearSelection: () => set({ selectedElements: [] }),

      copyElements: (ids) => {
        const state = get();
        const elementsToCopy = state.elements.filter(el => ids.includes(el.id));
        set({ clipboard: elementsToCopy });
      },

      cutElements: (ids) => {
        get().copyElements(ids);
        const state = get();
        const newElements = state.elements.filter(el => !ids.includes(el.id));
        set({ elements: newElements, selectedElements: [] });
        get().saveState();
      },

      pasteElements: () => {
        const state = get();
        const pastedElements = state.clipboard.map(el => ({
          ...el,
          id: `${el.id}-paste-${Date.now()}`,
          x: el.x + 20,
          y: el.y + 20,
          selected: false
        }));
        const newElements = [...state.elements, ...pastedElements];
        set({ elements: newElements });
        get().saveState();
      },

      undo: () => {
        const state = get();
        if (state.history.past.length > 0) {
          const previous = state.history.past[state.history.past.length - 1];
          const newPast = state.history.past.slice(0, state.history.past.length - 1);
          const newFuture = [state.history.present, ...state.history.future];
          
          set({
            elements: previous,
            history: {
              past: newPast,
              present: previous,
              future: newFuture
            }
          });
        }
      },

      redo: () => {
        const state = get();
        if (state.history.future.length > 0) {
          const next = state.history.future[0];
          const newFuture = state.history.future.slice(1);
          const newPast = [...state.history.past, state.history.present];
          
          set({
            elements: next,
            history: {
              past: newPast,
              present: next,
              future: newFuture
            }
          });
        }
      },

      saveState: () => {
        const state = get();
        const newPast = [...state.history.past, state.history.present];
        const limitedPast = newPast.slice(-50); // Keep only last 50 states
        
        set({
          history: {
            past: limitedPast,
            present: state.elements,
            future: []
          }
        });
      },

      setCanvasSize: (width, height) => {
        set(state => ({
          canvas: { ...state.canvas, width, height }
        }));
      },

      setZoom: (zoom) => {
        set(state => ({
          canvas: { ...state.canvas, zoom }
        }));
      },

      setPan: (x, y) => {
        set(state => ({
          canvas: { ...state.canvas, panX: x, panY: y }
        }));
      },

      toggleSnapping: () => {
        set(state => ({
          snapSettings: {
            ...state.snapSettings,
            enabled: !state.snapSettings.enabled
          }
        }));
      },

      setSnapSettings: (settings) => {
        set(state => ({
          snapSettings: { ...state.snapSettings, ...settings }
        }));
      },

      showSnapGuides: (guides) => {
        // This will be handled by the canvas component
      },

      hideSnapGuides: () => {
        // This will be handled by the canvas component
      }
    })
  );
