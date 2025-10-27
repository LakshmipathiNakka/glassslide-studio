import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
  PresentationDeck, 
  PresentationState, 
  PresentationSlide,
  NavigationAction,
  AnimationTimeline,
  AnimationStep,
  PresenterViewState,
  PreloadableAsset,
  PresentationError,
  DualScreenConfig,
  PerformanceMetrics,
  AccessibilityOptions
} from '@/types/presentation';

interface PresentationStore extends PresentationState {
  // Navigation actions
  nextSlide: () => Promise<void>;
  previousSlide: () => Promise<void>;
  goToSlide: (index: number) => Promise<void>;
  nextAnimation: () => Promise<void>;
  previousAnimation: () => Promise<void>;
  
  // Playback controls
  play: () => void;
  pause: () => void;
  stop: () => void;
  resume: () => void;
  
  // Timeline management
  buildTimeline: (slide: PresentationSlide) => AnimationTimeline;
  executeAnimation: (step: AnimationStep) => Promise<void>;
  completeAnimation: (stepId: string) => void;
  resetTimeline: () => void;
  
  // Deck management
  loadDeck: (deck: PresentationDeck) => Promise<void>;
  unloadDeck: () => void;
  updateDeckSettings: (settings: Partial<PresentationDeck['settings']>) => void;
  
  // Presentation modes
  enterFullscreen: () => Promise<void>;
  exitFullscreen: () => Promise<void>;
  togglePresenterMode: () => void;
  enableDualScreen: (config: DualScreenConfig) => void;
  disableDualScreen: () => void;
  
  // Asset management
  preloadAssets: (slideIndexes: number[]) => Promise<void>;
  loadAsset: (asset: PreloadableAsset) => Promise<void>;
  getPreloadedAsset: (assetId: string) => PreloadableAsset | null;
  clearPreloadedAssets: () => void;
  
  // Presenter view
  presenterViewState: PresenterViewState;
  updatePresenterView: () => void;
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  
  // Performance monitoring
  metrics: PerformanceMetrics;
  updateMetrics: (newMetrics: Partial<PerformanceMetrics>) => void;
  resetMetrics: () => void;
  
  // Error handling
  errors: PresentationError[];
  addError: (error: PresentationError) => void;
  clearErrors: () => void;
  
  // Accessibility
  accessibilityOptions: AccessibilityOptions;
  updateAccessibilityOptions: (options: Partial<AccessibilityOptions>) => void;
  
  // Session management
  saveSession: () => void;
  loadSession: () => void;
  clearSession: () => void;
  
  // Event handling
  handleUserInteraction: (action: NavigationAction) => void;
  addEventListener: (callback: (event: any) => void) => () => void;
}

const initialPresentationState: PresentationState = {
  deckId: null,
  deck: null,
  currentSlideIndex: 0,
  currentAnimationIndex: 0,
  isPlaying: false,
  isPaused: false,
  isFullscreen: false,
  presenterMode: false,
  dualScreenMode: false,
  timeline: null,
  preloadedAssets: new Map(),
  frameRate: 60,
  lastFrameTime: 0,
  keyboardNavigation: true,
  mouseNavigation: true,
  touchNavigation: true,
};

const initialPresenterViewState: PresenterViewState = {
  currentSlide: null,
  nextSlide: null,
  previousSlide: null,
  speakerNotes: '',
  elapsedTime: 0,
  remainingTime: undefined,
  clockTime: new Date().toLocaleTimeString(),
  slideProgress: 0,
  deckProgress: 0,
};

const initialMetrics: PerformanceMetrics = {
  averageFrameRate: 60,
  droppedFrames: 0,
  memoryUsage: 0,
  renderTime: 0,
  animationSmoothness: 1,
  preloadEffectiveness: 1,
};

const initialAccessibilityOptions: AccessibilityOptions = {
  highContrast: false,
  reducedMotion: false,
  keyboardOnly: false,
  screenReader: false,
  fontSize: 'medium',
  focusIndicator: true,
};

