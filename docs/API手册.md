# API手册

## 包入口

- 根入口：`viewport-2d-kit-react`
  - 与 `viewport-2d-kit-react/core` 等价，导出核心能力与模式化入口。
- 核心入口：`viewport-2d-kit-react/core`
  - 包含相机、交互、约束、渲染辅助、模式选择与 React 视口组件，不包含 Radix UI 组件。
- 模式入口：`viewport-2d-kit-react/modes`
  - 导出模式协议、模式宿主组件与引擎选择器。
- 轻量模式入口：`viewport-2d-kit-react/mode-lite`
  - 导出 `react-infinite-viewer` 适配层。
- 游戏模式入口：`viewport-2d-kit-react/mode-game`
  - 导出 `game` 模式元信息（引擎：`pixi-viewport`）。
- 地图模式入口：`viewport-2d-kit-react/mode-map`
  - 导出 `map` 模式元信息（引擎：`pixi-viewport`）。
- UI 入口：`viewport-2d-kit-react/ui`
  - 导出可选的 Radix UI 外围组件，不会自动注入到核心入口。

## 模式化 API（新增）

### 引擎选择

- `resolveViewportEngine(mode)`
  - 输入：`'lite' | 'game' | 'map'`
  - 输出：引擎描述对象（`react-infinite-viewer` 或 `pixi-viewport`）。
- `listViewportEngineDescriptors()`
  - 输出全部模式与引擎映射。

### 模式宿主

- `ViewportModeHost(props)`
  - 根据 `mode` 自动选择渲染。
  - `mode='lite'`：内部渲染 `ViewportLite`。
  - `mode='game' | 'map'`：通过 `renderPixiMode` 注入 Pixi 视图。

字段：
- `mode: 'lite' | 'game' | 'map'`
- `liteProps?: ViewportLiteProps`
- `renderPixiMode?: (mode: 'game' | 'map') => React.ReactNode`
- `fallback?: React.ReactNode`

### 轻量模式（`mode-lite`）

- `ViewportLite(props)`
  - 轻量 2D 视口组件，底层对接 `react-infinite-viewer`。
- `createLiteModeController(args)`
  - 创建轻量模式控制器。

`ViewportLite` 字段：
- `width?: number | string`
- `height?: number | string`
- `background?: string`
- `viewBox: ViewBox`
- `initialCamera?: Camera2D`
- `minScale?: number`
- `maxScale?: number`
- `zoomStep?: number`
- `paddingPx?: number`
- `autoFitOnViewBoxChange?: boolean`
- `style?: CSSProperties`
- `onCamera?: (camera: Camera2D) => void`
- `controllerRef?: RefObject<ViewportLiteController | null>`
- `overlay?: ReactNode | ((args: ViewportLiteRenderArgs) => ReactNode)`
- `children?: ReactNode | ((args: ViewportLiteRenderArgs) => ReactNode)`

`ViewportLiteController` 字段：
- `getCamera: () => Camera2D`
- `setCamera: (camera: Camera2D) => void`
- `fitToCenter: () => void`
- `zoomIn: (factor?: number) => void`
- `zoomOut: (factor?: number) => void`
- `zoomTo: (scale: number, opts?: { anchorScreen?: Vec2 }) => void`
- `animateToCamera: (target: Camera2D, opts?: { durationMs?: number; signal?: AbortSignal }) => Promise<void>`

### 游戏/地图模式（`mode-game` / `mode-map`）

- `MODE_GAME_KIND`、`MODE_GAME_ENGINE`、`MODE_GAME_SUMMARY`
- `MODE_MAP_KIND`、`MODE_MAP_ENGINE`、`MODE_MAP_SUMMARY`

说明：
- `game/map` 模式统一约定引擎为 `pixi-viewport`。
- 具体 Pixi 视图由业务层注入，实现按场景自由组合。

## 核心入口（`viewport-2d-kit-react` / `viewport-2d-kit-react/core`）

### `Viewport2D`

2D 视口 React 组件，支持平移、缩放、适配居中与 overlay。

> 兼容说明：`Viewport2D` 属于历史自研实现，当前作为兼容层保留。新增项目建议优先使用模式化入口（`ViewportLite` 或 `ViewportModeHost`）。

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

## UI 入口（`viewport-2d-kit-react/ui`）

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
