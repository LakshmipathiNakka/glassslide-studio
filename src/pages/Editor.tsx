import { useState, useEffect, useCallback, useRef } from "react";
import { Toolbar } from "@/components/editor/Toolbar";
import SimplePowerPointCanvas from "@/components/canvas/SimplePowerPointCanvas";
import { SlideThumbnails } from "@/components/editor/SlideThumbnails";
import { ChartPanel } from "@/components/editor/ChartPanel";
import { Logo } from "@/components/landing/Logo";
import { SmartSidebar } from "@/components/editor/SmartSidebar";
import { SimplePresentationMode } from "@/components/editor/SimplePresentationMode";
import ShapeModal, { ShapeType } from "@/components/editor/ShapeModal";
import TableModal from "@/components/editor/TableModal";
import { useToast } from "@/hooks/use-toast";
import { useEditorHistory } from "@/hooks/use-editor-history";
import { usePersistence } from "@/hooks/use-persistence";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Slide } from "@/types/slide-thumbnails";
import { Element } from "@/hooks/use-action-manager";
import pptxgen from "pptxgenjs";
import { useSmartLayoutApply } from "@/hooks/useSmartLayoutApply.tsx";
import { EditorLoader } from "@/components/editor/EditorLoader";
import { validatePresentation, sanitizeSlidesForPresentation, getValidationSummary } from "@/utils/presentationValidator";
import { saveUserProject, GSlideProject, getUserProjects } from "@/utils/userProjectStorage";
import { SaveProjectDialog } from "@/components/editor/SaveProjectDialog";
import { OpenFileModal } from "@/components/editor/OpenFileModal";
import { LayoutWarningModal } from "@/components/editor/LayoutWarningModal";
import { TABLE_THEMES } from "@/constants/tableThemes";

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
      fontWeight: 'medium',
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
      fontWeight: 'normal',
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
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');
  const [presentationTitle, setPresentationTitle] = useState('Untitled Presentation');

  useEffect(() => {
    const handleTitleEdit = () => {
      setTempTitle(presentationTitle);
      setIsEditingTitle(true);
    };

    window.addEventListener('editTitle', handleTitleEdit);
    return () => {
      window.removeEventListener('editTitle', handleTitleEdit);
    };
  }, [presentationTitle]);

  const initialSlides: Slide[] = [{
    id: '1',
    elements: createTitleSlidePlaceholders(Date.now()),
    background: '#ffffff',
    createdAt: new Date(),
    lastUpdated: Date.now()
  }];
  // Zoom state for canvas and toolbar (stored as decimal, e.g., 0.3 for 30%)
  const [zoom, setZoom] = useState<number>(1); // Start at 100%
  const { state: slides, snapshot, push: pushSlides, undo, redo, canUndo, canRedo, pushSnapshot } = useEditorHistory<Slide>(
    initialSlides,
    { currentSlide: 0, selectedElementId: null, zoom }
  );
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

  // Keep local UI state in sync with history snapshot (for undo/redo reliability)
  const prevSnapshotSelectedId = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const snap = snapshot as any;

    if (typeof snap?.currentSlide === 'number' && snap.currentSlide !== currentSlide) {
      setCurrentSlide(snap.currentSlide);
    }
    if (typeof snap?.zoom === 'number' && snap.zoom !== zoom) {
      setZoom(snap.zoom);
    }
    if (typeof snap?.selectedElementId !== 'undefined') {
      const selId = snap.selectedElementId as string | null;

      if (selId !== prevSnapshotSelectedId.current) {
        prevSnapshotSelectedId.current = selId;

        const currentId = selectedElement?.id || null;
        if (selId !== currentId) {
          const el = slides[snap.currentSlide ?? currentSlide]?.elements?.find((e: any) => e.id === selId) || null;
          setSelectedElement(el);
        }
      }
    }
  }, [snapshot, currentSlide, zoom]);

  // Insert Image handler (Toolbar)
  const handleInsertImageFile = useCallback((file: File) => {
    try {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const SLIDE_W = 960;
        const SLIDE_H = 540;
        const targetW = Math.round(SLIDE_W * 0.45);
        const aspect = img.width / img.height || 1;
        const targetH = Math.max(1, Math.round(targetW / aspect));
        const x = Math.round((SLIDE_W - targetW) / 2);
        const y = Math.round((SLIDE_H - targetH) / 2);

        const newElement: Element = {
          id: `img-${Date.now()}`,
          type: 'image',
          x, y, width: targetW, height: targetH,
          rotation: 0,
          opacity: 1,
          imageUrl: url as any,
          // metadata
          borderRadius: 0,
        } as any;

        const current = slides[currentSlide]?.elements || [];
        const updated = [...current, newElement];
        const newSlides = [...slides];
        newSlides[currentSlide] = { ...newSlides[currentSlide], elements: updated } as any;
        pushSlides(newSlides);
        setSelectedElement(newElement);
      };
      img.src = url;
    } catch (e) {
      console.error('Failed to insert image:', e);
      toast({ title: 'Insert Image', description: 'Could not load image', variant: 'destructive' });
    }
  }, [slides, currentSlide, pushSlides, setSelectedElement, toast]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [openDialogOpen, setOpenDialogOpen] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  // Smart layout apply hook (Apple Keynote-style)
  const { requestApplyLayout, modal: layoutModal } = useSmartLayoutApply({
    getElements: () => slides[currentSlide]?.elements || [],
    setElements: (els) => {
      updateCurrentSlide(els as unknown as Element[]);
      setSelectedElement(null);
    },
    onApplied: (layoutId) => setCurrentLayoutId(layoutId),
  });

  // Handle template application
  const handleApplyTemplate = async (templateName: string) => {
    try {
      let newSlides: Slide[] = [];
      const { presentationThemes } = await import('@/utils/presentationThemes');

      // Handle DEMO: prefix (from demo templates)
      if (templateName.toUpperCase().startsWith('DEMO:')) {
        const demoName = templateName.substring('DEMO:'.length).trim().toLowerCase();
        console.log(`[Template] Processing DEMO template: ${demoName}`);

        // Handle demos by matching theme id
        const themeId = demoName.replace(/_/g, '-');
        const theme = presentationThemes.find(t => t.id === themeId);
        if (theme) {
          newSlides = [...theme.slides];
        }
      }
      // Support themes from the registry (THEME:<id>)
      else if (templateName.startsWith('THEME:')) {
        const id = templateName.substring('THEME:'.length);
        const theme = presentationThemes.find(t => t.id === id);
        if (!theme) throw new Error(`Theme not found: ${id}`);
        newSlides = theme.slides;
      }
      // Fallback by theme name (with Education alias)
      else {
        const lowerName = templateName.toLowerCase();
        let themeFound = false;

        // Handle education theme alias
        if (lowerName === 'education' || lowerName === 'education-learning' || lowerName === 'education_learning') {
          const matched = presentationThemes.find(t =>
            t.id === 'education-learning' ||
            t.name.toLowerCase().includes('education')
          );
          if (matched) {
            console.log(`[Template] Found education theme: ${matched.id} with ${matched.slides?.length || 0} slides`);
            newSlides = Array.isArray(matched.slides) ? [...matched.slides] : [];
            themeFound = true;
          } else {
            console.warn('[Template] No education theme found in presentationThemes:', presentationThemes);
          }
        }
        // Handle other themes by name
        else {
          const matched = presentationThemes.find(t =>
            t.name.toLowerCase() === lowerName ||
            t.id === lowerName ||
            t.id.replace(/-/g, '') === lowerName.replace(/-/g, '')
          );
          if (matched) {
            console.log(`[Template] Found theme by name: ${matched.id} with ${matched.slides?.length || 0} slides`);
            newSlides = Array.isArray(matched.slides) ? [...matched.slides] : [];
            themeFound = true;
          }
        }

        // If no theme was found, create a default blank slide
        if (!themeFound) {
          newSlides.push({
            id: Date.now().toString(),
            elements: [
              {
                id: `title-${Date.now()}`,
                type: 'text',
                x: 100,
                y: 200,
                width: 760,
                height: 80,
                text: 'New Presentation',
                fontSize: 48,
                fontWeight: 'bold',
                fontFamily: 'Arial, sans-serif',
                textAlign: 'center',
                color: '#2d3748',
              } as any
            ],
            background: '#ffffff',
            createdAt: new Date(),
            lastUpdated: Date.now()
          });
        }
      }

      // Replace all slides with the new template slides
      pushSlides(newSlides);
      setCurrentSlide(0); // Set to first slide of the new template

      toast({
        title: 'Template Applied',
        description: `Applied ${templateName.replace('THEME:', '')} with ${newSlides.length} slides`,
      });
      return newSlides;
    } catch (error) {
      console.error('Error applying template:', error);
      toast({
        title: 'Error',
        description: 'Failed to apply template. Please try again.',
        variant: 'destructive',
      });
      return [];
    }
  };

  // Listen for template application events
  useEffect(() => {
    const handleTemplateApply = async (event: Event) => {
      const customEvent = event as CustomEvent<{ templateName: string }>;
      await handleApplyTemplate(customEvent.detail.templateName);
    };

    window.addEventListener('applyTemplate', handleTemplateApply as EventListener);

    return () => {
      window.removeEventListener('applyTemplate', handleTemplateApply as EventListener);
    };
  }, [slides, pushSlides, toast]);

  // Get current user (simplified - replace with your auth system)
  const getCurrentUser = () => {
    // TODO: Replace with actual user from your auth system
    return 'default_user';
  };

  // Handle saving project
  const handleSaveProject = (projectName: string) => {
    try {
      const project: GSlideProject = {
        id: Date.now().toString(),
        name: projectName,
        slides,
        createdAt: Date.now(),
        lastModified: Date.now(),
      };

      saveUserProject(getCurrentUser(), project);
      setPresentationTitle(projectName);

      toast({
        title: "Project Saved",
        description: `${projectName} has been saved successfully.`,
      });

      return Promise.resolve();
    } catch (error) {
      console.error('Failed to save project:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save the project. Please try again.",
        variant: "destructive",
      });
      return Promise.reject(error);
    }
  };

  // Handle opening a project
  const handleOpenProject = (project: GSlideProject) => {
    try {
      pushSlides(project.slides);
      setPresentationTitle(project.name);
      setCurrentSlide(0);

      toast({
        title: "Project Opened",
        description: `${project.name} has been loaded.`,
      });
    } catch (error) {
      console.error('Failed to open project:', error);
      toast({
        title: "Open Failed",
        description: "Failed to open the project. The file may be corrupted.",
        variant: "destructive",
      });
    }
  };

  // Auto-save to localStorage
  usePersistence(slides, (loadedSlides) => {
    // Data loaded from localStorage
  });

  // Reload slides when window regains focus (e.g., returning from presentation mode)
  useEffect(() => {
    const handleFocus = () => {
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
    // Ensure zIndex normalization to satisfy SlideElement typing
    const normalized = elements.map((el, i) => ({ ...(el as any), zIndex: (el as any).zIndex ?? i })) as any;
    newSlides[currentSlide] = {
      ...newSlides[currentSlide],
      elements: normalized,
    };
    // Coalesce rapid element edits (drag/resize/typing)
    pushSlides(newSlides, { coalesceKey: `slide-${currentSlide}-elements` });
  };

  const handleElementSelect = (element: Element | null) => {
    setSelectedElement(element);
    // Record selection changes as meta updates (coalesced)
    pushSnapshot(slides, { coalesceKey: 'selection' }, { selectedElementId: element?.id || null });
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

    // Get the blue theme
    const blueTheme = TABLE_THEMES.find(theme => theme.id === 'keynote1');

    // Create new element with blue theme applied by default
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
      // Apply blue theme properties
      themeId: 'keynote1',
      borderWidth: 1,
      borderColor: blueTheme?.borderColor || '#E2E8F0',
      backgroundColor: blueTheme?.rowEvenBg || '#F8FAFC',
      color: blueTheme?.textColor || '#1E293B',
      borderStyle: 'solid' as any,
      header: true,
      headerBg: blueTheme?.headerBg || '#3B82F6',
      headerTextColor: blueTheme?.headerTextColor || '#FFFFFF',
      cellPadding: 12,
      cellTextAlign: 'left',
      rotation: 0,
      rowAltBg: blueTheme?.rowOddBg || '#F1F5F9',
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

  // User display information (simplified without auth)
  const userNameDisplay = 'User';
  const userEmailDisplay = '';
  const userSubtitleDisplay = undefined;
  const userAvatarDisplay = undefined;

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
    <div className="h-screen flex flex-col bg-[#F3F4F6] overflow-hidden">
      {/* Shape Modal */}
      <ShapeModal
        isOpen={shapeModalOpen}
        onClose={() => setShapeModalOpen(false)}
        onSelectShape={handleSelectShape}
      />

      {/* Table Modal */}
      <TableModal
        isOpen={tableModalOpen}
        onClose={() => setTableModalOpen(false)}
        onConfirm={handleConfirmTable}
      />

      {/* Header */}
      <header className="border-b border-border bg-white shadow-sm">
        <div className="h-16">
          <Toolbar
            onAddText={handleAddText}
            onAddShape={handleAddShape}
            onAddChart={() => setChartPanelOpen(true)}
            onAddTable={handleAddTable}
            onSave={() => setSaveDialogOpen(true)}
            onOpen={() => setOpenDialogOpen(true)}
            onUndo={undo}
            onRedo={redo}
            onPresent={handlePresent}
            onHomeClick={() => navigate('/')}
            canUndo={canUndo}
            canRedo={canRedo}
            presentationTitle={presentationTitle}
            onTitleChange={(newTitle) => {
              setPresentationTitle(newTitle);
              document.title = `${newTitle} - GlassSlide`;
            }}
            onInsertImageFile={handleInsertImageFile}
            zoom={zoom}
            onZoomIn={() => {
              setZoom((z) => {
                const newZoom = Math.min(1.2, Math.round((z + 0.1) * 10) / 10);
                // Record zoom in history meta (coalesced)
                pushSnapshot(slides, { coalesceKey: 'zoom' }, { zoom: newZoom });
                return newZoom;
              });
            }}
            onZoomOut={() => {
              setZoom((z) => {
                const newZoom = Math.max(0.3, Math.round((z - 0.1) * 10) / 10);
                pushSnapshot(slides, { coalesceKey: 'zoom' }, { zoom: newZoom });
                return newZoom;
              });
            }}
          />
        </div>
      </header>

      <main className="flex-1 flex lg:flex-row items-stretch w-full overflow-hidden" role="main">
        {/* Mobile: Slide Thumbnails at top */}
        <aside className="lg:hidden" role="complementary" aria-label="Slide thumbnails">
          <SlideThumbnails
            slides={slides}
            currentSlide={currentSlide}
            onSlideChange={(idx) => {
              setCurrentSlide(idx);
              pushSnapshot(slides, undefined, { currentSlide: idx, selectedElementId: null });
            }}
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
        <aside className="hidden lg:block shrink-0 transition-[width] duration-300 ease-in-out lg:w-[220px] xl:w-[240px] 2xl:w-[280px]" role="complementary" aria-label="Slide thumbnails">
          <SlideThumbnails
            slides={slides}
            currentSlide={currentSlide}
            onSlideChange={(idx) => {
              setCurrentSlide(idx);
              pushSnapshot(slides, undefined, { currentSlide: idx, selectedElementId: null });
            }}
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

        {/* Main content area with canvas and sidebar */}
        <div className="flex-1 flex min-w-0 overflow-hidden">
          {/* Canvas Area - Takes remaining space */}
          <div className="flex-1 min-w-0 flex items-center bg-[#F3F4F6] dark:bg-[#1e1e1e] overflow-auto p-4 px-0 transition-colors duration-300 transition-[width] ease-in-out relative">
            {/* Edge shadows toward canvas (left and right) */}
            <div aria-hidden="true" className="pointer-events-none absolute left-0 top-0 h-full w-4 bg-gradient-to-r from-black/5 to-transparent dark:from-white/10" />
            <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 h-full w-4 bg-gradient-to-l from-black/5 to-transparent dark:from-white/10" />
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

            {/* Bottom-centered Zoom Controls (always visible) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
              <div className="flex items-center bg-white/80 dark:bg-gray-900/70 backdrop-blur-md rounded-full px-2 py-1 border border-gray-200 dark:border-gray-700 shadow-md">
                <button
                  onClick={() => {
                    setZoom((z) => {
                      const newZoom = Math.max(0.3, Math.round((z - 0.1) * 10) / 10);
                      // Record zoom in history meta (coalesced)
                      pushSnapshot(slides, { coalesceKey: 'zoom' }, { zoom: newZoom });
                      return newZoom;
                    });
                  }}
                  className="w-9 h-9 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                  aria-label="Zoom out"
                  title="Zoom out"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                  </svg>
                </button>
                <span className="mx-2 text-sm font-medium text-gray-800 dark:text-gray-100 w-12 text-center select-none">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => {
                    setZoom((z) => {
                      const newZoom = Math.min(1.2, Math.round((z + 0.1) * 10) / 10);
                      // Record zoom in history meta (coalesced)
                      pushSnapshot(slides, { coalesceKey: 'zoom' }, { zoom: newZoom });
                      return newZoom;
                    });
                  }}
                  className="w-9 h-9 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                  aria-label="Zoom in"
                  title="Zoom in"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
                  </svg>
                </button>
              </div>
            </div>
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

      {layoutModal}

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

      {/* Save Project Dialog */}
      <SaveProjectDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        onSave={handleSaveProject}
        defaultName={presentationTitle}
      />

      {/* Open Project Modal */}
      <OpenFileModal
        open={openDialogOpen}
        onOpenChange={setOpenDialogOpen}
        onOpenProject={handleOpenProject}
        currentUsername={getCurrentUser()}
      />
    </div>
  );
};

export default Editor;
