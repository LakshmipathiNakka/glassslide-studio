import { useState } from "react";
import { Toolbar } from "@/components/editor/Toolbar";
import { Canvas } from "@/components/editor/Canvas";
import { SlideThumbnails } from "@/components/editor/SlideThumbnails";
import { useToast } from "@/hooks/use-toast";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Element {
  id: string;
  type: 'text' | 'image' | 'shape';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  shapeType?: 'rectangle' | 'circle';
  fill?: string;
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
      description: "Your presentation has been downloaded.",
    });
  };

  const handleExport = () => {
    toast({
      title: "Export",
      description: "PowerPoint export coming soon!",
    });
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
    </div>
  );
};

export default Editor;
