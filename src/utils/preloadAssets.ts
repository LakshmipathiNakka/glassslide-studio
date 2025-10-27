import { PreloadableAsset, PreloadOptions, PresentationSlide } from '@/types/presentation';

/**
 * Asset preloading system for presentation mode
 * 
 * Features:
 * - Image preloading with OffscreenCanvas support
 * - Font preloading and validation
 * - Video preloading with metadata
 * - Slide thumbnail generation
 * - Concurrent loading with priority queues
 * - Memory management and cleanup
 * - Error handling and retries
 * - Progress tracking
 */

interface PreloadProgress {
  total: number;
  loaded: number;
  failed: number;
  percentage: number;
}

interface PreloadResult {
  success: PreloadableAsset[];
  failed: PreloadableAsset[];
  progress: PreloadProgress;
}

class AssetPreloader {
  private loadingQueue: PreloadableAsset[] = [];
  private loadedAssets: Map<string, PreloadableAsset> = new Map();
  private activeLoads: Map<string, Promise<PreloadableAsset>> = new Map();
  private offscreenCanvas: OffscreenCanvas | null = null;
  private offscreenContext: OffscreenCanvasRenderingContext2D | null = null;
  
  private defaultOptions: PreloadOptions = {
    maxConcurrent: 6,
    timeout: 10000,
    retryCount: 3,
    useOffscreenCanvas: true,
    preloadRadius: 2,
  };

  constructor(options?: Partial<PreloadOptions>) {
    this.defaultOptions = { ...this.defaultOptions, ...options };
    this.initializeOffscreenCanvas();
  }

  /**
   * Initialize OffscreenCanvas for image processing
   */
  private initializeOffscreenCanvas(): void {
    if (this.defaultOptions.useOffscreenCanvas && 'OffscreenCanvas' in window) {
      try {
        this.offscreenCanvas = new OffscreenCanvas(1024, 768);
        this.offscreenContext = this.offscreenCanvas.getContext('2d');
        console.log('OffscreenCanvas initialized for asset preloading');
      } catch (error) {
        console.warn('OffscreenCanvas not available, falling back to regular canvas:', error);
        this.defaultOptions.useOffscreenCanvas = false;
      }
    }
  }

  /**
   * Extract all preloadable assets from slides
   */
  extractAssetsFromSlides(slides: PresentationSlide[], currentIndex: number): PreloadableAsset[] {
    const assets: PreloadableAsset[] = [];
    const radius = this.defaultOptions.preloadRadius;
    
    // Determine which slides to preload based on current position and radius
    const startIndex = Math.max(0, currentIndex - radius);
    const endIndex = Math.min(slides.length - 1, currentIndex + radius);
    
    for (let i = startIndex; i <= endIndex; i++) {
      const slide = slides[i];
      const priority = this.calculatePriority(i, currentIndex);
      
      // Extract assets from slide elements
      slide.elements.forEach(element => {
        // Image elements
        if (element.type === 'image' && element.imageUrl) {
          assets.push({
            id: `${slide.id}-${element.id}-image`,
            type: 'image',
            url: element.imageUrl,
            priority,
            loaded: false,
          });
        }
        
        // Chart background images
        if (element.type === 'chart' && (element as any).backgroundImage) {
          assets.push({
            id: `${slide.id}-${element.id}-chart-bg`,
            type: 'image',
            url: (element as any).backgroundImage,
            priority,
            loaded: false,
          });
        }
      });
      
      // Slide background images
      if (slide.background && slide.background.startsWith('url(')) {
        const urlMatch = slide.background.match(/url\(['"]?([^'"]+)['"]?\)/);
        if (urlMatch) {
          assets.push({
            id: `${slide.id}-background`,
            type: 'image',
            url: urlMatch[1],
            priority: 'high', // Background images are always high priority
            loaded: false,
          });
        }
      }
      
      // Extract fonts from text elements
      const fonts = this.extractFontsFromSlide(slide);
      fonts.forEach(font => {
        assets.push({
          id: `${slide.id}-font-${font.replace(/\s+/g, '-')}`,
          type: 'font',
          url: font,
          priority,
          loaded: false,
        });
      });
    }
    
    return assets;
  }

