import PptxGenJS from 'pptxgenjs';
import type { SlideData } from '../../types/ai-response';
import type { TemplateConfig, TemplateRenderers } from './types';
import { DEFAULT_TEMPLATE } from './config';
import { renderTitleSlide } from './renderers/title';
import { renderBulletSlide } from './renderers/bullet';
import { renderTableSlide } from './renderers/table';
import { renderFlowchartSlide } from './renderers/flowchart';
import { renderTwoColumnSlide } from './renderers/two-column';

const renderers: TemplateRenderers = {
  title: renderTitleSlide,
  bullet: renderBulletSlide,
  table: renderTableSlide,
  flowchart: renderFlowchartSlide,
  'two-column': renderTwoColumnSlide,
};

export interface GeneratePPTXOptions {
  template?: TemplateConfig;
  title?: string;
  author?: string;
  subject?: string;
}

export async function generatePPTX(
  slides: SlideData[],
  outputPath: string,
  options: GeneratePPTXOptions = {}
): Promise<string> {
  const config = options.template || DEFAULT_TEMPLATE;
  
  console.log('[PPTX Generator] Initializing presentation...');
  const pres = new PptxGenJS();

  pres.layout = 'LAYOUT_16x9';
  pres.author = options.author || 'Everlast Voice-to-PPTX';
  pres.title = options.title || 'AI Generated Presentation';
  pres.subject = options.subject || 'Generated from voice transcript';

  console.log(`[PPTX Generator] Generating ${slides.length} slides...`);

  const sortedSlides = slides.sort((a, b) => a.order - b.order);

  sortedSlides.forEach((slideData, index) => {
    console.log(`[PPTX Generator] Rendering slide ${index + 1}: ${slideData.type}`);
    
    const renderer = renderers[slideData.type];
    
    if (!renderer) {
      console.error(`[PPTX Generator] Unknown slide type: ${slideData.type}`);
      return;
    }

    try {
      renderer(pres, slideData.content as any, config);
    } catch (error) {
      console.error(`[PPTX Generator] Error rendering slide ${index + 1}:`, error);
      throw error;
    }
  });

  console.log('[PPTX Generator] Writing file...');
  
  try {
    await pres.writeFile({ fileName: outputPath });
    console.log(`[PPTX Generator] ✅ Presentation saved: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('[PPTX Generator] Error writing file:', error);
    throw new Error(`Failed to write PPTX file: ${error}`);
  }
}

export { DEFAULT_TEMPLATE, DARK_YELLOW_TEMPLATE, MODERN_BLUE_TEMPLATE, ORGANIC_WARM_TEMPLATE } from './config';
export type { TemplateConfig, TemplateColors, TemplateFonts } from './types';
