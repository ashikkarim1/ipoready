const PptxGenJS = require('pptxgenjs');

const prs = new PptxGenJS();
prs.defineLayout({ name: 'LINKEDIN', width: 1.91, height: 1.0 });
prs.defaultLayout = 'LINKEDIN';

const colors = {
  navy: '065A82',
  teal: '028090',
  mint: '02C39A',
  white: 'FFFFFF',
  offWhite: 'F5F5F5',
  darkGray: '2C2C2C',
  lightGray: 'E0E0E0'
};

// Slide 1: PACE™ Score Introduction
const slide1 = prs.addSlide('LINKEDIN');
slide1.background = { color: colors.navy };
slide1.addText('PACE™ Score', {
  x: 0.15, y: 0.15, w: 1.61, h: 0.35,
  fontSize: 52, bold: true, color: colors.mint,
  fontFace: 'Georgia'
});
slide1.addText('Your IPO Readiness at a Glance', {
  x: 0.15, y: 0.52, w: 1.61, h: 0.25,
  fontSize: 24, color: colors.white,
  fontFace: 'Calibri'
});
slide1.addShape('ellipse', {
  x: 1.35, y: 0.15, w: 0.40, h: 0.40,
  fill: { color: colors.mint },
  line: { type: 'none' }
});
slide1.addText('92', {
  x: 1.35, y: 0.15, w: 0.40, h: 0.40,
  fontSize: 28, bold: true, color: colors.navy,
  align: 'center', valign: 'middle'
});

// Slide 2: The Problem
const slide2 = prs.addSlide('LINKEDIN');
slide2.background = { color: colors.offWhite };
slide2.addText('IPO Readiness is a Moving Target', {
  x: 0.15, y: 0.12, w: 1.61, h: 0.25,
  fontSize: 36, bold: true, color: colors.navy,
  fontFace: 'Georgia'
});

const challenges = [
  '❌ 8 complex phases to coordinate',
  '❌ Hundreds of tasks across teams',
  '❌ No visibility into progress',
  '❌ Unpredictable timelines'
];

let yPos = 0.42;
challenges.forEach(challenge => {
  slide2.addText(challenge, {
    x: 0.20, y: yPos, w: 1.51, h: 0.12,
    fontSize: 16, color: colors.darkGray,
    fontFace: 'Calibri'
  });
  yPos += 0.14;
});

// Slide 3: The Solution - Workflow
const slide3 = prs.addSlide('LINKEDIN');
slide3.background = { color: colors.white };
slide3.addText('8 Phases. 1 Platform.', {
  x: 0.15, y: 0.10, w: 1.61, h: 0.22,
  fontSize: 40, bold: true, color: colors.navy,
  fontFace: 'Georgia'
});

const phases = [
  { num: '1', label: 'Formation' },
  { num: '2', label: 'Audit' },
  { num: '3', label: 'Legal' },
  { num: '4', label: 'Finance' }
];

let xPos = 0.15;
phases.forEach(phase => {
  slide3.addShape('rect', {
    x: xPos, y: 0.40, w: 0.35, h: 0.35,
    fill: { color: colors.teal },
    line: { type: 'none' }
  });
  slide3.addText(phase.num, {
    x: xPos, y: 0.40, w: 0.35, h: 0.20,
    fontSize: 24, bold: true, color: colors.white,
    align: 'center', valign: 'middle'
  });
  slide3.addText(phase.label, {
    x: xPos, y: 0.60, w: 0.35, h: 0.15,
    fontSize: 11, color: colors.darkGray,
    align: 'center', bold: true
  });
  xPos += 0.38;
});

slide3.addText('Real-time tracking. Team collaboration. Predictive insights.', {
  x: 0.15, y: 0.82, w: 1.61, h: 0.15,
  fontSize: 14, color: colors.lightGray, italic: true,
  fontFace: 'Calibri'
});

// Slide 4: Customer Success
const slide4 = prs.addSlide('LINKEDIN');
slide4.background = { color: colors.mint };
slide4.addText('"We reduced our IPO timeline by 6 weeks"', {
  x: 0.15, y: 0.20, w: 1.61, h: 0.30,
  fontSize: 28, italic: true, color: colors.navy, bold: true,
  fontFace: 'Georgia'
});
slide4.addText('— Series B SaaS Company, TSX-listed 2025', {
  x: 0.15, y: 0.52, w: 1.61, h: 0.15,
  fontSize: 13, color: colors.darkGray,
  fontFace: 'Calibri'
});
slide4.addShape('rect', {
  x: 0.15, y: 0.72, w: 1.61, h: 0.02,
  fill: { color: colors.navy },
  line: { type: 'none' }
});
slide4.addText('Clearer visibility. Faster execution. Real success.', {
  x: 0.15, y: 0.78, w: 1.61, h: 0.18,
  fontSize: 14, color: colors.navy, bold: true,
  fontFace: 'Calibri'
});

// Slide 5: Beta Launch
const slide5 = prs.addSlide('LINKEDIN');
slide5.background = { color: colors.darkGray };
slide5.addText('Now Accepting Beta Partners', {
  x: 0.15, y: 0.18, w: 1.61, h: 0.30,
  fontSize: 40, bold: true, color: colors.mint,
  fontFace: 'Georgia'
});
slide5.addText('Founding customers receive', {
  x: 0.15, y: 0.50, w: 1.61, h: 0.12,
  fontSize: 16, color: colors.white,
  fontFace: 'Calibri'
});

const benefits = [
  '✓ Exclusive pricing',
  '✓ Direct platform input',
  '✓ 1-on-1 support'
];

let benefitY = 0.65;
benefits.forEach(benefit => {
  slide5.addText(benefit, {
    x: 0.20, y: benefitY, w: 1.51, h: 0.10,
    fontSize: 14, color: colors.mint,
    fontFace: 'Calibri'
  });
  benefitY += 0.10;
});

// Slide 6: CTA
const slide6 = prs.addSlide('LINKEDIN');
slide6.background = { color: colors.navy };
slide6.addShape('rect', {
  x: 0.15, y: 0.15, w: 0.35, h: 0.70,
  fill: { color: colors.teal },
  line: { type: 'none' }
});
slide6.addText('🚀', {
  x: 0.15, y: 0.25, w: 0.35, h: 0.30,
  fontSize: 48, align: 'center'
});

slide6.addText('Ready to Launch?', {
  x: 0.55, y: 0.18, w: 1.21, h: 0.25,
  fontSize: 32, bold: true, color: colors.mint,
  fontFace: 'Georgia'
});
slide6.addText('Join 10+ companies accelerating their IPO journey with PACE™', {
  x: 0.55, y: 0.45, w: 1.21, h: 0.25,
  fontSize: 14, color: colors.white,
  fontFace: 'Calibri'
});
slide6.addText('Apply for beta access → ipoready.ai', {
  x: 0.55, y: 0.72, w: 1.21, h: 0.18,
  fontSize: 13, bold: true, color: colors.mint,
  fontFace: 'Calibri'
});

prs.writeFile({ fileName: '/Users/test/Documents/Claude/Projects/IPOReady/ipoready-linkedin-campaign.pptx' });
console.log('✅ LinkedIn campaign created: ipoready-linkedin-campaign.pptx');
