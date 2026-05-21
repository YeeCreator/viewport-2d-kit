# 开发者指南（viewport-2d-kit）

> 本文档面向需要维护/扩展 `viewport-2d-kit` 的开发者。

## 1. 目标与定位

`viewport-2d-kit` 当前采用“模式化引擎”路线：

1. `lite` 模式：`react-infinite-viewer`
2. `game/map` 模式：`pixi-viewport`
3. `Viewport2D`：历史自研实现，仅兼容保留

常用于：轻量画布、地图编辑、游戏镜头、无限画布应用。

## 2. 坐标模型

本库统一使用：

- `screenPx = panPx + world * scale`

其中：

- `pan` 的单位是 **屏幕像素**
- `scale` 表示 **world → screen 的缩放倍率**

> 该模型与 DOM transform `translate(px) scale()` 一致。

## 3. 组件与核心模块

1. 兼容层：
	- `src/Viewport2D.tsx`
	- `src/useViewportCamera.ts`
	- `src/interactions.ts`
2. 模式层：
	- `src/modes/contracts.ts`
	- `src/modes/engineSelector.ts`
	- `src/modes/ViewportModeHost.tsx`
3. `mode-lite`：
	- `src/modes/modeLite/ViewportLite.tsx`
	- `src/modes/modeLite/createLiteModeController.ts`
4. `mode-game/map`：
	- `src/modes/modeGame/index.ts`
	- `src/modes/modeMap/index.ts`
5. 工具层：
	- `src/viewportMath.ts`
	- `src/controller.ts`
	- `src/coordinateAdapters.ts`
6. Vue 宿主层：
	- `src/vue/useViewportHostBridge.ts`
	- `src/vue/ViewportBusinessCanvasShell.ts`

## 3.1 入口分层

1. `src/index.ts`：统一入口（兼容导出 + 模式化导出）。
2. `src/core.ts`：核心子入口。
3. `src/modes/index.ts`：模式协议与模式宿主。
4. `src/mode-lite.ts`：lite 子入口。
5. `src/mode-game.ts`：game 子入口。
6. `src/mode-map.ts`：map 子入口。
7. `src/ui.ts`：可选 UI 子入口。

设计约束：
1. 新增能力优先落在模式层，不再扩展 `Viewport2D` 的底层交互能力。
2. `game/map` 不在库内硬编码 Pixi 场景树，由业务通过 `renderPixiMode` 注入。
3. 对外协议保持稳定：`getCamera`、`setCamera`、`fitToCenter`、`zoomTo`。

## 3.2 coordinateAdapters 设计边界

`coordinateAdapters` 用于承载“坐标语义转换”和“旧项目迁移兼容”能力，避免业务仓库重复维护同类工具。

- 包含：
	- `camera2DToLegacy` / `legacyToCamera2D`
	- `clientToLocalCssPoint` / `localCssToWorld` / `worldToLocalCss`
	- `clientToWorldPoint` / `clientEventToWorldPoint`
	- `worldToLocalCssWithScroll`（过渡兼容）
	- `getDprScaleFromCanvas` / `localCssPxToCanvasPx` / `canvasPxToLocalCssPx`
- 不包含：
	- 业务领域对象（cell/edge/formula）
	- 具体应用交互状态机

## 3.3 Vue 宿主壳边界

`ViewportBusinessCanvasShell` 与 `useViewportHostBridge` 用于承载“宿主编辑器样板”，目标是减少业务仓库重复维护以下结构：

1. 左右侧栏 + 中央 stage 的三栏布局。
2. stage toolbar 的 leading / center / trailing 样板。
3. `client -> world`、`screen delta -> world delta`、`viewBox -> SVG/world style` 这类桥接胶水。

它们不负责：

1. 业务节点/边模型。
2. 业务面板字段。
3. 业务命令总线、服务容器、状态仓库。

## 4. 关于 `Viewport2D` 兼容层

1. `Viewport2D` 作为历史实现继续可用，但定位为兼容层。
2. 兼容层允许修复问题，不再承接新特性迭代。
3. 新模块请直接接入 `ViewportLite` 或 `ViewportModeHost`。

## 5. 关于 overlay 是否可交互（非常重要）

`Viewport2D` 的 overlay 在屏幕空间渲染（不随相机变换）。

为了避免 overlay 覆盖底层内容层（canvas/svg）导致点击失效，本库默认让 overlay 容器：

- `pointer-events: none`

如果业务需要“在 overlay 捕获点击”（例如棋类落子：需要依据 camera 把 screen→world 做命中），请在传入的 overlay 节点上显式设置：

- `style={{ pointerEvents: 'auto' }}`

## 6. 本地开发

- `pnpm install`
- `pnpm dev`（tsup --watch）
- `pnpm build`
- `pnpm typecheck`

说明：`viewport-2d-kit` 作为基础工具包，不提供 `dev:deps` / `build:deps`。依赖它的业务项目通过各自的 `dev:deps` 与 `build:deps` 统一调度。

构建产物将包含：

1. `dist/index.*`
2. `dist/core.*`
3. `dist/modes/index.*`
4. `dist/mode-lite.*`
5. `dist/mode-game.*`
6. `dist/mode-map.*`
7. `dist/ui.*`

## 7. 作为 file 依赖被引用时

本包对外只导出 `dist/`。

推荐联调：

1. 在本项目 `pnpm dev` 持续输出 `dist/`
2. 在使用者项目启动 dev server 并刷新
