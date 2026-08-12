export class Shape {
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
  w = 0;
  h = 0;
  size = 0;
  c: any;
  rotation = 0;
  rotationSpeed = 0;

  constructor(
    private readonly q5: any,
    startOffscreen: boolean,
    public readonly isOctagon: boolean,
    public readonly verticalMode: boolean,
    private readonly goldColors: any[]
  ) {
    this.reset(startOffscreen);
  }

  reset(startOffscreen: boolean) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (this.verticalMode) {
      this.x = this.q5.random(this.q5.width);
      if (this.isOctagon) {
        this.y = startOffscreen ? -this.q5.random(30, 60) : this.q5.random(this.q5.height);
        this.vx = this.q5.random(-1.2, 1.2);
        if (this.q5.random() < 0.1) this.vy = this.q5.random(6, 9);
        else if (this.q5.random() < 0.2) this.vy = this.q5.random(0.5, 1.5);
        else this.vy = this.q5.random(2, 5);
        this.size = 25;
        this.c = this.q5.random(this.goldColors);
      } else {
        this.y = startOffscreen ? -this.q5.random(60, 120) : this.q5.random(this.q5.height);
        this.vx = this.q5.random(-0.5, 0.5);
        this.vy = this.q5.random(1, 3);
        this.w = this.q5.random(28, 70);
        this.h = this.q5.random(28, 70);
        this.c = this.q5.color(235, 235, 255);
      }
    } else {
      this.x = startOffscreen
        ? this.q5.width + this.q5.random(10, 40)
        : this.q5.random(this.q5.width);
      this.y = this.q5.random(this.q5.height);

      if (this.isOctagon) {
        let baseX = this.q5.random(-2.5, -0.5);
        if (viewportWidth >= 1025 && viewportWidth > viewportHeight) baseX *= 4.5;
        if (this.q5.random() < 0.1) baseX *= 2;
        else if (this.q5.random() < 0.2) baseX *= 0.5;
        this.vx = baseX;
        this.vy = this.q5.random(-0.3, 0.3);
        this.size = 25;
        this.c = this.q5.random(this.goldColors);
      } else {
        this.vx = this.q5.random(-3, -1);
        this.vy = this.q5.random(-0.5, 0.5);
        if (viewportWidth >= 1025 && viewportWidth > viewportHeight) {
          this.w = this.q5.random(33, 105);
          this.h = this.q5.random(33, 105);
        } else {
          this.w = this.q5.random(30, 75);
          this.h = this.q5.random(30, 75);
        }
        this.c = this.q5.color(235, 235, 255);
      }
    }

    this.rotation = 0;
    this.rotationSpeed = this.q5.random(-1, 1);
  }

  update(delta: number) {
    this.x += this.vx * delta;
    this.y += this.vy * delta;
    this.rotation += this.rotationSpeed * delta;
  }

  overlaps(other: Shape) {
    const width = this.isOctagon ? this.size : this.w;
    const height = this.isOctagon ? this.size : this.h;
    const otherWidth = other.isOctagon ? other.size : other.w;
    const otherHeight = other.isOctagon ? other.size : other.h;
    return !(
      this.x + width < other.x ||
      this.x > other.x + otherWidth ||
      this.y + height < other.y ||
      this.y > other.y + otherHeight
    );
  }

  resolveCollision(other: Shape) {
    const width = this.isOctagon ? this.size : this.w;
    const height = this.isOctagon ? this.size : this.h;
    const otherWidth = other.isOctagon ? other.size : other.w;
    const otherHeight = other.isOctagon ? other.size : other.h;
    const overlapX = Math.min(this.x + width, other.x + otherWidth) - Math.max(this.x, other.x);
    const overlapY = Math.min(this.y + height, other.y + otherHeight) - Math.max(this.y, other.y);

    if (overlapX < overlapY) {
      if (this.x < other.x) {
        this.x -= overlapX / 2;
        other.x += overlapX / 2;
      } else {
        this.x += overlapX / 2;
        other.x -= overlapX / 2;
      }
      this.vx *= -1;
      other.vx *= -1;
    } else {
      if (this.y < other.y) {
        this.y -= overlapY / 2;
        other.y += overlapY / 2;
      } else {
        this.y += overlapY / 2;
        other.y -= overlapY / 2;
      }
      this.vy *= -1;
      other.vy *= -1;
    }
  }
}
