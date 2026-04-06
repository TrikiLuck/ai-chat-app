import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { modelService } from '@/services/modelService';
import { Sidebar } from '@/components/layout/Sidebar';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, createChat, loadUser } = useStore();
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [chatTitle, setChatTitle] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [models, setModels] = useState<string[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadUser();
  }, [isAuthenticated, navigate, loadUser]);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const availableModels = await modelService.getModels();
        setModels(availableModels);
        if (availableModels.length > 0) {
          setSelectedModel(availableModels[0]);
        }
      } catch (error) {
        console.error('Failed to load models:', error);
      }
    };
    if (isAuthenticated) {
      loadModels();
    }
  }, [isAuthenticated]);

  const handleNewChat = () => {
    setShowNewChatModal(true);
    setChatTitle('');
  };

  const handleCreateChat = async () => {
    if (!chatTitle.trim() || !selectedModel) return;

    try {
      await createChat(chatTitle, selectedModel);
      setShowNewChatModal(false);
      setChatTitle('');
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen">
      <Sidebar onNewChat={handleNewChat} />
      <ChatInterface />

      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Создать новый чат</h3>
            <div className="space-y-4">
              <Input
                label="Название чата"
                value={chatTitle}
                onChange={(e) => setChatTitle(e.target.value)}
                placeholder="Например: Помощь с кодом"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Модель
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {models.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={handleCreateChat}
                  className="flex-1"
                  disabled={!chatTitle.trim()}
                >
                  Создать
                </Button>
                <Button
                  onClick={() => setShowNewChatModal(false)}
                  variant="secondary"
                  className="flex-1"
                >
                  Отмена
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
