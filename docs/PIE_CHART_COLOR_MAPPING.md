# Pie Chart Color Mapping Documentation

## Overview

This document explains the pie chart color mapping architecture in GlassSlide Studio, detailing how colors are synchronized across all UI elements (labels, slide editor, and thumbnails).

## Problem Statement

**Issue**: Pie chart segment color circles in the PropertiesPanel were displaying a single blue color for all labels, while the actual pie chart rendered in the editor and thumbnails showed three distinct colors.

**Root Cause**: The initial pie chart implementation was using a single color string for `backgroundColor` instead of an array of colors, causing a mismatch between what was stored and what the PropertiesPanel expected to display.

## Solution Architecture

### Key Principles

1. **Pie charts require backgroundColor to be an array of colors** - one color per slice/segment
2. **Bar/Line charts use a single color per dataset** - a single string value
3. **Color arrays must always match the label count** for pie charts
4. **Color synchronization should be validated** before rendering

### Data Structure

#### Correct Pie Chart Structure
```typescript
{
  labels: ['Product A', 'Product B', 'Product C'],
  datasets: [{
    label: 'Products',
    data: [300, 150, 100],
    backgroundColor: [
      '#007AFF',  // Color for Product A
      '#FF3B30',  // Color for Product B
      '#34C759',  // Color for Product C
    ],
    borderColor: [
      '#007AFF',
      '#FF3B30',
      '#34C759',
    ],
  }]
}
```

#### Incorrect Pie Chart Structure (What Was Happening Before)
```typescript
{
  labels: ['Product A', 'Product B', 'Product C'],
  datasets: [{
    label: 'Products',
    data: [300, 150, 100],
    backgroundColor: '#34C759',  // ❌ Single color - WRONG for pie charts
    borderColor: '#34C759',      // ❌ Single color - WRONG for pie charts
  }]
}
```

## Implementation Details

### 1. Color Initialization (ChartPanel.tsx)

When a new pie chart is created, colors are initialized as an array:

```typescript
pie: {
  title: 'Product Distribution',
  labels: ['Product A', 'Product B', 'Product C'],
  datasets: [{
    label: 'Products',
    data: [300, 150, 100],
    // Pie charts require backgroundColor to be an array of colors
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
```

### 2. Color Editing (ChartEditor.tsx)

The ChartEditor now properly handles color arrays for pie charts:

#### State Management
```typescript
const [datasets, setDatasets] = useState<{ 
  label: string; 
  data: number[]; 
  color: string | string[] // Can be array for pie, single for bar/line
}[]>([...]);
```

#### Pie Chart Color Synchronization
```typescript
useEffect(() => {
  if (chartType === 'pie') {
    setDatasets(prev => {
      const first = prev[0] || { label: 'Series 1', data: labels.map(() => 0), color: [] };
      
      // For pie charts, ensure color is an array matching label count
      let colors: string[];
      if (Array.isArray(first.color)) {
        colors = first.color.slice(0, labels.length);
        // Fill missing colors
        while (colors.length < labels.length) {
          colors.push(`hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`);
        }
      } else {
        // Convert single color to array
        colors = labels.map((_, i) => `hsl(${(i * 360 / labels.length)}, 70%, 60%)`);
      }
      
      return [{ ...first, data, color: colors }];
    });
  }
}, [chartType, labels]);
```

#### Adding Labels
When a new label is added, a corresponding color is also added:

```typescript
const addLabel = () => {
  setLabels([...labels, `Label ${labels.length + 1}`]);
  setDatasets(datasets.map(ds => {
    const newData = [...ds.data, 0];
    // For pie charts, also add a new color to the color array
    if (chartType === 'pie' && Array.isArray(ds.color)) {
      const newColors = [...ds.color, `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`];
      return { ...ds, data: newData, color: newColors };
    }
    return { ...ds, data: newData };
  }));
};
```

#### Removing Labels
When a label is removed, the corresponding color is also removed:

```typescript
const removeLabel = (index: number) => {
  if (labels.length > 1) {
    setLabels(labels.filter((_, i) => i !== index));
    setDatasets(datasets.map(ds => {
      const newData = ds.data.filter((_, i) => i !== index);
      // For pie charts, also remove the corresponding color
      if (chartType === 'pie' && Array.isArray(ds.color)) {
        const newColors = ds.color.filter((_, i) => i !== index);
        return { ...ds, data: newData, color: newColors };
      }
      return { ...ds, data: newData };
    }));
  }
};
```

### 3. Color Display (PropertiesPanel.tsx)

The PropertiesPanel retrieves and displays colors from the backgroundColor array:

