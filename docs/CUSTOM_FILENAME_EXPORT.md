# Custom Filename Export Feature

## Overview
The exported PowerPoint file now uses the presentation title (shown in the header) as the filename instead of a generic default name.

## How It Works

### Setting the Presentation Title
1. Look at the header area (next to the Glass Slide logo)
2. You'll see the current presentation title (default: "Untitled Presentation")
3. Click on the title to edit it
4. Type your desired presentation name
5. Press Enter or click outside to save

### Exporting with Custom Filename
1. Set your presentation title (e.g., "Q4 Sales Report")
2. Click "Export to PowerPoint" button
3. File downloads as: `Q4 Sales Report.pptx`

## Filename Sanitization

For security and compatibility, the system automatically removes or replaces invalid filename characters:

### Invalid Characters
These characters are replaced with hyphens (`-`):
- `<` (less than)
- `>` (greater than)
- `:` (colon)
- `"` (double quote)
- `/` (forward slash)
- `\` (backslash)
- `|` (pipe)
- `?` (question mark)
- `*` (asterisk)

### Examples

| Presentation Title | Downloaded Filename |
|-------------------|---------------------|
| Q4 Sales Report | `Q4 Sales Report.pptx` |
| Project: Phase 1/2 | `Project- Phase 1-2.pptx` |
| Meeting Notes (12/25) | `Meeting Notes (12-25).pptx` |
| Company*Report | `Company-Report.pptx` |
| Budget < $100K | `Budget - $100K.pptx` |
| Untitled Presentation | `Untitled Presentation.pptx` |

## Technical Implementation

### Editor.tsx
```typescript
const handleExport = async () => {
  // Get presentation title from state
  const presentationTitle = "Q4 Sales Report"; // Example
  
  // Sanitize filename
  const sanitizedTitle = presentationTitle.replace(/[<>:"/\\|?*]/g, '-');
  const filename = `${sanitizedTitle}.pptx`;
  
  // Export with custom filename
  await exportSlidesToPPTX(slides, filename);
};
```

### EnhancedEditor.tsx
```typescript
const handleExport = async () => {
  // Get file name from file manager
  const fileName = fileManager.currentFile.name;
  
  // Sanitize filename
  const sanitizedName = fileName.replace(/[<>:"/\\|?*]/g, '-');
  const filename = `${sanitizedName}.pptx`;
  
  // Export with custom filename
  await exportSlidesToPPTX(fileManager.currentFile.slides, filename);
};
```

## User Benefits

✅ **Organized Downloads**: Files are named meaningfully from the start
✅ **No Manual Renaming**: Skip the extra step of renaming downloaded files
✅ **Easy Identification**: Quickly find your presentation in Downloads folder
✅ **Professional**: Exported files have proper, descriptive names
✅ **Safe Filenames**: Automatic sanitization prevents filesystem errors

## Tips

### Best Practices
- ✅ Set a descriptive title before exporting
- ✅ Use clear, concise names (e.g., "Q1 Budget 2024")
- ✅ Include dates or versions when relevant (e.g., "Pitch Deck v2")
- ❌ Avoid using special characters like `:`, `/`, `*` in titles

### Quick Workflow
1. **Create presentation** → Default title: "Untitled Presentation"
2. **Edit title** → Click title, type "Q4 Sales Report", press Enter
3. **Export** → Click "Export to PowerPoint"
4. **Result** → File downloads as `Q4 Sales Report.pptx`

## Compatibility

### Supported Platforms
- ✅ Windows (all versions)
- ✅ macOS (all versions)
- ✅ Linux (all distributions)

### Browser Support
- ✅ Chrome/Edge (Chromium-based)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

## Troubleshooting

### Issue: File downloads with generic name
**Solution**: Make sure you've clicked and edited the presentation title in the header before exporting

### Issue: Special characters appear as hyphens
**Expected Behavior**: This is intentional for filesystem compatibility. Special characters like `:`, `/`, `*` are automatically replaced with `-`

### Issue: Title not saving
**Solution**: After editing, press Enter or click outside the title field to save changes

## Related Features

- **Export Button Enhancement**: Direct PowerPoint export with loading states
- **Presentation Title Editing**: Inline title editing in header
- **Auto-save**: Title changes are automatically saved to localStorage

---

**Feature Status**: ✅ Production Ready  
**Last Updated**: December 2024  
**Applies To**: Editor.tsx, EnhancedEditor.tsx
