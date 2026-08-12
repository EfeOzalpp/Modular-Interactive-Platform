import { initializeCanvasMeta } from './display-meta';
import type { DisplayMetaSnapshot } from './display-meta';
import { createRenderPasses } from './drawing';
import { initializeGameLoop } from './game-loop';
import { initializeRafClock } from './initialize-raf';
import { installKeyboardInput, installPointerInput } from './input';
import type { GameRuntimeBindings } from './runtime-contract';
import { createGameSystems } from './systems';
import { GameWorld } from './world';

type GameSketchOptions = {
  host: HTMLElement;
  bindings: GameRuntimeBindings;
  isVisible: () => boolean;
};

export function createGameSketch({
  host,
  bindings,
  isVisible,
}: GameSketchOptions) {
  let q5Instance: any = null;
  let world: GameWorld | null = null;

  const sketch = (q5: any) => {
    q5Instance = q5;
    world = new GameWorld(bindings.isRealMobile);
    const gameWorld = world;

    const restart = () => gameWorld.restart(q5, bindings.onCoinsChange);

    q5.setup = () => {
      initializeRafClock(q5, 60);
      const canvasMeta = initializeCanvasMeta({
        q5,
        host,
        isRealMobile: bindings.isRealMobile,
      });

      gameWorld.initialize(q5, canvasMeta.height, canvasMeta.verticalMode);

      const removePointerInput = installPointerInput(
        q5,
        canvasMeta.canvas,
        gameWorld,
        bindings
      );
      installKeyboardInput(q5, gameWorld, bindings);
      q5._pointerCleanup = removePointerInput;

      bindings.onReady({ restart });
    };

    initializeGameLoop({
      q5,
      world: gameWorld,
      bindings,
      isVisible,
      systems: createGameSystems(),
      renderPasses: createRenderPasses(),
    });
  };

  const onDisplayMetaChange = ({ verticalMode }: DisplayMetaSnapshot) => {
    if (!world || !q5Instance) return;
    world.reconfigureFlow(verticalMode, q5Instance.millis());
  };

  return { sketch, onDisplayMetaChange };
}
