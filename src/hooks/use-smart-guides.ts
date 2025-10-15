import { useState, useCallback, useRef } from 'react';

export interface SmartGuide {
  id: string;
  type: 'horizontal' | 'vertical';
  position: number;
  elementIds: string[];
  distance: number;
}

export interface SmartGuidesState {
  guides: SmartGuide[];
  isEnabled: boolean;
  snapThreshold: number;
}

export const useSmartGuides = () => {
  const [state, setState] = useState<SmartGuidesState>({
    guides: [],
    isEnabled: true,
    snapThreshold: 10,
  });

  const [snappedElement, setSnappedElement] = useState<string | null>(null);
  const [snapOffset, setSnapOffset] = useState({ x: 0, y: 0 });

  const calculateGuides = useCallback((
    draggedElement: any,
    allElements: any[],
    slideWidth: number = 960,
    slideHeight: number = 540
  ) => {
    if (!state.isEnabled) return [];

    const guides: SmartGuide[] = [];
    const draggedRect = {
      left: draggedElement.x,
      right: draggedElement.x + draggedElement.width,
      top: draggedElement.y,
      bottom: draggedElement.y + draggedElement.height,
      centerX: draggedElement.x + draggedElement.width / 2,
      centerY: draggedElement.y + draggedElement.height / 2,
    };

    // Slide boundaries
    guides.push(
      { id: 'slide-left', type: 'vertical', position: 0, elementIds: [], distance: draggedRect.left },
      { id: 'slide-right', type: 'vertical', position: slideWidth, elementIds: [], distance: slideWidth - draggedRect.right },
      { id: 'slide-top', type: 'horizontal', position: 0, elementIds: [], distance: draggedRect.top },
      { id: 'slide-bottom', type: 'horizontal', position: slideHeight, elementIds: [], distance: slideHeight - draggedRect.bottom },
      { id: 'slide-center-x', type: 'vertical', position: slideWidth / 2, elementIds: [], distance: Math.abs(draggedRect.centerX - slideWidth / 2) },
      { id: 'slide-center-y', type: 'horizontal', position: slideHeight / 2, elementIds: [], distance: Math.abs(draggedRect.centerY - slideHeight / 2) }
    );

    // Other elements
    allElements.forEach(element => {
      if (element.id === draggedElement.id) return;

      const elementRect = {
        left: element.x,
        right: element.x + element.width,
        top: element.y,
        bottom: element.y + element.height,
        centerX: element.x + element.width / 2,
        centerY: element.y + element.height / 2,
      };

      // Vertical alignments
      guides.push(
        { id: `element-${element.id}-left`, type: 'vertical', position: elementRect.left, elementIds: [element.id], distance: Math.abs(draggedRect.left - elementRect.left) },
        { id: `element-${element.id}-right`, type: 'vertical', position: elementRect.right, elementIds: [element.id], distance: Math.abs(draggedRect.right - elementRect.right) },
        { id: `element-${element.id}-center-x`, type: 'vertical', position: elementRect.centerX, elementIds: [element.id], distance: Math.abs(draggedRect.centerX - elementRect.centerX) }
      );

      // Horizontal alignments
      guides.push(
        { id: `element-${element.id}-top`, type: 'horizontal', position: elementRect.top, elementIds: [element.id], distance: Math.abs(draggedRect.top - elementRect.top) },
        { id: `element-${element.id}-bottom`, type: 'horizontal', position: elementRect.bottom, elementIds: [element.id], distance: Math.abs(draggedRect.bottom - elementRect.bottom) },
        { id: `element-${element.id}-center-y`, type: 'horizontal', position: elementRect.centerY, elementIds: [element.id], distance: Math.abs(draggedRect.centerY - elementRect.centerY) }
      );
    });

    // Filter guides within snap threshold
    const activeGuides = guides.filter(guide => guide.distance <= state.snapThreshold);
    
    setState(prev => ({ ...prev, guides: activeGuides }));
    return activeGuides;
  }, [state.isEnabled, state.snapThreshold]);

  const snapToGuides = useCallback((
    draggedElement: any,
    allElements: any[],
    slideWidth: number = 960,
    slideHeight: number = 540
  ) => {
    const guides = calculateGuides(draggedElement, allElements, slideWidth, slideHeight);
    
    if (guides.length === 0) {
      setSnappedElement(null);
      setSnapOffset({ x: 0, y: 0 });
      return draggedElement;
    }

    // Find the closest guide
    const closestGuide = guides.reduce((closest, guide) => 
      guide.distance < closest.distance ? guide : closest
    );

    let snappedElement = { ...draggedElement };
    let offsetX = 0;
    let offsetY = 0;

    if (closestGuide.type === 'vertical') {
      if (closestGuide.id.includes('left')) {
        offsetX = closestGuide.position - draggedElement.x;
      } else if (closestGuide.id.includes('right')) {
        offsetX = closestGuide.position - (draggedElement.x + draggedElement.width);
      } else if (closestGuide.id.includes('center')) {
        offsetX = closestGuide.position - (draggedElement.x + draggedElement.width / 2);
      }
      snappedElement.x = draggedElement.x + offsetX;
    } else {
      if (closestGuide.id.includes('top')) {
        offsetY = closestGuide.position - draggedElement.y;
      } else if (closestGuide.id.includes('bottom')) {
        offsetY = closestGuide.position - (draggedElement.y + draggedElement.height);
      } else if (closestGuide.id.includes('center')) {
        offsetY = closestGuide.position - (draggedElement.y + draggedElement.height / 2);
      }
      snappedElement.y = draggedElement.y + offsetY;
    }

    setSnappedElement(draggedElement.id);
    setSnapOffset({ x: offsetX, y: offsetY });

    return snappedElement;
  }, [calculateGuides]);

  const clearGuides = useCallback(() => {
    setState(prev => ({ ...prev, guides: [] }));
    setSnappedElement(null);
    setSnapOffset({ x: 0, y: 0 });
  }, []);

  const toggleGuides = useCallback(() => {
    setState(prev => ({ ...prev, isEnabled: !prev.isEnabled }));
  }, []);

  const setSnapThreshold = useCallback((threshold: number) => {
    setState(prev => ({ ...prev, snapThreshold: threshold }));
  }, []);

  return {
    ...state,
    snappedElement,
    snapOffset,
    calculateGuides,
    snapToGuides,
    clearGuides,
    toggleGuides,
    setSnapThreshold,
  };
};
