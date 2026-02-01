import { ollamaClient } from '../ollama-client';
import {
  Topic,
  SlideType,
  SlideContent,
  BulletSlideContentSchema,
  TableSlideContentSchema,
  FlowchartSlideContentSchema,
  TwoColumnSlideContentSchema,
  TitleSlideContentSchema,
} from '../../types/ai-response';

const EXTRACT_TITLE_PROMPT = `Extract content for a TITLE slide.

Topic: {title}
Context: {context}

Transcript:
{transcript}

Create a title slide with a main title and optional subtitle.

Respond with JSON:
{
  "title": "Main Title",
  "subtitle": "Optional subtitle or tagline"
}`;

const EXTRACT_BULLET_PROMPT = `Extract content for a BULLET POINTS slide.

Topic: {title}
Context: {context}

Transcript:
{transcript}

Create a bullet point slide with 3-6 main points. Each point can optionally have sub-points.

Guidelines:
- Keep points concise (1-2 lines each)
- Use parallel structure
- Focus on key information from the transcript
- Sub-points are optional but useful for details

Respond with JSON:
{
  "title": "Slide Title",
  "bullets": [
    {
      "text": "Main point 1",
      "subPoints": ["Detail A", "Detail B"]
    },
    {
      "text": "Main point 2"
    }
  ]
}`;

const EXTRACT_TABLE_PROMPT = `Extract content for a TABLE slide.

Topic: {title}
Context: {context}

Transcript:
{transcript}

Create a data table with headers and rows. Tables work best for:
- Comparisons
- Lists of items with attributes
- Data with multiple dimensions

Guidelines:
- 2-5 columns
- 2-6 rows
- Keep cells concise
- Headers should be clear labels

Respond with JSON:
{
  "title": "Slide Title",
  "headers": ["Column 1", "Column 2", "Column 3"],
  "rows": [
    ["Row 1 Col 1", "Row 1 Col 2", "Row 1 Col 3"],
    ["Row 2 Col 1", "Row 2 Col 2", "Row 2 Col 3"]
  ]
}`;

const EXTRACT_FLOWCHART_PROMPT = `Extract content for a FLOWCHART slide.

Topic: {title}
Context: {context}

Transcript:
{transcript}

Create a sequential flowchart showing steps in a process. Best for:
- Workflows
- Processes
- Timelines
- Step-by-step instructions

Guidelines:
- 3-7 steps
- Each step should be a clear action or milestone
- Steps flow in order
- Optional descriptions provide detail

Respond with JSON:
{
  "title": "Slide Title",
  "steps": [
    {
      "step": "Step 1",
      "description": "Optional details about this step"
    },
    {
      "step": "Step 2",
      "description": "More details"
    }
  ]
}`;

const EXTRACT_TWO_COLUMN_PROMPT = `Extract content for a TWO-COLUMN COMPARISON slide.

Topic: {title}
Context: {context}

Transcript:
{transcript}

Create a two-column layout for comparisons. Best for:
- Pros vs Cons
- Before vs After
- Option A vs Option B
- Problem vs Solution

Guidelines:
- Each column has a title/label
- 3-6 points per column
- Points should be comparable/contrasting

Respond with JSON:
{
  "title": "Slide Title",
  "leftTitle": "Left Column Label",
  "leftContent": ["Point 1", "Point 2", "Point 3"],
  "rightTitle": "Right Column Label",
  "rightContent": ["Point 1", "Point 2", "Point 3"]
}`;

export async function extractContent(
  topic: Topic,
  slideType: SlideType,
  transcript: string
): Promise<SlideContent> {
  let prompt: string;
  let schema: any;

  switch (slideType) {
    case 'title':
      prompt = EXTRACT_TITLE_PROMPT;
      schema = TitleSlideContentSchema;
      break;
    case 'bullet':
      prompt = EXTRACT_BULLET_PROMPT;
      schema = BulletSlideContentSchema;
      break;
    case 'table':
      prompt = EXTRACT_TABLE_PROMPT;
      schema = TableSlideContentSchema;
      break;
    case 'flowchart':
      prompt = EXTRACT_FLOWCHART_PROMPT;
      schema = FlowchartSlideContentSchema;
      break;
    case 'two-column':
      prompt = EXTRACT_TWO_COLUMN_PROMPT;
      schema = TwoColumnSlideContentSchema;
      break;
    default:
      throw new Error(`Unknown slide type: ${slideType}`);
  }

  prompt = prompt
    .replace('{title}', topic.title)
    .replace('{context}', topic.context)
    .replace('{transcript}', transcript);

  console.log(`[AI Pipeline] Stage 4: Extracting ${slideType} content for "${topic.title}"...`);

  try {
    const rawResponse = await ollamaClient.generateJSON(prompt, {
      temperature: 0.4,
    });

    const validated = schema.parse(rawResponse);

    console.log(`[AI Pipeline] Stage 4 complete. Extracted ${slideType} content`);

    return validated;
  } catch (error) {
    console.error('[AI Pipeline] Stage 4 failed:', error);
    throw new Error(`Content extraction failed for "${topic.title}" (${slideType}): ${error}`);
  }
}
