import { createGameSketch } from './create-game-sketch';
import { installDisplayMetaLifecycle } from './display-meta';
import {
  createQ5Instance,
  destroyQ5Instance,
  loadQ5Constructor,
} from './initialize-q5';
import { scheduleOnAnimationFrame } from './initialize-raf';
import type { GameRuntimeOptions } from './runtime-contract';

export class RockEscapadeRuntime {
  private alive = true;
  private visible = true;
  private q5Instance: any = null;
  private cancelScheduledMount: (() => void) | null = null;
  private disposeDisplayMeta: (() => void) | null = null;

  constructor(private readonly options: GameRuntimeOptions) {}

  async start() {
    try {
      const Q5 = await loadQ5Constructor();
      if (!this.alive || !this.options.host.isConnected) return;

      this.cancelScheduledMount = scheduleOnAnimationFrame(() => {
        if (!this.alive || !this.options.host.isConnected) return;

        const gameSketch = createGameSketch({
          host: this.options.host,
          bindings: this.options.bindings,
          isVisible: () => this.visible,
        });

        try {
          this.q5Instance = createQ5Instance(Q5, gameSketch.sketch, this.options.host);
        } catch (error) {
          console.error('[GameCanvas] q5 init error', error);
          return;
        }

        this.disposeDisplayMeta = installDisplayMetaLifecycle({
          host: this.options.host,
          getInstance: () => this.q5Instance,
          shouldPauseWhenHidden: this.options.bindings.shouldPauseWhenHidden,
          setVisible: (visible) => { this.visible = visible; },
          onDisplayMetaChange: gameSketch.onDisplayMetaChange,
        });
      });
    } catch (error) {
      console.error('[GameCanvas] q5 load error', error);
    }
  }

  destroy() {
    this.alive = false;
    this.cancelScheduledMount?.();
    this.cancelScheduledMount = null;
    this.disposeDisplayMeta?.();
    this.disposeDisplayMeta = null;

    if (this.q5Instance) {
      destroyQ5Instance(this.q5Instance, this.options.host);
      this.q5Instance = null;
    }
  }
}
