import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Copy,
  Trash2,
  Palette,
  Type,
  Edit3
} from 'lucide-react';
import { SlideContextMenuProps, SlideAction } from '@/types/slide-thumbnails';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

// Apple Keynote-style Tooltip Component
const KeynoteTooltip: React.FC<{
  text: string;
  visible: boolean;
  position: { x: number; y: number };
  dark: boolean;
}> = ({ text, visible, position, dark }) => {
  if (!visible) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.95 }}
      transition={{ 
        type: 'spring', 
        stiffness: 300, 
        damping: 25,
        mass: 0.8
      }}
      className={`pointer-events-none fixed px-3 py-2 rounded-lg text-xs font-medium backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] ring-1 ${
        dark 
          ? 'text-white bg-gradient-to-br from-gray-800/80 to-gray-900/60 ring-white/10' 
          : 'text-gray-800 bg-gradient-to-br from-white/80 to-gray-100/60 ring-gray-300/20'
      }`}
      style={{
        left: position.x,
        top: position.y - 45,
        transform: 'translateX(-50%)',
        zIndex: 999999,
      }}
    >
      {text}
    </motion.div>
  );
};

// Ripple Menu Item Component
const RippleMenuItem = ({
  icon,
  label,
  description,
  onClick,
  danger = false,
  disabled = false,
  dark = false,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
  dark?: boolean;
}) => {
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isPressed, setIsPressed] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top });
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setShowTooltip(true), 500);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowTooltip(false);
  };

  return (
    <>
      <motion.button
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          
          if (disabled) return;
          setIsPressed(true);
          const rect = e.currentTarget.getBoundingClientRect();
          setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          setTimeout(() => setRipple(null), 400);
          
          onClick();
        }}
        onMouseUp={() => setIsPressed(false)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={(e) => {
          setIsPressed(false);
          handleMouseLeave();
        }}
        disabled={disabled}
        whileHover={!disabled ? { 
          scale: 1.03,
          backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'
        } : {}}
        whileTap={!disabled ? { 
          scale: 0.98,
          y: 1
        } : {}}
        animate={isPressed ? { y: 1 } : { y: 0 }}
        transition={{ 
          type: 'spring', 
          stiffness: 220, 
          damping: 20,
          mass: 0.8
        }}
        className={`relative overflow-hidden flex items-center gap-3 px-3 py-2.5 rounded-lg text-left select-none w-full transition-colors duration-150 ${
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : danger
            ? 'text-red-500 hover:text-red-600'
            : dark
            ? 'text-gray-100 hover:text-white'
            : 'text-gray-800 hover:text-gray-900'
        }`}
      >
        {ripple && (
          <motion.span
            className={`absolute w-24 h-24 rounded-full transform scale-0 ${
              dark 
                ? 'bg-gradient-radial from-cyan-400/40 to-transparent' 
                : 'bg-gradient-radial from-white/50 to-transparent'
            }`}
            style={{ 
              left: ripple.x - 48, 
              top: ripple.y - 48,
              background: dark 
                ? 'radial-gradient(circle, rgba(34, 211, 238, 0.4) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(255, 255, 255, 0.5) 0%, transparent 70%)'
            }}
            animate={{ 
              scale: [0, 1.2, 0], 
              opacity: [0, 0.6, 0] 
            }}
            transition={{ 
              duration: 0.4, 
              ease: 'easeOut' 
            }}
          />
        )}
        <div
          className={`p-1.5 rounded-lg transition-all duration-200 ${
            disabled
              ? 'bg-gray-100/30 dark:bg-gray-600/30'
              : danger
              ? 'bg-red-100/40 dark:bg-red-800/30'
              : dark
              ? 'bg-white/10 hover:bg-white/20'
              : 'bg-gray-100/40 hover:bg-gray-200/50'
          }`}
        >
          <div className="w-4 h-4 flex items-center justify-center">
            {icon}
          </div>
        </div>
        <span className="text-sm font-medium tracking-wide">{label}</span>
      </motion.button>
      
      <AnimatePresence>
        {showTooltip && (
          <KeynoteTooltip
            text={description}
            visible={showTooltip}
            position={tooltipPosition}
            dark={dark}
          />
        )}
      </AnimatePresence>
    </>
  );
};

