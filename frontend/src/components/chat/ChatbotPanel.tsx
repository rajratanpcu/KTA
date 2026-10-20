// KTA AI Chatbot Panel Component
// Responsive drawer/modal panel for interacting with Qwen AI & ERP context

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Bot,
  User,
  Trash2,
  Settings,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Database,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatSafeText } from './ChatSafeText';
import { ChatSettingsDialog } from './ChatSettingsDialog';
import { sendChatMessage, ChatMessage } from '../../services/ai-service';
import { isErpAuthenticated } from '../../services/ai-erp-context';
import { getAiConfig } from '../../config/ai-config';

interface ChatbotPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY_CHAT_HISTORY = 'kta_chat_history_v1';

const INITIAL_GREETING: ChatMessage = {
  id: 'greeting',
  role: 'assistant',
  content:
    'Namaste! I am the **KTA ERP Assistant** powered by **Qwen AI**.\n\n' +
    'I can help you with:\n' +
    '- Checking stock balances and low-stock alerts across our 6 godowns (Kanpur, Lucknow, Agra, Varanasi, Prayagraj, Jhansi)\n' +
    '- Product catalog lookups and pricing details\n' +
    '- Transport bills, overdue balances, and LR recording workflows\n' +
    '- Guidance on navigating and operating KTA ERP\n\n' +
    '*How can I assist your operations today?*',
  timestamp: Date.now(),
  hasLiveData: false,
};

const SUGGESTED_PROMPTS = [
  'What godowns are registered in KTA?',
  'Are there any low stock alerts right now?',
  'How do I record a new transport bill?',
  'What is the rule for fleet tracking in KTA?',
];

export const ChatbotPanel: React.FC<ChatbotPanelProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY_CHAT_HISTORY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore parse errors
    }
    return [INITIAL_GREETING];
  });

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [aiConfig, setAiConfig] = useState(() => getAiConfig());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync messages to session storage
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY_CHAT_HISTORY, JSON.stringify(messages));
    } catch {
      // Ignore
    }
  }, [messages]);

  // Scroll to bottom on message updates
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus textarea when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(messages, prompt);

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: Date.now(),
        hasLiveData: response.contextSummary.hasLiveData,
        statusMessage: response.contextSummary.statusMessage,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `**Connection Notice:**\n\n${errorMsg}`,
        timestamp: Date.now(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    setMessages([INITIAL_GREETING]);
    try {
      sessionStorage.removeItem(STORAGE_KEY_CHAT_HISTORY);
    } catch {
      // Ignore
    }
  };

  const handleRetryLast = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.content);
    }
  };

  const authenticated = isErpAuthenticated();

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[450px] md:w-[480px] h-[580px] max-h-[80vh] flex flex-col bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className="bg-primary px-4 py-3 text-primary-foreground flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm">KTA AI Copilot</span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono">
                  {aiConfig.model.includes('qwen') ? 'Qwen' : aiConfig.model}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-white/80">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    authenticated ? 'bg-emerald-400' : 'bg-amber-300'
                  }`}
                />
                <span>
                  {authenticated ? 'Live ERP Connected' : 'General Assistant Mode'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
              title="AI Server Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
            <button
              onClick={handleClearHistory}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
              title="Clear chat history"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
              title="Close panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Live Data Status Notice Bar */}
        <div
          className={`px-3 py-1.5 text-[11px] border-b flex items-center justify-between ${
            authenticated
              ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
              : 'bg-amber-50 text-amber-800 border-amber-100'
          }`}
        >
          <div className="flex items-center gap-1.5 truncate">
            {authenticated ? (
              <>
                <Database className="h-3 w-3 text-emerald-600 shrink-0" />
                <span className="truncate">
                  Authorized ERP read access enabled for stock & godowns.
                </span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-3 w-3 text-amber-600 shrink-0" />
                <span className="truncate">
                  Log in to enable real-time database queries.
                </span>
              </>
            )}
          </div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="text-[10px] underline hover:no-underline font-medium shrink-0 ml-1 flex items-center gap-0.5"
          >
            <span>Tunnel URL</span>
            <ExternalLink className="h-2.5 w-2.5" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gray-50/60">
          {messages.map((message) => {
            const isUser = message.role === 'user';
            return (
              <div
                key={message.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm text-xs sm:text-sm ${
                    isUser
                      ? 'bg-primary text-primary-foreground rounded-br-xs'
                      : message.isError
                      ? 'bg-red-50 text-red-900 border border-red-200 rounded-bl-xs'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-bl-xs'
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    <>
                      <ChatSafeText content={message.content} />
                      {message.hasLiveData && (
                        <div className="mt-2 pt-1.5 border-t border-gray-100 flex items-center gap-1 text-[10px] text-emerald-700 font-medium">
                          <Database className="h-3 w-3 text-emerald-600" />
                          <span>Referenced verified live ERP records</span>
                        </div>
                      )}
                      {message.isError && (
                        <div className="mt-2.5 pt-2 border-t border-red-200 flex items-center justify-between gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRetryLast}
                            className="text-[11px] h-7 px-2 border-red-300 text-red-700 hover:bg-red-100 gap-1"
                          >
                            <RotateCcw className="h-3 w-3" />
                            Retry
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsSettingsOpen(true)}
                            className="text-[11px] h-7 px-2 text-red-700 hover:bg-red-100"
                          >
                            Update Tunnel
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {isUser && (
                  <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mt-0.5 text-gray-600">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-2.5 justify-start items-center">
              <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-primary animate-pulse" />
              </div>
              <div className="bg-white rounded-2xl rounded-bl-xs px-3.5 py-2.5 border border-gray-100 shadow-sm flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex space-x-1">
                  <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce"></span>
                </div>
                <span>Thinking with Qwen AI...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts (shown when only greeting exists) */}
        {messages.length === 1 && (
          <div className="px-3 py-2 bg-gray-50 border-t border-gray-100">
            <p className="text-[10px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-primary" />
              Suggested questions:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="text-[11px] text-left bg-white hover:bg-gray-100 border border-gray-200 rounded-md px-2 py-1 text-gray-700 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-gray-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <textarea
              ref={textareaRef}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Qwen about inventory, godowns, bills..."
              rows={1}
              disabled={isLoading}
              className="flex-1 resize-none rounded-md border border-input bg-transparent px-3 py-2 text-xs sm:text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 max-h-24"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !inputPrompt.trim()}
              className="h-9 w-9 shrink-0"
              title="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1.5 px-0.5">
            <span>Press Enter to send (Shift+Enter for newline)</span>
            <span className="truncate ml-2">Read-only AI copilot</span>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <ChatSettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onConfigUpdated={() => setAiConfig(getAiConfig())}
      />
    </>
  );
};
