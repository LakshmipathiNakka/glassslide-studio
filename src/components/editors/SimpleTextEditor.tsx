// Simple text editor without Draft.js dependencies
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SlideElement {
  id: string;
  type: 'text' | 'placeholder';
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  placeholder?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  color?: string;
}

interface SimpleTextEditorProps {
  element: SlideElement;
  isVisible: boolean;
  onSave: (element: SlideElement, content: string) => void;
  onCancel: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export const SimpleTextEditor: React.FC<SimpleTextEditorProps> = ({
  element,
  isVisible,
  onSave,
  onCancel,
  onFocus,
  onBlur
}) => {
  const [content, setContent] = useState(element.text || '');
  const [fontSize, setFontSize] = useState(element.fontSize || 16);
  const [fontWeight, setFontWeight] = useState(element.fontWeight || 'normal');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Focus editor when it becomes visible
  useEffect(() => {
    if (isVisible && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [isVisible]);

  // Handle key events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      // Ctrl+Enter saves the text
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Enter') {
      // Regular Enter creates a new line
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = content.substring(0, start) + '\n' + content.substring(end);
      setContent(newValue);
      
      // Move cursor to the new line
      setTimeout(() => {
        if (textarea) {
          textarea.selectionStart = textarea.selectionEnd = start + 1;
          // Trigger auto-resize
          autoResize(textarea);
        }
      }, 0);
    }
  };

  // Auto-resize textarea based on content
  const autoResize = (textarea: HTMLTextAreaElement) => {
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    // Set the height to scrollHeight to fit content
    textarea.style.height = `${Math.max(textarea.scrollHeight, 60)}px`;
    
    // Update the element's height in the parent component if needed
    if (element.height !== textarea.scrollHeight) {
      const newElement = {
        ...element,
        height: Math.max(textarea.scrollHeight, 60)
      };
      onSave(newElement, content);
    }
  };
  
  // Handle textarea input changes
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    autoResize(e.target);
  };

  // Handle save
  const handleSave = () => {
    // Update element height based on content before saving
    if (inputRef.current) {
      const newElement = {
        ...element,
        height: Math.max(inputRef.current.scrollHeight, 60)
      };
      onSave(newElement, content);
    } else {
      onSave(element, content);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    onCancel();
  };

  // Handle blur
  const handleBlur = () => {
    onBlur?.();
    // Auto-save on blur if content changed
    if (content !== element.text) {
      handleSave();
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="absolute z-50"
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        minHeight: element.height,
      }}
    >
      {/* Editor container */}
      <div className="relative bg-white border-2 border-blue-500 rounded-sm shadow-lg">
        {/* Toolbar */}
        <div className="flex items-center gap-2 p-2 bg-gray-50 border-b border-gray-200">
          {/* Font size */}
          <select
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
            className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200"
          >
            <option value={12}>12px</option>
            <option value={14}>14px</option>
            <option value={16}>16px</option>
            <option value={18}>18px</option>
            <option value={20}>20px</option>
            <option value={24}>24px</option>
            <option value={28}>28px</option>
            <option value={32}>32px</option>
            <option value={36}>36px</option>
            <option value={44}>44px</option>
            <option value={48}>48px</option>
          </select>
          
          {/* Font weight */}
          <select
            value={fontWeight}
            onChange={(e) => setFontWeight(e.target.value)}
            className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200"
          >
            <option value="normal">Normal</option>
            <option value="bold">Bold</option>
          </select>
          
          {/* Text alignment */}
          <div className="flex ml-auto gap-1">
            <button
              type="button"
              onClick={() => setTextAlign('left')}
              className={`px-2 py-1 text-sm rounded hover:bg-gray-200 ${
                textAlign === 'left' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
              }`}
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => setTextAlign('center')}
              className={`px-2 py-1 text-sm rounded hover:bg-gray-200 ${
                textAlign === 'center' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
              }`}
            >
              ↔
            </button>
            <button
              type="button"
              onClick={() => setTextAlign('right')}
              className={`px-2 py-1 text-sm rounded hover:bg-gray-200 ${
                textAlign === 'right' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
              }`}
            >
              →
            </button>
          </div>
        </div>
        
        {/* Editor */}
        <div className="p-3 min-h-[60px]">
          <textarea
            ref={inputRef}
            value={content}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onFocus={onFocus}
            placeholder={element.placeholder || 'Enter text...'}
            className="w-full resize-none border-none outline-none bg-transparent overflow-hidden"
            style={{
              fontSize: `${fontSize}px`,
              fontFamily: element.fontFamily || 'Segoe UI',
              fontWeight: fontWeight,
              color: element.color || '#000000',
              textAlign: textAlign,
              minHeight: '60px',
              lineHeight: '1.4',
              padding: '4px 6px',
              boxSizing: 'border-box',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
            }}
            rows={1}
          />
        </div>
        
        {/* Footer with save/cancel buttons */}
        <div className="flex items-center justify-between p-2 bg-gray-50 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            Press Enter for new line, Ctrl+Enter to save, Esc to cancel
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-3 py-1 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
