export interface OllamaGenerateOptions {
  model?: string;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
}

export interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

export class OllamaClient {
  private baseUrl: string;
  private defaultModel: string;
  private useExternalAPI: boolean;
  private externalAPIUrl: string;
  private externalAPIKey: string;

  constructor(
    baseUrl: string = 'http://localhost:11434',
    defaultModel: string = 'llama3.1',
    useExternalAPI: boolean = false,
    externalAPIUrl: string = '',
    externalAPIKey: string = ''
  ) {
    this.baseUrl = baseUrl;
    this.defaultModel = defaultModel;
    this.useExternalAPI = useExternalAPI;
    this.externalAPIUrl = externalAPIUrl;
    this.externalAPIKey = externalAPIKey;
  }

  updateSettings(
    useExternalAPI: boolean,
    externalAPIUrl: string = '',
    externalAPIKey: string = ''
  ) {
    this.useExternalAPI = useExternalAPI;
    this.externalAPIUrl = externalAPIUrl;
    this.externalAPIKey = externalAPIKey;
  }

  async generate(prompt: string, options?: OllamaGenerateOptions): Promise<string> {
    const model = options?.model || this.defaultModel;
    
    try {
      if (this.useExternalAPI && this.externalAPIUrl) {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        if (this.externalAPIKey) {
          headers['Authorization'] = `Bearer ${this.externalAPIKey}`;
        }

        const response = await fetch(`${this.externalAPIUrl}/chat/completions`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: options?.temperature ?? 0.7,
            top_p: options?.top_p ?? 0.9,
          }),
        });

        if (!response.ok) {
          throw new Error(`External API request failed: ${response.status} ${response.statusText}`);
        }

        const data: any = await response.json();
        return data.choices[0].message.content;
      } else {
        const response = await fetch(`${this.baseUrl}/api/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            prompt,
            temperature: options?.temperature ?? 0.7,
            top_p: options?.top_p ?? 0.9,
            stream: false,
          }),
        });

        if (!response.ok) {
          throw new Error(`Ollama request failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json() as OllamaResponse;
        return data.response;
      }
    } catch (error: any) {
      if (error.message.includes('fetch')) {
        throw new Error('API service is not available. Please check your settings and network connection.');
      }
      throw error;
    }
  }

  async generateJSON<T = any>(prompt: string, options?: OllamaGenerateOptions): Promise<T> {
    const fullPrompt = `${prompt}\n\nIMPORTANT: Respond ONLY with valid JSON. Do not include any explanatory text before or after the JSON.`;
    
    const response = await this.generate(fullPrompt, {
      ...options,
      temperature: options?.temperature ?? 0.3,
    });

    try {
      const cleaned = this.extractJSON(response);
      return JSON.parse(cleaned);
    } catch (error) {
      console.error('Failed to parse JSON response:', response);
      throw new Error(`Invalid JSON response from Ollama: ${error}`);
    }
  }

  private extractJSON(text: string): string {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return jsonMatch[0];
    }
    
    const arrayMatch = text.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      return arrayMatch[0];
    }
    
    return text.trim();
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }
      const data = await response.json() as { models?: Array<{ name: string }> };
      return data.models?.map((m: any) => m.name) || [];
    } catch (error) {
      console.error('Failed to list models:', error);
      return [];
    }
  }
}

export const ollamaClient = new OllamaClient();
