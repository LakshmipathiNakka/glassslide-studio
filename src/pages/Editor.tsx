import { useState } from "react";
import { Toolbar } from "@/components/editor/Toolbar";
import { Canvas } from "@/components/editor/Canvas";
import { SlideThumbnails } from "@/components/editor/SlideThumbnails";
import { ChartPanel } from "@/components/editor/ChartPanel";
import { useToast } from "@/hooks/use-toast";
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
}

interface Slide {
  id: string;
  elements: Element[];
}

const Editor = () => {
  const { toast } = useToast();
  const [slides, setSlides] = useState<Slide[]>([
    { id: '1', elements: [] }
  ]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [chartPanelOpen, setChartPanelOpen] = useState(false);

  const currentElements = slides[currentSlide]?.elements || [];

  const updateCurrentSlide = (elements: Element[]) => {
    const newSlides = [...slides];
    newSlides[currentSlide] = {
      ...newSlides[currentSlide],
      elements,
    };
    setSlides(newSlides);
  };

  const handleAddText = () => {
    const newElement: Element = {
      id: Date.now().toString(),
      type: 'text',
      x: 100,
      y: 100,
      width: 300,
      height: 60,
      content: 'New Text',
    };
    updateCurrentSlide([...currentElements, newElement]);
  };

  const handleAddImage = () => {
    toast({
      title: "Image Upload",
      description: "Image upload feature coming soon!",
    });
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

  const handleExport = () => {
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
            pptxSlide.addText(element.content || 'Text', {
              x, y, w, h,
              fontSize: 18,
              color: '0B0B0B',
              valign: 'middle',
              align: 'center'
            });
          } else if (element.type === 'shape' && element.shapeType === 'rectangle') {
            pptxSlide.addShape(pptx.ShapeType.rect, {
              x, y, w, h,
              fill: { color: '4096FF' },
              line: { color: '4096FF', width: 2 }
            });
          } else if (element.type === 'shape' && element.shapeType === 'circle') {
            pptxSlide.addShape(pptx.ShapeType.ellipse, {
              x, y, w, h,
              fill: { color: '4096FF' },
              line: { color: '4096FF', width: 2 }
            });
          } else if (element.type === 'chart' && element.chartData) {
            // Add chart to slide
            pptxSlide.addChart(
              element.chartType === 'bar' ? pptx.ChartType.bar :
              element.chartType === 'line' ? pptx.ChartType.line :
              pptx.ChartType.pie,
              element.chartData.datasets.map((ds: any) => ({
                name: ds.label,
                labels: element.chartData.labels,
                values: ds.data
              })),
              { x, y, w, h }
            );
          }
        });
      });
      
      pptx.writeFile({ fileName: 'GlassSlide-Presentation.pptx' });
      
      toast({
        title: "Exported!",
        description: "Your presentation has been exported to PowerPoint.",
      });
    } catch (error) {
      toast({
        title: "Export Error",
        description: "Failed to export presentation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAddSlide = () => {
    setSlides([...slides, { id: Date.now().toString(), elements: [] }]);
    setCurrentSlide(slides.length);
  };

  return (
    <div className="h-screen flex flex-col bg-bg-soft">
      {/* Header */}
      <div className="glass-toolbar px-6 py-3 flex items-center justify-between border-b">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = '/'}
            className="hover:bg-accent/10"
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
          <Logo />
          <div className="h-6 w-px bg-border" />
          <h1 className="text-lg font-semibold text-foreground">Untitled Presentation</h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>Auto-saved</span>
        </div>
      </div>

      <Toolbar
        onAddText={handleAddText}
        onAddImage={handleAddImage}
        onAddShape={handleAddShape}
        onAddChart={() => setChartPanelOpen(true)}
        onSave={handleSave}
        onExport={handleExport}
      />

      <div className="flex-1 flex overflow-hidden">
        <SlideThumbnails
          slides={slides}
          currentSlide={currentSlide}
          onSlideChange={setCurrentSlide}
          onAddSlide={handleAddSlide}
        />

        <Canvas
          elements={currentElements}
          onElementsChange={updateCurrentSlide}
        />
      </div>
      
      <ChartPanel
        open={chartPanelOpen}
        onClose={() => setChartPanelOpen(false)}
        onAddChart={handleAddChart}
      />
    </div>
  );
};

export default Editor;
