import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Type, Palette, AlignLeft, AlignCenter, AlignRight, AlertTriangle, Plus, X, BarChart3, PieChart, TrendingUp, Settings, Tag, Database, Bold, Italic, Underline, Strikethrough, AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd, Eye, EyeOff, Shapes, Table, Minus, Droplet, Lock, Image, Square, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TABLE_THEMES, applyTableTheme, TableTheme } from "../../constants/tableThemes";
import { SlideElement } from "../../types/canvas";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";

// Predefined color palette for chart datasets
const CHART_COLOR_PALETTE = [
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#10b981', // Green
  '#f59e0b', // Yellow
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#ec4899', // Pink
  '#84cc16', // Lime
  '#6366f1', // Indigo
];

// System UI full stack (canonical default for all text)
const SYSTEM_UI_STACK = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif';

// Font family options
const FONT_FAMILIES = [
  { value: SYSTEM_UI_STACK, label: 'System UI' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Inter', label: 'Inter' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Source Sans Pro', label: 'Source Sans Pro' },
];

// Text case options
const TEXT_CASE_OPTIONS = [
  { value: 'none', label: 'Normal' },
  { value: 'uppercase', label: 'UPPERCASE' },
  { value: 'lowercase', label: 'lowercase' },
  { value: 'capitalize', label: 'Capitalize' },
];

interface PropertiesPanelProps {
  selectedElement: SlideElement | null;
  onElementUpdate: (elementId: string, updates: Partial<SlideElement>) => void;
  onElementDelete: (elementId: string) => void;
}

