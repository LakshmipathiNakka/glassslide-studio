import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MoreVertical,
  Play,
  Pause,
  StickyNote,
  Tag,
  Eye,
  EyeOff,
  Lock,
  Unlock
} from 'lucide-react';
import { SlideThumbnailProps, SlideCategory } from '@/types/slide-thumbnails';
import ThumbnailCanvas from './ThumbnailCanvas';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const slideCategories: SlideCategory[] = [
  { id: 'intro', name: 'Intro', icon: Eye, color: '#3b82f6' },
  { id: 'content', name: 'Content', icon: Tag, color: '#10b981' },
  { id: 'data', name: 'Data', icon: Tag, color: '#f59e0b' },
  { id: 'conclusion', name: 'End', icon: Tag, color: '#ef4444' },
  { id: 'custom', name: 'Custom', icon: Tag, color: '#8b5cf6' }
];

const SlideThumbnail: React.FC<SlideThumbnailProps> = ({
  slide,
  index,
  isActive,
  isDragging,
  isHovered,
  onSelect,
  onContextMenu,
  onDragStart,
  onDragEnd,
  thumbnailRef
}) => {
  const [isHoveredLocal, setIsHoveredLocal] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) { // Left click
      dragStartPos.current = { x: e.clientX, y: e.clientY };
      onDragStart(index);
    }
  }, [index, onDragStart]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragStartPos.current && isDragging) {
      const deltaX = Math.abs(e.clientX - dragStartPos.current.x);
      const deltaY = Math.abs(e.clientY - dragStartPos.current.y);
      
      // Start drag if moved more than 5 pixels
      if (deltaX > 5 || deltaY > 5) {
        // Drag logic would be handled by parent component
      }
    }
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    if (dragStartPos.current) {
      dragStartPos.current = null;
      onDragEnd();
    }
  }, [onDragEnd]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onSelect(index);
  }, [index, onSelect]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onContextMenu(e, slide, index);
  }, [slide, index, onContextMenu]);

  const handleDoubleClick = useCallback(() => {
    // Toggle notes preview
    setShowNotes(!showNotes);
  }, [showNotes]);

  const category = slideCategories.find(cat => cat.id === slide.category) || slideCategories[4];
  const CategoryIcon = category.icon;

  return (
    <motion.div
      ref={thumbnailRef}
      layout
      initial={false}
      animate={{
        scale: isActive ? 1.02 : 1,
        y: isDragging ? -4 : 0,
        rotateX: isHovered || isHoveredLocal ? 2 : 0,
        rotateY: isHovered || isHoveredLocal ? 1 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.8
      }}
      className={`relative group cursor-pointer select-none ${
        isDragging ? 'z-[100]' : 'z-[10]'
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseEnter={() => setIsHoveredLocal(true)}
      onMouseLeave={() => setIsHoveredLocal(false)}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onDoubleClick={handleDoubleClick}
    >
      {/* Main Thumbnail Container */}
      <div className={`
        relative w-full aspect-video rounded-2xl overflow-hidden
        transition-all duration-300 ease-out
        ${isActive 
          ? 'ring-2 ring-blue-500 ring-offset-2 shadow-xl shadow-blue-500/20' 
          : 'ring-1 ring-gray-200 hover:ring-gray-300'
        }
        ${isDragging ? 'shadow-2xl shadow-black/20' : 'shadow-lg shadow-black/5'}
        ${isHovered || isHoveredLocal ? 'shadow-xl shadow-black/10' : ''}
      `}>
        {/* Background */}
        <div 
          className="absolute inset-0"
          style={{ backgroundColor: slide.background || '#ffffff' }}
        />

        {/* Thumbnail Canvas */}
        <div className="absolute inset-0">
          <ThumbnailCanvas
            slide={slide}
            width={200}
            height={112}
            scale={0.15}
            className="w-full h-full"
          />
        </div>

        {/* Overlay Effects */}
        <AnimatePresence>
          {(isHovered || isHoveredLocal) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"
            />
          )}
        </AnimatePresence>

        {/* Active Indicator */}
        {isActive && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute top-2 left-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
          >
            <div className="w-2 h-2 bg-white rounded-full" />
          </motion.div>
        )}

        {/* Category Badge */}
        <div className="absolute top-2 right-2">
          <Badge
            variant="secondary"
            className="text-xs px-2 py-1 bg-white/90 backdrop-blur-sm border-0"
            style={{ color: category.color }}
          >
            <CategoryIcon className="w-3 h-3 mr-1" />
            {category.name}
          </Badge>
        </div>

        {/* Slide Number */}
        <div className="absolute bottom-2 left-2">
          <div className="px-2 py-1 bg-black/20 backdrop-blur-sm rounded-md">
            <span className="text-white text-xs font-medium">
              {index + 1}
            </span>
          </div>
        </div>

        {/* Animation Duration Indicator */}
        {slide.animationDuration && slide.animationDuration > 0 && (
          <div className="absolute bottom-2 right-2">
            <div className="flex items-center gap-1 px-2 py-1 bg-black/20 backdrop-blur-sm rounded-md">
              <Play className="w-3 h-3 text-white" />
              <span className="text-white text-xs">
                {slide.animationDuration}s
              </span>
            </div>
          </div>
        )}

        {/* Notes Indicator */}
        {slide.notes && (
          <div className="absolute top-2 left-2">
            <div className="w-6 h-6 bg-yellow-500/90 backdrop-blur-sm rounded-full flex items-center justify-center">
              <StickyNote className="w-3 h-3 text-white" />
            </div>
          </div>
        )}

        {/* Lock Indicator */}
        {isLocked && (
          <div className="absolute top-2 left-2">
            <div className="w-6 h-6 bg-gray-500/90 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Lock className="w-3 h-3 text-white" />
            </div>
          </div>
        )}

        {/* Hover Actions */}
        <AnimatePresence>
          {(isHovered || isHoveredLocal) && !isDragging && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute inset-0 z-[20] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            >
              <div className="flex gap-1 sm:gap-2 flex-wrap justify-center">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0 bg-white/90 hover:bg-white shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPlaying(!isPlaying);
                  }}
                >
                  {isPlaying ? (
                    <Pause className="w-3 h-3 sm:w-4 sm:h-4" />
                  ) : (
                    <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                  )}
                </Button>
                
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0 bg-white/90 hover:bg-white shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowNotes(!showNotes);
                  }}
                >
                  {showNotes ? (
                    <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" />
                  ) : (
                    <StickyNote className="w-3 h-3 sm:w-4 sm:h-4" />
                  )}
                </Button>

                <Button
                  size="sm"
                  variant="secondary"
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0 bg-white/90 hover:bg-white shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    onContextMenu(e, slide, index);
                  }}
                >
                  <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Drag Indicator */}
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-[30] bg-blue-500/20 border-2 border-blue-500 border-dashed rounded-2xl"
          />
        )}
      </div>

      {/* Slide Title */}
      <div className="mt-2 px-1">
        <h4 className="text-xs sm:text-sm font-medium text-gray-900 truncate">
          {slide.title || `Slide ${index + 1}`}
        </h4>
        <p className="text-xs text-gray-500 truncate">
          {slide.elements.length} elements
          {slide.notes && ' • Has notes'}
          {slide.animationDuration && ` • ${slide.animationDuration}s`}
        </p>
      </div>

      {/* Notes Preview */}
      <AnimatePresence>
        {showNotes && slide.notes && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 p-2 sm:p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
          >
            <div className="flex items-start gap-2">
              <StickyNote className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-yellow-800 leading-relaxed break-words">
                {slide.notes}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SlideThumbnail;
