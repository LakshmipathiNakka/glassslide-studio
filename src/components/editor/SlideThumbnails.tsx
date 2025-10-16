import React from 'react';
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slide } from '@/types/slide-thumbnails';
import EnhancedSlideThumbnails from './EnhancedSlideThumbnails';
import { useSlideThumbnails } from '@/hooks/useSlideThumbnails';
import { ColorPicker } from '@/components/ui/color-picker';

interface SlideThumbnailsProps {
  slides: Slide[];
  currentSlide: number;
  onSlideChange: (index: number) => void;
  onAddSlide: () => void;
  onUpdateSlide: (index: number, updates: Partial<Slide>) => void;
}

export const SlideThumbnails = ({ 
  slides, 
  currentSlide, 
  onSlideChange, 
  onAddSlide,
  onUpdateSlide
}: SlideThumbnailsProps) => {
  const {
    slides: enhancedSlides,
    currentSlide: enhancedCurrentSlide,
    handleSlideChange,
    handleAddSlide,
    handleAddSlideAtIndex,
    handleDuplicateSlide,
    handleDeleteSlide,
    handleReorderSlides,
    handleRenameSlide,
    handleSetSlideCategory,
    handleAddSlideNotes,
    handleChangeSlideBackground,
    handleAddSlideCover,
    handleContextMenuAction,
    showColorPicker,
    colorPickerPosition,
    currentSlideForSettings,
    handleColorChange,
  } = useSlideThumbnails({
    slides,
    currentSlide,
    onSlideChange,
    onAddSlide,
    onUpdateSlide
  });
  

  return (
    <>
      <EnhancedSlideThumbnails
        slides={enhancedSlides}
        currentSlide={enhancedCurrentSlide}
        onSlideChange={handleSlideChange}
        onAddSlide={handleAddSlide}
        onAddSlideAtIndex={handleAddSlideAtIndex}
        onDuplicateSlide={handleDuplicateSlide}
        onDeleteSlide={handleDeleteSlide}
        onReorderSlides={handleReorderSlides}
        onUpdateSlide={onUpdateSlide}
        onRenameSlide={handleRenameSlide}
        onSetSlideCategory={handleSetSlideCategory}
        onAddSlideNotes={handleAddSlideNotes}
        onChangeSlideBackground={handleChangeSlideBackground}
        onAddSlideCover={handleAddSlideCover}
        onContextMenuAction={handleContextMenuAction}
      />
      
      {/* Color Picker Modal */}
      <ColorPicker
        isOpen={showColorPicker}
        onClose={() => handleColorChange(currentSlideForSettings?.slide.background || '#ffffff')}
        currentColor={currentSlideForSettings?.slide.background || '#ffffff'}
        onColorChange={handleColorChange}
        position={colorPickerPosition}
      />
      
    </>
  );
};
