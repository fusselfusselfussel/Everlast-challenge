import { z } from 'zod';

export const ParaphraseResponseSchema = z.object({
  paraphrase: z.string().min(10),
  confidence: z.number().min(0).max(1).optional(),
});

export type ParaphraseResponse = z.infer<typeof ParaphraseResponseSchema>;

export const TopicSchema = z.object({
  title: z.string().min(1),
  context: z.string().min(1),
  order: z.number().int().positive(),
});

export const SegmentationResponseSchema = z.object({
  topics: z.array(TopicSchema).min(1),
});

export type Topic = z.infer<typeof TopicSchema>;
export type SegmentationResponse = z.infer<typeof SegmentationResponseSchema>;

export const SlideTypeSchema = z.enum(['title', 'bullet', 'table', 'flowchart', 'two-column']);

export type SlideType = z.infer<typeof SlideTypeSchema>;

export const TemplateSelectionResponseSchema = z.object({
  topic: z.string(),
  type: SlideTypeSchema,
  reasoning: z.string().optional(),
});

export type TemplateSelectionResponse = z.infer<typeof TemplateSelectionResponseSchema>;

export const BulletPointSchema = z.object({
  text: z.string(),
  subPoints: z.array(z.string()).optional(),
});

export const BulletSlideContentSchema = z.object({
  title: z.string(),
  bullets: z.array(BulletPointSchema),
});

export type BulletSlideContent = z.infer<typeof BulletSlideContentSchema>;

export const TableSlideContentSchema = z.object({
  title: z.string(),
  headers: z.array(z.string()),
  rows: z.array(z.array(z.string())),
});

export type TableSlideContent = z.infer<typeof TableSlideContentSchema>;

export const FlowchartStepSchema = z.object({
  step: z.string(),
  description: z.string().optional(),
});

export const FlowchartSlideContentSchema = z.object({
  title: z.string(),
  steps: z.array(FlowchartStepSchema),
});

export type FlowchartSlideContent = z.infer<typeof FlowchartSlideContentSchema>;

export const TwoColumnSlideContentSchema = z.object({
  title: z.string(),
  leftTitle: z.string(),
  leftContent: z.array(z.string()),
  rightTitle: z.string(),
  rightContent: z.array(z.string()),
});

export type TwoColumnSlideContent = z.infer<typeof TwoColumnSlideContentSchema>;

export const TitleSlideContentSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
});

export type TitleSlideContent = z.infer<typeof TitleSlideContentSchema>;

export const SlideContentSchema = z.union([
  BulletSlideContentSchema,
  TableSlideContentSchema,
  FlowchartSlideContentSchema,
  TwoColumnSlideContentSchema,
  TitleSlideContentSchema,
]);

export type SlideContent = z.infer<typeof SlideContentSchema>;

export const SlideDataSchema = z.object({
  type: SlideTypeSchema,
  content: SlideContentSchema,
  order: z.number().int().positive(),
});

export type SlideData = z.infer<typeof SlideDataSchema>;

export const VerificationResponseSchema = z.object({
  valid: z.boolean(),
  issues: z.array(z.string()).optional(),
  confidence: z.number().min(0).max(1).optional(),
});

export type VerificationResponse = z.infer<typeof VerificationResponseSchema>;
