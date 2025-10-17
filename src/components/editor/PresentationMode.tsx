import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { Slide } from '@/types/slide-thumbnails';
import { Element } from '@/hooks/use-action-manager';

interface PresentationModeProps {
  slides: Slide[];
  currentSlide: number;
  onClose: () => void;
}

export const PresentationMode = ({ slides, currentSlide: initialSlide, onClose }: PresentationModeProps) => {
  const [currentSlide, setCurrentSlide] = useState(initialSlide);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const currentElements = slides[currentSlide]?.elements || [];

  // Auto-hide controls after 3 seconds
  useEffect(() => {
    if (isPlaying) {
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isPlaying]);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    setShowControls(true);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevSlide();
          break;
        case 'p':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          e.preventDefault();
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            document.documentElement.requestFullscreen();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, isPlaying]);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying) {
      const timer = setInterval(() => {
        if (currentSlide < slides.length - 1) {
          setCurrentSlide(currentSlide + 1);
        } else {
          setIsPlaying(false);
        }
      }, 5000); // 5 seconds per slide

      return () => clearInterval(timer);
    }
  }, [isPlaying, currentSlide, slides.length]);

  const renderElement = (element: Element) => {
    switch (element.type) {
      case 'text':
        return (
          <div
            key={element.id}
            className="absolute"
            style={{
              left: element.x,
              top: element.y,
              width: element.width,
              height: element.height,
              fontSize: `${element.fontSize || 18}px`,
              fontWeight: element.fontWeight || 'normal',
              fontStyle: element.fontStyle || 'normal',
              color: element.color || '#000000',
              textAlign: element.textAlign || 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: element.textAlign === 'left' ? 'flex-start' : 
                             element.textAlign === 'right' ? 'flex-end' : 'center'
            }}
          >
            {element.content || 'Text'}
          </div>
        );

      case 'image':
        return (
          <div
            key={element.id}
            className="absolute overflow-hidden rounded-lg"
            style={{
              left: element.x,
              top: element.y,
              width: element.width,
              height: element.height,
            }}
          >
            <img
              src={element.content}
              alt="Presentation content"
              className="w-full h-full object-cover"
            />
          </div>
        );

      case 'shape':
        return (
          <div
            key={element.id}
            className="absolute"
            style={{
              left: element.x,
              top: element.y,
              width: element.width,
              height: element.height,
              backgroundColor: element.fill || '#000000',
              borderRadius: element.shapeType === 'circle' ? '50%' : '8px',
            }}
          />
        );

      case 'chart':
        return (
          <div
            key={element.id}
            className="absolute bg-card rounded-lg p-4 flex items-center justify-center"
            style={{
              left: element.x,
              top: element.y,
              width: element.width,
              height: element.height,
            }}
          >
            <div className="text-center text-muted-foreground">
              <div className="text-lg font-semibold mb-2">
                {element.chartType?.toUpperCase()} Chart
              </div>
              <div className="text-xs">
                {element.chartData?.labels?.join(', ')}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black z-50 flex items-center justify-center"
      onClick={() => setShowControls(!showControls)}
    >
      {/* Slide content */}
      <div className="relative bg-white shadow-2xl" style={{ width: '960px', height: '540px' }}>
        {currentElements.map(renderElement)}
        
        {/* Slide counter */}
        <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {currentSlide + 1} / {slides.length}
        </div>
      </div>

      {/* Controls */}
      {showControls && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/50 text-white px-6 py-3 rounded-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="text-white hover:bg-white/20"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={togglePlay}
            className="text-white hover:bg-white/20"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="text-white hover:bg-white/20"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-white/30 mx-2" />

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute top-6 left-6 text-white/70 text-sm">
        <div>Press <kbd className="bg-white/20 px-2 py-1 rounded">Space</kbd> or <kbd className="bg-white/20 px-2 py-1 rounded">→</kbd> for next slide</div>
        <div>Press <kbd className="bg-white/20 px-2 py-1 rounded">←</kbd> for previous slide</div>
        <div>Press <kbd className="bg-white/20 px-2 py-1 rounded">P</kbd> to play/pause</div>
        <div>Press <kbd className="bg-white/20 px-2 py-1 rounded">F</kbd> for fullscreen</div>
        <div>Press <kbd className="bg-white/20 px-2 py-1 rounded">Esc</kbd> to exit</div>
      </div>
    </div>
  );
};
