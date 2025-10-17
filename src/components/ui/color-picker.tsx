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
  { name: 'Sunset', gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)' },
  { name: 'Ocean', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Forest', gradient: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)' },
  { name: 'Fire', gradient: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)' },
  { name: 'Purple', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Blue', gradient: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)' },
  { name: 'Green', gradient: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)' },
  { name: 'Orange', gradient: 'linear-gradient(135deg, #FF9800 0%, #FF5722 100%)' },
  { name: 'Pink', gradient: 'linear-gradient(135deg, #E91E63 0%, #F06292 100%)' },
  { name: 'Teal', gradient: 'linear-gradient(135deg, #009688 0%, #4DB6AC 100%)' },
  { name: 'Indigo', gradient: 'linear-gradient(135deg, #3F51B5 0%, #7986CB 100%)' },
  { name: 'Cyan', gradient: 'linear-gradient(135deg, #00BCD4 0%, #4DD0E1 100%)' }
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

  // Optimized slider renderer to prevent lag
  const renderSlider = (label: string, value: number, slider: 'hue' | 'saturation' | 'lightness') => (
    <div>
      <label className="text-xs text-gray-600 mb-1 block">
        {label}: {value}{slider === 'hue' ? '°' : '%'}
      </label>
      <div className="relative">
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
          onPointerUp={() => handleHslChange()} // update only when user releases
          className="w-full appearance-none cursor-pointer h-3 rounded-lg outline-none"
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
                ? `linear-gradient(to right, hsl(${hue}, 0%, 50%), hsl(${hue}, 100%, 50%))`
                : `linear-gradient(to right, hsl(${hue}, ${saturation}%, 0%), hsl(${hue}, ${saturation}%, 50%), hsl(${hue}, ${saturation}%, 100%))`,
            WebkitAppearance: 'none',
            appearance: 'none',
            height: '20px',
            borderRadius: '10px',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
            cursor: 'pointer',
            outline: 'none'
          }}
        />
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

  return (
    <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="fixed z-[99999] bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 p-4"
      style={{
        left: position.x,
        top: position.y,
        maxWidth: '400px',
        width: '400px',
        maxHeight: '80vh'
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">Adjust Color</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          className="h-6 w-6 p-0 hover:bg-gray-200/50"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex mb-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('solid')}
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'solid'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Droplets className="h-4 w-4" />
          Solid Colors
        </button>
        <button
          onClick={() => setActiveTab('gradient')}
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'gradient'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Layers className="h-4 w-4" />
          Gradients
        </button>
      </div>

      {/* Scrollable Content Container */}
      <div className="relative">
        <div className="overflow-y-auto max-h-96 scroll-smooth" style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 #f1f5f9'
        }}>
        {/* Tab Content */}
        {activeTab === 'solid' && (
          <div className="space-y-4 pr-2">
          {/* Predefined Colors */}
          <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-600 mb-3 font-medium">Predefined Colors</p>
            <div className="grid grid-cols-8 gap-2">
              {predefinedColors.map((color, index) => (
                <button
                  key={`predefined-${index}`}
                  className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 hover:shadow-md ${
                    previewColor === color ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorSelect(color)}
                >
                  {previewColor === color && (
                    <Check className="w-4 h-4 text-white mx-auto drop-shadow-sm" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Color Picker */}
          <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-600 mb-3 font-medium">Advanced Color Picker</p>
            <div className="space-y-3">
              {renderSlider('Hue', hue, 'hue')}
              {renderSlider('Saturation', saturation, 'saturation')}
              {renderSlider('Lightness', lightness, 'lightness')}
            </div>
            
            {/* Live Preview */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg border-2 border-gray-300 shadow-sm"
                  style={{ backgroundColor: hslToHex(hue, saturation, lightness) }}
                />
                <div className="flex-1">
                  <div className="text-xs text-gray-600 font-medium">Live Preview</div>
                  <div className="text-sm font-mono text-gray-800">
                    {hslToHex(hue, saturation, lightness)}
                  </div>
                  <div className="text-xs text-gray-500">
                    HSL({hue}°, {saturation}%, {lightness}%)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Custom Color Input */}
          <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-600 mb-3 font-medium">Custom Color</p>
            <div className="flex gap-2">
              <input
                type="color"
                value={previewColor}
                onChange={(e) => {
                  setPreviewColor(e.target.value);
                  // Apply color live when user selects from color picker
                }}
                className="w-8 h-8 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-gray-300 transition-colors"
              />
              <input
                type="text"
                value={previewColor}
                onChange={(e) => {
                  setPreviewColor(e.target.value);
                  // Apply color live as user types
                  if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                    setPreviewColor(e.target.value);
                  }
                }}
                placeholder="#ffffff"
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'gradient' && (
        <div className="space-y-4 pr-2">
          {/* Gradient Presets */}
          <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-600 mb-3 font-medium">Gradient Presets</p>
            <div className="grid grid-cols-2 gap-3">
              {gradientPresets.map((preset, index) => (
                <button
                  key={index}
                  className={`relative h-16 rounded-lg border-2 transition-all hover:scale-105 hover:shadow-md ${
                    previewColor === preset.gradient ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
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
                    <div className="text-xs text-white font-medium bg-black bg-opacity-50 rounded px-1 text-center">
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
        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white to-transparent pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
      </div>

      {/* Live Preview and Commit/Cancel */}
      <div className="mt-4 pt-4 border-t border-gray-200/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full border-2 border-gray-300 shadow-sm"
            style={{ 
                background: previewColor.startsWith('linear-gradient') 
                  ? previewColor 
                  : previewColor 
              }}
            />
            <div className="text-xs text-gray-600">
              <div className="font-mono text-sm font-medium">
                {previewColor.startsWith('linear-gradient') ? 'Gradient' : previewColor}
              </div>
              <div className="text-gray-500">Live Preview</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              className="px-3 py-1 text-sm rounded-lg bg-gray-200/50 hover:bg-gray-300/50 transition-colors border-gray-300/50"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleDone}
              className="px-3 py-1 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
