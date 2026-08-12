export class Player {
  vx = 0;
  vy = 0;
  ax = 0;
  ay = 0;
  color: any;
  trail: Array<{ x: number; y: number }> = [];

  constructor(
    q5: any,
    public x: number,
    public y: number,
    public radius: number
  ) {
    this.color = q5.color(200, 150, 255);
  }

  get c() {
    return this.color;
  }

  update(delta: number, viewportWidth: number, viewportHeight: number) {
    this.vx += this.ax * delta;
    this.vy += this.ay * delta;

    const damping = Math.pow(0.92, delta);
    this.vx *= damping;
    this.vy *= damping;
    this.x += this.vx * delta;
    this.y += this.vy * delta;

    if (this.y + this.radius < 0) this.y = viewportHeight + this.radius;
    else if (this.y - this.radius > viewportHeight) this.y = -this.radius;

    if (this.x + this.radius < 0) this.x = viewportWidth + this.radius;
    else if (this.x - this.radius > viewportWidth) this.x = -this.radius;

    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 8) this.trail.shift();

    const speedLimit = 10;
    this.vx = Math.max(-speedLimit, Math.min(speedLimit, this.vx));
    this.vy = Math.max(-speedLimit, Math.min(speedLimit, this.vy));
  }

  moveUp() { this.ay = -0.5; }
  moveDown() { this.ay = 0.5; }
  moveLeft() { this.ax = -0.5; }
  moveRight() { this.ax = 0.5; }
  stopVertical() { this.ay = 0; }
  stopHorizontal() { this.ax = 0; }

  overlaps(other: any) {
    if (other.isOctagon) {
      const dx = this.x - (other.x + other.size / 2);
      const dy = this.y - (other.y + other.size / 2);
      const combinedRadius = this.radius + other.size / 2;
      return dx * dx + dy * dy < combinedRadius * combinedRadius;
    }

    const closestX = Math.max(other.x, Math.min(this.x, other.x + other.w));
    const closestY = Math.max(other.y, Math.min(this.y, other.y + other.h));
    const dx = this.x - closestX;
    const dy = this.y - closestY;
    const collisionRadius = this.radius * 0.3;
    return dx * dx + dy * dy < collisionRadius * collisionRadius;
  }
}
