import React, { useRef, useEffect } from 'react';
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

  // Helper function to parse CSS gradients and create canvas gradients
  const parseGradient = (gradientString: string, width: number, height: number, ctx: CanvasRenderingContext2D): CanvasGradient | null => {
    try {
      
      // More flexible regex to handle various gradient formats
      const match = gradientString.match(/linear-gradient\s*\(\s*([-\d.]+)deg\s*,\s*(.+)\s*\)/i);
      if (!match) {
        // Try without deg
        const altMatch = gradientString.match(/linear-gradient\s*\(\s*([-\d.]+)\s*,\s*(.+)\s*\)/i);
        if (altMatch) {
          const angle = parseFloat(altMatch[1]);
          const colorStopsString = altMatch[2];
          const colorStops = colorStopsString.split(/,(?![^(]*\))/).map(stop => stop.trim());

          const angleRad = (angle % 360) * Math.PI / 180;
          const x0 = width/2 - Math.cos(angleRad) * width/2;
          const y0 = height/2 - Math.sin(angleRad) * height/2;
          const x1 = width/2 + Math.cos(angleRad) * width/2;
          const y1 = height/2 + Math.sin(angleRad) * height/2;
          
          const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
          
          colorStops.forEach((stop, i) => {
            const parts = stop.match(/(#[a-fA-F0-9]{3,8}|rgba?\([^)]*\)|[a-zA-Z]+)\s*(\d+%?)?/);
            if (parts) {
              const color = parts[1];
              let position = 0;
              if (parts[2]) {
                position = parts[2].endsWith('%') ? parseFloat(parts[2])/100 : parseFloat(parts[2]);
              } else {
                position = i / (colorStops.length - 1);
              }
              gradient.addColorStop(position, color);
            }
          });
          
          return gradient;
        }
        return null;
      }

      const angle = parseFloat(match[1]);
      const colorStopsString = match[2];
      const colorStops = colorStopsString.split(/,(?![^(]*\))/).map(stop => stop.trim());

      // Calculate gradient direction (CSS 0deg = top to bottom, 90deg = left to right)
      const angleRad = (angle % 360) * Math.PI / 180;
      const x0 = width/2 - Math.cos(angleRad) * width/2;
      const y0 = height/2 - Math.sin(angleRad) * height/2;
      const x1 = width/2 + Math.cos(angleRad) * width/2;
      const y1 = height/2 + Math.sin(angleRad) * height/2;

      const gradient = ctx.createLinearGradient(x0, y0, x1, y1);

      // Parse each stop (supports #hex, rgb(), rgba(), etc.)
      colorStops.forEach((stop, i) => {
        const parts = stop.match(/(#[a-fA-F0-9]{3,8}|rgba?\([^)]*\)|[a-zA-Z]+)\s*(\d+%?)?/);
        if (parts) {
          const color = parts[1];
          let position = 0;
          if (parts[2]) {
            position = parts[2].endsWith('%') ? parseFloat(parts[2])/100 : parseFloat(parts[2]);
          } else {
            position = i / (colorStops.length - 1);
          }
          gradient.addColorStop(position, color);
        }
      });

      return gradient;
    } catch (error) {
      return null;
    }
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
        // Draw shape with proper scaling and styling
        const fill = element.fill || 'transparent';
        const stroke = element.stroke || '#000000';
        const strokeWidth = (element.strokeWidth || 0.5) * scale;
        
        ctx.fillStyle = fill;
        ctx.strokeStyle = stroke;
        ctx.lineWidth = strokeWidth;
        
        switch (element.shapeType) {
          case 'rectangle':
            ctx.fillRect(0, 0, w, h);
            ctx.strokeRect(0, 0, w, h);
            break;
            
          case 'rounded-rectangle':
            const borderRadius = 8 * scale;
            ctx.beginPath();
            ctx.roundRect(0, 0, w, h, borderRadius);
            ctx.fill();
            ctx.stroke();
            break;
            
          case 'circle':
            ctx.beginPath();
            ctx.arc(w / 2, h / 2, Math.min(w, h) / 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            break;
            
          case 'triangle':
            ctx.beginPath();
            ctx.moveTo(w / 2, 0);
            ctx.lineTo(w, h);
            ctx.lineTo(0, h);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
            
          case 'star':
            ctx.beginPath();
            const centerX = w / 2;
            const centerY = h / 2;
            const outerRadius = Math.min(w, h) / 2;
            const innerRadius = outerRadius * 0.4;
            const spikes = 5;
            const step = Math.PI / spikes;
            
            for (let i = 0; i < 2 * spikes; i++) {
              const radius = i % 2 === 0 ? outerRadius : innerRadius;
              const angle = i * step - Math.PI / 2;
              const x = centerX + Math.cos(angle) * radius;
              const y = centerY + Math.sin(angle) * radius;
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
            
          case 'arrow-right':
            ctx.beginPath();
            ctx.moveTo(0, h / 2);
            ctx.lineTo(w * 0.7, h / 2);
            ctx.lineTo(w * 0.7, 0);
            ctx.lineTo(w, h / 2);
            ctx.lineTo(w * 0.7, h);
            ctx.lineTo(w * 0.7, h / 2);
            ctx.stroke();
            break;
            
          case 'arrow-double':
            // Skip rendering for double arrow in thumbnail
            break;
            
          case 'diamond':
            ctx.beginPath();
            ctx.moveTo(w / 2, 0);
            ctx.lineTo(w, h / 2);
            ctx.lineTo(w / 2, h);
            ctx.lineTo(0, h / 2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
            
          case 'pentagon':
            ctx.beginPath();
            const pentCenterX = w / 2;
            const pentCenterY = h / 2;
            const pentRadius = Math.min(w, h) / 2;
            for (let i = 0; i < 5; i++) {
              const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
              const x = pentCenterX + Math.cos(angle) * pentRadius;
              const y = pentCenterY + Math.sin(angle) * pentRadius;
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
            
          case 'hexagon':
            ctx.beginPath();
            const hexCenterX = w / 2;
            const hexCenterY = h / 2;
            const hexRadius = Math.min(w, h) / 2;
            for (let i = 0; i < 6; i++) {
              const angle = (i * Math.PI) / 3;
              const x = hexCenterX + Math.cos(angle) * hexRadius;
              const y = hexCenterY + Math.sin(angle) * hexRadius;
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
            
          case 'cloud':
            // Skip rendering for cloud in thumbnail
            break;
            
          case 'heart':
            ctx.beginPath();
            const heartX = w / 2;
            const heartY = h * 0.3;
            const heartSize = Math.min(w, h) * 0.3;
            ctx.moveTo(heartX, heartY + heartSize * 0.3);
            ctx.bezierCurveTo(heartX, heartY, heartX - heartSize * 0.5, heartY, heartX - heartSize * 0.5, heartY + heartSize * 0.3);
            ctx.bezierCurveTo(heartX - heartSize * 0.5, heartY + heartSize * 0.7, heartX, heartY + heartSize * 0.7, heartX, heartY + heartSize);
            ctx.bezierCurveTo(heartX, heartY + heartSize * 0.7, heartX + heartSize * 0.5, heartY + heartSize * 0.7, heartX + heartSize * 0.5, heartY + heartSize * 0.3);
            ctx.bezierCurveTo(heartX + heartSize * 0.5, heartY, heartX, heartY, heartX, heartY + heartSize * 0.3);
            ctx.fill();
            ctx.stroke();
            break;
            
          case 'lightning':
            ctx.beginPath();
            ctx.moveTo(w * 0.3, 0);
            ctx.lineTo(w * 0.7, h * 0.4);
            ctx.lineTo(w * 0.5, h * 0.4);
            ctx.lineTo(w * 0.9, h);
            ctx.lineTo(w * 0.1, h * 0.6);
            ctx.lineTo(w * 0.3, h * 0.6);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
            
          case 'line':
            // Skip rendering for line in thumbnail
            break;
            
          case 'text-box':
            // Skip rendering for text-box in thumbnail
            break;
            
          default:
            // Fallback to rectangle
            ctx.fillRect(0, 0, w, h);
            ctx.strokeRect(0, 0, w, h);
            break;
        }
        break;

      case 'image':
        // Render actual images for thumbnails
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          ctx.drawImage(img, 0, 0, w, h);

          // Apply border styling
          if (element.borderColor && element.borderWidth) {
            ctx.strokeStyle = element.borderColor;
            ctx.lineWidth = (element.borderWidth || 1) * scale;
            ctx.strokeRect(0, 0, w, h);
          }
        };
        img.onerror = () => {
          // Show placeholder if image fails to load
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
        };
        img.src = element.imageUrl || '';
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

    // Draw background with gradient support
    const backgroundValue = typeof slide.background === 'string' ? slide.background : (slide.background as any)?.background || '#ffffff';
    
    if (backgroundValue && backgroundValue.startsWith('linear-gradient')) {
      // Handle gradient backgrounds
      // Test with a known good gradient first
      const testGradientString = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      const testGradient = parseGradient(testGradientString, width, height, ctx);
      if (testGradient) {
        // Test gradient parsing works
      }
      
      const gradient = parseGradient(backgroundValue, width, height, ctx);
      if (gradient) {
        ctx.fillStyle = gradient;
      } else {
        // Create a simple fallback gradient to verify gradient rendering works
        const fallbackGradient = ctx.createLinearGradient(0, 0, width, height);
        fallbackGradient.addColorStop(0, '#ff6b6b');
        fallbackGradient.addColorStop(0.5, '#4ecdc4');
        fallbackGradient.addColorStop(1, '#45b7d1');
        ctx.fillStyle = fallbackGradient;
      }
    } else {
      // Handle solid color backgrounds
      ctx.fillStyle = backgroundValue;
    }
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
