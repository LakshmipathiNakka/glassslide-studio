import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Sparkles } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AddSlideButtonProps {
  onAddSlide: () => void;
  isHovered?: boolean;
  className?: string;
}

const AddSlideButton: React.FC<AddSlideButtonProps> = ({ 
  onAddSlide, 
  isHovered = false,
  className = ""
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            onClick={onAddSlide}
            className={`
              group relative overflow-hidden
              w-12 h-12 rounded-2xl
              bg-white/10 backdrop-blur-xl
              border border-white/20
              shadow-lg shadow-black/10
              hover:bg-white/20 hover:border-white/30
              hover:shadow-xl hover:shadow-black/20
              active:scale-95
              transition-all duration-300 ease-out
              ${className}
            `}
            whileHover={{ 
              scale: 1.05,
              y: -2,
              boxShadow: "0 20px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.3)"
            }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              duration: 0.3
            }}
          >
            {/* Glassmorphism background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-2xl" />
            
            {/* Animated background glow */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-2xl"
              animate={{
                opacity: isHovered ? [0, 0.6, 0] : 0,
                scale: isHovered ? [1, 1.1, 1] : 1,
              }}
              transition={{
                duration: 1.5,
                repeat: isHovered ? Infinity : 0,
                ease: "easeInOut"
              }}
            />
            
            {/* Plus icon */}
            <motion.div
              className="relative z-10 flex items-center justify-center w-full h-full"
              animate={{
                rotate: isHovered ? [0, 90, 0] : 0,
              }}
              transition={{
                duration: 0.6,
                ease: "easeInOut"
              }}
            >
              <Plus 
                size={20} 
                className="text-white/90 group-hover:text-white transition-colors duration-300" 
              />
            </motion.div>
            
            {/* Sparkle effect on hover */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: isHovered ? 1 : 0,
                scale: isHovered ? [0.8, 1.2, 0.8] : 0.8
              }}
              transition={{
                duration: 0.8,
                ease: "easeInOut"
              }}
            >
              <Sparkles 
                size={16} 
                className="text-yellow-300/80" 
              />
            </motion.div>
            
            {/* Ripple effect */}
            <motion.div
              className="absolute inset-0 rounded-2xl"
              initial={{ scale: 0, opacity: 0.6 }}
              animate={{ 
                scale: isHovered ? [0, 1.5] : 0,
                opacity: isHovered ? [0.6, 0] : 0
              }}
              transition={{
                duration: 0.6,
                ease: "easeOut"
              }}
            >
              <div className="w-full h-full bg-white/30 rounded-2xl" />
            </motion.div>
          </motion.button>
        </TooltipTrigger>
        <TooltipContent 
          side="right" 
          className="bg-black/80 text-white border-white/20 backdrop-blur-sm"
        >
          <p className="text-sm font-medium">Add new slide</p>
          <p className="text-xs text-white/70">⌘ + M</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AddSlideButton;
