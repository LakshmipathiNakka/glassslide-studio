# Troubleshooting: Elements Missing in Presentation Mode

## Problem

"Whatever I've added to the slide editor isn't showing in presentation mode" - specifically pie charts not appearing.

## Root Cause Analysis

The issue occurs when the **presentation rendering layer** doesn't use the **same source of truth** as the **editor's canvas**.

## Diagnostic Steps

### Step 1: Open Browser Console

Press `F12` to open DevTools and go to the **Console** tab.

### Step 2: Add a Pie Chart in Editor

1. Open the editor
2. Add a pie chart to your slide
3. Verify it appears in the editor

### Step 3: Click "Present" Button

Watch the console output. You should see:

```
[Editor] Starting presentation mode
[Editor] Original slides before sanitization: X slides
[Editor] Slide 1: Y elements
  - chart: chart-123 { chartType: 'pie', hasData: true }
[Editor] Slides after sanitization: X slides
[Editor] Sanitized Slide 1: Y elements
  - chart: chart-123 { chartType: 'pie', hasData: true }

[PresentationMode] Received raw slides: X
[PresentationMode] Raw Slide 1: Y elements
  - chart: chart-123 { chartType: 'pie', hasData: true, labels: 3 }
[PresentationMode] After sanitization: X
[PresentationMode] Final Slide 1: Y elements
  - chart: chart-123 { chartType: 'pie', hasData: true, labels: 3 }

[ChartJSChart] Rendering chart: { type: 'pie', labels: 3, datasets: 1, title: 'Product Distribution' }
```

### Step 4: Identify Where Chart Gets Lost

#### Scenario A: Chart NOT in Editor's slide state

```
[Editor] Slide 1: 2 elements
  - text: text-1
  - text: text-2
  // ❌ No chart element!
```

**Cause**: Chart wasn't saved to the `slides` state
**Fix**: Ensure `updateCurrentSlide()` is called after adding chart

#### Scenario B: Chart has no data

```
[Editor] Slide 1: 3 elements
  - chart: chart-123 { chartType: 'pie', hasData: false }
```

**Cause**: Chart element exists but `chartData` is null/undefined
**Fix**: Check chart creation code in `ChartPanel.tsx`

#### Scenario C: Chart lost during sanitization

```
[Editor] Sanitized Slide 1: 2 elements
  // Chart was here before, now it's gone!
```

**Cause**: Validation incorrectly filtering out charts
**Fix**: Check `sanitizeSlidesForPresentation()` logic

#### Scenario D: Chart data malformed

```
[ChartJSChart] Missing chartType or chartData
```

**Cause**: Chart structure doesn't match expected format
**Fix**: Verify chart element has both `chartType` and `chartData`

## Common Issues & Solutions

### Issue 1: Chart Not Saved to State

**Symptom**: Chart visible in editor but not in slides array

**Solution**: Ensure chart is added to slides state:

```typescript
const handleAddChart = (type: ChartType, data: ChartData) => {
  const newChart: Element = {
    id: `chart-${Date.now()}`,
    type: 'chart',
    chartType: type,
    chartData: data,
    x: 100,
    y: 100,
    width: 400,
    height: 300,
  };
  
  // CRITICAL: Update slide state
  const newElements = [...currentElements, newChart];
  updateCurrentSlide(newElements);
};
```

### Issue 2: Async State Update

**Symptom**: Chart appears after refreshing presentation

**Solution**: Wait for state update before presenting:

```typescript
const handlePresent = async () => {
  // Force save any pending changes
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Then present
  setPresentationMode(true);
};
```

### Issue 3: Stale Closure

**Symptom**: Old slide data showing in presentation

**Solution**: Use functional state updates:

```typescript
setSlides(prevSlides => {
  const newSlides = [...prevSlides];
  newSlides[currentSlide] = {
    ...newSlides[currentSlide],
    elements: [...elements, newChart]
  };
  return newSlides;
});
```

### Issue 4: Pie Chart Colors Not Array

**Symptom**: Pie chart shows single color instead of multiple

**Solution**: Ensure backgroundColor is an array:

```typescript
// ✅ CORRECT
datasets: [{
  data: [300, 150, 100],
  backgroundColor: ['#007AFF', '#FF3B30', '#34C759'],
  borderColor: ['#007AFF', '#FF3B30', '#34C759'],
}]

// ❌ WRONG
datasets: [{
  data: [300, 150, 100],
  backgroundColor: '#007AFF', // Single color
}]
```

