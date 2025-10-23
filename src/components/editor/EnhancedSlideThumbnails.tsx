import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronDown, Trash2, MoreVertical, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { EnhancedSlideThumbnailsProps, Slide, SlideAction } from '@/types/slide-thumbnails';
import ThumbnailCanvas from './ThumbnailCanvas';
import SlideContextMenu from './SlideContextMenu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

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
}> = ({ slide, index, isActive, isDragging, isCollapsed, onSelect, onContextMenu, onDragStart, onDragOver, onDrop, onDelete }) => {
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
          rotate: 0
        }}
        exit={{ opacity: 0, y: -10, scale: 0.98 }}
        whileHover={{ 
          scale: isDragging ? 1.02 : 1,
          y: isDragging ? 0 : -2,
          rotate: 0
        }}
        whileTap={{ scale: 0.99 }}
        transition={{
          type: "tween",
          duration: 0.2,
          ease: "easeOut"
        }}
        className={`group relative slide-thumbnail ${isActive ? 'active' : ''} ${isDragging ? 'dragging' : ''} ${isCollapsed ? 'collapsed' : ''} hover:bg-gray-50/50 transition-colors duration-150`}
      >
      {isCollapsed ? (
        // Collapsed view - square thumbnail with live content
        <div className="w-full aspect-square rounded-lg border border-gray-200 relative overflow-hidden">
          {/* Live slide content */}
          <ThumbnailCanvas
            slide={slide}
            width={64}
            height={64}
            scale={0.08}
            className="w-full h-full"
          />
          
          {/* Slide number overlay */}
          <div className="absolute top-1 left-1 w-4 h-4 bg-black/70 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {index + 1}
          </div>
          
          {/* Active indicator */}
          {isActive && (
            <div className="absolute inset-0 border-2 border-blue-500 rounded-lg bg-blue-50/50"></div>
          )}
        </div>
      ) : (
        // Expanded view - simple thumbnail structure
        <>
          {/* Slide Number Badge - Simple style */}
          <div className="absolute -left-1 -top-1 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium z-10">
            {index + 1}
          </div>

          {/* Thumbnail Content */}
          <div className="p-3 h-full flex flex-col">
            {/* Slide Title */}
            <div className="text-xs font-medium text-foreground truncate mb-2">
              {slide.title || `Slide ${index + 1}`}
            </div>
            
            {/* Thumbnail Canvas */}
            <div className="flex-1 rounded-sm border border-slide-border overflow-hidden">
              <ThumbnailCanvas
        slide={slide}
                width={200}
                height={112}
                scale={0.15}
                className="w-full h-full"
      />
    </div>
          </div>

          {/* Three Dots Menu Button - Simple hover */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const mouseEvent = e as unknown as React.MouseEvent;
              onContextMenu(mouseEvent, slide, index);
            }}
            className="absolute top-2 right-2 w-6 h-6 bg-white/90 hover:bg-white text-gray-500 hover:text-gray-700 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 ease-out shadow-sm border border-gray-200/50 z-10"
            title="Slide options"
          >
            <MoreVertical className="w-3 h-3" />
          </button>
        </>
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
}) => {
  // Keynote-style thumbnail component loaded
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ slide: Slide; index: number; x: number; y: number } | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

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
      console.log('🔄 ENHANCED THUMBNAILS - Calling onReorderSlides with:', {
        reorderedLength: reordered.length,
        reorderedIds: reordered.map(s => s.id),
        hasOnReorderSlides: !!onReorderSlides,
        onReorderSlidesType: typeof onReorderSlides
      });
      
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
    console.log('🎯 RIGHT CLICK DETECTED:', { slideId: slide.id, index, x: event.clientX, y: event.clientY });
    event.preventDefault();
    setContextMenu({ slide, index, x: event.clientX, y: event.clientY });
    console.log('🎯 CONTEXT MENU STATE SET:', { slideId: slide.id, index });
  }, []);

  const handleCloseContextMenu = useCallback(() => setContextMenu(null), []);

  const handleContextAction = useCallback(
    (action: SlideAction, slide: Slide, index: number) => {
      console.log('🎯 ENHANCED THUMBNAILS - Context action triggered:', { action, slideId: slide.id, index, hasOnContextMenuAction: !!onContextMenuAction });
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
      className={`panel-background h-full flex flex-col border-r border-gray-200/60 transition-all duration-300 ${
        isCollapsed ? 'w-16 sm:w-20' : 'w-[200px] md:w-[220px] lg:w-[240px]'
      }`}
    >
      {/* Header */}
      <div className={`${isCollapsed ? 'p-2' : 'p-4'} border-b border-gray-200/40 flex-shrink-0 bg-white/30 backdrop-blur-md`}>
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold text-gray-800">Slides</h2>
              <Badge variant="secondary" className="text-xs">
                {slides.length}
              </Badge>
            </div>
          )}
                <Button
                  variant="ghost"
                  size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className="keynote-button p-1 h-8 w-8"
            title={isCollapsed ? "Expand thumbnails" : "Collapse thumbnails"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
            </Button>
        </div>
      </div>

      {/* Slides List */}
      <ScrollArea className="flex-1 scrollbar-keynote">
        <div className={`${isCollapsed ? 'space-y-2 p-1' : 'space-y-3 p-2'} flex flex-col`}>
          {slides.map((slide, index) => (
            <DraggableThumbnailItem
              key={`${slide.id}-${slide.lastUpdated || 0}-${slide.elements?.length || 0}`}
                    slide={slide}
              index={index}
              isActive={currentSlide === index}
              isDragging={draggedIndex === index}
              isCollapsed={isCollapsed}
                    onSelect={onSlideChange}
                    onContextMenu={handleContextMenu}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDelete={(slideId) => onDeleteSlide(slides.findIndex((s) => s.id === slideId))}
            />
          ))}
            </div>

        {/* Add Slide Button - Keynote style */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          className={`${isCollapsed ? 'mt-2 mb-1' : 'mt-4 mb-2'}`}
        >
          {isCollapsed ? (
            <motion.div
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 flex items-center justify-center bg-white hover:bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-150"
                onClick={onAddSlide}
                title="Add new slide"
              >
                <Plus size={16} className="text-gray-500" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.99 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
        >
          <Button
            variant="outline"
                className="w-full flex items-center justify-center gap-2 py-3 bg-white hover:bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm active:scale-99 transition-all duration-150 shadow-sm"
            onClick={onAddSlide}
          >
                <Plus size={18} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-600">New Slide</span>
          </Button>
            </motion.div>
          )}
        </motion.div>
      </ScrollArea>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <>
            {console.log('🎯 RENDERING CONTEXT MENU:', { slideId: contextMenu.slide.id, index: contextMenu.index })}
          <SlideContextMenu
            slide={contextMenu.slide}
            index={contextMenu.index}
              position={{ x: contextMenu.x, y: contextMenu.y }}
            totalSlides={slides.length}
              onAction={handleContextAction}
            onClose={handleCloseContextMenu}
          />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedSlideThumbnails;