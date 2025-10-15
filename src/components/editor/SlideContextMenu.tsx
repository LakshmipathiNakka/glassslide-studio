import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Copy,
  Trash2,
  Palette,
  Image,
  Type,
  FileText
} from 'lucide-react';
import { SlideContextMenuProps, SlideAction } from '@/types/slide-thumbnails';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';


const SlideContextMenu: React.FC<SlideContextMenuProps> = ({
  slide,
  index,
  position,
  totalSlides,
  onClose,
  onAction
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleAction = (action: SlideAction) => {
    onAction(action, slide, index);
    onClose();
  };

  const menuItems = [
    {
      icon: Plus,
      label: 'Add New Slide',
      action: 'add-new' as SlideAction,
      description: 'Insert a new slide below this one'
    },
    {
      icon: Copy,
      label: 'Duplicate Slide',
      action: 'duplicate' as SlideAction,
      description: 'Create a copy of this slide'
    },
    {
      icon: Trash2,
      label: 'Delete Slide',
      action: 'delete' as SlideAction,
      description: totalSlides <= 1 ? 'Cannot delete the last slide' : 'Remove this slide',
      destructive: true,
      disabled: totalSlides <= 1
    },
    { separator: true },
    {
      icon: Palette,
      label: 'Change Background',
      action: 'change-background' as SlideAction,
      description: 'Update slide background color'
    },
    {
      icon: Image,
      label: 'Add Cover Image',
      action: 'add-cover' as SlideAction,
      description: 'Set thumbnail cover image'
    },
    { separator: true },
    {
      icon: Type,
      label: 'Rename Slide',
      action: 'rename' as SlideAction,
      description: `"${slide.title || `Slide ${index + 1}`}"`
    },
    {
      icon: FileText,
      label: 'Add Notes',
      action: 'add-notes' as SlideAction,
      description: 'Add speaker notes'
    }
  ];

  return createPortal(
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="context-menu-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99998] bg-black/5"
        onClick={onClose}
      />
      
      {/* Context Menu */}
      <motion.div
        key="context-menu-content"
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.9, y: -20, rotateX: -15 }}
        animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20, rotateX: -15 }}
        transition={{ 
          duration: 0.3, 
          ease: [0.16, 1, 0.3, 1],
          type: "spring",
          stiffness: 300,
          damping: 30
        }}
        className="fixed z-[99999] w-72 max-w-80 bg-white/95 border border-gray-200/50 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden"
        style={{
          left: Math.min(position.x, window.innerWidth - 320),
          top: Math.min(position.y, window.innerHeight - 400),
          maxWidth: 'calc(100vw - 1rem)',
          maxHeight: 'calc(100vh - 1rem)',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
        }}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200/50 flex-shrink-0 bg-gradient-to-r from-gray-50/50 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
              <span className="text-white text-sm font-semibold">
                {index + 1}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 text-sm truncate">
                {slide.title || `Slide ${index + 1}`}
              </h3>
              <p className="text-xs text-gray-600">
                {slide.elements.length} elements • {slide.category || 'Custom'}
              </p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-2 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {menuItems.map((item, itemIndex) => {
            if (item.separator) {
              return (
                <Separator key={`separator-${itemIndex}`} className="my-2 bg-gray-200" />
              );
            }

            const Icon = item.icon;
            return (
              <motion.div
                key={item.action || `menu-item-${itemIndex}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.1 }}
              >
                <Button
                  variant="ghost"
                  disabled={item.disabled}
                  className={`w-full justify-start gap-3 px-4 py-3 h-auto rounded-none transition-all duration-200 group ${
                    item.disabled 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => !item.disabled && handleAction(item.action)}
                >
                  <Icon 
                    className={`w-4 h-4 transition-colors duration-200 ${
                      item.disabled
                        ? 'text-gray-400'
                        : item.destructive 
                          ? 'text-red-500 group-hover:text-red-600' 
                          : 'text-gray-600 group-hover:text-gray-900'
                    }`} 
                  />
                  <div className="flex-1 text-left min-w-0">
                    <div className={`text-sm font-medium truncate transition-colors duration-200 ${
                      item.disabled
                        ? 'text-gray-400'
                        : item.destructive 
                          ? 'text-red-600 group-hover:text-red-700' 
                          : 'text-gray-900 group-hover:text-gray-900'
                    }`}>
                      {item.label}
                    </div>
                    <div className={`text-xs truncate transition-colors duration-200 ${
                      item.disabled
                        ? 'text-gray-400'
                        : 'text-gray-500 group-hover:text-gray-600'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                </Button>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default SlideContextMenu;
