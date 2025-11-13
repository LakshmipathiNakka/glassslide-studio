import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { modalBackdrop, modalPanel } from './motion';

interface KeynoteModalProps {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  widthClassName?: string; // e.g. "sm:max-w-md" | "sm:max-w-lg"
}

// Apple Keynote–inspired modal with glassmorphism and buttery animations
export const KeynoteModal: React.FC<KeynoteModalProps> = ({
  isOpen,
  title,
  onClose,
  footer,
  children,
  widthClassName = 'sm:max-w-xl',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && containerRef.current) {
        // Simple focus trap
        const focusables = containerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Autofocus first focusable
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;
    const focusables = containerRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    (focusables[0] || containerRef.current).focus();
  }, [isOpen]);

  const modal = (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-[1000] overflow-hidden">
          {/* Enhanced blurred backdrop with gradient overlay */}
          <motion.div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            variants={modalBackdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            aria-hidden="true"
          >
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5" />
            {/* Subtle noise texture */}
            <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJ3aGl0ZSI+PC9yZWN0Pgo8cGF0aCBkPSJNMCA0TDEgM0w0IDRMNCAzTDMgNEw0IDRMNCAwTDMgMUw0IDBMMCA0WiIgZmlsbD0icmdiYSgwLDAsMCwwLjA1KSIvPgo8L3N2Zz4=')]" />
          </motion.div>

          {/* Centered panel */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <motion.div
              ref={containerRef}
              role="dialog"
              aria-modal="true"
              aria-label={title}
              tabIndex={-1}
              className={`w-full ${widthClassName}`}
              variants={modalPanel}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="relative overflow-hidden rounded-2xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.25)] bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl">
                <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-white/20 dark:from-white/10 dark:to-white/5" />
                <div className="relative">
                {/* Header */}
                {(title || true) && (
                  <motion.div
                    className="px-5 sm:px-6 py-4 border-b border-white/20 bg-white/10 dark:bg-white/5"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06, duration: 0.18 }}
                  >
                    <h3
                      className="text-[15px] sm:text-[16px] font-semibold tracking-[-0.01em] text-gray-900"
                      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif" }}
                    >
                      {title || ''}
                    </h3>
                  </motion.div>
                )}

                {/* Body */}
                <motion.div
                  className="px-5 sm:px-6 py-5 sm:py-6 text-[13px] text-gray-700 dark:text-gray-200"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.09, duration: 0.2 }}
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif" }}
                >
                  {children}
                </motion.div>

                {/* Footer */}
                {footer && (
                  <motion.div
                    className="px-5 sm:px-6 py-4 border-t border-white/20 bg-white/10 dark:bg-white/5 flex items-center justify-end gap-2"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.18 }}
                  >
                    {footer}
                  </motion.div>
                )}
              </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const portalRoot = typeof window !== 'undefined' ? document.body : null;
  return portalRoot ? createPortal(modal, portalRoot) : null;
};

export default KeynoteModal;
