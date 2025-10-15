import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus,
  Grid3X3,
  List,
  Search,
  Filter,
  MoreHorizontal,
  ChevronDown,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';
import { EnhancedSlideThumbnailsProps, Slide, SlideAction, DragState } from '@/types/slide-thumbnails';
import SlideThumbnail from './SlideThumbnail';
import SlideContextMenu from './SlideContextMenu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

// Sortable Thumbnail Item
const SortableThumbnailItem: React.FC<{
  slide: Slide;
  index: number;
  isActive: boolean;
  onSelect: (index: number) => void;
  onContextMenu: (event: React.MouseEvent, slide: Slide, index: number) => void;
  onDragStart: (index: number) => void;
  onDragEnd: () => void;
}> = ({ slide, index, isActive, onSelect, onContextMenu, onDragStart, onDragEnd }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <SlideThumbnail
        slide={slide}
        index={index}
        isActive={isActive}
        isDragging={isDragging}
        isHovered={false}
        onSelect={onSelect}
        onContextMenu={onContextMenu}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      />
    </div>
  );
};

const EnhancedSlideThumbnails: React.FC<EnhancedSlideThumbnailsProps> = ({
  slides,
  currentSlide,
  onSlideChange,
  onAddSlide,
  onAddSlideAtIndex,
  onDuplicateSlide,
  onDeleteSlide,
  onReorderSlides,
  onUpdateSlide,
  onRenameSlide,
  onSetSlideCategory,
  onAddSlideNotes,
  onChangeSlideBackground,
  onAddSlideCover,
  onContextMenuAction
}) => {
  // State
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    slide: Slide;
    index: number;
    position: { x: number; y: number };
  } | null>(null);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedIndex: null,
    hoveredIndex: null,
    dragOffset: { x: 0, y: 0 }
  });
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filtered slides
  const filteredSlides = slides.filter(slide => {
    const matchesSearch = !searchQuery || 
      slide.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      slide.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !filterCategory || slide.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Event handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const index = slides.findIndex(slide => slide.id === active.id);
    
    setDragState(prev => ({
      ...prev,
      isDragging: true,
      draggedIndex: index,
    }));
  }, [slides]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const overIndex = slides.findIndex(slide => slide.id === over.id);
      setDragState(prev => ({
        ...prev,
        hoveredIndex: overIndex,
      }));
    }
  }, [slides]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = slides.findIndex(slide => slide.id === active.id);
      const newIndex = slides.findIndex(slide => slide.id === over.id);
      
      onReorderSlides(oldIndex, newIndex);
    }
    
    setDragState({
      isDragging: false,
      draggedIndex: null,
      hoveredIndex: null,
      dragOffset: { x: 0, y: 0 }
    });
  }, [slides, onReorderSlides]);

  const handleContextMenu = useCallback((event: React.MouseEvent, slide: Slide, index: number) => {
    event.preventDefault();
    setContextMenu({
      slide,
      index,
      position: { x: event.clientX, y: event.clientY }
    });
  }, []);

  const handleContextMenuAction = useCallback((action: SlideAction, slide: Slide, index: number) => {
    // All context menu actions are handled by the useSlideThumbnails hook
    onContextMenuAction(action, slide, index);
  }, [onContextMenuAction]);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  // Categories for filtering
  const categories = [
    { id: 'intro', name: 'Introduction', count: slides.filter(s => s.category === 'intro').length },
    { id: 'content', name: 'Content', count: slides.filter(s => s.category === 'content').length },
    { id: 'data', name: 'Data', count: slides.filter(s => s.category === 'data').length },
    { id: 'conclusion', name: 'Conclusion', count: slides.filter(s => s.category === 'conclusion').length },
    { id: 'custom', name: 'Custom', count: slides.filter(s => s.category === 'custom' || !s.category).length },
  ];

  return (
    <div className={`h-full flex flex-col bg-white/95 backdrop-blur-xl border-r border-gray-200/50 transition-all duration-300 ${
      isCollapsed ? 'w-12 sm:w-16' : 'w-64 sm:w-72 lg:w-80'
    }`}>
      {/* Header */}
      <div className="p-2 sm:p-4 border-b border-gray-100/50 flex-shrink-0">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-1 sm:gap-2">
              <h3 className="font-semibold text-gray-900 text-xs sm:text-sm">Slides</h3>
              <Badge variant="secondary" className="text-xs px-1 sm:px-2">
                {filteredSlides.length}
              </Badge>
            </div>
          )}
          
          <div className="flex items-center gap-1">
            {!isCollapsed && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                  onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                >
                  {viewMode === 'list' ? <Grid3X3 className="w-3 h-3 sm:w-4 sm:h-4" /> : <List className="w-3 h-3 sm:w-4 sm:h-4" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 sm:h-8 sm:w-8 p-0"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${isCollapsed ? 'rotate-90' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        {!isCollapsed && (
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 sm:mt-3 space-y-2 sm:space-y-3"
              >
                <Input
                  placeholder="Search slides..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-7 sm:h-8 text-xs sm:text-sm"
                />
                
                <div className="flex flex-wrap gap-1">
                  <Button
                    variant={filterCategory === null ? "default" : "outline"}
                    size="sm"
                    className="h-5 sm:h-6 text-xs px-2"
                    onClick={() => setFilterCategory(null)}
                  >
                    All
                  </Button>
                  {categories.map(category => (
                    <Button
                      key={category.id}
                      variant={filterCategory === category.id ? "default" : "outline"}
                      size="sm"
                      className="h-5 sm:h-6 text-xs px-2"
                      onClick={() => setFilterCategory(category.id)}
                    >
                      <span className="hidden sm:inline">{category.name} ({category.count})</span>
                      <span className="sm:hidden">{category.name}</span>
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Thumbnails List */}
      <ScrollArea className="flex-1 p-2 sm:p-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredSlides.map(slide => slide.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className={`space-y-2 sm:space-y-4 ${
              viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4' : 'flex flex-col'
            }`}>
              {filteredSlides.map((slide, index) => {
                // Find the actual index in the main slides array
                const actualIndex = slides.findIndex(s => s.id === slide.id);
                return (
                  <SortableThumbnailItem
                    key={slide.id}
                    slide={slide}
                    index={actualIndex}
                    isActive={currentSlide === actualIndex}
                    onSelect={onSlideChange}
                    onContextMenu={handleContextMenu}
                    onDragStart={() => {}}
                    onDragEnd={() => {}}
                  />
                );
              })}
            </div>
          </SortableContext>

          <DragOverlay>
            {dragState.isDragging && dragState.draggedIndex !== null ? (
              <div className="opacity-50">
                <SlideThumbnail
                  slide={slides[dragState.draggedIndex]}
                  index={dragState.draggedIndex}
                  isActive={false}
                  isDragging={true}
                  isHovered={false}
                  onSelect={() => {}}
                  onContextMenu={() => {}}
                  onDragStart={() => {}}
                  onDragEnd={() => {}}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Add Slide Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 sm:mt-4"
        >
          <Button
            variant="outline"
            className="w-full aspect-video border-dashed hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-200"
            onClick={onAddSlide}
          >
            <div className="flex flex-col items-center gap-1 sm:gap-2">
              <Plus className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400" />
              <span className="text-xs sm:text-sm text-gray-500">Add Slide</span>
            </div>
          </Button>
        </motion.div>
      </ScrollArea>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <SlideContextMenu
            slide={contextMenu.slide}
            index={contextMenu.index}
            position={contextMenu.position}
            totalSlides={slides.length}
            onClose={handleCloseContextMenu}
            onAction={handleContextMenuAction}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedSlideThumbnails;
