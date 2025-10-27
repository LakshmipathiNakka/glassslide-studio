import { 
  ElementAnimation, 
  SlideTransition, 
  AnimationStep, 
  PresentationSlide,
  TransitionType,
  AnimationType 
} from '@/types/presentation';
import { Element } from '@/hooks/use-action-manager';

/**
 * AnimationEngine - Handles PowerPoint-style animations using Framer Motion
 * 
 * Features:
 * - Element animations (appear, slide, fade, etc.)
 * - Slide transitions (fade, push, zoom, morph)
 * - Timeline-based execution
 * - Performance optimization
 * - Fallback support for older browsers
 */

export interface AnimationConfig {
  duration: number;
  delay: number;
  easing: string;
  direction?: string;
}

export interface AnimationControls {
  play: () => Promise<void>;
  pause: () => void;
  stop: () => void;
  reverse: () => Promise<void>;
  seek: (progress: number) => void;
}

export class AnimationEngine {
  private currentAnimations: Map<string, AnimationControls> = new Map();
  private animationQueue: AnimationStep[] = [];
  private isPlaying = false;
  private isPaused = false;
  private reducedMotion = false;
  private performanceMode: 'high' | 'medium' | 'low' = 'high';

  constructor(options?: {
    reducedMotion?: boolean;
    performanceMode?: 'high' | 'medium' | 'low';
  }) {
    this.reducedMotion = options?.reducedMotion ?? this.detectReducedMotion();
    this.performanceMode = options?.performanceMode ?? this.detectPerformanceMode();
    this.setupGlobalEventListeners();
  }

  /**
   * Execute a single animation step
   */
  async executeAnimation(step: AnimationStep, elementRef: HTMLElement): Promise<void> {
    if (this.reducedMotion) {
      return this.executeReducedMotionAnimation(step, elementRef);
    }

    const { animation, elementId } = step;
    const config = this.buildAnimationConfig(animation);

    try {
      // Create animation based on effect type
      const controls = await this.createAnimation(
        elementRef,
        animation.effect,
        config
      );

      this.currentAnimations.set(elementId, controls);
      
      // Execute the animation
      await controls.play();
      
      // Cleanup
      this.currentAnimations.delete(elementId);
    } catch (error) {
      console.error(`Animation failed for element ${elementId}:`, error);
      // Apply fallback - just show the element
      this.applyFallbackAnimation(elementRef, animation.effect);
    }
  }

  /**
   * Execute slide transition
   */
  async executeSlideTransition(
    transition: SlideTransition,
    currentSlideRef: HTMLElement,
    nextSlideRef: HTMLElement,
    direction: 'forward' | 'backward' = 'forward'
  ): Promise<void> {
    if (this.reducedMotion) {
      return this.executeReducedMotionTransition(currentSlideRef, nextSlideRef);
    }

    const config: AnimationConfig = {
      duration: transition.duration,
      delay: 0,
      easing: transition.easing,
      direction: transition.direction,
    };

    try {
      await this.createSlideTransition(
        transition.type,
        currentSlideRef,
        nextSlideRef,
        config,
        direction
      );
    } catch (error) {
      console.error('Slide transition failed:', error);
      // Fallback to instant transition
      this.applyFallbackTransition(currentSlideRef, nextSlideRef);
    }
  }

  /**
   * Stop all running animations
   */
  stopAllAnimations(): void {
    this.currentAnimations.forEach(controls => {
      controls.stop();
    });
    this.currentAnimations.clear();
    this.isPlaying = false;
    this.isPaused = false;
  }

  /**
   * Pause all running animations
   */
  pauseAllAnimations(): void {
    this.currentAnimations.forEach(controls => {
      controls.pause();
    });
    this.isPaused = true;
  }

  /**
   * Resume all paused animations
   */
  resumeAllAnimations(): void {
    this.currentAnimations.forEach(controls => {
      controls.play();
    });
    this.isPaused = false;
  }

