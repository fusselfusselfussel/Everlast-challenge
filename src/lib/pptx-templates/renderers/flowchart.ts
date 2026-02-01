import type { FlowchartSlideContent } from '../../../types/ai-response';
import type { TemplateConfig } from '../types';

export function renderFlowchartSlide(pres: any, content: FlowchartSlideContent, config: TemplateConfig) {
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

  const startY = 1.5;
  const maxSteps = Math.min(content.steps.length, 5);
  const stepHeight = 0.8;
  const arrowHeight = 0.3;
  const totalHeight = maxSteps * stepHeight + (maxSteps - 1) * arrowHeight;
  const availableHeight = 5.5 - startY;
  const scaleFactor = Math.min(1, availableHeight / totalHeight);
  
  const finalStepHeight = stepHeight * scaleFactor;
  const finalArrowHeight = arrowHeight * scaleFactor;

  content.steps.slice(0, maxSteps).forEach((step, index) => {
    const y = startY + index * (finalStepHeight + finalArrowHeight);
    
    slide.addShape(pres.ShapeType.rect, {
      x: 1.5,
      y: y,
      w: 7,
      h: finalStepHeight,
      fill: { color: config.colors.background },
      line: { color: config.colors.border, width: 3 },
    });

    slide.addText(`Step ${index + 1}`, {
      x: 1.6,
      y: y + 0.05,
      w: 6.8,
      h: 0.2,
      fontSize: 10,
      bold: true,
      color: config.colors.primary,
      fontFace: 'Inter',
      align: 'center',
    });

    slide.addText(step.step, {
      x: 1.6,
      y: y + 0.25,
      w: 6.8,
      h: 0.25,
      fontSize: 13,
      bold: true,
      color: config.colors.primary,
      fontFace: 'Inter',
      align: 'center',
    });

    if (step.description) {
      slide.addText(step.description, {
        x: 1.6,
        y: y + 0.5,
        w: 6.8,
        h: finalStepHeight - 0.55,
        fontSize: 9,
        color: config.colors.primary,
        fontFace: 'Inter',
        align: 'center',
        valign: 'top',
      });
    }

    if (index < maxSteps - 1) {
      const arrowY = y + finalStepHeight;
      const arrowCenterX = 5;
      
      slide.addShape(pres.ShapeType.line, {
        x: arrowCenterX,
        y: arrowY,
        w: 0,
        h: finalArrowHeight - 0.1,
        line: { color: config.colors.primary, width: 3 },
      });
      
      slide.addShape(pres.ShapeType.triangle, {
        x: arrowCenterX - 0.1,
        y: arrowY + finalArrowHeight - 0.15,
        w: 0.2,
        h: 0.15,
        fill: { color: config.colors.primary },
        rotate: 180,
      });
    }
  });
}
