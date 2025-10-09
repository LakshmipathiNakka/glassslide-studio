import { useRef, useEffect, useState } from "react";

interface Element {
  id: string;
  type: 'text' | 'image' | 'shape';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  shapeType?: 'rectangle' | 'circle';
  fill?: string;
}

interface CanvasProps {
  elements: Element[];
  onElementsChange: (elements: Element[]) => void;
}

export const Canvas = ({ elements, onElementsChange }: CanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<{ id: string; startX: number; startY: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    const element = elements.find(el => el.id === id);
    if (!element) return;

    setSelectedId(id);
    setDragState({
      id,
      startX: e.clientX - element.x,
      startY: e.clientY - element.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState) return;

    const newElements = elements.map(el => {
      if (el.id === dragState.id) {
        return {
          ...el,
          x: e.clientX - dragState.startX,
          y: e.clientY - dragState.startY,
        };
      }
      return el;
    });

    onElementsChange(newElements);
  };

  const handleMouseUp = () => {
    setDragState(null);
  };

  return (
    <div
      ref={canvasRef}
      className="flex-1 bg-background relative overflow-hidden cursor-default"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Canvas background with grid */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle, hsl(var(--muted)) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        opacity: 0.1,
      }} />

      {/* Slide area */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card shadow-2xl"
        style={{ width: '960px', height: '540px' }}
      >
        {/* Elements */}
        {elements.map(element => (
          <div
            key={element.id}
            className={`absolute cursor-move select-none ${
              selectedId === element.id ? 'ring-2 ring-accent' : ''
            }`}
            style={{
              left: element.x,
              top: element.y,
              width: element.width,
              height: element.height,
            }}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
          >
            {element.type === 'text' && (
              <div className="w-full h-full flex items-center justify-center text-foreground font-medium text-lg p-4">
                {element.content || 'Double-click to edit'}
              </div>
            )}
            
            {element.type === 'shape' && element.shapeType === 'rectangle' && (
              <div 
                className="w-full h-full"
                style={{ 
                  backgroundColor: element.fill || 'hsl(var(--accent) / 0.2)',
                  border: '2px solid hsl(var(--accent))',
                  borderRadius: '8px',
                }}
              />
            )}
            
            {element.type === 'shape' && element.shapeType === 'circle' && (
              <div 
                className="w-full h-full rounded-full"
                style={{ 
                  backgroundColor: element.fill || 'hsl(var(--accent) / 0.2)',
                  border: '2px solid hsl(var(--accent))',
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