  /**
   * Create animation based on effect type
   */
  private async createAnimation(
    element: HTMLElement,
    effect: ElementAnimation['effect'],
    config: AnimationConfig
  ): Promise<AnimationControls> {
    // Store initial styles
    const initialStyles = this.captureElementStyles(element);
    
    // Apply initial animation state
    this.applyInitialAnimationState(element, effect);

    // Create Framer Motion-style animation
    return this.createFramerMotionAnimation(element, effect, config, initialStyles);
  }

  /**
   * Create Framer Motion-style animations using Web Animations API
   * (since we're not using React components here, we use WAAPI)
   */
  private async createFramerMotionAnimation(
    element: HTMLElement,
    effect: ElementAnimation['effect'],
    config: AnimationConfig,
    initialStyles: Record<string, string>
  ): Promise<AnimationControls> {
    
    const keyframes = this.buildKeyframes(effect, config, initialStyles);
    const options: KeyframeAnimationOptions = {
      duration: config.duration,
      delay: config.delay,
      easing: this.convertEasing(config.easing),
      fill: 'both',
    };

    const animation = element.animate(keyframes, options);

    return {
      play: () => {
        animation.play();
        return animation.finished;
      },
      pause: () => {
        animation.pause();
      },
      stop: () => {
        animation.cancel();
        // Reset to initial state
        this.resetElementStyles(element, initialStyles);
      },
      reverse: async () => {
        animation.reverse();
        return animation.finished;
      },
      seek: (progress: number) => {
        animation.currentTime = (animation.effect?.getTiming().duration as number) * progress;
      },
    };
  }

  /**
   * Build keyframes for different animation effects
   */
  private buildKeyframes(
    effect: ElementAnimation['effect'],
    config: AnimationConfig,
    initialStyles: Record<string, string>
  ): Keyframe[] {
    switch (effect) {
      case 'fade':
        return [
          { opacity: 0 },
          { opacity: 1 }
        ];

      case 'slide':
        return this.buildSlideKeyframes(config.direction || 'left');

      case 'zoom':
        return [
          { transform: 'scale(0)', opacity: 0 },
          { transform: 'scale(1)', opacity: 1 }
        ];

      case 'bounce':
        return [
          { transform: 'scale(0) translateY(100px)', opacity: 0 },
          { transform: 'scale(1.1) translateY(-10px)', opacity: 1, offset: 0.7 },
          { transform: 'scale(1) translateY(0)', opacity: 1 }
        ];

      case 'spin':
        return [
          { transform: 'rotate(0deg) scale(0)', opacity: 0 },
          { transform: 'rotate(360deg) scale(1)', opacity: 1 }
        ];

      case 'wipe':
        return this.buildWipeKeyframes(config.direction || 'right');

      default:
        return [
          { opacity: 0 },
          { opacity: 1 }
        ];
    }
  }

  /**
   * Build slide animation keyframes
   */
  private buildSlideKeyframes(direction: string): Keyframe[] {
    const distance = '100px';
    
    switch (direction) {
      case 'up':
        return [
          { transform: `translateY(${distance})`, opacity: 0 },
          { transform: 'translateY(0)', opacity: 1 }
        ];
      case 'down':
        return [
          { transform: `translateY(-${distance})`, opacity: 0 },
          { transform: 'translateY(0)', opacity: 1 }
        ];
      case 'left':
        return [
          { transform: `translateX(${distance})`, opacity: 0 },
          { transform: 'translateX(0)', opacity: 1 }
        ];
      case 'right':
        return [
          { transform: `translateX(-${distance})`, opacity: 0 },
          { transform: 'translateX(0)', opacity: 1 }
        ];
      default:
        return [
          { transform: `translateX(-${distance})`, opacity: 0 },
          { transform: 'translateX(0)', opacity: 1 }
        ];
    }
  }

  /**
   * Build wipe animation keyframes
   */
  private buildWipeKeyframes(direction: string): Keyframe[] {
    switch (direction) {
      case 'left':
        return [
          { clipPath: 'inset(0 100% 0 0)' },
          { clipPath: 'inset(0 0 0 0)' }
        ];
      case 'right':
        return [
          { clipPath: 'inset(0 0 0 100%)' },
          { clipPath: 'inset(0 0 0 0)' }
        ];
      case 'up':
        return [
          { clipPath: 'inset(100% 0 0 0)' },
          { clipPath: 'inset(0 0 0 0)' }
        ];
      case 'down':
        return [
          { clipPath: 'inset(0 0 100% 0)' },
          { clipPath: 'inset(0 0 0 0)' }
        ];
      default:
        return [
          { clipPath: 'inset(0 100% 0 0)' },
          { clipPath: 'inset(0 0 0 0)' }
        ];
    }
  }

