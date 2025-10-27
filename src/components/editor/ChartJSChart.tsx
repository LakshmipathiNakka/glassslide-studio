import React, { useMemo, useState, useCallback } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Element } from '@/hooks/use-action-manager';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler
);

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
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

const rgbToHex = (r: number, g: number, b: number) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

const getBrightness = (hex: string) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  return (rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114);
};

const getTextColor = (bgColor: string) => {
  const brightness = getBrightness(bgColor);
  return brightness > 150 ? '#000000' : '#ffffff';
};

const createShades = (baseColor: string, count: number) => {
  const rgb = hexToRgb(baseColor);
  if (!rgb) return [baseColor];
  
  const shades = [];
  for (let i = 0; i < count; i++) {
    const factor = 0.2 + (0.8 * i / (count - 1));
    const r = Math.round(rgb.r * factor);
    const g = Math.round(rgb.g * factor);
    const b = Math.round(rgb.b * factor);
    shades.push(rgbToHex(r, g, b));
  }
  return shades;
};

const createAlphaVariants = (baseColor: string) => {
  const rgb = hexToRgb(baseColor);
  if (!rgb) return { light: baseColor, medium: baseColor, dark: baseColor };
  
  return {
    light: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
    medium: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`,
    dark: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)`,
    solid: baseColor
  };
};

interface ChartJSChartProps {
  chart: Element;
  isSelected: boolean;
  onUpdate: (updates: Partial<Element>) => void;
  onDelete: () => void;
  onSelect: () => void;
}

