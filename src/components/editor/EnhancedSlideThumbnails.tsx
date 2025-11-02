import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Plus, ChevronDown, Trash2, MoreVertical, PanelLeftClose, PanelLeftOpen, GripVertical } from 'lucide-react';
import { EnhancedSlideThumbnailsProps, Slide, SlideAction } from '@/types/slide-thumbnails';
import ThumbnailCanvas from './ThumbnailCanvas';
import SlideContextMenu from './SlideContextMenu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// Draggable Thumbnail Item
const DraggableThumbnailItem: React.FC<{
  slide: Slide;
  index: number;
  isActive: boolean;
  isDragging: boolean;
  isCollapsed: boolean;
  onSelect: (index: number) => void;
  onContextMenu: (event: React.MouseEvent, slide: Slide, index: number) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onDelete: (slideId: string) => void;
  overrideElements?: any[] | null;
}> = ({ slide, index, isActive, isDragging, isCollapsed, onSelect, onContextMenu, onDragStart, onDragOver, onDrop, onDelete, overrideElements }) => {
  const dragHandleRef = useRef<HTMLDivElement>(null);
  
  // Handle click on the drag handle to prevent slide selection
  const handleDragHandleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  return (
    <motion.div
      draggable
      onDragStart={(e) => onDragStart(e as unknown as React.DragEvent, index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e as unknown as React.DragEvent, index)}
      onClick={() => onSelect(index)}
      onContextMenu={(e) => {
        const mouseEvent = e as unknown as React.MouseEvent;
        onContextMenu(mouseEvent, slide, index);
      }}
      layout
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: isDragging ? 1.02 : 1,
        rotate: 0,
        zIndex: isDragging ? 10 : 1,
        boxShadow: isDragging ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' : 'none'
      }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      whileHover={{ 
        scale: isCollapsed ? 1 : 1.02,
        y: isDragging ? 0 : -2,
        zIndex: 2,
        boxShadow: isCollapsed ? 'none' : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      }}
      whileTap={{ scale: 0.99 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
        mass: 0.5
      }}
      className={cn(
        "group relative slide-thumbnail transition-all duration-200 ease-out",
        isActive ? 'active' : '',
        isDragging ? 'dragging' : '',
        isCollapsed ? 'collapsed' : '',
        "hover:bg-gray-50/80 dark:hover:bg-gray-800/50",
        isActive ? 'bg-blue-50/50 dark:bg-blue-900/20' : 'bg-white/80 dark:bg-gray-900/80',
        !isCollapsed && 'rounded-xl p-2',
        'backdrop-blur-sm',
        'border border-gray-200/70 dark:border-gray-700/70',
        'shadow-sm',
        isActive && !isCollapsed && 'ring-2 ring-blue-500/80 ring-offset-2 ring-offset-white/50 dark:ring-offset-gray-900/50',
        isCollapsed ? 'w-16 h-16' : 'w-full',
        'overflow-hidden',
        'transform-gpu' // Better performance for transforms
      )}
      style={{
        // Subtle 3D tilt effect on hover
        transformStyle: 'preserve-3d',
        transformOrigin: 'center center',
        willChange: 'transform, opacity, box-shadow',
      }}
    >
      {isCollapsed ? (
        // Collapsed view - square thumbnail with live content
        <div className="w-full h-full rounded-lg relative overflow-hidden">
          {/* Live slide content */}
          <ThumbnailCanvas
            slide={slide}
            width={64}
            height={64}
            scale={0.08}
            className="w-full h-full"
            overrideElements={overrideElements as any}
          />
          
          {/* Slide number overlay */}
          <div className="absolute top-1 left-1 w-5 h-5 bg-black/80 text-white text-[10px] rounded-full flex items-center justify-center font-semibold">
            {index + 1}
          </div>
          
          {/* Active indicator */}
          {isActive && (
            <div className="absolute inset-0 border-2 border-blue-500 rounded-lg bg-blue-50/30 dark:bg-blue-900/20"></div>
          )}
        </div>
      ) : (
        // Expanded view - enhanced thumbnail structure
        <div className="relative h-full flex flex-col">
          {/* Drag handle */}
          <div 
            ref={dragHandleRef}
            className="absolute -left-1 -top-1 w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-move z-10"
            onMouseDown={handleDragHandleClick}
            onClick={handleDragHandleClick}
            draggable
            onDragStart={(e) => {
              e.stopPropagation();
              onDragStart(e as unknown as React.DragEvent, index);
            }}
          >
            <GripVertical className="w-3 h-3" />
          </div>

          {/* Slide Number Badge */}
          <div className={cn(
            "absolute -left-1 -top-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold z-10 transition-colors duration-200",
            isActive 
              ? "bg-blue-500 text-white" 
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
          )}>
            {index + 1}
          </div>

          {/* Thumbnail Content */}
          <div className="p-2 h-full flex flex-col">
            {/* Slide Title */}
            <div className="text-xs font-medium text-foreground truncate mb-2 px-1">
              {slide.title || `Slide ${index + 1}`}
            </div>
            
            {/* Thumbnail Canvas */}
            <div
              className={cn(
                "relative bg-white dark:bg-gray-900 rounded-lg overflow-hidden cursor-pointer transition-all duration-200",
                "border border-gray-200 dark:border-gray-700",
                "shadow-sm hover:shadow-md",
                isActive 
                  ? "ring-2 ring-blue-500 ring-offset-1" 
                  : "hover:ring-1 hover:ring-gray-300 dark:hover:ring-gray-600"
              )}
              style={{
                aspectRatio: "16 / 9",
                width: "100%",
                height: "auto",
              }}
            >
              <ThumbnailCanvas
                slide={slide}
                width={240}
                height={135}
                scale={0.25}
                className="w-full h-full"
                responsive
                overrideElements={overrideElements as any}
              />
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 dark:group-hover:bg-black/30 transition-colors duration-200" />
            </div>
          </div>

          {/* Context Menu Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const mouseEvent = e as unknown as React.MouseEvent;
              onContextMenu(mouseEvent, slide, index);
            }}
            className={cn(
              "absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center",
              "bg-white/90 dark:bg-gray-800/90 text-gray-500 dark:text-gray-400",
              "hover:bg-white hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200",
              "opacity-0 group-hover:opacity-100 transition-all duration-200",
              "shadow-sm border border-gray-200/70 dark:border-gray-600/50",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white/50 dark:focus:ring-offset-gray-900/50"
            )}
            title="Slide options"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </motion.div>
  );
};

const EnhancedSlideThumbnails: React.FC<EnhancedSlideThumbnailsProps> = ({
  slides,
  currentSlide,
  onSlideChange,
  onAddSlide,
  onDuplicateSlide,
  onDeleteSlide,
  onReorderSlides,
  onContextMenuAction,
  liveElements,
  liveSlideIndex,
}) => {
  // Keynote-style thumbnail component loaded
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ slide: Slide; index: number; x: number; y: number } | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showScrollHint, setShowScrollHint] = useState(false);
  
  // Check if we should show scroll hint (only when content overflows and not at bottom)
  useEffect(() => {
    const scrollArea = scrollRootRef.current;
    if (!scrollArea) return;
    
    const viewport = scrollArea.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
    if (!viewport) return;
    
    const checkScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = viewport;
      const atBottom = scrollHeight - scrollTop <= clientHeight + 5; // 5px threshold
      const hasOverflow = scrollHeight > clientHeight;
      setShowScrollHint(hasOverflow && !atBottom);
    };
    
    const observer = new MutationObserver(checkScroll);
    observer.observe(viewport, { childList: true, subtree: true });
    
    viewport.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    
    // Initial check
    checkScroll();
    
    return () => {
      observer.disconnect();
      viewport.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [slides.length]);
  
  // Track scroll position for parallax effect
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = target;
    const maxScroll = scrollHeight - clientHeight;
    const position = maxScroll > 0 ? scrollTop / maxScroll : 0;
    setScrollPosition(position);
  }, []);

  // Auto-scroll while dragging near edges (Keynote-grade smoothness)
  const scrollRootRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const root = scrollRootRef.current;
    if (!root) return;
    const viewport = root.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null;
    const el = viewport ?? root;
    if (!el) return;

    // Smooth behavior for manual scrolls as well
    try { (el.style as any).scrollBehavior = 'smooth'; } catch {}

    const SCROLL_ZONE = 60; // px sensitivity
    const MAX_SPEED = 15;   // px per frame at max intensity

    const speedRef = { current: 0 } as { current: number };
    const rafRef = { current: 0 } as { current: number };

    const step = () => {
      if (speedRef.current !== 0) {
        el.scrollTop += speedRef.current;
        rafRef.current = requestAnimationFrame(step);
      } else {
        rafRef.current = 0;
      }
    };

    const start = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(step);
    };

    const stop = () => {
      speedRef.current = 0;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };

    const handleDragOver = (e: DragEvent) => {
      const rect = el.getBoundingClientRect();
      const y = e.clientY;
      const distTop = y - rect.top;
      const distBot = rect.bottom - y;

      if (distTop < SCROLL_ZONE) {
        const ratio = (SCROLL_ZONE - distTop) / SCROLL_ZONE; // 0..1
        speedRef.current = -Math.max(1, ratio * MAX_SPEED);
        start();
      } else if (distBot < SCROLL_ZONE) {
        const ratio = (SCROLL_ZONE - distBot) / SCROLL_ZONE; // 0..1
        speedRef.current = Math.max(1, ratio * MAX_SPEED);
        start();
      } else {
        speedRef.current = 0;
        stop();
      }
    };

    const handleDragLeave = () => stop();
    const handleDrop = () => stop();

    el.addEventListener('dragover', handleDragOver);
    el.addEventListener('dragleave', handleDragLeave);
    el.addEventListener('drop', handleDrop);
    // As a safety, also stop on document dragend
    document.addEventListener('dragend', handleDrop);

    return () => {
      el.removeEventListener('dragover', handleDragOver);
      el.removeEventListener('dragleave', handleDragLeave);
      el.removeEventListener('drop', handleDrop);
      document.removeEventListener('dragend', handleDrop);
      stop();
    };
  }, []);

  // Drag & Drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      if (draggedIndex === null || draggedIndex === dropIndex) return;

      // Clone slides and reorder
      const reordered = Array.from(slides);
      const [movedSlide] = reordered.splice(draggedIndex, 1);
      reordered.splice(dropIndex, 0, movedSlide);

      // Update parent slides array
      if (onReorderSlides) {
        onReorderSlides(reordered);
      }

      // Don't change the current slide - keep editing the same slide
      // The slide content will stay with the same slide ID

      setDraggedIndex(null);
    },
    [draggedIndex, slides, currentSlide, onReorderSlides]
  );

  const handleContextMenu = useCallback((event: React.MouseEvent, slide: Slide, index: number) => {
    event.preventDefault();
    setContextMenu({ slide, index, x: event.clientX, y: event.clientY });
  }, []);

  const handleCloseContextMenu = useCallback(() => setContextMenu(null), []);

  const handleContextAction = useCallback(
    (action: SlideAction, slide: Slide, index: number) => {
    onContextMenuAction(action, slide, index);
    setContextMenu(null);
    },
    [onContextMenuAction]
  );

  // Close context menu on outside click
  useEffect(() => {
    const handleClickOutside = () => contextMenu && setContextMenu(null);
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [contextMenu]);

  return (
    <div 
      ref={scrollRootRef}
      className={cn(
        "h-full flex flex-col bg-white/80 dark:bg-gray-950/80 backdrop-blur-md",
        "border-r border-gray-200/70 dark:border-gray-800/70",
        "transition-all duration-300 ease-in-out overflow-hidden",
        isCollapsed ? 'w-20' : 'w-72',
        'relative' // For absolute positioning of children
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Subtle gradient overlay at the bottom to indicate scroll */}
      {showScrollHint && (
        <div 
          className={cn(
            "absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/90 to-transparent dark:from-gray-950/90",
            "flex items-end justify-center pb-2 pointer-events-none",
            "transition-opacity duration-300",
            isHovered ? 'opacity-100' : 'opacity-0'
          )}
        >
          <div className="animate-bounce w-6 h-6 rounded-full bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 flex items-center justify-center">
            <ChevronDown className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
          </div>
        </div>
      )}
      {/* Header */}
      {/* Removed header with collapse button */}

      {/* Slides List */}
      <ScrollArea ref={scrollRootRef} className="flex-1 scrollbar-keynote">
        <ScrollArea 
          className="flex-1"
          onScroll={handleScroll}
        >
          <div className={cn(
            "p-2 space-y-3 transition-all duration-300 ease-out",
            isCollapsed ? 'px-2' : 'px-3',
            'pb-24' // Extra padding at the bottom for better scrolling
          )}>
            <LayoutGroup>
              <AnimatePresence initial={false}>
                {slides.map((slide, index) => {
                  // Calculate a subtle parallax effect based on scroll position and index
                  const parallaxOffset = Math.min(20, Math.max(-20, (index / slides.length - scrollPosition) * 40));
                  
                  return (
                    <motion.div
                      key={slide.id}
                      layout
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                        mass: 0.5
                      }}
                      style={{
                        // Subtle parallax effect
                        y: isHovered ? parallaxOffset * 0.2 : 0,
                        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    >
                      <DraggableThumbnailItem
                        slide={slide}
                        index={index}
                        isActive={index === currentSlide}
                        isDragging={index === draggedIndex}
                        isCollapsed={isCollapsed}
                        onSelect={onSlideChange}
                        onContextMenu={handleContextMenu}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onDelete={onDeleteSlide}
                        overrideElements={liveSlideIndex === index ? liveElements : undefined}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </LayoutGroup>
            
            {/* Add slide button at the bottom */}
            {!isCollapsed && (
              <motion.div 
                className={cn(
                  "mt-2 mb-6 mx-1 p-2 rounded-lg border-2 border-dashed",
                  "border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500",
                  "bg-transparent hover:bg-blue-50/50 dark:hover:bg-blue-900/10",
                  "transition-colors duration-200 cursor-pointer",
                  "flex items-center justify-center space-x-2"
                )}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onAddSlide()}
              >
                <Plus className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Add Slide
                </span>
              </motion.div>
            )}
          </div>
        </ScrollArea>
      </ScrollArea>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed z-50"
            style={{
              left: `${contextMenu.x}px`,
              top: `${contextMenu.y}px`,
              transformOrigin: 'top left',
              // Ensure it doesn't go off-screen
              maxHeight: 'calc(100vh - 20px)',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <SlideContextMenu
              slide={contextMenu.slide}
              index={contextMenu.index}
              position={{ x: 0, y: 0 }}
              totalSlides={slides.length}
              onClose={() => setContextMenu(null)}
              onAction={(action) => {
                if (onContextMenuAction) {
                  onContextMenuAction(action, contextMenu.slide, contextMenu.index);
                }
                setContextMenu(null);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedSlideThumbnails;