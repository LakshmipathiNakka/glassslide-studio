import { useState, useRef, useCallback, useEffect } from 'react';

// Types for the drag engine
export interface DragState {
  id: string;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  startElementX: number;
  startElementY: number;
  deltaX: number;
  deltaY: number;
  isActive: boolean;
  constraintType?: 'none' | 'horizontal' | 'vertical' | 'center';
  snapPoints: SnapPoint[];
}

export interface SnapPoint {
  id: string;
  x: number;
  y: number;
  type: 'grid' | 'edge' | 'object' | 'center';
  strength: number; // 0-1, how strong the snap is
  axis?: 'x' | 'y' | 'both';
}

export interface TransformData {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface ElementData {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  type: string;
}

// Event Layer - manages mouse events and state
export class EventLayer {
  private canvasRef: React.RefObject<HTMLElement>;
  private dragState: DragState | null = null;
  private isDragging = false;
  private animationFrameId: number | null = null;
  private lastUpdateTime = 0;
  private readonly TARGET_FPS = 60;
  private readonly FRAME_TIME = 1000 / this.TARGET_FPS;

  constructor(canvasRef: React.RefObject<HTMLElement>) {
    this.canvasRef = canvasRef;
  }

  // Mouse down handler
  handleMouseDown = (e: React.MouseEvent, elementId: string, elementData: ElementData) => {
    e.preventDefault();
    
    const canvasRect = this.canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    // Calculate element position relative to canvas
    const slideWidth = 960;
    const slideHeight = 540;
    const slideX = (canvasRect.width - slideWidth) / 2;
    const slideY = (canvasRect.height - slideHeight) / 2;

    const mouseX = e.clientX - canvasRect.left - slideX;
    const mouseY = e.clientY - canvasRect.top - slideY;

    this.dragState = {
      id: elementId,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
      startElementX: elementData.x,
      startElementY: elementData.y,
      deltaX: 0,
      deltaY: 0,
      isActive: true,
      constraintType: this.getConstraintType(e),
      snapPoints: []
    };

    this.isDragging = true;
    this.startDragTracking();
    
    // Set cursor and prevent selection
    document.body.style.cursor = 'move';
    document.body.style.userSelect = 'none';
    
    return this.dragState;
  };

  // Mouse move handler
  handleMouseMove = (e: MouseEvent) => {
    if (!this.isDragging || !this.dragState) return;

    this.dragState.currentX = e.clientX;
    this.dragState.currentY = e.clientY;
    this.dragState.deltaX = e.clientX - this.dragState.startX;
    this.dragState.deltaY = e.clientY - this.dragState.startY;

    // Apply constraints
    this.applyConstraints();

    return this.dragState;
  };

  // Mouse up handler
  handleMouseUp = () => {
    if (!this.isDragging || !this.dragState) return;

    const finalState = { ...this.dragState };
    
    this.isDragging = false;
    this.dragState = null;
    this.stopDragTracking();
    
    // Reset cursor and selection
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    
    return finalState;
  };

  private getConstraintType(e: React.MouseEvent): 'none' | 'horizontal' | 'vertical' | 'center' {
    if (e.shiftKey) return 'horizontal'; // Shift = horizontal constraint
    if (e.altKey) return 'center'; // Alt = center-based drag
    if (e.ctrlKey) return 'vertical'; // Ctrl = vertical constraint
    return 'none';
  }

  private applyConstraints() {
    if (!this.dragState) return;

    switch (this.dragState.constraintType) {
      case 'horizontal':
        this.dragState.deltaY = 0;
        break;
      case 'vertical':
        this.dragState.deltaX = 0;
        break;
      case 'center':
        // Center-based drag - element stays centered on cursor
        this.dragState.deltaX *= 2;
        this.dragState.deltaY *= 2;
        break;
    }
  }

  private startDragTracking() {
    const update = () => {
      const now = performance.now();
      if (now - this.lastUpdateTime >= this.FRAME_TIME) {
        this.lastUpdateTime = now;
        // Trigger render update
        this.onFrameUpdate?.(this.dragState);
      }
      this.animationFrameId = requestAnimationFrame(update);
    };
    this.animationFrameId = requestAnimationFrame(update);
  }

  private stopDragTracking() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  // Callback for frame updates
  onFrameUpdate?: (dragState: DragState | null) => void;
}

// Transform Manager - handles GPU-accelerated transforms
export class TransformManager {
  private tempTransform: TransformData | null = null;
  private isTransforming = false;

  // Start transform with GPU acceleration
  startTransform(elementData: ElementData, dragState: DragState): TransformData {
    this.isTransforming = true;
    
    const newTransform: TransformData = {
      x: elementData.x + dragState.deltaX,
      y: elementData.y + dragState.deltaY,
      width: elementData.width,
      height: elementData.height,
      rotation: elementData.rotation
    };

    this.tempTransform = newTransform;
    return newTransform;
  }

  // Update transform during drag
  updateTransform(elementData: ElementData, dragState: DragState, snapPoints: SnapPoint[] = []): TransformData {
    if (!this.isTransforming) return this.startTransform(elementData, dragState);

    let newX = elementData.x + dragState.deltaX;
    let newY = elementData.y + dragState.deltaY;

    // Apply snapping
    const snappedTransform = this.applySnapping(newX, newY, snapPoints);
    newX = snappedTransform.x;
    newY = snappedTransform.y;

    const newTransform: TransformData = {
      x: newX,
      y: newY,
      width: elementData.width,
      height: elementData.height,
      rotation: elementData.rotation
    };

    this.tempTransform = newTransform;
    return newTransform;
  }

  // Apply snapping logic
  private applySnapping(x: number, y: number, snapPoints: SnapPoint[]): { x: number; y: number } {
    const SNAP_THRESHOLD = 8; // pixels
    let snappedX = x;
    let snappedY = y;

    for (const snapPoint of snapPoints) {
      const distanceX = Math.abs(x - snapPoint.x);
      const distanceY = Math.abs(y - snapPoint.y);

      if (snapPoint.axis === 'x' || snapPoint.axis === 'both') {
        if (distanceX <= SNAP_THRESHOLD * snapPoint.strength) {
          snappedX = snapPoint.x;
        }
      }

      if (snapPoint.axis === 'y' || snapPoint.axis === 'both') {
        if (distanceY <= SNAP_THRESHOLD * snapPoint.strength) {
          snappedY = snapPoint.y;
        }
      }
    }

    return { x: snappedX, y: snappedY };
  }

  // Commit final transform
  commitTransform(): TransformData | null {
    const finalTransform = this.tempTransform;
    this.tempTransform = null;
    this.isTransforming = false;
    return finalTransform;
  }

  // Cancel transform
  cancelTransform() {
    this.tempTransform = null;
    this.isTransforming = false;
  }

  getCurrentTransform(): TransformData | null {
    return this.tempTransform;
  }
}

// Snap Engine - calculates snap points
export class SnapEngine {
  private gridSize = 20;
  private slideWidth = 960;
  private slideHeight = 540;
  private elements: ElementData[] = [];

  constructor(gridSize = 20) {
    this.gridSize = gridSize;
  }

  // Update elements for snapping calculations
  updateElements(elements: ElementData[]) {
    this.elements = elements;
  }

  // Calculate snap points for an element
  calculateSnapPoints(draggedElement: ElementData, dragState: DragState): SnapPoint[] {
    const snapPoints: SnapPoint[] = [];

    // Grid snapping
    const gridSnaps = this.calculateGridSnaps(draggedElement, dragState);
    snapPoints.push(...gridSnaps);

    // Slide edge snapping
    const edgeSnaps = this.calculateEdgeSnaps(draggedElement, dragState);
    snapPoints.push(...edgeSnaps);

    // Object snapping
    const objectSnaps = this.calculateObjectSnaps(draggedElement, dragState);
    snapPoints.push(...objectSnaps);

    // Center snapping
    const centerSnaps = this.calculateCenterSnaps(draggedElement, dragState);
    snapPoints.push(...centerSnaps);

    return snapPoints;
  }

  private calculateGridSnaps(element: ElementData, dragState: DragState): SnapPoint[] {
    const snaps: SnapPoint[] = [];
    
    const newX = element.x + dragState.deltaX;
    const newY = element.y + dragState.deltaY;

    // Snap to grid
    const gridX = Math.round(newX / this.gridSize) * this.gridSize;
    const gridY = Math.round(newY / this.gridSize) * this.gridSize;

    snaps.push({
      id: 'grid-x',
      x: gridX,
      y: newY,
      type: 'grid',
      strength: 0.8,
      axis: 'x'
    });

    snaps.push({
      id: 'grid-y',
      x: newX,
      y: gridY,
      type: 'grid',
      strength: 0.8,
      axis: 'y'
    });

    return snaps;
  }

  private calculateEdgeSnaps(element: ElementData, dragState: DragState): SnapPoint[] {
    const snaps: SnapPoint[] = [];
    
    const newX = element.x + dragState.deltaX;
    const newY = element.y + dragState.deltaY;

    // Slide edges
    snaps.push({
      id: 'slide-left',
      x: 0,
      y: newY,
      type: 'edge',
      strength: 1.0,
      axis: 'x'
    });

    snaps.push({
      id: 'slide-right',
      x: this.slideWidth - element.width,
      y: newY,
      type: 'edge',
      strength: 1.0,
      axis: 'x'
    });

    snaps.push({
      id: 'slide-top',
      x: newX,
      y: 0,
      type: 'edge',
      strength: 1.0,
      axis: 'y'
    });

    snaps.push({
      id: 'slide-bottom',
      x: newX,
      y: this.slideHeight - element.height,
      type: 'edge',
      strength: 1.0,
      axis: 'y'
    });

    return snaps;
  }

  private calculateObjectSnaps(element: ElementData, dragState: DragState): SnapPoint[] {
    const snaps: SnapPoint[] = [];
    
    const newX = element.x + dragState.deltaX;
    const newY = element.y + dragState.deltaY;

    for (const otherElement of this.elements) {
      if (otherElement.id === element.id) continue;

      // Align with other object edges
      snaps.push({
        id: `object-${otherElement.id}-left`,
        x: otherElement.x - element.width,
        y: newY,
        type: 'object',
        strength: 0.9,
        axis: 'x'
      });

      snaps.push({
        id: `object-${otherElement.id}-right`,
        x: otherElement.x + otherElement.width,
        y: newY,
        type: 'object',
        strength: 0.9,
        axis: 'x'
      });

      snaps.push({
        id: `object-${otherElement.id}-top`,
        x: newX,
        y: otherElement.y - element.height,
        type: 'object',
        strength: 0.9,
        axis: 'y'
      });

      snaps.push({
        id: `object-${otherElement.id}-bottom`,
        x: newX,
        y: otherElement.y + otherElement.height,
        type: 'object',
        strength: 0.9,
        axis: 'y'
      });
    }

    return snaps;
  }

  private calculateCenterSnaps(element: ElementData, dragState: DragState): SnapPoint[] {
    const snaps: SnapPoint[] = [];
    
    const newX = element.x + dragState.deltaX;
    const newY = element.y + dragState.deltaY;

    // Slide center
    const slideCenterX = this.slideWidth / 2 - element.width / 2;
    const slideCenterY = this.slideHeight / 2 - element.height / 2;

    snaps.push({
      id: 'slide-center-x',
      x: slideCenterX,
      y: newY,
      type: 'center',
      strength: 1.0,
      axis: 'x'
    });

    snaps.push({
      id: 'slide-center-y',
      x: newX,
      y: slideCenterY,
      type: 'center',
      strength: 1.0,
      axis: 'y'
    });

    return snaps;
  }
}

// Render Pipeline - handles 60 FPS rendering
export class RenderPipeline {
  private isRendering = false;
  private animationFrameId: number | null = null;
  private lastRenderTime = 0;
  private readonly TARGET_FPS = 60;
  private readonly FRAME_TIME = 1000 / this.TARGET_FPS;

  // Start rendering loop
  startRender(onRender: () => void) {
    if (this.isRendering) return;

    this.isRendering = true;
    
    const render = () => {
      const now = performance.now();
      if (now - this.lastRenderTime >= this.FRAME_TIME) {
        this.lastRenderTime = now;
        onRender();
      }
      this.animationFrameId = requestAnimationFrame(render);
    };
    
    this.animationFrameId = requestAnimationFrame(render);
  }

  // Stop rendering loop
  stopRender() {
    this.isRendering = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  // Force immediate render
  forceRender(onRender: () => void) {
    onRender();
  }
}

// History Stack - manages undo/redo
export class HistoryStack {
  private history: TransformData[][] = [];
  private currentIndex = -1;
  private maxHistorySize = 50;

