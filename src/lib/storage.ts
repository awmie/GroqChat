import { ChatHistory, ChatMessage } from '../types/chat';

const STORAGE_KEY = 'chat_history';
const CONTEXT_KEY = 'chat_context';
const MAX_CONTEXT_MESSAGES = 10;

export const chatStorage = {
  saveChat: (messages: ChatHistory) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  },
  
  loadChat: (): ChatHistory => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  },
  
  addMessage: (message: ChatMessage) => {
    const history = chatStorage.loadChat();
    history.push(message);
    chatStorage.saveChat(history);
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
