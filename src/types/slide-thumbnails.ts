import { Element } from '@/hooks/use-action-manager';

export interface Slide {
  id: string;
  elements: Element[];
  background: string;
  createdAt: Date;
  thumbnail?: string;
  title?: string;
  notes?: string;
  theme?: string;
  animationDuration?: number;
  category?: 'intro' | 'content' | 'data' | 'conclusion' | 'custom';
}

export interface SlideThumbnailProps {
  slide: Slide;
  index: number;
  isActive: boolean;
  isDragging: boolean;
  isHovered: boolean;
  onSelect: (index: number) => void;
  onContextMenu: (event: React.MouseEvent, slide: Slide, index: number) => void;
  onDragStart: (index: number) => void;
  onDragEnd: () => void;
  thumbnailRef?: React.RefObject<HTMLDivElement>;
}

export interface SlideContextMenuProps {
  slide: Slide;
  index: number;
  position: { x: number; y: number };
  totalSlides: number;
  onClose: () => void;
  onAction: (action: SlideAction, slide: Slide, index: number) => void;
}

export type SlideAction = 
  | 'add-new'
  | 'duplicate'
  | 'delete'
  | 'change-background'
  | 'add-cover'
  | 'rename'
  | 'add-notes';

export interface EnhancedSlideThumbnailsProps {
  slides: Slide[];
  currentSlide: number;
  onSlideChange: (index: number) => void;
  onAddSlide: () => void;
  onAddSlideAtIndex: (index: number) => void;
  onDuplicateSlide: (index: number) => void;
  onDeleteSlide: (index: number) => void;
  onReorderSlides: (fromIndex: number, toIndex: number) => void;
  onUpdateSlide: (index: number, updates: Partial<Slide>) => void;
  onRenameSlide: (index: number, title: string) => void;
  onSetSlideCategory: (index: number, category: Slide['category']) => void;
  onAddSlideNotes: (index: number, notes: string) => void;
  onChangeSlideBackground: (index: number, background: string) => void;
  onAddSlideCover: (index: number, coverImage: string) => void;
  onContextMenuAction: (action: SlideAction, slide: Slide, index: number) => void;
}

export interface ThumbnailCanvasProps {
  slide: Slide;
  width: number;
  height: number;
  scale?: number;
  className?: string;
}

export interface SlideCategory {
  id: Slide['category'];
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export interface DragState {
  isDragging: boolean;
  draggedIndex: number | null;
  hoveredIndex: number | null;
  dragOffset: { x: number; y: number };
}