const SlideContextMenu: React.FC<SlideContextMenuProps> = ({
  slide,
  index,
  position,
  totalSlides,
  onClose,
  onAction
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [dark, setDark] = useState(false);

  // Detect dark mode dynamically
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    setDark(media.matches);
    const listener = (e: MediaQueryListEvent) => setDark(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  // Close outside or ESC
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Add a small delay to prevent conflicts with menu item clicks
      setTimeout(() => {
        if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
      }, 50);
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleAction = useCallback((action: SlideAction) => {
    onAction(action, slide, index);
    // Add a small delay to ensure the action is processed before closing
    setTimeout(() => {
      onClose();
    }, 100);
  }, [onAction, slide, index, onClose]);

  const menuItems = [
    {
      icon: <Plus size={16} strokeWidth={1.5} />,
      label: 'Add New Slide',
      action: 'add-new' as SlideAction,
      description: 'Insert a new blank slide below this one'
    },
    {
      icon: <Copy size={16} strokeWidth={1.5} />,
      label: 'Duplicate Slide',
      action: 'duplicate' as SlideAction,
      description: 'Create an exact copy with all content'
    },
    {
      icon: <Trash2 size={16} strokeWidth={1.5} />,
      label: 'Delete Slide',
      action: 'delete' as SlideAction,
      description: totalSlides <= 1 ? 'Cannot delete the last slide' : 'Remove this slide permanently',
      destructive: true,
      disabled: totalSlides <= 1
    },
    { separator: true },
    {
      icon: <Palette size={16} strokeWidth={1.5} />,
      label: 'Change Background',
      action: 'change-background' as SlideAction,
      description: 'Customize slide background color and style'
    },
    { separator: true },
    {
      icon: <Edit3 size={16} strokeWidth={1.5} />,
      label: 'Rename Slide',
      action: 'rename' as SlideAction,
      description: `Rename "${slide.title || `Slide ${index + 1}`}"`
    }
  ];

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99998] bg-transparent"
        onClick={onClose}
      />
      <motion.div
        key="menu"
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.95, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -8 }}
        transition={{ 
          type: 'spring', 
          stiffness: 300, 
          damping: 25,
          mass: 0.8
        }}
        className={`fixed z-[99999] w-56 rounded-2xl overflow-hidden border backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] ring-1 ${
          dark 
            ? 'bg-gradient-to-br from-gray-800/60 to-gray-900/30 border-gray-700/40 ring-white/10' 
            : 'bg-gradient-to-br from-white/60 to-gray-200/30 border-white/40 ring-gray-300/20'
        }`}
        style={{
          left: Math.min(position.x, window.innerWidth - 240),
          top: Math.min(position.y, window.innerHeight - 320),
          backdropFilter: 'blur(25px)',
          WebkitBackdropFilter: 'blur(25px)',
        }}
      >
            <div className="py-1">
              {menuItems.map((item, i) => {
                return item.separator ? (
                  <div
                    key={`sep-${i}`}
                    className={`my-1 h-[0.5px] ${
                      dark 
                        ? 'bg-gradient-to-r from-transparent via-gray-600/30 to-transparent' 
                        : 'bg-gradient-to-r from-transparent via-gray-300/20 to-transparent'
                    }`}
                  />
                ) : (
                  <RippleMenuItem
                    key={item.label}
                    icon={item.icon}
                    label={item.label}
                    description={item.description}
                    onClick={() => {
                      if (!item.disabled) {
                        handleAction(item.action as SlideAction);
                      }
                    }}
                    danger={item.destructive}
                    disabled={item.disabled}
                    dark={dark}
                  />
                );
              })}
            </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default SlideContextMenu;