  /**
   * Create slide transitions
   */
  private async createSlideTransition(
    type: TransitionType,
    currentSlide: HTMLElement,
    nextSlide: HTMLElement,
    config: AnimationConfig,
    direction: 'forward' | 'backward'
  ): Promise<void> {
    const container = currentSlide.parentElement;
    if (!container) return;

    switch (type) {
      case 'fade':
        await this.executeFadeTransition(currentSlide, nextSlide, config);
        break;
      case 'push':
        await this.executePushTransition(currentSlide, nextSlide, config, direction);
        break;
      case 'zoom':
        await this.executeZoomTransition(currentSlide, nextSlide, config, direction);
        break;
      case 'slide':
        await this.executeSlideTransitionInternal(currentSlide, nextSlide, config, direction);
        break;
      case 'flip':
        await this.executeFlipTransition(currentSlide, nextSlide, config, direction);
        break;
      case 'morph':
        await this.executeMorphTransition(currentSlide, nextSlide, config);
        break;
      default:
        await this.executeFadeTransition(currentSlide, nextSlide, config);
    }
  }

  /**
   * Execute fade transition
   */
  private async executeFadeTransition(
    currentSlide: HTMLElement,
    nextSlide: HTMLElement,
    config: AnimationConfig
  ): Promise<void> {
    nextSlide.style.opacity = '0';
    nextSlide.style.position = 'absolute';
    nextSlide.style.top = '0';
    nextSlide.style.left = '0';
    nextSlide.style.width = '100%';
    nextSlide.style.height = '100%';

    const fadeOut = currentSlide.animate([
      { opacity: 1 },
      { opacity: 0 }
    ], {
      duration: config.duration / 2,
      easing: this.convertEasing(config.easing),
      fill: 'both'
    });

    const fadeIn = nextSlide.animate([
      { opacity: 0 },
      { opacity: 1 }
    ], {
      duration: config.duration / 2,
      delay: config.duration / 2,
      easing: this.convertEasing(config.easing),
      fill: 'both'
    });

    await Promise.all([fadeOut.finished, fadeIn.finished]);
  }

  /**
   * Execute push transition
   */
  private async executePushTransition(
    currentSlide: HTMLElement,
    nextSlide: HTMLElement,
    config: AnimationConfig,
    direction: 'forward' | 'backward'
  ): Promise<void> {
    const slideDirection = direction === 'forward' ? 'left' : 'right';
    const distance = '100%';

    // Position next slide
    nextSlide.style.position = 'absolute';
    nextSlide.style.top = '0';
    nextSlide.style.width = '100%';
    nextSlide.style.height = '100%';
    
    if (slideDirection === 'left') {
      nextSlide.style.left = '100%';
    } else {
      nextSlide.style.left = '-100%';
    }

    const pushOut = currentSlide.animate([
      { transform: 'translateX(0)' },
      { transform: `translateX(${slideDirection === 'left' ? '-100%' : '100%'})` }
    ], {
      duration: config.duration,
      easing: this.convertEasing(config.easing),
      fill: 'both'
    });

    const pushIn = nextSlide.animate([
      { transform: `translateX(${slideDirection === 'left' ? '100%' : '-100%'})` },
      { transform: 'translateX(0)' }
    ], {
      duration: config.duration,
      easing: this.convertEasing(config.easing),
      fill: 'both'
    });

    await Promise.all([pushOut.finished, pushIn.finished]);
  }

