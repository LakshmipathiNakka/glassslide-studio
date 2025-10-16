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

type SlideElement = Element;

interface Props {
  className?: string;
  elements?: SlideElement[];
  background?: string; // slide background color (default white)
  slideWidth?: number;  // canonical slide size
  slideHeight?: number;
  // Removed textScope - using only entire text mode
  onElementSelect?: (el: SlideElement | null) => void;
  onElementUpdate?: (el: SlideElement) => void; // commit update
  onElementAdd?: (el: SlideElement) => void;
  onElementDelete?: (id: string) => void;
}

const SimplePowerPointCanvas: React.FC<Props> = ({
  className = "",
  elements: propElements = [],
  background = "#ffffff",
  slideWidth = 1024,
  slideHeight = 768,
  // Removed textScope parameter
  onElementSelect,
  onElementUpdate,
  onElementAdd,
  onElementDelete,
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
      // Calculate equal padding on all sides
      const padding = Math.min(rect.width, rect.height) * 0.05; // 5% of the smaller dimension
      const sx = (rect.width - padding * 2) / slideWidth;
      const sy = (rect.height - padding * 2) / slideHeight;
      // fit inside with equal padding on all sides; maintain aspect ratio
      const s = Math.min(sx, sy, 1.0);
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
      
      // Smooth update with proper delta calculations
      if (onElementUpdate) {
    onElementUpdate({
          ...dragState.element,
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight
        });
      }
    } else {
      // Smooth moving
      const newX = Math.max(0, dragState.startElementX + deltaX);
      const newY = Math.max(0, dragState.startElementY + deltaY);
      
      if (onElementUpdate) {
    onElementUpdate({
          ...dragState.element,
          x: newX,
          y: newY
        });
      }
    }
  }, [dragState, onElementUpdate]);

  const handleMouseUp = useCallback(() => {
    setDragState(null);
  }, []);

  // Rotation handlers
  const startRotation = useCallback((e: React.MouseEvent, element: SlideElement) => {
    e.preventDefault();
    e.stopPropagation();
    if (!slideRef.current) return;

    // Get the element's center-top point (center horizontally, top vertically)
    const elementRect = e.currentTarget.parentElement!.getBoundingClientRect();
    const centerX = elementRect.left + elementRect.width / 2;
    const centerTopY = elementRect.top; // Top edge, not center

    // Calculate initial angle from center-top to mouse position
    const angle = Math.atan2(e.clientY - centerTopY, e.clientX - centerX) * (180 / Math.PI);
    
    setRotationStart({
      angle,
      centerX,
      centerY: centerTopY, // Use center-top as reference point
      initialRotation: element.rotation || 0
    });
    setRotatingElement(element);
    setRotationAngle(element.rotation || 0);
  }, []);

  const handleRotationMove = useCallback((e: MouseEvent) => {
    if (!rotatingElement || !rotationStart) return;

    const { centerX, centerY, angle: startAngle, initialRotation } = rotationStart;
    // Use center-top as reference point for rotation calculation
    const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    const deltaAngle = currentAngle - startAngle;
    let newRotation = initialRotation + deltaAngle;

    // Normalize angle to 0-360 range
    const normalizedAngle = ((newRotation % 360) + 360) % 360;
    
    // Optional snapping to 0°, 90°, 180°, 270° (within 5 degrees)
    let finalAngle = normalizedAngle;
    const snapThreshold = 5;
    const snapAngles = [0, 90, 180, 270];
    
    for (const snapAngle of snapAngles) {
      const diff = Math.abs(normalizedAngle - snapAngle);
      const diff360 = Math.abs(normalizedAngle - (snapAngle + 360));
      const diffMinus360 = Math.abs(normalizedAngle - (snapAngle - 360));
      
      if (diff < snapThreshold || diff360 < snapThreshold || diffMinus360 < snapThreshold) {
        finalAngle = snapAngle;
        break;
      }
    }
    
    setRotationAngle(finalAngle);

    // Update element with new rotation
    onElementUpdate?.({
      ...rotatingElement,
      rotation: finalAngle,
    });
  }, [rotatingElement, rotationStart, onElementUpdate]);

  const stopRotation = useCallback(() => {
    setRotatingElement(null);
    setRotationStart(null);
    setRotationAngle(0);
  }, []);


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
    tempDiv.style.fontFamily = el.fontFamily || '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif';
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
    tempDiv.style.fontFamily = el.fontFamily || '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif';
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
          onFocus={() => {
            setIsEditingText(true);
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
            color: isEmpty ? '#999' : (el.color ?? "#000"),
            fontFamily: el.fontFamily || '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
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
          }}
        >
          <span
            style={{
              overflow: 'visible', // 👈 ensures text itself doesn't clip
              display: 'inline-block',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              width: '100%',
            }}
          >
            {displayText}
          </span>
      </div>
    );
    }

    if (el.type === "shape") {
      return (
        <div style={{
          width: "100%", height: "100%",
          background: el.fill ?? "#0078d4", 
          borderRadius: el.shapeType === 'circle' ? '50%' : el.shapeType === 'triangle' ? '0' : (el.borderRadius ?? 4),
          border: `${el.strokeWidth || 2}px solid ${el.stroke || '#ffffff'}`,
          opacity: (el as any).opacity || 1,
        }} />
      );
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
      return (
        <img
          src={el.imageUrl || ""}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: el.borderRadius || 0,
          }}
        />
      );
    }

    return null;
  }, [onElementUpdate, selectedElement, onElementDelete]);

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
        justifyContent: "center",
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
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          position: "relative",
          margin: "0 auto", // Center horizontally
          display: "block", // Ensure it's a block element for proper centering
        }}
      >
        {/* elements in slide-space */}
        {elements.map((el) => (
          <div
            id={`element-${el.id}`}
            key={el.id}
            style={{
              ...buildElementStyle(el),
              overflow: selectedElement?.id === el.id ? "visible" : "hidden", // 👈 Selected elements always visible for controls
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
        ))}
      </div>
    </div>
  );
};

export default SimplePowerPointCanvas;