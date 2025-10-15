import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Type, 
  Image, 
  Square, 
  BarChart3, 
  Palette, 
  Undo, 
  Redo, 
  Copy, 
  Paste, 
  Trash2,
  Save,
  Download,
  Upload,
  Settings,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Grid,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Layers,
  Lock,
  Unlock,
  Move,
  RotateCw,
  FlipHorizontal,
  FlipVertical
} from 'lucide-react';

// Import our enhanced components
import { FabricPowerPointCanvas } from '@/components/canvas/FabricPowerPointCanvas';
import { PropertiesPanel } from '@/components/editor/PropertiesPanel';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { SlideThumbnails } from '@/components/editor/SlideThumbnails';

// Import hooks and utilities
import { useActionManager } from '@/hooks/useActionManager';
import { useResponsiveDesign } from '@/hooks/useResponsiveDesign';
import { SlideElement } from '@/types/canvas';

interface EnhancedPowerPointEditorProps {
  className?: string;
}

export const EnhancedPowerPointEditor: React.FC<EnhancedPowerPointEditorProps> = ({ 
  className = '' 
}) => {
  // State management
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isPropertiesPanelOpen, setIsPropertiesPanelOpen] = useState(true);
  const [isThumbnailsOpen, setIsThumbnailsOpen] = useState(true);
  const [isGridVisible, setIsGridVisible] = useState(true);
  const [isSnapEnabled, setIsSnapEnabled] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Hooks
  const { viewportInfo, getCanvasDimensions } = useResponsiveDesign();
  const {
    elements,
    addElement,
    updateElement,
    deleteElement,
    duplicateElement,
    undo,
    redo,
    canUndo,
    canRedo,
    clearSlide
  } = useActionManager();

  // Canvas dimensions
  const canvasDimensions = useMemo(() => {
    return getCanvasDimensions();
  }, [getCanvasDimensions]);

  // Handle element selection
  const handleElementSelect = useCallback((elementId: string | null) => {
    setSelectedElementId(elementId);
    if (elementId) {
      setIsPropertiesPanelOpen(true);
    }
  }, []);

  // Handle element updates
  const handleElementUpdate = useCallback((elementId: string, updates: Partial<SlideElement>) => {
    updateElement(elementId, updates);
  }, [updateElement]);

  // Handle element deletion
  const handleElementDelete = useCallback((elementId: string) => {
    deleteElement(elementId);
    if (selectedElementId === elementId) {
      setSelectedElementId(null);
    }
  }, [deleteElement, selectedElementId]);

  // Handle adding new elements
  const handleAddText = useCallback(() => {
    const newElement: Omit<SlideElement, 'id'> = {
      type: 'text',
      x: 100,
      y: 100,
      width: 200,
      height: 50,
      text: 'Click to add text',
      fontSize: 18,
      fontFamily: 'Segoe UI',
      fontWeight: 'normal',
      textAlign: 'left',
      color: '#000000',
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      borderWidth: 0,
      borderRadius: 0,
      rotation: 0,
      zIndex: elements.length + 1
    };
    addElement(newElement);
  }, [addElement, elements.length]);

  const handleAddImage = useCallback(() => {
    const newElement: Omit<SlideElement, 'id'> = {
      type: 'image',
      x: 100,
      y: 100,
      width: 200,
      height: 150,
      placeholder: 'Click to add image',
      backgroundColor: '#f5f5f5',
      borderColor: '#cccccc',
      borderWidth: 2,
      borderRadius: 8,
      rotation: 0,
      zIndex: elements.length + 1
    };
    addElement(newElement);
  }, [addElement, elements.length]);

  const handleAddShape = useCallback(() => {
    const newElement: Omit<SlideElement, 'id'> = {
      type: 'shape',
      x: 100,
      y: 100,
      width: 150,
      height: 100,
      backgroundColor: '#0078d4',
      borderColor: '#0078d4',
      borderWidth: 2,
      borderRadius: 8,
      rotation: 0,
      zIndex: elements.length + 1
    };
    addElement(newElement);
  }, [addElement, elements.length]);

  const handleAddChart = useCallback(() => {
    const newElement: Omit<SlideElement, 'id'> = {
      type: 'chart',
      x: 100,
      y: 100,
      width: 300,
      height: 200,
      placeholder: 'Click to add chart',
      backgroundColor: '#f8f9fa',
      borderColor: '#0078d4',
      borderWidth: 2,
      borderRadius: 8,
      rotation: 0,
      zIndex: elements.length + 1
    };
    addElement(newElement);
  }, [addElement, elements.length]);

  // Keyboard shortcuts
  useHotkeys('ctrl+z', undo, { preventDefault: true });
  useHotkeys('ctrl+y', redo, { preventDefault: true });
  useHotkeys('ctrl+c', () => {
    if (selectedElementId) {
      // Copy functionality would be implemented here
      console.log('Copy element:', selectedElementId);
    }
  }, { preventDefault: true });
  useHotkeys('ctrl+v', () => {
    // Paste functionality would be implemented here
    console.log('Paste element');
  }, { preventDefault: true });
  useHotkeys('delete', () => {
    if (selectedElementId) {
      handleElementDelete(selectedElementId);
    }
  }, { preventDefault: true });
  useHotkeys('ctrl+d', () => {
    if (selectedElementId) {
      duplicateElement(selectedElementId);
    }
  }, { preventDefault: true });
  useHotkeys('ctrl+s', () => {
    // Save functionality would be implemented here
    console.log('Save presentation');
  }, { preventDefault: true });
  useHotkeys('f11', () => {
    setIsFullscreen(!isFullscreen);
  }, { preventDefault: true });

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 0.1, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.25));
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoomLevel(1);
  }, []);

  // Get selected element
  const selectedElement = useMemo(() => {
    return elements.find(el => el.id === selectedElementId) || null;
  }, [elements, selectedElementId]);

  return (
    <div className={`h-screen flex flex-col bg-gray-100 ${className}`}>
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-900">GlassSlide Studio</h1>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Badge variant="outline" className="px-2 py-1">
              {Math.round(zoomLevel * 100)}%
            </Badge>
            <Button variant="ghost" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleZoomReset}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* View controls */}
          <div className="flex items-center gap-1">
            <Button
              variant={isGridVisible ? "default" : "ghost"}
              size="sm"
              onClick={() => setIsGridVisible(!isGridVisible)}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={isSnapEnabled ? "default" : "ghost"}
              size="sm"
              onClick={() => setIsSnapEnabled(!isSnapEnabled)}
            >
              <AlignCenter className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </motion.header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Thumbnails */}
        <AnimatePresence>
          {isThumbnailsOpen && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="w-80 bg-white border-r border-gray-200 flex flex-col"
            >
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Slides</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <SlideThumbnails
                  slides={[{ id: '1', elements, thumbnail: '' }]}
                  currentSlide={0}
                  onSlideChange={() => {}}
                  onAddSlide={() => {}}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-2"
          >
            {/* Element Tools */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAddText}
                className="flex items-center gap-2"
              >
                <Type className="w-4 h-4" />
                Text
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAddImage}
                className="flex items-center gap-2"
              >
                <Image className="w-4 h-4" />
                Image
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAddShape}
                className="flex items-center gap-2"
              >
                <Square className="w-4 h-4" />
                Shape
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAddChart}
                className="flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Chart
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Edit Tools */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={undo}
                disabled={!canUndo}
              >
                <Undo className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={redo}
                disabled={!canRedo}
              >
                <Redo className="w-4 h-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Alignment Tools */}
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm">
                <AlignLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <AlignCenter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <AlignRight className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <AlignJustify className="w-4 h-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Transform Tools */}
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm">
                <Move className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <RotateCw className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <FlipHorizontal className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <FlipVertical className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          {/* Canvas */}
          <div className="flex-1 relative overflow-hidden bg-gray-100">
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="relative"
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'center'
                }}
              >
                <FabricPowerPointCanvas
                  elements={elements}
                  onElementSelect={handleElementSelect}
                  onElementUpdate={handleElementUpdate}
                  onElementAdd={addElement}
                  onElementDelete={handleElementDelete}
                  selectedElementId={selectedElementId}
                  width={canvasDimensions.width}
                  height={canvasDimensions.height}
                  className="shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <AnimatePresence>
          {isPropertiesPanelOpen && selectedElement && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="w-80 bg-white border-l border-gray-200 flex flex-col"
            >
              <PropertiesPanel
                selectedElement={selectedElement}
                onElementUpdate={handleElementUpdate}
                onElementDelete={handleElementDelete}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>


    </div>
  );
};

export default EnhancedPowerPointEditor;
