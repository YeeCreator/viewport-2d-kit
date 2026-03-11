import type { CSSProperties, ReactNode } from 'react';
import type { Camera2D, Vec2, ViewBox } from '../../viewportMath';

/**
 * 轻量模式组件属性。
 */
export type ViewportLiteProps = {
  /** 固定宽度。 */
  width?: number | string;
  /** 固定高度。 */
  height?: number | string;
  /** 背景色。 */
  background?: string;
  /** 业务世界边界。 */
  viewBox: ViewBox;
  /** 初始相机。 */
  initialCamera?: Camera2D;
  /** 最小缩放。 */
  minScale?: number;
  /** 最大缩放。 */
  maxScale?: number;
  /** 缩放步长。 */
  zoomStep?: number;
  /** 样式。 */
  style?: CSSProperties;
  /** 相机变化回调。 */
  onCamera?: (camera: Camera2D) => void;
  /** 子元素。 */
  children?: ReactNode;
};

/**
 * 轻量模式控制器。
 */
export type ViewportLiteController = {
  /** 读取相机。 */
  getCamera: () => Camera2D;
  /** 写入相机。 */
  setCamera: (camera: Camera2D) => void;
  /** 居中适配。 */
  fitToCenter: () => void;
  /** 放大。 */
  zoomIn: (factor?: number) => void;
  /** 缩小。 */
  zoomOut: (factor?: number) => void;
  /** 绝对缩放。 */
  zoomTo: (scale: number, opts?: { anchorScreen?: Vec2 }) => void;
};
