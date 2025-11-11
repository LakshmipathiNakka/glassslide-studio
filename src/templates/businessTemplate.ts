import { Slide } from "@/types/slide-thumbnails";

const createBusinessTemplate = (): Slide[] => {
  const now = Date.now();
  
  return [
    // Slide 1: Title Slide
    {
      id: `slide-${now}-1`,
      elements: [
        // Background gradient
        {
          id: `bg-${now}-1`,
          type: 'shape',
          x: 0,
          y: 0,
          width: 960,
          height: 540,
          fill: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
          selectable: false,
          hoverCursor: 'default',
          zIndex: 0
        },
        // Title
        {
          id: `title-${now}-1`,
          type: 'text',
          x: 100,
          y: 150,
          width: 760,
          height: 100,
          text: 'Business Strategy 2025',
          fontSize: 64,
          fontWeight: 'bold',
          fontFamily: 'SF Pro Display, sans-serif',
          fill: '#ffffff',
          textAlign: 'center',
          zIndex: 2
        },
        // Subtitle
        {
          id: `subtitle-${now}-1`,
          type: 'text',
          x: 100,
          y: 250,
          width: 760,
          height: 40,
          text: 'Presented by [Your Company Name]',
          fontSize: 28,
          fontFamily: 'SF Pro Text, sans-serif',
          fill: '#d1d5db',
          textAlign: 'center',
          zIndex: 2
        },
        // Decorative shape
        {
          id: `shape-${now}-1`,
          type: 'shape',
          x: 280,
          y: 220,
          width: 400,
          height: 120,
          rx: 20,
          ry: 20,
          fill: 'rgba(255, 255, 255, 0.1)',
          stroke: 'rgba(255, 255, 255, 0.2)',
          strokeWidth: 1,
          zIndex: 1
        }
      ],
      background: '#0f2027',
      createdAt: new Date(),
      lastUpdated: Date.now()
    },
    // Slide 2: Agenda
    {
      id: `slide-${now}-2`,
      elements: [
        // Background
        {
          id: `bg-${now}-2`,
          type: 'shape',
          x: 0,
          y: 0,
          width: 960,
          height: 540,
          fill: '#f9fafb',
          selectable: false,
          hoverCursor: 'default',
          zIndex: 0
        },
        // Header
        {
          id: `header-${now}-2`,
          type: 'text',
          x: 100,
          y: 80,
          width: 760,
          height: 60,
          text: 'Agenda',
          fontSize: 40,
          fontWeight: 'bold',
          fontFamily: 'SF Pro Display, sans-serif',
          fill: '#111827',
          zIndex: 2
        },
        // Accent bar
        {
          id: `accent-${now}-2`,
          type: 'shape',
          x: 80,
          y: 90,
          width: 8,
          height: 40,
          fill: '#2563eb',
          zIndex: 1
        },
        // Table (implemented as a text element for now)
        {
          id: `table-${now}-2`,
          type: 'text',
          x: 100,
          y: 180,
          width: 760,
          height: 300,
          text: '• Overview: Key highlights and objectives\n' +
                '• Market Insights: Industry trends and analysis\n' +
                '• Product Strategy: Roadmap and features\n' +
                '• Financials: Revenue and projections\n' +
                '• Next Steps: Action items and timeline',
          fontSize: 20,
          fontFamily: 'SF Pro Text, sans-serif',
          fill: '#374151',
          lineHeight: 1.6,
          zIndex: 2
        }
      ],
      background: '#f9fafb',
      createdAt: new Date(),
      lastUpdated: Date.now()
    },
    // Additional slides would be added here following the same pattern
    // For brevity, I've included the first two slides as examples
  ];
};

export default createBusinessTemplate;
