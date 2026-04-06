import api from './api';
import { Chat, Message } from '../types';

export const chatService = {
  async getChats(): Promise<Chat[]> {
    const response = await api.get<Chat[]>('/chats');
    return response.data;
  },

  async createChat(title: string, model: string): Promise<Chat> {
    const response = await api.post<Chat>('/chats', { title, model });
    return response.data;
  },

  async getChat(id: string): Promise<Chat> {
    const response = await api.get<Chat>(`/chats/${id}`);
    return response.data;
  },

  async updateChat(id: string, title: string): Promise<Chat> {
    const response = await api.patch<Chat>(`/chats/${id}`, { title });
    return response.data;
  },

  async deleteChat(id: string): Promise<void> {
    await api.delete(`/chats/${id}`);
  },

  async getMessages(chatId: string): Promise<Message[]> {
    const response = await api.get<Message[]>(`/chats/${chatId}/messages`);
    return response.data;
  },

  async sendMessage(
    chatId: string,
    content: string,
    fileIds?: string[],
    onChunk?: (chunk: string) => void
  ): Promise<void> {
    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

    const response = await fetch(`${API_URL}/chats/${chatId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content, fileIds }),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
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

          try {
            const parsed = JSON.parse(data);

            if (parsed.type === 'chunk' && onChunk) {
              onChunk(parsed.content);
            } else if (parsed.type === 'error') {
              throw new Error(parsed.error);
            }
          } catch (e) {
            console.error('Error parsing SSE data:', e);
          }
        }
      }
    }
  },
};
