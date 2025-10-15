import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './button';
import { X, Monitor, Grid3X3, Palette, Zap } from 'lucide-react';
import { Slide } from '@/types/slide-thumbnails';

interface SlideSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  slide: Slide;
  onSave: (settings: Partial<Slide>) => void;
}

export const SlideSettingsModal: React.FC<SlideSettingsModalProps> = ({
  isOpen,
  onClose,
  slide,
  onSave
}) => {
  const [settings, setSettings] = useState({
    title: slide.title || '',
    theme: slide.theme || 'default',
    animationDuration: slide.animationDuration || 0,
    category: slide.category || 'custom',
    background: slide.background || '#ffffff'
  });

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const layouts = [
    { id: '16:9', name: 'Widescreen (16:9)', icon: Monitor },
    { id: '4:3', name: 'Standard (4:3)', icon: Monitor },
    { id: '16:10', name: 'Widescreen (16:10)', icon: Monitor }
  ];

  const themes = [
    { id: 'default', name: 'Default', color: '#ffffff' },
    { id: 'dark', name: 'Dark', color: '#1a1a1a' },
    { id: 'blue', name: 'Blue', color: '#0066cc' },
    { id: 'green', name: 'Green', color: '#00aa44' },
    { id: 'purple', name: 'Purple', color: '#6600cc' }
  ];

  const categories = [
    { id: 'intro', name: 'Introduction' },
    { id: 'content', name: 'Content' },
    { id: 'data', name: 'Data' },
    { id: 'conclusion', name: 'Conclusion' },
    { id: 'custom', name: 'Custom' }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] bg-black/50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Slide Settings</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-6">
            {/* Slide Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slide Title
              </label>
              <input
                type="text"
                value={settings.title}
                onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter slide title"
              />
            </div>

            {/* Layout */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Layout
              </label>
              <div className="grid grid-cols-1 gap-2">
                {layouts.map((layout) => (
                  <button
                    key={layout.id}
                    className={`flex items-center gap-3 p-3 rounded-md border transition-colors ${
                      settings.theme === layout.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setSettings({ ...settings, theme: layout.id })}
                  >
                    <layout.icon className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-900">{layout.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Theme */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme
              </label>
              <div className="grid grid-cols-2 gap-2">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    className={`flex items-center gap-2 p-2 rounded-md border transition-colors ${
                      settings.theme === theme.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setSettings({ ...settings, theme: theme.id })}
                  >
                    <div
                      className="w-4 h-4 rounded border border-gray-200"
                      style={{ backgroundColor: theme.color }}
                    />
                    <span className="text-sm text-gray-900">{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={settings.category}
                onChange={(e) => setSettings({ ...settings, category: e.target.value as Slide['category'] })}
                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Background Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Background Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.background}
                  onChange={(e) => setSettings({ ...settings, background: e.target.value })}
                  className="w-12 h-10 rounded border border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.background}
                  onChange={(e) => setSettings({ ...settings, background: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="#ffffff"
                />
              </div>
            </div>

            {/* Animation Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Animation Duration (ms)
              </label>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-gray-600" />
                <input
                  type="number"
                  value={settings.animationDuration}
                  onChange={(e) => setSettings({ ...settings, animationDuration: Number(e.target.value) })}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="5000"
                  step="100"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Settings
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
