// PowerPoint-style canvas for element rendering - Production Ready Version
import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useLayoutEffect
} from "react";
import { Element } from "@/hooks/use-action-manager";
import { ChartJSChart } from "@/components/editor/ChartJSChart";

type SlideElement = Element;

interface Props {
  className?: string;
  elements?: SlideElement[];
  background?: string; // slide background color (default white)
  slideWidth?: number;  // canonical slide size
  slideHeight?: number;
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
    const rotate = (el.rotation ?? 0);
    const extra = el.transform || "";
    // translate in slide-space; Moveable and real styles will be scaled by container scale
    return `translate(${tx}px, ${ty}px) rotate(${rotate}deg) ${extra}`;
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
      // Resizing
      let newWidth = dragState.startElementWidth;
      let newHeight = dragState.startElementHeight;
      let newX = dragState.startElementX;
      let newY = dragState.startElementY;
      
      switch (dragState.handle) {
        case 'se':
          newWidth = Math.max(50, dragState.startElementWidth + deltaX);
          newHeight = Math.max(20, dragState.startElementHeight + deltaY);
          break;
        case 'sw':
          newWidth = Math.max(50, dragState.startElementWidth - deltaX);
          newHeight = Math.max(20, dragState.startElementHeight + deltaY);
          newX = dragState.startElementX + deltaX;
          break;
        case 'ne':
          newWidth = Math.max(50, dragState.startElementWidth + deltaX);
          newHeight = Math.max(20, dragState.startElementHeight - deltaY);
          newY = dragState.startElementY + deltaY;
          break;
        case 'nw':
          newWidth = Math.max(50, dragState.startElementWidth - deltaX);
          newHeight = Math.max(20, dragState.startElementHeight - deltaY);
          newX = dragState.startElementX + deltaX;
          newY = dragState.startElementY + deltaY;
          break;
        case 'e':
          newWidth = Math.max(50, dragState.startElementWidth + deltaX);
          break;
        case 'w':
          newWidth = Math.max(50, dragState.startElementWidth - deltaX);
          newX = dragState.startElementX + deltaX;
          break;
        case 'n':
          newHeight = Math.max(20, dragState.startElementHeight - deltaY);
          newY = dragState.startElementY + deltaY;
          break;
        case 's':
          newHeight = Math.max(20, dragState.startElementHeight + deltaY);
          break;
        default:
          break;
      }
      
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
      // Moving
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
    
