const PptxGenJS = require('pptxgenjs');

const prs = new PptxGenJS();
prs.defineLayout({ name: 'LINKEDIN', width: 1.91, height: 1.0 });
prs.defaultLayout = 'LINKEDIN';

const colors = {
  darkNavy: '0A1E35',
  teal: '028090',
  mint: '02C39A',
  white: 'FFFFFF',
  offWhite: 'F5F5F5',
  darkGray: '1A1A1A',
  red: 'E74C3C',
  lightGray: 'E0E0E0'
};

// Slide 1: THE PAIN
const slide1 = prs.addSlide('LINKEDIN');
slide1.background = { color: colors.red };
slide1.addText('Your IPO is 6 months behind', {
  x: 0.15, y: 0.15, w: 1.61, h: 0.35,
  fontSize: 48, bold: true, color: colors.white,
  fontFace: 'Georgia'
});
slide1.addText('And you didn\'t see it coming.', {
  x: 0.15, y: 0.52, w: 1.61, h: 0.25,
  fontSize: 20, color: colors.offWhite,
  fontFace: 'Calibri'
});

// Slide 2: THE COST
const slide2 = prs.addSlide('LINKEDIN');
slide2.background = { color: colors.darkNavy };
slide2.addText('Delays cost $2M+ per month', {
  x: 0.15, y: 0.12, w: 1.61, h: 0.28,
  fontSize: 44, bold: true, color: colors.mint,
  fontFace: 'Georgia'
});

const costs = [
  '— Legal fees still running',
  '— Investment banker retainers',
  '— Executive time (100% distracted)',
  '— Team morale tanking'
];

let yPos = 0.45;
costs.forEach(cost => {
  slide2.addText(cost, {
    x: 0.20, y: yPos, w: 1.51, h: 0.11,
    fontSize: 15, color: colors.white,
    fontFace: 'Calibri'
  });
  yPos += 0.12;
});

// Slide 3: THE PROBLEM
const slide3 = prs.addSlide('LINKEDIN');
slide3.background = { color: colors.offWhite };
slide3.addText('You\'re flying blind.', {
  x: 0.15, y: 0.08, w: 1.61, h: 0.20,
  fontSize: 36, bold: true, color: colors.darkNavy,
  fontFace: 'Georgia'
});

slide3.addText('Nobody knows which 200 tasks are done. Which 400 aren\'t. What\'s actually blocking you right now.', {
  x: 0.15, y: 0.32, w: 1.61, h: 0.32,
  fontSize: 17, color: colors.darkGray,
  fontFace: 'Calibri', align: 'left'
});

slide3.addText('You\'re managing IPO in emails and spreadsheets. CEO finds out delays from a board call.', {
  x: 0.15, y: 0.68, w: 1.61, h: 0.28,
  fontSize: 14, color: colors.red, italic: true,
  fontFace: 'Calibri'
});

// Slide 4: THE SOLUTION
const slide4 = prs.addSlide('LINKEDIN');
slide4.background = { color: colors.teal };
slide4.addText('Meet your IPO command center.', {
  x: 0.15, y: 0.15, w: 1.61, h: 0.30,
  fontSize: 40, bold: true, color: colors.white,
  fontFace: 'Georgia'
});

slide4.addShape('rect', {
  x: 0.15, y: 0.50, w: 1.61, h: 0.04,
  fill: { color: colors.mint },
  line: { type: 'none' }
});

slide4.addText('✓ See every task in real time\n✓ Know what\'s blocking you TODAY\n✓ Predict your close date (with 92% accuracy)\n✓ Move faster than everyone thought possible', {
  x: 0.20, y: 0.58, w: 1.51, h: 0.35,
  fontSize: 14, color: colors.white,
  fontFace: 'Calibri'
});

// Slide 5: THE PROOF
const slide5 = prs.addSlide('LINKEDIN');
slide5.background = { color: colors.white };
slide5.addText('Real results. Real companies.', {
  x: 0.15, y: 0.10, w: 1.61, h: 0.20,
  fontSize: 32, bold: true, color: colors.darkNavy,
  fontFace: 'Georgia'
});

slide5.addShape('rect', {
  x: 0.15, y: 0.32, w: 0.75, h: 0.55,
  fill: { color: colors.mint },
  line: { type: 'none' }
});
slide5.addText('6 WEEKS', {
  x: 0.15, y: 0.38, w: 0.75, h: 0.15,
  fontSize: 28, bold: true, color: colors.darkNavy,
  align: 'center'
});
slide5.addText('Faster to close', {
  x: 0.15, y: 0.56, w: 0.75, h: 0.12,
  fontSize: 13, color: colors.darkNavy,
  align: 'center'
});

slide5.addShape('rect', {
  x: 1.01, y: 0.32, w: 0.75, h: 0.55,
  fill: { color: colors.teal },
  line: { type: 'none' }
});
slide5.addText('$3M+', {
  x: 1.01, y: 0.38, w: 0.75, h: 0.15,
  fontSize: 28, bold: true, color: colors.white,
  align: 'center'
});
slide5.addText('In avoided delays', {
  x: 1.01, y: 0.56, w: 0.75, h: 0.12,
  fontSize: 13, color: colors.white,
  align: 'center'
});

// Slide 6: THE MOVE
const slide6 = prs.addSlide('LINKEDIN');
slide6.background = { color: colors.darkNavy };
slide6.addText('IPOReady', {
  x: 0.15, y: 0.12, w: 1.61, h: 0.20,
  fontSize: 44, bold: true, color: colors.mint,
  fontFace: 'Georgia'
});
slide6.addText('North America\'s #1 IPO command center', {
  x: 0.15, y: 0.34, w: 1.61, h: 0.15,
  fontSize: 16, color: colors.white,
  fontFace: 'Calibri'
});

slide6.addShape('rect', {
  x: 0.15, y: 0.53, w: 1.61, h: 0.30,
  fill: { color: colors.mint },
  line: { type: 'none' }
});
slide6.addText('Beta access now open\n→ ipoready.ai', {
  x: 0.15, y: 0.53, w: 1.61, h: 0.30,
  fontSize: 16, bold: true, color: colors.darkNavy,
  align: 'center', valign: 'middle'
});

prs.writeFile({ fileName: '/Users/test/Documents/Claude/Projects/IPOReady/ipoready-linkedin-campaign-v2.pptx' });
console.log('✅ Bold LinkedIn campaign created: ipoready-linkedin-campaign-v2.pptx');
