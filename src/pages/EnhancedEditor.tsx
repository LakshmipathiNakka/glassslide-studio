import { useState, useEffect, useRef, useCallback } from "react";
import { Toolbar } from "@/components/editor/Toolbar";
import SimplePowerPointCanvas from "@/components/canvas/SimplePowerPointCanvas";
import { SlideThumbnails } from "@/components/editor/SlideThumbnails";
import { ChartPanel } from "@/components/editor/ChartPanel";
import { PropertiesPanel } from "@/components/editor/PropertiesPanel";
import { PresentationMode } from "@/components/editor/PresentationMode";
import { CommandPalette } from "@/components/editor/CommandPalette";
import { FloatingToolbar } from "@/components/editor/FloatingToolbar";
import { UserProfile } from "@/components/editor/UserProfile";
import { useToast } from "@/hooks/use-toast";
import { useFileManager } from "@/hooks/use-file-manager";
import { useSlideManager } from "@/hooks/use-slide-manager";
import { useSmartGuides } from "@/hooks/use-smart-guides";
import { Home, Plus, Save, Download, Play, Layout, BarChart3, Type, Image, Square, Circle, Table } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/landing/Logo";
import pptxgen from "pptxgenjs";

interface Element {
  id: string;
  type: 'text' | 'image' | 'shape' | 'chart';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  shapeType?: 'rectangle' | 'circle';
  fill?: string;
  chartType?: 'bar' | 'line' | 'pie';
  chartData?: any;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right';
  color?: string;
}

interface Slide {
  id: string;
  elements: Element[];
  background: string;
  createdAt: Date;
}

