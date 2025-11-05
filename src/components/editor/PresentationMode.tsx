import { useEffect, useRef, useState, useCallback } from "react";
import { fabric } from "fabric";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, X, Maximize2, Minimize2 } from "lucide-react";
import { Slide } from "@/types/slide-thumbnails";
import { useHotkeys } from "react-hotkeys-hots";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { sanitizeSlidesForPresentation } from '@/utils/presentationValidator';
import { ChartJSChart } from './ChartJSChart';

interface PresentationModeProps {
  onClose: () => void;
  initialSlide?: number;
  slides: Slide[];
  title?: string;
  onSlideChange?: (index: number) => void;
  onSlideUpdate?: (slideIndex: number, elements: any[]) => void;
}

export const PresentationMode = ({ 
  onClose, 
  initialSlide = 0, 
  slides, 
  title = 'Presentation',
  onSlideChange,
  onSlideUpdate
}: PresentationModeProps) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(initialSlide);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const navigate = useNavigate();
  const { deckId } = useParams();
  
  // Load slides from localStorage if deckId is provided
  const [presentationSlides, setPresentationSlides] = useState<Slide[]>(slides);

  // Load slides from localStorage if deckId is provided
  useEffect(() => {
    if (deckId) {
      try {
        const saved = localStorage.getItem(`presentation-${deckId}`);
        if (saved) {
          const data = JSON.parse(saved);
          setPresentationSlides(data.slides);
        }
      } catch (error) {
        console.error('Failed to load presentation:', error);
        toast({
          title: 'Error',
          description: 'Failed to load presentation',
          variant: 'destructive'
        });
      }
    }
  }, [deckId]);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    
    setIsLoading(true);

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 960,
      height: 540,
      backgroundColor: '#ffffff',
      selection: false,
      preserveObjectStacking: true,
      renderOnAddRemove: false
    });

    // Disable right-click menu
    canvasRef.current.oncontextmenu = (e) => {
      e.preventDefault();
      return false;
    };

    fabricRef.current = canvas;

    // Load initial slide
    const loadInitialSlide = async () => {
      try {
        await loadSlide(currentSlideIndex);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialSlide();

    return () => {
      if (canvas) {
        canvas.dispose();
      }
    };
  }, []);

  // Load slide into canvas - MUST be defined before navigation functions that use it
  const loadSlide = useCallback(async (index: number) => {
    const canvas = fabricRef.current;
    if (!canvas || index < 0 || index >= presentationSlides.length) return;

    // Notify parent component of slide change
    onSlideChange?.(index);
    
    // Clear canvas but keep it in a loading state
    canvas.clear();
    
    const slide = presentationSlides[index];
    if (!slide) return;
    
    // Track loaded objects to ensure all are rendered
    let objectsToLoad = 0;
    let objectsLoaded = 0;
    
    // Load slide background
    if (slide.background) {
      canvas.setBackgroundColor(slide.background, () => {
        canvas.renderAll();
      });
    } else {
      canvas.setBackgroundColor('#ffffff', () => {
        canvas.renderAll();
      });
    }

    // Function to check if all objects are loaded
    const checkAllLoaded = () => {
      objectsLoaded++;
      if (objectsLoaded >= objectsToLoad) {
        canvas.renderAll();
        setIsLoading(false);
      }
    };

    // Load slide elements
    if (slide.elements?.length) {
      objectsToLoad = slide.elements.length;
      
      // If no objects, mark as loaded
      if (objectsToLoad === 0) {
        checkAllLoaded();
      }

      // Load each element
      for (const element of slide.elements) {
        try {
          // Handle different element types
          if (element.type === 'image' && element.src) {
            // Handle image loading
            fabric.Image.fromURL(element.src, (img) => {
              img.set({
                left: element.left,
                top: element.top,
                scaleX: element.scaleX || 1,
                scaleY: element.scaleY || 1,
                angle: element.angle || 0,
                opacity: element.opacity ?? 1,
                selectable: false,
                evented: false,
                excludeFromExport: false,
                ...(element as any)
              });
              
              canvas.add(img);
              checkAllLoaded();
            });
          } else {
            // Handle other objects (shapes, text, etc.)
            fabric.util.enlivenObjects(
              [element],
              (enlivenedObjects) => {
                enlivenedObjects.forEach((obj) => {
                  // Make objects non-interactive in presentation mode
                  obj.set({
                    selectable: false,
                    evented: false,
                    excludeFromExport: false
                  });
                  canvas.add(obj);
                });
                checkAllLoaded();
              },
              'fabric'
            );
          }
        } catch (error) {
          console.error('Error loading slide element:', error);
          checkAllLoaded();
        }
      }
    } else {
      checkAllLoaded();
    }
  }, [presentationSlides, onSlideChange]);

  // Navigation functions - defined AFTER loadSlide
  const goToNextSlide = useCallback(() => {
    if (currentSlideIndex < presentationSlides.length - 1) {
      const newIndex = currentSlideIndex + 1;
      setCurrentSlideIndex(newIndex);
      loadSlide(newIndex);
    }
  }, [currentSlideIndex, presentationSlides.length, loadSlide]);

  const goToPrevSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      const newIndex = currentSlideIndex - 1;
      setCurrentSlideIndex(newIndex);
      loadSlide(newIndex);
    }
  }, [currentSlideIndex, loadSlide]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading slide {currentSlideIndex + 1} of {presentationSlides.length}...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black z-50 flex flex-col select-none"
    >
      {/* Header */}
      <div className="bg-black/90 text-white p-3 flex justify-between items-center transition-opacity duration-300 hover:opacity-100 opacity-0 group-hover:opacity-100">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 transition-colors"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>

          <div className={`w-px bg-white/30 mx-2 ${isFullscreen ? 'h-8 mx-3' : 'h-6'}`} />

          <Button
            variant="ghost"
            size={isFullscreen ? "lg" : "sm"}
            onClick={onClose}
            className={`text-white hover:bg-white/20 transition-colors ${isFullscreen ? 'w-12 h-12' : ''}`}
          >
            <X className={`${isFullscreen ? 'w-6 h-6' : 'w-4 h-4'}`} />
          </Button>
        </div>
      </div>

      {/* Instructions - Only show when not in fullscreen */}
      {!isFullscreen && (
        <div className="absolute top-6 left-6 text-white/70 text-sm">
          <div>Press <kbd className="bg-white/20 px-2 py-1 rounded">Space</kbd> or <kbd className="bg-white/20 px-2 py-1 rounded">→</kbd> for next slide</div>
          <div>Press <kbd className="bg-white/20 px-2 py-1 rounded">←</kbd> for previous slide</div>
          <div>Press <kbd className="bg-white/20 px-2 py-1 rounded">R</kbd> to restart from beginning</div>
          <div>Press <kbd className="bg-white/20 px-2 py-1 rounded">P</kbd> to play/pause</div>
          <div>Press <kbd className="bg-white/20 px-2 py-1 rounded">F</kbd> to toggle fullscreen</div>
          <div>Press <kbd className="bg-white/20 px-2 py-1 rounded">Esc</kbd> to exit presentation</div>
        </div>
      )}

      {/* Main slide content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div 
          className="relative bg-white"
          style={{
            width: isFullscreen ? baseWidth : baseWidth,
            height: isFullscreen ? baseHeight : baseHeight,
            maxWidth: '100%',
            maxHeight: '100%'
          }}
        >
          {slides[currentSlide]?.elements.map((element) => renderElement(element))}
        </div>
      </div>

      {/* Navigation controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="text-white hover:bg-white/20 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        
        <div className="text-white text-sm font-medium px-4 py-2 bg-black/50 rounded-lg">
          {currentSlide + 1} / {slides.length}
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="text-white hover:bg-white/20 transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );

  // Helper function to render each element
  function renderElement(element: any) {
    const scaleFactor = isFullscreen ? baseWidth / 960 : 1;

    switch (element.type) {
      case 'text':
        return (
          <div
            key={element.id}
            className="absolute"
            style={{
              left: isFullscreen ? element.x * (baseWidth / 960) : element.x,
              top: isFullscreen ? element.y * (baseHeight / 540) : element.y,
              width: isFullscreen ? element.width * (baseWidth / 960) : element.width,
              height: isFullscreen ? element.height * (baseHeight / 540) : element.height,
              fontSize: (element.fontSize || 16) * scaleFactor,
              color: element.color || '#000000',
              fontFamily: element.fontFamily || 'Arial',
              fontWeight: element.fontWeight || 'normal',
              fontStyle: element.fontStyle || 'normal',
              textAlign: (element.textAlign || 'left') as any,
              display: 'flex',
              alignItems: 'center',
              justifyContent: element.textAlign === 'center' ? 'center' : element.textAlign === 'right' ? 'flex-end' : 'flex-start',
            }}
            dangerouslySetInnerHTML={{ __html: element.content || element.text || '' }}
          />
        );

      case 'image':
        return (
          <div
            key={element.id}
            className="absolute"
            style={{
              left: isFullscreen ? element.x * (baseWidth / 960) : element.x,
              top: isFullscreen ? element.y * (baseHeight / 540) : element.y,
              width: isFullscreen ? element.width * (baseWidth / 960) : element.width,
              height: isFullscreen ? element.height * (baseHeight / 540) : element.height,
            }}
          >
            <img
              src={element.imageUrl}
              alt="Presentation content"
              className="w-full h-full object-cover"
            />
          </div>
        );

      case 'chart':
        console.log('[PresentationMode] Rendering chart:', {
          id: element.id,
          type: element.chartType,
          hasData: !!element.chartData,
          labels: element.chartData?.labels?.length || 0
        });
        
        return (
          <div
            key={element.id}
            className="absolute"
            style={{
              left: isFullscreen ? element.x * (baseWidth / 960) : element.x,
              top: isFullscreen ? element.y * (baseHeight / 540) : element.y,
              width: isFullscreen ? element.width * (baseWidth / 960) : element.width,
              height: isFullscreen ? element.height * (baseHeight / 540) : element.height,
            }}
          >
            <ChartJSChart
              chart={element as any}
              isSelected={false}
              onUpdate={() => {}}
              onDelete={() => {}}
              onSelect={() => {}}
            />
          </div>
        );

      case 'shape':
        const getShapeStyles = () => {
          const baseStyles = {
            left: isFullscreen ? element.x * (baseWidth / 960) : element.x,
            top: isFullscreen ? element.y * (baseHeight / 540) : element.y,
            width: isFullscreen ? element.width * (baseWidth / 960) : element.width,
            height: isFullscreen ? element.height * (baseHeight / 540) : element.height,
            backgroundColor: element.fill || '#000000',
          };

          switch (element.shapeType) {
            case 'circle':
              return { ...baseStyles, borderRadius: '50%' };
            case 'rounded-rectangle':
              return { ...baseStyles, borderRadius: element.borderRadius ? `${element.borderRadius * scaleFactor}px` : `${8 * scaleFactor}px` };
            default:
              return baseStyles;
          }
        };

        return (
          <div
            key={element.id}
            className="absolute"
            style={getShapeStyles()}
          />
        );

      case 'table':
        return (
          <div
            key={element.id}
            className="absolute overflow-hidden"
            style={{
              left: isFullscreen ? element.x * (baseWidth / 960) : element.x,
              top: isFullscreen ? element.y * (baseHeight / 540) : element.y,
              width: isFullscreen ? element.width * (baseWidth / 960) : element.width,
              height: isFullscreen ? element.height * (baseHeight / 540) : element.height,
            }}
          >
            <table className="w-full h-full border-collapse">
              <tbody>
                {element.tableData?.map((row: any[], rowIndex: number) => (
                  <tr key={rowIndex}>
                    {row.map((cell: any, cellIndex: number) => (
                      <td
                        key={cellIndex}
                        className="border border-gray-300 p-2 text-sm"
                        style={{
                          fontSize: (element.fontSize || 14) * scaleFactor,
                        }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return null;
    }
  }
};

export default PresentationMode;
