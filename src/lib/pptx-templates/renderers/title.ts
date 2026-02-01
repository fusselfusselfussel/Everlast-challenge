import type { TitleSlideContent } from '../../../types/ai-response';
import type { TemplateConfig } from '../types';

function addDecorativeCorners(slide: any, config: TemplateConfig, isOrganic: boolean) {
  const cornerSize = isOrganic ? 1.5 : 1.2;
  const corners = [
    { x: 0.3, y: 0.3, borders: { L: { pt: 3, color: config.colors.border }, T: { pt: 3, color: config.colors.border } } },
    { x: 10 - 0.3 - cornerSize, y: 0.3, borders: { R: { pt: 3, color: config.colors.border }, T: { pt: 3, color: config.colors.border } } },
    { x: 0.3, y: 5.625 - 0.3 - cornerSize, borders: { L: { pt: 3, color: config.colors.border }, B: { pt: 3, color: config.colors.border } } },
    { x: 10 - 0.3 - cornerSize, y: 5.625 - 0.3 - cornerSize, borders: { R: { pt: 3, color: config.colors.border }, B: { pt: 3, color: config.colors.border } } },
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

function addDecorativeCircles(slide: any, config: TemplateConfig, isTitle: boolean = false) {
  const circleSize = isTitle ? 1.2 : 0.8;
  const opacity = 15;
  
  if (isTitle) {
    slide.addShape('ellipse', {
      x: 5 - circleSize / 2,
      y: 0.5,
      w: circleSize,
      h: circleSize,
      fill: { color: config.colors.background, transparency: 100 },
      line: { color: config.colors.primary, width: 3, transparency: 85 },
    });
    
    slide.addShape('ellipse', {
      x: 5 - circleSize / 2,
      y: 5.625 - 0.5 - circleSize,
      w: circleSize,
      h: circleSize,
      fill: { color: config.colors.background, transparency: 100 },
      line: { color: config.colors.primary, width: 3, transparency: 85 },
    });
  } else {
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
}

export function renderTitleSlide(pres: any, content: TitleSlideContent, config: TemplateConfig) {
  const slide = pres.addSlide();
  
  slide.background = { color: config.colors.background };

  const isOrganic = config.name === 'Organic Warm';
  const isDarkYellow = config.name === 'Dark Yellow';
  
  if (isOrganic) {
    addDecorativeCorners(slide, config, true);
    addDecorativeCircles(slide, config, true);
  }

  const titleY = 2.1;
  const titleW = 7;
  const titleH = 1.5;
  const titleX = (10 - titleW) / 2;

  slide.addText(content.title, {
    x: titleX,
    y: titleY,
    w: titleW,
    h: titleH,
    fontSize: config.fonts.title.size,
    bold: true,
    color: config.colors.primary,
    align: 'center',
    valign: 'middle',
    fontFace: isDarkYellow ? 'Inter' : isOrganic ? 'Playfair Display' : 'Montserrat',
  });

  const decorativeY = titleY + titleH + 0.15;
  const decorativeW = 1.5;
  const decorativeX = (10 - decorativeW) / 2;
  
  if (isDarkYellow) {
    slide.addShape('rect', {
      x: decorativeX,
      y: decorativeY,
      w: decorativeW,
      h: 0.05,
      fill: { color: config.colors.primary },
    });
  } else if (isOrganic) {
    slide.addShape('rect', {
      x: decorativeX - 0.3,
      y: decorativeY,
      w: decorativeW + 0.6,
      h: 0.04,
      fill: { type: 'solid', color: config.colors.border },
    });
  }

  if (content.subtitle) {
    const subtitleY = decorativeY + 0.25;
    
    slide.addText(content.subtitle, {
      x: titleX,
      y: subtitleY,
      w: titleW,
      h: 0.6,
      fontSize: config.fonts.subtitle.size,
      bold: false,
      color: isOrganic ? config.colors.border : config.colors.primary,
      align: 'center',
      valign: 'top',
      fontFace: isDarkYellow ? 'Inter' : isOrganic ? 'Lato' : 'Montserrat',
    });
  }

  const borderThickness = isOrganic ? 0.04 : 0.03;
  const borderPadding = isOrganic ? 1.0 : 0.8;
  
  slide.addShape('rect', {
    x: titleX - borderPadding,
    y: titleY - borderPadding,
    w: titleW + borderPadding * 2,
    h: (content.subtitle ? 3.5 : 2.5),
    fill: { color: config.colors.background, transparency: 100 },
    line: { color: isOrganic ? config.colors.border : config.colors.primary, width: borderThickness * 72 },
  });
}
