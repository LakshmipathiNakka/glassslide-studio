import { Slide } from '@/types/slide-thumbnails';
import { Element } from '@/hooks/use-action-manager';

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

// Theme 1: Modern Corporate (10 slides)
const corporatePalette = {
  primary: '#1F3A93',
  secondary: '#F0F4FF',
  accent: '#FF6B6B',
  neutral: '#F8F9FA',
  dark: '#0F172A',
};

function createModernCorporate(): Slide[] {
  const now = Date.now();
  const slides: Slide[] = [];

  // 1. Title
  slides.push({
    id: `corp-${now}-1`,
    elements: [
      { id: nowId('glass'), type: 'shape', x: M, y: 160, width: W-2*M, height: 180, shapeType: 'rounded-rectangle', fill: 'rgba(255,255,255,0.10)', stroke: 'rgba(255,255,255,0.25)', strokeWidth: 1 } as Element,
      { id: nowId('title'), type: 'text', x: M+20, y: 175, width: W-2*M-40, height: 80, text: 'Modern Corporate Deck', fontSize: 64, fontWeight: 'bold', fontFamily: 'SF Pro Display, Inter, sans-serif', color: '#FFFFFF', textAlign: 'left', letterSpacing: 0.2 } as Element,
      { id: nowId('subtitle'), type: 'text', x: M+20, y: 245, width: W-2*M-40, height: 40, text: 'Professional. Consistent. Editable.', fontSize: H2, fontFamily: 'SF Pro Text, Inter, sans-serif', color: 'rgba(255,255,255,0.85)', textAlign: 'left' } as Element,
    ],
    background: `radial-gradient(1200px 700px at 60% 30%, ${corporatePalette.secondary}, ${corporatePalette.dark})`,
    createdAt: new Date(), lastUpdated: Date.now(),
  });

  // 2. Agenda (Table)
  slides.push({
    id: `corp-${now}-2`,
    elements: [
      { id: nowId('bar'), type: 'shape', x: M, y: M, width: 6, height: 50, fill: corporatePalette.primary } as Element,
      { id: nowId('title'), type: 'text', x: M+18, y: M, width: W-2*M, height: 50, text: 'Agenda', fontSize: H1, fontWeight: '600', color: '#0F172A' } as Element,
      { id: nowId('table'), type: 'table', x: M, y: 120, width: W-2*M, height: 320, rows: 6, cols: 2, tableData: [
        ['Section','Details'], ['Overview','Company intro and mission'], ['Market','Trends and TAM/SAM/SOM'], ['Strategy','Roadmap and GTM'], ['Financials','Revenue & projections'], ['Next Steps','Milestones and timeline']
      ], themeId: 'keynote1', borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', color: '#111827', header: true, headerBg: corporatePalette.secondary, headerTextColor: '#0F172A', rowAltBg: '#FAFAFA', cellPadding: 12, cellTextAlign: 'left' } as Element,
    ],
    background: corporatePalette.neutral, createdAt: new Date(), lastUpdated: Date.now(),
  });

  // 3. Overview (image + text)
  slides.push({
    id: `corp-${now}-3`,
    elements: [
      { id: nowId('title'), type: 'text', x: M, y: M, width: W-2*M, height: 50, text: 'Company Overview', fontSize: H1, fontWeight: 'bold', color: '#0F172A', letterSpacing: 0.2 } as Element,
      { id: nowId('image'), type: 'shape', x: M, y: 140, width: 360, height: 240, shapeType: 'rounded-rectangle', fill: 'linear-gradient(180deg,#FFFFFF,#EEF2FF)', stroke: '#CBD5E1', strokeWidth: 1 } as Element,
      { id: nowId('body'), type: 'text', x: M+380, y: 140, width: W-M-380, height: 240, text: 'Mission\nEmpower teams to communicate with clarity and elegance.\n\nVision\nDeliver world-class presentation tooling for everyone.', fontSize: B1, color: '#334155', lineHeight: 1.5, textAlign: 'left', verticalAlign: 'top' } as Element,
    ], background: `linear-gradient(180deg,#FFFFFF,${corporatePalette.secondary})`, createdAt: new Date(), lastUpdated: Date.now(),
  });

  // 4. Market (Line chart)
  slides.push({
    id: `corp-${now}-4`,
    elements: [
      { id: nowId('title'), type: 'text', x: M, y: M, width: W-2*M, height: 50, text: 'Market Growth', fontSize: H1, fontWeight: 'bold', color: '#0F172A' } as Element,
      { id: nowId('chart'), type: 'chart', x: M, y: 120, width: W-2*M, height: 320, chartType: 'line', chartData: {
        title: 'CAGR', labels: ['2019','2020','2021','2022','2023','2024','2025'], datasets: [
          { label: 'Market %', data: [10,13,17,23,30,36,42], borderColor: corporatePalette.primary, backgroundColor: '#E6EEFF', tension: 0.35, fill: true },
          { label: 'Industry %', data: [8,10,12,16,20,24,28], borderColor: '#38BDF8', backgroundColor: '#E8F8FF', tension: 0.35, fill: true },
        ]
      } } as Element,
    ], background: '#FFFFFF', createdAt: new Date(), lastUpdated: Date.now(),
  });

  // 5. Comparison Table
  slides.push({ id: `corp-${now}-5`, elements: [
    { id: nowId('title'), type: 'text', x: M, y: M, width: W-2*M, height: 50, text: 'Feature Comparison', fontSize: H1, fontWeight: 'bold', color: '#0F172A' } as Element,
    { id: nowId('table'), type: 'table', x: M, y: 120, width: W-2*M, height: 320, rows: 5, cols: 4, tableData: [
      ['Capability','Our Suite','Competitor A','Competitor B'], ['Analytics','Advanced','Moderate','Basic'], ['Collaboration','Real-time','Limited','Email'], ['Export','PPTX, PDF, PNG','PDF','PPTX'], ['TCO (3yr)','$','$$$','$$']
    ], themeId: 'keynote1', header: true, headerBg: corporatePalette.secondary, headerTextColor: '#0F172A', borderWidth: 1, borderColor: '#E5E7EB', cellPadding: 12, rowAltBg: '#FAFAFA', cellTextAlign: 'left' } as Element,
  ], background: '#FFFFFF', createdAt: new Date(), lastUpdated: Date.now() });

  // 6. Quote
  slides.push({ id: `corp-${now}-6`, elements: [
    { id: nowId('glass'), type: 'shape', x: M, y: 160, width: W-2*M, height: 220, shapeType: 'rounded-rectangle', fill: 'rgba(255,255,255,0.75)', stroke: '#E5E7EB', strokeWidth: 1 } as Element,
    { id: nowId('quote'), type: 'text', x: M+24, y: 180, width: W-2*M-48, height: 180, text: '“Clarity in design drives clarity in decisions.”', fontSize: 40, fontWeight: 'bold', color: '#0F172A', textAlign: 'center', lineHeight: 1.3 } as Element,
], background: `radial-gradient(900px 520px at 30% 20%, ${corporatePalette.primary}22, ${corporatePalette.secondary})`, createdAt: new Date(), lastUpdated: Date.now() });

  // 7. Timeline (shapes)
  slides.push({ id: `corp-${now}-7`, elements: [
    { id: nowId('title'), type: 'text', x: M, y: M, width: W-2*M, height: 50, text: 'Roadmap 2025', fontSize: H1, fontWeight: 'bold', color: '#0F172A' } as Element,
    { id: nowId('line'), type: 'shape', x: M+20, y: 280, width: W-(M+20)-M, height: 6, shapeType: 'rounded-rectangle', fill: corporatePalette.primary } as Element,
    ...[0,1,2,3].map((i) => ({ id: nowId(`dot${i}`), type: 'shape', x: M+60+i*220, y: 270, width: 26, height: 26, shapeType: 'circle', fill: corporatePalette.primary, stroke: '#FFFFFF', strokeWidth: 3 }) as Element),
    ...['Q1 Launch','Q2 Partnerships','Q3 Scale','Q4 Optimize'].map((label,i)=>({ id: nowId(`lbl${i}`), type:'text', x: M+30+i*220, y: 310, width:120, height:60, text: label, fontSize: 16, fontWeight: '600', color: '#1F2937', textAlign: 'center' }) as Element),
  ], background: corporatePalette.neutral, createdAt: new Date(), lastUpdated: Date.now() });

  // 8. Gallery (3 images)
  slides.push({ id: `corp-${now}-8`, elements: [
    { id: nowId('title'), type: 'text', x: M, y: M, width: W-2*M, height: 50, text: 'Showcase', fontSize: H1, fontWeight: 'bold', color: '#0F172A' } as Element,
    ...[0,1,2].map((i)=>({ id: nowId(`card${i}`), type:'shape', x: M+i*((W-2*M-40)/3+20), y: 130, width: (W-2*M-40)/3, height: 300, shapeType:'rounded-rectangle', fill:'linear-gradient(180deg,#FFFFFF,#F3F4F6)', stroke:'#E5E7EB', strokeWidth:1 }) as Element),
    ...[0,1,2].map((i)=>({ id: nowId(`img${i}`), type:'shape', x: M+12+i*((W-2*M-40)/3+20), y: 142, width:(W-2*M-40)/3-24, height:220, shapeType:'rounded-rectangle', fill:'linear-gradient(180deg,#FFFFFF,#F3F4F6)', stroke:'#CBD5E1', strokeWidth:1 }) as Element),
    ...[0,1,2].map((i)=>({ id: nowId(`cap${i}`), type:'text', x: M+i*((W-2*M-40)/3+20), y: 360, width:(W-2*M-40)/3, height:40, text:'Add caption', fontSize:16, color:'#4B5563', textAlign:'center' }) as Element),
  ], background: '#FFFFFF', createdAt: new Date(), lastUpdated: Date.now() });

  // 9. Key Metrics (cards + compact bar)
  slides.push({ id: `corp-${now}-9`, elements: [
    { id: nowId('title'), type:'text', x:M, y:M, width:W-2*M, height:50, text:'Key Metrics', fontSize:H1, fontWeight:'bold', color:'#FFFFFF', letterSpacing:0.2 } as Element,
    ...([['ARR','$12.4M'],['NPS','68'],['Retention','92%'],['CAC Payback','8 mo']]
      .map((pair,i)=>({ id: nowId(`card${i}`), type:'shape', x: M+i*((W-2*M-45)/4+15), y: 140, width:(W-2*M-45)/4, height:180, shapeType:'rounded-rectangle', fill:'rgba(255,255,255,0.08)', stroke:'rgba(255,255,255,0.25)', strokeWidth:1 }) as Element)
    ),
    ...([['ARR','$12.4M'],['NPS','68'],['Retention','92%'],['CAC Payback','8 mo']]
      .map((pair,i)=>({ id: nowId(`text${i}`), type:'text', x: M+i*((W-2*M-45)/4+15)+16, y: 156, width:(W-2*M-45)/4-32, height:148, text: `${pair[0]}\n${pair[1]}`, fontSize:24, fontWeight:'bold', color:'#FFFFFF', lineHeight:1.4 }) as Element)
    ),
    { id: nowId('chart'), type:'chart', chartType:'bar', x:M, y: 340, width: W-2*M, height: 150, chartData: {
      title:'Quarterly Snapshot', labels:['Q1','Q2','Q3','Q4'], datasets:[
        { label:'Revenue ($M)', data:[3.2,3.8,5.1,6.3], backgroundColor:'#FFCC00', borderColor:'#FFB300', borderRadius:6 },
        { label:'Cost ($M)', data:[1.6,2.1,2.4,2.9], backgroundColor:'#5AC8FA', borderColor:'#0CA6E9', borderRadius:6 },
      ]
    } } as Element,
  ], background:`linear-gradient(160deg,#0f172a,${corporatePalette.primary})`, createdAt:new Date(), lastUpdated: Date.now() });

  // 10. Thank You
  slides.push({ id: `corp-${now}-10`, elements: [
    { id: nowId('glass'), type:'shape', x:M, y: 170, width: W-2*M, height: 200, shapeType:'rounded-rectangle', fill:'rgba(255,255,255,0.12)', stroke:'rgba(255,255,255,0.25)', strokeWidth:1 } as Element,
    { id: nowId('title'), type:'text', x:M, y:190, width:W-2*M, height:80, text:'Thank You', fontSize:72, fontWeight:'bold', color:'#FFFFFF', textAlign:'center' } as Element,
    { id: nowId('subtitle'), type:'text', x:M, y:270, width:W-2*M, height:40, text:"Let's build the future together.", fontSize:24, color:'rgba(255,255,255,0.85)', textAlign:'center' } as Element,
  ], background:`radial-gradient(1200px 700px at 50% 40%, ${corporatePalette.primary}, #0b132b)`, createdAt:new Date(), lastUpdated: Date.now() });

  return slides;
}

// Theme 2: Gradient Minimal (10 slides)
const gradientPalette = {
  primary: '#6C5CE7',
  secondary: '#A29BFE',
  accent: '#00D1B2',
  neutral: '#FAFAFB',
  dark: '#0B1026',
};

function createGradientMinimal(): Slide[] {
  const now = Date.now();
  const S: Slide[] = [];

  // 1 Title
  S.push({ id:`grad-${now}-1`, elements:[
    { id: nowId('glass'), type:'shape', x:M, y: 160, width: W-2*M, height: 180, shapeType:'rounded-rectangle', fill:'rgba(255,255,255,0.15)', stroke:'rgba(255,255,255,0.35)', strokeWidth:1 } as Element,
    { id: nowId('title'), type:'text', x:M+24, y: 180, width: W-2*M-48, height: 80, text:'Gradient Minimal', fontSize:64, fontWeight:'bold', color:'#FFFFFF', letterSpacing:0.2 } as Element,
    { id: nowId('subtitle'), type:'text', x:M+24, y: 245, width: W-2*M-48, height: 40, text:'Clean layouts with vibrant gradients', fontSize:H2, color:'rgba(255,255,255,0.9)' } as Element,
], background: `linear-gradient(135deg, ${gradientPalette.primary}, ${gradientPalette.secondary})`, createdAt:new Date(), lastUpdated: Date.now() });

  // 2 Agenda (table)
  S.push({ id:`grad-${now}-2`, elements:[
    { id: nowId('title'), type:'text', x:M, y:M, width:W-2*M, height:50, text:'Agenda', fontSize:H1, fontWeight:'bold', color:'#101828' } as Element,
    { id: nowId('table'), type:'table', x:M, y: 120, width: W-2*M, height: 320, rows: 6, cols: 2, tableData:[
      ['Topic','Details'], ['Overview','Purpose & goals'], ['Design','Visual language & grid'], ['Data','Charts and tables'], ['Media','Images & gallery'], ['Closing','Q&A and thanks']
    ], header:true, headerBg:'#EEF2FF', headerTextColor:'#111827', borderWidth:1, borderColor:'#E5E7EB', backgroundColor:'#FFFFFF', color:'#111827', rowAltBg:'#FAFAFA', cellPadding:12, cellTextAlign:'left' } as Element,
  ], background: gradientPalette.neutral, createdAt:new Date(), lastUpdated: Date.now() });

  // 3 Overview
  S.push({ id:`grad-${now}-3`, elements:[
    { id: nowId('title'), type:'text', x:M, y:M, width:W-2*M, height:50, text:'Overview', fontSize:H1, fontWeight:'bold', color:'#111827' } as Element,
    { id: nowId('left'), type:'shape', x:M, y:120, width: 280, height: 280, shapeType:'circle', fill:'#E5E7EB', stroke:'#CBD5E1', strokeWidth:1 } as Element,
    { id: nowId('body'), type:'text', x: M+320, y:120, width: W-M-320, height: 280, text: 'We focus on clarity, balance, and accessibility.\n\nThis theme demonstrates clean composition with ample whitespace and modern typography.', fontSize:B1, color:'#334155', lineHeight:1.6 } as Element,
  ], background:'#FFFFFF', createdAt:new Date(), lastUpdated: Date.now() });

  // 4 Data (Bar)
  S.push({ id:`grad-${now}-4`, elements:[
    { id: nowId('title'), type:'text', x:M, y:M, width:W-2*M, height:50, text:'Usage Metrics', fontSize:H1, fontWeight:'bold', color:'#111827' } as Element,
    { id: nowId('chart'), type:'chart', x:M, y:120, width: W-2*M, height: 320, chartType:'bar', chartData:{
      title:'Monthly Active', labels:['Jan','Feb','Mar','Apr','May','Jun','Jul'], datasets:[
        { label:'MAU', data:[12,14,18,22,26,30,34], backgroundColor:'#A29BFE', borderColor:'#6C5CE7', borderRadius:8 }
      ]
    } } as Element,
  ], background:'#FFFFFF', createdAt:new Date(), lastUpdated: Date.now() });

  // 5 Comparison table
  S.push({ id:`grad-${now}-5`, elements:[
    { id: nowId('title'), type:'text', x:M, y:M, width:W-2*M, height:50, text:'Plan Comparison', fontSize:H1, fontWeight:'bold', color:'#111827' } as Element,
    { id: nowId('table'), type:'table', x:M, y:120, width:W-2*M, height:320, rows:5, cols:4, tableData:[
      ['Feature','Basic','Pro','Enterprise'], ['Users','1','5','Unlimited'], ['Storage','5GB','100GB','1TB'], ['Support','Email','Priority','24/7'], ['SSO','—','—','Yes']
    ], header:true, headerBg:'#EEF2FF', headerTextColor:'#111827', borderWidth:1, borderColor:'#E5E7EB', rowAltBg:'#FAFAFA', backgroundColor:'#FFFFFF', color:'#111827', cellPadding:12, cellTextAlign:'center' } as Element,
  ], background:'#FFFFFF', createdAt:new Date(), lastUpdated: Date.now() });

  // 6 Quote
  S.push({ id:`grad-${now}-6`, elements:[
    { id: nowId('glass'), type:'shape', x:M, y: 160, width: W-2*M, height: 200, shapeType:'rounded-rectangle', fill:'rgba(255,255,255,0.2)', stroke:'rgba(255,255,255,0.35)', strokeWidth:1 } as Element,
    { id: nowId('quote'), type:'text', x:M+24, y: 180, width: W-2*M-48, height: 160, text:'“Simplicity is the soul of efficiency.”', fontSize:40, fontWeight:'bold', color:'#FFFFFF', textAlign:'center', lineHeight:1.3 } as Element,
], background: `linear-gradient(135deg, ${gradientPalette.secondary}, ${gradientPalette.primary})`, createdAt:new Date(), lastUpdated: Date.now() });

  // 7 Timeline
  S.push({ id:`grad-${now}-7`, elements:[
    { id: nowId('title'), type:'text', x:M, y:M, width:W-2*M, height:50, text:'Process', fontSize:H1, fontWeight:'bold', color:'#111827' } as Element,
    { id: nowId('line'), type:'shape', x:M+20, y: 280, width: W-(M+20)-M, height:6, shapeType:'rounded-rectangle', fill: gradientPalette.primary } as Element,
    ...['Discover','Design','Develop','Deploy'].map((label,i)=>({ id: nowId(`dot${i}`), type:'shape', x:M+60+i*220, y:270, width:26, height:26, shapeType:'circle', fill:gradientPalette.secondary, stroke:'#FFFFFF', strokeWidth:3 }) as Element),
    ...['Discover','Design','Develop','Deploy'].map((label,i)=>({ id: nowId(`lbl${i}`), type:'text', x: M+30+i*220, y:310, width:120, height:60, text: label, fontSize:16, fontWeight:'600', color:'#111827', textAlign:'center' }) as Element),
  ], background: gradientPalette.neutral, createdAt:new Date(), lastUpdated: Date.now() });

  // 8 Gallery
  S.push({ id:`grad-${now}-8`, elements:[
    { id: nowId('title'), type:'text', x:M, y:M, width:W-2*M, height:50, text:'Gallery', fontSize:H1, fontWeight:'bold', color:'#111827' } as Element,
    ...[0,1,2].map((i)=>({ id: nowId(`img${i}`), type:'shape', x: M + i*((W-2*M-40)/3+20), y: 130, width:(W-2*M-40)/3, height: 280, shapeType:'rounded-rectangle', fill:'linear-gradient(180deg,#FFFFFF,#F3F4F6)', stroke:'#E5E7EB', strokeWidth:1 }) as Element),
  ], background:'#FFFFFF', createdAt:new Date(), lastUpdated: Date.now() });

  // 9 Summary (pie)
  S.push({ id:`grad-${now}-9`, elements:[
    { id: nowId('title'), type:'text', x:M, y:M, width:W-2*M, height:50, text:'Summary', fontSize:H1, fontWeight:'bold', color:'#111827' } as Element,
    { id: nowId('chart'), type:'chart', x:M, y:120, width: 420, height: 320, chartType:'pie', chartData:{ title:'Allocation', labels:['Design','Dev','QA','Ops'], datasets:[{ label:'%', data:[35,40,15,10], backgroundColor:['#6C5CE7','#A29BFE','#00D1B2','#19A974'], borderColor:'#FFFFFF' }] } } as Element,
    { id: nowId('notes'), type:'text', x: M+460, y: 120, width: W-M-460, height: 320, text:'Highlights\n• Clean typography\n• Responsive charts\n• Balanced layouts\n• Accessible colors', fontSize:B1, color:'#334155', lineHeight:1.6 } as Element,
  ], background:'#FFFFFF', createdAt:new Date(), lastUpdated: Date.now() });

  // 10 Thank you
  S.push({ id:`grad-${now}-10`, elements:[
    { id: nowId('bg'), type:'shape', x:0,y:0,width:W,height:H, fill:`linear-gradient(135deg, ${gradientPalette.primary}, ${gradientPalette.secondary})` } as Element,
    { id: nowId('title'), type:'text', x:M, y: 200, width: W-2*M, height: 100, text:'Thanks!', fontSize:72, fontWeight:'bold', color:'#FFFFFF', textAlign:'center' } as Element,
    { id: nowId('subtitle'), type:'text', x:M, y: 280, width: W-2*M, height: 40, text:'Questions?', fontSize:24, color:'#FFFFFF', textAlign:'center' } as Element,
  ], background: gradientPalette.dark, createdAt:new Date(), lastUpdated: Date.now() });

  return S;
}

// Theme 3: Education Pro (10 slides)
const eduPalette = {
  dark: '#0E141B',        // text / dark bg
  light: '#F4F5F7',       // light background
  primary: '#007AFF',     // accent blue
  divider: '#D9D9D9',     // thin dividers
};

function createEducationPro(): Slide[] {
  // 12-column grid helpers (strict alignment)
  const contentW = W - 2 * M; // 860
  const colW = Math.floor(contentW / 12); // 71
  const col = (n: number) => M + n * colW;
  const span = (n: number) => n * colW;
  const now = Date.now();
  const slides: Slide[] = [];
  const titleFont = 'SF Pro Display, Inter, -apple-system, Segoe UI, Roboto, sans-serif';
  const bodyFont = 'SF Pro Text, Inter, -apple-system, Segoe UI, Roboto, sans-serif';
  const serifFont = 'Georgia, "Times New Roman", Times, serif';
const humanistFont = 'Inter, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif';

  // 1. Title
slides.push({
    id: `edu-${now}-1`,
    elements: [
      { id: nowId('title'), type:'text', x: col(1), y: 160, width: span(10), height: 90, text:'Education — Executive Deck',
        fontSize: 56, fontWeight:'800', fontFamily: humanistFont, color: eduPalette.dark, textAlign:'left', letterSpacing:0.2, lineHeight:1.1, opacity:1, zIndex:10 } as Element,
      { id: nowId('underline'), type:'shape', x: col(1), y: 230, width: span(3), height: 2, shapeType:'rectangle', fill: eduPalette.primary, stroke: eduPalette.primary, strokeWidth: 0 } as Element,
      { id: nowId('subtitle'), type:'text', x: col(1), y: 250, width: span(8), height: 40, text:'Structured, minimalist, aligned to a 12‑column grid',
        fontSize: 20, fontWeight:'500', fontFamily: humanistFont, color: eduPalette.dark, textAlign:'left', lineHeight:1.3, opacity:0.9 } as Element,
    ], background: eduPalette.light, createdAt:new Date(), lastUpdated: Date.now(),
  });

  // 2. Agenda (Table)
slides.push({ id:`edu-${now}-2`, elements:[
    { id: nowId('title'), type:'text', x: col(1), y: M, width: span(6), height:50, text:'Agenda', fontSize: 36, fontWeight:'700', color: eduPalette.dark, fontFamily: humanistFont } as Element,
    { id: nowId('underline'), type:'shape', x: col(1), y: M+48, width: span(2), height: 2, shapeType:'rectangle', fill: eduPalette.primary } as Element,
    { id: nowId('table'), type:'table', x: col(1), y: 120, width: span(10), height:320, rows:6, cols:2, tableData:[
      ['Section','Details'], ['Overview','Course objectives & outcomes'], ['Syllabus','Modules & milestones'], ['Assessment','Rubrics & grading'], ['Resources','Texts & links'], ['Q&A','Discussion']
], header:true, headerBg: eduPalette.light, headerTextColor: eduPalette.dark, borderWidth:1, borderColor: eduPalette.divider, backgroundColor:'#FFFFFF', color: eduPalette.dark, rowAltBg: eduPalette.light, cellPadding:12, cellTextAlign:'left' } as Element,
  ], background: eduPalette.neutral, createdAt:new Date(), lastUpdated: Date.now() });

  // 3. Overview / Mission (image + text)
slides.push({ id:`edu-${now}-3`, elements:[
    { id: nowId('title'), type:'text', x: col(1), y:M, width: span(6), height:50, text:'Overview & Mission', fontSize:32, fontWeight:'700', color: eduPalette.dark, fontFamily: humanistFont } as Element,
    { id: nowId('underline'), type:'shape', x: col(1), y: M+46, width: span(2), height: 2, shapeType:'rectangle', fill: eduPalette.primary } as Element,
    { id: nowId('body'), type:'text', x: col(1), y:140, width: span(10), height:240, text:'Mission\nEnable engaging, outcome-driven learning.\n\nVision\nEmpower students to explore, practice, and master new skills.', fontSize:18, fontFamily: humanistFont, color: eduPalette.dark, lineHeight:1.6, textAlign:'left', verticalAlign:'top' } as Element,
], background: '#FFFFFF', createdAt:new Date(), lastUpdated: Date.now() });

  // 4. Data Chart (Line)
slides.push({ id:`edu-${now}-4`, elements:[
    { id: nowId('title'), type:'text', x: col(1), y:M, width: span(8), height:50, text:'Engagement Over Time', fontSize:32, fontWeight:'700', color: eduPalette.dark, fontFamily: humanistFont } as Element,
    { id: nowId('underline'), type:'shape', x: col(1), y: M+46, width: span(2), height: 2, shapeType:'rectangle', fill: eduPalette.primary } as Element,
    { id: nowId('chart'), type:'chart', x: col(1), y:120, width: span(10), height:320, chartType:'line', chartData:{
      title:'Weekly Activity', labels:['W1','W2','W3','W4','W5','W6','W7'], datasets:[
        { label:'Submissions', data:[12,18,25,29,31,35,40], borderColor: eduPalette.primary, backgroundColor: 'transparent', tension:0.35, fill:false },
        { label:'Posts', data:[8,12,15,17,21,24,28], borderColor: eduPalette.dark, backgroundColor: 'transparent', tension:0.35, fill:false },
      ],
      axes: { x: { grid: { display: false }}, y: { grid: { display: false }}}
    } } as Element,
  ], background:'#FFFFFF', createdAt:new Date(), lastUpdated: Date.now() });

  // 5. Comparison Table
slides.push({ id:`edu-${now}-5`, elements:[
    { id: nowId('title'), type:'text', x: col(1), y:M, width: span(6), height:50, text:'Plan Comparison', fontSize:32, fontWeight:'700', color: eduPalette.dark, fontFamily: humanistFont } as Element,
    { id: nowId('underline'), type:'shape', x: col(1), y: M+46, width: span(2), height: 2, shapeType:'rectangle', fill: eduPalette.primary } as Element,
    { id: nowId('table'), type:'table', x: col(1), y:120, width: span(10), height:320, rows:5, cols:4, tableData:[
      ['Feature','Basic','Plus','Premium'], ['Live Sessions','—','Monthly','Weekly'], ['Assignments','Yes','Yes','Yes + Capstone'], ['Support','Email','Priority','24/7 TA'], ['Cert','—','—','Included']
], header:true, headerBg: eduPalette.light, headerTextColor: eduPalette.dark, borderWidth:1, borderColor: eduPalette.divider, backgroundColor:'#FFFFFF', color: eduPalette.dark, rowAltBg: eduPalette.light, cellPadding:12, cellTextAlign:'center' } as Element,
  ], background:'#FFFFFF', createdAt:new Date(), lastUpdated: Date.now() });

  // 6. Quote / Highlight
slides.push({ id:`edu-${now}-6`, elements:[
    { id: nowId('quote'), type:'text', x: col(2), y: 190, width: span(8), height: 160, text:'“Education is the most powerful lever for opportunity.”', fontSize:34, fontWeight:'700', color: eduPalette.dark, textAlign:'center', lineHeight:1.3, fontFamily: serifFont } as Element,
  ], background: eduPalette.light, createdAt:new Date(), lastUpdated: Date.now() });

  // 7. Timeline (shapes)
slides.push({ id:`edu-${now}-7`, elements:[
    { id: nowId('title'), type:'text', x: col(1), y:M, width: span(6), height:50, text:'Course Timeline', fontSize:32, fontWeight:'700', color: eduPalette.dark, fontFamily: humanistFont } as Element,
    { id: nowId('underline'), type:'shape', x: col(1), y: M+46, width: span(2), height:2, shapeType:'rectangle', fill: eduPalette.primary } as Element,
    { id: nowId('line'), type:'shape', x: col(1), y: 280, width: span(10), height: 2, shapeType:'rectangle', fill: eduPalette.divider } as Element,
    ...['Intro','Practice','Project','Review'].map((label,i)=>({ id: nowId(`dot${i}`), type:'shape', x: col(2)+i*span(2.5), y:268, width:14, height:14, shapeType:'circle', fill: eduPalette.primary, stroke: eduPalette.primary, strokeWidth:1 }) as Element),
    ...['Intro','Practice','Project','Review'].map((label,i)=>({ id: nowId(`lbl${i}`), type:'text', x: col(1.6)+i*span(2.5), y:290, width:120, height:40, text:label, fontSize:16, fontWeight:'600', color: eduPalette.dark, textAlign:'left', fontFamily: humanistFont }) as Element),
  ], background: eduPalette.light, createdAt:new Date(), lastUpdated: Date.now() });

  // 8. Image Showcase (3-up)
slides.push({ id:`edu-${now}-8`, elements:[
    { id: nowId('title'), type:'text', x: col(1), y:M, width: span(6), height:50, text:'Key Sections', fontSize:32, fontWeight:'700', color: eduPalette.dark, fontFamily: humanistFont } as Element,
    { id: nowId('underline'), type:'shape', x: col(1), y: M+46, width: span(2), height:2, shapeType:'rectangle', fill: eduPalette.primary } as Element,
    ...[0,1,2].map((i)=>({ id: nowId(`card${i}`), type:'shape', x: col(1)+i*(span(3)+colW), y: 130, width: span(3), height: 260, shapeType:'rounded-rectangle', fill:'#FFFFFF', stroke: eduPalette.divider, strokeWidth:1, opacity:1 }) as Element),
    ...['Module A','Module B','Module C'].map((label,i)=>({ id: nowId(`cap${i}`), type:'text', x: col(1)+i*(span(3)+colW), y: 400, width: span(3), height:40, text: label, fontSize:16, color: eduPalette.dark, textAlign:'center', fontFamily: humanistFont }) as Element),
  ], background:'#FFFFFF', createdAt:new Date(), lastUpdated: Date.now() });

  // 9. Key Metrics (cards + bar)
slides.push({ id:`edu-${now}-9`, elements:[
    { id: nowId('title'), type:'text', x: col(1), y:M, width: span(6), height:50, text:'Key Metrics', fontSize:32, fontWeight:'700', color: eduPalette.dark, fontFamily: humanistFont } as Element,
    { id: nowId('underline'), type:'shape', x: col(1), y: M+46, width: span(2), height:2, shapeType:'rectangle', fill: eduPalette.primary } as Element,
    ...([['Enrollments','1,240'],['Completion','86%'],['Avg Score','92'],['Satisfaction','4.7★']]
      .map((pair,i)=>({ id: nowId(`card${i}`), type:'shape', x: col(1)+i*(span(2.5)+colW), y: 130, width: span(2.5), height:140, shapeType:'rounded-rectangle', fill:'#FFFFFF', stroke: eduPalette.divider, strokeWidth:1 }) as Element)
    ),
    ...([['Enrollments','1,240'],['Completion','86%'],['Avg Score','92'],['Satisfaction','4.7★']]
      .map((pair,i)=>({ id: nowId(`label${i}`), type:'text', x: col(1)+i*(span(2.5)+colW)+12, y: 144, width: span(2.5)-24, height:24, text: pair[0], fontSize:14, fontWeight:'600', color: eduPalette.dark, textAlign:'left', fontFamily: humanistFont }) as Element)
    ),
    ...([['Enrollments','1,240'],['Completion','86%'],['Avg Score','92'],['Satisfaction','4.7★']]
      .map((pair,i)=>({ id: nowId(`value${i}`), type:'text', x: col(1)+i*(span(2.5)+colW)+12, y: 172, width: span(2.5)-24, height:40, text: pair[1], fontSize:24, fontWeight:'800', color: eduPalette.primary, textAlign:'left', fontFamily: humanistFont }) as Element)
    ),
    { id: nowId('chart'), type:'chart', chartType:'bar', x: col(1), y: 300, width: span(10), height: 160, chartData:{
      title:'Weekly Snapshot', labels:['W1','W2','W3','W4'], datasets:[
        { label:'Assignments', data:[120,140,160,180], backgroundColor: eduPalette.primary, borderColor: eduPalette.primary, borderRadius:6 },
        { label:'Quizzes', data:[80,95,110,120], backgroundColor: eduPalette.dark, borderColor: eduPalette.dark, borderRadius:6 },
      ],
      axes: { x: { grid: { display: false }}, y: { grid: { display: false }}}
    } } as Element,
  ], background: '#FFFFFF', createdAt:new Date(), lastUpdated: Date.now() });

  // 10. Thank-You
slides.push({ id:`edu-${now}-10`, elements:[
    { id: nowId('title'), type:'text', x: col(1), y: 200, width: span(10), height:80, text:'Thank You', fontSize:64, fontWeight:'800', color:'#FFFFFF', textAlign:'center', fontFamily: humanistFont, letterSpacing:0.2 } as Element,
    { id: nowId('subtitle'), type:'text', x: col(3), y: 270, width: span(6), height:40, text:'Questions?', fontSize:20, color:'rgba(255,255,255,0.9)', textAlign:'center', fontFamily: humanistFont } as Element,
  ], background: eduPalette.dark, createdAt:new Date(), lastUpdated: Date.now() });

  return slides;
}

// Theme 4: Premium Business Strategy (10 slides) - Apple Keynote Grade
const businessStrategyPalette = {
  primary: '#0A2540',      // Deep navy blue
  secondary: '#1F4788',     // Medium blue
  accent: '#00BFA6',        // Teal accent
  light: '#EAEAEA',         // Light gray
  white: '#FFFFFF',         // Pure white
  dark: '#0F172A',          // Almost black
  gradientStart: '#1F3A93', // Gradient start
  gradientEnd: '#2E86DE',   // Gradient end
  glassBg: 'rgba(255,255,255,0.15)', // Glass overlay
  glassBorder: 'rgba(255,255,255,0.25)', // Glass border
};

function createPremiumBusinessStrategy(): Slide[] {
  const now = Date.now();
  const slides: Slide[] = [];
  const titleFont = 'SF Pro Display, Inter, -apple-system, sans-serif';
  const bodyFont = 'SF Pro Text, Inter, -apple-system, sans-serif';

  // 1. Title Slide - Premium with radial gradient, glass overlay, and decorative bubbles
  slides.push({
    id: `bs-${now}-1`,
    elements: [
      // Decorative bubbles with different colors
      { id: nowId('bubble1'), type: 'shape', x: 80, y: 80, width: 70, height: 70, shapeType: 'circle', fill: 'rgba(0,191,166,0.3)', stroke: businessStrategyPalette.accent, strokeWidth: 2, opacity: 0.8 } as Element,
      { id: nowId('bubble2'), type: 'shape', x: 850, y: 70, width: 60, height: 60, shapeType: 'circle', fill: 'rgba(31,71,136,0.3)', stroke: businessStrategyPalette.secondary, strokeWidth: 2, opacity: 0.8 } as Element,
      { id: nowId('bubble3'), type: 'shape', x: 60, y: 200, width: 50, height: 50, shapeType: 'circle', fill: 'rgba(255,107,107,0.25)', stroke: '#FF6B6B', strokeWidth: 2, opacity: 0.8 } as Element,
      { id: nowId('bubble4'), type: 'shape', x: 870, y: 250, width: 45, height: 45, shapeType: 'circle', fill: 'rgba(243,156,18,0.25)', stroke: '#F39C12', strokeWidth: 2, opacity: 0.8 } as Element,
      { id: nowId('bubble5'), type: 'shape', x: 100, y: 380, width: 55, height: 55, shapeType: 'circle', fill: 'rgba(0,191,166,0.25)', stroke: businessStrategyPalette.accent, strokeWidth: 2, opacity: 0.7 } as Element,
      { id: nowId('bubble6'), type: 'shape', x: 820, y: 400, width: 50, height: 50, shapeType: 'circle', fill: 'rgba(31,71,136,0.25)', stroke: businessStrategyPalette.secondary, strokeWidth: 2, opacity: 0.7 } as Element,
      // Glass overlay container
      { id: nowId('glass'), type: 'shape', x: M, y: 140, width: W-2*M, height: 260, shapeType: 'rounded-rectangle', fill: businessStrategyPalette.glassBg, stroke: businessStrategyPalette.glassBorder, strokeWidth: 1, borderRadius: 24, opacity: 0.95, shadow: true, shadowBlur: 20 } as Element,
      // Main title with shadow
      { id: nowId('title'), type: 'text', x: M+30, y: 180, width: W-2*M-60, height: 90, text: 'Business Strategy', fontSize: 72, fontWeight: 'bold', fontFamily: titleFont, color: businessStrategyPalette.white, textAlign: 'center', letterSpacing: 0.5, lineHeight: 1.1, shadow: true, shadowBlur: 8 } as Element,
      // Subtitle
      { id: nowId('subtitle'), type: 'text', x: M+30, y: 280, width: W-2*M-60, height: 50, text: 'Strategic Vision & Roadmap 2025', fontSize: 28, fontWeight: '500', fontFamily: bodyFont, color: 'rgba(255,255,255,0.9)', textAlign: 'center', letterSpacing: 0.3 } as Element,
      // Accent line
      { id: nowId('accent'), type: 'shape', x: M+280, y: 340, width: 400, height: 4, shapeType: 'rounded-rectangle', fill: businessStrategyPalette.accent, stroke: 'none', borderRadius: 2 } as Element,
    ],
    background: `radial-gradient(1200px 800px at 50% 30%, ${businessStrategyPalette.gradientStart}, ${businessStrategyPalette.gradientEnd})`,
    createdAt: new Date(),
    lastUpdated: Date.now(),
  });

  // 2. Agenda - Table with glass styling
  slides.push({
    id: `bs-${now}-2`,
    elements: [
      // Title with underline accent
      { id: nowId('title'), type: 'text', x: M, y: M, width: W-2*M, height: 60, text: 'Agenda', fontSize: 52, fontWeight: 'bold', fontFamily: titleFont, color: businessStrategyPalette.white, letterSpacing: 0.3, shadow: true, shadowBlur: 6, opacity: 0.98 } as Element,
      { id: nowId('underline'), type: 'shape', x: M, y: M+58, width: 120, height: 4, shapeType: 'rounded-rectangle', fill: businessStrategyPalette.accent, borderRadius: 2 } as Element,
      // Glass table container
      { id: nowId('tableGlass'), type: 'shape', x: M, y: 130, width: W-2*M, height: 360, shapeType: 'rounded-rectangle', fill: businessStrategyPalette.glassBg, stroke: businessStrategyPalette.glassBorder, strokeWidth: 1, borderRadius: 16, opacity: 0.9, shadow: true, shadowBlur: 15 } as Element,
      // Table
      { id: nowId('table'), type: 'table', x: M+20, y: 160, width: W-2*M-40, height: 320, rows: 6, cols: 2, tableData: [
        ['Section', 'Focus Area'],
        ['Market Analysis', 'Industry trends & signals'],
        ['Strategic Goals', 'Vision 2025 • Key metrics'],
        ['Financial Overview', 'Revenue forecast • Cost model'],
        ['Implementation', 'Roadmap milestones • Owners'],
        ['Next Steps', 'Action plan • Timelines'],
      ], themeId: 'keynote1', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', backgroundColor: 'transparent', color: businessStrategyPalette.white, header: true, headerBg: businessStrategyPalette.accent, headerTextColor: businessStrategyPalette.white, rowAltBg: 'rgba(255,255,255,0.05)', cellPadding: 16, cellTextAlign: 'left', fontFamily: bodyFont, fontSize: 18 } as Element,
    ],
    background: `linear-gradient(135deg, ${businessStrategyPalette.secondary}, ${businessStrategyPalette.primary})`,
    createdAt: new Date(),
    lastUpdated: Date.now(),
  });

  // 3. Overview / Mission - Two-column with glass cards and decorative bubbles
  slides.push({
    id: `bs-${now}-3`,
    elements: [
      { id: nowId('title'), type: 'text', x: M, y: M, width: W-2*M, height: 60, text: 'Mission & Vision', fontSize: 52, fontWeight: 'bold', fontFamily: titleFont, color: businessStrategyPalette.white, letterSpacing: 0.3, shadow: true, shadowBlur: 6, opacity: 0.98 } as Element,
      { id: nowId('underline'), type: 'shape', x: M, y: M+58, width: 180, height: 4, shapeType: 'rounded-rectangle', fill: businessStrategyPalette.accent, borderRadius: 2 } as Element,
      // Decorative bubbles with different colors
      { id: nowId('bubble1'), type: 'shape', x: 820, y: 60, width: 55, height: 55, shapeType: 'circle', fill: 'rgba(0,191,166,0.3)', stroke: businessStrategyPalette.accent, strokeWidth: 2, opacity: 0.8 } as Element,
      { id: nowId('bubble2'), type: 'shape', x: 890, y: 100, width: 40, height: 40, shapeType: 'circle', fill: 'rgba(31,71,136,0.3)', stroke: businessStrategyPalette.secondary, strokeWidth: 2, opacity: 0.8 } as Element,
      { id: nowId('bubble3'), type: 'shape', x: 850, y: 160, width: 50, height: 50, shapeType: 'circle', fill: 'rgba(255,107,107,0.25)', stroke: '#FF6B6B', strokeWidth: 2, opacity: 0.8 } as Element,
      { id: nowId('bubble4'), type: 'shape', x: 60, y: 100, width: 45, height: 45, shapeType: 'circle', fill: 'rgba(0,191,166,0.25)', stroke: businessStrategyPalette.accent, strokeWidth: 2, opacity: 0.7 } as Element,
      { id: nowId('bubble5'), type: 'shape', x: 30, y: 180, width: 35, height: 35, shapeType: 'circle', fill: 'rgba(31,71,136,0.25)', stroke: businessStrategyPalette.secondary, strokeWidth: 2, opacity: 0.7 } as Element,
      // Mission glass card
      { id: nowId('missionGlass'), type: 'shape', x: M, y: 140, width: 420, height: 320, shapeType: 'rounded-rectangle', fill: businessStrategyPalette.glassBg, stroke: businessStrategyPalette.glassBorder, strokeWidth: 1, borderRadius: 20, opacity: 0.9, shadow: true, shadowBlur: 20 } as Element,
      { id: nowId('missionTitle'), type: 'text', x: M+30, y: 160, width: 360, height: 50, text: 'Our Mission', fontSize: 36, fontWeight: 'bold', fontFamily: titleFont, color: businessStrategyPalette.white, letterSpacing: 0.2 } as Element,
      { id: nowId('missionText'), type: 'text', x: M+30, y: 220, width: 360, height: 220, text: 'To empower organizations with strategic clarity, driving sustainable growth through innovative solutions and data-driven decision making.', fontSize: 20, fontWeight: '400', fontFamily: bodyFont, color: 'rgba(255,255,255,0.95)', lineHeight: 1.6, textAlign: 'left' } as Element,
      // Vision glass card
      { id: nowId('visionGlass'), type: 'shape', x: M+490, y: 140, width: 420, height: 320, shapeType: 'rounded-rectangle', fill: businessStrategyPalette.glassBg, stroke: businessStrategyPalette.glassBorder, strokeWidth: 1, borderRadius: 20, opacity: 0.9, shadow: true, shadowBlur: 20 } as Element,
      { id: nowId('visionTitle'), type: 'text', x: M+520, y: 160, width: 360, height: 50, text: 'Our Vision', fontSize: 36, fontWeight: 'bold', fontFamily: titleFont, color: businessStrategyPalette.white, letterSpacing: 0.2 } as Element,
      { id: nowId('visionText'), type: 'text', x: M+520, y: 220, width: 360, height: 220, text: 'To become the global leader in strategic consulting, recognized for excellence, innovation, and transformative impact on businesses worldwide.', fontSize: 20, fontWeight: '400', fontFamily: bodyFont, color: 'rgba(255,255,255,0.95)', lineHeight: 1.6, textAlign: 'left' } as Element,
    ],
    background: `radial-gradient(1000px 600px at 30% 40%, ${businessStrategyPalette.gradientStart}, ${businessStrategyPalette.primary})`,
    createdAt: new Date(),
    lastUpdated: Date.now(),
  });

  // 4. Data Chart - Line chart with glass container and decorative bubbles
  slides.push({
    id: `bs-${now}-4`,
    elements: [
      { id: nowId('title'), type: 'text', x: M, y: M, width: W-2*M, height: 60, text: 'Market Growth Analysis', fontSize: 52, fontWeight: 'bold', fontFamily: titleFont, color: businessStrategyPalette.primary, letterSpacing: 0.3 } as Element,
      { id: nowId('underline'), type: 'shape', x: M, y: M+58, width: 280, height: 4, shapeType: 'rounded-rectangle', fill: businessStrategyPalette.accent, borderRadius: 2 } as Element,
      // Decorative bubbles with different colors
      { id: nowId('bubble1'), type: 'shape', x: 780, y: 80, width: 60, height: 60, shapeType: 'circle', fill: 'rgba(0,191,166,0.3)', stroke: businessStrategyPalette.accent, strokeWidth: 2, opacity: 0.8 } as Element,
      { id: nowId('bubble2'), type: 'shape', x: 850, y: 120, width: 40, height: 40, shapeType: 'circle', fill: 'rgba(31,71,136,0.3)', stroke: businessStrategyPalette.secondary, strokeWidth: 2, opacity: 0.8 } as Element,
      { id: nowId('bubble3'), type: 'shape', x: 820, y: 180, width: 50, height: 50, shapeType: 'circle', fill: 'rgba(10,37,64,0.2)', stroke: businessStrategyPalette.primary, strokeWidth: 2, opacity: 0.8 } as Element,
      // Glass chart container
      { id: nowId('chartGlass'), type: 'shape', x: M, y: 130, width: W-2*M, height: 340, shapeType: 'rounded-rectangle', fill: businessStrategyPalette.glassBg, stroke: businessStrategyPalette.glassBorder, strokeWidth: 1, borderRadius: 20, opacity: 0.9, shadow: true, shadowBlur: 20 } as Element,
      // Line chart with enhanced color scheme
      { id: nowId('chart'), type: 'chart', x: M+30, y: 160, width: W-2*M-60, height: 280, chartType: 'line', chartData: {
        title: 'Revenue Growth (5-Year Projection)',
        labels: ['2021', '2022', '2023', '2024', '2025', '2026'],
        datasets: [
          { label: 'Revenue ($M)', data: [12, 18, 28, 42, 58, 75], borderColor: businessStrategyPalette.accent, backgroundColor: 'rgba(0,191,166,0.15)', tension: 0.4, fill: true, borderWidth: 3, pointRadius: 6, pointBackgroundColor: businessStrategyPalette.accent, pointBorderColor: '#FFFFFF', pointBorderWidth: 2 },
          { label: 'Market Share (%)', data: [8, 12, 18, 24, 30, 36], borderColor: businessStrategyPalette.secondary, backgroundColor: 'rgba(31,71,136,0.15)', tension: 0.4, fill: true, borderWidth: 3, pointRadius: 6, pointBackgroundColor: businessStrategyPalette.secondary, pointBorderColor: '#FFFFFF', pointBorderWidth: 2 },
          { label: 'Customer Base (K)', data: [45, 68, 95, 142, 198, 265], borderColor: '#FF6B6B', backgroundColor: 'rgba(255,107,107,0.15)', tension: 0.4, fill: true, borderWidth: 3, pointRadius: 6, pointBackgroundColor: '#FF6B6B', pointBorderColor: '#FFFFFF', pointBorderWidth: 2 },
        ],
      } } as Element,
    ],
    background: `linear-gradient(180deg, ${businessStrategyPalette.light}, ${businessStrategyPalette.white})`,
    createdAt: new Date(),
    lastUpdated: Date.now(),
  });

  // 5. Comparison Table - Premium styling with glass and pie chart
  slides.push({
    id: `bs-${now}-5`,
    elements: [
      { id: nowId('title'), type: 'text', x: M, y: M, width: W-2*M, height: 60, text: 'Market Share & Competitive Analysis', fontSize: 52, fontWeight: 'bold', fontFamily: titleFont, color: businessStrategyPalette.white, letterSpacing: 0.3, shadow: true, shadowBlur: 6, opacity: 0.98 } as Element,
      { id: nowId('underline'), type: 'shape', x: M, y: M+58, width: 380, height: 4, shapeType: 'rounded-rectangle', fill: businessStrategyPalette.accent, borderRadius: 2 } as Element,
      // Decorative bubbles
      { id: nowId('bubble1'), type: 'shape', x: 60, y: 100, width: 45, height: 45, shapeType: 'circle', fill: 'rgba(0,191,166,0.25)', stroke: businessStrategyPalette.accent, strokeWidth: 2, opacity: 0.7 } as Element,
      { id: nowId('bubble2'), type: 'shape', x: 30, y: 160, width: 35, height: 35, shapeType: 'circle', fill: 'rgba(31,71,136,0.25)', stroke: businessStrategyPalette.secondary, strokeWidth: 2, opacity: 0.7 } as Element,
      // Pie chart with diverse color scheme
      { id: nowId('pieGlass'), type: 'shape', x: M, y: 130, width: 380, height: 340, shapeType: 'rounded-rectangle', fill: businessStrategyPalette.glassBg, stroke: businessStrategyPalette.glassBorder, strokeWidth: 1, borderRadius: 20, opacity: 0.9, shadow: true, shadowBlur: 20 } as Element,
      { id: nowId('pieChart'), type: 'chart', x: M+30, y: 160, width: 320, height: 280, chartType: 'pie', chartData: {
        title: 'Market Share Distribution',
        labels: ['Our Solution', 'Competitor A', 'Competitor B', 'Others'],
        datasets: [{
          label: 'Market Share (%)',
          data: [38, 28, 22, 12],
          backgroundColor: [
            businessStrategyPalette.accent,      // Teal for our solution
            businessStrategyPalette.secondary,    // Blue for competitor A
            '#FF6B6B',                           // Red for competitor B
            '#95A5A6',                           // Gray for others
          ],
          borderColor: '#FFFFFF',
          borderWidth: 3,
        }],
      } } as Element,
      // Comparison table
      { id: nowId('tableGlass'), type: 'shape', x: M+420, y: 130, width: 490, height: 340, shapeType: 'rounded-rectangle', fill: businessStrategyPalette.glassBg, stroke: businessStrategyPalette.glassBorder, strokeWidth: 1, borderRadius: 20, opacity: 0.9, shadow: true, shadowBlur: 20 } as Element,
      { id: nowId('table'), type: 'table', x: M+440, y: 150, width: 450, height: 300, rows: 5, cols: 4, tableData: [
        ['Feature', 'Our Solution', 'Competitor A', 'Competitor B'],
        ['Analytics', 'Advanced AI', 'Basic', 'Moderate'],
        ['Integration', 'Seamless', 'Limited', 'Partial'],
        ['Support', '24/7 Premium', 'Business Hours', 'Email Only'],
        ['Pricing', 'Value-Based', 'High', 'Medium'],
      ], themeId: 'keynote1', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', backgroundColor: 'transparent', color: businessStrategyPalette.white, header: true, headerBg: businessStrategyPalette.accent, headerTextColor: businessStrategyPalette.white, rowAltBg: 'rgba(255,255,255,0.05)', cellPadding: 14, cellTextAlign: 'center' } as Element,
    ],
    background: `radial-gradient(1000px 600px at 70% 30%, ${businessStrategyPalette.gradientStart}, ${businessStrategyPalette.primary})`,
    createdAt: new Date(),
    lastUpdated: Date.now(),
  });

  // 6. Financial Tables — multiple tables with varied themes and professional numeric formatting
  slides.push({
    id: `bs-${now}-6`,
    elements: [
      // Title
      { id: nowId('title'), type: 'text', x: M, y: M, width: W-2*M, height: 60, text: 'Financial Overview Tables', fontSize: 52, fontWeight: 'bold', fontFamily: titleFont, color: businessStrategyPalette.white, letterSpacing: 0.3, shadow: true, shadowBlur: 6 } as Element,
      { id: nowId('underline'), type: 'shape', x: M, y: M+58, width: 360, height: 4, shapeType: 'rounded-rectangle', fill: businessStrategyPalette.accent, borderRadius: 2 } as Element,

      // Glass container background
      { id: nowId('glass'), type: 'shape', x: M, y: 120, width: W-2*M, height: 340, shapeType: 'rounded-rectangle', fill: businessStrategyPalette.glassBg, stroke: businessStrategyPalette.glassBorder, strokeWidth: 1, borderRadius: 20, opacity: 0.92, shadow: true, shadowBlur: 20 } as Element,

      // Table 1: Revenue by Region (Keynote Green theme)
      { id: nowId('table1'), type: 'table', x: M+24, y: 140, width: (W-2*M)/2-36, height: 300, rows: 6, cols: 3, tableData: [
        ['Region','FY 2023','FY 2024'],
        ['Americas', '$12,450,000', '$14,900,000'],
        ['EMEA', '$8,320,000', '$9,780,000'],
        ['APAC', '$6,110,000', '$7,950,000'],
        ['LATAM', '$1,980,000', '$2,340,000'],
        ['Total', '$28,860,000', '$34,970,000'],
      ], themeId: 'keynote3', header: true, headerBg: '#10B981', headerTextColor: '#FFFFFF', rowAltBg: 'rgba(255,255,255,0.05)', backgroundColor: 'transparent', color: businessStrategyPalette.white, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', cellPadding: 14, cellTextAlign: 'right', fontFamily: bodyFont, fontSize: 18 } as Element,

      // Table 2: KPI Snapshot (Royal Purple theme)
      { id: nowId('table2'), type: 'table', x: M + (W-2*M)/2 + 12, y: 140, width: (W-2*M)/2-36, height: 300, rows: 6, cols: 3, tableData: [
        ['Metric','Q3 2024','Change'],
        ['Gross Margin', '62%', '+3.5%'],
        ['Net Retention', '118%', '+5.0%'],
        ['CAC Payback', '7 mo', '−1 mo'],
        ['NPS', '68', '+6'],
        ['ARR', '$42,300,000', '+38%'],
      ], themeId: 'keynote5', header: true, headerBg: '#8B5CF6', headerTextColor: '#FFFFFF', rowAltBg: 'rgba(255,255,255,0.05)', backgroundColor: 'transparent', color: businessStrategyPalette.white, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', cellPadding: 14, cellTextAlign: 'center', fontFamily: bodyFont, fontSize: 18 } as Element,
    ],
    background: `radial-gradient(1200px 700px at 50% 50%, ${businessStrategyPalette.gradientStart}, ${businessStrategyPalette.primary})`,
    createdAt: new Date(),
    lastUpdated: Date.now(),
  });

  // 7. Timeline - Horizontal timeline with glass milestones and decorative bubbles
  slides.push({
    id: `bs-${now}-7`,
    elements: [
      { id: nowId('title'), type: 'text', x: M, y: M, width: W-2*M, height: 60, text: 'Strategic Roadmap 2025', fontSize: 52, fontWeight: 'bold', fontFamily: titleFont, color: businessStrategyPalette.primary, letterSpacing: 0.3 } as Element,
      { id: nowId('underline'), type: 'shape', x: M, y: M+58, width: 300, height: 4, shapeType: 'rounded-rectangle', fill: businessStrategyPalette.accent, borderRadius: 2 } as Element,
      // Decorative bubbles
      { id: nowId('bubble1'), type: 'shape', x: 60, y: 100, width: 50, height: 50, shapeType: 'circle', fill: 'rgba(0,191,166,0.25)', stroke: businessStrategyPalette.accent, strokeWidth: 2, opacity: 0.7 } as Element,
      { id: nowId('bubble2'), type: 'shape', x: 850, y: 80, width: 45, height: 45, shapeType: 'circle', fill: 'rgba(31,71,136,0.25)', stroke: businessStrategyPalette.secondary, strokeWidth: 2, opacity: 0.7 } as Element,
      { id: nowId('bubble3'), type: 'shape', x: 880, y: 140, width: 40, height: 40, shapeType: 'circle', fill: 'rgba(255,107,107,0.25)', stroke: '#FF6B6B', strokeWidth: 2, opacity: 0.7 } as Element,
      // Timeline line
      { id: nowId('timeline'), type: 'shape', x: M+40, y: 280, width: W-2*M-80, height: 6, shapeType: 'rounded-rectangle', fill: businessStrategyPalette.accent, borderRadius: 3, shadow: true, shadowBlur: 8 } as Element,
      // Timeline milestones (4 quarters) with different colored bubbles
      ...['Q1', 'Q2', 'Q3', 'Q4'].map((q, i) => {
        const xPos = M+80 + i*220;
        const milestoneColors = [
          businessStrategyPalette.accent,      // Teal for Q1
          businessStrategyPalette.secondary,    // Blue for Q2
          '#FF6B6B',                          // Red for Q3
          '#F39C12',                          // Orange for Q4
        ];
        return [
          // Glass circle with colored border
          { id: nowId(`dot${i}`), type: 'shape', x: xPos-18, y: 262, width: 36, height: 36, shapeType: 'circle', fill: businessStrategyPalette.glassBg, stroke: milestoneColors[i], strokeWidth: 3, opacity: 0.95, shadow: true, shadowBlur: 12 } as Element,
          // Inner colored dot
          { id: nowId(`inner${i}`), type: 'shape', x: xPos-8, y: 272, width: 16, height: 16, shapeType: 'circle', fill: milestoneColors[i], stroke: 'none' } as Element,
          // Label
          { id: nowId(`label${i}`), type: 'text', x: xPos-60, y: 310, width: 120, height: 50, text: q, fontSize: 24, fontWeight: 'bold', fontFamily: titleFont, color: businessStrategyPalette.primary, textAlign: 'center' } as Element,
          // Description
          { id: nowId(`desc${i}`), type: 'text', x: xPos-60, y: 360, width: 120, height: 60, text: i === 0 ? 'Launch' : i === 1 ? 'Scale' : i === 2 ? 'Optimize' : 'Expand', fontSize: 16, fontWeight: '500', fontFamily: bodyFont, color: businessStrategyPalette.dark, textAlign: 'center', lineHeight: 1.4 } as Element,
        ];
      }).flat(),
    ],
    background: `linear-gradient(180deg, ${businessStrategyPalette.white}, ${businessStrategyPalette.light})`,
    createdAt: new Date(),
    lastUpdated: Date.now(),
  });

  // 8. Image Showcase - Gallery with glass cards, images, and decorative bubbles
  slides.push({
    id: `bs-${now}-8`,
    elements: [
      { id: nowId('title'), type: 'text', x: M, y: M, width: W-2*M, height: 60, text: 'Portfolio Showcase', fontSize: 52, fontWeight: 'bold', fontFamily: titleFont, color: businessStrategyPalette.white, letterSpacing: 0.3, shadow: true, shadowBlur: 6, opacity: 0.98 } as Element,
      { id: nowId('underline'), type: 'shape', x: M, y: M+58, width: 220, height: 4, shapeType: 'rounded-rectangle', fill: businessStrategyPalette.accent, borderRadius: 2 } as Element,
      // Decorative bubbles around the title
      { id: nowId('bubble1'), type: 'shape', x: 60, y: 80, width: 50, height: 50, shapeType: 'circle', fill: 'rgba(0,191,166,0.3)', stroke: businessStrategyPalette.accent, strokeWidth: 2, opacity: 0.8 } as Element,
      { id: nowId('bubble2'), type: 'shape', x: 850, y: 70, width: 45, height: 45, shapeType: 'circle', fill: 'rgba(31,71,136,0.3)', stroke: businessStrategyPalette.secondary, strokeWidth: 2, opacity: 0.8 } as Element,
      { id: nowId('bubble3'), type: 'shape', x: 880, y: 120, width: 35, height: 35, shapeType: 'circle', fill: 'rgba(255,107,107,0.25)', stroke: '#FF6B6B', strokeWidth: 2, opacity: 0.8 } as Element,
      // Three glass showcase cards with image placeholders
      ...[0, 1, 2].map((i) => {
        const cardW = (W-2*M-40) / 3;
        const xPos = M + i*(cardW+20);
        const imageColors = [
          { fill: 'rgba(0,191,166,0.25)', stroke: businessStrategyPalette.accent },
          { fill: 'rgba(31,71,136,0.25)', stroke: businessStrategyPalette.secondary },
          { fill: 'rgba(255,107,107,0.25)', stroke: '#FF6B6B' },
        ];
        return [
          // Glass card
          { id: nowId(`card${i}`), type: 'shape', x: xPos, y: 130, width: cardW, height: 300, shapeType: 'rounded-rectangle', fill: businessStrategyPalette.glassBg, stroke: businessStrategyPalette.glassBorder, strokeWidth: 1, borderRadius: 20, opacity: 0.9, shadow: true, shadowBlur: 20 } as Element,
          // Image placeholder with gradient background
          { id: nowId(`img${i}`), type: 'shape', x: xPos+15, y: 150, width: cardW-30, height: 180, shapeType: 'rounded-rectangle', fill: imageColors[i].fill, stroke: imageColors[i].stroke, strokeWidth: 2, borderRadius: 12, shadow: true, shadowBlur: 10 } as Element,
          // Decorative circle inside image area
          { id: nowId(`imgCircle${i}`), type: 'shape', x: xPos+cardW/2-25, y: 220, width: 50, height: 50, shapeType: 'circle', fill: imageColors[i].stroke, stroke: 'rgba(255,255,255,0.5)', strokeWidth: 2, opacity: 0.6 } as Element,
          // Title
          { id: nowId(`title${i}`), type: 'text', x: xPos+15, y: 350, width: cardW-30, height: 30, text: i === 0 ? 'Project Alpha' : i === 1 ? 'Project Beta' : 'Project Gamma', fontSize: 20, fontWeight: 'bold', fontFamily: titleFont, color: businessStrategyPalette.white, textAlign: 'center' } as Element,
          // Description
          { id: nowId(`desc${i}`), type: 'text', x: xPos+15, y: 385, width: cardW-30, height: 35, text: i === 0 ? 'Strategic Initiative' : i === 1 ? 'Market Expansion' : 'Innovation Lab', fontSize: 14, fontWeight: '400', fontFamily: bodyFont, color: 'rgba(255,255,255,0.8)', textAlign: 'center' } as Element,
        ];
      }).flat(),
    ],
    background: `radial-gradient(1000px 600px at 50% 50%, ${businessStrategyPalette.gradientStart}, ${businessStrategyPalette.primary})`,
    createdAt: new Date(),
    lastUpdated: Date.now(),
  });

  // 9. Key Metrics - Cards with glass, decorative bubbles, and enhanced bar chart
  slides.push({
    id: `bs-${now}-9`,
    elements: [
      { id: nowId('title'), type: 'text', x: M, y: M, width: W-2*M, height: 60, text: 'Key Performance Metrics', fontSize: 52, fontWeight: 'bold', fontFamily: titleFont, color: businessStrategyPalette.white, letterSpacing: 0.3, shadow: true, shadowBlur: 8 } as Element,
      { id: nowId('underline'), type: 'shape', x: M, y: M+58, width: 320, height: 4, shapeType: 'rounded-rectangle', fill: businessStrategyPalette.accent, borderRadius: 2 } as Element,
      // Decorative bubbles
      { id: nowId('bubble1'), type: 'shape', x: 60, y: 80, width: 55, height: 55, shapeType: 'circle', fill: 'rgba(0,191,166,0.3)', stroke: businessStrategyPalette.accent, strokeWidth: 2, opacity: 0.8 } as Element,
      { id: nowId('bubble2'), type: 'shape', x: 850, y: 70, width: 50, height: 50, shapeType: 'circle', fill: 'rgba(31,71,136,0.3)', stroke: businessStrategyPalette.secondary, strokeWidth: 2, opacity: 0.8 } as Element,
      { id: nowId('bubble3'), type: 'shape', x: 880, y: 130, width: 40, height: 40, shapeType: 'circle', fill: 'rgba(255,107,107,0.25)', stroke: '#FF6B6B', strokeWidth: 2, opacity: 0.8 } as Element,
      // Metric cards (4 cards) with colored bubbles
      ...[['Revenue', '$42M'], ['Growth', '+38%'], ['Clients', '1,240'], ['Satisfaction', '4.9★']].map((pair, i) => {
        const cardW = (W-2*M-60) / 4;
        const xPos = M + i*(cardW+20);
        const bubbleColors = [
          businessStrategyPalette.accent,
          businessStrategyPalette.secondary,
          '#FF6B6B',
          '#F39C12',
        ];
        return [
          // Glass metric card
          { id: nowId(`metricCard${i}`), type: 'shape', x: xPos, y: 130, width: cardW, height: 140, shapeType: 'rounded-rectangle', fill: businessStrategyPalette.glassBg, stroke: businessStrategyPalette.glassBorder, strokeWidth: 1, borderRadius: 16, opacity: 0.9, shadow: true, shadowBlur: 15 } as Element,
          // Colored bubble indicator
          { id: nowId(`bubble${i}`), type: 'shape', x: xPos+cardW/2-15, y: 145, width: 30, height: 30, shapeType: 'circle', fill: bubbleColors[i], stroke: 'rgba(255,255,255,0.5)', strokeWidth: 2, opacity: 0.9 } as Element,
          // Label
          { id: nowId(`label${i}`), type: 'text', x: xPos+10, y: 150, width: cardW-20, height: 30, text: pair[0], fontSize: 16, fontWeight: '600', fontFamily: bodyFont, color: 'rgba(255,255,255,0.9)', textAlign: 'center' } as Element,
          // Value
          { id: nowId(`value${i}`), type: 'text', x: xPos+10, y: 180, width: cardW-20, height: 60, text: pair[1], fontSize: 36, fontWeight: 'bold', fontFamily: titleFont, color: bubbleColors[i], textAlign: 'center', letterSpacing: 0.3 } as Element,
        ];
      }).flat(),
      // Enhanced bar chart in glass container with diverse color scheme
      { id: nowId('chartGlass'), type: 'shape', x: M, y: 300, width: W-2*M, height: 170, shapeType: 'rounded-rectangle', fill: businessStrategyPalette.glassBg, stroke: businessStrategyPalette.glassBorder, strokeWidth: 1, borderRadius: 20, opacity: 0.9, shadow: true, shadowBlur: 20 } as Element,
      { id: nowId('chart'), type: 'chart', x: M+30, y: 330, width: W-2*M-60, height: 110, chartType: 'bar', chartData: {
        title: 'Quarterly Performance',
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [
          { label: 'Revenue ($M)', data: [8.5, 10.2, 12.8, 15.3], backgroundColor: businessStrategyPalette.accent, borderColor: businessStrategyPalette.accent, borderRadius: 8, borderWidth: 0 },
          { label: 'Target ($M)', data: [9, 11, 13, 16], backgroundColor: businessStrategyPalette.secondary, borderColor: businessStrategyPalette.secondary, borderRadius: 8, borderWidth: 0 },
          { label: 'Expenses ($M)', data: [4.2, 4.8, 5.5, 6.1], backgroundColor: '#FF6B6B', borderColor: '#FF6B6B', borderRadius: 8, borderWidth: 0 },
        ],
      } } as Element,
    ],
    background: `linear-gradient(135deg, ${businessStrategyPalette.primary}, ${businessStrategyPalette.secondary})`,
    createdAt: new Date(),
    lastUpdated: Date.now(),
  });

  // 10. Thank-You - Premium closing slide
  slides.push({
    id: `bs-${now}-10`,
    elements: [
      // Large glass container
      { id: nowId('thankGlass'), type: 'shape', x: M, y: 150, width: W-2*M, height: 240, shapeType: 'rounded-rectangle', fill: businessStrategyPalette.glassBg, stroke: businessStrategyPalette.glassBorder, strokeWidth: 2, borderRadius: 28, opacity: 0.95, shadow: true, shadowBlur: 30 } as Element,
      // Thank you title
      { id: nowId('thankTitle'), type: 'text', x: M+40, y: 200, width: W-2*M-80, height: 80, text: 'Thank You', fontSize: 76, fontWeight: 'bold', fontFamily: titleFont, color: businessStrategyPalette.white, textAlign: 'center', letterSpacing: 1, shadow: true, shadowBlur: 12 } as Element,
      // Subtitle
      { id: nowId('thankSub'), type: 'text', x: M+40, y: 290, width: W-2*M-80, height: 50, text: 'Let\'s build the future together', fontSize: 28, fontWeight: '500', fontFamily: bodyFont, color: 'rgba(255,255,255,0.9)', textAlign: 'center', letterSpacing: 0.5 } as Element,
      // Accent decorations
      { id: nowId('accent1'), type: 'shape', x: M+200, y: 360, width: 100, height: 4, shapeType: 'rounded-rectangle', fill: businessStrategyPalette.accent, borderRadius: 2 } as Element,
      { id: nowId('accent2'), type: 'shape', x: M+660, y: 360, width: 100, height: 4, shapeType: 'rounded-rectangle', fill: businessStrategyPalette.accent, borderRadius: 2 } as Element,
    ],
    background: `radial-gradient(1200px 800px at 50% 50%, ${businessStrategyPalette.gradientStart}, ${businessStrategyPalette.primary})`,
    createdAt: new Date(),
    lastUpdated: Date.now(),
  });

  return slides;
}

export const presentationThemes: PresentationTheme[] = [
  {
    id: 'modern-corporate',
    name: 'Modern Corporate',
    description: 'Professional corporate deck with charts, tables, timeline, gallery (10 slides).',
    slides: createModernCorporate(),
    palette: corporatePalette,
    thumbnail: null,
  },
  {
    id: 'gradient-minimal',
    name: 'Gradient Minimal',
    description: 'Clean minimalist theme with vibrant gradients and data visuals (10 slides).',
    slides: createGradientMinimal(),
    palette: gradientPalette,
    thumbnail: null,
  },
  {
    id: 'education-pro',
    name: 'Education Pro',
    description: 'Apple‑Keynote‑grade academic theme with gradients, glass layers, and 4 data visuals (10 slides).',
    slides: createEducationPro(),
    palette: eduPalette,
    thumbnail: null,
  },
  {
    id: 'business-strategy',
    name: 'Business Strategy',
    description: 'Premium Apple Keynote-grade business strategy deck with glass overlays, radial gradients, and professional data visuals (10 slides).',
    slides: createPremiumBusinessStrategy(),
    palette: businessStrategyPalette,
    thumbnail: null,
  },
];

export default presentationThemes;
