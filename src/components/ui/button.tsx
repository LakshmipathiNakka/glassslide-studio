import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        'icon-sm': "h-8 w-8 sm:h-9 sm:w-auto sm:px-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ResponsiveSize = {
  base: 'icon' | 'sm' | 'default' | 'lg' | 'icon-sm';
  sm: 'icon' | 'sm' | 'default' | 'lg' | 'icon-sm';
};

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'>,
    Omit<VariantProps<typeof buttonVariants>, 'size'> {
  asChild?: boolean;
  size?: 'icon' | 'sm' | 'default' | 'lg' | 'icon-sm' | ResponsiveSize;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size: sizeProp, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    // Handle responsive sizes
    let sizeClass = '';
    if (sizeProp && typeof sizeProp === 'object') {
      // For responsive sizes, we'll use the base size and handle responsive classes in the className prop
      sizeClass = buttonVariants({ variant, size: sizeProp.base, className: '' });
    } else {
      sizeClass = buttonVariants({ variant, size: sizeProp, className: '' });
    }
    
    return (
      <Comp 
        className={cn(
          sizeClass,
          className
        )} 
        ref={ref} 
        {...props} 
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
