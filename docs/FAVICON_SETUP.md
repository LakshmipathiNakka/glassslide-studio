# Glass Slide Favicon Setup Guide

## Overview

This guide explains how to set up the Glass Slide favicon that matches the official logo used on the website.

## Changes Made

### 1. HTML Title Update ✅
**File**: `index.html`

Changed from:
```html
<title>SlideForge - Professional Presentation Builder</title>
```

To:
```html
<title>Glass Slide - Professional Builder</title>
```

### 2. Meta Tags Update ✅
Updated all meta tags to reflect Glass Slide branding:
- Author meta tag
- Open Graph tags (Facebook)
- Twitter card tags

### 3. Favicon Links Added ✅
Added proper favicon links in `index.html`:
```html
<!-- Favicon -->
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="64x64" href="/favicon-64x64.png" />
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
```

## Favicon Design

The favicon uses the official Glass Slide logo:
- **Shape**: Hexagonal (matching the logo component)
- **Style**: Gradient from dark gray (#1a1a1a) to muted gray (#4a5568)
- **Format**: SVG source, converted to PNG for browser compatibility

### Logo Reference
The favicon is based on the logo component in `src/components/landing/Logo.tsx`:
```typescript
<div className="absolute inset-0 bg-gradient-to-br from-foreground to-muted-foreground rounded-lg" 
  style={{ 
    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' 
  }}
/>
```

## Files Created

### 1. `public/favicon.svg`
Source SVG file with the hexagonal logo design. This is the master file that can be edited if needed.

### 2. `public/generate-favicons.html`
An interactive HTML tool to generate all required favicon sizes from the SVG.

## How to Generate Favicons

### Method 1: Using the HTML Generator Tool (Recommended)

1. **Open the generator**:
   ```bash
   # Navigate to the public folder
   cd public
   
   # Open generate-favicons.html in your browser
   # On Windows:
   start generate-favicons.html
   ```

2. **Download the generated favicons**:
   - The page will automatically generate three sizes (32x32, 64x64, 180x180)
   - Click "Download All Favicons" or download each individually
   - Files will be saved with correct names

3. **Place the files**:
   - Move downloaded files to the `public/` folder
   - Files should be:
     - `favicon-32x32.png`
     - `favicon-64x64.png`
     - `apple-touch-icon.png`

### Method 2: Using Online Tools

If you prefer using online tools:

1. **Upload** `public/favicon.svg` to any of these services:
   - [Favicon.io](https://favicon.io/)
   - [RealFaviconGenerator](https://realfavicongenerator.net/)
   - [Favicon Generator](https://www.favicon-generator.org/)

2. **Download** the generated package

3. **Extract** and place files in `public/` folder

### Method 3: Using ImageMagick (Command Line)

If you have ImageMagick installed:

```bash
# Navigate to public folder
cd public

# Convert SVG to PNG sizes
magick favicon.svg -resize 32x32 favicon-32x32.png
magick favicon.svg -resize 64x64 favicon-64x64.png
magick favicon.svg -resize 180x180 apple-touch-icon.png

# Optional: Create ICO file
magick favicon-32x32.png favicon-64x64.png favicon.ico
```

## Required Files

Place these files in the `public/` folder:

| File | Size | Purpose | Status |
|------|------|---------|--------|
| `favicon.svg` | Vector | Source file | ✅ Created |
| `favicon-32x32.png` | 32x32 | Standard browsers | ⚠️ Generate |
| `favicon-64x64.png` | 64x64 | High-DPI displays | ⚠️ Generate |
| `favicon.ico` | Multi-size | Legacy browsers | ✅ Exists |
| `apple-touch-icon.png` | 180x180 | iOS home screen | ⚠️ Generate |

## Browser Support

The current setup supports:
- ✅ Chrome/Edge (PNG favicons)
- ✅ Firefox (PNG favicons)
- ✅ Safari (PNG + Apple touch icon)
- ✅ Internet Explorer (ICO fallback)
- ✅ iOS devices (Apple touch icon)
- ✅ Android devices (PNG favicons)

## Testing

After generating and placing the favicon files:

1. **Clear browser cache**:
   - Chrome: Ctrl+Shift+Delete
   - Firefox: Ctrl+Shift+Delete
   - Safari: Cmd+Option+E

2. **Hard refresh the page**:
   - Chrome/Firefox: Ctrl+F5
   - Safari: Cmd+Shift+R

3. **Check browser tab**:
   - Look for the hexagonal logo in the browser tab
   - Title should read: "Glass Slide - Professional Builder"

4. **Test on mobile**:
   - Add to home screen on iOS/Android
   - Check if the apple-touch-icon appears correctly

## Troubleshooting

### Favicon not updating?
1. Clear browser cache completely
2. Try in incognito/private mode
3. Force refresh with Ctrl+Shift+F5
4. Check if files exist in `public/` folder
5. Verify file names match exactly (case-sensitive)

### Favicon looks blurry?
1. Ensure you generated PNG files at the correct sizes
2. Don't upscale smaller images to larger sizes
3. Use the SVG source for best quality

### Different favicon on mobile?
1. Check if `apple-touch-icon.png` exists
2. Verify it's 180x180 pixels
3. May need to re-add to home screen

## Development Server

If you're running a development server, the favicon should automatically update after:
1. Placing new files in `public/`
2. Restarting the dev server
3. Hard refresh in browser

```bash
# Restart Vite dev server
npm run dev
```

## Production Build

For production builds:
1. Ensure all favicon files are in `public/` folder
2. Run the build command
3. Favicon files will be copied to `dist/` automatically

```bash
npm run build
```

## Summary

✅ **Title updated** to "Glass Slide - Professional Builder"  
✅ **Favicon links** added to HTML head  
✅ **SVG source** created matching logo design  
✅ **Generator tool** created for easy PNG generation  
✅ **Meta tags** updated with Glass Slide branding  

### Next Steps:
1. Open `public/generate-favicons.html` in your browser
2. Click "Download All Favicons"
3. Move downloaded files to `public/` folder
4. Refresh your browser to see the new favicon

The Glass Slide favicon is now properly configured! 🎉
