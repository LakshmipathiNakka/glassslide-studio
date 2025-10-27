# GlassSlide Studio - Presentation Mode

A professional presentation system for GlassSlide Studio that provides PowerPoint/Keynote-level presentation capabilities with modern web technologies.

## 🚀 Features

### Core Presentation Features
- **Full-Screen Presentation**: Immersive presentation experience with responsive scaling
- **PowerPoint-Style Navigation**: Keyboard shortcuts, mouse clicks, and touch gestures
- **Slide Transitions**: Fade, push, zoom, slide, flip, and morph transitions
- **Element Animations**: Appear, slide, fade, bounce, spin, and wipe effects with timeline control
- **Presenter View**: Dual-screen support with current slide, next slide preview, notes, and timer
- **Asset Preloading**: OffscreenCanvas-optimized preloading for smooth performance
- **Session Management**: Resume presentation from last viewed slide
- **Accessibility**: Screen reader support, keyboard-only navigation, and high contrast mode

### Technical Highlights
- **Performance Optimized**: GPU-accelerated animations, asset preloading, and efficient rendering
- **Responsive Design**: Auto-scaling for different display sizes and orientations
- **Error Handling**: Graceful fallbacks for failed assets and network issues
- **TypeScript**: Full type safety throughout the presentation system
- **Testing**: Comprehensive unit and integration tests

## 📁 Architecture

```
src/
├── types/
│   └── presentation.ts           # TypeScript definitions for presentation system
├── hooks/
│   └── usePresentationStore.ts   # Zustand store for presentation state management
├── utils/
│   ├── AnimationEngine.ts        # Animation system using Web Animations API
│   └── preloadAssets.ts         # Asset preloading with OffscreenCanvas support
├── components/
│   └── presentation/
│       ├── SlideRenderer.tsx     # Read-only slide renderer for presentations
│       └── PresenterView.tsx     # Dual-screen presenter interface
└── pages/
    └── PresentationMode.tsx      # Main presentation component and route handler
```

## 🎯 Getting Started

### 1. Basic Integration

Add presentation routes to your app:

```typescript
// App.tsx
import PresentationMode from './pages/PresentationMode';

<Routes>
  <Route path="/present/:deckId" element={<PresentationMode />} />
  {/* Your other routes */}
</Routes>
```

### 2. Navigate to Presentation

```typescript
// From your editor component
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

const startPresentation = () => {
  navigate(`/present/${deckId}`);
};
```

### 3. Embedded Presentation

```typescript
// For embedded presentations in your app
import PresentationMode from './pages/PresentationMode';

<PresentationMode 
  embedded={true}
  deck={presentationDeck}
  onExit={() => console.log('Presentation ended')}
/>
```

## 📊 Data Structure

### Presentation Deck Format

```typescript
interface PresentationDeck {
  id: string;
  title: string;
  slides: PresentationSlide[];
  theme: string;
  aspectRatio: '16:9' | '4:3' | '16:10';
  createdAt: Date;
  lastUpdated: Date;
  settings: PresentationSettings;
}
```

### Slide Format

```typescript
interface PresentationSlide {
  id: string;
  elements: Element[];
  background: string;
  animations: ElementAnimation[];
  transition: SlideTransition;
  title?: string;
  notes?: string;
  speakerNotes?: string;
  duration?: number; // Auto-advance duration
  hiddenInPresentation?: boolean;
}
```

### Animation Configuration

```typescript
interface ElementAnimation {
  id: string;
  elementId: string;
  type: 'appear' | 'withPrevious' | 'afterPrevious' | 'onClick';
  effect: 'fade' | 'slide' | 'zoom' | 'bounce' | 'spin' | 'wipe';
  direction?: 'up' | 'down' | 'left' | 'right' | 'center';
  duration: number;
  delay: number;
  easing: string;
  order: number;
}
```

## ⌨️ Keyboard Shortcuts

### Navigation
- **→ ↓ Space Enter PageDown**: Next slide/animation
- **← ↑ Backspace PageUp**: Previous slide/animation
- **Home**: First slide
- **End**: Last slide
- **1-9**: Jump to specific slide
- **Esc**: Exit presentation

