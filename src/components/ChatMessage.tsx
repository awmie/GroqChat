import { MarkdownMessage } from './MarkdownMessage';
import type { ChatMessage } from '../types/chat';

interface ChatMessageProps {
  message: ChatMessage;
  isDark: boolean;
}

export function ChatMessageItem({ message, isDark }: ChatMessageProps) {

  return (
    <div
      className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
    >
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          message.role === 'assistant'
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100'
            : 'bg-primary-light dark:bg-primary-dark text-white'
        } transition-colors duration-200`}
      >
        {message.role === 'assistant' ? (
          <MarkdownMessage content={message.content} isDark={isDark} />
        ) : (
          <p className="whitespace-pre-wrap">{message.content}</p>
        )}
      </div>
    </div>
  );
}

