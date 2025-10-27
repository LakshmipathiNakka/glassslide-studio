/**
 * SmartSidebar Component
 * 
 * Context-aware right sidebar that intelligently switches between:
 * - PropertiesPanel (when element is selected)
 * - LayoutSection (when no element is selected)
 * 
 * Implements Apple Keynote-style smooth transitions and glassmorphism
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PropertiesPanel } from './PropertiesPanel';
import { LayoutSection } from './LayoutSection';
import { SlideElement } from '@/types/canvas';

interface SmartSidebarProps {
  selectedElement: SlideElement | null;
  onElementUpdate: (elementId: string, updates: Partial<SlideElement>) => void;
  onElementDelete: (elementId: string) => void;
  onLayoutSelect: (layoutId: string) => void;
  currentLayoutId?: string;
  className?: string;
}

export const SmartSidebar: React.FC<SmartSidebarProps> = ({
  selectedElement,
  onElementUpdate,
  onElementDelete,
  onLayoutSelect,
  currentLayoutId,
  className,
}) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const previousModeRef = useRef<'properties' | 'layouts'>('layouts');

  // Determine current mode
  const currentMode = selectedElement ? 'properties' : 'layouts';

  // Save scroll position before transition
  useEffect(() => {
    if (currentMode !== previousModeRef.current) {
      setIsTransitioning(true);
      
      // Save current scroll position
      if (scrollContainerRef.current) {
        setScrollPosition(scrollContainerRef.current.scrollTop);
      }

      // Reset transitioning state after animation completes
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        previousModeRef.current = currentMode;
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [currentMode]);

  // Restore scroll position after transition
  useEffect(() => {
    if (!isTransitioning && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollPosition;
    }
  }, [isTransitioning, scrollPosition]);

  // Animation variants for smooth transitions
  const sidebarVariants = {
    initial: {
      opacity: 0,
      x: 100,
      scale: 0.95,
    },
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
    },
    exit: {
      opacity: 0,
      x: 100,
      scale: 0.95,
    },
  };

  const transition = {
    duration: 0.3,
    ease: [0.4, 0.0, 0.2, 1], // Apple's ease-in-out curve
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {currentMode === 'properties' && (
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
            className={cn(
              // Mobile only - floating overlay
              'md:hidden',
              'fixed inset-y-0 right-0',
              'w-full',
              'z-50',
              
              // Glassmorphism
              'bg-gradient-to-br from-white/95 via-white/90 to-white/85',
              'dark:from-gray-900/95 dark:via-gray-900/90 dark:to-gray-900/85',
              'backdrop-blur-2xl',
              
              // Borders and shadows
              'border-l border-white/20 dark:border-gray-700/50',
              'shadow-[-8px_0_32px_rgba(0,0,0,0.3)]',
              'dark:shadow-[-8px_0_32px_rgba(0,0,0,0.5)]',
              
              'overflow-hidden flex flex-col'
            )}
            role="complementary"
            aria-label={currentMode === 'properties' ? 'Properties panel' : 'Layout selection'}
          >
            {/* Animated Content Switcher - Mobile */}
            <AnimatePresence mode="wait" initial={false}>
              {currentMode === 'properties' ? (
                <motion.div
                  key="properties-mobile"
                  variants={sidebarVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={transition}
                  className="w-full h-full flex flex-col"
                >
                  <PropertiesPanel
                    selectedElement={selectedElement}
                    onElementUpdate={onElementUpdate}
                    onElementDelete={onElementDelete}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="layouts-mobile"
                  variants={sidebarVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={transition}
                  className="w-full h-full flex flex-col"
                >
                  <LayoutSection
                    isVisible={true}
                    onLayoutSelect={onLayoutSelect}
                    currentLayoutId={currentLayoutId}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Tablet & Desktop Sidebar */}
      <aside
        className={cn(
          // Hide on mobile, show on tablet+
          'hidden md:flex',
          
          // Base structure - flows with layout
          'h-full flex-col',
          'flex-shrink-0',
          
          // Responsive widths:
          // Large screens (lg): ~30% of editor width = 28rem (448px)
          // Tablets (md): 60% of large = 16.8rem ≈ 17rem (272px)
          'w-[17rem] lg:w-[28rem]',
          
          // Glassmorphism
          'bg-gradient-to-br from-white/95 via-white/90 to-white/85',
          'dark:from-gray-900/95 dark:via-gray-900/90 dark:to-gray-900/85',
          'backdrop-blur-2xl',
          
          // Borders and shadows
          'border-l border-white/20 dark:border-gray-700/50',
          'shadow-[-8px_0_32px_rgba(0,0,0,0.08)]',
          'dark:shadow-[-8px_0_32px_rgba(0,0,0,0.3)]',
          
          // Smooth transitions
          'transition-all duration-300',
          
          'overflow-hidden',
          
          className
        )}
        ref={scrollContainerRef}
        role="complementary"
        aria-label={currentMode === 'properties' ? 'Properties panel' : 'Layout selection'}
      >
      {/* Animated Content Switcher */}
      <AnimatePresence mode="wait" initial={false}>
        {currentMode === 'properties' ? (
          <motion.div
            key="properties"
            variants={sidebarVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
            className="w-full h-full flex flex-col"
          >
            <PropertiesPanel
              selectedElement={selectedElement}
              onElementUpdate={onElementUpdate}
              onElementDelete={onElementDelete}
            />
          </motion.div>
        ) : (
          <motion.div
            key="layouts"
            variants={sidebarVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
            className="w-full h-full flex flex-col"
          >
            <LayoutSection
              isVisible={true}
              onLayoutSelect={onLayoutSelect}
              currentLayoutId={currentLayoutId}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mode Indicator (optional visual feedback) */}
      <div className="absolute top-4 right-4 pointer-events-none z-50">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMode}
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium',
              'backdrop-blur-md shadow-lg',
              currentMode === 'properties'
                ? 'bg-blue-500/90 text-white'
                : 'bg-purple-500/90 text-white'
            )}
          >
            {currentMode === 'properties' ? 'Properties' : 'Layouts'}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Smooth Transition Overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.05 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-white dark:bg-gray-900 pointer-events-none z-40"
          />
        )}
      </AnimatePresence>
    </aside>
    </>
  );
};

export default SmartSidebar;
