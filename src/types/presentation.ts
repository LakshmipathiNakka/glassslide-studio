import { Element } from '@/hooks/use-action-manager';

// Animation-related types
export type AnimationType = 'appear' | 'withPrevious' | 'afterPrevious' | 'onClick';
export type TransitionType = 'fade' | 'push' | 'zoom' | 'morph' | 'slide' | 'flip';

export interface ElementAnimation {
  id: string;
  elementId: string;
  type: AnimationType;
  effect: 'fade' | 'slide' | 'zoom' | 'bounce' | 'spin' | 'wipe';
  direction?: 'up' | 'down' | 'left' | 'right' | 'center';
  duration: number;
  delay: number;
  easing: string;
  order: number; // Animation sequence order within the slide
}

export interface SlideTransition {
  type: TransitionType;
  duration: number;
  easing: string;
  direction?: 'up' | 'down' | 'left' | 'right';
}

// Enhanced slide interface for presentation mode
export interface PresentationSlide {
  id: string;
  elements: Element[];
  background: string;
  createdAt: Date;
  lastUpdated?: number;
  thumbnail?: string;
  title?: string;
  notes?: string;
  theme?: string;
  category?: 'intro' | 'content' | 'data' | 'conclusion' | 'custom';
  
  // Animation & presentation specific
  animations: ElementAnimation[];
  transition: SlideTransition;
  duration?: number; // Auto-advance duration (null for manual)
  speakerNotes?: string;
  hiddenInPresentation?: boolean;
}

// Presentation deck structure
export interface PresentationDeck {
  id: string;
  title: string;
  slides: PresentationSlide[];
  theme: string;
  aspectRatio: '16:9' | '4:3' | '16:10';
  createdAt: Date;
  lastUpdated: Date;
  settings: PresentationSettings;
}

export interface PresentationSettings {
  autoAdvance: boolean;
  loopPresentation: boolean;
  showSlideNumbers: boolean;
  showProgressBar: boolean;
  mouseClickAdvances: boolean;
  presenterMode: boolean;
  fullScreen: boolean;
  kioskMode: boolean;
}

// Animation timeline and execution
export interface AnimationStep {
  id: string;
  elementId: string;
  animation: ElementAnimation;
  slideId: string;
  completed: boolean;
}

export interface AnimationTimeline {
  slideId: string;
  steps: AnimationStep[];
  currentStepIndex: number;
  totalSteps: number;
  isComplete: boolean;
}

// Presentation state and navigation
export interface PresentationState {
  deckId: string | null;
  deck: PresentationDeck | null;
  currentSlideIndex: number;
  currentAnimationIndex: number;
  isPlaying: boolean;
  isPaused: boolean;
  isFullscreen: boolean;
  presenterMode: boolean;
  dualScreenMode: boolean;
  
  // Timeline state
  timeline: AnimationTimeline | null;
  preloadedAssets: Map<string, any>;
  
  // Performance monitoring
  frameRate: number;
  lastFrameTime: number;
  
  // User preferences
  keyboardNavigation: boolean;
  mouseNavigation: boolean;
  touchNavigation: boolean;
}

// Presenter view specific
export interface PresenterViewState {
  currentSlide: PresentationSlide | null;
  nextSlide: PresentationSlide | null;
  previousSlide: PresentationSlide | null;
  speakerNotes: string;
  elapsedTime: number;
  remainingTime?: number;
  clockTime: string;
  slideProgress: number;
  deckProgress: number;
}

// Asset preloading
export interface PreloadableAsset {
  id: string;
  type: 'image' | 'video' | 'font' | 'slide';
  url: string;
  priority: 'high' | 'medium' | 'low';
  loaded: boolean;
  error?: string;
  data?: any; // The actual loaded asset (Image, Video, etc.)
}

export interface PreloadOptions {
  maxConcurrent: number;
  timeout: number;
  retryCount: number;
  useOffscreenCanvas: boolean;
  preloadRadius: number; // How many slides ahead/behind to preload
}

// Display and screen management
export interface DisplayInfo {
  id: string;
  isPrimary: boolean;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  scaleFactor: number;
  colorDepth: number;
  isInternal: boolean;
}

export interface DualScreenConfig {
  enabled: boolean;
  audienceDisplay: DisplayInfo | null;
  presenterDisplay: DisplayInfo | null;
  mirrorMode: boolean;
  extendedMode: boolean;
}

// Event types
export interface PresentationEvent {
  type: 'slideChange' | 'animationStart' | 'animationEnd' | 'userInteraction' | 'error';
  timestamp: number;
  slideId?: string;
  animationId?: string;
  data?: any;
}

// Navigation and controls
export interface NavigationAction {
  type: 'next' | 'previous' | 'goTo' | 'play' | 'pause' | 'stop' | 'fullscreen' | 'exit';
  payload?: any;
}

export interface KeyboardShortcuts {
  next: string[];
  previous: string[];
  play: string[];
  pause: string[];
  fullscreen: string[];
  exit: string[];
  presenterView: string[];
  goto: string[];
}

// Accessibility
export interface AccessibilityOptions {
  highContrast: boolean;
  reducedMotion: boolean;
  keyboardOnly: boolean;
  screenReader: boolean;
  fontSize: 'small' | 'medium' | 'large';
  focusIndicator: boolean;
}

// Performance monitoring
export interface PerformanceMetrics {
  averageFrameRate: number;
  droppedFrames: number;
  memoryUsage: number;
  renderTime: number;
  animationSmoothness: number;
  preloadEffectiveness: number;
}

// Export utility types
export type SlideDirection = 'next' | 'previous';
export type PresentationMode = 'audience' | 'presenter' | 'dual';
export type RenderQuality = 'high' | 'medium' | 'low' | 'auto';

// Error handling
export interface PresentationError {
  code: string;
  message: string;
  slideId?: string;
  elementId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
}