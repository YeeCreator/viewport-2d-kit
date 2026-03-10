# 开发者指南（viewport-kit）

> 本文档面向需要维护/扩展 `viewport-kit` 的开发者。

## 1. 目标与定位

`viewport-kit` 提供一个通用的 2D 视口（Viewport）能力：

- 平移（pan）
- 缩放（zoom）
- fit/center 复位
- 将“世界坐标（world）”通过相机变换映射到“屏幕像素（screen）”

常用于：棋盘/地图、绘图画布、RPG 地图编辑器、无限画布应用等。

## 2. 坐标模型

本库统一使用：

- `screenPx = panPx + world * scale`

其中：

- `pan` 的单位是 **屏幕像素**
- `scale` 表示 **world → screen 的缩放倍率**

> 该模型与 DOM transform `translate(px) scale()` 一致。

## 3. 组件与核心模块

- `src/Viewport2D.tsx`：React 视口容器（内容层 transform + 交互绑定 + overlay）
- `src/useViewportCamera.ts`：指针/滚轮交互与相机状态管理
- `src/viewportMath.ts`：相机数学、transform 工具函数
- `src/interactions.ts`：交互策略（drag-pan, pinch/ctrl+wheel zoom 等）
- `src/controller.ts`：命令式控制器（动画、zoomIn/zoomOut 等）
- `src/preventPageZoom.ts`：可选：防页面缩放（游戏式交互场景）
- `src/coordinateAdapters.ts`：跨项目迁移适配工具（legacy 相机互转、wrap 本地 CSS 坐标换算、canvas DPR 映射）

## 3.2 入口分层（core / ui）

- `src/index.ts`：默认入口，当前与 `core` 保持等价（纯核心能力）。
- `src/core.ts`：核心子入口，对外路径为 `viewport-kit/core`。
- `src/ui.ts`：UI 子入口，对外路径为 `viewport-kit/ui`。
- `src/ui/*`：基于 Radix 的可选外围 UI 组件（工具栏、右键菜单、状态栏）。

设计约束：
- 核心入口不依赖 Radix。
- UI 依赖通过 `peerDependencies` 可选声明，避免污染仅核心使用者的安装与包体。

## 3.1 coordinateAdapters 设计边界

`coordinateAdapters` 用于承载“坐标语义转换”和“旧项目迁移兼容”能力，避免业务仓库重复维护同类工具。

- 包含：
	- `camera2DToLegacy` / `legacyToCamera2D`
	- `clientToLocalCssPoint` / `localCssToWorld` / `worldToLocalCss`
	- `worldToLocalCssWithScroll`（过渡兼容）
	- `getDprScaleFromCanvas` / `localCssPxToCanvasPx` / `canvasPxToLocalCssPx`
- 不包含：
	- 业务领域对象（cell/edge/formula）
	- 具体应用交互状态机

## 4. 关于 overlay 是否可交互（非常重要）

`Viewport2D` 的 overlay 在屏幕空间渲染（不随相机变换）。

为了避免 overlay 覆盖底层内容层（canvas/svg）导致点击失效，本库默认让 overlay 容器：

- `pointer-events: none`

如果业务需要“在 overlay 捕获点击”（例如棋类落子：需要依据 camera 把 screen→world 做命中），请在传入的 overlay 节点上显式设置：

- `style={{ pointerEvents: 'auto' }}`

## 5. 本地开发

- `pnpm install`
- `pnpm dev`（tsup --watch）
- `pnpm build`
- `pnpm typecheck`

构建产物将包含：`dist/index.*`、`dist/core.*`、`dist/ui.*`。

## 6. 作为 file 依赖被引用时

本包对外只导出 `dist/`。

推荐联调：

1. 在本项目 `pnpm dev` 持续输出 `dist/`
2. 在使用者项目启动 dev server 并刷新
