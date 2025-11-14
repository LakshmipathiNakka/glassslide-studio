import { Slide } from '@/types/slide-thumbnails';
import { Element } from '@/hooks/use-action-manager';

type RGBColor = `#${string}`;

interface GradientStop {
  offset: number;
  color: RGBColor;
  opacity?: number;
}

interface Gradient {
  type: 'linear' | 'radial';
  rotation?: number;
  stops: GradientStop[];
}

const createGradient = (gradient: Gradient): string => {
  if (gradient.type === 'linear') {
    const rotation = gradient.rotation || 0;
    const stops = gradient.stops.map(stop => 
      `${stop.color}${stop.opacity !== undefined ? Math.round(stop.opacity * 255).toString(16).padStart(2, '0') : ''} ${stop.offset * 100}%`
    ).join(', ');
    return `linear-gradient(${rotation}deg, ${stops})`;
  }
  // Radial gradient implementation
  return '';
}

const createTextElement = (
  text: string,
  x: number,
  y: number,
  width: number,
  height: number,
  styles: Partial<Element> = {}
): Element => ({
  id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  type: 'text',
  x,
  y,
  width,
  height,
  text,
  fontSize: 16,
  fontWeight: 'normal',
  fontStyle: 'normal',
  textAlign: 'left',
  color: '#000000',
  zIndex: 1,
  ...styles,
});

const createShape = (
  type: 'rectangle' | 'circle' | 'triangle',
  x: number,
  y: number,
  width: number,
  height: number,
  styles: Partial<Element> = {}
): Element => {
  const baseShape: Element = {
    id: `shape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'shape',
    shapeType: type,
    x,
    y,
    width,
    height,
    fill: '#FFFFFF',
    stroke: '#000000',
    strokeWidth: 1,
    opacity: 1,
    zIndex: 1,
    ...styles,
  };
  
  return baseShape;
};

const createChart = (
  type: 'bar' | 'line' | 'pie',
  x: number,
  y: number,
  width: number,
  height: number,
  data: any,
  options: any = {}
): Element => ({
  id: `chart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  type: 'chart',
  chartType: type,
  x,
  y,
  width,
  height,
  data,
  options: {
    responsive: true,
    maintainAspectRatio: false,
    ...options,
  },
  zIndex: 1,
});

const createBusinessStrategyTemplate = (): Slide[] => {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  // Common styles
  const titleStyle = {
    fontSize: 36,
    fontWeight: 'bold' as const,
    color: '#1e3a8a',
    textAlign: 'center' as const,
  };
  
  const subtitleStyle = {
    fontSize: 24,
    color: '#4b5563',
    textAlign: 'center' as const,
  };
  
  const sectionTitleStyle = {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: '#1e3a8a',
  };
  
  const bodyTextStyle = {
    fontSize: 16,
    lineHeight: 1.5,
    color: '#1f2937',
  };
  
  // Slide 1: Title Slide
  const titleSlide: Slide = {
    id: 'title-slide',
    elements: [
      // Background gradient
      createShape('rectangle', 0, 0, 960, 540, {
        fill: createGradient({
          type: 'linear',
          rotation: 135,
          stops: [
            { offset: 0, color: '#1e3a8a' },
            { offset: 1, color: '#1e40af' },
          ],
        }),
        zIndex: 0,
      }),
      
      // Title
      createTextElement('Business Strategy', 80, 180, 800, 80, {
        ...titleStyle,
        color: '#ffffff',
        fontSize: 60,
      }),
      
      // Subtitle
      createTextElement(`Q${Math.floor((now.getMonth() + 3) / 3)} ${currentYear} Update`, 80, 280, 800, 60, {
        ...subtitleStyle,
        color: '#d1d5db',
        fontSize: 28,
      }),
      
      // Decorative elements
      createShape('rectangle', 80, 360, 120, 4, {
        fill: '#facc15',
        stroke: 'none',
      }),
    ],
  };
  
  // Slide 2: Agenda
  const agendaSlide: Slide = {
    id: 'agenda',
    elements: [
      // Title
      createTextElement('Agenda', 80, 80, 800, 60, {
        ...sectionTitleStyle,
      }),
      
      // Agenda items
      createTextElement('1. Executive Summary', 120, 180, 700, 40, {
        ...bodyTextStyle,
        fontSize: 22,
        fontWeight: 'bold',
      }),
      
      createTextElement('2. Market Analysis', 120, 240, 700, 40, {
        ...bodyTextStyle,
        fontSize: 22,
        fontWeight: 'bold',
      }),
      
      createTextElement('3. Competitive Landscape', 120, 300, 700, 40, {
        ...bodyTextStyle,
        fontSize: 22,
        fontWeight: 'bold',
      }),
      
      createTextElement('4. Strategic Initiatives', 120, 360, 700, 40, {
        ...bodyTextStyle,
        fontSize: 22,
        fontWeight: 'bold',
      }),
      
      createTextElement('5. Financial Roadmap', 120, 420, 700, 40, {
        ...bodyTextStyle,
        fontSize: 22,
        fontWeight: 'bold',
      }),
    ],
  };
  
  // Continue with more slides...
  // [Remaining slides would be implemented similarly]
  
  return [
    titleSlide,
    agendaSlide,
    // Add more slides here
  ];
};

export default createBusinessStrategyTemplate;
