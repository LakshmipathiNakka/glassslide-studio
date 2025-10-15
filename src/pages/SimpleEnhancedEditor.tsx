import { useState, useEffect, useCallback } from "react";
import { Toolbar } from "@/components/editor/Toolbar";
import SimplePowerPointCanvas from "@/components/canvas/SimplePowerPointCanvas";
import { SlideThumbnails } from "@/components/editor/SlideThumbnails";
import { Slide } from '@/types/slide-thumbnails';
import { ChartPanel } from "@/components/editor/ChartPanel";
import { PropertiesPanel } from "@/components/editor/PropertiesPanel";
import { PresentationMode } from "@/components/editor/PresentationMode";
import { ExportDialog } from "@/components/editor/ExportDialog";
import { useToast } from "@/hooks/use-toast";
import { useActionManager } from "@/hooks/use-action-manager";
import { usePersistence } from "@/hooks/use-persistence";
import { ColorPicker } from "@/components/ui/color-picker";
import { Home, Plus, Save, Download, Play, Layout, BarChart3, Type, Image, Square, Circle, Table, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/landing/Logo";
import { SlideElement } from "@/types/canvas";
import { Element } from "@/hooks/use-action-manager";
import pptxgen from "pptxgenjs";

// Using SlideElement from @/types/canvas instead of local Element interface
// Using SlideElement directly from @/types/canvas

// Using Slide from types/slide-thumbnails instead

const SimpleEnhancedEditor = () => {
  const { toast } = useToast();
  
  // Create initial slide with PowerPoint-like placeholders
  const createInitialSlide = (): Slide => {
    const slide = {
      id: '1',
      elements: [
        {
          id: 'title-placeholder',
          type: 'text' as const,
          x: 120,
          y: 80,
          width: 720,
          height: 120,
          text: 'Click here to add title',
          fontSize: 44,
          fontWeight: 'normal' as const,
          fontStyle: 'italic' as const,
          textAlign: 'center' as const,
          color: '#999999',
          zIndex: 1,
        },
        {
          id: 'subtitle-placeholder',
          type: 'text' as const,
          x: 120,
          y: 240,
          width: 720,
          height: 80,
          text: 'Click here to add subtitle',
          fontSize: 24,
          fontWeight: 'normal' as const,
          fontStyle: 'italic' as const,
          textAlign: 'center' as const,
          color: '#999999',
          zIndex: 2,
        }
      ],
      background: '#FFFFFF',
      createdAt: new Date()
    };
    
    // Initial slide created successfully
    console.log('Creating initial slide with elements:', slide.elements);
    return slide;
  };
  
  const initialSlides = [createInitialSlide()];
  const [slides, setSlides] = useState<Slide[]>(initialSlides);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Zoom state for slide editor
  const [zoomLevel, setZoomLevel] = useState(90); // Default 90% zoom
  const [isZooming, setIsZooming] = useState(false);
  
  // Slides state initialized
  const [chartPanelOpen, setChartPanelOpen] = useState(false);
  
  // Zoom control functions
  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 10, 200)); // Max 200%
    setIsZooming(true);
    setTimeout(() => setIsZooming(false), 300);
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 10, 25)); // Min 25%
    setIsZooming(true);
    setTimeout(() => setIsZooming(false), 300);
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoomLevel(90); // Reset to 90%
    setIsZooming(true);
    setTimeout(() => setIsZooming(false), 300);
  }, []);

  const handleZoomChange = useCallback((level: number) => {
    setZoomLevel(Math.max(25, Math.min(200, level))); // Clamp between 25% and 200%
    setIsZooming(true);
    setTimeout(() => setIsZooming(false), 300);
  }, []);

  // Mouse wheel zoom support
  const handleWheelZoom = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -10 : 10;
      setZoomLevel(prev => Math.max(25, Math.min(200, prev + delta)));
      setIsZooming(true);
      setTimeout(() => setIsZooming(false), 300);
    }
  }, []);
  
  // Function to update current slide elements
  const updateCurrentSlide = useCallback((newElements: Element[]) => {
    console.log('Updating current slide with elements:', newElements);
    setSlides(prevSlides => 
      prevSlides.map((slide, index) => 
        index === currentSlide 
          ? { ...slide, elements: newElements }
          : slide
      )
    );
  }, [currentSlide]);
  
  // Function to handle element selection
  const handleElementSelect = useCallback((element: Element | null) => {
    setSelectedElement(element);
  }, []);

  // Function to handle element deletion
  const handleDeleteElement = useCallback((elementId: string) => {
    console.log('handleDeleteElement called with:', elementId);
    const newElements = slides[currentSlide]?.elements.filter(el => el.id !== elementId) || [];
    updateCurrentSlide(newElements);
    setSelectedElement(null);
  }, [currentSlide, slides, updateCurrentSlide]);


  
  
  const [presentationMode, setPresentationMode] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [editingChart, setEditingChart] = useState<Element | null>(null);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // PowerPoint-like action manager
  const {
    canUndo,
    canRedo,
    undoDescription,
    redoDescription,
    undo,
    redo,
    addElement,
    deleteElement,
    moveElement,
    resizeElement,
    editElement,
    duplicateElement,
    addSlide,
    deleteSlide,
    reorderSlides,
  } = useActionManager({
    slides,
    currentSlideIndex: currentSlide,
    onSlidesChange: setSlides,
    onSlideIndexChange: setCurrentSlide,
  });

  // Track if this is the initial load (don't track placeholder creation)
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Auto-save functionality
  usePersistence('presentation-data', slides);


  // Mark initial load as complete after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            setCommandPaletteOpen(true);
            break;
          case 's':
            e.preventDefault();
            toast({ title: "Presentation saved", description: "Your changes have been saved." });
            break;
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
              if (redoDescription) {
                toast({ title: "Redo", description: redoDescription });
              }
            } else {
              undo();
              if (undoDescription) {
                toast({ title: "Undo", description: undoDescription });
              }
            }
            break;
          case '=':
          case '+':
            e.preventDefault();
            handleZoomIn();
            break;
          case '-':
            e.preventDefault();
            handleZoomOut();
            break;
          case '0':
            e.preventDefault();
            handleZoomReset();
            break;
          case 'y':
            e.preventDefault();
            redo();
            if (redoDescription) {
              toast({ title: "Redo", description: redoDescription });
            }
            break;
        }
      } else {
        switch (e.key) {
          case 'F5':
            e.preventDefault();
            setPresentationMode(true);
            break;
          case 'Escape':
            setCommandPaletteOpen(false);
            setSelectedElement(null);
            break;
          case 'Delete':
            if (selectedElement) {
              handleDeleteElement(selectedElement.id);
            }
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, selectedElement]);

  const handleAddText = useCallback(() => {
    const newElement: Element = {
      id: `text-${Date.now()}`,
      type: 'text',
      x: 100,
      y: 100,
      width: 200,
      height: 50,
      text: 'Click to Add text',
      fontSize: 18,
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'center',
      color: '#000000',
      zIndex: 1,
    };

    addElement(newElement);
  }, [addElement]);

  const handleAddImage = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newElement: Element = {
            id: `image-${Date.now()}`,
            type: 'image',
            x: 100,
            y: 100,
            width: 200,
            height: 150,
            imageUrl: e.target?.result as string,
            zIndex: 1,
          };

          addElement(newElement);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }, [addElement]);

  const handleAddShape = useCallback((shapeType: 'rectangle' | 'circle') => {
    const newElement: Element = {
      id: `shape-${Date.now()}`,
      type: 'shape',
      x: 100,
      y: 100,
      width: 150,
      height: 100,
      shapeType,
      fill: '#000000',
      zIndex: 1,
    };

    addElement(newElement);
  }, [addElement]);

  const handleAddChart = useCallback(() => {
    setChartPanelOpen(true);
  }, []);

  const handleAddTable = useCallback(() => {
    toast({ title: "Coming Soon", description: "Table functionality will be available soon." });
  }, [toast]);

  const handleAddSlide = useCallback(() => {
    addSlide();
  }, [addSlide]);


  // handleElementSelect already defined above

  const handleElementUpdate = useCallback((updatedElement: Element) => {
    // Find the current element to get the updates
    const currentElement = slides[currentSlide]?.elements.find(el => el.id === updatedElement.id);
    if (!currentElement) return;

    // Calculate the updates by comparing current and updated element
    const updates: Partial<Element> = {};
    Object.keys(updatedElement).forEach(key => {
      if (key !== 'id' && (updatedElement as any)[key] !== (currentElement as any)[key]) {
        (updates as any)[key] = (updatedElement as any)[key];
      }
    });

    // Don't track placeholder text changes as actions
    if (!isInitialLoad) {
      editElement(updatedElement.id, updates);
    } else {
      // Just update the slides directly for placeholder changes
      const newSlides = [...slides];
      newSlides[currentSlide] = {
        ...newSlides[currentSlide],
        elements: newSlides[currentSlide].elements.map(el => 
          el.id === updatedElement.id ? updatedElement : el
        )
      };
      setSlides(newSlides);
    }
    setSelectedElement(updatedElement);
  }, [editElement, isInitialLoad, slides, currentSlide]);


  const handleEditChart = useCallback((element: Element) => {
    setEditingChart(element);
    setChartPanelOpen(true);
  }, []);

  const handleExportFormat = useCallback((format: 'pptx' | 'pdf' | 'png' | 'json') => {
    switch (format) {
      case 'pptx':
        handleExportPPTX();
        break;
      case 'json':
        handleExportJSON();
        break;
      default:
        toast({ title: "Coming Soon", description: `${format.toUpperCase()} export will be available soon.` });
    }
    setExportDialogOpen(false);
  }, [toast]);

  const handleExportPPTX = useCallback(() => {
    const pptx = new pptxgen();
    slides.forEach((slide, index) => {
      const slideObj = pptx.addSlide();
      slideObj.background = { color: slide.background || '#FFFFFF' };
      
      slide.elements.forEach(element => {
        if (element.type === 'text') {
          slideObj.addText(element.content || '', {
            x: element.x / 10,
            y: element.y / 10,
            w: element.width / 10,
            h: element.height / 10,
            fontSize: element.fontSize || 18,
            bold: element.fontWeight === 'bold',
            italic: element.fontStyle === 'italic',
            color: element.color || '#000000',
            align: element.textAlign || 'center',
          });
        } else if (element.type === 'shape') {
          slideObj.addShape(element.shapeType === 'circle' ? 'ellipse' : 'rect', {
            x: element.x / 10,
            y: element.y / 10,
            w: element.width / 10,
            h: element.height / 10,
            fill: element.fill || '#000000',
          });
        } else if (element.type === 'image' && element.content) {
          slideObj.addImage({ data: element.content, x: element.x / 10, y: element.y / 10, w: element.width / 10, h: element.height / 10 });
        }
      });
    });

    pptx.writeFile({ fileName: 'presentation.pptx' });
    toast({ title: "Export Complete", description: "Your presentation has been exported as PPTX." });
  }, [slides, toast]);

  const handleExportJSON = useCallback(() => {
    const data = JSON.stringify(slides, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'presentation.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [slides]);

  // updateCurrentSlide already defined above

  return (
    <div className="h-screen flex flex-col keynote-bg" style={{ zoom: '0.9' }}>
      {/* Keynote-style Header */}
      <header className="keynote-toolbar flex items-center justify-between px-6 py-3">
        <div className="flex items-center space-x-4">
          <Logo />
        <div className="hidden sm:block text-sm" style={{ color: 'var(--keynote-text-secondary)' }}>
          Enhanced Editor - Slide {currentSlide + 1} of {slides.length}
          {undoDescription && (
            <span className="ml-2 text-xs">• Last action: {undoDescription}</span>
          )}
        </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Zoom Controls */}
          <div className="flex items-center space-x-1 bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              className="h-8 w-8 p-0 hover:bg-white/20"
              title="Zoom Out (Ctrl+-)"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center space-x-1 px-2">
              <input
                type="number"
                value={zoomLevel}
                onChange={(e) => handleZoomChange(Number(e.target.value))}
                className="w-12 h-6 text-xs text-center bg-transparent border-none outline-none text-white"
                min="25"
                max="200"
                step="10"
              />
              <span className="text-xs text-white/70">%</span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              className="h-8 w-8 p-0 hover:bg-white/20"
              title="Zoom In (Ctrl++)"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomReset}
              className="h-8 w-8 p-0 hover:bg-white/20"
              title="Reset Zoom (Ctrl+0)"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = '/'}
            className="keynote-button flex-shrink-0"
            aria-label="Return to home page"
          >
            <Home className="w-4 h-4 sm:mr-2" aria-hidden="true" />
            <span className="hidden sm:inline">Home</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCommandPaletteOpen(true)}
            className="touch-button bg-transparent text-gray-600 hover:bg-gray-200 hover:text-black transition-all duration-300"
            title="Command Palette (Ctrl+K)"
          >
            <span className="text-sm">⌘K</span>
          </Button>
        </div>
      </header>

      {/* Enhanced Toolbar */}
      <Toolbar
        onAddText={handleAddText}
        onAddImage={handleAddImage}
        onAddShape={handleAddShape}
        onAddChart={handleAddChart}
        onSave={() => toast({ title: "Saved", description: "Presentation saved successfully." })}
        onExport={() => setExportDialogOpen(true)}
        onUndo={undo}
        onRedo={redo}
        onPresent={() => setPresentationMode(true)}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      {/* Main Content with Keynote Layout */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden keynote-bg">
        {/* Mobile: Slide Thumbnails at top */}
        <aside className="lg:hidden relative z-20">
          <SlideThumbnails
            slides={slides}
            currentSlide={currentSlide}
            onSlideChange={setCurrentSlide}
            onAddSlide={handleAddSlide}
            onUpdateSlide={(index, updates) => {
              console.log('SimpleEnhancedEditor onUpdateSlide called with:', { index, updates });
              console.log('Current slides before update:', slides);
              const newSlides = [...slides];
              
              // Check if this is a slide deletion
              if ((updates as any)._deleted) {
                // Remove the slide at the specified index
                newSlides.splice(index, 1);
              }
              // Check if this is a new slide being added (has all slide properties)
              else if (updates.id && updates.elements && updates.background !== undefined) {
                // This is a complete new slide, insert it at the specified index
                newSlides.splice(index, 0, updates as Slide);
              } else {
                // This is an update to an existing slide
                if (newSlides[index]) {
                  newSlides[index] = { ...newSlides[index], ...updates };
                }
              }
              
              console.log('Updated slides in SimpleEnhancedEditor:', newSlides);
              setSlides(newSlides);
              
              // Regenerate thumbnail for the updated slide
              const updatedSlide = newSlides[index];
              if (updatedSlide) {
                // Trigger thumbnail regeneration by updating the slide ID
                // This will cause the thumbnail to be regenerated
                setTimeout(() => {
                  const slideId = updatedSlide.id;
                  // Force re-render by updating a timestamp
                  setSlides(prev => prev.map(slide => 
                    slide.id === slideId ? { ...slide, lastUpdated: Date.now() } : slide
                  ));
                }, 100);
              }
            }}
          />
        </aside>

        {/* Desktop: Slide Thumbnails on left */}
        <aside className="hidden lg:block relative z-20">
          <SlideThumbnails
            slides={slides}
            currentSlide={currentSlide}
            onSlideChange={setCurrentSlide}
            onAddSlide={handleAddSlide}
            onUpdateSlide={(index, updates) => {
              console.log('SimpleEnhancedEditor onUpdateSlide called with:', { index, updates });
              console.log('Current slides before update:', slides);
              const newSlides = [...slides];
              
              // Check if this is a slide deletion
              if ((updates as any)._deleted) {
                // Remove the slide at the specified index
                newSlides.splice(index, 1);
              }
              // Check if this is a new slide being added (has all slide properties)
              else if (updates.id && updates.elements && updates.background !== undefined) {
                // This is a complete new slide, insert it at the specified index
                newSlides.splice(index, 0, updates as Slide);
              } else {
                // This is an update to an existing slide
                if (newSlides[index]) {
                  newSlides[index] = { ...newSlides[index], ...updates };
                }
              }
              
              console.log('Updated slides in SimpleEnhancedEditor:', newSlides);
              setSlides(newSlides);
              
              // Regenerate thumbnail for the updated slide
              const updatedSlide = newSlides[index];
              if (updatedSlide) {
                // Trigger thumbnail regeneration by updating the slide ID
                // This will cause the thumbnail to be regenerated
                setTimeout(() => {
                  const slideId = updatedSlide.id;
                  // Force re-render by updating a timestamp
                  setSlides(prev => prev.map(slide => 
                    slide.id === slideId ? { ...slide, lastUpdated: Date.now() } : slide
                  ));
                }, 100);
              }
            }}
          />
        </aside>

        {/* Canvas Area */}
        <section className="flex-1 flex flex-col min-w-0 relative z-10 bg-gray-100">
          {/* Zoom Indicator */}
          {zoomLevel !== 90 && (
            <div className="absolute top-4 right-4 z-20 bg-black/80 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
              {zoomLevel}%
            </div>
          )}
          
          <div 
            className="w-full h-full flex items-center justify-center p-4 sm:p-6 md:p-8"
            onWheel={handleWheelZoom}
            style={{
              padding: 'clamp(16px, 4vw, 32px)',
              boxSizing: 'border-box'
            }}
          >
            <div 
              className={`transition-transform duration-300 ease-in-out ${isZooming ? 'scale-105' : ''}`}
              style={{ 
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'center center'
              }}
            >
              <SimplePowerPointCanvas
                elements={slides[currentSlide]?.elements || []}
                background={slides[currentSlide]?.background || '#ffffff'}
                onElementSelect={handleElementSelect}
                onElementUpdate={(element) => {
                  const newElements = slides[currentSlide]?.elements.map(el => 
                    el.id === element.id ? element : el
                  ) || [];
                  updateCurrentSlide(newElements);
                }}
                onElementAdd={(element) => {
                  const newElements = [...(slides[currentSlide]?.elements || []), element];
                  updateCurrentSlide(newElements);
                }}
              />
            </div>
          </div>
        </section>

        {/* Enhanced Properties Panel */}
        <aside className="lg:flex-shrink-0">
          {selectedElement ? (
            <PropertiesPanel
              key={`properties-${selectedElement.id}`}
              selectedElement={selectedElement}
              onElementUpdate={(elementId: string, updates: Partial<Element>) => {
                const currentElement = slides[currentSlide]?.elements.find(el => el.id === elementId);
                if (currentElement) {
                  // Apply updates directly to the current element
                  const updatedElement = { ...currentElement, ...updates };
                  const newSlides = [...slides];
                  newSlides[currentSlide] = {
                    ...newSlides[currentSlide],
                    elements: newSlides[currentSlide].elements.map(el => 
                      el.id === elementId ? updatedElement : el
                    )
                  };
                  setSlides(newSlides);
                  setSelectedElement(updatedElement);
                }
              }}
              onElementDelete={handleDeleteElement}
            />
          ) : (
            <div className="p-4 text-center text-gray-500">
              <p>Select an element to edit its properties</p>
            </div>
          )}
        </aside>
      </main>

      {/* Enhanced Modals */}
      {chartPanelOpen && (
        <ChartPanel
          open={chartPanelOpen}
          onClose={() => setChartPanelOpen(false)}
          onAddChart={(chartType, chartData) => {
            console.log('ChartPanel onAddChart called with:', { chartType, chartData });
            const newElement: Element = {
              id: `chart-${Date.now()}`,
              type: 'chart',
              x: 100,
              y: 100,
              width: 400,
              height: 300,
              chartType: chartType,
              chartData: chartData,
              content: `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`,
              zIndex: 1,
            };

            console.log('Creating chart element:', newElement);
            addElement(newElement);
            // Automatically select the new chart element
            setSelectedElement(newElement);
            setChartPanelOpen(false);
          }}
          editingChart={editingChart}
        />
      )}



      {presentationMode && (
        <PresentationMode
          slides={slides}
          currentSlide={currentSlide}
          onClose={() => setPresentationMode(false)}
          onSlideChange={setCurrentSlide}
        />
      )}

      {exportDialogOpen && (
        <ExportDialog
          onClose={() => setExportDialogOpen(false)}
          onExport={handleExportFormat}
        />
      )}

      {/* Command Palette Overlay */}
      {commandPaletteOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="glass-card p-6 rounded-xl max-w-2xl w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Command Palette</h3>
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  handleAddText();
                  setCommandPaletteOpen(false);
                }}
              >
                <Type className="w-4 h-4 mr-3" />
                Add Text
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  handleAddImage();
                  setCommandPaletteOpen(false);
                }}
              >
                <Image className="w-4 h-4 mr-3" />
                Add Image
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  handleAddShape('rectangle');
                  setCommandPaletteOpen(false);
                }}
              >
                <Square className="w-4 h-4 mr-3" />
                Add Rectangle
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  handleAddShape('circle');
                  setCommandPaletteOpen(false);
                }}
              >
                <Circle className="w-4 h-4 mr-3" />
                Add Circle
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  handleAddChart();
                  setCommandPaletteOpen(false);
                }}
              >
                <BarChart3 className="w-4 h-4 mr-3" />
                Add Chart
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  handleAddSlide();
                  setCommandPaletteOpen(false);
                }}
              >
                <Plus className="w-4 h-4 mr-3" />
                Add Slide
              </Button>
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setCommandPaletteOpen(false)}
              >
                Close (Esc)
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SimpleEnhancedEditor;
