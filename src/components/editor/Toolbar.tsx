import { Type, Image, Square, Circle, BarChart3, Table, Download, Save, Undo, Redo, Layout, Play, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface ToolbarProps {
  onAddText: () => void;
  onAddImage: () => void;
  onAddShape: (shape: 'rectangle' | 'circle') => void;
  onAddChart: () => void;
  onSave: () => void;
  onExport: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onPresent: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const Toolbar = ({ onAddText, onAddImage, onAddShape, onAddChart, onSave, onExport, onUndo, onRedo, onPresent, canUndo, canRedo }: ToolbarProps) => {
  return (
    <div className="keynote-toolbar overflow-x-auto smooth-scroll" role="toolbar" aria-label="Editor tools">
      <div className="container-fluid py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-fluid-xs flex-shrink-0">
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
            onClick={() => onAddShape('rectangle')}
            className="keynote-button"
            title="Add Rectangle"
            aria-label="Add rectangle shape"
          >
            <Square className="w-4 h-4" aria-hidden="true" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddShape('circle')}
            className="keynote-button"
            title="Add Circle"
            aria-label="Add circle shape"
          >
            <Circle className="w-4 h-4" aria-hidden="true" />
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
