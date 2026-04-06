export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}

export interface Chat {
  id: string;
  title: string;
  model: string;
  userId: string;
  messages?: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  files?: File[];
  createdAt: string;
}

export interface File {
  id: string;
  messageId: string;
  filename: string;
  path: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  error: string;
  details?: any;
}
