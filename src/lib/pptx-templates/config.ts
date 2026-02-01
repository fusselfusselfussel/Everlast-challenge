import type { TemplateConfig } from './types';

export const DARK_YELLOW_TEMPLATE: TemplateConfig = {
  name: 'Dark Yellow',
  colors: {
    background: '000000',
    primary: 'FFFF00',
    text: 'FFFFFF',
    border: 'FFFF00',
  },
  fonts: {
    title: { size: 72, bold: true, color: 'FFFF00' },
    subtitle: { size: 24, bold: false, color: 'FFFF00' },
    heading: { size: 32, bold: true, color: 'FFFF00' },
    body: { size: 16, bold: false, color: 'FFFF00' },
    small: { size: 14, bold: false, color: 'FFFF00' },
  },
};

export const MODERN_BLUE_TEMPLATE: TemplateConfig = {
  name: 'Modern Blue',
  colors: {
    background: 'FFFFFF',
    primary: '2563EB',
    text: '000000',
    border: '2563EB',
  },
  fonts: {
    title: { size: 64, bold: true, color: '2563EB' },
    subtitle: { size: 22, bold: false, color: '2563EB' },
    heading: { size: 32, bold: true, color: '2563EB' },
    body: { size: 16, bold: false, color: '000000' },
    small: { size: 14, bold: false, color: '000000' },
  },
};

export const ORGANIC_WARM_TEMPLATE: TemplateConfig = {
  name: 'Organic Warm',
  colors: {
    background: 'F5F5DC',
    primary: 'FF8C00',
    text: '8B7355',
    border: 'C4A048',
  },
  fonts: {
    title: { size: 56, bold: true, color: 'FF8C00' },
    subtitle: { size: 20, bold: false, color: 'C4A048' },
    heading: { size: 32, bold: true, color: 'FF8C00' },
    body: { size: 16, bold: false, color: '8B7355' },
    small: { size: 14, bold: false, color: '8B7355' },
  },
};

export const DEFAULT_TEMPLATE = DARK_YELLOW_TEMPLATE;
