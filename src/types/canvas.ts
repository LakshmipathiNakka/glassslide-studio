// Core types for PowerPoint-style slide canvas
export interface SlideElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'chart' | 'table';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  opacity?: number;
  zIndex: number;
  
  // Text specific
  text?: string;
  content?: string;
  placeholder?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'medium' | 'bold';
  fontStyle?: 'normal' | 'italic';
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'double' | 'none';
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: number;
  
  // Shape specific
  shapeType?: 'rectangle' | 'circle' | 'triangle';
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  
  // Image specific
  imageUrl?: string;
  
  // Selection and interaction
  selected?: boolean;
  locked?: boolean;

  // Table specific
  rows?: number;
  cols?: number;
  tableData?: string[][];
  cellPadding?: number;
  cellTextAlign?: 'left' | 'center' | 'right';
  tableBackground?: string;
  header?: boolean;
  headerBg?: string;
  headerTextColor?: string;
  rowAltBg?: string | null;
  columnWidths?: number[];
  themeId?: string;
  shadow?: boolean;
  shadowBlur?: number;
}

export interface SlideLayout {
  id: string;
  name: string;
  description: string;
  elements: SlideElement[];
  backgroundColor?: string;
}

export interface CanvasState {
  elements: SlideElement[];
  selectedElements: string[];
  clipboard: SlideElement[];
  history: {
    past: SlideElement[][];
    present: SlideElement[];
    future: SlideElement[][];
  };
  canvas: {
    width: number;
    height: number;
    zoom: number;
    panX: number;
    panY: number;
  };
  snapSettings: {
    enabled: boolean;
    gridSize: number;
    objectSnapping: boolean;
    guideLines: boolean;
  };
}

export interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  draggedElements: string[];
  snapGuides: SnapGuide[];
}

export interface ResizeState {
  isResizing: boolean;
  handle: ResizeHandle;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  startElements: SlideElement[];
}

export interface SnapGuide {
  id: string;
  type: 'horizontal' | 'vertical';
  position: number;
  color: string;
  opacity: number;
}

export type ResizeHandle = 
  | 'nw' | 'n' | 'ne'
  | 'w' | 'e'
  | 'sw' | 's' | 'se';

export interface TextEditorState {
  isEditing: boolean;
  elementId: string;
  content: string;
  selection: {
    start: number;
    end: number;
  };
}
