// PowerPoint-style canvas for element rendering - Production Ready Version
import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useLayoutEffect
} from "react";
import { Move } from "lucide-react";
import { Element } from "@/hooks/use-action-manager";
import { ChartJSChart } from "@/components/editor/ChartJSChart";
import { TABLE_THEMES } from "@/constants/tableThemes";

type SlideElement = Element;

interface Props {
  className?: string;
  elements?: SlideElement[];
  background?: string; // slide background color (default white)
  slideWidth?: number;  // canonical slide size
  slideHeight?: number;
  zoom?: number; // external zoom multiplier
  // Removed textScope - using only entire text mode
  onElementSelect?: (el: SlideElement | null) => void;
  onElementUpdate?: (el: SlideElement) => void; // commit update
  onElementAdd?: (el: SlideElement) => void;
  onElementDelete?: (id: string) => void;
  // Live preview callback for thumbnails during drag/resize/rotate
  onLiveElementsChange?: (els: SlideElement[] | null) => void;
}

const SimplePowerPointCanvas: React.FC<Props> = ({
  className = "",
  elements: propElements = [],
  background = "#ffffff",
  slideWidth = 960,
  slideHeight = 540,
  zoom = 1,
  // Removed textScope parameter
  onElementSelect,
  onElementUpdate,
  onElementAdd,
  onElementDelete,
  onLiveElementsChange,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const slideRef = useRef<HTMLDivElement | null>(null);
  const elements = propElements; // Use propElements directly for real-time updates
  const [selectedElement, setSelectedElement] = useState<SlideElement | null>(null);
  const [editingElement, setEditingElement] = useState<SlideElement | null>(null);
  const [dragState, setDragState] = useState<any>(null);
  const [rotatingElement, setRotatingElement] = useState<SlideElement | null>(null);
  const [rotationStart, setRotationStart] = useState<{
    angle: number;
    centerX: number;
    centerY: number;
    initialRotation: number;
  } | null>(null);
  const [rotationAngle, setRotationAngle] = useState<number>(0);


  // Smooth, Fabric-like live manipulation without spamming history
  const [liveUpdates, setLiveUpdates] = useState<Record<string, Partial<SlideElement>>>({});
  const applyLive = useCallback((el: SlideElement): SlideElement => {
    const patch = liveUpdates[el.id];
    return patch ? ({ ...el, ...patch } as SlideElement) : el;
  }, [liveUpdates]);

  // rAF-throttled emitter for live thumbnail updates (declared after applyLive to avoid TDZ)
  const rafIdRef = useRef<number | null>(null);
  const scheduleEmitLive = useCallback(() => {
    if (typeof onLiveElementsChange !== 'function') return;
    if (rafIdRef.current != null) return;
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      const applied = (elements || []).map(applyLive);
      onLiveElementsChange(applied as any);
    });
  }, [elements, applyLive, onLiveElementsChange]);
  
  // Global editing context state management
  const [isEditingText, setIsEditingText] = useState(false);
  const [isPropertyPanelFocused, setIsPropertyPanelFocused] = useState(false);
  const lastSelection = useRef<Range | null>(null);

  // Selection preservation functions
  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      lastSelection.current = sel.getRangeAt(0);
      // Also store globally for Properties Panel access
      (window as any).__SAVED_SELECTION__ = sel.getRangeAt(0).cloneRange();
    }
  }, []);

  const restoreSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && lastSelection.current) {
      sel.removeAllRanges();
      sel.addRange(lastSelection.current);
    }
  }, []);

  // Listen for Properties Panel focus events
  useEffect(() => {
    const handlePropertyPanelFocus = (event: CustomEvent) => {
      setIsPropertyPanelFocused(event.detail);
    };

    window.addEventListener('propertyPanelFocus', handlePropertyPanelFocus as EventListener);
    
    return () => {
      window.removeEventListener('propertyPanelFocus', handlePropertyPanelFocus as EventListener);
    };
  }, []);

  // Global click handler to preserve text selection
  useEffect(() => {
    // Listen for selection changes to continuously save selection
    const handleSelectionChange = () => {
      if (isEditingText) {
        saveSelection();
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [isEditingText, saveSelection]);

  // responsive scale: compute scale to fit container
  const [scale, setScale] = useState<number>(1);
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(() => {
      const rect = containerRef.current!.getBoundingClientRect();
      // Prioritize horizontal fill: remove side padding, keep small top/bottom gap
      const hPad = 0;   // no side margin inside container
      const vPad = 12;  // keep ~12px vertical breathing room
      const sx = (rect.width - hPad * 2) / slideWidth;
      const sy = (rect.height - vPad * 2) / slideHeight;
      const s = Math.min(sx, sy);
      setScale(Math.max(s, 0.2)); // Minimum scale of 0.2 for very small screens
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [slideWidth, slideHeight]);

  // Handle canvas click to deselect
  const handleCanvasClick = useCallback(() => {
    setSelectedElement(null);
    setEditingElement(null);
    onElementSelect?.(null);
  }, [onElementSelect]);

  // helpers to build transform string (translate + rotate + scale if any)
  const buildTransform = useCallback((el: SlideElement) => {
    const tx = el.x ?? 0;
    const ty = el.y ?? 0;
    const rotate = el.rotation ?? 0;
    const extra = el.transform || "";
    const width = el.width ?? 100;
    const height = el.height ?? 60;
    
    // With transformOrigin: "center", we need to offset by half width/height
    const centerX = tx + width / 2;
    const centerY = ty + height / 2;
    
    // Translate to center, rotate, then translate back
    return `translate(${centerX}px, ${centerY}px) rotate(${rotate}deg) translate(-${width/2}px, -${height/2}px) ${extra}`;
  }, []);

  // Custom drag handlers inspired by reference code
  const handleMouseDown = useCallback((e: React.MouseEvent, element: SlideElement, handle: string | null = null) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Make sure element is selected
    if (selectedElement?.id !== element.id) {
      setSelectedElement(element);
      onElementSelect?.(element);
    }
    
    if (!slideRef.current) return;
    
    const rect = slideRef.current.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;
    
    setDragState({
      element,
      handle,
      startX,
      startY,
      startElementX: element.x,
      startElementY: element.y,
      startElementWidth: element.width,
      startElementHeight: element.height
    });
  }, [selectedElement, onElementSelect]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState || !slideRef.current) return;
    
    const rect = slideRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    const deltaX = currentX - dragState.startX;
    const deltaY = currentY - dragState.startY;
    
    if (dragState.handle) {
      // Smooth resizing inspired by Interact.js
      const minWidth = 50;
      const minHeight = 20;
      
      let newWidth = dragState.startElementWidth;
      let newHeight = dragState.startElementHeight;
      let newX = dragState.startElementX;
      let newY = dragState.startElementY;
      
      // Calculate delta rect (like Interact.js)
      let deltaRect = { left: 0, top: 0, right: 0, bottom: 0 };
      
      switch (dragState.handle) {
        case 'se': // Bottom-right
          newWidth = Math.max(minWidth, dragState.startElementWidth + deltaX);
          newHeight = Math.max(minHeight, dragState.startElementHeight + deltaY);
          deltaRect.right = newWidth - dragState.startElementWidth;
          deltaRect.bottom = newHeight - dragState.startElementHeight;
          break;
        case 'sw': // Bottom-left
          newWidth = Math.max(minWidth, dragState.startElementWidth - deltaX);
          newHeight = Math.max(minHeight, dragState.startElementHeight + deltaY);
          deltaRect.left = dragState.startElementWidth - newWidth;
          deltaRect.bottom = newHeight - dragState.startElementHeight;
          newX = dragState.startElementX + deltaRect.left;
          break;
        case 'ne': // Top-right
          newWidth = Math.max(minWidth, dragState.startElementWidth + deltaX);
          newHeight = Math.max(minHeight, dragState.startElementHeight - deltaY);
          deltaRect.right = newWidth - dragState.startElementWidth;
          deltaRect.top = dragState.startElementHeight - newHeight;
          newY = dragState.startElementY + deltaRect.top;
          break;
        case 'nw': // Top-left
          newWidth = Math.max(minWidth, dragState.startElementWidth - deltaX);
          newHeight = Math.max(minHeight, dragState.startElementHeight - deltaY);
          deltaRect.left = dragState.startElementWidth - newWidth;
          deltaRect.top = dragState.startElementHeight - newHeight;
          newX = dragState.startElementX + deltaRect.left;
          newY = dragState.startElementY + deltaRect.top;
          break;
        case 'e': // Right edge
          newWidth = Math.max(minWidth, dragState.startElementWidth + deltaX);
          deltaRect.right = newWidth - dragState.startElementWidth;
          break;
        case 'w': // Left edge
          newWidth = Math.max(minWidth, dragState.startElementWidth - deltaX);
          deltaRect.left = dragState.startElementWidth - newWidth;
          newX = dragState.startElementX + deltaRect.left;
          break;
        case 'n': // Top edge
          newHeight = Math.max(minHeight, dragState.startElementHeight - deltaY);
          deltaRect.top = dragState.startElementHeight - newHeight;
          newY = dragState.startElementY + deltaRect.top;
          break;
        case 's': // Bottom edge
          newHeight = Math.max(minHeight, dragState.startElementHeight + deltaY);
          deltaRect.bottom = newHeight - dragState.startElementHeight;
          break;
        default:
          break;
      }
      
      // Smooth update with proper delta calculations (live-only)
      setLiveUpdates(prev => ({
        ...prev,
        [dragState.element.id]: {
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
        },
      }));
      // Emit live elements for thumbnail preview (rAF throttled)
      scheduleEmitLive();
    } else {
      // Smooth moving (live-only)
      const newX = Math.max(0, dragState.startElementX + deltaX);
      const newY = Math.max(0, dragState.startElementY + deltaY);
      setLiveUpdates(prev => ({
        ...prev,
        [dragState.element.id]: {
          x: newX,
          y: newY,
        },
      }));
      // Emit live elements for thumbnail preview (rAF throttled)
      scheduleEmitLive();
    }
  }, [dragState]);

  const handleMouseUp = useCallback(() => {
    if (dragState && onElementUpdate) {
      const patch = liveUpdates[dragState.element.id];
      if (patch) {
        onElementUpdate({ ...dragState.element, ...patch } as SlideElement);
      }
    }
    setDragState(null);
    // Clear only the committed element's live patch
    if (dragState) {
      setLiveUpdates(prev => {
        const next = { ...prev };
        delete next[dragState.element.id];
        return next;
      });
    }
    // Clear live preview snapshot
    if (rafIdRef.current != null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (typeof onLiveElementsChange === 'function') {
      onLiveElementsChange(null);
    }
  }, [dragState, liveUpdates, onElementUpdate]);
  
  // Rotation handlers: center-based with snapping and Shift constraint
  const startRotation = useCallback((e: React.MouseEvent, element: SlideElement) => {
    e.preventDefault();
    e.stopPropagation();
    if (!slideRef.current) return;

    const rect = (e.currentTarget as HTMLElement).parentElement!.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);

    setRotationStart({
      angle: startAngle,
      centerX,
      centerY,
      initialRotation: element.rotation || 0,
    });
    setRotatingElement(element);
    setRotationAngle(element.rotation || 0);
  }, []);

  const handleRotationMove = useCallback((e: MouseEvent) => {
    if (!rotatingElement || !rotationStart) return;

    const { centerX, centerY, angle: startAngle, initialRotation } = rotationStart;
    const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    let newRotation = initialRotation + (currentAngle - startAngle);

    // Normalize to -180..180 for snapping
    while (newRotation > 180) newRotation -= 360;
    while (newRotation < -180) newRotation += 360;

    if ((e as any).shiftKey) {
      const step = 15;
      newRotation = Math.round(newRotation / step) * step;
    } else {
      const snap = 45;
      const remainder = newRotation % snap;
      if (Math.abs(remainder) < 2) newRotation = newRotation - remainder;
    }

    const displayAngle = ((newRotation % 360) + 360) % 360;
    setRotationAngle(displayAngle);
    // Live-only rotation update for smoothness
    setLiveUpdates(prev => ({
      ...prev,
      [rotatingElement.id]: { rotation: displayAngle },
    }));
    // Emit rAF-throttled live preview during rotation
    scheduleEmitLive();
  }, [rotatingElement, rotationStart]);

  const stopRotation = useCallback(() => {
    if (rotatingElement && onElementUpdate) {
      const patch = liveUpdates[rotatingElement.id];
      if (patch) {
        onElementUpdate({ ...rotatingElement, ...patch } as SlideElement);
      }
      // clear live patch
      setLiveUpdates(prev => {
        const next = { ...prev } as Record<string, Partial<SlideElement>>;
        delete next[rotatingElement.id];
        return next;
      });
    }
    setRotatingElement(null);
    setRotationStart(null);
    setRotationAngle(0);
    // Clear live rAF and snapshot
    if (rafIdRef.current != null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (typeof onLiveElementsChange === 'function') {
      onLiveElementsChange(null);
    }
  }, [rotatingElement, liveUpdates, onElementUpdate]);

  // Rotation event listeners
  useEffect(() => {
    if (!rotatingElement) return;
    document.addEventListener('mousemove', handleRotationMove);
    document.addEventListener('mouseup', stopRotation);
    return () => {
      document.removeEventListener('mousemove', handleRotationMove);
      document.removeEventListener('mouseup', stopRotation);
    };
  }, [rotatingElement, handleRotationMove, stopRotation]);


  // Global mouse event listeners
  useEffect(() => {
    if (dragState) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState, handleMouseMove, handleMouseUp]);

  // Rotation event listeners
  useEffect(() => {
    if (rotatingElement) {
      document.addEventListener('mousemove', handleRotationMove);
      document.addEventListener('mouseup', stopRotation);
      return () => {
        document.removeEventListener('mousemove', handleRotationMove);
        document.removeEventListener('mouseup', stopRotation);
      };
    }
  }, [rotatingElement, handleRotationMove, stopRotation]);


  // Global keyboard handlers
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (selectedElement && e.key === 'Delete') {
        onElementDelete?.(selectedElement.id);
        setSelectedElement(null);
        setEditingElement(null);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [selectedElement, onElementDelete]);

  // element click - Keynote-style behavior
  const handleElementClick = useCallback((el: SlideElement, ev: React.MouseEvent) => {
    ev.stopPropagation();
    setSelectedElement(el);
    onElementSelect?.(el);
    
    // For text elements, editing is handled by the text element's own click handler
    // This parent click handler is mainly for non-text elements
  }, [onElementSelect]);


  // Render selection controls for all elements
  const renderElementControls = useCallback((element: SlideElement) => {
    if (selectedElement?.id !== element.id) return null;
    
    return (
      <>
        {/* Drag Handle */}
        <div
          className="absolute -top-8 left-0 flex items-center gap-1"
          onMouseDown={(e) => {
            e.stopPropagation();
            handleMouseDown(e, element);
          }}
          style={{
            position: 'absolute',
            top: '-32px',
            left: '0px',
            zIndex: 9999, // 👈 High zIndex for better layering
            cursor: 'grab',
            userSelect: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.cursor = 'grabbing';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.cursor = 'grab';
          }}
        >
          <Move className="w-4 h-4 text-primary" />
          <span className="text-xs text-primary font-medium">Drag to move</span>
        </div>

        {/* Rotation Handle */}
        <div
          className="rotation-handle"
          onMouseDown={(e) => startRotation(e, element)}
        style={{
            position: "absolute",
            top: "-40px", // Position above the drag handle
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1002,
            width: "20px",
            height: "20px",
            backgroundColor: rotatingElement?.id === element.id ? "#106ebe" : "#0078d4",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            userSelect: 'none',
            fontSize: '14px',
            color: 'white',
            fontWeight: 'bold',
            boxShadow: rotatingElement?.id === element.id 
              ? "0 4px 12px rgba(0, 120, 212, 0.4)" 
              : "0 2px 6px rgba(0, 0, 0, 0.2)",
            border: "2px solid white",
          }}
          title="Rotate element"
        >
          ⟳
        </div>

        {/* Rotation Angle Tooltip */}
        {rotatingElement?.id === element.id && (
          <div
            className="rotation-tooltip"
            style={{
              position: "absolute",
              top: "-60px",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              color: "white",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: "500",
              zIndex: 1003,
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
          >
            {Math.round(rotationAngle)}°
          </div>
        )}

      </>
    );
  }, [selectedElement, handleMouseDown, startRotation, rotatingElement, rotationAngle]);

  // Render resize handles for selected element
  const renderResizeHandles = useCallback((element: SlideElement) => {
    if (selectedElement?.id !== element.id) return null;
    
    const handles = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
    
    return handles.map(handle => (
      <div
        key={handle}
        className={`resize-handle ${handle}`}
        onMouseDown={(e) => handleMouseDown(e, element, handle)}
        style={{
          position: 'absolute',
          width: '10px',
          height: '10px',
          backgroundColor: '#0078d4',
          border: '2px solid white',
          borderRadius: '50%',
          cursor: getResizeCursor(handle),
          zIndex: 1000,
          transition: 'all 0.15s ease',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          ...getHandlePosition(handle, element)
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#106ebe';
          e.currentTarget.style.transform = 'scale(1.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#0078d4';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      />
    ));
  }, [selectedElement, handleMouseDown]);

  // Get cursor style for resize handles
  const getResizeCursor = (handle: string) => {
    switch (handle) {
      case 'nw':
      case 'se':
        return 'nw-resize';
      case 'ne':
      case 'sw':
        return 'ne-resize';
      case 'n':
      case 's':
        return 'ns-resize';
      case 'e':
      case 'w':
        return 'ew-resize';
      default:
        return 'default';
    }
  };

  // Get position for resize handles
  const getHandlePosition = (handle: string, element: SlideElement) => {
    const width = element.width || 100;
    const height = element.height || 60;
    
    switch (handle) {
      case 'nw':
        return { top: '-5px', left: '-5px' };
      case 'n':
        return { top: '-5px', left: `${width / 2 - 5}px` };
      case 'ne':
        return { top: '-5px', right: '-5px' };
      case 'e':
        return { top: `${height / 2 - 5}px`, right: '-5px' };
      case 'se':
        return { bottom: '-5px', right: '-5px' };
      case 's':
        return { bottom: '-5px', left: `${width / 2 - 5}px` };
      case 'sw':
        return { bottom: '-5px', left: '-5px' };
      case 'w':
        return { top: `${height / 2 - 5}px`, left: '-5px' };
      default:
        return {};
    }
  };

  // Store / restore text selection for formatting
  const storeSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (!range.collapsed) {
        (window as any).__PRESENTIFY_SELECTION__ = {
          element: sel.anchorNode?.parentElement,
          range: range.cloneRange()
        };
      }
    }
  }, []);


  // Calculate text dimensions for auto-sizing
  const calculateTextDimensions = useCallback((el: SlideElement, html: string) => {
    // Get the slide container to determine available space
    const slideContainer = slideRef.current;
    const maxAvailableWidth = slideContainer ? slideContainer.offsetWidth - 100 : 600; // Leave some margin
    const maxAvailableHeight = slideContainer ? slideContainer.offsetHeight - 100 : 400; // Leave some margin
    
    // Use the current width or a reasonable default, but don't exceed slide boundaries
    const fixedWidth = Math.min(el.width || 200, maxAvailableWidth);
    
    // Create a temporary div to measure text with fixed width
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.visibility = 'hidden';
    tempDiv.style.top = '-9999px';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = `${fixedWidth}px`;
    tempDiv.style.whiteSpace = 'pre-wrap';
    tempDiv.style.wordWrap = 'break-word';
    tempDiv.style.fontSize = `${el.fontSize || 18}px`;
    tempDiv.style.fontWeight = el.fontWeight || 'normal';
    tempDiv.style.fontStyle = (el as any).fontStyle || 'normal';
    tempDiv.style.textTransform = (el as any).textTransform || 'none';
    tempDiv.style.textDecoration = (el as any).textDecoration || 'none';
    tempDiv.style.letterSpacing = (el as any).letterSpacing ? `${(el as any).letterSpacing}px` : '0px';
    tempDiv.style.fontFamily = el.fontFamily || 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif';
    tempDiv.style.padding = `${el.padding || 8}px`;
    tempDiv.style.border = 'none';
    tempDiv.style.outline = 'none';
    tempDiv.style.boxSizing = 'border-box';
    tempDiv.style.borderWidth = (el as any).borderWidth ? `${(el as any).borderWidth}px` : '0px';
    tempDiv.style.borderStyle = (el as any).borderStyle || 'solid';
    tempDiv.style.borderColor = (el as any).borderColor || 'transparent';
    tempDiv.style.borderRadius = (el as any).borderRadius ? `${(el as any).borderRadius}px` : '0px';
    tempDiv.style.opacity = (el as any).opacity || 1;
    tempDiv.style.backgroundColor = (el as any).backgroundColor || 'transparent';
    tempDiv.style.lineHeight = `${el.lineHeight || 1.2}`;
    tempDiv.style.margin = '0';
    
    // Set the content and measure height
    tempDiv.innerHTML = html;
    document.body.appendChild(tempDiv);
    const totalHeight = tempDiv.offsetHeight;
    document.body.removeChild(tempDiv);
    
    // Keep the fixed width, adjust height but respect slide boundaries
    const newWidth = fixedWidth;
    const newHeight = Math.min(
      Math.max(totalHeight, 30), // Ensure minimum height
      maxAvailableHeight // Don't exceed slide height
    );
    
    return { width: newWidth, height: newHeight };
  }, []);

  // Calculate text dimensions for a specific width (used during resize)
  const calculateTextDimensionsForWidth = useCallback((el: SlideElement, targetWidth: number, html: string) => {
    // Get the slide container to determine available space
    const slideContainer = slideRef.current;
    const maxAvailableHeight = slideContainer ? slideContainer.offsetHeight - 100 : 400; // Leave some margin
    
    // Create a temporary div to measure text with the target width
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.visibility = 'hidden';
    tempDiv.style.top = '-9999px';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = `${targetWidth}px`;
    tempDiv.style.whiteSpace = 'pre-wrap';
    tempDiv.style.wordWrap = 'break-word';
    tempDiv.style.fontSize = `${el.fontSize || 18}px`;
    tempDiv.style.fontWeight = el.fontWeight || 'normal';
    tempDiv.style.fontStyle = (el as any).fontStyle || 'normal';
    tempDiv.style.textTransform = (el as any).textTransform || 'none';
    tempDiv.style.textDecoration = (el as any).textDecoration || 'none';
    tempDiv.style.letterSpacing = (el as any).letterSpacing ? `${(el as any).letterSpacing}px` : '0px';
    tempDiv.style.fontFamily = el.fontFamily || 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif';
    tempDiv.style.padding = `${el.padding || 8}px`;
    tempDiv.style.border = 'none';
    tempDiv.style.outline = 'none';
    tempDiv.style.boxSizing = 'border-box';
    tempDiv.style.borderWidth = (el as any).borderWidth ? `${(el as any).borderWidth}px` : '0px';
    tempDiv.style.borderStyle = (el as any).borderStyle || 'solid';
    tempDiv.style.borderColor = (el as any).borderColor || 'transparent';
    tempDiv.style.borderRadius = (el as any).borderRadius ? `${(el as any).borderRadius}px` : '0px';
    tempDiv.style.opacity = (el as any).opacity || 1;
    tempDiv.style.backgroundColor = (el as any).backgroundColor || 'transparent';
    tempDiv.style.lineHeight = `${el.lineHeight || 1.2}`;
    tempDiv.style.margin = '0';
    
    // Set the content and measure height
    tempDiv.innerHTML = html;
    document.body.appendChild(tempDiv);
    
    // Force a reflow to ensure accurate measurement
    const totalHeight = tempDiv.offsetHeight;
    document.body.removeChild(tempDiv);
    
    // Calculate optimal height for the target width
    const newHeight = Math.min(
      Math.max(totalHeight, 30), // Ensure minimum height
      maxAvailableHeight // Don't exceed slide height
    );
    
    return { width: targetWidth, height: newHeight };
  }, []);

  // Removed applySelectiveTextStyling function - using only entire text mode

  // Shape rendering function for all shape types
  const renderShape = useCallback((el: SlideElement) => {
    const fill = el.fill || 'transparent';
    const stroke = el.stroke || '#000000';
    const strokeWidth = el.strokeWidth || 0.5;
    const opacity = el.opacity || 1;

    // Common style properties
    const baseStyle = {
      width: "100%",
      height: "100%",
      opacity,
      border: `${strokeWidth}px solid ${stroke}`,
      background: fill,
    };

    switch (el.shapeType) {
      case 'rectangle':
        return <div style={{ ...baseStyle, borderRadius: 0 }} />;
      
      case 'rounded-rectangle':
        return <div style={{ ...baseStyle, borderRadius: 8 }} />;
      
      case 'circle':
        return <div style={{ ...baseStyle, borderRadius: '50%' }} />;
      
      case 'triangle':
        return (
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{ width: '100%', height: '100%', opacity }}
          >
            <polygon
              points="50,0 0,100 100,100"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
            />
          </svg>
        );
      
      case 'star':
        return (
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%', opacity }}>
            <polygon
              points="50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
            />
          </svg>
        );
      
      case 'arrow-right':
        return (
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%', opacity }}>
            <polygon
              points="0,20 60,20 60,0 100,50 60,100 60,80 0,80"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
            />
          </svg>
        );
      
      case 'arrow-double':
        return null;
      
      case 'diamond':
        return (
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%', opacity }}>
            <polygon
              points="50,0 100,50 50,100 0,50"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
            />
          </svg>
        );
      
      case 'pentagon':
        return (
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%', opacity }}>
            <polygon
              points="50,0 100,38 82,100 18,100 0,38"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
            />
          </svg>
        );
      
      case 'hexagon':
        return (
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%', opacity }}>
            <polygon
              points="25,0 75,0 100,50 75,100 25,100 0,50"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
            />
          </svg>
        );
      
      case 'cloud':
        return null;
      
      case 'heart':
        return (
          <svg viewBox="0 0 24 24" preserveAspectRatio="none" style={{ width: '100%', height: '100%', opacity }}>
            <path d="M12,21.35l-1.45-1.32C5.4,15.36,2,12.28,2,8.5 C2,5.42,4.42,3,7.5,3c1.74,0,3.41,0.81,4.5,2.09C13.09,3.81,14.76,3,16.5,3 C19.58,3,22,5.42,22,8.5c0,3.78-3.4,6.86-8.55,11.54L12,21.35z" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          </svg>
        );
      
      case 'lightning':
        return (
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%', opacity }}>
            <polygon
              points="30,0 70,40 50,40 90,100 10,60 30,60"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
            />
          </svg>
        );
      
      case 'line':
        return null;
      
      case 'text-box':
        return null;
      
      default:
        return <div style={baseStyle} />;
    }
  }, []);

  // render helpers: use your existing renderers for children content
  const renderElementContent = useCallback((el: SlideElement) => {
    if (el.type === "text") {
      const isSelected = selectedElement?.id === el.id;
      const isEditing = editingElement?.id === el.id;
      const textContent = el.text || "";
      const isEmpty = !el.text || el.text.trim() === "";
      const displayText = isEmpty ? (el.placeholder || "Click to edit") : textContent;
    
      return (
        <div
          className={`ppt-text text-element ${isSelected ? "text-box-outline" : ""} ${isEditing ? "text-editing-active" : ""}`}
          contentEditable={isEditing}
            suppressContentEditableWarning
          data-placeholder={el.placeholder || "Click to edit"}
          dir="ltr"
          onInput={(e) => {
            // Update dimensions during editing
            const html = e.currentTarget.innerHTML;
            const text = e.currentTarget.textContent || "";
            const { width, height } = calculateTextDimensions(el, html);
            
            if (onElementUpdate) {
              onElementUpdate({ 
                ...el, 
                width: width,
                height: height
              });
            }
          }}
          onFocus={(e) => {
            setIsEditingText(true);
            // If empty, clear placeholder rendering for clean typing UX
            const target = e.currentTarget as HTMLDivElement;
            if ((el.text ?? '').trim() === '' && !(el as any).content) {
              target.innerHTML = '';
            }
            saveSelection();
          }}
          onSelect={() => {
            // Save selection whenever text is selected
            saveSelection();
          }}
          onBlur={(e) => {
            // Only blur if not clicking on Properties Panel
            if (!isPropertyPanelFocused) {
              // Save text when done editing
              const html = e.currentTarget.innerHTML;
              const text = e.currentTarget.textContent || "";
              
              if (onElementUpdate) {
                onElementUpdate({ 
                  ...el, 
                  text: text,
                  content: html
                });
              }
              setEditingElement(null);
              setIsEditingText(false);
            } else {
              // Prevent blur and restore focus
              e.preventDefault();
              e.stopPropagation();
              setTimeout(() => {
                if (e.currentTarget) {
                  e.currentTarget.focus();
                  restoreSelection();
                }
              }, 0);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.currentTarget.blur();
            }
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              document.execCommand('insertHTML', false, '<br>');
            }
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
              e.stopPropagation();
            }
          }}
          onMouseDown={(e) => {
            // Always prevent dragging on text element - dragging is handled by drag handle only
            e.stopPropagation();
          }}
          onClick={(e) => {
            // Handle text click for editing
            e.stopPropagation();
            
            // Always select the element first
            setSelectedElement(el);
            onElementSelect?.(el);
            
            if (!isEditing) {
              // Single click on text content - start editing and preserve existing text
              setEditingElement(el);
              
              setTimeout(() => {
                const textElement = document.querySelector(`#element-${el.id} .ppt-text`) as HTMLElement;
                if (!textElement) return;
                
                textElement.focus();
                
                // Always preserve existing text content
                if (el.content) {
                  textElement.innerHTML = el.content;
                } else if (el.text) {
                  textElement.textContent = el.text;
                }
                
                // Position cursor at the end of the text
                const range = document.createRange();
                range.selectNodeContents(textElement);
                range.collapse(false); // Collapse to end
                const selection = window.getSelection();
                selection?.removeAllRanges();
                selection?.addRange(range);
              }, 50);
            }
          }}
          // No double-click handler for text elements - single click handles everything
            style={{
            width: "100%", 
            height: "100%", 
            outline: "none",
            fontSize: el.fontSize ?? 18,
            color: isEmpty ? '#9aa0a6' : (el.color ?? "#000"),
            fontFamily: el.fontFamily || 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif',
            fontWeight: el.fontWeight || 'normal',
            fontStyle: isEmpty ? 'italic' : (el.fontStyle ?? 'normal'),
            textTransform: (el as any).textTransform || 'none',
            textDecoration: (el as any).textDecoration || 'none',
            textAlign: el.textAlign ?? 'left',
            lineHeight: el.lineHeight || 1.2,
            letterSpacing: (el as any).letterSpacing ? `${(el as any).letterSpacing}px` : '0px',
            padding: el.padding ?? 8,
            boxSizing: "border-box",
            cursor: isEditing ? 'text' : 'pointer',
            borderWidth: (el as any).borderWidth ? `${(el as any).borderWidth}px` : '0px',
            borderStyle: (el as any).borderStyle || 'solid',
            borderColor: (el as any).borderColor || 'transparent',
            borderRadius: (el as any).borderRadius ? `${(el as any).borderRadius}px` : '0px',
            opacity: (el as any).opacity || 1,
            caretColor: isEditing ? (el.color ?? "#000") : 'transparent',
            minHeight: '20px',
            overflow: "visible", // 👈 Critical: Allow text overflow like PowerPoint/Keynote
            wordWrap: 'break-word',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word', // 👈 Handle long words gracefully
            userSelect: isEditing ? 'text' : 'none',
            display: 'flex',
            alignItems: (el as any).verticalAlign === 'top' ? 'flex-start' : 
                      (el as any).verticalAlign === 'bottom' ? 'flex-end' : 'center',
            justifyContent: el.textAlign === 'center' ? 'center' : el.textAlign === 'right' ? 'flex-end' : 'flex-start',
            background: (el as any).backgroundColor || 'transparent', // 👈 Use element's background color
            textShadow: '0 1px 2px rgba(0,0,0,0.08)',
            transition: 'opacity 150ms ease, transform 150ms ease',
          }}
        >
          <span
            style={{
              overflow: 'visible', // 👈 ensures text itself doesn't clip
              display: 'inline-block',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              width: '100%',
              color: el.placeholder ? '#000000' : 'inherit' // Set black color for placeholders
            }}
          >
            {displayText}
          </span>
      </div>
    );
    }

    if (el.type === "shape") {
      return renderShape(el);
    }

    if (el.type === "chart") {
      return <ChartJSChart chart={el} isSelected={selectedElement?.id === el.id}
        onUpdate={(u) => onElementUpdate && onElementUpdate(u as SlideElement)}
        onDelete={() => onElementDelete && onElementDelete(el.id)}
        onSelect={() => {
          setSelectedElement(el);
          onElementSelect?.(el);
        }} />;
    }

    if (el.type === "image") {
      if (!el.imageUrl) {
        return (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f5f5f5",
              border: "2px dashed #ccc",
              borderRadius: "8px",
            }}
          >
            <span style={{ color: "#999", fontSize: "14px" }}>
              No image
            </span>
          </div>
        );
      }

      return (
        <div 
          style={{ width: "100%", height: "100%", position: "relative" }}
          onMouseDown={(e) => {
            // Prevent content from initiating drag; use drag handle like tables
            e.stopPropagation();
          }}
        >
          <img
            src={el.imageUrl || ""}
            alt=""
            draggable={false}
            onDragStart={(ev) => ev.preventDefault()}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: el.borderRadius || 0,
              // Apply border properties from element
              borderWidth: (el.borderWidth ?? 0),
              borderStyle: (el.borderWidth ?? 0) > 0 ? ((el as any).borderStyle || 'solid') : 'none',
              borderColor: (el.borderColor || '#000000'),
              display: "block",
              userSelect: 'none',
              pointerEvents: 'none', // ensure handles receive events cleanly
              opacity: (el as any).opacity ?? 1
            }}
            onError={(e) => {
              // Handle error by showing error state
              const target = e.target as HTMLImageElement;
              const parent = target.parentElement;
              if (parent && !parent.querySelector('.image-error-placeholder')) {
                target.style.display = 'none';
                const errorDiv = document.createElement('div');
                errorDiv.className = 'image-error-placeholder';
                errorDiv.style.cssText = `
                  width: 100%;
                  height: 100%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  background-color: #f5f5f5;
                  border: 2px dashed #ccc;
                  border-radius: 8px;
                  position: absolute;
                  top: 0;
                  left: 0;
                `;
                errorDiv.innerHTML = '<span style="color: #999; font-size: 14px;">Failed to load image</span>';
                parent.appendChild(errorDiv);
              }
            }}
            onLoad={(e) => {
              // Hide any error placeholder when image loads successfully
              const target = e.target as HTMLImageElement;
              const parent = target.parentElement;
              if (parent) {
                const errorDiv = parent.querySelector('.image-error-placeholder');
                if (errorDiv) {
                  errorDiv.remove();
                }
                target.style.display = 'block';
              }
            }}
          />
        </div>
      );
    }

    if (el.type === 'table') {
      const rows = Math.max(1, el.rows || 3);
      const cols = Math.max(1, el.cols || 3);
      const tableData: string[][] = Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => (el.tableData?.[r]?.[c] ?? ''))
      );

      const cellPadding = el.cellPadding ?? 8;
      const borderWidth = (el.borderWidth ?? 1);
      const borderStyle = (el as any).borderStyle || 'solid';
      const textAlign = el.cellTextAlign || 'left';
      const opacity = (el as any).opacity ?? 1;
      const header = (el as any).header ?? false;
      const headerBg = (el as any).headerBg || '#E7E6E6';
      const headerTextColor = (el as any).headerTextColor || '#111827';
      const rowAltBg = (el as any).rowAltBg || null;

      // Get theme-based colors from theme or fallback to element properties
      const theme = TABLE_THEMES.find(t => t.id === el.themeId) || {} as any;
      const rowEvenBg = theme.rowEvenBg || el.backgroundColor || '#FFFFFF';
      const rowOddBg = theme.rowOddBg || rowAltBg || (theme.rowEvenBg ? 'rgba(0,0,0,0.02)' : 'transparent');
      const themeHeaderBg = theme.headerBg || headerBg || '#E7E6E6';
      const themeHeaderTextColor = theme.headerTextColor || headerTextColor || '#111827';
      const textColor = theme.textColor || el.color || '#000000';
      const borderColor = theme.borderColor || el.borderColor || '#D9D9D9';

      const handleCellCommit = (r: number, c: number, html: string) => {
        const next = tableData.map(row => row.slice());
        next[r][c] = html;
        onElementUpdate?.({
          ...el,
          rows,
          cols,
          tableData: next,
        });
      };

      return (
        <div
          className="ppt-table"
          style={{
            width: '100%',
            height: '100%',
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            background: 'transparent',
            boxSizing: 'border-box',
            border: borderStyle === 'none' || borderWidth === 0 ? undefined : `${borderWidth}px ${borderStyle} ${borderColor}`,
            opacity,
            boxShadow: (el as any).shadow ? `0 8px ${(el as any).shadowBlur ?? 20}px rgba(0,0,0,0.15)` : undefined,
          }}
          onMouseDown={(e) => {
            // prevent drag by content
            e.stopPropagation();
          }}
        >
          {tableData.map((row, r) =>
            row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                className="ppt-table-cell"
                contentEditable
                suppressContentEditableWarning
                dangerouslySetInnerHTML={{ __html: cell }}
                onFocus={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.boxShadow = '0 0 0 3px rgba(0,122,255,0.2)';
                  el.style.borderColor = '#007aff';
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    (e.currentTarget as HTMLDivElement).blur();
                  }
                  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                    e.stopPropagation();
                  }
                }}
                onBlur={(e) => {
                  const html = (e.currentTarget as HTMLDivElement).innerHTML;
                  handleCellCommit(r, c, html);
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.boxShadow = 'none';
                  el.style.borderColor = borderColor;
                }}
                style={{
                  borderRight: borderStyle === 'none' || borderWidth === 0 ? 'none' : `${borderWidth}px ${borderStyle} ${borderColor}`,
                  borderBottom: borderStyle === 'none' || borderWidth === 0 ? 'none' : `${borderWidth}px ${borderStyle} ${borderColor}`,
                  padding: cellPadding,
                  outline: 'none',
                  minWidth: 0,
                  overflow: 'hidden',
                  textAlign: textAlign as any,
                  caretColor: '#000',
                  backgroundColor: header && r === 0 ? themeHeaderBg : (r % 2 === 0 ? rowEvenBg : rowOddBg),
                  color: header && r === 0 ? themeHeaderTextColor : textColor,
                  fontWeight: header && r === 0 ? '600' : 'normal',
                  fontFamily: el.fontFamily || '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
                  fontSize: (el.fontSize || 16) as any,
                  fontStyle: (el as any).fontStyle || 'normal',
                }}
              />
            ))
          )}
        </div>
      );
    }

    return null;
  }, [onElementUpdate, selectedElement, onElementDelete, onElementSelect]);

  // build element styles (slide-space units) - Optimized for performance
  const buildElementStyle = (el: SlideElement) => {
    const baseStyle = {
      position: "absolute" as const,
      left: 0,
      top: 0,
      width: el.width ?? 100,
      height: el.height ?? 60,
      transform: buildTransform(el),
      transformOrigin: "center",
      zIndex: el.zIndex ?? 1,
      touchAction: "none" as const,
      userSelect: "none" as const,
      boxSizing: "border-box" as const,
      background: "transparent",
      // Performance optimizations
      willChange: "auto",
      backfaceVisibility: "hidden" as const,
      transformStyle: "preserve-3d" as const,
      // Smooth transitions only when not interacting
      transition: selectedElement?.id === el.id ? "none" : "transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    };

    // Text elements allow overflow for professional slide editor behavior
    if (el.type === "text") {
      return {
        ...baseStyle,
        overflow: "visible", // 👈 Allow text overflow like PowerPoint/Keynote
      };
    }

    return {
      ...baseStyle,
      overflow: "hidden" as const,
    };
  };

  return (
    <div
      ref={containerRef}
      className={`ppt-canvas-container ${className}`}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        padding: 0, // Remove padding here, let parent handle spacing
        minHeight: "100%",
        boxSizing: "border-box",
      }}
      onClick={handleCanvasClick}
    >
      {/* scaled slide area */}
      <div
        ref={slideRef}
        className="ppt-slide"
        style={{
          width: slideWidth,
          height: slideHeight,
          background,
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          borderRadius: 8,
          overflow: "visible",
          transform: `scale(${scale * (zoom || 1)})`,
          transformOrigin: "center center",
          position: "relative",
          margin: "0 auto", // Center horizontally
          display: "block", // Ensure it's a block element for proper centering
        }}
      >
        {/* elements in slide-space */}
        {elements.map((raw) => {
          const el = applyLive(raw);
          return (
          <div
            id={`element-${el.id}`}
            key={el.id}
            style={{
              ...buildElementStyle(el),
              overflow: el.type === 'text' ? 'visible' : (selectedElement?.id === el.id ? 'visible' : 'hidden'), // Text never clips; others clip when not selected
            }}
            onClick={(ev) => handleElementClick(el, ev)}
            onDoubleClick={(ev) => {
              // For all elements, just select them
              ev.stopPropagation();
              setSelectedElement(el);
              onElementSelect?.(el);
            }}
            onMouseDown={(e) => {
              // All elements use their drag handle for dragging
              // This prevents accidental dragging when clicking on element content
            }}
            data-slide-id={el.id}
            className={selectedElement?.id === el.id ? 'ring-2 ring-blue-400' : ''}
          >
            {renderElementContent(el)}
            {renderElementControls(el)}
            {renderResizeHandles(el)}
          </div>
        );})}
      </div>
    </div>
  );
};

export default SimplePowerPointCanvas;