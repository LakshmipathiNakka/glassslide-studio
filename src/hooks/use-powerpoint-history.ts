import { useState, useCallback, useRef } from 'react';

export interface HistoryAction {
  id: string;
  type: 'add' | 'delete' | 'move' | 'resize' | 'edit' | 'duplicate' | 'reorder' | 'style' | 'group' | 'ungroup';
  description: string;
  timestamp: number;
  data: any;
  slideIndex?: number;
  elementId?: string;
}

interface HistoryState {
  actions: HistoryAction[];
  currentIndex: number;
  maxHistorySize: number;
}

export function usePowerPointHistory(maxHistorySize: number = 50) {
  const [state, setState] = useState<HistoryState>({
    actions: [],
    currentIndex: -1,
    maxHistorySize,
  });

  const actionIdCounter = useRef(0);

  const canUndo = state.currentIndex >= 0;
  const canRedo = state.currentIndex < state.actions.length - 1;

  const getActionDescription = (action: Omit<HistoryAction, 'id' | 'timestamp'>): string => {
    const typeDescriptions = {
      add: 'Add',
      delete: 'Delete',
      move: 'Move',
      resize: 'Resize',
      edit: 'Edit',
      duplicate: 'Duplicate',
      reorder: 'Reorder',
      style: 'Style',
      group: 'Group',
      ungroup: 'Ungroup',
    };

    const baseDescription = typeDescriptions[action.type];
    const elementType = action.data?.elementType || 'element';
    const slideInfo = action.slideIndex !== undefined ? ` on slide ${action.slideIndex + 1}` : '';
    
    return `${baseDescription} ${elementType}${slideInfo}`;
  };

  const addAction = useCallback((action: Omit<HistoryAction, 'id' | 'timestamp'>) => {
    const newAction: HistoryAction = {
      ...action,
      id: `action_${++actionIdCounter.current}`,
      timestamp: Date.now(),
    };

    setState(prev => {
      // Remove any actions after current index (when branching)
      const newActions = prev.actions.slice(0, prev.currentIndex + 1);
      
      // Add new action
      newActions.push(newAction);
      
      // Limit history size
      const limitedActions = newActions.slice(-prev.maxHistorySize);
      
      return {
        actions: limitedActions,
        currentIndex: limitedActions.length - 1,
        maxHistorySize: prev.maxHistorySize,
      };
    });
  }, []);

  const undo = useCallback(() => {
    if (!canUndo) return;

    setState(prev => ({
      ...prev,
      currentIndex: prev.currentIndex - 1,
    }));
  }, [canUndo]);

  const redo = useCallback(() => {
    if (!canRedo) return;

    setState(prev => ({
      ...prev,
      currentIndex: prev.currentIndex + 1,
    }));
  }, [canRedo]);

  const getCurrentState = useCallback(() => {
    if (state.currentIndex >= 0 && state.currentIndex < state.actions.length) {
      return state.actions[state.currentIndex];
    }
    return null;
  }, [state.actions, state.currentIndex]);

  const getUndoDescription = useCallback(() => {
    if (canUndo && state.currentIndex >= 0) {
      return state.actions[state.currentIndex].description;
    }
    return '';
  }, [canUndo, state.actions, state.currentIndex]);

  const getRedoDescription = useCallback(() => {
    if (canRedo && state.currentIndex < state.actions.length - 1) {
      return state.actions[state.currentIndex + 1].description;
    }
    return '';
  }, [canRedo, state.actions, state.currentIndex]);

  const clear = useCallback(() => {
    setState({
      actions: [],
      currentIndex: -1,
      maxHistorySize: state.maxHistorySize,
    });
  }, [state.maxHistorySize]);

  const getHistoryList = useCallback(() => {
    return state.actions.map((action, index) => ({
      ...action,
      isCurrent: index === state.currentIndex,
      canUndoTo: index <= state.currentIndex,
    }));
  }, [state.actions, state.currentIndex]);

  // Helper functions for common actions
  const addElementAction = useCallback((elementType: string, slideIndex: number, elementId: string) => {
    addAction({
      type: 'add',
      description: `Add ${elementType}`,
      data: { elementType, elementId },
      slideIndex,
      elementId,
    });
  }, [addAction]);

  const deleteElementAction = useCallback((elementType: string, slideIndex: number, elementId: string) => {
    addAction({
      type: 'delete',
      description: `Delete ${elementType}`,
      data: { elementType, elementId },
      slideIndex,
      elementId,
    });
  }, [addAction]);

  const moveElementAction = useCallback((elementType: string, slideIndex: number, elementId: string, fromPos: {x: number, y: number}, toPos: {x: number, y: number}) => {
    addAction({
      type: 'move',
      description: `Move ${elementType}`,
      data: { elementType, elementId, fromPos, toPos },
      slideIndex,
      elementId,
    });
  }, [addAction]);

  const resizeElementAction = useCallback((elementType: string, slideIndex: number, elementId: string, fromSize: {width: number, height: number}, toSize: {width: number, height: number}) => {
    addAction({
      type: 'resize',
      description: `Resize ${elementType}`,
      data: { elementType, elementId, fromSize, toSize },
      slideIndex,
      elementId,
    });
  }, [addAction]);

  const editElementAction = useCallback((elementType: string, slideIndex: number, elementId: string, property: string, fromValue: any, toValue: any) => {
    addAction({
      type: 'edit',
      description: `Edit ${elementType} ${property}`,
      data: { elementType, elementId, property, fromValue, toValue },
      slideIndex,
      elementId,
    });
  }, [addAction]);

  const duplicateElementAction = useCallback((elementType: string, slideIndex: number, elementId: string) => {
    addAction({
      type: 'duplicate',
      description: `Duplicate ${elementType}`,
      data: { elementType, elementId },
      slideIndex,
      elementId,
    });
  }, [addAction]);

  const reorderSlidesAction = useCallback((fromIndex: number, toIndex: number) => {
    addAction({
      type: 'reorder',
      description: `Reorder slides`,
      data: { fromIndex, toIndex },
    });
  }, [addAction]);

  return {
    // Core functionality
    addAction,
    undo,
    redo,
    canUndo,
    canRedo,
    clear,
    
    // State access
    getCurrentState,
    getUndoDescription,
    getRedoDescription,
    getHistoryList,
    
    // Helper functions
    addElementAction,
    deleteElementAction,
    moveElementAction,
    resizeElementAction,
    editElementAction,
    duplicateElementAction,
    reorderSlidesAction,
    
    // State info
    currentIndex: state.currentIndex,
    totalActions: state.actions.length,
  };
}
