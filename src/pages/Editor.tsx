import { useState, useEffect } from "react";
import { Toolbar } from "@/components/editor/Toolbar";
import SimplePowerPointCanvas from "@/components/canvas/SimplePowerPointCanvas";
import { SlideThumbnails } from "@/components/editor/SlideThumbnails";
import { ChartPanel } from "@/components/editor/ChartPanel";
import { PropertiesPanel } from "@/components/editor/PropertiesPanel";
import { PresentationMode } from "@/components/editor/PresentationMode";
import { ExportDialog } from "@/components/editor/ExportDialog";
import { useToast } from "@/hooks/use-toast";
import { useHistory } from "@/hooks/use-history";
import { usePersistence } from "@/hooks/use-persistence";
import { Home } from "lucide-react";
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
}

const Editor = () => {
  const { toast } = useToast();
  const initialSlides = [{ id: '1', elements: [] }];
  const { state: slides, push: pushSlides, undo, redo, canUndo, canRedo } = useHistory<Slide[]>(initialSlides);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [chartPanelOpen, setChartPanelOpen] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [editingChart, setEditingChart] = useState<{ type: 'bar' | 'line' | 'pie'; data: any } | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  // Auto-save to localStorage
  usePersistence(slides, (loadedSlides) => {
    // This will be called when data is loaded from localStorage
    // We need to update the history with the loaded data
  });

  const currentElements = slides[currentSlide]?.elements || [];

  const updateCurrentSlide = (elements: Element[]) => {
    const newSlides = [...slides];
    newSlides[currentSlide] = {
      ...newSlides[currentSlide],
      elements,
    };
    pushSlides(newSlides);
  };

  const handleElementSelect = (element: Element | null) => {
    setSelectedElement(element);
  };

  const handleElementUpdate = (updatedElement: Element) => {
    const newElements = currentElements.map(el => 
      el.id === updatedElement.id ? updatedElement : el
    );
    updateCurrentSlide(newElements);
    setSelectedElement(updatedElement);
  };

  const handleElementDelete = (elementId: string) => {
    const newElements = currentElements.filter(el => el.id !== elementId);
    updateCurrentSlide(newElements);
    setSelectedElement(null);
  };


  const handleEditChart = (element: Element) => {
    if (element.type === 'chart' && element.chartData && element.chartType) {
      setEditingChart({
        type: element.chartType,
        data: element.chartData
      });
      setChartPanelOpen(true);
    }
  };

  const handleUpdateChart = (chartType: 'bar' | 'line' | 'pie', chartData: any) => {
    if (editingChart) {
      const newElements = currentElements.map(el => 
        el.id === selectedElement?.id 
          ? { ...el, chartType, chartData }
          : el
      );
      updateCurrentSlide(newElements);
      setEditingChart(null);
      
      toast({
        title: "Chart Updated",
        description: "Chart data has been updated.",
      });
    }
  };

  const handleAddText = () => {
    const newElement: Element = {
      id: Date.now().toString(),
      type: 'text',
      x: 100,
      y: 100,
      width: 300,
      height: 60,
      content: 'Click to Add text',
      fontSize: 18,
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'center',
      color: '#000000',
    };
    updateCurrentSlide([...currentElements, newElement]);
  };

  const handleAddImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          const newElement: Element = {
            id: Date.now().toString(),
            type: 'image',
            x: 100,
            y: 100,
            width: 200,
            height: 150,
            content: imageUrl,
          };
          updateCurrentSlide([...currentElements, newElement]);
          
          toast({
            title: "Image Added",
            description: "Image has been added to the slide.",
          });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleAddShape = (shapeType: 'rectangle' | 'circle') => {
    const newElement: Element = {
      id: Date.now().toString(),
      type: 'shape',
      x: 150,
      y: 150,
      width: shapeType === 'circle' ? 150 : 200,
      height: shapeType === 'circle' ? 150 : 120,
      shapeType,
    };
    updateCurrentSlide([...currentElements, newElement]);
  };

  const handleAddChart = (chartType: 'bar' | 'line' | 'pie', chartData: any) => {
    const newElement: Element = {
      id: Date.now().toString(),
      type: 'chart',
      x: 100,
      y: 100,
      width: 400,
      height: 300,
      chartType,
      chartData,
    };
    updateCurrentSlide([...currentElements, newElement]);
  };

  const handleSave = () => {
    const data = JSON.stringify({ slides }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'presentation.json';
    a.click();
    
    toast({
      title: "Saved!",
      description: "Your presentation has been downloaded as JSON.",
    });
  };

  const handleExportFormat = (format: 'pptx' | 'pdf' | 'png' | 'json') => {
    switch (format) {
      case 'pptx':
        handleExportPPTX();
        break;
      case 'pdf':
        handleExportPDF();
        break;
      case 'png':
        handleExportPNG();
        break;
      case 'json':
        handleSave();
        break;
    }
  };

  const handleExportPPTX = () => {
    try {
      const pptx = new pptxgen();
      
      slides.forEach((slide, index) => {
        const pptxSlide = pptx.addSlide();
        
        slide.elements.forEach((element) => {
          // Convert canvas coordinates to PowerPoint inches
          const x = (element.x / 960) * 10;
          const y = (element.y / 540) * 5.625;
          const w = (element.width / 960) * 10;
          const h = (element.height / 540) * 5.625;
          
          if (element.type === 'text') {
            const textOptions: any = {
              x, y, w, h,
              fontSize: element.fontSize || 18,
              color: element.color ? element.color.replace('#', '') : '0B0B0B',
              valign: 'middle',
              align: element.textAlign || 'center',
              bold: element.fontWeight === 'bold',
              italic: element.fontStyle === 'italic'
            };
            
            pptxSlide.addText(element.content || 'Text', textOptions);
          } else if (element.type === 'image' && element.content) {
            // Handle image export
            pptxSlide.addImage({
              data: element.content,
              x, y, w, h
            });
          } else if (element.type === 'shape' && element.shapeType === 'rectangle') {
            pptxSlide.addShape(pptx.ShapeType.rect, {
              x, y, w, h,
              fill: { color: element.fill ? element.fill.replace('#', '') : '4096FF' },
              line: { color: element.fill ? element.fill.replace('#', '') : '4096FF', width: 2 }
            });
          } else if (element.type === 'shape' && element.shapeType === 'circle') {
            pptxSlide.addShape(pptx.ShapeType.ellipse, {
              x, y, w, h,
              fill: { color: element.fill ? element.fill.replace('#', '') : '4096FF' },
              line: { color: element.fill ? element.fill.replace('#', '') : '4096FF', width: 2 }
            });
          } else if (element.type === 'chart' && element.chartData) {
            // Enhanced chart export
            try {
              const chartData = element.chartData.datasets.map((ds: any) => ({
                name: ds.label,
                labels: element.chartData.labels,
                values: ds.data
              }));
              
              pptxSlide.addChart(
                element.chartType === 'bar' ? pptx.ChartType.bar :
                element.chartType === 'line' ? pptx.ChartType.line :
                pptx.ChartType.pie,
                chartData,
                { 
                  x, y, w, h,
                  showTitle: true,
                  title: `${element.chartType?.toUpperCase()} Chart`
                }
              );
            } catch (chartError) {
              // Fallback to text representation if chart fails
              pptxSlide.addText(
                `${element.chartType?.toUpperCase()} Chart\n\nData: ${element.chartData.labels?.join(', ')}`,
                { x, y, w, h, fontSize: 12, align: 'center', valign: 'middle' }
              );
            }
          }
        });
      });
      
      // Set presentation properties
      pptx.author = 'GlassSlide Studio';
      pptx.company = 'GlassSlide';
      pptx.title = 'Presentation';
      pptx.subject = 'Created with GlassSlide Studio';
      
      pptx.writeFile({ fileName: 'GlassSlide-Presentation.pptx' });
      
      toast({
        title: "Exported!",
        description: "Your presentation has been exported to PowerPoint with enhanced formatting.",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Error",
        description: "Failed to export presentation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleExportPDF = () => {
    // For now, we'll use a simple approach - export as images and combine
    // In a real implementation, you'd use a PDF library like jsPDF
    toast({
      title: "PDF Export",
      description: "PDF export feature coming soon! For now, please use PowerPoint export.",
    });
  };

  const handleExportPNG = () => {
    // Export current slide as PNG
    const canvas = document.querySelector('canvas') || document.createElement('canvas');
    const slideElement = document.querySelector('[style*="width: 960px"]') as HTMLElement;
    
    if (slideElement) {
      // Use html2canvas or similar library to capture the slide
      toast({
        title: "PNG Export",
        description: "PNG export feature coming soon! For now, please use PowerPoint export.",
      });
    } else {
      toast({
        title: "Export Error",
        description: "Could not find slide to export.",
        variant: "destructive"
      });
    }
  };

  const handleAddSlide = () => {
    const newSlides = [...slides, { id: Date.now().toString(), elements: [] }];
    pushSlides(newSlides);
    setCurrentSlide(slides.length);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
        }
      } else {
        switch (e.key) {
          case 'F5':
            e.preventDefault();
            setPresentationMode(true);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return (
    <div className="h-screen flex flex-col bg-bg-soft">
      {/* Skip Link for Accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      {/* Header */}
      <header className="glass-toolbar border-b" role="banner">
        <div className="container-fluid py-2 sm:py-3">
          <div className="flex-modern justify-between">
            <div className="flex-modern min-w-0 flex-1">
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
              <Logo />
              <div className="h-4 sm:h-6 w-px bg-border hidden sm:block" aria-hidden="true" />
              <h1 className="text-fluid-sm font-semibold text-foreground truncate">
                <span className="hidden sm:inline">Untitled Presentation</span>
                <span className="sm:hidden">Untitled</span>
              </h1>
            </div>
            <div className="flex items-center space-fluid-xs text-fluid-xs text-muted-foreground flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
              <span className="hidden sm:inline">Auto-saved</span>
            </div>
          </div>
        </div>
      </header>

      <Toolbar
        onAddText={handleAddText}
        onAddImage={handleAddImage}
        onAddShape={handleAddShape}
        onAddChart={() => setChartPanelOpen(true)}
        onSave={handleSave}
        onExport={() => setExportDialogOpen(true)}
        onUndo={undo}
        onRedo={redo}
        onPresent={() => setPresentationMode(true)}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      <main id="main-content" className="flex-1 flex flex-col lg:flex-row overflow-hidden" role="main">
        {/* Mobile: Slide Thumbnails at top */}
        <aside className="lg:hidden" role="complementary" aria-label="Slide thumbnails">
          <SlideThumbnails
            slides={slides}
            currentSlide={currentSlide}
            onSlideChange={setCurrentSlide}
            onAddSlide={handleAddSlide}
            onUpdateSlide={(index, updates) => {
              // console.log('Editor onUpdateSlide called with:', { index, updates });
              // Update the slide at the specified index
              const newSlides = [...slides];
              newSlides[index] = { ...newSlides[index], ...updates };
              pushSlides(newSlides);
            }}
          />
        </aside>

        {/* Desktop: Slide Thumbnails on left */}
        <aside className="hidden lg:block" role="complementary" aria-label="Slide thumbnails">
          <SlideThumbnails
            slides={slides}
            currentSlide={currentSlide}
            onSlideChange={setCurrentSlide}
            onAddSlide={handleAddSlide}
            onUpdateSlide={(index, updates) => {
              // console.log('Editor onUpdateSlide called with:', { index, updates });
              // Update the slide at the specified index
              const newSlides = [...slides];
              newSlides[index] = { ...newSlides[index], ...updates };
              pushSlides(newSlides);
            }}
          />
        </aside>

        {/* Canvas Area */}
        <section className="flex-1 flex flex-col min-w-0" aria-label="Presentation canvas">
          <SimplePowerPointCanvas
            elements={currentElements}
            onElementSelect={handleElementSelect}
            onElementUpdate={(element) => {
              const newElements = currentElements.map(el => 
                el.id === element.id ? element : el
              );
              updateCurrentSlide(newElements);
            }}
            onElementAdd={(element) => {
              const newElements = [...currentElements, element];
              updateCurrentSlide(newElements);
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
                const newElements = currentElements.map(el => 
                  el.id === elementId ? updatedElement : el
                );
                updateCurrentSlide(newElements);
                setSelectedElement(updatedElement);
              }
            }}
            onElementDelete={handleElementDelete}
          />
        </aside>
      </main>
      
      <ChartPanel
        open={chartPanelOpen}
        onClose={() => {
          setChartPanelOpen(false);
          setEditingChart(null);
        }}
        onAddChart={handleAddChart}
        onEditChart={handleUpdateChart}
        editingChart={editingChart}
      />
      
      
      {presentationMode && (
        <PresentationMode
          slides={slides}
          currentSlide={currentSlide}
          onClose={() => setPresentationMode(false)}
        />
      )}
      
      <ExportDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        onExport={handleExportFormat}
      />
    </div>
  );
};

export default Editor;
