import React, { useEffect, useCallback, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SlideRenderer from '@/components/shared/SlideRenderer';
import { usePresentationStore } from '@/hooks/usePresentationStore';
import { PresentationDeck, PresentationSlide } from '@/types/presentation';
import { animationEngine } from '@/utils/AnimationEngine';
import { useHotkeys } from 'react-hotkeys-hook';
import { Button } from '@/components/ui/button';
import { usePresentationEditing, BackendSaveResult } from '@/hooks/usePresentationEditing';
import { useToast } from '@/hooks/use-toast';
import { Slide } from '@/types/slide-thumbnails';
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
  ArrowLeft,
  Loader2,
  Save,
  AlertCircle
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
  const [slideTimer, setSlideTimer] = useState(0);
  const [isSavingBeforeExit, setIsSavingBeforeExit] = useState(false);
  const { toast } = useToast();

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

  // Backend save callback (optional - implement based on your backend)
  const backendSaveCallback = useCallback(async (slides: Slide[]): Promise<BackendSaveResult> => {
    // TODO: Implement actual backend API call
    // Example:
    // const response = await fetch('/api/presentations/' + deckId, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ slides })
    // });
    // return { success: response.ok, timestamp: Date.now() };
    
    // For now, return success (localStorage-only mode)
    return { success: true, timestamp: Date.now() };
  }, [deckId]);

  // Presentation editing with auto-save
  const {
    slides: editableSlides,
    updateSlides,
    hasUnsavedChanges,
    lastSavedAt,
    isSaving,
    saveError,
    forceSave,
    retrySave,
  } = usePresentationEditing(
    deck?.slides.map(s => ({
      id: s.id,
      elements: s.elements as any[],
      background: s.background,
      createdAt: s.createdAt,
      lastUpdated: Date.now(),
    })) || [],
    deckId || null,
    backendSaveCallback
  );

  // Show save notifications
  useEffect(() => {
    if (saveError) {
      toast({
        title: 'Save Failed',
        description: saveError,
        variant: 'destructive',
        action: (
          <Button size="sm" variant="outline" onClick={retrySave}>
            Retry
          </Button>
        ),
      });
    }
  }, [saveError, toast, retrySave]);

  useEffect(() => {
    if (lastSavedAt && !saveError) {
      const timeSince = Date.now() - lastSavedAt;
      if (timeSince < 1000) {
        toast({
          title: 'Saved',
          description: 'All changes saved successfully',
          duration: 2000,
        });
      }
    }
  }, [lastSavedAt, saveError, toast]);

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
        // Auto-play is now opt-in by pressing play button
        console.log('[PresentationMode] Loaded. Press Play or P to start auto-play.');
        
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

  // Slide timer for progress bar
  useEffect(() => {
    if (isPlaying) {
      console.log('[SlideTimer] Starting timer for slide', currentSlideIndex + 1);
      const timer = setInterval(() => {
        setSlideTimer(prev => {
          const newValue = prev + 1;
          if (newValue <= 5) {
            console.log('[SlideTimer] Timer tick:', newValue, '/', 5);
          }
          return newValue;
        });
      }, 1000);
      return () => {
        console.log('[SlideTimer] Clearing timer');
        clearInterval(timer);
      };
    } else {
      console.log('[SlideTimer] Resetting timer (not playing)');
      setSlideTimer(0);
    }
  }, [isPlaying, currentSlideIndex]);

  // Auto-advance every 5 seconds while playing
  useEffect(() => {
    if (!isPlaying || !deck || deck.slides.length === 0) {
      console.log('[Slideshow] Auto-advance disabled. isPlaying:', isPlaying, 'deck:', !!deck, 'slides:', deck?.slides.length);
      return;
    }
    
    console.log('[Slideshow] Auto-advancing in 5 seconds... (Slide', currentSlideIndex + 1, '/', deck.slides.length, ')');
    
    const id = window.setInterval(() => {
      // Check again if still playing before advancing
      console.log('[Slideshow] Timer fired - advancing to slide', currentSlideIndex + 2);
      handleUserInteraction({ type: 'next' });
    }, 5000);
    
    return () => {
      console.log('[Slideshow] Clearing auto-advance timer for slide', currentSlideIndex + 1);
      window.clearInterval(id);
    };
  }, [isPlaying, deck, currentSlideIndex, handleUserInteraction]);

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

  // Exit presentation with save-before-exit
  const handleExit = useCallback(async () => {
    console.log('[PresentationMode] Exit requested');
    
    // Check if there are unsaved changes
    if (hasUnsavedChanges || isSaving) {
      console.log('[PresentationMode] Unsaved changes detected, saving before exit...');
      setIsSavingBeforeExit(true);
      
      try {
        // Force immediate save
        const saveSuccess = await forceSave();
        
        if (!saveSuccess) {
          // Show error and ask user
          const shouldExit = window.confirm(
            'Failed to save changes. Do you want to exit anyway? Unsaved changes will be lost.'
          );
          
          if (!shouldExit) {
            console.log('[PresentationMode] Exit cancelled by user');
            setIsSavingBeforeExit(false);
            return;
          }
        }
        
        console.log('[PresentationMode] All changes saved successfully');
        toast({
          title: 'Saved',
          description: 'All changes saved before exiting',
          duration: 2000,
        });
      } catch (error) {
        console.error('[PresentationMode] Error during save:', error);
        const shouldExit = window.confirm(
          'An error occurred while saving. Do you want to exit anyway?'
        );
        
        if (!shouldExit) {
          setIsSavingBeforeExit(false);
          return;
        }
      } finally {
        setIsSavingBeforeExit(false);
      }
    }
    
    console.log('[PresentationMode] Exiting presentation mode');
    
    // Save current session state (slide position, etc.)
    saveSession();
    console.log('[PresentationMode] Session saved');
    
    // Exit fullscreen if active
    if (isFullscreen) {
      console.log('[PresentationMode] Exiting fullscreen');
      exitFullscreen();
    }
    
    // Verify final state persisted
    if (deck && deckId) {
      try {
        const existingData = localStorage.getItem(`glassslide-deck-${deckId}`);
        if (existingData) {
          console.log('[PresentationMode] Deck data verified in localStorage');
        }
      } catch (e) {
        console.error('[PresentationMode] Failed to verify deck persistence:', e);
      }
    }
    
    // Return to editor or call custom exit handler
    if (onExit) {
      console.log('[PresentationMode] Calling custom exit handler');
      onExit();
    } else {
      console.log('[PresentationMode] Navigating back to editor');
      navigate(-1); // Go back to previous page (Editor)
    }
  }, [hasUnsavedChanges, isSaving, forceSave, saveSession, isFullscreen, exitFullscreen, onExit, navigate, deck, deckId, toast]);

  // Keyboard shortcuts (PowerPoint-style)
  useHotkeys('right,down,space,enter,pagedown', () => handleUserInteraction({ type: 'next' }), { preventDefault: true });
  useHotkeys('left,up,backspace,pageup', () => handleUserInteraction({ type: 'previous' }), { preventDefault: true });
  useHotkeys('f5', () => handleUserInteraction({ type: 'play' }), { preventDefault: true });
  useHotkeys('p', () => {
    console.log('[Slideshow] P key pressed. Current isPlaying:', isPlaying);
    if (isPlaying) {
      console.log('[Slideshow] Pausing via P key');
      pause();
    } else {
      console.log('[Slideshow] Starting play via P key');
      play();
    }
  }, { preventDefault: true });
  useHotkeys('escape', () => {
    console.log('[PresentationMode] ESC key pressed');
    handleExit();
  }, { preventDefault: true });
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

      {/* Saving overlay */}
      {isSavingBeforeExit && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}>
          <div className="text-center text-white">
            <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4" />
            <p className="text-xl font-medium">Saving changes...</p>
            <p className="text-sm text-white/60 mt-2">Please wait while we save your presentation</p>
          </div>
        </div>
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
              onClick={() => {
                console.log('[Slideshow] Play/pause button clicked. Current isPlaying:', isPlaying);
                if (isPlaying) {
                  console.log('[Slideshow] Calling pause()');
                  pause();
                  // Force update to ensure state changes
                  setTimeout(() => {
                    console.log('[Slideshow] After pause(), isPlaying should be false');
                  }, 100);
                } else {
                  console.log('[Slideshow] Calling play()');
                  play();
                  setTimeout(() => {
                    console.log('[Slideshow] After play(), isPlaying should be true');
                  }, 100);
                }
              }}
              className={`text-white hover:bg-white/20 transition-all ${isPlaying ? 'bg-red-500/30 hover:bg-red-500/40' : ''}`}
              title={isPlaying ? 'Pause auto-play (P)' : 'Start auto-play (P)'}
            >
              {isPlaying && !isPaused ? (
                <Pause className="w-4 h-4 animate-pulse" />
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

            {/* LIVE indicator and Slide counter */}
            <div className="flex items-center gap-2">
              {isPlaying && (
                <div className="bg-red-500/80 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm animate-pulse flex items-center gap-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                  LIVE
                </div>
              )}
              <div className="text-white text-sm px-2">
                {currentSlideIndex + 1} / {deck.slides.length}
              </div>
            </div>

            {/* Save status indicator */}
            <div className="flex items-center gap-2">
              {isSaving && (
                <div className="flex items-center gap-1 text-white/70 text-xs">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Saving...
                </div>
              )}
              {hasUnsavedChanges && !isSaving && (
                <div className="flex items-center gap-1 text-yellow-400 text-xs" title="Auto-save in progress">
                  <AlertCircle className="w-3 h-3" />
                  Unsaved
                </div>
              )}
              {!hasUnsavedChanges && !isSaving && lastSavedAt && (
                <div className="flex items-center gap-1 text-green-400 text-xs" title={`Last saved at ${new Date(lastSavedAt).toLocaleTimeString()}`}>
                  <Save className="w-3 h-3" />
                  Saved
                </div>
              )}
              {saveError && (
                <div className="flex items-center gap-1 text-red-400 text-xs" title={saveError}>
                  <AlertCircle className="w-3 h-3" />
                  Error
                </div>
              )}
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

      {/* Progress bar with auto-play timer */}
      {deck.settings.showProgressBar && !embedded && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {/* Slide progress */}
          <div
            style={{
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
          {/* Auto-play timer */}
          {isPlaying && (
            <div
              style={{
                height: '1px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                marginTop: '1px',
              }}
            >
              <div
                style={{
                  height: '100%',
                  backgroundColor: '#ef4444',
                  width: `${(slideTimer / 5) * 100}%`,
                  transition: 'width 0.1s linear',
                }}
              />
            </div>
          )}
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