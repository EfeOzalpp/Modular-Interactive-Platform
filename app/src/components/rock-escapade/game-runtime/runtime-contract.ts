export type RestartApi = { restart: () => void };

export type GameRuntimeBindings = {
  isRealMobile: boolean;
  getHighScore: () => number;
  shouldPauseWhenHidden: () => boolean;
  isDemoMode: () => boolean;
  isOverlayActive: () => boolean;
  areSpawnsAllowed: () => boolean;
  onCoinsChange: (coins: number) => void;
  onGameOver: (finalCoins: number, isNewHigh: boolean) => void;
  onReady: (api: RestartApi) => void;
};

export type GameRuntimeOptions = {
  host: HTMLElement;
  bindings: GameRuntimeBindings;
};
