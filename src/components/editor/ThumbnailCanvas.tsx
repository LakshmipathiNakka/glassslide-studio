import React, { useRef, useEffect, useState } from 'react';
import { ThumbnailCanvasProps } from '@/types/slide-thumbnails';
import { Element } from '@/hooks/use-action-manager';
import ThumbnailCanvasHTML from './ThumbnailCanvasHTML';
import { TABLE_THEMES } from '@/constants/tableThemes';

// Try to import React Konva, fallback to HTML5 Canvas if not available
let Stage: any, Layer: any, Text: any, Rect: any, Circle: any, KonvaImage: any, Group: any, Line: any, RegularPolygon: any, StarShape: any, Ellipse: any, PathShape: any, WedgeShape: any;
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
  WedgeShape = konva.Wedge;
  useKonva = true;
} catch (error) {
  useKonva = false;
}

// Force HTML canvas for thumbnails to ensure CSS gradients match editor canvas exactly
// This also avoids discrepancies from Konva not supporting CSS gradient strings out of the box
useKonva = false;

const ThumbnailCanvas: React.FC<ThumbnailCanvasProps> = ({
  slide,
  width,
  height,
  scale = 0.1,
  className = '',
  responsive = false,
  overrideElements,
}) => {
  // Use HTML5 Canvas fallback if React Konva is not available
  if (!useKonva) {
    return (
      <ThumbnailCanvasHTML
        slide={{ ...slide, elements: overrideElements ?? slide.elements }}
        width={width}
        height={height}
        scale={scale}
        className={className}
        responsive={responsive}
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

  const stripHtml = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html || '';
    return (div.textContent || div.innerText || '').trim();
  };

  const effectiveSlide = { ...slide, elements: overrideElements ?? slide.elements };
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
              text={(element.text || stripHtml((element as any).content || '') || '').trim()}
              fontSize={(element.fontSize || 16) * scale}
              fontFamily={element.fontFamily || 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif'}
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

      case 'table': {
        const rows = Math.max(1, (element as any).rows || 3);
        const cols = Math.max(1, (element as any).cols || 3);
        const cellPadding = (element as any).cellPadding ?? 6;
        
        // Get theme if exists
        const theme = (element as any).themeId ? 
          TABLE_THEMES.find(t => t.id === (element as any).themeId) : null;
        
        const borderColor = theme?.borderColor || (element as any).borderColor || '#D9D9D9';
        const borderWidth = ((element as any).borderWidth ?? 1) * scale;
        const header = !!(element as any).header;
        const headerBg = theme?.headerBg || (element as any).headerBg || '#E7E6E6';
        const headerTextColor = theme?.headerTextColor || (element as any).headerTextColor || '#111827';
        const rowEvenBg = theme?.rowEvenBg || (element as any).backgroundColor || '#FFFFFF';
        const rowOddBg = theme?.rowOddBg || (element as any).rowAltBg || (theme?.rowEvenBg ? 'rgba(0,0,0,0.02)' : 'transparent');
        const textColor = theme?.textColor || (element as any).color || '#000000';
        const textAlign = (element as any).cellTextAlign || 'left';
        const fontFamily = (element as any).fontFamily || 'Arial';
        const fontSize = ((element as any).fontSize || 16) * scale;

        const cellW = scaledWidth / cols;
        const cellH = scaledHeight / rows;

        const cells: any[] = [];
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const cx = scaledX + c * cellW;
            const cy = scaledY + r * cellH;
            const isHeader = header && r === 0;
            const isEvenRow = ((header ? r - 1 : r) % 2 === 0);
            const bg = isHeader ? headerBg : (isEvenRow ? rowEvenBg : rowOddBg);

            // Background cell
            cells.push(
              <Rect
                key={`bg-${r}-${c}`}
                x={cx}
                y={cy}
                width={cellW}
                height={cellH}
                fill={bg}
                stroke={borderColor}
                strokeWidth={borderWidth}
              />
            );

            // Text
            const tableData = (element as any).tableData as string[][] | undefined;
            const raw = tableData?.[r]?.[c] ?? '';
            const text = stripHtml(raw);

            // Align mapping
            const align = (textAlign as any) || 'left';
            let tx = cx + cellPadding * scale;
            if (align === 'center') tx = cx + cellW / 2;
            if (align === 'right') tx = cx + cellW - cellPadding * scale;

            cells.push(
              <Text
                key={`txt-${r}-${c}`}
                x={align === 'center' ? cx : cx + cellPadding * scale}
                y={cy + cellPadding * scale}
                width={cellW - 2 * cellPadding * scale}
                height={cellH - 2 * cellPadding * scale}
                text={text}
                fontSize={Math.max(10 * scale, fontSize)}
                fontFamily={fontFamily}
                fontStyle={isHeader ? 'bold' : 'normal'}
                fill={isHeader ? headerTextColor : textColor}
                align={align}
                verticalAlign="top"
                wrap="char"
                ellipsis
              />
            );
          }
        }

        return <Group key={element.id}>{cells}</Group>;
      }

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
    <div className={`thumbnail-canvas ${className}`} style={responsive ? { width: '100%', height: '100%' } : { width, height }}>
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        style={responsive ? { width: '100%', height: '100%' } : undefined}
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
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif"
          fill="#666666"
          align="center"
          verticalAlign="middle"
        />
      </Group>
    );
  }

  const labels = chartData.labels;
  const datasets = chartData.datasets;
  const maxValue = Math.max(1, ...datasets.flatMap((ds: any) => ds.data));
  const padding = 10 * scale;
  const titleOffset = chartData.title ? 14 * scale : 0;
  const bottomOffset = 10 * scale; // for x labels
  const chartWidth = width - (padding * 2);
  const chartHeight = height - (padding * 2);
  const chartX = x + padding;
  const chartY = y + padding + titleOffset;
  const usableHeight = chartHeight - titleOffset - bottomOffset;

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

      {/* Axes for bar/line charts */}
      {(element.chartType === 'bar' || element.chartType === 'line') && (
        <Group>
          {/* X axis */}
          <Line
            points={[chartX, chartY + chartHeight, chartX + chartWidth, chartY + chartHeight]}
            stroke="#9ca3af"
            strokeWidth={Math.max(1, 1 * scale)}
          />
          {/* Y axis */}
          <Line
            points={[chartX, chartY, chartX, chartY + chartHeight]}
            stroke="#9ca3af"
            strokeWidth={Math.max(1, 1 * scale)}
          />
          {/* Ticks (optional) */}
          {[1, 2, 3, 4].map(i => (
            <Line
              key={i}
              points={[chartX - 3 * scale, chartY + (i / 4) * chartHeight, chartX, chartY + (i / 4) * chartHeight]}
              stroke="#9ca3af"
              strokeWidth={Math.max(1, 1 * scale)}
            />
          ))}
        </Group>
      )}
      
      {/* Chart title */}
      {chartData.title && (
        <Text
          x={x + width / 2}
          y={y + 5 * scale}
          text={chartData.title}
          fontSize={(chartData.titleFontSize || 14) * scale}
          fontFamily={chartData.titleFontFamily || 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif'}
          fill={chartData.titleColor || '#000000'}
          align="center"
          verticalAlign="top"
        />
      )}

      {/* Grid + Y tick labels */}
      {(element.chartType === 'bar' || element.chartType === 'line') && (
        <Group>
          {[0, 1, 2, 3, 4].map((i) => {
            const ratio = i / 4;
            const ty = chartY + usableHeight - ratio * usableHeight;
            // Choose very small pixel size and convert to stage units
            const labelFontPx = Math.max(4, Math.min(6, 12 * scale));
            const fs = labelFontPx / Math.max(0.001, scale);
            return (
              <Group key={i}>
                <Line
                  points={[chartX, ty, chartX + chartWidth, ty]}
                  stroke={i === 0 ? '#9ca3af' : 'rgba(156,163,175,0.35)'}
                  strokeWidth={Math.max(1, 1 * scale)}
                />
                <Text
                  x={chartX + 2 * scale}
                  y={ty - fs * 0.6}
                  width={(labelFontPx * 6) / Math.max(0.001, scale)}
                  height={fs * 1.2}
                  text={`${Math.round(ratio * maxValue)}`}
                  fontSize={fs}
                  fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif"
                  fill="#6b7280"
                  align="left"
                  verticalAlign="middle"
                />
              </Group>
            );
          })}
          {/* X labels (sample) */}
          {labels.map((label: string, i: number) => {
            const showEvery = labels.length > 6 ? Math.ceil(labels.length / 6) : 1;
            if (i % showEvery !== 0) return null;
            const groupW = chartWidth / Math.max(1, labels.length);
            const lx = chartX + i * groupW + groupW / 2;
            const labelFontPx = Math.max(4, Math.min(6, 12 * scale));
            const fs = labelFontPx / Math.max(0.001, scale);
            return (
              <Text
                key={`xlab-${i}`}
                x={lx - groupW / 2}
                y={chartY + usableHeight + 2 * scale}
                width={groupW}
                height={fs * 1.4}
                text={label}
                fontSize={fs}
                fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif"
                fill="#6b7280"
                align="center"
                verticalAlign="top"
              />
            );
          })}
        </Group>
      )}

      {/* Chart content based on type */}
      {element.chartType === 'bar' && (
        <BarChart
          chartX={chartX}
          chartY={chartY}
          chartWidth={chartWidth}
          chartHeight={usableHeight}
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
          chartHeight={usableHeight}
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
  const groupWidth = chartWidth / Math.max(1, labels.length);
  const innerPad = groupWidth * 0.2;
  const seriesCount = Math.max(1, datasets.length);
  const barWidth = (groupWidth - innerPad * 2) / seriesCount;
  
  return (
    <Group>
      {labels.map((label: string, i: number) => {
        const gx = chartX + i * groupWidth + innerPad;
        return datasets.map((dataset: any, dsIndex: number) => {
          const value = Number(dataset.data?.[i] || 0);
          const barHeight = (value / maxValue) * chartHeight;
          const y = chartY + chartHeight - barHeight;
          const x = gx + dsIndex * barWidth;
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
        const color = dataset.borderColor || dataset.backgroundColor || `hsl(${dsIndex * 60}, 70%, 50%)`;
        const pts: number[] = [];
        dataset.data.forEach((value: number, i: number) => {
          const x = chartX + (i / Math.max(1, labels.length - 1)) * chartWidth;
          const y = chartY + chartHeight - (value / maxValue) * chartHeight;
          pts.push(x, y);
        });
        return (
          <Group key={dsIndex}>
            <Line
              points={pts}
              stroke={color}
              strokeWidth={2 * scale}
              lineCap="round"
              lineJoin="round"
            />
            {dataset.data.map((value: number, i: number) => {
              const x = chartX + (i / Math.max(1, labels.length - 1)) * chartWidth;
              const y = chartY + chartHeight - (value / maxValue) * chartHeight;
              return (
                <Rect
                  key={`pt-${i}`}
                  x={x - 1.5 * scale}
                  y={y - 1.5 * scale}
                  width={3 * scale}
                  height={3 * scale}
                  fill={color}
                  cornerRadius={1.5 * scale}
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
  const radius = Math.max(0, Math.min(chartWidth, chartHeight) / 2 - 8 * scale);

  let currentAngle = 0;
  const values: number[] = (datasets[0]?.data as number[]) || [];
  const total = values.reduce((sum: number, val: number) => sum + (Number.isFinite(val) ? val : 0), 0) || 1;
  const bg = (datasets[0]?.backgroundColor as (string[] | string)) || [];
  const FALLBACK_PIE_COLORS = ['#007AFF','#FF3B30','#34C759','#FF9500','#AF52DE','#5AC8FA','#FFCC00','#8E8E93','#FF2D92','#30D158'];

  return (
    <Group>
      {values.map((value: number, i: number) => {
        const ratio = (Number.isFinite(value) ? value : 0) / total;
        const sliceAngleDeg = Math.max(0, ratio * 360);
        const startAngleDeg = (currentAngle * 180) / Math.PI;
        currentAngle += (sliceAngleDeg * Math.PI) / 180;
        const fill = Array.isArray(bg) ? (bg[i] || FALLBACK_PIE_COLORS[i % FALLBACK_PIE_COLORS.length]) : FALLBACK_PIE_COLORS[i % FALLBACK_PIE_COLORS.length];
        return (
          <WedgeShape
            key={i}
            x={centerX}
            y={centerY}
            radius={radius}
            angle={sliceAngleDeg}
            rotation={startAngleDeg}
            fill={fill}
            stroke="#ffffff"
            strokeWidth={1 * scale}
          />
        );
      })}
    </Group>
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
      loadImage(element.imageUrl)
        .then(setImage)
        .catch(() => {
          setImage(null);
        });
    } else {
      setImage(null);
    }
  }, [element.imageUrl, loadImage]);

  // Use scaled coordinates to match other elements (Stage is also scaled)
  const dx = element.x * scale;
  const dy = element.y * scale;
  const dw = element.width * scale;
  const dh = element.height * scale;
  const borderRadius = (element as any).borderRadius || 0;

  if (!image || !element.imageUrl) {
    // Show placeholder for errors or missing images
    return (
      <Group>
        <Rect
          x={dx}
          y={dy}
          width={dw}
          height={dh}
          fill="#f0f0f0"
          stroke="#d0d0d0"
          strokeWidth={1}
          dash={[5, 5]}
        />
        <Text
          x={dx + dw / 2}
          y={dy + dh / 2}
          text="⚠️"
          fontSize={12 * scale}
          fontFamily="Arial"
          fill="#999999"
          align="center"
          verticalAlign="middle"
        />
      </Group>
    );
  }

  // Compute crop for object-fit: cover
  const sRatio = image.width / image.height;
  const dRatio = dw / dh;
  let sx = 0, sy = 0, sw = image.width, sh = image.height;
  if (sRatio > dRatio) {
    sh = image.height;
    sw = sh * dRatio;
    sx = (image.width - sw) / 2;
  } else {
    sw = image.width;
    sh = sw / dRatio;
    sy = (image.height - sh) / 2;
  }

  // Rounded clip using Group clipFunc (coordinates centered at 0,0)
  const clipFunc = borderRadius > 0 ? (ctx: any) => {
    const r = Math.min(borderRadius * scale, Math.min(dw, dh) / 2);
    const x = -dw / 2, y = -dh / 2, w = dw, h = dh;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  } : undefined;

  return (
    <Group 
      x={dx + dw / 2} 
      y={dy + dh / 2} 
      rotation={(element as any).rotation || 0} 
      opacity={(element as any).opacity || 1} 
      clipFunc={clipFunc as any}
    >
      <KonvaImage
        x={-dw / 2}
        y={-dh / 2}
        width={dw}
        height={dh}
        image={image}
        crop={{ x: sx, y: sy, width: sw, height: sh }}
      />
    </Group>
  );
};

export default ThumbnailCanvas;
