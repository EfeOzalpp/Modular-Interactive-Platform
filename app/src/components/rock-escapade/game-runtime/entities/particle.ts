export class Particle {
  vx: number;
  vy: number;

  constructor(
    q5: any,
    public x: number,
    public y: number,
    public lifespan = 255,
    public c = q5.color(255, 215, 0),
    sourceVx = 0,
    sourceVy = 0,
    multiplier: number | null = null
  ) {
    const sourceSpeed = Math.hypot(sourceVx, sourceVy);
    let speed = q5.map(sourceSpeed, 0, 5, 1, 3);
    speed = q5.constrain(speed, 1.2, 3.5);
    if (multiplier != null) speed *= multiplier;
    const angle = q5.random(0, q5.TWO_PI);
    this.vx = Math.cos(angle) * speed + sourceVx * 0.1;
    this.vy = Math.sin(angle) * speed + sourceVy * 0.1;
  }

  update(delta: number) {
    this.x += this.vx * delta;
    this.y += this.vy * delta;
    this.lifespan -= delta;
  }

  isDead() {
    return this.lifespan <= 0;
  }
}
