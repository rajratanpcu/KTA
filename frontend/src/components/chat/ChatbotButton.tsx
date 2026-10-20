// Floating Action Button for opening the KTA AI Assistant

import React from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { isErpAuthenticated } from '../../services/ai-erp-context';

interface ChatbotButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export const ChatbotButton: React.FC<ChatbotButtonProps> = ({ isOpen, onClick }) => {
  const authenticated = isErpAuthenticated();

  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 group focus:outline-none focus:ring-4 focus:ring-primary/30 ${
        isOpen
          ? 'bg-gray-800 text-white rotate-90 scale-95'
          : 'bg-primary text-white hover:bg-primary/90 hover:scale-105'
      }`}
      aria-label="Open KTA AI Assistant"
      title="Ask KTA AI Copilot (Qwen 27B)"
    >
      <div className="relative flex items-center justify-center">
        {isOpen ? (
          <Bot className="h-6 w-6 transition-transform" />
        ) : (
          <>
            <Bot className="h-6 w-6" />
            <Sparkles className="h-3 w-3 absolute -top-1.5 -right-1.5 text-amber-300 animate-pulse" />
          </>
        )}

        {/* Live ERP status indicator dot */}
        <span
          className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${
            authenticated ? 'bg-emerald-500' : 'bg-amber-400'
          }`}
          title={authenticated ? 'Live ERP Connected' : 'General Assistant Mode'}
        />
      </div>

      {/* Hover tooltip */}
      <span className="absolute right-16 px-2.5 py-1 rounded bg-gray-900 text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
        KTA AI Copilot
      </span>
    </button>
  );
};