export const usePresentationStore = create<PresentationStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialPresentationState,
    
    presenterViewState: initialPresenterViewState,
    metrics: initialMetrics,
    errors: [],
    accessibilityOptions: initialAccessibilityOptions,
    
    // Navigation actions
    nextSlide: async () => {
      const state = get();
      if (!state.deck) return;
      
      const { currentSlideIndex, currentAnimationIndex, timeline } = state;
      
      // First, try to advance animation within current slide
      if (timeline && currentAnimationIndex < timeline.totalSteps - 1) {
        await get().nextAnimation();
        return;
      }
      
      // Move to next slide if available
      if (currentSlideIndex < state.deck.slides.length - 1) {
        const nextIndex = currentSlideIndex + 1;
        await get().goToSlide(nextIndex);
      } else if (state.deck.settings.loopPresentation) {
        // Loop back to first slide
        await get().goToSlide(0);
      }
    },

    previousSlide: async () => {
      const state = get();
      if (!state.deck) return;
      
      const { currentSlideIndex, currentAnimationIndex } = state;
      
      // First, try to go back in current slide animations
      if (currentAnimationIndex > 0) {
        await get().previousAnimation();
        return;
      }
      
      // Move to previous slide if available
      if (currentSlideIndex > 0) {
        const prevIndex = currentSlideIndex - 1;
        await get().goToSlide(prevIndex);
      }
    },

    goToSlide: async (index: number) => {
      const state = get();
      if (!state.deck || index < 0 || index >= state.deck.slides.length) return;
      
      const slide = state.deck.slides[index];
      const timeline = get().buildTimeline(slide);
      
      // Preload adjacent slides
      const preloadIndexes = [
        Math.max(0, index - 1),
        index,
        Math.min(state.deck.slides.length - 1, index + 1)
      ];
      
      set({
        currentSlideIndex: index,
        currentAnimationIndex: 0,
        timeline,
      });
      
      // Preload assets and update presenter view
      await get().preloadAssets(preloadIndexes);
      get().updatePresenterView();
    },

    nextAnimation: async () => {
      const state = get();
      if (!state.timeline || state.timeline.isComplete) return;
      
      const nextStepIndex = state.currentAnimationIndex + 1;
      const step = state.timeline.steps[nextStepIndex];
      
      if (step) {
        await get().executeAnimation(step);
        set({ currentAnimationIndex: nextStepIndex });
        get().completeAnimation(step.id);
        get().updatePresenterView();
      }
    },

    previousAnimation: async () => {
      const state = get();
      if (!state.timeline || state.currentAnimationIndex <= 0) return;
      
      // Reset timeline and replay animations up to the previous step
      const targetIndex = state.currentAnimationIndex - 1;
      get().resetTimeline();
      
      // Re-execute animations up to target index
      for (let i = 0; i <= targetIndex; i++) {
        const step = state.timeline!.steps[i];
        if (step) {
          await get().executeAnimation(step);
          get().completeAnimation(step.id);
        }
      }
      
      set({ currentAnimationIndex: targetIndex });
      get().updatePresenterView();
    },

    // Playback controls
    play: () => {
      set({ isPlaying: true, isPaused: false });
      get().startTimer();
    },

    pause: () => {
      set({ isPaused: true });
      get().stopTimer();
    },

    stop: () => {
      set({ 
        isPlaying: false, 
        isPaused: false,
        currentSlideIndex: 0,
        currentAnimationIndex: 0 
      });
      get().resetTimer();
    },

    resume: () => {
      set({ isPaused: false });
      get().startTimer();
    },

    // Timeline management
    buildTimeline: (slide: PresentationSlide): AnimationTimeline => {
      const steps: AnimationStep[] = [];
      
      // Sort animations by order and type
      const sortedAnimations = [...slide.animations].sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order;
        
        // Type priority: appear -> withPrevious -> afterPrevious -> onClick
        const typePriority = { appear: 0, withPrevious: 1, afterPrevious: 2, onClick: 3 };
        return typePriority[a.type] - typePriority[b.type];
      });
      
      sortedAnimations.forEach((animation) => {
        steps.push({
          id: `step-${animation.id}`,
          elementId: animation.elementId,
          animation,
          slideId: slide.id,
          completed: false,
        });
      });
      
      return {
        slideId: slide.id,
        steps,
        currentStepIndex: -1,
        totalSteps: steps.length,
        isComplete: steps.length === 0,
      };
    },

    executeAnimation: async (step: AnimationStep): Promise<void> => {
      // This will be implemented by the AnimationEngine
      // For now, simulate animation execution
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, step.animation.duration);
      });
    },

    completeAnimation: (stepId: string) => {
      const state = get();
      if (!state.timeline) return;
      
      const updatedSteps = state.timeline.steps.map(step =>
        step.id === stepId ? { ...step, completed: true } : step
      );
      
      const completedCount = updatedSteps.filter(step => step.completed).length;
      const isComplete = completedCount === updatedSteps.length;
      
      set({
        timeline: {
          ...state.timeline,
          steps: updatedSteps,
          isComplete,
        },
      });
    },

    resetTimeline: () => {
      const state = get();
      if (!state.timeline) return;
      
      const resetSteps = state.timeline.steps.map(step => ({
        ...step,
        completed: false,
      }));
      
      set({
        timeline: {
          ...state.timeline,
          steps: resetSteps,
          currentStepIndex: -1,
          isComplete: false,
        },
        currentAnimationIndex: 0,
      });
    },

    // Deck management
    loadDeck: async (deck: PresentationDeck) => {
      set({
        deckId: deck.id,
        deck,
        currentSlideIndex: 0,
        currentAnimationIndex: 0,
      });
      
      if (deck.slides.length > 0) {
        await get().goToSlide(0);
      }
      
      get().updatePresenterView();
    },

    unloadDeck: () => {
      get().clearPreloadedAssets();
      get().resetTimer();
      
      set({
        ...initialPresentationState,
        presenterViewState: initialPresenterViewState,
      });
    },

    updateDeckSettings: (settings) => {
      const state = get();
      if (!state.deck) return;
      
      set({
        deck: {
          ...state.deck,
          settings: { ...state.deck.settings, ...settings },
        },
      });
    },

    // Presentation modes
    enterFullscreen: async () => {
      try {
        await document.documentElement.requestFullscreen();
        set({ isFullscreen: true });
      } catch (error) {
        console.error('Failed to enter fullscreen:', error);
        get().addError({
          code: 'FULLSCREEN_ERROR',
          message: 'Failed to enter fullscreen mode',
          severity: 'medium',
          recoverable: true,
        });
      }
    },

    exitFullscreen: async () => {
      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        }
        set({ isFullscreen: false });
      } catch (error) {
        console.error('Failed to exit fullscreen:', error);
      }
    },

    togglePresenterMode: () => {
      set(state => ({ presenterMode: !state.presenterMode }));
      get().updatePresenterView();
    },

    enableDualScreen: (config: DualScreenConfig) => {
      set({ 
        dualScreenMode: true,
        presenterMode: true 
      });
      get().updatePresenterView();
    },

    disableDualScreen: () => {
      set({ 
        dualScreenMode: false 
      });
    },

    // Asset management
    preloadAssets: async (slideIndexes: number[]) => {
      const state = get();
      if (!state.deck) return;
      
      const assets: PreloadableAsset[] = [];
      
      slideIndexes.forEach(index => {
        if (index >= 0 && index < state.deck!.slides.length) {
          const slide = state.deck!.slides[index];
          
          // Extract image URLs from elements
          slide.elements.forEach(element => {
            if (element.type === 'image' && element.imageUrl) {
              assets.push({
                id: `${slide.id}-${element.id}`,
                type: 'image',
                url: element.imageUrl,
                priority: index === state.currentSlideIndex ? 'high' : 'medium',
                loaded: false,
              });
            }
          });
          
          // Background images
          if (slide.background.startsWith('url(')) {
            const urlMatch = slide.background.match(/url\(['"]?([^'"]+)['"]?\)/);
            if (urlMatch) {
              assets.push({
                id: `${slide.id}-background`,
                type: 'image',
                url: urlMatch[1],
                priority: 'high',
                loaded: false,
              });
            }
          }
        }
      });
      
      // Load assets concurrently
      const loadPromises = assets.map(asset => 
        get().loadAsset(asset)
      );
      
      await Promise.allSettled(loadPromises);
    },

    loadAsset: async (asset: PreloadableAsset): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (asset.type === 'image') {
          const img = new Image();
          img.onload = () => {
            const updatedAsset = { ...asset, loaded: true, data: img };
            get().preloadedAssets.set(asset.id, updatedAsset);
            resolve();
          };
          img.onerror = () => {
            const updatedAsset = { ...asset, loaded: false, error: 'Failed to load image' };
            get().preloadedAssets.set(asset.id, updatedAsset);
            reject(new Error(`Failed to load image: ${asset.url}`));
          };
          img.src = asset.url;
        }
      });
    },

    getPreloadedAsset: (assetId: string) => {
      return get().preloadedAssets.get(assetId) || null;
    },

    clearPreloadedAssets: () => {
      set({ preloadedAssets: new Map() });
    },

    // Presenter view
    updatePresenterView: () => {
      const state = get();
      if (!state.deck) return;
      
      const slides = state.deck.slides;
      const currentSlide = slides[state.currentSlideIndex] || null;
      const nextSlide = slides[state.currentSlideIndex + 1] || null;
      const previousSlide = slides[state.currentSlideIndex - 1] || null;
      
      const slideProgress = state.timeline 
        ? (state.currentAnimationIndex / Math.max(1, state.timeline.totalSteps)) * 100
        : 100;
      
      const deckProgress = ((state.currentSlideIndex + 1) / slides.length) * 100;
      
      set({
        presenterViewState: {
          ...state.presenterViewState,
          currentSlide,
          nextSlide,
          previousSlide,
          speakerNotes: currentSlide?.speakerNotes || '',
          slideProgress,
          deckProgress,
          clockTime: new Date().toLocaleTimeString(),
        },
      });
    },

    startTimer: () => {
      // Timer implementation would go here
      const startTime = Date.now();
      
      const updateTimer = () => {
        const elapsed = Date.now() - startTime;
        set(state => ({
          presenterViewState: {
            ...state.presenterViewState,
            elapsedTime: elapsed,
            clockTime: new Date().toLocaleTimeString(),
          },
        }));
      };
      
      // Update every second
      const intervalId = window.setInterval(updateTimer, 1000);
      (window as any).__PRESENTER_TIMER__ = intervalId;
    },

    stopTimer: () => {
      const id = (window as any).__PRESENTER_TIMER__;
      if (id) {
        window.clearInterval(id);
        (window as any).__PRESENTER_TIMER__ = null;
      }
    },

    resetTimer: () => {
      set(state => ({
        presenterViewState: {
          ...state.presenterViewState,
          elapsedTime: 0,
        },
      }));
    },

    // Performance monitoring
    updateMetrics: (newMetrics) => {
      set(state => ({
        metrics: { ...state.metrics, ...newMetrics },
      }));
    },

    resetMetrics: () => {
      set({ metrics: initialMetrics });
    },

    // Error handling
    addError: (error) => {
      set(state => ({
        errors: [...state.errors, { ...error, timestamp: Date.now() }],
      }));
    },

    clearErrors: () => {
      set({ errors: [] });
    },

    // Accessibility
    updateAccessibilityOptions: (options) => {
      set(state => ({
        accessibilityOptions: { ...state.accessibilityOptions, ...options },
      }));
    },

    // Session management
    saveSession: () => {
      const state = get();
      const session = {
        deckId: state.deckId,
        currentSlideIndex: state.currentSlideIndex,
        currentAnimationIndex: state.currentAnimationIndex,
        presenterMode: state.presenterMode,
        accessibilityOptions: state.accessibilityOptions,
      };
      
      localStorage.setItem('glassslide-presentation-session', JSON.stringify(session));
    },

    loadSession: () => {
      try {
        const sessionData = localStorage.getItem('glassslide-presentation-session');
        if (sessionData) {
          const session = JSON.parse(sessionData);
          set({
            currentSlideIndex: session.currentSlideIndex || 0,
            currentAnimationIndex: session.currentAnimationIndex || 0,
            presenterMode: session.presenterMode || false,
            accessibilityOptions: { ...initialAccessibilityOptions, ...session.accessibilityOptions },
          });
        }
      } catch (error) {
        console.error('Failed to load session:', error);
      }
    },

    clearSession: () => {
      localStorage.removeItem('glassslide-presentation-session');
    },

    // Event handling
    handleUserInteraction: (action) => {
      switch (action.type) {
        case 'next':
          get().nextSlide();
          break;
        case 'previous':
          get().previousSlide();
          break;
        case 'goTo':
          get().goToSlide(action.payload);
          break;
        case 'play':
          get().play();
          break;
        case 'pause':
          get().pause();
          break;
        case 'stop':
          get().stop();
          break;
        case 'fullscreen':
          if (get().isFullscreen) {
            get().exitFullscreen();
          } else {
            get().enterFullscreen();
          }
          break;
        case 'exit':
          get().exitFullscreen();
          break;
      }
    },

    addEventListener: (callback) => {
      // Event listener implementation
      // Return cleanup function
      return () => {
        // Cleanup
      };
    },
  }))
);

// Expose store for debugging in development
if (process.env.NODE_ENV === 'development') {
  (window as any).presentationStore = usePresentationStore;
}