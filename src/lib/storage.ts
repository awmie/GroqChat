import { ChatHistory, ChatMessage } from '../types/chat';

const STORAGE_KEY = 'chat_history';
const CONTEXT_KEY = 'chat_context';
const MAX_STORED_MESSAGES = 100;
const MAX_CONTEXT_MESSAGES = 10;

export const chatStorage = {
  saveChat: (messages: ChatHistory) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  },
  
  loadChat: (): ChatHistory => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const messages = JSON.parse(saved);
    return messages.slice(-MAX_STORED_MESSAGES);
  },
  
  addMessage: (message: ChatMessage) => {
    const history = chatStorage.loadChat();
    const newHistory = [...history, message].slice(-MAX_STORED_MESSAGES);
    chatStorage.saveChat(newHistory);
  },
  
  clearChat: () => {
    localStorage.removeItem(STORAGE_KEY);
  },

  getContext: (): ChatHistory => {
    const saved = localStorage.getItem(CONTEXT_KEY);
    const context = saved ? JSON.parse(saved) : [];
    // Keep only last N messages for performance
    return context.slice(-MAX_CONTEXT_MESSAGES);
  },

  saveContext: (messages: ChatHistory) => {
    localStorage.setItem(CONTEXT_KEY, JSON.stringify(messages));
  },

  clearMemory: () => {
    localStorage.removeItem(CONTEXT_KEY);
    localStorage.removeItem(STORAGE_KEY);
  }
};
