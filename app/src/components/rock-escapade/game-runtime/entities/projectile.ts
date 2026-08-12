export class Projectile {
  vx: number;
  vy: number;
  readonly directionX: number;
  readonly directionY: number;
  readonly radius = 6;
  lifespan = 500;
  trail: Array<{ x: number; y: number; alpha: number }> = [];
  color: any;
  minimumSpeed = 0.6;
  maximumSpeed = 12;
  speed = this.minimumSpeed;
  targetSpeed = 8;
  acceleration = 3;

  constructor(
    q5: any,
    public x: number,
    public y: number,
    vx: number,
    vy: number
  ) {
    const magnitude = Math.hypot(vx, vy) || 1;
    this.directionX = vx / magnitude;
    this.directionY = vy / magnitude;
    this.vx = this.directionX * this.speed;
    this.vy = this.directionY * this.speed;
    this.color = q5.color(200, 150, 255);
  }

  update(delta: number) {
    this.speed += (this.targetSpeed - this.speed) * this.acceleration * delta;
    this.speed = Math.max(this.minimumSpeed, Math.min(this.maximumSpeed, this.speed));
    this.vx = this.directionX * this.speed;
    this.vy = this.directionY * this.speed;
    this.x += this.vx * delta;
    this.y += this.vy * delta;
    this.lifespan -= delta;
    this.trail.push({ x: this.x, y: this.y, alpha: 160 });
    if (this.trail.length > 20) this.trail.shift();
    for (const point of this.trail) point.alpha *= 0.8;
  }

  isDead(viewportWidth: number, viewportHeight: number) {
    return this.lifespan <= 0 || this.x < 0 || this.x > viewportWidth || this.y < 0 || this.y > viewportHeight;
  }
}

export class RectangleProjectile {
  size: number;
  lifespan = 80;
  readonly maxLifespan = this.lifespan;
  color: any;
  rotation: number;
  rotationSpeed: number;

  constructor(
    q5: any,
    public x: number,
    public y: number,
    public vx: number,
    public vy: number,
    color: string
  ) {
    this.size = q5.random(8, 20);
    const factor = q5.map(this.size, 8, 20, 1, 2);
    this.vx *= factor;
    this.vy *= factor;
    this.color = q5.color(color);
    this.rotation = q5.random(360);
    this.rotationSpeed = q5.random(-20, 20);
  }

  update(delta: number) {
    this.x += this.vx * delta;
    this.y += this.vy * delta;
    this.lifespan -= delta;
    this.rotation += this.rotationSpeed * delta;
  }

  isDead(viewportWidth: number, viewportHeight: number) {
    return (
      this.lifespan <= 0 ||
      this.x < -50 ||
      this.x > viewportWidth + 50 ||
      this.y < -50 ||
      this.y > viewportHeight + 50
    );
  }
}

export type GameProjectile = Projectile | RectangleProjectile;
