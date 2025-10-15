import React from 'react';
import { Button } from './button';
import { useButtonInteractions } from '@/hooks/use-button-interactions';
import { cn } from '@/lib/utils';

interface EnhancedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  ripple?: boolean;
  haptic?: boolean;
  micro?: boolean;
  bounce?: boolean;
  glow?: boolean;
  underline?: boolean;
  gradient?: boolean;
  children: React.ReactNode;
}

const variantClasses = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  outline: 'btn-outline',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    ripple = true,
    haptic = false,
    micro = true,
    bounce = false,
    glow = false,
    underline = false,
    gradient = false,
    className,
    children,
    onClick,
    ...props
  }, ref) => {
    const { handlePress } = useButtonInteractions({
      onPress: onClick,
      ripple,
      haptic,
    });

    const classes = cn(
      // Base button styles
      'relative inline-flex items-center justify-center rounded-md font-medium transition-all duration-300 ease-out transform-gpu focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
      
      // Variant styles
      variantClasses[variant],
      
      // Size styles
      sizeClasses[size],
      
      // Micro-interactions
      micro && 'btn-micro',
      
      // Bounce effect
      bounce && 'btn-bounce',
      
      // Glow effect
      glow && 'btn-glow',
      
      // Underline effect
      underline && 'btn-underline',
      
      // Gradient effect
      gradient && 'btn-gradient',
      
      // Ripple effect
      ripple && 'btn-ripple',
      
      // Custom className
      className
    );

    return (
      <Button
        ref={ref}
        className={classes}
        onClick={handlePress}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

EnhancedButton.displayName = 'EnhancedButton';
