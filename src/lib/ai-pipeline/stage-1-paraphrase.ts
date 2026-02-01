import { ollamaClient } from '../ollama-client';
import { ParaphraseResponseSchema, ParaphraseResponse } from '../../types/ai-response';

const PARAPHRASE_PROMPT = `You are an AI assistant that paraphrases transcripts to confirm understanding.

Your task: Read the following transcript and paraphrase it in your own words. This demonstrates you've understood the content correctly before we proceed with further analysis.

Guidelines:
- Capture the main ideas and key points
- Use different wording while preserving meaning
- Keep the paraphrase concise but comprehensive
- Do not add new information or opinions

Transcript:
{transcript}

Respond with JSON in this exact format:
{
  "paraphrase": "Your paraphrased version here...",
  "confidence": 0.95
}`;

export async function paraphraseTranscript(transcript: string): Promise<ParaphraseResponse> {
  const prompt = PARAPHRASE_PROMPT.replace('{transcript}', transcript);
  
  console.log('[AI Pipeline] Stage 1: Paraphrasing transcript...');
  
  try {
    const rawResponse = await ollamaClient.generateJSON(prompt, {
      temperature: 0.5,
    });

    const validated = ParaphraseResponseSchema.parse(rawResponse);
    
    console.log(`[AI Pipeline] Stage 1 complete. Confidence: ${validated.confidence || 'N/A'}`);
    
    return validated;
  } catch (error) {
    console.error('[AI Pipeline] Stage 1 failed:', error);
    throw new Error(`Paraphrase stage failed: ${error}`);
  }
}
