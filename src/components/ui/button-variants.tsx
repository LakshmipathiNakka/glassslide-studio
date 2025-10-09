import { Button } from "./button";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "hero" | "glass" | "outline-glass";
}

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant = "hero", children, ...props }, ref) => {
    const variants = {
      hero: "bg-primary text-primary-foreground hover:bg-primary/90 hover-glow font-medium px-8 py-6 text-base",
      glass: "glass-toolbar hover-glow border-glass-border font-medium px-6 py-3",
      "outline-glass": "border-2 border-primary/20 bg-background/50 backdrop-blur-sm hover:border-accent hover:bg-accent/5 hover-glow font-medium px-6 py-3",
    };

    return (
      <Button
        ref={ref}
        className={cn(
          "rounded-lg transition-all duration-300",
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

GlassButton.displayName = "GlassButton";
