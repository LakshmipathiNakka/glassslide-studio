# Presentation Mode Persistence

## Overview

This document explains how slide data is persisted when entering and exiting presentation mode, ensuring no data loss when pressing ESC to exit.

## Data Flow Architecture

### 1. Editor Storage
- **Storage Key**: `glassslide-presentation`
- **Purpose**: Main working copy of slides
- **Auto-save**: Slides are automatically saved to localStorage whenever they change
- **Hook**: `usePersistence` hook in `src/hooks/use-persistence.ts`

### 2. Presentation Deck Storage
- **Storage Key**: `glassslide-deck-${deckId}`
- **Purpose**: Snapshot of slides for presentation mode
- **Creation**: Generated when user clicks "Present" button
- **Format**: 
```typescript
{
  id: string,           // e.g., "deck-1762334700483"
  title: string,        // Presentation title
  slides: Slide[],      // Array of slide objects
  createdAt: number,    // Timestamp
  lastUpdated: number   // Timestamp
}
```

### 3. Session Storage
- **Storage Key**: `glassslide-presentation-session`
- **Purpose**: Remember current slide position, presenter mode settings
- **Saved on**: Presentation exit
- **Format**:
```typescript
{
  deckId: string,
  currentSlideIndex: number,
  currentAnimationIndex: number,
  presenterMode: boolean,
  accessibilityOptions: AccessibilityOptions
}
```

## Presentation Flow

### Starting Presentation

**File**: `src/pages/Editor.tsx` (lines 705-723)

1. User clicks "Present" button or presses F5
2. Editor enters fullscreen mode
3. Creates deck snapshot:
   ```typescript
   const deckId = `deck-${Date.now()}`;
   const deckPayload = {
     id: deckId,
     title: presentationTitle,
     slides,  // Current slides from editor
     createdAt: Date.now(),
     lastUpdated: Date.now(),
   };
   localStorage.setItem(`glassslide-deck-${deckId}`, JSON.stringify(deckPayload));
   ```
4. Navigate to `/present/${deckId}`

### During Presentation

**File**: `src/pages/PresentationMode.tsx`

- Presentation mode is **read-only**
- Cannot edit slides, add elements, or modify content
- Can only navigate between slides and control playback

### Exiting Presentation

**Files**: 
- `src/pages/PresentationMode.tsx` (lines 384-418)
- `src/components/editor/PresentationMode.tsx` (lines 203-208)

When user presses **ESC**:

1. **Save session state** (slide position, settings):
   ```typescript
   saveSession(); // Saves to 'glassslide-presentation-session'
   ```

2. **Exit fullscreen** (if active):
   ```typescript
   if (isFullscreen) {
     exitFullscreen();
   }
   ```

3. **Verify deck persistence**:
   ```typescript
   if (deck && deckId) {
     const existingData = localStorage.getItem(`glassslide-deck-${deckId}`);
     if (existingData) {
       console.log('Deck data preserved in localStorage');
     }
   }
   ```

4. **Navigate back to Editor**:
   ```typescript
   navigate(-1); // Returns to previous page (Editor)
   ```

### Returning to Editor

**File**: `src/pages/Editor.tsx` (lines 174-195)

When Editor regains focus:

1. **Window focus event** triggers reload check
2. **Compare stored data** with current state:
   ```typescript
   const saved = localStorage.getItem('glassslide-presentation');
   if (saved) {
     const parsedData = JSON.parse(saved);
     if (JSON.stringify(parsedData) !== JSON.stringify(slides)) {
       pushSlides(parsedData); // Reload if different
     }
   }
   ```
3. **Restore editor state** from `glassslide-presentation`

## Data Persistence Guarantees

### ✅ What is Preserved

1. **All slide content**: Text, images, charts, shapes, tables
2. **Slide order**: Original sequence maintained
3. **Slide backgrounds**: Colors and styles
4. **Element properties**: Position, size, styling
5. **Presentation title**: Restored exactly as before
6. **Session state**: Current slide position (if resuming)

### ⚠️ What is NOT Preserved

1. **New slides added in presentation mode**: Not possible (read-only)
2. **Content edits in presentation mode**: Not possible (read-only)
3. **Temporary presentation state**: Play/pause state, fullscreen status
4. **Auto-play timer state**: Resets on exit

## Implementation Details

### Storage Separation

**Why two separate storage keys?**

- `glassslide-presentation`: Editor's working copy (constantly updated)
- `glassslide-deck-${deckId}`: Presentation snapshot (read-only reference)

This separation ensures:
- Editor can continue auto-saving while presentation runs
- Multiple presentations can exist simultaneously
- Presentation can be shared/exported independently

### Read-Only Presentation Mode

**Design Decision**: Presentation mode is intentionally read-only

