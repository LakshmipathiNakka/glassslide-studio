import React from 'react';
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slide } from '@/types/slide-thumbnails';
import EnhancedSlideThumbnails from './EnhancedSlideThumbnails';
import { useSlideThumbnails } from '@/hooks/useSlideThumbnails';
import { ColorPicker } from '@/components/ui/color-picker';
import SlideTitleDialog from './SlideTitleDialog';

interface SlideThumbnailsProps {
  slides: Slide[];
  currentSlide: number;
  onSlideChange: (index: number) => void;
  onAddSlide: () => void;
  onReorderSlides: (reorderedSlides: Slide[]) => void;
  onUpdateSlide: (index: number, updates: Partial<Slide>) => void;
  onAddSlideAtIndex?: (index: number) => void;
  onDuplicateSlide?: (index: number) => void;
  onDeleteSlide?: (index: number) => void;
  onRenameSlide?: (index: number, title: string) => void;
  onChangeSlideBackground?: (index: number, background: string) => void;
  // Live override for current slide elements during drag/resize
  liveElements?: any[] | null;
  liveSlideIndex?: number;
}

export const SlideThumbnails = ({ 
  slides, 
  currentSlide, 
  onSlideChange, 
  onAddSlide,
  onReorderSlides,
  onUpdateSlide,
  onAddSlideAtIndex,
  onDuplicateSlide,
  onDeleteSlide,
  onRenameSlide,
  onChangeSlideBackground,
  liveElements,
  liveSlideIndex,
}: SlideThumbnailsProps) => {
  // If live elements are present for the current slide, override them for preview only
  const slidesForPreview = (() => {
    if (Array.isArray(liveElements) && typeof (liveSlideIndex) === 'number') {
      const copy = slides.map(s => ({ ...s }));
      if (copy[liveSlideIndex]) {
        copy[liveSlideIndex] = { ...copy[liveSlideIndex], elements: liveElements as any } as any;
      }
      return copy;
    }
    return slides;
  })();

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
    showTitleDialog,
    currentSlideForRename,
    handleTitleConfirm,
    handleTitleCancel,
  } = useSlideThumbnails({
    slides: slidesForPreview,
    currentSlide,
    onSlideChange,
    onAddSlide,
    onReorderSlides,
    onUpdateSlide,
    onAddSlideAtIndex,
    onDuplicateSlide,
    onDeleteSlide,
    onRenameSlide,
    onChangeSlideBackground,
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
        onChangeSlideBackground={handleChangeSlideBackground}
        onContextMenuAction={handleContextMenuAction}
      />
      
      {/* Color Picker Modal */}
      {showColorPicker && currentSlideForSettings && (
        <ColorPicker
          isOpen={showColorPicker}
          onClose={() => {
            // Just close the picker without changing the color
            // The hook should handle closing the picker
          }}
          currentColor={currentSlideForSettings.slide.background || '#ffffff'}
          onColorChange={handleColorChange}
          position={colorPickerPosition}
        />
      )}

      {/* Slide Title Dialog */}
      {showTitleDialog && currentSlideForRename && (
        <SlideTitleDialog
          isOpen={showTitleDialog}
          currentTitle={currentSlideForRename.slide.title || `Slide ${currentSlideForRename.index + 1}`}
          onClose={handleTitleCancel}
          onConfirm={handleTitleConfirm}
        />
      )}
      
    </>
  );
};
