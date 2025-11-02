import { Type, Image, Shapes, BarChart3, Table, Download, Save, Undo, Redo, Layout, Play, Palette, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface ToolbarProps {
  onAddText: () => void;
  onAddImage: () => void;
  onAddShape: () => void;
  onAddChart: () => void;
  onSave: () => void;
  onExport: () => void;
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
}

export const Toolbar = ({ onAddText, onAddImage, onAddShape, onAddChart, onSave, onExport, onUndo, onRedo, onPresent, onHomeClick, canUndo, canRedo, onAddTable, zoom = 1, onZoomIn, onZoomOut }: ToolbarProps) => {
  return (
    <div className="keynote-toolbar overflow-x-auto smooth-scroll" role="toolbar" aria-label="Editor tools">
      <div className="container-fluid py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-fluid-xs flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onHomeClick}
              className="keynote-button"
              title="Home"
              aria-label="Return to home page"
            >
              <Home className="w-4 h-4" aria-hidden="true" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onUndo}
              disabled={!canUndo}
              className="keynote-button"
              title="Undo (Ctrl+Z)"
              aria-label="Undo last action"
            >
              <Undo className="w-4 h-4" aria-hidden="true" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onRedo}
              disabled={!canRedo}
              className="keynote-button"
              title="Redo (Ctrl+Y)"
              aria-label="Redo last undone action"
            >
              <Redo className="w-4 h-4" aria-hidden="true" />
            </Button>

            <Separator orientation="vertical" className="h-4 sm:h-6 mx-1 sm:mx-2" aria-hidden="true" />
            
            {/* Text and Image Tools */}
        <div className="flex items-center space-fluid-xs">
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddText}
            className="keynote-button"
            title="Add Text"
            aria-label="Add text element"
          >
            <Type className="w-4 h-4" aria-hidden="true" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddImage}
            className="keynote-button"
            title="Add Image"
            aria-label="Add image element"
          >
            <Image className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-4 sm:h-6 mx-1 sm:mx-2" aria-hidden="true" />

        {/* Shape Tools */}
        <div className="flex items-center space-fluid-xs">
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddShape}
            className="keynote-button"
            title="Add Shape"
            aria-label="Add shape element"
          >
            <Shapes className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-4 sm:h-6 mx-1 sm:mx-2" aria-hidden="true" />

        {/* Chart and Table Tools */}
        <div className="flex items-center space-fluid-xs">
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddChart}
            className="keynote-button"
            title="Add Chart"
            aria-label="Add chart element"
          >
            <BarChart3 className="w-4 h-4" aria-hidden="true" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onAddTable}
            className="keynote-button"
            title="Add Table"
            aria-label="Add table element"
          >
            <Table className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-4 sm:h-6 mx-1 sm:mx-2" aria-hidden="true" />

      </div>

      <div className="flex-1 min-w-4" />

      {/* Zoom Controls */}
      <div className="hidden sm:flex items-center gap-3 mr-3 bg-white/70 backdrop-blur-md rounded-full px-3 py-1 shadow-sm border border-gray-200">
        <button
          onClick={onZoomOut}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-gray-50 to-gray-200 hover:from-gray-100 hover:to-gray-300 active:scale-95 transition-all duration-200"
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
          className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-gray-50 to-gray-200 hover:from-gray-100 hover:to-gray-300 active:scale-95 transition-all duration-200"
          aria-label="Zoom in"
          title="Zoom in"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
          </svg>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-fluid-xs flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPresent}
          className="touch-button bg-white text-black border border-gray-300 hover:bg-gray-100 hover:text-black btn-fluid hover-lift focus-ring hover-glow"
          title="Present (F5)"
          aria-label="Start presentation mode"
        >
          <Play className="w-4 h-4 sm:mr-2" aria-hidden="true" />
          <span className="hidden sm:inline">Present</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onSave}
          className="keynote-button"
          title="Save"
          aria-label="Save presentation"
        >
          <Save className="w-4 h-4 sm:mr-2" aria-hidden="true" />
          <span className="hidden sm:inline">Save</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onExport}
          className="touch-button bg-white text-black border border-gray-300 hover:bg-gray-100 hover:text-black btn-fluid hover-lift focus-ring hover-glow"
          title="Export"
          aria-label="Export presentation"
        >
          <Download className="w-4 h-4 sm:mr-2" aria-hidden="true" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </div>
        </div>
      </div>
    </div>
  );
};
