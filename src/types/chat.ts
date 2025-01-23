export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export type ChatHistory = ChatMessage[];
