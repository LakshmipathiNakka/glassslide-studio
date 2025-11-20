import { Slide } from '@/types/slide-thumbnails';
import { Element } from '@/hooks/use-action-manager';

// Palette for light, futuristic Technology & Innovation template
const COLORS = {
  BG: '#F8F9FA',
  WHITE: '#FFFFFF',
  NEON_CYAN: '#00E5FF',
  ELECTRIC_BLUE: '#2979FF',
  VIVID_PURPLE: '#8E2DE2',
  SIGNAL_GREEN: '#39FF14',
  ACCENT_ORANGE: '#FF9500',
  BLACK: '#000000',
  SOFT_GRAY: '#E0E3E7',
  TEXT_MUTED: '#6B7280',
};

type ShapeType =
  | 'rectangle'
  | 'rounded-rectangle'
  | 'circle'
  | 'triangle'
  | 'diamond'
  | 'line';

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
  fontFamily: 'SF Pro Display, -apple-system, system-ui, sans-serif',
  fontWeight: 'normal',
  color: COLORS.BLACK,
  textAlign: 'left',
  lineHeight: 1.4,
  zIndex: 2,
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
  stroke: 'rgba(0,0,0,0.08)',
  strokeWidth: 1,
  opacity: 1,
  zIndex: 1,
  ...styles,
});

const createImageElement = (
  id: string,
  imageUrl: string,
  x: number,
  y: number,
  width: number,
  height: number,
  styles: Partial<Element> = {},
): Element => ({
  id,
  type: 'image',
  x,
  y,
  width,
  height,
  imageUrl,
  // src alias so all renderers & thumbnail generators can resolve the image
  ...( { src: imageUrl } as any ),
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
  zIndex: 2,
});

