import { ollamaClient } from '../ollama-client';
import { VerificationResponseSchema, VerificationResponse } from '../../types/ai-response';

const VERIFICATION_PROMPT = `You are an AI assistant that verifies the accuracy of AI-generated content against the original source.

Your task: Check if the AI-generated output is factually accurate and faithful to the original transcript. Identify any hallucinations, fabrications, or misrepresentations.

Stage: {stage}
Original Transcript:
{transcript}

AI-Generated Output:
{output}

Verification Criteria:
1. Factual accuracy - Is all information from the transcript?
2. No hallucinations - Nothing invented or fabricated?
3. Completeness - Are key points captured?
4. No misrepresentation - Is the meaning preserved?

Respond with JSON:
{
  "valid": true,
  "issues": ["Optional array of issues found"],
  "confidence": 0.95
}

If output is faithful and accurate, set valid=true and issues=[].
If there are problems, set valid=false and list specific issues.`;

export async function verifyStageOutput(
  stage: string,
  output: any,
  transcript: string
): Promise<VerificationResponse> {
  const outputStr = typeof output === 'string' ? output : JSON.stringify(output, null, 2);
  
  const prompt = VERIFICATION_PROMPT
    .replace('{stage}', stage)
    .replace('{transcript}', transcript)
    .replace('{output}', outputStr);

  console.log(`[AI Pipeline] Verification: Checking ${stage}...`);

  try {
    const rawResponse = await ollamaClient.generateJSON(prompt, {
      temperature: 0.2,
    });

    const validated = VerificationResponseSchema.parse(rawResponse);

    if (!validated.valid && validated.issues) {
      console.warn(`[AI Pipeline] Verification issues found in ${stage}:`);
      validated.issues.forEach((issue, idx) => {
        console.warn(`  ${idx + 1}. ${issue}`);
      });
    } else {
      console.log(`[AI Pipeline] Verification passed for ${stage}`);
    }

    return validated;
  } catch (error) {
    console.error('[AI Pipeline] Verification failed:', error);
    return {
      valid: true,
      issues: [`Verification check failed: ${error}`],
      confidence: 0.5,
    };
  }
}

export async function verifyWithRetry(
  stage: string,
  generateFn: () => Promise<any>,
  transcript: string,
  maxRetries: number = 2
): Promise<any> {
  let attempts = 0;
  let lastOutput: any;
  let lastError: Error | null = null;

  while (attempts <= maxRetries) {
    try {
      lastOutput = await generateFn();
      
      const verification = await verifyStageOutput(stage, lastOutput, transcript);
      
      if (verification.valid) {
        if (attempts > 0) {
          console.log(`[AI Pipeline] ${stage} succeeded after ${attempts} retries`);
        }
        return lastOutput;
      }
      
      if (attempts < maxRetries) {
        console.warn(`[AI Pipeline] ${stage} validation failed. Retrying (${attempts + 1}/${maxRetries})...`);
        attempts++;
      } else {
        console.warn(`[AI Pipeline] ${stage} validation failed after ${maxRetries} retries. Using last output.`);
        return lastOutput;
      }
    } catch (error: any) {
      lastError = error;
      if (attempts < maxRetries) {
        console.error(`[AI Pipeline] ${stage} error. Retrying (${attempts + 1}/${maxRetries})...`);
        attempts++;
      } else {
        throw new Error(`${stage} failed after ${maxRetries} retries: ${error.message}`);
      }
    }
  }

  if (lastOutput) {
    return lastOutput;
  }

  throw lastError || new Error(`${stage} failed without producing output`);
}
