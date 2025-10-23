import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X, Square, Circle, Triangle, Star, ArrowRight, ArrowUpDown, Diamond, Pentagon, Hexagon, Cloud, Heart, Zap, Minus, Type } from 'lucide-react';

export type ShapeType = 
  | 'rectangle' 
  | 'rounded-rectangle' 
  | 'circle' 
  | 'triangle' 
  | 'star' 
  | 'arrow-right' 
  | 'arrow-double' 
  | 'diamond' 
  | 'pentagon' 
  | 'hexagon' 
  | 'cloud' 
  | 'heart' 
  | 'lightning' 
  | 'line' 
  | 'text-box';

interface ShapeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectShape: (shapeType: ShapeType) => void;
}

const shapeDefinitions: Array<{
  type: ShapeType;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  svg: string;
}> = [
  {
    type: 'rectangle',
    name: 'Rectangle',
    icon: Square,
    svg: '<rect x="2" y="2" width="20" height="16" rx="0" fill="none" stroke="currentColor" strokeWidth="2"/>'
  },
  {
    type: 'rounded-rectangle',
    name: 'Rounded Rectangle',
    icon: Square,
    svg: '<rect x="2" y="2" width="20" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="2"/>'
  },
  {
    type: 'circle',
    name: 'Circle',
    icon: Circle,
    svg: '<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>'
  },
  {
    type: 'triangle',
    name: 'Triangle',
    icon: Triangle,
    svg: '<polygon points="12,2 22,20 2,20" fill="none" stroke="currentColor" strokeWidth="2"/>'
  },
  {
    type: 'star',
    name: 'Star',
    icon: Star,
    svg: '<polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="none" stroke="currentColor" strokeWidth="2"/>'
  },
  {
    type: 'arrow-right',
    name: 'Arrow Right',
    icon: ArrowRight,
    svg: '<path d="M5 12h14m-7-7l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>'
  },
  {
    type: 'arrow-double',
    name: 'Double Arrow',
    icon: ArrowUpDown,
    svg: '<path d="M8 3v18m8-18v18M3 8h18M3 16h18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>'
  },
  {
    type: 'diamond',
    name: 'Diamond',
    icon: Diamond,
    svg: '<path d="M6 3h12l4 6-10 13L2 9l4-6z" fill="none" stroke="currentColor" strokeWidth="2"/>'
  },
  {
    type: 'pentagon',
    name: 'Pentagon',
    icon: Pentagon,
    svg: '<polygon points="12,2 19,8 16,18 8,18 5,8" fill="none" stroke="currentColor" strokeWidth="2"/>'
  },
  {
    type: 'hexagon',
    name: 'Hexagon',
    icon: Hexagon,
    svg: '<polygon points="7,3 17,3 21,12 17,21 7,21 3,12" fill="none" stroke="currentColor" strokeWidth="2"/>'
  },
  {
    type: 'cloud',
    name: 'Cloud',
    icon: Cloud,
    svg: '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" fill="none" stroke="currentColor" strokeWidth="2"/>'
  },
  {
    type: 'heart',
    name: 'Heart',
    icon: Heart,
    svg: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="none" stroke="currentColor" strokeWidth="2"/>'
  },
  {
    type: 'lightning',
    name: 'Lightning',
    icon: Zap,
    svg: '<polygon points="13,2 3,14 12,14 11,22 21,10 12,10" fill="none" stroke="currentColor" strokeWidth="2"/>'
  },
  {
    type: 'line',
    name: 'Line',
    icon: Minus,
    svg: '<line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>'
  },
  {
    type: 'text-box',
    name: 'Text Box',
    icon: Type,
    svg: '<rect x="2" y="2" width="20" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/><text x="12" y="10" textAnchor="middle" fontSize="8" fill="currentColor">T</text>'
  }
];

const ShapeModal: React.FC<ShapeModalProps> = ({ isOpen, onClose, onSelectShape }) => {
  const [hoveredShape, setHoveredShape] = useState<ShapeType | null>(null);

  const handleShapeSelect = (shapeType: ShapeType) => {
    onSelectShape(shapeType);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99998] flex items-center justify-center p-4">
          {/* Apple Keynote Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/30 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Apple Keynote Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-[99999] w-full max-w-[480px] rounded-2xl border border-white/20 bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Insert Shape
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100/60 dark:hover:bg-gray-700/40 transition-all duration-200 ease-out hover:scale-105 active:scale-95"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Shape Grid */}
            <div className="grid grid-cols-5 gap-3">
              {shapeDefinitions.map((shape) => (
                <motion.button
                  key={shape.type}
                  onClick={() => handleShapeSelect(shape.type)}
                  onMouseEnter={() => setHoveredShape(shape.type)}
                  onMouseLeave={() => setHoveredShape(null)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`group relative p-3 rounded-xl border border-gray-200/40 bg-white/40 dark:bg-gray-700/40 hover:bg-white/80 dark:hover:bg-gray-600/60 transition-all duration-200 ease-out ${
                    hoveredShape === shape.type 
                      ? 'ring-2 ring-blue-500/50 shadow-lg shadow-blue-500/20' 
                      : 'hover:shadow-md'
                  }`}
                >
                  {/* Shape Preview */}
                  <div className="flex items-center justify-center mb-2">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      className="text-gray-700 dark:text-gray-300"
                    >
                      <g dangerouslySetInnerHTML={{ __html: shape.svg }} />
                    </svg>
                  </div>
                  
                  {/* Shape Name */}
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">
                    {shape.name}
                  </div>

                  {/* Hover Glow Effect */}
                  <div className={`absolute inset-0 rounded-xl transition-opacity duration-200 ${
                    hoveredShape === shape.type 
                      ? 'bg-blue-500/10 opacity-100' 
                      : 'opacity-0'
                  }`} />
                </motion.button>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-gray-200/40">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Click a shape to add it to your slide
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ShapeModal;
