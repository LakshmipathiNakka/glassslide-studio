/**
 * Google Slides Standard Layout Templates
 * Standard slide layouts similar to Google Slides
 */

export interface PreviewElement {
  type: 'text' | 'line' | 'box' | 'gradient' | 'chart' | 'table' | 'triangle';
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
  // 1. Title Center + Subtitle
  {
    id: 'title-center-subtitle',
    name: 'Title & Subtitle (Center)',
    description: 'Centered title and subtitle for cover slides',
    category: 'title',
    preview: {
      type: 'title-center-subtitle',
      elements: [
        { type: 'text', x: 10, y: 28, width: 80, height: 18, style: { fontSize: 'display', fontWeight: 'bold', textAlign: 'center', color: 'text-slate-800' }, content: 'Slide Title' },
        { type: 'text', x: 20, y: 50, width: 60, height: 10, style: { fontSize: 'subtitle', fontWeight: 'normal', textAlign: 'center', color: 'text-gray-700' }, content: 'Subtitle goes here' },
      ],
    },
  },
  // 2. Title + Bullets (Left)
  {
    id: 'title-left-bullets',
    name: 'Title + Bullets',
    description: 'Title with underline and bullet list',
    category: 'content',
    preview: {
      type: 'title-left-bullets',
      elements: [
        { type: 'text', x: 8, y: 10, width: 84, height: 10, style: { fontSize: 'title', fontWeight: 'bold', textAlign: 'left', color: 'text-slate-800' }, content: 'Slide Title' },
        { type: 'line', x: 8, y: 22, width: 12, height: 1.5, style: { backgroundColor: 'bg-gray-200' } },
        { type: 'text', x: 8, y: 28, width: 84, height: 60, style: { fontSize: 'body', textAlign: 'left', color: 'text-gray-700' }, content: '• Point one\n• Point two\n• Point three' },
      ],
    },
  },
  // 3. Section Header (Center)
  {
    id: 'section-header-center',
    name: 'Section Header',
    description: 'Centered section divider',
    category: 'section',
    preview: {
      type: 'section-header-center',
      elements: [
        { type: 'text', x: 10, y: 38, width: 80, height: 22, style: { fontSize: 'display', fontWeight: 'bold', textAlign: 'center', color: 'text-slate-800' }, content: 'SECTION' },
      ],
    },
  },
  // 4. Two Column Text
  {
    id: 'two-column-text',
    name: 'Two Column',
    description: 'Title plus two text columns',
    category: 'content',
    preview: {
      type: 'two-column-text',
      elements: [
        { type: 'text', x: 8, y: 12, width: 84, height: 8, style: { fontSize: 'title', fontWeight: 'bold', textAlign: 'left', color: 'text-slate-800' }, content: 'Slide Title' },
        { type: 'line', x: 8, y: 22, width: 12, height: 1.5, style: { backgroundColor: 'bg-gray-200' } },
        { type: 'text', x: 8, y: 28, width: 40, height: 56, style: { fontSize: 'body', textAlign: 'left', color: 'text-gray-700' }, content: 'Left column' },
        { type: 'text', x: 52, y: 28, width: 40, height: 56, style: { fontSize: 'body', textAlign: 'left', color: 'text-gray-700' }, content: 'Right column' },
      ],
    },
  },
  // 5. Three Column Text
  {
    id: 'three-column-text',
    name: 'Three Column',
    description: 'Title with three text columns',
    category: 'content',
    preview: {
      type: 'three-column-text',
      elements: [
        { type: 'text', x: 8, y: 12, width: 84, height: 8, style: { fontSize: 'title', fontWeight: 'bold', textAlign: 'left', color: 'text-slate-800' }, content: 'Slide Title' },
        { type: 'line', x: 8, y: 22, width: 12, height: 1.5, style: { backgroundColor: 'bg-gray-200' } },
        { type: 'text', x: 8, y: 28, width: 26, height: 56, style: { fontSize: 'body', textAlign: 'left', color: 'text-gray-700' }, content: 'Column 1' },
        { type: 'text', x: 37, y: 28, width: 26, height: 56, style: { fontSize: 'body', textAlign: 'left', color: 'text-gray-700' }, content: 'Column 2' },
        { type: 'text', x: 66, y: 28, width: 26, height: 56, style: { fontSize: 'body', textAlign: 'left', color: 'text-gray-700' }, content: 'Column 3' },
      ],
    },
  },
  // 6. Comparison (Two Cards)
  {
    id: 'comparison-two-cards',
    name: 'Comparison (2 Cards)',
    description: 'Two side-by-side cards with headers',
    category: 'content',
    preview: {
      type: 'comparison-two-cards',
      elements: [
        { type: 'text', x: 8, y: 12, width: 84, height: 8, style: { fontSize: 'title', fontWeight: 'bold', textAlign: 'left', color: 'text-slate-800' }, content: 'Comparison' },
        { type: 'box', x: 8, y: 24, width: 40, height: 60, style: { backgroundColor: 'bg-blue-100', borderRadius: 'rounded-lg' } },
        { type: 'text', x: 10, y: 26, width: 36, height: 8, style: { fontSize: 'subtitle', fontWeight: 'bold', textAlign: 'left', color: 'text-blue-700' }, content: 'Option A' },
        { type: 'text', x: 10, y: 36, width: 36, height: 40, style: { fontSize: 'body', textAlign: 'left', color: 'text-gray-700' }, content: '• Feature 1\n• Feature 2\n• Feature 3' },
        { type: 'box', x: 52, y: 24, width: 40, height: 60, style: { backgroundColor: 'bg-emerald-100', borderRadius: 'rounded-lg' } },
        { type: 'text', x: 54, y: 26, width: 36, height: 8, style: { fontSize: 'subtitle', fontWeight: 'bold', textAlign: 'left', color: 'text-emerald-700' }, content: 'Option B' },
        { type: 'text', x: 54, y: 36, width: 36, height: 40, style: { fontSize: 'body', textAlign: 'left', color: 'text-gray-700' }, content: '• Feature 1\n• Feature 2\n• Feature 3' },
      ],
    },
  },
  // 7. Chart Left, Text Right
  {
    id: 'chart-left-text-right',
    name: 'Chart Left, Text Right',
    description: 'Bar chart with narrative',
    category: 'content',
    preview: {
      type: 'chart-left-text-right',
      elements: [
        { type: 'text', x: 8, y: 12, width: 84, height: 8, style: { fontSize: 'title', fontWeight: 'bold', textAlign: 'left', color: 'text-slate-800' }, content: 'Performance' },
        { type: 'chart', x: 8, y: 24, width: 44, height: 60, style: { chartType: 'bar', backgroundColor: 'bg-blue-400' } },
        { type: 'text', x: 52, y: 24, width: 40, height: 60, style: { fontSize: 'body', textAlign: 'left', color: 'text-gray-700' }, content: 'Key insights and commentary' },
      ],
    },
  },
  // 8. Text Left, Chart Right (Pie)
  {
    id: 'text-left-chart-right',
    name: 'Text Left, Chart Right',
    description: 'Narrative and pie chart',
    category: 'content',
    preview: {
      type: 'text-left-chart-right',
      elements: [
        { type: 'text', x: 8, y: 12, width: 84, height: 8, style: { fontSize: 'title', fontWeight: 'bold', textAlign: 'left', color: 'text-slate-800' }, content: 'Market Share' },
        { type: 'text', x: 8, y: 24, width: 40, height: 60, style: { fontSize: 'body', textAlign: 'left', color: 'text-gray-700' }, content: 'Narrative and highlights' },
        { type: 'chart', x: 52, y: 24, width: 40, height: 60, style: { chartType: 'pie', backgroundColor: 'bg-amber-100' } },
      ],
    },
  },
  // 9. Table (Zebra)
  {
    id: 'table-zebra',
    name: 'Table',
    description: 'Tabular data with header',
    category: 'content',
    preview: {
      type: 'table-zebra',
      elements: [
        { type: 'text', x: 10, y: 10, width: 80, height: 8, style: { fontSize: 'title', fontWeight: 'bold', textAlign: 'center', color: 'text-slate-800' }, content: 'Data Overview' },
        { type: 'table', x: 10, y: 24, width: 80, height: 62, style: { rows: 5, cols: 4 } },
      ],
    },
  },
  // 10. Timeline (Horizontal)
  {
    id: 'timeline-horizontal',
    name: 'Timeline',
    description: 'Horizontal milestones',
    category: 'content',
    preview: {
      type: 'timeline-horizontal',
      elements: [
        { type: 'text', x: 8, y: 10, width: 84, height: 8, style: { fontSize: 'title', fontWeight: 'bold', textAlign: 'left', color: 'text-slate-800' }, content: 'Timeline' },
        { type: 'line', x: 10, y: 30, width: 80, height: 1.2, style: { backgroundColor: 'bg-gray-200' } },
        { type: 'box', x: 12, y: 36, width: 16, height: 22, style: { backgroundColor: 'bg-indigo-100', borderRadius: 'rounded-lg' } },
        { type: 'text', x: 12, y: 60, width: 16, height: 8, style: { fontSize: 'sm', textAlign: 'center', color: 'text-gray-700' }, content: 'Phase 1' },
        { type: 'box', x: 32, y: 36, width: 16, height: 22, style: { backgroundColor: 'bg-amber-100', borderRadius: 'rounded-lg' } },
        { type: 'text', x: 32, y: 60, width: 16, height: 8, style: { fontSize: 'sm', textAlign: 'center', color: 'text-gray-700' }, content: 'Phase 2' },
        { type: 'box', x: 52, y: 36, width: 16, height: 22, style: { backgroundColor: 'bg-emerald-100', borderRadius: 'rounded-lg' } },
        { type: 'text', x: 52, y: 60, width: 16, height: 8, style: { fontSize: 'sm', textAlign: 'center', color: 'text-gray-700' }, content: 'Phase 3' },
        { type: 'box', x: 72, y: 36, width: 16, height: 22, style: { backgroundColor: 'bg-purple-100', borderRadius: 'rounded-lg' } },
        { type: 'text', x: 72, y: 60, width: 16, height: 8, style: { fontSize: 'sm', textAlign: 'center', color: 'text-gray-700' }, content: 'Phase 4' },
      ],
    },
  },
  // 11. Title Only (Left)
  {
    id: 'title-only-left',
    name: 'Title Only (Left)',
    description: 'Large left-aligned title',
    category: 'title',
    preview: {
      type: 'title-only-left',
      elements: [
        { type: 'text', x: 8, y: 38, width: 70, height: 24, style: { fontSize: 'display', fontWeight: 'bold', textAlign: 'left', color: 'text-slate-800' }, content: 'Title' },
      ],
    },
  },
  // 12. Title + Content (Classic)
  {
    id: 'title-content-classic',
    name: 'Title + Content',
    description: 'Title with a large content area',
    category: 'content',
    preview: {
      type: 'title-content-classic',
      elements: [
        { type: 'text', x: 8, y: 10, width: 84, height: 8, style: { fontSize: 'title', fontWeight: 'bold', textAlign: 'left', color: 'text-slate-800' }, content: 'Slide Title' },
        { type: 'line', x: 8, y: 20, width: 12, height: 1.5, style: { backgroundColor: 'bg-gray-200' } },
        { type: 'box', x: 8, y: 26, width: 84, height: 60, style: { backgroundColor: 'bg-gray-100', borderRadius: 'rounded-lg' } },
      ],
    },
  },
  // 13. Quote Centered
  {
    id: 'quote-centered',
    name: 'Quote',
    description: 'Centered quotation with attribution',
    category: 'content',
    preview: {
      type: 'quote-centered',
      elements: [
        { type: 'text', x: 10, y: 30, width: 80, height: 24, style: { fontSize: 'title', fontWeight: 'medium', textAlign: 'center', color: 'text-slate-800' }, content: '“A concise, impactful quotation.”' },
        { type: 'text', x: 30, y: 56, width: 40, height: 8, style: { fontSize: 'body', fontWeight: 'normal', textAlign: 'center', color: 'text-gray-700' }, content: '— Attribution' },
      ],
    },
  },
  // 14. Big Number KPI
  {
    id: 'big-number-kpi',
    name: 'Big Number KPI',
    description: 'Headline metric with label and delta',
    category: 'content',
    preview: {
      type: 'big-number-kpi',
      elements: [
        { type: 'text', x: 8, y: 18, width: 84, height: 18, style: { fontSize: 'display', fontWeight: 'bold', textAlign: 'center', color: 'text-slate-800' }, content: '92%' },
        { type: 'text', x: 25, y: 40, width: 50, height: 8, style: { fontSize: 'subtitle', fontWeight: 'normal', textAlign: 'center', color: 'text-gray-700' }, content: 'Conversion Rate' },
        { type: 'box', x: 42, y: 52, width: 16, height: 8, style: { backgroundColor: 'bg-emerald-100', borderRadius: 'rounded-full', opacity: 0.9 } },
        { type: 'text', x: 42, y: 52, width: 16, height: 8, style: { fontSize: 'body', fontWeight: 'medium', textAlign: 'center', color: 'text-emerald-700' }, content: '+3.8%' },
      ],
    },
  },
  // 15. Agenda
  {
    id: 'agenda-numbered',
    name: 'Agenda',
    description: 'Numbered list of topics',
    category: 'content',
    preview: {
      type: 'agenda-numbered',
      elements: [
        { type: 'text', x: 8, y: 10, width: 84, height: 8, style: { fontSize: 'title', fontWeight: 'bold', textAlign: 'left', color: 'text-slate-800' }, content: 'Agenda' },
        { type: 'text', x: 12, y: 24, width: 76, height: 56, style: { fontSize: 'body', textAlign: 'left', color: 'text-gray-700' }, content: '1. Introduction\n2. Strategy\n3. Roadmap\n4. Q&A' },
      ],
    },
  },
  // 16. Photo Grid (2x2)
  {
    id: 'photo-grid-2x2',
    name: 'Photo Grid (2x2)',
    description: 'Four images in a grid',
    category: 'content',
    preview: {
      type: 'photo-grid-2x2',
      elements: [
        { type: 'text', x: 8, y: 10, width: 84, height: 8, style: { fontSize: 'title', fontWeight: 'bold', textAlign: 'left', color: 'text-slate-800' }, content: 'Gallery' },
        { type: 'box', x: 8, y: 24, width: 40, height: 26, style: { backgroundColor: 'bg-blue-100', borderRadius: 'rounded-lg' } },
        { type: 'box', x: 52, y: 24, width: 40, height: 26, style: { backgroundColor: 'bg-amber-100', borderRadius: 'rounded-lg' } },
        { type: 'box', x: 8, y: 56, width: 40, height: 26, style: { backgroundColor: 'bg-emerald-100', borderRadius: 'rounded-lg' } },
        { type: 'box', x: 52, y: 56, width: 40, height: 26, style: { backgroundColor: 'bg-purple-100', borderRadius: 'rounded-lg' } },
      ],
    },
  },
  // 17. Image Left, Text Right
  {
    id: 'image-left-text-right',
    name: 'Image Left, Text Right',
    description: 'Large image with descriptive text',
    category: 'content',
    preview: {
      type: 'image-left-text-right',
      elements: [
        { type: 'text', x: 8, y: 10, width: 84, height: 8, style: { fontSize: 'title', fontWeight: 'bold', textAlign: 'left', color: 'text-slate-800' }, content: 'Case Study' },
        { type: 'box', x: 8, y: 24, width: 44, height: 56, style: { backgroundColor: 'bg-gray-100', borderRadius: 'rounded-lg' } },
        { type: 'text', x: 54, y: 24, width: 38, height: 56, style: { fontSize: 'body', textAlign: 'left', color: 'text-gray-700' }, content: 'Description and key outcomes' },
      ],
    },
  },
  // 18. Text Left, Image Right
  {
    id: 'text-left-image-right',
    name: 'Text Left, Image Right',
    description: 'Narrative with supporting image',
    category: 'content',
    preview: {
      type: 'text-left-image-right',
      elements: [
        { type: 'text', x: 8, y: 10, width: 84, height: 8, style: { fontSize: 'title', fontWeight: 'bold', textAlign: 'left', color: 'text-slate-800' }, content: 'Overview' },
        { type: 'text', x: 8, y: 24, width: 38, height: 56, style: { fontSize: 'body', textAlign: 'left', color: 'text-gray-700' }, content: 'Narrative and highlights' },
        { type: 'box', x: 52, y: 24, width: 40, height: 56, style: { backgroundColor: 'bg-gray-100', borderRadius: 'rounded-lg' } },
      ],
    },
  },
  // 19. Four Column Features
  {
    id: 'four-column-features',
    name: 'Four Column Features',
    description: 'Four features with colored cards',
    category: 'content',
    preview: {
      type: 'four-column-features',
      elements: [
        { type: 'text', x: 8, y: 10, width: 84, height: 8, style: { fontSize: 'title', fontWeight: 'bold', textAlign: 'left', color: 'text-slate-800' }, content: 'Features' },
        { type: 'box', x: 8, y: 24, width: 18, height: 56, style: { backgroundColor: 'bg-blue-100', borderRadius: 'rounded-lg' } },
        { type: 'box', x: 30, y: 24, width: 18, height: 56, style: { backgroundColor: 'bg-emerald-100', borderRadius: 'rounded-lg' } },
        { type: 'box', x: 52, y: 24, width: 18, height: 56, style: { backgroundColor: 'bg-amber-100', borderRadius: 'rounded-lg' } },
        { type: 'box', x: 74, y: 24, width: 18, height: 56, style: { backgroundColor: 'bg-purple-100', borderRadius: 'rounded-lg' } },
      ],
    },
  },
  // 20. Process (3 steps)
  {
    id: 'process-3-steps',
    name: 'Process (3 Steps)',
    description: 'Three-step horizontal process',
    category: 'content',
    preview: {
      type: 'process-3-steps',
      elements: [
        { type: 'text', x: 10, y: 10, width: 80, height: 8, style: { fontSize: 'title', fontWeight: 'bold', textAlign: 'center', color: 'text-slate-800' }, content: 'Process' },
        { type: 'box', x: 10, y: 30, width: 22, height: 40, style: { backgroundColor: 'bg-blue-100', borderRadius: 'rounded-lg' } },
        { type: 'line', x: 34, y: 48, width: 6, height: 1, style: { backgroundColor: 'bg-gray-300' } },
        { type: 'triangle', x: 40, y: 46, width: 3, height: 4, style: { backgroundColor: 'bg-gray-300' } },
        { type: 'box', x: 42, y: 30, width: 22, height: 40, style: { backgroundColor: 'bg-amber-100', borderRadius: 'rounded-lg' } },
        { type: 'line', x: 66, y: 48, width: 6, height: 1, style: { backgroundColor: 'bg-gray-300' } },
        { type: 'triangle', x: 72, y: 46, width: 3, height: 4, style: { backgroundColor: 'bg-gray-300' } },
        { type: 'box', x: 74, y: 30, width: 22, height: 40, style: { backgroundColor: 'bg-emerald-100', borderRadius: 'rounded-lg' } },
      ],
    },
  },
  // 21. SWOT Matrix (2x2)
  {
    id: 'swot-matrix',
    name: 'SWOT Matrix',
    description: '2×2 grid for SWOT',
    category: 'content',
    preview: {
      type: 'swot-matrix',
      elements: [
        { type: 'text', x: 8, y: 8, width: 84, height: 8, style: { fontSize: 'title', fontWeight: 'bold', textAlign: 'left', color: 'text-slate-800' }, content: 'SWOT' },
        { type: 'box', x: 8, y: 20, width: 40, height: 30, style: { backgroundColor: 'bg-blue-100', borderRadius: 'rounded-lg' } },
        { type: 'text', x: 10, y: 22, width: 36, height: 8, style: { fontSize: 'subtitle', fontWeight: 'bold', textAlign: 'left', color: 'text-blue-700' }, content: 'S' },
        { type: 'box', x: 52, y: 20, width: 40, height: 30, style: { backgroundColor: 'bg-emerald-100', borderRadius: 'rounded-lg' } },
        { type: 'text', x: 54, y: 22, width: 36, height: 8, style: { fontSize: 'subtitle', fontWeight: 'bold', textAlign: 'left', color: 'text-emerald-700' }, content: 'W' },
        { type: 'box', x: 8, y: 54, width: 40, height: 30, style: { backgroundColor: 'bg-amber-100', borderRadius: 'rounded-lg' } },
        { type: 'text', x: 10, y: 56, width: 36, height: 8, style: { fontSize: 'subtitle', fontWeight: 'bold', textAlign: 'left', color: 'text-amber-700' }, content: 'O' },
        { type: 'box', x: 52, y: 54, width: 40, height: 30, style: { backgroundColor: 'bg-purple-100', borderRadius: 'rounded-lg' } },
        { type: 'text', x: 54, y: 56, width: 36, height: 8, style: { fontSize: 'subtitle', fontWeight: 'bold', textAlign: 'left', color: 'text-purple-700' }, content: 'T' },
      ],
    },
  },
  // 22. Three Icons (Circles)
  {
    id: 'icons-3-circles',
    name: 'Three Icons',
    description: 'Three circular highlights with captions',
    category: 'content',
    preview: {
      type: 'icons-3-circles',
      elements: [
        { type: 'text', x: 8, y: 10, width: 84, height: 8, style: { fontSize: 'title', fontWeight: 'bold', textAlign: 'left', color: 'text-slate-800' }, content: 'Highlights' },
        { type: 'box', x: 12, y: 28, width: 18, height: 18, style: { backgroundColor: 'bg-blue-100', borderRadius: 'rounded-full' } },
        { type: 'text', x: 10, y: 48, width: 22, height: 8, style: { fontSize: 'body', textAlign: 'center', color: 'text-gray-700' }, content: 'Item 1' },
        { type: 'box', x: 41, y: 28, width: 18, height: 18, style: { backgroundColor: 'bg-emerald-100', borderRadius: 'rounded-full' } },
        { type: 'text', x: 39, y: 48, width: 22, height: 8, style: { fontSize: 'body', textAlign: 'center', color: 'text-gray-700' }, content: 'Item 2' },
        { type: 'box', x: 70, y: 28, width: 18, height: 18, style: { backgroundColor: 'bg-amber-100', borderRadius: 'rounded-full' } },
        { type: 'text', x: 68, y: 48, width: 22, height: 8, style: { fontSize: 'body', textAlign: 'center', color: 'text-gray-700' }, content: 'Item 3' },
      ],
    },
  },
  // 23. Venn Diagram (3)
  {
    id: 'venn-3',
    name: 'Venn Diagram',
    description: 'Three overlapping circles with labels',
    category: 'content',
    preview: {
      type: 'venn-3',
      elements: [
        { type: 'text', x: 8, y: 10, width: 84, height: 8, style: { fontSize: 'title', fontWeight: 'bold', textAlign: 'left', color: 'text-slate-800' }, content: 'Overlap' },
        { type: 'box', x: 30, y: 32, width: 22, height: 22, style: { backgroundColor: 'bg-blue-100', borderRadius: 'rounded-full', opacity: 0.65 } },
        { type: 'box', x: 46, y: 32, width: 22, height: 22, style: { backgroundColor: 'bg-emerald-100', borderRadius: 'rounded-full', opacity: 0.65 } },
        { type: 'box', x: 38, y: 44, width: 22, height: 22, style: { backgroundColor: 'bg-amber-100', borderRadius: 'rounded-full', opacity: 0.65 } },
        { type: 'text', x: 30, y: 56, width: 16, height: 6, style: { fontSize: 'sm', textAlign: 'center', color: 'text-gray-700' }, content: 'A' },
        { type: 'text', x: 54, y: 56, width: 16, height: 6, style: { fontSize: 'sm', textAlign: 'center', color: 'text-gray-700' }, content: 'B' },
        { type: 'text', x: 42, y: 70, width: 16, height: 6, style: { fontSize: 'sm', textAlign: 'center', color: 'text-gray-700' }, content: 'C' },
      ],
    },
  },
  // 24. Vertical Timeline
  {
    id: 'timeline-vertical',
    name: 'Timeline (Vertical)',
    description: 'Vertical milestones with dots',
    category: 'content',
    preview: {
      type: 'timeline-vertical',
      elements: [
        { type: 'text', x: 10, y: 10, width: 80, height: 8, style: { fontSize: 'title', fontWeight: 'bold', textAlign: 'center', color: 'text-slate-800' }, content: 'Roadmap' },
        { type: 'line', x: 48, y: 24, width: 1.2, height: 60, style: { backgroundColor: 'bg-gray-300' } },
        { type: 'box', x: 46, y: 24, width: 5, height: 5, style: { backgroundColor: 'bg-blue-100', borderRadius: 'rounded-full' } },
        { type: 'text', x: 52, y: 24, width: 40, height: 8, style: { fontSize: 'sm', textAlign: 'left', color: 'text-gray-700' }, content: 'Phase 1' },
        { type: 'box', x: 46, y: 44, width: 5, height: 5, style: { backgroundColor: 'bg-amber-100', borderRadius: 'rounded-full' } },
        { type: 'text', x: 52, y: 44, width: 40, height: 8, style: { fontSize: 'sm', textAlign: 'left', color: 'text-gray-700' }, content: 'Phase 2' },
        { type: 'box', x: 46, y: 64, width: 5, height: 5, style: { backgroundColor: 'bg-emerald-100', borderRadius: 'rounded-full' } },
        { type: 'text', x: 52, y: 64, width: 40, height: 8, style: { fontSize: 'sm', textAlign: 'left', color: 'text-gray-700' }, content: 'Phase 3' },
      ],
    },
  },
  // 25. Funnel (5 Levels)
  {
    id: 'funnel-5',
    name: 'Funnel (5 Levels)',
    description: 'Decreasing width stages',
    category: 'content',
    preview: {
      type: 'funnel-5',
      elements: [
        { type: 'text', x: 8, y: 8, width: 84, height: 8, style: { fontSize: 'title', fontWeight: 'bold', textAlign: 'left', color: 'text-slate-800' }, content: 'Funnel' },
        { type: 'box', x: 12, y: 22, width: 76, height: 8, style: { backgroundColor: 'bg-blue-100', borderRadius: 'rounded-md' } },
        { type: 'box', x: 16, y: 32, width: 68, height: 8, style: { backgroundColor: 'bg-emerald-100', borderRadius: 'rounded-md' } },
        { type: 'box', x: 20, y: 42, width: 60, height: 8, style: { backgroundColor: 'bg-amber-100', borderRadius: 'rounded-md' } },
        { type: 'box', x: 24, y: 52, width: 52, height: 8, style: { backgroundColor: 'bg-purple-100', borderRadius: 'rounded-md' } },
        { type: 'box', x: 28, y: 62, width: 44, height: 8, style: { backgroundColor: 'bg-red-100', borderRadius: 'rounded-md' } },
      ],
    },
  },
  // 26. Pyramid (4 Layers)
  {
    id: 'pyramid-4',
    name: 'Pyramid (4 Layers)',
    description: 'Stacked layers centered',
    category: 'content',
    preview: {
      type: 'pyramid-4',
      elements: [
        { type: 'text', x: 8, y: 8, width: 84, height: 8, style: { fontSize: 'title', fontWeight: 'bold', textAlign: 'left', color: 'text-slate-800' }, content: 'Pyramid' },
        { type: 'box', x: 20, y: 60, width: 60, height: 8, style: { backgroundColor: 'bg-gray-100', borderRadius: 'rounded-md' } },
        { type: 'box', x: 26, y: 50, width: 48, height: 8, style: { backgroundColor: 'bg-blue-100', borderRadius: 'rounded-md' } },
        { type: 'box', x: 32, y: 40, width: 36, height: 8, style: { backgroundColor: 'bg-amber-100', borderRadius: 'rounded-md' } },
        { type: 'box', x: 38, y: 30, width: 24, height: 8, style: { backgroundColor: 'bg-emerald-100', borderRadius: 'rounded-md' } },
      ],
    },
  },
  // 27. Pie KPI
  {
    id: 'pie-kpi',
    name: 'Pie KPI',
    description: 'Pie chart with callout',
    category: 'content',
    preview: {
      type: 'pie-kpi',
      elements: [
        { type: 'text', x: 8, y: 10, width: 84, height: 8, style: { fontSize: 'title', fontWeight: 'bold', textAlign: 'left', color: 'text-slate-800' }, content: 'Distribution' },
        { type: 'chart', x: 10, y: 24, width: 40, height: 52, style: { chartType: 'pie', backgroundColor: 'bg-blue-400' } },
        { type: 'text', x: 54, y: 30, width: 36, height: 10, style: { fontSize: 'subtitle', textAlign: 'left', color: 'text-gray-700' }, content: 'Key Segment' },
        { type: 'text', x: 54, y: 42, width: 36, height: 8, style: { fontSize: 'body', textAlign: 'left', color: 'text-gray-700' }, content: 'Notes and callout' },
      ],
    },
  },
  // 28. Org Chart (3 Levels)
  {
    id: 'org-chart-3',
    name: 'Org Chart',
    description: 'Three-level org structure',
    category: 'content',
    preview: {
      type: 'org-chart-3',
      elements: [
        { type: 'box', x: 42, y: 16, width: 16, height: 10, style: { backgroundColor: 'bg-blue-100', borderRadius: 'rounded-lg' } },
        { type: 'line', x: 49.5, y: 26, width: 1, height: 6, style: { backgroundColor: 'bg-gray-300' } },
        { type: 'box', x: 26, y: 34, width: 16, height: 10, style: { backgroundColor: 'bg-emerald-100', borderRadius: 'rounded-lg' } },
        { type: 'box', x: 58, y: 34, width: 16, height: 10, style: { backgroundColor: 'bg-amber-100', borderRadius: 'rounded-lg' } },
        { type: 'line', x: 34, y: 44, width: 32, height: 1, style: { backgroundColor: 'bg-gray-300' } },
        { type: 'box', x: 18, y: 46, width: 16, height: 10, style: { backgroundColor: 'bg-purple-100', borderRadius: 'rounded-lg' } },
        { type: 'box', x: 42, y: 46, width: 16, height: 10, style: { backgroundColor: 'bg-blue-100', borderRadius: 'rounded-lg' } },
        { type: 'box', x: 66, y: 46, width: 16, height: 10, style: { backgroundColor: 'bg-emerald-100', borderRadius: 'rounded-lg' } },
      ],
    },
  },
  // 29. Matrix (3x3)
  {
    id: 'matrix-3x3',
    name: 'Matrix 3x3',
    description: 'Nine blocks with headers',
    category: 'content',
    preview: {
      type: 'matrix-3x3',
      elements: [
        { type: 'text', x: 8, y: 8, width: 84, height: 8, style: { fontSize: 'title', fontWeight: 'bold', textAlign: 'left', color: 'text-slate-800' }, content: 'Matrix' },
        { type: 'box', x: 8, y: 22, width: 26, height: 20, style: { backgroundColor: 'bg-gray-100', borderRadius: 'rounded-lg' } },
        { type: 'box', x: 37, y: 22, width: 26, height: 20, style: { backgroundColor: 'bg-gray-100', borderRadius: 'rounded-lg' } },
        { type: 'box', x: 66, y: 22, width: 26, height: 20, style: { backgroundColor: 'bg-gray-100', borderRadius: 'rounded-lg' } },
        { type: 'box', x: 8, y: 46, width: 26, height: 20, style: { backgroundColor: 'bg-gray-100', borderRadius: 'rounded-lg' } },
        { type: 'box', x: 37, y: 46, width: 26, height: 20, style: { backgroundColor: 'bg-gray-100', borderRadius: 'rounded-lg' } },
        { type: 'box', x: 66, y: 46, width: 26, height: 20, style: { backgroundColor: 'bg-gray-100', borderRadius: 'rounded-lg' } },
      ],
    },
  },
  // 31. Milestones (5)
  {
    id: 'milestones-5',
    name: 'Milestones (5)',
    description: 'Horizontal line with five dots',
    category: 'content',
    preview: {
      type: 'milestones-5',
      elements: [
        { type: 'text', x: 8, y: 10, width: 84, height: 8, style: { fontSize: 'title', fontWeight: 'bold', textAlign: 'left', color: 'text-slate-800' }, content: 'Milestones' },
        { type: 'line', x: 12, y: 52, width: 76, height: 1.5, style: { backgroundColor: 'bg-gray-300' } },
        { type: 'box', x: 12, y: 48, width: 4, height: 4, style: { backgroundColor: 'bg-blue-100', borderRadius: 'rounded-full' } },
        { type: 'box', x: 28, y: 48, width: 4, height: 4, style: { backgroundColor: 'bg-emerald-100', borderRadius: 'rounded-full' } },
        { type: 'box', x: 44, y: 48, width: 4, height: 4, style: { backgroundColor: 'bg-amber-100', borderRadius: 'rounded-full' } },
        { type: 'box', x: 60, y: 48, width: 4, height: 4, style: { backgroundColor: 'bg-purple-100', borderRadius: 'rounded-full' } },
        { type: 'box', x: 84, y: 48, width: 4, height: 4, style: { backgroundColor: 'bg-red-100', borderRadius: 'rounded-full' } },
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
