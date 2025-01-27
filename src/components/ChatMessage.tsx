import { useState } from 'react';
import { MarkdownMessage } from './MarkdownMessage';
import { Pencil, Copy, Check, X } from 'lucide-react';
import type { ChatMessage } from '../types/chat';

interface ChatMessageProps {
  message: ChatMessage;
  isDark: boolean;
  onEdit?: (oldMessage: ChatMessage, newContent: string) => void;
}

export function ChatMessageItem({ message, isDark, onEdit }: ChatMessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [isCopied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
      <div className="flex items-start gap-2 w-full">
      {/* Copy button for assistant messages - left side */}
      {message.role === 'assistant' && (
        <button
        onClick={handleCopy}
        className="mt-2 transition-colors duration-200 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/50"
        aria-label="Copy message"
        >
        {isCopied ? (
          <Check className="w-3.5 h-3.5 text-green-500 dark:text-green-400" />
        ) : (
          <Copy className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
        )}
        </button>
      )}

      {/* Message bubble */}
      <div className={`relative group ${message.role === 'user' ? 'ml-auto' : 'mr-auto'} max-w-[85%] 
          ${message.role === 'user' 
            ? 'bg-blue-50 dark:bg-blue-500/10 text-gray-800 dark:text-gray-100' 
            : 'bg-white dark:bg-gray-800/60 text-gray-800 dark:text-gray-100'
          } rounded-2xl px-4 py-3 shadow-sm hover:shadow-md transition-all duration-200`}
        >
          {message.role === 'user' && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="absolute -left-10 top-2 p-1.5 rounded-full opacity-0 group-hover:opacity-100 
                       hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-opacity duration-200"
            >
              <Pencil className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            </button>
          )}
        
          {isEditing ? (
          <div className="flex flex-col gap-2">
            <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full min-w-[300px] p-3 rounded-xl border border-gray-200 dark:border-gray-700 
                 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100
                 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/10 
                 transition-all duration-200"
            rows={3}
            />
            <div className="flex justify-end gap-2">
            <button
              onClick={handleSaveEdit}
              className="p-1.5 rounded-full hover:bg-green-50 dark:hover:bg-green-500/10
                   transition-all duration-200"
            >
              <Check className="w-4 h-4 text-green-500 dark:text-green-400" />
            </button>
            <button
              onClick={handleCancelEdit}
              className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10
                   transition-all duration-200"
            >
              <X className="w-4 h-4 text-red-500 dark:text-red-400" />
            </button>
            </div>
          </div>
          ) : (
          <MarkdownMessage content={message.content} isDark={isDark} />
          )}
        </div>

        {/* Copy button for user messages - right side */}
        {message.role === 'user' && (
          <button
          onClick={handleCopy}
          className="mt-2 transition-colors duration-200 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/50"
          aria-label="Copy message"
          >
          {isCopied ? (
            <Check className="w-3.5 h-3.5 text-green-500 dark:text-green-400" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
          )}
          </button>
        )}
        </div>
      </div>
      );
    }