export const PropertiesPanel = ({ selectedElement, onElementUpdate, onElementDelete }: PropertiesPanelProps) => {
  if (!selectedElement) {
    return (
      <div className="w-80 h-full bg-gray-50 border-l border-gray-200 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <Settings className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">No Element Selected</h3>
          <p className="text-sm">Select an element to view its properties</p>
        </div>
      </div>
    );
  }
  const [properties, setProperties] = useState({
    fontSize: 18,
    fontFamily: SYSTEM_UI_STACK,
    fontWeight: 'normal' as 'normal' | 'medium' | 'bold',
    fontStyle: 'normal' as 'normal' | 'italic',
    textDecoration: 'none' as string,
    textTransform: 'none' as 'none' | 'uppercase' | 'lowercase' | 'capitalize',
    textAlign: 'center' as 'left' | 'center' | 'right',
    verticalAlign: 'middle' as 'top' | 'middle' | 'bottom',
    lineHeight: 1.2,
    letterSpacing: 0,
    padding: 0,
    borderWidth: 0,
    borderStyle: 'solid' as 'solid' | 'dashed' | 'dotted' | 'double',
    borderRadius: 0,
    opacity: 1,
    color: '#000000',
    backgroundColor: 'transparent',
    borderColor: '#000000',
    fill: '#000000',
  });
  
  // State for tracking label and data counts
  const [labelCount, setLabelCount] = useState(0);
  const [dataCounts, setDataCounts] = useState<number[]>([]);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  // Removed showTableProperties state - no longer needed with accordion approach

  // Removed handleTextScopeChange - no longer needed

  useEffect(() => {
    if (selectedElement) {
      setProperties({
        fontSize: selectedElement.fontSize || 18,
        fontFamily: selectedElement.fontFamily || SYSTEM_UI_STACK,
        fontWeight: selectedElement.fontWeight || 'normal',
        fontStyle: selectedElement.fontStyle || 'normal',
        textDecoration: (selectedElement as any).textDecoration || 'none',
        textTransform: (selectedElement as any).textTransform || 'none',
        textAlign: (selectedElement.textAlign as 'left' | 'center' | 'right') || 'center',
        verticalAlign: (selectedElement as any).verticalAlign || 'middle',
        lineHeight: selectedElement.lineHeight || 1.2,
        letterSpacing: (selectedElement as any).letterSpacing || 0,
        padding: (selectedElement as any).padding || 0,
        borderWidth: selectedElement.borderWidth || 0,
        borderStyle: (selectedElement as any).borderStyle || 'solid',
        borderRadius: selectedElement.borderRadius || 0,
        opacity: (selectedElement as any).opacity || 1,
        color: selectedElement.color || '#000000',
        backgroundColor: selectedElement.backgroundColor || 'transparent',
        borderColor: selectedElement.borderColor || '#000000',
        fill: selectedElement.fill || '#000000',
      });
    }
  }, [selectedElement]);

  // Update counts when chart data changes
  useEffect(() => {
    if (selectedElement?.type === 'chart' && 'chartData' in selectedElement && selectedElement.chartData) {
      const chartData = selectedElement.chartData as any;
      const labels = chartData.labels || [];
      const datasets = chartData.datasets || [];
      
      setLabelCount(labels.length);
      setDataCounts(datasets.map((dataset: any) => dataset.data?.length || 0));
    }
  }, [selectedElement]);

  // Handle image dimension changes with aspect ratio lock
  const handleImageDimensionChange = (dimension: 'width' | 'height', value: number) => {
    if (!selectedElement) return;
    
    const updates: any = { [dimension]: value };
    
    if (maintainAspectRatio && selectedElement.type === 'image' && selectedElement.imageUrl) {
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        if (dimension === 'width') {
          updates.height = Math.round(value / aspectRatio);
        } else {
          updates.width = Math.round(value * aspectRatio);
        }
        onElementUpdate(selectedElement.id, updates);
      };
      img.src = selectedElement.imageUrl;
    } else {
      onElementUpdate(selectedElement.id, updates);
    }
  };

  const updateProperty = (key: string, value: any) => {
    if (!selectedElement) return;
    
    // Apply to entire element (simplified - no selective text styling)
    onElementUpdate(selectedElement.id, { [key]: value });
  };

  // Removed applySelectiveTextStyling function - using only entire text mode

  // Helper function to get warning message for data count mismatch
  const getDataCountWarning = (datasetIndex: number) => {
    const dataCount = dataCounts[datasetIndex] || 0;
    const difference = labelCount - dataCount;
    
    if (difference > 0) {
      return `Please add ${difference} more data value${difference > 1 ? 's' : ''}`;
    } else if (difference < 0) {
      return `Please remove ${Math.abs(difference)} data value${Math.abs(difference) > 1 ? 's' : ''}`;
    }
    return null;
  };

  const handlePropertyChange = (key: string, value: any) => {
    if (key === 'chartData') {
      // For chart data updates, we need to merge the existing chartData with the new values
      onElementUpdate(selectedElement.id, { chartData: { ...(selectedElement as any).chartData, ...value } });
    } else {
      // For regular properties, update as before
      setProperties(prev => ({ ...prev, [key]: value }));
      updateProperty(key, value);
    }
  };

  // Table helper functions
  const handleAddRow = () => {
    if (!selectedElement || selectedElement.type !== 'table') return;
    const newRows = (selectedElement.rows || 1) + 1;
    const newTableData = [...(selectedElement.tableData || [])];
    const numCols = selectedElement.cols || 1;
    newTableData.push(Array(numCols).fill(''));
    onElementUpdate(selectedElement.id, { rows: newRows, tableData: newTableData });
  };

  const handleRemoveRow = () => {
    if (!selectedElement || selectedElement.type !== 'table') return;
    if ((selectedElement.rows || 1) > 1) {
      const newRows = (selectedElement.rows || 1) - 1;
      const newTableData = [...(selectedElement.tableData || [])];
      newTableData.pop();
      onElementUpdate(selectedElement.id, { rows: newRows, tableData: newTableData });
    }
  };

  const handleAddColumn = () => {
    if (!selectedElement || selectedElement.type !== 'table') return;
    const newCols = (selectedElement.cols || 1) + 1;
    const newTableData = (selectedElement.tableData || []).map(row => [...row, '']);
    onElementUpdate(selectedElement.id, { cols: newCols, tableData: newTableData });
  };

  const handleRemoveColumn = () => {
    if (!selectedElement || selectedElement.type !== 'table') return;
    if ((selectedElement.cols || 1) > 1) {
      const newCols = (selectedElement.cols || 1) - 1;
      const newTableData = (selectedElement.tableData || []).map(row => row.slice(0, newCols));
      onElementUpdate(selectedElement.id, { cols: newCols, tableData: newTableData });
    }
  };

  const handleThemeSelect = (theme: TableTheme) => {
    if (!selectedElement || selectedElement.type !== 'table') return;
    const updatedElement = applyTableTheme(selectedElement, theme);
    onElementUpdate(selectedElement.id, updatedElement);
  };

  const getChartIcon = (chartType: string) => {
    switch (chartType) {
      case 'bar': return <BarChart3 className="w-4 h-4" />;
      case 'line': return <TrendingUp className="w-4 h-4" />;
      case 'pie': return <PieChart className="w-4 h-4" />;
      default: return <BarChart3 className="w-4 h-4" />;
    }
  };

  const renderThemePreview = (theme: TableTheme) => {
    const isSelected = selectedElement?.themeId === theme.id;
    return (
      <motion.div
        key={theme.id}
        className={`relative rounded-lg p-2 border-2 transition-all duration-200 cursor-pointer group ${
          isSelected
            ? 'border-blue-500 ring-1 ring-blue-100 bg-blue-50/50'
            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white/80'
        }`}
        onClick={() => handleThemeSelect(theme)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        )}

        <div className="flex flex-col w-full h-24 sm:h-28 overflow-hidden rounded-md border border-gray-200 shadow-xs">
          {/* Header */}
          <div
            className="h-4 w-full flex items-center justify-center text-[10px] font-medium px-0.5"
            style={{ backgroundColor: theme.headerBg, color: theme.headerTextColor }}
          >
            Header
          </div>
          {/* Rows */}
          <div className="flex-1 flex flex-col">
            {[0, 1, 2, 3].map((row) => (
              <div
                key={row}
                className={`h-2 w-full ${row % 2 === 0 ? 'opacity-90' : 'opacity-70'} transition-opacity`}
                style={{
                  backgroundColor: row % 2 === 0 ? theme.rowEvenBg : theme.rowOddBg,
                  color: theme.textColor
                }}
              />
            ))}
          </div>
        </div>

        {/* Theme name */}
        <div className="mt-1.5 text-center">
          <div className={`text-[11px] font-medium transition-colors ${
            isSelected ? 'text-blue-700' : 'text-gray-700 group-hover:text-gray-900'
          }`}>
            {theme.name}
          </div>
          {/* Color indicators */}
          <div className="flex justify-center gap-2 mt-1">
            <div className="flex flex-col items-center gap-0">
              <div
                className="w-2 h-2 rounded-full border border-gray-200 shadow-xs"
                style={{ backgroundColor: theme.headerBg }}
              />
              <span className="text-[8px] text-gray-500 leading-tight">Header</span>
            </div>
            <div className="flex flex-col items-center gap-0">
              <div
                className="w-2 h-2 rounded-full border border-gray-200 shadow-xs"
                style={{ backgroundColor: theme.rowEvenBg }}
              />
              <span className="text-[8px] text-gray-500 leading-tight">Row</span>
            </div>
            <div className="flex flex-col items-center gap-0">
              <div
                className="w-2 h-2 rounded-full border border-gray-200 shadow-xs"
                style={{ backgroundColor: theme.borderColor }}
              />
              <span className="text-[8px] text-gray-500 leading-tight">Border</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  if (!selectedElement) {
    return (
      <TooltipProvider>
<aside className="w-full h-full bg-gradient-to-b from-gray-50 via-white to-gray-100 border-l border-gray-200 shadow-inner flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b bg-white/70 backdrop-blur-lg sticky top-0 z-10">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Properties
            </h2>
        </div>
          <div className="flex-1 flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-gray-500"
            >
              <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No Element Selected</p>
              <p className="text-sm">Select an element to edit its properties</p>
            </motion.div>
        </div>
        </aside>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <aside 
        data-property-panel="true"
        className="w-[280px] h-full bg-gradient-to-b from-gray-50 via-white to-gray-100 border-l border-gray-200 shadow-inner flex flex-col overflow-hidden"
        onMouseDown={() => {
          // Signal that Properties Panel is being interacted with
          window.dispatchEvent(new CustomEvent('propertyPanelFocus', { detail: true }));
        }}
        onMouseUp={() => {
          // Reset after a short delay
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('propertyPanelFocus', { detail: false }));
          }, 100);
        }}
        onClick={(e) => {
          // Restore text selection when clicking on Properties Panel
          const editingElement = document.querySelector('.text-editing-active') as HTMLElement;
          if (editingElement) {
            editingElement.focus();
            
            // Try to restore selection if it exists
            const selection = window.getSelection();
            if (selection && selection.rangeCount === 0) {
              // No current selection, try to restore from saved selection
              const savedRange = (window as any).__SAVED_SELECTION__;
              if (savedRange) {
                selection.removeAllRanges();
                selection.addRange(savedRange);
              }
            }
          }
        }}
      >
      {/* Header with Delete Button Next to Title */}
      <div className="px-3 py-2 border-b bg-white/70 backdrop-blur-lg sticky top-0 z-10">
        <div className="flex items-center gap-2 w-full">
          <Settings className="w-4 h-4 flex-shrink-0 text-gray-600" />
          <div className="flex items-center justify-between flex-1 min-w-0">
            <h2 className="font-semibold text-sm text-gray-800">
              Properties
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onElementDelete(selectedElement.id)}
              className="h-5 w-5 p-0 ml-4 text-red-600 hover:bg-red-50 hover:text-red-700 flex-shrink-0"
              title="Delete Element"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-4 w-[280px] max-w-[280px]">
        {/* Element Type */}
        <motion.section 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2 w-full"
        >
          <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">Element Type</h3>
          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-100 text-gray-800 text-sm font-semibold">
            {selectedElement.type === 'chart' && getChartIcon(selectedElement.chartType || 'bar')}
            {selectedElement.type === 'text' && <Type className="w-4 h-4" />}
            {selectedElement.type === 'shape' && <Shapes className="w-4 h-4" />}
            <span className="capitalize">{selectedElement.type}</span>
          </div>
        </motion.section>

        {/* Text Properties */}
        {selectedElement.type === 'text' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <Accordion type="single" collapsible className="w-full space-y-2" defaultValue="text-formatting">
              {/* Text Formatting */}
              <AccordionItem value="text-formatting" className="w-full border border-gray-200 rounded-lg bg-white/60 shadow-sm backdrop-blur-sm">
                <AccordionTrigger className="w-full px-3 py-2 hover:bg-gray-50/50 rounded-md text-sm">
                  <div className="flex items-center gap-2 w-full">
                    <Type className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">Text Formatting</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 space-y-4">
                  
                  {/* Font Family */}
                  <div className="w-full">
                    <Label className="text-xs text-gray-500 mb-1 block">Font</Label>
                    <Select
                      value={properties.fontFamily || SYSTEM_UI_STACK}
                      onValueChange={(value) => handlePropertyChange('fontFamily', value)}
                    >
                      <SelectTrigger className="h-8 text-sm w-full">
                        <SelectValue className="truncate" />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_FAMILIES.map((font) => (
                          <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                            {font.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Font Size & Weight */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-gray-500 mb-1 block">Font Size</Label>
                      <Input
                        type="number"
                        value={properties.fontSize}
                        onChange={(e) => handlePropertyChange('fontSize', parseInt(e.target.value) || 18)}
                        className="h-8 text-sm w-full"
                        min="8"
                        max="72"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 mb-1 block">Font Weight</Label>
                      <Select
                        value={properties.fontWeight}
                        onValueChange={(value) => handlePropertyChange('fontWeight', value)}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="bold">Bold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Text Style Toggles */}
                  <div>
                    <Label className="text-xs text-gray-500 mb-2 block">Text Style</Label>
                    <div className="flex gap-1">
                      <Button
                        variant={properties.fontStyle === 'italic' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePropertyChange('fontStyle', properties.fontStyle === 'italic' ? 'normal' : 'italic')}
                        className="h-8 px-3"
                        title="Italic"
                      >
                        <Italic className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={properties.textDecoration?.includes('underline') ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          const currentDecoration = properties.textDecoration || 'none';
                          let newDecoration = 'none';
                          
                          if (currentDecoration === 'none') {
                            newDecoration = 'underline';
                          } else if (currentDecoration === 'underline') {
                            newDecoration = 'none';
                          } else if (currentDecoration === 'line-through') {
                            newDecoration = 'underline line-through';
                          } else if (currentDecoration === 'underline line-through') {
                            newDecoration = 'line-through';
                          }
                          
                          handlePropertyChange('textDecoration', newDecoration);
                        }}
                        className="h-8 px-3"
                        title="Underline"
                      >
                        <Underline className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={properties.textDecoration?.includes('line-through') ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          const currentDecoration = properties.textDecoration || 'none';
                          let newDecoration = 'none';
                          
                          if (currentDecoration === 'none') {
                            newDecoration = 'line-through';
                          } else if (currentDecoration === 'line-through') {
                            newDecoration = 'none';
                          } else if (currentDecoration === 'underline') {
                            newDecoration = 'underline line-through';
                          } else if (currentDecoration === 'underline line-through') {
                            newDecoration = 'underline';
                          }
                          
                          handlePropertyChange('textDecoration', newDecoration);
                        }}
                        className="h-8 px-3"
                        title="Strikethrough"
                      >
                        <Strikethrough className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Text Case */}
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Text Case</Label>
                    <Select
                      value={properties.textTransform || 'none'}
                      onValueChange={(value) => handlePropertyChange('textTransform', value)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TEXT_CASE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Alignment & Spacing */}
              <AccordionItem value="alignment-spacing" className="border border-gray-200 rounded-lg bg-white/60 shadow-sm backdrop-blur-sm">
                <AccordionTrigger className="px-4 py-3 hover:bg-gray-50/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div title="Alignment & Spacing">
                      <AlignLeft className="w-4 h-4" />
                    </div>
                    Alignment & Spacing
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 space-y-4">
                  {/* Horizontal Alignment */}
                  <div>
                    <Label className="text-xs text-gray-500 mb-2 block">Horizontal Alignment</Label>
                    <div className="flex gap-1">
                      <Button
                        variant={properties.textAlign === 'left' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePropertyChange('textAlign', 'left')}
                        className="flex-1 h-8"
                        title="Align Left"
                      >
                        <AlignLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={properties.textAlign === 'center' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePropertyChange('textAlign', 'center')}
                        className="flex-1 h-8"
                        title="Align Center"
                      >
                        <AlignCenter className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={properties.textAlign === 'right' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePropertyChange('textAlign', 'right')}
                        className="flex-1 h-8"
                        title="Align Right"
                      >
                        <AlignRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Vertical Alignment */}
                  <div>
                    <Label className="text-xs text-gray-500 mb-2 block">Vertical Alignment</Label>
                    <div className="flex gap-1">
                      <Button
                        variant={properties.verticalAlign === 'top' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePropertyChange('verticalAlign', 'top')}
                        className="flex-1 h-8"
                        title="Align Top"
                      >
                        <AlignVerticalJustifyStart className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={properties.verticalAlign === 'middle' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePropertyChange('verticalAlign', 'middle')}
                        className="flex-1 h-8"
                        title="Align Middle"
                      >
                        <AlignVerticalJustifyCenter className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={properties.verticalAlign === 'bottom' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePropertyChange('verticalAlign', 'bottom')}
                        className="flex-1 h-8"
                        title="Align Bottom"
                      >
                        <AlignVerticalJustifyEnd className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Line Height */}
                  <div>
                    <Label className="text-xs text-gray-500 mb-2 block">Line Height: {properties.lineHeight || 1.2}</Label>
                    <Slider
                      value={[properties.lineHeight || 1.2]}
                      onValueChange={([value]) => handlePropertyChange('lineHeight', value)}
                      min={0.8}
                      max={3}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  {/* Letter Spacing */}
                  <div>
                    <Label className="text-xs text-gray-500 mb-2 block">Letter Spacing: {properties.letterSpacing || 0}px</Label>
                    <Slider
                      value={[properties.letterSpacing || 0]}
                      onValueChange={([value]) => handlePropertyChange('letterSpacing', value)}
                      min={-2}
                      max={5}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Box & Layout Properties */}
              <AccordionItem value="box-layout" className="border border-gray-200 rounded-lg bg-white/60 shadow-sm backdrop-blur-sm">
                <AccordionTrigger className="px-4 py-3 hover:bg-gray-50/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div title="Box & Layout">
                      <Settings className="w-4 h-4" />
                    </div>
                    Box & Layout
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 space-y-4">
                  {/* Padding */}
                  <div>
                    <Label className="text-xs text-gray-500 mb-2 block">Padding: {properties.padding || 0}px</Label>
                    <Slider
                      value={[properties.padding || 0]}
                      onValueChange={([value]) => handlePropertyChange('padding', value)}
                      min={0}
                      max={50}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Border */}
                  <div>
                    <Label className="text-xs text-gray-500 mb-2 block">Border</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-gray-400 mb-1 block">Width</Label>
                        <Input
                          type="number"
                          value={properties.borderWidth || 0}
                          onChange={(e) => handlePropertyChange('borderWidth', parseInt(e.target.value) || 0)}
                          className="h-8 text-sm"
                          min="0"
                          max="10"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-400 mb-1 block">Style</Label>
                        <Select
                          value={properties.borderStyle || 'solid'}
                          onValueChange={(value) => handlePropertyChange('borderStyle', value)}
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="solid">Solid</SelectItem>
                            <SelectItem value="dashed">Dashed</SelectItem>
                            <SelectItem value="dotted">Dotted</SelectItem>
                            <SelectItem value="double">Double</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Corner Radius */}
                  <div>
                    <Label className="text-xs text-gray-500 mb-2 block">Corner Radius: {properties.borderRadius || 0}px</Label>
                    <Slider
                      value={[properties.borderRadius || 0]}
                      onValueChange={([value]) => handlePropertyChange('borderRadius', value)}
                      min={0}
                      max={50}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Opacity */}
                  <div>
                    <Label className="text-xs text-gray-500 mb-2 block">Opacity: {Math.round((properties.opacity || 1) * 100)}%</Label>
                    <Slider
                      value={[properties.opacity || 1]}
                      onValueChange={([value]) => handlePropertyChange('opacity', value)}
                      min={0}
                      max={1}
                      step={0.01}
                      className="w-full"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Colors & Styling */}
              <AccordionItem value="colors-styling" className="border border-gray-200 rounded-lg bg-white/60 shadow-sm backdrop-blur-sm">
                <AccordionTrigger className="px-4 py-3 hover:bg-gray-50/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div title="Colors & Styling">
                      <Palette className="w-4 h-4" />
                    </div>
                    Colors & Styling
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 space-y-4">
                  {/* Text Color */}
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={properties.color}
                        onChange={(e) => handlePropertyChange('color', e.target.value)}
                        className="w-12 h-8 p-1 border rounded cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={properties.color}
                        onChange={(e) => handlePropertyChange('color', e.target.value)}
                        className="flex-1 h-8 text-sm"
                        placeholder="#000000"
                      />
                    </div>
                  </div>

                  {/* Background Color */}
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={properties.backgroundColor || '#ffffff'}
                        onChange={(e) => handlePropertyChange('backgroundColor', e.target.value)}
                        className="w-12 h-8 p-1 border rounded cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={properties.backgroundColor || '#ffffff'}
                        onChange={(e) => handlePropertyChange('backgroundColor', e.target.value)}
                        className="flex-1 h-8 text-sm"
                        placeholder="transparent"
                      />
                    </div>
                  </div>

                  {/* Border Color */}
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Border Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={properties.borderColor || '#000000'}
                        onChange={(e) => handlePropertyChange('borderColor', e.target.value)}
                        className="w-12 h-8 p-1 border rounded cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={properties.borderColor || '#000000'}
                        onChange={(e) => handlePropertyChange('borderColor', e.target.value)}
                        className="flex-1 h-8 text-sm"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </motion.div>
        )}

        {/* Table Properties */}
        {selectedElement.type === 'table' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <Accordion type="single" collapsible className="space-y-2">
              {/* Table Themes */}
              <AccordionItem value="table-themes" className="border border-gray-200 rounded-lg bg-white/60 shadow-sm backdrop-blur-sm">
                <AccordionTrigger className="px-4 py-3 hover:bg-gray-50/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div title="Table Themes">
                      <Palette className="w-4 h-4" />
                    </div>
                    <span className="text-sm sm:text-base">Table Themes</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-2 pb-2">
                  <div className="grid grid-cols-2 gap-2">
                    {TABLE_THEMES.map(theme => renderThemePreview(theme))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Table Structure */}
              <AccordionItem value="table-structure" className="border border-gray-200 rounded-lg bg-white/60 shadow-sm backdrop-blur-sm">
                <AccordionTrigger className="px-4 py-3 hover:bg-gray-50/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div title="Table Structure">
                      <Table className="w-4 h-4" />
                    </div>
                    <span className="text-sm sm:text-base">Table Structure</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Rows: {selectedElement.rows || 1}</Label>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={handleRemoveRow} disabled={(selectedElement.rows || 1) <= 1}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={handleAddRow}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Columns: {selectedElement.cols || 1}</Label>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={handleRemoveColumn} disabled={(selectedElement.cols || 1) <= 1}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={handleAddColumn}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Table Styling */}
              <AccordionItem value="table-styling" className="border border-gray-200 rounded-lg bg-white/60 shadow-sm backdrop-blur-sm">
                <AccordionTrigger className="px-4 py-3 hover:bg-gray-50/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div title="Table Styling">
                      <Palette className="w-4 h-4" />
                    </div>
                    <span className="text-sm sm:text-base">Table Styling</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 space-y-4">
                  {/* Header Row Toggle */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="header-toggle">Header Row</Label>
                    <Switch
                      id="header-toggle"
                      checked={selectedElement.header || false}
                      onCheckedChange={(checked) => onElementUpdate(selectedElement.id, { header: checked })}
                    />
                  </div>

                  {/* Alternating Row Background */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="row-alt-bg-toggle">Alternating Row Background</Label>
                    <Switch
                      id="row-alt-bg-toggle"
                      checked={!!selectedElement.rowAltBg}
                      onCheckedChange={(checked) => onElementUpdate(selectedElement.id, { rowAltBg: checked ? '#f5f5f5' : null })}
                    />
                  </div>

                  {/* Cell Padding */}
                  <div>
                    <Label className="text-sm font-medium">Cell Padding: {selectedElement.cellPadding || 0}px</Label>
                    <Slider
                      value={[selectedElement.cellPadding || 0]}
                      onValueChange={([value]) => onElementUpdate(selectedElement.id, { cellPadding: value })}
                      min={0} max={20} step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Border Width */}
                  <div>
                    <Label className="text-sm font-medium">Border Width: {selectedElement.borderWidth || 0}px</Label>
                    <Slider
                      value={[selectedElement.borderWidth || 0]}
                      onValueChange={([value]) => onElementUpdate(selectedElement.id, { borderWidth: value })}
                      min={0} max={5} step={0.5}
                      className="w-full"
                    />
                  </div>

                  {/* Border Color */}
                  <div>
                    <Label className="text-sm font-medium">Border Color</Label>
                    <Input
                      type="color"
                      value={selectedElement.borderColor || '#D9D9D9'}
                      onChange={(e) => onElementUpdate(selectedElement.id, { borderColor: e.target.value })}
                      className="w-full"
                    />
                  </div>

                  {/* Header Background Color */}
                  <div>
                    <Label className="text-sm font-medium">Header Background Color</Label>
                    <Input
                      type="color"
                      value={selectedElement.headerBg || '#E7E6E6'}
                      onChange={(e) => onElementUpdate(selectedElement.id, { headerBg: e.target.value })}
                      className="w-full"
                    />
                  </div>

                  {/* Header Text Color */}
                  <div>
                    <Label className="text-sm font-medium">Header Text Color</Label>
                    <Input
                      type="color"
                      value={selectedElement.headerTextColor || '#000000'}
                      onChange={(e) => onElementUpdate(selectedElement.id, { headerTextColor: e.target.value })}
                      className="w-full"
                    />
                  </div>

                  {/* Text Color */}
                  <div>
                    <Label className="text-sm font-medium">Text Color</Label>
                    <Input
                      type="color"
                      value={selectedElement.color || '#000000'}
                      onChange={(e) => onElementUpdate(selectedElement.id, { color: e.target.value })}
                      className="w-full"
                    />
                  </div>

                  {/* Shadow */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="shadow-toggle">Shadow</Label>
                    <Switch
                      id="shadow-toggle"
                      checked={!!selectedElement.shadow}
                      onCheckedChange={(checked) => onElementUpdate(selectedElement.id, { shadow: checked })}
                    />
                  </div>
                  {selectedElement.shadow && (
                    <div>
                      <Label className="text-sm font-medium">Shadow Blur: {selectedElement.shadowBlur || 0}px</Label>
                      <Slider
                        value={[selectedElement.shadowBlur || 0]}
                        onValueChange={([value]) => onElementUpdate(selectedElement.id, { shadowBlur: value })}
                        min={0} max={50} step={1}
                        className="w-full"
                      />
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </motion.div>
        )}

        {/* Chart Properties */}
        {selectedElement.type === 'chart' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Accordion type="single" collapsible className="space-y-2">
              <AccordionItem value="chart-title" className="border border-gray-200 rounded-lg bg-white/60 shadow-sm backdrop-blur-sm">
                <AccordionTrigger className="px-4 py-3 hover:bg-gray-50/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div title="Chart Title">
                      <Type className="w-4 h-4" />
                    </div>
                    Chart Title
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 space-y-4">
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Title Text</Label>
                    <Input
                      value={selectedElement.chartData?.title || ''}
                      onChange={(e) => {
                        handlePropertyChange('chartData', {
                          ...selectedElement.chartData,
                          title: e.target.value
                        });
                      }}
                      className="w-full h-8 text-sm"
                      placeholder="Enter chart title"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Font Family</Label>
                    <Select
                      value={selectedElement.chartData?.titleFontFamily || 'system-ui'}
                      onValueChange={(value) => {
                        handlePropertyChange('chartData', {
                          ...selectedElement.chartData,
                          titleFontFamily: value
                        });
                      }}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system-ui">System UI</SelectItem>
                        <SelectItem value="Arial">Arial</SelectItem>
                        <SelectItem value="Helvetica">Helvetica</SelectItem>
                        <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                        <SelectItem value="Georgia">Georgia</SelectItem>
                        <SelectItem value="Verdana">Verdana</SelectItem>
                        <SelectItem value="Courier New">Courier New</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Alignment</Label>
                    <div className="flex gap-1">
                    <Button
                        variant={selectedElement.chartData?.titleAlign === 'left' ? 'default' : 'outline'}
                      size="sm"
                        onClick={() => {
                          handlePropertyChange('chartData', {
                            ...selectedElement.chartData,
                            titleAlign: 'left'
                          });
                        }}
                        className="flex-1 h-8"
                    >
                      <AlignLeft className="w-4 h-4" />
                    </Button>
                    <Button
                        variant={selectedElement.chartData?.titleAlign === 'center' ? 'default' : 'outline'}
                      size="sm"
                        onClick={() => {
                          handlePropertyChange('chartData', {
                            ...selectedElement.chartData,
                            titleAlign: 'center'
                          });
                        }}
                        className="flex-1 h-8"
                    >
                      <AlignCenter className="w-4 h-4" />
                    </Button>
                    <Button
                        variant={selectedElement.chartData?.titleAlign === 'right' ? 'default' : 'outline'}
                      size="sm"
                        onClick={() => {
                          handlePropertyChange('chartData', {
                            ...selectedElement.chartData,
                            titleAlign: 'right'
                          });
                        }}
                        className="flex-1 h-8"
                    >
                      <AlignRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                  
            <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Text Color</Label>
                    <div className="flex gap-2">
                    <Input
                      type="color"
                        value={selectedElement.chartData?.titleColor || '#000000'}
                        onChange={(e) => {
                          handlePropertyChange('chartData', {
                            ...selectedElement.chartData,
                            titleColor: e.target.value
                          });
                        }}
                        className="w-12 h-8 p-1 border rounded cursor-pointer"
                    />
                    <Input
                        type="text"
                        value={selectedElement.chartData?.titleColor || '#000000'}
                        onChange={(e) => {
                          handlePropertyChange('chartData', {
                            ...selectedElement.chartData,
                            titleColor: e.target.value
                          });
                        }}
                        className="flex-1 h-8 text-sm"
                      placeholder="#000000"
                    />
                  </div>
                </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="labels" className="border border-gray-200 rounded-lg bg-white/60 shadow-sm backdrop-blur-sm">
                <AccordionTrigger className="px-4 py-3 hover:bg-gray-50/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div title="Labels">
                      <Tag className="w-4 h-4" />
                    </div>
                    {selectedElement.chartType === 'pie' ? 'Pie Segments' : `Labels (${labelCount})`}
                    {dataCounts.some(count => count !== labelCount && labelCount > 0) && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertTriangle className="w-4 h-4 text-yellow-500 cursor-pointer animate-pulse" />
                          </TooltipTrigger>
                          <TooltipContent className="bg-black text-white text-xs rounded-md p-2 shadow-md">
                            <div className="text-center">
                              <div className="font-semibold mb-1">⚠️ Label Mismatch</div>
                              <div>Some datasets don't match label count</div>
                              <div className="text-yellow-300 mt-1">
                                Check individual datasets for details
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 space-y-3">
                  {selectedElement.chartType === 'pie' ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 border-b pb-1">
                        <div className="col-span-2 text-center">Color</div>
                        <div className="col-span-5 text-center">Label</div>
                        <div className="col-span-4 text-center">Value</div>
                        <div className="col-span-1"></div>
                      </div>
                      
                      {selectedElement.chartData.labels?.map((label: string, index: number) => {
                        const dataset = selectedElement.chartData.datasets?.[0];
                        const color = Array.isArray(dataset?.backgroundColor) 
                          ? dataset.backgroundColor[index % dataset.backgroundColor.length] 
                          : '#3b82f6';
                        const value = dataset?.data?.[index] || 0;
                        
                        return (
                          <div key={index} className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-2 flex items-center justify-center">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button
                                    className="w-5 h-5 rounded-full border-2 border-gray-200 hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    style={{ backgroundColor: color }}
                                    title="Click to change color"
                                  />
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-2" align="start">
                                  <div className="grid grid-cols-6 gap-2 w-[200px]">
                                    {CHART_COLOR_PALETTE.map((c, i) => (
                                      <button
                                        key={i}
                                        className="w-6 h-6 rounded-full border-2 border-transparent hover:border-gray-400 transition-colors"
                                        style={{ backgroundColor: c }}
                                        onClick={() => {
                                          const newDatasets = [...(selectedElement.chartData.datasets || [])];
                                          if (newDatasets[0]) {
                                            const newBgColors = [...(Array.isArray(newDatasets[0].backgroundColor) ? newDatasets[0].backgroundColor : [])];
                                            newBgColors[index] = c;
                                            newDatasets[0] = {
                                              ...newDatasets[0],
                                              backgroundColor: newBgColors,
                                              borderColor: newBgColors
                                            };
                                            handlePropertyChange('chartData', {
                                              ...selectedElement.chartData,
                                              datasets: newDatasets
                                            });
                                          }
                                        }}
                                        title={c}
                                      />
                                    ))}
                                  </div>
                                  <div className="mt-3">
                                    <Label className="text-xs text-gray-500 mb-1 block">Custom Color</Label>
                                    <div className="flex gap-2">
                                      <Input
                                        type="color"
                                        value={color}
                                        onChange={(e) => {
                                          const newDatasets = [...(selectedElement.chartData.datasets || [])];
                                          if (newDatasets[0]) {
                                            const newBgColors = [...(Array.isArray(newDatasets[0].backgroundColor) ? newDatasets[0].backgroundColor : [])];
                                            newBgColors[index] = e.target.value;
                                            newDatasets[0] = {
                                              ...newDatasets[0],
                                              backgroundColor: newBgColors,
                                              borderColor: newBgColors
                                            };
                                            handlePropertyChange('chartData', {
                                              ...selectedElement.chartData,
                                              datasets: newDatasets
                                            });
                                          }
                                        }}
                                        className="w-10 h-8 p-1 border rounded cursor-pointer"
                                      />
                                      <Input
                                        type="text"
                                        value={color}
                                        onChange={(e) => {
                                          const newDatasets = [...(selectedElement.chartData.datasets || [])];
                                          if (newDatasets[0]) {
                                            const newBgColors = [...(Array.isArray(newDatasets[0].backgroundColor) ? newDatasets[0].backgroundColor : [])];
                                            newBgColors[index] = e.target.value;
                                            newDatasets[0] = {
                                              ...newDatasets[0],
                                              backgroundColor: newBgColors,
                                              borderColor: newBgColors
                                            };
                                            handlePropertyChange('chartData', {
                                              ...selectedElement.chartData,
                                              datasets: newDatasets
                                            });
                                          }
                                        }}
                                        className="flex-1 h-8 text-sm"
                                        placeholder="#RRGGBB"
                                      />
                                    </div>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>
                            <div className="col-span-5">
                              <Input
                                value={label}
                                onChange={(e) => {
                                  const newLabels = [...(selectedElement.chartData.labels || [])];
                                  newLabels[index] = e.target.value;
                                  handlePropertyChange('chartData', {
                                    ...selectedElement.chartData,
                                    labels: newLabels
                                  });
                                }}
                                className="h-7 text-xs w-full px-2"
                              />
                            </div>
                            <div className="col-span-4">
                              <Input
                                type="number"
                                value={value}
                                onChange={(e) => {
                                  const newDatasets = [...(selectedElement.chartData.datasets || [])];
                                  if (newDatasets[0]) {
                                    newDatasets[0] = {
                                      ...newDatasets[0],
                                      data: newDatasets[0].data?.map((v: number, i: number) => 
                                        i === index ? Number(e.target.value) : v
                                      ) || []
                                    };
                                    handlePropertyChange('chartData', {
                                      ...selectedElement.chartData,
                                      datasets: newDatasets
                                    });
                                  }
                                }}
                                className="h-7 text-xs w-full px-2"
                              />
                            </div>
                            <div className="col-span-1 flex justify-end">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newLabels = (selectedElement.chartData.labels || []).filter((_: any, i: number) => i !== index);
                                  const newDatasets = [...(selectedElement.chartData.datasets || [])];
                                  if (newDatasets[0]) {
                                    newDatasets[0] = {
                                      ...newDatasets[0],
                                      data: newDatasets[0].data?.filter((_: any, i: number) => i !== index) || []
                                    };
                                  }
                                  handlePropertyChange('chartData', {
                                    ...selectedElement.chartData,
                                    labels: newLabels,
                                    datasets: newDatasets
                                  });
                                }}
                                className="h-6 w-6 p-0 text-red-600 hover:bg-red-100"
                                disabled={labelCount <= 1}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const currentLabels = selectedElement.chartData.labels || [];
                          if (currentLabels.length < 10) {
                            const newLabels = [...currentLabels, `Segment ${currentLabels.length + 1}`];
                            const newDatasets = [...(selectedElement.chartData.datasets || [])];
                            
                            if (newDatasets[0]) {
                              newDatasets[0] = {
                                ...newDatasets[0],
                                data: [...(newDatasets[0].data || []), 0],
                                backgroundColor: [
                                  ...(Array.isArray(newDatasets[0].backgroundColor) ? newDatasets[0].backgroundColor : []),
                                  `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`
                                ]
                              };
                            }
                            
                            handlePropertyChange('chartData', {
                              ...selectedElement.chartData,
                              labels: newLabels,
                              datasets: newDatasets
                            });
                          }
                        }}
                        disabled={labelCount >= 10}
                        className="w-full h-8 text-xs mt-2"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Segment
                      </Button>
                      
                      {labelCount === 0 && (
                        <p className="text-xs text-gray-500 text-center py-2">
                          Click "Add Segment" to add pie chart segments (max 10)
                        </p>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Chart Labels</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const currentLabels = selectedElement.chartData.labels || [];
                            if (currentLabels.length < 10) {
                              const newLabels = [...currentLabels, `Label ${currentLabels.length + 1}`];
                              handlePropertyChange('chartData', {
                                ...selectedElement.chartData,
                                labels: newLabels
                              });
                            }
                          }}
                          disabled={labelCount >= 10}
                          className="h-7 px-2 text-xs"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Label
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        {selectedElement.chartData.labels?.map((label: string, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              value={label}
                              onChange={(e) => {
                                const newLabels = [...(selectedElement.chartData.labels || [])];
                                newLabels[index] = e.target.value;
                                handlePropertyChange('chartData', {
                                  ...selectedElement.chartData,
                                  labels: newLabels
                                });
                              }}
                              className="flex-1 h-7 text-sm"
                              placeholder={`Label ${index + 1}`}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newLabels = (selectedElement.chartData.labels || []).filter((_: any, i: number) => i !== index);
                                handlePropertyChange('chartData', {
                                  ...selectedElement.chartData,
                                  labels: newLabels
                                });
                              }}
                              className="h-7 w-7 p-0 text-red-600 hover:bg-red-600 hover:text-white transition-colors duration-200"
                              disabled={labelCount <= 1}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      
                      {labelCount === 0 && (
                        <p className="text-xs text-gray-500 text-center py-2">
                          Click "Add Label" to add chart labels (max 10)
                        </p>
                      )}
                    </>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Dataset field is conditionally rendered based on chart type */}
              {selectedElement.chartType !== 'pie' && (
                <AccordionItem value="datasets" className="border border-gray-200 rounded-lg bg-white/60 shadow-sm backdrop-blur-sm">
                  <AccordionTrigger className="px-4 py-3 hover:bg-gray-50/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div title="Datasets">
                        <Database className="w-4 h-4" />
                      </div>
                      Datasets ({selectedElement.chartData?.datasets?.length || 0})
                      {dataCounts.some(count => count !== labelCount && labelCount > 0) && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <AlertTriangle className="w-4 h-4 text-yellow-500 cursor-pointer animate-pulse" />
                            </TooltipTrigger>
                            <TooltipContent className="bg-black text-white text-xs rounded-md p-2 shadow-md">
                              <div className="text-center">
                                <div className="font-semibold mb-1">⚠️ Data Mismatch</div>
                                <div>Some datasets have incorrect data counts</div>
                                <div className="text-yellow-300 mt-1">
                                  Check individual datasets for details
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 space-y-4 overflow-visible">
                    {selectedElement.chartData.datasets?.map((dataset: any, datasetIndex: number) => (
                      <motion.div 
                        key={datasetIndex}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-xl border border-gray-200 p-4 bg-white/80 shadow-sm backdrop-blur-sm hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-semibold text-sm flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: dataset.backgroundColor || '#3b82f6' }}
                            />
                          Dataset {datasetIndex + 1}
                          {(() => {
                            const hasMismatch = dataCounts[datasetIndex] !== labelCount && labelCount > 0;
                            if (datasetIndex === 0) {
                              // console.log('Dataset 1 mismatch check:', {
                              //   dataCount: dataCounts[datasetIndex],
                              //   labelCount,
                              //   hasMismatch
                              // });
                            }
                            return hasMismatch;
                          })() && (
                            <div className="flex items-center gap-1">
                              <AlertTriangle className="w-4 h-4 text-yellow-500 animate-pulse" />
                              <span className="text-xs text-yellow-600 font-medium">
                                {dataCounts[datasetIndex] || 0}/{labelCount}
                              </span>
                            </div>
                          )}
                          </h4>
                          {dataCounts[datasetIndex] !== labelCount && labelCount > 0 && (
                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                              <div className="text-xs text-yellow-800">
                                <div className="font-semibold mb-1">⚠️ Data Mismatch</div>
                                <div>Labels: {labelCount} | Data values: {dataCounts[datasetIndex] || 0}</div>
                                <div className="text-yellow-700 mt-1">
                                  {getDataCountWarning(datasetIndex)}
                                </div>
                              </div>
                            </div>
                          )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newDatasets = selectedElement.chartData.datasets.filter((_: any, i: number) => i !== datasetIndex);
                            handlePropertyChange('chartData', {
                              ...selectedElement.chartData,
                              datasets: newDatasets
                            });
                          }}
                          className="h-6 w-6 p-0 text-red-600 hover:bg-red-600 hover:text-white transition-colors duration-200"
                          disabled={selectedElement.chartData.datasets.length <= 1}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
        <div>
                          <Label className="text-xs text-gray-500 mb-1 block">Label</Label>
                <Input
                            value={dataset.label || ''}
                            onChange={(e) => {
                              const newDatasets = [...(selectedElement.chartData?.datasets || [])];
                              newDatasets[datasetIndex] = { ...newDatasets[datasetIndex], label: e.target.value };
                              handlePropertyChange('chartData', {
                                ...selectedElement.chartData,
                                datasets: newDatasets
                              });
                            }}
                            className="h-8 text-sm"
                            placeholder="Series name"
                />
              </div>

              <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-xs text-gray-500">Values ({dataCounts[datasetIndex] || 0})</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const currentData = dataset.data || [];
                                if (currentData.length < 10) {
                                  const newData = [...currentData, 0];
                                  const newDatasets = [...(selectedElement.chartData?.datasets || [])];
                                  newDatasets[datasetIndex] = { ...newDatasets[datasetIndex], data: newData };
                                  handlePropertyChange('chartData', {
                                    ...selectedElement.chartData,
                                    datasets: newDatasets
                                  });
                                }
                              }}
                              disabled={(dataCounts[datasetIndex] || 0) >= 10}
                              className="h-6 px-2 text-xs"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add
                            </Button>
                          </div>
                          
                          <div className="space-y-1">
                            {dataset.data?.map((value: number, valueIndex: number) => (
                              <div key={valueIndex} className="flex items-center gap-2">
                <Input
                  type="number"
                                  value={value}
                                  onChange={(e) => {
                                    const newData = [...(dataset.data || [])];
                                    newData[valueIndex] = parseFloat(e.target.value) || 0;
                                    const newDatasets = [...(selectedElement.chartData?.datasets || [])];
                                    newDatasets[datasetIndex] = { ...newDatasets[datasetIndex], data: newData };
                                    handlePropertyChange('chartData', {
                                      ...selectedElement.chartData,
                                      datasets: newDatasets
                                    });
                                  }}
                                  className="flex-1 h-6 text-xs"
                                  placeholder={`Value ${valueIndex + 1}`}
                                  step="0.1"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newData = (dataset.data || []).filter((_: any, i: number) => i !== valueIndex);
                                    const newDatasets = [...(selectedElement.chartData?.datasets || [])];
                                    newDatasets[datasetIndex] = { ...newDatasets[datasetIndex], data: newData };
                                    handlePropertyChange('chartData', {
                                      ...selectedElement.chartData,
                                      datasets: newDatasets
                                    });
                                  }}
                                  className="h-6 w-6 p-0 text-red-600 hover:bg-red-600 hover:text-white transition-colors duration-200"
                                  disabled={(dataCounts[datasetIndex] || 0) <= 1}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
              </div>
            </div>

              <div>
                          <Label className="text-xs text-gray-500 mb-2 block">Color</Label>
                          <div className="grid grid-cols-5 gap-2">
                            {CHART_COLOR_PALETTE.map((color, colorIndex) => {
                              // Check if this color is used by other datasets
                              const isUsedByOtherDataset = selectedElement.chartData?.datasets?.some((otherDataset: any, otherIndex: number) => 
                                otherIndex !== datasetIndex && (otherDataset.backgroundColor === color || otherDataset.borderColor === color)
                              );
                              const isCurrentColor = (dataset.backgroundColor || '#3b82f6') === color;
                              const isDisabled = isUsedByOtherDataset && !isCurrentColor;
                              
                              return (
                                <button
                                  key={colorIndex}
                                  onClick={() => {
                                    if (isDisabled) return;
                                    const newDatasets = [...(selectedElement.chartData?.datasets || [])];
                                    newDatasets[datasetIndex] = { 
                                      ...newDatasets[datasetIndex], 
                                      backgroundColor: color,
                                      borderColor: color
                                    };
                                    handlePropertyChange('chartData', {
                                      ...selectedElement.chartData,
                                      datasets: newDatasets
                                    });
                                  }}
                                  disabled={isDisabled}
                                  className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 ${
                                    isDisabled 
                                      ? 'opacity-30 cursor-not-allowed border-gray-200' 
                                      : isCurrentColor
                                        ? 'border-gray-800 shadow-lg hover:scale-110'
                                        : 'border-gray-300 hover:border-gray-500 hover:scale-110'
                                  }`}
                                  style={{ 
                                    backgroundColor: color,
                                    ...(isDisabled && { filter: 'grayscale(100%)' })
                                  }}
                                  title={isDisabled ? `${color} (Used by another dataset)` : color}
                                />
                              );
                            })}
                          </div>
                          <div className="mt-2 text-xs text-gray-500 text-center">
                            Current: {dataset.backgroundColor || '#3b82f6'}
              </div>
                          {selectedElement.chartData?.datasets?.some((otherDataset: any, otherIndex: number) => 
                            otherIndex !== datasetIndex && (otherDataset.backgroundColor === dataset.backgroundColor || otherDataset.borderColor === dataset.backgroundColor)
                          ) && (
                            <div className="mt-1 text-xs text-yellow-600 text-center">
                              ⚠️ This color is used by another dataset
              </div>
                          )}
            </div>
          </div>
                    </motion.div>
                  ))}
                  
                  {selectedElement.chartType !== 'pie' && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        const newDataset = {
                          label: `Dataset ${(selectedElement.chartData?.datasets?.length || 0) + 1}`,
                          data: selectedElement.chartData?.labels?.map(() => 0) || [0],
                          backgroundColor: '#3b82f6',
                          borderColor: '#3b82f6'
                        };
                        const newDatasets = [...(selectedElement.chartData?.datasets || []), newDataset];
                        handlePropertyChange('chartData', {
                          ...selectedElement.chartData,
                          datasets: newDatasets
                        });
                      }}
                      className="w-full h-10 border-dashed border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-600 hover:text-gray-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Dataset
                    </Button>
                  )}
                </AccordionContent>
              </AccordionItem>
              )}
            </Accordion>
          </motion.div>
        )}

        {/* Image Properties */}
        {selectedElement.type === 'image' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <Accordion type="single" collapsible className="space-y-2">

              {/* Border & Styling */}
              <AccordionItem value="image-border" className="border border-gray-200 rounded-lg bg-white/60 shadow-sm backdrop-blur-sm">
                <AccordionTrigger className="px-4 py-3 hover:bg-gray-50/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div title="Border & Styling">
                      <Square className="w-4 h-4" />
                    </div>
                    <span className="text-sm sm:text-base">Border & Styling</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 space-y-4">
                  {/* Border Width */}
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Border Width</Label>
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[selectedElement.borderWidth || 0]}
                        onValueChange={([value]) => handlePropertyChange('borderWidth', value)}
                        min={0}
                        max={20}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-xs w-8 text-center">{selectedElement.borderWidth || 0}px</span>
                    </div>
                  </div>

                  {/* Border Style */}
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Border Style</Label>
                    <Select
                      value={selectedElement.borderStyle || 'solid'}
                      onValueChange={(value) => handlePropertyChange('borderStyle', value)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Select border style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="solid">Solid</SelectItem>
                        <SelectItem value="dashed">Dashed</SelectItem>
                        <SelectItem value="dotted">Dotted</SelectItem>
                        <SelectItem value="double">Double</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Border Color */}
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Border Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={selectedElement.borderColor || '#000000'}
                        onChange={(e) => handlePropertyChange('borderColor', e.target.value)}
                        className="w-12 h-8 p-1 border rounded cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={selectedElement.borderColor || '#000000'}
                        onChange={(e) => handlePropertyChange('borderColor', e.target.value)}
                        className="flex-1 h-8 text-sm"
                        placeholder="#000000"
                      />
                    </div>
                  </div>

                  {/* Border Radius */}
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Border Radius</Label>
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[selectedElement.borderRadius || 0]}
                        onValueChange={([value]) => handlePropertyChange('borderRadius', value)}
                        min={0}
                        max={Math.min(selectedElement.width || 0, selectedElement.height || 0) / 2}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-xs w-8 text-center">{selectedElement.borderRadius || 0}px</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Opacity */}
              <AccordionItem value="image-opacity" className="border border-gray-200 rounded-lg bg-white/60 shadow-sm backdrop-blur-sm">
                <AccordionTrigger className="px-4 py-3 hover:bg-gray-50/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div title="Opacity">
                      <Droplet className="w-4 h-4" />
                    </div>
                    <span className="text-sm sm:text-base">Opacity</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[selectedElement.opacity !== undefined ? selectedElement.opacity * 100 : 100]}
                      onValueChange={([value]) => handlePropertyChange('opacity', value / 100)}
                      min={0}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-xs w-12 text-center">
                      {Math.round((selectedElement.opacity !== undefined ? selectedElement.opacity : 1) * 100)}%
                    </span>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </motion.div>
        )}

        {/* Shape Properties */}
        {selectedElement.type === 'shape' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Accordion type="single" collapsible className="space-y-2">
              <AccordionItem value="shape-fill" className="border border-gray-200 rounded-lg bg-white/60 shadow-sm backdrop-blur-sm">
                <AccordionTrigger className="px-4 py-3 hover:bg-gray-50/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Fill & Stroke
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 space-y-4">
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Fill Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={selectedElement.fill || '#ffffff'}
                        onChange={(e) => handlePropertyChange('fill', e.target.value)}
                        className="w-12 h-8 p-1 border border-gray-300 rounded cursor-pointer"
                      />
                      <Input
                        value={selectedElement.fill || '#ffffff'}
                        onChange={(e) => handlePropertyChange('fill', e.target.value)}
                        className="flex-1 h-8 text-sm"
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Stroke Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={selectedElement.stroke || '#000000'}
                        onChange={(e) => handlePropertyChange('stroke', e.target.value)}
                        className="w-12 h-8 p-1 border border-gray-300 rounded cursor-pointer"
                      />
                      <Input
                        value={selectedElement.stroke || '#000000'}
                        onChange={(e) => handlePropertyChange('stroke', e.target.value)}
                        className="flex-1 h-8 text-sm"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Stroke Width</Label>
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[selectedElement.strokeWidth || 0.5]}
                        onValueChange={([value]) => handlePropertyChange('strokeWidth', value)}
                        min={0}
                        max={10}
                        step={0.5}
                        className="flex-1"
                      />
                      <span className="text-xs text-gray-500 w-8 text-right">
                        {selectedElement.strokeWidth || 0.5}px
                      </span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="shape-opacity" className="border border-gray-200 rounded-lg bg-white/60 shadow-sm backdrop-blur-sm">
                <AccordionTrigger className="px-4 py-3 hover:bg-gray-50/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Opacity
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 space-y-4">
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Opacity</Label>
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[selectedElement.opacity || 1]}
                        onValueChange={([value]) => handlePropertyChange('opacity', value)}
                        min={0}
                        max={1}
                        step={0.1}
                        className="flex-1"
                      />
                      <span className="text-xs text-gray-500 w-8 text-right">
                        {Math.round((selectedElement.opacity || 1) * 100)}%
                      </span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </motion.div>
        )}

      </div>
    </aside>
    </TooltipProvider>
  );
};

export default PropertiesPanel;