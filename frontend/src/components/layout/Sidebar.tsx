import React, { useEffect } from 'react';
import { useStore } from '@/store';
import { formatDate } from '@/utils/helpers';
import { Button } from '../common/Button';

interface SidebarProps {
  onNewChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNewChat }) => {
  const { chats, currentChat, selectChat, deleteChat, loadChats, logout } = useStore();

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-full">
      <div className="p-4 border-b border-gray-700">
        <Button
          onClick={onNewChat}
          className="w-full bg-white text-gray-900 hover:bg-gray-100"
        >
          + Новый чат
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`p-3 cursor-pointer hover:bg-gray-800 border-b border-gray-800 ${
              currentChat?.id === chat.id ? 'bg-gray-800' : ''
            }`}
            onClick={() => selectChat(chat.id)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{chat.title}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDate(chat.updatedAt)}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Удалить этот чат?')) {
                    deleteChat(chat.id);
                  }
                }}
                className="ml-2 text-gray-400 hover:text-red-400"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-700">
        <Button
          onClick={logout}
          variant="ghost"
          className="w-full text-white hover:bg-gray-800"
        >
          Выйти
        </Button>
      </div>
    </div>
  );
};
