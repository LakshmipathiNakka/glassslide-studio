import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './button';
import { X, Check, Palette, Layers, Droplets } from 'lucide-react';

interface ColorPickerProps {
  isOpen: boolean;
  onClose: () => void;
  currentColor: string;
  onColorChange: (color: string) => void;
  position?: { x: number; y: number };
}

const predefinedColors = [
  '#ffffff', '#f8f9fa', '#e9ecef', '#dee2e6', '#ced4da',
  '#adb5bd', '#6c757d', '#495057', '#343a40', '#212529',
  '#000000', '#dc3545', '#fd7e14', '#ffc107', '#28a745',
  '#20c997', '#17a2b8', '#007bff', '#6f42c1', '#e83e8c',
  '#f8d7da', '#d1ecf1', '#d4edda', '#fff3cd'
];

const gradientPresets = [
  // Vibrant Gradients
  { name: 'Sunset', gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)' },
  { name: 'Ocean', gradient: 'linear-gradient(135deg, #00c6fb 0%, #005bea 100%)' },
  { name: 'Forest', gradient: 'linear-gradient(135deg, #0f9b0f 0%, #96e6a1 100%)' },
  { name: 'Fire', gradient: 'linear-gradient(135deg, #f46b45 0%, #eea849 100%)' },
  
  // Professional Gradients
  { name: 'Deep Blue', gradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' },
  { name: 'Royal', gradient: 'linear-gradient(135deg, #141e30 0%, #243b55 100%)' },
  { name: 'Mild', gradient: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)' },
  { name: 'Sunny', gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
  
  // Modern Gradients
  { name: 'Aurora', gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)' },
  { name: 'Frost', gradient: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)' },
  { name: 'Peach', gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
  { name: 'Twilight', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  
  // Dark Mode Gradients
  { name: 'Midnight', gradient: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' },
  { name: 'Deep Space', gradient: 'linear-gradient(135deg, #000000 0%, #434343 100%)' },
  { name: 'Neon', gradient: 'linear-gradient(135deg, #f43b47 0%, #453a94 100%)' },
  { name: 'Galaxy', gradient: 'linear-gradient(135deg, #3a1c71 0%, #d76d77 50%, #ffaf7b 100%)' },
  
  // Pastel Gradients
  { name: 'Cotton Candy', gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)' },
  { name: 'Mint', gradient: 'linear-gradient(135deg, #a1ffce 0%, #faffd1 100%)' },
  { name: 'Lavender', gradient: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)' },
  { name: 'Peach', gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
  
  // Duotone Gradients
  { name: 'Purple Haze', gradient: 'linear-gradient(135deg, #b8cbb8 0%, #b8cbb8 0%, #b465da 0%, #cf6cc9 33%, #ee609c 66%, #ee609c 100%)' },
  { name: 'Blue Raspberry', gradient: 'linear-gradient(135deg, #00b4db 0%, #0083b0 100%)' },
  { name: 'Sunset Glow', gradient: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)' },
  { name: 'Emerald', gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }
];

export const ColorPicker: React.FC<ColorPickerProps> = ({
  isOpen,
  onClose,
  currentColor,
  onColorChange,
  position = { x: 0, y: 0 }
}) => {
  const [tempColor, setTempColor] = useState(currentColor);
  const [previewColor, setPreviewColor] = useState(currentColor);
  const [activeTab, setActiveTab] = useState<'solid' | 'gradient'>('solid');
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);
  const [selectedGradient, setSelectedGradient] = useState<string>('');

  // Helper function to convert HSL to hex
  const hslToHex = (h: number, s: number, l: number): string => {
    h = h / 360;
    s = s / 100;
    l = l / 100;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    const toHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // Helper function to convert hex to HSL
  const hexToHsl = (hex: string): { h: number; s: number; l: number } => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  };

  // Initialize HSL values from current color
  useEffect(() => {
    if (currentColor && currentColor.startsWith('#')) {
      const hsl = hexToHsl(currentColor);
      setHue(hsl.h);
      setSaturation(hsl.s);
      setLightness(hsl.l);
      setTempColor(currentColor);
      setPreviewColor(currentColor);
    }
  }, [currentColor]);

  // Live preview effect - updates slide editor in real time
  useEffect(() => {
    if (isOpen) {
      // Apply live preview to the active slide
      const slideElement = document.querySelector('.slide-active') as HTMLElement;
      if (slideElement) {
        slideElement.style.setProperty('--slide-bg', previewColor);
        slideElement.style.backgroundColor = previewColor;
      }
    }
  }, [previewColor, isOpen]);

  // Update preview color when HSL values change
  useEffect(() => {
    const color = hslToHex(hue, saturation, lightness);
    setPreviewColor(color);
  }, [hue, saturation, lightness]);

  const handleColorSelect = (color: string) => {
    setPreviewColor(color);
    // Don't close immediately - let user see the change
  };

  const handleDone = () => {
    console.log('🎨 APPLYING COLOR:', previewColor);
    onColorChange(previewColor);
    onClose();
  };

  const handleCancel = () => {
    // Restore original color
    onColorChange(tempColor);
      onClose();
  };


  const handleHslChange = () => {
    const hexColor = hslToHex(hue, saturation, lightness);
    setPreviewColor(hexColor);
    // Don't apply to slide until Done is clicked
  };

  // Optimized slider renderer with Keynote-style design
  const renderSlider = (label: string, value: number, slider: 'hue' | 'saturation' | 'lightness') => (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <label className="text-[11px] text-popover-foreground/70">
          {label}
        </label>
        <span className="text-xs font-mono text-popover-foreground">
          {Math.round(value)}{slider === 'hue' ? '°' : '%'}
        </span>
      </div>
      <div className="relative h-6 flex items-center">
        <div 
          className="absolute inset-0 flex items-center"
          style={{
            background:
              slider === 'hue'
                ? `linear-gradient(to right, 
                    hsl(0, 100%, 50%), 
                    hsl(60, 100%, 50%), 
                    hsl(120, 100%, 50%), 
                    hsl(180, 100%, 50%), 
                    hsl(240, 100%, 50%), 
                    hsl(300, 100%, 50%), 
                    hsl(360, 100%, 50%))`
                : slider === 'saturation'
                ? `linear-gradient(to right, 
                    hsl(${hue}, 0%, 50%), 
                    hsl(${hue}, 100%, 50%))`
                : `linear-gradient(to right, 
                    hsl(${hue}, ${saturation}%, 0%), 
                    hsl(${hue}, ${saturation}%, 50%), 
                    hsl(${hue}, ${saturation}%, 100%))`,
            borderRadius: '4px',
            height: '6px',
            width: '100%'
          }}
        >
          <input
            type="range"
            min="0"
            max={slider === 'hue' ? 360 : 100}
            step="1"
            value={value}
            onChange={(e) => {
              const newValue = Number(e.target.value);
              if (slider === 'hue') setHue(newValue);
              else if (slider === 'saturation') setSaturation(newValue);
              else setLightness(newValue);
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div 
            className="absolute top-1/2 -mt-1.5 w-3 h-3 bg-popover rounded-full shadow-sm border border-popover-foreground/30"
            style={{
              left: `${(value / (slider === 'hue' ? 360 : 100)) * 100}%`,
              transform: 'translateX(-50%)',
              pointerEvents: 'none'
            }}
          />
        </div>
      </div>
    </div>
  );

  const handleGradientSelect = (gradient: string) => {
    console.log('🎨 GRADIENT SELECTED:', gradient);
    setSelectedGradient(gradient);
    setPreviewColor(gradient);
    // Don't close immediately - let user see the change
  };

  if (!isOpen) return null;

  // Calculate position to ensure it stays within viewport
  const [x, y] = [
    Math.min(position.x, window.innerWidth - 400 - 16), // 400 is the width of the picker
    Math.min(position.y, window.innerHeight - 500 - 16) // 500 is the max height
  ];

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-[99998] bg-black/20 backdrop-blur-sm"
        onClick={handleCancel}
      />
      
      {/* Color Picker */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.5 }}
        className="fixed z-[99999] bg-popover/95 backdrop-blur-xl rounded-xl shadow-2xl border border-popover-foreground/20 overflow-hidden"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: '280px',
        maxWidth: 'calc(100vw - 32px)',
        maxHeight: 'calc(100vh - 32px)',
        boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.15)',
        border: '1px solid hsl(var(--popover-foreground) / 0.2)'
      }}
    >
      <div className="p-3 border-b border-popover-foreground/20 flex items-center justify-between">
        <div className="text-sm font-medium text-popover-foreground">Colors</div>
        <button
          onClick={handleCancel}
          className="text-popover-foreground/60 hover:text-popover-foreground transition-colors p-1 -mr-1"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-popover-foreground/20 px-2">
        <button
          onClick={() => setActiveTab('solid')}
          className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
            activeTab === 'solid'
              ? 'text-blue-600 border-b-2 border-blue-500'
              : 'text-popover-foreground/70 hover:text-popover-foreground'
          }`}
        >
          Color
        </button>
        <button
          onClick={() => setActiveTab('gradient')}
          className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
            activeTab === 'gradient'
              ? 'text-blue-600 border-b-2 border-blue-500'
              : 'text-popover-foreground/70 hover:text-popover-foreground'
          }`}
        >
          Gradient
        </button>
      </div>

      {/* Scrollable Content Container */}
      <div className="relative overflow-hidden">
        <div className="overflow-y-auto max-h-[360px] scroll-smooth px-3 py-3" style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0,0,0,0.1) transparent',
          WebkitOverflowScrolling: 'touch'
        }}>
        {/* Tab Content */}
        {activeTab === 'solid' && (
          <div className="space-y-4 pr-2">
          {/* Predefined Colors */}
          <div className="mb-4">
            <div className="grid grid-cols-8 gap-1.5">
              {predefinedColors.map((color, index) => (
                <button
                  key={`predefined-${index}`}
                  className={`w-6 h-6 rounded-full transition-all hover:scale-110 ${
                    previewColor === color ? 'ring-2 ring-offset-1 ring-blue-500' : 'hover:ring-1 hover:ring-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorSelect(color)}
                  title={color}
                >
                  {previewColor === color && (
                    <div className="w-full h-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white drop-shadow-sm" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Color Sliders */}
          <div className="mt-4 space-y-3">
            <div className="text-[11px] text-popover-foreground/70 font-medium mb-1">Color</div>
            <div className="space-y-2">
              {renderSlider('Hue', hue, 'hue')}
              {renderSlider('Saturation', saturation, 'saturation')}
              {renderSlider('Lightness', lightness, 'lightness')}
            </div>
            
            {/* Color Preview */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-[11px] text-popover-foreground/70 font-medium">Preview</div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded border border-popover-foreground/30"
                  style={{ backgroundColor: previewColor }}
                />
                <div className="text-xs font-mono text-popover-foreground">
                  {previewColor.startsWith('#') ? previewColor.toUpperCase() : 'Gradient'}
                </div>
              </div>
            </div>
          </div>

          {/* Color Input */}
          <div className="mt-4">
            <div className="text-[11px] text-popover-foreground/70 font-medium mb-1.5">Hex Color</div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="color"
                  value={previewColor.startsWith('#') ? previewColor : '#ffffff'}
                  onChange={(e) => setPreviewColor(e.target.value)}
                  className="w-8 h-8 rounded-md border border-popover-foreground/30 cursor-pointer appearance-none p-0 bg-transparent"
                  style={{
                    WebkitAppearance: 'none',
                    border: '1px solid hsl(var(--popover-foreground) / 0.3)',
                    borderRadius: '4px'
                  }}
                />
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <Palette className="w-3.5 h-3.5 text-popover-foreground/40" />
                </div>
              </div>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={previewColor.startsWith('#') ? previewColor.toUpperCase() : ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^#[0-9A-F]{0,6}$/i.test(value)) {
                      setPreviewColor(value);
                    }
                  }}
                  placeholder="#FFFFFF"
                  className="w-full px-2.5 py-1.5 text-xs border border-popover-foreground/30 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-transparent text-popover-foreground"
                  style={{
                    height: '32px',
                    lineHeight: '1'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'gradient' && (
        <div className="space-y-4 pr-2">
          {/* Gradient Presets */}
          <div className="p-4 bg-popover/50 rounded-xl border border-popover-foreground/20 shadow-sm">
            <p className="text-xs text-popover-foreground mb-3 font-medium">Gradient Presets</p>
            <div className="grid grid-cols-2 gap-3">
              {gradientPresets.map((preset, index) => (
                <button
                  key={index}
                  className={`relative h-16 rounded-lg border-2 transition-all hover:scale-105 hover:shadow-md ${
                    previewColor === preset.gradient ? 'border-blue-500 ring-2 ring-blue-200' : 'border-popover-foreground/30 hover:border-popover-foreground/50'
                  }`}
                  style={{ background: preset.gradient }}
                  onClick={() => handleGradientSelect(preset.gradient)}
                >
                  {previewColor === preset.gradient && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-lg">
                      <Check className="w-6 h-6 text-white drop-shadow-sm" />
                    </div>
                  )}
                  <div className="absolute bottom-1 left-1 right-1">
                    <div className="text-xs text-popover-foreground font-medium bg-popover/80 rounded px-1 text-center">
                      {preset.name}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
        </div>
        
        {/* Scroll Fade Indicators */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-popover to-transparent pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-popover to-transparent pointer-events-none"></div>
      </div>

      {/* Action Buttons */}
      <div className="border-t border-popover-foreground/20 px-3 py-2.5 bg-popover/50">
        <div className="flex justify-end gap-2">
          <button
            onClick={handleCancel}
            className="px-4 py-1.5 text-xs font-medium text-popover-foreground hover:bg-popover rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDone}
            className="px-4 py-1.5 text-xs font-medium bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </motion.div>
    </>
  );
};