**Rationale**:
1. **User expectation**: Presentations are for viewing, not editing
2. **PowerPoint parity**: Standard PowerPoint slideshow is also read-only
3. **Data integrity**: Prevents accidental changes during presentation
4. **Performance**: Read-only allows better optimization

**To edit slides**: Exit presentation mode (ESC) and return to Editor

### Cleanup Strategy

**Deck snapshots** (`glassslide-deck-*`) accumulate over time.

**Cleanup options**:
1. Manual cleanup: User can clear browser storage
2. Auto-cleanup: Could implement TTL (Time To Live) expiration
3. On-demand: Clean old decks when starting new presentation

**Current behavior**: Decks remain until manually cleared

## Testing Persistence

### Test Scenario 1: Basic Exit
1. Create presentation with 5 slides
2. Add content to each slide
3. Click Present button
4. Navigate through slides
5. Press ESC to exit
6. **Expected**: All 5 slides with content intact

### Test Scenario 2: Multiple Presentations
1. Create presentation A (3 slides)
2. Present and exit
3. Edit presentation A (add 2 more slides)
4. Present again and exit
5. **Expected**: All 5 slides preserved, old deck snapshot ignored

### Test Scenario 3: Window Focus
1. Create presentation
2. Click Present (opens in same tab)
3. Press ESC to return
4. **Expected**: Editor immediately shows all slides
5. Window focus handler verifies data consistency

## Troubleshooting

### Issue: Slides missing after exiting presentation

**Diagnosis**:
```javascript
// Check if data exists
console.log('Editor data:', localStorage.getItem('glassslide-presentation'));
console.log('Deck data:', localStorage.getItem('glassslide-deck-1234567890'));
```

**Solutions**:
1. Check browser console for localStorage errors
2. Verify localStorage quota not exceeded
3. Check if localStorage is disabled in browser settings

### Issue: Old slide data showing after exit

**Cause**: Focus handler not detecting updated data

**Solution**: Hard refresh (Ctrl+Shift+R) to clear state

### Issue: Presentation deck not loading

**Diagnosis**:
```javascript
// Check deck creation
const deckId = `deck-${Date.now()}`;
console.log('Creating deck:', deckId);
console.log('Deck payload:', deckPayload);
```

**Solutions**:
1. Ensure slides array is not empty
2. Check JSON serialization errors
3. Verify deckId format is correct

## Console Logging

The implementation includes comprehensive logging for debugging:

```javascript
// Editor logs
[Editor] Loaded slides from localStorage: 5
[Editor] Window focused - checking for updated slides
[Editor] Slides updated externally, reloading...

// Presentation mode logs
[PresentationMode] Exiting presentation mode
[PresentationMode] Session saved
[PresentationMode] Exiting fullscreen
[PresentationMode] Deck data preserved in localStorage
[PresentationMode] Navigating back to editor
```

Enable console to monitor persistence flow during development.

## Future Enhancements

### Potential Improvements

1. **Cloud sync**: Sync slides across devices
2. **Version history**: Track presentation changes over time
3. **Collaborative editing**: Real-time multi-user editing
4. **Auto-cleanup**: Remove old deck snapshots automatically
5. **Export history**: Save presentation export history
6. **Draft mode**: Allow editing during presentation (opt-in)

### Migration Considerations

When upgrading storage format:
1. Implement version detection
2. Migrate old format to new format
3. Maintain backward compatibility
4. Provide user notification of upgrade

## API Reference

### usePersistence Hook

```typescript
function usePersistence<T>(
  data: T,
  onLoad: (data: T) => void
): { clearData: () => void }
```

**Parameters**:
- `data`: Current state to persist
- `onLoad`: Callback when data is loaded from storage

**Returns**:
- `clearData`: Function to clear persisted data

### usePresentationStore

```typescript
const {
  saveSession,    // Save current session state
  loadSession,    // Load saved session state
  clearSession,   // Clear session storage
} = usePresentationStore();
```

## Related Files

- `src/pages/Editor.tsx` - Main editor with auto-save
- `src/pages/PresentationMode.tsx` - Presentation viewer
- `src/components/editor/PresentationMode.tsx` - Legacy presentation component
- `src/hooks/use-persistence.ts` - Persistence hook
- `src/hooks/usePresentationStore.ts` - Presentation state management
- `src/hooks/use-history.ts` - Undo/redo history

## Summary

✅ **Slide persistence is guaranteed** when exiting presentation mode with ESC

✅ **No data loss** - All slides and content are preserved in Editor's localStorage

✅ **Automatic reload** - Editor checks for updates when window regains focus

✅ **Session state** - Current slide position is saved for resume capability

✅ **Read-only presentation** - Prevents accidental modifications during viewing

The architecture ensures robust data persistence through multiple storage layers, comprehensive logging, and automatic data synchronization between presentation mode and editor.
