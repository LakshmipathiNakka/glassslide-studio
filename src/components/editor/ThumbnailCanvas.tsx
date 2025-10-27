import React, { useRef, useEffect, useState } from 'react';
import { ThumbnailCanvasProps } from '@/types/slide-thumbnails';
import { Element } from '@/hooks/use-action-manager';
import ThumbnailCanvasHTML from './ThumbnailCanvasHTML';

// Try to import React Konva, fallback to HTML5 Canvas if not available
let Stage: any, Layer: any, Text: any, Rect: any, Circle: any, KonvaImage: any, Group: any, Line: any, RegularPolygon: any, StarShape: any, Ellipse: any, PathShape: any;
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
  Line = konva.Line;
  RegularPolygon = konva.RegularPolygon;
  StarShape = konva.Star;
  Ellipse = konva.Ellipse;
  PathShape = konva.Path;
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
          <Group key={element.id}>
            {/* Background for text */}
            {element.backgroundColor && (
              <Rect
                {...commonProps}
                fill={element.backgroundColor}
                stroke={element.borderColor || 'transparent'}
                strokeWidth={(element.borderWidth || 0) * scale}
                cornerRadius={(element.borderRadius || 0) * scale}
              />
            )}
            {/* Text content */}
            <Text
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
          </Group>
        );

      case 'shape': {
        // unified styling props (prefer new fill/stroke/strokeWidth, fallback to old)
        const fill = (element as any).fill ?? element.backgroundColor ?? 'transparent';
        const stroke = (element as any).stroke ?? element.borderColor ?? '#000000';
        const strokeWidth = ((element as any).strokeWidth ?? element.borderWidth ?? 0.5) * scale;

        switch ((element as any).shapeType) {
          case 'circle':
            return (
              <Circle
                key={element.id}
                x={scaledX + scaledWidth / 2}
                y={scaledY + scaledHeight / 2}
                radius={Math.min(scaledWidth, scaledHeight) / 2}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
                rotation={element.rotation || 0}
                opacity={(element as any).opacity || 1}
              />
            );
          case 'rectangle':
            return (
              <Rect
                key={element.id}
                {...commonProps}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
                cornerRadius={0}
                rotation={element.rotation || 0}
                opacity={(element as any).opacity || 1}
              />
            );
          case 'rounded-rectangle':
            return (
              <Rect
                key={element.id}
                {...commonProps}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
                cornerRadius={(element.borderRadius || 8) * scale}
                rotation={element.rotation || 0}
                opacity={(element as any).opacity || 1}
              />
            );
          case 'triangle':
            return (
              <Line
                key={element.id}
                x={scaledX}
                y={scaledY}
                points={[scaledWidth / 2, 0, scaledWidth, scaledHeight, 0, scaledHeight]}
                closed
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
                rotation={element.rotation || 0}
                opacity={(element as any).opacity || 1}
              />
            );
          case 'diamond':
            return (
              <RegularPolygon
                key={element.id}
                x={scaledX + scaledWidth / 2}
                y={scaledY + scaledHeight / 2}
                sides={4}
                radius={Math.min(scaledWidth, scaledHeight) / 2}
                rotation={45 + (element.rotation || 0)}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
                opacity={(element as any).opacity || 1}
              />
            );
          case 'pentagon':
            return (
              <RegularPolygon
                key={element.id}
                x={scaledX + scaledWidth / 2}
                y={scaledY + scaledHeight / 2}
                sides={5}
                radius={Math.min(scaledWidth, scaledHeight) / 2}
                rotation={element.rotation || 0}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
                opacity={(element as any).opacity || 1}
              />
            );
          case 'hexagon':
            return (
              <RegularPolygon
                key={element.id}
                x={scaledX + scaledWidth / 2}
                y={scaledY + scaledHeight / 2}
                sides={6}
                radius={Math.min(scaledWidth, scaledHeight) / 2}
                rotation={element.rotation || 0}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
                opacity={(element as any).opacity || 1}
              />
            );
          case 'star':
            return (
              <StarShape
                key={element.id}
                x={scaledX + scaledWidth / 2}
                y={scaledY + scaledHeight / 2}
                numPoints={5}
                innerRadius={Math.min(scaledWidth, scaledHeight) * 0.25}
                outerRadius={Math.min(scaledWidth, scaledHeight) * 0.5}
                rotation={element.rotation || 0}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
                opacity={(element as any).opacity || 1}
              />
            );
          case 'arrow-right': {
            const pts = [0, scaledHeight * 0.5, scaledWidth * 0.6, scaledHeight * 0.5, scaledWidth * 0.6, 0, scaledWidth, scaledHeight * 0.5, scaledWidth * 0.6, scaledHeight, scaledWidth * 0.6, scaledHeight * 0.5, 0, scaledHeight * 0.5];
            return (
              <Line
                key={element.id}
                x={scaledX}
                y={scaledY}
                points={pts}
                closed
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
                rotation={element.rotation || 0}
                opacity={(element as any).opacity || 1}
              />
            );
          }
          case 'arrow-double':
            return null;
          case 'cloud':
            return null;
          case 'heart':
            return (
              <PathShape
                key={element.id}
                x={scaledX}
                y={scaledY}
                data={'M12,21.35l-1.45-1.32C5.4,15.36,2,12.28,2,8.5 C2,5.42,4.42,3,7.5,3c1.74,0,3.41,0.81,4.5,2.09C13.09,3.81,14.76,3,16.5,3 C19.58,3,22,5.42,22,8.5c0,3.78-3.4,6.86-8.55,11.54L12,21.35z'}
                scaleX={scaledWidth / 24}
                scaleY={scaledHeight / 24}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
                rotation={element.rotation || 0}
                opacity={(element as any).opacity || 1}
              />
            );
          case 'lightning': {
            const pts = [scaledWidth * 0.3, 0, scaledWidth * 0.7, scaledHeight * 0.4, scaledWidth * 0.5, scaledHeight * 0.4, scaledWidth * 0.9, scaledHeight, scaledWidth * 0.1, scaledHeight * 0.6, scaledWidth * 0.3, scaledHeight * 0.6];
            return (
              <Line
                key={element.id}
                x={scaledX}
                y={scaledY}
                points={pts}
                closed
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
                rotation={element.rotation || 0}
                opacity={(element as any).opacity || 1}
              />
            );
          }
          case 'line':
            return null;
          case 'text-box':
            return null;
          default:
            return (
              <Rect
                key={element.id}
                {...commonProps}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
              />
            );
        }
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
          <ChartElement
            key={element.id}
            element={element}
            scale={scale}
            {...commonProps}
          />
        );

      case 'table':
        return (
          <Group key={element.id}>
            <Rect
              {...commonProps}
              fill={element.backgroundColor || '#ffffff'}
              stroke={element.borderColor || '#cccccc'}
              strokeWidth={(element.borderWidth || 1) * scale}
              cornerRadius={(element.borderRadius || 0) * scale}
            />
            <Text
              x={scaledX + scaledWidth / 2}
              y={scaledY + scaledHeight / 2}
              text="📋 Table"
              fontSize={10 * scale}
              fontFamily="Arial"
              fill="#666666"
              align="center"
              verticalAlign="middle"
            />
          </Group>
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
  }, [slide.elements, slide.background, slide.lastUpdated]);

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
      <Group>
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
        <Text
          x={element.x * scale + (element.width * scale) / 2}
          y={element.y * scale + (element.height * scale) / 2}
          text="📷"
          fontSize={12 * scale}
          fontFamily="Arial"
          fill="#999999"
          align="center"
          verticalAlign="middle"
        />
      </Group>
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

