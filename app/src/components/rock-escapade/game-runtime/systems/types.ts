import type { Q5Frame } from '../initialize-raf';
import type { GameRuntimeBindings } from '../runtime-contract';
import type { GameWorld } from '../world';

export type GameFrameContext = Q5Frame & {
  q5: any;
  world: GameWorld;
  bindings: GameRuntimeBindings;
  demo: boolean;
};

export type GameSystem = {
  name: string;
  update: (context: GameFrameContext) => void;
};
