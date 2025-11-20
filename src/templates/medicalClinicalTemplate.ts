import { Slide } from '@/types/slide-thumbnails';
import { Element } from '@/hooks/use-action-manager';

// Palette for clean, clinical medical deck
const COLORS = {
  BLUE: '#007AFF',
  GREEN: '#34C759',
  GRAY: '#E5E5EA',
  WHITE: '#FFFFFF',
  TEXT_DARK: '#1C1C1E',
  TEXT_MUTED: '#6B7280',
  BG_SOFT: '#F7F8FA',
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
  color: COLORS.TEXT_DARK,
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
  stroke: COLORS.GRAY,
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

const createMedicalClinicalTemplate = (): Slide[] => {
  const createdAt = new Date();

  // Real medical imagery (Unsplash – user can replace)
  const HOSPITAL_IMG =
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80';
  const LAB_IMG =
    'https://images.unsplash.com/photo-1535916707207-35f97e715e1b?auto=format&fit=crop&w=1600&q=80';
  const TEAM_IMG =
    'https://images.unsplash.com/photo-1535916707207-35f97e715e1b?auto=format&fit=crop&w=1600&q=80';

  // 1. Medical Title Slide
  const titleSlide: Slide = {
    id: 'med-title',
    background: COLORS.WHITE,
    createdAt,
    elements: [
      createImageElement('t-bg', HOSPITAL_IMG, 0, 0, 960, 540, {
        opacity: 0.18,
      }),
      createShape('t-card', 'rounded-rectangle', 120, 120, 720, 260, {
        fill: 'rgba(255,255,255,0.95)',
        stroke: 'rgba(0,0,0,0.03)',
        // soft shadow via custom shadow field
        ...( {
          shadow: {
            color: 'rgba(15,23,42,0.10)',
            blur: 24,
            offsetX: 0,
            offsetY: 12,
          },
        } as any),
      }),
      createTextElement('t-title', 'Clinical Outcomes Report', 150, 150, 660, 60, {
        fontSize: 34,
        fontWeight: '600',
        color: COLORS.BLUE,
      }),
      createShape('t-underline', 'rectangle', 150, 210, 220, 3, {
        fill: COLORS.GREEN,
        stroke: 'transparent',
      }),
      createTextElement(
        't-sub',
        'Actalyst Medical Center  •  Cardiology & Internal Medicine',
        150,
        225,
        660,
        30,
        {
          fontSize: 16,
          color: COLORS.TEXT_MUTED,
        },
      ),
      createTextElement(
        't-meta',
        'Reporting Period: Jan 2024 – Dec 2024',
        150,
        260,
        660,
        26,
        {
          fontSize: 14,
          color: COLORS.TEXT_MUTED,
        },
      ),
    ],
  };

  // 2. Objective & Overview
  const overviewSlide: Slide = {
    id: 'med-overview',
    background: COLORS.BG_SOFT,
    createdAt,
    elements: [
      createShape('o-header', 'rectangle', 0, 60, 960, 50, {
        fill: COLORS.BLUE,
        stroke: 'transparent',
      }),
      createTextElement('o-title', 'Objective & Overview', 120, 70, 720, 30, {
        fontSize: 22,
        fontWeight: '600',
        color: COLORS.WHITE,
      }),
      createShape('o-card', 'rounded-rectangle', 120, 130, 720, 300, {
        fill: COLORS.WHITE,
        stroke: 'rgba(0,0,0,0.05)',
        ...( {
          shadow: {
            color: 'rgba(15,23,42,0.08)',
            blur: 20,
            offsetX: 0,
            offsetY: 10,
          },
        } as any),
      }),
      createTextElement('o-obj-label', 'Study Objective', 150, 150, 680, 26, {
        fontSize: 16,
        fontWeight: '600',
      }),
      createTextElement(
        'o-obj-text',
        'Evaluate clinical outcomes and length of stay for patients admitted with acute coronary syndrome.',
        150,
        176,
        680,
        48,
        {
          fontSize: 14,
          color: COLORS.TEXT_MUTED,
        },
      ),
      createTextElement('o-scope-label', 'Clinical Scope', 150, 230, 680, 26, {
        fontSize: 16,
        fontWeight: '600',
      }),
      createTextElement(
        'o-scope-text',
        '\u2022 Department: Cardiology, Internal Medicine\n\u2022 Setting: Tertiary care hospital\n\u2022 Timeframe: 12-month retrospective cohort',
        150,
        256,
        680,
        70,
        {
          fontSize: 14,
          color: COLORS.TEXT_MUTED,
        },
      ),
      createTextElement('o-target-label', 'Target Group', 150, 336, 680, 26, {
        fontSize: 16,
        fontWeight: '600',
      }),
      createTextElement(
        'o-target-text',
        '\u2022 Adult patients aged 18–85\n\u2022 Primary diagnosis: ACS (STEMI, NSTEMI, Unstable Angina)\n\u2022 Exclusions: incomplete records, transfer-out cases',
        150,
        362,
        680,
        80,
        {
          fontSize: 14,
          color: COLORS.TEXT_MUTED,
        },
      ),
    ],
  };

  // 3. Data Insight Chart – Example metric
  const dataSlide: Slide = {
    id: 'med-data',
    background: COLORS.WHITE,
    createdAt,
    elements: [
      createTextElement('d-title', 'Patient Volume & Recovery Rates', 80, 60, 800, 32, {
        fontSize: 22,
        fontWeight: '600',
        color: COLORS.BLUE,
      }),
      createTextElement(
        'd-sub',
        'Monthly admitted cases vs. 30-day recovery rate.',
        80,
        92,
        800,
        24,
        {
          fontSize: 14,
          color: COLORS.TEXT_MUTED,
        },
      ),
      createShape('d-card', 'rounded-rectangle', 80, 130, 800, 320, {
        fill: COLORS.WHITE,
        stroke: 'rgba(0,0,0,0.04)',
        ...( {
          shadow: {
            color: 'rgba(15,23,42,0.08)',
            blur: 22,
            offsetX: 0,
            offsetY: 12,
          },
        } as any),
      }),
      createChart(
        'd-chart',
        'bar',
        110,
        160,
        740,
        260,
        {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            {
              label: 'Admitted Cases',
              data: [120, 140, 135, 150, 160, 155],
              backgroundColor: 'rgba(0,122,255,0.65)',
            },
            {
              label: '30-day Recovery %',
              data: [88, 90, 89, 91, 92, 93],
              type: 'line',
              borderColor: COLORS.GREEN,
              backgroundColor: 'rgba(52,199,89,0.15)',
              fill: true,
            },
          ],
        },
      ),
    ],
  };

  // 4. Disease / Condition Infographic
  const conditionSlide: Slide = {
    id: 'med-condition',
    background: COLORS.BG_SOFT,
    createdAt,
    elements: [
      createTextElement('c-title', 'Condition Snapshot: Type 2 Diabetes Mellitus', 80, 60, 800, 32, {
        fontSize: 22,
        fontWeight: '600',
        color: COLORS.BLUE,
      }),
      createShape('c-card', 'rounded-rectangle', 80, 110, 800, 340, {
        fill: COLORS.WHITE,
        stroke: 'rgba(0,0,0,0.04)',
        ...( {
          shadow: {
            color: 'rgba(15,23,42,0.06)',
            blur: 18,
            offsetX: 0,
            offsetY: 10,
          },
        } as any),
      }),
      createTextElement('c-sym-label', 'Key Symptoms', 110, 130, 220, 24, {
        fontSize: 16,
        fontWeight: '600',
      }),
      createTextElement(
        'c-sym-text',
        '\u2022 Polyuria, polydipsia\n\u2022 Unexplained weight loss\n\u2022 Fatigue, blurred vision',
        110,
        156,
        220,
        90,
        {
          fontSize: 14,
          color: COLORS.TEXT_MUTED,
        },
      ),
      createTextElement('c-risk-label', 'Risk Factors', 360, 130, 220, 24, {
        fontSize: 16,
        fontWeight: '600',
      }),
      createTextElement(
        'c-risk-text',
        '\u2022 Family history of diabetes\n\u2022 Obesity, sedentary lifestyle\n\u2022 Hypertension, dyslipidemia',
        360,
        156,
        220,
        90,
        {
          fontSize: 14,
          color: COLORS.TEXT_MUTED,
        },
      ),
      createTextElement('c-prev-label', 'Prevalence (Clinic Data)', 610, 130, 240, 24, {
        fontSize: 16,
        fontWeight: '600',
      }),
      createTextElement(
        'c-prev-text',
        '23% of outpatient visits\n14% of admissions\nHigher incidence in age 50–70 group',
        610,
        156,
        240,
        90,
        {
          fontSize: 14,
          color: COLORS.TEXT_MUTED,
        },
      ),
    ],
  };

  // 5. Patient Statistics Table
  const statsSlide: Slide = {
    id: 'med-stats',
    background: COLORS.WHITE,
    createdAt,
    elements: [
      createTextElement('s-title', 'Patient Statistics by Age Group', 80, 60, 800, 32, {
        fontSize: 22,
        fontWeight: '600',
        color: COLORS.BLUE,
      }),
      {
        id: 's-table',
        type: 'table',
        x: 80,
        y: 120,
        width: 800,
        height: 280,
        rows: 5,
        cols: 4,
        header: true,
        headerBg: COLORS.BLUE,
        headerTextColor: COLORS.WHITE,
        cellPadding: 10,
        cellTextAlign: 'center',
        backgroundColor: COLORS.WHITE,
        color: COLORS.TEXT_DARK,
        rowAltBg: COLORS.BG_SOFT,
        borderColor: COLORS.GRAY,
        borderWidth: 1,
        borderRadius: 10,
        tableData: [
          ['Age Group', 'Cases', 'Recovery %', 'Avg. Treatment Days'],
          ['18–39', '220', '95%', '3.2'],
          ['40–59', '310', '92%', '4.5'],
          ['60–79', '280', '88%', '5.8'],
          ['80+', '90', '83%', '6.4'],
        ],
      } as Element,
    ],
  };

  // 6. Research Highlights
  const highlightsSlide: Slide = {
    id: 'med-highlights',
    background: COLORS.BG_SOFT,
    createdAt,
    elements: [
      createTextElement('h-title', 'Research Highlights', 80, 60, 800, 32, {
        fontSize: 22,
        fontWeight: '600',
        color: COLORS.BLUE,
      }),
      ...[
        '30% reduction in average length of stay after protocol update.',
        'Improved 30-day readmission rates from 14% to 9.5%.',
        'Early risk stratification led to 2x faster ICU escalation when needed.',
        'Standardized discharge education improved medication adherence by 18%.',
      ].map((text, index) => {
        const baseY = 110 + index * 80;
        const id = `h-${index}`;
        return [
          createShape(id, 'rounded-rectangle', 80, baseY, 800, 60, {
            fill: COLORS.WHITE,
            stroke: 'rgba(0,0,0,0.03)',
            ...( {
              shadow: {
                color: 'rgba(15,23,42,0.05)',
                blur: 14,
                offsetX: 0,
                offsetY: 8,
              },
            } as any),
          }),
          createShape(`${id}-bar`, 'rectangle', 92, baseY + 20, 4, 20, {
            fill: index % 2 === 0 ? COLORS.BLUE : COLORS.GREEN,
            stroke: 'transparent',
          }),
          createTextElement(`${id}-text`, text, 110, baseY + 16, 750, 30, {
            fontSize: 14,
            color: COLORS.TEXT_MUTED,
          }),
        ] as Element[];
      }).flat(),
    ],
  };

  // 7. Case Distribution Pie Chart
  const teamSlide: Slide = {
    id: 'med-team',
    background: COLORS.WHITE,
    createdAt,
    elements: [
      createTextElement('tm-title', 'Case Distribution by Diagnosis', 80, 60, 800, 32, {
        fontSize: 22,
        fontWeight: '600',
        color: COLORS.BLUE,
      }),
      createShape('tm-card', 'rounded-rectangle', 120, 110, 720, 320, {
        fill: COLORS.WHITE,
        stroke: 'rgba(0,0,0,0.04)',
        ...( {
          shadow: {
            color: 'rgba(15,23,42,0.08)',
            blur: 20,
            offsetX: 0,
            offsetY: 12,
          },
        } as any),
      }),
      createChart(
        'tm-pie',
        'pie',
        150,
        140,
        320,
        260,
        {
          labels: ['STEMI', 'NSTEMI', 'Unstable Angina', 'Other Cardiac'],
          datasets: [
            {
              data: [28, 34, 22, 16],
              backgroundColor: [
                'rgba(0,122,255,0.9)',
                'rgba(52,199,89,0.9)',
                'rgba(0,122,255,0.55)',
                'rgba(229,229,234,0.9)',
              ],
              borderColor: COLORS.WHITE,
              borderWidth: 1,
            },
          ],
        },
      ),
      createTextElement(
        'tm-desc-title',
        'Interpretation',
        500,
        150,
        320,
        24,
        {
          fontSize: 16,
          fontWeight: '600',
        },
      ),
      createTextElement(
        'tm-desc-text',
        'NSTEMI represents the largest share of admissions (34%), followed by STEMI and unstable angina. "Other cardiac" cases include myocarditis, arrhythmias, and heart failure exacerbations. Resource planning should prioritize NSTEMI and STEMI pathways.',
        500,
        180,
        320,
        120,
        {
          fontSize: 13,
          color: COLORS.TEXT_MUTED,
        },
      ),
      createTextElement(
        'tm-desc-note',
        'Percentages are based on all ACS-related admissions in the reporting period.',
        500,
        310,
        320,
        40,
        {
          fontSize: 12,
          color: COLORS.TEXT_MUTED,
        },
      ),
    ],
  };

  // 8. Treatment / Project Timeline
  const timelineSlide: Slide = {
    id: 'med-timeline',
    background: COLORS.WHITE,
    createdAt,
    elements: [
      createTextElement('tl-title', 'Treatment Pathway', 80, 60, 800, 32, {
        fontSize: 22,
        fontWeight: '600',
        color: COLORS.BLUE,
      }),
      createShape('tl-line', 'rectangle', 120, 220, 720, 3, {
        fill: COLORS.GRAY,
        stroke: 'transparent',
      }),
      ...[
        'Diagnosis',
        'Assessment',
        'Treatment Cycle',
        'Monitoring',
        'Follow-up',
      ].flatMap((label, index) => {
        const step = 720 / 4;
        const cx = 120 + index * step;
        const id = `tl-node-${index}`;
        return [
          createShape(id, 'circle', cx - 10, 210, 20, 20, {
            fill: COLORS.WHITE,
            stroke: COLORS.BLUE,
            strokeWidth: 2,
          }),
          createShape(`${id}-progress`, 'rectangle', cx - 2, 233, 4, 20, {
            fill: COLORS.GREEN,
            stroke: 'transparent',
          }),
          createTextElement(`${id}-label`, label, cx - 70, 260, 140, 24, {
            fontSize: 12,
            textAlign: 'center',
            color: COLORS.TEXT_MUTED,
          }),
        ] as Element[];
      }),
    ],
  };

  // 9. Future Recommendations
  const recSlide: Slide = {
    id: 'med-recommendations',
    background: COLORS.BG_SOFT,
    createdAt,
    elements: [
      createTextElement('r-title', 'Future Recommendations', 80, 60, 800, 32, {
        fontSize: 22,
        fontWeight: '600',
        color: COLORS.BLUE,
      }),
      ...[
        'Expand nurse-led education clinics for high-risk patients.',
        'Scale early warning scores to all wards for deteriorating patients.',
        'Integrate real-time dashboards into daily multidisciplinary rounds.',
        'Establish quarterly audit cycles with outcome feedback to teams.',
      ].map((text, index) => {
        const baseY = 110 + index * 80;
        const id = `r-${index}`;
        return [
          createShape(id, 'rounded-rectangle', 80, baseY, 800, 60, {
            fill: COLORS.WHITE,
            stroke: 'rgba(0,0,0,0.03)',
            ...( {
              shadow: {
                color: 'rgba(15,23,42,0.05)',
                blur: 14,
                offsetX: 0,
                offsetY: 8,
              },
            } as any),
          }),
          createShape(`${id}-bar`, 'rectangle', 80, baseY + 10, 6, 40, {
            fill: index % 2 === 0 ? COLORS.GREEN : COLORS.BLUE,
            stroke: 'transparent',
          }),
          createTextElement(`${id}-text`, text, 100, baseY + 16, 760, 30, {
            fontSize: 14,
            color: COLORS.TEXT_MUTED,
          }),
        ] as Element[];
      }).flat(),
    ],
  };

  // 10. Closing Slide
  const closingSlide: Slide = {
    id: 'med-closing',
    background: COLORS.WHITE,
    createdAt,
    elements: [
      createShape('cl-card', 'rounded-rectangle', 200, 170, 560, 200, {
        fill: 'rgba(255,255,255,0.96)',
        stroke: 'rgba(0,0,0,0.03)',
        ...( {
          shadow: {
            color: 'rgba(15,23,42,0.10)',
            blur: 22,
            offsetX: 0,
            offsetY: 12,
          },
        } as any),
      }),
      createTextElement('cl-title', 'Thank You', 220, 190, 520, 40, {
        fontSize: 30,
        fontWeight: '600',
        color: COLORS.BLUE,
        textAlign: 'center',
      }),
      createTextElement(
        'cl-sub',
        'Department of Cardiology  •  Actalyst Medical Center',
        220,
        234,
        520,
        26,
        {
          fontSize: 14,
          color: COLORS.TEXT_MUTED,
          textAlign: 'center',
        },
      ),
      createTextElement(
        'cl-contact',
        'Contact: cardiology@actalystmedical.org  •  +1 (000) 000-0000',
        220,
        264,
        520,
        24,
        {
          fontSize: 12,
          color: COLORS.TEXT_MUTED,
          textAlign: 'center',
        },
      ),
      createShape('cl-line', 'rectangle', 320, 310, 240, 2, {
        fill: COLORS.BLUE,
        stroke: 'transparent',
      }),
    ],
  };

  return [
    titleSlide,
    overviewSlide,
    dataSlide,
    conditionSlide,
    statsSlide,
    highlightsSlide,
    teamSlide,
    timelineSlide,
    recSlide,
    closingSlide,
  ];
};

export default createMedicalClinicalTemplate;