  /**
   * Calculate loading priority based on distance from current slide
   */
  private calculatePriority(slideIndex: number, currentIndex: number): 'high' | 'medium' | 'low' {
    const distance = Math.abs(slideIndex - currentIndex);
    
    if (distance === 0) return 'high';
    if (distance === 1) return 'high';
    if (distance === 2) return 'medium';
    return 'low';
  }

  /**
   * Extract unique fonts from a slide
   */
  private extractFontsFromSlide(slide: PresentationSlide): string[] {
    const fonts = new Set<string>();
    
    slide.elements.forEach(element => {
      if (element.type === 'text' && element.fontFamily) {
        fonts.add(element.fontFamily);
      }
    });
    
    return Array.from(fonts);
  }

  /**
   * Preload assets with concurrent loading and priority handling
   */
  async preloadAssets(assets: PreloadableAsset[], options?: Partial<PreloadOptions>): Promise<PreloadResult> {
    const opts = { ...this.defaultOptions, ...options };
    
    // Sort by priority
    const sortedAssets = this.sortByPriority(assets);
    
    // Filter out already loaded assets
    const assetsToLoad = sortedAssets.filter(asset => !this.loadedAssets.has(asset.id));
    
    if (assetsToLoad.length === 0) {
      return {
        success: Array.from(this.loadedAssets.values()),
        failed: [],
        progress: { total: 0, loaded: 0, failed: 0, percentage: 100 },
      };
    }
    
    const results: PreloadResult = {
      success: [],
      failed: [],
      progress: { total: assetsToLoad.length, loaded: 0, failed: 0, percentage: 0 },
    };
    
    // Process assets in batches based on maxConcurrent
    const batches = this.createBatches(assetsToLoad, opts.maxConcurrent);
    
    for (const batch of batches) {
      const batchPromises = batch.map(asset => this.loadAssetWithRetry(asset, opts));
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        const asset = batch[index];
        
        if (result.status === 'fulfilled') {
          results.success.push(result.value);
          this.loadedAssets.set(asset.id, result.value);
          results.progress.loaded++;
        } else {
          const failedAsset: PreloadableAsset = {
            ...asset,
            loaded: false,
            error: result.reason?.message || 'Unknown error',
          };
          results.failed.push(failedAsset);
          results.progress.failed++;
        }
        
        results.progress.percentage = 
          ((results.progress.loaded + results.progress.failed) / results.progress.total) * 100;
      });
    }
    
    return results;
  }

  /**
   * Load a single asset with retry logic
   */
  private async loadAssetWithRetry(asset: PreloadableAsset, options: PreloadOptions): Promise<PreloadableAsset> {
    // Check if already loading
    if (this.activeLoads.has(asset.id)) {
      return this.activeLoads.get(asset.id)!;
    }
    
    const loadPromise = this.attemptLoadAsset(asset, options, 0);
    this.activeLoads.set(asset.id, loadPromise);
    
    try {
      const result = await loadPromise;
      this.activeLoads.delete(asset.id);
      return result;
    } catch (error) {
      this.activeLoads.delete(asset.id);
      throw error;
    }
  }

  /**
   * Attempt to load asset with retry mechanism
   */
  private async attemptLoadAsset(
    asset: PreloadableAsset, 
    options: PreloadOptions, 
    attempt: number
  ): Promise<PreloadableAsset> {
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Load timeout')), options.timeout);
      });
      
      const loadPromise = this.loadAssetByType(asset);
      
      const result = await Promise.race([loadPromise, timeoutPromise]);
      return { ...asset, loaded: true, data: result };
    } catch (error) {
      if (attempt < options.retryCount - 1) {
        // Wait before retry with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return this.attemptLoadAsset(asset, options, attempt + 1);
      }
      
      throw new Error(`Failed to load asset ${asset.id} after ${options.retryCount} attempts: ${error}`);
    }
  }

  /**
   * Load asset based on its type
   */
  private async loadAssetByType(asset: PreloadableAsset): Promise<any> {
    switch (asset.type) {
      case 'image':
        return this.loadImage(asset.url);
      case 'video':
        return this.loadVideo(asset.url);
      case 'font':
        return this.loadFont(asset.url);
      case 'slide':
        return this.generateSlideThumbnail(asset.url);
      default:
        throw new Error(`Unsupported asset type: ${asset.type}`);
    }
  }

  /**
   * Load image with optional OffscreenCanvas processing
   */
  private async loadImage(url: string): Promise<HTMLImageElement | ImageBitmap> {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    });
    
    img.src = url;
    const loadedImg = await loadPromise;
    
    // Process with OffscreenCanvas if available
    if (this.offscreenCanvas && this.offscreenContext) {
      try {
        return await this.processImageWithOffscreenCanvas(loadedImg);
      } catch (error) {
        console.warn('OffscreenCanvas processing failed, using original image:', error);
        return loadedImg;
      }
    }
    
    return loadedImg;
  }

  /**
   * Process image using OffscreenCanvas for better performance
   */
  private async processImageWithOffscreenCanvas(img: HTMLImageElement): Promise<ImageBitmap> {
    if (!this.offscreenCanvas || !this.offscreenContext) {
      throw new Error('OffscreenCanvas not available');
    }
    
    // Resize canvas to match image
    this.offscreenCanvas.width = img.naturalWidth;
    this.offscreenCanvas.height = img.naturalHeight;
    
    // Draw image to OffscreenCanvas
    this.offscreenContext.drawImage(img, 0, 0);
    
    // Create ImageBitmap for optimal rendering
    return createImageBitmap(this.offscreenCanvas);
  }

  /**
   * Load video with metadata
   */
  private async loadVideo(url: string): Promise<HTMLVideoElement> {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.crossOrigin = 'anonymous';
    
    return new Promise((resolve, reject) => {
      video.onloadedmetadata = () => resolve(video);
      video.onerror = () => reject(new Error(`Failed to load video: ${url}`));
      video.src = url;
    });
  }

  /**
   * Load and validate font
   */
  private async loadFont(fontFamily: string): Promise<FontFace | boolean> {
    if (!('FontFace' in window)) {
      // Fallback for older browsers - just return true if font might be available
      return document.fonts.check(`16px "${fontFamily}"`);
    }
    
    try {
      // Check if font is already loaded
      if (document.fonts.check(`16px "${fontFamily}"`)) {
        return true;
      }
      
      // For web fonts, we would need the font URL
      // This is a simplified version - in practice, you'd have a font URL
      await document.fonts.ready;
      return document.fonts.check(`16px "${fontFamily}"`);
    } catch (error) {
      console.warn(`Font loading failed for ${fontFamily}:`, error);
      return false;
    }
  }

  /**
   * Generate slide thumbnail (placeholder implementation)
   */
  private async generateSlideThumbnail(slideData: string): Promise<string> {
    // This would use the SlideRenderer to generate a thumbnail
    // For now, return a placeholder
    return new Promise(resolve => {
      setTimeout(() => resolve('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150"><rect width="200" height="150" fill="#f0f0f0"/></svg>'), 100);
    });
  }

  /**
   * Sort assets by priority
   */
  private sortByPriority(assets: PreloadableAsset[]): PreloadableAsset[] {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    
    return [...assets].sort((a, b) => {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Create loading batches based on concurrency limit
   */
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Get preloaded asset
   */
  getAsset(assetId: string): PreloadableAsset | null {
    return this.loadedAssets.get(assetId) || null;
  }

  /**
   * Check if asset is loaded
   */
  isAssetLoaded(assetId: string): boolean {
    const asset = this.loadedAssets.get(assetId);
    return asset ? asset.loaded : false;
  }

  /**
   * Get loading statistics
   */
  getStats(): { total: number; loaded: number; memory: number } {
    let memoryUsage = 0;
    
    this.loadedAssets.forEach(asset => {
      if (asset.data) {
        // Rough memory estimation
        if (asset.type === 'image' && asset.data instanceof HTMLImageElement) {
          memoryUsage += asset.data.naturalWidth * asset.data.naturalHeight * 4; // 4 bytes per pixel
        }
      }
    });
    
    return {
      total: this.loadedAssets.size,
      loaded: Array.from(this.loadedAssets.values()).filter(a => a.loaded).length,
      memory: memoryUsage,
    };
  }

  /**
   * Clear all loaded assets to free memory
   */
  clearAssets(): void {
    // Revoke object URLs to prevent memory leaks
    this.loadedAssets.forEach(asset => {
      if (asset.data && typeof asset.data === 'string' && asset.data.startsWith('blob:')) {
        URL.revokeObjectURL(asset.data);
      }
    });
    
    this.loadedAssets.clear();
    this.activeLoads.clear();
  }

  /**
   * Clear assets that are no longer needed
   */
  clearUnusedAssets(currentSlideIndex: number, slides: PresentationSlide[]): void {
    const radius = this.defaultOptions.preloadRadius;
    const keepRange = {
      start: Math.max(0, currentSlideIndex - radius),
      end: Math.min(slides.length - 1, currentSlideIndex + radius),
    };
    
    const assetsToKeep = new Set<string>();
    
    // Mark assets to keep
    for (let i = keepRange.start; i <= keepRange.end; i++) {
      const slide = slides[i];
      assetsToKeep.add(`${slide.id}-background`);
      
      slide.elements.forEach(element => {
        if (element.type === 'image') {
          assetsToKeep.add(`${slide.id}-${element.id}-image`);
        }
      });
    }
    
    // Remove assets not in keep list
    this.loadedAssets.forEach((asset, id) => {
      if (!assetsToKeep.has(id)) {
        // Revoke object URL if applicable
        if (asset.data && typeof asset.data === 'string' && asset.data.startsWith('blob:')) {
          URL.revokeObjectURL(asset.data);
        }
        this.loadedAssets.delete(id);
      }
    });
  }

  /**
   * Dispose of the preloader and clean up resources
   */
  dispose(): void {
    this.clearAssets();
    this.offscreenCanvas = null;
    this.offscreenContext = null;
  }
}

// Singleton instance for global use
export const assetPreloader = new AssetPreloader();

// Factory function for creating custom preloaders
export function createAssetPreloader(options?: Partial<PreloadOptions>): AssetPreloader {
  return new AssetPreloader(options);
}

// Utility functions
export async function preloadSlidesAssets(
  slides: PresentationSlide[], 
  currentIndex: number, 
  options?: Partial<PreloadOptions>
): Promise<PreloadResult> {
  const assets = assetPreloader.extractAssetsFromSlides(slides, currentIndex);
  return assetPreloader.preloadAssets(assets, options);
}

export function getAssetPreloadStats() {
  return assetPreloader.getStats();
}

export function clearAssetCache(): void {
  assetPreloader.clearAssets();
}

// React hook for using asset preloader
export function useAssetPreloader() {
  return {
    preloadAssets: (slides: PresentationSlide[], currentIndex: number, options?: Partial<PreloadOptions>) =>
      preloadSlidesAssets(slides, currentIndex, options),
    getAsset: (assetId: string) => assetPreloader.getAsset(assetId),
    isLoaded: (assetId: string) => assetPreloader.isAssetLoaded(assetId),
    getStats: () => assetPreloader.getStats(),
    clearCache: () => assetPreloader.clearAssets(),
    clearUnused: (currentIndex: number, slides: PresentationSlide[]) =>
      assetPreloader.clearUnusedAssets(currentIndex, slides),
  };
}