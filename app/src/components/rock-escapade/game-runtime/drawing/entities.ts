type PlayerRenderState = {
  x: number;
  y: number;
  radius: number;
  c: any;
  trail: Array<{ x: number; y: number }>;
};

type ShapeRenderState = {
  x: number;
  y: number;
  w: number;
  h: number;
  size: number;
  c: any;
  rotation: number;
  isOctagon: boolean;
};

type ParticleRenderState = {
  x: number;
  y: number;
  lifespan: number;
  c: any;
};

type ProjectileRenderState = {
  x: number;
  y: number;
  radius?: number;
  size?: number;
  color: any;
  rotation?: number;
  trail?: Array<{ x: number; y: number; alpha: number }>;
  lifespan?: number;
  maxLifespan?: number;
};

export function drawPlayer(q5: any, player: PlayerRenderState) {
  const count = player.trail.length;
  for (let index = 0; index < count; index++) {
    const position = player.trail[index];
    const alpha = q5.map(index, 0, count - 1, 30, 100);
    const radius = q5.map(index, 0, count - 1, player.radius / 2, player.radius);
    q5.fill(200, 150, 255, alpha);
    q5.noStroke();
    q5.ellipse(position.x, position.y, radius, radius);
  }

  q5.fill(player.c);
  q5.noStroke();
  q5.ellipse(player.x, player.y, player.radius, player.radius);
}

export function drawShape(q5: any, shape: ShapeRenderState) {
  q5.push();
  q5.translate(
    shape.x + (shape.isOctagon ? shape.size / 2 : shape.w / 2),
    shape.y + (shape.isOctagon ? shape.size / 2 : shape.h / 2)
  );
  q5.rotate(q5.radians(shape.rotation));
  q5.fill(shape.c);
  q5.noStroke();

  if (shape.isOctagon) {
    const step = q5.TWO_PI / 8;
    q5.beginShape();
    for (let index = 0; index < 8; index++) {
      const angle = index * step;
      q5.vertex(
        Math.cos(angle) * shape.size / 2,
        Math.sin(angle) * shape.size / 2
      );
    }
    q5.endShape(q5.CLOSE);
  } else {
    q5.rectMode(q5.CENTER);
    q5.rect(0, 0, shape.w, shape.h);
  }

  q5.pop();
}

export function drawParticle(q5: any, particle: ParticleRenderState) {
  q5.noStroke();
  q5.fill(
    particle.c.levels[0],
    particle.c.levels[1],
    particle.c.levels[2],
    particle.lifespan
  );
  q5.ellipse(particle.x, particle.y, 4, 4);
}

export function drawProjectile(q5: any, projectile: ProjectileRenderState) {
  if (typeof projectile.size === 'number') {
    q5.push();
    q5.translate(projectile.x, projectile.y);
    q5.rotate(q5.radians(projectile.rotation ?? 0));
    const alpha = q5.map(
      projectile.lifespan,
      0,
      projectile.maxLifespan,
      0,
      255
    );
    q5.fill(
      projectile.color.levels[0],
      projectile.color.levels[1],
      projectile.color.levels[2],
      alpha
    );
    q5.noStroke();
    q5.rectMode(q5.CENTER);
    q5.rect(0, 0, projectile.size, projectile.size);
    q5.pop();
    return;
  }

  const radius = projectile.radius ?? 0;
  for (const trailPoint of projectile.trail ?? []) {
    q5.fill(200, 150, 255, trailPoint.alpha);
    q5.noStroke();
    q5.ellipse(trailPoint.x, trailPoint.y, radius * 2, radius * 2);
  }
  q5.fill(projectile.color);
  q5.noStroke();
  q5.ellipse(projectile.x, projectile.y, radius * 2, radius * 2);
}
