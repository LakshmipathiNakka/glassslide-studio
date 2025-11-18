import { Slide } from '@/types/slide-thumbnails';
import { Element } from '@/hooks/use-action-manager';

type ShapeType =
  | 'rectangle'
  | 'rounded-rectangle'
  | 'circle'
  | 'triangle'
  | 'star'
  | 'arrow-right'
  | 'arrow-double'
  | 'diamond'
  | 'pentagon'
  | 'hexagon'
  | 'cloud'
  | 'heart'
  | 'lightning'
  | 'line'
  | 'text-box';

// Futuristic dark-mode palette for technology & innovation
const COLORS = {
  DEEP_BLACK: '#0D1117',
  NEON_CYAN: '#00FFFF',
  NEON_GREEN: '#39FF14',
  WHITE: '#FFFFFF',
};

const createTextElement = (
  id: string,
  text: string,
  x: number,
  y: number,
  width: number,
  height: number,
  styles: Partial<Element> = {},
): Element => ({
  id,
  type: 'text',
  x,
  y,
  width,
  height,
  text,
  fontSize: 18,
  fontFamily: 'Arial, sans-serif',
  fontWeight: 'normal',
  color: COLORS.WHITE,
  textAlign: 'left',
  lineHeight: 1.4,
  zIndex: 1,
  ...styles,
});

const createShape = (
  id: string,
  shapeType: ShapeType,
  x: number,
  y: number,
  width: number,
  height: number,
  styles: Partial<Element> = {},
): Element => ({
  id,
  type: 'shape',
  shapeType,
  x,
  y,
  width,
  height,
  fill: 'transparent',
  stroke: COLORS.NEON_CYAN,
  strokeWidth: 1,
  opacity: 1,
  zIndex: 0,
  ...styles,
});

const createChart = (
  id: string,
  chartType: 'bar' | 'line' | 'pie',
  x: number,
  y: number,
  width: number,
  height: number,
  chartData: any,
  options: any = {},
): Element => ({
  id,
  type: 'chart',
  chartType,
  x,
  y,
  width,
  height,
  chartData,
  ...(options ? { options } : {}),
  zIndex: 1,
});

