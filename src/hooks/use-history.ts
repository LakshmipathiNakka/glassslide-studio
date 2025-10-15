import { useState, useCallback } from 'react';

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export function useHistory<T>(initialState: T) {
  const [state, setState] = useState<HistoryState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  const push = useCallback((newState: T) => {
    setState(prev => ({
      past: [...prev.past, prev.present],
      present: newState,
      future: [],
    }));
  }, []);

  const undo = useCallback(() => {
    if (!canUndo) return;

    setState(prev => {
      const previous = prev.past[prev.past.length - 1];
      const newPast = prev.past.slice(0, prev.past.length - 1);
      
      return {
        past: newPast,
        present: previous,
        future: [prev.present, ...prev.future],
      };
    });
  }, [canUndo]);

  const redo = useCallback(() => {
    if (!canRedo) return;

    setState(prev => {
      const next = prev.future[0];
      const newFuture = prev.future.slice(1);
      
      return {
        past: [...prev.past, prev.present],
        present: next,
        future: newFuture,
      };
    });
  }, [canRedo]);

  const clear = useCallback(() => {
    setState({
      past: [],
      present: initialState,
      future: [],
    });
  }, [initialState]);

  return {
    state: state.present,
    push,
    undo,
    redo,
    canUndo,
    canRedo,
    clear,
  };
}