  /**
   * Execute zoom transition
   */
  private async executeZoomTransition(
    currentSlide: HTMLElement,
    nextSlide: HTMLElement,
    config: AnimationConfig,
    direction: 'forward' | 'backward'
  ): Promise<void> {
    nextSlide.style.position = 'absolute';
    nextSlide.style.top = '0';
    nextSlide.style.left = '0';
    nextSlide.style.width = '100%';
    nextSlide.style.height = '100%';

    const zoomOut = currentSlide.animate([
      { transform: 'scale(1)', opacity: 1 },
      { transform: 'scale(0.8)', opacity: 0 }
    ], {
      duration: config.duration / 2,
      easing: this.convertEasing(config.easing),
      fill: 'both'
    });

    const zoomIn = nextSlide.animate([
      { transform: 'scale(1.2)', opacity: 0 },
      { transform: 'scale(1)', opacity: 1 }
    ], {
      duration: config.duration / 2,
      delay: config.duration / 2,
      easing: this.convertEasing(config.easing),
      fill: 'both'
    });

    await Promise.all([zoomOut.finished, zoomIn.finished]);
  }

  /**
   * Execute slide transition (different from element slide animation)
   */
  private async executeSlideTransitionInternal(
    currentSlide: HTMLElement,
    nextSlide: HTMLElement,
    config: AnimationConfig,
    direction: 'forward' | 'backward'
  ): Promise<void> {
    // Similar to push but with different easing and timing
    return this.executePushTransition(currentSlide, nextSlide, {
      ...config,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' // Smoother easing
    }, direction);
  }

  /**
   * Execute flip transition
   */
  private async executeFlipTransition(
    currentSlide: HTMLElement,
    nextSlide: HTMLElement,
    config: AnimationConfig,
    direction: 'forward' | 'backward'
  ): Promise<void> {
    nextSlide.style.position = 'absolute';
    nextSlide.style.top = '0';
    nextSlide.style.left = '0';
    nextSlide.style.width = '100%';
    nextSlide.style.height = '100%';
    nextSlide.style.backfaceVisibility = 'hidden';
    
    const flipOut = currentSlide.animate([
      { transform: 'perspective(1000px) rotateY(0deg)' },
      { transform: 'perspective(1000px) rotateY(-90deg)' }
    ], {
      duration: config.duration / 2,
      easing: this.convertEasing(config.easing),
      fill: 'both'
    });

    const flipIn = nextSlide.animate([
      { transform: 'perspective(1000px) rotateY(90deg)' },
      { transform: 'perspective(1000px) rotateY(0deg)' }
    ], {
      duration: config.duration / 2,
      delay: config.duration / 2,
      easing: this.convertEasing(config.easing),
      fill: 'both'
    });

    await Promise.all([flipOut.finished, flipIn.finished]);
  }

  /**
   * Execute morph transition (advanced)
   */
  private async executeMorphTransition(
    currentSlide: HTMLElement,
    nextSlide: HTMLElement,
    config: AnimationConfig
  ): Promise<void> {
    // For now, fallback to fade transition
    // In a full implementation, this would use View Transitions API or FLIP technique
    return this.executeFadeTransition(currentSlide, nextSlide, config);
  }

  /**
   * Build animation configuration
   */
  private buildAnimationConfig(animation: ElementAnimation): AnimationConfig {
    return {
      duration: this.adjustDurationForPerformance(animation.duration),
      delay: animation.delay,
      easing: this.normalizeEasing(animation.easing),
      direction: animation.direction,
    };
  }

  /**
   * Apply initial animation state
   */
  private applyInitialAnimationState(element: HTMLElement, effect: ElementAnimation['effect']): void {
    switch (effect) {
      case 'fade':
        element.style.opacity = '0';
        break;
      case 'slide':
        element.style.transform = 'translateX(-100px)';
        element.style.opacity = '0';
        break;
      case 'zoom':
        element.style.transform = 'scale(0)';
        element.style.opacity = '0';
        break;
      case 'bounce':
        element.style.transform = 'scale(0) translateY(100px)';
        element.style.opacity = '0';
        break;
      case 'spin':
        element.style.transform = 'rotate(0deg) scale(0)';
        element.style.opacity = '0';
        break;
      case 'wipe':
        element.style.clipPath = 'inset(0 100% 0 0)';
        break;
    }
  }

