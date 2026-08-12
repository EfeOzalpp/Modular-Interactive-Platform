// src/ssr/content/query-searcher.ssr.tsx
import type { SsrDescriptor } from '../types';

export const querySearcherSSR: SsrDescriptor = {
  fetch: async () => null,

  render: (_data) => (
    <section
      className="query-searcher"
      id="no-ssr"
      data-ssr-shell="query-searcher"
      style={{
        position: 'relative',
        width: '100%',
        height: '96dvh',
        overflow: 'hidden',
        overflowAnchor: 'none',
      }}
    >
      <div className="at-surface tooltip-query-searcher">
        <p className="at-greeting">I'll scrape relevant web domains.</p>

        {/* Static chatbox shell */}
        <div className="at-card">
          <textarea
            className="at-input"
            placeholder="What job title would you like to search for?"
            rows={1}
            readOnly
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
            <button className="at-send-btn" disabled>Send</button>
          </div>
        </div>
      </div>
    </section>
  ),

  criticalCssFiles: ['src/styles/block-type-t.css'],
};
