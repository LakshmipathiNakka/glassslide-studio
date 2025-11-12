/**
 * Smart Layout Apply utilities
 */

import { PREMIUM_LAYOUTS, LayoutPreview } from '@/data/premiumLayouts';
import { SlideElement } from '@/types/canvas';

export interface CanvasSize { width: number; height: number }

// Updated font sizes to be more appropriate for slides
const FONT_MAP: Record<string, number> = {
  display: 36,  // Main title
  title: 32,    // Section title
  subtitle: 24, // Subtitle
  body: 16,     // Regular text
  '2xl': 28,    // Extra large
  'xl': 22,     // Extra large
  'lg': 18,     // Large
  'md': 16,     // Medium (default)
  'sm': 14,     // Small
  'xs': 12,     // Extra small
};

function resolveFontSize(v?: string): number {
  if (!v) return 18;
  if (FONT_MAP[v] !== undefined) return FONT_MAP[v];
  const m = v.match(/^(\d+)(px)?$/);
  if (m) return parseInt(m[1], 10);
  return 18;
}

function pct(n: number, total: number) { return Math.round((n / 100) * total); }

export function getLayoutDef(layoutId: string): LayoutPreview | undefined {
  return PREMIUM_LAYOUTS.find(l => l.id === layoutId);
}

export function generateElementsForLayout(
  layoutId: string,
  canvas: CanvasSize = { width: 1024, height: 576 }
): SlideElement[] {
  const def = getLayoutDef(layoutId);
  if (!def) return [];

  let z = 1;
  const nextZ = () => z++;

  return def.preview.elements.map((el, idx) => {
    const x = pct(el.x, canvas.width);
    const y = pct(el.y, canvas.height);
    const width = pct(el.width, canvas.width);
    const height = pct(el.height, canvas.height);

    if (el.type === 'text') {
      const fontSize = resolveFontSize(el.style?.fontSize);
      const align = (el.style?.textAlign as any) || 'center';
      const color = mapTailwindTextColor(el.style?.color) || '#1c1c1e';
      return {
        id: `layout-text-${idx}`,
        type: 'text',
        x, y, width, height,
        rotation: 0,
        zIndex: nextZ(),
        text: el.content || 'Your text here',
        placeholder: el.content || 'Your text here',
        fontSize,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', Inter, system-ui, sans-serif",
        fontWeight: (el.style?.fontWeight as any) || 'bold',
        textAlign: align,
        color,
        backgroundColor: 'transparent',
      } satisfies SlideElement;
    }

    if (el.type === 'line') {
      const lineColor = el.style?.backgroundColor ? mapTailwindColor(el.style.backgroundColor) : '#e5e7eb';
      return {
        id: `layout-line-${idx}`,
        type: 'shape',
        shapeType: 'rectangle',
        x, y,
        width, height: Math.max(2, Math.min(height, 6)),
        rotation: 0,
        zIndex: nextZ(),
        fill: lineColor,
        stroke: lineColor,
        strokeWidth: 0,
      } satisfies SlideElement;
    }

    if (el.type === 'chart') {
      // Adjust chart dimensions to be more compact
      const chartWidth = Math.min(width, 400);
      const chartHeight = Math.min(height, 300);
      const chartX = x + (width - chartWidth) / 2; // Center the chart
      const chartY = y + (height - chartHeight) / 2;
      const dsColor = el.style?.backgroundColor ? mapTailwindColor(el.style.backgroundColor) : '#007AFF';
      const chartType = (el.style?.chartType as any) || 'bar';
      const piePalette = ['#007AFF','#34C759','#FF9500','#AF52DE','#FF3B30'];
      
      return {
        id: `layout-chart-${idx}`,
        type: 'chart',
        x: chartX,
        y: chartY,
        width: chartWidth,
        height: chartHeight,
        rotation: 0,
        zIndex: nextZ(),
        chartType,
        chartData: chartType === 'pie'
          ? { labels: ['A','B','C','D','E'], datasets: [{ data: [30,20,15,20,15], backgroundColor: piePalette }] }
          : { labels: ['A','B','C'], datasets: [{ label: 'Series', data: [10,20,15], backgroundColor: dsColor }] },
        chartOptions: {
          maintainAspectRatio: false,
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                font: {
                  size: 12
                }
              }
            }
          },
          scales: chartType === 'pie' ? {} : {
            x: {
              ticks: {
                font: {
                  size: 10
                }
              }
            },
            y: {
              ticks: {
                font: {
                  size: 10
                }
              }
            }
          }
        }
      } as SlideElement;
    }

    if (el.type === 'table') {
      const rows = el.style?.rows || 4;
      const cols = el.style?.cols || 4;
      const tableData = Array.from({ length: rows }, () => Array.from({ length: cols }, () => ''));
      
      // Adjust table dimensions to be more compact
      const maxTableWidth = Math.min(width, 600);
      const maxTableHeight = Math.min(height, 400);
      const tableX = x + (width - maxTableWidth) / 2; // Center the table
      const tableY = y + (height - maxTableHeight) / 2;
      
      return {
        id: `layout-table-${idx}`,
        type: 'table',
        x: tableX,
        y: tableY,
        width: maxTableWidth,
        height: maxTableHeight,
        rotation: 0,
        zIndex: nextZ(),
        rows: Math.min(rows, 6), // Limit to 6 rows max
        cols: Math.min(cols, 6), // Limit to 6 columns max
        tableData,
        header: true,
        headerBg: '#f3f4f6',
        headerTextColor: '#1c1c1e',
        borderColor: '#d1d5db',
        borderWidth: 1,
        cellPadding: 6, // Slightly reduced padding
        cellTextAlign: 'left',
        backgroundColor: '#ffffff',
        color: '#3a3a3c',
        fontSize: 12, // Smaller font for table cells
        headerFontSize: 13, // Slightly larger for headers
        rowHeight: 32, // Compact row height
        headerHeight: 36 // Slightly taller for headers
      } as SlideElement;
    }

    // triangle -> triangle shape block
    if ((el as any).type === 'triangle') {
      return {
        id: `layout-triangle-${idx}`,
        type: 'shape',
        shapeType: 'triangle' as any,
        x, y, width, height,
        rotation: 0,
        zIndex: nextZ(),
        fill: el.style?.backgroundColor ? mapTailwindColor(el.style.backgroundColor) : '#dbeafe',
        stroke: el.style?.backgroundColor ? mapTailwindColor(el.style.backgroundColor) : '#dbeafe',
        strokeWidth: 0,
        opacity: el.style?.opacity ?? 1,
      } as SlideElement;
    }

    // box or gradient -> rectangle/circle/rounded-rectangle
    const fill = el.type === 'gradient' ? mapGradient(el.style?.gradient) : (el.style?.backgroundColor ? mapTailwindColor(el.style.backgroundColor) : '#f8fafc');
    const br = mapBorderRadius(el.style?.borderRadius);
    const isCircle = (el.style?.borderRadius === 'rounded-full') || Math.abs(width - height) < 2;
    const shapeType = isCircle ? ('circle' as any) : (br > 6 ? ('rounded-rectangle' as any) : 'rectangle');

    return {
      id: `layout-box-${idx}`,
      type: 'shape',
      shapeType,
      x, y, width, height,
      rotation: 0,
      zIndex: nextZ(),
      fill,
      stroke: '#e5e7eb',
      strokeWidth: 0,
      borderRadius: br,
      opacity: el.style?.opacity ?? 1,
    } as SlideElement;
  });
}

