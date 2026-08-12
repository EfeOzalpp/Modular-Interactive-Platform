import { Particle, Shape } from '../entities';
import type { GameSystem } from './types';

export const collectibleSystem: GameSystem = {
  name: 'collectibles',
  update: ({ q5, world, bindings, demo, delta, nowMillis, viewportWidth, viewportHeight }) => {
    if (bindings.areSpawnsAllowed() && nowMillis - world.lastOctagonSpawnTime > 2000) {
      if (world.octagons.length === 0) {
        world.octagons.push(new Shape(q5, true, true, world.verticalMode, world.goldColors));
      }
      world.lastOctagonSpawnTime = nowMillis;
    }

    const offscreenBuffer = 150;
    for (let index = world.octagons.length - 1; index >= 0; index--) {
      const octagon = world.octagons[index];
      octagon.update(delta);

      if (world.player.overlaps(octagon)) {
        if (!demo) {
          world.coins += 20;
          bindings.onCoinsChange(world.coins);
        }
        for (let particleIndex = 0; particleIndex < 10; particleIndex++) {
          world.particles.push(new Particle(
            q5,
            octagon.x + octagon.size / 2,
            octagon.y + octagon.size / 2,
            255,
            octagon.c,
            0,
            0,
            5
          ));
        }
        trimParticles(world);
        world.octagons.splice(index, 1);
        continue;
      }

      const speed = Math.abs(octagon.vx) + Math.abs(octagon.vy);
      const particleRate = speed < 1 ? 0.05 : speed < 3 ? 0.1 : speed < 6 ? 0.2 : 0.3;
      const wholeParticles = Math.floor(particleRate);
      for (let particleIndex = 0; particleIndex < wholeParticles; particleIndex++) {
        world.particles.push(new Particle(q5, octagon.x + octagon.size / 2, octagon.y + octagon.size / 2, 255, octagon.c));
      }
      if (q5.random() < particleRate - wholeParticles) {
        world.particles.push(new Particle(q5, octagon.x + octagon.size / 2, octagon.y + octagon.size / 2, 255, octagon.c));
      }
      trimParticles(world);

      if (
        octagon.x + octagon.size < -offscreenBuffer ||
        octagon.x - octagon.size > viewportWidth + offscreenBuffer ||
        octagon.y + octagon.size < -offscreenBuffer ||
        octagon.y - octagon.size > viewportHeight + offscreenBuffer
      ) {
        world.octagons.splice(index, 1);
      }
    }
  },
};

function trimParticles(world: import('../world').GameWorld) {
  if (world.particles.length > world.maximumParticles) {
    world.particles.splice(0, world.particles.length - world.maximumParticles);
  }
}
