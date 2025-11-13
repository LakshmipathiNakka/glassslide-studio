import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface TableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (rows: number, cols: number) => void;
  maxSize?: number; // max grid preview size
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const TableModal: React.FC<TableModalProps> = ({ isOpen, onClose, onConfirm, maxSize = 10 }) => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [hoverR, setHoverR] = useState<number | null>(null);
  const [hoverC, setHoverC] = useState<number | null>(null);

  // Creative descriptions with color-coded highlights
  const headerDescription = (
    <span>
      Organize your content with <span className="text-blue-600 dark:text-blue-400">precision and clarity</span> using tables
    </span>
  );
  
  const footerDescription = (
    <span>
      Perfect for <span className="text-emerald-600 dark:text-emerald-400 font-medium">data comparison</span> and <span className="text-amber-600 dark:text-amber-400 font-medium">structured layouts</span>.
      Hover to preview, click to confirm.
    </span>
  );

  const preview = useMemo(() => {
    const r = clamp(hoverR ?? rows, 1, maxSize);
    const c = clamp(hoverC ?? cols, 1, maxSize);
    return { r, c };
  }, [rows, cols, hoverR, hoverC, maxSize]);

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99998] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/30 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-[99999] w-full max-w-[520px] rounded-2xl border border-white/20 bg-white/70 dark:bg-gray-800/50 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex flex-col mb-5 gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight w-full text-center">
                    Insert Table
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100/60 dark:hover:bg-gray-700/40 transition-all duration-200 ease-out hover:scale-105 active:scale-95 flex-shrink-0"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm font-normal mt-1">
                  {headerDescription}
                </p>
              </div>
            </div>

            {/* Grid picker */}
            <div className="flex flex-col lg:flex-row gap-5">
              <div className="flex-1">
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">Quick picker</div>
                <div
                  className="grid gap-1 p-2 rounded-xl border border-gray-200/60 bg-white/60 dark:bg-gray-700/40"
                  style={{ gridTemplateColumns: `repeat(${maxSize}, 20px)` }}
                >
                  {Array.from({ length: maxSize }).map((_, r) => (
                    Array.from({ length: maxSize }).map((__, c) => {
                      const active = r < preview.r && c < preview.c;
                      return (
                        <div
                          key={`${r}-${c}`}
                          onMouseEnter={() => { setHoverR(r + 1); setHoverC(c + 1); }}
                          onMouseLeave={() => { setHoverR(null); setHoverC(null); }}
                          onClick={() => { setRows(r + 1); setCols(c + 1); }}
                          className={`h-5 w-5 rounded-sm border ${active ? 'bg-blue-500/20 border-blue-500/60' : 'bg-gray-100/60 border-gray-300/60'} hover:bg-blue-500/30`}
                        />
                      );
                    })
                  ))}
                </div>
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">{preview.r} × {preview.c}</div>
              </div>

              {/* Inputs */}
              <div className="w-full lg:w-48 mt-4 lg:mt-0">
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">Custom size</div>
                <div className="flex items-center gap-3">
                  <label className="text-xs w-10">Rows</label>
                  <input
                    type="number"
                    min={1}
                    max={maxSize}
                    value={rows}
                    onChange={(e) => setRows(clamp(parseInt(e.target.value || '1', 10), 1, maxSize))}
                    className="w-20 h-8 px-2 border rounded"
                  />
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <label className="text-xs w-10">Cols</label>
                  <input
                    type="number"
                    min={1}
                    max={maxSize}
                    value={cols}
                    onChange={(e) => setCols(clamp(parseInt(e.target.value || '1', 10), 1, maxSize))}
                    className="w-20 h-8 px-2 border rounded"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-gray-200/40">
              <p className="text-center text-sm text-gray-600 dark:text-gray-300 mb-4">
                {footerDescription}
              </p>
            </div>
            
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="h-9 px-4 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => onConfirm(preview.r, preview.c)}
                className="h-9 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm shadow"
              >
                Insert Table
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default TableModal;
