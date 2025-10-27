import { useState, useEffect } from "react";
import { Toolbar } from "@/components/editor/Toolbar";
import SimplePowerPointCanvas from "@/components/canvas/SimplePowerPointCanvas";
import { SlideThumbnails } from "@/components/editor/SlideThumbnails";
import { ChartPanel } from "@/components/editor/ChartPanel";
import { PropertiesPanel } from "@/components/editor/PropertiesPanel";
import { PresentationMode } from "@/components/editor/PresentationMode";
import { ExportDialog } from "@/components/editor/ExportDialog";
import ShapeModal, { ShapeType } from "@/components/editor/ShapeModal";
import TableModal from "@/components/editor/TableModal";
import { useToast } from "@/hooks/use-toast";
import { useHistory } from "@/hooks/use-history";
import { usePersistence } from "@/hooks/use-persistence";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/landing/Logo";
import { Slide } from "@/types/slide-thumbnails";
import { Element } from "@/hooks/use-action-manager";
import pptxgen from "pptxgenjs";

const Editor = () => {
  const { toast } = useToast();
  const initialSlides: Slide[] = [{ 
    id: '1', 
    elements: [],
    background: '#ffffff',
    createdAt: new Date(),
    lastUpdated: Date.now()
  }];
  const { state: slides, push: pushSlides, undo, redo, canUndo, canRedo } = useHistory<Slide[]>(initialSlides);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [chartPanelOpen, setChartPanelOpen] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [editingChart, setEditingChart] = useState<{ type: 'bar' | 'line' | 'pie'; data: any } | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [shapeModalOpen, setShapeModalOpen] = useState(false);
  const [tableModalOpen, setTableModalOpen] = useState(false);

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
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "File Too Large",
            description: "Please select an image smaller than 10MB.",
            variant: "destructive"
          });
          return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid File Type",
            description: "Please select a valid image file.",
            variant: "destructive"
          });
          return;
        }

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
            imageUrl: imageUrl,
          };
          updateCurrentSlide([...currentElements, newElement]);

          toast({
            title: "Image Added",
            description: "Image has been added to the slide.",
          });
        };

        reader.onerror = () => {
          toast({
            title: "Upload Error",
            description: "Failed to read the image file. Please try again.",
            variant: "destructive"
          });
        };

        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleAddShape = () => {
    setShapeModalOpen(true);
  };

  const handleSelectShape = (shapeType: ShapeType) => {
    const newElement: Element = {
      id: Date.now().toString(),
      type: 'shape',
      x: 150,
      y: 150,
      width: 200,
      height: 120,
      shapeType,
      fill: 'transparent',
      stroke: '#000000',
      strokeWidth: 0.5,
      rotation: 0,
      opacity: 1,
    };
    updateCurrentSlide([...currentElements, newElement]);
    setSelectedElement(newElement);
    
    toast({
      title: "Shape Added",
      description: `${shapeType.charAt(0).toUpperCase() + shapeType.slice(1)} shape has been added to the slide.`,
    });
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

  const handleAddTable = () => {
    setTableModalOpen(true);
  };

  const handleConfirmTable = (rows: number, cols: number) => {
    const safeRows = Math.max(1, Math.min(20, rows || 1));
    const safeCols = Math.max(1, Math.min(20, cols || 1));
    const tableData = Array.from({ length: safeRows }, () => Array.from({ length: safeCols }, () => ''));
    const newElement: Element = {
      id: Date.now().toString(),
      type: 'table',
      x: 120,
      y: 120,
      width: 600,
      height: 300,
      rows: safeRows,
      cols: safeCols,
      tableData,
      // PPT-like defaults
      borderWidth: 1,
      borderColor: '#D9D9D9',
      backgroundColor: '#FFFFFF',
      color: '#000000',
      borderStyle: 'solid' as any,
      header: true,
      headerBg: '#E7E6E6',
      headerTextColor: '#000000',
      cellPadding: 8,
      cellTextAlign: 'left',
      rotation: 0,
    } as any;
    updateCurrentSlide([...currentElements, newElement]);
    setSelectedElement(newElement);
    setTableModalOpen(false);
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
          } else if (element.type === 'image' && element.imageUrl) {
            // Handle image export
            pptxSlide.addImage({
              data: element.imageUrl,
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
    const newSlide: Slide = { 
      id: Date.now().toString(), 
      elements: [],
      background: '#ffffff',
      createdAt: new Date(),
      lastUpdated: Date.now()
    };
    const newSlides = [...slides, newSlide];
    pushSlides(newSlides);
    setCurrentSlide(slides.length);
  };

  const handleAddSlideAtIndex = (index: number) => {
    const newSlide: Slide = { 
      id: Date.now().toString(), 
      elements: [],
      background: '#ffffff',
      title: `Slide ${slides.length + 1}`,
      createdAt: new Date(),
      lastUpdated: Date.now()
    };
    const newSlides = [...slides];
    newSlides.splice(index + 1, 0, newSlide);
    pushSlides(newSlides);
    setCurrentSlide(index + 1);
  };

  const handleDuplicateSlide = (index: number) => {
    const slideToDuplicate = slides[index];
    if (!slideToDuplicate) return;

    const duplicatedSlide: Slide = {
      ...slideToDuplicate,
      id: Date.now().toString(),
      title: `${slideToDuplicate.title || `Slide ${index + 1}`} (Copy)`,
      createdAt: new Date(),
      lastUpdated: Date.now()
    };

    const newSlides = [...slides];
    newSlides.splice(index + 1, 0, duplicatedSlide);
    pushSlides(newSlides);
    setCurrentSlide(index + 1);
  };

  const handleDeleteSlide = (index: number) => {
    if (slides.length <= 1) {
      toast({
        title: "Cannot Delete",
        description: "Cannot delete the last slide.",
        variant: "destructive"
      });
      return;
    }

    const newSlides = slides.filter((_, i) => i !== index);
    pushSlides(newSlides);
    
    // Adjust current slide if necessary
    if (currentSlide >= newSlides.length) {
      setCurrentSlide(newSlides.length - 1);
    } else if (currentSlide > index) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleRenameSlide = (index: number, title: string) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], title, lastUpdated: Date.now() };
    pushSlides(newSlides);
  };


  const handleChangeSlideBackground = (index: number, background: string) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], background, lastUpdated: Date.now() };
    pushSlides(newSlides);
  };


  const handleReorderSlides = (reorderedSlides: Slide[]) => {
    // Update slides with timestamp
    const updatedSlides = reorderedSlides.map(slide => ({ ...slide, lastUpdated: Date.now() }));
    pushSlides(updatedSlides);
    
    // Keep the same current slide index - the content will stay with the same slide
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
        onAddTable={handleAddTable}
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
            onReorderSlides={handleReorderSlides}
            onUpdateSlide={(index, updates) => {
              // console.log('Editor onUpdateSlide called with:', { index, updates });
              // Update the slide at the specified index
              const newSlides = [...slides];
              newSlides[index] = { ...newSlides[index], ...updates };
              pushSlides(newSlides);
            }}
            onAddSlideAtIndex={handleAddSlideAtIndex}
            onDuplicateSlide={handleDuplicateSlide}
            onDeleteSlide={handleDeleteSlide}
            onRenameSlide={handleRenameSlide}
            onChangeSlideBackground={handleChangeSlideBackground}
          />
        </aside>

        {/* Desktop: Slide Thumbnails on left */}
        <aside className="hidden lg:block" role="complementary" aria-label="Slide thumbnails">
          <SlideThumbnails
            slides={slides}
            currentSlide={currentSlide}
            onSlideChange={setCurrentSlide}
            onAddSlide={handleAddSlide}
            onReorderSlides={handleReorderSlides}
            onUpdateSlide={(index, updates) => {
              // console.log('Editor onUpdateSlide called with:', { index, updates });
              // Update the slide at the specified index
              const newSlides = [...slides];
              newSlides[index] = { ...newSlides[index], ...updates };
              pushSlides(newSlides);
            }}
            onAddSlideAtIndex={handleAddSlideAtIndex}
            onDuplicateSlide={handleDuplicateSlide}
            onDeleteSlide={handleDeleteSlide}
            onRenameSlide={handleRenameSlide}
            onChangeSlideBackground={handleChangeSlideBackground}
          />
        </aside>

        {/* Canvas Area */}
        <section className="flex-1 flex flex-col min-w-0" aria-label="Presentation canvas">
          <SimplePowerPointCanvas
            elements={currentElements}
            background={slides[currentSlide]?.background || '#ffffff'}
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
      
      <ShapeModal
        isOpen={shapeModalOpen}
        onClose={() => setShapeModalOpen(false)}
        onSelectShape={handleSelectShape}
      />

      <TableModal
        isOpen={tableModalOpen}
        onClose={() => setTableModalOpen(false)}
        onConfirm={handleConfirmTable}
      />
    </div>
  );
};

export default Editor;
