import { useState } from 'react';
import { MarkdownMessage } from './MarkdownMessage';
import { Pencil, Check, X } from 'lucide-react';
import type { ChatMessage } from '../types/chat';

interface ChatMessageProps {
  message: ChatMessage;
  isDark: boolean;
  onEdit?: (oldMessage: ChatMessage, newContent: string) => void;
}

export function ChatMessageItem({ message, isDark, onEdit }: ChatMessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const handleSaveEdit = () => {
    if (editContent.trim() !== message.content && onEdit) {
      onEdit(message, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  return (
    <div className={`flex flex-col gap-2 ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
      <div className={`relative group max-w-[85%] ${
        message.role === 'user' 
          ? 'bg-blue-100 dark:bg-blue-900/30' 
          : 'bg-gray-100 dark:bg-gray-800'
      } rounded-lg p-3`}>
        {message.role === 'user' && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="absolute -left-8 top-2 p-1 rounded opacity-0 group-hover:opacity-100 
                     hover:bg-gray-200 dark:hover:bg-gray-700 transition-opacity duration-200"
          >
            <Pencil className="w-4 h-4 text-gray-500" />
          </button>
        )}
        
        {isEditing ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full min-w-[300px] p-2 rounded border dark:border-gray-600 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={handleSaveEdit}
                className="p-1 rounded hover:bg-green-100 dark:hover:bg-green-900/30"
              >
                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
              </button>
              <button
                onClick={handleCancelEdit}
                className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
              >
                <X className="w-4 h-4 text-red-600 dark:text-red-400" />
              </button>
            </div>
          </div>
        ) : (
          <MarkdownMessage content={message.content} isDark={isDark} />
        )}
      </div>
    </div>
  );
}

