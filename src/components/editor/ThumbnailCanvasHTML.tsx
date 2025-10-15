import React, { useRef, useEffect, useState } from 'react';
import { ThumbnailCanvasProps } from '@/types/slide-thumbnails';
import { Element } from '@/hooks/use-action-manager';

const ThumbnailCanvasHTML: React.FC<ThumbnailCanvasProps> = ({
  slide,
  width,
  height,
  scale = 0.15,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageCache, setImageCache] = useState<Map<string, HTMLImageElement>>(new Map());

  // Load image for caching
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      if (imageCache.has(src)) {
        resolve(imageCache.get(src)!);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setImageCache(prev => new Map(prev).set(src, img));
        resolve(img);
      };
      img.onerror = reject;
      img.src = src;
    });
  };

  // Render element based on type
  const renderElement = (ctx: CanvasRenderingContext2D, element: Element) => {
    const x = element.x * scale;
    const y = element.y * scale;
    const w = element.width * scale;
    const h = element.height * scale;

    ctx.save();

    // Apply rotation
    if (element.rotation) {
      ctx.translate(x + w / 2, y + h / 2);
      ctx.rotate((element.rotation * Math.PI) / 180);
      ctx.translate(-w / 2, -h / 2);
    } else {
      ctx.translate(x, y);
    }

    // Apply opacity
    if ((element as any).opacity) {
      ctx.globalAlpha = (element as any).opacity;
    }

    switch (element.type) {
      case 'text':
        ctx.fillStyle = element.color || '#000000';
        ctx.font = `${element.fontWeight || 'normal'} ${(element.fontSize || 16) * scale}px ${element.fontFamily || 'Arial'}`;
        ctx.textAlign = (element.textAlign as CanvasTextAlign) || 'left';
        ctx.textBaseline = 'top';
        
        const text = element.text || element.content || element.placeholder || 'Text';
        const lines = text.split('\n');
        const lineHeight = (element.fontSize || 16) * scale * 1.2;
        
        lines.forEach((line, index) => {
          ctx.fillText(line, 0, index * lineHeight);
        });
        break;

      case 'shape':
        if (element.shapeType === 'circle') {
          ctx.beginPath();
          ctx.arc(w / 2, h / 2, Math.min(w, h) / 2, 0, 2 * Math.PI);
          ctx.fillStyle = element.backgroundColor || '#0078d4';
          ctx.fill();
          
          if (element.borderColor && element.borderWidth) {
            ctx.strokeStyle = element.borderColor;
            ctx.lineWidth = (element.borderWidth || 0) * scale;
            ctx.stroke();
          }
        } else {
          ctx.fillStyle = element.backgroundColor || '#0078d4';
          ctx.fillRect(0, 0, w, h);
          
          if (element.borderColor && element.borderWidth) {
            ctx.strokeStyle = element.borderColor;
            ctx.lineWidth = (element.borderWidth || 0) * scale;
            ctx.strokeRect(0, 0, w, h);
          }
        }
        break;

      case 'image':
        // For images, we'd need to load them asynchronously
        // For now, draw a placeholder
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = '#d0d0d0';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(0, 0, w, h);
        ctx.setLineDash([]);
        break;

      case 'chart':
        ctx.fillStyle = element.backgroundColor || '#f8f9fa';
        ctx.fillRect(0, 0, w, h);
        
        if (element.borderColor && element.borderWidth) {
          ctx.strokeStyle = element.borderColor;
          ctx.lineWidth = (element.borderWidth || 2) * scale;
          ctx.strokeRect(0, 0, w, h);
        }
        break;
    }

    ctx.restore();
  };

  // Generate thumbnail when slide changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = slide.background || '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Draw elements
    slide.elements.forEach(element => {
      renderElement(ctx, element);
    });

    // Generate data URL for caching
    const dataURL = canvas.toDataURL('image/png', 0.8);
    
    // Update slide thumbnail if it has changed
    if (slide.thumbnail !== dataURL) {
      // This would typically be handled by the parent component
      // For now, we just render the preview
    }
  }, [slide.elements, slide.background, width, height, scale]);

  return (
    <div className={`thumbnail-canvas ${className}`} style={{ width, height }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ 
          width: '100%', 
          height: '100%',
          imageRendering: 'crisp-edges'
        }}
      />
    </div>
  );
};

export default ThumbnailCanvasHTML;
