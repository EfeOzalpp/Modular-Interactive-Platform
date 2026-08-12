import { Projectile, RectangleProjectile } from '../entities';
import type { GameWorld } from '../world';

export function tryFire(q5: any, world: GameWorld) {
  const now = q5.millis();
  if (now - world.lastFiredTime < world.cooldownDuration) return;

  world.lastFiredTime = now;
  const player = world.player;
  const vx = player.vx !== 0 || player.vy !== 0 ? player.vx : 5;
  const vy = player.vy !== 0 || player.vx !== 0 ? player.vy : 0;
  world.projectiles.push(new Projectile(q5, player.x, player.y, vx, vy));
  trimProjectiles(world);
}

export function burstRectangle(q5: any, world: GameWorld, x: number, y: number) {
  for (let index = 0; index < 8; index++) {
    const angle = q5.TWO_PI / 8 * index;
    const speed = q5.random(2, 4);
    world.projectiles.push(new RectangleProjectile(
      q5,
      x,
      y,
      Math.cos(angle) * speed,
      Math.sin(angle) * speed,
      '#c896ff'
    ));
  }
  trimProjectiles(world);
}

function trimProjectiles(world: GameWorld) {
  if (world.projectiles.length > world.maximumProjectiles) {
    world.projectiles.splice(0, world.projectiles.length - world.maximumProjectiles);
  }
}
