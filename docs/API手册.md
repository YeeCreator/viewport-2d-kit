# API手册

## 包入口

- 根入口：`2d-viewport-kit`
  - 与 `2d-viewport-kit/core` 等价，导出纯 2D 视口核心能力。
- 核心入口：`2d-viewport-kit/core`
  - 仅包含相机、交互、约束、渲染辅助与 React 视口组件，不包含 Radix UI 组件。
- UI 入口：`2d-viewport-kit/ui`
  - 导出可选的 Radix UI 外围组件，不会自动注入到核心入口。

## 核心入口（`2d-viewport-kit` / `2d-viewport-kit/core`）

### `Viewport2D`

2D 视口 React 组件，支持平移、缩放、适配居中与 overlay。

### `useViewportCamera`

相机状态与交互管理 Hook。

### `createViewportController`

创建命令式控制器，可用于工具栏、快捷键和动画。

### 相机与坐标函数

- `cameraToCssTransform`
- `fitCameraToViewBox`
- `panBy`
- `zoomAtScreenPoint`
- `screenToWorld`
- `worldToScreen`
- `clamp`

### 约束与渲染辅助

- `constrainCamera`
- `applyCameraToCanvas2D`
- `cameraToSvgMatrix`
- `getVisibleWorldBox`
- `normalizeViewportPxRect`
- `screenDeltaToWorldDelta`
- `getHiDpiCanvasPixelSize`

### 控制器序列化与动画

- `serializeCamera`
- `deserializeCamera`
- `animateCamera`
- `easeInOutCubic`
- `easeOutCubic`

### 其他工具

- `installPreventPageZoom`
- `camera2DToLegacy`
- `legacyToCamera2D`
- `localCssToWorld`
- `worldToLocalCss`
- `worldToLocalCssWithScroll`
- 其余 `coordinateAdapters` 导出函数

## UI 入口（`2d-viewport-kit/ui`）

> 依赖：`@radix-ui/react-toolbar`、`@radix-ui/react-dropdown-menu`、`@radix-ui/react-context-menu`。

### `ViewportToolbar(props)`

基于 Radix Toolbar + DropdownMenu 的最小工具栏。

字段：
- `zoomText?: string`：缩放显示文本。
- `onZoomOut?: () => void`：缩小回调。
- `onZoomIn?: () => void`：放大回调。
- `onFitToCenter?: () => void`：适配居中回调。
- `onPanLockChange?: (nextLocked: boolean) => void`：平移锁定切换回调。
- `panLocked?: boolean`：是否锁定平移。
- `className?: string`：样式类名。
- `style?: React.CSSProperties`：内联样式。
- `labels?: Partial<ViewportToolbarLabels>`：文案覆盖。

### `ViewportOverlayMenu(props)`

基于 Radix ContextMenu 的右键菜单。

字段：
- `children: React.ReactNode`：菜单触发区域。
- `onZoomIn?: () => void`：放大回调。
- `onZoomOut?: () => void`：缩小回调。
- `onFitToCenter?: () => void`：适配居中回调。
- `labels?: Partial<ViewportOverlayMenuLabels>`：文案覆盖。

### `ViewportStatus(props)`

轻量状态栏，用于显示缩放和平移。

字段：
- `scale: number`：当前缩放。
- `panX: number`：平移 X。
- `panY: number`：平移 Y。
- `className?: string`：样式类名。
- `style?: React.CSSProperties`：内联样式。
