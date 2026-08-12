export type Q5Constructor = new (
  sketch: (instance: any) => void,
  parent?: HTMLElement
) => any;

export async function loadQ5Constructor(): Promise<Q5Constructor> {
  const q5Module = await import('q5');
  return ((q5Module as any).default ?? q5Module) as Q5Constructor;
}

export function createQ5Instance(
  Q5: Q5Constructor,
  sketch: (instance: any) => void,
  host: HTMLElement
) {
  host.replaceChildren();
  return new Q5(sketch, host);
}

export function destroyQ5Instance(instance: any, host: HTMLElement) {
  if (typeof instance?._pointerCleanup === 'function') {
    try { instance._pointerCleanup(); } catch {}
  }

  try { instance?.remove?.(); } catch {}
  host.replaceChildren();
}
