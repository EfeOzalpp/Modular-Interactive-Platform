export type Q5Frame = {
  delta: number;
  nowMillis: number;
  viewportWidth: number;
  viewportHeight: number;
};

export function initializeRafClock(q5: any, targetFps = 60) {
  q5.frameRate?.(targetFps);
}

export function bindRafFrame(
  q5: any,
  onFrame: (frame: Q5Frame) => void
) {
  q5.draw = () => {
    onFrame({
      delta: q5.deltaTime / 16.67,
      nowMillis: q5.millis(),
      viewportWidth: q5.width,
      viewportHeight: q5.height,
    });
  };
}

export function scheduleOnAnimationFrame(callback: () => void) {
  const frameId = requestAnimationFrame(callback);
  return () => cancelAnimationFrame(frameId);
}
