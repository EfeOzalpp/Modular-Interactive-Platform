import { collectibleSystem } from './collectible-system';
import { effectsSystem } from './effects-system';
import { lifecycleSystem } from './lifecycle-system';
import { obstacleSystem } from './obstacle-system';
import { playerSystem } from './player-system';
import { projectileSystem } from './projectile-system';
import type { GameSystem } from './types';

export function createGameSystems(): GameSystem[] {
  return [
    playerSystem,
    obstacleSystem,
    collectibleSystem,
    effectsSystem,
    projectileSystem,
    lifecycleSystem,
  ];
}

export type { GameFrameContext, GameSystem } from './types';
