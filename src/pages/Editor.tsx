import { useState, useEffect, useCallback } from "react";
import { Toolbar } from "@/components/editor/Toolbar";
import SimplePowerPointCanvas from "@/components/canvas/SimplePowerPointCanvas";
import { SlideThumbnails } from "@/components/editor/SlideThumbnails";
import { ChartPanel } from "@/components/editor/ChartPanel";
import { SmartSidebar } from "@/components/editor/SmartSidebar";
import { SimplePresentationMode } from "@/components/editor/SimplePresentationMode";
import ShapeModal, { ShapeType } from "@/components/editor/ShapeModal";
import TableModal from "@/components/editor/TableModal";
import { useToast } from "@/hooks/use-toast";
import { useHistory } from "@/hooks/use-history";
import { usePersistence } from "@/hooks/use-persistence";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/landing/Logo";
import { Slide } from "@/types/slide-thumbnails";
import { Element } from "@/hooks/use-action-manager";
import pptxgen from "pptxgenjs";
import { useSmartLayoutApply } from "@/hooks/useSmartLayoutApply.tsx";
import { useAuth } from "@/auth/AuthProvider";
import { safeDecodeJwt } from "@/auth/jwt";
import { useUserProfile } from "@/auth/useUserProfile";
import { EditorLoader } from "@/components/editor/EditorLoader";
import { validatePresentation, sanitizeSlidesForPresentation, getValidationSummary } from "@/utils/presentationValidator";

// Default slide templates (Apple Keynote / PowerPoint inspired)
function createTitleSlidePlaceholders(now: number): Element[] {
  // Canonical slide size is 960x540 (16:9). Defaults mapped from 1280x720 at 0.75 scale
  const slideW = 960;
  const slideH = 540;
  const titleW = 600; // 800 * 0.75
  const titleH = 75;  // 100 * 0.75
  const titleX = Math.round((slideW - titleW) / 2);
  const titleY = 45; // 60 * 0.75

  const subtitleW = 600;
  const subtitleH = 60;
  const subtitleX = Math.round((slideW - subtitleW) / 2);
  const subtitleY = titleY + titleH + 20; // spacing 20px

  return [
    {
      id: `title-${now}`,
      type: 'text',
      x: titleX,
      y: titleY,
      width: titleW,
      height: titleH,
      text: '',
      placeholder: 'Click here to add Title',
      fontSize: 36,
      fontWeight: 'bold',
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif",
      textAlign: 'center',
      color: '#222',
    } as Element,
    {
      id: `subtitle-${now}`,
      type: 'text',
      x: subtitleX,
      y: subtitleY,
      width: subtitleW,
      height: subtitleH,
      text: '',
      placeholder: 'Click here to add Subtitle',
      fontSize: 24,
      fontWeight: 'normal',
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif",
      textAlign: 'center',
      color: '#666',
    } as Element,
  ];
}

function createContentSlidePlaceholders(now: number): Element[] {
  const slideW = 960;
  const slideH = 540;

  // Heading top-center (optional content slide heading)
  const headingW = 600;
  const headingH = 60;
  const headingX = Math.round((slideW - headingW) / 2);
  const headingY = 45;

  // Body centered
  const bodyW = 525; // 700 * 0.75
  const bodyH = 150; // 200 * 0.75
  const bodyX = Math.round((slideW - bodyW) / 2);
  const bodyY = Math.round((slideH - bodyH) / 2);

  return [
    {
      id: `heading-${now}`,
      type: 'text',
      x: headingX,
      y: headingY,
      width: headingW,
      height: headingH,
      text: '',
      placeholder: 'Click here to add Title',
      fontSize: 32,
      fontWeight: '600',
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif",
      textAlign: 'center',
      color: '#222',
    } as Element,
    {
      id: `body-${now}`,
      type: 'text',
      x: bodyX,
      y: bodyY,
      width: bodyW,
      height: bodyH,
      text: '',
      placeholder: 'Click here to add text',
      fontSize: 22,
      fontWeight: '400',
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif",
      textAlign: 'left',
      lineHeight: 1.5,
      color: '#555',
    } as Element,
  ];
}

const Editor = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [presentationTitle, setPresentationTitle] = useState('Untitled Presentation');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');
  
  const initialSlides: Slide[] = [{ 
    id: '1', 
    elements: createTitleSlidePlaceholders(Date.now()),
    background: '#ffffff',
    createdAt: new Date(),
    lastUpdated: Date.now()
  }];
  // Zoom state for canvas and toolbar (stored as decimal, e.g., 0.3 for 30%)
  const [zoom, setZoom] = useState<number>(1); // Start at 100%
  const { state: slides, push: pushSlides, undo, redo, canUndo, canRedo } = useHistory<Slide[]>(initialSlides);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [chartPanelOpen, setChartPanelOpen] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
  }, []);
  const [currentLayoutId, setCurrentLayoutId] = useState('title-slide');
  const [editingChart, setEditingChart] = useState<{ type: 'bar' | 'line' | 'pie'; data: any } | null>(null);
  const [liveElements, setLiveElements] = useState<Element[] | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [shapeModalOpen, setShapeModalOpen] = useState(false);
  const [tableModalOpen, setTableModalOpen] = useState(false);

  // Smart layout apply hook (Apple Keynote-style)
  const { requestApplyLayout, modal: layoutModal } = useSmartLayoutApply({
    getElements: () => slides[currentSlide]?.elements || [],
    setElements: (els) => {
      updateCurrentSlide(els as unknown as Element[]);
      setSelectedElement(null);
    },
    onApplied: (layoutId) => setCurrentLayoutId(layoutId),
  });

  // Auto-save to localStorage
  usePersistence(slides, (loadedSlides) => {
    // This will be called when data is loaded from localStorage
    // We need to update the history with the loaded data
    console.log('[Editor] Loaded slides from localStorage:', loadedSlides?.length || 0);
  });

  // Reload slides when window regains focus (e.g., returning from presentation mode)
  useEffect(() => {
    const handleFocus = () => {
      console.log('[Editor] Window focused - checking for updated slides');
      try {
        const saved = localStorage.getItem('glassslide-presentation');
        if (saved) {
          const parsedData = JSON.parse(saved);
          // Only reload if data is different from current state
          if (JSON.stringify(parsedData) !== JSON.stringify(slides)) {
            console.log('[Editor] Slides updated externally, reloading...');
            pushSlides(parsedData);
            
            // Show notification
            toast({
              title: 'Presentation Updated',
              description: 'Your slides have been updated from presentation mode',
              duration: 3000,
            });
          }
        }
      } catch (error) {
        console.error('[Editor] Failed to reload slides on focus:', error);
        toast({
          title: 'Sync Error',
          description: 'Failed to reload slides. Please refresh the page.',
          variant: 'destructive',
        });
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [slides, pushSlides, toast]);

  // Also listen for storage events (when localStorage is updated from another tab/window)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'glassslide-presentation' && e.newValue) {
        console.log('[Editor] Storage event detected - syncing slides');
        try {
          const parsedData = JSON.parse(e.newValue);
          if (JSON.stringify(parsedData) !== JSON.stringify(slides)) {
            console.log('[Editor] Syncing slides from storage event');
            pushSlides(parsedData);
            
            toast({
              title: 'Auto-Sync Complete',
              description: 'Slides synchronized in real-time',
              duration: 2000,
            });
          }
        } catch (error) {
          console.error('[Editor] Failed to sync from storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [slides, pushSlides, toast]);

  const currentElements = slides[currentSlide]?.elements || [];

  // Handle slide updates with synchronization
  const handleSlideUpdate = useCallback((elements: Element[]) => {
    if (!slides[currentSlide]) return;
    
    const updatedSlides = [...slides];
    updatedSlides[currentSlide] = {
      ...updatedSlides[currentSlide],
      elements,
      lastUpdated: Date.now()
    };
    
    pushSlides(updatedSlides);
    
    // Update the current slide reference to trigger re-renders
    setCurrentSlide(currentSlide);
    
  }, [currentSlide, pushSlides, slides]);

  // Note: useSlideSync removed - not compatible with SimplePowerPointCanvas
  // SimplePowerPointCanvas handles its own state management through onElementUpdate callbacks

  const updateCurrentSlide = (elements: Element[]) => {
    const newSlides = [...slides];
    newSlides[currentSlide] = {
      ...newSlides[currentSlide],
      elements,
    };
    pushSlides(newSlides);
  };

  const handleElementSelect = (element: Element | null) => {
    setSelectedElement(element);
  };

  const handleElementUpdate = (updatedElement: Element) => {
    const newElements = currentElements.map(el => 
      el.id === updatedElement.id ? updatedElement : el
    );
    updateCurrentSlide(newElements);
    setSelectedElement(updatedElement);
  };

  const handleElementDelete = (elementId: string) => {
    const newElements = currentElements.filter(el => el.id !== elementId);
    updateCurrentSlide(newElements);
    setSelectedElement(null);
  };

  const handleLayoutSelect = (layoutId: string) => {
    requestApplyLayout(layoutId);
  };


  const handleEditChart = (element: Element) => {
    if (element.type === 'chart' && element.chartData && element.chartType) {
      setEditingChart({
        type: element.chartType,
        data: element.chartData
      });
      setChartPanelOpen(true);
    }
  };

  const handleUpdateChart = (chartType: 'bar' | 'line' | 'pie', chartData: any) => {
    if (editingChart) {
      const newElements = currentElements.map(el => 
        el.id === selectedElement?.id 
          ? { ...el, chartType, chartData }
          : el
      );
      updateCurrentSlide(newElements);
      setEditingChart(null);
      
      toast({
        title: "Chart Updated",
        description: "Chart data has been updated.",
      });
    }
  };

  const handleAddText = () => {
    // Default text box size and position
    const slideW = 960, slideH = 540;
    const width = 400, height = 60; // More compact default size
    const x = Math.round((slideW - width) / 2); // Center horizontally
    const y = Math.round(slideH * 0.4); // Position slightly above vertical center

    const newElement = {
      id: `text-${Date.now()}`,
      type: 'text' as const,
      x,
      y,
      width,
      height,
      content: '',
      text: '',
      placeholder: 'Click to edit',
      fontSize: 22,
      fontWeight: 'normal' as const,
      fontStyle: 'normal' as const,
      textAlign: 'center' as const,
      color: '#000000', // Black text color
      lineHeight: 1.4,
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif",
      verticalAlign: 'middle' as const,
      padding: 8,
      borderStyle: 'solid' as const,
      borderColor: 'transparent',
      borderWidth: 0,
      zIndex: 1,
      opacity: 1
    };
    updateCurrentSlide([...currentElements, newElement]);
  };

  const handleAddImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "File Too Large",
            description: "Please select an image smaller than 10MB.",
            variant: "destructive"
          });
          return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid File Type",
            description: "Please select a valid image file.",
            variant: "destructive"
          });
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          // Default Image: 480x270 @1280 -> 360x203 @960, centered
          const slideW = 960, slideH = 540;
          const width = 360, height = 203;
          const x = Math.round((slideW - width) / 2);
          const y = Math.round((slideH - height) / 2);

          const newElement: Element = {
            id: Date.now().toString(),
            type: 'image',
            x,
            y,
            width,
            height,
            imageUrl: imageUrl,
            borderRadius: 6,
          } as any;
          updateCurrentSlide([...currentElements, newElement]);

          toast({
            title: "Image Added",
            description: "Image has been added to the slide.",
          });
        };

        reader.onerror = () => {
          toast({
            title: "Upload Error",
            description: "Failed to read the image file. Please try again.",
            variant: "destructive"
          });
        };

        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleAddShape = () => {
    setShapeModalOpen(true);
  };

  const handleSelectShape = (shapeType: ShapeType) => {
    // Default Shape: 200x120 @1280 -> 150x90 @960, centered
    const slideW = 960, slideH = 540;
    const width = 150, height = 90;
    const x = Math.round((slideW - width) / 2);
    const y = Math.round((slideH - height) / 2);

    const newElement: Element = {
      id: Date.now().toString(),
      type: 'shape',
      x,
      y,
      width,
      height,
      shapeType,
      fill: '#f5f5f5',
      stroke: '#cccccc',
      strokeWidth: 1,
      rotation: 0,
      opacity: 1,
      borderRadius: shapeType === 'rounded-rectangle' ? 8 : 0,
    } as any;
    updateCurrentSlide([...currentElements, newElement]);
    setSelectedElement(newElement);
    
    toast({
      title: "Shape Added",
      description: `${shapeType.charAt(0).toUpperCase() + shapeType.slice(1)} shape has been added to the slide.`,
    });
  };

  const handleAddChart = (chartType: 'bar' | 'line' | 'pie', chartData: any) => {
    // Default Chart: 600x350 @1280 -> 450x263 @960, centered
    const slideW = 960, slideH = 540;
    const width = 450, height = 263;
    const x = Math.round((slideW - width) / 2);
    const y = Math.round((slideH - height) / 2);

    const newElement: Element = {
      id: Date.now().toString(),
      type: 'chart',
      x,
      y,
      width,
      height,
      chartType,
      chartData,
      backgroundColor: '#ffffff',
      borderColor: '#e5e7eb',
      borderWidth: 1,
    } as any;
    updateCurrentSlide([...currentElements, newElement]);
  };

  const handleAddTable = () => {
    setTableModalOpen(true);
  };

  const handleConfirmTable = (rows: number, cols: number) => {
    const safeRows = Math.max(1, Math.min(20, rows || 1));
    const safeCols = Math.max(1, Math.min(20, cols || 1));
    const tableData = Array.from({ length: safeRows }, () => Array.from({ length: safeCols }, () => ''));

    // Default Table: 450x250 @1280 -> 338x188 @960, centered
    const slideW = 960, slideH = 540;
    const width = 338, height = 188;
    const x = Math.round((slideW - width) / 2);
    const y = Math.round((slideH - height) / 2);

    const newElement: Element = {
      id: Date.now().toString(),
      type: 'table',
      x,
      y,
      width,
      height,
      rows: safeRows,
      cols: safeCols,
      tableData,
      // Defaults aligned with professional editors
      themeId: 'keynote1',
      borderWidth: 1,
      borderColor: '#D9D9D9',
      backgroundColor: '#FFFFFF',
      color: '#000000',
      borderStyle: 'solid' as any,
      header: true,
      headerBg: '#E7E6E6',
      headerTextColor: '#000000',
      cellPadding: 12,
      cellTextAlign: 'left',
      rotation: 0,
      rowAltBg: '#fafafa',
    } as any;
    updateCurrentSlide([...currentElements, newElement]);
    setSelectedElement(newElement);
    setTableModalOpen(false);
  };

  const handleSave = () => {
    const data = JSON.stringify({ slides }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'presentation.json';
    a.click();
    
    toast({
      title: "Saved!",
      description: "Your presentation has been downloaded as JSON.",
    });
  };

  const navigate = useNavigate();


  const handleExport = async () => {
    if (isExporting) return; // Prevent double-clicks
    
    setIsExporting(true);
    try {
      const { exportSlidesToPPTX } = await import('@/utils/exporter');
      // Sanitize filename by removing invalid characters
      const sanitizedTitle = presentationTitle.replace(/[<>:"/\\|?*]/g, '-');
      const filename = `${sanitizedTitle}.pptx`;
      await exportSlidesToPPTX(slides, filename);
      toast({ 
        title: 'Export Successful!', 
        description: 'Your presentation has been exported to PowerPoint.' 
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({ 
        title: 'Export Failed', 
        description: 'Failed to export presentation. Please check your content and try again.', 
        variant: 'destructive' 
      });
    } finally {
      setIsExporting(false);
    }
  };


  const handleAddSlide = () => {
    const now = Date.now();
    const isFirst = slides.length === 0;
    const elements = isFirst
      ? createTitleSlidePlaceholders(now)
      : createContentSlidePlaceholders(now);

    const newSlide: Slide = { 
      id: now.toString(), 
      elements,
      background: '#ffffff',
      createdAt: new Date(),
      lastUpdated: now
    };
    const newSlides = [...slides, newSlide];
    pushSlides(newSlides);
    setCurrentSlide(slides.length);
  };

  const handleAddSlideAtIndex = (index: number) => {
    const now = Date.now();
    const elements = createContentSlidePlaceholders(now);
    const newSlide: Slide = { 
      id: now.toString(), 
      elements,
      background: '#ffffff',
      title: `Slide ${slides.length + 1}`,
      createdAt: new Date(),
      lastUpdated: now
    };
    const newSlides = [...slides];
    newSlides.splice(index + 1, 0, newSlide);
    pushSlides(newSlides);
    setCurrentSlide(index + 1);
  };

  const handleDuplicateSlide = (index: number) => {
    const slideToDuplicate = slides[index];
    if (!slideToDuplicate) return;

    const duplicatedSlide: Slide = {
      ...slideToDuplicate,
      id: Date.now().toString(),
      title: `${slideToDuplicate.title || `Slide ${index + 1}`} (Copy)`,
      createdAt: new Date(),
      lastUpdated: Date.now()
    };

    const newSlides = [...slides];
    newSlides.splice(index + 1, 0, duplicatedSlide);
    pushSlides(newSlides);
    setCurrentSlide(index + 1);
  };

  const handleDeleteSlide = (index: number) => {
    if (slides.length <= 1) {
      toast({
        title: "Cannot Delete",
        description: "Cannot delete the last slide.",
        variant: "destructive"
      });
      return;
    }

    const newSlides = slides.filter((_, i) => i !== index);
    pushSlides(newSlides);
    
    // Adjust current slide if necessary
    if (currentSlide >= newSlides.length) {
      setCurrentSlide(newSlides.length - 1);
    } else if (currentSlide > index) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleRenameSlide = (index: number, title: string) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], title, lastUpdated: Date.now() };
    pushSlides(newSlides);
  };


  const handleChangeSlideBackground = (index: number, background: string) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], background, lastUpdated: Date.now() };
    pushSlides(newSlides);
  };


  const handleReorderSlides = (reorderedSlides: Slide[]) => {
    // Update slides with timestamp
    const updatedSlides = reorderedSlides.map(slide => ({ ...slide, lastUpdated: Date.now() }));
    pushSlides(updatedSlides);
    
    // Keep the same current slide index - the content will stay with the same slide
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
        }
      } else {
        switch (e.key) {
          case 'F5':
            e.preventDefault();
            setPresentationMode(true);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Derive user display from auth token (fallback to defaults)
  const { token } = useAuth();
  const payload = token ? safeDecodeJwt(token) : null;
  const { data: profile } = useUserProfile();
  const userNameDisplay = (profile?.name || payload?.name || payload?.username || payload?.sub || 'User') as string;
  const userEmailDisplay = (profile?.email || payload?.email || '') as string;
  const userSubtitleDisplay = profile?.title as string | undefined;
  const userAvatarDisplay = profile?.avatarUrl as string | undefined;

  const handlePresent = useCallback(async () => {
    try {
      console.log('[Editor] Starting presentation mode');
      
      // Sanitize slides for presentation (remove placeholders and empty elements)
      const sanitizedSlides = sanitizeSlidesForPresentation(slides);
      
      console.log('[Editor] Sanitized slides:', sanitizedSlides.length);
      
      // Save to localStorage for presentation mode
      const deckId = `deck-${Date.now()}`;
      const deckPayload = {
        id: deckId,
        title: presentationTitle,
        slides: sanitizedSlides,
        createdAt: Date.now(),
        lastUpdated: Date.now(),
      };
      
      localStorage.setItem(`presentation-${deckId}`, JSON.stringify(deckPayload));
      console.log('[Editor] Saved presentation to localStorage');
      
      // Enter presentation mode
      setPresentationMode(true);
      
      // Try to enter fullscreen after a small delay
      setTimeout(async () => {
        try {
          await document.documentElement.requestFullscreen();
          console.log('[Editor] Entered fullscreen');
        } catch (e) {
          console.warn('Fullscreen not supported or was denied:', e);
        }
      }, 100);
      
    } catch (error) {
      console.error('Error entering presentation mode:', error);
      toast({
        title: 'Error',
        description: 'Failed to start presentation mode',
        variant: 'destructive'
      });
    }
  }, [slides, presentationTitle, toast]);

  // Show loader until loading is complete
  if (isLoading) {
    return <EditorLoader onLoadingComplete={() => setIsLoading(false)} />;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Skip Link for Accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      {/* Header */}
      <header className="glass-toolbar border-b" role="banner">
        <div className="container-fluid py-2 sm:py-3">
          <div className="flex-modern justify-between">
            <div className="flex-modern min-w-0 flex-1">
              <Logo />
              <div className="h-4 sm:h-6 w-px bg-border hidden sm:block" aria-hidden="true" />
              <div className="flex items-center">
                {isEditingTitle ? (
                  <input
                    type="text"
                    className="text-fluid-sm font-semibold text-foreground bg-transparent border-b border-foreground focus:outline-none focus:border-blue-500 min-w-[200px] px-1"
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onBlur={() => {
                      if (tempTitle.trim()) {
                        setPresentationTitle(tempTitle);
                      }
                      setIsEditingTitle(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (tempTitle.trim()) {
                          setPresentationTitle(tempTitle);
                        }
                        setIsEditingTitle(false);
                      } else if (e.key === 'Escape') {
                        setTempTitle(presentationTitle);
                        setIsEditingTitle(false);
                      }
                    }}
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={() => {
                      setTempTitle(presentationTitle);
                      setIsEditingTitle(true);
                    }}
                    className="text-fluid-sm font-semibold text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-2 py-1 transition-colors"
                    aria-label="Edit presentation title"
                  >
                    <span className="hidden sm:inline">{presentationTitle}</span>
                    <span className="sm:hidden">{presentationTitle.length > 15 ? `${presentationTitle.substring(0, 12)}...` : presentationTitle}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <Toolbar
        onAddText={handleAddText}
        onAddImage={handleAddImage}
        onAddShape={handleAddShape}
        onAddChart={() => setChartPanelOpen(true)}
        onAddTable={handleAddTable}
        onSave={handleSave}
        onExport={handleExport}
        onUndo={undo}
        onRedo={redo}
        onHomeClick={() => window.location.href = '/'}
        userName={userNameDisplay}
        userEmail={userEmailDisplay}
        userAvatar={userAvatarDisplay}
        userSubtitle={userSubtitleDisplay}
        onPresent={handlePresent}
        canUndo={canUndo}
        canRedo={canRedo}
        zoom={zoom}
        onZoomIn={() => {
          // Increase zoom by 10% (0.1) but not beyond 300% (3.0)
          setZoom((z) => {
            const newZoom = Math.min(3.0, Math.round((z + 0.1) * 10) / 10);
            return newZoom;
          });
        }}
        onZoomOut={() => {
          // Decrease zoom by 10% (0.1) but not below 30% (0.3)
          setZoom((z) => {
            const newZoom = Math.max(0.3, Math.round((z - 0.1) * 10) / 10);
            return newZoom;
          });
        }}
        isExporting={isExporting}
      />

      <main id="main-content" className="flex-1 flex lg:flex-row items-stretch w-full overflow-hidden" role="main">
        {/* Mobile: Slide Thumbnails at top */}
        <aside className="lg:hidden" role="complementary" aria-label="Slide thumbnails">
      <SlideThumbnails
            slides={slides}
            currentSlide={currentSlide}
            onSlideChange={setCurrentSlide}
            onAddSlide={handleAddSlide}
            onReorderSlides={handleReorderSlides}
            onUpdateSlide={(index, updates) => {
              const newSlides = [...slides];
              newSlides[index] = { ...newSlides[index], ...updates };
              pushSlides(newSlides);
            }}
            onAddSlideAtIndex={handleAddSlideAtIndex}
            onDuplicateSlide={handleDuplicateSlide}
            onDeleteSlide={handleDeleteSlide}
            onRenameSlide={handleRenameSlide}
            onChangeSlideBackground={handleChangeSlideBackground}
            liveElements={liveElements || undefined}
            liveSlideIndex={currentSlide}
          />
        </aside>

        {/* Desktop: Slide Thumbnails on left */}
        <aside className="hidden lg:block w-[260px] shrink-0" role="complementary" aria-label="Slide thumbnails">
          <SlideThumbnails
            slides={slides}
            currentSlide={currentSlide}
            onSlideChange={setCurrentSlide}
            onAddSlide={handleAddSlide}
            onReorderSlides={handleReorderSlides}
            onUpdateSlide={(index, updates) => {
              const newSlides = [...slides];
              newSlides[index] = { ...newSlides[index], ...updates };
              pushSlides(newSlides);
            }}
            onAddSlideAtIndex={handleAddSlideAtIndex}
            onDuplicateSlide={handleDuplicateSlide}
            onDeleteSlide={handleDeleteSlide}
            onRenameSlide={handleRenameSlide}
            onChangeSlideBackground={handleChangeSlideBackground}
          />
        </aside>

        {/* Main content area with canvas and sidebar */}
        <div className="flex-1 flex min-w-0 overflow-hidden">
          {/* Canvas Area - Takes remaining space */}
          <div className="flex-1 min-w-0 flex items-center bg-[#f0f2f5] dark:bg-[#1e1e1e] overflow-auto p-4 px-12 transition-colors duration-300">
            <section className="w-full h-full" aria-label="Presentation canvas">
              <SimplePowerPointCanvas
                  elements={currentElements}
                  background={slides[currentSlide]?.background || '#ffffff'}
                  onElementSelect={handleElementSelect}
                  onElementUpdate={(element) => {
                    const newElements = currentElements.map(el => 
                      el.id === element.id ? element : el
                    );
                    updateCurrentSlide(newElements);
                  }}
                  onElementAdd={(element) => {
                    const newElements = [...currentElements, element];
                    updateCurrentSlide(newElements);
                  }}
                  onLiveElementsChange={(els) => setLiveElements(els as any)}
                  zoom={zoom}
                />
            </section>
          </div>

          {/* Smart Sidebar - Context-aware Properties & Layouts */}
          <div className="w-[280px] flex-shrink-0 border-l border-gray-200 bg-white overflow-y-auto">
            <SmartSidebar
              selectedElement={selectedElement}
              onElementUpdate={(elementId: string, updates: Partial<Element>) => {
                const currentElement = slides[currentSlide]?.elements.find(el => el.id === elementId);
                if (currentElement) {
                  const updatedElement = { ...currentElement, ...updates };
                  const newElements = currentElements.map(el => 
                    el.id === elementId ? updatedElement : el
                  );
                  updateCurrentSlide(newElements);
                  setSelectedElement(updatedElement);
                }
              }}
              onElementDelete={handleElementDelete}
              onLayoutSelect={handleLayoutSelect}
              currentLayoutId={currentLayoutId}
            />
          </div>
        </div>
      </main>
      
      <ChartPanel
        open={chartPanelOpen}
        onClose={() => {
          setChartPanelOpen(false);
          setEditingChart(null);
        }}
        onAddChart={handleAddChart}
        onEditChart={handleUpdateChart}
        editingChart={editingChart}
      />
      
      
      {presentationMode && (
        <SimplePresentationMode
          slides={slides}
          currentSlide={currentSlide}
          onClose={() => setPresentationMode(false)}
        />
      )}
      

      {layoutModal}
      
      <ShapeModal
        isOpen={shapeModalOpen}
        onClose={() => setShapeModalOpen(false)}
        onSelectShape={handleSelectShape}
      />

      <TableModal
        isOpen={tableModalOpen}
        onClose={() => setTableModalOpen(false)}
        onConfirm={handleConfirmTable}
      />
    </div>
  );
};

export default Editor;