// Helper component for chart elements
const ChartElement: React.FC<{
  element: Element;
  scale: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
}> = ({ element, scale, x, y, width, height, rotation, opacity }) => {
  const chartData = element.chartData;
  if (!chartData || !chartData.labels || !chartData.datasets) {
    return (
      <Group>
        <Rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={element.backgroundColor || '#f8f9fa'}
          stroke={element.borderColor || '#0078d4'}
          strokeWidth={(element.borderWidth || 2) * scale}
          cornerRadius={(element.borderRadius || 8) * scale}
        />
        <Text
          x={x + width / 2}
          y={y + height / 2}
          text="📊 Chart"
          fontSize={10 * scale}
          fontFamily="Arial"
          fill="#666666"
          align="center"
          verticalAlign="middle"
        />
      </Group>
    );
  }

  const labels = chartData.labels;
  const datasets = chartData.datasets;
  const maxValue = Math.max(...datasets.flatMap((ds: any) => ds.data));
  const padding = 10 * scale;
  const chartWidth = width - (padding * 2);
  const chartHeight = height - (padding * 2);
  const chartX = x + padding;
  const chartY = y + padding;

  return (
    <Group>
      {/* Background */}
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={element.backgroundColor || '#f8f9fa'}
        stroke={element.borderColor || '#0078d4'}
        strokeWidth={(element.borderWidth || 2) * scale}
        cornerRadius={(element.borderRadius || 8) * scale}
      />
      
      {/* Chart title */}
      {chartData.title && (
        <Text
          x={x + width / 2}
          y={y + 5 * scale}
          text={chartData.title}
          fontSize={(chartData.titleFontSize || 14) * scale}
          fontFamily={chartData.titleFontFamily || 'Arial'}
          fill={chartData.titleColor || '#000000'}
          align="center"
          verticalAlign="top"
        />
      )}

      {/* Chart content based on type */}
      {element.chartType === 'bar' && (
        <BarChart
          chartX={chartX}
          chartY={chartY}
          chartWidth={chartWidth}
          chartHeight={chartHeight}
          labels={labels}
          datasets={datasets}
          maxValue={maxValue}
          scale={scale}
        />
      )}
      
      {element.chartType === 'line' && (
        <LineChart
          chartX={chartX}
          chartY={chartY}
          chartWidth={chartWidth}
          chartHeight={chartHeight}
          labels={labels}
          datasets={datasets}
          maxValue={maxValue}
          scale={scale}
        />
      )}
      
      {element.chartType === 'pie' && (
        <PieChart
          chartX={chartX}
          chartY={chartY}
          chartWidth={chartWidth}
          chartHeight={chartHeight}
          datasets={datasets}
          scale={scale}
        />
      )}
    </Group>
  );
};

