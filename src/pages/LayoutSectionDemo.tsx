/**
 * LayoutSection Demo Page
 * Standalone demonstration of the Layout Section component
 */

import React, { useState } from 'react';
import { LayoutSection } from '@/components/editor/LayoutSection';
import { motion } from 'framer-motion';
import { Moon, Sun, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export const LayoutSectionDemo: React.FC = () => {
  const [showPanel, setShowPanel] = useState(true);
  const [currentLayout, setCurrentLayout] = useState('title-slide');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleLayoutSelect = (layoutId: string) => {
    setCurrentLayout(layoutId);
    console.log('Layout selected:', layoutId);
  };

  return (
    <div className={cn(
      "h-screen w-screen overflow-hidden transition-colors duration-300",
      isDarkMode ? "dark bg-gray-900" : "bg-gray-50"
    )}>
      {/* Demo Controls */}
      <div className="absolute top-6 left-6 z-50 space-y-3">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl p-6 w-80"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Layout Section Demo
          </h2>
          
          {/* Controls */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Panel Visibility
              </label>
              <button
                onClick={() => setShowPanel(!showPanel)}
                className={cn(
                  "w-full px-4 py-3 rounded-xl font-medium transition-all duration-200",
                  "flex items-center justify-center gap-2",
                  showPanel
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                )}
              >
                {showPanel ? (
                  <>
                    <Eye className="w-4 h-4" />
                    Panel Visible
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4" />
                    Panel Hidden
                  </>
                )}
              </button>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Theme
              </label>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={cn(
                  "w-full px-4 py-3 rounded-xl font-medium transition-all duration-200",
                  "flex items-center justify-center gap-2",
                  "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
                  "hover:bg-gray-200 dark:hover:bg-gray-700"
                )}
              >
                {isDarkMode ? (
                  <>
                    <Sun className="w-4 h-4" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4" />
                    Dark Mode
                  </>
                )}
              </button>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Current Layout
              </label>
              <div className="px-4 py-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <div className="text-sm font-mono text-purple-700 dark:text-purple-300">
                  {currentLayout}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Usage Example */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl p-6 w-80"
        >
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Usage
          </h3>
          <pre className="text-xs bg-gray-100 dark:bg-gray-800 rounded-lg p-3 overflow-x-auto">
            <code className="text-gray-700 dark:text-gray-300">{`<LayoutSection
  isVisible={true}
  onLayoutSelect={handleSelect}
  currentLayoutId="title-slide"
/>`}</code>
          </pre>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl p-6 w-80"
        >
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            ✨ Features
          </h3>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>6 premium slide layouts</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Glassmorphism design</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Smooth animations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Responsive grid/scroll</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Keyboard navigation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Dark mode support</span>
            </li>
          </ul>
        </motion.div>
      </div>

      {/* Main Content Area */}
      <div className="h-full flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center px-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Layout Section Component
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Apple Keynote-inspired layout selector with premium glassmorphic design,
            smooth animations, and responsive behavior.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300">
              React + TypeScript
            </div>
            <div className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full text-sm font-medium text-purple-700 dark:text-purple-300">
              Framer Motion
            </div>
            <div className="px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full text-sm font-medium text-green-700 dark:text-green-300">
              TailwindCSS
            </div>
          </div>
        </motion.div>
      </div>

      {/* Layout Section Panel */}
      <LayoutSection
        isVisible={showPanel}
        onLayoutSelect={handleLayoutSelect}
        currentLayoutId={currentLayout}
      />
    </div>
  );
};

export default LayoutSectionDemo;
