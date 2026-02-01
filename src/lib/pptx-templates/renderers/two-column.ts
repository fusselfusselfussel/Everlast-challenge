import type { TwoColumnSlideContent } from '../../../types/ai-response';
import type { TemplateConfig } from '../types';

export function renderTwoColumnSlide(pres: any, content: TwoColumnSlideContent, config: TemplateConfig) {
  const slide = pres.addSlide();
  
  slide.background = { color: config.colors.background };

  slide.addText(content.title, {
    x: 0.5,
    y: 0.4,
    w: 9,
    h: 0.6,
    fontSize: 20,
    bold: true,
    color: config.colors.primary,
    fontFace: 'Inter',
  });

  slide.addShape(pres.ShapeType.rect, {
    x: 0.5,
    y: 1.05,
    w: 9,
    h: 0.03,
    fill: { color: config.colors.border },
  });

  const columnWidth = 4.25;
  const columnHeight = 4;
  const columnY = 1.5;
  const leftX = 0.5;
  const rightX = 5.25;

  slide.addShape(pres.ShapeType.rect, {
    x: leftX,
    y: columnY,
    w: columnWidth,
    h: columnHeight,
    fill: { color: config.colors.background },
    line: { color: config.colors.border, width: 3 },
  });

  slide.addText(content.leftTitle, {
    x: leftX + 0.2,
    y: columnY + 0.15,
    w: columnWidth - 0.4,
    h: 0.4,
    fontSize: 14,
    bold: true,
    color: config.colors.primary,
    fontFace: 'Inter',
    align: 'center',
  });

  slide.addShape(pres.ShapeType.rect, {
    x: leftX + 0.2,
    y: columnY + 0.6,
    w: columnWidth - 0.4,
    h: 0.02,
    fill: { color: config.colors.border },
  });

  const leftContentText = content.leftContent.map((item, idx) => `${idx + 1}. ${item}`).join('\n\n');
  slide.addText(leftContentText, {
    x: leftX + 0.3,
    y: columnY + 0.75,
    w: columnWidth - 0.6,
    h: columnHeight - 1,
    fontSize: 11,
    color: config.colors.primary,
    fontFace: 'Inter',
    valign: 'top',
  });

  slide.addShape(pres.ShapeType.rect, {
    x: rightX,
    y: columnY,
    w: columnWidth,
    h: columnHeight,
    fill: { color: config.colors.background },
    line: { color: config.colors.border, width: 3 },
  });

  slide.addText(content.rightTitle, {
    x: rightX + 0.2,
    y: columnY + 0.15,
    w: columnWidth - 0.4,
    h: 0.4,
    fontSize: 14,
    bold: true,
    color: config.colors.primary,
    fontFace: 'Inter',
    align: 'center',
  });

  slide.addShape(pres.ShapeType.rect, {
    x: rightX + 0.2,
    y: columnY + 0.6,
    w: columnWidth - 0.4,
    h: 0.02,
    fill: { color: config.colors.border },
  });

  const rightContentText = content.rightContent.map((item, idx) => `${idx + 1}. ${item}`).join('\n\n');
  slide.addText(rightContentText, {
    x: rightX + 0.3,
    y: columnY + 0.75,
    w: columnWidth - 0.6,
    h: columnHeight - 1,
    fontSize: 11,
    color: config.colors.primary,
    fontFace: 'Inter',
    valign: 'top',
  });
}
