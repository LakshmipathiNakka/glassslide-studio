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
        // Background color for text
        if (element.backgroundColor) {
          ctx.fillStyle = element.backgroundColor;
          ctx.fillRect(0, 0, w, h);
        }
        
        // Text styling
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
        
        // Border for text
        if (element.borderColor && element.borderWidth) {
          ctx.strokeStyle = element.borderColor;
          ctx.lineWidth = (element.borderWidth || 0) * scale;
          ctx.strokeRect(0, 0, w, h);
        }
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
          // Background
          ctx.fillStyle = element.backgroundColor || '#0078d4';
          ctx.fillRect(0, 0, w, h);
          
          // Border
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
        
        // Add image icon
        ctx.fillStyle = '#999';
        ctx.font = `${12 * scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('📷', w / 2, h / 2);
        break;

      case 'chart':
        // Background
        ctx.fillStyle = element.backgroundColor || '#f8f9fa';
        ctx.fillRect(0, 0, w, h);
        
        // Border
        if (element.borderColor && element.borderWidth) {
          ctx.strokeStyle = element.borderColor;
          ctx.lineWidth = (element.borderWidth || 2) * scale;
          ctx.strokeRect(0, 0, w, h);
        }
        
        // Render chart based on type
        if (element.chartType && element.chartData) {
          renderChart(ctx, element, w, h, scale);
        } else {
          // Fallback chart representation
          ctx.fillStyle = '#666';
          ctx.font = `${10 * scale}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('📊 Chart', w / 2, h / 2);
        }
        break;

      case 'table':
        // Background
        ctx.fillStyle = element.backgroundColor || '#ffffff';
        ctx.fillRect(0, 0, w, h);
        
        // Border
        if (element.borderColor && element.borderWidth) {
          ctx.strokeStyle = element.borderColor;
          ctx.lineWidth = (element.borderWidth || 1) * scale;
          ctx.strokeRect(0, 0, w, h);
        }
        
        // Table representation
        ctx.fillStyle = '#666';
        ctx.font = `${10 * scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('📋 Table', w / 2, h / 2);
        break;
    }

    ctx.restore();
  };

  // Render chart based on type
  const renderChart = (ctx: CanvasRenderingContext2D, element: Element, w: number, h: number, scale: number) => {
    const chartData = element.chartData;
    if (!chartData || !chartData.labels || !chartData.datasets) return;

    const padding = 10 * scale;
    const chartWidth = w - (padding * 2);
    const chartHeight = h - (padding * 2);
    const chartX = padding;
    const chartY = padding;

    // Chart title
    if (chartData.title) {
      ctx.fillStyle = chartData.titleColor || '#000000';
      ctx.font = `${(chartData.titleFontSize || 14) * scale}px ${chartData.titleFontFamily || 'Arial'}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(chartData.title, w / 2, 5 * scale);
    }

    const labels = chartData.labels;
    const datasets = chartData.datasets;
    const maxValue = Math.max(...datasets.flatMap(ds => ds.data));

    if (element.chartType === 'bar') {
      // Bar chart
      const barWidth = chartWidth / labels.length * 0.6;
      const barSpacing = chartWidth / labels.length * 0.4;
      
      labels.forEach((label: string, i: number) => {
        const x = chartX + i * (barWidth + barSpacing) + barSpacing / 2;
        
        datasets.forEach((dataset: any, dsIndex: number) => {
          const value = dataset.data[i] || 0;
          const barHeight = (value / maxValue) * chartHeight;
          const y = chartY + chartHeight - barHeight;
          
          ctx.fillStyle = dataset.backgroundColor || `hsl(${dsIndex * 60}, 70%, 50%)`;
          ctx.fillRect(x, y, barWidth, barHeight);
        });
      });
    } else if (element.chartType === 'line') {
      // Line chart
      datasets.forEach((dataset: any, dsIndex: number) => {
        ctx.strokeStyle = dataset.borderColor || dataset.backgroundColor || `hsl(${dsIndex * 60}, 70%, 50%)`;
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        
        dataset.data.forEach((value: number, i: number) => {
          const x = chartX + (i / (labels.length - 1)) * chartWidth;
          const y = chartY + chartHeight - (value / maxValue) * chartHeight;
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
      });
    } else if (element.chartType === 'pie') {
      // Pie chart
      const centerX = chartX + chartWidth / 2;
      const centerY = chartY + chartHeight / 2;
      const radius = Math.min(chartWidth, chartHeight) / 2 - 10 * scale;
      
      let currentAngle = 0;
      const total = datasets[0]?.data.reduce((sum: number, val: number) => sum + val, 0) || 1;
      
      datasets[0]?.data.forEach((value: number, i: number) => {
        const sliceAngle = (value / total) * 2 * Math.PI;
        
        ctx.fillStyle = datasets[0].backgroundColor || `hsl(${i * 60}, 70%, 50%)`;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fill();
        
        currentAngle += sliceAngle;
      });
    }
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
  }, [slide.elements, slide.background, slide.lastUpdated, width, height, scale]);

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
