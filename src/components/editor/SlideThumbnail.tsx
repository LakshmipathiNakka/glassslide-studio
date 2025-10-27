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
import SlideRenderer from '@/components/shared/SlideRenderer';
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
  // Removed dragStartPos ref as we're using native HTML5 drag and drop

  // Removed custom drag handlers to avoid conflict with native HTML5 drag and drop

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
      // Removed mouse event handlers to avoid conflict with native HTML5 drag and drop
      onMouseEnter={() => setIsHoveredLocal(true)}
      onMouseLeave={() => setIsHoveredLocal(false)}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onDoubleClick={handleDoubleClick}
    >
      {/* Main Thumbnail Container - Refined Apple Keynote Style */}
      <div className={`
        thumbnail-container sortable-item relative w-full aspect-video rounded-xl overflow-hidden
        transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
        ${isActive ? 'active' : ''}
        ${isDragging 
          ? 'dragging shadow-2xl shadow-blue-200/50 ring-2 ring-blue-400 scale-105 rotate-1' 
          : 'shadow-sm hover:shadow-md hover:-translate-y-1'
        }
        group cursor-grab active:cursor-grabbing
      `}>
        {/* Background */}
        <div 
          className="absolute inset-0"
          style={{ backgroundColor: slide.background || '#ffffff' }}
        />

        {/* Unified Thumbnail Renderer */}
        <div className="absolute inset-0">
          <SlideRenderer slide={slide as any} mode="thumbnail" scale={200/1024} className="w-full h-full" />
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
        <div className="absolute bottom-2 right-2">
          <div className="px-2 py-1 bg-black/20 backdrop-blur-sm rounded-md">
            <span className="text-white text-xs font-medium">
              {index + 1}
            </span>
          </div>
        </div>

        {/* Animation Duration Indicator */}
        {slide.animationDuration && slide.animationDuration > 0 && (
          <div className="absolute bottom-2 left-2">
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


        {/* Drag Indicator */}
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-[30] bg-blue-500/20 border-2 border-blue-500 border-dashed rounded-2xl"
          />
        )}
      </div>

      {/* Slide Title - Refined Apple Keynote Style */}
      <div className="mt-2 px-1">
        <h4 className="text-xs font-medium text-gray-700 truncate tracking-wide">
          {slide.title || `Slide ${index + 1}`}
        </h4>
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
