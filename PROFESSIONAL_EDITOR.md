# Professional PowerPoint-Style Slide Editor

A complete, professional-grade slide editor that replicates the exact look, feel, and behavior of Microsoft PowerPoint and Apple Keynote, built with React, TypeScript, and Fabric.js.

## 🚀 Features

### Core Functionality
- **Professional Canvas Engine**: Built with Fabric.js for smooth, GPU-accelerated rendering
- **PowerPoint-Style Interactions**: Drag, resize, rotate with 8-handle controls
- **Smart Snapping**: Automatic alignment to slide center and other elements
- **Rich Text Editing**: Draft.js integration for professional text editing
- **Slide Layouts**: Pre-built templates (Title Slide, Title & Content, Two Column, Blank)
- **Undo/Redo**: Full history management with keyboard shortcuts
- **Responsive Design**: Auto-scaling canvas for all screen sizes

### Professional Features
- **Placeholder System**: "Click to add title/subtitle" with smart conversion
- **Multi-Selection**: Select multiple elements with Shift+Click
- **Keyboard Shortcuts**: Full PowerPoint-style keyboard navigation
- **Visual Feedback**: Snap guides, selection outlines, and smooth animations
- **State Management**: Zustand for efficient state handling
- **TypeScript**: Full type safety throughout the application

## 🛠 Technology Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Full type safety
- **Fabric.js** - Professional canvas rendering and interaction
- **Draft.js** - Rich text editing capabilities
- **Zustand** - Lightweight state management
- **Framer Motion** - Smooth animations and transitions
- **Tailwind CSS** - Utility-first styling
- **React Hotkeys Hook** - Keyboard shortcut management

## 📁 Project Structure

```
src/
├── components/
│   ├── canvas/
│   │   ├── PowerPointCanvas.tsx      # Main canvas component
│   │   └── LayoutSelector.tsx        # Slide layout picker
│   └── editors/
│       └── TextEditor.tsx            # Rich text editor
├── data/
│   └── slideLayouts.ts               # Slide templates
├── hooks/
│   └── useCanvasStore.ts             # Zustand store
├── pages/
│   └── ProfessionalEditor.tsx        # Main editor page
└── types/
    └── canvas.ts                     # TypeScript definitions
```

## 🎯 Key Components

### PowerPointCanvas
The main canvas component that handles:
- Fabric.js canvas initialization
- Element rendering and interaction
- Drag, resize, and rotate operations
- Snap-to-grid and alignment guides
- Keyboard shortcuts and event handling
- Responsive scaling

### TextEditor
Professional text editing with:
- Draft.js rich text capabilities
- Inline formatting (bold, italic, underline)
- Font size and alignment controls
- PowerPoint-style editing experience
- Auto-save on blur

### LayoutSelector
Template selection modal with:
- Visual preview of each layout
- Professional slide templates
- One-click layout application

### useCanvasStore
Zustand store managing:
- Element state and operations
- Selection management
- Undo/redo history
- Clipboard operations
- Canvas settings

## 🎨 Slide Layouts

### Title Slide
- Centered title placeholder
- Centered subtitle placeholder
- Perfect for presentations

### Title and Content
- Left-aligned title
- Large content area
- Ideal for detailed slides

### Two Content
- Centered title
- Two-column layout
- Great for comparisons

### Blank Slide
- Empty canvas
- Maximum flexibility
- Custom layouts

## ⌨️ Keyboard Shortcuts

- **Ctrl+Z** - Undo
- **Ctrl+Y** / **Ctrl+Shift+Z** - Redo
- **Ctrl+N** - New slide (open layout selector)
- **Delete** / **Backspace** - Delete selected elements
- **Escape** - Clear selection / Cancel editing
- **Ctrl+Enter** - Save text editing
- **Escape** - Cancel text editing

## 🖱️ Mouse Interactions

### Selection
- **Single Click** - Select element
- **Shift+Click** - Multi-select
- **Click Empty Area** - Clear selection

### Text Editing
- **Double Click** - Edit text in place
- **Click Placeholder** - Convert to editable text

### Transformations
- **Drag** - Move element
- **Corner Handles** - Resize with aspect ratio
- **Edge Handles** - Resize single dimension
- **Rotation Handle** - Rotate element
- **Shift+Drag** - Maintain aspect ratio
- **Alt+Drag** - Resize from center

## 📱 Responsive Design

The canvas automatically scales to fit any screen size:
- **Desktop** - Full canvas with all controls
- **Tablet** - Scaled canvas with touch-friendly controls
- **Mobile** - Optimized layout with gesture support

## 🎭 Visual Effects

- **Selection Outlines** - Blue selection borders
- **Snap Guides** - Animated alignment lines
- **Smooth Animations** - Framer Motion transitions
- **Professional Shadows** - PowerPoint-style depth
- **Hover Effects** - Interactive feedback

## 🔧 Configuration

### Canvas Settings
```typescript
const canvasConfig = {
  width: 1280,           // Slide width
  height: 720,           // Slide height (16:9)
  backgroundColor: '#ffffff',
  selectionColor: 'rgba(0, 120, 212, 0.3)',
  selectionBorderColor: '#0078d4',
  cornerSize: 8,
  cornerStyle: 'circle'
};
```

### Snap Settings
```typescript
const snapSettings = {
  enabled: true,
  gridSize: 20,
  objectSnapping: true,
  guideLines: true
};
```

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Access Professional Editor**
   - Navigate to `/professional`
   - Or click "Try Professional Editor" on the homepage

## 🎯 Usage Examples

### Creating a New Slide
1. Click "New Slide" button
2. Select a layout from the modal
3. Layout is applied with placeholders

### Adding Text
1. Click "Text" button in toolbar
2. Click on canvas to place text
3. Start typing immediately

### Editing Text
1. Double-click any text element
2. Rich text editor opens
3. Use toolbar for formatting
4. Press Ctrl+Enter to save

### Adding Shapes
1. Click shape button (Rectangle, Circle, Triangle)
2. Shape appears on canvas
3. Drag handles to resize
4. Use rotation handle to rotate

## 🔮 Future Enhancements

- **Image Support** - Drag & drop image uploads
- **Animation System** - Slide transitions and object animations
- **Collaboration** - Real-time multi-user editing
- **Export Options** - PDF, PowerPoint, Keynote export
- **Template Gallery** - Community-driven templates
- **Advanced Shapes** - Custom shape creation
- **Chart Integration** - Data visualization tools

## 🤝 Contributing

This is a professional-grade implementation that can be extended with:
- Additional slide layouts
- Custom element types
- Advanced animation systems
- Export functionality
- Collaboration features

## 📄 License

Built for professional presentation creation with PowerPoint-level precision and Keynote-level fluidity.
