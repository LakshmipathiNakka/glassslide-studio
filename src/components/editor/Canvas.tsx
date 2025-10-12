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
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-card/95 backdrop-blur-sm border rounded-lg px-4 py-2 text-xs text-muted-foreground shadow-lg">
          <span className="font-medium">Tip:</span> Drag to move • Drag corners to resize • Hold Shift for aspect ratio • Cmd/Ctrl+Z to undo
        </div>
      )}
    </div>
  );
};