### Issue 5: Chart Rendering Before Data Loads

**Symptom**: Blank space where chart should be

**Solution**: Add loading state:

```typescript
if (!chart.chartData?.labels?.length) {
  return <div>Loading chart...</div>;
}
```

## Verification Checklist

After fixing, verify:

- [ ] Chart appears in editor
- [ ] Console shows chart in Editor slides array
- [ ] Console shows chart survives sanitization
- [ ] Console shows chart received by PresentationMode
- [ ] Console shows ChartJSChart renders chart
- [ ] Chart visually appears in presentation
- [ ] Chart colors match editor preview
- [ ] Chart data values are correct

## Architecture: Single Source of Truth

To prevent future issues, ensure:

```
┌─────────────────────────────────────┐
│       Editor Component              │
│                                     │
│  ┌──────────────────────────────┐  │
│  │   slides: Slide[]            │  │ ← SINGLE SOURCE
│  │   - Slide 1                  │  │
│  │     - elements: Element[]    │  │
│  │       - text                 │  │
│  │       - chart ✓              │  │
│  │       - image                │  │
│  └──────────────────────────────┘  │
│                                     │
│  onPresent() {                      │
│    ✓ slides already has chart      │
│    ✓ pass to PresentationMode      │
│  }                                  │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│    PresentationMode Component       │
│                                     │
│  receives: slides prop              │
│  renders: SlideRenderer             │
│    → ChartJSChart                   │
│      → Pie component                │
│        → ✓ Visible!                 │
└─────────────────────────────────────┘
```

## Key Principle

> **Editor and Presentation MUST read from the SAME `slides` state**

Never:
- ❌ Take screenshot of editor
- ❌ Rebuild slides from DOM
- ❌ Use separate data stores
- ❌ Cache old slide snapshots

Always:
- ✅ Pass live `slides` state directly
- ✅ Update state immediately on changes
- ✅ Render from state, not canvas
- ✅ Use React state as single source of truth

## Debug Commands

### Check current slides state:
```javascript
// In browser console
window.slides = slides;
console.log('Current slides:', window.slides);
```

### Check chart structure:
```javascript
slides[0].elements.forEach(el => {
  if (el.type === 'chart') {
    console.log('Chart found:', el);
    console.log('Has chartData?', !!el.chartData);
    console.log('Has labels?', el.chartData?.labels);
    console.log('Has datasets?', el.chartData?.datasets);
  }
});
```

### Force re-render:
```javascript
// After adding chart
setSlides([...slides]); // Force new reference
```

## Still Not Working?

If charts still don't appear:

1. **Check element dimensions**:
   ```javascript
   console.log('Chart bounds:', {
     x: chart.x,
     y: chart.y,
     width: chart.width,
     height: chart.height
   });
   ```
   
   Verify chart isn't positioned off-screen (negative x/y or zero width/height)

2. **Check Chart.js registration**:
   ```javascript
   import { Chart as ChartJS } from 'chart.js';
   console.log('Chart.js plugins:', ChartJS.registry.plugins.keys());
   ```

3. **Check React DevTools**:
   - Open React DevTools
   - Find `<PresentationMode>` component
   - Check `slides` prop
   - Verify chart element is present

4. **Check CSS/styles**:
   - Inspect chart element in DOM
   - Verify `display` is not `none`
   - Verify `visibility` is not `hidden`
   - Verify `opacity` is not `0`

## Success Criteria

✅ Chart visible in editor  
✅ Chart in slides state array  
✅ Chart passes validation  
✅ Chart received by PresentationMode  
✅ ChartJSChart component renders  
✅ Chart visible in presentation  
✅ Chart matches editor preview exactly

## Related Files

- `src/pages/Editor.tsx` - Main editor with slides state
- `src/components/editor/PresentationMode.tsx` - Presentation viewer
- `src/components/shared/SlideRenderer.tsx` - Element renderer
- `src/components/editor/ChartJSChart.tsx` - Chart component
- `src/components/editor/ChartPanel.tsx` - Chart creation
- `src/utils/presentationValidator.ts` - Slide sanitization

## Contact

If issue persists after following this guide, provide console output showing:
1. Full `[Editor]` logs
2. Full `[PresentationMode]` logs
3. Full `[ChartJSChart]` logs
4. Screenshot of editor with chart
5. Screenshot of presentation without chart
