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
    ease: 'easeInOut' as const, // Using a predefined easing function
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {true && (
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
            className={cn(
              // Mobile only - floating overlay
              'md:hidden',
              'fixed inset-y-0 right-0',
              'w-[92vw] max-w-[360px]',
              'z-50',

              // Glassmorphism
              'bg-gradient-to-br from-white/95 via-white/90 to-white/85',
              'dark:from-gray-900/95 dark:via-gray-900/90 dark:to-gray-900/85',
              'backdrop-blur-2xl',

              // Borders and shadows
              'border-l border-white/20 dark:border-gray-700/50',
              'shadow-[-8px_0_32px_rgba(0,0,0,0.3)]',
              'dark:shadow-[-8px_0_32px_rgba(0,0,0,0.5)]',

              // Allow vertical scrolling when content exceeds height
              'overflow-y-auto flex flex-col'
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

      {/* Desktop Sidebar only (lg and up) */}
      <aside
        className={cn(
          'hidden lg:flex',
          'h-full flex-col flex-shrink-0 ml-auto mr-0',
          'w-[280px]',
          className
        )}
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

      {/* Tablet Overlay (md to <lg) */}
      <AnimatePresence>
        {true && (
          <motion.aside
            key="tablet-overlay"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
            className={cn(
              'hidden md:flex lg:hidden',
              'fixed inset-y-0 right-0 z-40',
              'bg-gradient-to-br from-white/95 via-white/90 to-white/85',
              'dark:from-gray-900/95 dark:via-gray-900/90 dark:to-gray-900/85',
              'backdrop-blur-2xl',
              'border-l border-white/20 dark:border-gray-700/50',
              'shadow-[-8px_0_32px_rgba(0,0,0,0.14)]',
              'overflow-y-auto'
            )}
            style={{ width: 'clamp(180px, 18%, 216px)' }}
            role="complementary"
            aria-label={currentMode === 'properties' ? 'Properties panel' : 'Layout selection'}
          >
            <div className="w-full h-full flex flex-col">
              <AnimatePresence mode="wait" initial={false}>
                {currentMode === 'properties' ? (
                  <motion.div
                    key="properties-tablet"
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
                    key="layouts-tablet"
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
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default SmartSidebar;
