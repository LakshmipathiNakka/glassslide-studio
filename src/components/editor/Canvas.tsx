import { useRef, useEffect, useState } from 'react';
import { useSlideStore, SlideElement } from '@/store/slideStore';
import { MoveableElement } from './MoveableElement';

interface CanvasProps {
  elements: SlideElement[];
  onElementsChange: (elements: SlideElement[]) => void;
}

export const Canvas = ({ elements: externalElements, onElementsChange }: CanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const slideRef = useRef<HTMLDivElement>(null);
  const [snapTargets, setSnapTargets] = useState<Element[]>([]);

  const {
    elements: storeElements,
    selectedId,
    setSelectedId,
    updateElement,
    setElements,
    pushHistory,
  } = useSlideStore();

  const elements = externalElements.length > 0 ? externalElements : storeElements;

  useEffect(() => {
    if (externalElements.length > 0) {
      setElements(externalElements);
    }
  }, [externalElements, setElements]);

  useEffect(() => {
    if (slideRef.current) {
      const elementNodes = Array.from(
        slideRef.current.querySelectorAll('[data-moveable-element]')
      );
      setSnapTargets(elementNodes);
    }
  }, [elements, selectedId]);

  const handleElementUpdate = (id: string, updates: Partial<SlideElement>) => {
    updateElement(id, updates);
    const updatedElements = elements.map((el) =>
      el.id === id ? { ...el, ...updates } : el
    );
    onElementsChange(updatedElements);
  };

  const handleUpdateEnd = () => {
    pushHistory();
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === slideRef.current || e.target === containerRef.current) {
      setSelectedId(null);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        useSlideStore.getState().undo();
        const newElements = useSlideStore.getState().elements;
        onElementsChange(newElements);
      }

      if ((e.metaKey || e.ctrlKey) && (e.key === 'z' && e.shiftKey || e.key === 'y')) {
        e.preventDefault();
        useSlideStore.getState().redo();
        const newElements = useSlideStore.getState().elements;
        onElementsChange(newElements);
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault();
        const { deleteElement } = useSlideStore.getState();
        deleteElement(selectedId);
        const newElements = useSlideStore.getState().elements;
        onElementsChange(newElements);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, onElementsChange]);

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-background relative overflow-hidden cursor-default"
      onClick={handleCanvasClick}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, hsl(var(--muted)) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          opacity: 0.1,
        }}
      />

      <div
        ref={slideRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card shadow-2xl"
        style={{ width: '960px', height: '540px', position: 'relative' }}
      >
        {selectedId && (
          <>
            <div
              className="absolute top-0 bottom-0 w-px pointer-events-none opacity-0 transition-opacity duration-150"
              style={{
                left: '480px',
                background: 'linear-gradient(to bottom, transparent, hsl(var(--accent) / 0.3) 20%, hsl(var(--accent) / 0.3) 80%, transparent)',
              }}
            />
            <div
              className="absolute left-0 right-0 h-px pointer-events-none opacity-0 transition-opacity duration-150"
              style={{
                top: '270px',
                background: 'linear-gradient(to right, transparent, hsl(var(--accent) / 0.3) 20%, hsl(var(--accent) / 0.3) 80%, transparent)',
              }}
            />
          </>
        )}

        {elements.map((element) => (
          <div key={element.id} data-moveable-element>
            <MoveableElement
              element={element}
              isSelected={selectedId === element.id}
              onSelect={() => setSelectedId(element.id)}
              onUpdate={(updates) => handleElementUpdate(element.id, updates)}
              onUpdateEnd={handleUpdateEnd}
              containerRef={slideRef}
              snapElements={snapTargets.filter(
                (el) => !el.querySelector(`[data-element-id="${element.id}"]`)
              )}
            />
          </div>
        ))}
      </div>

      {selectedId && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-card/98 backdrop-blur-md border border-border/60 rounded-lg px-5 py-2.5 text-xs text-muted-foreground shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">PowerPoint Mode:</span>
            <span className="opacity-80">Drag to move</span>
            <span className="opacity-40">•</span>
            <span className="opacity-80">Corners/edges to resize</span>
            <span className="opacity-40">•</span>
            <span className="font-medium text-accent">Hold Shift</span>
            <span className="opacity-80">for aspect ratio</span>
            <span className="opacity-40">•</span>
            <span className="opacity-80">Cmd/Ctrl+Z to undo</span>
          </div>
        </div>
      )}
    </div>
  );
};
