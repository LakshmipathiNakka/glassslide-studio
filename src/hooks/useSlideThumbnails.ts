import { useState, useCallback, useRef, useEffect } from 'react';
import { Slide, SlideAction } from '@/types/slide-thumbnails';
import { Element } from '@/hooks/use-action-manager';
import { getDefaultSlideTemplate, createSlideFromTemplate } from '@/data/slideTemplates';

interface UseSlideThumbnailsProps {
  slides: Slide[];
  currentSlide: number;
  onSlideChange: (index: number) => void;
  onAddSlide: () => void;
  onUpdateSlide: (index: number, updates: Partial<Slide>) => void;
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
  handleReorderSlides: (fromIndex: number, toIndex: number) => void;
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
  onUpdateSlide
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


  // Generate thumbnail for a slide using off-screen canvas
  const generateThumbnail = useCallback(async (slide: Slide): Promise<string> => {
    // Check cache first
    if (thumbnailCache.current.has(slide.id)) {
      return thumbnailCache.current.get(slide.id)!;
    }

    try {
      // Create off-screen canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Set canvas size (thumbnail size)
      const width = 200;
      const height = 112;
      canvas.width = width;
      canvas.height = height;

      // Scale factor for rendering
      const scale = 0.15;

      // Draw background
      ctx.fillStyle = slide.background || '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Draw elements
      for (const element of slide.elements) {
        const x = element.x * scale;
        const y = element.y * scale;
        const w = element.width * scale;
        const h = element.height * scale;

        ctx.save();

        // Apply rotation
        if (element.rotation) {
          ctx.translate(x + w / 2, y + h / 2);
          ctx.rotate((element.rotation * Math.PI) / 180);
          ctx.translate(-w / 2, -h / 2);
        }

        // Apply opacity (if available)
        if ('opacity' in element && element.opacity) {
          ctx.globalAlpha = element.opacity as number;
        }

        switch (element.type) {
          case 'text':
            ctx.fillStyle = element.color || '#000000';
            ctx.font = `${element.fontWeight || 'normal'} ${(element.fontSize || 16) * scale}px ${element.fontFamily || 'Arial'}`;
            ctx.textAlign = (element.textAlign as CanvasTextAlign) || 'left';
            ctx.textBaseline = 'top';
            
            const text = element.text || element.content || element.placeholder || 'Text';
            const lines = text.split('\n');
            const lineHeight = (element.fontSize || 16) * scale * 1.2;
            
            lines.forEach((line, index) => {
              ctx.fillText(line, 0, index * lineHeight);
            });
            break;

          case 'shape':
            if (element.shapeType === 'circle') {
              ctx.beginPath();
              ctx.arc(w / 2, h / 2, Math.min(w, h) / 2, 0, 2 * Math.PI);
              ctx.fillStyle = element.backgroundColor || '#0078d4';
              ctx.fill();
              
              if (element.borderColor && element.borderWidth) {
                ctx.strokeStyle = element.borderColor;
                ctx.lineWidth = (element.borderWidth || 0) * scale;
                ctx.stroke();
              }
            } else {
              ctx.fillStyle = element.backgroundColor || '#0078d4';
              ctx.fillRect(0, 0, w, h);
              
              if (element.borderColor && element.borderWidth) {
                ctx.strokeStyle = element.borderColor;
                ctx.lineWidth = (element.borderWidth || 0) * scale;
                ctx.strokeRect(0, 0, w, h);
              }
            }
            break;

          case 'image':
            // For images, we'd need to load them asynchronously
            // For now, draw a placeholder
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, w, h);
            ctx.strokeStyle = '#d0d0d0';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(0, 0, w, h);
            ctx.setLineDash([]);
            break;

          case 'chart':
            ctx.fillStyle = element.backgroundColor || '#f8f9fa';
            ctx.fillRect(0, 0, w, h);
            
            if (element.borderColor && element.borderWidth) {
              ctx.strokeStyle = element.borderColor;
              ctx.lineWidth = (element.borderWidth || 2) * scale;
              ctx.strokeRect(0, 0, w, h);
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

  const handleReorderSlides = useCallback((fromIndex: number, toIndex: number) => {
    const newSlides = [...slides];
    const [movedSlide] = newSlides.splice(fromIndex, 1);
    newSlides.splice(toIndex, 0, movedSlide);
    setSlides(newSlides);

    // Update current slide index
    if (currentSlide === fromIndex) {
      setCurrentSlide(toIndex);
      onSlideChange(toIndex);
    } else if (currentSlide > fromIndex && currentSlide <= toIndex) {
      const newCurrentSlide = currentSlide - 1;
      setCurrentSlide(newCurrentSlide);
      onSlideChange(newCurrentSlide);
    } else if (currentSlide < fromIndex && currentSlide >= toIndex) {
      const newCurrentSlide = currentSlide + 1;
      setCurrentSlide(newCurrentSlide);
      onSlideChange(newCurrentSlide);
    }
  }, [slides, currentSlide, onSlideChange]);

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
    switch (action) {
      case 'add-new':
        handleAddSlideAtIndex(index);
        break;
      case 'duplicate':
        handleDuplicateSlide(index);
        break;
      case 'delete':
        handleDeleteSlide(index);
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
          handleAddSlideCover(index, coverUrl);
        }
        break;
      case 'rename':
        const newTitle = prompt('Enter slide title:', slide.title || `Slide ${index + 1}`);
        if (newTitle) {
          handleRenameSlide(index, newTitle);
        }
        break;
      case 'add-notes':
        const notes = prompt('Enter slide notes:', slide.notes || '');
        if (notes !== null) {
          handleAddSlideNotes(index, notes);
        }
        break;
    }
  }, [
    handleAddSlideAtIndex,
    handleDuplicateSlide,
    handleDeleteSlide,
    handleChangeSlideBackground,
    handleRenameSlide,
    handleAddSlideNotes,
    handleAddSlideCover,
    slides,
    onUpdateSlide
  ]);

  // Modal handlers
  const handleColorChange = useCallback((color: string) => {
    if (currentSlideForSettings) {
      handleChangeSlideBackground(currentSlideForSettings.index, color);
    }
    setShowColorPicker(false);
  }, [currentSlideForSettings, handleChangeSlideBackground]);

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
