import { create } from 'zustand';
import { User, Chat, Message } from '../types';
import { authService } from '../services/authService';
import { chatService } from '../services/chatService';

interface AppState {
  // Auth
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  
  // Chats
  chats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  
  // UI
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  
  loadChats: () => Promise<void>;
  createChat: (title: string, model: string) => Promise<Chat>;
  selectChat: (chatId: string) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  updateChatTitle: (chatId: string, title: string) => Promise<void>;
  
  addMessage: (message: Message) => void;
  updateLastMessage: (content: string) => void;
  
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  user: null,
  token: authService.getToken(),
  isAuthenticated: !!authService.getToken(),
  chats: [],
  currentChat: null,
  messages: [],
  isLoading: false,
  error: null,

  // Auth actions
  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authService.login(email, password);
      authService.setToken(response.token);
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Ошибка входа',
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (email: string, password: string, name?: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authService.register(email, password, name);
      authService.setToken(response.token);
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Ошибка регистрации',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    authService.logout();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      chats: [],
      currentChat: null,
      messages: [],
    });
  },

  loadUser: async () => {
    try {
      const user = await authService.getMe();
      set({ user });
    } catch (error) {
      get().logout();
    }
  },

  // Chat actions
  loadChats: async () => {
    try {
      set({ isLoading: true, error: null });
      const chats = await chatService.getChats();
      set({ chats, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Ошибка загрузки чатов',
        isLoading: false,
      });
    }
  },

  createChat: async (title: string, model: string) => {
    try {
      set({ isLoading: true, error: null });
      const chat = await chatService.createChat(title, model);
      set((state) => ({
        chats: [chat, ...state.chats],
        currentChat: chat,
        messages: [],
        isLoading: false,
      }));
      return chat;
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Ошибка создания чата',
        isLoading: false,
      });
      throw error;
    }
  },

  selectChat: async (chatId: string) => {
    try {
      set({ isLoading: true, error: null });
      const chat = await chatService.getChat(chatId);
      set({
        currentChat: chat,
        messages: chat.messages || [],
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Ошибка загрузки чата',
        isLoading: false,
      });
    }
  },

  deleteChat: async (chatId: string) => {
    try {
      await chatService.deleteChat(chatId);
      set((state) => ({
        chats: state.chats.filter((chat) => chat.id !== chatId),
        currentChat: state.currentChat?.id === chatId ? null : state.currentChat,
        messages: state.currentChat?.id === chatId ? [] : state.messages,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Ошибка удаления чата',
      });
    }
  },

  updateChatTitle: async (chatId: string, title: string) => {
    try {
      const updatedChat = await chatService.updateChat(chatId, title);
      set((state) => ({
        chats: state.chats.map((chat) =>
          chat.id === chatId ? updatedChat : chat
        ),
        currentChat:
          state.currentChat?.id === chatId ? updatedChat : state.currentChat,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Ошибка обновления чата',
      });
    }
  },

  // Message actions
  addMessage: (message: Message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  updateLastMessage: (content: string) => {
    set((state) => {
      const messages = [...state.messages];
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        messages[messages.length - 1] = {
          ...lastMessage,
          content: lastMessage.content + content,
        };
      }
      return { messages };
    });
  },

  // UI actions
  setError: (error: string | null) => set({ error }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));
