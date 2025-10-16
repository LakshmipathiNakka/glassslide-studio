import React from "react";
import { List, arrayMove } from "react-movable";
import { Slide } from "@/types/slide-thumbnails";
import SlideThumbnail from "./SlideThumbnail";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface SlideThumbnailsProps {
  slides: Slide[];
  currentSlide: number;
  onSlideChange: (index: number) => void;
  onReorderSlides: (newSlides: Slide[]) => void;
  onAddSlide: () => void;
}

const SlideThumbnailsMovable: React.FC<SlideThumbnailsProps> = ({
  slides,
  currentSlide,
  onSlideChange,
  onReorderSlides,
  onAddSlide,
}) => {
  console.log('🎯 SLIDE THUMBNAILS MOVABLE - Component rendered');
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200/40 flex-shrink-0 bg-white/30 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-gray-800">Slides</h2>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
              {slides.length}
            </span>
          </div>
        </div>
      </div>

      {/* Slides List */}
      <div className="flex-1 overflow-hidden">
        <List
          values={slides}
          onChange={({ oldIndex, newIndex }) => {
            console.log('🔄 REACT-MOVABLE - Reordering:', { oldIndex, newIndex });
            
            const newOrder = arrayMove(slides, oldIndex, newIndex);
            onReorderSlides(newOrder);

            // Don't change the current slide - keep editing the same slide
            // The slide content will stay with the same slide ID
            console.log('🔄 REACT-MOVABLE - Keeping current slide unchanged');
          }}
          renderList={({ children, props, isDragged }) => (
            <div 
              {...props} 
              className="flex flex-col p-2 space-y-3 h-full overflow-y-auto"
            >
              {children}
            </div>
          )}
          renderItem={({ value: slide, index, props, isDragged }) => (
            <div
              {...props}
              key={slide.id}
              className={`slide-thumbnail group relative ${
                currentSlide === index ? "active" : ""
              } ${isDragged ? "dragging" : ""}`}
              onClick={() => {
                console.log('🔄 REACT-MOVABLE - Slide clicked:', { 
                  index, 
                  slideId: slide.id,
                  elementCount: slide.elements?.length || 0,
                  lastUpdated: slide.lastUpdated
                });
                onSlideChange(index);
              }}
            >
              <SlideThumbnail 
                slide={slide} 
                index={index} 
                isActive={currentSlide === index}
                isDragging={isDragged}
                isHovered={false}
                onSelect={() => onSlideChange(index)}
                onContextMenu={() => {}}
                onDragStart={() => {}}
                onDragEnd={() => {}}
              />
              {/* Debug info */}
              <div className="absolute top-1 left-1 text-xs bg-black/50 text-white px-1 rounded">
                {slide.elements?.length || 0} elements
                <br />
                ID: {slide.id.slice(-4)}
              </div>
            </div>
          )}
        />
      </div>

      {/* Add Slide Button */}
      <div className="p-4 border-t border-gray-200/40 flex-shrink-0">
        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:bg-gradient-to-b hover:from-gray-100 hover:to-gray-200 hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-200 shadow-sm"
          onClick={onAddSlide}
        >
          <Plus size={18} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-700">New Slide</span>
        </Button>
      </div>
    </div>
  );
};

export default SlideThumbnailsMovable;
