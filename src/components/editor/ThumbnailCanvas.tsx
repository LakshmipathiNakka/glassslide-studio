import React, { useRef, useEffect, useState } from 'react';
import { ThumbnailCanvasProps } from '@/types/slide-thumbnails';
import { Element } from '@/hooks/use-action-manager';
import ThumbnailCanvasHTML from './ThumbnailCanvasHTML';

// Try to import React Konva, fallback to HTML5 Canvas if not available
let Stage: any, Layer: any, Text: any, Rect: any, Circle: any, KonvaImage: any, Group: any;
let useKonva = false;

try {
  const konva = require('react-konva');
  Stage = konva.Stage;
  Layer = konva.Layer;
  Text = konva.Text;
  Rect = konva.Rect;
  Circle = konva.Circle;
  KonvaImage = konva.Image;
  Group = konva.Group;
  useKonva = true;
} catch (error) {
  console.warn('React Konva not available, using HTML5 Canvas fallback');
  useKonva = false;
}

const ThumbnailCanvas: React.FC<ThumbnailCanvasProps> = ({
  slide,
  width,
  height,
  scale = 0.1,
  className = ''
}) => {
  // Use HTML5 Canvas fallback if React Konva is not available
  if (!useKonva) {
    return (
      <ThumbnailCanvasHTML
        slide={slide}
        width={width}
        height={height}
        scale={scale}
        className={className}
      />
    );
  }
  const stageRef = useRef<any>(null);
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
  const renderElement = (element: Element, index: number) => {
    const scaledX = element.x * scale;
    const scaledY = element.y * scale;
    const scaledWidth = element.width * scale;
    const scaledHeight = element.height * scale;

    const commonProps = {
      x: scaledX,
      y: scaledY,
      width: scaledWidth,
      height: scaledHeight,
      rotation: element.rotation || 0,
      opacity: (element as any).opacity || 1,
    };

    switch (element.type) {
      case 'text':
        return (
          <Text
            key={element.id}
            {...commonProps}
            text={element.text || element.content || element.placeholder || 'Text'}
            fontSize={(element.fontSize || 16) * scale}
            fontFamily={element.fontFamily || 'Arial'}
            fontStyle={element.fontWeight === 'bold' ? 'bold' : 'normal'}
            fill={element.color || '#000000'}
            align={element.textAlign || 'left'}
            verticalAlign="top"
            wrap="word"
            width={scaledWidth}
            height={scaledHeight}
          />
        );

      case 'shape':
        if (element.shapeType === 'circle') {
          return (
            <Circle
              key={element.id}
              x={scaledX + scaledWidth / 2}
              y={scaledY + scaledHeight / 2}
              radius={Math.min(scaledWidth, scaledHeight) / 2}
              fill={element.backgroundColor || '#0078d4'}
              stroke={element.borderColor || 'transparent'}
              strokeWidth={(element.borderWidth || 0) * scale}
            />
          );
        } else {
          return (
            <Rect
              key={element.id}
              {...commonProps}
              fill={element.backgroundColor || '#0078d4'}
              stroke={element.borderColor || 'transparent'}
              strokeWidth={(element.borderWidth || 0) * scale}
              cornerRadius={(element.borderRadius || 0) * scale}
            />
          );
        }

      case 'image':
        return (
          <ImageElement
            key={element.id}
            element={element}
            scale={scale}
            loadImage={loadImage}
          />
        );

      case 'chart':
        return (
          <Rect
            key={element.id}
            {...commonProps}
            fill={element.backgroundColor || '#f8f9fa'}
            stroke={element.borderColor || '#0078d4'}
            strokeWidth={(element.borderWidth || 2) * scale}
            cornerRadius={(element.borderRadius || 8) * scale}
          />
        );

      default:
        return null;
    }
  };

  // Generate thumbnail when slide changes
  useEffect(() => {
    if (stageRef.current) {
      const stage = stageRef.current;
      const dataURL = stage.toDataURL({
        mimeType: 'image/png',
        quality: 0.8,
        pixelRatio: 2
      });
      
      // Update slide thumbnail if it has changed
      if (slide.thumbnail !== dataURL) {
        // This would typically be handled by the parent component
        // For now, we just render the preview
      }
    }
  }, [slide.elements, slide.background]);

  return (
    <div className={`thumbnail-canvas ${className}`} style={{ width, height }}>
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        scaleX={scale}
        scaleY={scale}
        offsetX={0}
        offsetY={0}
      >
        <Layer>
          {/* Background */}
          <Rect
            x={0}
            y={0}
            width={width / scale}
            height={height / scale}
            fill={slide.background || '#ffffff'}
          />
          
          {/* Elements */}
          {slide.elements.map((element, index) => renderElement(element, index))}
        </Layer>
      </Stage>
    </div>
  );
};

// Helper component for image elements
const ImageElement: React.FC<{
  element: Element;
  scale: number;
  loadImage: (src: string) => Promise<HTMLImageElement>;
}> = ({ element, scale, loadImage }) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (element.imageUrl) {
      loadImage(element.imageUrl).then(setImage);
    }
  }, [element.imageUrl, loadImage]);

  if (!image) {
    // Show placeholder while loading
    return (
      <Rect
        x={element.x * scale}
        y={element.y * scale}
        width={element.width * scale}
        height={element.height * scale}
        fill="#f0f0f0"
        stroke="#d0d0d0"
        strokeWidth={1}
        dash={[5, 5]}
      />
    );
  }

  return (
    <KonvaImage
      x={element.x * scale}
      y={element.y * scale}
      width={element.width * scale}
      height={element.height * scale}
      image={image}
      rotation={element.rotation || 0}
      opacity={(element as any).opacity || 1}
    />
  );
};

export default ThumbnailCanvas;
