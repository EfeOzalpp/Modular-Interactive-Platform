import type { GameSystem } from './types';

export const effectsSystem: GameSystem = {
  name: 'effects',
  update: ({ world, delta }) => {
    for (let index = world.particles.length - 1; index >= 0; index--) {
      const particle = world.particles[index];
      particle.update(delta);
      if (particle.isDead()) world.particles.splice(index, 1);
    }
  },
};
