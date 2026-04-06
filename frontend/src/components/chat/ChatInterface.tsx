import React, { useState } from 'react';
import { useStore } from '@/store';
import { chatService } from '@/services/chatService';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { Spinner } from '../common/Spinner';

export const ChatInterface: React.FC = () => {
  const { currentChat, messages, addMessage, updateLastMessage } = useStore();
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async (content: string) => {
    if (!currentChat) return;

    setIsSending(true);

    // Добавляем сообщение пользователя
    const userMessage = {
      id: Date.now().toString(),
      chatId: currentChat.id,
      role: 'user' as const,
      content,
      createdAt: new Date().toISOString(),
    };
    addMessage(userMessage);

    // Создаем пустое сообщение ассистента для стриминга
    const assistantMessage = {
      id: (Date.now() + 1).toString(),
      chatId: currentChat.id,
      role: 'assistant' as const,
      content: '',
      createdAt: new Date().toISOString(),
    };
    addMessage(assistantMessage);

    try {
      await chatService.sendMessage(currentChat.id, content, undefined, (chunk) => {
        updateLastMessage(chunk);
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  if (!currentChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Добро пожаловать в AI Chat App
          </h2>
          <p className="text-gray-600">
            Выберите чат из списка или создайте новый
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900">{currentChat.title}</h2>
        <p className="text-sm text-gray-500">Модель: {currentChat.model}</p>
      </div>

      <MessageList messages={messages} />

      {isSending && (
        <div className="px-4 py-2 flex items-center text-gray-500">
          <Spinner size="sm" />
          <span className="ml-2">Генерация ответа...</span>
        </div>
      )}

      <MessageInput onSend={handleSendMessage} disabled={isSending} />
    </div>
  );
};
