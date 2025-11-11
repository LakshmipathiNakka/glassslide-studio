import { Type, Image, Shapes, BarChart3, Table, Save, Undo, Redo, Layout, Play, Palette, Home, Presentation, Edit, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import TemplateModal from "./TemplateModal";
import "@/styles/apple-button.css";

interface ToolbarProps {
  onAddText: () => void;
  onAddImage: () => void;
  onAddShape: () => void;
  onAddChart: () => void;
  onSave: () => void;
  onOpen: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onPresent: () => void;
  onHomeClick: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onAddTable: () => void;
  // Zoom controls
  zoom?: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  // Title props
  presentationTitle: string;
  onTitleChange: (newTitle: string) => void;
}

export const Toolbar = ({
  onAddText,
  onAddImage,
  onAddShape,
  onAddChart,
  onSave,
  onUndo,
  onRedo,
  onPresent,
  onHomeClick,
  canUndo,
  canRedo,
  onAddTable,
  onOpen,
  zoom = 1,
  onZoomIn,
  onZoomOut,
  presentationTitle,
  onTitleChange,
}: ToolbarProps) => {
  const [showTitleInput, setShowTitleInput] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const handleApplyTemplate = (templateName: string) => {
    // Emit a custom event that the Editor component can listen to
    const event = new CustomEvent('applyTemplate', { 
      detail: { templateName } 
    });
    window.dispatchEvent(event);
  };
  const [tempTitle, setTempTitle] = useState(presentationTitle);

  // Update tempTitle when presentationTitle changes from parent
  useEffect(() => {
    setTempTitle(presentationTitle);
  }, [presentationTitle]);

  return (
    <div className="flex items-center justify-between w-full px-3 py-1 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 border-b border-gray-200 h-16" role="toolbar" aria-label="Editor tools">
      {/* LEFT ZONE */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {/* Logo + Brand - Clickable */}
        <button 
          onClick={onHomeClick}
          className="flex items-center gap-2 flex-shrink-0 group"
          aria-label="Return to home page"
        >
          <div className="relative w-8 h-8 group-hover:opacity-90 transition-opacity">
            <div
              className="absolute inset-0 bg-gradient-to-br from-foreground to-muted-foreground rounded-lg transition-transform group-hover:scale-105"
              style={{
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
              }}
            />
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight hidden sm:block group-hover:opacity-90">
            GlassSlide
          </span>
        </button>

        {/* Editing Tools */}
        <div className="flex items-center gap-1 flex-wrap justify-center flex-1">
          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
            <div className="flex items-center gap-0.5 sm:gap-1">
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onUndo}
              disabled={!canUndo}
              className="h-7 w-7 sm:h-8 sm:w-8 p-0 flex items-center justify-center"
              title="Undo (Ctrl+Z)"
              aria-label="Undo last action"
            >
              <Undo className="w-4 h-4" aria-hidden="true" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onRedo}
              disabled={!canRedo}
              className="h-7 w-7 sm:h-8 sm:w-8 p-0 flex items-center justify-center"
              title="Redo (Ctrl+Y)"
              aria-label="Redo last undone action"
            >
              <Redo className="w-4 h-4" aria-hidden="true" />
            </Button>

            <Separator orientation="vertical" className="h-5 sm:h-6 mx-0.5 sm:mx-1" aria-hidden="true" />
            
            {/* Text Tools */}
            <div className="flex items-center space-fluid-xs">
              <Button
                variant="ghost"
                size={{ base: 'icon', sm: 'sm' }}
                onClick={onAddText}
                className="keynote-button h-8 w-8 sm:h-9 sm:w-auto sm:px-2"
                title="Add Text"
                aria-label="Add text element"
              >
                <Type className="w-4 h-4" aria-hidden="true" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-4 sm:h-6 mx-1 sm:mx-2" aria-hidden="true" />

            {/* Shape Tools */}
            <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size={{ base: 'icon', sm: 'sm' }}
                onClick={onAddShape}
                className="keynote-button h-8 w-8 sm:h-9 sm:w-auto sm:px-2"
                title="Add Shape"
                aria-label="Add shape element"
              >
                <Shapes className="w-4 h-4" aria-hidden="true" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-4 sm:h-6 mx-1 sm:mx-2" aria-hidden="true" />

            {/* Chart and Table Tools */}
            <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size={{ base: 'icon', sm: 'sm' }}
                onClick={onAddChart}
                className="keynote-button h-8 w-8 sm:h-9 sm:w-auto sm:px-2"
                title="Add Chart"
                aria-label="Add chart element"
              >
                <BarChart3 className="w-4 h-4" aria-hidden="true" />
              </Button>

              <Button
                variant="ghost"
                size={{ base: 'icon', sm: 'sm' }}
                onClick={onAddTable}
                className="keynote-button h-8 w-8 sm:h-9 sm:w-auto sm:px-2"
                title="Add Table"
                aria-label="Add table element"
              >
                <Table className="w-4 h-4" aria-hidden="true" />
              </Button>

              <Button
                variant="ghost"
                size={{ base: 'icon', sm: 'sm' }}
                onClick={onAddImage}
                className="keynote-button h-8 w-8 sm:h-9 sm:w-auto sm:px-2"
                title="Add Image"
                aria-label="Add image element"
              >
                <Image className="w-4 h-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* CENTER ZONE (Zoom Controls) */}
      <div className="flex items-center justify-center flex-1">
        <div className="flex items-center gap-2 bg-white/70 backdrop-blur-md rounded-full px-3 py-1 border border-gray-200 shadow-sm">
          <button
            onClick={onZoomOut}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-gray-50 to-gray-200 hover:from-gray-100 hover:to-gray-300 active:scale-95 transition-all"
            aria-label="Zoom out"
            title="Zoom out"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
            </svg>
          </button>
          <span className="text-sm font-medium text-gray-700 w-10 text-center select-none">
            {Math.round((zoom || 1) * 100)}%
          </span>
          <button
            onClick={onZoomIn}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-gray-50 to-gray-200 hover:from-gray-100 hover:to-gray-300 active:scale-95 transition-all"
            aria-label="Zoom in"
            title="Zoom in"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
            </svg>
          </button>
        </div>
      </div>

      {/* RIGHT ZONE */}
      <div className="flex items-center justify-end gap-2 flex-1 min-w-0">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onOpen} 
          title="Open Project"
          className="gap-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" />
          </svg>
          <span className="hidden sm:inline">Open</span>
        </Button>

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onSave} 
          title="Save Project"
          className="gap-1"
        >
          <Save className="w-4 h-4" />
          <span className="hidden sm:inline">Save</span>
        </Button>

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onPresent} 
          title="Present" 
          className="gap-1"
        >
          <Play className="w-4 h-4" />
          <span className="hidden sm:inline">Present</span>
        </Button>

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowTemplateModal(true)} 
          title="Templates" 
          className="gap-1"
        >
          <LayoutTemplate className="w-4 h-4" />
          <span className="hidden sm:inline">Template</span>
        </Button>

        <div className="h-6 w-px bg-gray-300 mx-1" aria-hidden="true"></div>

        <div className="relative group">
          <div className="relative group flex items-center">
            <button
              onClick={() => {
                setShowTitleInput(true);
                setTempTitle(presentationTitle);
              }}
              className="
                flex items-center gap-2 text-sm font-medium text-foreground
                hover:bg-gray-100 dark:hover:bg-gray-800
                rounded px-3 py-1.5
                transition-all duration-200
                border border-gray-300 dark:border-gray-600 hover:border-foreground
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
                whitespace-nowrap overflow-hidden text-ellipsis
                max-w-[220px] sm:max-w-[260px] md:max-w-[320px]
                mr-4
              "
              title="Click to edit presentation title"
              aria-label="Edit presentation title"
            >
              <span className="truncate">{presentationTitle || 'Untitled Presentation'}</span>
              <Edit className="w-3.5 h-3.5 opacity-0 group-hover:opacity-70 transition-opacity" />
            </button>
          </div>
          
          {showTitleInput && (
            <div className="absolute top-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 p-1">
              <div className="flex items-center">
                <input
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onTitleChange(tempTitle);
                      setShowTitleInput(false);
                    } else if (e.key === 'Escape') {
                      setShowTitleInput(false);
                    }
                  }}
                  onBlur={() => {
                    onTitleChange(tempTitle);
                    setShowTitleInput(false);
                  }}
                  autoFocus
                  className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {showTemplateModal && (
        <TemplateModal 
          onClose={() => setShowTemplateModal(false)}
          onApplyTemplate={handleApplyTemplate}
        />
      )}
    </div>
  );
};