function mapTailwindColor(cls: string): string {
  // Mapping for common Tailwind background utility colors used in previews
  const map: Record<string, string> = {
    'bg-gray-50': '#f9fafb',
    'bg-gray-100': '#f3f4f6',
    'bg-gray-200': '#e5e7eb',
    'bg-blue-50': '#eff6ff',
    'bg-blue-100': '#dbeafe',
    'bg-blue-400': '#60a5fa',
    'bg-sky-100': '#e0f2fe',
    'bg-indigo-100': '#e0e7ff',
    'bg-purple-100': '#ede9fe',
    'bg-emerald-100': '#d1fae5',
    'bg-green-100': '#dcfce7',
    'bg-amber-100': '#fef3c7',
    'bg-red-100': '#fee2e2',
  };
  return map[cls] || '#e5e7eb';
}

function mapTailwindTextColor(cls?: string): string | undefined {
  if (!cls) return undefined;
  const map: Record<string, string> = {
    'text-gray-900': '#111827',
    'text-gray-700': '#374151',
    'text-slate-800': '#1e293b',
    'text-blue-700': '#1d4ed8',
    'text-emerald-700': '#047857',
    'text-amber-700': '#b45309',
    'text-purple-700': '#6d28d9',
  };
  return map[cls] || undefined;
}

function mapGradient(grad?: string): string {
  // Use a neutral light tint for gradients when applied as a shape fill
  if (!grad) return '#f8fafc';
  if (grad.includes('from-white') && grad.includes('to-[#f8fafc]')) return '#f8fafc';
  if (grad.includes('from-slate-100')) return '#f1f5f9';
  return '#f8fafc';
}

function mapBorderRadius(token?: string): number {
  switch (token) {
    case 'rounded-full':
      return 9999;
    case 'rounded-2xl':
      return 20;
    case 'rounded-xl':
      return 16;
    case 'rounded-lg':
      return 12;
    case 'rounded-md':
      return 8;
    case 'rounded-sm':
      return 4;
    default:
      return 6;
  }
}
