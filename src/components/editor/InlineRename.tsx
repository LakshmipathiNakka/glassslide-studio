import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface InlineRenameProps {
  initialName: string;
  onSave: (newName: string) => void;
  onCancel: () => void;
  position: { x: number; y: number; width: number };
}

export const InlineRename: React.FC<InlineRenameProps> = ({
  initialName,
  onSave,
  onCancel,
  position,
}) => {
  const [name, setName] = useState(initialName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        onCancel();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      } else if (e.key === 'Enter') {
        onSave(name);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [name, onSave, onCancel]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -5, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -5, scale: 0.98 }}
      transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
      className="absolute z-[1000] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${Math.max(200, position.width + 40)}px`,
      }}
    >
      <div className="p-2">
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSave(name);
          }}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        />
      </div>
    </motion.div>
  );
};