  // Save state to history
  saveState(elements: ElementData[]) {
    // Remove any future history if we're not at the end
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    // Add new state
    const state = elements.map(el => ({
      x: el.x,
      y: el.y,
      width: el.width,
      height: el.height,
      rotation: el.rotation
    }));
    
    this.history.push(state);
    this.currentIndex++;

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.currentIndex--;
    }
  }

  // Undo
  undo(): TransformData[] | null {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.history[this.currentIndex];
    }
    return null;
  }

  // Redo
  redo(): TransformData[] | null {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      return this.history[this.currentIndex];
    }
    return null;
  }

  // Check if undo is available
  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  // Check if redo is available
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  // Clear history
  clear() {
    this.history = [];
    this.currentIndex = -1;
  }
}

// Main Drag Engine Hook
export const useDragEngine = (canvasRef: React.RefObject<HTMLElement>) => {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [tempTransform, setTempTransform] = useState<TransformData | null>(null);
  const [snapGuides, setSnapGuides] = useState<SnapPoint[]>([]);

  // Initialize engine components
  const eventLayerRef = useRef<EventLayer | null>(null);
  const transformManagerRef = useRef<TransformManager | null>(null);
  const snapEngineRef = useRef<SnapEngine | null>(null);
  const renderPipelineRef = useRef<RenderPipeline | null>(null);
  const historyStackRef = useRef<HistoryStack | null>(null);

  useEffect(() => {
    eventLayerRef.current = new EventLayer(canvasRef);
    transformManagerRef.current = new TransformManager();
    snapEngineRef.current = new SnapEngine(20);
    renderPipelineRef.current = new RenderPipeline();
    historyStackRef.current = new HistoryStack();

    // Set up event layer callback
    eventLayerRef.current.onFrameUpdate = (state) => {
      setDragState(state);
    };

    return () => {
      renderPipelineRef.current?.stopRender();
    };
  }, [canvasRef]);

  // Start drag
  const startDrag = useCallback((e: React.MouseEvent, elementId: string, elementData: ElementData, allElements: ElementData[]) => {
    if (!eventLayerRef.current || !transformManagerRef.current || !snapEngineRef.current) return;

    // Update snap engine with current elements
    snapEngineRef.current.updateElements(allElements);

    // Start drag
    const state = eventLayerRef.current.handleMouseDown(e, elementId, elementData);
    setDragState(state);

    // Add global mouse event listeners
    const handleGlobalMouseMove = (e: MouseEvent) => {
      const updatedState = eventLayerRef.current!.handleMouseMove(e);
      if (updatedState && transformManagerRef.current) {
        // Calculate snap points
        const snapPoints = snapEngineRef.current!.calculateSnapPoints(elementData, updatedState);
        updatedState.snapPoints = snapPoints;
        setSnapGuides(snapPoints);

        // Update transform
        const transform = transformManagerRef.current.updateTransform(elementData, updatedState, snapPoints);
        setTempTransform(transform);
      }
    };

    const handleGlobalMouseUp = () => {
      const finalState = eventLayerRef.current!.handleMouseUp();
      
      if (finalState && transformManagerRef.current && historyStackRef.current) {
        // Commit final transform
        const finalTransform = transformManagerRef.current.commitTransform();
        if (finalTransform) {
          setTempTransform(finalTransform);
        }

        // Save to history
        historyStackRef.current.saveState(allElements);
      }

      // Clean up
      setDragState(null);
      setTempTransform(null);
      setSnapGuides([]);

      // Remove global listeners
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  // Get current transform for an element
  const getElementTransform = useCallback((elementId: string, defaultTransform: TransformData): TransformData => {
    if (dragState?.id === elementId && tempTransform) {
      return tempTransform;
    }
    return defaultTransform;
  }, [dragState, tempTransform]);

  // Undo/Redo
  const undo = useCallback(() => {
    if (!historyStackRef.current) return null;
    return historyStackRef.current.undo();
  }, []);

  const redo = useCallback(() => {
    if (!historyStackRef.current) return null;
    return historyStackRef.current.redo();
  }, []);

  const canUndo = useCallback(() => {
    return historyStackRef.current?.canUndo() || false;
  }, []);

  const canRedo = useCallback(() => {
    return historyStackRef.current?.canRedo() || false;
  }, []);

  return {
    dragState,
    tempTransform,
    snapGuides,
    startDrag,
    getElementTransform,
    undo,
    redo,
    canUndo,
    canRedo,
    isDragging: dragState?.isActive || false
  };
};
