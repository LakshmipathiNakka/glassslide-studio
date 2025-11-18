import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Maximize, Minimize, ArrowLeft } from 'lucide-react';
import { Slide } from '@/types/slide-thumbnails';
import { sanitizeSlidesForPresentation } from '@/utils/presentationValidator';
import { ChartJSChart } from './ChartJSChart';
import { TABLE_THEMES } from '@/constants/tableThemes';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SimplePresentationModeProps {
  slides: Slide[];
  currentSlide?: number;
  onClose: () => void;
}

const STORAGE_KEY = 'glassslide-presentation-state';
const AUTO_PLAY_INTERVAL = 5000; // 5 seconds
const TRANSITION_DURATION = 500; // 500ms for smoother transitions
const END_OVERLAY_DELAY = 200; // 200ms delay before showing end overlay
const CONTROLS_HIDE_DELAY = 3000; // 3 seconds before hiding controls

// Animation constants
const OVERLAY_ANIMATION = {
  initial: { opacity: 0, backdropFilter: 'blur(4px)' },
  animate: { 
    opacity: 1, 
    backdropFilter: 'blur(12px)',
    transition: { 
      duration: 0.8, 
      ease: [0.42, 0, 0.58, 1] 
    }
  },
  exit: { 
    opacity: 0, 
    backdropFilter: 'blur(0px)',
    transition: { 
      duration: 0.6, 
      ease: [0.42, 0, 0.58, 1] 
    }
  }
};

const TITLE_ANIMATION = {
  initial: { opacity: 0, y: 12 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { 
      delay: 0.3, 
      duration: 0.8,
      ease: [0.42, 0, 0.58, 1] 
    }
  },
  exit: { 
    opacity: 0, 
    y: -10,
    transition: { 
      duration: 0.3,
      ease: [0.42, 0, 0.58, 1] 
    }
  }
};

const SUBTEXT_ANIMATION = {
  initial: { opacity: 0, y: 8 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { 
      delay: 0.5, 
      duration: 0.7,
      ease: [0.42, 0, 0.58, 1] 
    }
  },
  exit: { 
    opacity: 0, 
    y: -8,
    transition: { 
      duration: 0.2,
      ease: [0.42, 0, 0.58, 1] 
    }
  }
};

