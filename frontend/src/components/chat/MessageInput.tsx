import React, { useState } from 'react';
import { Button } from '../common/Button';

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSend, disabled }) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() && !disabled) {
      onSend(content);
      setContent('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
      <div className="flex items-end space-x-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Введите сообщение... (Enter для отправки, Shift+Enter для новой строки)"
          className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
          disabled={disabled}
        />
        <Button
          type="submit"
          disabled={disabled || !content.trim()}
          className="px-6"
        >
          {disabled ? 'Отправка...' : 'Отправить'}
        </Button>
      </div>
    </form>
  );
};
