import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Camera2D, Vec2, ViewBox } from './viewportMath';
import { clamp, fitCameraToViewBox, panBy, zoomAtScreenPoint } from './viewportMath';

type PointerState = {
  id: number;
  pt: Vec2; // in container-local pixels
};

export type UseViewportCameraOptions = {
  /** DOM element that receives pointer/wheel events and defines screen coords */
  containerRef: React.RefObject<HTMLElement | null>;
  viewBox: ViewBox;
  /** Optional padding (px) when auto-fitting */
  paddingPx?: number;
  /** Zoom clamp relative to fit scale */
  minScaleFactor?: number;
  maxScaleFactor?: number;
  /** Zoom sensitivity for ctrl+wheel pinch (larger = faster). Default 0.004. */
  wheelZoomSpeed?: number;
  /** Pan sensitivity for trackpad two-finger scroll (larger = faster). Default 1.0. */
  wheelPanSpeed?: number;
  /**
   * Latest known cursor position in container-local pixels.
   * Useful on some trackpads where ctrl+wheel events don't carry meaningful clientX/clientY.
   */
  getCursorLocal?: () => Vec2 | null;
};

export function useViewportCamera(opts: UseViewportCameraOptions) {
  const {
    containerRef,
    viewBox,
    paddingPx = 0,
    minScaleFactor = 0.75,
    maxScaleFactor = 6,
    wheelZoomSpeed = 0.004,
    wheelPanSpeed = 1.0,
  } = opts;

  const [camera, setCamera] = useState<Camera2D>(() => ({ scale: 1, pan: { x: 0, y: 0 } }));
  const fitScaleRef = useRef<number>(1);

  const pointersRef = useRef<Map<number, PointerState>>(new Map());
  const lastPinchDistanceRef = useRef<number | null>(null);

  const getContainerRect = useCallback(() => {
    const el = containerRef.current;
    if (!el) return null;
    return el.getBoundingClientRect();
  }, [containerRef]);

  const toLocal = useCallback(
    (clientX: number, clientY: number): Vec2 | null => {
      const rect = getContainerRect();
      if (!rect) return null;
      return { x: clientX - rect.left, y: clientY - rect.top };
    },
    [getContainerRect]
  );

  const fitToCenter = useCallback(() => {
    const rect = getContainerRect();
    if (!rect) return;
    const fit = fitCameraToViewBox({ containerPx: { width: rect.width, height: rect.height }, viewBox, paddingPx });
    fitScaleRef.current = fit.scale;
    setCamera(fit);
  }, [getContainerRect, paddingPx, viewBox]);

  // Fit on mount & when viewBox changes
  useEffect(() => {
    fitToCenter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewBox.x, viewBox.y, viewBox.width, viewBox.height]);

  const clampCamera = useCallback(
    (c: Camera2D): Camera2D => {
      const fitScale = fitScaleRef.current || 1;
      const minScale = fitScale * minScaleFactor;
      const maxScale = fitScale * maxScaleFactor;
      const scale = clamp(c.scale, minScale, maxScale);
      if (scale === c.scale) return c;
      // keep center stable when clamping: just scale change without anchor, acceptable
      return { ...c, scale };
    },
    [minScaleFactor, maxScaleFactor]
  );

  // Prevent Safari/iOS gesture zoom (if any) while interacting with the viewport.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const prevent = (ev: Event) => {
      // Only prevent when the event is targeting our container.
      if (ev.target && el.contains(ev.target as Node)) ev.preventDefault();
    };

    // Some browsers emit gesture events; harmless elsewhere.
    el.addEventListener('gesturestart', prevent, { passive: false } as AddEventListenerOptions);
    el.addEventListener('gesturechange', prevent, { passive: false } as AddEventListenerOptions);
    el.addEventListener('gestureend', prevent, { passive: false } as AddEventListenerOptions);

    return () => {
      el.removeEventListener('gesturestart', prevent as EventListener);
      el.removeEventListener('gesturechange', prevent as EventListener);
      el.removeEventListener('gestureend', prevent as EventListener);
    };
  }, [containerRef]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Prevent default to stop native scrolling/zooming on touch devices.
      e.preventDefault();

      const el = containerRef.current;
      if (!el) return;
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
      const pt = toLocal(e.clientX, e.clientY);
      if (!pt) return;

      pointersRef.current.set(e.pointerId, { id: e.pointerId, pt });

      if (pointersRef.current.size < 2) {
        lastPinchDistanceRef.current = null;
      } else {
        // Initialize pinch distance right away to avoid a "jump".
        const pts = Array.from(pointersRef.current.values()).map((p) => p.pt);
        const a = pts[0];
        const b = pts[1];
        lastPinchDistanceRef.current = Math.hypot(a.x - b.x, a.y - b.y);
      }
    },
    [containerRef, toLocal]
  );

  const endPointer = useCallback((pointerId: number) => {
    pointersRef.current.delete(pointerId);
    if (pointersRef.current.size < 2) lastPinchDistanceRef.current = null;
  }, []);

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      endPointer(e.pointerId);
    },
    [endPointer]
  );

  const onPointerCancel = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      endPointer(e.pointerId);
    },
    [endPointer]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();

      const prev = pointersRef.current.get(e.pointerId);
      if (!prev) return;
      const pt = toLocal(e.clientX, e.clientY);
      if (!pt) return;

      // Update the moved pointer
      pointersRef.current.set(e.pointerId, { id: e.pointerId, pt });

      const all = Array.from(pointersRef.current.values());
      const pts = all.map((p) => p.pt);

      if (pts.length === 1) {
        // Pan
        const dx = pt.x - prev.pt.x;
        const dy = pt.y - prev.pt.y;
        if (dx === 0 && dy === 0) return;
        setCamera((c: Camera2D) => clampCamera(panBy(c, { x: dx, y: dy })));
        return;
      }

      if (pts.length >= 2) {
        // Pinch zoom + two-finger pan (midpoint movement)
        const a = pts[0];
        const b = pts[1];

        // Previous midpoint (use stored prev point for the moved pointer and current for the other)
        const other = all.find((p) => p.id !== e.pointerId);
        const otherPrev = other?.pt ?? b;
        // prev moved point is prev.pt
        const midPrev = { x: (prev.pt.x + otherPrev.x) / 2, y: (prev.pt.y + otherPrev.y) / 2 };
        const midNow = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };

        const dxMid = midNow.x - midPrev.x;
        const dyMid = midNow.y - midPrev.y;

        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        const last = lastPinchDistanceRef.current;
        lastPinchDistanceRef.current = dist;
        if (!last || last <= 0) {
          // First pinch frame: only pan by midpoint delta
          if (dxMid !== 0 || dyMid !== 0) setCamera((c: Camera2D) => clampCamera(panBy(c, { x: dxMid, y: dyMid })));
          return;
        }

        const factor = dist / last;
        if (!Number.isFinite(factor) || factor === 0) {
          if (dxMid !== 0 || dyMid !== 0) setCamera((c: Camera2D) => clampCamera(panBy(c, { x: dxMid, y: dyMid })));
          return;
        }

        setCamera((c: Camera2D) => {
          // Apply pan first (two-finger translate), then zoom at the midpoint
          const panned = dxMid === 0 && dyMid === 0 ? c : panBy(c, { x: dxMid, y: dyMid });
          const zoomed = zoomAtScreenPoint(panned, { factor, anchorScreen: midNow });
          return clampCamera(zoomed);
        });
      }
    },
    [clampCamera, toLocal]
  );

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      const rect = getContainerRect();
      if (!rect) return;

      // Stable zoom anchor: always use viewport center (container-local pixels)
      const anchor: Vec2 = { x: rect.width / 2, y: rect.height / 2 };

      // Trackpad pinch zoom commonly comes as ctrlKey + wheel.
      if (e.ctrlKey) {
        e.preventDefault();

        const delta = -e.deltaY;
        const factor = Math.exp(delta * wheelZoomSpeed);
        if (!Number.isFinite(factor) || factor === 0) return;

        setCamera((c: Camera2D) => clampCamera(zoomAtScreenPoint(c, { factor, anchorScreen: anchor })));
        return;
      }

      // Trackpad two-finger pan commonly comes as wheel deltaX/deltaY.
      // We treat wheel as viewport pan (game-style) and prevent page scroll.
      if (e.deltaX !== 0 || e.deltaY !== 0) {
        e.preventDefault();
        const dx = -e.deltaX * wheelPanSpeed;
        const dy = -e.deltaY * wheelPanSpeed;
        setCamera((c: Camera2D) => clampCamera(panBy(c, { x: dx, y: dy })));
      }
    },
    [clampCamera, getContainerRect, wheelPanSpeed, wheelZoomSpeed]
  );

  const handlers = useMemo(
    () => ({
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onWheel,
    }),
    [onPointerCancel, onPointerDown, onPointerMove, onPointerUp, onWheel]
  );

  return { camera, setCamera, fitToCenter, handlers };
}
