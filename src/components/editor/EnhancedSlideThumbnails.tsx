import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronDown, Trash2 } from 'lucide-react';
import { EnhancedSlideThumbnailsProps, Slide, SlideAction } from '@/types/slide-thumbnails';
import SlideThumbnail from './SlideThumbnail';
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
  onSelect: (index: number) => void;
  onContextMenu: (event: React.MouseEvent, slide: Slide, index: number) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onDelete: (slideId: string) => void;
}> = ({ slide, index, isActive, isDragging, onSelect, onContextMenu, onDragStart, onDragOver, onDrop, onDelete }) => {
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, scale: isDragging ? 1.05 : 1 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: isDragging ? 1.05 : 1.02, y: isDragging ? 0 : -2 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative slide-thumbnail ${isActive ? 'active' : ''} ${isDragging ? 'dragging' : ''}`}
    >
      <SlideThumbnail
        slide={slide}
        index={index}
        isActive={isActive}
        isDragging={isDragging}
        isHovered={false}
        onSelect={onSelect}
        onContextMenu={onContextMenu}
        onDragStart={() => {}}
        onDragEnd={() => {}}
      />

      {/* Delete Button */}
      {index > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(slide.id);
          }}
          className="absolute top-2 right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 z-10"
          title="Delete slide"
        >
          <Trash2 className="w-3 h-3" />
        </button>
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
  console.log('🚨 OLD ENHANCED THUMBNAILS - Component rendered (this should not be called!)');
  console.log('🚨 Current URL:', window.location.pathname);
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
      className={`panel-background h-full flex flex-col border-r border-gray-200/60 transition-all duration-300 ${
        isCollapsed ? 'w-12 sm:w-16' : 'w-[200px] md:w-[220px] lg:w-[240px]'
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200/40 flex-shrink-0 bg-white/30 backdrop-blur-md">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold text-gray-800">Slides</h2>
              <Badge variant="secondary" className="text-xs">
                {slides.length}
              </Badge>
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(!isCollapsed)} className="p-1 h-8 w-8">
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${isCollapsed ? 'rotate-90' : '-rotate-90'}`}
            />
          </Button>
        </div>
      </div>

      {/* Slides List */}
      <ScrollArea className="flex-1 scrollbar-keynote">
        <div className="space-y-3 flex flex-col p-2">
          {slides.map((slide, index) => (
            <DraggableThumbnailItem
              key={`${slide.id}-${slide.lastUpdated || 0}`}
              slide={slide}
              index={index}
              isActive={currentSlide === index}
              isDragging={draggedIndex === index}
              onSelect={onSlideChange}
              onContextMenu={handleContextMenu}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDelete={(slideId) => onDeleteSlide(slides.findIndex((s) => s.id === slideId))}
            />
          ))}
        </div>

        {/* Add Slide Button */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-4 mb-2">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:bg-gradient-to-b hover:from-gray-100 hover:to-gray-200 hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-200 shadow-sm"
            onClick={onAddSlide}
          >
            <Plus size={18} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">New Slide</span>
          </Button>
        </motion.div>
      </ScrollArea>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <SlideContextMenu
            slide={contextMenu.slide}
            index={contextMenu.index}
            position={{ x: contextMenu.x, y: contextMenu.y }}
            totalSlides={slides.length}
            onAction={handleContextAction}
            onClose={handleCloseContextMenu}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedSlideThumbnails;