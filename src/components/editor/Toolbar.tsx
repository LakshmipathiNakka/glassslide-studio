import { Type, Shapes, BarChart3, Table, Save, Undo, Redo, Layout, Play, Palette, Home, Presentation, Edit, LayoutTemplate, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect, useRef } from "react";
import TemplateModal from "./TemplateModal";
import "@/styles/apple-button.css";

interface ToolbarProps {
  onAddText: () => void;
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
  // Image insertion handler
  onInsertImageFile: (file: File) => void;
}

export const Toolbar = ({
  onAddText,
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
  onInsertImageFile,
}: ToolbarProps) => {
  const MAX_TITLE_LENGTH = 30;
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(presentationTitle);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const handleApplyTemplate = (templateName: string) => {
    // Emit a custom event that the parent component can listen to
    const event = new CustomEvent('applyTemplate', {
      detail: { templateName }
    });
    window.dispatchEvent(event);
    setShowTemplateModal(false);
  };

  // Update tempTitle when presentationTitle changes from parent
  useEffect(() => {
    setTempTitle(presentationTitle);
  }, [presentationTitle]);

  // Focus the input when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length <= MAX_TITLE_LENGTH) {
      setTempTitle(e.target.value);
    }
  };

  const handleTitleBlur = () => {
    onTitleChange(tempTitle);
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onTitleChange(tempTitle);
      setIsEditingTitle(false);
    } else if (e.key === 'Escape') {
      setTempTitle(presentationTitle);
      setIsEditingTitle(false);
    }
  };

  return (
    <div className="flex items-center justify-between w-full px-3 lg:px-2 md:px-2 sm:px-2 py-1 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 border-b border-gray-200 h-16 lg:h-14 md:h-12 sm:h-11 xl:scale-100 lg:scale-95 md:scale-90 sm:scale-90 origin-left overflow-hidden" role="toolbar" aria-label="Editor tools">
      {/* LEFT ZONE - Navigation, History & Zoom */}
      <div className="flex items-center gap-2 md:gap-1.5 sm:gap-1">
        {/* Logo + Brand */}
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

        <Button
          variant="ghost"
          size="sm"
          onClick={onOpen}
          title="Open Project"
          className="h-8 w-8 p-0 sm:w-auto sm:px-2 ml-2"
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
          <span className="hidden sm:inline ml-1">Open</span>
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" aria-hidden="true" />

        {/* Undo/Redo */}
        <div className="flex items-center bg-white/50 dark:bg-gray-800/50 rounded-lg p-0.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={onUndo}
            disabled={!canUndo}
            className={`h-8 w-8 md:h-7 md:w-7 sm:h-6 sm:w-6 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${!canUndo ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Undo (Ctrl+Z)"
            aria-label="Undo last action"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRedo}
            disabled={!canRedo}
            className={`h-8 w-8 md:h-7 md:w-7 sm:h-6 sm:w-6 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${!canRedo ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Redo (Ctrl+Y)"
            aria-label="Redo last undone action"
          >
            <Redo className="w-4 h-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" aria-hidden="true" />

        {/* Zoom Controls removed - moved below the canvas */}
      </div>

      {/* CENTER ZONE - Content Creation Tools */}
      <div className="flex-1 flex justify-center px-4 md:px-3 sm:px-2">
        <div className="flex items-center gap-1 md:gap-1 sm:gap-0.5 bg-white/50 rounded-lg p-1 sm:p-0.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={onAddText}
            className="h-8 w-8 md:h-7 md:w-7 sm:h-6 sm:w-6 p-0 flex items-center justify-center"
            title="Add Text"
            aria-label="Add text element"
          >
            <Type className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onAddShape}
            className="h-8 w-8 md:h-7 md:w-7 sm:h-6 sm:w-6 p-0 flex items-center justify-center"
            title="Add Shape"
            aria-label="Add shape element"
          >
            <Shapes className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onAddChart}
            className="h-8 w-8 md:h-7 md:w-7 sm:h-6 sm:w-6 p-0 flex items-center justify-center"
            title="Add Chart"
            aria-label="Add chart element"
          >
            <BarChart3 className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onAddTable}
            className="h-8 w-8 md:h-7 md:w-7 sm:h-6 sm:w-6 p-0 flex items-center justify-center"
            title="Add Table"
            aria-label="Add table element"
          >
            <Table className="w-4 h-4" />
          </Button>

          <input
            id="toolbar-insert-image"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onInsertImageFile(file);
                e.currentTarget.value = '';
              }
            }}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => document.getElementById('toolbar-insert-image')?.click()}
            className="h-8 w-8 md:h-7 md:w-7 sm:h-6 sm:w-6 p-0 flex items-center justify-center"
            title="Add Image"
            aria-label="Add Image"
          >
            <ImageIcon className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowTemplateModal(true)}
            className="h-8 w-8 md:h-7 md:w-7 sm:h-6 sm:w-6 p-0 flex items-center justify-center"
            title="Add Template"
            aria-label="Add Template"
          >
            <LayoutTemplate className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* RIGHT ZONE - Actions */}
      <div className="flex items-center gap-2">

        <Separator orientation="vertical" className="h-6 mx-1" aria-hidden="true" />

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onPresent}
            title="Present"
            className="h-8 w-8 p-0 sm:w-auto sm:px-2 order-1"
          >
            <Play className="w-4 h-4" />
            <span className="hidden sm:inline ml-1">Present</span>
          </Button>

          <div className="relative group w-[200px] md:w-[180px] sm:w-[160px] mx-2 order-2">
            {isEditingTitle ? (
              <div className="relative w-full">
                <input
                  ref={titleInputRef}
                  type="text"
                  value={tempTitle}
                  onChange={handleTitleChange}
                  onKeyDown={handleTitleKeyDown}
                  onBlur={handleTitleBlur}
                  autoFocus
                  maxLength={MAX_TITLE_LENGTH}
                  className={`
                    w-full h-8 md:h-7 sm:h-6 px-2 pr-12 py-1 text-sm sm:text-xs font-medium 
                    bg-white dark:bg-gray-800 
                    border border-primary rounded 
                    transition-all duration-200 ease-in-out
                    focus:outline-none 
                    focus:ring-2 focus:ring-primary/50 
                    focus:border-primary 
                    shadow-sm hover:shadow-md 
                    focus:shadow-lg focus:shadow-primary/20
                    overflow-hidden text-ellipsis
                  `}
                  style={{
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '200px',
                    minWidth: '120px',
                    paddingRight: '3.5rem'
                  }}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400">
                  {tempTitle.length}/{MAX_TITLE_LENGTH}
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setTempTitle(presentationTitle);
                  setIsEditingTitle(true);
                }}
                className={`
                  w-full h-8 md:h-7 sm:h-6 px-2 py-1 text-sm sm:text-xs font-medium text-left
                  hover:bg-gray-100 dark:hover:bg-gray-800 rounded
                  transition-all duration-200 ease-in-out
                  border border-gray-200 dark:border-gray-600 
                  hover:border-primary/50 dark:hover:border-primary/50
                  focus:outline-none 
                  focus:ring-2 focus:ring-primary/50 
                  focus:border-primary
                  shadow-sm hover:shadow-md
                  flex items-center justify-between
                `}
                title={presentationTitle || 'Untitled Presentation'}
                aria-label="Edit presentation title"
              >
                <span className="truncate flex-1 text-left">{presentationTitle || 'Untitled Presentation'}</span>
                <Edit className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 opacity-70 flex-shrink-0 ml-2" />
              </button>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onSave}
            title="Save"
            className="h-8 w-8 p-0 sm:w-auto sm:px-2 order-3"
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline ml-1">Save</span>
          </Button>
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
