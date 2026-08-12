// src/components/query-searcher/index.tsx
import { QuerySearcherProvider, useQuerySearcher } from '../../state/providers/query-searcher-context';
import ChatBox from './chatbox';
import MessageStream from './message-stream';
import { useTooltipInit } from '../general-ui/tooltip/tooltipInit';
import '../../styles/block-type-t.css';

export function QuerySearcherSurface() {
  const { hasMessages, scrollPercent, messages, requestScrollToBottom } = useQuerySearcher();

  useTooltipInit();
  const showFade = hasMessages;
  const showIndicator = messages.length >= 7;
  const caughtUp = scrollPercent >= 95;

  return (
    <div className={`at-surface tooltip-query-searcher${hasMessages ? ' has-messages' : ''}`}>
      {showFade && (
        <div className="at-messages-fade">
          <div className="at-top-nav">
            <div className="at-top-nav-placeholder" />
            {showIndicator && (
              <div className={`at-scroll-indicator${caughtUp ? ' caught-up' : ''}`}>
                {caughtUp ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : `${scrollPercent}%`}
              </div>
            )}
          </div>
          <div className="at-gradient-fade" />
        </div>
      )}
      {showFade && scrollPercent < 75 && (
        <button className="at-scroll-bottom-btn" onClick={requestScrollToBottom} aria-label="Scroll to bottom">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
      {!hasMessages && <p className="at-greeting">I'll scrape relevant web domains.</p>}
      <MessageStream />
      <ChatBox />
    </div>
  );
}

export default function QuerySearcher() {
  return (
    <QuerySearcherProvider>
      <section
        className="query-searcher"
        id="no-ssr"
        style={{ position: 'relative', width: '100%', height: '96dvh', overflow: 'hidden', overflowAnchor: 'none' }}
      >
        <QuerySearcherSurface />
      </section>
    </QuerySearcherProvider>
  );
}
