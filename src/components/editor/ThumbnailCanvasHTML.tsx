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

  // Helper function to parse CSS gradients and create canvas gradients
  const parseGradient = (gradientString: string, width: number, height: number, ctx: CanvasRenderingContext2D): CanvasGradient | null => {
    try {
      console.log('🎨 THUMBNAIL CANVAS - PARSING GRADIENT:', { 
        gradientString, 
        width, 
        height,
        stringLength: gradientString.length,
        firstChar: gradientString[0],
        lastChar: gradientString[gradientString.length - 1]
      });
      
      // More flexible regex to handle various gradient formats
      const match = gradientString.match(/linear-gradient\s*\(\s*([-\d.]+)deg\s*,\s*(.+)\s*\)/i);
      if (!match) {
        console.log('❌ THUMBNAIL CANVAS - GRADIENT PARSE FAILED - No match found for:', gradientString);
        console.log('❌ THUMBNAIL CANVAS - Trying alternative regex...');
        // Try without deg
        const altMatch = gradientString.match(/linear-gradient\s*\(\s*([-\d.]+)\s*,\s*(.+)\s*\)/i);
        if (altMatch) {
          console.log('✅ THUMBNAIL CANVAS - Alternative regex matched:', altMatch);
          const angle = parseFloat(altMatch[1]);
          const colorStopsString = altMatch[2];
          const colorStops = colorStopsString.split(/,(?![^(]*\))/).map(stop => stop.trim());
          console.log('🎨 THUMBNAIL CANVAS - GRADIENT PARSED (alt):', { angle, colorStopsString, colorStops });
          
          const angleRad = (angle % 360) * Math.PI / 180;
          const x0 = width/2 - Math.cos(angleRad) * width/2;
          const y0 = height/2 - Math.sin(angleRad) * height/2;
          const x1 = width/2 + Math.cos(angleRad) * width/2;
          const y1 = height/2 + Math.sin(angleRad) * height/2;
          
          const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
          
          colorStops.forEach((stop, i) => {
            console.log(`🎨 THUMBNAIL CANVAS - PARSING COLOR STOP ${i}:`, stop);
            const parts = stop.match(/(#[a-fA-F0-9]{3,8}|rgba?\([^)]*\)|[a-zA-Z]+)\s*(\d+%?)?/);
            if (parts) {
              const color = parts[1];
              let position = 0;
              if (parts[2]) {
                position = parts[2].endsWith('%') ? parseFloat(parts[2])/100 : parseFloat(parts[2]);
              } else {
                position = i / (colorStops.length - 1);
              }
              console.log(`✅ THUMBNAIL CANVAS - COLOR STOP ${i}:`, { color, position });
              gradient.addColorStop(position, color);
            } else {
              console.log('❌ THUMBNAIL CANVAS - COLOR STOP PARSE FAILED for:', stop);
            }
          });
          
          console.log('✅ THUMBNAIL CANVAS - GRADIENT CREATED SUCCESSFULLY (alt)');
          return gradient;
        }
        return null;
      }

      const angle = parseFloat(match[1]);
      const colorStopsString = match[2];
      const colorStops = colorStopsString.split(/,(?![^(]*\))/).map(stop => stop.trim());
      console.log('🎨 THUMBNAIL CANVAS - GRADIENT PARSED:', { angle, colorStopsString, colorStops });

      // Calculate gradient direction (CSS 0deg = top to bottom, 90deg = left to right)
      const angleRad = (angle % 360) * Math.PI / 180;
      const x0 = width/2 - Math.cos(angleRad) * width/2;
      const y0 = height/2 - Math.sin(angleRad) * height/2;
      const x1 = width/2 + Math.cos(angleRad) * width/2;
      const y1 = height/2 + Math.sin(angleRad) * height/2;

      console.log('🎨 THUMBNAIL CANVAS - GRADIENT COORDINATES:', { x0, y0, x1, y1 });

      const gradient = ctx.createLinearGradient(x0, y0, x1, y1);

      // Parse each stop (supports #hex, rgb(), rgba(), etc.)
      colorStops.forEach((stop, i) => {
        console.log(`🎨 THUMBNAIL CANVAS - PARSING COLOR STOP ${i}:`, stop);
        const parts = stop.match(/(#[a-fA-F0-9]{3,8}|rgba?\([^)]*\)|[a-zA-Z]+)\s*(\d+%?)?/);
        if (parts) {
          const color = parts[1];
          let position = 0;
          if (parts[2]) {
            position = parts[2].endsWith('%') ? parseFloat(parts[2])/100 : parseFloat(parts[2]);
          } else {
            position = i / (colorStops.length - 1);
          }
          console.log(`✅ THUMBNAIL CANVAS - COLOR STOP ${i}:`, { color, position });
          gradient.addColorStop(position, color);
        } else {
          console.log('❌ THUMBNAIL CANVAS - COLOR STOP PARSE FAILED for:', stop);
        }
      });

      console.log('✅ THUMBNAIL CANVAS - GRADIENT CREATED SUCCESSFULLY');
      return gradient;
    } catch (error) {
      console.error('❌ THUMBNAIL CANVAS - ERROR PARSING GRADIENT:', error);
      return null;
    }
  };

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
            ctx.beginPath();
            // Horizontal arrows
            ctx.moveTo(0, h * 0.3);
            ctx.lineTo(w, h * 0.3);
            ctx.moveTo(0, h * 0.7);
            ctx.lineTo(w, h * 0.7);
            // Vertical arrows
            ctx.moveTo(w * 0.3, 0);
            ctx.lineTo(w * 0.3, h);
            ctx.moveTo(w * 0.7, 0);
            ctx.lineTo(w * 0.7, h);
            ctx.stroke();
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
            ctx.beginPath();
            const cloudX = w * 0.1;
            const cloudY = h * 0.4;
            const cloudW = w * 0.8;
            const cloudH = h * 0.4;
            ctx.arc(cloudX + cloudW * 0.2, cloudY + cloudH * 0.5, cloudH * 0.5, Math.PI, 0, false);
            ctx.arc(cloudX + cloudW * 0.5, cloudY, cloudH * 0.6, 0, Math.PI, false);
            ctx.arc(cloudX + cloudW * 0.8, cloudY + cloudH * 0.5, cloudH * 0.4, Math.PI, 0, false);
            ctx.arc(cloudX + cloudW * 0.5, cloudY + cloudH, cloudH * 0.5, 0, Math.PI, false);
            ctx.fill();
            ctx.stroke();
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
            ctx.beginPath();
            ctx.moveTo(0, h / 2);
            ctx.lineTo(w, h / 2);
            ctx.stroke();
            break;
            
          case 'text-box':
            ctx.fillStyle = 'transparent';
            ctx.fillRect(0, 0, w, h);
            ctx.strokeRect(0, 0, w, h);
            // Draw "T" in the center
            ctx.fillStyle = stroke;
            ctx.font = `${Math.min(w, h) * 0.3}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('T', w / 2, h / 2);
            break;
            
          default:
            // Fallback to rectangle
            ctx.fillRect(0, 0, w, h);
            ctx.strokeRect(0, 0, w, h);
            break;
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

    // Draw background with gradient support
    const backgroundValue = typeof slide.background === 'string' ? slide.background : (slide.background as any)?.background || '#ffffff';
    console.log('🎨 THUMBNAIL CANVAS - DRAWING BACKGROUND:', { 
      background: slide.background, 
      backgroundValue,
      backgroundType: typeof slide.background,
      isGradient: backgroundValue?.startsWith?.('linear-gradient'),
      slideKeys: Object.keys(slide),
      backgroundValueLength: backgroundValue?.length,
      backgroundValueChars: backgroundValue?.substring(0, 50) + '...'
    });
    
    if (backgroundValue && backgroundValue.startsWith('linear-gradient')) {
      // Handle gradient backgrounds
      console.log('🎨 THUMBNAIL CANVAS - PROCESSING GRADIENT BACKGROUND');
      
      // Test with a known good gradient first
      const testGradientString = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      console.log('🧪 THUMBNAIL CANVAS - TESTING WITH KNOWN GRADIENT:', testGradientString);
      const testGradient = parseGradient(testGradientString, width, height, ctx);
      if (testGradient) {
        console.log('✅ THUMBNAIL CANVAS - TEST GRADIENT PARSING WORKS');
      } else {
        console.log('❌ THUMBNAIL CANVAS - TEST GRADIENT PARSING FAILED');
      }
      
      const gradient = parseGradient(backgroundValue, width, height, ctx);
      if (gradient) {
        console.log('✅ THUMBNAIL CANVAS - USING PARSED GRADIENT');
        ctx.fillStyle = gradient;
      } else {
        console.log('❌ THUMBNAIL CANVAS - GRADIENT PARSING FAILED, CREATING FALLBACK GRADIENT');
        // Create a simple fallback gradient to verify gradient rendering works
        const fallbackGradient = ctx.createLinearGradient(0, 0, width, height);
        fallbackGradient.addColorStop(0, '#ff6b6b');
        fallbackGradient.addColorStop(0.5, '#4ecdc4');
        fallbackGradient.addColorStop(1, '#45b7d1');
        ctx.fillStyle = fallbackGradient;
        console.log('🎨 THUMBNAIL CANVAS - USING FALLBACK GRADIENT (red to teal to blue)');
      }
    } else {
      // Handle solid color backgrounds
      console.log('🎨 THUMBNAIL CANVAS - USING SOLID COLOR:', backgroundValue);
      ctx.fillStyle = backgroundValue;
    }
    ctx.fillRect(0, 0, width, height);
    console.log('🎨 THUMBNAIL CANVAS - BACKGROUND DRAWN');

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
