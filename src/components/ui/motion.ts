import { Variants } from 'framer-motion';

// Shared motion variants to ensure consistent timing and curves
export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.18, ease: 'easeInOut' } },
  exit: { opacity: 0, transition: { duration: 0.15, ease: 'easeOut' } },
};

export const modalPanel: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.22, ease: [0.25, 0.1, 0.25, 1] },
  },
  exit: { opacity: 0, scale: 0.98, y: 6, transition: { duration: 0.18, ease: 'easeOut' } },
};

export const pressable: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.02, transition: { duration: 0.12 } },
  tap: { scale: 0.97, transition: { duration: 0.08 } },
};
