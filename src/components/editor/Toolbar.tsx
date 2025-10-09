import { Type, Image, Square, Circle, BarChart3, Table, Download, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface ToolbarProps {
  onAddText: () => void;
  onAddImage: () => void;
  onAddShape: (shape: 'rectangle' | 'circle') => void;
  onAddChart: () => void;
  onSave: () => void;
  onExport: () => void;
}

export const Toolbar = ({ onAddText, onAddImage, onAddShape, onAddChart, onSave, onExport }: ToolbarProps) => {
  return (
    <div className="glass-toolbar px-6 py-3 flex items-center gap-2 border-b">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddText}
          className="hover:bg-accent/10"
          title="Add Text"
        >
          <Type className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddImage}
          className="hover:bg-accent/10"
          title="Add Image"
        >
          <Image className="w-4 h-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-2" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddShape('rectangle')}
          className="hover:bg-accent/10"
          title="Add Rectangle"
        >
          <Square className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddShape('circle')}
          className="hover:bg-accent/10"
          title="Add Circle"
        >
          <Circle className="w-4 h-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-2" />

        <Button
          variant="ghost"
          size="sm"
          onClick={onAddChart}
          className="hover:bg-accent/10"
          title="Add Chart"
        >
          <BarChart3 className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="hover:bg-accent/10"
          title="Add Table"
        >
          <Table className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onSave}
          className="hover:bg-accent/10"
        >
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onExport}
          className="hover:bg-accent/10"
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  );
};
