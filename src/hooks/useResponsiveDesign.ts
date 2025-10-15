import { useState, useEffect, useCallback, useMemo } from 'react';

interface Breakpoint {
  name: string;
  minWidth: number;
  maxWidth?: number;
  scale: number;
  fontSize: number;
  spacing: number;
}

interface ResponsiveConfig {
  breakpoints: Breakpoint[];
  defaultScale: number;
  minScale: number;
  maxScale: number;
  aspectRatio: number;
}

interface ViewportInfo {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  scale: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  orientation: 'portrait' | 'landscape';
}

// Default responsive configuration
const DEFAULT_CONFIG: ResponsiveConfig = {
  breakpoints: [
    {
      name: 'mobile',
      minWidth: 0,
      maxWidth: 768,
      scale: 0.5,
      fontSize: 14,
      spacing: 8
    },
    {
      name: 'tablet',
      minWidth: 768,
      maxWidth: 1024,
      scale: 0.75,
      fontSize: 16,
      spacing: 12
    },
    {
      name: 'desktop',
      minWidth: 1024,
      scale: 1,
      fontSize: 18,
      spacing: 16
    }
  ],
  defaultScale: 1,
  minScale: 0.25,
  maxScale: 2,
  aspectRatio: 16 / 9
};

export const useResponsiveDesign = (config: Partial<ResponsiveConfig> = {}) => {
  const [viewportInfo, setViewportInfo] = useState<ViewportInfo>({
    width: 0,
    height: 0,
    breakpoint: DEFAULT_CONFIG.breakpoints[0],
    scale: DEFAULT_CONFIG.defaultScale,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    orientation: 'landscape'
  });

  const mergedConfig = useMemo(() => ({
    ...DEFAULT_CONFIG,
    ...config
  }), [config]);

  // Get current breakpoint based on viewport width
  const getCurrentBreakpoint = useCallback((width: number): Breakpoint => {
    const breakpoint = mergedConfig.breakpoints.find(bp => 
      width >= bp.minWidth && (bp.maxWidth === undefined || width < bp.maxWidth)
    );
    return breakpoint || mergedConfig.breakpoints[mergedConfig.breakpoints.length - 1];
  }, [mergedConfig]);

  // Calculate responsive scale
  const calculateScale = useCallback((width: number, height: number, breakpoint: Breakpoint): number => {
    const { aspectRatio, minScale, maxScale } = mergedConfig;
    
    // Calculate scale based on available space
    const scaleByWidth = width / (1280 * breakpoint.scale);
    const scaleByHeight = height / (720 * breakpoint.scale);
    const scale = Math.min(scaleByWidth, scaleByHeight);
    
    // Clamp scale within bounds
    return Math.max(minScale, Math.min(maxScale, scale));
  }, [mergedConfig]);

  // Update viewport info
  const updateViewportInfo = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const breakpoint = getCurrentBreakpoint(width);
    const scale = calculateScale(width, height, breakpoint);
    const orientation = width > height ? 'landscape' : 'portrait';
    
    setViewportInfo({
      width,
      height,
      breakpoint,
      scale,
      isMobile: breakpoint.name === 'mobile',
      isTablet: breakpoint.name === 'tablet',
      isDesktop: breakpoint.name === 'desktop',
      orientation
    });
  }, [getCurrentBreakpoint, calculateScale]);

  // Handle window resize
  useEffect(() => {
    updateViewportInfo();
    
    const handleResize = () => {
      updateViewportInfo();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateViewportInfo]);

  // Calculate responsive dimensions
  const getResponsiveDimensions = useCallback((baseWidth: number, baseHeight: number) => {
    const { scale, breakpoint } = viewportInfo;
    const scaledWidth = baseWidth * scale * breakpoint.scale;
    const scaledHeight = baseHeight * scale * breakpoint.scale;
    
    return {
      width: scaledWidth,
      height: scaledHeight,
      scale: scale * breakpoint.scale
    };
  }, [viewportInfo]);

  // Calculate responsive font size
  const getResponsiveFontSize = useCallback((baseFontSize: number) => {
    const { scale, breakpoint } = viewportInfo;
    return baseFontSize * scale * breakpoint.scale;
  }, [viewportInfo]);

  // Calculate responsive spacing
  const getResponsiveSpacing = useCallback((baseSpacing: number) => {
    const { scale, breakpoint } = viewportInfo;
    return baseSpacing * scale * breakpoint.scale;
  }, [viewportInfo]);

  // Get responsive canvas dimensions
  const getCanvasDimensions = useCallback(() => {
    const { width, height, scale } = viewportInfo;
    const { aspectRatio } = mergedConfig;
    
    // Calculate canvas size maintaining aspect ratio
    let canvasWidth = width;
    let canvasHeight = height;
    
    if (width / height > aspectRatio) {
      canvasWidth = height * aspectRatio;
    } else {
      canvasHeight = width / aspectRatio;
    }
    
    return {
      width: canvasWidth,
      height: canvasHeight,
      scale,
      aspectRatio
    };
  }, [viewportInfo, mergedConfig]);

  // Get responsive styles for elements
  const getResponsiveStyles = useCallback((baseStyles: React.CSSProperties) => {
    const { scale, breakpoint } = viewportInfo;
    const responsiveStyles: React.CSSProperties = {};
    
    // Scale font sizes
    if (baseStyles.fontSize) {
      const fontSize = typeof baseStyles.fontSize === 'number' 
        ? baseStyles.fontSize 
        : parseInt(baseStyles.fontSize.toString());
      responsiveStyles.fontSize = fontSize * scale * breakpoint.scale;
    }
    
    // Scale dimensions
    if (baseStyles.width) {
      const width = typeof baseStyles.width === 'number' 
        ? baseStyles.width 
        : parseInt(baseStyles.width.toString());
      responsiveStyles.width = width * scale * breakpoint.scale;
    }
    
    if (baseStyles.height) {
      const height = typeof baseStyles.height === 'number' 
        ? baseStyles.height 
        : parseInt(baseStyles.height.toString());
      responsiveStyles.height = height * scale * breakpoint.scale;
    }
    
    // Scale padding and margins
    ['padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'].forEach(prop => {
      if (baseStyles[prop as keyof React.CSSProperties]) {
        const value = baseStyles[prop as keyof React.CSSProperties];
        if (typeof value === 'number') {
          (responsiveStyles as any)[prop] = value * scale * breakpoint.scale;
        }
      }
    });
    
    ['margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft'].forEach(prop => {
      if (baseStyles[prop as keyof React.CSSProperties]) {
        const value = baseStyles[prop as keyof React.CSSProperties];
        if (typeof value === 'number') {
          (responsiveStyles as any)[prop] = value * scale * breakpoint.scale;
        }
      }
    });
    
    return { ...baseStyles, ...responsiveStyles };
  }, [viewportInfo]);

  // Check if element is visible in viewport
  const isElementVisible = useCallback((element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const { width, height } = viewportInfo;
    
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= height &&
      rect.right <= width
    );
  }, [viewportInfo]);

  // Get optimal zoom level for content
  const getOptimalZoom = useCallback((contentWidth: number, contentHeight: number) => {
    const { width, height } = viewportInfo;
    const { aspectRatio } = mergedConfig;
    
    const scaleX = width / contentWidth;
    const scaleY = height / contentHeight;
    const scale = Math.min(scaleX, scaleY);
    
    return Math.max(mergedConfig.minScale, Math.min(mergedConfig.maxScale, scale));
  }, [viewportInfo, mergedConfig]);

  // Responsive touch handling
  const getTouchConfig = useCallback(() => {
    const { isMobile, isTablet } = viewportInfo;
    
    return {
      enableTouch: isMobile || isTablet,
      touchThreshold: isMobile ? 10 : 5,
      doubleTapThreshold: 300,
      pinchThreshold: 0.1,
      swipeThreshold: 50
    };
  }, [viewportInfo]);

  return {
    viewportInfo,
    getResponsiveDimensions,
    getResponsiveFontSize,
    getResponsiveSpacing,
    getCanvasDimensions,
    getResponsiveStyles,
    isElementVisible,
    getOptimalZoom,
    getTouchConfig,
    updateViewportInfo
  };
};

