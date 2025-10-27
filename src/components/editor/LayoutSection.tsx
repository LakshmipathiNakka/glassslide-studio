/**
 * LayoutSection Component
 * 
 * Apple Keynote-inspired layout selector panel that appears when Properties Panel is hidden.
 * Features:
 * - Responsive grid/horizontal scroll
 * - Glassmorphism with translucent backgrounds
 * - Smooth Framer Motion animations
 * - Touch and keyboard navigation
 * - Accessibility compliant
 * - Apple HIG spacing and shadows
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Layout, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PREMIUM_LAYOUTS } from '@/data/premiumLayouts';
import { LayoutCard } from './LayoutCard';

interface LayoutSectionProps {
  isVisible: boolean;
  onClose?: () => void;
  onLayoutSelect: (layoutId: string) => void;
  currentLayoutId?: string;
  className?: string;
}

export const LayoutSection: React.FC<LayoutSectionProps> = ({
  isVisible,
  onClose,
  onLayoutSelect,
  currentLayoutId,
  className,
}) => {
  const [selectedLayout, setSelectedLayout] = useState(currentLayoutId || 'title-slide');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Update selected layout when currentLayoutId changes
  useEffect(() => {
    if (currentLayoutId) {
      setSelectedLayout(currentLayoutId);
    }
  }, [currentLayoutId]);

  // Check scroll position for navigation arrows
  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScroll();
    container.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);

    return () => {
      container.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [isVisible]);

  const handleLayoutSelect = (layoutId: string) => {
    setSelectedLayout(layoutId);
    onLayoutSelect(layoutId);
  };

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 300;
    const targetScroll =
      direction === 'left'
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth',
    });
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' && canScrollLeft) {
      scroll('left');
    } else if (e.key === 'ArrowRight' && canScrollRight) {
      scroll('right');
    }
  };

  // Check if we're being used inside a wrapper (SmartSidebar) or standalone
  const isStandalone = className?.includes('fixed');

  const content = (
    <>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className={cn(
          'flex items-center justify-between',
          'px-6 py-5',
          'border-b border-gray-200/50 dark:border-gray-700/50',
          'bg-white/30 dark:bg-gray-800/30',
          'backdrop-blur-xl'
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-10 h-10',
              'bg-gradient-to-br from-blue-400 to-purple-500',
              'rounded-xl',
              'flex items-center justify-center',
              'shadow-lg'
            )}
          >
            <Layout className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">
              Slide Layouts
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Choose a premium design
            </p>
          </div>
        </div>

        {onClose && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className={cn(
              'p-2 rounded-lg',
              'text-gray-500 dark:text-gray-400',
              'hover:bg-gray-100/80 dark:hover:bg-white/5',
              'transition-colors duration-150',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/40'
            )}
            aria-label="Close layout panel"
          >
            <X className="w-5 h-5" />
          </motion.button>
        )}
      </motion.div>

      {/* Scrollable layouts container */}
      <div className="flex-1 relative overflow-hidden">
        {/* Left scroll indicator */}
        <AnimatePresence>
              {canScrollLeft && (
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onClick={() => scroll('left')}
                  className={cn(
                    'absolute left-2 top-1/2 -translate-y-1/2',
                    'z-10',
                    'w-10 h-10',
                    'bg-white/90 dark:bg-gray-800/90',
                    'backdrop-blur-md',
                    'border border-gray-200/50 dark:border-gray-700/50',
                    'rounded-full',
                    'shadow-lg',
                    'flex items-center justify-center',
                    'text-gray-700 dark:text-gray-300',
                    'hover:bg-white dark:hover:bg-gray-800',
                    'transition-all duration-200',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/40',
                    'hidden sm:flex'
                  )}
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Right scroll indicator */}
            <AnimatePresence>
              {canScrollRight && (
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onClick={() => scroll('right')}
                  className={cn(
                    'absolute right-2 top-1/2 -translate-y-1/2',
                    'z-10',
                    'w-10 h-10',
                    'bg-white/90 dark:bg-gray-800/90',
                    'backdrop-blur-md',
                    'border border-gray-200/50 dark:border-gray-700/50',
                    'rounded-full',
                    'shadow-lg',
                    'flex items-center justify-center',
                    'text-gray-700 dark:text-gray-300',
                    'hover:bg-white dark:hover:bg-gray-800',
                    'transition-all duration-200',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/40',
                    'hidden sm:flex'
                  )}
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Layouts grid/scroll container */}
            <div
              ref={scrollContainerRef}
              className={cn(
                'h-full overflow-y-auto overflow-x-hidden',
                'px-6 py-6',
                'space-y-6',
                // Custom scrollbar
                'scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600',
                'scrollbar-track-transparent',
                // Responsive: horizontal scroll on very narrow screens
                'sm:space-y-0 sm:grid sm:grid-cols-1 sm:gap-6',
                'lg:grid-cols-2 lg:gap-5'
              )}
              style={{
                scrollBehavior: 'smooth',
              }}
            >
              {PREMIUM_LAYOUTS.map((layout, index) => (
                <LayoutCard
                  key={layout.id}
                  layout={layout}
                  isSelected={selectedLayout === layout.id}
                  onSelect={handleLayoutSelect}
                  index={index}
                />
              ))}
            </div>
          </div>

      {/* Footer hint */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className={cn(
          'px-6 py-4',
          'border-t border-gray-200/50 dark:border-gray-700/50',
          'bg-white/30 dark:bg-gray-800/30',
          'backdrop-blur-xl'
        )}
      >
        <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
          <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">
            ←
          </kbd>{' '}
          <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">
            →
          </kbd>{' '}
          to navigate •{' '}
          <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">
            Enter
          </kbd>{' '}
          to select
        </p>
      </motion.div>
    </>
  );

  // If standalone mode (has fixed class), wrap in motion.aside with AnimatePresence
  if (isStandalone) {
    return (
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.aside
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{
              duration: 0.35,
              ease: [0.0, 0.0, 0.2, 1],
            }}
            className={cn(
              'fixed top-16 right-0 bottom-0',
              'w-full sm:w-96 lg:w-[28rem]',
              'bg-gradient-to-br from-white/95 via-white/90 to-white/85',
              'dark:from-gray-900/95 dark:via-gray-900/90 dark:to-gray-900/85',
              'backdrop-blur-2xl',
              'border-l border-white/20 dark:border-gray-700/50',
              'shadow-[-8px_0_32px_rgba(0,0,0,0.08)]',
              'dark:shadow-[-8px_0_32px_rgba(0,0,0,0.3)]',
              'z-30',
              'overflow-hidden',
              'flex flex-col',
              className
            )}
            onKeyDown={handleKeyDown}
          >
            {content}
          </motion.aside>
        )}
      </AnimatePresence>
    );
  }

  // Otherwise, render content directly (for use inside SmartSidebar)
  return isVisible ? <div className="w-full h-full flex flex-col" onKeyDown={handleKeyDown}>{content}</div> : null;
};

export default LayoutSection;
