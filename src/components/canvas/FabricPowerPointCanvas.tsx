import React, { useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import { SlideElement } from '@/types/canvas';

interface FabricPowerPointCanvasProps {
  elements: SlideElement[];
  onElementSelect: (elementId: string | null) => void;
  onElementUpdate: (elementId: string, updates: Partial<SlideElement>) => void;
  onElementAdd: (element: Omit<SlideElement, 'id'>) => void;
  onElementDelete: (elementId: string) => void;
  selectedElementId: string | null;
  width: number;
  height: number;
  className?: string;
}

const FabricPowerPointCanvas: React.FC<FabricPowerPointCanvasProps> = ({
  elements,
  onElementSelect,
  onElementUpdate,
  onElementAdd,
  onElementDelete,
  selectedElementId,
  width,
  height,
  className,
}) => {
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Initialize canvas
  useEffect(() => {
    if (canvasContainerRef.current) {
      const canvas = new fabric.Canvas('powerpoint-canvas', {
        width,
        height,
        selection: true,
      });
      canvasRef.current = canvas;

      // Clean up
      return () => {
        canvas.dispose();
      };
    }
  }, [width, height]);

  // TODO: Sync elements with fabric objects

  return (
    <div ref={canvasContainerRef} className={className}>
      <canvas id="powerpoint-canvas" />
    </div>
  );
};

export default FabricPowerPointCanvas;