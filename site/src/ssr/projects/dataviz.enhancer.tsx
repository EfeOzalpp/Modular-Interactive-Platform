// src/components/dataviz/DataVizEnhancer.tsx
import { useEffect } from 'react';
import { useTooltipInit } from '../../utils/tooltip/tooltipInit';

export default function DataVizEnhancer() {
  useTooltipInit();

  useEffect(() => {
    const vid = document.getElementById('dataviz-media-video') as HTMLVideoElement | null;
    if (!vid) return;

    const cleanupFns: Array<() => void> = [];
    let pausedByVisibility = false;

    // 1) Upgrade poster to high-res if provided by SSR
    const fullPoster = vid.dataset?.srcFull;
    if (fullPoster && vid.poster !== fullPoster) {
      vid.poster = fullPoster;
    }

    // 2) Load eagerly if needed
    if (vid.readyState === 0) {
      vid.preload = 'auto'; // or 'metadata' if you want lighter behavior
      try {
        vid.load();
      } catch {
        // ignore
      }
    }

    // 3) Hide poster after first painted frame
    const hidePoster = () => {
      vid.removeAttribute('poster');
    };

    const onPlay = () => {
      const anyV = vid as any;
      if (typeof anyV.requestVideoFrameCallback === 'function') {
        anyV.requestVideoFrameCallback(() => hidePoster());
      } else {
        const onTime = () => {
          if (vid.currentTime > 0 && vid.readyState >= 2) {
            vid.removeEventListener('timeupdate', onTime);
            hidePoster();
          }
        };
        vid.addEventListener('timeupdate', onTime, { once: true });
        cleanupFns.push(() => vid.removeEventListener('timeupdate', onTime));

        // Safety backstop
        const timer = setTimeout(() => {
          vid.removeEventListener('timeupdate', onTime);
          hidePoster();
        }, 1200);
        cleanupFns.push(() => clearTimeout(timer));
      }
    };

    vid.addEventListener('play', onPlay, { once: true });
    cleanupFns.push(() => vid.removeEventListener('play', onPlay));

    // 4) Try autoplay (muted/inline usually works)
    vid.play().catch(() => {
      // If blocked, poster stays; user interaction will start it.
    });

    // 5) Pause on hidden, resume only if *we* paused it
    const onVis = () => {
      if (document.hidden) {
        // If it’s playing, we pause it and remember we did so.
        if (!vid.paused) {
          pausedByVisibility = true;
          vid.pause();
          return;
        }

        // If it's already paused but mid-stream (not ended, has played),
        // assume the pause is due to tab/page lifecycle, not a deliberate user stop.
        if (!vid.ended && vid.currentTime > 0) {
          pausedByVisibility = true;
        }

        return;
      }

      // Document is visible again
      if (pausedByVisibility) {
        pausedByVisibility = false;

        const tryPlay = () => {
          vid.play().catch(() => {
            // Autoplay might be blocked; user gesture will start it.
          });
        };

        if (typeof requestAnimationFrame === 'function') {
          requestAnimationFrame(tryPlay);
        } else {
          tryPlay();
        }
      }
    };

    document.addEventListener('visibilitychange', onVis);
    cleanupFns.push(() => document.removeEventListener('visibilitychange', onVis));

    return () => {
      cleanupFns.forEach((fn) => fn());
    };
  }, []);

  return null;
}
