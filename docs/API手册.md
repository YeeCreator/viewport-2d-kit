# API手册

## 包入口

- 根入口：`viewport-2d-kit`
  - 聚合导出 `core`、`vue`、`main-ui`。
- 核心入口：`viewport-2d-kit/core`
  - 包含相机、交互、约束、渲染辅助、坐标换算等与框架无关能力。
- Vue 入口：`viewport-2d-kit/vue`
  - 导出 `Viewport2DCanvas` 与 main-ui 编辑器桥接能力。
- main-ui 入口：`viewport-2d-kit/main-ui`
  - 导出 `ViewportMainUiEditor`、descriptor 工厂与 runtime 注册函数。

## 核心入口（`viewport-2d-kit` / `viewport-2d-kit/core`）

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

## Vue 入口（`viewport-2d-kit/vue`）

### `Viewport2DCanvas(props)`

Vue 3 视口组件，支持平移、缩放、适配居中与 overlay。

字段：
- `viewBox: { x: number; y: number; width: number; height: number }`
- `width?: number | string`（默认 `100%`）
- `height?: number | string`（默认 `100%`）
- `background?: string`（默认 `#0f172a`）
- `minScale?: number`（默认 `0.25`）
- `maxScale?: number`（默认 `4`）
- `paddingPx?: number`（默认 `16`）

插槽：
- 默认插槽：`{ width, height, camera, cameraTransform, fitToCenter }`
- `overlay` 插槽：`{ width, height, camera, fitToCenter }`

暴露：
- `fitToCenter(): void`
- `getCamera(): Camera2D`
- `setCamera(next: Camera2D): void`

## main-ui 入口（`viewport-2d-kit/main-ui`）

### 常量

- `VIEWPORT_MAIN_UI_EDITOR_KIND`
- `VIEWPORT_MAIN_UI_RENDERER_KEY`

### `ViewportMainUiEditor`

可直接用于 `runtime.vue.registerEditorRenderer` 的 Vue 编辑器组件。

payload 字段：
- `title?: string`
- `description?: string`
- `viewBox?: { x: number; y: number; width: number; height: number }`
- `minScale?: number`
- `maxScale?: number`
- `paddingPx?: number`
- `nodes?: Array<{ id, label, x, y, width, height, tone? }>`
- `edges?: Array<{ source, target }>`

### `createViewportMainUiEditorDescriptor(options)`

生成与 `main-ui` 兼容的 editor descriptor。

`options` 关键字段：
- `allowedWorkspaceIds: string[]`（必填）
- `kind?: string`
- `title?: string`
- `description?: string`
- `icon?: string`
- `rendererKey?: string`
- `defaultPayload?: ViewportMainUiEditorPayload`

### `registerViewportMainUiEditor(runtime, options)`

一步完成 descriptor 与 renderer 注册。

行为：
- 调用 `runtime.core.registerEditor(descriptor)`
- 调用 `runtime.vue.registerEditorRenderer(descriptor.rendererKey, ViewportMainUiEditor)`

## 迁移说明

本版本已将公开契约收敛为 `core`、`vue`、`main-ui` 三个入口。

以下旧入口不再作为公开 API：
- `viewport-2d-kit/react`
- `viewport-2d-kit/modes`
- `viewport-2d-kit/mode-lite`
- `viewport-2d-kit/mode-game`
- `viewport-2d-kit/mode-map`
- `viewport-2d-kit/ui`
