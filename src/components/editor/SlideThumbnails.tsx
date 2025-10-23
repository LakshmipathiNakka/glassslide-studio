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
    showTitleDialog,
    currentSlideForRename,
    handleTitleConfirm,
    handleTitleCancel,
  } = useSlideThumbnails({
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
  });

  console.log('🔧 SLIDE THUMBNAILS - Props received:', { 
    hasOnAddSlideAtIndex: !!onAddSlideAtIndex,
    hasOnDuplicateSlide: !!onDuplicateSlide,
    hasOnDeleteSlide: !!onDeleteSlide,
    slidesCount: slides.length
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
            console.log('🎨 COLOR PICKER - Closing without change');
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
