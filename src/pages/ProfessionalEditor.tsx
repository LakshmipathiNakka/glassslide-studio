// Professional PowerPoint-style editor with all features
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import SimplePowerPointCanvas from '../components/canvas/SimplePowerPointCanvas';
import { SimpleTextEditor } from '../components/editors/SimpleTextEditor';
import { LayoutSelector } from '../components/canvas/LayoutSelector';
import { useCanvasStore } from '../hooks/useCanvasStore';
import { SlideElement, SlideLayout } from '../types/canvas';
// Removed SLIDE_LAYOUTS import - template system removed

export default function ProfessionalEditor() {
  const [isLayoutSelectorOpen, setIsLayoutSelectorOpen] = useState(false);
  const [editingElement, setEditingElement] = useState<SlideElement | null>(null);
  const [showTextEditor, setShowTextEditor] = useState(false);
  
  // Canvas store
  const {
    elements,
    selectedElements,
    setElements,
    addElement,
    updateElement,
    deleteElement,
    selectElement,
    clearSelection,
    undo,
    redo,
    toggleSnapping,
    snapSettings,
    saveState
  } = useCanvasStore();

  // Keyboard shortcuts
  useHotkeys('ctrl+z', undo, { preventDefault: true });
  useHotkeys('ctrl+y', redo, { preventDefault: true });
  useHotkeys('ctrl+shift+z', redo, { preventDefault: true });
  useHotkeys('ctrl+n', () => setIsLayoutSelectorOpen(true), { preventDefault: true });
  useHotkeys('delete', () => {
    selectedElements.forEach(id => deleteElement(id));
    clearSelection();
  }, { preventDefault: true });
  useHotkeys('escape', () => {
    clearSelection();
    setEditingElement(null);
    setShowTextEditor(false);
  });

  // Handle element selection
  const handleElementSelect = useCallback((element: SlideElement | null) => {
    if (element && element.type === 'placeholder') {
      // Start editing placeholder
      setEditingElement(element);
      setShowTextEditor(true);
    } else {
      setEditingElement(null);
      setShowTextEditor(false);
    }
  }, []);

  // Handle element updates
  const handleElementUpdate = useCallback((element: SlideElement) => {
    updateElement(element.id, element);
    saveState();
  }, [updateElement, saveState]);

  // Handle text editing save
  const handleTextSave = useCallback((element: SlideElement, content: string) => {
    const updatedElement: SlideElement = {
      ...element,
      text: content,
      type: content.trim() ? 'text' : 'placeholder'
    };
    
    updateElement(element.id, updatedElement);
    setEditingElement(null);
    setShowTextEditor(false);
    saveState();
  }, [updateElement, saveState]);

  // Handle text editing cancel
  const handleTextCancel = useCallback(() => {
    setEditingElement(null);
    setShowTextEditor(false);
  }, []);

  // Handle layout selection
  const handleLayoutSelect = useCallback((layout: SlideLayout) => {
    // Only add elements if they're not placeholders
    const nonPlaceholderElements = layout.elements.filter(el => el.type !== 'placeholder');
    setElements(nonPlaceholderElements.map(el => ({ ...el, id: `${el.id}-${Date.now()}` })));
    saveState();
  }, [setElements, saveState]);

  // Add new text element
  const handleAddText = useCallback(() => {
    const newElement: SlideElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      x: 200,
      y: 200,
      width: 300,
      height: 60,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      zIndex: elements.length + 1,
      text: '',
      placeholder: 'Click to Add text',
      fontSize: 16,
      fontFamily: 'Segoe UI',
      fontWeight: 'normal',
      fontStyle: 'normal',
      color: '#000000',
      textAlign: 'left',
      lineHeight: 1.2,
      selected: false,
      locked: false
    };
    
    addElement(newElement);
    setEditingElement(newElement);
    setShowTextEditor(true);
  }, [addElement, elements.length]);

  // Add new shape
  const handleAddShape = useCallback((shapeType: 'rectangle' | 'circle' | 'triangle') => {
    const newElement: SlideElement = {
      id: `shape-${Date.now()}`,
      type: 'shape',
      x: 200,
      y: 200,
      width: 100,
      height: 100,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      zIndex: elements.length + 1,
      shapeType,
      fill: '#0078d4',
      stroke: '#ffffff',
      strokeWidth: 2,
      selected: false,
      locked: false
    };
    
    addElement(newElement);
  }, [addElement, elements.length]);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900">Professional Slide Editor</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={undo}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              title="Undo (Ctrl+Z)"
            >
              Undo
            </button>
            <button
              onClick={redo}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              title="Redo (Ctrl+Y)"
            >
              Redo
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSnapping}
            className={`px-3 py-1 text-sm rounded ${
              snapSettings.enabled 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-700'
            }`}
            title="Toggle Snapping"
          >
            Snap: {snapSettings.enabled ? 'ON' : 'OFF'}
          </button>
          
          <button
            onClick={() => setIsLayoutSelectorOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded"
          >
            New Slide
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Add:</span>
          <button
            onClick={handleAddText}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
          >
            Text
          </button>
          <button
            onClick={() => handleAddShape('rectangle')}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
          >
            Rectangle
          </button>
          <button
            onClick={() => handleAddShape('circle')}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
          >
            Circle
          </button>
          <button
            onClick={() => handleAddShape('triangle')}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
          >
            Triangle
          </button>
        </div>
        
        <div className="flex-1" />
        
        <div className="text-sm text-gray-500">
          {selectedElements.length} selected
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative overflow-hidden">
        <SimplePowerPointCanvas
          onElementSelect={handleElementSelect}
          onElementUpdate={handleElementUpdate}
          onElementAdd={addElement}
          onElementDelete={deleteElement}
        />
        
        {/* Text Editor Overlay */}
        <AnimatePresence>
          {showTextEditor && editingElement && (
            <SimpleTextEditor
              element={editingElement}
              isVisible={showTextEditor}
              onSave={handleTextSave}
              onCancel={handleTextCancel}
              onFocus={() => {}}
              onBlur={() => {}}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Layout Selector Modal */}
      <LayoutSelector
        isOpen={isLayoutSelectorOpen}
        onClose={() => setIsLayoutSelectorOpen(false)}
        onLayoutSelect={handleLayoutSelect}
      />

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <span>Elements: {elements.length}</span>
          <span>Selected: {selectedElements.length}</span>
        </div>
        <div>
          <span>Professional Slide Editor</span>
        </div>
      </div>
    </div>
  );
}