```typescript
{selectedElement.chartData.labels?.map((label: string, index: number) => {
  const dataset = selectedElement.chartData.datasets?.[0];
  const color = Array.isArray(dataset?.backgroundColor) 
    ? dataset.backgroundColor[index % dataset.backgroundColor.length] 
    : '#3b82f6';  // Default color
  const value = dataset?.data?.[index] || 0;
  
  return (
    <div key={index} className="grid grid-cols-12 gap-2 items-center">
      <div className="col-span-2 flex items-center justify-center">
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="w-5 h-5 rounded-full border-2 border-gray-200"
              style={{ backgroundColor: color }}  // ✅ Displays correct color
              title="Click to change color"
            />
          </PopoverTrigger>
          {/* Color picker popover */}
        </Popover>
      </div>
      {/* Label and value inputs */}
    </div>
  );
})}
```

### 4. Color Validation Utility (chartColorSync.ts)

A utility module was created to ensure color consistency:

#### Validation Function
```typescript
export function validatePieChartColors(chartData: ChartData): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const dataset = chartData.datasets[0];
  const labelCount = chartData.labels?.length || 0;
  
  // Check if backgroundColor is an array
  if (!Array.isArray(dataset.backgroundColor)) {
    errors.push('Pie chart backgroundColor must be an array of colors');
  } 
  // Check if array length matches label count
  else if (dataset.backgroundColor.length !== labelCount) {
    errors.push(
      `backgroundColor array length (${dataset.backgroundColor.length}) ` +
      `must match label count (${labelCount})`
    );
  }
  
  return { isValid: errors.length === 0, errors };
}
```

#### Synchronization Function
```typescript
export function syncPieChartColors(chartData: ChartData): ChartData {
  const labelCount = chartData.labels?.length || 0;
  const dataset = chartData.datasets[0];
  
  // Ensure backgroundColor is an array
  let bgColors: string[] = Array.isArray(dataset.backgroundColor) 
    ? [...dataset.backgroundColor]
    : [];
  
  // Adjust array length to match label count
  if (bgColors.length < labelCount) {
    // Add more colors from default palette
    const colorsNeeded = labelCount - bgColors.length;
    for (let i = 0; i < colorsNeeded; i++) {
      const colorIndex = (bgColors.length + i) % DEFAULT_CHART_COLORS.length;
      bgColors.push(DEFAULT_CHART_COLORS[colorIndex]);
    }
  } else if (bgColors.length > labelCount) {
    // Remove excess colors
    bgColors = bgColors.slice(0, labelCount);
  }
  
  return {
    ...chartData,
    datasets: [{
      ...dataset,
      backgroundColor: bgColors,
      borderColor: bgColors,
    }]
  };
}
```

## Color Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     PIE CHART COLOR FLOW                        │
└─────────────────────────────────────────────────────────────────┘

1. INITIALIZATION (ChartPanel.tsx)
   ┌────────────────────┐
   │ User clicks        │
   │ "Add Pie Chart"    │
   └─────────┬──────────┘
             │
             v
   ┌────────────────────┐
   │ Create chart with  │
   │ color ARRAY:       │
   │ ['#007AFF',        │
   │  '#FF3B30',        │
   │  '#34C759']        │
   └─────────┬──────────┘
             │
             v
2. STORAGE
   ┌────────────────────┐
   │ Chart element      │
   │ stored in slide    │
   │ with proper color  │
   │ array structure    │
   └─────────┬──────────┘
             │
             ├──────────────────┬────────────────────┐
             │                  │                    │
             v                  v                    v
3. RENDERING
   ┌──────────────┐  ┌─────────────────┐  ┌─────────────────┐
   │ PropertiesPanel│  │ Editor Canvas   │  │ Thumbnail       │
   │ Displays color│  │ Renders slices  │  │ Shows preview   │
   │ circles from  │  │ with matching   │  │ with matching   │
   │ array[index]  │  │ colors          │  │ colors          │
   └──────────────┘  └─────────────────┘  └─────────────────┘
             │                  │                    │
             └──────────────────┴────────────────────┘
                               │
                               v
4. UPDATES
   ┌────────────────────┐
   │ User changes color │
   │ Updates array at   │
   │ specific index     │
   │ backgroundColor[i] │
   │ = newColor         │
   └─────────┬──────────┘
             │
             v
   ┌────────────────────┐
   │ All UI elements    │
   │ re-render with     │
   │ synchronized colors│
   └────────────────────┘
