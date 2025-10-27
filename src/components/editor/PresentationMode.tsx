import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, Play, Pause, RotateCcw } from "lucide-react";
import { Slide } from '@/types/slide-thumbnails';
import { Element } from '@/hooks/use-action-manager';

interface PresentationModeProps {
  slides: Slide[];
  currentSlide: number;
  onClose: () => void;
}

export const PresentationMode = ({ slides, currentSlide: initialSlide, onClose }: PresentationModeProps) => {
  // Always start presentation from the first slide (index 0)
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [slideTimer, setSlideTimer] = useState(0);

  // Detect fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Slide timer effect
  useEffect(() => {
    if (isPlaying) {
      const timer = setInterval(() => {
        setSlideTimer(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setSlideTimer(0);
    }
  }, [isPlaying, currentSlide]);

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

  const restartPresentation = () => {
    setCurrentSlide(0);
    setIsPlaying(false);
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
        case 'r':
          e.preventDefault();
          restartPresentation();
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

  const currentElements = slides[currentSlide]?.elements || [];

  const renderElement = (element: Element, isFullscreen: boolean = false) => {
    // Scale factor for fullscreen (16:9 aspect ratio)
    const scaleFactor = isFullscreen ? Math.min(window.innerWidth / 960, window.innerHeight / 540) : 1;
    const baseWidth = isFullscreen ? window.innerWidth : 960;
    const baseHeight = isFullscreen ? window.innerHeight : 540;
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
              fontSize: isFullscreen ? `${(element.fontSize || 18) * scaleFactor}px` : `${element.fontSize || 18}px`,
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
              left: isFullscreen ? element.x * (baseWidth / 960) : element.x,
              top: isFullscreen ? element.y * (baseHeight / 540) : element.y,
              width: isFullscreen ? element.width * (baseWidth / 960) : element.width,
              height: isFullscreen ? element.height * (baseHeight / 540) : element.height,
              borderRadius: element.borderRadius ? `${element.borderRadius * scaleFactor}px` : '0'
            }}
          >
            <img
              src={element.imageUrl || element.content}
              alt="Presentation content"
              className="w-full h-full object-cover"
            />
          </div>
        );

      case 'chart':
        const renderChartContent = () => {
          if (!element.chartData) {
            return (
              <div className="text-center text-muted-foreground">
                <div className={`text-lg font-semibold mb-2 ${isFullscreen ? 'text-2xl' : ''}`}>
                  {element.chartType?.toUpperCase() || 'CHART'} Chart
                </div>
                <div className={isFullscreen ? 'text-sm' : 'text-xs'}>No data available</div>
              </div>
            );
          }

          const { labels = [], datasets = [] } = element.chartData;

          switch (element.chartType) {
            case 'bar':
              return (
                <div className="text-center">
                  <div className={`text-lg font-semibold mb-3 text-blue-600 ${isFullscreen ? 'text-2xl' : ''}`}>📊 Bar Chart</div>
                  <div className="space-y-2">
                    {labels.slice(0, 5).map((label: string, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className={`w-20 text-left ${isFullscreen ? 'text-base' : 'text-sm'}`}>{label}</span>
                        <div className={`flex-1 mx-2 bg-gray-200 rounded-full ${isFullscreen ? 'h-3' : 'h-2'}`}>
                          <div
                            className="bg-blue-500 rounded-full"
                            style={{
                              width: datasets[0]?.data?.[index]
                                ? `${Math.min((datasets[0].data[index] / Math.max(...datasets[0].data)) * 100, 100)}%`
                                : '0%',
                              height: isFullscreen ? '12px' : '8px'
                            }}
                          />
                        </div>
                        <span className={`w-12 text-right ${isFullscreen ? 'text-base' : 'text-sm'}`}>
                          {datasets[0]?.data?.[index] || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );

            case 'line':
              return (
                <div className="text-center">
                  <div className={`text-lg font-semibold mb-3 text-green-600 ${isFullscreen ? 'text-2xl' : ''}`}>📈 Line Chart</div>
                  <div className="space-y-2">
                    {labels.slice(0, 5).map((label: string, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className={`w-20 text-left ${isFullscreen ? 'text-base' : 'text-sm'}`}>{label}</span>
                        <div className={`flex-1 mx-2 flex items-center ${isFullscreen ? 'h-3' : 'h-2'}`}>
                          <div className={`w-full border-t-2 border-b-2 border-green-200 relative ${isFullscreen ? 'h-3' : 'h-2'}`}>
                            <div
                              className="absolute top-0 left-0 w-2 h-2 bg-green-500 rounded-full"
                              style={{
                                left: `${(index / Math.max(labels.length - 1, 1)) * 100}%`,
                                top: datasets[0]?.data?.[index]
                                  ? `${50 - (datasets[0].data[index] - 50)}%`
                                  : '50%',
                                transform: 'translateY(-50%)'
                              }}
                            />
                          </div>
                        </div>
                        <span className={`w-12 text-right ${isFullscreen ? 'text-base' : 'text-sm'}`}>
                          {datasets[0]?.data?.[index] || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );

            case 'pie':
              return (
                <div className="text-center">
                  <div className={`text-lg font-semibold mb-3 text-purple-600 ${isFullscreen ? 'text-2xl' : ''}`}>🥧 Pie Chart</div>
                  <div className={`flex flex-wrap gap-2 justify-center ${isFullscreen ? 'gap-3' : 'gap-2'}`}>
                    {labels.slice(0, 6).map((label: string, index: number) => (
                      <div key={index} className="flex items-center gap-1">
                        <div
                          className={`rounded-full ${isFullscreen ? 'w-4 h-4' : 'w-3 h-3'}`}
                          style={{
                            backgroundColor: [
                              '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'
                            ][index] || '#6B7280'
                          }}
                        />
                        <span className={isFullscreen ? 'text-sm' : 'text-xs'}>
                          {label}: {datasets[0]?.data?.[index] || 0}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );

            default:
              return (
                <div className="text-center text-muted-foreground">
                  <div className={`text-lg font-semibold mb-2 ${isFullscreen ? 'text-2xl' : ''}`}>
                    {element.chartType?.toUpperCase() || 'CHART'} Chart
                  </div>
                  <div className={isFullscreen ? 'text-sm' : 'text-xs'}>
                    {labels.join(', ')}
                  </div>
                </div>
              );
          }
        };

        return (
          <div
            key={element.id}
            className="absolute bg-white rounded-lg p-4 flex items-center justify-center shadow-lg"
            style={{
              left: isFullscreen ? element.x * (baseWidth / 960) : element.x,
              top: isFullscreen ? element.y * (baseHeight / 540) : element.y,
              width: isFullscreen ? element.width * (baseWidth / 960) : element.width,
              height: isFullscreen ? element.height * (baseHeight / 540) : element.height,
              border: element.borderColor ? `1px solid ${element.borderColor}` : 'none',
              backgroundColor: element.backgroundColor || '#FFFFFF',
              padding: isFullscreen ? `${4 * scaleFactor}px` : '16px'
            }}
          >
            {renderChartContent()}
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
              return {
                ...baseStyles,
                borderRadius: '50%',
              };
            case 'rounded-rectangle':
              return {
                ...baseStyles,
                borderRadius: element.borderRadius ? `${element.borderRadius * scaleFactor}px` : `${8 * scaleFactor}px`,
              };
            case 'triangle':
              return {
                ...baseStyles,
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
              };
            case 'star':
              return {
                ...baseStyles,
                clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
              };
            case 'arrow-right':
              return {
                ...baseStyles,
                clipPath: 'polygon(0% 50%, 70% 0%, 70% 20%, 100% 20%, 100% 80%, 70% 80%, 70% 100%, 0% 50%)',
              };
            case 'diamond':
              return {
                ...baseStyles,
                clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
              };
            case 'heart':
              return {
                ...baseStyles,
                clipPath: 'path("M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z")',
              };
            case 'lightning':
              return {
                ...baseStyles,
                clipPath: 'polygon(50% 0%, 20% 40%, 40% 40%, 10% 100%, 90% 60%, 60% 60%, 100% 100%, 50% 0%)',
              };
            default:
              return {
                ...baseStyles,
                borderRadius: element.borderRadius ? `${element.borderRadius * scaleFactor}px` : 0,
              };
          }
        };

        return (
          <div
            key={element.id}
            className="absolute"
            style={{
              ...getShapeStyles(),
              border: element.stroke ? `${(element.strokeWidth || 1) * scaleFactor}px ${element.borderStyle || 'solid'} ${element.stroke}` : 'none',
              opacity: element.opacity || 1,
              transform: element.rotation ? `rotate(${element.rotation}deg)` : 'none',
            }}
          />
        );

      case 'table':
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
            <table
              className="w-full h-full border-collapse"
              style={{
                border: `1px solid ${element.borderColor || '#D9D9D9'}`,
                backgroundColor: element.backgroundColor || '#FFFFFF'
              }}
            >
              <tbody>
                {element.tableData?.map((row: string[], rowIndex: number) => (
                  <tr key={rowIndex}>
                    {row.map((cell: string, colIndex: number) => (
                      <td
                        key={colIndex}
                        className="border text-sm"
                        style={{
                          borderColor: element.borderColor || '#D9D9D9',
                          borderWidth: element.borderWidth || 1,
                          borderStyle: element.borderStyle || 'solid',
                          backgroundColor: rowIndex === 0 && element.header && element.headerBg
                            ? element.headerBg
                            : rowIndex % 2 === 1 && element.rowAltBg
                            ? element.rowAltBg
                            : 'transparent',
                          color: rowIndex === 0 && element.header && element.headerTextColor
                            ? element.headerTextColor
                            : element.color || '#000000',
                          textAlign: element.cellTextAlign || 'left',
                          padding: `${(element.cellPadding || 8) * scaleFactor}px`,
                          fontSize: isFullscreen ? `${(element.fontSize || 12) * scaleFactor}px` : `${element.fontSize || 12}px`,
                          fontWeight: rowIndex === 0 && element.header ? 'bold' : 'normal'
                        }}
                        dangerouslySetInnerHTML={{ __html: cell }}
                      />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black z-50 flex items-center justify-center"
      onClick={() => setShowControls(!showControls)}
    >
      {/* Slide content */}
      <div
        className={`relative shadow-2xl transition-all duration-500 ${isFullscreen ? 'w-screen h-screen' : ''}`}
        style={isFullscreen ? {
          width: '100vw',
          height: '100vh',
          background: slides[currentSlide]?.background || '#ffffff'
        } : {
          width: '960px',
          height: '540px',
          background: slides[currentSlide]?.background || '#ffffff'
        }}
      >
        {currentElements.map((element) => renderElement(element, isFullscreen))}

        {/* Slide title */}
        {slides[currentSlide]?.title && (
          <div className={`absolute top-4 left-4 bg-black/20 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm ${isFullscreen ? 'text-lg' : ''}`}>
            {slides[currentSlide].title}
          </div>
        )}

        {/* Progress bar */}
        <div className={`absolute top-4 left-1/2 -translate-x-1/2 bg-black/20 rounded-full h-1 backdrop-blur-sm ${isFullscreen ? 'w-96' : 'w-64'}`}>
          <div
            className="bg-blue-500 h-1 rounded-full transition-all duration-300"
            style={{
              width: `${((currentSlide + 1) / slides.length) * 100}%`
            }}
          />
        </div>

        {/* Slide counter */}
        <div className={`absolute bottom-4 right-4 bg-black/20 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm ${isFullscreen ? 'text-base' : ''}`}>
          {currentSlide + 1} / {slides.length}
        </div>
      </div>

      {/* Controls */}
      {showControls && (
        <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/20 text-white px-6 py-3 rounded-full backdrop-blur-sm ${isFullscreen ? 'px-8 py-4 gap-6' : ''}`}>
          <Button
            variant="ghost"
            size={isFullscreen ? "lg" : "sm"}
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className={`text-white hover:bg-white/20 ${isFullscreen ? 'w-12 h-12' : ''}`}
          >
            <ChevronLeft className={`${isFullscreen ? 'w-6 h-6' : 'w-4 h-4'}`} />
          </Button>

          <Button
            variant="ghost"
            size={isFullscreen ? "lg" : "sm"}
            onClick={restartPresentation}
            disabled={currentSlide === 0}
            className={`text-white hover:bg-white/20 ${isFullscreen ? 'w-12 h-12' : ''}`}
            title="Restart from beginning (R)"
          >
            <RotateCcw className={`${isFullscreen ? 'w-6 h-6' : 'w-4 h-4'}`} />
          </Button>

          <Button
            variant="ghost"
            size={isFullscreen ? "lg" : "sm"}
            onClick={togglePlay}
            className={`text-white hover:bg-white/20 ${isFullscreen ? 'w-12 h-12' : ''}`}
          >
            {isPlaying ? <Pause className={`${isFullscreen ? 'w-6 h-6' : 'w-4 h-4'}`} /> : <Play className={`${isFullscreen ? 'w-6 h-6' : 'w-4 h-4'}`} />}
          </Button>

          <Button
            variant="ghost"
            size={isFullscreen ? "lg" : "sm"}
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className={`text-white hover:bg-white/20 ${isFullscreen ? 'w-12 h-12' : ''}`}
          >
            <ChevronRight className={`${isFullscreen ? 'w-6 h-6' : 'w-4 h-4'}`} />
          </Button>

          <div className={`w-px bg-white/30 mx-2 ${isFullscreen ? 'h-8 mx-3' : 'h-6'}`} />

          <Button
            variant="ghost"
            size={isFullscreen ? "lg" : "sm"}
            onClick={onClose}
            className={`text-white hover:bg-white/20 ${isFullscreen ? 'w-12 h-12' : ''}`}
          >
            <X className={`${isFullscreen ? 'w-6 h-6' : 'w-4 h-4'}`} />
          </Button>
        </div>
      )}

      {/* Instructions - Only show when not in fullscreen */}
      {!isFullscreen && (
        <div className="absolute top-6 left-6 text-white/70 text-sm">
          <div>Press <kbd className="bg-white/20 px-2 py-1 rounded">Space</kbd> or <kbd className="bg-white/20 px-2 py-1 rounded">→</kbd> for next slide</div>
          <div>Press <kbd className="bg-white/20 px-2 py-1 rounded">←</kbd> for previous slide</div>
          <div>Press <kbd className="bg-white/20 px-2 py-1 rounded">R</kbd> to restart from beginning</div>
          <div>Press <kbd className="bg-white/20 px-2 py-1 rounded">P</kbd> to play/pause</div>
          <div>Press <kbd className="bg-white/20 px-2 py-1 rounded">F</kbd> for fullscreen</div>
          <div>Press <kbd className="bg-white/20 px-2 py-1 rounded">Esc</kbd> to exit</div>
        </div>
      )}
    </div>
  );
};