const createTechnologyInnovationLightTemplate = (): Slide[] => {
  const createdAt = new Date();

  // Real tech imagery (Unsplash – can be swapped by user)
  const HERO_IMG =
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80'; // circuits / AI
  const DEVICES_IMG =
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1600&q=80'; // phone / laptop
  const CODE_IMG =
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80'; // code / hardware
  const CLOUD_IMG =
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80'; // server / cloud
  const DASHBOARD_IMG =
    'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1600&q=80'; // UI dashboard
  const ROBOTICS_IMG =
    'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1600&q=80'; // robotics

  // 1. Futuristic Title
  const titleSlide: Slide = {
    id: 'tech-light-title',
    background: COLORS.BG,
    createdAt,
    elements: [
      createImageElement('hero-bg', HERO_IMG, 0, 0, 960, 540, {
        opacity: 0.75,
      }),
      // White overlay for clarity
      createShape('hero-overlay', 'rectangle', 0, 0, 960, 540, {
        fill: 'rgba(255,255,255,0.7)',
        stroke: 'transparent',
        zIndex: 1,
      }),
      // Accent geometric line on left
      createShape('accent-line', 'rectangle', 80, 120, 4, 260, {
        fill: COLORS.ELECTRIC_BLUE,
        stroke: 'transparent',
        zIndex: 2,
      }),
      // Title
      createTextElement('title-text', 'Technology & Innovation', 120, 180, 760, 60, {
        fontSize: 40,
        fontWeight: '600',
        color: COLORS.ELECTRIC_BLUE,
      }),
      // Subtitle
      createTextElement(
        'subtitle-text',
        'Modern, cloud-native, AI-driven product briefing.',
        120,
        235,
        720,
        30,
        {
          fontSize: 18,
          color: COLORS.BLACK,
        },
      ),
      // Meta
      createTextElement(
        'meta-text',
        'Company Name  •  Presenter  •  Date',
        120,
        270,
        720,
        26,
        {
          fontSize: 14,
          color: COLORS.TEXT_MUTED,
        },
      ),
    ],
  };

  // 2. Agenda
  const agendaSlide: Slide = {
    id: 'tech-light-agenda',
    background: COLORS.BG,
    createdAt,
    elements: [
      // Side accent band
      createShape('agenda-band', 'rectangle', 80, 60, 6, 360, {
        fill: COLORS.NEON_CYAN,
        stroke: 'transparent',
      }),
      // Card container
      createShape('agenda-card', 'rounded-rectangle', 110, 80, 770, 360, {
        fill: COLORS.WHITE,
        stroke: 'rgba(0,0,0,0.04)',
        strokeWidth: 1,
        shadow: {
          color: 'rgba(15,23,42,0.12)',
          blur: 28,
          offsetX: 0,
          offsetY: 18,
        },
      }),
      createTextElement('agenda-title', 'Agenda', 140, 105, 720, 34, {
        fontSize: 28,
        fontWeight: '600',
      }),
      // Agenda items as light cards
      ...[
        'Introduction & vision',
        'Market & opportunity',
        'Architecture & tech stack',
        'Key metrics & performance',
        'Roadmap & next steps',
      ].map((label, index) => {
        const y = 150 + index * 55;
        return createTextElement(`agenda-item-${index}`, `${index + 1}. ${label}`, 160, y, 700, 30, {
          fontSize: 18,
          color: COLORS.TEXT_MUTED,
        });
      }),
    ],
  };

  // 3. Tech Stack Overview (Icons)
  const stackSlide: Slide = {
    id: 'tech-light-stack',
    background: COLORS.BG,
    createdAt,
    elements: [
      createTextElement('stack-title', 'Tech Stack Overview', 80, 60, 800, 40, {
        fontSize: 28,
        fontWeight: '600',
      }),
      createTextElement(
        'stack-subtitle',
        'Core technologies powering the platform.',
        80,
        100,
        800,
        28,
        {
          fontSize: 16,
          color: COLORS.TEXT_MUTED,
        },
      ),
      // 3x2 grid of cards
      ...[
        { id: 'frontend', label: 'Frontend', accent: COLORS.ELECTRIC_BLUE },
        { id: 'backend', label: 'Backend', accent: COLORS.VIVID_PURPLE },
        { id: 'cloud', label: 'Cloud', accent: COLORS.NEON_CYAN },
        { id: 'database', label: 'Database', accent: COLORS.ACCENT_ORANGE },
        { id: 'ai', label: 'AI / ML', accent: COLORS.SIGNAL_GREEN },
        { id: 'devops', label: 'DevOps', accent: COLORS.ELECTRIC_BLUE },
      ].flatMap((item, index) => {
        const col = index % 3;
        const row = Math.floor(index / 3);
        const baseX = 80 + col * 290;
        const baseY = 150 + row * 150;
        return [
          createShape(`stack-card-${item.id}`, 'rounded-rectangle', baseX, baseY, 260, 120, {
            fill: COLORS.WHITE,
            stroke: 'rgba(0,0,0,0.04)',
            strokeWidth: 1,
            shadow: {
              color: 'rgba(15,23,42,0.08)',
              blur: 20,
              offsetX: 0,
              offsetY: 10,
            },
          }),
          createShape(`stack-pill-${item.id}`, 'rounded-rectangle', baseX + 20, baseY + 24, 40, 8, {
            fill: item.accent,
            stroke: 'transparent',
          }),
          createTextElement(`stack-label-${item.id}`, item.label, baseX + 20, baseY + 40, 220, 24, {
            fontSize: 16,
            fontWeight: '600',
          }),
          createTextElement(
            `stack-desc-${item.id}`,
            'Replace with specific frameworks, tools, and services.',
            baseX + 20,
            baseY + 68,
            220,
            40,
            {
              fontSize: 13,
              color: COLORS.TEXT_MUTED,
            },
          ),
        ] as Element[];
      }),
    ],
  };

  // 4. Product Architecture (Diagram)
  const architectureSlide: Slide = {
    id: 'tech-light-architecture',
    background: COLORS.BG,
    createdAt,
    elements: [
      createTextElement('arch-title', 'Product Architecture', 80, 60, 800, 40, {
        fontSize: 28,
        fontWeight: '600',
      }),
      createTextElement(
        'arch-subtitle',
        'High-level data flow across client, APIs, services, data, and AI.',
        80,
        100,
        800,
        28,
        {
          fontSize: 16,
          color: COLORS.TEXT_MUTED,
        },
      ),
      // Blocks
      ...[
        { id: 'client', label: 'Client', x: 80, color: COLORS.NEON_CYAN },
        { id: 'api', label: 'API Gateway', x: 220, color: COLORS.ELECTRIC_BLUE },
        { id: 'services', label: 'Microservices', x: 400, color: COLORS.VIVID_PURPLE },
        { id: 'db', label: 'Database', x: 620, color: COLORS.ACCENT_ORANGE },
        { id: 'ai', label: 'AI Engine', x: 780, color: COLORS.SIGNAL_GREEN },
      ].flatMap((block) => [
        createShape(`arch-${block.id}`, 'rounded-rectangle', block.x, 220, 120, 60, {
          fill: COLORS.WHITE,
          stroke: block.color,
          strokeWidth: 1.5,
          shadow: {
            color: 'rgba(15,23,42,0.1)',
            blur: 18,
            offsetX: 0,
            offsetY: 10,
          },
        }),
        createTextElement(`arch-label-${block.id}`, block.label, block.x, 238, 120, 26, {
          fontSize: 14,
          fontWeight: '600',
          textAlign: 'center',
        }),
      ] as Element[]),
      // Connectors as thin glowing rectangles
      ...[0, 1, 2, 3].map((i) => {
        const fromX = 80 + i * 140 + 120;
        return createShape(`arch-connector-${i}`, 'rectangle', fromX, 248, 20, 4, {
          fill: i % 2 === 0 ? COLORS.ELECTRIC_BLUE : COLORS.NEON_CYAN,
          stroke: 'transparent',
        });
      }),
    ],
  };

  // 5. Performance Graphs (Charts)
  const performanceSlide: Slide = {
    id: 'tech-light-performance',
    background: COLORS.BG,
    createdAt,
    elements: [
      createTextElement('perf-title', 'Performance Metrics', 80, 60, 800, 40, {
        fontSize: 28,
        fontWeight: '600',
      }),
      // Left: Line chart card
      createShape('latency-card', 'rounded-rectangle', 80, 120, 400, 320, {
        fill: COLORS.WHITE,
        stroke: 'rgba(0,0,0,0.04)',
        shadow: {
          color: 'rgba(15,23,42,0.08)',
          blur: 24,
          offsetX: 0,
          offsetY: 14,
        },
      }),
      createTextElement('latency-title', 'Latency vs Load', 100, 140, 360, 24, {
        fontSize: 16,
        fontWeight: '600',
      }),
      createChart(
        'latency-chart',
        'line',
        100,
        170,
        360,
        250,
        {
          labels: ['1K', '5K', '10K', '25K', '50K', '100K'],
          datasets: [
            {
              label: 'P95 Latency (ms)',
              data: [120, 135, 155, 180, 205, 240],
              borderColor: COLORS.ELECTRIC_BLUE,
              backgroundColor: 'rgba(41,121,255,0.18)',
            },
            {
              label: 'P50 Latency (ms)',
              data: [80, 92, 105, 120, 135, 160],
              borderColor: COLORS.VIVID_PURPLE,
              backgroundColor: 'rgba(142,45,226,0.15)',
            },
          ],
        },
      ),
      // Right: Bar chart card
      createShape('throughput-card', 'rounded-rectangle', 480, 120, 400, 320, {
        fill: COLORS.WHITE,
        stroke: 'rgba(0,0,0,0.04)',
        shadow: {
          color: 'rgba(15,23,42,0.08)',
          blur: 24,
          offsetX: 0,
          offsetY: 14,
        },
      }),
      createTextElement('throughput-title', 'API Throughput', 500, 140, 360, 24, {
        fontSize: 16,
        fontWeight: '600',
      }),
      createChart(
        'throughput-chart',
        'bar',
        500,
        170,
        360,
        250,
        {
          labels: ['v1', 'v2', 'v3'],
          datasets: [
            {
              label: 'Requests/sec',
              data: [1200, 2100, 2800],
              backgroundColor: [
                COLORS.NEON_CYAN,
                COLORS.ELECTRIC_BLUE,
                COLORS.SIGNAL_GREEN,
              ],
            },
          ],
        },
      ),
    ],
  };

  // 6. Use-Case Gallery (Images)
  const gallerySlide: Slide = {
    id: 'tech-light-gallery',
    background: COLORS.BG,
    createdAt,
    elements: [
      createTextElement('gallery-title', 'Use-Case Gallery', 80, 60, 800, 40, {
        fontSize: 28,
        fontWeight: '600',
      }),
      // 3x2 grid
      ...[
        { id: 'robotics', img: ROBOTICS_IMG, label: 'Robotics & Automation' },
        { id: 'ai-vision', img: HERO_IMG, label: 'Computer Vision & AI' },
        { id: 'dashboards', img: DASHBOARD_IMG, label: 'Analytics Dashboards' },
        { id: 'devices', img: DEVICES_IMG, label: 'Multi-device Experiences' },
        { id: 'cloud', img: CLOUD_IMG, label: 'Cloud Infrastructure' },
        { id: 'code', img: CODE_IMG, label: 'Developer Experience' },
      ].flatMap((item, index) => {
        const col = index % 3;
        const row = Math.floor(index / 3);
        const baseX = 80 + col * 290;
        const baseY = 130 + row * 180;
        return [
          createImageElement(
            `gallery-img-${item.id}`,
            item.img,
            baseX,
            baseY,
            260,
            140,
            {
              borderRadius: 18,
              opacity: 0.96,
              shadow: {
                color: 'rgba(15,23,42,0.18)',
                blur: 20,
                offsetX: 0,
                offsetY: 12,
              },
            },
          ),
          createShape(`gallery-bar-${item.id}`, 'rectangle', baseX, baseY + 140, 260, 4, {
            fill: COLORS.ELECTRIC_BLUE,
            stroke: 'transparent',
          }),
          createTextElement(`gallery-label-${item.id}`, item.label, baseX, baseY + 152, 260, 24, {
            fontSize: 13,
            color: COLORS.TEXT_MUTED,
          }),
        ] as Element[];
      }),
    ],
  };

  // 7. Metrics Dashboard
  const metricsSlide: Slide = {
    id: 'tech-light-metrics',
    background: COLORS.BG,
    createdAt,
    elements: [
      createTextElement('metrics-title', 'Metrics Dashboard', 80, 60, 800, 40, {
        fontSize: 28,
        fontWeight: '600',
      }),
      // 3x2 cards
      ...[
        { id: 'uptime', label: 'Uptime', value: '99.98%', accent: COLORS.SIGNAL_GREEN },
        { id: 'users', label: 'Active Users', value: '1.2M+', accent: COLORS.ELECTRIC_BLUE },
        { id: 'latency', label: 'Avg Latency', value: '85 ms', accent: COLORS.NEON_CYAN },
        { id: 'data', label: 'Data Processed', value: '4.1 TB / day', accent: COLORS.VIVID_PURPLE },
        { id: 'accuracy', label: 'AI Accuracy', value: '94.3%', accent: COLORS.SIGNAL_GREEN },
        { id: 'nps', label: 'Customer Satisfaction', value: '4.8 / 5', accent: COLORS.ACCENT_ORANGE },
      ].flatMap((metric, index) => {
        const col = index % 3;
        const row = Math.floor(index / 3);
        const baseX = 80 + col * 290;
        const baseY = 130 + row * 160;
        return [
          createShape(`metric-card-${metric.id}`, 'rounded-rectangle', baseX, baseY, 260, 130, {
            fill: COLORS.WHITE,
            stroke: 'rgba(0,0,0,0.04)',
            shadow: {
              color: 'rgba(15,23,42,0.10)',
              blur: 22,
              offsetX: 0,
              offsetY: 12,
            },
          }),
          createShape(`metric-dot-${metric.id}`, 'circle', baseX + 20, baseY + 24, 12, 12, {
            fill: metric.accent,
            stroke: 'transparent',
          }),
          createTextElement(`metric-label-${metric.id}`, metric.label, baseX + 40, baseY + 20, 200, 24, {
            fontSize: 13,
            color: COLORS.TEXT_MUTED,
          }),
          createTextElement(`metric-value-${metric.id}`, metric.value, baseX + 20, baseY + 54, 220, 34, {
            fontSize: 22,
            fontWeight: '600',
          }),
        ] as Element[];
      }),
    ],
  };

  // 8. Innovations Timeline
  const timelineSlide: Slide = {
    id: 'tech-light-timeline',
    background: COLORS.BG,
    createdAt,
    elements: [
      createTextElement('timeline-title', 'Innovation Timeline', 80, 60, 800, 40, {
        fontSize: 28,
        fontWeight: '600',
      }),
      // Base line
      createShape('timeline-line', 'rectangle', 120, 260, 720, 3, {
        fill: COLORS.SOFT_GRAY,
        stroke: 'transparent',
      }),
      ...[
        { year: '2022', label: 'Prototype', color: COLORS.ELECTRIC_BLUE },
        { year: '2023', label: 'Cloud Integration', color: COLORS.NEON_CYAN },
        { year: '2024', label: 'AI Engine Launch', color: COLORS.VIVID_PURPLE },
        { year: '2025', label: 'Global Scale', color: COLORS.SIGNAL_GREEN },
      ].flatMap((item, index) => {
        const step = 720 / 3;
        const cx = 120 + index * step;
        return [
          createShape(`timeline-node-${index}`, 'circle', cx - 10, 250, 20, 20, {
            fill: COLORS.WHITE,
            stroke: item.color,
            strokeWidth: 2,
          }),
          createTextElement(`timeline-year-${index}`, item.year, cx - 40, 280, 80, 22, {
            fontSize: 12,
            fontWeight: '600',
            textAlign: 'center',
          }),
          createTextElement(`timeline-label-${index}`, item.label, cx - 60, 300, 120, 34, {
            fontSize: 12,
            color: COLORS.TEXT_MUTED,
            textAlign: 'center',
          }),
        ] as Element[];
      }),
    ],
  };

  // 9. Pricing / Comparison Table
  const pricingSlide: Slide = {
    id: 'tech-light-pricing',
    background: COLORS.BG,
    createdAt,
    elements: [
      createTextElement('pricing-title', 'Pricing & Plans', 80, 60, 800, 40, {
        fontSize: 28,
        fontWeight: '600',
      }),
      // Highlight band behind Pro column (visual only)
      createShape('pro-highlight', 'rounded-rectangle', 80 + 800 / 3, 110, 800 / 3, 300, {
        fill: 'rgba(41,121,255,0.08)',
        stroke: 'transparent',
      }),
      {
        id: 'pricing-table',
        type: 'table',
        x: 80,
        y: 120,
        width: 800,
        height: 300,
        rows: 6,
        cols: 3,
        tableData: [
          ['Basic', 'Pro', 'Enterprise'],
          ['Core APIs', 'Core + advanced features', 'All features + custom SLAs'],
          ['100K calls / month', '5M calls / month', 'Custom limits'],
          ['Email support', 'Priority support', '24/7 dedicated support'],
          ['Limited customization', 'Configurable workflows', 'Full customization & SSO'],
          ['Standard analytics', 'Enhanced analytics', 'Custom BI integration'],
        ],
        header: true,
        headerBg: COLORS.ELECTRIC_BLUE,
        headerTextColor: COLORS.WHITE,
        backgroundColor: COLORS.WHITE,
        borderWidth: 1,
        borderColor: 'rgba(148,163,184,0.5)',
        cellPadding: 10,
        cellTextAlign: 'center',
        rowAltBg: '#F3F4F6',
        color: COLORS.BLACK,
      } as Element,
    ],
  };

  // 10. Thank-You / Contact + QR
  const thankSlide: Slide = {
    id: 'tech-light-thankyou',
    background: COLORS.BG,
    createdAt,
    elements: [
      // Light tech background image
      createImageElement('thanks-bg', CLOUD_IMG, 0, 0, 960, 540, {
        opacity: 0.18,
      }),
      // Center card
      createShape('thanks-card', 'rounded-rectangle', 160, 140, 640, 220, {
        fill: COLORS.WHITE,
        stroke: 'rgba(0,0,0,0.04)',
        shadow: {
          color: 'rgba(15,23,42,0.12)',
          blur: 24,
          offsetX: 0,
          offsetY: 14,
        },
      }),
      createTextElement('thanks-title', 'Thank You', 180, 170, 600, 50, {
        fontSize: 36,
        fontWeight: '600',
        textAlign: 'center',
        color: COLORS.ELECTRIC_BLUE,
      }),
      createTextElement('thanks-subtitle', 'Questions, demos, or follow-ups?', 180, 220, 600, 28, {
        fontSize: 18,
        color: COLORS.TEXT_MUTED,
        textAlign: 'center',
      }),
      createTextElement(
        'thanks-contact',
        'contact@company.com  •  company.com  •  +1 (000) 000-0000',
        180,
        252,
        600,
        26,
        {
          fontSize: 14,
          color: COLORS.BLACK,
          textAlign: 'center',
        },
      ),
      // QR code placeholder
      createShape('thanks-qr', 'rounded-rectangle', 780, 340, 120, 120, {
        fill: 'rgba(248,249,250,1)',
        stroke: COLORS.NEON_CYAN,
        strokeWidth: 2,
      }),
      createTextElement('thanks-qr-note', 'Insert QR code', 780, 468, 120, 20, {
        fontSize: 11,
        color: COLORS.TEXT_MUTED,
        textAlign: 'center',
      }),
    ],
  };

  return [
    titleSlide,
    agendaSlide,
    stackSlide,
    architectureSlide,
    performanceSlide,
    gallerySlide,
    metricsSlide,
    timelineSlide,
    pricingSlide,
    thankSlide,
  ];
};

export default createTechnologyInnovationLightTemplate;
