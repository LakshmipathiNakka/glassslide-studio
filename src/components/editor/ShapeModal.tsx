import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X, Square, Circle, Triangle, Star, Diamond, Pentagon, Hexagon, Octagon, ChevronRight } from 'lucide-react';

export type ShapeType = 
  | 'rectangle' 
  | 'rounded-rectangle' 
  | 'circle' 
  | 'triangle' 
  | 'star' 
  | 'diamond' 
  | 'pentagon' 
  | 'hexagon'
  | 'octagon'
  | 'parallelogram'
  | 'trapezoid'
  | 'semicircle';

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
    type: 'octagon',
    name: 'Octagon',
    icon: Octagon,
    svg: '<polygon points="7.39 2 16.61 2 22 7.39 22 16.61 16.61 22 7.39 22 2 16.61 2 7.39 7.39 2" fill="none" stroke="currentColor" strokeWidth="2"/>'
  },
  {
    type: 'parallelogram',
    name: 'Parallelogram',
    icon: Square,
    svg: '<polygon points="5,3 19,3 15,21 1,21" fill="none" stroke="currentColor" strokeWidth="2"/>'
  },
  {
    type: 'trapezoid',
    name: 'Trapezoid',
    icon: Square,
    svg: '<polygon points="5,16 19,16 22,8 2,8" fill="none" stroke="currentColor" strokeWidth="2"/>'
  },
  {
    type: 'semicircle',
    name: 'Semicircle',
    icon: Circle,
    svg: '<path d="M12 2a10 10 0 0 0-10 10h20a10 10 0 0 0-10-10z" fill="none" stroke="currentColor" strokeWidth="2"/>'
  },
];

const ShapeModal: React.FC<ShapeModalProps> = ({ isOpen, onClose, onSelectShape }) => {
  const [hoveredShape, setHoveredShape] = useState<ShapeType | null>(null);
  
  // Creative descriptions with color-coded highlights
  const headerDescription = (
    <span>
      Transform your slides with <span className="text-blue-600 dark:text-blue-400">geometric precision</span> and <span className="text-emerald-600 dark:text-emerald-400">creative flair</span>
    </span>
  );
  
  const footerDescription = (
    <span>
      Every great presentation starts with the <span className="text-blue-600 dark:text-blue-400 font-medium">perfect shape</span>. 
      Choose wisely and let your ideas <span className="text-emerald-600 dark:text-emerald-400 font-medium">take form</span>.
    </span>
  );

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
            className="relative z-[99999] w-full max-w-[560px] rounded-2xl border border-white/20 bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                Insert Shape
              </h2>
              <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-6 px-4">
                {footerDescription}
              </p>
              <button
                onClick={onClose}
                className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100/60 dark:hover:bg-gray-700/40 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Shape Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4">
              {shapeDefinitions.map((shape) => (
                <motion.button
                  key={shape.type}
                  onClick={() => handleShapeSelect(shape.type)}
                  onMouseEnter={() => setHoveredShape(shape.type)}
                  onMouseLeave={() => setHoveredShape(null)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`group relative p-3 sm:p-4 rounded-xl border border-gray-200/40 bg-white/40 dark:bg-gray-700/40 hover:bg-white/80 dark:hover:bg-gray-600/60 transition-all duration-200 ease-out flex flex-col items-center h-[100px] w-[90px] sm:h-[120px] sm:w-[100px] ${
                    hoveredShape === shape.type 
                      ? 'ring-2 ring-blue-500/50 shadow-lg shadow-blue-500/20' 
                      : 'hover:shadow-md'
                  }`}
                >
                  {/* Shape Preview */}
                  <div className="flex items-center justify-center mb-2 w-12 h-12 sm:w-14 sm:h-14">
                    <svg
                      width="100%"
                      height="100%"
                      viewBox="0 0 24 24"
                      className="text-gray-700 dark:text-gray-300"
                    >
                      <g dangerouslySetInnerHTML={{ __html: shape.svg }} />
                    </svg>
                  </div>
                  
                  {/* Shape Name */}
                  <div className="w-full px-1 mt-1 overflow-hidden">
                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-none whitespace-nowrap overflow-hidden text-ellipsis">
                      {shape.name}
                    </div>
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
            <div className="mt-8 pt-4 border-t border-gray-200/40">
              <p className="text-gray-700 dark:text-gray-300 mt-2 text-sm font-normal">
                {headerDescription}
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
