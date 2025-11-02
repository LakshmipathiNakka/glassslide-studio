import React, { useEffect, useCallback, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SlideRenderer from '@/components/shared/SlideRenderer';
import { usePresentationStore } from '@/hooks/usePresentationStore';
import { PresentationDeck, PresentationSlide } from '@/types/presentation';
import { animationEngine } from '@/utils/AnimationEngine';
import { useHotkeys } from 'react-hotkeys-hook';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Square, 
  Maximize, 
  Minimize,
  RotateCcw,
  Eye,
  EyeOff,
  Settings,
  ArrowLeft
} from 'lucide-react';

/**
 * PresentationMode - Main presentation interface component
 * 
 * Features:
 * - Full-screen presentation with slide transitions
 * - Keyboard navigation (PowerPoint-style shortcuts)
 * - Mouse/touch navigation
 * - Presenter view with dual-screen support
 * - On-screen controls (optional/minimal)
 * - Responsive design for different display sizes
 * - Accessibility support
 * - Resume from last viewed slide
 */

interface PresentationModeProps {
  // Optional props for embedding in other components
  embedded?: boolean;
  deck?: PresentationDeck;
  onExit?: () => void;
}

const PresentationMode: React.FC<PresentationModeProps> = ({ 
  embedded = false, 
  deck: propDeck, 
  onExit 
}) => {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const slideContainerRef = useRef<HTMLDivElement>(null);
  
  // UI state
  const [showControls, setShowControls] = useState(false);
  const [controlsTimeout, setControlsTimeout] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slideScale, setSlideScale] = useState(1);
  const [isBlackout, setIsBlackout] = useState(false);

  // Presentation store
  const {
    deck,
    currentSlideIndex,
    currentAnimationIndex,
    isPlaying,
    isPaused,
    isFullscreen,
    accessibilityOptions,
    nextSlide,
    previousSlide,
    goToSlide,
    play,
    pause,
    stop,
    enterFullscreen,
    exitFullscreen,
    loadDeck,
    unloadDeck,
    saveSession,
    loadSession,
    handleUserInteraction,
    addError
  } = usePresentationStore();

  // Load deck on mount
  useEffect(() => {
    const loadPresentationDeck = async () => {
      try {
        setIsLoading(true);
        
        if (propDeck) {
          // Use provided deck (for embedded mode)
          await loadDeck(propDeck);
        } else if (deckId) {
          // Try loading deck from localStorage (exported by Editor)
          const raw = localStorage.getItem(`glassslide-deck-${deckId}`);
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              // Convert editor slides to presentation slides
              const presentationSlides = (parsed.slides || []).map((s: any) => ({
                id: s.id || `${Date.now()}`,
                elements: s.elements || [],
                background: s.background || '#ffffff',
                createdAt: s.createdAt ? new Date(s.createdAt) : new Date(),
                lastUpdated: s.lastUpdated,
                title: s.title,
                notes: s.notes,
                animations: [],
                transition: { type: 'fade', duration: 500, easing: 'ease-in-out' },
              }));

              const deckFromStorage: PresentationDeck = {
                id: parsed.id || deckId,
                title: parsed.title || `Presentation ${deckId}`,
                slides: presentationSlides,
                theme: parsed.theme || 'default',
                aspectRatio: '16:9',
                createdAt: parsed.createdAt ? new Date(parsed.createdAt) : new Date(),
                lastUpdated: parsed.lastUpdated ? new Date(parsed.lastUpdated) : new Date(),
                settings: {
                  autoAdvance: false,
                  loopPresentation: false,
                  showSlideNumbers: true,
                  showProgressBar: true,
                  mouseClickAdvances: true,
                  presenterMode: false,
                  fullScreen: true,
                  kioskMode: false,
                },
              };

              await loadDeck(deckFromStorage);
            } catch (e) {
              console.error('Failed to parse deck from storage, falling back:', e);
              await loadDeck({
                id: deckId,
                title: `Presentation ${deckId}`,
                slides: [],
                theme: 'default',
                aspectRatio: '16:9',
                createdAt: new Date(),
                lastUpdated: new Date(),
                settings: {
                  autoAdvance: false,
                  loopPresentation: false,
                  showSlideNumbers: true,
                  showProgressBar: true,
                  mouseClickAdvances: true,
                  presenterMode: false,
                  fullScreen: true,
                  kioskMode: false,
                },
              });
            }
          } else {
            // No saved deck, load empty deck
            await loadDeck({
              id: deckId,
              title: `Presentation ${deckId}`,
              slides: [],
              theme: 'default',
              aspectRatio: '16:9',
              createdAt: new Date(),
              lastUpdated: new Date(),
              settings: {
                autoAdvance: false,
                loopPresentation: false,
                showSlideNumbers: true,
                showProgressBar: true,
                mouseClickAdvances: true,
                presenterMode: false,
                fullScreen: true,
                kioskMode: false,
              },
            });
          }
        }
        
        // Load saved session (but always start from first slide for Present flow)
        loadSession();
        try { await goToSlide(0); } catch (_) {}
        play();
        
        setIsLoading(false);

        // Auto-enter fullscreen if configured
        try {
          if (getComputedStyle(document.documentElement).getPropertyValue('--fs-autostart') || (deckFromStorage?.settings?.fullScreen || (propDeck?.settings as any)?.fullScreen)) {
            // Best-effort: may be blocked if not user gesture, but Editor also requests fullscreen before navigate
            if (!document.fullscreenElement) {
              enterFullscreen();
            }
          }
        } catch (_) {}
      } catch (err) {
        console.error('Failed to load presentation deck:', err);
        setError('Failed to load presentation');
        setIsLoading(false);
        
        addError({
          code: 'DECK_LOAD_ERROR',
          message: 'Failed to load presentation deck',
          severity: 'critical',
          recoverable: true,
        });
      }
    };

    loadPresentationDeck();

    return () => {
      // Cleanup on unmount
      saveSession();
      unloadDeck();
    };
  }, [deckId, propDeck, loadDeck, unloadDeck, loadSession, saveSession, addError]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      // Update store state to match actual fullscreen status
      if (!document.fullscreenElement && isFullscreen) {
        exitFullscreen();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isFullscreen, exitFullscreen]);

  // Calculate slide scaling for responsive design
  useEffect(() => {
    const calculateScale = () => {
      if (!slideContainerRef.current) return;

      const container = slideContainerRef.current;
      const containerRect = container.getBoundingClientRect();
      
      // Standard slide dimensions (16:9 aspect ratio)
      const slideWidth = 1280;
      const slideHeight = 720;
      
      // Calculate scale to fit container edge-to-edge (black bars if needed)
      const scaleX = (containerRect.width) / slideWidth;
      const scaleY = (containerRect.height) / slideHeight;
      
      const newScale = Math.min(scaleX, scaleY);
      setSlideScale(newScale);
    };

    // Calculate initial scale
    calculateScale();

    // Recalculate on resize
    const resizeObserver = new ResizeObserver(calculateScale);
    if (slideContainerRef.current) {
      resizeObserver.observe(slideContainerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // Auto-advance every 5 seconds while playing
  useEffect(() => {
    if (!isPlaying || !deck || deck.slides.length === 0) return;
    const id = window.setInterval(() => {
      handleUserInteraction({ type: 'next' });
    }, 5000);
    return () => window.clearInterval(id);
  }, [isPlaying, deck?.id, currentSlideIndex, handleUserInteraction]);

  // Mouse movement handler for showing/hiding controls
  const handleMouseMove = useCallback(() => {
    if (embedded) return;

    setShowControls(true);
    
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    
    const timeout = window.setTimeout(() => {
      setShowControls(false);
    }, 2000);
    
    setControlsTimeout(timeout);
  }, [embedded, controlsTimeout]);

  // Touch/swipe handlers
  const handleTouchStart = useRef<{ x: number; y: number; time: number } | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (!deck?.settings.mouseClickAdvances) return;
    
    const touch = e.touches[0];
    handleTouchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  }, [deck?.settings.mouseClickAdvances]);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!deck?.settings.mouseClickAdvances || !handleTouchStart.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - handleTouchStart.current.x;
    const deltaY = touch.clientY - handleTouchStart.current.y;
    const deltaTime = Date.now() - handleTouchStart.current.time;

    // Detect swipe gestures
    const minSwipeDistance = 50;
    const maxSwipeTime = 300;

    if (deltaTime < maxSwipeTime && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        // Swipe right - previous slide
        handleUserInteraction({ type: 'previous' });
      } else {
        // Swipe left - next slide
        handleUserInteraction({ type: 'next' });
      }
    } else if (Math.abs(deltaX) < 30 && Math.abs(deltaY) < 30) {
      // Tap - next slide
      handleUserInteraction({ type: 'next' });
    }

    handleTouchStart.current = null;
  }, [deck?.settings.mouseClickAdvances, handleUserInteraction]);

  // Click handler for advancing slides
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!deck?.settings.mouseClickAdvances) return;
    
    // Don't advance on control clicks
    if ((e.target as Element).closest('.presentation-controls')) return;

    handleUserInteraction({ type: 'next' });
  }, [deck?.settings.mouseClickAdvances, handleUserInteraction]);

  // Exit presentation
  const handleExit = useCallback(() => {
    saveSession();
    
    if (isFullscreen) {
      exitFullscreen();
    }
    
    if (onExit) {
      onExit();
    } else {
      navigate(-1); // Go back to previous page
    }
  }, [saveSession, isFullscreen, exitFullscreen, onExit, navigate]);

  // Keyboard shortcuts (PowerPoint-style)
  useHotkeys('right,down,space,enter,pagedown', () => handleUserInteraction({ type: 'next' }), { preventDefault: true });
  useHotkeys('left,up,backspace,pageup', () => handleUserInteraction({ type: 'previous' }), { preventDefault: true });
  useHotkeys('f5', () => handleUserInteraction({ type: 'play' }), { preventDefault: true });
  useHotkeys('escape', handleExit, { preventDefault: true });
  useHotkeys('f', () => handleUserInteraction({ type: 'fullscreen' }), { preventDefault: true });
  useHotkeys('home', () => handleUserInteraction({ type: 'goTo', payload: 0 }), { preventDefault: true });
  useHotkeys('end', () => handleUserInteraction({ type: 'goTo', payload: (deck?.slides.length ?? 1) - 1 }), { preventDefault: true });
  // Blackout toggle
  useHotkeys('b', () => setIsBlackout((v) => !v), { preventDefault: true });
  // Restart presentation
  useHotkeys('r', async () => { try { await goToSlide(0); } catch(_){} play(); }, { preventDefault: true });

  // Number key shortcuts for slide navigation
  useHotkeys('1,2,3,4,5,6,7,8,9,0', (e) => {
    const num = parseInt(e.key);
    if (num <= (deck?.slides.length ?? 0)) {
      handleUserInteraction({ type: 'goTo', payload: num - 1 });
    }
  }, { preventDefault: true });

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-lg">Loading presentation...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !deck) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <div className="text-white text-center max-w-md">
          <p className="text-xl mb-4">Failed to load presentation</p>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button onClick={handleExit} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const currentSlide = deck?.slides?.[currentSlideIndex] ?? null;


  return (
    <div
      ref={containerRef}
      className={`presentation-mode ${embedded ? 'embedded' : 'fullscreen'} ${
        isFullscreen ? 'fullscreen-active' : ''
      }`}
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000000',
        position: 'relative',
        overflow: 'hidden',
        cursor: showControls || embedded ? 'default' : 'none',
      }}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      role="application"
      aria-label="Presentation mode"
      tabIndex={0}
      onContextMenu={(e) => { e.preventDefault(); handleUserInteraction({ type: 'previous' }); }}
    >
      {/* Main slide container */}
      <div
        ref={slideContainerRef}
        className="slide-container"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AnimatePresence mode="wait">
          {currentSlide && (
            <motion.div
              key={`slide-${currentSlideIndex}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ 
                duration: 0.5,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              style={{
                transform: `scale(${slideScale})`,
                transformOrigin: 'center',
              }}
            >
              <SlideRenderer
                slide={currentSlide as any}
                mode="presentation"
                scale={1}
                className="shadow-[0_0_40px_rgba(0,0,0,0.5)]"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Blackout overlay */}
      {isBlackout && (
        <div style={{ position: 'absolute', inset: 0, background: '#000' }} />
      )}

      {/* On-screen controls */}
      <AnimatePresence>
        {(showControls || embedded) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="presentation-controls"
            style={{
              position: 'absolute',
              bottom: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(10px)',
              borderRadius: 12,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              pointerEvents: 'auto',
            }}
          >
            {/* Navigation controls */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleUserInteraction({ type: 'previous' })}
              disabled={currentSlideIndex === 0 && currentAnimationIndex === 0}
              className="text-white hover:bg-white/20"
            >
              <SkipBack className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => isPlaying ? pause() : play()}
              className="text-white hover:bg-white/20"
            >
              {isPlaying && !isPaused ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleUserInteraction({ type: 'next' })}
              disabled={deck.slides.length === 0 || currentSlideIndex >= deck.slides.length - 1}
              className="text-white hover:bg-white/20"
            >
              <SkipForward className="w-4 h-4" />
            </Button>

            {/* Slide counter */}
            <div className="text-white text-sm px-2">
              {currentSlideIndex + 1} / {deck.slides.length}
            </div>

            {/* Additional controls */}
            {!embedded && (
              <>
                <div className="w-px h-6 bg-white/30 mx-1" />

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUserInteraction({ type: 'fullscreen' })}
                  className="text-white hover:bg-white/20"
                  title="Toggle Fullscreen (F)"
                >
                  {isFullscreen ? (
                    <Minimize className="w-4 h-4" />
                  ) : (
                    <Maximize className="w-4 h-4" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => { try { await goToSlide(0); } catch(_){} play(); }}
                  className="text-white hover:bg-white/20"
                  title="Restart (R)"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExit}
                  className="text-white hover:bg-white/20"
                  title="Exit Presentation (Esc)"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      {deck.settings.showProgressBar && !embedded && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
          }}
        >
          <div
            style={{
              height: '100%',
              backgroundColor: '#3b82f6',
              width: `${deck.slides.length > 0 ? ((currentSlideIndex + 1) / deck.slides.length) * 100 : 0}%`,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      )}

      {/* Slide number indicator */}
      {deck.settings.showSlideNumbers && !embedded && (
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            background: 'rgba(0, 0, 0, 0.6)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: 4,
            fontSize: '12px',
            fontFamily: 'monospace',
          }}
        >
          {currentSlideIndex + 1} / {deck.slides.length}
        </div>
      )}

      {/* Accessibility announcements */}
      <div
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        Slide {currentSlideIndex + 1} of {deck.slides.length}
        {currentSlide?.title && `: ${currentSlide.title}`}
      </div>
    </div>
  );
};

export default PresentationMode;