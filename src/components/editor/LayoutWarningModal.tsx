import { X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type AnimationVariant = {
  opacity?: number;
  scale?: number;
  y?: number;
  transition?: {
    duration?: number;
    ease?: string | number[] | ((t: number) => number);
    type?: string;
    stiffness?: number;
    damping?: number;
  };
};

interface LayoutWarningModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  layoutName?: string;
}

export function LayoutWarningModal({ 
  isOpen, 
  onConfirm, 
  onCancel,
  layoutName = 'this layout' 
}: LayoutWarningModalProps) {
  // Animation variants for modal with proper TypeScript types
  const modalVariants: { [key: string]: AnimationVariant } = {
    hidden: { 
      opacity: 0, 
      scale: 0.95,
      y: 20,
      transition: { 
        duration: 0.15, 
        ease: [0.4, 0, 0.2, 1] as any // Type assertion for ease array
      } 
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: { 
        type: 'spring' as const,
        damping: 20,
        stiffness: 300
      }
    }
  };

  // Animation variants for overlay
  const overlayVariants: { [key: string]: AnimationVariant } = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.2 }
    }
  };

  // Animation variants for button hover with proper type
  const buttonHover = {
    scale: 1.03,
    transition: { 
      type: 'spring' as const, 
      stiffness: 400, 
      damping: 10 
    }
  } as const;

  const buttonTap = {
    scale: 0.98
  } as const;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Semi-transparent overlay with blur */}
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={overlayVariants}
            onClick={onCancel}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className={cn(
                "w-full max-w-md rounded-xl bg-white/90 backdrop-blur-lg",
                "shadow-2xl shadow-black/20 border border-white/20",
                "overflow-hidden"
              )}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={modalVariants}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-amber-100/80 text-amber-600">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Apply {layoutName}?
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      This will replace the current slide content.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="p-4 bg-gray-50/50 flex justify-end gap-3">
                <motion.button
                  whileHover={buttonHover}
                  whileTap={buttonTap}
                  onClick={onCancel}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg",
                    "text-gray-700 hover:bg-gray-200/70 active:bg-gray-200",
                    "transition-colors duration-150"
                  )}
                >
                  Cancel
                </motion.button>
                
                <motion.button
                  whileHover={buttonHover}
                  whileTap={buttonTap}
                  onClick={onConfirm}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg",
                    "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700",
                    "shadow-sm shadow-blue-500/20",
                    "transition-all duration-150"
                  )}
                >
                  Apply
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
