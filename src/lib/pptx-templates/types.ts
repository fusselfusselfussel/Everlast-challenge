import type {
  SlideData,
  TitleSlideContent,
  BulletSlideContent,
  TableSlideContent,
  FlowchartSlideContent,
  TwoColumnSlideContent,
} from '../../types/ai-response';

export interface TemplateColors {
  background: string;
  primary: string;
  text: string;
  border: string;
}

export interface TemplateFonts {
  title: { size: number; bold: boolean; color: string };
  subtitle: { size: number; bold: boolean; color: string };
  heading: { size: number; bold: boolean; color: string };
  body: { size: number; bold: boolean; color: string };
  small: { size: number; bold: boolean; color: string };
}

export interface TemplateConfig {
  name: string;
  colors: TemplateColors;
  fonts: TemplateFonts;
}

export type SlideRenderer = (pres: any, slideData: SlideData, config: TemplateConfig) => void;

export interface TemplateRenderers {
  title: (pres: any, content: TitleSlideContent, config: TemplateConfig) => void;
  bullet: (pres: any, content: BulletSlideContent, config: TemplateConfig) => void;
  table: (pres: any, content: TableSlideContent, config: TemplateConfig) => void;
  flowchart: (pres: any, content: FlowchartSlideContent, config: TemplateConfig) => void;
  'two-column': (pres: any, content: TwoColumnSlideContent, config: TemplateConfig) => void;
}
