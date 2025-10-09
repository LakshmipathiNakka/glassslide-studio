import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Slide {
  id: string;
  thumbnail?: string;
}

interface SlideThumbnailsProps {
  slides: Slide[];
  currentSlide: number;
  onSlideChange: (index: number) => void;
  onAddSlide: () => void;
}

export const SlideThumbnails = ({ 
  slides, 
  currentSlide, 
  onSlideChange, 
  onAddSlide 
}: SlideThumbnailsProps) => {
  return (
    <div className="w-64 glass-toolbar border-r flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-sm text-foreground">Slides</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => onSlideChange(index)}
            className={`w-full aspect-video rounded-lg border-2 transition-all hover:border-accent/50 ${
              currentSlide === index
                ? 'border-accent ring-2 ring-accent/20'
                : 'border-border bg-card'
            }`}
          >
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
              Slide {index + 1}
            </div>
          </button>
        ))}

        <Button
          variant="outline"
          className="w-full aspect-video border-dashed hover:border-accent hover:bg-accent/5"
          onClick={onAddSlide}
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};
