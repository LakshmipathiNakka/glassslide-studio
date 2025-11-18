import { Slide } from '@/types/slide-thumbnails';
import { Element } from '@/hooks/use-action-manager';

type ShapeType = 'rectangle' | 'rounded-rectangle' | 'circle' | 'triangle' | 'star' | 'arrow-right' | 'arrow-double' | 'diamond' | 'pentagon' | 'hexagon' | 'cloud' | 'heart' | 'lightning' | 'line' | 'text-box';

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
  color: '#000000',
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
  x,
  y,
  width,
  height,
  shapeType,
  fill: '#ffffff',
  stroke: 'transparent',
  strokeWidth: 0,
  borderRadius: shapeType === 'rounded-rectangle' ? 8 : undefined,
  opacity: 1,
  shadow: false,
  zIndex: 0,
  ...styles
});

// Create a decorative element with gradient and shadow
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
): Element => {
  const element = createShape(id, shapeType, x, y, width, height, {
    fill: createGradient(gradient.angle, gradient.stops),
    shadow: !!shadow,
    ...(shadow && {
      boxShadow: `${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blur}px ${shadow.color}`
    }),
    ...(border && {
      borderWidth: border.width,
      borderColor: border.color,
      borderStyle: border.style
    })
  });

  return element;
};

const createPolygon = (
  id: string,
  points: Array<{x: number, y: number}>,
  styles: Partial<Element> = {}
): Element => {
  const minX = Math.min(...points.map(p => p.x));
  const minY = Math.min(...points.map(p => p.y));
  const maxX = Math.max(...points.map(p => p.x));
  const maxY = Math.max(...points.map(p => p.y));
  
  return {
    id,
    type: 'polygon',
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
    points: points.map(p => ({ x: p.x - minX, y: p.y - minY })),
    fill: styles.fill || '#ffffff',
    stroke: styles.stroke || 'transparent',
    strokeWidth: styles.strokeWidth || 0,
    opacity: styles.opacity ?? 1,
    zIndex: styles.zIndex || 0,
    shadow: styles.shadow || {
      color: 'rgba(0,0,0,0.1)',
      blur: 0,
      offsetX: 0,
      offsetY: 2
    }
  };
};

// Helper function to create chart elements
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
    // Ensure datasets is an array
    datasets: chartData.datasets?.map((dataset: any) => ({
      ...dataset,
      // Ensure backgroundColor is an array for pie charts
      backgroundColor: Array.isArray(dataset.backgroundColor) 
        ? dataset.backgroundColor 
        : [dataset.backgroundColor || '#3B82F6'],
      // Ensure borderColor is an array for line/bar charts
      borderColor: Array.isArray(dataset.borderColor)
        ? dataset.borderColor
        : [dataset.borderColor || '#3B82F6']
    })) || []
  },
  chartOptions: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: {
            size: 12,
          },
          padding: 20
        }
      }
    },
    ...options,
  },
  zIndex: 1,
});

