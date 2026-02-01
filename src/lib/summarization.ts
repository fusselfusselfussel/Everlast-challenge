export interface TopicSummary {
  topic: string;
  summary: string;
  keyPoints: string[];
}

export async function summarizeTranscription(
  transcript: string,
  ollamaUrl: string = 'http://localhost:11434',
  useExternalAPI: boolean = false,
  externalAPIUrl: string = '',
  externalAPIKey: string = '',
  onProgress?: (stage: string) => void
): Promise<TopicSummary[]> {
  try {
    onProgress?.('Analyzing topics from transcription...');
    
    const topicPrompt = `Analyze the following transcription and identify the main topics or themes discussed. Return a JSON array of 3-7 topic names as strings. Each topic should be concise (1-4 words).

Transcription:
${transcript}

Return only a JSON array, nothing else. Example: ["Introduction", "Technical Details", "Conclusion"]`;

    let topicResponse;
    
    if (useExternalAPI && externalAPIUrl) {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (externalAPIKey) {
        headers['Authorization'] = `Bearer ${externalAPIKey}`;
      }

      topicResponse = await fetch(`${externalAPIUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: 'llama3.1',
          messages: [
            {
              role: 'user',
              content: topicPrompt
            }
          ],
          temperature: 0.5,
        }),
      });
    } else {
      topicResponse = await fetch(`${ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.1',
          prompt: topicPrompt,
          stream: false,
          format: 'json',
        }),
      });
    }

    if (!topicResponse.ok) {
      throw new Error(`Failed to identify topics: ${topicResponse.statusText}`);
    }

    const topicData: any = await topicResponse.json();
    let topics: string[];
    
    try {
      if (useExternalAPI && externalAPIUrl) {
        const parsedResponse = JSON.parse(topicData.choices[0].message.content);
        topics = Array.isArray(parsedResponse) ? parsedResponse : parsedResponse.topics || [];
      } else {
        const parsedResponse = JSON.parse(topicData.response);
        topics = Array.isArray(parsedResponse) ? parsedResponse : parsedResponse.topics || [];
      }
    } catch {
      topics = ['Main Topics', 'Key Points', 'Summary'];
    }

    if (topics.length === 0) {
      topics = ['Main Content'];
    }

    const summaries: TopicSummary[] = [];
    
    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i];
      onProgress?.(`Summarizing topic ${i + 1}/${topics.length}: ${topic}`);
      
      const summaryPrompt = `Based on the following transcription, provide a comprehensive summary for the topic: "${topic}".

Include:
1. Main points discussed related to this topic
2. Key insights and important details
3. Relevant context and explanations

Focus only on content relevant to this topic. Be thorough and comprehensive.

Return a JSON object with this exact structure:
{
  "topic": "${topic}",
  "summary": "A comprehensive paragraph summarizing this topic (3-5 sentences)",
  "keyPoints": ["First key point", "Second key point", "Third key point"]
}

Transcription:
${transcript}

Return only the JSON object, nothing else.`;

      let summaryResponse;
      
      if (useExternalAPI && externalAPIUrl) {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        if (externalAPIKey) {
          headers['Authorization'] = `Bearer ${externalAPIKey}`;
        }

        summaryResponse = await fetch(`${externalAPIUrl}/chat/completions`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: 'llama3.1',
            messages: [
              {
                role: 'user',
                content: summaryPrompt
              }
            ],
            temperature: 0.5,
          }),
        });
      } else {
        summaryResponse = await fetch(`${ollamaUrl}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'llama3.1',
            prompt: summaryPrompt,
            stream: false,
            format: 'json',
          }),
        });
      }

      if (!summaryResponse.ok) {
        console.error(`Failed to summarize topic ${topic}`);
        continue;
      }

      const summaryData: any = await summaryResponse.json();
      
      try {
        let parsed;
        if (useExternalAPI && externalAPIUrl) {
          parsed = JSON.parse(summaryData.choices[0].message.content);
        } else {
          parsed = JSON.parse(summaryData.response);
        }
        
        summaries.push({
          topic: parsed.topic || topic,
          summary: parsed.summary || 'No summary available',
          keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
        });
      } catch (error) {
        console.error(`Failed to parse summary for topic ${topic}:`, error);
        summaries.push({
          topic,
          summary: (useExternalAPI && externalAPIUrl && summaryData.choices) ? summaryData.choices[0].message.content : (summaryData.response || 'Summary generation failed'),
          keyPoints: [],
        });
      }
    }

    onProgress?.('Summarization complete');
    return summaries;
    
  } catch (error) {
    console.error('[Summarization] Error:', error);
    throw error;
  }
}
