import { Particle, Player, Shape } from './entities';
import type { GameProjectile } from './entities';

export class GameWorld {
  verticalMode = false;
  rectangles: Shape[] = [];
  octagons: Shape[] = [];
  particles: Particle[] = [];
  projectiles: GameProjectile[] = [];
  player!: Player;
  goldColors: any[] = [];

  lastSpawnTime = 0;
  lastOctagonSpawnTime = 0;
  rectangleSpawnRate = 2;
  coins = 0;
  gameOver = false;
  previousGameOver = false;
  lastDemoFlag = true;
  lastFiredTime = -Infinity;

  movingUp = false;
  movingDown = false;
  movingLeft = false;
  movingRight = false;

  readonly cooldownDuration = 1500;
  readonly cooldownRadiusMax = 48;
  readonly maximumParticles: number;
  readonly maximumProjectiles = 140;
  readonly maximumRectangles = 220;

  constructor(public readonly isRealMobile: boolean) {
    this.maximumParticles = isRealMobile ? 600 : 1200;
  }

  initialize(q5: any, height: number, verticalMode: boolean) {
    this.verticalMode = verticalMode;
    this.goldColors = [
      q5.color(255, 215, 0),
      q5.color(255, 223, 70),
      q5.color(255, 200, 0),
      q5.color(255, 170, 50),
    ];
    this.lastOctagonSpawnTime = q5.millis();
    this.player = new Player(q5, 240, height / 2, 33);
  }

  reconfigureFlow(verticalMode: boolean, nowMillis: number) {
    if (verticalMode === this.verticalMode) return false;

    this.verticalMode = verticalMode;
    this.rectangles.length = 0;
    this.octagons.length = 0;
    this.particles.length = 0;
    this.rectangleSpawnRate = 2;
    this.lastSpawnTime = nowMillis;
    this.lastOctagonSpawnTime = nowMillis;
    return true;
  }

  restart(q5: any, onCoinsChange: (coins: number) => void) {
    this.gameOver = false;
    this.coins = 0;
    onCoinsChange(this.coins);
    this.rectangles.length = 0;
    this.octagons.length = 0;
    this.particles.length = 0;
    this.projectiles.length = 0;
    this.player = new Player(q5, 240, q5.height / 2, 33);
    this.lastOctagonSpawnTime = q5.millis();
  }
}
