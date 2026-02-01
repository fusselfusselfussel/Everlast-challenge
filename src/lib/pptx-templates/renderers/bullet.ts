import type { BulletSlideContent } from '../../../types/ai-response';
import type { TemplateConfig } from '../types';

function addDecorativeCorners(slide: any, config: TemplateConfig) {
  const cornerSize = 0.9;
  const corners = [
    { x: 0.23, y: 0.23, borders: { L: { pt: 2, color: config.colors.border }, T: { pt: 2, color: config.colors.border } } },
    { x: 10 - 0.23 - cornerSize, y: 0.23, borders: { R: { pt: 2, color: config.colors.border }, T: { pt: 2, color: config.colors.border } } },
    { x: 0.23, y: 5.625 - 0.23 - cornerSize, borders: { L: { pt: 2, color: config.colors.border }, B: { pt: 2, color: config.colors.border } } },
    { x: 10 - 0.23 - cornerSize, y: 5.625 - 0.23 - cornerSize, borders: { R: { pt: 2, color: config.colors.border }, B: { pt: 2, color: config.colors.border } } },
  ];
  
  corners.forEach(corner => {
    slide.addShape('rect', {
      x: corner.x,
      y: corner.y,
      w: cornerSize,
      h: cornerSize,
      fill: { color: config.colors.background, transparency: 100 },
      line: corner.borders,
    });
  });
}

function addDecorativeCircles(slide: any, config: TemplateConfig) {
  const circleSize = 0.8;
  
  slide.addShape('ellipse', {
    x: 5 - circleSize / 2,
    y: 0.4,
    w: circleSize,
    h: circleSize,
    fill: { color: config.colors.background, transparency: 100 },
    line: { color: config.colors.primary, width: 2, transparency: 85 },
  });
  
  slide.addShape('ellipse', {
    x: 5 - circleSize / 2,
    y: 5.625 - 0.4 - circleSize,
    w: circleSize,
    h: circleSize,
    fill: { color: config.colors.background, transparency: 100 },
    line: { color: config.colors.primary, width: 2, transparency: 85 },
  });
}

export function renderBulletSlide(pres: any, content: BulletSlideContent, config: TemplateConfig) {
  const slide = pres.addSlide();
  
  slide.background = { color: config.colors.background };

  const isOrganic = config.name === 'Organic Warm';
  const isModernBlue = config.name === 'Modern Blue';
  const isDarkYellow = config.name === 'Dark Yellow';
  
  if (isOrganic || isModernBlue) {
    addDecorativeCorners(slide, config);
    addDecorativeCircles(slide, config);
  }

  slide.addText(content.title, {
    x: 0.55,
    y: 0.47,
    w: 8.9,
    h: 0.5,
    fontSize: config.fonts.heading.size,
    bold: true,
    color: config.colors.primary,
    fontFace: isDarkYellow ? 'Inter' : isOrganic ? 'Playfair Display' : 'Montserrat',
  });

  slide.addShape('rect', {
    x: 0.55,
    y: 1.03,
    w: 8.9,
    h: 0.03,
    fill: { color: isOrganic ? config.colors.border : config.colors.primary },
  });

  if (isOrganic) {
    slide.addShape('rect', {
      x: 8.9,
      y: 1.03,
      w: 0.55,
      h: 0.03,
      fill: { color: config.colors.primary, transparency: 40 },
    });
  }

  const startY = 1.3;
  const bulletSpacing = 0.15;
  const maxBullets = Math.min(content.bullets.length, 5);
  const bulletHeight = (5.3 - startY) / maxBullets - bulletSpacing;

  content.bullets.slice(0, maxBullets).forEach((bullet, index) => {
    const y = startY + index * (bulletHeight + bulletSpacing);
    
    slide.addShape('rect', {
      x: 0.55,
      y: y,
      w: 8.9,
      h: bulletHeight,
      fill: { color: config.colors.background, transparency: 100 },
      line: { color: isOrganic ? config.colors.border : config.colors.primary, width: 2 },
    });

    if (isModernBlue) {
      slide.addShape('ellipse', {
        x: 0.73,
        y: y + (bulletHeight - 0.35) / 2,
        w: 0.35,
        h: 0.35,
        fill: { color: config.colors.primary },
      });
      
      slide.addText((index + 1).toString(), {
        x: 0.73,
        y: y + (bulletHeight - 0.35) / 2,
        w: 0.35,
        h: 0.35,
        fontSize: 16,
        bold: true,
        color: 'FFFFFF',
        align: 'center',
        valign: 'middle',
        fontFace: 'Montserrat',
      });
      
      var markerWidth = 0.5;
    } else {
      slide.addShape('ellipse', {
        x: 0.7,
        y: y + 0.12,
        w: 0.11,
        h: 0.11,
        fill: { color: config.colors.primary },
      });
      
      var markerWidth = 0.25;
    }

    const textX = 0.7 + markerWidth;
    const textW = 8.9 - markerWidth - 0.35;
    
    if (bullet.subPoints && bullet.subPoints.length > 0) {
      const titleFontSize = isOrganic ? 20 : isModernBlue ? 19 : 16;
      slide.addText(bullet.text, {
        x: textX,
        y: y + 0.08,
        w: textW,
        h: 0.25,
        fontSize: titleFontSize,
        bold: true,
        color: config.colors.primary,
        fontFace: isDarkYellow ? 'Inter' : isOrganic ? 'Playfair Display' : 'Montserrat',
      });

      const subBulletText = bullet.subPoints.map(sp => `  • ${sp}`).join('\n');
      slide.addText(subBulletText, {
        x: textX + 0.15,
        y: y + 0.35,
        w: textW - 0.15,
        h: bulletHeight - 0.43,
        fontSize: config.fonts.body.size,
        color: config.colors.text,
        fontFace: isDarkYellow ? 'Inter' : 'Lato',
        valign: 'top',
      });
    } else {
      const textFontSize = isOrganic ? 16 : isModernBlue ? 16 : 14;
      slide.addText(bullet.text, {
        x: textX,
        y: y + 0.08,
        w: textW,
        h: bulletHeight - 0.16,
        fontSize: textFontSize,
        color: config.colors.text,
        fontFace: isDarkYellow ? 'Inter' : 'Lato',
        valign: 'middle',
      });
    }
  });
}
