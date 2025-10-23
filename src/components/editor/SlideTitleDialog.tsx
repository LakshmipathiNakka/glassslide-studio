import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

interface SlideTitleDialogProps {
  isOpen: boolean;
  currentTitle: string;
  onClose: () => void;
  onConfirm: (newTitle: string) => void;
}

const SlideTitleDialog: React.FC<SlideTitleDialogProps> = ({
  isOpen,
  currentTitle,
  onClose,
  onConfirm
}) => {
  const [title, setTitle] = useState(currentTitle);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(currentTitle);
      // Focus input after animation
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [isOpen, currentTitle]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleConfirm = () => {
    if (title.trim()) {
      onConfirm(title.trim());
    }
  };

  const handleCancel = () => {
    setTitle(currentTitle);
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
            onClick={handleCancel}
          />

          {/* Apple Keynote Dialog */}
          <motion.div
            key="dialog"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-[99999] w-full max-w-[320px] rounded-2xl border border-white/20 bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] p-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Apple Keynote Title */}
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Rename Slide
            </h2>

            {/* Apple Keynote Input */}
            <input
              ref={inputRef}
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full rounded-xl border border-white/30 bg-white/60 dark:bg-gray-700/40 px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400"
              placeholder="Enter slide title"
              maxLength={50}
            />

            {/* Character Counter */}
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
              {title.length}/50
            </div>

            {/* Apple Keynote Buttons */}
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-1.5 rounded-lg bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100/60 dark:hover:bg-gray-700/40 transition-all duration-200 ease-out hover:scale-105 active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!title.trim()}
                className="px-4 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white shadow-sm transition-all duration-200 ease-out active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default SlideTitleDialog;
