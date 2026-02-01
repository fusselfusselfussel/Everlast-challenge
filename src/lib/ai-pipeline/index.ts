import { paraphraseTranscript } from './stage-1-paraphrase';
import { segmentTranscript } from './stage-2-segment';
import { selectTemplate } from './stage-3-template-select';
import { extractContent } from './stage-4-extract-content';
import { verifyWithRetry } from './verify-stage';
import { SlideData, Topic } from '../../types/ai-response';

export interface PipelineOptions {
  recursion: boolean;
  onProgress?: (stage: string, progress: number, total: number) => void;
}

export interface PipelineResult {
  slides: SlideData[];
  metadata: {
    startTime: number;
    endTime: number;
    duration: number;
    recursionEnabled: boolean;
    totalStages: number;
  };
}

export class AIPipeline {
  private options: PipelineOptions;
  private currentStage: number = 0;
  private totalStages: number = 0;

  constructor(options: PipelineOptions) {
    this.options = options;
  }

  private emitProgress(stage: string) {
    this.currentStage++;
    if (this.options.onProgress) {
      this.options.onProgress(stage, this.currentStage, this.totalStages);
    }
  }

  async run(transcript: string): Promise<PipelineResult> {
    const startTime = Date.now();

    console.log('='.repeat(60));
    console.log('[AI Pipeline] Starting enrichment pipeline');
    console.log(`[AI Pipeline] Recursion: ${this.options.recursion ? 'ENABLED' : 'DISABLED'}`);
    console.log(`[AI Pipeline] Transcript length: ${transcript.length} characters`);
    console.log('='.repeat(60));

    try {
      this.currentStage = 0;
      this.totalStages = this.options.recursion ? 9 : 5;

      console.log('\n[AI Pipeline] === STAGE 1: PARAPHRASE ===');
      this.emitProgress('Paraphrasing transcript');
      const paraphraseResult = this.options.recursion
        ? await verifyWithRetry('Paraphrase', () => paraphraseTranscript(transcript), transcript)
        : await paraphraseTranscript(transcript);

      console.log('\n[AI Pipeline] === STAGE 2: SEGMENTATION ===');
      this.emitProgress('Segmenting into topics');
      const segmentResult = this.options.recursion
        ? await verifyWithRetry('Segmentation', () => segmentTranscript(transcript), transcript)
        : await segmentTranscript(transcript);

      const topics = segmentResult.topics.sort((a: Topic, b: Topic) => a.order - b.order);
      console.log(`\n[AI Pipeline] Processing ${topics.length} topics...`);

      const slides: SlideData[] = [];

      console.log('\n[AI Pipeline] === ADDING TITLE SLIDE ===');
      this.emitProgress('Creating title slide');
      
      const titleSlide: SlideData = {
        type: 'title',
        content: {
          title: topics[0]?.title || 'Presentation',
          subtitle: `Generated from transcript on ${new Date().toLocaleDateString()}`
        },
        order: 0,
      };
      slides.push(titleSlide);
      console.log('[AI Pipeline] ✓ Title slide created');

      for (let i = 0; i < topics.length; i++) {
        const topic = topics[i];

        console.log(`\n[AI Pipeline] === TOPIC ${i + 1}/${topics.length}: ${topic.title} ===`);

        console.log('[AI Pipeline] === STAGE 3: TEMPLATE SELECTION ===');
        this.emitProgress(`Selecting template for "${topic.title}"`);
        const templateResult = this.options.recursion
          ? await verifyWithRetry(
              `Template Selection (${topic.title})`,
              () => selectTemplate(topic, transcript),
              transcript
            )
          : await selectTemplate(topic, transcript);

        console.log('[AI Pipeline] === STAGE 4: CONTENT EXTRACTION ===');
        this.emitProgress(`Extracting content for "${topic.title}"`);
        const contentResult = this.options.recursion
          ? await verifyWithRetry(
              `Content Extraction (${topic.title})`,
              () => extractContent(topic, templateResult.type, transcript),
              transcript
            )
          : await extractContent(topic, templateResult.type, transcript);

        slides.push({
          type: templateResult.type,
          content: contentResult,
          order: topic.order + 1,
        });

        console.log(`[AI Pipeline] ✓ Slide ${i + 1} complete: ${templateResult.type}`);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log('\n' + '='.repeat(60));
      console.log('[AI Pipeline] ✅ Pipeline complete!');
      console.log(`[AI Pipeline] Generated ${slides.length} slides in ${(duration / 1000).toFixed(2)}s`);
      console.log('='.repeat(60));

      slides.forEach((slide, idx) => {
        console.log(`  ${idx + 1}. ${slide.type.toUpperCase()}: ${(slide.content as any).title}`);
      });

      return {
        slides: slides.sort((a: SlideData, b: SlideData) => a.order - b.order),
        metadata: {
          startTime,
          endTime,
          duration,
          recursionEnabled: this.options.recursion,
          totalStages: this.totalStages,
        },
      };
    } catch (error) {
      console.error('\n[AI Pipeline] ❌ Pipeline failed:', error);
      throw error;
    }
  }
}

export async function runAIPipeline(
  transcript: string,
  options: PipelineOptions = { recursion: false }
): Promise<PipelineResult> {
  const pipeline = new AIPipeline(options);
  return pipeline.run(transcript);
}

export * from './stage-1-paraphrase';
export * from './stage-2-segment';
export * from './stage-3-template-select';
export * from './stage-4-extract-content';
export * from './verify-stage';
