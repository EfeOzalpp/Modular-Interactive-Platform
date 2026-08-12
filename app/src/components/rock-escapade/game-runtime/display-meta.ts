type CanvasMetaOptions = {
  q5: any;
  host: HTMLElement;
  isRealMobile: boolean;
};

export type DisplayMetaSnapshot = {
  width: number;
  height: number;
  verticalMode: boolean;
};

function usesVerticalFlow() {
  return window.innerWidth <= 1024 && window.innerHeight > window.innerWidth;
}

export function initializeCanvasMeta({
  q5,
  host,
  isRealMobile,
}: CanvasMetaOptions) {
  const width = host.offsetWidth;
  const height = host.offsetHeight;

  if (isRealMobile && q5.pixelDensity) q5.pixelDensity(1);
  q5.createCanvas(width, height);

  host.style.touchAction = 'none';
  host.style.overscrollBehavior = 'none';
  host.style.webkitUserSelect = 'none';
  host.style.userSelect = 'none';

  const canvas = q5.canvas as HTMLCanvasElement;
  canvas.style.touchAction = 'none';

  return {
    canvas,
    width,
    height,
    verticalMode: usesVerticalFlow(),
  };
}

type DisplayLifecycleOptions = {
  host: HTMLElement;
  getInstance: () => any;
  shouldPauseWhenHidden: () => boolean;
  setVisible: (visible: boolean) => void;
  onDisplayMetaChange?: (meta: DisplayMetaSnapshot) => void;
};

export function installDisplayMetaLifecycle({
  host,
  getInstance,
  shouldPauseWhenHidden,
  setVisible,
  onDisplayMetaChange,
}: DisplayLifecycleOptions) {
  let intersectionObserver: IntersectionObserver | null = null;
  let resizeObserver: ResizeObserver | null = null;
  let resizeFrameId: number | null = null;
  let lastWidth = 0;
  let lastHeight = 0;
  let lastVerticalMode: boolean | null = null;

  const visualViewport: VisualViewport | undefined = (window as any).visualViewport;

  const resizeToHost = () => {
    const instance = getInstance();
    if (!host.isConnected || !instance?.resizeCanvas) return;

    const width = Math.max(1, Math.round(host.offsetWidth));
    const height = Math.max(1, Math.round(host.offsetHeight));
    const verticalMode = usesVerticalFlow();
    const sizeChanged = width !== lastWidth || height !== lastHeight;
    const flowChanged = verticalMode !== lastVerticalMode;
    if (!sizeChanged && !flowChanged) return;

    lastWidth = width;
    lastHeight = height;
    lastVerticalMode = verticalMode;

    if (sizeChanged) {
      try {
        instance.resizeCanvas(width, height);
      } catch (error) {
        console.warn('[GameCanvas] resize skipped', error);
      }
    }

    onDisplayMetaChange?.({ width, height, verticalMode });
  };

  const scheduleResize = () => {
    if (resizeFrameId != null) cancelAnimationFrame(resizeFrameId);
    resizeFrameId = requestAnimationFrame(() => {
      resizeFrameId = null;
      resizeToHost();
    });
  };

  if (shouldPauseWhenHidden() && 'IntersectionObserver' in window) {
    intersectionObserver = new IntersectionObserver(([entry]) => {
      const visible = entry.isIntersecting;
      setVisible(visible);
      try {
        if (visible) getInstance()?.loop?.();
        else getInstance()?.noLoop?.();
      } catch {}
    }, { threshold: 0.01 });
    intersectionObserver.observe(host);
  }

  window.addEventListener('resize', scheduleResize);
  window.addEventListener('orientationchange', scheduleResize);
  visualViewport?.addEventListener('resize', scheduleResize);
  visualViewport?.addEventListener('scroll', scheduleResize);
  document.addEventListener('fullscreenchange', scheduleResize);

  if ('ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(scheduleResize);
    resizeObserver.observe(host);
  }

  scheduleResize();

  return () => {
    intersectionObserver?.disconnect();
    resizeObserver?.disconnect();
    if (resizeFrameId != null) cancelAnimationFrame(resizeFrameId);
    window.removeEventListener('resize', scheduleResize);
    window.removeEventListener('orientationchange', scheduleResize);
    visualViewport?.removeEventListener('resize', scheduleResize);
    visualViewport?.removeEventListener('scroll', scheduleResize);
    document.removeEventListener('fullscreenchange', scheduleResize);
  };
}
