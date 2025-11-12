import React, { useRef, useEffect, useState } from 'react';
import { ThumbnailCanvasProps } from '@/types/slide-thumbnails';
import { Element } from '@/hooks/use-action-manager';
import { TABLE_THEMES } from '@/constants/tableThemes';

// Simple image cache to avoid reload flicker during live updates
const IMAGE_CACHE = new Map<string, HTMLImageElement>();

const ThumbnailCanvasHTML: React.FC<ThumbnailCanvasProps> = ({
  slide,
  width,
  height,
  scale = 0.15,
  className = '',
  responsive = false,
  overrideElements,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgTick, setImgTick] = useState(0); // force redraw after async image load

  // Helper function to parse CSS gradients and create canvas gradients
  const parseGradient = (gradientString: string, width: number, height: number, ctx: CanvasRenderingContext2D): CanvasGradient | null => {
    try {
      const str = gradientString.trim();
      // Radial gradient: radial-gradient(<rx>px <ry>px at <x>% <y>%, color stops...)
      if (/^radial-gradient/i.test(str)) {
        // Extract radii and center if provided
        // Matches: radial-gradient(1200px 700px at 50% 40%, ...)
        const m = str.match(/radial-gradient\s*\(\s*(?:(\d+)px\s+(\d+)px\s+at\s+([\d.]+)%\s+([\d.]+)%|at\s+([\d.]+)%\s+([\d.]+)%)\s*,\s*(.+)\)$/i);
        let rx: number | null = null;
        let ry: number | null = null;
        let cx = 50;
        let cy = 50;
        let stopsStr = '';
        if (m) {
          if (m[1] && m[2] && m[3] && m[4]) {
            rx = parseFloat(m[1]);
            ry = parseFloat(m[2]);
            cx = parseFloat(m[3]);
            cy = parseFloat(m[4]);
            stopsStr = m[7] || '';
          } else {
            cx = parseFloat(m[5] || '50');
            cy = parseFloat(m[6] || '50');
            stopsStr = m[7] || '';
          }
        } else {
          // Fallback: try to split at first ')' to get stops
          const idx = str.indexOf('(');
          const close = str.lastIndexOf(')');
          stopsStr = idx >= 0 && close > idx ? str.slice(idx + 1, close) : '';
        }
        // Default radii: cover canvas
        const r = Math.hypot(width, height) / 2;
        const radX = rx ?? r;
        const radY = ry ?? r;
        // Build elliptical radial by scaling context
        const centerX = (cx / 100) * width;
        const centerY = (cy / 100) * height;
        // Create a temporary gradient in unit circle space, we'll scale when filling
        const g = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(radX, radY));
        const colorStops = (stopsStr || '').split(/,(?![^()]*\))/).map(s => s.trim()).filter(Boolean);
        colorStops.forEach((stop, i) => {
          const parts = stop.match(/(#[a-fA-F0-9]{3,8}|rgba?\([^)]*\)|[a-zA-Z]+)\s*(\d+%?)?/);
          if (parts) {
            const color = parts[1];
            let pos = i / Math.max(1, colorStops.length - 1);
            if (parts[2]) {
              pos = parts[2].endsWith('%') ? parseFloat(parts[2]) / 100 : parseFloat(parts[2]);
            }
            g.addColorStop(Math.min(1, Math.max(0, pos)), color);
          }
        });
        return g;
      }

      // Linear gradient: linear-gradient(angle[, stops])
      const match = str.match(/linear-gradient\s*\(\s*([-\d.]+)deg\s*,\s*(.+)\s*\)/i);
      if (!match) {
        // Try without deg
        const altMatch = str.match(/linear-gradient\s*\(\s*([-\d.]+)\s*,\s*(.+)\s*\)/i);
        if (altMatch) {
          const angle = parseFloat(altMatch[1]);
          const colorStopsString = altMatch[2];
          const colorStops = colorStopsString.split(/,(?![^()]*\))/).map(stop => stop.trim());

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
      const colorStops = colorStopsString.split(/,(?![^()]*\))/).map(stop => stop.trim());

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

  // Simple HTML stripper for table cell text
  const stripHtml = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html || '';
    return (div.textContent || div.innerText || '').trim();
  };

  // Render helpers
  const drawImageCover = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    dx: number,
    dy: number,
    dWidth: number,
    dHeight: number
  ) => {
    const sRatio = img.width / img.height;
    const dRatio = dWidth / dHeight;
    let sx = 0, sy = 0, sw = img.width, sh = img.height;
    if (sRatio > dRatio) {
      // source is wider -> crop left/right
      sh = img.height;
      sw = sh * dRatio;
      sx = (img.width - sw) / 2;
    } else {
      // source is taller -> crop top/bottom
      sw = img.width;
      sh = sw / dRatio;
      sy = (img.height - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dWidth, dHeight);
  };

  const drawWrappedText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    align: CanvasTextAlign
  ) => {
    const words = text.split(/\s+/);
    let line = '';
    let ty = y;
    for (let n = 0; n < words.length; n++) {
      const testLine = line ? line + ' ' + words[n] : words[n];
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        // draw current line
        if (align === 'center') ctx.fillText(line, x + maxWidth / 2, ty);
        else if (align === 'right') ctx.fillText(line, x + maxWidth, ty);
        else ctx.fillText(line, x, ty);
        line = words[n];
        ty += lineHeight;
      } else {
        line = testLine;
      }
    }
    if (line) {
      if (align === 'center') ctx.fillText(line, x + maxWidth / 2, ty);
      else if (align === 'right') ctx.fillText(line, x + maxWidth, ty);
      else ctx.fillText(line, x, ty);
    }
  };

  const effectiveSlide = { ...slide, elements: overrideElements ?? slide.elements };

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
      case 'text': {
        // Background
        if (element.backgroundColor) {
          ctx.fillStyle = element.backgroundColor;
          ctx.fillRect(0, 0, w, h);
        }
        // Border
        if (element.borderColor && element.borderWidth) {
          ctx.strokeStyle = element.borderColor;
          ctx.lineWidth = (element.borderWidth || 0) * scale;
          ctx.strokeRect(0, 0, w, h);
        }
        // Text styling
        const padding = (element as any).padding ?? 8;
        const htmlRaw = ((element as any).content || '') as string;
        const content = ((element.text || '') || stripHtml(htmlRaw) || '').toString().trim();
        ctx.fillStyle = element.color || '#000000';
        ctx.font = `${element.fontWeight || 'normal'} ${(element.fontSize || 16) * scale}px ${element.fontFamily || 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif'}`;
        const align = ((element.textAlign as CanvasTextAlign) || 'left');
        ctx.textAlign = align;
        ctx.textBaseline = 'top';
        const maxWidth = Math.max(0, w - 2 * padding * scale);
        const startX = padding * scale;
        const startY = padding * scale;
        if (content.length > 0) {
          drawWrappedText(ctx, content.replace(/\n/g, ' '), startX, startY, maxWidth, (element.fontSize || 16) * scale * 1.2, align);
        }
        break;
      }

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
            
          // Removed arrow-right shape
            
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
            
          case 'octagon':
            ctx.beginPath();
            const octCenterX = w / 2;
            const octCenterY = h / 2;
            const octRadius = Math.min(w, h) / 2;
            for (let i = 0; i < 8; i++) {
              const angle = (i * Math.PI) / 4 - Math.PI / 2;
              const x = octCenterX + Math.cos(angle) * octRadius;
              const y = octCenterY + Math.sin(angle) * octRadius;
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
            
          case 'parallelogram':
            ctx.beginPath();
            ctx.moveTo(w * 0.3, 0);
            ctx.lineTo(w, 0);
            ctx.lineTo(w * 0.7, h);
            ctx.lineTo(0, h);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
            
          case 'trapezoid':
            ctx.beginPath();
            ctx.moveTo(w * 0.2, 0);
            ctx.lineTo(w * 0.8, 0);
            ctx.lineTo(w, h);
            ctx.lineTo(0, h);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
            
          case 'cross':
            // Draw cross using two rectangles
            const crossWidth = Math.min(w, h) * 0.2;
            const crossLength = Math.max(w, h) * 0.8;
            
            // Horizontal bar
            ctx.fillRect((w - crossLength) / 2, (h - crossWidth) / 2, crossLength, crossWidth);
            // Vertical bar
            ctx.fillRect((w - crossWidth) / 2, (h - crossLength) / 2, crossWidth, crossLength);
            
            // Stroke outline
            ctx.strokeRect((w - crossLength) / 2, (h - crossWidth) / 2, crossLength, crossWidth);
            ctx.strokeRect((w - crossWidth) / 2, (h - crossLength) / 2, crossWidth, crossLength);
            break;
            
          case 'semicircle':
            // Draw semicircle (top half)
            ctx.beginPath();
            ctx.arc(w / 2, h / 2, Math.min(w, h) / 2, 0, Math.PI, true);
            ctx.lineTo(w, h / 2);
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

      case 'image': {
        const borderRadius = (element as any).borderRadius || 0;
        const hasRadius = borderRadius > 0;
        const primary = (element as any).imageUrl || (element as any).src || (element as any).content || '';
        const fallbacks: string[] = [];
        const extra = (element as any).imageUrls as string[] | undefined;
        if (Array.isArray(extra)) fallbacks.push(...extra);
        const sources = [primary, ...fallbacks].filter(Boolean);

        const drawLoaded = (img: HTMLImageElement) => {
          // Re-apply transform for safety
          ctx.save();
          const angle = ((element.rotation || 0) * Math.PI) / 180;
          if (element.rotation) {
            ctx.translate(x + w / 2, y + h / 2);
            ctx.rotate(angle);
            ctx.translate(-w / 2, -h / 2);
          } else {
            ctx.translate(x, y);
          }
          // Clear background (transparent)
          // Draw image with contain fit
          const sRatio = img.width / img.height;
          const dRatio = w / h;
          let dw = w, dh = h, dx = 0, dy = 0;
          if (sRatio > dRatio) {
            dw = w;
            dh = w / sRatio;
            dx = 0; dy = (h - dh) / 2;
          } else {
            dh = h;
            dw = h * sRatio;
            dx = (w - dw) / 2; dy = 0;
          }
          if (hasRadius) {
            const r = borderRadius * scale;
            ctx.beginPath();
            const rradius = Math.min(r, w / 2, h / 2);
            ctx.moveTo(rradius, 0);
            ctx.arcTo(w, 0, w, h, rradius);
            ctx.arcTo(w, h, 0, h, rradius);
            ctx.arcTo(0, h, 0, 0, rradius);
            ctx.arcTo(0, 0, w, 0, rradius);
            ctx.closePath();
            ctx.clip();
          }
          ctx.drawImage(img, dx, dy, dw, dh);
          ctx.restore();
        };

        const tryLoad = (i: number) => {
          if (i >= sources.length) return;
          const src = sources[i];
          const cached = src ? IMAGE_CACHE.get(src) : null;
          if (cached && cached.complete) {
            drawLoaded(cached);
            return;
          }
          const img = new Image();
          if (/^https?:/i.test(src)) img.crossOrigin = 'anonymous';
          img.onload = () => {
            IMAGE_CACHE.set(src, img);
            drawLoaded(img);
          };
          img.onerror = () => tryLoad(i + 1);
          img.src = src;
        };

        // Immediate placeholder (transparent bg)
        if ((element as any).backgroundColor) {
          ctx.save();
          ctx.translate(x, y);
          ctx.fillStyle = (element as any).backgroundColor as string;
          ctx.fillRect(0, 0, w, h);
          ctx.restore();
        }

        if (sources.length > 0) tryLoad(0);
        break;
      }

      case 'chart':
        // Transparent chart background in thumbnails to match editor
        ctx.fillStyle = 'rgba(0,0,0,0)';
        // No background fillRect to preserve slide background
        
        // Border (optional)
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

      case 'table': {
        const rows = Math.max(1, (element as any).rows || 3);
        const cols = Math.max(1, (element as any).cols || 3);
        const cellPadding = (element as any).cellPadding ?? 6;
        const borderWidth = ((element as any).borderWidth ?? 1) * scale;
        // Get theme if exists
        const theme = (element as any).themeId ? 
          TABLE_THEMES.find(t => t.id === (element as any).themeId) : null;
          
        const header = !!(element as any).header;
        const headerBg = theme?.headerBg || (element as any).headerBg || '#E7E6E6';
        const headerTextColor = theme?.headerTextColor || (element as any).headerTextColor || '#111827';
        const rowAltBg = (element as any).rowAltBg || null;
        const rowEvenBg = theme?.rowEvenBg || (element as any).backgroundColor || '#FFFFFF';
        const rowOddBg = theme?.rowOddBg || rowAltBg || (theme?.rowEvenBg ? 'rgba(0,0,0,0.02)' : 'transparent');
        const textColor = theme?.textColor || (element as any).color || '#000000';
        const borderColor = theme?.borderColor || (element as any).borderColor || '#D9D9D9';
        const textAlign = (element as any).cellTextAlign || 'left';
        const fontFamily = (element as any).fontFamily || 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif';
        const fontSize = ((element as any).fontSize || 16) * scale;

        // Outer border/background
        ctx.fillStyle = '#00000000';
        ctx.fillRect(0, 0, w, h);
        if (borderWidth > 0) {
          ctx.strokeStyle = borderColor;
          ctx.lineWidth = borderWidth;
          ctx.strokeRect(0, 0, w, h);
        }

        const cellW = w / cols;
        const cellH = h / rows;

        // Draw cells
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const cx = c * cellW;
            const cy = r * cellH;

            // Background per row/header
            const isHeader = header && r === 0;
            const isEvenRow = ((header ? r - 1 : r) % 2 === 0);
            const bg = isHeader ? headerBg : (isEvenRow ? rowEvenBg : rowOddBg);
            if (bg && bg !== 'transparent') {
              ctx.fillStyle = bg as string;
              ctx.fillRect(cx, cy, cellW, cellH);
            }

            // Cell border (inner grid)
            if (borderWidth > 0) {
              ctx.strokeStyle = borderColor;
              ctx.lineWidth = borderWidth;
              ctx.strokeRect(cx, cy, cellW, cellH);
            }

            // Text
            const tableData = (element as any).tableData as string[][] | undefined;
            const raw = tableData?.[r]?.[c] ?? '';
            const text = stripHtml(raw);

            ctx.fillStyle = isHeader ? headerTextColor : textColor;
            ctx.font = `${isHeader ? '600 ' : ''}${Math.max(10 * scale, fontSize)}px ${fontFamily}`;
            ctx.textBaseline = 'top';
            // Horizontal alignment
            let tx = cx + cellPadding * scale;
            if (textAlign === 'center') tx = cx + cellW / 2;
            if (textAlign === 'right') tx = cx + cellW - cellPadding * scale;

            const ty = cy + cellPadding * scale;
            ctx.textAlign = (textAlign as CanvasTextAlign) || 'left';

            // Simple single-line with clipping
            ctx.save();
            ctx.beginPath();
            ctx.rect(cx + cellPadding * scale, cy + cellPadding * scale, cellW - 2 * cellPadding * scale, cellH - 2 * cellPadding * scale);
            ctx.clip();
            if (textAlign === 'center') {
              ctx.fillText(text, cx + cellW / 2, ty);
            } else if (textAlign === 'right') {
              ctx.fillText(text, cx + cellW - cellPadding * scale, ty);
            } else {
              ctx.fillText(text, cx + cellPadding * scale, ty);
            }
            ctx.restore();
          }
        }
        break;
      }
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
    const chartY = padding + (chartData.title ? 14 * scale : 0);
    const usableHeight = chartHeight - (chartData.title ? 14 * scale : 0) - (10 * scale);

    // Axes (for bar/line charts) + grid + tick labels
    if (element.chartType === 'bar' || element.chartType === 'line') {
      ctx.strokeStyle = '#9ca3af';
      ctx.lineWidth = Math.max(1, 1 * scale);
      // X axis
      ctx.beginPath();
      ctx.moveTo(chartX, chartY + usableHeight);
      ctx.lineTo(chartX + chartWidth, chartY + usableHeight);
      ctx.stroke();
      // Y axis
      ctx.beginPath();
      ctx.moveTo(chartX, chartY);
      ctx.lineTo(chartX, chartY + usableHeight);
      ctx.stroke();

      // Grid and Y tick labels
      const tickCount = 4;
      const datasets = chartData.datasets || [];
      const maxValue = Math.max(1, ...datasets.flatMap((ds: any) => ds.data || [0]));
      const labelFont = Math.max(5, Math.min(7, usableHeight * 0.07));
      ctx.font = `${labelFont}px Arial`;
      ctx.fillStyle = '#6b7280';
      ctx.textBaseline = 'middle';
      for (let i = 0; i <= tickCount; i++) {
        const ratio = i / tickCount;
        const ty = chartY + usableHeight - ratio * usableHeight;
        // grid line
        ctx.strokeStyle = i === 0 ? '#9ca3af' : 'rgba(156,163,175,0.35)';
        ctx.lineWidth = Math.max(1, 1 * scale);
        ctx.beginPath();
        ctx.moveTo(chartX, ty);
        ctx.lineTo(chartX + chartWidth, ty);
        ctx.stroke();
        // label (draw just inside chart area for visibility)
        const val = Math.round((ratio * maxValue));
        ctx.textAlign = 'left';
        ctx.fillText(String(val), chartX + 2 * scale, ty);
      }

      // X labels (sample if too many)
      const labels: string[] = chartData.labels || [];
      const groupW = chartWidth / Math.max(1, labels.length);
      const showEvery = labels.length > 6 ? Math.ceil(labels.length / 6) : 1;
      const xLabelFont = Math.max(5, Math.min(7, usableHeight * 0.07));
      ctx.font = `${xLabelFont}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      for (let i = 0; i < labels.length; i += showEvery) {
        const lx = chartX + i * groupW + groupW / 2;
        ctx.fillText(labels[i], lx, chartY + usableHeight + 2 * scale);
      }
    }

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
      // Grouped Bar chart
      const groupWidth = chartWidth / labels.length;
      const innerPad = groupWidth * 0.2;
      const seriesCount = Math.max(1, datasets.length);
      const barWidth = (groupWidth - innerPad * 2) / seriesCount;

      labels.forEach((label: string, i: number) => {
        const gx = chartX + i * groupWidth + innerPad;
        datasets.forEach((dataset: any, dsIndex: number) => {
          const value = Number(dataset.data?.[i] || 0);
          const barHeight = (value / maxValue) * usableHeight;
          const y = chartY + usableHeight - barHeight;
          const x = gx + dsIndex * barWidth;
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
          const x = chartX + (i / Math.max(1, labels.length - 1)) * chartWidth;
          const y = chartY + usableHeight - (value / maxValue) * usableHeight;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
        // points
        dataset.data.forEach((value: number, i: number) => {
          const x = chartX + (i / Math.max(1, labels.length - 1)) * chartWidth;
          const y = chartY + usableHeight - (value / maxValue) * usableHeight;
          ctx.beginPath();
          ctx.arc(x, y, 1.5 * scale, 0, Math.PI * 2);
          ctx.fillStyle = ctx.strokeStyle as string;
          ctx.fill();
        });
      });
    } else if (element.chartType === 'pie') {
      // Pie chart
      const centerX = chartX + chartWidth / 2;
      const centerY = chartY + chartHeight / 2;
      // Ensure radius is always positive with a minimum value
      const calculatedRadius = Math.min(chartWidth, chartHeight) / 2 - 10 * scale;
      const radius = Math.max(5, calculatedRadius); // Minimum radius of 5 pixels
      
      // Only render if we have valid dimensions
      if (radius > 0 && chartWidth > 0 && chartHeight > 0) {
        let currentAngle = 0;
        const total = datasets[0]?.data.reduce((sum: number, val: number) => sum + val, 0) || 1;
        const bg = (datasets[0]?.backgroundColor as (string[] | string)) || [];
        const FALLBACK_PIE_COLORS = ['#007AFF','#FF3B30','#34C759','#FF9500','#AF52DE','#5AC8FA','#FFCC00','#8E8E93','#FF2D92','#30D158'];
        
        datasets[0]?.data.forEach((value: number, i: number) => {
          const sliceAngle = (value / total) * 2 * Math.PI;
          
          const fill = Array.isArray(bg) ? (bg[i] || FALLBACK_PIE_COLORS[i % FALLBACK_PIE_COLORS.length]) : FALLBACK_PIE_COLORS[i % FALLBACK_PIE_COLORS.length];
          ctx.fillStyle = fill;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
          ctx.closePath();
          ctx.fill();
          
          currentAngle += sliceAngle;
        });
      }
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
    
    if (backgroundValue && /^linear-gradient/i.test(backgroundValue)) {
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
    } else if (backgroundValue && /^radial-gradient/i.test(backgroundValue)) {
      const gradient = parseGradient(backgroundValue, width, height, ctx);
      if (gradient) {
        ctx.fillStyle = gradient;
      } else {
        // Fallback radial-like gradient
        const g = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.hypot(width, height)/2);
        g.addColorStop(0, '#1f3a93');
        g.addColorStop(1, '#0b132b');
        ctx.fillStyle = g;
      }
    } else {
      // Handle solid color backgrounds
      ctx.fillStyle = backgroundValue;
    }
    ctx.fillRect(0, 0, width, height);

    // Draw elements in zIndex order (lower first)
    const ordered = [...slide.elements].sort((a: any, b: any) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
    ordered.forEach(element => {
      renderElement(ctx, element as any);
    });

    // Generate data URL for caching
    let dataURL: string | null = null;
    try {
      dataURL = canvas.toDataURL('image/png', 0.8);
    } catch (e) {
      // Canvas may be tainted if remote images lack CORS; ignore caching in that case
      dataURL = null;
    }
    
    // Update slide thumbnail if it has changed
    if (dataURL && slide.thumbnail !== dataURL) {
      // This would typically be handled by the parent component
      // For now, we just render the preview
    }
  }, [slide.elements, slide.background, slide.lastUpdated, width, height, scale, imgTick]);

  return (
    <div className={`thumbnail-canvas ${className}`} style={responsive ? { width: '100%', height: '100%' } : { width, height }}>
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
