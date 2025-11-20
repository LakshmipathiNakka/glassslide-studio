import React, { memo } from 'react';
import type { Slide } from '@/types/slide-thumbnails';
import { Element } from '../../hooks/use-action-manager';
import { ChartJSChart } from '../editor/ChartJSChart';
import { TABLE_THEMES } from '../../constants/tableThemes';

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

  // Ensure deterministic z-ordering matching editor/engine
  const elements = (slide.elements || []).slice().sort((a: any, b: any) => (a.zIndex ?? 0) - (b.zIndex ?? 0));

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
      {elements.map((el) => (
        <div
          key={el.id}
          style={styleFor(el as Element, s)}
          onClick={interactive ? (e) => { e.stopPropagation(); onElementSelect?.(el as Element); } : undefined}
        >
          {renderContent(el as Element, s)}
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
    transform: `rotate(${el.rotation || 0}deg)`,
    transformOrigin: 'center',
    zIndex: el.zIndex || 1,
    pointerEvents: 'none', // visuals only; editor layer handles interactions separately
  };
}

function resolveImageSrc(el: Element): string | undefined {
  // Be tolerant of different fields used across the app
  const anyEl = el as any;
  return anyEl.imageUrl || anyEl.src || anyEl.content || undefined;
}

function renderContent(el: Element, s: number): React.ReactNode {
  switch (el.type) {
    case 'text': {
      const textVal = el.text || '';
      const htmlContent = el.content || '';
      const hasHtml = !!htmlContent && htmlContent.trim() !== '';
      const hasText = !!textVal && textVal.trim() !== '';
      if (!hasText && !hasHtml) {
        return null;
      }
      const commonStyle: React.CSSProperties = {
        width: '100%', height: '100%', boxSizing: 'border-box',
        fontSize: (el.fontSize ?? 18) * s, color: el.color ?? '#000',
        fontFamily: el.fontFamily || 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif',
        fontWeight: el.fontWeight || 'normal', fontStyle: el.fontStyle || 'normal',
        textAlign: el.textAlign || 'left', lineHeight: el.lineHeight || 1.2,
        padding: ((el as any).padding ?? 8) * s, background: (el as any).backgroundColor || 'transparent',
        borderWidth: ((el as any).borderWidth ?? 0) * s, borderStyle: (el as any).borderStyle || 'solid', borderColor: (el as any).borderColor || 'transparent',
        borderRadius: ((el as any).borderRadius ?? 0) * s,
        display: 'flex', alignItems: (el as any).verticalAlign === 'top' ? 'flex-start' : (el as any).verticalAlign === 'bottom' ? 'flex-end' : 'center',
        justifyContent: el.textAlign === 'center' ? 'center' : el.textAlign === 'right' ? 'flex-end' : 'flex-start',
        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
      };
      if (hasHtml) {
        return (
          <div
            style={commonStyle}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
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
        width: '100%', height: '100%', background: fill, border: `${strokeWidth * s}px solid ${stroke}`,
      };
      switch (el.shapeType) {
        case 'rectangle':
          return <div style={common} />;
        case 'rounded-rectangle':
          return <div style={{ ...common, borderRadius: 8 * s }} />;
        case 'circle':
          return <div style={{ ...common, borderRadius: '50%' }} />;
        case 'triangle':
          return (
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
              <polygon points="50,0 0,100 100,100" fill={fill} stroke={stroke} strokeWidth={strokeWidth * s} />
            </svg>
          );
        case 'diamond':
          return (
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
              <polygon points="50,0 100,50 50,100 0,50" fill={fill} stroke={stroke} strokeWidth={strokeWidth * s} />
            </svg>
          );
        case 'star':
          return (
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
              <polygon points="50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35" fill={fill} stroke={stroke} strokeWidth={strokeWidth * s} />
            </svg>
          );
        case 'arrow-right':
          return (
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
              <polygon points="0,20 60,20 60,0 100,50 60,100 60,80 0,80" fill={fill} stroke={stroke} strokeWidth={strokeWidth * s} />
            </svg>
          );
        case 'hexagon':
          return (
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
              {/* Match SimplePowerPointCanvas hexagon geometry: 25,0 75,0 100,50 75,100 25,100 0,50 */}
              <polygon points="25,0 75,0 100,50 75,100 25,100 0,50" fill={fill} stroke={stroke} strokeWidth={strokeWidth * s} />
            </svg>
          );
        default:
          return <div style={common} />;
      }
    }
    case 'image': {
      const src = resolveImageSrc(el);
      if (!src) {
        return (
          <div style={{ 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            background: '#f5f5f5', 
            border: '2px dashed #ccc', 
            borderRadius: 8 * s 
          }}>
            No image
          </div>
        );
      }
      const borderWidth = (el as any).borderWidth ?? 0;
      return (
        <img 
          src={src} 
          alt="" 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'contain', 
            backgroundColor: 'transparent',
            borderRadius: ((el as any).borderRadius || 0) * s,
            borderWidth: borderWidth * s,
            borderStyle: borderWidth > 0 ? ((el as any).borderStyle || 'solid') : 'none',
            borderColor: (el as any).borderColor || '#000000',
            display: 'block',
            userSelect: 'none',
            pointerEvents: 'none',
            opacity: (el as any).opacity ?? 1
          }} 
        />
      );
    }
    case 'chart': {
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <ChartJSChart 
            chart={el as any} 
            isSelected={false} 
            onUpdate={() => {}} 
            onDelete={() => {}} 
            onSelect={() => {}} 
            scale={s}
          />
        </div>
      );
    }
    case 'table': {
      const rows = Math.max(1, el.rows || 3);
      const cols = Math.max(1, el.cols || 3);
      const td = Array.from({ length: rows }, (_, r) => 
        Array.from({ length: cols }, (_, c) => (el.tableData?.[r]?.[c] ?? ''))
      );
      const theme = TABLE_THEMES.find(t => (t as any).id === (el as any).themeId) || {} as any;
      const borderColor = (el as any).borderColor || theme.borderColor || '#D9D9D9';
      const borderWidth = ((el as any).borderWidth ?? 1) * s;
      const borderStyle = (el as any).borderStyle || 'solid';
      const textAlign = (el as any).cellTextAlign || 'left';
      const header = (el as any).header ?? false;
      const headerBg = (el as any).headerBg || theme.headerBg || '#E7E6E6';
      const headerTextColor = (el as any).headerTextColor || theme.headerTextColor || '#111827';
      const rowEvenBg = (el as any).backgroundColor || theme.rowEvenBg || '#FFFFFF';
      const rowAltBg = (el as any).rowAltBg || theme.rowOddBg || 'transparent';
      const textColor = (el as any).textColor || (el as any).color || theme.textColor || '#000000';
      const cellPadding = ((el as any).cellPadding ?? 8) * s;
      return (
        <div style={{ width:'100%', height:'100%', display:'grid', gridTemplateColumns:`repeat(${cols},1fr)`, gridTemplateRows:`repeat(${rows},1fr)`, boxSizing:'border-box', border: borderStyle==='none'||borderWidth===0? undefined : `${borderWidth}px ${borderStyle} ${borderColor}` }}>
          {td.map((row, r) => row.map((cell, c) => (
            <div key={`${r}-${c}`} style={{
              borderRight: borderStyle==='none'||borderWidth===0? 'none': `${borderWidth}px ${borderStyle} ${borderColor}`,
              borderBottom: borderStyle==='none'||borderWidth===0? 'none': `${borderWidth}px ${borderStyle} ${borderColor}`,
              padding: cellPadding, overflow:'hidden', textAlign: textAlign as any,
              background: header && r===0 ? headerBg : ((header ? r-1 : r) % 2 === 0 ? rowEvenBg : rowAltBg),
              color: header && r===0 ? headerTextColor : textColor,
              fontWeight: header && r===0 ? 600 : ((el as any).fontWeight || 'normal'),
              fontFamily: (el as any).fontFamily || 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif',
              fontSize: (((el as any).fontSize || 16) * s as any),
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