// Hook for responsive canvas scaling
export const useResponsiveCanvas = (baseWidth: number = 1280, baseHeight: number = 720) => {
  const { viewportInfo, getCanvasDimensions, getResponsiveDimensions } = useResponsiveDesign();
  
  const canvasDimensions = useMemo(() => {
    return getCanvasDimensions();
  }, [getCanvasDimensions]);
  
  const elementDimensions = useCallback((width: number, height: number) => {
    return getResponsiveDimensions(width, height);
  }, [getResponsiveDimensions]);
  
  const scale = useMemo(() => {
    return canvasDimensions.scale;
  }, [canvasDimensions.scale]);
  
  return {
    canvasDimensions,
    elementDimensions,
    scale,
    viewportInfo
  };
};

// Hook for responsive typography
export const useResponsiveTypography = () => {
  const { viewportInfo, getResponsiveFontSize } = useResponsiveDesign();
  
  const getFontSize = useCallback((baseSize: number) => {
    return getResponsiveFontSize(baseSize);
  }, [getResponsiveFontSize]);
  
  const getLineHeight = useCallback((fontSize: number, multiplier: number = 1.2) => {
    return fontSize * multiplier;
  }, []);
  
  const getFontWeight = useCallback((baseWeight: number | string) => {
    if (viewportInfo.isMobile) {
      // Slightly lighter on mobile for better readability
      if (typeof baseWeight === 'number') {
        return Math.max(300, baseWeight - 100);
      }
      return baseWeight;
    }
    return baseWeight;
  }, [viewportInfo.isMobile]);
  
  return {
    getFontSize,
    getLineHeight,
    getFontWeight,
    viewportInfo
  };
};

export default useResponsiveDesign;
