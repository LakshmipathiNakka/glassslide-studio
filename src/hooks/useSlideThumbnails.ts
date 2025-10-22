import { useState, useCallback, useRef, useEffect } from 'react';
import { Slide, SlideAction } from '@/types/slide-thumbnails';
import { Element } from '@/hooks/use-action-manager';
import { getDefaultSlideTemplate, createSlideFromTemplate } from '@/data/slideTemplates';

// Helper function to parse CSS gradients and create canvas gradients
const parseGradient = (gradientString: string, width: number, height: number, ctx: CanvasRenderingContext2D): CanvasGradient | null => {
    try {
      console.log('🎨 PARSING GRADIENT:', { 
        gradientString, 
        width, 
        height,
        stringLength: gradientString.length,
        firstChar: gradientString[0],
        lastChar: gradientString[gradientString.length - 1]
      });
      
      // More flexible regex to handle various gradient formats
      const match = gradientString.match(/linear-gradient\s*\(\s*([-\d.]+)deg\s*,\s*(.+)\s*\)/i);
      if (!match) {
        console.log('❌ GRADIENT PARSE FAILED - No match found for:', gradientString);
        console.log('❌ Trying alternative regex...');
        // Try without deg
        const altMatch = gradientString.match(/linear-gradient\s*\(\s*([-\d.]+)\s*,\s*(.+)\s*\)/i);
        if (altMatch) {
          console.log('✅ Alternative regex matched:', altMatch);
          const angle = parseFloat(altMatch[1]);
          const colorStopsString = altMatch[2];
          const colorStops = colorStopsString.split(/,(?![^(]*\))/).map(stop => stop.trim());
          console.log('🎨 GRADIENT PARSED (alt):', { angle, colorStopsString, colorStops });
          
          const angleRad = (angle % 360) * Math.PI / 180;
          const x0 = width/2 - Math.cos(angleRad) * width/2;
          const y0 = height/2 - Math.sin(angleRad) * height/2;
          const x1 = width/2 + Math.cos(angleRad) * width/2;
          const y1 = height/2 + Math.sin(angleRad) * height/2;
          
          const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
          
          colorStops.forEach((stop, i) => {
            console.log(`🎨 PARSING COLOR STOP ${i}:`, stop);
            const parts = stop.match(/(#[a-fA-F0-9]{3,8}|rgba?\([^)]*\)|[a-zA-Z]+)\s*(\d+%?)?/);
            if (parts) {
              const color = parts[1];
              let position = 0;
              if (parts[2]) {
                position = parts[2].endsWith('%') ? parseFloat(parts[2])/100 : parseFloat(parts[2]);
              } else {
                position = i / (colorStops.length - 1);
              }
              console.log(`✅ COLOR STOP ${i}:`, { color, position });
              gradient.addColorStop(position, color);
            } else {
              console.log('❌ COLOR STOP PARSE FAILED for:', stop);
            }
          });
          
          console.log('✅ GRADIENT CREATED SUCCESSFULLY (alt)');
          return gradient;
        }
        return null;
      }

    const angle = parseFloat(match[1]);
    const colorStopsString = match[2];
    const colorStops = colorStopsString.split(/,(?![^(]*\))/).map(stop => stop.trim());
    console.log('🎨 GRADIENT PARSED:', { angle, colorStopsString, colorStops });

    // Calculate gradient direction (CSS 0deg = top to bottom, 90deg = left to right)
    const angleRad = (angle % 360) * Math.PI / 180;
    const x0 = width/2 - Math.cos(angleRad) * width/2;
    const y0 = height/2 - Math.sin(angleRad) * height/2;
    const x1 = width/2 + Math.cos(angleRad) * width/2;
    const y1 = height/2 + Math.sin(angleRad) * height/2;

    console.log('🎨 GRADIENT COORDINATES:', { x0, y0, x1, y1 });

    const gradient = ctx.createLinearGradient(x0, y0, x1, y1);

    // Parse each stop (supports #hex, rgb(), rgba(), etc.)
    colorStops.forEach((stop, i) => {
      console.log(`🎨 PARSING COLOR STOP ${i}:`, stop);
      const parts = stop.match(/(#[a-fA-F0-9]{3,8}|rgba?\([^)]*\)|[a-zA-Z]+)\s*(\d+%?)?/);
      if (parts) {
        const color = parts[1];
        let position = 0;
        if (parts[2]) {
          position = parts[2].endsWith('%') ? parseFloat(parts[2])/100 : parseFloat(parts[2]);
        } else {
          position = i / (colorStops.length - 1);
        }
        console.log(`✅ COLOR STOP ${i}:`, { color, position });
        gradient.addColorStop(position, color);
      } else {
        console.log('❌ COLOR STOP PARSE FAILED for:', stop);
      }
    });

    console.log('✅ GRADIENT CREATED SUCCESSFULLY');
    return gradient;
  } catch (error) {
    console.error('❌ ERROR PARSING GRADIENT:', error);
    return null;
  }
};

interface UseSlideThumbnailsProps {
  slides: Slide[];
  currentSlide: number;
  onSlideChange: (index: number) => void;
  onAddSlide: () => void;
  onUpdateSlide: (index: number, updates: Partial<Slide>) => void;
  onReorderSlides?: (reorderedSlides: Slide[]) => void;
  onAddSlideAtIndex?: (index: number) => void;
  onDuplicateSlide?: (index: number) => void;
  onDeleteSlide?: (index: number) => void;
  onRenameSlide?: (index: number, title: string) => void;
  onChangeSlideBackground?: (index: number, background: string) => void;
  onAddSlideCover?: (index: number, coverImage: string) => void;
}

interface UseSlideThumbnailsReturn {
  // State
  slides: Slide[];
  currentSlide: number;
  isGeneratingThumbnails: boolean;
  
  // Actions
  handleSlideChange: (index: number) => void;
  handleAddSlide: () => void;
  handleAddSlideAtIndex: (index: number) => void;
  handleDuplicateSlide: (index: number) => void;
  handleDeleteSlide: (index: number) => void;
  handleReorderSlides: (reorderedSlides: Slide[]) => void;
  handleRenameSlide: (index: number, title: string) => void;
  handleSetSlideCategory: (index: number, category: Slide['category']) => void;
  handleAddSlideNotes: (index: number, notes: string) => void;
  handleChangeSlideBackground: (index: number, background: string) => void;
  handleAddSlideCover: (index: number, coverImage: string) => void;
  handleContextMenuAction: (action: SlideAction, slide: Slide, index: number) => void;
  
  // Thumbnail generation
  regenerateSlideThumbnail: (slideId: string) => void;
  handleSlideContentUpdate: (slideId: string, updates: Partial<Slide>) => void;
  generateThumbnail: (slide: Slide) => Promise<string>;
  generateAllThumbnails: () => Promise<void>;
  clearThumbnails: () => void;
  
  // Modal state
  showColorPicker: boolean;
  colorPickerPosition: { x: number; y: number };
  currentSlideForSettings: { slide: Slide; index: number } | null;
  handleColorChange: (color: string) => void;
}

export const useSlideThumbnails = ({
  slides: initialSlides,
  currentSlide: initialCurrentSlide,
  onSlideChange,
  onAddSlide,
  onUpdateSlide,
  onReorderSlides: parentOnReorderSlides,
  onAddSlideAtIndex,
  onDuplicateSlide,
  onDeleteSlide,
  onRenameSlide,
  onChangeSlideBackground,
  onAddSlideCover
}: UseSlideThumbnailsProps): UseSlideThumbnailsReturn => {
  const [slides, setSlides] = useState<Slide[]>(initialSlides);
  const [currentSlide, setCurrentSlide] = useState(initialCurrentSlide);
  const [isGeneratingThumbnails, setIsGeneratingThumbnails] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorPickerPosition, setColorPickerPosition] = useState({ x: 0, y: 0 });
  const [currentSlideForSettings, setCurrentSlideForSettings] = useState<{ slide: Slide; index: number } | null>(null);
  const thumbnailCache = useRef<Map<string, string>>(new Map());

  // Update slides when initial slides change
  useEffect(() => {
    setSlides(initialSlides);
  }, [initialSlides]);

  useEffect(() => {
    setCurrentSlide(initialCurrentSlide);
  }, [initialCurrentSlide]);


  // Helper function to load images asynchronously
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  // Generate thumbnail for a slide using off-screen canvas
  const generateThumbnail = useCallback(async (slide: Slide): Promise<string> => {
    console.log('🎨 GENERATING THUMBNAIL FOR SLIDE:', { 
      slide, 
      slideId: slide.id, 
      background: slide.background,
      backgroundType: typeof slide.background,
      slideKeys: Object.keys(slide)
    });
    
    // Check cache first
    if (thumbnailCache.current.has(slide.id)) {
      console.log('🎨 USING CACHED THUMBNAIL FOR:', slide.id);
      return thumbnailCache.current.get(slide.id)!;
    }

    console.log('🎨 NO CACHE FOUND, GENERATING NEW THUMBNAIL FOR:', slide.id);
    try {
      // Create off-screen canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Set canvas size (thumbnail size) - maintain 16:9 aspect ratio
      const width = 200;
      const height = 112;
      canvas.width = width;
      canvas.height = height;

      // Scale factor for rendering (200/1024 ≈ 0.195, 112/768 ≈ 0.146)
      const scale = Math.min(width / 1024, height / 768);

      // Draw background
      const backgroundValue = typeof slide.background === 'string' ? slide.background : (slide.background as any)?.background || '#ffffff';
      console.log('🎨 DRAWING BACKGROUND:', { 
        background: slide.background, 
        backgroundValue,
        backgroundType: typeof slide.background,
        isGradient: backgroundValue?.startsWith?.('linear-gradient'),
        slideKeys: Object.keys(slide),
        backgroundValueLength: backgroundValue?.length,
        backgroundValueChars: backgroundValue?.substring(0, 50) + '...'
      });
      
      if (backgroundValue && backgroundValue.startsWith('linear-gradient')) {
        // Handle gradient backgrounds
        console.log('🎨 PROCESSING GRADIENT BACKGROUND');
        
        // Test with a known good gradient first
        const testGradientString = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        console.log('🧪 TESTING WITH KNOWN GRADIENT:', testGradientString);
        const testGradient = parseGradient(testGradientString, width, height, ctx);
        if (testGradient) {
          console.log('✅ TEST GRADIENT PARSING WORKS');
        } else {
          console.log('❌ TEST GRADIENT PARSING FAILED');
        }
        
        const gradient = parseGradient(backgroundValue, width, height, ctx);
        if (gradient) {
          console.log('✅ USING PARSED GRADIENT');
          ctx.fillStyle = gradient;
        } else {
          console.log('❌ GRADIENT PARSING FAILED, CREATING FALLBACK GRADIENT');
          // Create a simple fallback gradient to verify gradient rendering works
          const fallbackGradient = ctx.createLinearGradient(0, 0, width, height);
          fallbackGradient.addColorStop(0, '#ff6b6b');
          fallbackGradient.addColorStop(0.5, '#4ecdc4');
          fallbackGradient.addColorStop(1, '#45b7d1');
          ctx.fillStyle = fallbackGradient;
          console.log('🎨 USING FALLBACK GRADIENT (red to teal to blue)');
        }
      } else {
        // Handle solid color backgrounds
        console.log('🎨 USING SOLID COLOR:', backgroundValue);
        ctx.fillStyle = backgroundValue;
      }
      ctx.fillRect(0, 0, width, height);
      console.log('🎨 BACKGROUND DRAWN');

      // Draw elements with pixel-perfect scaling
      for (const element of slide.elements) {
        const x = element.x * scale;
        const y = element.y * scale;
        const w = element.width * scale;
        const h = element.height * scale;

        ctx.save();

        // Apply rotation around element center
        if (element.rotation) {
          ctx.translate(x + w / 2, y + h / 2);
          ctx.rotate((element.rotation * Math.PI) / 180);
          ctx.translate(-w / 2, -h / 2);
        }

        // Apply opacity (if available)
        if ('opacity' in element && element.opacity !== undefined) {
          ctx.globalAlpha = element.opacity as number;
        }

        switch (element.type) {
          case 'text':
            // Set text properties with proper scaling
            ctx.fillStyle = element.color || '#000000';
            ctx.font = `${element.fontWeight || 'normal'} ${(element.fontSize || 16) * scale}px ${element.fontFamily || 'Arial'}`;
            ctx.textAlign = (element.textAlign as CanvasTextAlign) || 'left';
            ctx.textBaseline = 'top';
            
            // Apply text decoration
            if (element.textDecoration?.includes('underline')) {
              ctx.strokeStyle = element.color || '#000000';
              ctx.lineWidth = Math.max(1, scale);
              ctx.beginPath();
              ctx.moveTo(0, h - 2);
              ctx.lineTo(w, h - 2);
              ctx.stroke();
            }
            
            if (element.textDecoration?.includes('line-through')) {
              ctx.strokeStyle = element.color || '#000000';
              ctx.lineWidth = Math.max(1, scale);
              ctx.beginPath();
              ctx.moveTo(0, h / 2);
              ctx.lineTo(w, h / 2);
              ctx.stroke();
            }
            
            const text = element.text || element.content || element.placeholder || 'Text';
            const lines = text.split('\n');
            const lineHeight = (element.fontSize || 16) * scale * (element.lineHeight || 1.2);
            
            // Apply text transform
            let processedText = text;
            if (element.textTransform === 'uppercase') processedText = text.toUpperCase();
            else if (element.textTransform === 'lowercase') processedText = text.toLowerCase();
            else if (element.textTransform === 'capitalize') processedText = text.replace(/\b\w/g, l => l.toUpperCase());
            
            lines.forEach((line, index) => {
              const processedLine = element.textTransform === 'uppercase' ? line.toUpperCase() :
                                  element.textTransform === 'lowercase' ? line.toLowerCase() :
                                  element.textTransform === 'capitalize' ? line.replace(/\b\w/g, l => l.toUpperCase()) : line;
              ctx.fillText(processedLine, 0, index * lineHeight);
            });
            break;

          case 'shape':
            // Draw shape with proper scaling and styling
            if (element.shapeType === 'circle') {
              ctx.beginPath();
              ctx.arc(w / 2, h / 2, Math.min(w, h) / 2, 0, 2 * Math.PI);
              ctx.fillStyle = element.backgroundColor || element.fill || '#0078d4';
              ctx.fill();
              
              if (element.borderColor && element.borderWidth) {
                ctx.strokeStyle = element.borderColor;
                ctx.lineWidth = (element.borderWidth || 0) * scale;
                ctx.stroke();
              }
            } else if (element.shapeType === 'triangle') {
              ctx.beginPath();
              ctx.moveTo(w / 2, 0);
              ctx.lineTo(w, h);
              ctx.lineTo(0, h);
              ctx.closePath();
              ctx.fillStyle = element.backgroundColor || element.fill || '#0078d4';
              ctx.fill();
              
              if (element.borderColor && element.borderWidth) {
                ctx.strokeStyle = element.borderColor;
                ctx.lineWidth = (element.borderWidth || 0) * scale;
                ctx.stroke();
              }
            } else {
              // Rectangle or other shapes
              const borderRadius = (element.borderRadius || 0) * scale;
              if (borderRadius > 0) {
                ctx.beginPath();
                ctx.roundRect(0, 0, w, h, borderRadius);
                ctx.fillStyle = element.backgroundColor || element.fill || '#0078d4';
                ctx.fill();
                
                if (element.borderColor && element.borderWidth) {
                  ctx.strokeStyle = element.borderColor;
                  ctx.lineWidth = (element.borderWidth || 0) * scale;
                  ctx.stroke();
                }
              } else {
                ctx.fillStyle = element.backgroundColor || element.fill || '#0078d4';
                ctx.fillRect(0, 0, w, h);
                
                if (element.borderColor && element.borderWidth) {
                  ctx.strokeStyle = element.borderColor;
                  ctx.lineWidth = (element.borderWidth || 0) * scale;
                  ctx.strokeRect(0, 0, w, h);
                }
              }
            }
            break;

          case 'image':
            // Load and draw images asynchronously
            const imageSrc = (element as any).src;
            if (imageSrc) {
              try {
                const img = await loadImage(imageSrc);
                ctx.drawImage(img, 0, 0, w, h);
              } catch (error) {
                console.warn('Failed to load image:', imageSrc, error);
                // Draw placeholder
                ctx.fillStyle = '#f0f0f0';
                ctx.fillRect(0, 0, w, h);
                ctx.strokeStyle = '#d0d0d0';
                ctx.lineWidth = Math.max(1, scale);
                ctx.setLineDash([5, 5]);
                ctx.strokeRect(0, 0, w, h);
                ctx.setLineDash([]);
              }
            } else {
              // Draw placeholder
              ctx.fillStyle = '#f0f0f0';
              ctx.fillRect(0, 0, w, h);
              ctx.strokeStyle = '#d0d0d0';
              ctx.lineWidth = Math.max(1, scale);
              ctx.setLineDash([5, 5]);
              ctx.strokeRect(0, 0, w, h);
              ctx.setLineDash([]);
            }
            break;

          case 'chart':
            // Draw chart with proper styling
            ctx.fillStyle = element.backgroundColor || '#f8f9fa';
            ctx.fillRect(0, 0, w, h);
            
            if (element.borderColor && element.borderWidth) {
              ctx.strokeStyle = element.borderColor;
              ctx.lineWidth = (element.borderWidth || 2) * scale;
              ctx.strokeRect(0, 0, w, h);
            }
            
            // Draw simple chart representation
            if (element.chartData && element.chartType) {
              ctx.fillStyle = element.color || '#0078d4';
              ctx.font = `${12 * scale}px Arial`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(`${element.chartType.toUpperCase()} CHART`, w / 2, h / 2);
            }
            break;
        }

        ctx.restore();
      }

      // Convert to data URL
      const dataURL = canvas.toDataURL('image/png', 0.8);
      
      // Cache the thumbnail
      thumbnailCache.current.set(slide.id, dataURL);
      
      return dataURL;
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      // Return a placeholder thumbnail
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjExMiIgdmlld0JveD0iMCAwIDIwMCAxMTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTEyIiBmaWxsPSIjZjBmMGYwIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iNTYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U2xpZGUgUHJldmlldzwvdGV4dD4KPC9zdmc+';
    }
  }, []);

  // Generate thumbnails for all slides
  const generateAllThumbnails = useCallback(async () => {
    setIsGeneratingThumbnails(true);
    try {
      const updatedSlides = await Promise.all(
        slides.map(async (slide) => {
          const thumbnail = await generateThumbnail(slide);
          return { ...slide, thumbnail };
        })
      );
      setSlides(updatedSlides);
    } finally {
      setIsGeneratingThumbnails(false);
    }
  }, [slides, generateThumbnail]);

  // Clear all thumbnails
  const clearThumbnails = useCallback(() => {
    thumbnailCache.current.clear();
    setSlides(prev => prev.map(slide => ({ ...slide, thumbnail: undefined })));
  }, []);

  // Watch for slide content changes and regenerate thumbnails
  useEffect(() => {
    const regenerateThumbnailsForChangedSlides = async () => {
      for (const slide of slides) {
        // Check if slide has been updated recently (within last 2 seconds)
        const now = Date.now();
        const slideLastUpdated = (slide as any).lastUpdated;
        
        if (slideLastUpdated && (now - slideLastUpdated) < 2000) {
          // Regenerate thumbnail for this slide
          await generateThumbnail(slide).then(thumbnail => {
            setSlides(prev => prev.map(s => 
              s.id === slide.id ? { ...s, thumbnail } : s
            ));
          });
        }
      }
    };

    // Debounce thumbnail regeneration
    const timeoutId = setTimeout(regenerateThumbnailsForChangedSlides, 500);
    return () => clearTimeout(timeoutId);
  }, [slides, generateThumbnail]);

  // Event handlers
  const handleSlideChange = useCallback((index: number) => {
    setCurrentSlide(index);
    onSlideChange(index);
  }, [onSlideChange]);

  const handleAddSlide = useCallback(() => {
    onAddSlide();
  }, [onAddSlide]);

  const handleAddSlideAtIndex = useCallback(
    (selectedSlideIndex: number) => {
      const newSlideTemplate = getDefaultSlideTemplate();
      const newSlideId = `slide-${Date.now()}`;
      const newSlide = createSlideFromTemplate(newSlideTemplate, newSlideId);

      const newSlides = [...slides];
      newSlides.splice(selectedSlideIndex + 1, 0, newSlide);
      setSlides(newSlides);

      // Notify parent component about the new slide
      onUpdateSlide(selectedSlideIndex + 1, newSlide);

      // Generate thumbnail for the new slide
      generateThumbnail(newSlide).then(thumbnail => {
        setSlides(prev =>
          prev.map(s => (s.id === newSlide.id ? { ...s, thumbnail } : s))
        );
      });

      // Focus new slide
      setCurrentSlide(selectedSlideIndex + 1);
      onSlideChange(selectedSlideIndex + 1);
    },
    [slides, onSlideChange, generateThumbnail, onUpdateSlide]
  );

  // Keyboard shortcuts removed

  const handleDuplicateSlide = useCallback((index: number) => {
    const slideToDuplicate = slides[index];
    if (!slideToDuplicate) return;

    const duplicatedSlide: Slide = {
      ...slideToDuplicate,
      id: `slide-${Date.now()}`,
      title: `${slideToDuplicate.title || `Slide ${index + 1}`} (Copy)`,
      createdAt: new Date(),
      thumbnail: undefined, // Will be generated
    };

    const newSlides = [...slides];
    newSlides.splice(index + 1, 0, duplicatedSlide);
    setSlides(newSlides);

    // Notify parent component about the duplicated slide
    onUpdateSlide(index + 1, duplicatedSlide);

    // Generate thumbnail for the new slide
    generateThumbnail(duplicatedSlide).then(thumbnail => {
      setSlides(prev => prev.map(slide => 
        slide.id === duplicatedSlide.id ? { ...slide, thumbnail } : slide
      ));
    });
  }, [slides, generateThumbnail, onUpdateSlide]);

  const handleDeleteSlide = useCallback((index: number) => {
    if (slides.length <= 1) return; // Don't delete the last slide

    const newSlides = slides.filter((_, i) => i !== index);
    setSlides(newSlides);

    // Notify parent component about the slide deletion
    // We need to update the parent with the new slides array
    // Since we can't pass the entire array through onUpdateSlide,
    // we'll need to handle this differently
    onUpdateSlide(index, { _deleted: true } as any);

    // Adjust current slide if necessary
    if (currentSlide >= newSlides.length) {
      const newCurrentSlide = newSlides.length - 1;
      setCurrentSlide(newCurrentSlide);
      onSlideChange(newCurrentSlide);
    } else if (currentSlide > index) {
      const newCurrentSlide = currentSlide - 1;
      setCurrentSlide(newCurrentSlide);
      onSlideChange(newCurrentSlide);
    }
  }, [slides, currentSlide, onSlideChange, onUpdateSlide]);

  const handleReorderSlides = useCallback((reorderedSlides: Slide[]) => {
    console.log('🔧 USE SLIDE THUMBNAILS - handleReorderSlides called:', {
      hasParentOnReorderSlides: !!parentOnReorderSlides,
      reorderedSlidesLength: reorderedSlides.length,
      reorderedSlidesIds: reorderedSlides.map(s => s.id)
    });
    
    // If parent provides a reorder callback, use it directly
    if (parentOnReorderSlides) {
      console.log('🔧 USE SLIDE THUMBNAILS - Calling parentOnReorderSlides');
      parentOnReorderSlides(reorderedSlides);
      return;
    }

    // Fallback: update local state
    setSlides(reorderedSlides);

    // Update current slide index to point to the same slide
    const currentSlideId = slides[currentSlide]?.id;
    const newCurrentIndex = reorderedSlides.findIndex(s => s.id === currentSlideId);
    
    if (newCurrentIndex !== -1) {
      setCurrentSlide(newCurrentIndex);
      onSlideChange(newCurrentIndex);
    }
  }, [slides, currentSlide, onSlideChange, parentOnReorderSlides]);

  const handleRenameSlide = useCallback((index: number, title: string) => {
    const updatedSlides = [...slides];
    updatedSlides[index] = { ...updatedSlides[index], title };
    setSlides(updatedSlides);
    onUpdateSlide(index, { title });
  }, [slides, onUpdateSlide]);

  const handleSetSlideCategory = useCallback((index: number, category: Slide['category']) => {
    const updatedSlides = [...slides];
    updatedSlides[index] = { ...updatedSlides[index], category };
    setSlides(updatedSlides);
    onUpdateSlide(index, { category });
  }, [slides, onUpdateSlide]);

  const handleAddSlideNotes = useCallback((index: number, notes: string) => {
    const updatedSlides = [...slides];
    updatedSlides[index] = { ...updatedSlides[index], notes };
    setSlides(updatedSlides);
    onUpdateSlide(index, { notes });
  }, [slides, onUpdateSlide]);

  const handleChangeSlideBackground = useCallback((index: number, background: string) => {
    const updatedSlides = [...slides];
    updatedSlides[index] = { ...updatedSlides[index], background };
    setSlides(updatedSlides);
    onUpdateSlide(index, { background });

    // Clear cache for this slide to force regeneration
    const slideId = updatedSlides[index].id;
    const hadCache = thumbnailCache.current.has(slideId);
    thumbnailCache.current.delete(slideId);
    console.log('🎨 CLEARED CACHE FOR SLIDE:', { slideId, hadCache, cacheSize: thumbnailCache.current.size });

    // Regenerate thumbnail
    generateThumbnail(updatedSlides[index]).then(thumbnail => {
      setSlides(prev => prev.map(slide => 
        slide.id === updatedSlides[index].id ? { ...slide, thumbnail } : slide
      ));
    });
  }, [slides, onUpdateSlide, generateThumbnail]);

  // Function to regenerate thumbnail for a specific slide
  const regenerateSlideThumbnail = useCallback((slideId: string) => {
    const slide = slides.find(s => s.id === slideId);
    if (slide) {
      generateThumbnail(slide).then(thumbnail => {
        setSlides(prev => prev.map(s => 
          s.id === slideId ? { ...s, thumbnail } : s
        ));
      });
    }
  }, [slides, generateThumbnail]);

  // Function to handle slide content updates and regenerate thumbnail
  const handleSlideContentUpdate = useCallback((slideId: string, updates: Partial<Slide>) => {
    const updatedSlides = slides.map(slide => 
      slide.id === slideId ? { ...slide, ...updates } : slide
    );
    setSlides(updatedSlides);
    
    // Regenerate thumbnail for the updated slide
    const updatedSlide = updatedSlides.find(s => s.id === slideId);
    if (updatedSlide) {
      generateThumbnail(updatedSlide).then(thumbnail => {
        setSlides(prev => prev.map(s => 
          s.id === slideId ? { ...s, thumbnail } : s
        ));
      });
    }
  }, [slides, generateThumbnail]);


  const handleAddSlideCover = useCallback((index: number, coverImage: string) => {
    const updatedSlides = [...slides];
    updatedSlides[index] = { ...updatedSlides[index], thumbnail: coverImage };
    setSlides(updatedSlides);
    onUpdateSlide(index, { thumbnail: coverImage });
  }, [slides, onUpdateSlide]);



  const handleContextMenuAction = useCallback((action: SlideAction, slide: Slide, index: number) => {
    console.log('🎯 CONTEXT MENU ACTION:', { action, slideId: slide.id, index, hasOnAddSlideAtIndex: !!onAddSlideAtIndex });
    switch (action) {
      case 'add-new':
        console.log('➕ ADDING NEW SLIDE AT INDEX:', index);
        if (onAddSlideAtIndex) {
          onAddSlideAtIndex(index);
        } else {
          console.error('❌ onAddSlideAtIndex is not defined!');
        }
        break;
      case 'duplicate':
        onDuplicateSlide?.(index);
        break;
      case 'delete':
        onDeleteSlide?.(index);
        break;
      case 'change-background':
        // Open color picker for background
        // Position the color picker near the context menu
        setColorPickerPosition({ x: 300, y: 200 }); // Better default position
        setCurrentSlideForSettings({ slide, index });
        setShowColorPicker(true);
        break;
      case 'add-cover':
        // This would open a file picker
        const coverUrl = prompt('Enter cover image URL:', slide.thumbnail || '');
        if (coverUrl) {
          onAddSlideCover?.(index, coverUrl);
        }
        break;
      case 'rename':
        const newTitle = prompt('Enter slide title:', slide.title || `Slide ${index + 1}`);
        if (newTitle) {
          onRenameSlide?.(index, newTitle);
        }
        break;
    }
  }, [
    onAddSlideAtIndex,
    onDuplicateSlide,
    onDeleteSlide,
    onRenameSlide,
    onAddSlideCover
  ]);

  // Modal handlers
  const handleColorChange = useCallback((color: string) => {
    console.log('🎨 COLOR CHANGE:', { color, currentSlideForSettings, hasOnChangeSlideBackground: !!onChangeSlideBackground });
    if (currentSlideForSettings) {
      console.log('🎨 CALLING onChangeSlideBackground:', { index: currentSlideForSettings.index, color });
      onChangeSlideBackground?.(currentSlideForSettings.index, color);
    } else {
      console.error('❌ No currentSlideForSettings found!');
    }
    setShowColorPicker(false);
  }, [currentSlideForSettings, onChangeSlideBackground]);

  return {
    slides,
    currentSlide,
    isGeneratingThumbnails,
    handleSlideChange,
    handleAddSlide,
    handleAddSlideAtIndex,
    handleDuplicateSlide,
    handleDeleteSlide,
    handleReorderSlides,
    handleRenameSlide,
    handleSetSlideCategory,
    handleAddSlideNotes,
    handleChangeSlideBackground,
    handleAddSlideCover,
    handleContextMenuAction,
    regenerateSlideThumbnail,
    handleSlideContentUpdate,
    generateThumbnail,
    generateAllThumbnails,
    clearThumbnails,
    // Modal state
    showColorPicker,
    colorPickerPosition,
    currentSlideForSettings,
    handleColorChange,
  };
};

export default useSlideThumbnails;
