import React, { useEffect, useMemo, useState } from 'react';
import { useFabricEditor } from '@/hooks/useFabricEditor';
import { fabric } from 'fabric';
import { PREMIUM_LAYOUTS } from '@/data/premiumLayouts';
import { applyLayoutToFabricCanvas } from '@/utils/fabricLayoutMapper';

const SYSTEM_UI = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif';

const FabricSlideEditor: React.FC = () => {
  const canvasId = 'fabric-slide-canvas';
  const canvasRef = useFabricEditor(canvasId, {
    width: 960,
    height: 540,
    backgroundColor: '#ffffff',
    grid: 10,
    storageKey: 'fabric_canvas_state',
  });
  const [layoutId, setLayoutId] = useState<string>('title-body');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Only seed demo objects if nothing is on canvas yet
    if (canvas.getObjects().length === 0) {
      const rect = new fabric.Rect({
        left: 100,
        top: 100,
        width: 240,
        height: 120,
        fill: '#4F46E5', // indigo-600
        rx: 8,
        ry: 8,
        selectable: true,
        hasControls: true,
      });

      const text = new fabric.IText('Click to edit', {
        left: 160,
        top: 280,
        fontSize: 28,
        fill: '#111827', // gray-900
        fontFamily: SYSTEM_UI,
        editable: true,
        fontWeight: 'bold',
      });

      canvas.add(rect, text);
      canvas.setActiveObject(rect);
      canvas.requestRenderAll();
    }
  }, [canvasRef]);

  const layouts = useMemo(() => PREMIUM_LAYOUTS.map(l => ({ id: l.id, name: l.name })), []);

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#f0f2f5] p-4 relative">
      {/* Controls overlay */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white/90 backdrop-blur rounded-full shadow px-3 py-2 flex items-center gap-2 border border-slate-200">
        <select
          value={layoutId}
          onChange={(e) => setLayoutId(e.target.value)}
          className="text-sm px-2 py-1 rounded-md border border-slate-200 bg-white"
        >
          {layouts.map(l => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
        <button
          className="text-sm px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          onClick={() => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            applyLayoutToFabricCanvas(canvas, layoutId, { duration: 360, snap: true });
          }}
        >
          Apply Layout
        </button>
      </div>
      <div className="shadow-[0_10px_30px_rgba(0,0,0,0.12)] rounded-md overflow-hidden" style={{ width: 960, height: 540 }}>
        <canvas id={canvasId} />
      </div>
    </div>
  );
};

export default FabricSlideEditor;
