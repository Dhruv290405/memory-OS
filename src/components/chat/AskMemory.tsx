'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { AskResponse } from '@/types/api';
import { getEventTypeColor } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  references?: AskResponse['references'];
  confidence?: number;
  followUps?: string[];
}

interface AskMemoryChatProps {
  workspaceId?: string;
}

export function AskMemoryChat({ workspaceId }: AskMemoryChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const ask = async (query: string) => {
    setLoading(true);
    setMessages((prev) => [...prev, { role: 'user', content: query }]);
    setInput('');

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, conversationId, workspaceId }),
      });

      if (res.ok) {
        const data: AskResponse & { conversationId: string } = await res.json();
        setConversationId(data.conversationId);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.answer,
            references: data.references,
            confidence: data.confidence,
            followUps: data.followUpSuggestions,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Sorry, I encountered an error processing your request. Please try again.',
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Connection error. Please ensure the server is running.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    ask(input.trim());
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="text-5xl mb-4 opacity-20">◆</div>
              <h3 className="text-lg font-semibold text-white/60 mb-2">Ask MemoryOS</h3>
              <p className="text-sm text-white/30 leading-relaxed">
                Ask questions about your organizational memory. I can help you understand decisions, trace timelines,
                identify risks, and surface context from past discussions and events.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                {[
                  'Why did we move to gRPC?',
                  'What happened during the Oct outage?',
                  'Show decisions about database scaling',
                  'What security issues are open?',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => ask(suggestion)}
                    className="px-3 py-1.5 text-xs rounded-full bg-white/[0.05] border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.08] transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  msg.role === 'user'
                    ? 'bg-indigo-500/15 border border-indigo-500/20'
                    : 'bg-white/[0.03] border border-white/[0.06]'
                }`}
              >
                <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">{msg.content}</p>

                {msg.references && msg.references.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/[0.06]">
                    <p className="text-[11px] text-white/30 mb-2 font-medium">
                      Sources ({msg.references.length})
                    </p>
                    <div className="space-y-1.5">
                      {msg.references.map((ref) => (
                        <div
                          key={ref.id}
                          className="text-[11px] px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.04]"
                        >
                          <span className="text-white/60">{ref.title}</span>
                          <span className="text-white/20 ml-2">score: {ref.score.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {msg.followUps && msg.followUps.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/[0.06]">
                    <p className="text-[11px] text-white/30 mb-2">Suggested follow-ups:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.followUps.map((f) => (
                        <button
                          key={f}
                          onClick={() => ask(f)}
                          className="text-[11px] px-2.5 py-1 rounded-full bg-white/[0.04] text-white/40 hover:text-white/70 border border-white/[0.06] transition-all"
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {msg.confidence !== undefined && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] text-white/20">
                      Confidence: {Math.round(msg.confidence * 100)}%
                    </span>
                    <div className="flex-1 max-w-[100px] h-1 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        style={{ width: `${msg.confidence * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl p-4 bg-white/[0.03] border border-white/[0.06]">
              <Spinner size={18} />
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about decisions, incidents, architecture..."
          disabled={loading}
          className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-50"
        />
        <Button type="submit" disabled={loading || !input.trim()}>
          {loading ? <Spinner size={16} /> : 'Ask'}
        </Button>
      </form>
    </div>
  );
}
