import type { TableSlideContent } from '../../../types/ai-response';
import type { TemplateConfig } from '../types';

export function renderTableSlide(pres: any, content: TableSlideContent, config: TemplateConfig) {
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

  const tableData = [
    content.headers.map((header: string) => ({
      text: header,
      options: {
        bold: true,
        fontSize: 12,
        color: '000000',
        fill: { color: config.colors.primary },
        align: 'center',
        valign: 'middle',
      },
    })),
    ...content.rows.map((row: string[]) =>
      row.map((cell: string) => ({
        text: cell,
        options: {
          fontSize: 11,
          color: config.colors.primary,
          fill: { color: config.colors.background },
          align: 'center',
          valign: 'middle',
        },
      }))
    ),
  ];

  const tableX = 0.5;
  const tableY = 1.5;
  const tableW = 9;
  const tableH = 4;

  slide.addTable(tableData, {
    x: tableX,
    y: tableY,
    w: tableW,
    h: tableH,
    border: { pt: 2, color: config.colors.border },
    fontFace: 'Inter',
  });
}
