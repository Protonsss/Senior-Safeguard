'use client';

import { motion } from 'framer-motion';
import { Volume2, User } from 'lucide-react';
import GlassPanel from './GlassPanel';

interface Message {
  role: 'assistant' | 'user';
  text: string;
  timestamp: string;
}

interface ConversationPaneProps {
  messages: Message[];
}

/**
 * ConversationPane
 * Displays conversation history with glass-style bubbles
 */
export default function ConversationPane({ messages }: ConversationPaneProps) {
  return (
    <GlassPanel className="p-6 h-full overflow-y-auto custom-scrollbar">
      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[200px]">
            <p className="text-lg text-slate-700 text-center">
              Tap the voice button to start talking with your assistant.
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.05 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] ${msg.role === 'user' ? 'ml-auto' : 'mr-auto'}`}>
                {/* Role label */}
                <div className="flex items-center gap-2 mb-2">
                  {msg.role === 'assistant' ? (
                    <>
                      <Volume2 className="w-4 h-4 text-slate-700" />
                      <span className="text-sm font-medium text-slate-700">Assistant</span>
                    </>
                  ) : (
                    <>
                      <User className="w-4 h-4 text-slate-700" />
                      <span className="text-sm font-medium text-slate-700">You</span>
                    </>
                  )}
                  <span className="text-sm text-slate-500">{msg.timestamp}</span>
                </div>
                
                {/* Message bubble */}
                <div 
                  className={`
                    backdrop-blur-md rounded-2xl px-5 py-4 shadow-md
                    ${msg.role === 'assistant' 
                      ? 'bg-white/70 border border-white/40' 
                      : 'bg-gradient-to-br from-amber-200/60 to-rose-200/60 border border-white/50'
                    }
                  `}
                >
                  <p className="text-lg md:text-xl text-slate-900 leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </GlassPanel>
  );
}

