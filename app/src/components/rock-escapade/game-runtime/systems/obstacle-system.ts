import { RectangleProjectile, Shape } from '../entities';
import { burstRectangle } from './weapons';
import type { GameSystem } from './types';

export const obstacleSystem: GameSystem = {
  name: 'obstacles',
  update: (context) => {
    spawnRectangles(context);
    updateRectangles(context);
    resolveRectangleCollisions(context);
  },
};

function spawnRectangles({ q5, world, bindings, nowMillis, viewportWidth, viewportHeight }: Parameters<GameSystem['update']>[0]) {
  if (!bindings.areSpawnsAllowed()) return;

  const visibleCount = world.rectangles.filter((rectangle) => (
    world.verticalMode
      ? rectangle.y + rectangle.h > 0 && rectangle.y < viewportHeight
      : rectangle.x + rectangle.w > 0 && rectangle.x < viewportWidth
  )).length;

  let maximumVisible: number;
  const windowWidth = window.innerWidth;
  if (windowWidth >= 1025) {
    maximumVisible = 50;
    if (visibleCount < 10) world.rectangleSpawnRate = 6;
    else if (visibleCount < 25) world.rectangleSpawnRate = 5;
    else if (visibleCount < 40) world.rectangleSpawnRate = 4;
    else world.rectangleSpawnRate = 0;
  } else if (windowWidth >= 768) {
    maximumVisible = 60;
    if (visibleCount < 8) world.rectangleSpawnRate = 5;
    else if (visibleCount < 20) world.rectangleSpawnRate = 4;
    else if (visibleCount < 40) world.rectangleSpawnRate = 3;
    else world.rectangleSpawnRate = 0;
  } else {
    maximumVisible = 25;
    if (visibleCount < 10) world.rectangleSpawnRate = 4;
    else if (visibleCount < 20) world.rectangleSpawnRate = 3;
    else world.rectangleSpawnRate = 1;
  }

  if (
    world.rectangleSpawnRate > 0 &&
    nowMillis - world.lastSpawnTime > 2000 / world.rectangleSpawnRate &&
    visibleCount < maximumVisible
  ) {
    world.rectangles.push(new Shape(q5, true, false, world.verticalMode, world.goldColors));
    world.lastSpawnTime = nowMillis;
  }

  if (world.rectangles.length > world.maximumRectangles) {
    world.rectangles.splice(0, world.rectangles.length - world.maximumRectangles);
  }

  if (nowMillis % 5000 < 20) {
    world.rectangles = world.rectangles.filter((rectangle) => (
      !Number.isNaN(rectangle.x) && !Number.isNaN(rectangle.y)
    ));
  }
}

function updateRectangles(context: Parameters<GameSystem['update']>[0]) {
  const { q5, world, demo, delta, viewportWidth, viewportHeight } = context;

  for (let rectangleIndex = world.rectangles.length - 1; rectangleIndex >= 0; rectangleIndex--) {
    const rectangle = world.rectangles[rectangleIndex];
    rectangle.update(delta);
    if (!demo && world.player.overlaps(rectangle)) world.gameOver = true;

    for (let projectileIndex = world.projectiles.length - 1; projectileIndex >= 0; projectileIndex--) {
      const projectile = world.projectiles[projectileIndex];
      const isFragment = projectile instanceof RectangleProjectile;
      const projectileSize = isFragment ? projectile.size : projectile.radius * 2;
      const projectileX = projectile.x - (isFragment ? projectile.size / 2 : projectile.radius);
      const projectileY = projectile.y - (isFragment ? projectile.size / 2 : projectile.radius);

      if (
        projectileX + projectileSize > rectangle.x &&
        projectileX < rectangle.x + rectangle.w &&
        projectileY + projectileSize > rectangle.y &&
        projectileY < rectangle.y + rectangle.h
      ) {
        if (isFragment) {
          if (q5.random() < 0.05) {
            world.rectangles.splice(rectangleIndex, 1);
            world.projectiles.splice(projectileIndex, 1);
            burstRectangle(q5, world, rectangle.x + rectangle.w / 2, rectangle.y + rectangle.h / 2);
          } else {
            projectile.vx *= -1;
            projectile.vy *= -1;
            projectile.x += projectile.vx * delta * 2;
            projectile.y += projectile.vy * delta * 2;
          }
        } else {
          world.rectangles.splice(rectangleIndex, 1);
          world.projectiles.splice(projectileIndex, 1);
          burstRectangle(q5, world, rectangle.x + rectangle.w / 2, rectangle.y + rectangle.h / 2);
        }
        break;
      }
    }

    const offscreen = world.verticalMode
      ? rectangle.y - rectangle.h > viewportHeight + 100 || rectangle.y + rectangle.h < -100
      : rectangle.x + rectangle.w < -100 || rectangle.x - rectangle.w > viewportWidth + 100;

    if (offscreen) world.rectangles.splice(rectangleIndex, 1);
  }
}

function resolveRectangleCollisions({ world }: Parameters<GameSystem['update']>[0]) {
  for (let firstIndex = 0; firstIndex < world.rectangles.length; firstIndex++) {
    const first = world.rectangles[firstIndex];
    for (let secondIndex = firstIndex + 1; secondIndex < world.rectangles.length; secondIndex++) {
      const second = world.rectangles[secondIndex];
      if (first.overlaps(second)) first.resolveCollision(second);
    }
  }
}