const createTechnologyInnovationTemplate = (): Slide[] => {
  const createdAt = new Date();

  // Slide 1 – Futuristic Title Slide
  const titleSlide: Slide = {
    id: 'tech-title',
    background: COLORS.DEEP_BLACK,
    createdAt,
    elements: [
      // Thin geometric frame around title area (top and bottom lines only)
      createShape('title-frame-top', 'rectangle', 160, 120, 640, 2, {
        stroke: 'transparent',
        fill: COLORS.NEON_CYAN,
        opacity: 0.5,
      }),
      createShape('title-frame-bottom', 'rectangle', 160, 260, 640, 2, {
        stroke: 'transparent',
        fill: COLORS.NEON_CYAN,
        opacity: 0.5,
      }),
      // Title
      createTextElement('title', 'Technology & Innovation', 80, 150, 800, 60, {
        fontSize: 44,
        fontWeight: 'bold',
        color: COLORS.NEON_CYAN,
        textAlign: 'center',
      }),
      // Subtitle
      createTextElement('subtitle', 'Product Presentation & AI Overview', 80, 210, 800, 40, {
        fontSize: 20,
        color: COLORS.WHITE,
        textAlign: 'center',
      }),
      // Small angular accent in corner
      createShape('accent-triangle', 'triangle', 80, 80, 36, 28, {
        fill: 'transparent',
        stroke: COLORS.NEON_GREEN,
        strokeWidth: 1,
      }),
    ],
  };

  // Slide 2 – Agenda
  const agendaSlide: Slide = {
    id: 'tech-agenda',
    background: COLORS.DEEP_BLACK,
    createdAt,
    elements: [
      createTextElement('title', 'Agenda', 80, 60, 800, 40, {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.WHITE,
      }),
      // Neon accent line on the left
      createShape('left-line', 'rectangle', 80, 120, 2, 260, {
        stroke: 'transparent',
        fill: COLORS.NEON_CYAN,
      }),
      createTextElement('item-1', '•  Introduction', 110, 120, 600, 30, {}),
      createTextElement('item-2', '•  Tech Stack', 110, 155, 600, 30, {}),
      createTextElement('item-3', '•  Architecture', 110, 190, 600, 30, {}),
      createTextElement('item-4', '•  Demos', 110, 225, 600, 30, {}),
      createTextElement('item-5', '•  Metrics', 110, 260, 600, 30, {}),
      createTextElement('item-6', '•  Roadmap', 110, 295, 600, 30, {}),
    ],
  };

  // Slide 3 – Tech Stack Overview (Icons)
  const techStackSlide: Slide = {
    id: 'tech-stack',
    background: COLORS.DEEP_BLACK,
    createdAt,
    elements: [
      createTextElement('title', 'Tech Stack Overview', 80, 60, 800, 40, {
        fontSize: 28,
        fontWeight: 'bold',
      }),
      createTextElement('subtitle', 'Core technologies powering the platform.', 80, 100, 800, 30, {
        fontSize: 16,
        color: '#E5E7EB',
      }),
      // Grid of 5 icon+label pairs
      // Frontend
      createShape('icon-frontend', 'hexagon', 120, 170, 60, 60, {
        stroke: COLORS.NEON_CYAN,
      }),
      createTextElement('label-frontend', 'Frontend', 110, 240, 80, 24, {
        fontSize: 14,
        color: COLORS.NEON_CYAN,
        textAlign: 'center',
      }),
      // Backend
      createShape('icon-backend', 'hexagon', 260, 170, 60, 60, {
        stroke: COLORS.NEON_CYAN,
      }),
      createTextElement('label-backend', 'Backend', 250, 240, 80, 24, {
        fontSize: 14,
        color: COLORS.NEON_CYAN,
        textAlign: 'center',
      }),
      // Database
      createShape('icon-db', 'hexagon', 400, 170, 60, 60, {
        stroke: COLORS.NEON_CYAN,
      }),
      createTextElement('label-db', 'Database', 390, 240, 80, 24, {
        fontSize: 14,
        color: COLORS.NEON_CYAN,
        textAlign: 'center',
      }),
      // Cloud
      createShape('icon-cloud', 'hexagon', 540, 170, 60, 60, {
        stroke: COLORS.NEON_CYAN,
      }),
      createTextElement('label-cloud', 'Cloud', 530, 240, 80, 24, {
        fontSize: 14,
        color: COLORS.NEON_CYAN,
        textAlign: 'center',
      }),
      // AI/ML
      createShape('icon-ai', 'hexagon', 680, 170, 60, 60, {
        stroke: COLORS.NEON_CYAN,
      }),
      createTextElement('label-ai', 'AI / ML', 670, 240, 80, 24, {
        fontSize: 14,
        color: COLORS.NEON_CYAN,
        textAlign: 'center',
      }),
    ],
  };

  // Slide 4 – Product Architecture (Diagram)
  const architectureSlide: Slide = {
    id: 'tech-architecture',
    background: COLORS.DEEP_BLACK,
    createdAt,
    elements: [
      createTextElement('title', 'Product Architecture', 80, 60, 800, 40, {
        fontSize: 28,
        fontWeight: 'bold',
      }),
      createTextElement(
        'subtitle',
        'High-level request flow from client through services and AI engine.',
        80,
        100,
        800,
        30,
        {
          fontSize: 16,
          color: '#E5E7EB',
        },
      ),
      // Blocks
      createShape('block-client', 'rounded-rectangle', 80, 200, 140, 60, {
        stroke: COLORS.NEON_CYAN,
      }),
      createTextElement('block-client-label', 'Client', 80, 220, 140, 30, {
        textAlign: 'center',
      }),

      createShape('block-gateway', 'rounded-rectangle', 240, 200, 160, 60, {
        stroke: COLORS.NEON_CYAN,
      }),
      createTextElement('block-gateway-label', 'API Gateway', 240, 220, 160, 30, {
        textAlign: 'center',
      }),

      createShape('block-microservices', 'rounded-rectangle', 430, 200, 180, 60, {
        stroke: COLORS.NEON_CYAN,
      }),
      createTextElement('block-microservices-label', 'Microservices', 430, 220, 180, 30, {
        textAlign: 'center',
      }),

      createShape('block-db', 'rounded-rectangle', 640, 200, 120, 60, {
        stroke: COLORS.NEON_CYAN,
      }),
      createTextElement('block-db-label', 'DB', 640, 220, 120, 30, {
        textAlign: 'center',
      }),

      createShape('block-ai', 'rounded-rectangle', 800, 200, 140, 60, {
        stroke: COLORS.NEON_GREEN,
      }),
      createTextElement('block-ai-label', 'AI Engine', 800, 220, 140, 30, {
        textAlign: 'center',
        color: COLORS.NEON_GREEN,
      }),

      // Arrows (thin neon strokes)
      createShape('arrow-1', 'arrow-right', 220, 215, 20, 30, {
        stroke: COLORS.NEON_CYAN,
      }),
      createShape('arrow-2', 'arrow-right', 410, 215, 20, 30, {
        stroke: COLORS.NEON_CYAN,
      }),
      createShape('arrow-3', 'arrow-right', 620, 215, 20, 30, {
        stroke: COLORS.NEON_CYAN,
      }),
      createShape('arrow-4', 'arrow-right', 770, 215, 20, 30, {
        stroke: COLORS.NEON_CYAN,
      }),
    ],
  };

  // Slide 5 – Performance Graphs
  const performanceSlide: Slide = {
    id: 'tech-performance',
    background: COLORS.DEEP_BLACK,
    createdAt,
    elements: [
      createTextElement('title', 'Performance Metrics', 80, 60, 800, 40, {
        fontSize: 28,
        fontWeight: 'bold',
      }),
      // Line chart: Response Time vs Peak Load
      createTextElement('line-title', 'Response Time vs Peak Load', 80, 110, 400, 24, {
        fontSize: 16,
        color: '#E5E7EB',
      }),
      createChart(
        'chart-response',
        'line',
        80,
        140,
        380,
        260,
        {
          labels: ['1K', '5K', '10K', '25K', '50K', '100K'],
          datasets: [
            {
              label: 'Avg Response (ms)',
              data: [90, 110, 135, 170, 210, 260],
              borderColor: COLORS.NEON_CYAN,
              backgroundColor: 'rgba(0,255,255,0.12)',
            },
          ],
        },
        {
          scales: {
            x: { grid: { display: false }, ticks: { color: '#9CA3AF' } },
            y: { grid: { color: 'rgba(148,163,184,0.35)' }, ticks: { color: '#9CA3AF' } },
          },
        },
      ),
      // Bar chart: API Throughput
      createTextElement('bar-title', 'API Throughput Comparison', 500, 110, 380, 24, {
        fontSize: 16,
        color: '#E5E7EB',
      }),
      createChart(
        'chart-throughput',
        'bar',
        500,
        140,
        380,
        260,
        {
          labels: ['v1', 'v2', 'v3'],
          datasets: [
            {
              label: 'Requests/sec',
              data: [1200, 1850, 2300],
              backgroundColor: [COLORS.NEON_CYAN, COLORS.NEON_GREEN, COLORS.NEON_CYAN],
            },
          ],
        },
        {
          scales: {
            x: { grid: { display: false }, ticks: { color: '#9CA3AF' } },
            y: { grid: { color: 'rgba(148,163,184,0.35)' }, ticks: { color: '#9CA3AF' } },
          },
        },
      ),
    ],
  };

  // Slide 6 – Use-Case Gallery (Feature panels)
  const useCaseSlide: Slide = {
    id: 'tech-use-cases',
    background: COLORS.DEEP_BLACK,
    createdAt,
    elements: [
      createTextElement('title', 'Use-Case Gallery', 80, 60, 800, 40, {
        fontSize: 28,
        fontWeight: 'bold',
      }),
      // Panels grid (two rows)
      // Each panel: neon top border + white text + small accent
      // Row 1
      createShape('panel-1-top', 'rectangle', 80, 120, 260, 3, {
        stroke: 'transparent',
        fill: COLORS.NEON_CYAN,
      }),
      createTextElement('panel-1-title', 'Real-time analytics', 80, 130, 260, 24, {
        fontSize: 16,
        fontWeight: 'bold',
      }),
      createTextElement('panel-1-body', 'Live dashboards for streaming events and KPIs.', 80, 155, 260, 40, {
        fontSize: 14,
        color: '#E5E7EB',
      }),

      createShape('panel-2-top', 'rectangle', 360, 120, 260, 3, {
        stroke: 'transparent',
        fill: COLORS.NEON_CYAN,
      }),
      createTextElement('panel-2-title', 'Automated fraud detection', 360, 130, 260, 24, {
        fontSize: 16,
        fontWeight: 'bold',
      }),
      createTextElement('panel-2-body', 'Behavioral models flag anomalies in milliseconds.', 360, 155, 260, 40, {
        fontSize: 14,
        color: '#E5E7EB',
      }),

      createShape('panel-3-top', 'rectangle', 640, 120, 260, 3, {
        stroke: 'transparent',
        fill: COLORS.NEON_CYAN,
      }),
      createTextElement('panel-3-title', 'AI-assisted recommendations', 640, 130, 260, 24, {
        fontSize: 16,
        fontWeight: 'bold',
      }),
      createTextElement('panel-3-body', 'Personalization engine for content and offers.', 640, 155, 260, 40, {
        fontSize: 14,
        color: '#E5E7EB',
      }),

      // Row 2
      createShape('panel-4-top', 'rectangle', 80, 230, 260, 3, {
        stroke: 'transparent',
        fill: COLORS.NEON_CYAN,
      }),
      createTextElement('panel-4-title', 'Predictive maintenance', 80, 240, 260, 24, {
        fontSize: 16,
        fontWeight: 'bold',
      }),
      createTextElement('panel-4-body', 'Sensor data models predict failures before they occur.', 80, 265, 260, 40, {
        fontSize: 14,
        color: '#E5E7EB',
      }),

      createShape('panel-5-top', 'rectangle', 360, 230, 260, 3, {
        stroke: 'transparent',
        fill: COLORS.NEON_CYAN,
      }),
      createTextElement('panel-5-title', 'Smart notifications', 360, 240, 260, 24, {
        fontSize: 16,
        fontWeight: 'bold',
      }),
      createTextElement('panel-5-body', 'Channel-aware alerts tuned for user preferences.', 360, 265, 260, 40, {
        fontSize: 14,
        color: '#E5E7EB',
      }),
    ],
  };

  // Slide 7 – Metrics Dashboard
  const metricsSlide: Slide = {
    id: 'tech-metrics',
    background: COLORS.DEEP_BLACK,
    createdAt,
    elements: [
      createTextElement('title', 'Metrics Dashboard', 80, 60, 800, 40, {
        fontSize: 28,
        fontWeight: 'bold',
      }),
      // Card-style metric blocks
      createShape('metric-uptime', 'rounded-rectangle', 80, 130, 200, 90, {
        stroke: COLORS.NEON_CYAN,
      }),
      createTextElement('metric-uptime-label', 'Uptime', 90, 140, 180, 24, {
        fontSize: 14,
        color: '#E5E7EB',
      }),
      createTextElement('metric-uptime-value', '99.98%', 90, 165, 180, 30, {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.NEON_GREEN,
      }),

      createShape('metric-latency', 'rounded-rectangle', 300, 130, 200, 90, {
        stroke: COLORS.NEON_CYAN,
      }),
      createTextElement('metric-latency-label', 'Avg Latency', 310, 140, 180, 24, {
        fontSize: 14,
        color: '#E5E7EB',
      }),
      createTextElement('metric-latency-value', '120 ms', 310, 165, 180, 30, {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.NEON_GREEN,
      }),

      createShape('metric-users', 'rounded-rectangle', 520, 130, 200, 90, {
        stroke: COLORS.NEON_CYAN,
      }),
      createTextElement('metric-users-label', 'Active Users', 530, 140, 180, 24, {
        fontSize: 14,
        color: '#E5E7EB',
      }),
      createTextElement('metric-users-value', '480K / month', 530, 165, 180, 30, {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.NEON_GREEN,
      }),

      createShape('metric-data', 'rounded-rectangle', 740, 130, 200, 90, {
        stroke: COLORS.NEON_CYAN,
      }),
      createTextElement('metric-data-label', 'Data Processed', 750, 140, 180, 24, {
        fontSize: 14,
        color: '#E5E7EB',
      }),
      createTextElement('metric-data-value', '2.3 TB / day', 750, 165, 180, 30, {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.NEON_GREEN,
      }),

      createShape('metric-accuracy', 'rounded-rectangle', 80, 240, 200, 90, {
        stroke: COLORS.NEON_CYAN,
      }),
      createTextElement('metric-accuracy-label', 'AI Model Accuracy', 90, 250, 180, 24, {
        fontSize: 14,
        color: '#E5E7EB',
      }),
      createTextElement('metric-accuracy-value', '94.2%', 90, 275, 180, 30, {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.NEON_GREEN,
      }),
    ],
  };

  // Slide 8 – Innovations Timeline
  const timelineSlide: Slide = {
    id: 'tech-timeline',
    background: COLORS.DEEP_BLACK,
    createdAt,
    elements: [
      createTextElement('title', 'Innovation Roadmap', 80, 60, 800, 40, {
        fontSize: 28,
        fontWeight: 'bold',
      }),
      // Timeline line
      createShape('timeline-line', 'rectangle', 80, 220, 800, 3, {
        stroke: 'transparent',
        fill: COLORS.NEON_CYAN,
      }),
      // Nodes
      createShape('node-1', 'circle', 130, 210, 18, 18, {
        stroke: COLORS.NEON_CYAN,
      }),
      createTextElement('node-1-label', '2024 Q1', 100, 240, 80, 20, {
        fontSize: 12,
        textAlign: 'center',
      }),
      createTextElement('node-1-desc', 'Prototype', 90, 260, 100, 24, {
        fontSize: 12,
        color: '#E5E7EB',
        textAlign: 'center',
      }),

      createShape('node-2', 'circle', 260, 210, 18, 18, {
        stroke: COLORS.NEON_CYAN,
      }),
      createTextElement('node-2-label', '2024 Q2', 230, 240, 80, 20, {
        fontSize: 12,
        textAlign: 'center',
      }),
      createTextElement('node-2-desc', 'Beta Release', 220, 260, 100, 24, {
        fontSize: 12,
        color: '#E5E7EB',
        textAlign: 'center',
      }),

      createShape('node-3', 'circle', 390, 210, 18, 18, {
        stroke: COLORS.NEON_CYAN,
      }),
      createTextElement('node-3-label', '2024 Q3', 360, 240, 80, 20, {
        fontSize: 12,
        textAlign: 'center',
      }),
      createTextElement('node-3-desc', 'AI Engine v2', 350, 260, 100, 24, {
        fontSize: 12,
        color: '#E5E7EB',
        textAlign: 'center',
      }),

      createShape('node-4', 'circle', 520, 210, 18, 18, {
        stroke: COLORS.NEON_CYAN,
      }),
      createTextElement('node-4-label', '2025 Q1', 490, 240, 80, 20, {
        fontSize: 12,
        textAlign: 'center',
      }),
      createTextElement('node-4-desc', 'Global Rollout', 480, 260, 100, 24, {
        fontSize: 12,
        color: '#E5E7EB',
        textAlign: 'center',
      }),

      createShape('node-5', 'circle', 650, 210, 18, 18, {
        stroke: COLORS.NEON_CYAN,
      }),
      createTextElement('node-5-label', '2025 Q3', 620, 240, 80, 20, {
        fontSize: 12,
        textAlign: 'center',
      }),
      createTextElement('node-5-desc', 'Automation Suite', 610, 260, 100, 24, {
        fontSize: 12,
        color: '#E5E7EB',
        textAlign: 'center',
      }),
    ],
  };

  // Slide 9 – Pricing / Comparison Table
  const pricingSlide: Slide = {
    id: 'tech-pricing',
    background: COLORS.DEEP_BLACK,
    createdAt,
    elements: [
      createTextElement('title', 'Pricing & Plans', 80, 60, 800, 40, {
        fontSize: 28,
        fontWeight: 'bold',
      }),
      // Neon header bar (background drawn using table header colors)
      {
        id: 'pricing-table',
        type: 'table',
        x: 80,
        y: 120,
        width: 800,
        height: 260,
        rows: 5,
        cols: 3,
        tableData: [
          ['Standard', 'Pro', 'Enterprise'],
          ['Core features', 'Core + advanced analytics', 'All features + dedicated cluster'],
          ['1M API calls / month', '10M API calls / month', 'Custom limits'],
          ['Email support', 'Priority support', '24/7 dedicated support'],
          ['Limited customization', 'Configurable workflows', 'Full customization & SSO'],
        ],
        header: true,
        headerBg: COLORS.NEON_CYAN,
        headerTextColor: COLORS.DEEP_BLACK,
        // Make table body bright on dark slide for clarity
        backgroundColor: COLORS.WHITE,
        borderWidth: 1,
        borderColor: COLORS.NEON_CYAN,
        cellPadding: 12,
        cellTextAlign: 'center',
        // Stronger alternating row color for readability
        rowAltBg: '#F1F5F9',
        color: '#111827',
      } as Element,
    ],
  };

  // Slide 10 – Thank-You / Contact + QR Placeholder
  const closingSlide: Slide = {
    id: 'tech-closing',
    background: COLORS.DEEP_BLACK,
    createdAt,
    elements: [
      createTextElement('title', 'Thank You', 80, 160, 800, 60, {
        fontSize: 40,
        fontWeight: 'bold',
        color: COLORS.NEON_CYAN,
        textAlign: 'center',
      }),
      createTextElement('subtitle', 'Stay Connected', 80, 215, 800, 30, {
        fontSize: 18,
        color: COLORS.WHITE,
        textAlign: 'center',
      }),
      // QR placeholder with glowing frame (just a rectangle outline)
      createShape('qr-frame', 'rectangle', 120, 260, 140, 140, {
        stroke: COLORS.NEON_CYAN,
        strokeWidth: 2,
      }),
      createTextElement('qr-note', 'Insert QR code here', 120, 410, 140, 24, {
        fontSize: 12,
        color: '#E5E7EB',
        textAlign: 'center',
      }),
      // Contact info
      createTextElement('contact-web', 'Website: https://example.tech', 300, 270, 500, 24, {
        fontSize: 14,
      }),
      createTextElement('contact-email', 'Email: contact@example.tech', 300, 300, 500, 24, {
        fontSize: 14,
      }),
      createTextElement('contact-support', 'Support: https://example.tech/support', 300, 330, 500, 24, {
        fontSize: 14,
      }),
      // Geometric corner accents
      createShape('corner-accent-1', 'rectangle', 840, 80, 40, 4, {
        stroke: 'transparent',
        fill: COLORS.NEON_CYAN,
      }),
      createShape('corner-accent-2', 'rectangle', 876, 84, 4, 40, {
        stroke: 'transparent',
        fill: COLORS.NEON_GREEN,
      }),
    ],
  };

  return [
    titleSlide,
    agendaSlide,
    techStackSlide,
    architectureSlide,
    performanceSlide,
    useCaseSlide,
    metricsSlide,
    timelineSlide,
    pricingSlide,
    closingSlide,
  ];
};

export default createTechnologyInnovationTemplate;
