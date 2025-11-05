import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Maximize, Minimize } from 'lucide-react';
import { Slide } from '@/types/slide-thumbnails';
import { sanitizeSlidesForPresentation } from '@/utils/presentationValidator';
import { ChartJSChart } from './ChartJSChart';
import { TABLE_THEMES } from '@/constants/tableThemes';

interface SimplePresentationModeProps {
  slides: Slide[];
  currentSlide?: number;
  onClose: () => void;
}

const STORAGE_KEY = 'glassslide-presentation-state';
const AUTO_PLAY_INTERVAL = 5000; // 5 seconds
const TRANSITION_DURATION = 300; // 300ms

export const SimplePresentationMode = ({ 
  slides: rawSlides, 
  currentSlide: initialSlide = 0, 
  onClose 
}: SimplePresentationModeProps) => {
  // Sanitize slides on mount
  const slides = useMemo(() => {
    console.log('[SimplePresentationMode] Sanitizing slides:', rawSlides.length);
    return sanitizeSlidesForPresentation(rawSlides);
  }, [rawSlides]);

  const [currentSlide, setCurrentSlide] = useState(0); // Always start from first slide
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const transitionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fullscreenChangeHandlerRef = useRef<(() => void) | null>(null);

  // Initialize presentation - always start at slide 0 and clear any stale state
  useEffect(() => {
    console.log('[SimplePresentationMode] Initializing presentation with', slides.length, 'slides');
    setCurrentSlide(0);
    setIsPlaying(false);
    
    // Clear any stale localStorage state from previous sessions
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear stale presentation state:', e);
    }
  }, []); // Run once on mount

  // Save state to localStorage
  const saveState = useCallback(() => {
    try {
      const state = {
        currentSlide,
        isPlaying,
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save presentation state:', e);
    }
  }, [currentSlide, isPlaying]);

  // Save state whenever it changes
  useEffect(() => {
    saveState();
  }, [saveState]);

  // Clean up all timers on unmount
  useEffect(() => {
    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
        transitionTimerRef.current = null;
      }
    };
  }, []);

  // Navigation functions with transition support
  const nextSlide = useCallback(() => {
    // Clear any pending transition
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }

    setCurrentSlide(prev => {
      // Ensure we never go beyond the last slide
      if (prev >= slides.length - 1) {
        // If we're at the last slide, stop auto-play
        if (isPlaying) {
          console.log('[SimplePresentationMode] Reached last slide, stopping auto-play');
          stopAutoPlay();
        }
        console.log('[SimplePresentationMode] Already at last slide');
        return prev;
      }
      // Move to next slide
      const nextIndex = prev + 1;
      console.log('[SimplePresentationMode] Moving to slide', nextIndex + 1, 'of', slides.length);
      
      // If we're about to go to the last slide and auto-play is active, stop it
      if (nextIndex === slides.length - 1 && isPlaying) {
        console.log('[SimplePresentationMode] Moving to last slide, stopping auto-play');
        stopAutoPlay();
      }
      
      return nextIndex;
    });
    
    if (!isTransitioning) {
      setIsTransitioning(true);
      // Store the timer reference so we can clear it if needed
      transitionTimerRef.current = setTimeout(() => {
        setIsTransitioning(false);
        transitionTimerRef.current = null;
      }, TRANSITION_DURATION);
    }
  }, [slides.length, isTransitioning, isPlaying]);

  const prevSlide = useCallback(() => {
    setCurrentSlide(prev => {
      // Ensure we never go below 0
      if (prev <= 0) {
        console.log('[SimplePresentationMode] Already at first slide');
        return 0;
      }
      // Move to previous slide
      const prevIndex = prev - 1;
      console.log('[SimplePresentationMode] Moving to slide', prevIndex + 1, 'of', slides.length);
      return prevIndex;
    });
    
    if (!isTransitioning) {
      setIsTransitioning(true);
      setTimeout(() => setIsTransitioning(false), TRANSITION_DURATION);
    }
  }, [slides.length, isTransitioning]);

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < slides.length && index !== currentSlide && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentSlide(index);
      setTimeout(() => setIsTransitioning(false), TRANSITION_DURATION);
    }
  }, [currentSlide, slides.length, isTransitioning]);

  const restart = useCallback(() => {
    setIsTransitioning(true);
    setCurrentSlide(0);
    setIsPlaying(false);
    setTimeout(() => setIsTransitioning(false), TRANSITION_DURATION);
  }, []);

  // Auto-play functionality
  const startAutoPlay = useCallback(() => {
    // Don't start auto-play if we're already at the last slide
    if (currentSlide >= slides.length - 1) {
      console.log('[SimplePresentationMode] Already at last slide, not starting auto-play');
      setIsPlaying(false);
      return;
    }
    
    console.log('[SimplePresentationMode] Starting auto-play');
    setIsPlaying(true);
    
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
    }
    
    autoPlayTimerRef.current = setInterval(() => {
      nextSlide();
    }, AUTO_PLAY_INTERVAL);
  }, [nextSlide, currentSlide, slides.length]);

  const stopAutoPlay = useCallback(() => {
    console.log('[SimplePresentationMode] Stopping auto-play');
    setIsPlaying(false);
    
    // Clear the auto-play interval
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
    
    // Clear any pending transition
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
      setIsTransitioning(false);
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      console.log('[SimplePresentationMode] Pausing presentation');
      stopAutoPlay();
    } else if (currentSlide < slides.length - 1) {
      console.log('[SimplePresentationMode] Starting presentation');
      startAutoPlay();
    } else {
      console.log('[SimplePresentationMode] Already at last slide, cannot start auto-play');
    }
  }, [isPlaying, startAutoPlay, stopAutoPlay]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
    };
  }, []);

  // Disable play button if on last slide
  const isLastSlide = currentSlide >= slides.length - 1;

  // Restart auto-play when it's enabled
  useEffect(() => {
    if (isPlaying && !autoPlayTimerRef.current) {
      startAutoPlay();
    }
  }, [isPlaying, startAutoPlay]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          if (isPlaying) {
            stopAutoPlay(); // Pause when manually navigating
          }
          nextSlide();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (isPlaying) {
            stopAutoPlay();
          }
          prevSlide();
          break;
        case 'Escape':
          e.preventDefault();
          handleExit();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          restart();
          break;
        case 'Home':
          e.preventDefault();
          goToSlide(0);
          break;
        case 'End':
          e.preventDefault();
          goToSlide(slides.length - 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, slides.length, isPlaying, nextSlide, prevSlide, togglePlayPause, restart, goToSlide, stopAutoPlay]);

  // Fullscreen management
  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
      } catch (e) {
        console.warn('Fullscreen not available:', e);
      }
    } else {
      try {
        await document.exitFullscreen();
      } catch (e) {
        console.warn('Failed to exit fullscreen:', e);
      }
    }
  }, []);

  // Monitor fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    fullscreenChangeHandlerRef.current = handleFullscreenChange;

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const handleExit = useCallback(async () => {
    // Stop auto-play
    stopAutoPlay();
    
    // Exit fullscreen first if needed
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch (e) {
        console.warn('Failed to exit fullscreen:', e);
      }
    }
    
    // Clear localStorage state
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear presentation state:', e);
    }
    
    onClose();
  }, [stopAutoPlay, onClose]);

  const baseWidth = 960;
  const baseHeight = 540;
  const scaleFactor = isFullscreen ? 1.5 : 1;

  const renderElement = (element: any) => {
    const scale = scaleFactor;

    switch (element.type) {
      case 'text':
        const hasContent = element.content || element.text;
        if (!hasContent) return null;
        
        return (
          <div
            key={element.id}
            className="absolute"
            style={{
              left: element.x * scale,
              top: element.y * scale,
              width: element.width * scale,
              height: element.height * scale,
              fontSize: (element.fontSize || 16) * scale,
              color: element.color || '#000000',
              fontFamily: element.fontFamily || 'Arial',
              fontWeight: element.fontWeight || 'normal',
              fontStyle: element.fontStyle || 'normal',
              textAlign: (element.textAlign || 'left') as any,
              display: 'flex',
              alignItems: 'center',
              justifyContent: element.textAlign === 'center' ? 'center' : element.textAlign === 'right' ? 'flex-end' : 'flex-start',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
            dangerouslySetInnerHTML={{ __html: element.content || element.text }}
          />
        );

      case 'image':
        if (!element.imageUrl) return null;
        return (
          <div
            key={element.id}
            className="absolute"
            style={{
              left: element.x * scale,
              top: element.y * scale,
              width: element.width * scale,
              height: element.height * scale,
            }}
          >
            <img
              src={element.imageUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        );

      case 'chart':
        console.log('[SimplePresentationMode] Rendering chart:', {
          id: element.id,
          type: element.chartType,
          hasData: !!element.chartData,
        });
        
        return (
          <div
            key={element.id}
            className="absolute"
            style={{
              left: element.x * scale,
              top: element.y * scale,
              width: element.width * scale,
              height: element.height * scale,
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

      case 'shape': {
        const fill = element.fill || 'transparent';
        const stroke = element.stroke || '#000000';
        const strokeWidth = (element.strokeWidth || 0.5) * scale;
        const opacity = element.opacity || 1;
        const width = element.width * scale;
        const height = element.height * scale;
        
        const baseStyle = {
          position: 'absolute' as const,
          left: element.x * scale,
          top: element.y * scale,
          width,
          height,
          opacity,
        };

        switch (element.shapeType) {
          case 'rectangle':
            return (
              <div 
                key={element.id}
                style={{
                  ...baseStyle,
                  backgroundColor: fill,
                  border: `${strokeWidth}px solid ${stroke}`,
                  borderRadius: 0,
                }}
              />
            );
            
          case 'rounded-rectangle':
            return (
              <div 
                key={element.id}
                style={{
                  ...baseStyle,
                  backgroundColor: fill,
                  border: `${strokeWidth}px solid ${stroke}`,
                  borderRadius: 8,
                }}
              />
            );
            
          case 'circle':
            return (
              <div 
                key={element.id}
                style={{
                  ...baseStyle,
                  backgroundColor: fill,
                  border: `${strokeWidth}px solid ${stroke}`,
                  borderRadius: '50%',
                }}
              />
            );
            
          case 'triangle':
            return (
              <div 
                key={element.id}
                style={{
                  ...baseStyle,
                  width: 0,
                  height: 0,
                  borderLeft: `${width / 2}px solid transparent`,
                  borderRight: `${width / 2}px solid transparent`,
                  borderBottom: `${height}px solid ${fill}`,
                  backgroundColor: 'transparent',
                  position: 'absolute',
                }}
              />
            );
            
          case 'diamond':
            return (
              <div 
                key={element.id}
                style={{
                  ...baseStyle,
                  backgroundColor: fill,
                  border: `${strokeWidth}px solid ${stroke}`,
                  transform: 'rotate(45deg)',
                  width: width * 0.7,
                  height: width * 0.7,
                  left: element.x * scale + (width - width * 0.7) / 2,
                  top: element.y * scale + (height - width * 0.7) / 2,
                }}
              />
            );
            
          default:
            return (
              <div 
                key={element.id}
                style={{
                  ...baseStyle,
                  backgroundColor: fill,
                  border: `${strokeWidth}px solid ${stroke}`,
                  borderRadius: element.borderRadius || 0,
                }}
              />
            );
        }
      }

      case 'table': {
        const rows = Math.max(1, element.rows || 3);
        const cols = Math.max(1, element.cols || 3);
        const tableData: string[][] = Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => (element.tableData?.[r]?.[c] ?? ''))
        );

        // Get theme if exists
        const theme = TABLE_THEMES.find(t => t.id === element.themeId) || {} as any;
        
        // Use theme colors with fallbacks
        const borderColor = theme.borderColor || element.borderColor || '#D9D9D9';
        const borderWidth = (element.borderWidth ?? 1);
        const borderStyle = (element as any).borderStyle || 'solid';
        const textAlign = element.cellTextAlign || 'left';
        const header = (element as any).header ?? false;
        
        // Theme colors with fallbacks
        const headerBg = theme.headerBg || (element as any).headerBg || '#E7E6E6';
        const headerTextColor = theme.headerTextColor || (element as any).headerTextColor || '#111827';
        const rowEvenBg = theme.rowEvenBg || element.backgroundColor || '#FFFFFF';
        const rowOddBg = theme.rowOddBg || (element as any).rowAltBg || 'transparent';
        const textColor = theme.textColor || element.color || '#000000';
        const cellPadding = element.cellPadding ?? 8;

        return (
          <div
            key={element.id}
            className="absolute overflow-hidden"
            style={{
              left: element.x * scale,
              top: element.y * scale,
              width: element.width * scale,
              height: element.height * scale,
              boxShadow: (element as any).shadow ? `0 8px ${(element as any).shadowBlur ?? 20}px rgba(0,0,0,0.15)` : 'none',
              opacity: (element as any).opacity ?? 1,
            }}
          >
            <div style={{ 
              width: '100%', 
              height: '100%', 
              display: 'grid', 
              gridTemplateColumns: `repeat(${cols}, 1fr)`, 
              gridTemplateRows: `repeat(${rows}, 1fr)`, 
              boxSizing: 'border-box', 
              border: borderStyle === 'none' || borderWidth === 0 ? 'none' : `${borderWidth}px ${borderStyle} ${borderColor}` 
            }}>
              {tableData.map((row, r) => 
                row.map((cell, c) => (
                  <div
                    key={`${r}-${c}`}
                    style={{
                      borderRight: borderStyle === 'none' || borderWidth === 0 ? 'none' : `${borderWidth}px ${borderStyle} ${borderColor}`,
                      borderBottom: borderStyle === 'none' || borderWidth === 0 ? 'none' : `${borderWidth}px ${borderStyle} ${borderColor}`,
                      padding: cellPadding, 
                      overflow: 'hidden', 
                      textAlign: textAlign as any,
                      background: header && r === 0 ? headerBg : ((header ? r-1 : r) % 2 === 0 ? rowEvenBg : rowOddBg),
                      color: header && r === 0 ? headerTextColor : textColor,
                      fontWeight: header && r === 0 ? 600 : (element.fontWeight || 'normal'),
                      fontFamily: element.fontFamily || 'system-ui, -apple-system, sans-serif',
                      fontSize: (element.fontSize || 14) * scale,
                    }}
                    dangerouslySetInnerHTML={{ __html: cell }}
                  />
                ))
              )}
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  if (!slides || slides.length === 0) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl mb-4">No slides to present</p>
          <Button onClick={onClose} variant="outline">
            Exit
          </Button>
        </div>
      </div>
    );
  }

  // Safety check: Ensure currentSlide is within valid bounds
  const safeCurrentSlide = Math.max(0, Math.min(currentSlide, slides.length - 1));
  
  // If currentSlide is out of bounds, correct it
  if (safeCurrentSlide !== currentSlide) {
    console.warn('[SimplePresentationMode] Current slide out of bounds, correcting:', currentSlide, '->', safeCurrentSlide);
    setCurrentSlide(safeCurrentSlide);
  }

  const slide = slides[safeCurrentSlide];

  return (
    <div 
      className="fixed inset-0 bg-black z-50 flex flex-col"
      role="region"
      aria-label="Presentation Mode"
      aria-live="polite"
    >
      {/* Header with controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <div 
          className="text-white text-sm px-4 py-2 bg-black/70 backdrop-blur-sm rounded-lg border border-white/10"
          aria-live="polite"
          aria-atomic="true"
        >
          Slide {safeCurrentSlide + 1} of {slides.length}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleExit}
          className="text-white hover:bg-white/20 bg-black/70 backdrop-blur-sm border border-white/10"
          aria-label="Exit presentation"
          title="Exit (ESC)"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Auto-play indicator */}
      {isPlaying && (
        <div className="absolute top-4 left-4 z-10">
          <div className="flex items-center gap-2 px-3 py-2 bg-green-600/90 backdrop-blur-sm rounded-lg border border-white/10 animate-pulse">
            <Play className="w-3 h-3 text-white fill-current" />
            <span className="text-white text-xs font-medium">Auto-playing</span>
          </div>
        </div>
      )}

      {/* Main slide content with transition */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div
          className="relative transition-opacity duration-300"
          style={{
            width: baseWidth * scaleFactor,
            height: baseHeight * scaleFactor,
            maxWidth: '100%',
            maxHeight: '100%',
            backgroundColor: slide?.background || '#ffffff',
            boxShadow: '0 10px 50px rgba(0,0,0,0.5)',
            opacity: isTransitioning ? 0.5 : 1,
          }}
          role="img"
          aria-label={`Slide ${safeCurrentSlide + 1}`}
        >
          {slide?.elements?.map((element) => renderElement(element))}
        </div>
      </div>

      {/* Comprehensive control panel */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex items-center gap-3 px-6 py-3 bg-black/70 backdrop-blur-sm rounded-full border border-white/10 shadow-2xl">
          {/* Restart button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={restart}
            className="text-white hover:bg-white/20 rounded-full"
            aria-label="Restart presentation"
            title="Restart (R)"
            disabled={isTransitioning}
          >
            <RotateCcw className="w-5 h-5" />
          </Button>

          <div className="w-px h-6 bg-white/20" aria-hidden="true" />

          {/* Previous slide */}
          <Button
            variant="ghost"
            size="icon"
            onClick={prevSlide}
            disabled={safeCurrentSlide === 0 || isTransitioning}
            className="text-white hover:bg-white/20 rounded-full disabled:opacity-30"
            aria-label="Previous slide"
            title="Previous (←)"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          {/* Play/Pause button */}
          <Button
            variant="ghost"
            size="icon"
            className={`text-white hover:bg-white/20 rounded-full ${isLastSlide ? 'opacity-50 cursor-not-allowed' : 'bg-white/10'}`}
            onClick={() => !isLastSlide && togglePlayPause()}
            disabled={isLastSlide}
            aria-label={isLastSlide ? 'End of presentation' : (isPlaying ? 'Pause slideshow' : 'Play slideshow')}
            title={isLastSlide ? 'End of presentation' : (isPlaying ? 'Pause (P)' : 'Play (P)')}
          >
            {isLastSlide ? (
              <Play className="w-5 h-5 opacity-70" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </Button>

          {/* Next slide */}
          <Button
            variant="ghost"
            size="icon"
            onClick={nextSlide}
            disabled={safeCurrentSlide === slides.length - 1 || isTransitioning}
            className="text-white hover:bg-white/20 rounded-full disabled:opacity-30"
            aria-label="Next slide"
            title="Next (→ or Space)"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>

          <div className="w-px h-6 bg-white/20" aria-hidden="true" />

          {/* Fullscreen toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="text-white hover:bg-white/20 rounded-full"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            title={isFullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}
          >
            {isFullscreen ? (
              <Minimize className="w-5 h-5" />
            ) : (
              <Maximize className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Keyboard shortcuts hint (only visible when not in fullscreen) */}
      {!isFullscreen && (
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-10">
          <div className="px-4 py-2 bg-black/50 backdrop-blur-sm rounded-lg border border-white/10 text-white text-xs text-center">
            <div className="flex items-center gap-4">
              <span>← → Arrow keys</span>
              <span>•</span>
              <span>P Play/Pause</span>
              <span>•</span>
              <span>R Restart</span>
              <span>•</span>
              <span>F Fullscreen</span>
              <span>•</span>
              <span>ESC Exit</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
