import { useCallback, useMemo, useRef, useState } from 'react';

export type EditorSnapshot<SlideT> = {
  slides: SlideT[];
  currentSlide?: number;
  selectedElementId?: string | null;
  zoom?: number;
};

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

interface PushOptions {
  coalesceKey?: string;
}

const DEFAULT_MAX_STACK = 200;
const COALESCE_WINDOW_MS = 300;

export function useEditorHistory<SlideT>(
  initialSlides: SlideT[],
  initialMeta?: Omit<EditorSnapshot<SlideT>, 'slides'>,
  maxStack: number = DEFAULT_MAX_STACK
) {
  const initialSnapshot: EditorSnapshot<SlideT> = useMemo(
    () => ({ slides: structuredClone(initialSlides), ...initialMeta }),
    []
  );

  const [state, setState] = useState<HistoryState<EditorSnapshot<SlideT>>>(
    () => ({ past: [], present: initialSnapshot, future: [] })
  );

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  // Coalescing
  const lastCoalesceRef = useRef<{ key: string; at: number } | null>(null);

  const push = useCallback(
    (nextSlides: SlideT[], opts?: PushOptions, meta?: Omit<EditorSnapshot<SlideT>, 'slides'>) => {
      setState(prev => {
        const now = Date.now();
        const next: EditorSnapshot<SlideT> = {
          slides: structuredClone(nextSlides),
          currentSlide: meta?.currentSlide ?? prev.present.currentSlide,
          selectedElementId: meta?.selectedElementId ?? prev.present.selectedElementId,
          zoom: meta?.zoom ?? prev.present.zoom,
        };

        // Coalesce with previous if applicable
        if (
          opts?.coalesceKey &&
          lastCoalesceRef.current &&
          lastCoalesceRef.current.key === opts.coalesceKey &&
          now - lastCoalesceRef.current.at <= COALESCE_WINDOW_MS &&
          prev.past.length > 0
        ) {
          const newPast = prev.past.slice(0, prev.past.length - 1);
          const mergedPast = [...newPast, prev.present];
          lastCoalesceRef.current.at = now;
          return {
            past: mergedPast.slice(-maxStack),
            present: next,
            future: [],
          };
        }

        if (opts?.coalesceKey) {
          lastCoalesceRef.current = { key: opts.coalesceKey, at: now };
        } else {
          lastCoalesceRef.current = null;
        }

        const newPast = [...prev.past, prev.present];
        if (newPast.length > maxStack) newPast.shift();

        return {
          past: newPast,
          present: next,
          future: [],
        };
      });
    },
    [maxStack]
  );

  const undo = useCallback(() => {
    setState(prev => {
      if (prev.past.length === 0) return prev;
      const previous = prev.past[prev.past.length - 1];
      const newPast = prev.past.slice(0, prev.past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [prev.present, ...prev.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState(prev => {
      if (prev.future.length === 0) return prev;
      const next = prev.future[0];
      const newFuture = prev.future.slice(1);
      return {
        past: [...prev.past, prev.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  const clear = useCallback(() => {
    setState({ past: [], present: initialSnapshot, future: [] });
  }, [initialSnapshot]);

  // Compatibility helpers to minimize editor changes
  const slides = state.present.slides;
  const pushSlides = useCallback(
    (nextSlides: SlideT[], opts?: PushOptions) => push(nextSlides, opts),
    [push]
  );

  return {
    state: slides,
    snapshot: state.present,
    push: pushSlides,
    undo,
    redo,
    canUndo,
    canRedo,
    clear,

    // full snapshot apis
    pushSnapshot: push,
  };
}
