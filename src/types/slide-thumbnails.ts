import { Element } from '@/hooks/use-action-manager';

export interface Slide {
  id: string;
  elements: Element[];
  background: string;
  createdAt: Date;
  lastUpdated?: number;
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
  anchorElement?: HTMLElement | null;
}

export type SlideAction = 
  | 'add'
  | 'duplicate'
  | 'delete'
  | 'theme'
  | 'layout'
  | 'change-background'
  | 'rename';

export interface EnhancedSlideThumbnailsProps {
  slides: Slide[];
  currentSlide: number;
  onSlideChange: (index: number) => void;
  onAddSlide: () => void;
  onAddSlideAtIndex: (index: number) => void;
  onDuplicateSlide: (index: number) => void;
  onDeleteSlide: (index: number) => void;
  onReorderSlides: (reorderedSlides: Slide[]) => void;
  onUpdateSlide: (index: number, updates: Partial<Slide>) => void;
  onRenameSlide: (index: number, title: string) => void;
  onSetSlideCategory: (index: number, category: Slide['category']) => void;
  onChangeSlideBackground: (index: number, background: string) => void;
  onContextMenuAction: (action: SlideAction, slide: Slide, index: number) => void;
  // Live preview support
  liveElements?: Element[] | null;
  liveSlideIndex?: number;
}

export interface ThumbnailCanvasProps {
  slide: Slide;
  width: number;
  height: number;
  scale?: number;
  className?: string;
  responsive?: boolean; // when true, container fills parent; width/height used for internal resolution only
  overrideElements?: Element[] | null;
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