  /**
   * Capture element styles for restoration
   */
  private captureElementStyles(element: HTMLElement): Record<string, string> {
    const computedStyles = getComputedStyle(element);
    return {
      opacity: computedStyles.opacity,
      transform: computedStyles.transform,
      clipPath: computedStyles.clipPath,
      visibility: computedStyles.visibility,
    };
  }

  /**
   * Reset element styles
   */
  private resetElementStyles(element: HTMLElement, styles: Record<string, string>): void {
    Object.entries(styles).forEach(([property, value]) => {
      element.style.setProperty(property, value);
    });
  }

  /**
   * Convert easing string to CSS easing
   */
  private convertEasing(easing: string): string {
    const easingMap: Record<string, string> = {
      'ease': 'ease',
      'ease-in': 'ease-in',
      'ease-out': 'ease-out',
      'ease-in-out': 'ease-in-out',
      'linear': 'linear',
      'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      'elastic': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      'back': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    };

    return easingMap[easing] || easing;
  }

  /**
   * Normalize easing string
   */
  private normalizeEasing(easing: string): string {
    // Handle PowerPoint-style easing names
    const easingMap: Record<string, string> = {
      'smooth': 'ease-in-out',
      'fast': 'ease-out',
      'slow': 'ease-in',
      'bouncy': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    };

    return easingMap[easing] || easing;
  }

  /**
   * Adjust duration based on performance mode
   */
  private adjustDurationForPerformance(duration: number): number {
    switch (this.performanceMode) {
      case 'low':
        return Math.max(duration * 0.5, 100); // Faster animations
      case 'medium':
        return Math.max(duration * 0.75, 150);
      case 'high':
      default:
        return duration;
    }
  }

  /**
   * Detect if reduced motion is preferred
   */
  private detectReducedMotion(): boolean {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  }

  /**
   * Detect performance mode based on device capabilities
   */
  private detectPerformanceMode(): 'high' | 'medium' | 'low' {
    // Simple heuristic based on available features and performance
    if (!window.requestAnimationFrame || !document.documentElement.animate) {
      return 'low';
    }
    
    // Check for hardware acceleration support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      return 'medium';
    }
    
    return 'high';
  }

  /**
   * Execute reduced motion animations
   */
  private async executeReducedMotionAnimation(
    step: AnimationStep,
    element: HTMLElement
  ): Promise<void> {
    // For reduced motion, just show/hide elements instantly
    element.style.opacity = '1';
    element.style.visibility = 'visible';
  }

  /**
   * Execute reduced motion transitions
   */
  private async executeReducedMotionTransition(
    currentSlide: HTMLElement,
    nextSlide: HTMLElement
  ): Promise<void> {
    currentSlide.style.display = 'none';
    nextSlide.style.display = 'block';
    nextSlide.style.opacity = '1';
  }

  /**
   * Apply fallback animation when main animation fails
   */
  private applyFallbackAnimation(element: HTMLElement, effect: ElementAnimation['effect']): void {
    // Simple fallback - just show the element
    element.style.opacity = '1';
    element.style.visibility = 'visible';
    element.style.transform = 'none';
    element.style.clipPath = 'none';
  }

  /**
   * Apply fallback transition when main transition fails
   */
  private applyFallbackTransition(currentSlide: HTMLElement, nextSlide: HTMLElement): void {
    currentSlide.style.display = 'none';
    nextSlide.style.display = 'block';
    nextSlide.style.opacity = '1';
    nextSlide.style.position = 'static';
  }

  /**
   * Setup global event listeners
   */
  private setupGlobalEventListeners(): void {
    // Listen for reduced motion preference changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      mediaQuery.addListener((e) => {
        this.reducedMotion = e.matches;
        if (this.reducedMotion) {
          this.stopAllAnimations();
        }
      });
    }

    // Listen for visibility change to pause animations when tab is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseAllAnimations();
      } else {
        this.resumeAllAnimations();
      }
    });
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.stopAllAnimations();
    this.animationQueue = [];
  }
}

// Export singleton instance
export const animationEngine = new AnimationEngine();

// Export factory function for custom instances
export function createAnimationEngine(options?: {
  reducedMotion?: boolean;
  performanceMode?: 'high' | 'medium' | 'low';
}): AnimationEngine {
  return new AnimationEngine(options);
}