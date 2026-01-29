import React, { useMemo, useRef } from 'react';
import type { Viewport2DController, Viewport2DCamera } from './types';
import type { ViewBox } from './viewportMath';
import { cameraToCssTransform } from './viewportMath';
import { useViewportCamera } from './useViewportCamera';

export type Viewport2DChildrenArgs = {
  /** Camera state. `pan` is in screen pixels; `scale` is world->screen. */
  camera: Viewport2DCamera;
  /** Reset camera to fit & center. */
  fitToCenter: () => void;
};

export type Viewport2DProps = {
  /** Fixed-size viewport. If omitted, the component will fill parent. */
  width?: number | string;
  height?: number | string;

  /** World bounds (e.g. SVG viewBox) used for fit & center. */
  viewBox: ViewBox;

  /** Optional background color for the viewport area. */
  background?: string;

  /** Auto fit on mount/viewBox change. Default true (handled by hook). */
  paddingPx?: number;

  minScaleFactor?: number;
  maxScaleFactor?: number;

  /** Trackpad pinch zoom speed (ctrl+wheel). */
  wheelZoomSpeed?: number;
  /** Trackpad two-finger pan speed (wheel). */
  wheelPanSpeed?: number;

  /** Extra styles applied to the outer viewport container. */
  style?: React.CSSProperties;

  /**
   * Render function. The returned nodes will be placed inside the transformed content layer.
   *
   * Important: Children should be written in world coordinates (e.g. SVG viewBox coords).
   */
  children: React.ReactNode | ((args: Viewport2DChildrenArgs) => React.ReactNode);

  /**
   * Optional overlay UI fixed to viewport (not transformed).
   *
   * - If you pass a ReactNode, it renders as-is.
   * - If you pass a function, it receives `{ camera, fitToCenter }`.
   */
  overlay?: React.ReactNode | ((args: Viewport2DChildrenArgs) => React.ReactNode);

  /** Optional callback whenever camera changes (useful for external toolbars/status). */
  onCamera?: (camera: Viewport2DChildrenArgs['camera']) => void;

  /** Optional imperative controller for external toolbars. */
  controllerRef?: React.RefObject<Viewport2DController | null>;
};

/**
 * Viewport2D
 *
 * A reusable "infinite canvas" style 2D viewport:
 * - Pan: drag or trackpad two-finger scroll
 * - Zoom: ctrl+wheel (anchored at viewport center) or touch pinch
 * - Fit/reset: via `fitToCenter`
 */
export function Viewport2D(props: Viewport2DProps) {
  const {
    width = '100%',
    height = '100%',
    viewBox,
    background = '#fff',
    paddingPx = 12,
    minScaleFactor = 0.6,
    maxScaleFactor = 10,
    wheelZoomSpeed = 0.006,
    wheelPanSpeed = 1.1,
    style,
    children,
    overlay,
  } = props;

  const viewportRef = useRef<HTMLDivElement | null>(null);

  const { camera, fitToCenter, handlers, setCamera } = useViewportCamera({
    containerRef: viewportRef,
    viewBox,
    paddingPx,
    minScaleFactor,
    maxScaleFactor,
    wheelZoomSpeed,
    wheelPanSpeed,
  });

  // Expose imperative controller.
  React.useEffect(() => {
    const ref = props.controllerRef;
    if (!ref) return;
    ref.current = {
      fitToCenter,
      getCamera: () => camera,
      setCamera: (next) => setCamera(next),
    };
    return () => {
      if (ref.current) ref.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.controllerRef, fitToCenter, setCamera, camera.pan.x, camera.pan.y, camera.scale]);

  // Notify external observers.
  React.useEffect(() => {
    props.onCamera?.(camera);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera.pan.x, camera.pan.y, camera.scale]);

  const content = useMemo(() => {
    if (typeof children === 'function') return children({ camera, fitToCenter });
    return children;
  }, [camera, children, fitToCenter]);

  const overlayNode = useMemo(() => {
    if (!overlay) return null;
    if (typeof overlay === 'function') return overlay({ camera, fitToCenter });
    return overlay;
  }, [camera, fitToCenter, overlay]);

  return (
    <div
      ref={viewportRef}
      style={{
        width,
        height,
        position: 'relative',
        overflow: 'hidden',
        touchAction: 'none',
        background,
        ...style,
      }}
      onPointerDown={handlers.onPointerDown}
      onPointerMove={handlers.onPointerMove}
      onPointerUp={handlers.onPointerUp}
      onPointerCancel={handlers.onPointerCancel}
      onWheelCapture={handlers.onWheel}
    >
      {/* transformed content (world space) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transformOrigin: '0 0',
          transform: cameraToCssTransform(camera),
        }}
      >
        {content}
      </div>

      {/* fixed overlay (screen space) */}
      {overlayNode ? <div style={{ position: 'absolute', inset: 0 }}>{overlayNode}</div> : null}
    </div>
  );
}
