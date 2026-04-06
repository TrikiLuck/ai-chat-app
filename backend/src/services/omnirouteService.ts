import { config } from '../config';

interface Message {
  role: string;
  content: string;
}

class OmnirouteService {
  private apiKey: string;
  private endpoint: string;

  constructor() {
    this.apiKey = config.omniroute.apiKey;
    this.endpoint = config.omniroute.endpoint;
  }

  async streamChat(
    model: string,
    messages: Message[],
    onChunk: (chunk: string) => void
  ): Promise<void> {
    try {
      const response = await fetch(`${this.endpoint}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Omniroute API error: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Response body is not readable');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter((line) => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              continue;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              
              if (content) {
                onChunk(content);
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Omniroute streaming error:', error);
      throw error;
    }
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.endpoint}/v1/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Omniroute API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data?.map((model: any) => model.id) || [];
    } catch (error) {
      console.error('Error fetching models:', error);
      return [];
    }
  }
}

export const omnirouteService = new OmnirouteService();