const createSimpleBusinessStrategyTemplate = (): Slide[] => {
  console.log('[Template] Creating enhanced business strategy template...');
  const now = new Date();
  const currentYear = now.getFullYear();
  const quarter = `Q${Math.floor((now.getMonth() + 3) / 3)}`;

  // Common styles
  const titleStyle = {
    fontSize: 36,
    fontWeight: 'bold' as const,
    color: '#1e3a8a',
    textAlign: 'center' as const,
    fontFamily: 'Arial',
  };

  const subtitleStyle = {
    fontSize: 24,
    color: '#4b5563',
    textAlign: 'center' as const,
    fontFamily: 'Arial',
  };

  const sectionTitleStyle = {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: '#1e3a8a',
    fontFamily: 'Arial',
  };

  // Common gradients
  const blueGradient = {
    angle: 135,
    stops: [
      { color: '#1e3a8a', offset: 0 },
      { color: '#1e40af', offset: 100 }
    ]
  };

  const accentGradient = {
    angle: 45,
    stops: [
      { color: '#f59e0b', offset: 0 },
      { color: '#fbbf24', offset: 100 }
    ]
  };

  // Sample chart data
  const revenueData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      {
        label: 'Revenue (in millions)',
        data: [4.2, 5.1, 6.3, 7.8],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderWidth: 2,
        tension: 0.3,
        fill: true
      }
    ]
  };

  const marketShareData = {
    labels: ['Our Company', 'Competitor A', 'Competitor B', 'Others'],
    datasets: [
      {
        data: [42, 25, 20, 13],
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#E5E7EB'
        ],
        borderWidth: 1
      }
    ]
  };

  const quarterlyData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      {
        label: 'New Customers',
        data: [120, 150, 180, 210],
        backgroundColor: '#3B82F6',
        borderRadius: 4,
      },
      {
        label: 'Returning Customers',
        data: [80, 100, 130, 150],
        backgroundColor: '#10B981',
        borderRadius: 4,
      }
    ]
  };

  // Slide 1: Title Slide with enhanced visuals
  const titleSlide: Slide = {
    id: 'title-slide',
    elements: [
      // Background with gradient
      createDecorativeElement(
        'bg-rect',
        'rectangle',
        0, 0, 960, 540,
        blueGradient,
        { color: 'rgba(0,0,0,0.2)', blur: 10, offsetX: 0, offsetY: 4 }
      ),
      
      // Decorative elements
      createDecorativeElement(
        'decoration-1',
        'circle',
        -100, -100, 300, 300,
        { angle: 0, stops: [{ color: 'rgba(255,255,255,0.1)', offset: 0 }, { color: 'transparent', offset: 100 }] },
        null
      ),
      
      // Title with shadow
      createTextElement('title', 'Business Strategy', 80, 180, 800, 80, {
        ...titleStyle,
        color: '#ffffff',
        fontSize: 60,
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
        zIndex: 2,
      }),
      
      // Subtitle with accent
      createTextElement('subtitle', `${quarter} ${currentYear} Update`, 80, 280, 800, 60, {
        ...subtitleStyle,
        color: '#fef3c7',
        fontSize: 28,
        fontWeight: 'medium',
        zIndex: 2,
      }),
      
      // Removed decorative divider
    ],
    background: '#1e3a8a',
    createdAt: now.toISOString(),
  };

  // Slide 2: Agenda
  const agendaSlide: Slide = {
    id: 'agenda',
    elements: [
      createTextElement('title', 'Agenda', 80, 80, 800, 60, sectionTitleStyle),
      createTextElement('item1', '1. Executive Summary', 120, 180, 700, 40, {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1f2937',
      }),
      createTextElement('item2', '2. Market Analysis', 120, 240, 700, 40, {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1f2937',
      }),
      createTextElement('item3', '3. Competitive Landscape', 120, 300, 700, 40, {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1f2937',
      }),
      createTextElement('item4', '4. Strategic Initiatives', 120, 360, 700, 40, {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1f2937',
      }),
      createTextElement('item5', '5. Financial Roadmap', 120, 420, 700, 40, {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1f2937',
      }),
    ],
    background: '#ffffff',
    createdAt: now.toISOString(),
  };

  // Slide 3: Executive Summary
  const execSummarySlide: Slide = {
    id: 'executive-summary',
    elements: [
      createTextElement('title', 'Executive Summary', 80, 80, 800, 60, sectionTitleStyle),
      createTextElement('content1', '•  Key business highlights and performance metrics', 100, 180, 700, 30, {
        fontSize: 20,
        color: '#1f2937',
      }),
      createTextElement('content2', '•  Major achievements and milestones', 100, 230, 700, 30, {
        fontSize: 20,
        color: '#1f2937',
      }),
      createTextElement('content3', '•  Challenges and opportunities', 100, 280, 700, 30, {
        fontSize: 20,
        color: '#1f2937',
      }),
      createTextElement('content4', '•  Strategic priorities for the coming quarter', 100, 330, 700, 30, {
        fontSize: 20,
        color: '#1f2937',
      }),
    ],
    background: '#ffffff',
    createdAt: now.toISOString(),
  };

  // Slide 4: Market Analysis
  const marketAnalysisSlide: Slide = {
    id: 'market-analysis',
    elements: [
      createTextElement('title', 'Market Analysis', 80, 60, 800, 60, sectionTitleStyle),
      
      // Market Growth Projection Chart (Larger to take more space)
      createChart(
        'market-growth-chart',
        'line',
        80,
        120,
        400,
        320,
        {
          labels: ['2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030'],
          datasets: [
            {
              label: 'Market Size ($B)',
              data: [45, 52, 60, 68, 75, 83, 90, 100],
              borderColor: '#3B82F6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderWidth: 2,
              tension: 0.3,
              fill: true,
              yAxisID: 'y'
            },
            {
              label: 'Growth Rate (%)',
              data: [12, 15, 13, 12, 10, 9, 8, 11],
              borderColor: '#10B981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              borderWidth: 2,
              borderDash: [5, 5],
              tension: 0.3,
              yAxisID: 'y1'
            }
          ]
        },
        {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Market Growth Projection',
              font: { size: 16, weight: 'bold' }
            },
            tooltip: {
              mode: 'index',
              intersect: false
            }
          },
          scales: {
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              title: {
                display: true,
                text: 'Market Size ($B)'
              },
              grid: {
                drawOnChartArea: true
              }
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              title: {
                display: true,
                text: 'Growth Rate (%)'
              },
              grid: {
                drawOnChartArea: false
              },
              min: 0,
              max: 20
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      ),

      // Market Share Distribution Pie Chart (Larger to take more space)
      createChart(
        'market-share-chart',
        'pie',
        520,
        120,
        400,
        320,
        {
          labels: ['Our Company', 'Competitor A', 'Competitor B', 'Others'],
          datasets: [{
            data: [15, 35, 25, 25],
            backgroundColor: [
              '#3B82F6',
              '#10B981',
              '#F59E0B',
              '#E5E7EB'
            ],
            borderWidth: 1
          }]
        },
        {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Market Share Distribution (2023)',
              font: { size: 16, weight: 'bold' }
            },
            legend: {
              position: 'bottom',
              labels: {
                padding: 20,
                usePointStyle: true,
                pointStyle: 'circle'
              }
            },
            tooltip: {
              callbacks: {
                label: (context: any) => {
                  return `${context.label}: ${context.raw}%`;
                }
              }
            }
          }
        }
      ),

      createTextElement('chart-note', 'Source: Market Research 2023 | *Projected values for 2024-2030', 100, 480, 800, 40, {
        fontSize: 12,
        fontStyle: 'italic',
        color: '#6b7280',
        textAlign: 'center',
      }),
    ],
    background: '#ffffff',
    createdAt: now.toISOString(),
  };

  // Slide 5: Competitive Landscape
  const competitiveLandscapeSlide: Slide = {
    id: 'competitive-landscape',
    elements: [
      createTextElement('title', 'Competitive Landscape', 80, 80, 800, 60, sectionTitleStyle),
      createTextElement('subtitle', 'Key Competitors', 120, 160, 700, 30, {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
      }),
      createTextElement('comp1', '•  Competitor A: Market Leader (35%)', 140, 210, 700, 25, {
        fontSize: 18,
        color: '#1f2937',
      }),
      createTextElement('comp2', '•  Competitor B: Strong Challenger (25%)', 140, 250, 700, 25, {
        fontSize: 18,
        color: '#1f2937',
      }),
      createTextElement('comp3', `•  Our Company: Emerging Player (${currentYear - 2020}% market share)`, 140, 290, 700, 25, {
        fontSize: 18,
        color: '#1e40af',
        fontWeight: 'bold',
      }),
    ],
    background: '#ffffff',
    createdAt: now.toISOString(),
  };

  // Slide 6: Strategic Initiatives
  const strategicInitiativesSlide: Slide = {
    id: 'strategic-initiatives',
    elements: [
      createTextElement('title', 'Strategic Initiatives', 80, 80, 800, 60, sectionTitleStyle),
      createTextElement('init1', '1. Product Innovation', 100, 170, 700, 30, {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
      }),
      createTextElement('init1-desc', 'Launch of next-generation platform', 120, 200, 700, 25, {
        fontSize: 16,
        color: '#4b5563',
      }),
      createTextElement('init2', '2. Market Expansion', 100, 250, 700, 30, {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
      }),
      createTextElement('init2-desc', 'Enter 3 new geographic markets', 120, 280, 700, 25, {
        fontSize: 16,
        color: '#4b5563',
      }),
      createTextElement('init3', '3. Customer Experience', 100, 330, 700, 30, {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
      }),
      createTextElement('init3-desc', 'Implement new support and success programs', 120, 360, 700, 25, {
        fontSize: 16,
        color: '#4b5563',
      }),
    ],
    background: '#ffffff',
    createdAt: now.toISOString(),
  };

  // Helper function to create a metric with label and value
  const createTextMetric = (
    id: string,
    label: string,
    value: string,
    x: number,
    y: number,
    width: number,
    height: number,
    styles: any = {}
  ): Element[] => {
    const elements: Element[] = [];
    
    elements.push(createTextElement(
      `${id}-label`,
      label,
      x,
      y,
      width,
      20,
      {
        fontSize: 14,
        color: styles.labelColor || '#6B7280',
        ...(styles.labelStyle || {})
      }
    ));
    
    elements.push(createTextElement(
      `${id}-value`,
      value,
      x,
      y + 25,
      width,
      30,
      {
        fontSize: styles.valueSize || 20,
        fontWeight: 'bold',
        color: styles.valueColor || '#1F2937',
        ...(styles.valueStyle || {})
      }
    ));
    
    return elements;
  };

  // Slide 7: Financial Roadmap
  const financialRoadmapSlide: Slide = {
    id: 'financial-roadmap',
    elements: [
      createTextElement('title', 'Financial Roadmap', 80, 60, 800, 60, sectionTitleStyle),
      
      // Revenue Projection Chart (Larger and centered)
      createChart(
        'revenue-chart',
        'bar',
        80,
        140,
        400,
        400,
        {
          labels: ['2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030'],
          datasets: [{
            label: 'Revenue ($M)',
            data: [100, 120, 140, 160, 180, 200, 220, 240],
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1,
            borderRadius: 4
          }]
        },
        {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Revenue Projection',
              font: { size: 16, weight: 'bold' }
            },
            tooltip: {
              callbacks: {
                label: (context: any) => `$${context.raw}M`
              }
            },
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Revenue ($M)'
              },
              grid: {
                drawOnChartArea: true
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      ),

      // Financial Metrics Card (Larger and better organized)
      createShape('metrics-bg', 'rectangle', 520, 140, 400, 400, {
        fill: '#F9FAFB',
        stroke: '#E5E7EB',
        strokeWidth: 1,
        borderRadius: 8
      }),

      createTextElement('metrics-title', 'Key Financial Metrics', 540, 170, 360, 30, {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937'
      }),

      // Revenue Metrics
      createTextElement('metric-1', 'Current Run Rate', 540, 220, 360, 25, {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500'
      }),
      createTextElement('metric-1-value', '$120M', 540, 245, 360, 30, {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#3B82F6'
      }),

      // Growth Metrics
      createTextElement('metric-2', `YoY Growth (${currentYear - 1} → ${currentYear})`, 540, 290, 360, 25, {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500'
      }),
      createTextElement('metric-2-value', '20%', 540, 315, 360, 30, {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#10B981'
      }),

      // Margin Metrics
      createTextElement('metric-3', 'EBITDA Margin', 540, 360, 360, 25, {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500'
      }),
      createTextElement('metric-3-value', '25%', 540, 385, 360, 30, {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#8B5CF6'
      }),

      // Cash Runway
      createTextElement('metric-4', 'Cash Runway', 540, 430, 360, 25, {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500'
      }),
      createTextElement('metric-4-value', '36 months', 540, 455, 360, 30, {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#F59E0B'
      }),

      createTextElement('chart-note', 'Source: Internal Financials | *Projected values for 2024-2030', 100, 780, 760, 40, {
        fontSize: 12,
        fontStyle: 'italic',
        color: '#6b7280',
        textAlign: 'right',
      })
    ],
    background: '#ffffff',
    createdAt: now
  };

  // Slide 8: Implementation Timeline
  const implementationTimelineSlide: Slide = {
    id: 'implementation-timeline',
    elements: [
      createTextElement('title', 'Implementation Timeline', 80, 80, 800, 60, sectionTitleStyle),
      createTextElement('timeline-1', 'Q1 2024: Product Development', 100, 180, 700, 30, {
        fontSize: 18,
        color: '#1f2937',
        fontWeight: 'bold'
      }),
      createTextElement('timeline-2', 'Q2 2024: Beta Testing', 100, 230, 700, 30, {
        fontSize: 18,
        color: '#1f2937',
        fontWeight: 'bold'
      }),
      createTextElement('timeline-3', 'Q3 2024: Market Launch', 100, 280, 700, 30, {
        fontSize: 18,
        color: '#1f2937',
        fontWeight: 'bold'
      })
    ],
    background: '#ffffff',
    createdAt: now
  };

  // Slide 7.5: Key Metrics Table
  const metricsTableSlide: Slide = {
    id: 'key-metrics-table',
    elements: [
      createTextElement('title', 'Key Performance Metrics', 80, 80, 800, 60, sectionTitleStyle),
      
      // Table with proper table type and theme
      {
        id: 'metrics-table',
        type: 'table',
        x: 80,
        y: 160,
        width: 800,
        height: 300,
        rows: 6, // header + 5 data rows
        cols: 4,
        tableData: [
          ['Metric', 'Current', 'Target', 'Variance'],
          ['Revenue Growth (YoY)', '12.5%', '15.0%', '-2.5%'],
          ['Gross Margin', '45.2%', '47.0%', '-1.8%'],
          ['Customer Acquisition Cost', '$120', '$100', '+$20'],
          ['Customer Lifetime Value', '$1,250', '$1,400', '-$150'],
          ['Net Promoter Score', '72', '75', '-3']
        ],
        themeId: 'keynote1', // Using the theme system
        header: true,
        borderWidth: 1,
        cellPadding: 12,
        cellTextAlign: 'left'
      } as Element
    ],
    background: '#ffffff',
    createdAt: now.toISOString(),
  };

  // Slide 8: Team & Resources
  const teamSlide: Slide = {
    id: 'team-resources',
    elements: [
      createTextElement('title', 'Team & Resources', 80, 80, 800, 60, sectionTitleStyle),
      createTextElement('team1', '•  Leadership Team: 5 members', 120, 180, 700, 30, {
        fontSize: 20,
        color: '#1f2937',
      }),
      createTextElement('team2', '•  R&D: 15 engineers', 120, 230, 700, 30, {
        fontSize: 20,
        color: '#1f2937',
      }),
      createTextElement('team3', '•  Sales & Marketing: 8 professionals', 120, 280, 700, 30, {
        fontSize: 20,
        color: '#1f2937',
      }),
      createTextElement('team4', '•  Operations: 5 team members', 120, 330, 700, 30, {
        fontSize: 20,
        color: '#1f2937',
      }),
    ],
    background: '#ffffff',
    createdAt: now.toISOString(),
  };

  // Slide 9: Risks & Mitigation
  const risksSlide: Slide = {
    id: 'risks-mitigation',
    elements: [
      createTextElement('title', 'Risks & Mitigation', 80, 80, 800, 60, sectionTitleStyle),
      createTextElement('risk1', 'Market Risk', 100, 170, 700, 30, {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#dc2626',
      }),
      createTextElement('risk1-mit', '•  Diversify product portfolio and enter new markets', 120, 200, 700, 25, {
        fontSize: 16,
        color: '#4b5563',
      }),
      createTextElement('risk2', 'Competitive Risk', 100, 250, 700, 30, {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#dc2626',
      }),
      createTextElement('risk2-mit', '•  Accelerate innovation and strengthen IP portfolio', 120, 280, 700, 25, {
        fontSize: 16,
        color: '#4b5563',
      }),
      createTextElement('risk3', 'Execution Risk', 100, 330, 700, 30, {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#dc2626',
      }),
      createTextElement('risk3-mit', '•  Strengthen project management and resource allocation', 120, 360, 700, 25, {
        fontSize: 16,
        color: '#4b5563',
      }),
    ],
    background: '#ffffff',
    createdAt: now.toISOString(),
  };

  // Slide 10: Next Steps
  const nextStepsSlide: Slide = {
    id: 'next-steps',
    elements: [
      createTextElement('title', 'Next Steps', 80, 80, 800, 60, sectionTitleStyle),
      createTextElement('step1', '1. Finalize Q2 priorities and OKRs', 100, 170, 700, 30, {
        fontSize: 20,
        color: '#1f2937',
      }),
      createTextElement('step2', '2. Allocate resources to key initiatives', 100, 220, 700, 30, {
        fontSize: 20,
        color: '#1f2937',
      }),
      createTextElement('step3', '3. Schedule review meetings', 100, 270, 700, 30, {
        fontSize: 20,
        color: '#1f2937',
      }),
      createTextElement('step4', '4. Develop detailed action plans', 100, 320, 700, 30, {
        fontSize: 20,
        color: '#1f2937',
      }),
      createTextElement('step5', '5. Set up tracking and reporting', 100, 370, 700, 30, {
        fontSize: 20,
        color: '#1f2937',
      }),
      createTextElement('contact', 'For questions: strategy@company.com', 80, 460, 800, 40, {
        fontSize: 18,
        color: '#4b5563',
        textAlign: 'center',
      }),
    ],
    background: '#f8fafc',
    createdAt: now.toISOString(),
  };

  // Add slides to the array in the desired order
  return [
    titleSlide,
    agendaSlide,
    execSummarySlide,
    marketAnalysisSlide,
    competitiveLandscapeSlide,
    strategicInitiativesSlide,
    financialRoadmapSlide,
    metricsTableSlide,
    risksSlide,
    nextStepsSlide,
  ];
};

export default createSimpleBusinessStrategyTemplate;
