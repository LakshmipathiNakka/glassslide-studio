/**
 * SmartSidebar Demo Page
 * Interactive demonstration of the context-aware sidebar system
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SmartSidebar } from '@/components/editor/SmartSidebar';
import { SlideElement } from '@/types/canvas';
import { Type, Square, Circle, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSmartLayoutApply } from '@/hooks/useSmartLayoutApply.tsx';

const DEMO_ELEMENTS: SlideElement[] = [
  {
    id: 'text-1',
    type: 'text',
    x: 100,
    y: 100,
    width: 300,
    height: 80,
    content: 'Sample Text Box',
    fontSize: 24,
    fontFamily: 'Inter',
    color: '#1f2937',
    backgroundColor: '#f3f4f6',
    rotation: 0,
  },
  {
    id: 'shape-1',
    type: 'shape',
    x: 450,
    y: 100,
    width: 150,
    height: 150,
    shapeType: 'rectangle',
    fill: '#3b82f6',
    stroke: '#1e40af',
    strokeWidth: 2,
    rotation: 0,
  },
  {
    id: 'shape-2',
    type: 'shape',
    x: 100,
    y: 220,
    width: 120,
    height: 120,
    shapeType: 'circle',
    fill: '#8b5cf6',
    stroke: '#6d28d9',
    strokeWidth: 2,
    rotation: 0,
  },
];

export const SmartSidebarDemo: React.FC = () => {
  const [selectedElement, setSelectedElement] = useState<SlideElement | null>(null);
  const [currentLayout, setCurrentLayout] = useState('title-slide');
  const [elements, setElements] = useState<SlideElement[]>(DEMO_ELEMENTS);
  const { requestApplyLayout, modal } = useSmartLayoutApply({
    getElements: () => elements,
    setElements: (els) => setElements(els),
    onApplied: (layoutId) => setCurrentLayout(layoutId),
  });

  const handleElementUpdate = (elementId: string, updates: Partial<SlideElement>) => {
    setElements(prev =>
      prev.map(el => (el.id === elementId ? { ...el, ...updates } : el))
    );
    if (selectedElement?.id === elementId) {
      setSelectedElement(prev => (prev ? { ...prev, ...updates } : null));
    }
  };

  const handleElementDelete = (elementId: string) => {
    setElements(prev => prev.filter(el => el.id !== elementId));
    if (selectedElement?.id === elementId) {
      setSelectedElement(null);
    }
  };

  const handleLayoutSelect = (layoutId: string) => {
    requestApplyLayout(layoutId);
  };

  const getElementIcon = (element: SlideElement) => {
    switch (element.type) {
      case 'text':
        return <Type className="w-4 h-4" />;
      case 'shape':
        return element.shapeType === 'circle' ? 
          <Circle className="w-4 h-4" /> : 
          <Square className="w-4 h-4" />;
      case 'chart':
        return <BarChart3 className="w-4 h-4" />;
      default:
        return <Square className="w-4 h-4" />;
    }
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      {/* Main Content Area */}
      <div className="h-full flex flex-col">
        {/* Header */}
        <header className="flex-shrink-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Smart Sidebar Demo
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Context-aware Properties & Layout system inspired by Apple Keynote
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                selectedElement
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                  : "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
              )}>
                {selectedElement ? '📝 Properties Mode' : '🎨 Layout Mode'}
              </div>
            </div>
          </div>
        </header>

        {/* Canvas Area */}
        <div className="flex-1 relative overflow-hidden">
          {/* Canvas */}
          <div className="absolute inset-0 flex items-center justify-center p-8 pr-[32rem]">
            <div className="relative w-full max-w-4xl aspect-[16/9] bg-white dark:bg-gray-950 rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Grid Background */}
              <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: 'linear-gradient(#666 1px, transparent 1px), linear-gradient(90deg, #666 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }} />

              {/* Demo Elements */}
              <AnimatePresence mode="wait" initial={false}>
              {elements.map(element => (
                <motion.div
                  key={element.id}
                  className={cn(
                    "absolute cursor-pointer rounded-lg transition-all duration-200",
                    selectedElement?.id === element.id
                      ? "ring-4 ring-blue-500 ring-offset-2"
                      : "hover:ring-2 hover:ring-gray-300"
                  )}
                  style={{
                    left: element.x,
                    top: element.y,
                    width: element.width,
                    height: element.height,
                    backgroundColor: element.type === 'text' ? element.backgroundColor : element.fill,
                    color: element.color,
                    transform: `rotate(${element.rotation || 0}deg)`,
                  }}
                  onClick={() => setSelectedElement(element)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0, transition: { duration: 0.25, ease: [0, 0, 0.2, 1] } }}
                  exit={{ opacity: 0, y: 10, transition: { duration: 0.2, ease: 'easeInOut' } }}
                >
                  {element.type === 'text' && (
                    <div className="w-full h-full flex items-center justify-center p-4">
                      <span className="font-medium" style={{ fontSize: element.fontSize }}>
                        {element.content}
                      </span>
                    </div>
                  )}
                  {element.type === 'shape' && element.shapeType === 'circle' && (
                    <div
                      className="w-full h-full rounded-full"
                      style={{
                        backgroundColor: element.fill,
                        border: `${element.strokeWidth}px solid ${element.stroke}`,
                      }}
                    />
                  )}
                </motion.div>
              ))}
              </AnimatePresence>

              {/* Deselect Overlay */}
              {selectedElement && (
                <div
                  className="absolute inset-0 cursor-pointer"
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      setSelectedElement(null);
                    }
                  }}
                />
              )}
            </div>
          </div>

          {/* Element List (Left Side) */}
          <div className="absolute left-6 top-6 bottom-6 w-64 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl p-4 overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Canvas Elements
            </h3>
            <div className="space-y-2">
              {elements.map(element => (
                <motion.button
                  key={element.id}
                  onClick={() => setSelectedElement(element)}
                  className={cn(
                    "w-full px-3 py-2 rounded-lg text-left transition-all duration-200",
                    "flex items-center gap-3",
                    selectedElement?.id === element.id
                      ? "bg-blue-500 text-white shadow-lg"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {getElementIcon(element)}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate capitalize">
                      {element.type}
                    </div>
                    <div className="text-xs opacity-75 truncate">
                      {element.id}
                    </div>
                  </div>
                </motion.button>
              ))}
              
              <button
                onClick={() => setSelectedElement(null)}
                className="w-full px-3 py-2 rounded-lg text-left transition-all duration-200 bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 mt-4"
              >
                <div className="text-sm font-medium">Deselect All</div>
                <div className="text-xs opacity-75">View layouts</div>
              </button>
            </div>

            {/* Instructions */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                💡 Try This:
              </h4>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Click elements to see properties</li>
                <li>• Deselect to view layouts</li>
                <li>• Watch smooth transitions</li>
                <li>• Scroll position persists</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Sidebar */}
      <SmartSidebar
        selectedElement={selectedElement}
        onElementUpdate={handleElementUpdate}
        onElementDelete={handleElementDelete}
        onLayoutSelect={handleLayoutSelect}
        currentLayoutId={currentLayout}
      />
      {modal}
    </div>
  );
};

export default SmartSidebarDemo;
