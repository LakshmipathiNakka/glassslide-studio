import { useState, useEffect, useRef } from 'react';
import { Search, Type, Image, Square, Circle, BarChart3, Table, Plus, FileText, Download, Save, Play, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Command {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  keywords: string[];
  category: 'content' | 'slide' | 'file' | 'view';
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onAddText: () => void;
  onAddImage: () => void;
  onAddShape: (shape: 'rectangle' | 'circle') => void;
  onAddChart: () => void;
  onAddTable: () => void;
  onAddSlide: () => void;
  onNewFile: () => void;
  onSave: () => void;
  onExport: () => void;
  onPresent: () => void;
}

export const CommandPalette = ({
  isOpen,
  onClose,
  onAddText,
  onAddImage,
  onAddShape,
  onAddChart,
  onAddTable,
  onAddSlide,
  onNewFile,
  onSave,
  onExport,
  onPresent,
}: CommandPaletteProps) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const commands: Command[] = [
    // Content Commands
    {
      id: 'add-text',
      title: 'Add Text',
      description: 'Insert a text element',
      icon: <Type className="w-4 h-4" />,
      action: onAddText,
      keywords: ['text', 'type', 'write', 'add text'],
      category: 'content',
    },
    {
      id: 'add-image',
      title: 'Add Image',
      description: 'Insert an image element',
      icon: <Image className="w-4 h-4" />,
      action: onAddImage,
      keywords: ['image', 'photo', 'picture', 'add image'],
      category: 'content',
    },
    {
      id: 'add-rectangle',
      title: 'Add Rectangle',
      description: 'Insert a rectangle shape',
      icon: <Square className="w-4 h-4" />,
      action: () => onAddShape('rectangle'),
      keywords: ['rectangle', 'square', 'box', 'shape'],
      category: 'content',
    },
    {
      id: 'add-circle',
      title: 'Add Circle',
      description: 'Insert a circle shape',
      icon: <Circle className="w-4 h-4" />,
      action: () => onAddShape('circle'),
      keywords: ['circle', 'round', 'oval', 'shape'],
      category: 'content',
    },
    {
      id: 'add-chart',
      title: 'Add Chart',
      description: 'Insert a chart element',
      icon: <BarChart3 className="w-4 h-4" />,
      action: onAddChart,
      keywords: ['chart', 'graph', 'data', 'visualization'],
      category: 'content',
    },
    {
      id: 'add-table',
      title: 'Add Table',
      description: 'Insert a table element',
      icon: <Table className="w-4 h-4" />,
      action: onAddTable,
      keywords: ['table', 'grid', 'data', 'spreadsheet'],
      category: 'content',
    },
    // Slide Commands
    {
      id: 'add-slide',
      title: 'Add Slide',
      description: 'Create a new slide',
      icon: <Plus className="w-4 h-4" />,
      action: onAddSlide,
      keywords: ['slide', 'new', 'add', 'create'],
      category: 'slide',
    },
    // File Commands
    {
      id: 'new-file',
      title: 'New File',
      description: 'Create a new presentation',
      icon: <FileText className="w-4 h-4" />,
      action: onNewFile,
      keywords: ['new', 'file', 'create', 'presentation'],
      category: 'file',
    },
    {
      id: 'save',
      title: 'Save',
      description: 'Save current presentation',
      icon: <Save className="w-4 h-4" />,
      action: onSave,
      keywords: ['save', 'store', 'keep'],
      category: 'file',
    },
    {
      id: 'export',
      title: 'Export',
      description: 'Export presentation',
      icon: <Download className="w-4 h-4" />,
      action: onExport,
      keywords: ['export', 'download', 'save as'],
      category: 'file',
    },
    // View Commands
    {
      id: 'present',
      title: 'Present',
      description: 'Start presentation mode',
      icon: <Play className="w-4 h-4" />,
      action: onPresent,
      keywords: ['present', 'play', 'slideshow', 'fullscreen'],
      category: 'view',
    },
  ];

  const filteredCommands = commands.filter(command =>
    command.title.toLowerCase().includes(query.toLowerCase()) ||
    command.description.toLowerCase().includes(query.toLowerCase()) ||
    command.keywords.some(keyword => keyword.toLowerCase().includes(query.toLowerCase()))
  );

  const groupedCommands = filteredCommands.reduce((acc, command) => {
    if (!acc[command.category]) {
      acc[command.category] = [];
    }
    acc[command.category].push(command);
    return acc;
  }, {} as Record<string, Command[]>);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
            onClose();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="command-palette-backdrop" onClick={onClose}>
      <div className="command-palette" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center space-x-3 mb-4">
          <Search className="w-5 h-5 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent border-none outline-none text-lg"
          />
        </div>

        <div ref={listRef} className="max-h-96 overflow-y-auto">
          {Object.entries(groupedCommands).map(([category, categoryCommands]) => (
            <div key={category} className="mb-4">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-2">
                {category}
              </div>
              <div className="space-y-1">
                {categoryCommands.map((command, index) => {
                  const globalIndex = filteredCommands.indexOf(command);
                  return (
                    <Button
                      key={command.id}
                      variant="ghost"
                      className={`w-full justify-start h-auto p-3 ${
                        globalIndex === selectedIndex ? 'bg-accent text-accent-foreground' : ''
                      }`}
                      onClick={() => {
                        command.action();
                        onClose();
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-muted-foreground">
                          {command.icon}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium">{command.title}</div>
                          <div className="text-sm text-muted-foreground">{command.description}</div>
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {filteredCommands.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No commands found for "{query}"
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>↑↓ to navigate</span>
            <span>Enter to select</span>
            <span>Esc to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};
