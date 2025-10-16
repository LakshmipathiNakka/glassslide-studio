import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { 
  Canvas, 
  FabricText, 
  Rect, 
  Circle, 
  FabricImage,
  Group,
  Point,
  Color,
  Shadow,
  Gradient,
  Pattern
} from 'fabric';
import { motion, AnimatePresence } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import { SlideElement } from '../../types/canvas';

interface FabricPowerPointCanvasProps {
  elements: SlideElement[];
  onElementSelect: (elementId: string | null) => void;
  onElementUpdate: (elementId: string, updates: Partial<SlideElement>) => void;
  onElementAdd: (element: Omit<SlideElement, 'id'>) => void;
  onElementDelete: (elementId: string) => void;
  selectedElementId: string | null;
  width?: number;
  height?: number;
  className?: string;
}

interface SnapGuide {
  x?: number;
  y?: number;
  type: 'vertical' | 'horizontal';
  elementId?: string;
}

const SLIDE_WIDTH = 1280;
const SLIDE_HEIGHT = 720;
const SNAP_THRESHOLD = 10;

export const FabricPowerPointCanvas: React.FC<FabricPowerPointCanvasProps> = ({
  elements,
  onElementSelect,
  onElementUpdate,
  onElementAdd,
  onElementDelete,
  selectedElementId,
  width = 1280,
  height = 720,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const [snapGuides, setSnapGuides] = useState<SnapGuide[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [editingElement, setEditingElement] = useState<string | null>(null);

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width: SLIDE_WIDTH,
      height: SLIDE_HEIGHT,
      backgroundColor: '#ffffff',
      selection: true,
      preserveObjectStacking: true,
      renderOnAddRemove: true,
      skipTargetFind: false,
      allowTouchScrolling: true,
      enableRetinaScaling: true,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high'
    });

    // Configure canvas for PowerPoint-like behavior
    canvas.on('selection:created' as any, handleSelection);
    canvas.on('selection:updated' as any, handleSelection);
    canvas.on('selection:cleared' as any, () => onElementSelect(null));
    canvas.on('object:moving' as any, handleObjectMoving);
    canvas.on('object:moved' as any, handleObjectMoved);
    canvas.on('object:scaling' as any, handleObjectScaling);
    canvas.on('object:scaled' as any, handleObjectScaled);
    canvas.on('object:rotating' as any, handleObjectRotating);
    canvas.on('object:rotated' as any, handleObjectRotated);
    canvas.on('mouse:dblclick' as any, handleDoubleClick);
    canvas.on('path:created' as any, handlePathCreated);

    fabricCanvasRef.current = canvas;

    return () => {
      canvas.dispose();
    };
  }, []);

  // Update canvas when elements change
  useEffect(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const currentObjects = canvas.getObjects();
    
    // Remove objects that are no longer in elements
    currentObjects.forEach(obj => {
      const elementId = (obj as any).elementId;
      if (elementId && !elements.find(el => el.id === elementId)) {
        canvas.remove(obj);
      }
    });

    // Add or update objects
    elements.forEach(element => {
      let fabricObject = currentObjects.find(obj => (obj as any).elementId === element.id) as any;
      
      if (!fabricObject) {
        fabricObject = createFabricObject(element);
        if (fabricObject) {
          canvas.add(fabricObject);
        }
      } else {
        updateFabricObject(fabricObject, element);
      }
    });

    canvas.renderAll();
  }, [elements]);

  // Create Fabric.js object from SlideElement
  const createFabricObject = useCallback((element: SlideElement): any | null => {
    const baseProps = {
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      elementId: element.id,
      selectable: true,
      evented: true,
      lockMovementX: false,
      lockMovementY: false,
      lockRotation: false,
      lockScalingX: false,
      lockScalingY: false,
      lockSkewingX: false,
      lockSkewingY: false,
      borderColor: '#0078d4',
      cornerColor: '#0078d4',
      cornerSize: 8,
      transparentCorners: false,
      borderScaleFactor: 1,
      borderOpacityWhenMoving: 0.8,
      cornerStrokeColor: '#ffffff',
      cornerStrokeWidth: 2,
      rotatingPointOffset: 30,
      padding: 8
    };

    switch (element.type) {
      case 'text':
      case 'placeholder':
        const textObject = new FabricText(element.text || element.placeholder || (element as any).hintText || 'Click to add text', {
          ...baseProps,
          fontSize: element.fontSize || 16,
          fontFamily: element.fontFamily || 'Segoe UI',
          fontWeight: element.fontWeight || 'normal',
          fontStyle: element.fontStyle || 'normal',
          textAlign: element.textAlign || 'left',
          fill: element.color || '#000000',
          backgroundColor: element.backgroundColor || 'transparent',
          stroke: element.borderColor || 'transparent',
          strokeWidth: element.borderWidth || 0,
          rx: element.borderRadius || 0,
          ry: element.borderRadius || 0,
          splitByGrapheme: true,
          charSpacing: 0,
          lineHeight: element.lineHeight || 1.2
        });
        return textObject;

      case 'image':
        // For now, create a placeholder rectangle for images
        const imageObject = new Rect({
          ...baseProps,
          fill: element.backgroundColor || '#f5f5f5',
          stroke: element.borderColor || '#cccccc',
          strokeWidth: element.borderWidth || 2,
          rx: element.borderRadius || 8,
          ry: element.borderRadius || 8
        });
        
        // Add text overlay for image placeholder
        const imageText = new FabricText(element.placeholder || 'Click to add image', {
          left: element.x + element.width / 2,
          top: element.y + element.height / 2,
          fontSize: 16,
          fontFamily: 'Segoe UI',
          fill: '#666666',
          textAlign: 'center',
          originX: 'center',
          originY: 'center',
          selectable: false,
          evented: false
        });
        
        const group = new Group([imageObject, imageText], {
          ...baseProps,
          subTargetCheck: true
        });
        return group;

      case 'shape':
        const shapeObject = new Rect({
          ...baseProps,
          fill: element.backgroundColor || '#e3f2fd',
          stroke: element.borderColor || '#2196f3',
          strokeWidth: element.borderWidth || 2,
          rx: element.borderRadius || 8,
          ry: element.borderRadius || 8
        });
        return shapeObject;

      case 'chart':
        const chartObject = new Rect({
          ...baseProps,
          fill: element.backgroundColor || '#f8f9fa',
          stroke: element.borderColor || '#0078d4',
          strokeWidth: element.borderWidth || 2,
          rx: element.borderRadius || 8,
          ry: element.borderRadius || 8
        });
        
        const chartText = new FabricText(element.placeholder || 'Click to add chart', {
          left: element.x + element.width / 2,
          top: element.y + element.height / 2,
          fontSize: 18,
          fontFamily: 'Segoe UI',
          fill: '#666666',
          textAlign: 'center',
          originX: 'center',
          originY: 'center',
          selectable: false,
          evented: false
        });
        
        const chartGroup = new Group([chartObject, chartText], {
          ...baseProps,
          subTargetCheck: true
        });
        return chartGroup;

      default:
        return null;
    }
  }, []);

  // Update existing Fabric.js object
  const updateFabricObject = useCallback((fabricObject: any, element: SlideElement) => {
    fabricObject.set({
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height
    });

    if (fabricObject.type === 'textbox') {
      fabricObject.set({
        text: element.text || element.placeholder || (element as any).hintText || 'Click to add text',
        fontSize: element.fontSize || 16,
        fontFamily: element.fontFamily || 'Segoe UI',
        fontWeight: element.fontWeight || 'normal',
        fontStyle: element.fontStyle || 'normal',
        textAlign: element.textAlign || 'left',
        fill: element.color || '#000000',
        backgroundColor: element.backgroundColor || 'transparent',
        stroke: element.borderColor || 'transparent',
        strokeWidth: element.borderWidth || 0,
        rx: element.borderRadius || 0,
        ry: element.borderRadius || 0,
        lineHeight: element.lineHeight || 1.2
      });
    }

    fabricObject.setCoords();
  }, []);

  // Handle selection events
  const handleSelection = useCallback((e: any) => {
    const activeObject = e.selected?.[0] as any;
    if (activeObject?.elementId) {
      onElementSelect(activeObject.elementId);
    }
  }, [onElementSelect]);

  // Handle object moving with snapping
  const handleObjectMoving = useCallback((e: any) => {
    if (!fabricCanvasRef.current) return;
    
    const obj = e.target as any;
    if (!obj?.elementId) return;

    setIsDragging(true);
    
    // Calculate snap guides
    const guides = calculateSnapGuides(obj, elements);
    setSnapGuides(guides);

    // Apply snapping
    const snappedPosition = applySnapping(obj, guides);
    if (snappedPosition) {
      obj.set(snappedPosition);
    }
  }, [elements]);

  // Handle object moved
  const handleObjectMoved = useCallback((e: any) => {
    const obj = e.target as any;
    if (!obj?.elementId) return;

    onElementUpdate(obj.elementId, {
      x: obj.left,
      y: obj.top
    });

    setIsDragging(false);
    setSnapGuides([]);
  }, [onElementUpdate]);

  // Handle object scaling
  const handleObjectScaling = useCallback((e: any) => {
    const obj = e.target as any;
    if (!obj?.elementId) return;

    // Maintain aspect ratio if Shift is pressed
    if (e.e?.shiftKey) {
      const scale = Math.min(obj.scaleX, obj.scaleY);
      obj.set({ scaleX: scale, scaleY: scale });
    }
  }, []);

  // Handle object scaled
  const handleObjectScaled = useCallback((e: any) => {
    const obj = e.target as any;
    if (!obj?.elementId) return;

    onElementUpdate(obj.elementId, {
      width: obj.width * obj.scaleX,
      height: obj.height * obj.scaleY
    });
  }, [onElementUpdate]);

  // Handle object rotating
  const handleObjectRotating = useCallback((e: any) => {
    // Snap rotation to 15-degree increments if Shift is pressed
    if (e.e?.shiftKey) {
      const obj = e.target as any;
      const angle = Math.round(obj.angle / 15) * 15;
      obj.set({ angle });
    }
  }, []);

  // Handle object rotated
  const handleObjectRotated = useCallback((e: any) => {
    const obj = e.target as any;
    if (!obj?.elementId) return;

    onElementUpdate(obj.elementId, {
      rotation: obj.angle
    });
  }, [onElementUpdate]);

  // Handle double click for text editing
  const handleDoubleClick = useCallback((e: any) => {
    const obj = e.target as any;
    if (obj?.elementId && (obj.type === 'textbox' || obj.type === 'group')) {
      setEditingElement(obj.elementId);
    }
  }, []);

  // Handle path creation (for drawing tools)
  const handlePathCreated = useCallback((e: any) => {
    const path = e.path;
    if (path) {
      const elementId = `path-${Date.now()}`;
      path.set({ elementId });
      
      onElementAdd({
        type: 'shape',
        x: path.left || 0,
        y: path.top || 0,
        width: path.width || 100,
        height: path.height || 100,
        rotation: path.angle || 0,
        zIndex: 1
      });
    }
  }, [onElementAdd]);

  // Calculate snap guides
  const calculateSnapGuides = useCallback((obj: any, elements: SlideElement[]): SnapGuide[] => {
    const guides: SnapGuide[] = [];
    const objLeft = obj.left;
    const objRight = obj.left + obj.width;
    const objTop = obj.top;
    const objBottom = obj.top + obj.height;
    const objCenterX = objLeft + obj.width / 2;
    const objCenterY = objTop + obj.height / 2;

    // Slide boundaries
    guides.push(
      { x: 0, type: 'vertical' },
      { x: SLIDE_WIDTH, type: 'vertical' },
      { y: 0, type: 'horizontal' },
      { y: SLIDE_HEIGHT, type: 'horizontal' },
      { x: SLIDE_WIDTH / 2, type: 'vertical' },
      { y: SLIDE_HEIGHT / 2, type: 'horizontal' }
    );

    // Other elements
    elements.forEach(element => {
      if (element.id === obj.elementId) return;

      const elementLeft = element.x;
      const elementRight = element.x + element.width;
      const elementTop = element.y;
      const elementBottom = element.y + element.height;
      const elementCenterX = elementLeft + element.width / 2;
      const elementCenterY = elementTop + element.height / 2;

      // Edge alignment
      guides.push(
        { x: elementLeft, type: 'vertical', elementId: element.id },
        { x: elementRight, type: 'vertical', elementId: element.id },
        { y: elementTop, type: 'horizontal', elementId: element.id },
        { y: elementBottom, type: 'horizontal', elementId: element.id }
      );

      // Center alignment
      guides.push(
        { x: elementCenterX, type: 'vertical', elementId: element.id },
        { y: elementCenterY, type: 'horizontal', elementId: element.id }
      );
    });

    return guides;
  }, []);

  // Apply snapping to object
  const applySnapping = useCallback((obj: any, guides: SnapGuide[]): Partial<any> | null => {
    const snapThreshold = SNAP_THRESHOLD;
    const objLeft = obj.left;
    const objRight = obj.left + obj.width;
    const objTop = obj.top;
    const objBottom = obj.top + obj.height;
    const objCenterX = objLeft + obj.width / 2;
    const objCenterY = objTop + obj.height / 2;

    let snappedX = objLeft;
    let snappedY = objTop;

    // Check vertical snapping
    for (const guide of guides) {
      if (guide.type === 'vertical' && guide.x !== undefined) {
        const distance = Math.abs(objLeft - guide.x);
        if (distance < snapThreshold) {
          snappedX = guide.x;
          break;
        }
        
        const distanceRight = Math.abs(objRight - guide.x);
        if (distanceRight < snapThreshold) {
          snappedX = guide.x - obj.width;
          break;
        }
        
        const distanceCenter = Math.abs(objCenterX - guide.x);
        if (distanceCenter < snapThreshold) {
          snappedX = guide.x - obj.width / 2;
          break;
        }
      }
    }

    // Check horizontal snapping
    for (const guide of guides) {
      if (guide.type === 'horizontal' && guide.y !== undefined) {
        const distance = Math.abs(objTop - guide.y);
        if (distance < snapThreshold) {
          snappedY = guide.y;
          break;
        }
        
        const distanceBottom = Math.abs(objBottom - guide.y);
        if (distanceBottom < snapThreshold) {
          snappedY = guide.y - obj.height;
          break;
        }
        
        const distanceCenter = Math.abs(objCenterY - guide.y);
        if (distanceCenter < snapThreshold) {
          snappedY = guide.y - obj.height / 2;
          break;
        }
      }
    }

    if (snappedX !== objLeft || snappedY !== objTop) {
      return { left: snappedX, top: snappedY };
    }

    return null;
  }, []);

  // Keyboard shortcuts
  useHotkeys('delete', () => {
    if (selectedElementId) {
      onElementDelete(selectedElementId);
    }
  }, [selectedElementId, onElementDelete]);

  useHotkeys('ctrl+z', () => {
    // Undo functionality would be implemented here
    // console.log('Undo');
  });

  useHotkeys('ctrl+y', () => {
    // Redo functionality would be implemented here
    // console.log('Redo');
  });

  useHotkeys('ctrl+c', () => {
    // Copy functionality would be implemented here
    // console.log('Copy');
  });

  useHotkeys('ctrl+v', () => {
    // Paste functionality would be implemented here
    // console.log('Paste');
  });

  // Calculate canvas scale for responsive design
  const canvasScale = useMemo(() => {
    const scaleX = width / SLIDE_WIDTH;
    const scaleY = height / SLIDE_HEIGHT;
    return Math.min(scaleX, scaleY);
  }, [width, height]);

  const canvasStyle = useMemo(() => ({
    transform: `scale(${canvasScale})`,
    transformOrigin: 'top left',
    width: SLIDE_WIDTH,
    height: SLIDE_HEIGHT
  }), [canvasScale]);

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {/* Canvas container */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div style={canvasStyle}>
          <canvas ref={canvasRef} />
        </div>
      </div>

      {/* Snap guides overlay */}
      <AnimatePresence>
        {snapGuides.length > 0 && isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
            style={{ transform: `scale(${canvasScale})`, transformOrigin: 'top left' }}
          >
            {snapGuides.map((guide, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute bg-blue-500"
                style={{
                  left: guide.x ? guide.x - 1 : 0,
                  top: guide.y ? guide.y - 1 : 0,
                  width: guide.type === 'vertical' ? 2 : '100%',
                  height: guide.type === 'horizontal' ? 2 : '100%',
                  zIndex: 1000
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty slide message */}
      {elements.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="text-center text-gray-500">
            <div className="text-2xl font-light mb-2">Empty Slide</div>
            <div className="text-sm">Add elements using the toolbar</div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FabricPowerPointCanvas;
