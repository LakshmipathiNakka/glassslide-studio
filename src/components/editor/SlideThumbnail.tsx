import React, { useState, useRef, useCallback, useEffect } from 'react';
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
  Unlock,
  Check,
  X
} from 'lucide-react';
import { SlideThumbnailProps, SlideCategory } from '@/types/slide-thumbnails';
import SlideRenderer from '@/components/shared/SlideRenderer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

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
  const [isRenaming, setIsRenaming] = useState(false);
  const [tempName, setTempName] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);
  const nameContainerRef = useRef<HTMLDivElement>(null);
  // Removed dragStartPos ref as we're using native HTML5 drag and drop

  // Removed custom drag handlers to avoid conflict with native HTML5 drag and drop

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onSelect(index);
  }, [index, onSelect]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    // Prevent context menu if renaming
    if (isRenaming) return;
    
    // Get the three-dot button element
    const menuButton = e.currentTarget.closest('.slide-thumbnail-actions')?.querySelector('.menu-button');
    onContextMenu(e, slide, index, menuButton || undefined);
  }, [slide, index, onContextMenu, isRenaming]);

  const startRenaming = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setTempName(slide.name || `Slide ${index + 1}`);
    setIsRenaming(true);
  }, [slide.name, index]);

  const handleRename = useCallback(() => {
    if (tempName.trim() && tempName !== slide.name) {
      onRename?.(index, tempName.trim());
    }
    setIsRenaming(false);
  }, [tempName, slide.name, index, onRename]);

  const cancelRename = useCallback(() => {
    setIsRenaming(false);
  }, []);

  // Handle click outside to save the name
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (nameContainerRef.current && !nameContainerRef.current.contains(e.target as Node)) {
        handleRename();
      }
    };

    if (isRenaming) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus the input when renaming starts
      setTimeout(() => {
        nameInputRef.current?.focus();
        nameInputRef.current?.select();
      }, 0);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isRenaming, handleRename]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    // Start renaming on double click
    if (!isRenaming) {
      startRenaming(e);
    }
  }, [isRenaming, startRenaming]);

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
            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors z-10 menu-button"
            onClick={handleContextMenu}
            aria-label="Slide options"
          >
            <CategoryIcon className="w-3 h-3 mr-1" />
            {category.name}
          </Badge>
        </div>

        {/* Slide Number */}
        <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity z-10 slide-thumbnail-actions">
          <span className="text-white text-xs font-medium">
            {index + 1}
          </span>
        </div>

        {/* Animation Duration Indicator */}
        {slide.animationDuration && slide.animationDuration > 0 && (
          <div className="absolute bottom-2 left-2 right-2">
            <div className="flex items-center gap-1 px-2 py-1 bg-black/20 backdrop-blur-sm rounded-md">
              <Play className="w-3 h-3 text-white" />
              <span className="text-white text-xs">
                {slide.animationDuration}s
              </span>
            </div>
          </div>
        )}

        {/* Slide Title */}
        <div 
          ref={nameContainerRef}
          className="flex items-center justify-between px-2 py-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg min-h-8"
          onClick={(e) => e.stopPropagation()}
        >
          {isRenaming ? (
            <div className="flex-1 flex items-center space-x-1">
              <Input
                ref={nameInputRef}
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename();
                  else if (e.key === 'Escape') cancelRename();
                }}
                className="h-6 text-xs px-1.5 py-0.5 flex-1 min-w-0"
                onClick={(e) => e.stopPropagation()}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-green-500 hover:bg-green-500/10"
                onClick={handleRename}
              >
                <Check className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-red-500 hover:bg-red-500/10"
                onClick={cancelRename}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <>
              <span 
                className="text-xs font-medium text-gray-700 dark:text-gray-200 truncate flex-1 cursor-text"
                onClick={startRenaming}
              >
                {slide.name || `Slide ${index + 1}`}
              </span>
              <div className="flex items-center space-x-1">
                <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 h-5">
                  {index + 1}
                </Badge>
              </div>
            </>
          )}
        </div>

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
