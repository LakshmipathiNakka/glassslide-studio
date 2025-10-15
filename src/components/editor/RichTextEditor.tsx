import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Editor, EditorState, RichUtils, getDefaultKeyBinding, ContentState, convertFromHTML } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  List,
  ListOrdered,
  Type,
  Palette,
  MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// Removed theme import - theme system removed

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right';
  color?: string;
  backgroundColor?: string;
  width?: number;
  height?: number;
  className?: string;
  autoFocus?: boolean;
}

// Custom style map for Draft.js
const styleMap = {
  'HIGHLIGHT': {
    backgroundColor: '#ffeb3b',
    padding: '2px 4px',
    borderRadius: '3px'
  },
  'CODE': {
    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
    backgroundColor: '#f5f5f5',
    padding: '2px 4px',
    borderRadius: '3px',
    fontSize: '0.9em'
  }
};

// Block style map
const blockStyleMap = {
  'header-one': {
    fontSize: '2em',
    fontWeight: 'bold',
    marginBottom: '0.5em'
  },
  'header-two': {
    fontSize: '1.5em',
    fontWeight: 'bold',
    marginBottom: '0.4em'
  },
  'header-three': {
    fontSize: '1.25em',
    fontWeight: 'bold',
    marginBottom: '0.3em'
  },
  'blockquote': {
    borderLeft: '4px solid #ddd',
    paddingLeft: '16px',
    marginLeft: '0',
    fontStyle: 'italic',
    color: '#666'
  },
  'code-block': {
    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
    backgroundColor: '#f5f5f5',
    padding: '12px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    margin: '8px 0'
  }
};

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  onBlur,
  placeholder = 'Click to add text',
  fontSize = 16,
  fontFamily = 'Segoe UI',
  fontWeight = 'normal',
  fontStyle = 'normal',
  textAlign = 'left',
  color = '#000000',
  backgroundColor = 'transparent',
  width = 200,
  height = 100,
  className = '',
  autoFocus = false
}) => {
  const [editorState, setEditorState] = useState<EditorState>(() => {
    if (value) {
      const contentState = convertFromHTML(value);
      return EditorState.createWithContent(contentState);
    }
    return EditorState.createEmpty();
  });
  
  const [showToolbar, setShowToolbar] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const editorRef = useRef<Editor>(null);
  // Removed theme styles - theme system removed

  // Update editor state when value prop changes
  useEffect(() => {
    if (value) {
      const contentState = convertFromHTML(value);
      const newEditorState = EditorState.createWithContent(contentState);
      setEditorState(newEditorState);
    }
  }, [value]);

  // Handle editor state changes
  const handleEditorChange = useCallback((newEditorState: EditorState) => {
    setEditorState(newEditorState);
    
    // Convert to HTML and call onChange
    const contentState = newEditorState.getCurrentContent();
    const html = stateToHTML(contentState);
    onChange(html);
  }, [onChange]);

  // Handle focus
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setShowToolbar(true);
  }, []);

  // Handle blur
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    // Delay hiding toolbar to allow clicking on toolbar buttons
    setTimeout(() => {
      setShowToolbar(false);
    }, 200);
    onBlur?.();
  }, [onBlur]);

  // Handle key commands
  const handleKeyCommand = useCallback((command: string, editorState: EditorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      handleEditorChange(newState);
      return 'handled';
    }
    return 'not-handled';
  }, [handleEditorChange]);

  // Handle key binding
  const handleKeyBinding = useCallback((e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          return 'bold';
        case 'i':
          return 'italic';
        case 'u':
          return 'underline';
        default:
          return getDefaultKeyBinding(e);
      }
    }
    return getDefaultKeyBinding(e);
  }, []);

  // Toggle inline style
  const toggleInlineStyle = useCallback((style: string) => {
    const newState = RichUtils.toggleInlineStyle(editorState, style);
    handleEditorChange(newState);
  }, [editorState, handleEditorChange]);

  // Toggle block type
  const toggleBlockType = useCallback((blockType: string) => {
    const newState = RichUtils.toggleBlockType(editorState, blockType);
    handleEditorChange(newState);
  }, [editorState, handleEditorChange]);

  // Get current inline styles
  const getCurrentInlineStyles = useCallback(() => {
    const selection = editorState.getSelection();
    return editorState.getCurrentInlineStyle();
  }, [editorState]);

  // Get current block type
  const getCurrentBlockType = useCallback(() => {
    const selection = editorState.getSelection();
    const blockKey = selection.getStartKey();
    const contentState = editorState.getCurrentContent();
    const block = contentState.getBlockForKey(blockKey);
    return block.getType();
  }, [editorState]);

  // Check if style is active
  const isStyleActive = useCallback((style: string) => {
    return getCurrentInlineStyles().has(style);
  }, [getCurrentInlineStyles]);

  // Check if block type is active
  const isBlockTypeActive = useCallback((blockType: string) => {
    return getCurrentBlockType() === blockType;
  }, [getCurrentBlockType]);

  // Editor styles
  const editorStyles = {
    fontSize: `${fontSize}px`,
    fontFamily,
    fontWeight,
    fontStyle,
    textAlign,
    color,
    backgroundColor,
    width: `${width}px`,
    height: `${height}px`,
    padding: '8px',
    border: isFocused ? '2px solid #0078d4' : '1px solid transparent',
    borderRadius: '4px',
    outline: 'none',
    cursor: 'text',
    overflow: 'auto'
  };

  return (
    <div className={`relative ${className}`}>
      {/* Toolbar */}
      <AnimatePresence>
        {showToolbar && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -top-12 left-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex items-center gap-1"
            onMouseDown={(e) => e.preventDefault()} // Prevent editor from losing focus
          >
            {/* Bold */}
            <Button
              variant="ghost"
              size="sm"
              className={`w-8 h-8 p-0 ${isStyleActive('BOLD') ? 'bg-gray-200' : ''}`}
              onClick={() => toggleInlineStyle('BOLD')}
            >
              <Bold className="w-4 h-4" />
            </Button>

            {/* Italic */}
            <Button
              variant="ghost"
              size="sm"
              className={`w-8 h-8 p-0 ${isStyleActive('ITALIC') ? 'bg-gray-200' : ''}`}
              onClick={() => toggleInlineStyle('ITALIC')}
            >
              <Italic className="w-4 h-4" />
            </Button>

            {/* Underline */}
            <Button
              variant="ghost"
              size="sm"
              className={`w-8 h-8 p-0 ${isStyleActive('UNDERLINE') ? 'bg-gray-200' : ''}`}
              onClick={() => toggleInlineStyle('UNDERLINE')}
            >
              <Underline className="w-4 h-4" />
            </Button>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Text Alignment */}
            <Button
              variant="ghost"
              size="sm"
              className={`w-8 h-8 p-0 ${isBlockTypeActive('left') ? 'bg-gray-200' : ''}`}
              onClick={() => toggleBlockType('left')}
            >
              <AlignLeft className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={`w-8 h-8 p-0 ${isBlockTypeActive('center') ? 'bg-gray-200' : ''}`}
              onClick={() => toggleBlockType('center')}
            >
              <AlignCenter className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={`w-8 h-8 p-0 ${isBlockTypeActive('right') ? 'bg-gray-200' : ''}`}
              onClick={() => toggleBlockType('right')}
            >
              <AlignRight className="w-4 h-4" />
            </Button>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Lists */}
            <Button
              variant="ghost"
              size="sm"
              className={`w-8 h-8 p-0 ${isBlockTypeActive('unordered-list-item') ? 'bg-gray-200' : ''}`}
              onClick={() => toggleBlockType('unordered-list-item')}
            >
              <List className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={`w-8 h-8 p-0 ${isBlockTypeActive('ordered-list-item') ? 'bg-gray-200' : ''}`}
              onClick={() => toggleBlockType('ordered-list-item')}
            >
              <ListOrdered className="w-4 h-4" />
            </Button>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Headers */}
            <Button
              variant="ghost"
              size="sm"
              className={`w-8 h-8 p-0 ${isBlockTypeActive('header-one') ? 'bg-gray-200' : ''}`}
              onClick={() => toggleBlockType('header-one')}
            >
              <Type className="w-4 h-4" />
            </Button>

            {/* More options */}
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0"
              onClick={() => {
                // Additional formatting options would go here
                console.log('More options');
              }}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor */}
      <div
        style={editorStyles}
        className="relative"
      >
        <Editor
          ref={editorRef}
          editorState={editorState}
          onChange={handleEditorChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          handleKeyCommand={handleKeyCommand}
          keyBindingFn={handleKeyBinding}
          placeholder={placeholder}
          customStyleMap={styleMap}
          blockStyleFn={(contentBlock) => {
            const blockType = contentBlock.getType();
            return blockStyleMap[blockType as keyof typeof blockStyleMap] ? blockType : '';
          }}
          autoFocus={autoFocus}
        />
      </div>

      {/* Placeholder when empty */}
      {!editorState.getCurrentContent().hasText() && !isFocused && (
        <div
          className="absolute inset-0 pointer-events-none flex items-center"
          style={{
            fontSize: `${fontSize}px`,
            fontFamily,
            color: '#999',
            padding: '8px'
          }}
        >
          {placeholder}
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
