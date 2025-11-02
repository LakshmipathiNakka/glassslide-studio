/**
 * LayoutCard Component
 * Individual layout preview card with miniature slide rendering
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, BarChart3, Table as TableIcon, Images, Quote, Shapes, Layout } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LayoutPreview, PreviewElement } from '@/data/premiumLayouts';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface LayoutCardProps {
  layout: LayoutPreview;
  isSelected?: boolean;
  onSelect: (layoutId: string) => void;
  index: number;
}

// Responsive text size utility mapping for preview tokens
function textSizeClasses(token?: string): string {
  switch (token) {
    case 'display':
      return 'text-[18px] sm:text-[20px] md:text-[22px] lg:text-[24px]';
    case 'title':
      return 'text-[14px] sm:text-[16px] md:text-[18px] lg:text-[20px]';
    case 'subtitle':
      return 'text-[12px] sm:text-[13px] md:text-[14px] lg:text-[16px]';
    case 'body':
      return 'text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px]';
    default:
      // body-sm
      return 'text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px]';
  }
}

function weightClasses(token?: string): string {
  switch (token) {
    case 'bold':
    case '700':
      return 'font-bold';
    case '600':
    case 'semibold':
      return 'font-semibold';
    case '500':
    case 'medium':
      return 'font-medium';
    default:
      return 'font-normal';
  }
}

function alignClasses(token?: string): { text: string; justify: string } {
  switch (token) {
    case 'left':
      return { text: 'text-left', justify: 'justify-start' };
    case 'right':
      return { text: 'text-right', justify: 'justify-end' };
    default:
      return { text: 'text-center', justify: 'justify-center' };
  }
}

const PreviewElementRenderer: React.FC<{ element: PreviewElement; computeFontSize: (token?: string) => number }> = ({ element, computeFontSize }) => {
  const baseClasses = cn(
    'absolute transition-all duration-200',
    'transform-gpu', // Enable GPU acceleration for smoother animations
    'origin-center', // Scale from center
  );

  // Add subtle shadow and border to elements for depth
  const elementStyle = {
    left: `${element.x}%`,
    top: `${element.y}%`,
    width: `${element.width}%`,
    height: `${element.height}%`,
    boxShadow: '0 0 0 1px rgba(0,0,0,0.1)', // Add subtle outline
    border: element.type === 'box' ? '1px solid rgba(0,0,0,0.1)' : '1px dashed rgba(0,0,0,0.15)',
    borderRadius: element.style?.borderRadius || (element.type === 'box' ? '4px' : '4px'),
    backgroundColor: element.type === 'box' ? 'rgba(255,255,255,0.3)' : 'transparent',
  } as React.CSSProperties;

  switch (element.type) {
    case 'text': {
      const weight = weightClasses(element.style?.fontWeight);
      const { text, justify } = alignClasses(element.style?.textAlign as any);
      const color = element.style?.color || 'text-gray-900';
      const fontSize = computeFontSize(element.style?.fontSize);
      const isTitle = element.style?.fontSize === 'display' || element.style?.fontSize === 'title';

      // Add subtle text shadow for better readability on light backgrounds
      const textShadow = isTitle
        ? '0 1px 2px rgba(0,0,0,0.1)'
        : '0 1px 1px rgba(255,255,255,0.8)';

      return (
        <div
          className={cn(
            baseClasses,
            'flex items-center',
            justify,
            weight,
            text, // This comes from the destructured alignClasses return value
            isTitle ? 'leading-tight' : 'leading-snug',
            color,
            'transition-all duration-200',
            'hover:bg-blue-50/30', // Subtle hover state for better UX
            'overflow-hidden' // Ensure text doesn't overflow
          )}
          style={{
            ...elementStyle,
            fontSize,
            textShadow,
            padding: isTitle ? '0.1rem 0.2rem' : '0.05rem 0.15rem', // Reduced padding
          }}
        >
          <span 
            className={cn(
              'w-full',
              isTitle ? 'line-clamp-2' : 'line-clamp-3',
              'text-ellipsis overflow-hidden',
              'px-0.5', // Small horizontal padding
              'whitespace-normal' // Ensure proper text wrapping
            )}
            style={{
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: isTitle ? 2 : 3,
            }}
          >
            {element.content || (isTitle ? 'Title' : 'Text')}
          </span>
        </div>
      );
    }

    case 'line':
      return (
        <div
          className={cn(
            baseClasses,
            'h-px w-full',
            'bg-gray-400', // Darker line for better visibility
            'shadow-[0_0_0_1px_rgba(0,0,0,0.05)]' // Add subtle outline
          )}
          style={elementStyle}
        />
      );

    case 'box':
      return (
        <div
          className={cn(
            baseClasses,
            'transition-all duration-200',
            element.style?.backgroundColor || 'bg-slate-100',
            'hover:shadow-sm hover:ring-1 hover:ring-blue-200', // Subtle hover effect
            element.style?.borderRadius || 'rounded-sm',
            'flex items-center justify-center',
            'overflow-hidden' // Ensure content doesn't overflow
          )}
          style={{
            ...elementStyle,
            opacity: element.style?.opacity || 0.9,
            border: '1px solid rgba(0,0,0,0.05)',
          }}
        >
          {element.content && (
            <span className="text-[10px] text-slate-500 opacity-70">
              {element.content}
            </span>
          )}
        </div>
      );

    case 'gradient':
      return (
        <div
          className={cn(
            baseClasses,
            element.style?.gradient || 'bg-gradient-to-br from-gray-100 to-gray-200',
            'w-full h-full'
          )}
          style={elementStyle}
        />
      );

    case 'chart':
      return (
        <div
          className={cn(
            baseClasses,
            'bg-white/80 border border-slate-300 rounded-sm overflow-hidden',
            'shadow-sm',
            'flex flex-col',
            'p-1.5',
            'hover:shadow-md hover:border-blue-200',
            'transition-all duration-200',
            'ring-1 ring-black/5' // Add subtle inner ring
          )}
          style={elementStyle}
        >
          {/* Chart header */}
          <div className="flex items-center justify-between px-1.5 py-1 border-b border-slate-100">
            <span className="text-[9px] font-medium text-slate-600">Chart</span>
            <div className="flex space-x-1">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
            </div>
          </div>
          
          {/* Chart content */}
          <div className="flex-1 relative p-1.5">
            {/* Grid lines */}
            {[25, 50, 75].map((y) => (
              <div 
                key={y} 
                className="absolute left-0 right-0 h-px bg-slate-100" 
                style={{ top: `${y}%` }} 
              />
            ))}
            
            {/* Bars */}
            <div className="absolute bottom-0 left-0 right-0 h-full flex items-end justify-around px-2">
              <div className="w-3 bg-blue-500/80 rounded-t-sm" style={{ height: '35%' }}></div>
              <div className="w-3 bg-green-500/80 rounded-t-sm" style={{ height: '55%' }}></div>
              <div className="w-3 bg-purple-500/80 rounded-t-sm" style={{ height: '45%' }}></div>
              <div className="w-3 bg-yellow-500/80 rounded-t-sm" style={{ height: '30%' }}></div>
              <div className="w-3 bg-red-500/80 rounded-t-sm" style={{ height: '65%' }}></div>
            </div>
            
            {/* X-axis labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
              {['A', 'B', 'C', 'D', 'E'].map((label, i) => (
                <span key={i} className="text-[8px] text-slate-500">{label}</span>
              ))}
            </div>
          </div>
        </div>
      );
    case 'table':
      return (
        <div 
          className={cn(
            baseClasses, 
            'bg-white/80 border border-gray-300 rounded-md overflow-hidden',
            'flex flex-col',
            'ring-1 ring-black/5' // Add subtle inner ring
          )} 
          style={elementStyle}
        >
          {/* Table header */}
          <div className="h-4 bg-gray-50 border-b border-gray-200 flex">
            {['', 'A', 'B', 'C'].map((header, i) => (
              <div key={i} className="h-full flex-1 flex items-center justify-center border-r border-gray-200 last:border-r-0">
                <span className="text-[8px] text-gray-500 font-medium">{header}</span>
              </div>
            ))}
          </div>
          {/* Table rows */}
          {[1, 2, 3].map((row) => (
            <div key={row} className="h-3 flex border-b border-gray-100 last:border-b-0">
              <div className="w-4 flex-shrink-0 flex items-center justify-center border-r border-gray-200">
                <span className="text-[7px] text-gray-400">{row}</span>
              </div>
              {[1, 2, 3].map((col) => (
                <div 
                  key={col} 
                  className="flex-1 border-r border-gray-100 last:border-r-0"
                />
              ))}
            </div>
          ))}
        </div>
      );
    default:
      return null;
  }
};

