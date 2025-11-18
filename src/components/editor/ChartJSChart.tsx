import React, { useMemo, useState, useCallback, useEffect } from 'react';
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
  scale?: number; // visual scale multiplier for thumbnails/presentations
}

export const ChartJSChart: React.FC<ChartJSChartProps> = ({
  chart,
  isSelected,
  onUpdate,
  onDelete,
  onSelect,
  scale = 1,
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
          borderWidth: 1 * scale,
        }]
      };
    }
    
    return {
      labels,
      datasets: datasets.map((dataset: any, index: number) => {
        const userBackground = dataset.backgroundColor;
        const userBorder = dataset.borderColor;

        const fallbackColor = (() => {
          if (typeof userBorder === 'string') return userBorder;
          if (typeof userBackground === 'string') return userBackground;
          if (Array.isArray(userBorder) && userBorder.length) return userBorder[0];
          if (Array.isArray(userBackground) && userBackground.length) return userBackground[0];
          return colorPalette[index % colorPalette.length];
        })();

        const alphaVariants = typeof fallbackColor === 'string'
          ? createAlphaVariants(fallbackColor)
          : { light: fallbackColor, medium: fallbackColor, dark: fallbackColor, solid: fallbackColor };

        const colorIdentity = typeof fallbackColor === 'string'
          ? {
              solid: fallbackColor,
              light: alphaVariants.light,
              medium: alphaVariants.medium,
              dark: alphaVariants.dark,
              text: getTextColor(fallbackColor)
            }
          : undefined;

        const resolvedBackground =
          userBackground ??
          (chart.chartType === 'line'
            ? (typeof fallbackColor === 'string' ? alphaVariants.medium : fallbackColor)
            : (typeof fallbackColor === 'string' ? alphaVariants.dark : fallbackColor));

        const resolvedBorder =
          userBorder ??
          (typeof fallbackColor === 'string' ? fallbackColor : (Array.isArray(fallbackColor) ? fallbackColor[0] : fallbackColor));

        return {
          label: dataset.label || `Dataset ${index + 1}`,
          data: Array.isArray(dataset.data) ? dataset.data : [],
          backgroundColor: resolvedBackground,
          borderColor: resolvedBorder,
          borderWidth: (dataset.borderWidth ?? (chart.chartType === 'line' ? 3 : 2)) * scale,
          pointBackgroundColor: dataset.pointBackgroundColor ?? (typeof resolvedBorder === 'string' ? resolvedBorder : undefined),
          pointBorderColor: dataset.pointBorderColor ?? (typeof resolvedBorder === 'string' ? resolvedBorder : undefined),
          pointHoverBackgroundColor: dataset.pointHoverBackgroundColor ?? (typeof resolvedBorder === 'string' ? resolvedBorder : undefined),
          pointHoverBorderColor: dataset.pointHoverBorderColor ?? '#ffffff',
          pointRadius: (dataset.pointRadius ?? (chart.chartType === 'line' ? 4 : 0)) * scale,
          pointHoverRadius: (dataset.pointHoverRadius ?? (chart.chartType === 'line' ? 6 : 0)) * scale,
          fill: dataset.fill ?? (chart.chartType === 'line' ? false : true),
          tension: dataset.tension ?? (chart.chartType === 'line' ? 0.4 : 0),
          hoverBackgroundColor: dataset.hoverBackgroundColor ?? resolvedBackground,
          hoverBorderColor: dataset.hoverBorderColor ?? resolvedBorder,
          colorIdentity
        };
      })
    };
  }, [chart.chartData, chart.chartType, colorPalette, scale]);

  // Precomputed pie data (for pie charts only)
  const pieData = useMemo(() => {
    if (chart.chartType !== 'pie' || !chart.chartData) return null;

    const baseDatasets = chart.chartData.datasets || [];
    if (!baseDatasets.length) return null;

    return {
      labels: chart.chartData.labels || [],
      datasets: baseDatasets.map((dataset: any) => ({
        label: dataset.label || '',
        data: dataset.data || [],
        backgroundColor: dataset.backgroundColor || '#3B82F6',
        borderColor: dataset.borderColor || 'transparent',
        borderWidth: dataset.borderWidth ?? 0,
      })),
    };
  }, [chart.chartType, chart.chartData]);

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
      title: {
        display: !!chart.chartData?.title,
        text: chart.chartData?.title || '',
        font: {
          size: (chart.chartData?.titleFontSize || 16) * scale,
          weight: chart.chartData?.titleFontWeight || 'bold',
          family: 'sans-serif'
        },
        color: chart.chartData?.titleColor || '#000000',
        padding: {
          top: 10 * scale,
          bottom: 10 * scale
        }
      },
      legend: {
        display: false, // We'll use custom legend below charts (hidden in thumbnails)
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20 * scale,
          font: {
            size: 12 * scale,
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
        borderWidth: 2 * scale,
        cornerRadius: 12 * scale,
        displayColors: true,
        padding: 12 * scale,
        titleFont: {
          size: 13 * scale,
          weight: 'bold' as const
        },
        bodyFont: {
          size: 12 * scale,
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
          lineWidth: 1 * scale
        },
        ticks: {
          color: 'rgba(0, 0, 0, 0.6)',
          font: {
            size: 11 * scale,
            weight: 'normal' as const
          },
          padding: 8 * scale
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
          lineWidth: 1 * scale
        },
        ticks: {
          color: 'rgba(0, 0, 0, 0.6)',
          font: {
            size: 11 * scale,
            weight: 'normal' as const
          },
          padding: 8 * scale,
          callback: (value: any) => {
            return typeof value === 'number' ? value.toLocaleString() : value;
          }
        }
      }
    } : undefined
  }), [chartData, chart.chartType, scale]);

  const renderChart = () => {
    if (!chart.chartType || !chart.chartData) {
      console.warn('[ChartJSChart] Missing chartType or chartData:', { chartType: chart.chartType, hasData: !!chart.chartData });
      return null;
    }
    
    console.log('[ChartJSChart] Rendering chart:', {
      type: chart.chartType,
      labels: chart.chartData?.labels?.length,
      datasets: chart.chartData?.datasets?.length,
      title: chart.chartData?.title
    });

    switch (chart.chartType) {
      case 'bar':
        return (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Title (read-only; editable in Properties Panel) */}
            {chart.chartData?.title && (
              <div style={{ marginBottom: 16 * scale, padding: `${0}px ${8 * scale}px` }}>
                <div
                  style={{
                    borderRadius: 4 * scale,
                    padding: `${4 * scale}px ${8 * scale}px`,
                    fontSize: `${(chart.chartData?.titleFontSize || 18) * scale}px`,
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
            <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
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
             {/* Hide custom legend in thumbnails to avoid oversized DOM text */}
             {scale >= 1 && (
               <div className="flex flex-wrap justify-center gap-4 p-3 bg-gray-50/50 rounded-b-lg text-sm">
                 {chartData.datasets.map((dataset: any, index: number) => {
                   const color = dataset.colorIdentity?.solid || dataset.backgroundColor;
                   return (
                     <div 
                       key={index} 
                       className="flex items-center gap-2"
                     >
                       <div 
                         className="w-3 h-3 rounded-full flex-shrink-0"
                         style={{ backgroundColor: color }}
                       />
                       <span style={{ color: color }}>
                         {dataset.label}
                       </span>
                     </div>
                   );
                 })}
               </div>
             )}
          </div>
        );
      
      case 'line':
        return (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Title (read-only; editable in Properties Panel) */}
            {chart.chartData?.title && (
              <div style={{ marginBottom: 16 * scale, padding: `${0}px ${8 * scale}px` }}>
                <div
                  style={{
                    borderRadius: 4 * scale,
                    padding: `${4 * scale}px ${8 * scale}px`,
                    fontSize: `${(chart.chartData?.titleFontSize || 18) * scale}px`,
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
            <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
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
             {scale >= 1 && (
               <div className="flex flex-wrap justify-center gap-4 p-3 bg-gray-50/50 rounded-b-lg text-sm">
                 {chartData.datasets.map((dataset: any, index: number) => {
                   const color = dataset.colorIdentity?.solid || dataset.backgroundColor;
                   return (
                     <div 
                       key={index} 
                       className="flex items-center gap-2"
                     >
                       <div 
                         className="w-3 h-3 rounded-full flex-shrink-0"
                         style={{ backgroundColor: color }}
                       />
                       <span style={{ color: color }}>
                         {dataset.label}
                       </span>
                     </div>
                   );
                 })}
               </div>
             )}
          </div>
        );
      
      case 'pie': {
        // Enforce single dataset for pies (most common case)
        const datasets = (chart.chartData?.datasets || []).slice(0, 1);
        
        if (datasets.length === 1 && pieData) {
          // Single dataset - regular pie chart with intelligent color shades
          const dataset = pieData.datasets[0];

          return (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Title (read-only; editable in Properties Panel) */}
              {chart.chartData?.title && (
                <div style={{ marginBottom: 16 * scale, padding: `${0}px ${8 * scale}px` }}>
                  <div
                    style={{
                      borderRadius: 4 * scale,
                      padding: `${4 * scale}px ${8 * scale}px`,
                      fontSize: `${(chart.chartData?.titleFontSize || 18) * scale}px`,
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
              <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
                <Pie 
                  data={pieData} 
                  options={{
                    ...commonOptions,
                    plugins: {
                      ...commonOptions.plugins,
                      legend: {
                        ...commonOptions.plugins.legend,
                        display: true,
                        position: 'bottom',
                        labels: {
                          ...commonOptions.plugins.legend.labels,
                          // Color legend markers AND text with slice color
                          generateLabels: (chart: any) => {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                              return data.labels.map((label: string, i: number) => {
                                const ds = data.datasets[0];
                                const backgroundColor = Array.isArray(ds.backgroundColor) 
                                  ? ds.backgroundColor[i] 
                                  : ds.backgroundColor;
                                const borderColor = Array.isArray(ds.borderColor) 
                                  ? ds.borderColor[i] 
                                  : ds.borderColor;
                                
                                return {
                                  text: label,
                                  fillStyle: backgroundColor,
                                  strokeStyle: borderColor,
                                  lineWidth: 1,
                                  hidden: false,
                                  index: i,
                                  // Chart.js v3+ uses `color`; v2 used `fontColor`.
                                  color: backgroundColor,
                                  fontColor: backgroundColor,
                                };
                              });
                            }
                            return [];
                          },
                        },
                        onClick: (e: any, legendItem: any, legend: any) => {
                          const index = legendItem.index;
                          const ci = legend.chart;
                          if (ci.getDataVisibility(index)) {
                            ci.hide(index);
                            legendItem.hidden = true;
                          } else {
                            ci.show(index);
                            legendItem.hidden = false;
                          }
                          ci.update('none');
                        },
                      },
                      tooltip: {
                        ...commonOptions.plugins.tooltip,
                        callbacks: {
                          title: (context: any) => {
                            const label = context[0]?.label || '';
                            return dataset.label ? `${label} (${dataset.label})` : label;
                          },
                          label: (context: any) => {
                            const value = context.parsed;
                            const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return dataset.label
                              ? `${dataset.label}: ${value.toLocaleString()} (${percentage}%)`
                              : `${value.toLocaleString()} (${percentage}%)`;
                          },
                        },
                      },
                    },
                  }} 
                />
              </div>
            </div>
          );
        } else {
          // Multiple datasets - existing combined pie logic (unchanged)
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
                <div className="px-2" style={{ marginBottom: 16 * scale }}>
                  <div
                    className="rounded"
                    style={{
                      padding: `${4 * scale}px ${8 * scale}px`,
                      fontSize: `${(chart.chartData?.titleFontSize || 18) * scale}px`,
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
                <Pie 
                  data={combinedPieData} 
                  options={{
                    ...commonOptions,
                    plugins: {
                      ...commonOptions.plugins,
                      legend: {
                        ...commonOptions.plugins.legend,
                        display: true,
                        position: 'bottom',
                        labels: {
                          ...commonOptions.plugins.legend.labels,
                          generateLabels: (chart: any) => {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                              return data.labels.map((label: string, i: number) => {
                                // Find which dataset this label belongs to
                                let datasetIndex = 0;
                                let itemIndex = i;
                                let currentLength = 0;
                                
                                for (let j = 0; j < data.datasets.length; j++) {
                                  const dataset = data.datasets[j];
                                  if (i < currentLength + dataset.data.length) {
                                    datasetIndex = j;
                                    itemIndex = i - currentLength;
                                    break;
                                  }
                                  currentLength += dataset.data.length;
                                }
                                
                                const dataset = data.datasets[datasetIndex];
                                const backgroundColor = Array.isArray(dataset.backgroundColor) 
                                  ? dataset.backgroundColor[itemIndex] 
                                  : dataset.backgroundColor;
                                const borderColor = Array.isArray(dataset.borderColor) 
                                  ? dataset.borderColor[itemIndex] 
                                  : dataset.borderColor;
                                
                                return {
                                  text: label,
                                  fillStyle: backgroundColor,
                                  strokeStyle: borderColor,
                                  lineWidth: 1,
                                  hidden: !chart.getDataVisibility(i),
                                  index: i,
                                  color: backgroundColor,
                                  fontColor: backgroundColor,
                                };
                              });
                            }
                            return [];
                          }
                        },
                        onClick: (e: any, legendItem: any, legend: any) => {
                          const index = legendItem.index;
                          const ci = legend.chart;
                          if (ci.getDataVisibility(index)) {
                            ci.hide(index);
                            legendItem.hidden = true;
                          } else {
                            ci.show(index);
                            legendItem.hidden = false;
                          }
                          ci.update('none');
                        }
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
              
               {/* Hide custom legend in thumbnails */}
               {scale >= 1 && (
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
               )}
            </div>
          );
        }
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
                <div className="px-2" style={{ marginBottom: 16 * scale }}>
                  <div
                    className="rounded"
                    style={{
                      padding: `${4 * scale}px ${8 * scale}px`,
                      fontSize: `${(chart.chartData?.titleFontSize || 18) * scale}px`,
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
                <Pie 
                  data={combinedPieData} 
                  options={{
                    ...commonOptions,
                    plugins: {
                      ...commonOptions.plugins,
                      legend: {
                        ...commonOptions.plugins.legend,
                        display: true,
                        position: 'bottom',
                        labels: {
                          ...commonOptions.plugins.legend.labels,
                          generateLabels: (chart: any) => {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                              return data.labels.map((label: string, i: number) => {
                                // Find which dataset this label belongs to
                                let datasetIndex = 0;
                                let itemIndex = i;
                                let currentLength = 0;
                                
                                for (let j = 0; j < data.datasets.length; j++) {
                                  const dataset = data.datasets[j];
                                  if (i < currentLength + dataset.data.length) {
                                    datasetIndex = j;
                                    itemIndex = i - currentLength;
                                    break;
                                  }
                                  currentLength += dataset.data.length;
                                }
                                
                                const dataset = data.datasets[datasetIndex];
                                const backgroundColor = Array.isArray(dataset.backgroundColor) 
                                  ? dataset.backgroundColor[itemIndex] 
                                  : dataset.backgroundColor;
                                const borderColor = Array.isArray(dataset.borderColor) 
                                  ? dataset.borderColor[itemIndex] 
                                  : dataset.borderColor;
                                
                                return {
                                  text: label,
                                  fillStyle: backgroundColor,
                                  strokeStyle: borderColor,
                                  lineWidth: 1,
                                  hidden: !chart.getDataVisibility(i),
                                  index: i
                                };
                              });
                            }
                            return [];
                          }
                        },
                        onClick: (e: any, legendItem: any, legend: any) => {
                          const index = legendItem.index;
                          const ci = legend.chart;
                          if (ci.getDataVisibility(index)) {
                            ci.hide(index);
                            legendItem.hidden = true;
                          } else {
                            ci.show(index);
                            legendItem.hidden = false;
                          }
                          ci.update('none');
                        }
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
              
               {/* Hide custom legend in thumbnails */}
               {scale >= 1 && (
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
               )}
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
