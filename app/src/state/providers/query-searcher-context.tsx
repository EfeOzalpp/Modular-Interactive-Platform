// src/state/providers/query-searcher-context.tsx
import React, { createContext, useState, useContext, useRef, useCallback } from 'react';

export type Message = { role: 'user' | 'assistant'; content: string };

interface QuerySearcherContextType {
  messages: Message[];
  sendMessage: (content: string) => void;
  isStreaming: boolean;
  hasMessages: boolean;
  scrollPercent: number;
  setScrollPercent: (p: number) => void;
  requestScrollToBottom: () => void;
  registerScrollToBottom: (fn: () => void) => void;
}

const QuerySearcherContext = createContext<QuerySearcherContextType | undefined>(undefined);

export function QuerySearcherProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(100);

  const hasMessages = messages.length > 0;

  const scrollToBottomRef = useRef<() => void>(() => {});
  const requestScrollToBottom = useCallback(() => { scrollToBottomRef.current(); }, []);
  const registerScrollToBottom = useCallback((fn: () => void) => { scrollToBottomRef.current = fn; }, []);

  const sendMessage = useCallback(async (content: string) => {
    const userMsg: Message = { role: 'user', content };
    const nextMessages: Message[] = [...messages, userMsg];

    setMessages([...nextMessages, { role: 'assistant', content: '' }]);
    setIsStreaming(true);

    try {
      const res = await fetch('/api/claude/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6);
          if (payload === '[DONE]') break;
          try {
            const { text } = JSON.parse(payload);
            if (text) {
              setMessages(prev => {
                const thread = [...prev];
                thread[thread.length - 1] = {
                  ...thread[thread.length - 1],
                  content: thread[thread.length - 1].content + text,
                };
                return thread;
              });
            }
          } catch {}
        }
      }
    } catch (err) {
      setMessages(prev => {
        const thread = [...prev];
        thread[thread.length - 1] = { role: 'assistant', content: 'Something went wrong.' };
        return thread;
      });
    } finally {
      setIsStreaming(false);
    }
  }, [messages]);

  return (
    <QuerySearcherContext.Provider value={{ messages, sendMessage, isStreaming, hasMessages, scrollPercent, setScrollPercent, requestScrollToBottom, registerScrollToBottom }}>
      {children}
    </QuerySearcherContext.Provider>
  );
}

export function useQuerySearcher(): QuerySearcherContextType {
  const ctx = useContext(QuerySearcherContext);
  if (!ctx) throw new Error('useQuerySearcher must be used within QuerySearcherProvider');
  return ctx;
}
