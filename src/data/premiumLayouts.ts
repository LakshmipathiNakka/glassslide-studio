/**
 * Premium Layout Templates
 * Apple Keynote-inspired slide layout definitions with miniature preview data
 */

export interface PreviewElement {
  type: 'text' | 'line' | 'box' | 'gradient';
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
  {
    id: 'title-slide',
    name: 'Title Slide',
    description: 'Perfect for opening slides with centered title and subtitle',
    category: 'title',
    preview: {
      type: 'title-centered',
      elements: [
        {
          type: 'text',
          x: 10,
          y: 35,
          width: 80,
          height: 12,
          style: {
            fontSize: 'xl',
            fontWeight: 'bold',
            textAlign: 'center',
            color: 'text-gray-900',
          },
          content: 'Title',
        },
        {
          type: 'line',
          x: 35,
          y: 50,
          width: 30,
          height: 1,
          style: {
            backgroundColor: 'bg-gradient-to-r from-blue-400 to-purple-500',
          },
        },
        {
          type: 'text',
          x: 20,
          y: 55,
          width: 60,
          height: 8,
          style: {
            fontSize: 'sm',
            fontWeight: 'normal',
            textAlign: 'center',
            color: 'text-gray-600',
          },
          content: 'Subtitle',
        },
      ],
    },
  },
  {
    id: 'title-content',
    name: 'Title & Content',
    description: 'Standard layout with title and large content area',
    category: 'content',
    preview: {
      type: 'title-body',
      elements: [
        {
          type: 'text',
          x: 8,
          y: 12,
          width: 84,
          height: 10,
          style: {
            fontSize: 'lg',
            fontWeight: 'bold',
            textAlign: 'left',
            color: 'text-gray-900',
          },
          content: 'Title',
        },
        {
          type: 'box',
          x: 8,
          y: 28,
          width: 84,
          height: 60,
          style: {
            backgroundColor: 'bg-gray-100',
            borderRadius: 'rounded-lg',
            opacity: 0.5,
          },
        },
      ],
    },
  },
  {
    id: 'two-column',
    name: 'Two Content',
    description: 'Split layout for side-by-side content',
    category: 'content',
    preview: {
      type: 'two-columns',
      elements: [
        {
          type: 'text',
          x: 8,
          y: 12,
          width: 84,
          height: 10,
          style: {
            fontSize: 'lg',
            fontWeight: 'bold',
            textAlign: 'center',
            color: 'text-gray-900',
          },
          content: 'Title',
        },
        {
          type: 'box',
          x: 8,
          y: 28,
          width: 40,
          height: 60,
          style: {
            backgroundColor: 'bg-gray-100',
            borderRadius: 'rounded-lg',
            opacity: 0.5,
          },
        },
        {
          type: 'box',
          x: 52,
          y: 28,
          width: 40,
          height: 60,
          style: {
            backgroundColor: 'bg-gray-100',
            borderRadius: 'rounded-lg',
            opacity: 0.5,
          },
        },
      ],
    },
  },
  {
    id: 'comparison',
    name: 'Comparison',
    description: 'Before/after or vs. layout with contrasting sections',
    category: 'content',
    preview: {
      type: 'comparison',
      elements: [
        {
          type: 'text',
          x: 8,
          y: 12,
          width: 84,
          height: 10,
          style: {
            fontSize: 'lg',
            fontWeight: 'bold',
            textAlign: 'center',
            color: 'text-gray-900',
          },
          content: 'Comparison',
        },
        {
          type: 'box',
          x: 8,
          y: 28,
          width: 40,
          height: 60,
          style: {
            backgroundColor: 'bg-blue-100',
            borderRadius: 'rounded-lg',
            opacity: 0.7,
          },
        },
        {
          type: 'box',
          x: 52,
          y: 28,
          width: 40,
          height: 60,
          style: {
            backgroundColor: 'bg-purple-100',
            borderRadius: 'rounded-lg',
            opacity: 0.7,
          },
        },
      ],
    },
  },
  {
    id: 'section-header',
    name: 'Section Header',
    description: 'Large centered text for section dividers',
    category: 'section',
    preview: {
      type: 'section-break',
      elements: [
        {
          type: 'gradient',
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          style: {
            gradient: 'bg-gradient-to-br from-blue-400/20 to-purple-500/20',
          },
        },
        {
          type: 'text',
          x: 10,
          y: 42,
          width: 80,
          height: 16,
          style: {
            fontSize: '2xl',
            fontWeight: 'bold',
            textAlign: 'center',
            color: 'text-gray-900',
          },
          content: 'Section',
        },
      ],
    },
  },
  {
    id: 'blank',
    name: 'Blank',
    description: 'Empty canvas for custom layouts',
    category: 'blank',
    preview: {
      type: 'empty',
      elements: [],
    },
  },
];

export const getLayoutById = (id: string): LayoutPreview | undefined => {
  return PREMIUM_LAYOUTS.find(layout => layout.id === id);
};

export const getLayoutsByCategory = (category: string): LayoutPreview[] => {
  return PREMIUM_LAYOUTS.filter(layout => layout.category === category);
};
