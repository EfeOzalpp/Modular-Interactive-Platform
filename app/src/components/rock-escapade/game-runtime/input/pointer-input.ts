import type { GameRuntimeBindings } from '../runtime-contract';
import { tryFire } from '../systems/weapons';
import type { GameWorld } from '../world';

type TapInfo = { x0: number; y0: number; x: number; y: number; t0: number };

export function installPointerInput(
  q5: any,
  canvas: HTMLCanvasElement,
  world: GameWorld,
  bindings: GameRuntimeBindings
) {
  let dragPointerId: number | null = null;
  let lastTouch: { x: number; y: number } | null = null;
  let primaryCandidateId: number | null = null;
  let primaryTapInfo: TapInfo | null = null;
  const tapCandidates = new Map<number, TapInfo>();
  const scratchCoordinates = { x: 0, y: 0 };

  const tapDuration = 180;
  const tapMovement = 12;
  const dragPromotionDistance = tapMovement;
  const baseImpulse = bindings.isRealMobile ? 0.5 : 0.35;

  const inputBlocked = () => bindings.isDemoMode() || bindings.isOverlayActive();

  const getCanvasCoordinates = (event: PointerEvent) => {
    const bounds = canvas.getBoundingClientRect();
    scratchCoordinates.x = (event.clientX - bounds.left) * (q5.width / bounds.width);
    scratchCoordinates.y = (event.clientY - bounds.top) * (q5.height / bounds.height);
    return scratchCoordinates;
  };

  const promoteToDrag = (pointerId: number, x: number, y: number) => {
    dragPointerId = pointerId;
    lastTouch = { x, y };
    try { canvas.setPointerCapture(pointerId); } catch {}
  };

  const onPointerDown = (event: PointerEvent) => {
    if (inputBlocked()) return;
    const { x, y } = getCanvasCoordinates(event);

    if (dragPointerId === null && primaryCandidateId === null) {
      primaryCandidateId = event.pointerId;
      primaryTapInfo = { x0: x, y0: y, x, y, t0: q5.millis() };
    } else {
      tapCandidates.set(event.pointerId, { x0: x, y0: y, x, y, t0: q5.millis() });
    }
    event.preventDefault();
  };

  const onPointerMove = (event: PointerEvent) => {
    if (inputBlocked()) return;
    const { x, y } = getCanvasCoordinates(event);

    if (primaryCandidateId === event.pointerId && dragPointerId === null) {
      if (primaryTapInfo) {
        primaryTapInfo.x = x;
        primaryTapInfo.y = y;
      }
      const dx = x - (primaryTapInfo?.x0 ?? x);
      const dy = y - (primaryTapInfo?.y0 ?? y);
      if (Math.hypot(dx, dy) > dragPromotionDistance) {
        promoteToDrag(event.pointerId, x, y);
        primaryCandidateId = null;
        primaryTapInfo = null;
      }
      event.preventDefault();
      return;
    }

    if (event.pointerId === dragPointerId) {
      if (!lastTouch || !world.player) {
        lastTouch = { x, y };
        event.preventDefault();
        return;
      }

      const dx = x - lastTouch.x;
      const dy = y - lastTouch.y;
      const distance = Math.hypot(dx, dy) || 1;
      const force = baseImpulse * Math.log2(distance + 1);
      world.player.vx += dx / distance * force;
      world.player.vy += dy / distance * force;
      lastTouch = { x, y };
      event.preventDefault();
      return;
    }

    const tapInfo = tapCandidates.get(event.pointerId);
    if (tapInfo) {
      tapInfo.x = x;
      tapInfo.y = y;
    }
    event.preventDefault();
  };

  const isTap = (tapInfo: TapInfo) => (
    q5.millis() - tapInfo.t0 <= tapDuration &&
    Math.hypot(tapInfo.x - tapInfo.x0, tapInfo.y - tapInfo.y0) <= tapMovement
  );

  const onPointerUp = (event: PointerEvent) => {
    if (inputBlocked()) return;

    if (event.pointerId === dragPointerId) {
      try { canvas.releasePointerCapture(event.pointerId); } catch {}
      dragPointerId = null;
      lastTouch = null;
      event.preventDefault();
      return;
    }

    if (primaryCandidateId === event.pointerId && dragPointerId === null) {
      const tapInfo = primaryTapInfo;
      primaryCandidateId = null;
      primaryTapInfo = null;
      if (tapInfo && isTap(tapInfo)) tryFire(q5, world);
      event.preventDefault();
      return;
    }

    const tapInfo = tapCandidates.get(event.pointerId);
    if (tapInfo) {
      tapCandidates.delete(event.pointerId);
      if (isTap(tapInfo)) tryFire(q5, world);
      event.preventDefault();
    }
  };

  const onPointerCancel = (event: PointerEvent) => {
    if (event.pointerId === dragPointerId) {
      dragPointerId = null;
      lastTouch = null;
    }
    if (primaryCandidateId === event.pointerId) {
      primaryCandidateId = null;
      primaryTapInfo = null;
    }
    tapCandidates.delete(event.pointerId);
  };

  const onLostPointerCapture = (event: PointerEvent) => {
    if (event.pointerId === dragPointerId) {
      dragPointerId = null;
      lastTouch = null;
    }
  };

  canvas.addEventListener('pointerdown', onPointerDown, { passive: false });
  canvas.addEventListener('pointermove', onPointerMove, { passive: false });
  canvas.addEventListener('pointerup', onPointerUp, { passive: false });
  canvas.addEventListener('pointercancel', onPointerCancel, { passive: false });
  canvas.addEventListener('lostpointercapture', onLostPointerCapture);

  return () => {
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('pointercancel', onPointerCancel);
    canvas.removeEventListener('lostpointercapture', onLostPointerCapture);
  };
}
