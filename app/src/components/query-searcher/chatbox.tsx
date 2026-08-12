// src/components/query-searcher/chatbox.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useQuerySearcher } from '../../state/providers/query-searcher-context';

const JOB_SEARCH_PLACEHOLDER = 'What job title would you like to search for?';

const getScrollContainer = () =>
  document.querySelector('.Scroll') as HTMLElement | null;

export default function ChatBox() {
  const { sendMessage, isStreaming } = useQuerySearcher();
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea — restore outer scroll after browser's async scroll-into-view fires
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    const scroller = getScrollContainer();
    const saved = scroller?.scrollTop ?? 0;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
    if (scroller) requestAnimationFrame(() => { scroller.scrollTop = saved; });
  }, [input]);

  // Prevent outer scroll container from jumping when textarea receives focus
  const handleFocus = () => {
    const scroller = getScrollContainer();
    if (!scroller) return;
    const saved = scroller.scrollTop;
    requestAnimationFrame(() => { scroller.scrollTop = saved; });
  };

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="at-card">
      <textarea
        ref={textareaRef}
        className="at-input"
        id="form-field"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        placeholder={JOB_SEARCH_PLACEHOLDER}
        rows={1}
      />
      <div className="at-footer-row">
        <div className="at-mode-row">
          <div className="at-mode-switcher">
            <button className="at-mode-btn active" type="button" aria-pressed="true" disabled>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21L16.65 16.65M11 6C13.7614 6 16 8.23858 16 11M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Job Search
            </button>
          </div>
        </div>
        <button
          className="at-send-btn"
          onClick={handleSubmit}
          disabled={!input.trim() || isStreaming}
          aria-label="Send"
        >
          Send
        </button>
      </div>
    </div>
  );
}
