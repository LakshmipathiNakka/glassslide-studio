/**
 * Chart Color Synchronization Utility
 * 
 * This utility ensures that pie chart colors are always synchronized with label counts
 * across all UI elements (labels, slide editor, and thumbnail).
 * 
 * Key Principles:
 * 1. Pie charts require backgroundColor to be an array of colors (one per slice)
 * 2. Bar/Line charts use a single color per dataset
 * 3. Color arrays must always match the label count for pie charts
 * 4. Color synchronization should be validated before rendering
 */

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
}

export interface ChartData {
  title?: string;
  titleFontSize?: number;
  titleFontWeight?: 'light' | 'normal' | 'bold';
  titleFontFamily?: string;
  titleAlign?: 'left' | 'center' | 'right';
  titleColor?: string;
  labels: string[];
  datasets: ChartDataset[];
}

export type ChartType = 'bar' | 'line' | 'pie';

/**
 * Default color palette for charts
 */
export const DEFAULT_CHART_COLORS = [
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
];

/**
 * Validates if a pie chart has correct color array structure
 */
export function validatePieChartColors(chartData: ChartData): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!chartData.labels || chartData.labels.length === 0) {
    errors.push('Chart must have at least one label');
  }
  
  if (!chartData.datasets || chartData.datasets.length === 0) {
    errors.push('Chart must have at least one dataset');
  }
  
  if (chartData.datasets && chartData.datasets.length > 0) {
    const dataset = chartData.datasets[0];
    const labelCount = chartData.labels?.length || 0;
    
    // Check if backgroundColor exists and is an array
    if (!dataset.backgroundColor) {
      errors.push('Pie chart dataset must have backgroundColor property');
    } else if (!Array.isArray(dataset.backgroundColor)) {
      errors.push('Pie chart backgroundColor must be an array of colors');
    } else if (dataset.backgroundColor.length !== labelCount) {
      errors.push(
        `Pie chart backgroundColor array length (${dataset.backgroundColor.length}) ` +
        `must match label count (${labelCount})`
      );
    }
    
    // Check borderColor if it exists
    if (dataset.borderColor) {
      if (!Array.isArray(dataset.borderColor)) {
        errors.push('Pie chart borderColor must be an array of colors');
      } else if (dataset.borderColor.length !== labelCount) {
        errors.push(
          `Pie chart borderColor array length (${dataset.borderColor.length}) ` +
          `must match label count (${labelCount})`
        );
      }
    }
    
    // Check data array length
    if (!dataset.data || dataset.data.length !== labelCount) {
      errors.push(
        `Pie chart data array length (${dataset.data?.length || 0}) ` +
        `must match label count (${labelCount})`
      );
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Synchronizes pie chart colors to match label count
 * Adds or removes colors as needed to ensure the arrays are in sync
 */
export function syncPieChartColors(chartData: ChartData): ChartData {
  if (!chartData.datasets || chartData.datasets.length === 0) {
    return chartData;
  }
  
  const labelCount = chartData.labels?.length || 0;
  const dataset = chartData.datasets[0];
  
  // Ensure backgroundColor is an array
  let bgColors: string[];
  if (Array.isArray(dataset.backgroundColor)) {
    bgColors = [...dataset.backgroundColor];
  } else if (typeof dataset.backgroundColor === 'string') {
    // Convert single color to array
    bgColors = [dataset.backgroundColor];
  } else {
    // No backgroundColor, create new array with default colors
    bgColors = [];
  }
  
  // Adjust array length to match label count
  if (bgColors.length < labelCount) {
    // Add more colors
    const colorsNeeded = labelCount - bgColors.length;
    for (let i = 0; i < colorsNeeded; i++) {
      const colorIndex = (bgColors.length + i) % DEFAULT_CHART_COLORS.length;
      bgColors.push(DEFAULT_CHART_COLORS[colorIndex]);
    }
  } else if (bgColors.length > labelCount) {
    // Remove excess colors
    bgColors = bgColors.slice(0, labelCount);
  }
  
  // Ensure borderColor is an array (matching backgroundColor)
  let borderColors: string[];
  if (Array.isArray(dataset.borderColor)) {
    borderColors = [...dataset.borderColor];
  } else if (typeof dataset.borderColor === 'string') {
    borderColors = [dataset.borderColor];
  } else {
    // No borderColor, use same as backgroundColor
    borderColors = [...bgColors];
  }
  
  // Adjust borderColor array length
  if (borderColors.length < labelCount) {
    const colorsNeeded = labelCount - borderColors.length;
    for (let i = 0; i < colorsNeeded; i++) {
      const colorIndex = (borderColors.length + i) % bgColors.length;
      borderColors.push(bgColors[colorIndex]);
    }
  } else if (borderColors.length > labelCount) {
    borderColors = borderColors.slice(0, labelCount);
  }
  
  // Ensure data array matches label count
  let data = [...(dataset.data || [])];
  if (data.length < labelCount) {
    const valuesNeeded = labelCount - data.length;
    for (let i = 0; i < valuesNeeded; i++) {
      data.push(0);
    }
  } else if (data.length > labelCount) {
    data = data.slice(0, labelCount);
  }
  
  return {
    ...chartData,
    datasets: [{
      ...dataset,
      backgroundColor: bgColors,
      borderColor: borderColors,
      data
    }]
  };
}

/**
 * Ensures chart data is properly formatted based on chart type
 */
export function normalizeChartData(chartData: ChartData, chartType: ChartType): ChartData {
  if (chartType === 'pie') {
    // For pie charts, ensure colors are synchronized
    return syncPieChartColors(chartData);
  }
  
  // For bar/line charts, ensure backgroundColor is a single color
  return {
    ...chartData,
    datasets: chartData.datasets.map(dataset => {
      let backgroundColor: string | undefined;
      if (Array.isArray(dataset.backgroundColor)) {
        backgroundColor = dataset.backgroundColor[0] || DEFAULT_CHART_COLORS[0];
      } else {
        backgroundColor = dataset.backgroundColor;
      }
      
      let borderColor: string | undefined;
      if (chartType === 'line') {
        if (Array.isArray(dataset.borderColor)) {
          borderColor = dataset.borderColor[0] || DEFAULT_CHART_COLORS[0];
        } else {
          borderColor = dataset.borderColor;
        }
      }
      
      return {
        ...dataset,
        backgroundColor,
        borderColor
      };
    })
  };
}

/**
 * Gets the color for a specific pie slice
 */
export function getPieSliceColor(
  chartData: ChartData,
  sliceIndex: number
): string {
  if (!chartData.datasets || chartData.datasets.length === 0) {
    return DEFAULT_CHART_COLORS[sliceIndex % DEFAULT_CHART_COLORS.length];
  }
  
  const dataset = chartData.datasets[0];
  if (Array.isArray(dataset.backgroundColor)) {
    return dataset.backgroundColor[sliceIndex] || 
           DEFAULT_CHART_COLORS[sliceIndex % DEFAULT_CHART_COLORS.length];
  }
  
  return DEFAULT_CHART_COLORS[sliceIndex % DEFAULT_CHART_COLORS.length];
}

/**
 * Updates the color of a specific pie slice
 */
export function updatePieSliceColor(
  chartData: ChartData,
  sliceIndex: number,
  newColor: string
): ChartData {
  if (!chartData.datasets || chartData.datasets.length === 0) {
    return chartData;
  }
  
  const dataset = chartData.datasets[0];
  let bgColors: string[] = Array.isArray(dataset.backgroundColor) 
    ? [...dataset.backgroundColor]
    : [];
  
  // Ensure array is large enough
  while (bgColors.length <= sliceIndex) {
    bgColors.push(DEFAULT_CHART_COLORS[bgColors.length % DEFAULT_CHART_COLORS.length]);
  }
  
  bgColors[sliceIndex] = newColor;
  
  // Update borderColor to match
  let borderColors: string[] = Array.isArray(dataset.borderColor)
    ? [...dataset.borderColor]
    : [...bgColors];
  
  while (borderColors.length <= sliceIndex) {
    borderColors.push(bgColors[borderColors.length % bgColors.length]);
  }
  
  borderColors[sliceIndex] = newColor;
  
  return {
    ...chartData,
    datasets: [{
      ...dataset,
      backgroundColor: bgColors,
      borderColor: borderColors
    }]
  };
}

/**
 * Log validation errors to console (for debugging)
 */
export function logChartValidationErrors(
  chartData: ChartData,
  chartType: ChartType,
  context: string = 'Chart'
): void {
  if (chartType === 'pie') {
    const validation = validatePieChartColors(chartData);
    if (!validation.isValid) {
      console.error(`${context} validation failed:`, validation.errors);
    }
  }
}
