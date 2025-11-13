import { BarChart3, LineChart, PieChart, Edit, X, ChevronRight } from "lucide-react";
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

  // Chart type descriptions with color-coded highlights
  const chartTypeDescriptions = {
    bar: <span>Ideal for <span className="text-blue-600 dark:text-blue-400">comparing values</span> across categories</span>,
    line: <span>Perfect for showing <span className="text-emerald-600 dark:text-emerald-400">trends over time</span></span>,
    pie: <span>Best for displaying <span className="text-amber-600 dark:text-amber-400">parts of a whole</span></span>
  };
  
  // Header description with subtle highlights
  const headerDescription = (
    <span>
      Transform your data into <span className="text-blue-600 dark:text-blue-400 font-medium">compelling visual stories</span>
    </span>
  );
  
  // Footer description with subtle highlights
  const footerDescription = (
    <span>
      Select a chart type to visualize your data with <span className="text-emerald-600 dark:text-emerald-400 font-medium">clarity</span> and <span className="text-amber-600 dark:text-amber-400 font-medium">impact</span>
    </span>
  );

  return (
    <KeynoteModal isOpen={open} onClose={onClose}>
      <div 
        className="relative p-6" 
        ref={modalRef}
      >
        {/* Header */}
        <div className="text-center mb-6 relative">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            {editingChart ? 'Edit Chart' : 'Add Chart'}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mt-2 text-sm font-normal">
            {headerDescription}
          </p>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-0 top-0 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        {!showEditor ? (
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">SELECT CHART TYPE</h3>
              <div className="grid grid-cols-1 gap-3">
                {chartTypes.map(({ type, icon: Icon, label }) => (
                  <button
                    key={type}
                    onClick={() => handleChartTypeSelect(type)}
                    className={`group relative p-4 rounded-xl border transition-all flex items-center w-full text-left ${
                      selectedType === type
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500/50 shadow-md'
                        : 'border-gray-200 hover:border-blue-300 dark:border-gray-700 dark:hover:border-blue-600/50 hover:bg-gray-50 dark:hover:bg-gray-800/40'
                    }`}
                  >
                    <div className={`p-2.5 rounded-lg mr-4 ${
                      selectedType === type 
                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-500 dark:group-hover:text-blue-400'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">{label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {chartTypeDescriptions[type]}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400" />
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-gray-200/40">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center font-medium">
                Select a chart type to visualize your data with clarity and impact
              </p>
            </div>
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