### Playback
- **F5**: Start/pause presentation
- **F**: Toggle fullscreen
- **P**: Toggle presenter mode

### Advanced
- **Ctrl+G**: Go to slide dialog
- **B**: Black screen
- **W**: White screen

## 🖱️ Mouse & Touch Controls

### Mouse
- **Click**: Next slide/animation
- **Right-click**: Context menu with navigation options
- **Mouse wheel**: Previous/next slide

### Touch
- **Tap**: Next slide/animation
- **Swipe left**: Next slide
- **Swipe right**: Previous slide
- **Pinch**: Zoom (if enabled)
- **Two-finger tap**: Toggle controls

## 🖥️ Presenter View & Dual Screen

### Enabling Presenter View

```typescript
// Programmatically enable presenter view
const { togglePresenterMode, enableDualScreen } = usePresentationStore();

// Toggle presenter view
togglePresenterMode();

// Enable dual screen with external display
enableDualScreen({
  enabled: true,
  audienceDisplay: externalDisplayInfo,
  presenterDisplay: primaryDisplayInfo,
  mirrorMode: false,
  extendedMode: true,
});
```

### Presenter View Features
- **Current slide preview** with animation progress
- **Next/previous slide thumbnails**
- **Speaker notes** with scrollable content
- **Presentation timer** with elapsed/remaining time
- **Slide thumbnails** for quick navigation
- **Performance metrics** (frame rate, memory usage)
- **Audience view control** (open/close external window)

## 🎨 Animations & Transitions

### Built-in Animation Effects

```typescript
// Element animations
const animationEffects = [
  'fade',      // Opacity transition
  'slide',     // Directional slide-in
  'zoom',      // Scale transition
  'bounce',    // Bouncy entrance
  'spin',      // Rotation with scale
  'wipe',      // Directional reveal
];

// Slide transitions
const transitionTypes = [
  'fade',      // Cross-fade
  'push',      // Push out/in
  'zoom',      // Zoom out/in
  'slide',     // Slide left/right
  'flip',      // 3D flip
  'morph',     // Shape morphing (advanced)
];
```

### Custom Animation Timeline

```typescript
// Building custom animation sequences
const customAnimations: ElementAnimation[] = [
  {
    id: 'anim-1',
    elementId: 'title-1',
    type: 'appear',
    effect: 'fade',
    duration: 800,
    delay: 0,
    easing: 'ease-out',
    order: 1,
  },
  {
    id: 'anim-2',
    elementId: 'content-1',
    type: 'afterPrevious',
    effect: 'slide',
    direction: 'left',
    duration: 600,
    delay: 200,
    easing: 'ease-in-out',
    order: 2,
  },
];
```

## 🔧 Performance Optimization

### Asset Preloading

```typescript
import { useAssetPreloader } from '@/utils/preloadAssets';

const MyPresentationComponent = () => {
  const { preloadAssets, getStats, clearUnused } = useAssetPreloader();
  
  // Preload assets for current and adjacent slides
  useEffect(() => {
    preloadAssets(slides, currentSlideIndex, {
      maxConcurrent: 6,
      preloadRadius: 2,
      useOffscreenCanvas: true,
    });
  }, [currentSlideIndex]);
  
  // Clean up unused assets to free memory
  useEffect(() => {
    clearUnused(currentSlideIndex, slides);
  }, [currentSlideIndex]);
};
```

### Performance Monitoring

```typescript
const { metrics, updateMetrics } = usePresentationStore();

// Access performance metrics
console.log('Frame rate:', metrics.averageFrameRate);
console.log('Memory usage:', metrics.memoryUsage, 'MB');
console.log('Render time:', metrics.renderTime, 'ms');
```

## ♿ Accessibility Features

### Screen Reader Support

```typescript
// Enable screen reader optimizations
const { updateAccessibilityOptions } = usePresentationStore();

updateAccessibilityOptions({
  screenReader: true,
  keyboardOnly: true,
  reducedMotion: true,
  highContrast: false,
  focusIndicator: true,
});
```