    // For text elements, start editing if empty, or position cursor if has content
    if (el.type === 'text') {
      const isEmpty = !el.text || el.text.trim() === "";
      
      if (isEmpty) {
        // If empty, start editing immediately
        setEditingElement(el);
        setTimeout(() => {
          const textElement = document.querySelector(`#element-${el.id} .ppt-text`) as HTMLElement;
          if (textElement) {
            textElement.focus();
            // Clear placeholder and position cursor at start
            textElement.innerHTML = '';
            const range = document.createRange();
            range.setStart(textElement, 0);
            range.collapse(true);
            const selection = window.getSelection();
            selection?.removeAllRanges();
            selection?.addRange(range);
          }
        }, 10);
      } else {
        // If has content, start editing and position cursor
        setEditingElement(el);
        setTimeout(() => {
          const textElement = document.querySelector(`#element-${el.id} .ppt-text`) as HTMLElement;
          if (textElement) {
            textElement.focus();
            
            // Position cursor at click position
            const range = document.createRange();
            const selection = window.getSelection();
            
            try {
              const rect = textElement.getBoundingClientRect();
              const clickX = ev.clientX - rect.left;
              const clickY = ev.clientY - rect.top;
              
              // Simple approximation for cursor position
              const textLength = textElement.textContent?.length || 0;
              const charWidth = rect.width / Math.max(textLength, 1);
              const charIndex = Math.min(Math.floor(clickX / charWidth), textLength);
              
              if (textElement.firstChild) {
                range.setStart(textElement.firstChild, Math.min(charIndex, textElement.firstChild.textContent?.length || 0));
                range.collapse(true);
              } else {
                range.setStart(textElement, 0);
                range.collapse(true);
              }
            } catch {
              // Fallback: position at end
              range.selectNodeContents(textElement);
              range.collapse(false);
            }
            
            selection?.removeAllRanges();
            selection?.addRange(range);
          }
        }, 10);
      }
    }
  }, [onElementSelect]);

  // element double click
  const handleElementDoubleClick = useCallback((el: SlideElement, ev: React.MouseEvent) => {
    ev.stopPropagation();
    setSelectedElement(el);
    onElementSelect?.(el);
    
    // For text elements, clear placeholder and start editing
    if (el.type === 'text') {
      setEditingElement(el);
      
      // Clear placeholder text and set empty content
      if (onElementUpdate) {
    onElementUpdate({
          ...el,
          text: '',
          content: '',
          placeholder: el.placeholder || "Double click to edit text"
        });
      }
      
      requestAnimationFrame(() => {
        const textElement = document.querySelector(`#element-${el.id} .ppt-text`) as HTMLElement;
        if (textElement) {
          textElement.focus();
          // Clear any existing content and position cursor at start
          textElement.innerHTML = '';
          const range = document.createRange();
          range.setStart(textElement, 0);
          range.collapse(true);
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      });
    }
  }, [onElementSelect, onElementUpdate]);

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
          width: '8px',
          height: '8px',
          backgroundColor: '#0078d4',
          border: '1px solid white',
          borderRadius: '50%',
          cursor: getResizeCursor(handle),
          zIndex: 1000,
          ...getHandlePosition(handle, element)
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
        return { top: '-4px', left: '-4px' };
      case 'n':
        return { top: '-4px', left: `${width / 2 - 4}px` };
      case 'ne':
        return { top: '-4px', right: '-4px' };
      case 'e':
        return { top: `${height / 2 - 4}px`, right: '-4px' };
      case 'se':
        return { bottom: '-4px', right: '-4px' };
      case 's':
        return { bottom: '-4px', left: `${width / 2 - 4}px` };
      case 'sw':
        return { bottom: '-4px', left: '-4px' };
      case 'w':
        return { top: `${height / 2 - 4}px`, left: '-4px' };
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

  const restoreSelection = useCallback(() => {
    const store = (window as any).__PRESENTIFY_SELECTION__;
    if (store && store.element && store.range) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(store.range);
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
    tempDiv.style.fontFamily = el.fontFamily || '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif';
    tempDiv.style.padding = `${el.padding || 8}px`;
    tempDiv.style.border = 'none';
    tempDiv.style.outline = 'none';
    tempDiv.style.boxSizing = 'border-box';
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
    tempDiv.style.fontFamily = el.fontFamily || '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif';
    tempDiv.style.padding = `${el.padding || 8}px`;
    tempDiv.style.border = 'none';
    tempDiv.style.outline = 'none';
    tempDiv.style.boxSizing = 'border-box';
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

  // render helpers: use your existing renderers for children content
  const renderElementContent = useCallback((el: SlideElement) => {
    if (el.type === "text") {
      const isSelected = selectedElement?.id === el.id;
      const isEditing = editingElement?.id === el.id; // Use separate editing state
      const textContent = el.text || "";
      const isEmpty = !el.text || el.text.trim() === "";
      const displayText = isEmpty ? (el.placeholder || "Double click to edit text") : textContent;
    
    return (
      <div
          className="ppt-text"
          contentEditable={isEditing}
            suppressContentEditableWarning
          data-placeholder={el.placeholder || "Double click to edit text"}
          dir="ltr"
            onInput={(e) => {
            // Real-time text updates during editing with auto-sizing
            const html = e.currentTarget.innerHTML;
            const text = e.currentTarget.textContent || "";
            
            // Calculate new dimensions based on content
            const { width, height } = calculateTextDimensions(el, html);
            
              if (onElementUpdate) {
              onElementUpdate({ 
                ...el, 
                text: text,
                content: html,
                width: width,
                height: height
              });
            }
          }}
          onBlur={(e) => {
            // Final text update when editing is complete
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
          }}
          onKeyDown={(e) => {
            // Keynote-style keyboard shortcuts
            if (e.key === 'Escape') {
              e.currentTarget.blur();
            }
            // Allow Enter for line breaks
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              document.execCommand('insertHTML', false, '<br>');
            }
            // Prevent arrow keys from moving the element when editing
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
              e.stopPropagation();
            }
          }}
          onMouseDown={(e) => {
            // For text elements, handle mouse down like the reference
            if (!isEditing) {
              // When not editing, allow dragging by calling handleMouseDown
              handleMouseDown(e, el);
            } else {
              // When editing, prevent dragging
              e.stopPropagation();
            }
          }}
          onClick={(e) => {
            // Prevent canvas deselection when clicking text
            e.stopPropagation();
          }}
          onMouseUp={() => {
            // Store selection for formatting
            storeSelection();
          }}
          onKeyUp={() => {
            // Store selection for formatting
            storeSelection();
          }}
            style={{
            width: "100%", 
            height: "100%", 
            outline: "none",
            fontSize: el.fontSize ?? 18,
            color: isEmpty ? '#999999' : (el.color ?? "#000"),
            display: "flex", 
            alignItems: el.verticalAlign === 'top' ? 'flex-start' : 
                       el.verticalAlign === 'bottom' ? 'flex-end' : 'center',
            justifyContent: el.textAlign === 'center' ? 'center' :
                           el.textAlign === 'right' ? 'flex-end' : 'flex-start',
            padding: el.padding ?? 8,
            boxSizing: "border-box",
            fontFamily: el.fontFamily || '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
            fontWeight: el.fontWeight || 'normal',
            fontStyle: isEmpty ? 'italic' : ((el as any).fontStyle || 'normal'),
            textDecoration: (el as any).textDecoration || 'none',
            textTransform: (el as any).textTransform || 'none',
            backgroundColor: el.backgroundColor || 'transparent',
            borderColor: el.borderColor || '#000000',
            borderWidth: el.borderWidth || 0,
            borderStyle: (el as any).borderStyle || 'solid',
            borderRadius: el.borderRadius || 0,
            lineHeight: el.lineHeight || 1.2,
            letterSpacing: (el as any).letterSpacing || 0,
            opacity: (el as any).opacity || 1,
            cursor: isEditing ? 'text' : 'pointer',
            minHeight: '20px',
            wordWrap: 'break-word',
            whiteSpace: 'pre-wrap',
            userSelect: isEditing ? 'text' : 'none',
            // Keynote-style visual feedback
            transition: 'all 0.2s ease',
            transform: isSelected ? 'scale(1.02)' : 'scale(1)',
            boxShadow: isSelected ? '0 4px 20px rgba(0,0,0,0.15)' : 'none',
            overflow: 'auto',
          }}
        >
          {isEditing ? (
            <div 
              dangerouslySetInnerHTML={{ __html: el.content || textContent }}
              style={{ 
                width: "100%",
                height: "100%",
                outline: "none",
                border: "none",
                background: "transparent",
                color: "inherit",
                fontFamily: "inherit",
                fontSize: "inherit",
                fontWeight: "inherit",
                fontStyle: "inherit"
              }}
            />
          ) : (
            <div style={{ 
              color: isEmpty ? "#999" : (el.color ?? "#000"),
              fontStyle: isEmpty ? "italic" : (el.fontStyle ?? "normal"),
              width: "100%",
              height: "100%"
            }}>
              {displayText}
            </div>
        )}
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
  const buildElementStyle = (el: SlideElement) => ({
    position: "absolute" as const,
    left: 0,
    top: 0,
    width: el.width ?? 100,
    height: el.height ?? 60,
    transform: buildTransform(el),
    transformOrigin: "top left",
    zIndex: el.zIndex ?? 1,
    touchAction: "none" as const,
    userSelect: "none" as const,
    boxSizing: "border-box" as const,
    overflow: "hidden" as const,
    background: "transparent",
    // Performance optimizations
    willChange: "auto",
    backfaceVisibility: "hidden" as const,
    transformStyle: "preserve-3d" as const,
    // Smooth transitions only when not interacting
    transition: selectedElement?.id === el.id ? "none" : "transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  });

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
          overflow: "hidden",
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
            style={buildElementStyle(el)}
            onClick={(ev) => handleElementClick(el, ev)}
            onDoubleClick={(ev) => handleElementDoubleClick(el, ev)}
            onMouseDown={(e) => handleMouseDown(e, el)}
            data-slide-id={el.id}
            className={selectedElement?.id === el.id ? 'ring-2 ring-blue-400' : ''}
          >
            {renderElementContent(el)}
            {renderResizeHandles(el)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimplePowerPointCanvas;