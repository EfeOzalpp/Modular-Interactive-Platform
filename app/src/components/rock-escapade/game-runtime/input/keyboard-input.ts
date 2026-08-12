import type { GameRuntimeBindings } from '../runtime-contract';
import { tryFire } from '../systems/weapons';
import type { GameWorld } from '../world';

export function installKeyboardInput(
  q5: any,
  world: GameWorld,
  bindings: GameRuntimeBindings
) {
  const inputBlocked = () => bindings.isDemoMode() || bindings.isOverlayActive();

  q5.keyPressed = () => {
    if (inputBlocked()) return;
    if (q5.key === ' ' || q5.key === 'Spacebar') tryFire(q5, world);
    if (q5.key === 'w' || q5.keyCode === q5.UP_ARROW) world.movingUp = true;
    if (q5.key === 's' || q5.keyCode === q5.DOWN_ARROW) world.movingDown = true;
    if (q5.key === 'a' || q5.keyCode === q5.LEFT_ARROW) world.movingLeft = true;
    if (q5.key === 'd' || q5.keyCode === q5.RIGHT_ARROW) world.movingRight = true;
  };

  q5.keyReleased = () => {
    if (inputBlocked()) return;
    if (q5.key === 'w' || q5.keyCode === q5.UP_ARROW) world.movingUp = false;
    if (q5.key === 's' || q5.keyCode === q5.DOWN_ARROW) world.movingDown = false;
    if (q5.key === 'a' || q5.keyCode === q5.LEFT_ARROW) world.movingLeft = false;
    if (q5.key === 'd' || q5.keyCode === q5.RIGHT_ARROW) world.movingRight = false;
  };
}
