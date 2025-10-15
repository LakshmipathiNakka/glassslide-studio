// Slide layout selector component
import React from 'react';
import { motion } from 'framer-motion';
// Removed SLIDE_LAYOUTS import - template system removed
import { SlideLayout } from '../../types/canvas';

interface LayoutSelectorProps {
  onLayoutSelect: (layout: SlideLayout) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const LayoutSelector: React.FC<LayoutSelectorProps> = ({
  onLayoutSelect,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Choose a Layout</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Layout Grid */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="flex items-center justify-center h-32 text-gray-500">
            <p>Template system has been removed. Start with a blank slide.</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

interface LayoutCardProps {
  layout: SlideLayout;
  onClick: () => void;
}

const LayoutCard: React.FC<LayoutCardProps> = ({ layout, onClick }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-lg transition-all duration-200 text-left"
    >
      {/* Layout Preview */}
      <div className="aspect-video bg-gray-50 border border-gray-200 rounded mb-3 relative overflow-hidden">
        <LayoutPreview elements={layout.elements} />
      </div>
      
      {/* Layout Info */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">{layout.name}</h3>
        <p className="text-sm text-gray-600">{layout.description}</p>
      </div>
    </motion.button>
  );
};

interface LayoutPreviewProps {
  elements: any[];
}

const LayoutPreview: React.FC<LayoutPreviewProps> = ({ elements }) => {
  return (
    <div className="w-full h-full relative">
      {elements.map((element) => (
        <div
          key={element.id}
          className="absolute border border-gray-300 bg-gray-100"
          style={{
            left: (element.x / 1280) * 100 + '%',
            top: (element.y / 720) * 100 + '%',
            width: (element.width / 1280) * 100 + '%',
            height: (element.height / 720) * 100 + '%',
          }}
        >
          <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
            {element.type === 'placeholder' ? (
              <span className="truncate px-1">{element.placeholder}</span>
            ) : (
              <span className="truncate px-1">{element.type}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