// Bar chart component
const BarChart: React.FC<{
  chartX: number;
  chartY: number;
  chartWidth: number;
  chartHeight: number;
  labels: string[];
  datasets: any[];
  maxValue: number;
  scale: number;
}> = ({ chartX, chartY, chartWidth, chartHeight, labels, datasets, maxValue, scale }) => {
  const barWidth = chartWidth / labels.length * 0.6;
  const barSpacing = chartWidth / labels.length * 0.4;
  
  return (
    <Group>
      {labels.map((label: string, i: number) => {
        const x = chartX + i * (barWidth + barSpacing) + barSpacing / 2;
        
        return datasets.map((dataset: any, dsIndex: number) => {
          const value = dataset.data[i] || 0;
          const barHeight = (value / maxValue) * chartHeight;
          const y = chartY + chartHeight - barHeight;
          
          return (
            <Rect
              key={`${i}-${dsIndex}`}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={dataset.backgroundColor || `hsl(${dsIndex * 60}, 70%, 50%)`}
            />
          );
        });
      })}
    </Group>
  );
};

// Line chart component
const LineChart: React.FC<{
  chartX: number;
  chartY: number;
  chartWidth: number;
  chartHeight: number;
  labels: string[];
  datasets: any[];
  maxValue: number;
  scale: number;
}> = ({ chartX, chartY, chartWidth, chartHeight, labels, datasets, maxValue, scale }) => {
  return (
    <Group>
      {datasets.map((dataset: any, dsIndex: number) => {
        const points = dataset.data.map((value: number, i: number) => {
          const x = chartX + (i / (labels.length - 1)) * chartWidth;
          const y = chartY + chartHeight - (value / maxValue) * chartHeight;
          return { x, y };
        });
        
        return (
          <Group key={dsIndex}>
            {points.map((point, i) => {
              if (i === 0) return null;
              const prevPoint = points[i - 1];
              return (
                <Rect
                  key={i}
                  x={prevPoint.x}
                  y={prevPoint.y}
                  width={Math.max(1, point.x - prevPoint.x)}
                  height={2 * scale}
                  fill={dataset.borderColor || dataset.backgroundColor || `hsl(${dsIndex * 60}, 70%, 50%)`}
                />
              );
            })}
          </Group>
        );
      })}
    </Group>
  );
};

// Pie chart component
const PieChart: React.FC<{
  chartX: number;
  chartY: number;
  chartWidth: number;
  chartHeight: number;
  datasets: any[];
  scale: number;
}> = ({ chartX, chartY, chartWidth, chartHeight, datasets, scale }) => {
  const centerX = chartX + chartWidth / 2;
  const centerY = chartY + chartHeight / 2;
  const radius = Math.min(chartWidth, chartHeight) / 2 - 10 * scale;
  
  let currentAngle = 0;
  const total = datasets[0]?.data.reduce((sum: number, val: number) => sum + val, 0) || 1;
  
  return (
    <Group>
      {datasets[0]?.data.map((value: number, i: number) => {
        const sliceAngle = (value / total) * 2 * Math.PI;
        const startAngle = currentAngle;
        const endAngle = currentAngle + sliceAngle;
        
        currentAngle += sliceAngle;
        
        return (
          <Rect
            key={i}
            x={centerX - radius / 2}
            y={centerY - radius / 2}
            width={radius}
            height={radius}
            fill={datasets[0].backgroundColor || `hsl(${i * 60}, 70%, 50%)`}
            cornerRadius={radius / 2}
            rotation={startAngle * (180 / Math.PI)}
          />
        );
      })}
    </Group>
  );
};

export default ThumbnailCanvas;
