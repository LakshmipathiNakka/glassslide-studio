import { useState, useEffect, useRef } from 'react';
import { 
  Type, 
  Image, 
  Square, 
  Circle, 
  BarChart3, 
  Table, 
  Copy, 
  Trash2, 
  Move, 
  RotateCw, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Bold,
  Italic,
  Underline,
  Palette,
  Layers,
  BringToFront,
  SendToBack
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface FloatingToolbarProps {
  isVisible: boolean;
  position: { x: number; y: number };
  selectedElement: any;
  onClose: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onAlignLeft: () => void;
  onAlignCenter: () => void;
  onAlignRight: () => void;
  onToggleBold: () => void;
  onToggleItalic: () => void;
  onToggleUnderline: () => void;
  onChangeColor: () => void;
}

export const FloatingToolbar = ({
  isVisible,
  position,
  selectedElement,
  onClose,
  onDelete,
  onDuplicate,
  onBringToFront,
  onSendToBack,
  onAlignLeft,
  onAlignCenter,
  onAlignRight,
  onToggleBold,
  onToggleItalic,
  onToggleUnderline,
  onChangeColor,
}: FloatingToolbarProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible, onClose]);

  if (!isVisible || !selectedElement) return null;

  const isTextElement = selectedElement.type === 'text';
  const isShapeElement = selectedElement.type === 'shape';
  const isImageElement = selectedElement.type === 'image';
  const isChartElement = selectedElement.type === 'chart';

  return (
    <div
      ref={toolbarRef}
      className={`floating-toolbar ${isAnimating ? 'fade-in' : ''}`}
      style={{
        position: 'fixed',
        left: Math.max(10, Math.min(position.x - 150, window.innerWidth - 320)),
        top: Math.max(10, position.y - 60),
        zIndex: 1000,
      }}
    >
      <div className="glass-card p-2 rounded-xl shadow-2xl">
        <div className="flex items-center space-x-1">
          {/* Element Type Indicator */}
          <div className="flex items-center space-x-2 px-3 py-2 bg-muted rounded-lg">
            {isTextElement && <Type className="w-4 h-4" />}
            {isShapeElement && (selectedElement.shapeType === 'rectangle' ? <Square className="w-4 h-4" /> : <Circle className="w-4 h-4" />)}
            {isImageElement && <Image className="w-4 h-4" />}
            {isChartElement && <BarChart3 className="w-4 h-4" />}
            <span className="text-sm font-medium capitalize">
              {isShapeElement ? selectedElement.shapeType : selectedElement.type}
            </span>
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Text Formatting Tools */}
          {isTextElement && (
            <>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleBold}
                  className={`h-8 w-8 p-0 ${selectedElement.fontWeight === 'bold' ? 'bg-accent text-accent-foreground' : ''}`}
                  title="Bold (Ctrl+B)"
                >
                  <Bold className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleItalic}
                  className={`h-8 w-8 p-0 ${selectedElement.fontStyle === 'italic' ? 'bg-accent text-accent-foreground' : ''}`}
                  title="Italic (Ctrl+I)"
                >
                  <Italic className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleUnderline}
                  className="h-8 w-8 p-0"
                  title="Underline (Ctrl+U)"
                >
                  <Underline className="w-4 h-4" />
                </Button>
              </div>

              <Separator orientation="vertical" className="h-8" />

              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onAlignLeft}
                  className={`h-8 w-8 p-0 ${selectedElement.textAlign === 'left' ? 'bg-accent text-accent-foreground' : ''}`}
                  title="Align Left"
                >
                  <AlignLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onAlignCenter}
                  className={`h-8 w-8 p-0 ${selectedElement.textAlign === 'center' ? 'bg-accent text-accent-foreground' : ''}`}
                  title="Align Center"
                >
                  <AlignCenter className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onAlignRight}
                  className={`h-8 w-8 p-0 ${selectedElement.textAlign === 'right' ? 'bg-accent text-accent-foreground' : ''}`}
                  title="Align Right"
                >
                  <AlignRight className="w-4 h-4" />
                </Button>
              </div>

              <Separator orientation="vertical" className="h-8" />
            </>
          )}

          {/* Color Tools */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onChangeColor}
            className="h-8 w-8 p-0"
            title="Change Color"
          >
            <Palette className="w-4 h-4" />
          </Button>

          <Separator orientation="vertical" className="h-8" />

          {/* Layer Tools */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBringToFront}
              className="h-8 w-8 p-0"
              title="Bring to Front"
            >
              <BringToFront className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSendToBack}
              className="h-8 w-8 p-0"
              title="Send to Back"
            >
              <SendToBack className="w-4 h-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Action Tools */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onDuplicate}
              className="h-8 w-8 p-0"
              title="Duplicate (Ctrl+D)"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              title="Delete (Del)"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