export const LayoutCard: React.FC<LayoutCardProps> = ({
  layout,
  isSelected = false,
  onSelect,
  index,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [baseSize, setBaseSize] = useState<number>(160);

  useEffect(() => {
    if (!cardRef.current) return;
    const el = cardRef.current;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        const b = Math.min(cr.width, cr.height);
        setBaseSize(b);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Compute font size in px based on card base dimension and semantic token
  const computeFontSize = useMemo(() => {
    return (token?: string) => {
      // Scale font sizes based on container size for better preview
      const k = Math.max(0.3, Math.min(0.6, baseSize / 500)); // Further reduced scaling factor
      const sizes: Record<string, number> = {
        display: 8,     // Main title
        title: 7,       // Section headers
        subtitle: 6,    // Subtitles
        body: 5,        // Regular text
        caption: 4,     // Small captions
        default: 5,     // Default size
      };
      const base = sizes[token || 'default'] ?? sizes.default;
      const px = base * k;
      const minPx = 4;  // Further reduced minimum for better fit
      const maxPx = 10; // Further reduced maximum for preview context
      return Math.max(minPx, Math.min(maxPx, px));
    };
  }, [baseSize]);
  const icon = getLayoutIcon(layout.id);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          ref={cardRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05, ease: [0.0, 0.0, 0.2, 1] }}
          onClick={() => onSelect(layout.id)}
          className={cn(
            'relative group cursor-pointer z-0',
            'w-full', // Full width of container
            'mb-3 last:mb-0', // Reduced bottom margin from mb-5 to mb-3
            'rounded-xl overflow-hidden',
            'transition-all duration-200 ease-in-out',
            'bg-gray-50/95 backdrop-blur-sm',
            'border border-slate-100',
            isSelected 
              ? 'ring-2 ring-blue-500/30 shadow-md' 
              : 'hover:ring-1 hover:ring-slate-200 hover:shadow-sm',
            'flex flex-col h-auto min-h-[180px]', // Reduced minimum height from 200px to 180px
            'transform hover:-translate-y-0.5' // Subtle lift on hover
          )}
          role="button"
          aria-label={`Select ${layout.name} layout`}
          aria-pressed={isSelected}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelect(layout.id);
            }
          }}
        >
          {/* Selection Glow */}
          {isSelected && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-blue-500/5 pointer-events-none" />
          )}

          {/* Apple Keynote-style Slide Preview - Adjusted for more space */}
          <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200">
            <div className="absolute inset-0 p-1.5">
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  'relative w-full h-full',
                  'bg-gray-50 rounded',
                  'shadow-[0_1px_4px_rgba(0,0,0,0.05)]',
                  'border border-slate-200/80',
                  'overflow-hidden',
                  'flex flex-col',
                  'text-[0.6rem]' // Base font size for the entire card
                )}
              >
                {/* Preview Header - Made more compact */}
                <div className="h-5 border-b border-slate-100 bg-gradient-to-b from-slate-50 to-slate-100 flex items-center px-1.5">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-red-400"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  </div>
                  <div className="mx-auto text-[9px] text-slate-500 font-medium truncate px-1">
                    {layout.name}
                  </div>
                </div>

                {/* Preview Content - Tighter spacing */}
                <div className="flex-1 relative bg-gray-50">
                  <div className="absolute inset-0 p-0.5">
                    <div className="w-full h-full relative scale-90">
                      {layout.preview.elements.map((element, idx) => (
                        <PreviewElementRenderer 
                          key={idx} 
                          element={element} 
                          computeFontSize={computeFontSize} 
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Slide Number - Made smaller */}
                <div className="absolute bottom-0.5 right-1 text-[8px] text-slate-400 font-medium">
                  {index + 1}
                </div>

                {/* Corner Icon - Made smaller */}
                {icon && (
                  <div className="absolute top-6 left-1 p-1 rounded-sm bg-gray-50/90 shadow-sm border border-slate-200">
                    {React.cloneElement(icon, { className: 'w-3 h-3 text-slate-700' })}
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          {/* Title Footer - Made more compact */}
          <div className="px-1.5 py-1 border-t border-slate-200/60 bg-gray-50/80">
            <div className="w-full text-center truncate text-xs font-medium text-slate-700">
              {layout.name}
            </div>
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 rounded-xl pointer-events-none ring-2 ring-inset ring-transparent transition-all duration-300 group-hover:ring-blue-500/20" />
        </motion.div>
      </TooltipTrigger>
      <TooltipContent>{layout.name}</TooltipContent>
    </Tooltip>
  );
};

function getLayoutIcon(id: string) {
  if (id.includes('chart')) return <BarChart3 className="w-4 h-4" />;
  if (id.includes('table')) return <TableIcon className="w-4 h-4" />;
  if (id.includes('image')) return <Images className="w-4 h-4" />;
  if (id.includes('quote')) return <Quote className="w-4 h-4" />;
  if (id.includes('shape')) return <Shapes className="w-4 h-4" />;
  return <Layout className="w-4 h-4" />;
}

export default LayoutCard;
