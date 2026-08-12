export function clearFrame(q5: any) {
  q5.background(32);
}

export function drawGameOverShade(q5: any) {
  q5.background(28, 180);
}

export function drawCooldownRing(
  q5: any,
  player: { x: number; y: number },
  now: number,
  lastFiredTime: number,
  cooldownDuration: number,
  maximumRadius: number
) {
  const elapsed = now - lastFiredTime;
  if (elapsed >= cooldownDuration) return;

  const progress = 1 - elapsed / cooldownDuration;
  const radius = progress * maximumRadius;
  q5.noStroke();
  q5.fill(200, 150, 255, 100);
  q5.ellipse(player.x, player.y, radius * 2, radius * 2);
}
