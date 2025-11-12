import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface Element {
  id: string;
  type: 'text' | 'image' | 'shape' | 'chart';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  content?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  color?: string;
  textAlign?: string;
  fill?: string;
  shapeType?: 'rectangle' | 'circle';
  src?: string;
}

interface CanvasProps {
  elements: Element[];
  onElementsChange: (elements: Element[]) => void;
  onElementSelect: (element: Element | null) => void;
  onEditChart?: (element: Element) => void;
  onDeleteElement?: (elementId: string) => void;
  onAddText?: () => void;
  onAddShape?: (shapeType: 'rectangle' | 'circle') => void;
  onAddChart?: () => void;
}

interface DragState {
  id: string;
  startX: number;
  startY: number;
  startElementX: number;
  startElementY: number;
}

interface ResizeState {
  id: string;
  handle: string;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  startElementX: number;
  startElementY: number;
}

interface AlignmentGuide {
  id: string;
  type: 'horizontal' | 'vertical';
  position: number;
  color: string;
}

export const Canvas: React.FC<CanvasProps> = ({
  elements,
  onElementsChange,
  onElementSelect,
  onEditChart,
  onDeleteElement,
  onAddText,
  onAddShape,
  onAddChart,
}) => {
  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const slideRef = useRef<HTMLDivElement>(null);

  // State
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [editingElement, setEditingElement] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [resizeState, setResizeState] = useState<ResizeState | null>(null);
  const [alignmentGuides, setAlignmentGuides] = useState<AlignmentGuide[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  
  // Track deleted default elements
  const [deletedDefaultElements, setDeletedDefaultElements] = useState<Set<string>>(new Set());

  // Canvas dimensions (16:9 aspect ratio)
  const SLIDE_WIDTH = 1280;
  const SLIDE_HEIGHT = 720;
  const GRID_SIZE = 20;
  const SNAP_THRESHOLD = 10;

  // Handle element selection
  const handleElementSelect = useCallback((element: Element | null) => {
    setSelectedElement(element);
    onElementSelect(element);
    setEditingElement(null);
    setAlignmentGuides([]);
  }, [onElementSelect]);

  // Handle canvas click (deselect)
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === slideRef.current || e.target === canvasRef.current) {
      handleElementSelect(null);
    }
  }, [handleElementSelect]);

  // Handle element click
  const handleElementClick = useCallback((e: React.MouseEvent, element: Element) => {
    e.stopPropagation();
    
    // Check if it's a placeholder or default element
    const isPlaceholder = element.content?.includes('Click here to add');
    const isDefaultElement = element.id === 'default-title' || element.id === 'default-subtitle' || element.id === 'title' || element.id === 'subtitle';
    
    if (isPlaceholder || isDefaultElement) {
      if ((element.content?.includes('title') || element.id === 'default-title') && onAddText) {
        // Convert default title to real element
        const newElement: Element = {
          id: 'title', // PowerPoint-style ID
          type: 'text',
          x: element.x,
          y: element.y,
          width: element.width,
          height: element.height,
          content: undefined, // No content initially, will show placeholder
          fontSize: element.fontSize || 28,
          fontWeight: 'bold',
          color: '#000000',
          textAlign: 'center'
        };
        
        const updatedElements = [...(elements || []), newElement];
        onElementsChange(updatedElements);
        handleElementSelect(newElement);
        
        // Start editing immediately
        setEditingElement(newElement.id);
        setEditText('');
        return;
      } else if ((element.content?.includes('subtitle') || element.id === 'default-subtitle') && onAddText) {
        // Convert default subtitle to real element
        const newElement: Element = {
          id: 'subtitle', // PowerPoint-style ID
          type: 'text',
          x: element.x,
          y: element.y,
          width: element.width,
          height: element.height,
          content: undefined, // No content initially, will show placeholder
          fontSize: element.fontSize || 20,
          fontWeight: 'normal',
          color: '#000000',
          textAlign: 'center'
        };
        
        const updatedElements = [...(elements || []), newElement];
        onElementsChange(updatedElements);
        handleElementSelect(newElement);
        
        // Start editing immediately
        setEditingElement(newElement.id);
        setEditText('');
        return;
      } else if (element.content?.includes('text') && onAddText) {
        onAddText();
      } else if (element.content?.includes('shape') && onAddShape) {
        onAddShape('rectangle');
      } else if (element.content?.includes('chart') && onAddChart) {
        onAddChart();
      }
      return;
    }

    handleElementSelect(element);
  }, [handleElementSelect, onAddText, onAddImage, onAddShape, onAddChart, elements, onElementsChange]);

  // Handle double click for text editing
  const handleElementDoubleClick = useCallback((e: React.MouseEvent, element: Element) => {
    e.stopPropagation();
    
    const isDefaultElement = element.id === 'default-title' || element.id === 'default-subtitle' || element.id === 'title' || element.id === 'subtitle';
    
    if (element.type === 'text' || isDefaultElement) {
      setEditingElement(element.id);
      // For default elements, start with empty text to show placeholder
      // For real elements, use their content or empty string
      setEditText(isDefaultElement ? '' : (element.content || ''));
    } else if (element.type === 'chart' && onEditChart) {
      onEditChart(element);
    }
  }, [onEditChart]);

  // Calculate alignment guides
  const calculateAlignmentGuides = useCallback((targetElement: Element) => {
    const guides: AlignmentGuide[] = [];
    
    // Slide center guides
    guides.push({
      id: 'slide-center-h',
      type: 'horizontal',
      position: SLIDE_HEIGHT / 2,
      color: '#0078d4'
    });
    
    guides.push({
      id: 'slide-center-v',
      type: 'vertical',
      position: SLIDE_WIDTH / 2,
      color: '#0078d4'
    });

    // Element alignment guides
    elements.forEach(element => {
      if (element.id === targetElement.id) return;

      // Horizontal alignment (top edges)
      if (Math.abs(element.y - targetElement.y) < SNAP_THRESHOLD) {
        guides.push({
          id: `align-h-${element.id}`,
          type: 'horizontal',
          position: element.y,
          color: '#0078d4'
        });
      }

      // Vertical alignment (left edges)
      if (Math.abs(element.x - targetElement.x) < SNAP_THRESHOLD) {
        guides.push({
          id: `align-v-${element.id}`,
          type: 'vertical',
          position: element.x,
          color: '#0078d4'
        });
      }

      // Center alignment
      const targetCenterX = targetElement.x + targetElement.width / 2;
      const targetCenterY = targetElement.y + targetElement.height / 2;
      const elementCenterX = element.x + element.width / 2;
      const elementCenterY = element.y + element.height / 2;

      if (Math.abs(elementCenterX - targetCenterX) < SNAP_THRESHOLD) {
        guides.push({
          id: `align-center-v-${element.id}`,
          type: 'vertical',
          position: elementCenterX,
          color: '#ff6b6b'
        });
      }

      if (Math.abs(elementCenterY - targetCenterY) < SNAP_THRESHOLD) {
        guides.push({
          id: `align-center-h-${element.id}`,
          type: 'horizontal',
          position: elementCenterY,
          color: '#ff6b6b'
        });
      }
    });

    setAlignmentGuides(guides);
  }, [elements]);

  // Apply snap to guides
  const applySnap = useCallback((x: number, y: number, width: number, height: number) => {
    let snappedX = x;
    let snappedY = y;

    // Snap to grid
    snappedX = Math.round(x / GRID_SIZE) * GRID_SIZE;
    snappedY = Math.round(y / GRID_SIZE) * GRID_SIZE;

    // Snap to guides
    alignmentGuides.forEach(guide => {
      if (guide.type === 'horizontal' && Math.abs(y - guide.position) < SNAP_THRESHOLD) {
        snappedY = guide.position;
      }
      if (guide.type === 'vertical' && Math.abs(x - guide.position) < SNAP_THRESHOLD) {
        snappedX = guide.position;
      }
    });

    // Snap to slide edges
    if (Math.abs(x) < SNAP_THRESHOLD) snappedX = 0;
    if (Math.abs(y) < SNAP_THRESHOLD) snappedY = 0;
    if (Math.abs(x + width - SLIDE_WIDTH) < SNAP_THRESHOLD) snappedX = SLIDE_WIDTH - width;
    if (Math.abs(y + height - SLIDE_HEIGHT) < SNAP_THRESHOLD) snappedY = SLIDE_HEIGHT - height;

    return { x: snappedX, y: snappedY };
  }, [alignmentGuides]);

  // Handle drag start
  const handleDragStart = useCallback((e: React.MouseEvent, element: Element) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (editingElement === element.id) return;

    setIsDragging(true);
    setDragState({
      id: element.id,
        startX: e.clientX,
        startY: e.clientY,
      startElementX: element.x,
      startElementY: element.y
    });

    handleElementSelect(element);
    calculateAlignmentGuides(element);
  }, [editingElement, handleElementSelect, calculateAlignmentGuides]);

  // Handle drag
  const handleDrag = useCallback((e: MouseEvent) => {
    if (!dragState) return;

    // Check if we're dragging a default element
    const isDefaultElement = dragState.id === 'default-title' || dragState.id === 'default-subtitle';
    
    if (isDefaultElement) {
      // Convert default element to real element first
      const defaultElement = dragState.id === 'default-title' 
        ? {
            id: 'title', // PowerPoint-style ID
            type: 'text' as const,
            x: dragState.startElementX,
            y: dragState.startElementY,
            width: 600,
            height: 80,
            content: undefined, // No content initially, will show placeholder
            fontSize: 28,
            fontWeight: 'bold',
            color: '#000000',
            textAlign: 'center'
          }
        : {
            id: 'subtitle', // PowerPoint-style ID
            type: 'text' as const,
            x: dragState.startElementX,
            y: dragState.startElementY,
            width: 500,
            height: 60,
            content: undefined, // No content initially, will show placeholder
            fontSize: 20,
            fontWeight: 'normal',
            color: '#000000',
            textAlign: 'center'
          };

      const deltaX = e.clientX - dragState.startX;
      const deltaY = e.clientY - dragState.startY;
      const newX = dragState.startElementX + deltaX;
      const newY = dragState.startElementY + deltaY;
      const snapped = applySnap(newX, newY, defaultElement.width, defaultElement.height);

      const newElement = { ...defaultElement, x: snapped.x, y: snapped.y };
      const updatedElements = [...(elements || []), newElement];
      onElementsChange(updatedElements);
      handleElementSelect(newElement);
      
      // Update drag state to continue dragging the new element
      setDragState({
        id: newElement.id,
        startX: e.clientX,
        startY: e.clientY,
        startElementX: newElement.x,
        startElementY: newElement.y
      });
      return;
    }

    if (!selectedElement) return;

    const deltaX = e.clientX - dragState.startX;
    const deltaY = e.clientY - dragState.startY;

    const newX = dragState.startElementX + deltaX;
    const newY = dragState.startElementY + deltaY;

    const snapped = applySnap(newX, newY, selectedElement.width, selectedElement.height);

    const updatedElements = elements.map(el =>
      el.id === dragState.id
        ? { ...el, x: snapped.x, y: snapped.y }
        : el
    );
    onElementsChange(updatedElements);
  }, [dragState, selectedElement, elements, onElementsChange, applySnap, handleElementSelect]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDragState(null);
    setAlignmentGuides([]);
  }, []);

  // Handle resize start
  const handleResizeStart = useCallback((e: React.MouseEvent, element: Element, handle: string) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if we're resizing a default element
    const isDefaultElement = element.id === 'default-title' || element.id === 'default-subtitle' || element.id === 'title' || element.id === 'subtitle';
    
    if (isDefaultElement) {
      // Convert default element to real element first
      const newElement: Element = element.id === 'default-title' 
        ? {
            id: 'title', // PowerPoint-style ID
            type: 'text',
            x: element.x,
            y: element.y,
            width: element.width,
            height: element.height,
            content: undefined, // No content initially, will show placeholder
            fontSize: element.fontSize || 28,
            fontWeight: 'bold',
            color: '#000000',
            textAlign: 'center'
          }
        : {
            id: 'subtitle', // PowerPoint-style ID
            type: 'text',
            x: element.x,
            y: element.y,
            width: element.width,
            height: element.height,
            content: undefined, // No content initially, will show placeholder
            fontSize: element.fontSize || 20,
            fontWeight: 'normal',
            color: '#000000',
            textAlign: 'center'
          };

      const updatedElements = [...(elements || []), newElement];
      onElementsChange(updatedElements);
      handleElementSelect(newElement);

      // Start resizing the new element
      setIsResizing(true);
      setResizeState({
        id: newElement.id,
        handle,
        startX: e.clientX,
        startY: e.clientY,
        startWidth: newElement.width,
        startHeight: newElement.height,
        startElementX: newElement.x,
        startElementY: newElement.y
      });

      calculateAlignmentGuides(newElement);
      return;
    }
    
    setIsResizing(true);
    setResizeState({
      id: element.id,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: element.width,
      startHeight: element.height,
      startElementX: element.x,
      startElementY: element.y
    });

    handleElementSelect(element);
    calculateAlignmentGuides(element);
  }, [handleElementSelect, calculateAlignmentGuides, elements, onElementsChange]);

  // Handle resize
  const handleResize = useCallback((e: MouseEvent) => {
    if (!resizeState || !selectedElement) return;

    const deltaX = e.clientX - resizeState.startX;
    const deltaY = e.clientY - resizeState.startY;

    let newX = resizeState.startElementX;
    let newY = resizeState.startElementY;
    let newWidth = resizeState.startWidth;
    let newHeight = resizeState.startHeight;

    const { handle } = resizeState;

    // Handle different resize directions
    if (handle.includes('n')) { // North (top)
      newHeight = Math.max(20, resizeState.startHeight - deltaY);
      newY = resizeState.startElementY + (resizeState.startHeight - newHeight);
    }
    if (handle.includes('s')) { // South (bottom)
      newHeight = Math.max(20, resizeState.startHeight + deltaY);
    }
    if (handle.includes('w')) { // West (left)
      newWidth = Math.max(20, resizeState.startWidth - deltaX);
      newX = resizeState.startElementX + (resizeState.startWidth - newWidth);
    }
    if (handle.includes('e')) { // East (right)
      newWidth = Math.max(20, resizeState.startWidth + deltaX);
    }

    // Apply snap
    const snapped = applySnap(newX, newY, newWidth, newHeight);

    const updatedElements = elements.map(el =>
      el.id === resizeState.id
          ? { 
          ...el,
            x: snapped.x, 
            y: snapped.y, 
            width: newWidth, 
            height: newHeight 
            }
          : el
      );
    onElementsChange(updatedElements);
  }, [resizeState, selectedElement, elements, onElementsChange, applySnap]);

  // Handle resize end
  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
      setResizeState(null);
    setAlignmentGuides([]);
  }, []);

  // Mouse event listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragState) {
        handleDrag(e);
      } else if (resizeState) {
        handleResize(e);
      }
    };

    const handleMouseUp = () => {
      if (dragState) {
        handleDragEnd();
      } else if (resizeState) {
        handleResizeEnd();
      }
    };

    if (dragState || resizeState) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, resizeState, handleDrag, handleResize, handleDragEnd, handleResizeEnd]);

  // Handle text editing
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditText(e.target.value);
  }, []);

  const handleTextSave = useCallback(() => {
    if (!editingElement) return;

    // Check if we're editing a default element
    const isDefaultElement = editingElement === 'default-title' || editingElement === 'default-subtitle';
    
    if (isDefaultElement) {
      // Convert default element to real element with the edited text
      const defaultElement = editingElement === 'default-title' 
        ? {
            id: 'title', // PowerPoint-style ID
            type: 'text' as const,
            x: SLIDE_WIDTH / 2 - 300,
            y: SLIDE_HEIGHT / 2 - 100,
            width: Math.min(600, SLIDE_WIDTH * 0.6),
            height: Math.min(80, SLIDE_HEIGHT * 0.1),
            content: editText.trim() === '' ? undefined : editText,
            fontSize: Math.min(28, SLIDE_WIDTH * 0.022),
            fontWeight: 'bold',
            color: '#000000',
            textAlign: 'center'
          }
        : {
            id: 'subtitle', // PowerPoint-style ID
            type: 'text' as const,
            x: SLIDE_WIDTH / 2 - 250,
            y: SLIDE_HEIGHT / 2 + 20,
            width: Math.min(500, SLIDE_WIDTH * 0.5),
            height: Math.min(60, SLIDE_HEIGHT * 0.08),
            content: editText.trim() === '' ? undefined : editText,
            fontSize: Math.min(20, SLIDE_WIDTH * 0.016),
            fontWeight: 'normal',
            color: '#000000',
            textAlign: 'center'
          };

      const updatedElements = [...(elements || []), defaultElement];
      onElementsChange(updatedElements);
      handleElementSelect(defaultElement);
    } else {
      const updatedElements = elements.map(el =>
        el.id === editingElement
          ? { 
              ...el, 
              content: editText.trim() === '' ? undefined : editText 
            }
          : el
      );
      onElementsChange(updatedElements);
    }

    setEditingElement(null);
    setEditText('');
  }, [editingElement, editText, elements, onElementsChange, handleElementSelect]);

  const handleTextCancel = useCallback(() => {
    setEditingElement(null);
    setEditText('');
  }, []);

  // Handle element deletion (from properties panel or keyboard)
  const handleDeleteElement = useCallback((elementId: string) => {
    
    // Special handling for default elements
    if (elementId === 'default-title' || elementId === 'default-subtitle') {
      // Mark the default element as deleted
      setDeletedDefaultElements(prev => new Set(prev).add(elementId));
      handleElementSelect(null);
    } else {
      // Normal deletion for regular elements
      if (onDeleteElement) {
        onDeleteElement(elementId);
        handleElementSelect(null);
      }
    }
  }, [onDeleteElement, handleElementSelect]);

  // Check if we should show default elements
  const shouldShowDefaultTitle = useMemo(() => {
    // Don't show if it was explicitly deleted
    if (deletedDefaultElements.has('default-title')) {
      return false;
    }
    
    return !elements || !elements.some(el => 
      el.id === 'default-title' || 
      el.id === 'title' || 
      (el.type === 'text' && el.fontWeight === 'bold' && el.fontSize && el.fontSize >= 24)
    );
  }, [elements, deletedDefaultElements]);

  const shouldShowDefaultSubtitle = useMemo(() => {
    // Don't show if it was explicitly deleted
    if (deletedDefaultElements.has('default-subtitle')) {
      return false;
    }
    
    return !elements || !elements.some(el => 
      el.id === 'default-subtitle' || 
      el.id === 'subtitle' || 
      (el.type === 'text' && el.fontWeight === 'normal' && el.fontSize && el.fontSize < 24)
    );
  }, [elements, deletedDefaultElements]);

  // Reset deleted default elements when slide changes (optional - for new slides)
  useEffect(() => {
    // Reset deleted elements when elements array is empty (new slide)
    if (!elements || elements.length === 0) {
      setDeletedDefaultElements(new Set());
    }
  }, [elements]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedElement) {
        // Check if it's a default element or PowerPoint-style element
        const isDefaultElement = selectedElement.id === 'default-title' || selectedElement.id === 'default-subtitle' || selectedElement.id === 'title' || selectedElement.id === 'subtitle';
        
        if (isDefaultElement) {
          // For default elements, just deselect (they can't be deleted with keyboard)
          handleElementSelect(null);
        } else if (onDeleteElement) {
          onDeleteElement(selectedElement.id);
          handleElementSelect(null);
        }
      } else if (e.key === 'Escape') {
        handleElementSelect(null);
        setEditingElement(null);
      } else if (e.key === 'Enter' && e.ctrlKey && editingElement) {
        handleTextSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, onDeleteElement, handleElementSelect, editingElement, handleTextSave]);

  // Render alignment guides
  const renderAlignmentGuides = () => (
    <AnimatePresence>
      {alignmentGuides.map(guide => (
        <motion.div
          key={guide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute pointer-events-none z-50"
          style={{
            [guide.type === 'horizontal' ? 'top' : 'left']: guide.position,
            [guide.type === 'horizontal' ? 'left' : 'top']: 0,
            [guide.type === 'horizontal' ? 'width' : 'height']: '100%',
            [guide.type === 'horizontal' ? 'height' : 'width']: 2,
            backgroundColor: guide.color,
            boxShadow: `0 0 4px ${guide.color}`
          }}
        />
      ))}
    </AnimatePresence>
  );

  // Render resize handles
  const renderResizeHandles = (element: Element) => {
    if (selectedElement?.id !== element.id) return null;

    const handles = [
      { id: 'nw', cursor: 'nw-resize', position: { top: -4, left: -4 } },
      { id: 'n', cursor: 'n-resize', position: { top: -4, left: '50%', transform: 'translateX(-50%)' } },
      { id: 'ne', cursor: 'ne-resize', position: { top: -4, right: -4 } },
      { id: 'w', cursor: 'w-resize', position: { top: '50%', left: -4, transform: 'translateY(-50%)' } },
      { id: 'e', cursor: 'e-resize', position: { top: '50%', right: -4, transform: 'translateY(-50%)' } },
      { id: 'sw', cursor: 'sw-resize', position: { bottom: -4, left: -4 } },
      { id: 's', cursor: 's-resize', position: { bottom: -4, left: '50%', transform: 'translateX(-50%)' } },
      { id: 'se', cursor: 'se-resize', position: { bottom: -4, right: -4 } }
    ];

  return (
      <>
        {handles.map(handle => (
          <motion.div
            key={handle.id}
            className="absolute w-3 h-3 bg-blue-500 border-2 border-white rounded-full shadow-lg cursor-pointer"
            style={{
              ...handle.position,
              cursor: handle.cursor,
              zIndex: 1001
            }}
            onMouseDown={(e) => handleResizeStart(e, element, handle.id)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </>
    );
  };

  // Render grid (moved to canvas background)
  const renderGrid = () => (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(0, 0, 0, 0.15) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0, 0, 0, 0.15) 1px, transparent 1px)
        `,
        backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
        opacity: 0.8
      }}
    />
  );

  // Get placeholder text for empty elements
  const getPlaceholderText = (element: Element) => {
    // Check if element is a title element (by ID or content)
    const isTitleElement = element.id === 'default-title' || 
                          element.id === 'title' || 
                          element.content?.includes('Title') ||
                          (element.type === 'text' && element.fontWeight === 'bold' && element.fontSize && element.fontSize >= 24);
    
    // Check if element is a subtitle element (by ID or content)
    const isSubtitleElement = element.id === 'default-subtitle' || 
                             element.id === 'subtitle' || 
                             element.content?.includes('Subtitle') ||
                             (element.type === 'text' && element.fontWeight === 'normal' && element.fontSize && element.fontSize < 24);
    
    if (isTitleElement) {
      return 'Click to add title';
    } else if (isSubtitleElement) {
      return 'Click to add subtitle';
    } else if (element.content?.includes('text')) {
      return 'Click here to add text';
    } else if (element.content?.includes('image')) {
      return 'Click here to add image';
    } else if (element.content?.includes('shape')) {
      return 'Click here to add shape';
    } else if (element.content?.includes('chart')) {
      return 'Click here to add chart';
    }
    return 'Double-click to edit';
  };

  // Render element
  const renderElement = (element: Element) => {
    const isSelected = selectedElement?.id === element.id;
    const isEditing = editingElement === element.id;
          const isPlaceholder = element.content?.includes('Click here to add');
    const isDefaultElement = element.id === 'default-title' || element.id === 'default-subtitle' || element.id === 'title' || element.id === 'subtitle';
          
          return (
      <motion.div
            key={element.id}
        className={`absolute select-none ${
          isSelected ? 'ring-2 ring-blue-500' : ''
        }         ${
          (isPlaceholder || isDefaultElement || (!element.content || element.content.trim() === '')) ? 'border-2 border-dashed border-gray-400 bg-gray-50' : ''
        } ${
          isDragging || isResizing ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            style={{
              left: element.x,
              top: element.y,
              width: element.width,
              height: element.height,
          transform: element.rotation ? `rotate(${element.rotation}deg)` : 'none',
          transformOrigin: 'center center',
          zIndex: isSelected ? 1000 : 1
        }}
        onClick={(e) => handleElementClick(e, element)}
        onDoubleClick={(e) => handleElementDoubleClick(e, element)}
        onMouseDown={(e) => handleDragStart(e, element)}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        whileHover={{ scale: isSelected ? 1 : 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Element content */}
        <div className="w-full h-full relative overflow-hidden">
            {element.type === 'text' && (
            <div className="w-full h-full flex items-center justify-center p-2">
              {isEditing ? (
                  <textarea
                    value={editText}
                  onChange={handleTextChange}
                    onBlur={handleTextSave}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        handleTextSave();
                      } else if (e.key === 'Escape') {
                        handleTextCancel();
                      }
                    }}
                  className="w-full h-full bg-transparent border-none outline-none resize-none text-center"
                    style={{ 
                    fontSize: element.fontSize || 18,
                      fontWeight: element.fontWeight || 'normal',
                      fontStyle: element.fontStyle || 'normal',
                      color: element.color || '#000000',
                    fontFamily: 'inherit'
                    }}
                    autoFocus
                  />
                ) : (
                  <div 
                  className="w-full h-full flex items-center justify-center"
                    style={{
                    fontSize: element.fontSize || 18,
                    fontWeight: element.fontWeight || 'normal',
                    fontStyle: element.fontStyle || 'normal',
                    color: (isPlaceholder || isDefaultElement || (!element.content || element.content.trim() === '')) ? '#000000' : (element.color || '#000000'),
                    textAlign: (element.textAlign as any) || 'center'
                  }}
                >
                  {element.content && element.content.trim() !== '' 
                    ? element.content 
                    : getPlaceholderText(element)
                  }
                  </div>
                )}
              </div>
            )}
            
          {element.type === 'image' && (
            <img
              src={element.src || element.content}
              alt="Slide element"
              className="w-full h-full object-cover"
              draggable={false}
            />
          )}

          {element.type === 'shape' && (
            <div
              className="w-full h-full border-2"
                style={{ 
                backgroundColor: element.fill || '#000000',
                borderRadius: element.shapeType === 'circle' ? '50%' : '0',
                borderColor: element.fill || '#000000'
                }}
              />
            )}
            
          {element.type === 'chart' && (
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl mb-2">📊</div>
                <div className="text-sm text-blue-600">Chart</div>
                <div className="text-xs text-blue-500">Double-click to edit</div>
                </div>
              </div>
            )}
          </div>

        {/* Resize handles */}
        {renderResizeHandles(element)}
      </motion.div>
    );
  };

  return (
    <div className="flex-1 relative overflow-hidden" style={{
      backgroundColor: '#fafafa'
    }}>
      {/* Grid overlay on canvas background */}
      {renderGrid()}
      
      {/* Canvas container */}
      <div
        ref={canvasRef}
        className="w-full h-full relative flex items-center justify-center"
        onClick={handleCanvasClick}
      >
        {/* Slide area */}
        <motion.div
          ref={slideRef}
          className="relative"
            style={{
            width: SLIDE_WIDTH,
            height: SLIDE_HEIGHT,
            maxWidth: '90vw',
            maxHeight: '90vh',
            boxShadow: `
              0 0 0 2px rgba(255, 255, 255, 0.8),
              0 4px 16px rgba(0, 0, 0, 0.15),
              0 8px 32px rgba(0, 0, 0, 0.12),
              0 16px 64px rgba(0, 0, 0, 0.1),
              0 32px 128px rgba(0, 0, 0, 0.08)
            `,
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid rgba(0, 0, 0, 0.05)'
          }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* White background for slide */}
          <div className="absolute inset-0 bg-white" />

          {/* Elements */}
          {elements && elements.map(renderElement)}

          {/* Default Title Text Box - Show if no title element exists */}
          {shouldShowDefaultTitle && (
            renderElement({
              id: 'default-title',
              type: 'text',
              x: SLIDE_WIDTH / 2 - 300, // Center horizontally (width/2)
              y: SLIDE_HEIGHT / 2 - 100, // Center vertically with offset
              width: Math.min(600, SLIDE_WIDTH * 0.6), // Responsive width
              height: Math.min(80, SLIDE_HEIGHT * 0.1), // Responsive height
              content: 'Click to add title',
              fontSize: Math.min(28, SLIDE_WIDTH * 0.022), // Responsive font size
              fontWeight: 'bold',
              color: '#999999'
            })
          )}

          {/* Default Subtitle Text Box - Show if no subtitle element exists */}
          {shouldShowDefaultSubtitle && (
            renderElement({
              id: 'default-subtitle',
              type: 'text',
              x: SLIDE_WIDTH / 2 - 250, // Center horizontally (width/2)
              y: SLIDE_HEIGHT / 2 + 20, // Center vertically with offset
              width: Math.min(500, SLIDE_WIDTH * 0.5), // Responsive width
              height: Math.min(60, SLIDE_HEIGHT * 0.08), // Responsive height
              content: 'Click to add subtitle',
              fontSize: Math.min(20, SLIDE_WIDTH * 0.016), // Responsive font size
              fontWeight: 'normal',
              color: '#999999'
            })
          )}

          {/* Alignment guides */}
          {renderAlignmentGuides()}
        </motion.div>
      </div>
    </div>
  );
};