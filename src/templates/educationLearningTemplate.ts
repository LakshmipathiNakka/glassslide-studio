import { Slide } from '@/types/slide-thumbnails';
import { Element } from '@/hooks/use-action-manager';

type ShapeType = 'rectangle' | 'rounded-rectangle' | 'circle' | 'triangle' | 'star' | 'arrow-right' | 'arrow-double' | 'diamond' | 'pentagon' | 'hexagon' | 'cloud' | 'heart' | 'lightning' | 'line' | 'text-box';

// Color palette
const COLORS = {
  BLUE: '#0066CC',
  YELLOW: '#FFC93C',
  CORAL: '#FF6B6B',
  WHITE: '#FFFFFF',
  DARK_BLUE: '#004D99',
  LIGHT_BLUE: '#E6F0FF',
  LIGHT_YELLOW: '#FFF5D6',
  LIGHT_CORAL: '#FFE6E6',
  GRAY: '#6B7280',
  LIGHT_GRAY: '#F3F4F6',
};

// Helper function to create gradient string
const createGradient = (angle: number, stops: {color: string, offset: number, opacity?: number}[]): string => {
  const stopStrings = stops.map(stop => 
    `${stop.color}${stop.opacity !== undefined ? Math.round(stop.opacity * 255).toString(16).padStart(2, '0') : ''} ${stop.offset}%`
  ).join(', ');
  return `linear-gradient(${angle}deg, ${stopStrings})`;
};

const createTextElement = (
  id: string,
  text: string,
  x: number,
  y: number,
  width: number,
  height: number,
  styles: Partial<Element> = {}
): Element => ({
  id,
  type: 'text',
  x,
  y,
  width,
  height,
  text,
  fontSize: 16,
  fontWeight: 'normal',
  fontFamily: 'Arial',
  color: COLORS.DARK_BLUE,
  zIndex: 1,
  textAlign: 'left',
  lineHeight: 1.4,
  ...styles
});

const createShape = (
  id: string,
  shapeType: ShapeType,
  x: number,
  y: number,
  width: number,
  height: number,
  styles: Partial<Element> = {}
): Element => ({
  id,
  type: 'shape',
  shapeType,
  x,
  y,
  width,
  height,
  fill: COLORS.BLUE,
  stroke: COLORS.BLUE,
  strokeWidth: 1,
  zIndex: 1,
  ...styles
});

const createDecorativeElement = (
  id: string,
  shapeType: ShapeType,
  x: number,
  y: number,
  width: number,
  height: number,
  gradient: { angle: number; stops: {color: string, offset: number, opacity?: number}[] },
  shadow: { color: string; blur: number; offsetX: number; offsetY: number } | null = null,
  border: { width: number; color: string; style: 'solid' | 'dashed' | 'dotted' } | null = null
): Element => ({
  ...createShape(id, shapeType, x, y, width, height, {
    fill: 'transparent',
    background: createGradient(gradient.angle, gradient.stops),
    boxShadow: shadow ? `${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blur}px ${shadow.color}` : 'none',
    border: border ? `${border.width}px ${border.style} ${border.color}` : 'none',
    ...(shapeType === 'rounded-rectangle' ? { rx: 12, ry: 12 } : {})
  })
});

const createPolygon = (
  id: string,
  points: Array<{x: number, y: number}>,
  styles: Partial<Element> = {}
): Element => ({
  id,
  type: 'polygon',
  points,
  fill: COLORS.BLUE,
  stroke: COLORS.BLUE,
  strokeWidth: 1,
  zIndex: 1,
  ...styles
});

