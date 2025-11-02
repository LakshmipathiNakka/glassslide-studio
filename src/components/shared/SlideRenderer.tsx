import React, { memo } from 'react';
import type { Slide } from '@/types/slide-thumbnails';
import type { Element } from '@/hooks/use-action-manager';
import { ChartJSChart } from '@/components/editor/ChartJSChart';

export type SlideRenderMode = 'editor' | 'thumbnail' | 'presentation' | 'export';

interface Props {
  slide: Slide;
  mode: SlideRenderMode;
  scale?: number; // multiplies slide virtual 1024x768
  className?: string;
  onElementSelect?: (el: Element | null) => void; // only used in editor
}

const BASE_W = 960;
const BASE_H = 540;

const SlideRenderer: React.FC<Props> = ({ slide, mode, scale = 1, className = '', onElementSelect }) => {
  const interactive = mode === 'editor';
  const s = scale;

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: BASE_W * s,
        height: BASE_H * s,
        overflow: 'hidden',
        background: slide.background,
        borderRadius: mode === 'presentation' ? 0 : 8,
      }}
      data-mode={mode}
    >
      {slide.elements.map((el) => (
        <div
          key={el.id}
          style={styleFor(el, s)}
          onClick={interactive ? (e) => { e.stopPropagation(); onElementSelect?.(el as Element); } : undefined}
        >
          {renderContent(el as Element)}
        </div>
      ))}
    </div>
  );
};

function styleFor(el: Element, s: number): React.CSSProperties {
  return {
    position: 'absolute',
    left: el.x * s,
    top: el.y * s,
    width: el.width * s,
    height: el.height * s,
    transform: `rotate(${el.rotation || 0}deg)` ,
    transformOrigin: 'center',
    zIndex: el.zIndex || 1,
    pointerEvents: 'none', // visuals only; editor layer handles interactions separately
  };
}

function renderContent(el: Element): React.ReactNode {
  switch (el.type) {
    case 'text': {
      const textVal = el.text || '';
      const hasHtml = !!el.content;
      const commonStyle: React.CSSProperties = {
        width: '100%', height: '100%', boxSizing: 'border-box',
        fontSize: el.fontSize ?? 18, color: el.color ?? '#000',
        fontFamily: el.fontFamily || 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif',
        fontWeight: el.fontWeight || 'normal', fontStyle: el.fontStyle || 'normal',
        textAlign: el.textAlign || 'left', lineHeight: el.lineHeight || 1.2,
        padding: (el as any).padding ?? 8, background: (el as any).backgroundColor || 'transparent',
        borderWidth: (el as any).borderWidth ?? 0, borderStyle: (el as any).borderStyle || 'solid', borderColor: (el as any).borderColor || 'transparent',
        borderRadius: (el as any).borderRadius ?? 0,
        display: 'flex', alignItems: (el as any).verticalAlign === 'top' ? 'flex-start' : (el as any).verticalAlign === 'bottom' ? 'flex-end' : 'center',
        justifyContent: el.textAlign === 'center' ? 'center' : el.textAlign === 'right' ? 'flex-end' : 'flex-start',
        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
      };
      if (hasHtml) {
        return (
          <div
            style={commonStyle}
            dangerouslySetInnerHTML={{ __html: el.content as string }}
          />
        );
      }
      return (
        <div style={commonStyle}>{textVal}</div>
      );
    }
    case 'shape': {
      const fill = el.fill || 'transparent';
      const stroke = el.stroke || '#000';
      const strokeWidth = el.strokeWidth || 0.5;
      const common: React.CSSProperties = {
        width: '100%', height: '100%', background: fill, border: `${strokeWidth}px solid ${stroke}`,
      };
      switch (el.shapeType) {
        case 'rectangle': return <div style={common} />;
        case 'rounded-rectangle': return <div style={{ ...common, borderRadius: 8 }} />;
        case 'circle': return <div style={{ ...common, borderRadius: '50%' }} />;
        case 'triangle':
          return (
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width:'100%', height:'100%' }}>
              <polygon points="50,0 0,100 100,100" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
            </svg>
          );
        case 'diamond':
          return (
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width:'100%', height:'100%' }}>
              <polygon points="50,0 100,50 50,100 0,50" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
            </svg>
          );
        case 'star':
          return (
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width:'100%', height:'100%' }}>
              <polygon points="50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
            </svg>
          );
        case 'arrow-right':
          return (
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width:'100%', height:'100%' }}>
              <polygon points="0,20 60,20 60,0 100,50 60,100 60,80 0,80" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
            </svg>
          );
        default:
          return <div style={common} />;
      }
    }
    case 'image': {
      if (!el.imageUrl) {
        return (
          <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'#f5f5f5', border:'2px dashed #ccc', borderRadius:8 }}>No image</div>
        );
      }
      return (
        <img src={el.imageUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius: (el as any).borderRadius || 0 }} />
      );
    }
    case 'chart':
      return <ChartJSChart chart={el as any} isSelected={false} onUpdate={() => {}} onDelete={() => {}} onSelect={() => {}} />;
    case 'table': {
      const rows = Math.max(1, el.rows || 3);
      const cols = Math.max(1, el.cols || 3);
      const td = Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => (el.tableData?.[r]?.[c] ?? '')));
      const borderColor = el.borderColor || '#D9D9D9';
      const borderWidth = (el.borderWidth ?? 1);
      const borderStyle = (el as any).borderStyle || 'solid';
      const textAlign = el.cellTextAlign || 'left';
      const header = (el as any).header ?? false;
      const headerBg = (el as any).headerBg || '#E7E6E6';
      const headerTextColor = (el as any).headerTextColor || '#111827';
      const rowAltBg = (el as any).rowAltBg || null;
      const rowEvenBg = el.backgroundColor || '#FFFFFF';
      const rowOddBg = rowAltBg || 'transparent';
      const textColor = el.color || '#000000';
      const cellPadding = el.cellPadding ?? 8;
      return (
        <div style={{ width:'100%', height:'100%', display:'grid', gridTemplateColumns:`repeat(${cols},1fr)`, gridTemplateRows:`repeat(${rows},1fr)`, boxSizing:'border-box', border: borderStyle==='none'||borderWidth===0? undefined : `${borderWidth}px ${borderStyle} ${borderColor}` }}>
          {td.map((row, r) => row.map((cell, c) => (
            <div key={`${r}-${c}`} style={{
              borderRight: borderStyle==='none'||borderWidth===0? 'none': `${borderWidth}px ${borderStyle} ${borderColor}`,
              borderBottom: borderStyle==='none'||borderWidth===0? 'none': `${borderWidth}px ${borderStyle} ${borderColor}`,
              padding: cellPadding, overflow:'hidden', textAlign: textAlign as any,
              background: header && r===0 ? headerBg : ((header ? r-1 : r) % 2 === 0 ? rowEvenBg : rowOddBg),
              color: header && r===0 ? headerTextColor : textColor,
              fontWeight: header && r===0 ? 600 : (el.fontWeight || 'normal'),
              fontFamily: el.fontFamily || 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif',
              fontSize: (el.fontSize || 16) as any,
            }} dangerouslySetInnerHTML={{ __html: cell }} />
          )))}
        </div>
      );
    }
    default:
      return null;
  }
}

export default memo(SlideRenderer);
