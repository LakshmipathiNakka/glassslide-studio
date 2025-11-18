import { Slide } from '@/types/slide-thumbnails';
import { Element } from '@/hooks/use-action-manager';
import createHealthcareMedicalTemplate from '@/templates/healthcareMedicalTemplate';
import createTechnologyInnovationTemplate from '@/templates/technologyInnovationTemplate';
import createSportsFitnessTemplate from '@/templates/sportsFitnessTemplate';
import createEventPortfolioTemplate from '@/templates/eventPortfolioTemplate';
import createFilmProductionTemplate from '@/templates/filmProductionTemplate';

export interface PresentationTheme {
  id: string;
  name: string;
  description: string;
  slides: Slide[];
  thumbnail?: string | null;
  palette?: Record<string, string>;
}

// Helpers
const W = 960, H = 540, M = 50;
const H1 = 48, H2 = 28, B1 = 20;
const nowId = (p: string) => `${p}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;


// Education & Learning Template Palette - Futuristic Theme
const educationLearningPalette = {
  primary: '#5E17EB',    // Indigo
  secondary: '#00F5A0',  // Mint
  accent: '#FF6EC7',     // Magenta
  background: '#6F42C1', // Vibrant Purple
  text: '#FFFFFF',      // White
  lightBlue: '#5E17EB20',
  lightYellow: '#00F5A020',
  lightCoral: '#FF6EC720',
  gray: '#CCCCCC',
  lightGray: '#FFFFFF20'
};

function createEducationLearningTemplate(): Slide[] {
  const now = Date.now();
  const slides: Slide[] = [];
  const { primary, secondary, accent, background, text, lightBlue, lightYellow, lightCoral, gray, lightGray } = educationLearningPalette;

  // 1. Title Slide with Futuristic Design
  slides.push({
    id: `edu-${now}-1`,
    elements: [
      // Glass card for content
      {
        id: `glass-card-${now}`,
        type: 'shape',
        x: 60,
        y: 80,
        width: 840,
        height: 380,
        shapeType: 'rounded-rectangle',
        fill: 'rgba(255, 255, 255, 0.1)',
        stroke: 'rgba(255, 255, 255, 0.15)',
        strokeWidth: 1,
        backdropFilter: 'blur(10px)',
        rx: 24,
        shadow: {
          color: 'rgba(0, 0, 0, 0.1)',
          blur: 20,
          offsetX: 0,
          offsetY: 10
        }
      },
      // Title with gradient text
      { 
        id: `title-${now}`, 
        type: 'text', 
        x: 100, 
        y: 150, 
        width: 760, 
        height: 100, 
        text: 'EDUCATION & LEARNING', 
        fontSize: 56, 
        fontWeight: 'bold', 
        fontFamily: 'Arial, sans-serif', 
        color: '#FFFFFF',
        textAlign: 'center',
        letterSpacing: 2
      },
      // Decorative accent line
      {
        id: `accent-line-${now}`,
        type: 'shape',
        x: 300,
        y: 220,
        width: 360,
        height: 4,
        shapeType: 'rectangle',
        fill: primary,
        shadow: true,
        shadowBlur: 10,
        shadowColor: accent
      },
      // Subtitle
      { 
        id: `subtitle-${now}`, 
        type: 'text', 
        x: 100, 
        y: 260, 
        width: 760, 
        height: 40, 
        text: 'FUTURE OF LEARNING', 
        fontSize: 24, 
        fontWeight: 'bold',
        fontFamily: 'Arial, sans-serif',
        color: '#FFFFFF',
        textAlign: 'center',
        letterSpacing: 1.5
      },
      // Presenter info
      { 
        id: `presenter-${now}`, 
        type: 'text', 
        x: 100, 
        y: 320, 
        width: 760, 
        height: 30, 
        text: 'Presented by: Instructor Name', 
        fontSize: 20, 
        fontFamily: 'Arial, sans-serif',
        color: '#FFFFFF',
        textAlign: 'center'
      },
      // Decorative elements
      {
        id: `decor-1-${now}`,
        type: 'shape',
        x: 100,
        y: 120,
        width: 20,
        height: 20,
        shapeType: 'circle',
        fill: 'transparent',
        stroke: accent,
        strokeWidth: 2,
        opacity: 0.7
      },
      {
        id: `decor-2-${now}`,
        type: 'shape',
        x: 840,
        y: 120,
        width: 20,
        height: 20,
        shapeType: 'circle',
        fill: 'transparent',
        stroke: secondary,
        strokeWidth: 2,
        opacity: 0.7
      }
    ],
    background: background,
    createdAt: new Date(),
    lastUpdated: Date.now()
  });

  // 3. Lesson Breakdown (Timeline)
  slides.push({
    id: `edu-${now}-3`,
    elements: [
      // Title
      { 
        id: `title-${now}-3`, 
        type: 'text', 
        x: 80, 
        y: 60, 
        width: 800, 
        height: 60, 
        text: 'Course Timeline', 
        fontSize: 40, 
        fontWeight: 'bold', 
        color: '#FFFFFF', // Changed to white for better visibility
        textAlign: 'left' 
      },
      // Timeline items
      {
        id: `timeline-${now}`,
        type: 'shape',
        x: 120,
        y: 150,
        width: 4,
        height: 300,
        shapeType: 'rectangle',
        fill: secondary
      },
      // Timeline dot 1
      {
        id: `dot1-${now}`,
        type: 'shape',
        x: 110,
        y: 150,
        width: 24,
        height: 24,
        shapeType: 'circle',
        fill: primary
      },
      // Timeline item 1
      { 
        id: `item1-${now}`, 
        type: 'text', 
        x: 160, 
        y: 145, 
        width: 700, 
        height: 30, 
        text: 'Week 1: Introduction to Course', 
        fontSize: 20, 
        fontWeight: 'bold',
        color: '#FFFFFF', // Changed to white for better visibility
        textAlign: 'left' 
      },
      { 
        id: `desc1-${now}`, 
        type: 'text', 
        x: 160, 
        y: 175, 
        width: 700, 
        height: 60, 
        text: 'Overview of key concepts and course objectives. Introduction to the learning platform and resources.', 
        fontSize: 16, 
        color: 'rgba(255, 255, 255, 0.8)', // Lighter white for secondary text
        textAlign: 'left',
        lineHeight: 1.4
      },
      // Timeline dot 2
      {
        id: `dot2-${now}`,
        type: 'shape',
        x: 110,
        y: 260,
        width: 24,
        height: 24,
        shapeType: 'circle',
        fill: primary
      },
      // Timeline item 2
      { 
        id: `item2-${now}`, 
        type: 'text', 
        x: 160, 
        y: 255, 
        width: 700, 
        height: 30, 
        text: 'Week 2-3: Core Concepts', 
        fontSize: 20, 
        fontWeight: 'bold',
        color: '#FFFFFF', // Changed to white for better visibility
        textAlign: 'left' 
      },
      { 
        id: `desc2-${now}`, 
        type: 'text', 
        x: 160, 
        y: 285, 
        width: 700, 
        height: 60, 
        text: 'Deep dive into fundamental principles and theories. Hands-on exercises and group discussions.', 
        fontSize: 16, 
        color: 'rgba(255, 255, 255, 0.8)', // Lighter white for secondary text
        textAlign: 'left',
        lineHeight: 1.4
      },
      // Timeline dot 3
      {
        id: `dot3-${now}`,
        type: 'shape',
        x: 110,
        y: 370,
        width: 24,
        height: 24,
        shapeType: 'circle',
        fill: accent
      },
      // Timeline item 3
      { 
        id: `item3-${now}`, 
        type: 'text', 
        x: 160, 
        y: 365, 
        width: 700, 
        height: 30, 
        text: 'Week 4-5: Advanced Topics', 
        fontSize: 20, 
        fontWeight: 'bold',
        color: '#FFFFFF', // Changed to white for better visibility
        textAlign: 'left' 
      },
      { 
        id: `desc3-${now}`, 
        type: 'text', 
        x: 160, 
        y: 395, 
        width: 700, 
        height: 60, 
        text: 'Exploring advanced concepts and real-world applications. Case studies and practical examples.', 
        fontSize: 16, 
        color: 'rgba(255, 255, 255, 0.8)', // Lighter white for secondary text
        textAlign: 'left',
        lineHeight: 1.4
      }
    ],
    background: background,
    createdAt: new Date(),
    lastUpdated: Date.now()
  });

  // 4. Concept Diagram
  slides.push({
    id: `edu-${now}-4`,
    elements: [
      // Title
      { 
        id: `title-${now}-4`, 
        type: 'text', 
        x: 80, 
        y: 60, 
        width: 800, 
        height: 60, 
        text: 'Key Concepts', 
        fontSize: 40, 
        fontWeight: 'bold', 
        color: '#FFFFFF', // Changed to white for better visibility
        textAlign: 'left' 
      },
      // Main glass card container
      {
        id: `glass-card-${now}-4`,
        type: 'shape',
        x: 80,
        y: 150,
        width: 800,
        height: 350,
        shapeType: 'rounded-rectangle',
        fill: 'rgba(255, 255, 255, 0.1)',
        stroke: 'rgba(255, 255, 255, 0.15)',
        strokeWidth: 1,
        rx: 24,
        shadow: {
          color: 'rgba(0, 0, 0, 0.1)',
          blur: 20,
          offsetX: 0,
          offsetY: 10
        }
      },
      // Main concept
      {
        id: `main-concept-${now}`,
        type: 'shape',
        x: 400,
        y: 180,
        width: 300,
        height: 120,
        shapeType: 'rounded-rectangle',
        fill: lightBlue,
        stroke: primary,
        strokeWidth: 1,
        rx: 12
      },
      {
        id: `main-concept-text-${now}`,
        type: 'text',
        x: 400,
        y: 220,
        width: 300,
        height: 40,
        text: 'Main Concept',
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        verticalAlign: 'middle'
      },
      // Connecting lines and sub-concepts
      {
        id: `line1-${now}`,
        type: 'line',
        x1: 550,
        y1: 300,
        x2: 550,
        y2: 350,
        stroke: 'rgba(255, 255, 255, 0.5)',
        strokeWidth: 2,
        strokeDasharray: '5,5'
      },
      // Sub-concept 1
      {
        id: `sub1-${now}`,
        type: 'shape',
        x: 350,
        y: 350,
        width: 200,
        height: 100,
        shapeType: 'rounded-rectangle',
        fill: lightYellow,
        stroke: secondary,
        strokeWidth: 1,
        rx: 12
      },
      {
        id: `sub1-text-${now}`,
        type: 'text',
        x: 350,
        y: 380,
        width: 200,
        height: 40,
        text: 'Sub-Concept 1',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        verticalAlign: 'middle'
      },
      // Sub-concept 2
      {
        id: `sub2-${now}`,
        type: 'shape',
        x: 600,
        y: 350,
        width: 200,
        height: 100,
        shapeType: 'rounded-rectangle',
        fill: lightCoral,
        stroke: accent,
        strokeWidth: 1,
        rx: 12
      },
      {
        id: `sub2-text-${now}`,
        type: 'text',
        x: 600,
        y: 380,
        width: 200,
        height: 40,
        text: 'Sub-Concept 2',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF', // Changed to white for better visibility
        textAlign: 'center',
        verticalAlign: 'middle'
      },
      // Legend
      {
        id: `legend-${now}`,
        type: 'text',
        x: 0,
        y: 0,
        width: 100,
        height: 20,
        text: 'Legend',
        fontSize: 12,
        color: '#FFFFFF' // Changed to white for better visibility
      }
    ],
    background: background,
    createdAt: new Date(),
    lastUpdated: Date.now()
  });

  // 5. Infographic Chart (Pie Chart) with Glass Card
  slides.push({
    id: `edu-${now}-5`,
    elements: [
      // Glass card container
      {
        id: `glass-card-${now}-5`,
        type: 'shape',
        x: 80,
        y: 100,
        width: 800,
        height: 380,
        shapeType: 'rounded-rectangle',
        fill: 'rgba(255, 255, 255, 0.1)',
        stroke: 'rgba(255, 255, 255, 0.15)',
        strokeWidth: 1,
        backdropFilter: 'blur(10px)',
        rx: 24,
        shadow: {
          color: 'rgba(0, 0, 0, 0.1)',
          blur: 20,
          offsetX: 0,
          offsetY: 10
        }
      },
      // Title
      {
        id: `title-${now}-5`,
        type: 'text',
        x: 120,
        y: 120,
        width: 400,
        height: 40,
        text: 'Learning Methods',
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'left'
      },
      // Divider
      {
        id: `divider-${now}-5`,
        type: 'shape',
        x: 120,
        y: 170,
        width: 100,
        height: 4,
        shapeType: 'rectangle',
        fill: secondary
      },
      // Pie Chart
      {
        id: `chart-${now}`,
        type: 'chart',
        x: 150,
        y: 200,
        width: 380,
        height: 240,
        chartType: 'pie',
        chartData: {
          labels: ['Lectures', 'Exercises', 'Group Work', 'Self-Study', 'Assessments'],
          datasets: [{
            data: [30, 25, 20, 15, 10],
            backgroundColor: [
              '#FF6EC7',  // Bright Pink
              '#00F5A0',  // Mint Green
              '#FFD166',  // Yellow
              '#06D6A0',  // Teal
              '#118AB2'   // Blue
            ],
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.5)',
            hoverBorderColor: '#FFFFFF',
            hoverOffset: 5
          }]
        }
      },
      // Description container
      {
        id: `desc-container-${now}`,
        type: 'shape',
        x: 580,
        y: 200,
        width: 260,
        height: 240,
        shapeType: 'rounded-rectangle',
        fill: 'rgba(255, 255, 255, 0.1)',
        stroke: 'rgba(255, 255, 255, 0.15)',
        strokeWidth: 1,
        backdropFilter: 'blur(5px)',
        rx: 16
      },
      // Description title
      {
        id: `desc-title-${now}`,
        type: 'text',
        x: 600,
        y: 220,
        width: 220,
        height: 30,
        text: 'Our Learning Approach',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'left'
      },
      // Description text
      {
        id: `desc-${now}-5`,
        type: 'text',
        x: 600,
        y: 260,
        width: 220,
        height: 160,
        text: 'Our learning approach combines various methods to ensure comprehensive understanding and skill development. The chart shows the distribution of different learning methods used in our program.',
        fontSize: 14,
        color: '#FFFFFF',
        lineHeight: 1.6
      },
      // Source (positioned outside the glass card)
      {
        id: `source-${now}`,
        type: 'text',
        x: 100,
        y: 500,
        width: 300,
        height: 20,
        text: 'Source: Education Research Institute, 2023',
        fontSize: 11,
        fontStyle: 'italic',
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'left'
      }
    ],
    background: background,
    createdAt: new Date(),
    lastUpdated: Date.now()
  });

  // 6. Key Points / Notes (Cards)
  slides.push({
    id: `edu-${now}-6`,
    elements: [
      // Title
      { 
        id: `title-${now}-6`, 
        type: 'text', 
        x: 80, 
        y: 60, 
        width: 800, 
        height: 60, 
        text: 'Key Points & Notes', 
        fontSize: 40, 
        fontWeight: 'bold', 
        color: '#FFFFFF', // Changed to white for better visibility
        textAlign: 'left' 
      },
      // Card 1 with glass effect
      {
        id: `card1-${now}`,
        type: 'shape',
        x: 100,
        y: 150,
        width: 350,
        height: 180,
        shapeType: 'rounded-rectangle',
        fill: 'rgba(255, 255, 255, 0.1)',
        stroke: 'rgba(255, 255, 255, 0.15)',
        strokeWidth: 1,
        backdropFilter: 'blur(10px)',
        rx: 24,
        shadow: {
          color: 'rgba(0, 0, 0, 0.1)',
          blur: 20,
          offsetX: 0,
          offsetY: 10
        }
      },
      {
        id: `card1-title-${now}`,
        type: 'text',
        x: 120,
        y: 170,
        width: 310,
        height: 30,
        text: 'Important Concept #1',
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF' // Changed to white for better visibility
      },
      {
        id: `card1-content-${now}`,
        type: 'text',
        x: 120,
        y: 210,
        width: 310,
        height: 100,
        text: 'This is a key concept that students should focus on. It forms the foundation for more advanced topics later in the course.',
        fontSize: 14,
        color: '#FFFFFF', // Changed to white for better visibility
        lineHeight: 1.5
      },
      // Card 2 with glass effect
      {
        id: `card2-${now}`,
        type: 'shape',
        x: 500,
        y: 150,
        width: 350,
        height: 180,
        shapeType: 'rounded-rectangle',
        fill: 'rgba(255, 255, 255, 0.1)',
        stroke: 'rgba(255, 255, 255, 0.15)',
        strokeWidth: 1,
        backdropFilter: 'blur(10px)',
        rx: 24,
        shadow: {
          color: 'rgba(0, 0, 0, 0.1)',
          blur: 20,
          offsetX: 0,
          offsetY: 10
        }
      },
      {
        id: `card2-title-${now}`,
        type: 'text',
        x: 520,
        y: 170,
        width: 310,
        height: 30,
        text: 'Important Concept #2',
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF' // Changed to white for better visibility
      },
      {
        id: `card2-content-${now}`,
        type: 'text',
        x: 520,
        y: 210,
        width: 310,
        height: 100,
        text: 'Another crucial concept that ties into the first one. Understanding this will help with the final project and assessments.',
        fontSize: 14,
        color: '#FFFFFF', // Changed to white for better visibility
        lineHeight: 1.5
      },
      // Card 3 with glass effect
      {
        id: `card3-${now}`,
        type: 'shape',
        x: 100,
        y: 350,
        width: 350,
        height: 120,
        shapeType: 'rounded-rectangle',
        fill: 'rgba(255, 255, 255, 0.1)',
        stroke: 'rgba(255, 255, 255, 0.15)',
        strokeWidth: 1,
        backdropFilter: 'blur(10px)',
        rx: 24,
        shadow: {
          color: 'rgba(0, 0, 0, 0.1)',
          blur: 20,
          offsetX: 0,
          offsetY: 10
        }
      },
      {
        id: `card3-title-${now}`,
        type: 'text',
        x: 120,
        y: 370,
        width: 310,
        height: 30,
        text: 'Reminder',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF' // Changed to white for better visibility
      },
      {
        id: `card3-content-${now}`,
        type: 'text',
        x: 120,
        y: 400,
        width: 310,
        height: 50,
        text: 'Complete the reading before the next class. Quiz on these concepts next week!',
        fontSize: 14,
        color: '#FFFFFF', // Changed to white for better visibility
        lineHeight: 1.4
      },
      // Card 4 with glass effect
      {
        id: `card4-${now}`,
        type: 'shape',
        x: 500,
        y: 350,
        width: 350,
        height: 120,
        shapeType: 'rounded-rectangle',
        fill: 'rgba(255, 255, 255, 0.1)',
        stroke: 'rgba(255, 255, 255, 0.15)',
        strokeWidth: 1,
        backdropFilter: 'blur(10px)',
        rx: 24,
        shadow: {
          color: 'rgba(0, 0, 0, 0.1)',
          blur: 20,
          offsetX: 0,
          offsetY: 10
        }
      },
      {
        id: `card4-title-${now}`,
        type: 'text',
        x: 520,
        y: 370,
        width: 310,
        height: 30,
        text: 'Additional Resources',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF' // Changed to white for better visibility
      },
      {
        id: `card4-content-${now}`,
        type: 'text',
        x: 520,
        y: 400,
        width: 310,
        height: 50,
        text: '• Chapter 3 in textbook\n• Online module 2.1-2.3\n• Video lecture #5',
        fontSize: 14,
        color: '#FFFFFF', // Changed to white for better visibility
        lineHeight: 1.6
      }
    ],
    background: background,
    createdAt: new Date(),
    lastUpdated: Date.now()
  });

  // 7. Quote Slide
  slides.push({
    id: `edu-${now}-7`,
    elements: [
      // Quote container with glass card effect
      {
        id: `quote-container-${now}`,
        type: 'shape',
        x: 80,
        y: 120,
        width: 800,
        height: 300,
        shapeType: 'rounded-rectangle',
        fill: 'rgba(255, 255, 255, 0.1)',
        stroke: 'rgba(255, 255, 255, 0.15)',
        strokeWidth: 1,
        backdropFilter: 'blur(10px)',
        rx: 24,
        shadow: {
          color: 'rgba(0, 0, 0, 0.1)',
          blur: 20,
          offsetX: 0,
          offsetY: 10
        }
      },
      // Quote text
      {
        id: `quote-text-${now}`,
        type: 'text',
        x: 150,
        y: 200,
        width: 660,
        height: 120,
        text: '\"Education is the most powerful weapon which you can use to change the world.\"',
        fontSize: 32,
        fontStyle: 'italic',
        color: '#FFFFFF', // Changed to white for better visibility
        lineHeight: 1.5,
        textAlign: 'center'
      },
      // Quote author
      {
        id: `quote-author-${now}`,
        type: 'text',
        x: 480,
        y: 340,
        width: 400,
        height: 40,
        text: '— Nelson Mandela',
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF', // Changed to white for better visibility
        textAlign: 'right'
      },
      // Title
      { 
        id: `title-${now}-7`, 
        type: 'text', 
        x: 80, 
        y: 60, 
        width: 800, 
        height: 50, 
        text: 'Inspiration Corner', 
        fontSize: 32, 
        fontWeight: 'bold', 
        color: '#FFFFFF', // Changed to white for better visibility
        textAlign: 'left' 
      },
      // Decorative elements
      {
        id: `dec1-${now}`,
        type: 'shape',
        x: 30,
        y: 30,
        width: 60,
        height: 60,
        shapeType: 'circle',
        fill: secondary,
        opacity: 0.3
      },
      {
        id: `dec2-${now}`,
        type: 'shape',
        x: 400,
        y: 450,
        width: 80,
        height: 80,
        shapeType: 'circle',
        fill: accent,
        opacity: 0.2
      }
    ],
    background: background,
    createdAt: new Date(),
    lastUpdated: Date.now()
  });

  // 8. Comparison Table
  slides.push({
    id: `edu-${now}-8`,
    elements: [
      // Title
      { 
        id: `title-${now}-8`, 
        type: 'text', 
        x: 80, 
        y: 60, 
        width: 800, 
        height: 60, 
        text: 'Concept Comparison', 
        fontSize: 40, 
        fontWeight: 'bold', 
        color: '#FFFFFF', // Changed to white for better visibility
        textAlign: 'left' 
      },
      // Table element
      {
        id: `table-${now}`,
        type: 'table',
        x: 80,
        y: 150,
        width: 800,
        height: 300,
        rows: 4,
        cols: 3,
        header: true,
        headerBg: '#4B0082', // Royal Purple
        headerTextColor: '#FFFFFF',
        cellPadding: 12,
        cellTextAlign: 'center',
        backgroundColor: '#F5F0FF', // Light Lavender
        color: '#2D0A4D', // Dark Purple
        headerFontSize: 14,
        headerFontWeight: 'bold',
        rowAltBg: '#E6D6FF', // Lighter Lavender
        borderColor: '#D1C4E9', // Light Purple
        borderWidth: 1,
        borderRadius: 8,
        tableData: [
          ['Feature', 'Concept A', 'Concept B'],
          ['Definition', 'Traditional Learning', 'Modern Learning'],
          ['Focus', 'Content Delivery', 'Student Engagement'],
          ['Outcome', 'Knowledge Retention', 'Skill Application']
        ],
shadow: {
          color: 'rgba(75, 0, 130, 0.2)',
          blur: 12,
          offsetX: 0,
          offsetY: 4
        }
      },
      // Footer note
      {
        id: `table-note-${now}`,
        type: 'text',
        x: 80,
        y: 460,
        width: 800,
        height: 30,
        text: 'Use this table to compare and contrast key concepts for better understanding',
        fontSize: 12,
        fontStyle: 'italic',
        color: 'rgba(255, 255, 255, 0.8)', // Lighter white for secondary text
        textAlign: 'center'
      }
    ],
    background: background,
    createdAt: new Date(),
    lastUpdated: Date.now()
  });

  // 9. Quiz / Summary
  slides.push({
    id: `edu-${now}-9`,
    elements: [
      // Glass card for content
      {
        id: `glass-card-${now}-2`,
        type: 'shape',
        x: 60,
        y: 80,
        width: 840,
        height: 420,
        shapeType: 'rounded-rectangle',
        fill: 'rgba(255, 255, 255, 0.1)',
        stroke: 'rgba(255, 255, 255, 0.15)',
        strokeWidth: 1,
        backdropFilter: 'blur(10px)',
        rx: 24,
        shadow: {
          color: 'rgba(0, 0, 0, 0.1)',
          blur: 20,
          offsetX: 0,
          offsetY: 10
        }
      },
      // Title
      { 
        id: `title-${now}-9`, 
        type: 'text', 
        x: 120, 
        y: 90, 
        width: 720, 
        height: 60, 
        text: 'Quick Quiz', 
        fontSize: 36, 
        fontWeight: 'bold', 
        color: '#FFFFFF', // Changed to white for better visibility
        textAlign: 'center' 
      },
      // Divider
      {
        id: `divider-${now}-9`,
        type: 'shape',
        x: 400,
        y: 180,
        width: 160,
        height: 4,
        shapeType: 'rectangle',
        fill: secondary
      },
      // Question
      {
        id: `question-${now}`,
        type: 'text',
        x: 120,
        y: 210,
        width: 720,
        height: 60,
        text: 'What is the main purpose of this course?',
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF', // Changed to white for better visibility
        textAlign: 'center'
      },
      // Options container with glass effect
      {
        id: `options-container-${now}`,
        type: 'shape',
        x: 150,
        y: 270,
        width: 660,
        height: 120,
        shapeType: 'rounded-rectangle',
        fill: 'rgba(255, 255, 255, 0.1)',
        stroke: 'rgba(255, 255, 255, 0.15)',
        strokeWidth: 1,
        rx: 12,
        ry: 12,
        backdropFilter: 'blur(5px)'
      },
      // Option A
      {
        id: `option-a-${now}`,
        type: 'shape',
        x: 170,
        y: 300,
        width: 300,
        height: 40,
        shapeType: 'rectangle',
        fill: lightBlue,
        stroke: 'rgba(255, 255, 255, 0.15)',
        strokeWidth: 1,
        rx: 20,
        ry: 20,
        opacity: 0.7,
        hover: {
          fill: lightBlue,
          opacity: 1
        }
      },
      {
        id: `option-a-text-${now}`,
        type: 'text',
        x: 190,
        y: 310,
        width: 260,
        height: 20,
        text: 'A. To learn basic concepts',
        fontSize: 16,
        color: '#FFFFFF', // Changed to white for better visibility
        textAlign: 'left'
      },
      // Option B
      {
        id: `option-b-${now}`,
        type: 'shape',
        x: 490,
        y: 300,
        width: 300,
        height: 40,
        shapeType: 'rectangle',
        fill: lightYellow,
        stroke: 'rgba(255, 255, 255, 0.15)',
        strokeWidth: 1,
        rx: 20,
        ry: 20,
        opacity: 0.7,
        hover: {
          fill: lightYellow,
          opacity: 1
        }
      },
      {
        id: `option-b-text-${now}`,
        type: 'text',
        x: 510,
        y: 310,
        width: 260,
        height: 20,
        text: 'B. To develop practical skills',
        fontSize: 16,
        color: '#FFFFFF', // Changed to white for better visibility
        textAlign: 'left'
      },
      // Option C
      {
        id: `option-c-${now}`,
        type: 'shape',
        x: 170,
        y: 350,
        width: 300,
        height: 40,
        shapeType: 'rectangle',
        fill: lightCoral,
        stroke: 'rgba(255, 255, 255, 0.15)',
        strokeWidth: 1,
        rx: 20,
        ry: 20,
        opacity: 0.7,
        hover: {
          fill: lightCoral,
          opacity: 1
        }
      },
      {
        id: `option-c-text-${now}`,
        type: 'text',
        x: 190,
        y: 360,
        width: 260,
        height: 20,
        text: 'C. To pass the final exam',
        fontSize: 16,
        color: '#FFFFFF', // Changed to white for better visibility
        textAlign: 'left'
      },
      // Option D
      {
        id: `option-d-${now}`,
        type: 'shape',
        x: 490,
        y: 350,
        width: 300,
        height: 40,
        shapeType: 'rectangle',
        fill: lightGray,
        stroke: 'rgba(255, 255, 255, 0.15)',
        strokeWidth: 1,
        rx: 20,
        ry: 20,
        opacity: 0.7,
        hover: {
          fill: lightGray,
          opacity: 1
        }
      },
      {
        id: `option-d-text-${now}`,
        type: 'text',
        x: 510,
        y: 360,
        width: 260,
        height: 20,
        text: 'D. All of the above',
        fontSize: 16,
        color: '#FFFFFF', // Changed to white for better visibility
        textAlign: 'left'
      },
      // Submit button
      {
        id: `submit-btn-${now}`,
        type: 'shape',
        x: 380,
        y: 400,
        width: 200,
        height: 50,
        shapeType: 'rectangle',
        fill: secondary,
        stroke: 'rgba(255, 255, 255, 0.15)',
        strokeWidth: 1,
        rx: 25,
        ry: 25,
        shadow: {
          color: 'rgba(0, 0, 0, 0.2)',
          blur: 8,
          offsetX: 0,
          offsetY: 4
        }
      },
      {
        id: `submit-text-${now}`,
        type: 'text',
        x: 380,
        y: 412,
        width: 200,
        height: 24,
        text: 'SUBMIT ANSWER',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Arial, sans-serif',
        color: 'white',
        textAlign: 'center',
        letterSpacing: 0.5
      },
      // Note
      {
        id: `note-${now}`,
        type: 'text',
        x: 120,
        y: 470,
        width: 720,
        height: 20,
        text: 'This is an interactive quiz. Select your answer and click submit.',
        fontSize: 14,
        fontStyle: 'italic',
        color: 'white',
        textAlign: 'center',
        opacity: 0.8
      }
    ],
    background: background,
    createdAt: new Date(),
    lastUpdated: Date.now()
  });

  // 10. Closing Slide (Let's Recap)
  slides.push({
    id: `edu-${now}-10`,
    elements: [
      // Glass card for content
      {
        id: `glass-card-${now}-10`,
        type: 'shape',
        x: 60,
        y: 80,
        width: 840,
        height: 380,
        shapeType: 'rounded-rectangle',
        fill: 'rgba(255, 255, 255, 0.1)',
        stroke: 'rgba(255, 255, 255, 0.15)',
        strokeWidth: 1,
        backdropFilter: 'blur(10px)',
        rx: 24,
        shadow: {
          color: 'rgba(0, 0, 0, 0.1)',
          blur: 20,
          offsetX: 0,
          offsetY: 10
        }
      },
      // Title with gradient text
      { 
        id: `title-${now}-10`, 
        type: 'text', 
        x: 100, 
        y: 150, 
        width: 760, 
        height: 100, 
        text: 'LET\'S RECAP!', 
        fontSize: 56, 
        fontWeight: 'bold', 
        fontFamily: 'Arial, sans-serif', 
        color: '#FFFFFF',
        textAlign: 'center',
        letterSpacing: 2
      },
      // Decorative accent line
      {
        id: `accent-line-${now}-10`,
        type: 'shape',
        x: 300,
        y: 220,
        width: 360,
        height: 4,
        shapeType: 'rectangle',
        fill: primary,
        shadow: true,
        shadowBlur: 10,
        shadowColor: accent
      },
      // Key points
      {
        id: `point1-${now}`,
        type: 'text',
        x: 150,
        y: 260,
        width: 700,
        height: 30,
        text: '✓  We\'ve covered the fundamental concepts',
        fontSize: 22,
        color: '#FFFFFF',
        textAlign: 'left',
        fontFamily: 'Arial, sans-serif'
      },
      {
        id: `point2-${now}`,
        type: 'text',
        x: 150,
        y: 300,
        width: 700,
        height: 30,
        text: '✓  Explored practical applications',
        fontSize: 22,
        color: '#FFFFFF',
        textAlign: 'left',
        fontFamily: 'Arial, sans-serif'
      },
      {
        id: `point3-${now}`,
        type: 'text',
        x: 150,
        y: 340,
        width: 700,
        height: 30,
        text: '✓  Reviewed key examples and case studies',
        fontSize: 22,
        color: '#FFFFFF',
        textAlign: 'left',
        fontFamily: 'Arial, sans-serif'
      },
      {
        id: `point4-${now}`,
        type: 'text',
        x: 150,
        y: 380,
        width: 700,
        height: 30,
        text: '✓  Prepared for the next steps in your learning journey',
        fontSize: 22,
        color: '#FFFFFF',
        textAlign: 'left',
        fontFamily: 'Arial, sans-serif'
      },
      // Call to action (moved outside the glass card)
      {
        id: `cta-${now}-10`,
        type: 'text',
        x: 80,
        y: 480,
        width: 800,
        height: 40,
        text: 'KEEP LEARNING AND EXPLORING!',
        fontSize: 24,
        fontWeight: 'bold',
        color: secondary,
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
        letterSpacing: 1,
        opacity: 1,
        shadow: true,
        shadowColor: 'rgba(0, 0, 0, 0.3)',
        shadowBlur: 4,
        shadowOffsetX: 0,
        shadowOffsetY: 2
      },
      // Instructor signature
      {
        id: `signature-${now}`,
        type: 'text',
        x: 600,
        y: 480,
        width: 300,
        height: 30,
        text: '— Your Instructor',
        fontSize: 16,
        fontStyle: 'italic',
        fontFamily: 'Arial, sans-serif',
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'right'
      },
      // Removed decorative circle elements
    ],
    background: background,
    createdAt: new Date(),
    lastUpdated: Date.now()
  });

  return slides;
}

// Cinematic Event & Portfolio palette
const eventPortfolioPalette = {
  deepBlack: '#1B1B1B',
  purpleStart: '#8E2DE2',
  purpleEnd: '#4A00E0',
  softWhite: '#F5F5F5',
};

const filmProductionPalette = {
  cinematicBlack: '#0D0D0D',
  cinematicGold: '#D4AF37',
  deepCrimson: '#7B0000',
  softSilver: '#E5E5E5',
};

export const presentationThemes: PresentationTheme[] = [
  {
    id: 'education-learning',
    name: 'Education & Learning',
    description: 'Bright, approachable template for educational content with interactive elements (10 slides).',
    slides: createEducationLearningTemplate(),
    palette: educationLearningPalette,
    thumbnail: null,
  },
  {
    id: 'event-portfolio-cinematic',
    name: 'Event & Portfolio – Cinematic Glass',
    description:
      'Modern, glossy cinematic deck for events and portfolios with glassmorphism panels, real-photo backdrops, and gradient overlays (10 slides).',
    slides: createEventPortfolioTemplate(),
    palette: eventPortfolioPalette,
    thumbnail: null,
  },
  {
    id: 'film-production-cinematic',
    name: 'Film Production – Cinematic Studio',
    description:
      'High-end cinematic film production deck with glassmorphism panels, BTS photography, production schedules, and storyboard layouts (10 slides).',
    slides: createFilmProductionTemplate(),
    palette: filmProductionPalette,
    thumbnail: null,
  },
  {
    id: 'healthcare-medical',
    name: 'Healthcare & Medical',
    description: 'Clinical-grade healthcare template with patient statistics, treatment roadmap, and research highlights (10 slides).',
    slides: createHealthcareMedicalTemplate(),
    palette: {
      green: '#C4E538',
      aqua: '#12CBC4',
      cream: '#F8EFBA',
      blue: '#1B9CFC',
      slate: '#222F3E',
    },
    thumbnail: null,
  },
  {
    id: 'technology-innovation',
    name: 'Technology & Innovation',
    description: 'Dark-mode, neon-accented technology & innovation deck with architecture, performance charts, roadmap, and pricing (10 slides).',
    slides: createTechnologyInnovationTemplate(),
    palette: {
      background: '#0D1117',
      neonCyan: '#00FFFF',
      neonGreen: '#39FF14',
      white: '#FFFFFF',
    },
    thumbnail: null,
  },
  {
    id: 'sports-fitness',
    name: 'Sports & Fitness',
    description: 'High-energy, motion-driven sports & fitness deck with real photography, stats, analysis, and tactical layouts (10 slides).',
    slides: createSportsFitnessTemplate(),
    palette: {
      red: '#FF3B30',
      background: '#1C1C1E',
      orange: '#FF9500',
      gray: '#F2F2F7',
      white: '#FFFFFF',
    },
    thumbnail: null,
  },
];

export default presentationThemes;
