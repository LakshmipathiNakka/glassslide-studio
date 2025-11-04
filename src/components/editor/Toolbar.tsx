import { Type, Image, Shapes, BarChart3, Table, Download, Save, Undo, Redo, Layout, Play, Palette, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UserMenu } from "./UserMenu";

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
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  userSubtitle?: string;
}

export const Toolbar = ({
  onAddText,
  onAddImage,
  onAddShape,
  onAddChart,
  onSave,
  onExport,
  onUndo,
  onRedo,
  onPresent,
  onHomeClick,
  canUndo,
  canRedo,
  onAddTable,
  zoom = 1,
  onZoomIn,
  onZoomOut,
  userName = 'User',
  userEmail = 'user@example.com',
  userAvatar,
  userSubtitle,
}: ToolbarProps) => {
  return (
    <div className="keynote-toolbar overflow-x-auto smooth-scroll bg-white border-b border-slate-200" role="toolbar" aria-label="Editor tools">
      <div className="w-full px-1 sm:px-3 pr-3 sm:pr-4 py-1 sm:py-2">
        <div className="flex items-center justify-between gap-1 sm:gap-2">
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size={{ base: 'icon', sm: 'sm' }}
              onClick={onHomeClick}
              className="keynote-button h-8 w-8 sm:h-9 sm:w-auto sm:px-2"
              title="Home"
              aria-label="Return to home page"
            >
              <Home className="w-4 h-4" aria-hidden="true" />
            </Button>

            <Button
              variant="ghost"
              size={{ base: 'icon', sm: 'sm' }}
              onClick={onUndo}
              disabled={!canUndo}
              className="keynote-button h-8 w-8 sm:h-9 sm:w-auto sm:px-2"
              title="Undo (Ctrl+Z)"
              aria-label="Undo last action"
            >
              <Undo className="w-4 h-4" aria-hidden="true" />
            </Button>

            <Button
              variant="ghost"
              size={{ base: 'icon', sm: 'sm' }}
              onClick={onRedo}
              disabled={!canRedo}
              className="keynote-button h-8 w-8 sm:h-9 sm:w-auto sm:px-2"
              title="Redo (Ctrl+Y)"
              aria-label="Redo last undone action"
            >
              <Redo className="w-4 h-4" aria-hidden="true" />
            </Button>

            <Separator orientation="vertical" className="h-5 sm:h-6 mx-0.5 sm:mx-1" aria-hidden="true" />
            
            {/* Text and Image Tools */}
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

        <Separator orientation="vertical" className="h-4 sm:h-6 mx-1 sm:mx-2" aria-hidden="true" />

        {/* Shape Tools */}
        <div className="flex items-center space-fluid-xs">
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
        <div className="flex items-center space-fluid-xs">
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
      <div className="flex items-center space-x-2 flex-shrink-0">
        <Button
          variant="ghost"
          size={{ base: 'icon', sm: 'sm' }}
          onClick={onPresent}
          className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3 bg-white text-black border border-gray-300 hover:bg-gray-100 hover:text-black hover-lift focus-ring hover-glow"
          title="Present (F5)"
          aria-label="Start presentation mode"
        >
          <Play className="w-4 h-4 sm:mr-1" aria-hidden="true" />
          <span className="hidden sm:inline text-sm">Present</span>
        </Button>

<Button
          variant="ghost"
          size={{ base: 'icon', sm: 'sm' }}
          onClick={onExport}
          className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3 bg-white text-black border border-gray-300 hover:bg-gray-100 hover:text-black hover-lift focus-ring hover-glow"
          title="Export"
          aria-label="Export presentation"
        >
          <Download className="w-4 h-4 sm:mr-1" aria-hidden="true" />
          <span className="hidden sm:inline text-sm">Export</span>
        </Button>
        
        {/* User Menu */}
        <div className="ml-2">
          <UserMenu 
            userName={userName}
            userEmail={userEmail}
            avatar={userAvatar}
            subtitle={userSubtitle}
          />
        </div>
      </div>
        </div>
      </div>
    </div>
  );
};
