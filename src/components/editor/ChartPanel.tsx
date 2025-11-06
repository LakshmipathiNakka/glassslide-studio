import { BarChart3, LineChart, PieChart, Edit, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import KeynoteModal from "@/components/ui/keynote-modal";
import { useState, useRef, useEffect } from "react";
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
  const modalRef = useRef<HTMLDivElement>(null);
  const [selectedType, setSelectedType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [showEditor, setShowEditor] = useState(false);

  // handleCreate has been moved into handleChartTypeSelect

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

  // Auto-insert chart when a type is selected
  const handleChartTypeSelect = (type: 'bar' | 'line' | 'pie') => {
    setSelectedType(type);
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
          // Pie charts require backgroundColor to be an array of colors (one per label/slice)
          backgroundColor: [
            colorPalette[0],  // Product A color
            colorPalette[1],  // Product B color
            colorPalette[2],  // Product C color
          ],
          borderColor: [
            colorPalette[0],
            colorPalette[1],
            colorPalette[2],
          ],
        }]
      }
    };

    onAddChart(type, defaultData[type]);
    onClose();
  };

  return (
    <KeynoteModal isOpen={open} onClose={onClose}>
      <div className="relative p-4 sm:p-6" ref={modalRef}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
        
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">
          {editingChart ? 'Edit Chart' : 'Add Chart'}
        </h2>
        
        {!showEditor ? (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-2 px-1">Chart Type</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                {chartTypes.map(({ type, icon: Icon, label }) => (
                  <button
                    key={type}
                    onClick={() => handleChartTypeSelect(type)}
                    className={`flex flex-col items-center p-3 sm:p-4 rounded-lg border-2 transition-all ${
                      selectedType === type
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                    }`}
                  >
                    <Icon className="w-6 h-6 sm:w-8 sm:h-8 mb-1.5 sm:mb-2" />
                    <span className="text-xs sm:text-sm">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Removed Cancel and Create Chart buttons as requested */}
          </div>
        ) : (
          <ChartEditor
            open={showEditor}
            onClose={() => setShowEditor(false)}
            onSave={handleEditorSave}
            initialData={editingChart?.data}
            initialType={selectedType}
          />
        )}
      </div>
    </KeynoteModal>
  );
};
