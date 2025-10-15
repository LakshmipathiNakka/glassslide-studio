import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { Button } from './button';
import { Slide } from '@/types/slide-thumbnails';

interface PreviewModeProps {
  isOpen: boolean;
  onClose: () => void;
  slides: Slide[];
  currentSlide: number;
  onSlideChange: (index: number) => void;
}

export const PreviewMode: React.FC<PreviewModeProps> = ({
  isOpen,
  onClose,
  slides,
  currentSlide,
  onSlideChange
}) => {
  const [isPlaying, setIsPlaying] = React.useState(false);

  const handlePrevious = () => {
    if (currentSlide > 0) {
      onSlideChange(currentSlide - 1);
    }
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      onSlideChange(currentSlide + 1);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Auto-play functionality
  React.useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        if (currentSlide < slides.length - 1) {
          onSlideChange(currentSlide + 1);
        } else {
          setIsPlaying(false);
        }
      }, 3000); // 3 seconds per slide

      return () => clearInterval(interval);
    }
  }, [isPlaying, currentSlide, slides.length, onSlideChange]);

  if (!isOpen) return null;

  const currentSlideData = slides[currentSlide];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] bg-black flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-black/80 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <h2 className="text-white text-lg font-semibold">
              Preview Mode
            </h2>
            <span className="text-white/70 text-sm">
              {currentSlide + 1} of {slides.length}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevious}
              disabled={currentSlide === 0}
              className="text-white hover:bg-white/10"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePlayPause}
              className="text-white hover:bg-white/10"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNext}
              disabled={currentSlide === slides.length - 1}
              className="text-white hover:bg-white/10"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/10 ml-4"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Slide Content */}
        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-6xl aspect-video bg-white rounded-lg shadow-2xl overflow-hidden"
            style={{ backgroundColor: currentSlideData?.background || '#ffffff' }}
          >
            {/* Render slide elements */}
            {currentSlideData?.elements.map((element) => {
              if (element.type === 'text') {
                return (
                  <div
                    key={element.id}
                    className="absolute"
                    style={{
                      left: element.x,
                      top: element.y,
                      width: element.width,
                      height: element.height,
                      color: element.color,
                      fontSize: element.fontSize,
                      fontWeight: element.fontWeight,
                      fontStyle: element.fontStyle,
                      textAlign: element.textAlign,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: element.textAlign === 'center' ? 'center' : 'flex-start'
                    }}
                  >
                    {element.text}
                  </div>
                );
              }
              return null;
            })}
          </motion.div>
        </div>

        {/* Slide Thumbnails */}
        <div className="p-4 bg-black/80 backdrop-blur-sm">
          <div className="flex gap-2 justify-center overflow-x-auto">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => onSlideChange(index)}
                className={`w-16 h-9 rounded border-2 transition-all ${
                  index === currentSlide
                    ? 'border-white'
                    : 'border-white/30 hover:border-white/60'
                }`}
                style={{ backgroundColor: slide.background || '#ffffff' }}
              >
                <span className="text-xs text-white font-medium">
                  {index + 1}
                </span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
