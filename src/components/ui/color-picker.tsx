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
  const [customColor, setCustomColor] = useState(currentColor);
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
    }
  }, [currentColor]);

  const handleColorSelect = (color: string) => {
    onColorChange(color);
    onClose();
  };

  const handleCustomColorSubmit = () => {
    if (/^#[0-9A-F]{6}$/i.test(customColor)) {
      onColorChange(customColor);
      onClose();
    }
  };

  const handleHslChange = () => {
    const hexColor = hslToHex(hue, saturation, lightness);
    setCustomColor(hexColor);
    // Don't call onColorChange here to avoid closing the picker
    // onColorChange(hexColor);
  };

  const handleGradientSelect = (gradient: string) => {
    setSelectedGradient(gradient);
    onColorChange(gradient);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed z-[99999] bg-white border border-gray-200 rounded-lg shadow-lg p-4"
      style={{
        left: position.x,
        top: position.y,
        maxWidth: '400px',
        width: '400px',
        maxHeight: '80vh'
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900">Choose Background</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0"
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
          <div>
            <p className="text-xs text-gray-600 mb-2">Predefined Colors</p>
            <div className="grid grid-cols-8 gap-2">
              {predefinedColors.map((color, index) => (
                <button
                  key={`predefined-${index}`}
                  className={`w-8 h-8 rounded border-2 transition-all hover:scale-110 ${
                    currentColor === color ? 'border-gray-900' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorSelect(color)}
                >
                  {currentColor === color && (
                    <Check className="w-4 h-4 text-white mx-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Color Picker */}
          <div>
            <p className="text-xs text-gray-600 mb-2">Advanced Color Picker</p>
            <div className="space-y-3">
              {/* Hue Slider */}
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Hue: {hue}°</label>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={hue}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setHue(value);
                      handleHslChange();
                    }}
                    onInput={(e) => {
                      const value = Number((e.target as HTMLInputElement).value);
                      setHue(value);
                      handleHslChange();
                    }}
                    className="w-full"
                    style={{
                      background: `linear-gradient(to right, 
                        hsl(0, 100%, 50%), 
                        hsl(60, 100%, 50%), 
                        hsl(120, 100%, 50%), 
                        hsl(180, 100%, 50%), 
                        hsl(240, 100%, 50%), 
                        hsl(300, 100%, 50%), 
                        hsl(360, 100%, 50%))`,
                      WebkitAppearance: 'none',
                      appearance: 'none',
                      height: '12px',
                      borderRadius: '6px',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Saturation Slider */}
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Saturation: {saturation}%</label>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={saturation}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setSaturation(value);
                      handleHslChange();
                    }}
                    onInput={(e) => {
                      const value = Number((e.target as HTMLInputElement).value);
                      setSaturation(value);
                      handleHslChange();
                    }}
                    className="w-full"
                    style={{
                      background: `linear-gradient(to right, 
                        hsl(${hue}, 0%, 50%), 
                        hsl(${hue}, 100%, 50%))`,
                      WebkitAppearance: 'none',
                      appearance: 'none',
                      height: '12px',
                      borderRadius: '6px',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Lightness Slider */}
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Lightness: {lightness}%</label>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={lightness}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setLightness(value);
                      handleHslChange();
                    }}
                    onInput={(e) => {
                      const value = Number((e.target as HTMLInputElement).value);
                      setLightness(value);
                      handleHslChange();
                    }}
                    className="w-full"
                    style={{
                      background: `linear-gradient(to right, 
                        hsl(${hue}, ${saturation}%, 0%), 
                        hsl(${hue}, ${saturation}%, 50%), 
                        hsl(${hue}, ${saturation}%, 100%))`,
                      WebkitAppearance: 'none',
                      appearance: 'none',
                      height: '12px',
                      borderRadius: '6px',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </div>
            
            {/* Live Preview */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg border-2 border-gray-300"
                  style={{ backgroundColor: hslToHex(hue, saturation, lightness) }}
                />
                <div className="flex-1">
                  <div className="text-xs text-gray-600">Live Preview</div>
                  <div className="text-sm font-mono text-gray-800">
                    {hslToHex(hue, saturation, lightness)}
                  </div>
                  <div className="text-xs text-gray-500">
                    HSL({hue}°, {saturation}%, {lightness}%)
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    const hexColor = hslToHex(hue, saturation, lightness);
                    onColorChange(hexColor);
                    onClose();
                  }}
                  className="px-3"
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>

          {/* Custom Color Input */}
          <div>
            <p className="text-xs text-gray-600 mb-2">Custom Color</p>
            <div className="flex gap-2">
              <input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="w-8 h-8 rounded border border-gray-200 cursor-pointer"
              />
              <input
                type="text"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                placeholder="#ffffff"
                className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                size="sm"
                onClick={handleCustomColorSubmit}
                className="px-3"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'gradient' && (
        <div className="space-y-4 pr-2">
          {/* Gradient Presets */}
          <div>
            <p className="text-xs text-gray-600 mb-2">Gradient Presets</p>
            <div className="grid grid-cols-2 gap-3">
              {gradientPresets.map((preset, index) => (
                <button
                  key={index}
                  className={`relative h-16 rounded-lg border-2 transition-all hover:scale-105 ${
                    selectedGradient === preset.gradient ? 'border-blue-500' : 'border-gray-200'
                  }`}
                  style={{ background: preset.gradient }}
                  onClick={() => handleGradientSelect(preset.gradient)}
                >
                  {selectedGradient === preset.gradient && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-lg">
                      <Check className="w-6 h-6 text-white" />
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

      {/* Current Color Preview */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span>Current:</span>
          <div
            className="w-6 h-6 rounded border border-gray-200"
            style={{ 
              background: currentColor.startsWith('linear-gradient') 
                ? currentColor 
                : currentColor 
            }}
          />
          <span className="font-mono text-xs">
            {currentColor.startsWith('linear-gradient') ? 'Gradient' : currentColor}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
