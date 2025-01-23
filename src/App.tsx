import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { SendHorizontal, Bot, Loader2, Sun, Moon, Key, Trash2, Github } from 'lucide-react';
import { getChatCompletion, updateApiKey } from './lib/groq';
import { chatStorage } from './lib/storage';
import type { ChatHistory, ChatMessage } from './types/chat';
import { ChatMessageItem } from './components/ChatMessage';
import { debounce } from './lib/utils';

function App() {
  const [messages, setMessages] = useState<ChatHistory>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showApiInput, setShowApiInput] = useState(true);
  const [apiKey, setApiKey] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    // Load saved messages on component mount
    const savedMessages = chatStorage.loadChat();
    setMessages(savedMessages);
    
    // Check if API key exists in localStorage
    const apiKeyExists = localStorage.getItem('groq_api_key');
    if (apiKeyExists) {
      setHasApiKey(true);
      setShowApiInput(false);
    }
  }, []);

  // Add effect to focus input after loading completes
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      updateApiKey(apiKey.trim());
      setShowApiInput(false);
      setHasApiKey(true);
      setApiKey('');
    }
  };

  const handleClearMemory = () => {
    chatStorage.clearMemory();
    setMessages([]);
  };

  const debouncedSetInput = useMemo(
    () => debounce((value: string) => setInput(value), 100),
    []
  );

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetInput(e.target.value);
  }, [debouncedSetInput]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !hasApiKey) return;

    const currentInput = input;
    setInput(''); // Reset input immediately
    if (inputRef.current) {
      inputRef.current.value = ''; // Reset the input field value
      // Pre-focus the input
      inputRef.current.focus();
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: currentInput.trim(),
      timestamp: Date.now()
    };

    setIsLoading(true);
    setMessages(prev => [...prev, userMessage]);
    chatStorage.addMessage(userMessage);

    try {
      // Get context for AI
      const context = chatStorage.getContext();
      const response = await getChatCompletion(userMessage.content, context);
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      };
      
      // Update context and messages
      const newContext = [...context, userMessage, assistantMessage];
      chatStorage.saveContext(newContext);
      setMessages(prev => [...prev, assistantMessage]);
      chatStorage.addMessage(assistantMessage);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Sorry, I encountered an error. Please try again.";
      const errorChatMessage: ChatMessage = {
        role: 'assistant',
        content: errorMessage,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, errorChatMessage]);
      chatStorage.addMessage(errorChatMessage);
      
      if (errorMessage.includes("Please set your Groq API key")) {
        setShowApiInput(true);
        setHasApiKey(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, hasApiKey]);

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const renderMessages = useMemo(() => {
    return messages.map((message, index) => (
      <ChatMessageItem
        key={`${message.timestamp}-${index}`}
        message={message}
        isDark={isDark}
      />
    ));
  }, [messages, isDark]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 transition-colors duration-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Bot className="w-6 h-6 text-primary-light dark:text-primary-dark" />
                <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">GroqChat</h1>
              </div>
              <a
                href="https://github.com/awmie/GroqChat.git"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
              >
                <Github className="w-5 h-5" />
                <span className="text-sm hidden sm:inline">GitHub</span>
              </a>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearMemory}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 relative group"
                aria-label="Clear Memory"
              >
                <Trash2 className="w-5 h-5 text-gray-800 dark:text-gray-100" />
                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 dark:bg-gray-700 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Clear Memory
                </span>
              </button>
              <button
                onClick={() => setShowApiInput(!showApiInput)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 relative group"
                aria-label="Set API Key"
              >
                <Key className={`w-5 h-5 ${hasApiKey ? 'text-green-500 dark:text-green-500' : 'text-gray-800 dark:text-gray-100'}`} />
                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 dark:bg-gray-700 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {hasApiKey ? 'API Key Set' : 'Set API Key'}
                </span>
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 relative group"
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-gray-100" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-800" />
                )}
                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 dark:bg-gray-700 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Toggle theme
                </span>
              </button>
            </div>
          </div>
          {showApiInput && (
            <form onSubmit={handleApiKeySubmit} className="mt-4 flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Groq API key"
                className="flex-1 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark transition-colors duration-200"
              />
              <button
                type="submit"
                className="bg-primary-light dark:bg-primary-dark text-white rounded-lg px-4 py-2 hover:bg-blue-500 dark:hover:bg-blue-600 transition-colors duration-200"
              >
                Save
              </button>
            </form>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col h-[calc(100vh-4rem)]">
        <div 
          ref={chatContainerRef}
          className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 mb-4 overflow-y-auto transition-colors duration-200 scroll-smooth"
        >
          {!hasApiKey && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <Key className="w-12 h-12 mb-4" />
              <p className="text-lg mb-2">Welcome to Groq Chat!</p>
              <p>Please set your Groq API key to start chatting.</p>
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

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder={hasApiKey ? "Type your message..." : "Please set your API key first"}
            className="flex-1 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark transition-colors duration-200"
            disabled={isLoading || !hasApiKey}
            autoFocus
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim() || !hasApiKey}
            className="bg-primary-light dark:bg-primary-dark text-white rounded-lg px-4 py-2 hover:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors duration-200"
          >
            <SendHorizontal className="w-4 h-4" />
            Send
          </button>
        </form>
      </main>
    </div>
  );
}

export default React.memo(App);