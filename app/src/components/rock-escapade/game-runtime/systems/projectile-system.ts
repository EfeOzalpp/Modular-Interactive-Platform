import type { GameSystem } from './types';

export const projectileSystem: GameSystem = {
  name: 'projectiles',
  update: ({ world, delta, viewportWidth, viewportHeight }) => {
    for (let index = world.projectiles.length - 1; index >= 0; index--) {
      const projectile = world.projectiles[index];
      projectile.update(delta);
      if (projectile.isDead(viewportWidth, viewportHeight)) {
        world.projectiles.splice(index, 1);
      }
    }
  },
};
