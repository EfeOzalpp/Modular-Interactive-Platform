import { Player } from '../entities';
import type { GameSystem } from './types';

export const playerSystem: GameSystem = {
  name: 'player',
  update: ({ q5, world, bindings, demo, delta, viewportWidth, viewportHeight }) => {
    if (!demo && world.lastDemoFlag) {
      world.rectangles.length = 0;
      world.octagons.length = 0;
      world.particles.length = 0;
      world.projectiles.length = 0;
      world.coins = 0;
      bindings.onCoinsChange(0);

      world.player = new Player(q5, 240, q5.height / 2, 33);
      const now = q5.millis();
      world.lastOctagonSpawnTime = now;
      world.lastSpawnTime = now;
    }
    world.lastDemoFlag = demo;

    if (!demo && bindings.isOverlayActive()) {
      world.movingUp = false;
      world.movingDown = false;
      world.movingLeft = false;
      world.movingRight = false;
      world.player.stopHorizontal();
      world.player.stopVertical();
    }

    if (demo) autoEvade(q5, world);
    else applyDirectionalInput(world);

    world.player.update(delta, viewportWidth, viewportHeight);
  },
};

function applyDirectionalInput(world: import('../world').GameWorld) {
  if (world.movingUp) world.player.moveUp();
  else if (world.movingDown) world.player.moveDown();
  else world.player.stopVertical();

  if (world.movingLeft) world.player.moveLeft();
  else if (world.movingRight) world.player.moveRight();
  else world.player.stopHorizontal();
}

function autoEvade(q5: any, world: import('../world').GameWorld) {
  let evadeX = 0;
  let evadeY = 0;
  let danger = 0;

  for (const rectangle of world.rectangles) {
    const centerX = rectangle.x + rectangle.w / 2;
    const centerY = rectangle.y + rectangle.h / 2;
    const dx = world.player.x - centerX;
    const dy = world.player.y - centerY;
    const distanceSquared = dx * dx + dy * dy;
    if (distanceSquared < 20000) {
      const distance = Math.sqrt(distanceSquared) || 1;
      const force = 1 / (distance + 300) * 150;
      evadeX += dx / distance * force;
      evadeY += dy / distance * force;
      danger += 1 / (distance + 1) * 10;
    }
  }

  let attractX = 0;
  let attractY = 0;
  if (world.octagons.length > 0 && danger < 50) {
    const target = world.octagons.reduce((closest, candidate) => {
      const closestDistance = Math.hypot(
        world.player.x - (closest.x + closest.size / 2),
        world.player.y - (closest.y + closest.size / 2)
      );
      const candidateDistance = Math.hypot(
        world.player.x - (candidate.x + candidate.size / 2),
        world.player.y - (candidate.y + candidate.size / 2)
      );
      return candidateDistance < closestDistance ? candidate : closest;
    });
    const dx = target.x + target.size / 2 - world.player.x;
    const dy = target.y + target.size / 2 - world.player.y;
    const distance = Math.hypot(dx, dy) || 1;
    attractX = dx / distance * 0.45;
    attractY = dy / distance * 0.45;
  }

  world.player.ax = evadeX + attractX;
  world.player.ay = evadeY + attractY;

  if (world.player.ax === 0 && world.player.ay === 0) {
    const dx = q5.width / 2 - world.player.x;
    const dy = q5.height / 2 - world.player.y;
    const distance = Math.hypot(dx, dy) || 1;
    world.player.ax = dx / distance * 0.1;
    world.player.ay = dy / distance * 0.1;
  }
}
