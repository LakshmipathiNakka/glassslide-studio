import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Copy, Trash2, Palette, Type } from 'lucide-react';
import { Slide, SlideAction } from '@/types/slide-thumbnails';
import { cn } from '@/lib/utils';

interface SlideContextMenuProps {
  slide: Slide;
  index: number;
  position: { x: number; y: number };
  totalSlides: number;
  onClose: () => void;
  onAction: (action: SlideAction, slide: Slide, index: number) => void;
  anchorElement?: HTMLElement | null;
}

const ANIMATION_DURATION = 0.15;
const EASING = [0.4, 0, 0.2, 1];

const MenuItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}> = ({ icon, label, onClick, danger = false, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-colors',
        'focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700/50',
        danger
          ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700/50',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <span className={cn(
        'flex-shrink-0',
        danger ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
      )}>
        {React.cloneElement(icon as React.ReactElement, { className: 'w-4 h-4' })}
      </span>
      <span className="flex-1">{label}</span>
    </button>
  );
};

const SlideContextMenu: React.FC<SlideContextMenuProps> = ({
  slide,
  index,
  position,
  totalSlides,
  onClose,
  onAction,
  anchorElement,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 224, height: 0 });
  const [isVisible, setIsVisible] = useState(false);

  // Calculate menu position
  const menuPosition = useMemo(() => {
    if (!anchorElement) return position;
    
    const rect = anchorElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const menuWidth = 224;
    const menuHeight = 200; // Approximate height
    
    // Default position to the right of the anchor
    let x = rect.right + 8;
    let y = rect.top;
    
    // Adjust for right edge
    if (x + menuWidth > viewportWidth - 16) {
      x = rect.left - menuWidth - 8;
    }
    
    // Adjust for bottom edge
    if (y + menuHeight > viewportHeight - 16) {
      y = viewportHeight - menuHeight - 16;
    }
    
    // Ensure within bounds
    x = Math.max(16, Math.min(x, viewportWidth - menuWidth - 16));
    y = Math.max(16, Math.min(y, viewportHeight - menuHeight - 16));
    
    return { x, y };
  }, [anchorElement, position]);

  // Close on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Small delay to prevent immediate close when menu opens
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      setIsVisible(true);
    }, 10);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Update dimensions after render
  useEffect(() => {
    if (menuRef.current) {
      const { width, height } = menuRef.current.getBoundingClientRect();
      setDimensions({ width, height });
    }
  }, []);

  // Handle action and close menu
  const handleAction = useCallback((action: SlideAction) => {
    onAction(action, slide, index);
    onClose();
  }, [onAction, onClose, slide, index]);

  return createPortal(
    <>
      {/* Backdrop */}
      <AnimatePresence>
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: ANIMATION_DURATION, ease: EASING }}
          className="fixed inset-0 z-[998] bg-black/20 backdrop-blur-sm"
          onClick={onClose}
        />
      </AnimatePresence>

      {/* Menu */}
      <AnimatePresence>
        <motion.div
          ref={menuRef}
          key="menu"
          initial={{ opacity: 0, scale: 0.95, y: -8 }}
          animate={isVisible ? {
            opacity: 1,
            scale: 1,
            y: 0,
            boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.15)',
          } : { opacity: 0, scale: 0.95, y: -8 }}
          exit={{
            opacity: 0,
            scale: 0.98,
            y: 4,
            transition: { duration: ANIMATION_DURATION * 0.8, ease: EASING }
          }}
          transition={{
            duration: ANIMATION_DURATION,
            ease: EASING,
            scale: {
              type: 'spring',
              stiffness: 300,
              damping: 30,
              mass: 0.8
            }
          }}
          className={cn(
            'fixed z-[999] bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl',
            'rounded-xl shadow-2xl border border-white/20 dark:border-gray-700/50',
            'py-1.5 overflow-hidden w-56',
            'transform-gpu' // Better performance for animations
          )}
          style={{
            top: `${menuPosition.y}px`,
            left: `${menuPosition.x}px`,
            transformOrigin: 'top left',
            willChange: 'transform, opacity',
            minWidth: '14rem',
            opacity: 0 // Start hidden to prevent flash
          }}
          onAnimationComplete={() => {
            // Ensure menu is visible after initial animation
            if (!isVisible) {
              setIsVisible(true);
            }
          }}
        >
          <div className="py-1">
            <MenuItem
              icon={<Plus />}
              label="New Slide"
              onClick={() => handleAction('add-new')}
            />
            <MenuItem
              icon={<Copy />}
              label="Duplicate"
              onClick={() => handleAction('duplicate')}
            />
            <div className="my-1 h-px bg-gray-200 dark:bg-gray-700/50" />
            <MenuItem
              icon={<Palette />}
              label="Change Theme"
              onClick={() => handleAction('theme')}
            />
            <MenuItem
              icon={<Type />}
              label="Rename"
              onClick={() => handleAction('rename')}
            />
            <div className="my-1 h-px bg-gray-200 dark:bg-gray-700/50" />
            <MenuItem
              icon={<Trash2 />}
              label="Delete"
              danger
              disabled={totalSlides <= 1}
              onClick={() => handleAction('delete')}
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </>,
    document.body
  );
};

export default SlideContextMenu;