```

## Testing

Comprehensive test cases ensure color consistency:

### Test Coverage

1. **Validation Tests**
   - Validates correctly formatted pie charts
   - Detects missing labels/datasets
   - Detects non-array backgroundColor
   - Detects array length mismatches

2. **Synchronization Tests**
   - Adds colors when labels exceed colors
   - Removes colors when colors exceed labels
   - Converts single color to array
   - Creates backgroundColor array if missing

3. **Integration Tests**
   - Maintains consistency through add/update/remove operations
   - Verifies color display in UI components

### Running Tests

```bash
npm test -- chartColorSync.test.ts
```

## Best Practices

### When Creating Pie Charts

```typescript
// ✅ CORRECT - Use array of colors
const pieChartData = {
  labels: ['A', 'B', 'C'],
  datasets: [{
    label: 'Data',
    data: [10, 20, 30],
    backgroundColor: ['#FF0000', '#00FF00', '#0000FF'],
    borderColor: ['#FF0000', '#00FF00', '#0000FF'],
  }]
};

// ❌ INCORRECT - Single color
const wrongPieChartData = {
  labels: ['A', 'B', 'C'],
  datasets: [{
    label: 'Data',
    data: [10, 20, 30],
    backgroundColor: '#FF0000',  // Will cause display issues
    borderColor: '#FF0000',
  }]
};
```

### When Modifying Labels

Always synchronize colors when modifying labels:

```typescript
import { syncPieChartColors } from '@/utils/chartColorSync';

// After adding/removing labels
chartData = syncPieChartColors(chartData);
```

### When Validating Chart Data

Validate before rendering:

```typescript
import { validatePieChartColors } from '@/utils/chartColorSync';

const validation = validatePieChartColors(chartData);
if (!validation.isValid) {
  console.error('Chart validation failed:', validation.errors);
  // Handle errors
}
```

## Common Pitfalls

### 1. Forgetting to Update Colors When Adding Labels

```typescript
// ❌ WRONG - Only adds label and data
const addLabel = () => {
  chartData.labels.push('New Label');
  chartData.datasets[0].data.push(0);
  // Missing: backgroundColor.push(newColor)
};

// ✅ CORRECT - Also adds color
const addLabel = () => {
  chartData.labels.push('New Label');
  chartData.datasets[0].data.push(0);
  chartData.datasets[0].backgroundColor.push('#FF00FF');
};
```

### 2. Not Converting Single Color to Array

```typescript
// ❌ WRONG - Assumes backgroundColor is already an array
const color = chartData.datasets[0].backgroundColor[0];

// ✅ CORRECT - Check type first
const color = Array.isArray(chartData.datasets[0].backgroundColor)
  ? chartData.datasets[0].backgroundColor[0]
  : chartData.datasets[0].backgroundColor;
```

### 3. Not Handling Edge Cases

```typescript
// ❌ WRONG - Assumes index exists
const color = chartData.datasets[0].backgroundColor[index];

// ✅ CORRECT - Provide fallback
const color = Array.isArray(chartData.datasets[0].backgroundColor)
  ? chartData.datasets[0].backgroundColor[index] || DEFAULT_COLOR
  : DEFAULT_COLOR;
```

## Migration Guide

If you have existing pie charts with single-color backgroundColor:

```typescript
import { syncPieChartColors } from '@/utils/chartColorSync';

// Migrate old chart data
const migrateOldPieChart = (oldChartData) => {
  return syncPieChartColors(oldChartData);
};
```

## Future Enhancements

1. **Color Themes**: Pre-defined color palettes for pie charts
2. **Gradient Support**: Allow gradients for individual slices
3. **Smart Color Assignment**: Auto-assign contrasting colors based on data values
4. **Color Accessibility**: Ensure colors meet WCAG contrast requirements

## Related Files

- `src/components/editor/ChartPanel.tsx` - Chart creation
- `src/components/editor/ChartEditor.tsx` - Chart editing interface
- `src/components/editor/PropertiesPanel.tsx` - Property display and editing
- `src/components/editor/ChartJSChart.tsx` - Chart rendering
- `src/utils/chartColorSync.ts` - Color synchronization utilities
- `src/__tests__/utils/chartColorSync.test.ts` - Test suite

## Summary

The pie chart color mapping fix ensures that:

1. ✅ Color circles in PropertiesPanel display the **exact same colors** as the pie chart segments
2. ✅ Colors are **synchronized** across labels, editor, and thumbnails
3. ✅ Color arrays are **validated** to match label counts
4. ✅ Adding/removing labels **automatically updates** color arrays
5. ✅ The system is **tested** and documented for maintainability

This comprehensive solution prevents color mismatches and provides a robust foundation for future enhancements.
