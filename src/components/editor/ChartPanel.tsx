import { BarChart3, LineChart, PieChart, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { ChartEditor } from "./ChartEditor";

// Intelligent Color Management System
const COLOR_MODES = {
  professional: [
    '#007AFF', // iOS Blue
    '#FF3B30', // iOS Red
    '#34C759', // iOS Green
    '#FF9500', // iOS Orange
    '#AF52DE', // iOS Purple
    '#5AC8FA', // iOS Light Blue
    '#FFCC00', // iOS Yellow
    '#8E8E93', // iOS Gray
    '#FF2D92', // iOS Pink
    '#30D158', // iOS Mint
  ],
  creative: [
    '#FF6B6B', // Vibrant Red
    '#4ECDC4', // Teal
    '#45B7D1', // Sky Blue
    '#96CEB4', // Mint Green
    '#FFEAA7', // Soft Yellow
    '#DDA0DD', // Plum
    '#98D8C8', // Seafoam
    '#F7DC6F', // Golden Yellow
    '#BB8FCE', // Lavender
    '#85C1E9', // Light Blue
  ],
  accessible: [
    '#1f77b4', // Blue
    '#ff7f0e', // Orange
    '#2ca02c', // Green
    '#d62728', // Red
    '#9467bd', // Purple
    '#8c564b', // Brown
    '#e377c2', // Pink
    '#7f7f7f', // Gray
    '#bcbd22', // Olive
    '#17becf', // Cyan
  ]
};

// Color utility functions
const createAlphaVariants = (baseColor: string) => {
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgb = hexToRgb(baseColor);
  if (!rgb) return { light: baseColor, medium: baseColor, dark: baseColor };
  
  return {
    light: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
    medium: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`,
    dark: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)`,
    solid: baseColor
  };
};

interface ChartData {
  title?: string;
  titleFontSize?: number;
  titleFontWeight?: 'light' | 'normal' | 'bold';
  titleFontFamily?: string;
  titleAlign?: 'left' | 'center' | 'right';
  titleColor?: string;
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

interface ChartPanelProps {
  open: boolean;
  onClose: () => void;
  onAddChart: (type: 'bar' | 'line' | 'pie', data: ChartData) => void;
  onEditChart?: (type: 'bar' | 'line' | 'pie', data: ChartData) => void;
  editingChart?: { type: 'bar' | 'line' | 'pie'; data: ChartData } | null;
}

export const ChartPanel = ({ open, onClose, onAddChart, onEditChart, editingChart }: ChartPanelProps) => {
  const [selectedType, setSelectedType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [showEditor, setShowEditor] = useState(false);

  const handleCreate = () => {
    // Intelligent color assignment
    const colorMode = 'professional';
    const colorPalette = COLOR_MODES[colorMode as keyof typeof COLOR_MODES];
    
    // Default sample data with intelligent colors
    const defaultData = {
      bar: {
        title: 'Sales Chart',
        titleFontSize: 18,
        titleFontWeight: 'bold' as const,
        titleFontFamily: 'system-ui',
        titleAlign: 'center' as const,
        titleColor: '#000000',
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        datasets: [{
          label: 'Sales',
          data: [65, 59, 80, 81, 56],
          backgroundColor: createAlphaVariants(colorPalette[0]).dark,
          borderColor: colorPalette[0],
        }]
      },
      line: {
        title: 'Growth Chart',
        titleFontSize: 18,
        titleFontWeight: 'bold' as const,
        titleFontFamily: 'system-ui',
        titleAlign: 'center' as const,
        titleColor: '#000000',
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [{
          label: 'Growth',
          data: [30, 45, 60, 70],
          borderColor: colorPalette[1],
          backgroundColor: createAlphaVariants(colorPalette[1]).medium,
        }]
      },
      pie: {
        title: 'Product Distribution',
        titleFontSize: 18,
        titleFontWeight: 'bold' as const,
        titleFontFamily: 'system-ui',
        titleAlign: 'center' as const,
        titleColor: '#000000',
        labels: ['Product A', 'Product B', 'Product C'],
        datasets: [{
          label: 'Products',
          data: [300, 150, 100],
          backgroundColor: colorPalette[2],
          borderColor: colorPalette[2],
        }]
      }
    };

    onAddChart(selectedType, defaultData[selectedType]);
    onClose();
  };

  const handleEdit = () => {
    setShowEditor(true);
  };

  const handleEditorSave = (chartData: ChartData, chartType: 'bar' | 'line' | 'pie') => {
    if (editingChart && onEditChart) {
      onEditChart(chartType, chartData);
    } else {
      onAddChart(chartType, chartData);
    }
    setShowEditor(false);
    onClose();
  };

  const chartTypes = [
    { type: 'bar' as const, icon: BarChart3, label: 'Bar Chart' },
    { type: 'line' as const, icon: LineChart, label: 'Line Chart' },
    { type: 'pie' as const, icon: PieChart, label: 'Pie Chart' },
  ];

  if (showEditor) {
    return (
      <ChartEditor
        open={showEditor}
        onClose={() => setShowEditor(false)}
        onSave={handleEditorSave}
        initialData={editingChart?.data}
        initialType={editingChart?.type}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingChart ? 'Edit Chart' : 'Insert Chart'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {chartTypes.map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`p-6 rounded-lg border-2 transition-all hover:border-accent ${
                  selectedType === type 
                    ? 'border-accent bg-accent/5' 
                    : 'border-border'
                }`}
              >
                <Icon className="w-8 h-8 mx-auto mb-2 text-foreground" />
                <p className="text-xs text-center text-muted-foreground">{label}</p>
              </button>
            ))}
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="bg-transparent text-gray-600 hover:bg-gray-200 hover:text-black transition-all duration-300 btn-click btn-shimmer">
              Cancel
            </Button>
            {editingChart && (
              <Button variant="outline" onClick={handleEdit} className="bg-transparent text-gray-600 hover:bg-gray-200 hover:text-black transition-all duration-300 btn-click btn-shimmer">
                <Edit className="w-4 h-4 mr-2" />
                Edit Data
              </Button>
            )}
            <Button onClick={handleCreate} className="bg-black text-white hover:bg-gray-800 transition-all duration-300 btn-click btn-ripple btn-magnetic">
              {editingChart ? 'Update Chart' : 'Insert Chart'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
