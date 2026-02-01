import { ollamaClient } from '../ollama-client';
import { SegmentationResponseSchema, SegmentationResponse } from '../../types/ai-response';

const SEGMENTATION_PROMPT = `You are an AI assistant that analyzes transcripts and breaks them into logical presentation slides.

Your task: Analyze the following transcript and identify distinct topics that should each become a separate slide. Order them logically for a presentation flow.

Guidelines:
- Each topic should be substantial enough for a slide (not too granular)
- Typical presentations have 5-10 slides (adjust based on content)
- Order topics logically (intro → body → conclusion)
- Provide context for each topic (what will be discussed)
- Use clear, concise titles

Transcript:
{transcript}

Respond with JSON in this exact format:
{
  "topics": [
    {
      "title": "Introduction",
      "context": "Brief overview of what this slide will cover",
      "order": 1
    },
    {
      "title": "Main Point 1",
      "context": "Details about the first main point",
      "order": 2
    }
  ]
}`;

export async function segmentTranscript(transcript: string): Promise<SegmentationResponse> {
  const prompt = SEGMENTATION_PROMPT.replace('{transcript}', transcript);
  
  console.log('[AI Pipeline] Stage 2: Segmenting into topics...');
  
  try {
    const rawResponse = await ollamaClient.generateJSON(prompt, {
      temperature: 0.4,
    });

    const validated = SegmentationResponseSchema.parse(rawResponse);
    
    console.log(`[AI Pipeline] Stage 2 complete. Found ${validated.topics.length} topics`);
    validated.topics.forEach((topic, idx) => {
      console.log(`  ${idx + 1}. ${topic.title}`);
    });
    
    return validated;
  } catch (error) {
    console.error('[AI Pipeline] Stage 2 failed:', error);
    throw new Error(`Segmentation stage failed: ${error}`);
  }
}
