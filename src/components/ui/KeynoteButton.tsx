import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { pressable } from './motion';

interface KeynoteButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const base = 'inline-flex items-center justify-center select-none focus:outline-none transition-colors duration-200';
const sizes: Record<NonNullable<KeynoteButtonProps['size']>, string> = {
  sm: 'h-8 px-3 text-sm rounded-full',
  md: 'h-10 px-4 text-sm rounded-xl',
  lg: 'h-12 px-5 text-base rounded-xl',
};

const variants: Record<NonNullable<KeynoteButtonProps['variant']>, string> = {
  primary:
    'text-white shadow-[0_6px_16px_rgba(0,122,255,0.35)] bg-[linear-gradient(180deg,#007AFF_0%,#005DDD_100%)] hover:brightness-105 focus:ring-2 focus:ring-blue-400/40',
  secondary:
    'text-gray-800 dark:text-gray-100 bg-white/20 dark:bg-white/10 border border-white/10 backdrop-blur-md hover:bg-white/30 focus:ring-2 focus:ring-blue-400/30',
  ghost:
    'text-gray-800 dark:text-gray-100 hover:bg-black/5 dark:hover:bg-white/10 focus:ring-2 focus:ring-blue-400/30',
  destructive:
    'text-white shadow-[0_6px_16px_rgba(255,69,58,0.35)] bg-[linear-gradient(180deg,#FF453A_0%,#D82E23_100%)] hover:brightness-105 focus:ring-2 focus:ring-red-400/40',
};

export const KeynoteButton = React.forwardRef<HTMLButtonElement, KeynoteButtonProps>(
  ({ variant = 'secondary', size = 'md', className, fullWidth, children, ...rest }, ref) => {
    return (
      <motion.button
        ref={ref}
        className={clsx(base, sizes[size], variants[variant], fullWidth && 'w-full', className)}
        variants={pressable}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        {...rest}
      >
        {children}
      </motion.button>
    );
  }
);
KeynoteButton.displayName = 'KeynoteButton';

export default KeynoteButton;
