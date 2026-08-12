import { useEffect, useRef } from 'react';
import { useRealMobileViewport } from '../../shared/useRealMobile';
import { RockEscapadeRuntime } from './game-runtime';
import type { RestartApi } from './game-runtime';

type Props = {
  onCoinsChange?: (coins: number) => void;
  highScore?: number;
  onGameOver?: (finalCoins: number, isNewHigh: boolean) => void;
  onReady?: (api: RestartApi) => void;
  pauseWhenHidden?: boolean;
  demoMode?: boolean;
  overlayActive?: boolean;
  allowSpawns?: boolean;
};

export default function GameCanvas({
  onCoinsChange,
  highScore = 0,
  onGameOver,
  onReady,
  pauseWhenHidden = true,
  demoMode = false,
  overlayActive = false,
  allowSpawns = true,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const isRealMobile = useRealMobileViewport();

  const coinsChangeRef = useRef(onCoinsChange);
  const gameOverRef = useRef(onGameOver);
  const readyRef = useRef(onReady);
  const highScoreRef = useRef(highScore);
  const pauseHiddenRef = useRef(pauseWhenHidden);
  const demoRef = useRef(demoMode);
  const overlayRef = useRef(overlayActive);
  const allowSpawnsRef = useRef(allowSpawns);

  coinsChangeRef.current = onCoinsChange;
  gameOverRef.current = onGameOver;
  readyRef.current = onReady;
  highScoreRef.current = highScore;
  pauseHiddenRef.current = pauseWhenHidden;
  demoRef.current = demoMode;
  overlayRef.current = overlayActive;
  allowSpawnsRef.current = allowSpawns;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const runtime = new RockEscapadeRuntime({
      host,
      bindings: {
        isRealMobile,
        getHighScore: () => highScoreRef.current,
        shouldPauseWhenHidden: () => pauseHiddenRef.current,
        isDemoMode: () => demoRef.current,
        isOverlayActive: () => overlayRef.current,
        areSpawnsAllowed: () => allowSpawnsRef.current,
        onCoinsChange: (coins) => coinsChangeRef.current?.(coins),
        onGameOver: (coins, isNewHigh) => gameOverRef.current?.(coins, isNewHigh),
        onReady: (api) => readyRef.current?.(api),
      },
    });

    void runtime.start();
    return () => runtime.destroy();
  }, [isRealMobile]);

  return (
    <div
      className="evade-the-rock"
      ref={hostRef}
      style={{ width: '100vw', height: '100dvh' }}
    />
  );
}
