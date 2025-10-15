// Simplified Professional Editor for testing
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SimplePowerPointCanvas from '../components/canvas/SimplePowerPointCanvas';

interface SlideElement {
  id: string;
  type: 'text' | 'placeholder' | 'shape';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  text?: string;
  placeholder?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  color?: string;
  selected?: boolean;
  shapeType?: 'rectangle' | 'circle' | 'triangle';
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

export default function SimpleProfessionalEditor() {
  const [elements, setElements] = useState<SlideElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [editingElement, setEditingElement] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Clear all elements
  const clearElements = useCallback(() => {
    setElements([]);
  }, []);

  // Handle element click
  const handleElementClick = useCallback((elementId: string) => {
    setSelectedElement(elementId);
    
    // If it's a placeholder, start editing
    const element = elements.find(el => el.id === elementId);
    if (element && element.type === 'placeholder') {
      setEditingElement(elementId);
      setEditText(element.text || '');
    }
  }, [elements]);

  // Handle text save
  const handleTextSave = useCallback(() => {
    if (editingElement) {
      setElements(prev => prev.map(el => 
        el.id === editingElement 
          ? { 
              ...el, 
              text: editText, 
              type: editText.trim() ? 'text' : 'placeholder',
              color: editText.trim() ? '#000000' : '#6b7280'
            }
          : el
      ));
      setEditingElement(null);
      setEditText('');
    }
  }, [editingElement, editText]);

  // Handle text cancel
  const handleTextCancel = useCallback(() => {
    setEditingElement(null);
    setEditText('');
  }, []);

  // Handle canvas click
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedElement(null);
      setEditingElement(null);
    }
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">Simple Professional Editor</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={clearElements}
            className="px-4 py-2 bg-gray-600 text-white hover:bg-gray-700 rounded"
          >
            Clear Slide
          </button>
          <button
            onClick={() => {
              const newElement: SlideElement = {
                id: `text-${Date.now()}`,
                type: 'text',
                x: 200,
                y: 200,
                width: 300,
                height: 60,
                text: 'Click to Add text',
                fontSize: 16,
                fontFamily: 'Segoe UI',
                fontWeight: 'normal',
                color: '#000000',
                selected: false
              };
              setElements(prev => [...prev, newElement]);
            }}
            className="px-3 py-2 bg-green-600 text-white hover:bg-green-700 rounded"
          >
            Add Text
          </button>
          <button
            onClick={() => {
              const newElement: SlideElement = {
                id: `shape-${Date.now()}`,
                type: 'shape',
                x: 200,
                y: 200,
                width: 100,
                height: 100,
                shapeType: 'rectangle',
                fill: '#0078d4',
                stroke: '#ffffff',
                strokeWidth: 2,
                selected: false
              };
              setElements(prev => [...prev, newElement]);
            }}
            className="px-3 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded"
          >
            Add Rectangle
          </button>
        </div>
      </header>

      {/* Canvas Area */}
      <div className="flex-1 relative overflow-hidden">
        <SimplePowerPointCanvas
          elements={elements}
          onElementSelect={handleElementSelect}
          onElementUpdate={(element) => {
            setElements(prev => prev.map(el => el.id === element.id ? element : el));
          }}
        />
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
        <div>Elements: {elements.length}</div>
        <div>Simple Professional Editor</div>
      </div>
    </div>
  );
}
