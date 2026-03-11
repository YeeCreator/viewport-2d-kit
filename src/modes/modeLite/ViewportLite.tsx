import React from 'react';
import InfiniteViewer from 'react-infinite-viewer';
import type { InfiniteViewerRef } from 'react-infinite-viewer';
import type { Camera2D } from '../../viewportMath';
import { clamp } from '../../viewportMath';
import { createLiteModeController } from './createLiteModeController';
import type { ViewportLiteProps } from './types';

/**
 * 轻量视口组件（react-infinite-viewer 适配层）。
 *
 * 说明：
 * - 该组件用于替代自研 2D 视口底层在轻量场景的实现。
 * - 业务可通过 mode 选择器在 lite 与 game/map 之间切换。
 *
 * @param props 组件属性。
 * @returns React 节点。
 */
export function ViewportLite(props: ViewportLiteProps) {
  const {
    width = '100%',
    height = '100%',
    background = '#ffffff',
    viewBox,
    minScale = 0.25,
    maxScale = 8,
    zoomStep = 0.1,
    style,
    onCamera,
    children,
  } = props;

  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const viewerRef = React.useRef<InfiniteViewerRef | null>(null);

  const [camera, setCamera] = React.useState<Camera2D>(() => {
    const initial = props.initialCamera ?? {
      scale: 1,
      pan: { x: 0, y: 0 },
    };
    return {
      ...initial,
      scale: clamp(initial.scale, minScale, maxScale),
    };
  });

  /**
   * 读取当前容器尺寸。
   *
   * @returns 像素尺寸。
   */
  const getViewportSize = React.useCallback(() => {
    const el = containerRef.current;
    if (!el) return null;
    return { width: el.clientWidth, height: el.clientHeight };
  }, []);

  const controller = React.useMemo(
    () =>
      createLiteModeController({
        viewerRef,
        getCamera: () => camera,
        setCamera,
        getViewportSize,
        viewBox,
        minScale,
        maxScale,
      }),
    [camera, getViewportSize, maxScale, minScale, viewBox]
  );

  React.useEffect(() => {
    onCamera?.(camera);
  }, [camera, onCamera]);

  React.useEffect(() => {
    controller.fitToCenter();
    // 仅在 viewBox 改变后重置。
  }, [controller, viewBox.height, viewBox.width, viewBox.x, viewBox.y]);

  /**
   * 处理 scroll 事件，同步 pan。
   *
   * @param event 事件对象。
   */
  const handleScroll = (event: { scrollLeft?: number; scrollTop?: number }) => {
    const next: Camera2D = {
      ...camera,
      pan: {
        x: event.scrollLeft ?? camera.pan.x,
        y: event.scrollTop ?? camera.pan.y,
      },
    };
    setCamera(next);
  };

  /**
   * 处理 pinch 事件，同步 scale。
   *
   * @param event 事件对象。
   */
  const handlePinch = (event: { zoom?: number }) => {
    const nextScale = clamp(event.zoom ?? camera.scale, minScale, maxScale);
    if (nextScale === camera.scale) return;
    setCamera({ ...camera, scale: nextScale });
  };

  const InfiniteViewerAny = InfiniteViewer as any;

  return (
    <div
      ref={containerRef}
      style={{
        width,
        height,
        position: 'relative',
        overflow: 'hidden',
        background,
        ...style,
      }}
    >
      <InfiniteViewerAny
        ref={viewerRef}
        zoom={camera.scale}
        zoomMin={minScale}
        zoomMax={maxScale}
        usePinch={true}
        zoomOffsetX={zoomStep}
        zoomOffsetY={zoomStep}
        onScroll={handleScroll}
        onPinch={handlePinch}
        style={{ width: '100%', height: '100%' }}
      >
        {children}
      </InfiniteViewerAny>
    </div>
  );
}
