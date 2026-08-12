import type { GameSystem } from './types';

export const lifecycleSystem: GameSystem = {
  name: 'lifecycle',
  update: ({ world, bindings, demo }) => {
    if (demo) {
      world.gameOver = false;
      return;
    }

    if (!world.previousGameOver && world.gameOver) {
      const isNewHighScore = world.coins > bindings.getHighScore();
      bindings.onGameOver(world.coins, isNewHighScore);
    }
    world.previousGameOver = world.gameOver;
  },
};
