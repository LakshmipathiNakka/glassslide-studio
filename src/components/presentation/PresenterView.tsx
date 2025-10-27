import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import SlideRenderer from './SlideRenderer';
import { usePresentationStore } from '@/hooks/usePresentationStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward,
  Square,
  Monitor,
  MonitorOff,
  Clock,
  Eye,
  ArrowLeft,
  Settings,
  Maximize,
  Minimize,
  Timer,
  BarChart3,
  FileText,
  Users
} from 'lucide-react';

/**
 * PresenterView - Dual-screen presenter interface
 * 
 * Features:
 * - Current slide display
 * - Next slide preview
 * - Previous slide reference
 * - Speaker notes
 * - Presentation timer
 * - Progress indicators
 * - Audience view window management
 * - Presenter controls
 * - Performance metrics
 */

interface PresenterViewProps {
  onExit: () => void;
  onTogglePresenterMode: () => void;
}

const PresenterView: React.FC<PresenterViewProps> = ({
  onExit,
  onTogglePresenterMode,
}) => {
  const timerRef = useRef<number | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [audienceWindow, setAudienceWindow] = useState<Window | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const {
    deck,
    currentSlideIndex,
    currentAnimationIndex,
    isPlaying,
    isPaused,
    dualScreenMode,
    presenterViewState,
    nextSlide,
    previousSlide,
    goToSlide,
    play,
    pause,
    stop,
    handleUserInteraction,
    startTimer,
    stopTimer,
    resetTimer,
    enableDualScreen,
    disableDualScreen,
    metrics,
    updateMetrics,
  } = usePresentationStore();

  // Update current time every second
  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  // Format time helpers
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatClock = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Dual screen management
  const openAudienceWindow = useCallback(() => {
    if (audienceWindow && !audienceWindow.closed) {
      audienceWindow.focus();
      return;
    }

    try {
      const newWindow = window.open(
        `/present/${deck?.id}?mode=audience`,
        'audience_view',
        'width=1920,height=1080,fullscreen=yes,location=no,menubar=no,toolbar=no,status=no,scrollbars=no'
      );

      if (newWindow) {
        setAudienceWindow(newWindow);
        enableDualScreen({
          enabled: true,
          audienceDisplay: null, // Would be populated with actual display info
          presenterDisplay: null,
          mirrorMode: false,
          extendedMode: true,
        });

        // Monitor window close
        const checkClosed = setInterval(() => {
          if (newWindow.closed) {
            setAudienceWindow(null);
            disableDualScreen();
            clearInterval(checkClosed);
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to open audience window:', error);
    }
  }, [deck?.id, audienceWindow, enableDualScreen, disableDualScreen]);

  const closeAudienceWindow = useCallback(() => {
    if (audienceWindow) {
      audienceWindow.close();
      setAudienceWindow(null);
      disableDualScreen();
    }
  }, [audienceWindow, disableDualScreen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
        case 'Enter':
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'Backspace':
          e.preventDefault();
          previousSlide();
          break;
        case 'Escape':
          e.preventDefault();
          onExit();
          break;
        case 'F5':
          e.preventDefault();
          isPlaying ? pause() : play();
          break;
        case 'Home':
          e.preventDefault();
          goToSlide(0);
          break;
        case 'End':
          e.preventDefault();
          if (deck) goToSlide(deck.slides.length - 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, previousSlide, onExit, isPlaying, pause, play, goToSlide, deck]);

  // Performance monitoring
  useEffect(() => {
    const updatePerformanceMetrics = () => {
      if ('memory' in performance) {
        const memInfo = (performance as any).memory;
        updateMetrics({
          memoryUsage: memInfo.usedJSHeapSize / 1024 / 1024, // MB
        });
      }

      // Frame rate calculation would go here
      updateMetrics({
        averageFrameRate: 60, // Placeholder
        renderTime: performance.now() % 16.67, // Placeholder
      });
    };

    const metricsInterval = setInterval(updatePerformanceMetrics, 2000);
    return () => clearInterval(metricsInterval);
  }, [updateMetrics]);

  if (!deck || !presenterViewState.currentSlide) {
    return (
      <div className="h-screen w-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl mb-4">No presentation loaded</p>
          <Button onClick={onExit} variant="outline">
            Exit Presenter View
          </Button>
        </div>
      </div>
    );
  }

  const { currentSlide, nextSlide: nextSlideData, previousSlide: prevSlideData } = presenterViewState;

  return (
    <div className="presenter-view h-screen w-screen bg-gray-900 text-white overflow-hidden">
      {/* Header bar */}
      <div className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onExit}
            className="text-white hover:bg-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Exit
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
          
          <h1 className="text-lg font-semibold text-white">
            {deck.title}
          </h1>
          
          <Badge variant="secondary">
            Presenter View
          </Badge>
        </div>

        {/* Center section - Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleUserInteraction({ type: 'previous' })}
            disabled={currentSlideIndex === 0 && currentAnimationIndex === 0}
            className="text-white hover:bg-gray-700"
          >
            <SkipBack className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => isPlaying ? pause() : play()}
            className="text-white hover:bg-gray-700"
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
            disabled={currentSlideIndex === deck.slides.length - 1}
            className="text-white hover:bg-gray-700"
          >
            <SkipForward className="w-4 h-4" />
          </Button>

          <Separator orientation="vertical" className="h-6 mx-2" />

          <Button
            variant="ghost"
            size="sm"
            onClick={stop}
            className="text-white hover:bg-gray-700"
          >
            <Square className="w-4 h-4" />
          </Button>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Clock className="w-4 h-4" />
            {formatClock(currentTime)}
          </div>

          <Separator orientation="vertical" className="h-6" />

          <Button
            variant={dualScreenMode ? "default" : "ghost"}
            size="sm"
            onClick={dualScreenMode ? closeAudienceWindow : openAudienceWindow}
            className="text-white hover:bg-gray-700"
          >
            {dualScreenMode ? (
              <>
                <MonitorOff className="w-4 h-4 mr-2" />
                Close Audience View
              </>
            ) : (
              <>
                <Monitor className="w-4 h-4 mr-2" />
                Open Audience View
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onTogglePresenterMode}
            className="text-white hover:bg-gray-700"
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main content area */}
      <div className="h-[calc(100vh-4rem)] flex">
        {/* Left column - Current slide and next slide */}
        <div className="flex-1 p-6 space-y-6">
          {/* Current slide */}
          <Card className="bg-gray-800 border-gray-700 flex-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg">
                  Current Slide
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-white border-gray-600">
                    {currentSlideIndex + 1} / {deck.slides.length}
                  </Badge>
                  {currentSlide.title && (
                    <Badge variant="secondary">
                      {currentSlide.title}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="relative">
                <SlideRenderer
                  slide={currentSlide}
                  width={640}
                  height={360}
                  scale={1}
                  isVisible={true}
                  enableAnimations={false}
                  quality="medium"
                  className="border border-gray-600 rounded-lg overflow-hidden"
                />
                
                {/* Animation progress indicator */}
                {presenterViewState.slideProgress < 100 && (
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="bg-black/50 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-blue-400 transition-all duration-300"
                        style={{ width: `${presenterViewState.slideProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Next and previous slide previews */}
          <div className="grid grid-cols-2 gap-4 h-48">
            {/* Previous slide */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">Previous</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex items-center justify-center">
                {prevSlideData ? (
                  <SlideRenderer
                    slide={prevSlideData}
                    width={200}
                    height={112}
                    scale={1}
                    isVisible={true}
                    enableAnimations={false}
                    quality="low"
                    className="border border-gray-600 rounded overflow-hidden"
                  />
                ) : (
                  <div className="text-gray-500 text-sm">No previous slide</div>
                )}
              </CardContent>
            </Card>

            {/* Next slide */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">Next</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex items-center justify-center">
                {nextSlideData ? (
                  <SlideRenderer
                    slide={nextSlideData}
                    width={200}
                    height={112}
                    scale={1}
                    isVisible={true}
                    enableAnimations={false}
                    quality="low"
                    className="border border-gray-600 rounded overflow-hidden"
                  />
                ) : (
                  <div className="text-gray-500 text-sm">No next slide</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right column - Notes and metrics */}
        <div className="w-96 p-6 space-y-6 border-l border-gray-700">
          {/* Timer and progress */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Timer className="w-5 h-5" />
                Timing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Elapsed</span>
                <span className="text-xl font-mono text-white">
                  {formatTime(presenterViewState.elapsedTime)}
                </span>
              </div>
              
              {presenterViewState.remainingTime && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Remaining</span>
                  <span className="text-xl font-mono text-yellow-400">
                    {formatTime(presenterViewState.remainingTime)}
                  </span>
                </div>
              )}

              <Separator className="bg-gray-600" />

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">Presentation Progress</span>
                  <span className="text-white">
                    {Math.round(presenterViewState.deckProgress)}%
                  </span>
                </div>
                <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-green-400 transition-all duration-300"
                    style={{ width: `${presenterViewState.deckProgress}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Speaker notes */}
          <Card className="bg-gray-800 border-gray-700 flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Speaker Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <ScrollArea className="h-48">
                {presenterViewState.speakerNotes ? (
                  <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {presenterViewState.speakerNotes}
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm italic">
                    No speaker notes for this slide
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Performance metrics */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Frame Rate</span>
                  <span className="text-white">
                    {Math.round(metrics.averageFrameRate)} FPS
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Memory</span>
                  <span className="text-white">
                    {Math.round(metrics.memoryUsage)} MB
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Render Time</span>
                  <span className="text-white">
                    {Math.round(metrics.renderTime)} ms
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Slide thumbnails */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm">
                All Slides
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-32">
                <div className="grid grid-cols-3 gap-2">
                  {deck.slides.map((slide, index) => (
                    <button
                      key={slide.id}
                      onClick={() => goToSlide(index)}
                      className={`relative aspect-video rounded border-2 transition-all ${
                        index === currentSlideIndex
                          ? 'border-blue-400 ring-2 ring-blue-400/30'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <div className="absolute inset-0 bg-white rounded flex items-center justify-center text-xs text-gray-800">
                        {index + 1}
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Status bar */}
      <div className="h-8 bg-gray-800 border-t border-gray-700 flex items-center justify-between px-6 text-xs text-gray-400">
        <div className="flex items-center gap-4">
          <span>Presenter View Active</span>
          {dualScreenMode && (
            <Badge variant="outline" className="text-xs">
              Dual Screen
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span>Press ESC to exit</span>
          <span>F5 to play/pause</span>
          <span>Arrow keys to navigate</span>
        </div>
      </div>
    </div>
  );
};

export default PresenterView;