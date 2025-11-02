import { fabric } from 'fabric';
import { useEffect, useRef } from 'react';

export type FabricEditorOptions = {
  width?: number;
  height?: number;
  backgroundColor?: string;
  grid?: number; // px grid for snapping (0 to disable)
  storageKey?: string; // localStorage key
};

const DEFAULTS: Required<FabricEditorOptions> = {
  width: 960,
  height: 540,
  backgroundColor: '#ffffff',
  grid: 10,
  storageKey: 'fabric_canvas_state',
};

export const useFabricEditor = (canvasId: string, opts?: FabricEditorOptions) => {
  const options = { ...DEFAULTS, ...(opts || {}) };
  const canvasRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    const canvasEl = document.getElementById(canvasId) as HTMLCanvasElement | null;
    if (!canvasEl) return;

    const canvas = new fabric.Canvas(canvasId, {
      width: options.width,
      height: options.height,
      backgroundColor: options.backgroundColor,
      preserveObjectStacking: true,
      selection: true,
    });
    canvasRef.current = canvas;

    // Global object handle styles
    fabric.Object.prototype.cornerStyle = 'circle';
    fabric.Object.prototype.cornerColor = '#2563EB'; // blue-600
    fabric.Object.prototype.cornerSize = 10;
    fabric.Object.prototype.cornerStrokeColor = '#ffffff';
    fabric.Object.prototype.transparentCorners = false;
    fabric.Object.prototype.borderColor = '#3B82F6'; // blue-500
    fabric.Object.prototype.lockScalingFlip = true;

    // Rotation UX: pivot at center, handle at top-center (Keynote/Figma-like)
    try {
      // Ensure transforms happen around center
      (fabric.Object.prototype as any).originX = 'center';
      (fabric.Object.prototype as any).originY = 'center';
      (fabric.Object.prototype as any).rotatingPointOffset = 50;

      // Place rotation control above the top edge, centered horizontally
      fabric.Object.prototype.controls = {
        ...fabric.Object.prototype.controls,
        mtr: new fabric.Control({
          x: 0,           // center horizontally
          y: -0.5,        // above the top edge relative position
          offsetY: -40,   // visual lift for easier grabbing
          actionHandler: (fabric as any).controlsUtils.rotationWithSnapping,
          cursorStyleHandler: (fabric as any).controlsUtils.rotationStyleHandler,
          getActionName: () => 'rotate',
        }),
      };
    } catch {
      // ignore if fabric API shape differs
    }

    // Helper: keep within bounds
    const clampInBounds = (obj: fabric.Object) => {
      const w = (obj.width || 0) * (obj.scaleX || 1);
      const h = (obj.height || 0) * (obj.scaleY || 1);
      if (obj.left == null || obj.top == null) return;
      if (obj.left < 0) obj.left = 0;
      if (obj.top < 0) obj.top = 0;
      if (obj.left + w > options.width) obj.left = options.width - w;
      if (obj.top + h > options.height) obj.top = options.height - h;
    };

    // Snap to grid on move (optional)
    if (options.grid > 0) {
      canvas.on('object:moving', (e) => {
        const obj = e?.target as fabric.Object | undefined;
        if (!obj) return;
        const g = options.grid;
        if (obj.left != null) obj.left = Math.round(obj.left / g) * g;
        if (obj.top != null) obj.top = Math.round(obj.top / g) * g;
      });
    }

    // Keep objects within canvas during move/scale/rotate
    const refit = (e: fabric.IEvent) => {
      const obj = e?.target as fabric.Object | undefined;
      if (!obj) return;
      obj.setCoords();
      clampInBounds(obj);
      canvas.requestRenderAll();
    };

    ['object:moving', 'object:scaling', 'object:rotating'].forEach((evt) => {
      canvas.on(evt as any, refit);
    });

    // Persistence
    const saveState = () => {
      try {
        const json = JSON.stringify(canvas.toJSON());
        localStorage.setItem(options.storageKey, json);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('Failed saving canvas state', err);
      }
    };

    canvas.on('object:added', saveState);
    canvas.on('object:modified', saveState);
    canvas.on('object:removed', saveState);

    // Restore
    try {
      const saved = localStorage.getItem(options.storageKey);
      if (saved) {
        canvas.loadFromJSON(saved, () => canvas.requestRenderAll());
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('No saved canvas state or failed to load');
    }

    return () => {
      canvas.dispose();
      canvasRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasId]);

  return canvasRef;
};