const createChart = (
  id: string,
  type: 'bar' | 'line' | 'pie',
  x: number,
  y: number,
  width: number,
  height: number,
  chartData: any,
  options: any = {}
): any => ({
  id,
  type: 'chart',
  chartType: type,
  x,
  y,
  width,
  height,
  chartData: {
    ...chartData,
    datasets: chartData.datasets.map((dataset: any) => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || [COLORS.BLUE, COLORS.YELLOW, COLORS.CORAL, COLORS.LIGHT_BLUE, COLORS.LIGHT_YELLOW],
      borderColor: dataset.borderColor || COLORS.WHITE,
      borderWidth: 2,
    })),
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: 12,
            family: 'Arial'
          },
          padding: 20
        }
      },
      title: {
        display: true,
        text: options.title || '',
        font: {
          size: 18,
          weight: 'bold',
          family: 'Arial'
        },
        padding: { top: 10, bottom: 20 }
      }
    },
    ...options
  },
  zIndex: 2
});

export const createEducationLearningTemplate = (): Slide[] => {
  // Slide 1: Title Slide
  const titleSlide: Slide = {
    id: 'title',
    elements: [
      // Background shape
      createDecorativeElement(
        'title-bg',
        'rectangle',
        0,
        0,
        960,
        180,
        { angle: 90, stops: [{ color: COLORS.BLUE, offset: 0 }, { color: COLORS.DARK_BLUE, offset: 100 }] },
        { color: 'rgba(0,0,0,0.1)', blur: 10, offsetX: 0, offsetY: 5 }
      ),
      // Title
      createTextElement('title', 'Course Title', 80, 100, 800, 80, {
        text: 'Introduction to Educational Design',
        fontSize: 48,
        fontWeight: 'bold',
        color: COLORS.WHITE,
        textAlign: 'left',
        fontFamily: 'Arial, sans-serif'
      }),
      // Subtitle
      createTextElement('subtitle', 'Instructor Name', 80, 180, 800, 40, {
        text: 'Presented by: Dr. Jane Smith',
        fontSize: 24,
        color: COLORS.WHITE,
        textAlign: 'left',
        fontFamily: 'Arial, sans-serif',
        opacity: 0.9
      }),
      // Decorative elements
      createDecorativeElement(
        'decor-1',
        'circle',
        700,
        300,
        120,
        120,
        { angle: 0, stops: [{ color: COLORS.YELLOW, offset: 0, opacity: 0.3 }, { color: COLORS.YELLOW, offset: 100, opacity: 0.1 }] }
      ),
      createDecorativeElement(
        'decor-2',
        'circle',
        800,
        400,
        80,
        80,
        { angle: 0, stops: [{ color: COLORS.CORAL, offset: 0, opacity: 0.3 }, { color: COLORS.CORAL, offset: 100, opacity: 0.1 }] }
      )
    ]
  };

  // Slide 2: Learning Objectives
  const objectivesSlide: Slide = {
    id: 'objectives',
    elements: [
      // Title
      createTextElement('title', 'Learning Objectives', 80, 80, 800, 60, {
        text: 'Learning Objectives',
        fontSize: 36,
        fontWeight: 'bold',
        color: COLORS.DARK_BLUE,
        textAlign: 'left',
        fontFamily: 'Arial, sans-serif'
      }),
      // Subtitle
      createTextElement('subtitle', 'What you will learn', 80, 130, 800, 30, {
        text: 'By the end of this course, you will be able to:',
        fontSize: 18,
        color: COLORS.GRAY,
        textAlign: 'left',
        fontFamily: 'Arial, sans-serif'
      }),
      // Bullet points
      ...[
        'Understand key educational design principles',
        'Apply learning theories to course development',
        'Design effective learning experiences',
        'Evaluate and improve educational content',
        'Implement assessment strategies'
      ].map((text, i) => 
        createTextElement(`obj-${i}`, text, 120, 190 + i * 50, 700, 40, {
          text: `• ${text}`,
          fontSize: 20,
          color: COLORS.DARK_BLUE,
          textAlign: 'left',
          fontFamily: 'Arial, sans-serif',
          lineHeight: 1.5
        })
      ),
      // Decorative element
      createDecorativeElement(
        'decor-1',
        'rounded-rectangle',
        700,
        400,
        200,
        100,
        { angle: 45, stops: [{ color: COLORS.YELLOW, offset: 0, opacity: 0.1 }, { color: COLORS.CORAL, offset: 100, opacity: 0.1 }] },
        null,
        { width: 2, color: COLORS.YELLOW, style: 'dashed' }
      )
    ]
  };

  // Slide 3: Lesson Breakdown (Timeline)
  const timelineSlide: Slide = {
    id: 'timeline',
    elements: [
      // Title
      createTextElement('title', 'Lesson Breakdown', 80, 80, 800, 60, {
        text: 'Course Timeline',
        fontSize: 36,
        fontWeight: 'bold',
        color: COLORS.DARK_BLUE,
        textAlign: 'left',
        fontFamily: 'Arial, sans-serif'
      }),
      // Timeline items
      ...[
        { week: 'Week 1', topic: 'Introduction to Educational Design' },
        { week: 'Week 2', topic: 'Learning Theories & Models' },
        { week: 'Week 3', topic: 'Instructional Strategies' },
        { week: 'Week 4', topic: 'Assessment & Evaluation' },
        { week: 'Week 5', topic: 'Course Implementation' }
      ].map((item, i) => {
        const y = 160 + i * 70;
        return [
          // Circle
          createShape('timeline-dot-' + i, 'circle', 120, y - 5, 20, 20, {
            fill: COLORS.BLUE,
            stroke: 'none'
          }),
          // Line (except for last item)
          ...(i < 4 ? [
            createShape('timeline-line-' + i, 'rectangle', 129, y + 15, 2, 50, {
              fill: COLORS.BLUE,
              stroke: 'none',
              opacity: 0.3
            })
          ] : []),
          // Week
          createTextElement('week-' + i, item.week, 160, y - 15, 150, 30, {
            text: item.week,
            fontSize: 18,
            fontWeight: 'bold',
            color: COLORS.BLUE,
            textAlign: 'left',
            fontFamily: 'Arial, sans-serif'
          }),
          // Topic
          createTextElement('topic-' + i, item.topic, 160, y + 5, 600, 40, {
            text: item.topic,
            fontSize: 16,
            color: COLORS.DARK_BLUE,
            textAlign: 'left',
            fontFamily: 'Arial, sans-serif'
          })
        ];
      }).flat()
    ]
  };

  // Slide 4: Concept Diagram
  const conceptSlide: Slide = {
    id: 'concept',
    elements: [
      // Title
      createTextElement('title', 'Key Concepts', 80, 80, 800, 60, {
        text: 'Educational Design Process',
        fontSize: 36,
        fontWeight: 'bold',
        color: COLORS.DARK_BLUE,
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
        x: 80,
        width: 800
      }),
      // Central concept
      createDecorativeElement(
        'center-concept',
        'hexagon',
        400,
        200,
        160,
        160,
        { angle: 90, stops: [{ color: COLORS.BLUE, offset: 0 }, { color: COLORS.DARK_BLUE, offset: 100 }] },
        { color: 'rgba(0,0,0,0.2)', blur: 10, offsetX: 0, offsetY: 5 }
      ),
      createTextElement('center-text', 'Design', 400, 280, 160, 40, {
        text: 'Design',
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.WHITE,
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif'
      }),
      // Connected concepts
      ...[
        { x: 200, y: 200, text: 'Analyze', color: COLORS.YELLOW },
        { x: 760, y: 200, text: 'Develop', color: COLORS.CORAL },
        { x: 200, y: 360, text: 'Implement', color: COLORS.YELLOW },
        { x: 760, y: 360, text: 'Evaluate', color: COLORS.CORAL }
      ].map((item, i) => [
        // Connecting line
        createShape(
          `connector-${i}`,
          'line',
          400,
          280,
          item.x > 400 ? item.x - 400 : 400 - item.x,
          item.y > 280 ? item.y - 280 : 280 - item.y,
          {
            x1: 0,
            y1: 0,
            x2: item.x > 400 ? 1 : -1,
            y2: item.y > 280 ? 1 : -1,
            stroke: '#CCCCCC',
            strokeWidth: 2,
            strokeDasharray: '5,5',
            x: Math.min(400, item.x) + (item.x > 400 ? 0 : -Math.abs(item.x - 400)),
            y: Math.min(280, item.y) + (item.y > 280 ? 0 : -Math.abs(item.y - 280)),
            width: Math.abs(item.x - 400),
            height: Math.abs(item.y - 280)
          }
        ),
        // Concept circle
        createDecorativeElement(
          `concept-${i}`,
          'circle',
          item.x - 60,
          item.y - 60,
          120,
          120,
          { angle: 0, stops: [{ color: item.color, offset: 0 }, { color: item.color, offset: 100, opacity: 0.8 }] },
          { color: 'rgba(0,0,0,0.1)', blur: 5, offsetX: 0, offsetY: 2 }
        ),
        // Concept text
        createTextElement(`concept-text-${i}`, item.text, item.x - 50, item.y - 20, 100, 40, {
          text: item.text,
          fontSize: 18,
          fontWeight: 'bold',
          color: COLORS.DARK_BLUE,
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif'
        })
      ]).flat()
    ]
  };

  // Slide 5: Infographic Chart
  const chartSlide: Slide = {
    id: 'chart',
    elements: [
      // Title
      createTextElement('title', 'Learning Outcomes', 80, 80, 800, 60, {
        text: 'Learning Outcomes Distribution',
        fontSize: 36,
        fontWeight: 'bold',
        color: COLORS.DARK_BLUE,
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
        x: 80,
        width: 800
      }),
      // Chart
      createChart(
        'chart-1',
        'pie',
        180,
        160,
        600,
        300,
        {
          labels: ['Knowledge', 'Understanding', 'Application', 'Analysis', 'Evaluation'],
          datasets: [{
            data: [20, 25, 30, 15, 10],
            backgroundColor: [COLORS.BLUE, COLORS.YELLOW, COLORS.CORAL, COLORS.LIGHT_BLUE, COLORS.LIGHT_YELLOW],
            borderWidth: 2
          }]
        },
        {
          title: 'Learning Domains',
          plugins: {
            legend: {
              position: 'right',
              labels: {
                font: {
                  size: 14,
                  family: 'Arial'
                },
                padding: 12,
                usePointStyle: true
              }
            }
          }
        }
      )
    ]
  };

  // Slide 6: Key Points / Notes (Cards)
  const keyPointsSlide: Slide = {
    id: 'key-points',
    elements: [
      // Title
      createTextElement('title', 'Key Takeaways', 80, 80, 800, 60, {
        text: 'Key Takeaways',
        fontSize: 36,
        fontWeight: 'bold',
        color: COLORS.DARK_BLUE,
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
        x: 80,
        width: 800
      }),
      // Cards
      [
        { x: 100, color: COLORS.BLUE, title: 'Engagement', content: 'Create interactive activities to boost learner engagement and retention.' },
        { x: 380, color: COLORS.YELLOW, title: 'Assessment', content: 'Use varied assessment methods to measure different learning outcomes.' },
        { x: 660, color: COLORS.CORAL, title: 'Feedback', content: 'Provide timely and constructive feedback to support learning.' }
      ].map((card, i) => [
        // Card background
        createDecorativeElement(
          `card-bg-${i}`,
          'rounded-rectangle',
          card.x,
          180,
          240,
          240,
          { angle: 0, stops: [{ color: COLORS.WHITE, offset: 0 }, { color: COLORS.LIGHT_GRAY, offset: 100 }] },
          { color: 'rgba(0,0,0,0.1)', blur: 10, offsetX: 0, offsetY: 5 },
          { width: 1, color: '#E5E7EB', style: 'solid' }
        ),
        // Color accent
        createShape(
          `card-accent-${i}`,
          'rectangle',
          card.x,
          180,
          240,
          8,
          { fill: card.color, stroke: 'none' }
        ),
        // Card title
        createTextElement(`card-title-${i}`, card.title, card.x + 20, 210, 200, 40, {
          text: card.title,
          fontSize: 22,
          fontWeight: 'bold',
          color: COLORS.DARK_BLUE,
          textAlign: 'left',
          fontFamily: 'Arial, sans-serif'
        }),
        // Card content
        createTextElement(`card-content-${i}`, card.content, card.x + 20, 260, 200, 140, {
          text: card.content,
          fontSize: 16,
          color: COLORS.GRAY,
          textAlign: 'left',
          fontFamily: 'Arial, sans-serif',
          lineHeight: 1.6
        })
      ]).flat()
    ]
  };

  // Slide 7: Image & Quote
  const quoteSlide: Slide = {
    id: 'quote',
    elements: [
      // Background
      createShape('bg', 'rectangle', 0, 0, 960, 540, {
        fill: COLORS.LIGHT_BLUE,
        stroke: 'none',
        opacity: 0.3
      }),
      // Image placeholder
      createShape('image-placeholder', 'rectangle', 100, 120, 360, 300, {
        fill: '#E5E7EB',
        stroke: COLORS.BLUE,
        strokeWidth: 2,
        strokeDasharray: '5,5'
      }),
      createTextElement('image-text', 'Insert relevant image', 100, 280, 360, 30, {
        text: 'Insert relevant image here',
        fontSize: 16,
        color: COLORS.GRAY,
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif'
      }),
      // Quote container
      createDecorativeElement(
        'quote-container',
        'rectangle',
        520,
        150,
        380,
        240,
        { angle: 0, stops: [{ color: COLORS.WHITE, offset: 0 }, { color: COLORS.WHITE, offset: 100 }] },
        { color: 'rgba(0,0,0,0.1)', blur: 10, offsetX: 0, offsetY: 5 },
        { width: 1, color: '#E5E7EB', style: 'solid' }
      ),
      // Quote mark
      createTextElement('quote-mark', '"', 540, 170, 40, 40, {
        text: '"',
        fontSize: 72,
        color: COLORS.BLUE,
        opacity: 0.3,
        fontFamily: 'Arial, sans-serif',
        lineHeight: 0.8
      }),
      // Quote text
      createTextElement('quote-text', 'Quote goes here', 520, 180, 360, 150, {
        text: 'Education is the most powerful weapon which you can use to change the world.',
        fontSize: 20,
        color: COLORS.DARK_BLUE,
        fontStyle: 'italic',
        textAlign: 'left',
        fontFamily: 'Arial, sans-serif',
        lineHeight: 1.6,
        padding: '0 20px'
      }),
      // Quote author
      createTextElement('quote-author', '— Nelson Mandela', 540, 320, 340, 40, {
        text: '— Nelson Mandela',
        fontSize: 18,
        color: COLORS.GRAY,
        textAlign: 'right',
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold'
      })
    ]
  };

  // Slide 8: Comparison Table
  const comparisonSlide: Slide = {
    id: 'comparison',
    elements: [
      // Title
      createTextElement('title', 'Learning Approaches', 80, 80, 800, 60, {
        text: 'Traditional vs. Modern Learning',
        fontSize: 36,
        fontWeight: 'bold',
        color: COLORS.DARK_BLUE,
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
        x: 80,
        width: 800
      }),
      // Table
      createShape('table', 'rectangle', 80, 160, 800, 300, {
        fill: COLORS.WHITE,
        stroke: '#E5E7EB',
        strokeWidth: 1,
        zIndex: 2
      }),
      // Table header
      createShape('table-header-1', 'rectangle', 80, 160, 400, 60, {
        fill: COLORS.BLUE,
        stroke: '#E5E7EB',
        strokeWidth: 1,
        zIndex: 3
      }),
      createShape('table-header-2', 'rectangle', 480, 160, 400, 60, {
        fill: COLORS.YELLOW,
        stroke: '#E5E7EB',
        strokeWidth: 1,
        zIndex: 3
      }),
      // Header text
      createTextElement('header-1', 'Traditional', 80, 180, 400, 30, {
        text: 'Traditional Learning',
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.WHITE,
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
        zIndex: 4
      }),
      createTextElement('header-2', 'Modern', 480, 180, 400, 30, {
        text: 'Modern Learning',
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.DARK_BLUE,
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
        zIndex: 4
      }),
      // Table rows
      ...[
        { traditional: 'Instructor-centered', modern: 'Learner-centered' },
        { traditional: 'Passive learning', modern: 'Active participation' },
        { traditional: 'Fixed curriculum', modern: 'Flexible learning paths' },
        { traditional: 'One-size-fits-all', modern: 'Personalized learning' },
        { traditional: 'Memorization', modern: 'Critical thinking' }
      ].map((row, i) => {
        const y = 220 + i * 40;
        return [
          // Row background (zebra striping)
          i % 2 === 0 && createShape(`row-bg-${i}`, 'rectangle', 80, y - 20, 800, 40, {
            fill: i % 2 === 0 ? COLORS.LIGHT_GRAY : COLORS.WHITE,
            stroke: 'none',
            opacity: 0.5,
            zIndex: 2
          }),
          // Left cell
          createTextElement(`cell-${i}-1`, row.traditional, 100, y, 360, 30, {
            text: row.traditional,
            fontSize: 16,
            color: COLORS.DARK_BLUE,
            textAlign: 'left',
            fontFamily: 'Arial, sans-serif',
            zIndex: 3
          }),
          // Right cell
          createTextElement(`cell-${i}-2`, row.modern, 500, y, 360, 30, {
            text: row.modern,
            fontSize: 16,
            color: COLORS.DARK_BLUE,
            textAlign: 'left',
            fontFamily: 'Arial, sans-serif',
            zIndex: 3,
            fontWeight: 'bold'
          })
        ].filter(Boolean); // Remove any null/undefined from conditional rendering
      }).flat()
    ]
  };

  // Slide 9: Quiz / Summary
  const quizSlide: Slide = {
    id: 'quiz',
    elements: [
      // Background
      createShape('bg', 'rectangle', 0, 0, 960, 540, {
        fill: COLORS.DARK_BLUE,
        stroke: 'none'
      }),
      // Decorative elements
      createDecorativeElement(
        'decor-1',
        'circle',
        -100,
        -100,
        300,
        300,
        { angle: 0, stops: [{ color: COLORS.BLUE, offset: 0, opacity: 0.3 }, { color: COLORS.BLUE, offset: 100, opacity: 0.1 }] }
      ),
      createDecorativeElement(
        'decor-2',
        'circle',
        800,
        400,
        300,
        300,
        { angle: 0, stops: [{ color: COLORS.YELLOW, offset: 0, opacity: 0.2 }, { color: COLORS.YELLOW, offset: 100, opacity: 0.05 }] }
      ),
      // Container
      createDecorativeElement(
        'container',
        'rounded-rectangle',
        80,
        80,
        800,
        380,
        { angle: 0, stops: [{ color: 'rgba(255,255,255,0.95)', offset: 0 }, { color: 'rgba(255,255,255,0.98)', offset: 100 }] },
        { color: 'rgba(0,0,0,0.15)', blur: 20, offsetX: 0, offsetY: 5 },
        { width: 0, color: 'transparent', style: 'solid' }
      ),
      // Title
      createTextElement('title', 'Quick Quiz', 80, 120, 800, 60, {
        text: 'Quick Quiz',
        fontSize: 42,
        fontWeight: 'bold',
        color: COLORS.DARK_BLUE,
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif'
      }),
      // Question
      createTextElement('question', 'Question goes here', 120, 200, 720, 40, {
        text: 'What is the most important factor in educational design?',
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.DARK_BLUE,
        textAlign: 'left',
        fontFamily: 'Arial, sans-serif'
      }),
      // Options
      ...[
        { text: 'A. Content Delivery', correct: false },
        { text: 'B. Learner Engagement', correct: true },
        { text: 'C. Assessment Methods', correct: false },
        { text: 'D. Technology Use', correct: false }
      ].map((option, i) => {
        const y = 260 + i * 50;
        return createDecorativeElement(
          `option-${i}`,
          'rounded-rectangle',
          140,
          y,
          640,
          40,
          { angle: 0, stops: [{ color: COLORS.WHITE, offset: 0 }, { color: COLORS.LIGHT_GRAY, offset: 100 }] },
          { color: 'rgba(0,0,0,0.1)', blur: 5, offsetX: 0, offsetY: 2 },
          { width: 1, color: '#E5E7EB', style: 'solid' }
        );
      }),
      // Option text
      ...[
        'A. Content Delivery',
        'B. Learner Engagement',
        'C. Assessment Methods',
        'D. Technology Use'
      ].map((text, i) => {
        const y = 260 + i * 50;
        return createTextElement(`option-text-${i}`, text, 160, y + 10, 600, 30, {
          text,
          fontSize: 16,
          color: COLORS.DARK_BLUE,
          textAlign: 'left',
          fontFamily: 'Arial, sans-serif'
        });
      })
    ]
  };

  // Slide 10: Closing Recap
  const closingSlide: Slide = {
    id: 'closing',
    elements: [
      // Background
      createShape('bg', 'rectangle', 0, 0, 960, 540, {
        fill: COLORS.DARK_BLUE,
        stroke: 'none'
      }),
      // Decorative elements
      createDecorativeElement(
        'decor-1',
        'circle',
        -50,
        -50,
        200,
        200,
        { angle: 0, stops: [{ color: COLORS.YELLOW, offset: 0, opacity: 0.3 }, { color: COLORS.YELLOW, offset: 100, opacity: 0.1 }] }
      ),
      createDecorativeElement(
        'decor-2',
        'circle',
        850,
        400,
        200,
        200,
        { angle: 0, stops: [{ color: COLORS.CORAL, offset: 0, opacity: 0.3 }, { color: COLORS.CORAL, offset: 100, opacity: 0.1 }] }
      ),
      // Title
      createTextElement('title', 'Thank You!', 80, 120, 800, 60, {
        text: 'Thank You!',
        fontSize: 64,
        fontWeight: 'bold',
        color: COLORS.WHITE,
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
        textShadow: '0 2px 10px rgba(0,0,0,0.2)'
      }),
      // Subtitle
      createTextElement('subtitle', 'Let\'s Recap', 80, 200, 800, 40, {
        text: 'Key Takeaways',
        fontSize: 28,
        color: COLORS.YELLOW,
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
        opacity: 0.9
      }),
      // Bullet points
      ...[
        'Educational design is a systematic process',
        'Focus on learner engagement and outcomes',
        'Use varied instructional strategies',
        'Incorporate assessment and feedback',
        'Continuously evaluate and improve'
      ].map((text, i) => 
        createTextElement(`point-${i}`, text, 200, 280 + i * 40, 600, 30, {
          text: `• ${text}`,
          fontSize: 20,
          color: COLORS.WHITE,
          textAlign: 'left',
          fontFamily: 'Arial, sans-serif',
          lineHeight: 1.5,
          opacity: 0.9
        })
      ),
      // Contact info
      createTextElement('contact', 'Contact: instructor@example.com', 80, 500, 800, 30, {
        text: 'Contact: instructor@example.com | Website: www.example.com',
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif'
      })
    ]
  };

  // Return all slides in order
  return [
    titleSlide,
    objectivesSlide,
    timelineSlide,
    conceptSlide,
    chartSlide,
    keyPointsSlide,
    quoteSlide,
    comparisonSlide,
    quizSlide,
    closingSlide
  ];
};

export default createEducationLearningTemplate;