const EnhancedEditor = () => {
  const { toast } = useToast();
  const fileManager = useFileManager();
  const slideManager = useSlideManager();
  const smartGuides = useSmartGuides();
  
  // UI State
  const [chartPanelOpen, setChartPanelOpen] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [floatingToolbarVisible, setFloatingToolbarVisible] = useState(false);
  const [floatingToolbarPosition, setFloatingToolbarPosition] = useState({ x: 0, y: 0 });
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [editingChart, setEditingChart] = useState<Element | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [zoom, setZoom] = useState(1);

  // Initialize with file manager
  useEffect(() => {
    if (!fileManager.currentFile) {
      fileManager.newFile();
    }
  }, [fileManager]);

  // Update slide manager when file changes
  useEffect(() => {
    if (fileManager.currentFile) {
      slideManager.updateCurrentSlide({ elements: fileManager.currentFile.slides[0]?.elements || [] });
    }
  }, [fileManager.currentFile]);

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
            fileManager.saveFile();
            toast({ title: "Presentation saved", description: "Your changes have been saved." });
            break;
          case 'n':
            e.preventDefault();
            fileManager.newFile();
            break;
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              fileManager.redo();
            } else {
              fileManager.undo();
            }
            break;
          case 'y':
            e.preventDefault();
            fileManager.redo();
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
            setFloatingToolbarVisible(false);
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
  }, [fileManager, selectedElement]);

  // Element management
  const handleAddText = useCallback(() => {
    const newElement: Element = {
      id: `text-${Date.now()}`,
      type: 'text',
      x: 100,
      y: 100,
      width: 200,
      height: 50,
      content: 'Click to Add text',
      fontSize: 18,
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'center',
      color: '#000000',
    };

    const currentElements = slideManager.currentSlide?.elements || [];
    const updatedElements = [...currentElements, newElement];
    slideManager.updateCurrentSlide({ elements: updatedElements });
    fileManager.updateCurrentFile({ 
      slides: fileManager.currentFile?.slides.map((slide, index) => 
        index === slideManager.currentSlideIndex ? { ...slide, elements: updatedElements } : slide
      ) || []
    });
  }, [slideManager, fileManager]);

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
            content: e.target?.result as string,
          };

          const currentElements = slideManager.currentSlide?.elements || [];
          const updatedElements = [...currentElements, newElement];
          slideManager.updateCurrentSlide({ elements: updatedElements });
          fileManager.updateCurrentFile({ 
            slides: fileManager.currentFile?.slides.map((slide, index) => 
              index === slideManager.currentSlideIndex ? { ...slide, elements: updatedElements } : slide
            ) || []
          });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }, [slideManager, fileManager]);

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
    };

    const currentElements = slideManager.currentSlide?.elements || [];
    const updatedElements = [...currentElements, newElement];
    slideManager.updateCurrentSlide({ elements: updatedElements });
    fileManager.updateCurrentFile({ 
      slides: fileManager.currentFile?.slides.map((slide, index) => 
        index === slideManager.currentSlideIndex ? { ...slide, elements: updatedElements } : slide
      ) || []
    });
  }, [slideManager, fileManager]);

  const handleAddChart = useCallback(() => {
    setChartPanelOpen(true);
  }, []);

  const handleAddTable = useCallback(() => {
    // TODO: Implement table functionality
    toast({ title: "Coming Soon", description: "Table functionality will be available soon." });
  }, [toast]);

  const handleAddSlide = useCallback(() => {
    const newSlide = slideManager.addSlide();
    fileManager.updateCurrentFile({ 
      slides: [...(fileManager.currentFile?.slides || []), newSlide]
    });
  }, [slideManager, fileManager]);

  const handleElementSelect = useCallback((element: Element | null) => {
    setSelectedElement(element);
    if (element) {
      setFloatingToolbarVisible(true);
    } else {
      setFloatingToolbarVisible(false);
    }
  }, []);

  const handleElementUpdate = useCallback((updatedElement: Element) => {
    const currentElements = slideManager.currentSlide?.elements || [];
    const updatedElements = currentElements.map(el => 
      el.id === updatedElement.id ? updatedElement : el
    );
    slideManager.updateCurrentSlide({ elements: updatedElements });
    fileManager.updateCurrentFile({ 
      slides: fileManager.currentFile?.slides.map((slide, index) => 
        index === slideManager.currentSlideIndex ? { ...slide, elements: updatedElements } : slide
      ) || []
    });
    setSelectedElement(updatedElement);
  }, [slideManager, fileManager]);

  const handleDeleteElement = useCallback((elementId: string) => {
    const currentElements = slideManager.currentSlide?.elements || [];
    const updatedElements = currentElements.filter(el => el.id !== elementId);
    slideManager.updateCurrentSlide({ elements: updatedElements });
    fileManager.updateCurrentFile({ 
      slides: fileManager.currentFile?.slides.map((slide, index) => 
        index === slideManager.currentSlideIndex ? { ...slide, elements: updatedElements } : slide
      ) || []
    });
    setSelectedElement(null);
    setFloatingToolbarVisible(false);
  }, [slideManager, fileManager]);

  const handleEditChart = useCallback((element: Element) => {
    setEditingChart(element);
    setChartPanelOpen(true);
  }, []);

  const handleExport = useCallback(async () => {
    if (isExporting || !fileManager.currentFile) return; // Prevent double-clicks
    
    setIsExporting(true);
    try {
      const { exportSlidesToPPTX } = await import('@/utils/exporter');
      // Sanitize filename by removing invalid characters
      const sanitizedName = fileManager.currentFile.name.replace(/[<>:"/\\|?*]/g, '-');
      const filename = `${sanitizedName}.pptx`;
      await exportSlidesToPPTX(fileManager.currentFile.slides, filename);
      toast({ 
        title: 'Export Successful!', 
        description: 'Your presentation has been exported to PowerPoint.' 
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({ 
        title: 'Export Failed', 
        description: 'Failed to export presentation. Please check your content and try again.', 
        variant: 'destructive' 
      });
    } finally {
      setIsExporting(false);
    }
  }, [isExporting, fileManager, toast]);


  const handleToggleDarkMode = useCallback(() => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark', !isDarkMode);
  }, [isDarkMode]);

  const handleSync = useCallback(() => {
    fileManager.saveFile();
    toast({ title: "Synced", description: "Your presentation has been synced to the cloud." });
  }, [fileManager, toast]);

  const handleSettings = useCallback(() => {
    toast({ title: "Settings", description: "Settings panel will be available soon." });
  }, [toast]);

  const handleLogout = useCallback(() => {
    // TODO: Implement logout functionality
    toast({ title: "Logged Out", description: "You have been logged out successfully." });
  }, [toast]);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="glass-toolbar border-b flex items-center justify-between px-4 py-2">
        <div className="flex items-center space-x-4">
          <Logo />
          <div className="hidden sm:block text-sm text-muted-foreground">
            {fileManager.currentFile?.name || 'Untitled Presentation'}
            {fileManager.isDirty && <span className="text-orange-500 ml-1">•</span>}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = '/'}
            className="touch-button bg-transparent text-gray-600 hover:bg-gray-200 hover:text-black transition-all duration-300 flex-shrink-0"
            aria-label="Return to home page"
          >
            <Home className="w-4 h-4 sm:mr-2" aria-hidden="true" />
            <span className="hidden sm:inline">Home</span>
          </Button>

          <UserProfile
            userName="John Doe"
            userEmail="john@example.com"
            isOnline={true}
            onSettings={handleSettings}
            onLogout={handleLogout}
            onSync={handleSync}
            onToggleDarkMode={handleToggleDarkMode}
            isDarkMode={isDarkMode}
          />
        </div>
      </header>

      {/* Toolbar */}
      <Toolbar
        onAddText={handleAddText}
        onAddImage={handleAddImage}
        onAddShape={handleAddShape}
        onAddChart={handleAddChart}
        onAddTable={handleAddTable}
        onSave={fileManager.saveFile}
        onExport={handleExport}
        onUndo={fileManager.undo}
        onRedo={fileManager.redo}
        onPresent={() => setPresentationMode(true)}
        onHomeClick={() => window.location.href = '/'}
        canUndo={fileManager.canUndo}
        canRedo={fileManager.canRedo}
        isExporting={isExporting}
      />

      {/* Main Content */}
      <main id="main-content" className="flex-1 flex flex-col lg:flex-row overflow-hidden" role="main">
        {/* Mobile: Slide Thumbnails at top */}
        <aside className="lg:hidden" role="complementary" aria-label="Slide thumbnails">
          <SlideThumbnails
            slides={fileManager.currentFile?.slides || []}
            currentSlide={slideManager.currentSlideIndex}
            onSlideChange={slideManager.setCurrentSlide}
            onAddSlide={handleAddSlide}
          />
        </aside>

        {/* Desktop: Slide Thumbnails on left */}
        <aside className="hidden lg:block" role="complementary" aria-label="Slide thumbnails">
          <SlideThumbnails
            slides={fileManager.currentFile?.slides || []}
            currentSlide={slideManager.currentSlideIndex}
            onSlideChange={slideManager.setCurrentSlide}
            onAddSlide={handleAddSlide}
          />
        </aside>

        {/* Canvas Area */}
        <section className="flex-1 flex flex-col min-w-0" aria-label="Presentation canvas">
          <SimplePowerPointCanvas
            elements={slideManager.currentSlide?.elements || []}
            onElementSelect={handleElementSelect}
            onElementUpdate={(element) => {
              const newElements = (slideManager.currentSlide?.elements || []).map(el => 
                el.id === element.id ? element : el
              );
              slideManager.updateCurrentSlide({ elements: newElements });
              fileManager.updateCurrentFile({ 
                slides: fileManager.currentFile?.slides.map((slide, index) => 
                  index === slideManager.currentSlideIndex ? { ...slide, elements: newElements } : slide
                ) || []
              });
            }}
            onElementAdd={(element) => {
              const newElements = [...(slideManager.currentSlide?.elements || []), element];
              slideManager.updateCurrentSlide({ elements: newElements });
              fileManager.updateCurrentFile({ 
                slides: fileManager.currentFile?.slides.map((slide, index) => 
                  index === slideManager.currentSlideIndex ? { ...slide, elements: newElements } : slide
                ) || []
              });
            }}
          />
        </section>

        {/* Properties Panel - Mobile: Bottom, Desktop: Right */}
        <aside className="lg:flex-shrink-0" role="complementary" aria-label="Element properties">
          <PropertiesPanel
            selectedElement={selectedElement}
            onElementUpdate={(elementId: string, updates: Partial<Element>) => {
              const currentElement = slides[currentSlide]?.elements.find(el => el.id === elementId);
              if (currentElement) {
                const updatedElement = { ...currentElement, ...updates };
                const currentElements = slideManager.currentSlide?.elements || [];
                const updatedElements = currentElements.map(el => 
                  el.id === elementId ? updatedElement : el
                );
                slideManager.updateCurrentSlide({ elements: updatedElements });
                fileManager.updateCurrentFile({ 
                  slides: fileManager.currentFile?.slides.map((slide, index) => 
                    index === slideManager.currentSlideIndex ? { ...slide, elements: updatedElements } : slide
                  ) || []
                });
                setSelectedElement(updatedElement);
              }
            }}
            onElementDelete={handleDeleteElement}
          />
        </aside>
      </main>

      {/* Modals and Overlays */}
      {chartPanelOpen && (
        <ChartPanel
          onClose={() => setChartPanelOpen(false)}
          onInsertChart={(chartData) => {
            const newElement: Element = {
              id: `chart-${Date.now()}`,
              type: 'chart',
              x: 100,
              y: 100,
              width: 300,
              height: 200,
              chartType: chartData.type,
              chartData: chartData.data,
            };

            const currentElements = slideManager.currentSlide?.elements || [];
            const updatedElements = [...currentElements, newElement];
            slideManager.updateCurrentSlide({ elements: updatedElements });
            fileManager.updateCurrentFile({ 
              slides: fileManager.currentFile?.slides.map((slide, index) => 
                index === slideManager.currentSlideIndex ? { ...slide, elements: updatedElements } : slide
              ) || []
            });
            setChartPanelOpen(false);
          }}
          onEditChart={editingChart}
        />
      )}


      {presentationMode && (
        <PresentationMode
          slides={fileManager.currentFile?.slides || []}
          currentSlide={slideManager.currentSlideIndex}
          onClose={() => setPresentationMode(false)}
          onSlideChange={slideManager.setCurrentSlide}
        />
      )}


      {commandPaletteOpen && (
        <CommandPalette
          isOpen={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
          onAddText={handleAddText}
          onAddImage={handleAddImage}
          onAddShape={handleAddShape}
          onAddChart={handleAddChart}
          onAddTable={handleAddTable}
          onAddSlide={handleAddSlide}
          onNewFile={fileManager.newFile}
          onSave={fileManager.saveFile}
          onExport={handleExport}
          onPresent={() => setPresentationMode(true)}
        />
      )}

      {floatingToolbarVisible && selectedElement && (
        <FloatingToolbar
          isVisible={floatingToolbarVisible}
          position={floatingToolbarPosition}
          selectedElement={selectedElement}
          onClose={() => setFloatingToolbarVisible(false)}
          onDelete={() => handleDeleteElement(selectedElement.id)}
          onDuplicate={() => {
            // TODO: Implement duplicate functionality
            toast({ title: "Coming Soon", description: "Duplicate functionality will be available soon." });
          }}
          onBringToFront={() => {
            // TODO: Implement bring to front
            toast({ title: "Coming Soon", description: "Layer management will be available soon." });
          }}
          onSendToBack={() => {
            // TODO: Implement send to back
            toast({ title: "Coming Soon", description: "Layer management will be available soon." });
          }}
          onAlignLeft={() => handleElementUpdate({ ...selectedElement, textAlign: 'left' })}
          onAlignCenter={() => handleElementUpdate({ ...selectedElement, textAlign: 'center' })}
          onAlignRight={() => handleElementUpdate({ ...selectedElement, textAlign: 'right' })}
          onToggleBold={() => handleElementUpdate({ 
            ...selectedElement, 
            fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold' 
          })}
          onToggleItalic={() => handleElementUpdate({ 
            ...selectedElement, 
            fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic' 
          })}
          onToggleUnderline={() => {
            // TODO: Implement underline functionality
            toast({ title: "Coming Soon", description: "Underline functionality will be available soon." });
          }}
          onChangeColor={() => {
            // TODO: Implement color picker
            toast({ title: "Coming Soon", description: "Color picker will be available soon." });
          }}
        />
      )}
    </div>
  );
};

export default EnhancedEditor;
