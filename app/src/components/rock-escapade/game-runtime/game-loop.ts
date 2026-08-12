import { clearFrame, renderGameFrame } from './drawing';
import type { RenderPass } from './drawing';
import { bindRafFrame } from './initialize-raf';
import type { GameRuntimeBindings } from './runtime-contract';
import type { GameFrameContext, GameSystem } from './systems';
import type { GameWorld } from './world';

type GameLoopOptions = {
  q5: any;
  world: GameWorld;
  bindings: GameRuntimeBindings;
  isVisible: () => boolean;
  systems: GameSystem[];
  renderPasses: RenderPass[];
};

export function initializeGameLoop({
  q5,
  world,
  bindings,
  isVisible,
  systems,
  renderPasses,
}: GameLoopOptions) {
  bindRafFrame(q5, (frame) => {
    if (bindings.shouldPauseWhenHidden() && !isVisible()) {
      clearFrame(q5);
      return;
    }

    const context: GameFrameContext = {
      ...frame,
      q5,
      world,
      bindings,
      demo: bindings.isDemoMode(),
    };

    for (const system of systems) system.update(context);

    renderGameFrame(renderPasses, {
      q5,
      world,
      bindings,
      demo: context.demo,
      nowMillis: frame.nowMillis,
    });
  });
}
