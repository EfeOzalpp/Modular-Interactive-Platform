import type { GameRuntimeBindings } from '../runtime-contract';
import type { GameWorld } from '../world';
import {
  clearFrame,
  drawCooldownRing,
  drawGameOverShade,
} from './frame';
import {
  drawParticle,
  drawPlayer,
  drawProjectile,
  drawShape,
} from './entities';

export type RenderContext = {
  q5: any;
  world: GameWorld;
  bindings: GameRuntimeBindings;
  demo: boolean;
  nowMillis: number;
};

export type RenderPass = {
  name: string;
  render: (context: RenderContext) => void;
};

const backgroundPass: RenderPass = {
  name: 'background',
  render: ({ q5 }) => clearFrame(q5),
};

const playerPass: RenderPass = {
  name: 'player',
  render: ({ q5, world }) => drawPlayer(q5, world.player),
};

const shapePass: RenderPass = {
  name: 'shapes',
  render: ({ q5, world }) => {
    for (const rectangle of world.rectangles) drawShape(q5, rectangle);
    for (const octagon of world.octagons) drawShape(q5, octagon);
  },
};

const particlePass: RenderPass = {
  name: 'particles',
  render: ({ q5, world, bindings }) => {
    if (!bindings.isRealMobile) q5.blendMode(q5.ADD);
    for (const particle of world.particles) drawParticle(q5, particle);
    if (!bindings.isRealMobile) q5.blendMode(q5.BLEND);
  },
};

const projectilePass: RenderPass = {
  name: 'projectiles',
  render: ({ q5, world }) => {
    for (const projectile of world.projectiles) drawProjectile(q5, projectile);
  },
};

const stateOverlayPass: RenderPass = {
  name: 'state-overlay',
  render: ({ q5, world, demo, nowMillis }) => {
    if (demo) return;
    if (world.gameOver) {
      drawGameOverShade(q5);
      return;
    }
    drawCooldownRing(
      q5,
      world.player,
      nowMillis,
      world.lastFiredTime,
      world.cooldownDuration,
      world.cooldownRadiusMax
    );
  },
};

export function createRenderPasses(): RenderPass[] {
  return [
    backgroundPass,
    playerPass,
    shapePass,
    particlePass,
    projectilePass,
    stateOverlayPass,
  ];
}

export function renderGameFrame(passes: RenderPass[], context: RenderContext) {
  for (const pass of passes) pass.render(context);
}
