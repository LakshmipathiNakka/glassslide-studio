/**
 * LayoutCard Component
 * Individual layout preview card with miniature slide rendering
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LayoutPreview, PreviewElement } from '@/data/premiumLayouts';

interface LayoutCardProps {
  layout: LayoutPreview;
  isSelected?: boolean;
  onSelect: (layoutId: string) => void;
  index: number;
}

const PreviewElementRenderer: React.FC<{ element: PreviewElement }> = ({ element }) => {
  const baseClasses = cn(
    'absolute transition-all duration-200',
  );

  const style = {
    left: `${element.x}%`,
    top: `${element.y}%`,
    width: `${element.width}%`,
    height: `${element.height}%`,
  };

  switch (element.type) {
    case 'text':
      return (
        <div
          className={cn(
            baseClasses,
            'flex items-center justify-center',
            `text-${element.style?.fontSize || 'xs'}`,
            `font-${element.style?.fontWeight || 'normal'}`,
            `text-${element.style?.textAlign || 'center'}`,
            element.style?.color || 'text-gray-900'
          )}
          style={style}
        >
          <span className="truncate px-1">{element.content}</span>
        </div>
      );

    case 'line':
      return (
        <div
          className={cn(
            baseClasses,
            element.style?.backgroundColor || 'bg-gray-300'
          )}
          style={style}
        />
      );

    case 'box':
      return (
        <div
          className={cn(
            baseClasses,
            element.style?.backgroundColor || 'bg-gray-200',
            element.style?.borderRadius || 'rounded'
          )}
          style={{
            ...style,
            opacity: element.style?.opacity || 1,
          }}
        />
      );

    case 'gradient':
      return (
        <div
          className={cn(
            baseClasses,
            element.style?.gradient || 'bg-gradient-to-br from-gray-100 to-gray-200'
          )}
          style={style}
        />
      );

    default:
      return null;
  }
};

export const LayoutCard: React.FC<LayoutCardProps> = ({
  layout,
  isSelected = false,
  onSelect,
  index,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        ease: [0.0, 0.0, 0.2, 1],
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(layout.id)}
      className={cn(
        'relative group cursor-pointer',
        'rounded-2xl overflow-hidden',
        'transition-all duration-300',
        'bg-white dark:bg-gray-800',
        'border-2',
        isSelected
          ? 'border-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.2)]'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
        'shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]',
        'hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]'
      )}
      role="button"
      aria-label={`Select ${layout.name} layout`}
      aria-pressed={isSelected}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(layout.id);
        }
      }}
    >
      {/* Selection Glow */}
      {isSelected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-blue-500/5 pointer-events-none"
        />
      )}

      {/* Miniature Slide Preview */}
      <div className="relative aspect-[16/10] p-4 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="relative w-full h-full bg-white dark:bg-gray-950 rounded-lg shadow-inner overflow-hidden border border-gray-200 dark:border-gray-700">
          {layout.preview.elements.map((element, idx) => (
            <PreviewElementRenderer key={idx} element={element} />
          ))}
          
          {/* Empty state indicator for blank layout */}
          {layout.preview.elements.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600" />
            </div>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-4 py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              'text-sm font-semibold truncate transition-colors',
              isSelected
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-900 dark:text-white'
            )}>
              {layout.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
              {layout.description}
            </p>
          </div>

          {/* Selection Indicator */}
          <motion.div
            initial={false}
            animate={{
              scale: isSelected ? 1 : 0.8,
              opacity: isSelected ? 1 : 0,
            }}
            transition={{ duration: 0.2 }}
            className={cn(
              'flex-shrink-0 ml-2',
              'w-6 h-6 rounded-full',
              'flex items-center justify-center',
              'bg-blue-500',
              'shadow-lg shadow-blue-500/30'
            )}
          >
            <Check className="w-4 h-4 text-white" strokeWidth={3} />
          </motion.div>
        </div>
      </div>

      {/* Hover Overlay */}
      <div className={cn(
        'absolute inset-0 rounded-2xl pointer-events-none',
        'ring-2 ring-inset ring-transparent',
        'transition-all duration-300',
        'group-hover:ring-blue-500/20'
      )} />
    </motion.div>
  );
};

export default LayoutCard;