### Keyboard Navigation
- Full keyboard navigation support
- Focus management during presentations
- Skip links for quick navigation
- ARIA labels and live regions for announcements

### Visual Accessibility
- High contrast mode support
- Reduced motion preferences
- Customizable font sizes
- Focus indicators

## 🧪 Testing

### Running Tests

```bash
# Run all presentation tests
npm test -- --testPathPattern=presentation

# Run specific test file
npm test PresentationMode.test.tsx

# Run tests in watch mode
npm test -- --watch presentation
```

### Test Coverage

```bash
# Generate coverage report
npm test -- --coverage --testPathPattern=presentation
```

### Example Test

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import PresentationMode from '@/pages/PresentationMode';

test('navigates to next slide on keyboard press', () => {
  render(<PresentationMode embedded deck={mockDeck} />);
  
  fireEvent.keyDown(window, { key: 'ArrowRight' });
  
  expect(mockStore.nextSlide).toHaveBeenCalled();
});
```

## 🔄 Migration Guide

### From Editor to Presentation

#### 1. Convert Slide Data

```typescript
// Transform editor slides to presentation format
const convertToPresentationDeck = (editorSlides: EditorSlide[]): PresentationDeck => {
  return {
    id: generateId(),
    title: 'My Presentation',
    slides: editorSlides.map(slide => ({
      ...slide,
      animations: extractAnimations(slide),
      transition: { type: 'fade', duration: 500, easing: 'ease-in-out' },
      speakerNotes: slide.notes || '',
    })),
    theme: 'default',
    aspectRatio: '16:9',
    createdAt: new Date(),
    lastUpdated: new Date(),
    settings: defaultPresentationSettings,
  };
};
```

#### 2. Add Presentation Button to Editor

```typescript
// In your editor component
import { useNavigate } from 'react-router-dom';

const EditorComponent = () => {
  const navigate = useNavigate();
  
  const startPresentation = () => {
    // Save current work
    saveSlides(slides);
    
    // Navigate to presentation mode
    navigate(`/present/${deckId}`);
  };
  
  return (
    <div>
      {/* Editor UI */}
      <Button onClick={startPresentation}>
        Start Presentation
      </Button>
    </div>
  );
};
```

#### 3. Handle Return to Editor

```typescript
// Add resume functionality
const PresentationMode = () => {
  const navigate = useNavigate();
  const { saveSession, currentSlideIndex } = usePresentationStore();
  
  const returnToEditor = () => {
    // Save presentation session
    saveSession();
    
    // Navigate back to editor with current slide
    navigate(`/editor/${deckId}?slide=${currentSlideIndex}`);
  };
  
  // ... rest of component
};
```

### Slide Element Compatibility

#### Text Elements

```typescript
// Editor text element
interface EditorTextElement {
  id: string;
  type: 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontSize: number;
  color: string;
  // ... other properties
}

// Presentation text element (same structure)
interface PresentationTextElement extends EditorTextElement {
  // All editor properties are compatible
  // Add presentation-specific properties if needed
  animations?: ElementAnimation[];
}
```

#### Adding Animations

```typescript
// Add animation metadata to existing elements
const addAnimationToElement = (element: EditorElement, animation: ElementAnimation) => {
  return {
    ...element,
    animations: [animation],
  };
};
```

### Database Schema Updates

If you're storing presentations in a database, you may need to update your schema:

```sql
-- Add presentation-specific columns
ALTER TABLE slides ADD COLUMN animations JSON;
ALTER TABLE slides ADD COLUMN transition JSON;
ALTER TABLE slides ADD COLUMN speaker_notes TEXT;
ALTER TABLE slides ADD COLUMN duration INTEGER;

