import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { SendHorizontal, Bot, Loader2, Sun, Moon, Trash2, Github, Cpu } from 'lucide-react';
import { COTToggle } from './components/COTToggle';
import { LocalModelSelector } from './components/ProviderSelector';
import { getChatCompletion, checkWebGPU, isModelLoaded, loadModel, setModel } from './lib/local';

import { chatStorage } from './lib/storage';
import type { ChatHistory, ChatMessage } from './types/chat';
import { ChatMessageItem } from './components/ChatMessage';

function App() {
  const [messages, setMessages] = useState<ChatHistory>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localModel, setLocalModel] = useState('Phi-3.5-mini-instruct-q4f32_1-MLC');
  const [loadProgress, setLoadProgress] = useState<string>('');
  const [webGPUSupported, setWebGPUSupported] = useState<boolean | null>(null);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const savedTheme = localStorage.getItem('theme');
      const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', theme === 'dark');
      return theme === 'dark';
    }
    return false;
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setIsDark(e.matches);
        document.documentElement.classList.toggle('dark', e.matches);
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const savedMessages = chatStorage.loadChat();
    setMessages(savedMessages);
    
    checkWebGPU().then(supported => {
      setWebGPUSupported(supported);
    });
  }, []);

  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  const toggleTheme = useCallback(() => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    document.documentElement.classList.toggle('dark', newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  }, [isDark]);

  const handleLocalModelChange = (model: string) => {
    setLocalModel(model);
    setModel(model);
  };

  const handleLoadLocalModel = async () => {
    try {
      setIsLoading(true);
      setLoadProgress('Starting...');
      
      // Check WebGPU first
      const hasWebGPU = await checkWebGPU();
      if (!hasWebGPU) {
        setLoadProgress('WebGPU not supported! Use Chrome/Edge');
        return;
      }
      
      await loadModel(localModel, (progress) => {
        setLoadProgress(progress);
      });
    } catch (error) {
      console.error("Failed to load model:", error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setLoadProgress(`Error: ${errorMsg}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        if (isModelLoaded()) {
          setLoadProgress('Ready!');
          setTimeout(() => setLoadProgress(''), 2000);
        }
      }, 1000);
    }
  };

  const handleClearMemory = () => {
    chatStorage.clearMemory();
    setMessages([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !isModelLoaded()) return;

    const currentInput = input;
    setInput('');

    const userMessage: ChatMessage = {
      role: 'user',
      content: currentInput.trim()
    };

    setIsLoading(true);
    setMessages(prev => [...prev, userMessage].slice(-100));
    chatStorage.addMessage(userMessage);

    try {
      const context = chatStorage.getContext();
      const response = await getChatCompletion(userMessage.content, context);
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response
      };

      const newContext = [...context, userMessage, assistantMessage];
      chatStorage.saveContext(newContext);
      setMessages(prev => [...prev, assistantMessage].slice(-100));
      chatStorage.addMessage(assistantMessage);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Sorry, I encountered an error. Please try again.";
      const errorChatMessage: ChatMessage = {
        role: 'assistant',
        content: errorMessage
      };
      setMessages(prev => [...prev, errorChatMessage]);
      chatStorage.addMessage(errorChatMessage);
    } finally {
      setIsLoading(false);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [input, isLoading]);

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleEditMessage = useCallback(async (oldMessage: ChatMessage, newContent: string) => {
    const messageIndex = messages.findIndex(m => 
      m.role === oldMessage.role && m.content === oldMessage.content
    );
    if (messageIndex === -1) return;

    const editedMessage = {
      ...oldMessage,
      content: newContent
    };
    const previousMessages = messages.slice(0, messageIndex);
    setMessages([...previousMessages, editedMessage]);
    
    if (oldMessage.role === 'user') {
      setIsLoading(true);
      try {
        const context = previousMessages;
        const response = await getChatCompletion(newContent, context);
        
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response
        };
        
        setMessages([...previousMessages, editedMessage, assistantMessage]);
        chatStorage.saveContext([...previousMessages, editedMessage, assistantMessage]);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Sorry, I encountered an error. Please try again.";
        const errorChatMessage: ChatMessage = {
          role: 'assistant',
          content: errorMessage
        };
        setMessages([...previousMessages, editedMessage, errorChatMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  }, [messages]);

  const renderMessages = useMemo(() => {
    const visibleMessages = messages.slice(-50);
    return visibleMessages.map((message, index) => (
      <ChatMessageItem
        key={index}
        message={message}
        isDark={isDark}
        onEdit={handleEditMessage}
      />
    ));
  }, [messages, isDark, handleEditMessage]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50 dark:bg-gray-900 transition-colors duration-200">
      <header className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 transition-colors duration-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-1 py-2 sm:px-4 sm:py-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1 sm:gap-2">
                <Bot className="w-4 h-4 sm:w-6 sm:h-6 text-primary-light dark:text-primary-dark" />
                <h1 className="text-sm sm:text-xl font-semibold text-gray-800 dark:text-gray-100">Local AI Chat</h1>
                <a
                  href="https://github.com/awmie/cot.git"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                >
                  <Github className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
              </div>

              <div className="flex items-center gap-1 sm:gap-3">
                <LocalModelSelector 
                  selectedModel={localModel}
                  onModelChange={handleLocalModelChange}
                  onLoadModel={handleLoadLocalModel}
                  progress={loadProgress}
                />
                <div className="mx-1 sm:mx-2">
                  <COTToggle />
                </div>
                <button
                  onClick={handleClearMemory}
                  className="p-1 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-theme"
                  aria-label="Clear Memory"
                >
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800 dark:text-gray-100 transition-text" />
                </button>
                <button
                  onClick={toggleTheme}
                  className="p-1 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-theme"
                  aria-label="Toggle theme"
                >
                  {isDark ? (
                    <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-gray-100 transition-text" />
                  ) : (
                    <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800 transition-text" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full">
        <div className="max-w-4xl mx-auto p-4 flex flex-col h-[calc(100vh-80px)]">
          <div 
            ref={chatContainerRef}
            className="flex-1 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-4 mb-4 overflow-y-auto transition-all duration-200 scroll-smooth"
          >
            {!isModelLoaded() && messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <Cpu className="w-12 h-12 mb-4" />
                <p className="text-lg mb-2">Local AI Chat</p>
                <p className="mb-2">Select a model and click "Load Model" to start.</p>
                {webGPUSupported === false && (
                  <p className="text-red-500 text-sm mb-2">WebGPU not supported. Use Chrome or Edge.</p>
                )}
              </div>
            )}
            <div className="space-y-4">
              {renderMessages}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 flex items-center gap-2 transition-colors duration-200">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-600 dark:text-gray-300" />
                    <span className="text-gray-600 dark:text-gray-300">Thinking...</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder={isModelLoaded() ? "Type your message..." : "Load a model first..."}
              className="flex-1 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-800 dark:text-gray-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/10 shadow-sm hover:shadow-md transition-all duration-200"
              disabled={isLoading || !isModelLoaded()}
              autoFocus
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim() || !isModelLoaded()}
              className="bg-blue-500 dark:bg-blue-500 text-white rounded-xl px-6 py-3 hover:bg-blue-600 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-200 hover:translate-y-[-1px] active:translate-y-[1px]"
            >
              <SendHorizontal className="w-5 h-5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default React.memo(App);
