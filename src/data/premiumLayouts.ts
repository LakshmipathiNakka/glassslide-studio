/**
 * Google Slides Standard Layout Templates
 * Standard slide layouts similar to Google Slides
 */

export interface PreviewElement {
  type: 'text' | 'line' | 'box' | 'gradient' | 'chart' | 'table';
  x: number;
  y: number;
  width: number;
  height: number;
  style?: {
    fontSize?: string;
    fontWeight?: string;
    textAlign?: string;
    color?: string;
    backgroundColor?: string;
    gradient?: string;
    borderRadius?: string;
    opacity?: number;
    chartType?: 'bar' | 'line' | 'pie';
    rows?: number;
    cols?: number;
  };
  content?: string;
}

export interface LayoutPreview {
  id: string;
  name: string;
  description: string;
  category: 'title' | 'content' | 'section' | 'blank';
  preview: {
    type: string;
    elements: PreviewElement[];
  };
}

export const PREMIUM_LAYOUTS: LayoutPreview[] = [
  // Title and Body
  {
    id: 'title-body',
    name: 'Title and Body',
    description: 'For content slides with title and body text',
    category: 'content',
    preview: {
      type: 'title-body',
      elements: [
        // Title (top)
        {
          type: 'text',
          x: 10,
          y: 15,
          width: 80,
          height: 12,
          style: {
            fontSize: 'title',
            fontWeight: 'bold',
            textAlign: 'left',
            color: 'text-gray-900',
          },
          content: 'Title',
        },
        // Body content area (text placeholder)
        {
          type: 'text',
          x: 10,
          y: 30,
          width: 80,
          height: 58,
          style: {
            fontSize: 'body',
            fontWeight: 'normal',
            textAlign: 'left',
            color: 'text-gray-700',
          },
          content: 'Click to add text',
        },
      ],
    },
  },
  // Section Header
  {
    id: 'section-header',
    name: 'Section Header',
    description: 'For section divider slides',
    category: 'section',
    preview: {
      type: 'section-header',
      elements: [
        // Section title (large, centered)
        {
          type: 'text',
          x: 10,
          y: 40,
          width: 80,
          height: 20,
          style: {
            fontSize: 'display',
            fontWeight: 'bold',
            textAlign: 'center',
            color: 'text-gray-900',
          },
          content: 'SECTION',
        },
      ],
    },
  },
  // Two Content
  {
    id: 'two-content',
    name: 'Two Content',
    description: 'For comparing two topics or showing related content',
    category: 'content',
    preview: {
      type: 'two-columns',
      elements: [
        // Title
        {
          type: 'text',
          x: 10,
          y: 15,
          width: 80,
          height: 10,
          style: {
            fontSize: 'title',
            fontWeight: 'bold',
            textAlign: 'left',
            color: 'text-gray-900',
          },
          content: 'Title',
        },
        // Left content (text placeholder)
        {
          type: 'text',
          x: 10,
          y: 30,
          width: 38,
          height: 50,
          style: {
            fontSize: 'body',
            fontWeight: 'normal',
            textAlign: 'left',
            color: 'text-gray-700',
          },
          content: 'Left content',
        },
        // Right content (text placeholder)
        {
          type: 'text',
          x: 52,
          y: 30,
          width: 38,
          height: 50,
          style: {
            fontSize: 'body',
            fontWeight: 'normal',
            textAlign: 'left',
            color: 'text-gray-700',
          },
          content: 'Right content',
        },
      ],
    },
  },
  // Title Only
  {
    id: 'title-only',
    name: 'Title Only',
    description: 'For slides with just a title',
    category: 'content',
    preview: {
      type: 'title-only',
      elements: [
        // Title (centered)
        {
          type: 'text',
          x: 10,
          y: 35,
          width: 80,
          height: 30,
          style: {
            fontSize: 'display',
            fontWeight: 'bold',
            textAlign: 'center',
            color: 'text-gray-900',
          },
          content: 'Title',
        },
      ],
    },
  },
  // Comparison
  // 10. Table Layout
  {
    id: 'table',
    name: 'Table',
    description: 'Data-heavy comparison slide',
    category: 'content',
    preview: {
      type: 'table',
      elements: [
        { type: 'text', x: 10, y: 12, width: 80, height: 8, style: { fontSize: 'title', fontWeight: 'bold', textAlign: 'center', color: 'text-gray-900' }, content: 'Table Title' },
        { type: 'table', x: 10, y: 28, width: 80, height: 60, style: { rows: 4, cols: 4 } },
      ],
    },
  },
  // 12. Text with Color Emphasis
  {
    id: 'text-emphasis',
    name: 'Text with Emphasis',
    description: 'Highlighted keywords and callouts',
    category: 'content',
    preview: {
      type: 'text-emphasis',
      elements: [
        { type: 'text', x: 10, y: 12, width: 80, height: 8, style: { fontSize: 'title', fontWeight: 'bold', textAlign: 'center', color: 'text-gray-900' }, content: 'Title' },
        { type: 'gradient', x: 0, y: 0, width: 100, height: 100, style: { gradient: 'bg-gradient-to-b from-white to-[#f8fafc]' } },
        { type: 'text', x: 15, y: 38, width: 70, height: 22, style: { fontSize: 'body', fontWeight: 'normal', textAlign: 'center', color: 'text-gray-900' }, content: 'Clean, readable text with ' },
      ],
    },
  },
  // 13. Table + Chart Combo
  {
    id: 'table-chart-combo',
    name: 'Table + Chart',
    description: 'Quantitative + qualitative blend',
    category: 'content',
    preview: {
      type: 'table-chart',
      elements: [
        { type: 'text', x: 10, y: 10, width: 80, height: 10, style: { fontSize: 'title', fontWeight: 'bold', textAlign: 'center', color: 'text-gray-900' }, content: 'Overview' },
        { type: 'table', x: 5, y: 25, width: 45, height: 60, style: { rows: 4, cols: 3 } },
        { type: 'chart', x: 52, y: 25, width: 43, height: 60, style: { chartType: 'bar' } },
      ],
    },
  },
  // Blank Layout
  {
    id: 'blank',
    name: 'Blank',
    description: 'Empty slide for custom content',
    category: 'blank',
    preview: {
      type: 'blank',
      elements: [
        // No elements - completely blank
      ],
    },
  },
];

export const getLayoutById = (id: string): LayoutPreview | undefined => {
  return PREMIUM_LAYOUTS.find(layout => layout.id === id);
};

export const getLayoutsByCategory = (category: string): LayoutPreview[] => {
  return PREMIUM_LAYOUTS.filter(layout => layout.category === category);
};