export const ChartJSChart: React.FC<ChartJSChartProps> = ({
  chart,
  isSelected,
  onUpdate,
  onDelete,
  onSelect,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Delete' && isSelected) {
      onDelete();
    }
  };

  // Handle title editing
  const handleTitleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingTitle(true);
    setEditTitle(chart.chartData?.title || '');
  }, [chart.chartData?.title]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditTitle(e.target.value);
  }, []);

  const handleTitleSubmit = useCallback(() => {
    onUpdate({
      chartData: {
        ...chart.chartData,
        title: editTitle
      }
    });
    setIsEditingTitle(false);
  }, [chart.chartData, editTitle, onUpdate]);

  const handleTitleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
      setEditTitle(chart.chartData?.title || '');
    }
  }, [handleTitleSubmit, chart.chartData?.title]);

  // Intelligent color assignment with consistency across chart types
  const colorMode = 'professional'; // Can be made dynamic later
  const colorPalette = COLOR_MODES[colorMode as keyof typeof COLOR_MODES];

  const chartData = useMemo(() => {
    const labels = chart.chartData?.labels || [];
    const datasets = chart.chartData?.datasets || [];
    
    // Ensure we have valid data
    if (!labels.length || !datasets.length) {
      return {
        labels: ['No Data'],
        datasets: [{
          label: 'No Data',
          data: [1],
          backgroundColor: 'rgba(128, 128, 128, 0.5)',
          borderColor: 'rgba(128, 128, 128, 1)',
          borderWidth: 1,
        }]
      };
    }
    
    return {
      labels,
      datasets: datasets.map((dataset: any, index: number) => {
        // Get base color from dataset or assign from palette
        const baseColor = dataset.backgroundColor || dataset.borderColor || colorPalette[index % colorPalette.length];
        const alphaVariants = createAlphaVariants(baseColor);
        
        // Create consistent color identity across chart types
        const colorIdentity = {
          solid: baseColor,
          light: alphaVariants.light,
          medium: alphaVariants.medium,
          dark: alphaVariants.dark,
          text: getTextColor(baseColor)
        };

        return {
          label: dataset.label || `Dataset ${index + 1}`,
          data: Array.isArray(dataset.data) ? dataset.data : [],
          backgroundColor: chart.chartType === 'line' ? alphaVariants.medium : alphaVariants.dark,
          borderColor: baseColor,
          borderWidth: chart.chartType === 'line' ? 3 : 2,
          pointBackgroundColor: baseColor,
          pointBorderColor: baseColor,
          pointHoverBackgroundColor: baseColor,
          pointHoverBorderColor: '#ffffff',
          pointRadius: chart.chartType === 'line' ? 4 : 0,
          pointHoverRadius: chart.chartType === 'line' ? 6 : 0,
          fill: chart.chartType === 'line' ? false : true,
          tension: chart.chartType === 'line' ? 0.4 : 0,
          hoverBackgroundColor: baseColor,
          hoverBorderColor: baseColor,
          // Store color identity for tooltips and legends
          colorIdentity
        };
      })
    };
  }, [chart.chartData, chart.chartType, colorPalette]);

  // Common options with intelligent color system
  const commonOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    hover: {
      mode: 'index' as const,
      intersect: false,
      animationDuration: 200,
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart' as const,
    },
    plugins: {
      legend: {
        display: false, // We'll use custom legend below charts
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: 'normal' as const
          },
          generateLabels: (chart: any) => {
            const original = ChartJS.defaults.plugins.legend.labels.generateLabels;
            const labels = original.call(this, chart);
            
            // Apply color identity to legend labels
            return labels.map((label: any, index: number) => {
              const dataset = chartData.datasets[index];
              if (dataset?.colorIdentity) {
                return {
                  ...label,
                  fillStyle: dataset.colorIdentity.solid,
                  strokeStyle: dataset.colorIdentity.solid,
                  fontColor: dataset.colorIdentity.text
                };
              }
              return label;
            });
          }
        }
      },
      tooltip: {
        backgroundColor: (context: any) => {
          try {
            const dataset = context?.tooltip?.dataPoints?.[0]?.dataset;
            return dataset?.colorIdentity?.solid || 'rgba(0, 0, 0, 0.8)';
          } catch (error) {
            return 'rgba(0, 0, 0, 0.8)';
          }
        },
        titleColor: (context: any) => {
          try {
            const dataset = context?.tooltip?.dataPoints?.[0]?.dataset;
            return dataset?.colorIdentity?.text || 'white';
          } catch (error) {
            return 'white';
          }
        },
        bodyColor: (context: any) => {
          try {
            const dataset = context?.tooltip?.dataPoints?.[0]?.dataset;
            return dataset?.colorIdentity?.text || 'white';
          } catch (error) {
            return 'white';
          }
        },
        borderColor: (context: any) => {
          try {
            const dataset = context?.tooltip?.dataPoints?.[0]?.dataset;
            return dataset?.colorIdentity?.solid || 'rgba(255, 255, 255, 0.1)';
          } catch (error) {
            return 'rgba(255, 255, 255, 0.1)';
          }
        },
        borderWidth: 2,
        cornerRadius: 12,
        displayColors: true,
        padding: 12,
        titleFont: {
          size: 13,
          weight: 'bold' as const
        },
        bodyFont: {
          size: 12,
          weight: 'normal' as const
        },
        callbacks: {
          title: (context: any) => {
            return context[0]?.label || '';
          },
          label: (context: any) => {
            const dataset = context.dataset;
            const value = context.parsed.y || context.parsed;
            const formattedValue = typeof value === 'number' ? value.toLocaleString() : value;
            return `${dataset.label}: ${formattedValue}`;
          },
          afterLabel: (context: any) => {
            if (chart.chartType === 'pie') {
              const dataset = context.dataset;
              const value = context.parsed;
              const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${percentage}%`;
            }
            return '';
          }
        }
      },
      title: {
        display: false // We use our own editable title above the chart
      }
    },
    scales: chart.chartType !== 'pie' ? {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
          lineWidth: 1
        },
        ticks: {
          color: 'rgba(0, 0, 0, 0.6)',
          font: {
            size: 11,
            weight: 'normal' as const
          },
          padding: 8
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
          lineWidth: 1
        },
        ticks: {
          color: 'rgba(0, 0, 0, 0.6)',
          font: {
            size: 11,
            weight: 'normal' as const
          },
          padding: 8,
          callback: (value: any) => {
            return typeof value === 'number' ? value.toLocaleString() : value;
          }
        }
      }
    } : undefined
  }), [chartData, chart.chartType]);

  const renderChart = () => {
    if (!chart.chartType || !chart.chartData) return null;

    switch (chart.chartType) {
      case 'bar':
        return (
          <div className="w-full h-full flex flex-col">
            {/* Title (read-only; editable in Properties Panel) */}
            {chart.chartData?.title && (
              <div className="mb-4 px-2">
                <div
                  className="rounded px-2 py-1"
                  style={{
                    fontSize: `${chart.chartData?.titleFontSize || 18}px`,
                    fontFamily: chart.chartData?.titleFontFamily || 'system-ui, -apple-system, sans-serif',
                    fontWeight: chart.chartData?.titleFontWeight || 'bold',
                    color: chart.chartData?.titleColor || '#000000',
                    textAlign: chart.chartData?.titleAlign || 'center'
                  }}
                >
                  {chart.chartData.title}
                </div>
              </div>
            )}
            <div className="flex-1 min-h-0">
              <Bar 
                data={chartData} 
                options={{
                  ...commonOptions,
                  plugins: {
                    ...commonOptions.plugins,
                    legend: {
                      display: false
                    }
                  }
                }} 
              />
            </div>
             {/* Custom responsive legend */}
             <div className="flex flex-wrap justify-center gap-3 p-3 bg-gray-50/50 rounded-b-lg">
               {chartData.datasets.map((dataset: any, index: number) => {
                 const color = dataset.colorIdentity?.solid || dataset.backgroundColor;
                 return (
                   <div 
                     key={index} 
                     className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg text-sm font-medium shadow-sm border border-gray-200 transition-all duration-200 hover:scale-105 hover:shadow-lg"
                   >
                     <div 
                       className="w-3 h-3 rounded-full"
                       style={{ backgroundColor: color }}
                     />
                     <span style={{ color: color }}>
                       {dataset.label}
                     </span>
                   </div>
                 );
               })}
             </div>
          </div>
        );
      
      case 'line':
        return (
          <div className="w-full h-full flex flex-col">
            {/* Title (read-only; editable in Properties Panel) */}
            {chart.chartData?.title && (
              <div className="mb-4 px-2">
                <div
                  className="rounded px-2 py-1"
                  style={{
                    fontSize: `${chart.chartData?.titleFontSize || 18}px`,
                    fontFamily: chart.chartData?.titleFontFamily || 'system-ui, -apple-system, sans-serif',
                    fontWeight: chart.chartData?.titleFontWeight || 'bold',
                    color: chart.chartData?.titleColor || '#000000',
                    textAlign: chart.chartData?.titleAlign || 'center'
                  }}
                >
                  {chart.chartData.title}
                </div>
              </div>
            )}
            <div className="flex-1 min-h-0">
              <Line 
                data={chartData} 
                options={{
                  ...commonOptions,
                  plugins: {
                    ...commonOptions.plugins,
                    legend: {
                      display: false
                    }
                  },
                  elements: {
                    line: {
                      tension: 0.4,
                      borderWidth: 3
                    },
                    point: {
                      radius: 4,
                      hoverRadius: 6
                    }
                  }
                }} 
              />
            </div>
             {/* Custom responsive legend */}
             <div className="flex flex-wrap justify-center gap-3 p-3 bg-gray-50/50 rounded-b-lg">
               {chartData.datasets.map((dataset: any, index: number) => {
                 const color = dataset.colorIdentity?.solid || dataset.backgroundColor;
                 return (
                   <div 
                     key={index} 
                     className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg text-sm font-medium shadow-sm border border-gray-200 transition-all duration-200 hover:scale-105 hover:shadow-lg"
                   >
                     <div 
                       className="w-3 h-3 rounded-full"
                       style={{ backgroundColor: color }}
                     />
                     <span style={{ color: color }}>
                       {dataset.label}
                     </span>
                   </div>
                 );
               })}
             </div>
          </div>
        );
      
      case 'pie':
        // Enforce single dataset for pies
        const datasets = (chart.chartData?.datasets || []).slice(0, 1);
        
        if (datasets.length === 1) {
          // Single dataset - regular pie chart with intelligent color shades
          const dataset = chartData.datasets[0];
          // Prefer per-slice colors if provided; otherwise use distinct palette colors
          const sliceColors: string[] = Array.isArray(dataset.backgroundColor)
            ? (dataset.backgroundColor as string[])
            : chartData.labels.map((_, i) => colorPalette[i % colorPalette.length]);
          
          const pieData = {
            labels: chartData.labels,
            datasets: [{
              ...dataset,
              data: dataset.data,
              backgroundColor: sliceColors,
              borderColor: sliceColors,
              borderWidth: 2,
              hoverBackgroundColor: sliceColors,
              hoverBorderColor: '#ffffff',
              hoverBorderWidth: 3
            }]
          };
          
          return (
            <div className="w-full h-full flex flex-col">
              {/* Title (read-only; editable in Properties Panel) */}
              {chart.chartData?.title && (
                <div className="mb-4 px-2">
                  <div
                    className="text-center font-bold text-lg text-black rounded px-2 py-1"
                    style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                  >
                    {chart.chartData.title}
                  </div>
                </div>
              )}
              <div className="flex-1 min-h-0">
                <Pie 
                  data={pieData} 
                  options={{
                    ...commonOptions,
                    plugins: {
                      ...commonOptions.plugins,
                      legend: {
                        display: false
                      },
                      tooltip: {
                        ...commonOptions.plugins.tooltip,
                        callbacks: {
                          title: (context: any) => {
                            const label = context[0]?.label || '';
                            return `${label}(${dataset.label})`;
                          },
                          label: (context: any) => {
                            const value = context.parsed;
                            const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${dataset.label}: ${value.toLocaleString()} (${percentage}%)`;
                          }
                        }
                      }
                    }
                  }} 
                />
              </div>
               {/* Custom responsive legend */}
               <div className="flex flex-wrap justify-center gap-3 p-3 bg-gray-50/50 rounded-b-lg">
                 {chartData.datasets.map((dataset: any, index: number) => {
                   const color = dataset.colorIdentity?.solid || dataset.backgroundColor;
                   return (
                     <div 
                       key={index} 
                       className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg text-sm font-medium shadow-sm border border-gray-200 transition-all duration-200 hover:scale-105 hover:shadow-lg"
                     >
                       <div 
                         className="w-3 h-3 rounded-full"
                         style={{ backgroundColor: color }}
                       />
                       <span style={{ color: color }}>
                         {dataset.label}
                       </span>
                     </div>
                   );
                 })}
               </div>
            </div>
          );
        } else {
          // Multiple datasets - create a single pie chart with all datasets as separate arcs
          // This ensures all datasets are equally interactive
          const allLabels: string[] = [];
          const allDatasets: any[] = [];
          
          datasets.forEach((dataset: any, datasetIndex: number) => {
            const baseColor = dataset.colorIdentity?.solid || dataset.backgroundColor;
            const shades = createShades(baseColor, chartData.labels.length);
            
            // Add dataset label to each data point label
            const labeledData = dataset.data.map((value: number, index: number) => ({
              value,
              label: `${chartData.labels[index]} (${dataset.label})`,
              originalLabel: chartData.labels[index],
              datasetLabel: dataset.label,
              color: shades[index] || baseColor
            }));
            
            allLabels.push(...labeledData.map(item => item.label));
            allDatasets.push({
              ...dataset,
              data: labeledData.map(item => item.value),
              backgroundColor: labeledData.map(item => item.color),
              borderColor: labeledData.map(item => item.color),
              borderWidth: 2,
              hoverBackgroundColor: labeledData.map(item => item.color),
              hoverBorderColor: '#ffffff',
              hoverBorderWidth: 3,
              // Store metadata for tooltips
              metadata: labeledData
            });
          });
          
          const combinedPieData = {
            labels: allLabels,
            datasets: allDatasets
          };
          
          return (
            <div className="w-full h-full flex flex-col">
              {/* Title (read-only; editable in Properties Panel) */}
              {chart.chartData?.title && (
                <div className="mb-4 px-2">
                  <div
                    className="text-center font-bold text-lg text-black rounded px-2 py-1"
                    style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                  >
                    {chart.chartData.title}
                  </div>
                </div>
              )}
              <div className="flex-1 min-h-0">
                <Pie 
                  data={combinedPieData} 
                  options={{
                    ...commonOptions,
                    plugins: {
                      ...commonOptions.plugins,
                      legend: {
                        display: false
                      },
                      tooltip: {
                        ...commonOptions.plugins.tooltip,
                        callbacks: {
                          title: (context: any) => {
                            const dataIndex = context[0]?.dataIndex || 0;
                            const datasetIndex = context[0]?.datasetIndex || 0;
                            const dataset = allDatasets[datasetIndex];
                            const metadata = dataset?.metadata?.[dataIndex];
                            
                            if (metadata) {
                              return `${metadata.originalLabel}(${metadata.datasetLabel})`;
                            }
                            
                            const label = context[0]?.label || '';
                            return label;
                          },
                          label: (context: any) => {
                            const dataIndex = context[0]?.dataIndex || 0;
                            const datasetIndex = context[0]?.datasetIndex || 0;
                            const dataset = allDatasets[datasetIndex];
                            const metadata = dataset?.metadata?.[dataIndex];
                            
                            if (metadata) {
                              const value = context.parsed;
                              const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
                              const percentage = ((value / total) * 100).toFixed(1);
                              return `${metadata.datasetLabel}: ${value.toLocaleString()} (${percentage}%)`;
                            }
                            
                            const value = context.parsed;
                            const currentDataset = allDatasets[datasetIndex];
                            const total = currentDataset.data.reduce((a: number, b: number) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${currentDataset.label}: ${value.toLocaleString()} (${percentage}%)`;
                          }
                        }
                      }
                    }
                  }} 
                />
              </div>
              
               {/* Custom responsive legend for multiple datasets */}
               <div className="flex flex-wrap justify-center gap-3 p-3 bg-gray-50/50 rounded-b-lg">
                 {datasets.map((dataset: any, index: number) => {
                   const baseColor = dataset.colorIdentity?.solid || dataset.backgroundColor;
                   return (
                     <div 
                       key={index} 
                       className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg text-sm font-medium shadow-sm border border-gray-200 transition-all duration-200 hover:scale-105 hover:shadow-lg"
                     >
                       <div 
                         className="w-3 h-3 rounded-full"
                         style={{ backgroundColor: baseColor }}
                       />
                       <span style={{ color: baseColor }}>
                         {dataset.label}
                       </span>
                     </div>
                   );
                 })}
               </div>
            </div>
          );
        }
      
      default:
        return (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="text-sm">Unsupported chart type</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div
      className={`w-full h-full relative flex flex-col ${isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      onClick={onSelect}
    >
      {renderChart()}
    </div>
  );
};
