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

// Natural, wellness-inspired palette for healthcare
const COLORS = {
  PRIMARY_BLUE: '#1B9CFC', // headers, key accents
  LIME: '#C4E538', // wellness accent
  AQUA: '#12CBC4', // callouts, highlights
  SOFT_GOLD: '#F8EFBA', // table / highlight background
  SOFT_BG: '#F5FAFF', // very light background option
  WHITE: '#FFFFFF',
  SLATE: '#374151',
  MUTED: '#6B7280',
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
  color: COLORS.SLATE,
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
  fill: COLORS.WHITE,
  stroke: 'transparent',
  strokeWidth: 0,
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
  // Options are renderer‑specific; pass through for future use
  ...(options ? { options } : {}),
  zIndex: 1,
});

const createHealthcareMedicalTemplate = (): Slide[] => {
  const createdAt = new Date();

  // Slide 1 – Medical Title Slide
  const titleSlide: Slide = {
    id: 'healthcare-title',
    background: COLORS.WHITE,
    createdAt,
    elements: [
      createTextElement('title', 'Healthcare & Medical Report', 80, 140, 800, 60, {
        fontSize: 40,
        fontWeight: 'bold',
        color: COLORS.PRIMARY_BLUE,
      }),
      createTextElement('subtitle', 'Clinical Insights & Treatment Overview', 80, 200, 800, 40, {
        fontSize: 22,
        color: COLORS.MUTED,
      }),
      // Small organic curved accent (not a background)
      createShape('accent-pill', 'rounded-rectangle', 80, 260, 160, 24, {
        fill: COLORS.AQUA,
        opacity: 0.15,
        borderRadius: 999,
      }),
      createShape('accent-circle', 'circle', 260, 252, 36, 36, {
        fill: COLORS.LIME,
        opacity: 0.18,
      }),
    ],
  };

  // Slide 2 – Objective & Overview
  const objectivesSlide: Slide = {
    id: 'healthcare-objectives',
    background: COLORS.WHITE,
    createdAt,
    elements: [
      createTextElement('title', 'Objectives & Overview', 80, 60, 800, 40, {
        fontSize: 30,
        fontWeight: 'bold',
        color: COLORS.PRIMARY_BLUE, // #1B9CFC
      }),
      createTextElement(
        'intro',
        'This report summarizes key clinical insights, operational performance, and treatment outcomes for the current reporting period.',
        80,
        110,
        800,
        60,
        {
          fontSize: 16,
          color: COLORS.MUTED,
        },
      ),
      // Bullet points – goals, scope, clinical direction
      createTextElement(
        'bullet-1',
        '•  Define clear goals for patient outcomes, safety, and experience.',
        100,
        190,
        760,
        30,
        {
          fontSize: 18,
        },
      ),
      createTextElement(
        'bullet-2',
        '•  Outline the scope across inpatient, outpatient, and emergency services.',
        100,
        225,
        760,
        30,
        {
          fontSize: 18,
        },
      ),
      createTextElement(
        'bullet-3',
        '•  Align clinical direction with evidence‑based protocols and guidelines.',
        100,
        260,
        760,
        30,
        {
          fontSize: 18,
        },
      ),
      // Pastel highlight chips for key terms
      createShape('chip-goals', 'rounded-rectangle', 100, 310, 110, 28, {
        fill: COLORS.SOFT_GOLD,
        opacity: 0.7,
        borderRadius: 999,
      }),
      createTextElement('chip-goals-text', 'Goals', 115, 313, 80, 22, {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.SLATE,
        textAlign: 'left',
      }),
      createShape('chip-safety', 'rounded-rectangle', 220, 310, 130, 28, {
        fill: COLORS.LIME,
        opacity: 0.25,
        borderRadius: 999,
      }),
      createTextElement('chip-safety-text', 'Patient Safety', 235, 313, 110, 22, {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.SLATE,
      }),
      createShape('chip-quality', 'rounded-rectangle', 370, 310, 145, 28, {
        fill: COLORS.AQUA,
        opacity: 0.2,
        borderRadius: 999,
      }),
      createTextElement('chip-quality-text', 'Quality of Care', 385, 313, 130, 22, {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.SLATE,
      }),
    ],
  };

  // Slide 3 – Data Insight Chart (Line Chart)
  const recoveryChartSlide: Slide = {
    id: 'healthcare-recovery-chart',
    background: COLORS.WHITE,
    createdAt,
    elements: [
      createTextElement('title', 'Patient Recovery Rate Over 12 Months', 80, 60, 800, 40, {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.PRIMARY_BLUE,
      }),
      createTextElement(
        'subtitle',
        'Comparison of overall recovery rate vs. target benchmark across the last 12 months.',
        80,
        100,
        800,
        40,
        {
          fontSize: 16,
          color: COLORS.MUTED,
        },
      ),
      createChart(
        'recovery-line-chart',
        'line',
        80,
        150,
        800,
        280,
        {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [
            {
              label: 'Actual Recovery Rate',
              data: [88, 89, 90, 91, 92, 93, 94, 93, 94, 95, 95, 96],
              borderColor: COLORS.LIME, // #C4E538
              backgroundColor: 'rgba(196, 229, 56, 0.15)',
              tension: 0.3,
              pointRadius: 4,
              pointBackgroundColor: COLORS.LIME,
              pointBorderWidth: 0,
            },
            {
              label: 'Target Recovery Rate',
              data: [90, 90, 91, 91, 92, 92, 93, 93, 94, 94, 95, 95],
              borderColor: COLORS.AQUA, // #12CBC4
              backgroundColor: 'rgba(18, 203, 196, 0.10)',
              borderDash: [6, 4],
              tension: 0.3,
              pointRadius: 0,
            },
          ],
        },
        {
          plugins: {
            legend: { position: 'bottom' },
          },
          scales: {
            x: {
              grid: { display: false },
            },
            y: {
              grid: { color: 'rgba(148, 163, 184, 0.15)' },
              suggestedMin: 80,
              suggestedMax: 100,
            },
          },
        },
      ),
    ],
  };

  // Slide 4 – Disease / Condition Infographic (Type 2 Diabetes)
  const conditionSlide: Slide = {
    id: 'healthcare-condition-diabetes',
    background: COLORS.WHITE,
    createdAt,
    elements: [
      createTextElement('title', 'Condition Focus: Type 2 Diabetes', 80, 60, 800, 40, {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.PRIMARY_BLUE,
      }),
      createTextElement(
        'subtitle',
        'Overview of key symptoms, risk factors, and prevalence in the adult population.',
        80,
        100,
        800,
        40,
        {
          fontSize: 16,
          color: COLORS.MUTED,
        },
      ),
      // Symptoms block
      createShape('symptoms-card', 'rounded-rectangle', 80, 160, 260, 200, {
        fill: COLORS.SOFT_GOLD,
        opacity: 0.4,
        borderRadius: 16,
      }),
      createTextElement('symptoms-title', 'Symptoms', 100, 175, 220, 30, {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.SLATE,
      }),
      createTextElement(
        'symptoms-list',
        '•  Increased thirst & frequent urination\n•  Fatigue & blurred vision\n•  Slow‑healing sores or infections',
        100,
        205,
        220,
        130,
        {
          fontSize: 14,
          lineHeight: 1.5,
        },
      ),
      // Risk factors block
      createShape('risk-card', 'rounded-rectangle', 350, 160, 260, 200, {
        fill: COLORS.AQUA,
        opacity: 0.18,
        borderRadius: 16,
      }),
      createTextElement('risk-title', 'Risk Factors', 370, 175, 220, 30, {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.SLATE,
      }),
      createTextElement(
        'risk-list',
        '•  Obesity and sedentary lifestyle\n•  Family history of diabetes\n•  Hypertension or dyslipidemia',
        370,
        205,
        220,
        130,
        {
          fontSize: 14,
          lineHeight: 1.5,
        },
      ),
      // Prevalence block
      createShape('prev-card', 'rounded-rectangle', 620, 160, 260, 200, {
        fill: COLORS.LIME,
        opacity: 0.16,
        borderRadius: 16,
      }),
      createTextElement('prev-title', 'Prevalence', 640, 175, 220, 30, {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.SLATE,
      }),
      createTextElement(
        'prev-text',
        '•  ~8–10% of adults globally affected\n•  Higher rates in urban, high‑BMI populations\n•  Strong association with cardiovascular risk',
        640,
        205,
        220,
        130,
        {
          fontSize: 14,
          lineHeight: 1.5,
        },
      ),
      // Small curved accent
      createShape('leaf-accent', 'circle', 780, 140, 34, 34, {
        fill: COLORS.LIME,
        opacity: 0.25,
      }),
      createShape('leaf-accent-2', 'circle', 800, 160, 22, 22, {
        fill: COLORS.AQUA,
        opacity: 0.3,
      }),
    ],
  };

  // Slide 5 – Patient Statistics Table
  const tableSlide: Slide = {
    id: 'healthcare-patient-table',
    background: COLORS.WHITE,
    createdAt,
    elements: [
      createTextElement('title', 'Patient Statistics by Age Group', 80, 60, 800, 40, {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.PRIMARY_BLUE,
      }),
      createTextElement(
        'subtitle',
        'Distribution of cases, recovery rates, and average treatment duration by age segment.',
        80,
        100,
        800,
        40,
        {
          fontSize: 16,
          color: COLORS.MUTED,
        },
      ),
      // Soft rounded gradient background behind the table (not full slide)
      createShape('table-bg', 'rounded-rectangle', 80, 160, 800, 260, {
        // Slightly lighter gradient so the table content stands out clearly
        fill: 'linear-gradient(180deg, #FBF4D5 0%, #FFFFFF 100%)',
        borderRadius: 18,
        stroke: 'transparent',
      }),
      {
        id: 'patient-stats-table',
        type: 'table',
        x: 100,
        y: 180,
        width: 760,
        height: 260, // extra height to avoid scrollbars in cells
        rows: 6,
        cols: 4,
        tableData: [
          ['Age Group', 'Cases', 'Recovery %', 'Avg. Treatment Duration'],
          ['18–34', '120', '96%', '10 days'],
          ['35–49', '210', '94%', '12 days'],
          ['50–64', '260', '91%', '14 days'],
          ['65–79', '190', '88%', '16 days'],
          ['80+', '85', '83%', '18 days'],
        ],
        header: true,
        headerBg: COLORS.PRIMARY_BLUE,
        headerTextColor: COLORS.WHITE,
        // Slightly stronger alternating row background for clearer readability
        rowAltBg: 'rgba(248, 239, 186, 0.7)',
        cellPadding: 8,
        cellTextAlign: 'center',
        // Add subtle grid lines for clearer table structure
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.6)',
      } as Element,
    ],
  };

  // Slide 6 – Research Highlights
  const researchSlide: Slide = {
    id: 'healthcare-research-highlights',
    background: COLORS.WHITE,
    createdAt,
    elements: [
      createTextElement('title', 'Research Highlights', 80, 60, 800, 40, {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.PRIMARY_BLUE,
      }),
      createTextElement(
        'subtitle',
        'Summary of recent clinical studies relevant to current treatment pathways.',
        80,
        100,
        800,
        40,
        {
          fontSize: 16,
          color: COLORS.MUTED,
        },
      ),
      createTextElement(
        'bullet-1',
        '•  Randomized controlled trial showed a 12% reduction in 30‑day readmissions with structured discharge education.',
        100,
        160,
        760,
        50,
        {
          fontSize: 16,
        },
      ),
      createTextElement(
        'bullet-2',
        '•  Early mobilization protocols were associated with shorter length of stay in post‑operative patients.',
        100,
        210,
        760,
        50,
        {
          fontSize: 16,
        },
      ),
      createTextElement(
        'bullet-3',
        '•  Telehealth follow‑up visits maintained comparable clinical outcomes while improving patient satisfaction scores.',
        100,
        260,
        760,
        50,
        {
          fontSize: 16,
        },
      ),
      // Aqua callout
      createShape('callout-pill', 'rounded-rectangle', 100, 320, 380, 50, {
        fill: COLORS.AQUA,
        opacity: 0.18,
        borderRadius: 999,
      }),
      createTextElement(
        'callout-text',
        'Use this section to align local protocols with the latest evidence‑based findings.',
        120,
        330,
        340,
        40,
        {
          fontSize: 14,
          color: COLORS.SLATE,
        },
      ),
      // Small circular accents
      createShape('accent-dot-1', 'circle', 520, 330, 18, 18, {
        fill: COLORS.AQUA,
        opacity: 0.35,
      }),
      createShape('accent-dot-2', 'circle', 545, 340, 12, 12, {
        fill: COLORS.LIME,
        opacity: 0.35,
      }),
    ],
  };

  // Slide 7 – Team of Doctors (Text‑Based Profiles Only)
  const teamSlide: Slide = {
    id: 'healthcare-team',
    background: COLORS.WHITE,
    createdAt,
    elements: [
      createTextElement('title', 'Clinical Team', 80, 60, 800, 40, {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.PRIMARY_BLUE,
      }),
      createTextElement(
        'subtitle',
        'Lead physicians responsible for clinical oversight and decision‑making.',
        80,
        100,
        800,
        30,
        {
          fontSize: 16,
          color: COLORS.MUTED,
        },
      ),
      // 2 x 2 text grid, no images or shape backgrounds
      createTextElement('doc1-name', 'Dr. Ananya Rao', 80, 160, 360, 30, {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.PRIMARY_BLUE,
      }),
      createTextElement('doc1-role', 'Consultant Endocrinologist | MD, DM (Endocrinology)', 80, 190, 360, 40, {
        fontSize: 14,
        color: COLORS.SLATE,
      }),

      createTextElement('doc2-name', 'Dr. Michael Chen', 520, 160, 360, 30, {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.PRIMARY_BLUE,
      }),
      createTextElement('doc2-role', 'Senior Cardiologist | MD, FACC', 520, 190, 360, 40, {
        fontSize: 14,
        color: COLORS.SLATE,
      }),

      createTextElement('doc3-name', 'Dr. Sofia Martinez', 80, 250, 360, 30, {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.PRIMARY_BLUE,
      }),
      createTextElement('doc3-role', 'Internal Medicine Specialist | MD, MPH', 80, 280, 360, 40, {
        fontSize: 14,
        color: COLORS.SLATE,
      }),

      createTextElement('doc4-name', 'Dr. Ravi Kulkarni', 520, 250, 360, 30, {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.PRIMARY_BLUE,
      }),
      createTextElement('doc4-role', 'Clinical Pharmacologist | MD, PhD', 520, 280, 360, 40, {
        fontSize: 14,
        color: COLORS.SLATE,
      }),
    ],
  };

  // Slide 8 – Timeline (Treatment or Project Roadmap)
  const timelineSlide: Slide = {
    id: 'healthcare-timeline',
    background: COLORS.WHITE,
    createdAt,
    elements: [
      createTextElement('title', 'Treatment Roadmap', 80, 60, 800, 40, {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.PRIMARY_BLUE,
      }),
      createTextElement(
        'subtitle',
        'Standardized pathway from diagnosis through long‑term follow‑up.',
        80,
        100,
        800,
        40,
        {
          fontSize: 16,
          color: COLORS.MUTED,
        },
      ),
      // Baseline line
      createShape('timeline-line', 'rectangle', 120, 240, 720, 4, {
        fill: 'rgba(148, 163, 184, 0.4)',
      }),
      // Milestones with rounded markers
      createShape('milestone-1', 'circle', 120, 230, 24, 24, {
        fill: COLORS.LIME,
      }),
      createTextElement('milestone-1-label', 'Diagnosis', 100, 270, 120, 30, {
        fontSize: 14,
        textAlign: 'center',
      }),

      createShape('milestone-2', 'circle', 280, 230, 24, 24, {
        fill: COLORS.PRIMARY_BLUE,
      }),
      createTextElement('milestone-2-label', 'Assessment', 260, 270, 120, 30, {
        fontSize: 14,
        textAlign: 'center',
      }),

      createShape('milestone-3', 'circle', 460, 230, 24, 24, {
        fill: COLORS.LIME,
      }),
      createTextElement('milestone-3-label', 'Treatment Cycles', 420, 270, 160, 30, {
        fontSize: 14,
        textAlign: 'center',
      }),

      createShape('milestone-4', 'circle', 640, 230, 24, 24, {
        fill: COLORS.PRIMARY_BLUE,
      }),
      createTextElement('milestone-4-label', 'Monitoring', 620, 270, 120, 30, {
        fontSize: 14,
        textAlign: 'center',
      }),

      createShape('milestone-5', 'circle', 820, 230, 24, 24, {
        fill: COLORS.LIME,
      }),
      createTextElement('milestone-5-label', 'Follow‑Up', 800, 270, 120, 30, {
        fontSize: 14,
        textAlign: 'center',
      }),
    ],
  };

  // Slide 9 – Future Recommendations
  const recommendationsSlide: Slide = {
    id: 'healthcare-recommendations',
    background: COLORS.WHITE,
    createdAt,
    elements: [
      createTextElement('title', 'Future Recommendations', 80, 60, 800, 40, {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.PRIMARY_BLUE,
      }),
      // Light aqua highlight bar
      createShape('highlight-bar', 'rectangle', 80, 110, 200, 6, {
        fill: COLORS.AQUA,
        opacity: 0.6,
        borderRadius: 4,
      }),
      createTextElement(
        'subtitle',
        'Evidence‑based initiatives to improve outcomes, safety, and patient experience.',
        80,
        130,
        800,
        40,
        {
          fontSize: 16,
          color: COLORS.MUTED,
        },
      ),
      createTextElement(
        'rec-1',
        '•  Expand nurse‑led education programs for high‑risk patients to reduce readmissions.',
        100,
        190,
        760,
        40,
        {
          fontSize: 16,
        },
      ),
      createTextElement(
        'rec-2',
        '•  Implement standardized care bundles for sepsis, heart failure, and post‑surgical care.',
        100,
        230,
        760,
        40,
        {
          fontSize: 16,
        },
      ),
      createTextElement(
        'rec-3',
        '•  Enhance telemedicine follow‑up for chronic disease management and medication titration.',
        100,
        270,
        760,
        40,
        {
          fontSize: 16,
        },
      ),
      createTextElement(
        'rec-4',
        '•  Regularly review clinical dashboards with multidisciplinary teams to drive continuous improvement.',
        100,
        310,
        760,
        40,
        {
          fontSize: 16,
        },
      ),
    ],
  };

  // Slide 10 – Closing Slide
  const closingSlide: Slide = {
    id: 'healthcare-closing',
    background: COLORS.WHITE,
    createdAt,
    elements: [
      createTextElement('title', 'Thank You', 80, 180, 800, 60, {
        fontSize: 42,
        fontWeight: 'bold',
        color: COLORS.PRIMARY_BLUE,
        textAlign: 'center',
      }),
      createTextElement(
        'subtitle',
        'End of Report',
        80,
        240,
        800,
        40,
        {
          fontSize: 20,
          color: COLORS.MUTED,
          textAlign: 'center',
        },
      ),
      // Organic curved accent in one corner
      createShape('corner-accent-1', 'circle', 840, 40, 80, 80, {
        fill: COLORS.AQUA,
        opacity: 0.18,
      }),
      createShape('corner-accent-2', 'circle', 820, 60, 48, 48, {
        fill: COLORS.LIME,
        opacity: 0.25,
      }),
    ],
  };

  return [
    titleSlide,
    objectivesSlide,
    recoveryChartSlide,
    conditionSlide,
    tableSlide,
    researchSlide,
    teamSlide,
    timelineSlide,
    recommendationsSlide,
    closingSlide,
  ];
};

export default createHealthcareMedicalTemplate;