const BUTTON_ANIMATION = {
  initial: { opacity: 0, y: 12 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { 
      delay: 0.8, 
      duration: 0.7,
      ease: [0.42, 0, 0.58, 1] 
    }
  },
  hover: {
    scale: 1.03,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
    transition: {
      duration: 0.25,
      ease: [0.42, 0, 0.58, 1]
    }
  },
  tap: {
    scale: 0.97
  },
  exit: { 
    opacity: 0, 
    y: 10,
    transition: { 
      duration: 0.2,
      ease: [0.42, 0, 0.58, 1] 
    }
  }
};

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

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showEndOverlay, setShowEndOverlay] = useState(false);
  const [exitAnimation, setExitAnimation] = useState(false);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const transitionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const endOverlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fullscreenChangeHandlerRef = useRef<(() => void) | null>(null);
  const slideContainerRef = useRef<HTMLDivElement>(null);

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

  // Handle controls auto-hide
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, CONTROLS_HIDE_DELAY);
  }, []);

  // Initialize controls timer and event listeners
  useEffect(() => {
    resetControlsTimer();
    
    const handleMouseMove = () => resetControlsTimer();
    const handleKeyDown = () => resetControlsTimer();
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [resetControlsTimer]);

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
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = null;
      }
    };
  }, []);

  // Navigation functions with transition support
  const nextSlide = useCallback(() => {
    // If showing end overlay, don't do anything on next
    if (showEndOverlay) return;
    
    // Clear any pending transition
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }

    setCurrentSlide(prev => {
      // Check if we're at the last slide
      if (prev >= slides.length - 1) {
        // If we're at the last slide, show end overlay
        if (isPlaying) {
          stopAutoPlay();
        }
        
        // Show end overlay after a short delay
        if (endOverlayTimerRef.current) {
          clearTimeout(endOverlayTimerRef.current);
        }
        endOverlayTimerRef.current = setTimeout(() => {
          setShowEndOverlay(true);
        }, END_OVERLAY_DELAY);
        
        return prev; // Don't change the slide
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
      transitionTimerRef.current = setTimeout(() => {
        setIsTransitioning(false);
        transitionTimerRef.current = null;
      }, TRANSITION_DURATION);
    }
  }, [slides.length, isTransitioning, isPlaying, showEndOverlay]);

  const prevSlide = useCallback(() => {
    // If showing end overlay, hide it and stay on current slide
    if (showEndOverlay) {
      setShowEndOverlay(false);
      return;
    }
    
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
  }, [slides.length, isTransitioning, showEndOverlay]);

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < slides.length && index !== currentSlide && !isTransitioning) {
      // If going to the last slide, don't show end overlay yet
      if (index === slides.length - 1) {
        if (endOverlayTimerRef.current) {
          clearTimeout(endOverlayTimerRef.current);
          endOverlayTimerRef.current = null;
        }
        setShowEndOverlay(false);
      }
      
      setIsTransitioning(true);
      setCurrentSlide(index);
      setTimeout(() => setIsTransitioning(false), TRANSITION_DURATION);
    }
  }, [currentSlide, slides.length, isTransitioning]);

  const restart = useCallback(() => {
    setIsTransitioning(true);
    setCurrentSlide(0);
    setShowEndOverlay(false);
    setIsPlaying(false);
    
    // Clear any pending end overlay timer
    if (endOverlayTimerRef.current) {
      clearTimeout(endOverlayTimerRef.current);
      endOverlayTimerRef.current = null;
    }
    
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
    // Stop auto-play and any pending transitions
    stopAutoPlay();
    setExitAnimation(true);
    
    // Add a small delay to allow exit animation to play
    await new Promise(resolve => setTimeout(resolve, 300));
    
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
    
    // Reset state for next time
    setShowEndOverlay(false);
    setExitAnimation(false);
    
    // Call the onClose callback
    onClose();
  }, [stopAutoPlay, onClose]);

  const baseWidth = 960;
  const baseHeight = 540;
  const scaleFactor = isFullscreen ? 1.5 : 1;
  
  // Handle escape key to exit end overlay
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showEndOverlay) {
        setShowEndOverlay(false);
      }
    };
    
    if (showEndOverlay) {
      window.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showEndOverlay]);

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
        const borderWidth = (element.borderWidth ?? 0) * scale;
        const hasBorder = borderWidth > 0;
        const borderRadius = (element.borderRadius || 0) * scale;
        const borderColor = element.borderColor || '#000000';
        const borderStyle = hasBorder ? (element.borderStyle || 'solid') : 'none';
        const opacity = element.opacity ?? 1;
        
        return (
          <div
            key={element.id}
            className="absolute"
            style={{
              left: element.x * scale,
              top: element.y * scale,
              width: element.width * scale,
              height: element.height * scale,
              borderRadius: `${borderRadius}px`,
              overflow: 'hidden',
              border: hasBorder ? `${borderWidth}px ${borderStyle} ${borderColor}` : 'none',
              boxSizing: 'border-box',
              backgroundColor: 'transparent',
            }}
          >
            <img
              src={element.imageUrl}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
                opacity: opacity,
                borderRadius: hasBorder ? '0' : `${borderRadius}px`,
                pointerEvents: 'none',
                userSelect: 'none',
              }}
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
        const strokeWidth = (element.strokeWidth || 1) * scale;
        const opacity = element.opacity ?? 1;
        const width = element.width * scale;
        const height = element.height * scale;
        const borderRadius = (element.borderRadius || 0) * scale;
        const rotation = element.rotation || 0;
        
        const baseStyle = {
          position: 'absolute' as const,
          left: element.x * scale,
          top: element.y * scale,
          width,
          height,
          opacity,
          transform: rotation ? `rotate(${rotation}deg)` : undefined,
          transformOrigin: 'center center',
          boxSizing: 'border-box' as const,
        };

        // Common shape properties
        const shapeProps = {
          style: {
            ...baseStyle,
            backgroundColor: fill,
            border: `${strokeWidth}px solid ${stroke}`,
          },
          key: element.id,
        };

        switch (element.shapeType) {
          case 'rectangle':
            return (
              <div 
                {...shapeProps}
                style={{
                  ...shapeProps.style,
                  borderRadius: borderRadius,
                }}
              />
            );
            
          case 'rounded-rectangle':
            return (
              <div 
                {...shapeProps}
                style={{
                  ...shapeProps.style,
                  borderRadius: Math.min(width, height) * 0.1, // 10% of the smallest dimension
                }}
              />
            );
            
          case 'circle':
            return (
              <div 
                {...shapeProps}
                style={{
                  ...shapeProps.style,
                  borderRadius: '50%',
                }}
              />
            );
            
          case 'ellipse':
            return (
              <div 
                {...shapeProps}
                style={{
                  ...shapeProps.style,
                  borderRadius: '50%',
                  width: width,
                  height: height,
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
                  border: 'none',
                }}
              />
            );
            
          case 'right-arrow':
            return (
              <div 
                key={element.id}
                style={{
                  ...baseStyle,
                  position: 'relative',
                  width: width,
                  height: height,
                  backgroundColor: 'transparent',
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  right: height / 2,
                  height: height / 4,
                  backgroundColor: fill,
                  transform: 'translateY(-50%)',
                }} />
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: height / 2 * Math.SQRT2,
                  height: '100%',
                  backgroundColor: 'transparent',
                  borderTop: `${height / 2}px solid transparent`,
                  borderBottom: `${height / 2}px solid transparent`,
                  borderLeft: `${height / 2}px solid ${fill}`,
                }} />
              </div>
            );
            
          case 'star':
            // Simple star implementation using unicode character
            return (
              <div 
                key={element.id}
                style={{
                  ...baseStyle,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: Math.min(width, height) * 0.8,
                  lineHeight: 1,
                  color: fill,
                  backgroundColor: 'transparent',
                  border: 'none',
                }}
              >
                ★
              </div>
            );
            
          case 'line':
            const angle = Math.atan2(
              (element.y2 || 0) - element.y,
              (element.x2 || element.width) - (element.x || 0)
            ) * (180 / Math.PI);
            
            const lineLength = Math.sqrt(
              Math.pow(((element.x2 || element.width) - (element.x || 0)) * scale, 2) +
              Math.pow(((element.y2 || 0) - element.y) * scale, 2)
            );
            
            return (
              <div 
                key={element.id}
                style={{
                  position: 'absolute',
                  left: element.x * scale,
                  top: element.y * scale,
                  width: lineLength,
                  height: strokeWidth,
                  backgroundColor: stroke,
                  transformOrigin: '0 0',
                  transform: `rotate(${angle}deg)`,
                  opacity,
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
            
          case 'pentagon':
            return (
              <div 
                key={element.id}
                style={{
                  ...baseStyle,
                  width: `${width}px`,
                  height: `${height}px`,
                  background: fill,
                  position: 'absolute',
                  clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
                  border: `${strokeWidth}px solid ${stroke}`,
                  boxSizing: 'border-box',
                }}
              />
            );
            
          case 'hexagon':
            // Use SVG polygon so presentation mode matches editor/thumbnail geometry exactly
            return (
              <svg
                key={element.id}
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                style={{
                  position: 'absolute',
                  left: element.x * scale,
                  top: element.y * scale,
                  width,
                  height,
                  opacity,
                  transform: rotation ? `rotate(${rotation}deg)` : undefined,
                  transformOrigin: 'center center',
                  overflow: 'visible',
                }}
              >
                <polygon
                  points="25,0 75,0 100,50 75,100 25,100 0,50"
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                />
              </svg>
            );
            
          case 'octagon':
            return (
              <div 
                key={element.id}
                style={{
                  ...baseStyle,
                  width: width,
                  height: height,
                  background: fill,
                  position: 'relative',
                  border: `${strokeWidth}px solid ${stroke}`,
                  clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
                  boxSizing: 'border-box',
                }}
              />
            );
            
          case 'parallelogram':
            return (
              <div 
                key={element.id}
                style={{
                  ...baseStyle,
                  width: width,
                  height: height,
                  background: fill,
                  position: 'relative',
                  border: `${strokeWidth}px solid ${stroke}`,
                  transform: 'skew(-20deg)',
                  boxSizing: 'border-box',
                }}
              />
            );
            
          case 'trapezoid':
            return (
              <div 
                key={element.id}
                style={{
                  ...baseStyle,
                  width: width,
                  height: height,
                  background: fill,
                  position: 'relative',
                  border: `${strokeWidth}px solid ${stroke}`,
                  clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
                  boxSizing: 'border-box',
                }}
              />
            );
            
          case 'semicircle':
            return (
              <div 
                key={element.id}
                style={{
                  ...baseStyle,
                  width: width,
                  height: height / 2,
                  background: fill,
                  position: 'relative',
                  border: `${strokeWidth}px solid ${stroke}`,
                  borderBottom: 'none',
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                  borderTopLeftRadius: '50%',
                  borderTopRightRadius: '50%',
                  boxSizing: 'border-box',
                }}
              />
            );
            
          case 'right-triangle':
            return (
              <div 
                key={element.id}
                style={{
                  ...baseStyle,
                  width: 0,
                  height: 0,
                  borderLeft: `${width}px solid transparent`,
                  borderBottom: `${height}px solid ${fill}`,
                  position: 'relative',
                  background: 'transparent',
                  border: 'none',
                }}
              >
                <div 
                  style={{
                    position: 'absolute',
                    width: 0,
                    height: 0,
                    borderLeft: `${width - strokeWidth * 2}px solid transparent`,
                    borderBottom: `${height - strokeWidth * 2}px solid ${fill}`,
                    top: strokeWidth,
                    left: -width + strokeWidth,
                  }}
                />
              </div>
            );
            
          case 'lightning':
            return null;
            
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
    <motion.div 
      className="fixed inset-0 bg-black z-50 flex flex-col overflow-hidden"
      role="region"
      aria-label="Presentation Mode"
      aria-live="polite"
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: exitAnimation ? 0 : 1,
        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
      }}
      exit={{ opacity: 0 }}
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
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={safeCurrentSlide}
            ref={slideContainerRef}
            className="relative"
            style={{
              width: baseWidth * scaleFactor,
              height: baseHeight * scaleFactor,
              maxWidth: '100%',
              maxHeight: '100%',
              ...(slide?.background?.startsWith('linear-gradient') 
                ? { background: slide.background }
                : { backgroundColor: slide?.background || '#ffffff' }),
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              boxShadow: '0 10px 50px rgba(0,0,0,0.5)',
              opacity: isTransitioning ? 0.7 : 1,
            }}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              transition: { 
                duration: TRANSITION_DURATION / 1000,
                ease: [0.42, 0, 0.58, 1] 
              }
            }}
            exit={{ 
              opacity: 0, 
              scale: 1.02,
              transition: { 
                duration: TRANSITION_DURATION / 1000,
                ease: [0.42, 0, 0.58, 1] 
              }
            }}
            role="img"
            aria-label={`Slide ${safeCurrentSlide + 1}`}
          >
            {slide?.elements?.map((element) => renderElement(element))}
            
            {/* White flash effect during transition */}
            {isTransitioning && (
              <motion.div 
                className="absolute inset-0 bg-white"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: [0, 0.7, 0],
                  transition: { 
                    duration: TRANSITION_DURATION / 1000,
                    times: [0, 0.3, 1],
                    ease: 'easeInOut'
                  }
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
        
        {/* End of presentation overlay - Keynote Style */}
        <AnimatePresence>
          {showEndOverlay && (
            <motion.div 
              className="absolute inset-0 flex items-center justify-center z-20"
              style={{
                background: 'radial-gradient(circle at center, rgba(255,255,255,1), rgba(250,250,250,0.8))',
              }}
              initial={OVERLAY_ANIMATION.initial}
              animate={OVERLAY_ANIMATION.animate}
              exit={OVERLAY_ANIMATION.exit}
              onClick={() => setShowEndOverlay(false)}
            >
              <div className="text-center p-8 max-w-2xl">
                <motion.h1 
                  className="font-semibold text-gray-900 mb-4"
                  style={{
                    fontSize: 'clamp(28px, 5vw, 42px)',
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    lineHeight: 1.2,
                    letterSpacing: '-0.01em',
                  }}
                  {...TITLE_ANIMATION}
                >
                  End of Presentation
                </motion.h1>
                
                <motion.p 
                  className="text-gray-600 mb-8"
                  style={{
                    fontSize: 'clamp(14px, 2vw, 18px)',
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    fontWeight: 400,
                    maxWidth: '36rem',
                    margin: '0 auto',
                    lineHeight: 1.5,
                  }}
                  {...SUBTEXT_ANIMATION}
                >
                  Press ESC to exit or use the arrow keys to navigate
                </motion.p>
                
                <motion.div
                  className="mt-8"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: { 
                      delay: 0.8,
                      duration: 0.7,
                      ease: [0.42, 0, 0.58, 1] 
                    }
                  }}
                  exit={{ 
                    opacity: 0,
                    y: 10,
                    transition: { 
                      duration: 0.2,
                      ease: [0.42, 0, 0.58, 1] 
                    }
                  }}
                >
                  <motion.button
                    className="flex items-center justify-center mx-auto px-8 py-4 rounded-xl text-base font-medium transition-all duration-300"
                    style={{
                      background: 'rgba(255, 255, 255, 0.5)',
                      border: '1px solid rgba(0, 0, 0, 0.05)',
                      backdropFilter: 'blur(6px)',
                      color: '#000',
                    }}
                    whileHover={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
                      transform: 'translateY(-2px)',
                    }}
                    whileTap={{
                      scale: 0.97,
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Go to first slide
                      goToSlide(0);
                      // Pause the presentation
                      if (isPlaying) {
                        togglePlayPause();
                      }
                      // Hide the end overlay
                      setShowEndOverlay(false);
                    }}
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Presentation
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Comprehensive control panel */}
      <AnimatePresence>
        {!showEndOverlay && showControls && (
          <motion.div 
            className="fixed bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-50"
            initial={{ opacity: 0, y: 30 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              transition: { 
                duration: 0.6, 
                ease: [0.42, 0, 0.58, 1] 
              }
            }}
            exit={{ 
              opacity: 0, 
              y: 20,
              transition: { 
                duration: 0.3, 
                ease: [0.42, 0, 0.58, 1] 
              }
            }}
            onMouseEnter={resetControlsTimer}
          >
            <div className="flex items-center gap-2 sm:gap-3 px-4 py-2 sm:px-6 sm:py-3 bg-white/25 backdrop-blur-xl rounded-2xl border border-white/40 shadow-lg -translate-x-1">
              {/* Slide counter */}
              <div className="hidden sm:flex items-center justify-center text-sm font-medium text-gray-800 bg-white/50 rounded-full px-3 h-8">
                {safeCurrentSlide + 1} / {slides.length}
              </div>
              
              <div className="w-px h-6 bg-white/40" aria-hidden="true" />

              {/* Previous slide */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevSlide();
                }}
                disabled={safeCurrentSlide === 0 || isTransitioning}
                className={`control-btn ${safeCurrentSlide === 0 || isTransitioning ? 'opacity-40' : 'hover:bg-white/80'}`}
                aria-label="Previous slide"
                title="Previous (←)"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Play/Pause button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isLastSlide) togglePlayPause();
                }}
                disabled={isLastSlide}
                className={`control-btn ${isLastSlide ? 'opacity-40' : 'hover:bg-white/80'}`}
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
              </button>

              {/* Next slide */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextSlide();
                }}
                disabled={safeCurrentSlide === slides.length - 1 || isTransitioning}
                className={`control-btn ${safeCurrentSlide === slides.length - 1 || isTransitioning ? 'opacity-40' : 'hover:bg-white/80'}`}
                aria-label="Next slide"
                title="Next (→ or Space)"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <div className="w-px h-6 bg-white/40" aria-hidden="true" />

              {/* Restart button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  restart();
                }}
                className="control-btn hover:bg-white/80"
                aria-label="Restart presentation"
                title="Restart (R)"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              {/* Fullscreen toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullscreen();
                }}
                className="control-btn hover:bg-white/80"
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                title={isFullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5" />
                ) : (
                  <Maximize className="w-5 h-5" />
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating slide counter (only visible when controls are hidden) */}
      <AnimatePresence>
        {!showEndOverlay && !showControls && (
          <motion.div 
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 0.7, 
              y: 0,
              transition: { 
                duration: 0.3, 
                ease: [0.42, 0, 0.58, 1] 
              }
            }}
            exit={{ 
              opacity: 0, 
              y: 10,
              transition: { 
                duration: 0.2, 
                ease: [0.42, 0, 0.58, 1] 
              }
            }}
            onMouseEnter={resetControlsTimer}
          >
            <div className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/20 text-white text-sm font-medium">
              {safeCurrentSlide + 1} / {slides.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
