import type { Camera2D, Vec2 } from '../viewportMath';

/**
 * 视口模式类型。
 */
export type ViewportModeKind = 'lite' | 'game' | 'map';

/**
 * 模式相机模型。
 */
export type ViewportModeCamera = Camera2D;

/**
 * 模式控制器公共协议。
 */
export type ViewportModeController = {
  /** 读取当前相机。 */
  getCamera: () => ViewportModeCamera;
  /** 写入相机。 */
  setCamera: (camera: ViewportModeCamera) => void;
  /** 适配居中。 */
  fitToCenter: () => void;
  /** 放大。 */
  zoomIn: (factor?: number) => void;
  /** 缩小。 */
  zoomOut: (factor?: number) => void;
  /** 按绝对值缩放。 */
  zoomTo: (scale: number, opts?: { anchorScreen?: Vec2 }) => void;
  /** 动画过渡到目标相机。 */
  animateToCamera: (target: Camera2D, opts?: { durationMs?: number; signal?: AbortSignal }) => Promise<void>;
};

/**
 * 视口引擎描述。
 */
export type ViewportEngineDescriptor = {
  /** 模式名。 */
  mode: ViewportModeKind;
  /** 第三方引擎名。 */
  engine: 'react-infinite-viewer' | 'pixi-viewport';
  /** 说明文本。 */
  summary: string;
};