-- Add presentation settings table
CREATE TABLE presentation_settings (
  id VARCHAR PRIMARY KEY,
  deck_id VARCHAR REFERENCES presentations(id),
  auto_advance BOOLEAN DEFAULT false,
  loop_presentation BOOLEAN DEFAULT false,
  show_slide_numbers BOOLEAN DEFAULT true,
  show_progress_bar BOOLEAN DEFAULT true,
  mouse_click_advances BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Assets Not Loading
```typescript
// Check preloader status
const { getStats } = useAssetPreloader();
const stats = getStats();

if (stats.loaded < stats.total) {
  console.log('Some assets failed to load:', stats);
  // Implement retry logic or fallback
}
```

#### 2. Animation Performance Issues
```typescript
// Enable reduced motion for better performance
const { updateAccessibilityOptions } = usePresentationStore();

updateAccessibilityOptions({
  reducedMotion: true, // Disables complex animations
});

// Or adjust animation quality
<SlideRenderer 
  slide={slide}
  quality="low" // Use 'high', 'medium', or 'low'
  enableAnimations={!reducedMotion}
/>
```

#### 3. Fullscreen Issues
```typescript
// Check fullscreen support
if (!document.fullscreenEnabled) {
  console.warn('Fullscreen not supported');
  // Provide alternative UI or graceful degradation
}

// Handle fullscreen errors
const { enterFullscreen, addError } = usePresentationStore();

try {
  await enterFullscreen();
} catch (error) {
  addError({
    code: 'FULLSCREEN_ERROR',
    message: 'Unable to enter fullscreen mode',
    severity: 'medium',
    recoverable: true,
  });
}
```

#### 4. Dual Screen Setup
```typescript
// Check for multiple displays
if ('screen' in window && 'orientation' in window.screen) {
  // Modern browser with Screen API support
  // Implement proper dual screen detection
} else {
  // Fallback: use window.open for external display
  console.log('Using window.open fallback for dual screen');
}
```

### Performance Tips

1. **Optimize Images**: Use WebP format and appropriate sizes
2. **Preload Strategically**: Adjust preload radius based on available memory
3. **Use OffscreenCanvas**: Enable for better rendering performance
4. **Reduce Animation Complexity**: Use simpler animations on low-end devices
5. **Monitor Memory Usage**: Clear unused assets regularly

### Browser Compatibility

| Feature | Chrome | Safari | Firefox | Edge |
|---------|--------|---------|---------|------|
| Basic Presentation | ✅ | ✅ | ✅ | ✅ |
| OffscreenCanvas | ✅ | ✅ | ✅ | ✅ |
| Web Animations API | ✅ | ✅ | ✅ | ✅ |
| Fullscreen API | ✅ | ✅ | ✅ | ✅ |
| Screen API | ✅ | ❌ | ❌ | ✅ |

## 📚 API Reference

### usePresentationStore Hook

```typescript
const {
  // State
  deck,
  currentSlideIndex,
  isPlaying,
  presenterMode,
  
  // Navigation
  nextSlide,
  previousSlide,
  goToSlide,
  
  // Playback
  play,
  pause,
  stop,
  
  // Presentation modes
  enterFullscreen,
  togglePresenterMode,
  
  // Session management
  saveSession,
  loadSession,
} = usePresentationStore();
```

### AnimationEngine

```typescript
import { animationEngine } from '@/utils/AnimationEngine';

// Execute single animation
await animationEngine.executeAnimation(step, elementRef.current);

// Execute slide transition
await animationEngine.executeSlideTransition(
  transition,
  currentSlideRef,
  nextSlideRef,
  'forward'
);

// Control all animations
animationEngine.stopAllAnimations();
animationEngine.pauseAllAnimations();
animationEngine.resumeAllAnimations();
```

### Asset Preloader

```typescript
import { useAssetPreloader } from '@/utils/preloadAssets';

const {
  preloadAssets,
  getAsset,
  isLoaded,
  getStats,
  clearCache,
  clearUnused,
} = useAssetPreloader();
```

## 🤝 Contributing

### Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Code Style

- Use TypeScript for all new code
- Follow existing patterns and conventions
- Write tests for new features
- Document complex logic with comments
- Use semantic commit messages

### Submitting Changes

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Run the full test suite
5. Submit a pull request

## 📄 License

This presentation system is part of GlassSlide Studio and follows the same license terms as the main project.

---

**Built with ❤️ for professional presentations**