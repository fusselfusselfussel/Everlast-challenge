import { ollamaClient } from '../ollama-client';
import { TemplateSelectionResponseSchema, TemplateSelectionResponse, Topic } from '../../types/ai-response';

const TEMPLATE_SELECTION_PROMPT = `You are an AI assistant that selects the best PowerPoint slide template for presentation content.

Available slide templates:
1. "title" - Large title + subtitle (use for opening/closing slides)
2. "bullet" - Title + bullet points (use for lists, key points, benefits)
3. "table" - Title + data table (use for comparisons, data, structured info)
4. "flowchart" - Title + sequential steps (use for processes, workflows, timelines)
5. "two-column" - Title + left/right comparison (use for pros/cons, before/after, comparisons)

Topic Information:
Title: {title}
Context: {context}

Original Transcript (for reference):
{transcript}

Your task: Choose the MOST APPROPRIATE template type for this topic based on the content that needs to be presented.

Respond with JSON in this exact format:
{
  "topic": "{title}",
  "type": "bullet",
  "reasoning": "Brief explanation of why this template fits best"
}`;

export async function selectTemplate(topic: Topic, transcript: string): Promise<TemplateSelectionResponse> {
  const prompt = TEMPLATE_SELECTION_PROMPT
    .replace('{title}', topic.title)
    .replace('{context}', topic.context)
    .replace('{transcript}', transcript)
    .replace('{title}', topic.title);
  
  console.log(`[AI Pipeline] Stage 3: Selecting template for "${topic.title}"...`);
  
  try {
    const rawResponse = await ollamaClient.generateJSON(prompt, {
      temperature: 0.3,
    });

    const validated = TemplateSelectionResponseSchema.parse(rawResponse);
    
    console.log(`[AI Pipeline] Stage 3 complete. Selected: ${validated.type}`);
    if (validated.reasoning) {
      console.log(`  Reasoning: ${validated.reasoning}`);
    }
    
    return validated;
  } catch (error) {
    console.error('[AI Pipeline] Stage 3 failed:', error);
    throw new Error(`Template selection failed for topic "${topic.title}": ${error}`);
  }
}
