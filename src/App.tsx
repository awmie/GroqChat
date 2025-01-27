import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { SendHorizontal, Bot, Loader2, Sun, Moon, Key, Trash2, Github } from 'lucide-react';
import { ModelSelector } from './components/ModelSelector';
import { COTToggle } from './components/COTToggle';
import { getChatCompletion, updateApiKey } from './lib/groq';


import { chatStorage } from './lib/storage';
import type { ChatHistory, ChatMessage } from './types/chat';
import { ChatMessageItem } from './components/ChatMessage';

function App() {
  const [messages, setMessages] = useState<ChatHistory>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showApiInput, setShowApiInput] = useState(true);
  const [apiKey, setApiKey] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
      return savedTheme === 'dark';
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
    
    // Check if API key exists in localStorage and set it
    const savedApiKey = localStorage.getItem('groq_api_key');
    if (savedApiKey) {
      updateApiKey(savedApiKey);
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
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      updateApiKey(apiKey.trim());
      localStorage.setItem('groq_api_key', apiKey.trim()); // Save API key to localStorage
      setShowApiInput(false);
      setHasApiKey(true);
      setApiKey('');
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
    if (!input.trim() || isLoading || !hasApiKey) return;

    const currentInput = input;
    setInput('');

    const userMessage: ChatMessage = {
      role: 'user',
      content: currentInput.trim()
    };


    setIsLoading(true);
    setMessages(prev => {
      // Keep only the last 100 messages in state
      const newMessages = [...prev, userMessage].slice(-100);
      return newMessages;
    });
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
      
      setMessages(prev => {
        const newMessages = [...prev, assistantMessage].slice(-100);
        return newMessages;
      });
      chatStorage.addMessage(assistantMessage);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Sorry, I encountered an error. Please try again.";
        const errorChatMessage: ChatMessage = {
        role: 'assistant',
        content: errorMessage
        };

      
      setMessages(prev => [...prev, errorChatMessage]);
      chatStorage.addMessage(errorChatMessage);
      
        if (errorMessage.includes("Please set your Groq API key")) {
        setShowApiInput(true);
        setHasApiKey(false);
        localStorage.removeItem('groq_api_key'); // Clear stored API key on error
        }
    } finally {
      setIsLoading(false);
      if (inputRef.current) {
        inputRef.current.focus();
      }
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

  const handleEditMessage = useCallback(async (oldMessage: ChatMessage, newContent: string) => {
    // Find the index of the message being edited
    const messageIndex = messages.findIndex(m => 
      m.role === oldMessage.role && m.content === oldMessage.content
    );

    if (messageIndex === -1) return;

    // Create new message with edited content
    const editedMessage = {
      ...oldMessage,
      content: newContent
    };

    // Get all messages up to the edited message
    const previousMessages = messages.slice(0, messageIndex);
    
    // Update messages state with edited message
    setMessages([...previousMessages, editedMessage]);
    
    // If it's a user message, get new AI response
    if (oldMessage.role === 'user') {
      setIsLoading(true);
      try {
        const context = previousMessages;
        const response = await getChatCompletion(newContent, context);
        
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response
        };
        
        setMessages(prev => [...previousMessages, editedMessage, assistantMessage]);
        chatStorage.saveContext([...previousMessages, editedMessage, assistantMessage]);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Sorry, I encountered an error. Please try again.";
        const errorChatMessage: ChatMessage = {
          role: 'assistant',
          content: errorMessage
        };
        
        setMessages(prev => [...previousMessages, editedMessage, errorChatMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  }, [messages]);

  const renderMessages = useMemo(() => {
    // Only render the last 50 messages for performance
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
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 transition-colors duration-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-1 py-2 sm:px-4 sm:py-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between w-full">
            {/* Logo section - reduced size for mobile */}
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="flex items-center gap-1 sm:gap-2">
              <Bot className="w-4 h-4 sm:w-6 sm:h-6 text-primary-light dark:text-primary-dark" />
              <h1 className="text-sm sm:text-xl font-semibold text-gray-800 dark:text-gray-100">GroqChat</h1>
              </div>
              <a
              href="https://github.com/awmie/GroqChat.git"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
              >
              <Github className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm hidden sm:inline">GitHub</span>
              </a>
            </div>

            {/* Controls section - further reduced spacing */}
            <div className="flex items-center gap-1 sm:gap-3">
              <div className="w-[80px] sm:w-auto">
              <ModelSelector />
              </div>
              <div className="mx-1 sm:mx-2">
              <COTToggle />
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={handleClearMemory}
                className="p-1 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                aria-label="Clear Memory"
              >
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800 dark:text-gray-100" />
              </button>
              <button
                onClick={() => setShowApiInput(!showApiInput)}
                className="p-1 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                aria-label="Set API Key"
              >
                <Key className={`w-4 h-4 sm:w-5 sm:h-5 ${hasApiKey ? 'text-green-500 dark:text-green-500' : 'text-gray-800 dark:text-gray-100'}`} />
              </button>
              <button
                onClick={toggleTheme}
                className="p-1 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                aria-label="Toggle theme"
              >
                {isDark ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-gray-100" />
                ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800" />
                )}
              </button>
              </div>
            </div>
            </div>

            {/* API Key input - adjusted for mobile */}
            {showApiInput && (
            <form onSubmit={handleApiKeySubmit} className="flex gap-1 sm:gap-2 mt-2">
              <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Groq API key"
              className="flex-1 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 
                   text-gray-800 dark:text-gray-100 px-2 py-1.5 sm:px-4 sm:py-2 
                   text-sm sm:text-base focus:outline-none focus:ring-2 
                   focus:ring-primary-light dark:focus:ring-primary-dark"
              />
              <button
              type="submit"
              className="whitespace-nowrap bg-primary-light dark:bg-primary-dark text-white 
                   rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base
                   hover:bg-blue-500 dark:hover:bg-blue-600"
              >
              Save
              </button>
            </form>
            )}
          </div>
          </div>
        </header>


        <main className="flex-1 w-full">
          <div className="max-w-4xl mx-auto p-2 sm:p-4 flex flex-col h-[calc(100vh-120px)] sm:h-[calc(100vh-80px)]">
          <div 
          ref={chatContainerRef}
          className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 
                p-2 sm:p-4 mb-2 sm:mb-4 overflow-y-auto transition-colors duration-200 scroll-smooth
                min-h-[200px] sm:min-h-[400px]"
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

            <form onSubmit={handleSubmit} className="flex gap-2 mb-2 sm:mb-4 sticky bottom-0">
              <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder={hasApiKey ? "Type your message..." : "Please set your API key first"}
              className="flex-1 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 
                   text-gray-800 dark:text-gray-100 px-3 py-2 sm:py-2.5
                   text-sm focus:outline-none focus:ring-2 
                   focus:ring-primary-light dark:focus:ring-primary-dark transition-colors duration-200"
              disabled={isLoading || !hasApiKey}
              autoFocus
              />
              <button
              type="submit"
              disabled={isLoading || !input.trim() || !hasApiKey}
              className="bg-primary-light dark:bg-primary-dark text-white rounded-lg 
                   px-3 py-2 sm:py-2.5 hover:bg-blue-500 dark:hover:bg-blue-600 
                   disabled:opacity-50 disabled:cursor-not-allowed 
                   flex items-center gap-1 sm:gap-2 transition-colors duration-200"
              >
              <SendHorizontal className="w-4 h-4" />
              <span className="text-sm">Send</span>
              </button>
            </form>
          </div>
        </main>
    </div>
  );
}

export default React.memo(App);