# 开发日志（Development Log）

> 记录每一次功能新增/改动/修复的摘要，便于回溯。

## 2026-03-05

### 新增：coordinateAdapters（承接业务仓库坐标迁移）

- 新增 `src/coordinateAdapters.ts`，统一输出以下能力：
  - legacy 相机互转：`camera2DToLegacy`、`legacyToCamera2D`
  - 容器坐标换算：`clientToLocalCssPoint`、`localCssToWorld`、`worldToLocalCss`、`worldToLocalCssWithScroll`
  - canvas 映射工具：`getDprScaleFromCanvas`、`localCssPxToCanvasPx`、`canvasPxToLocalCssPx`
- 在 `src/index.ts` 对外导出上述类型和函数，供依赖项目直接复用。
- 目标：减少消费者项目重复实现，统一坐标语义与迁移口径。

## 2026-02-02

### Viewport2D：overlay 不拦截交互（避免覆盖棋盘点击）

- 修复：`src/Viewport2D.tsx` 里的 overlay 容器默认设置 `pointer-events: none`。
  - 背景：Viewport2D 的 overlay 是一个 `position:absolute; inset:0` 的全覆盖层；如果它可接收 pointer 事件，会拦截底层世界内容（canvas/svg）的点击，导致“落子/拖拽”等交互失效。
  - 说明：需要交互能力的 overlay（例如游戏自身的 screen→world 命中层）应在 overlay 节点本身显式设置 `pointerEvents: 'auto'`。

### 开发联调：file 依赖 + dist/watch

- 约定：本包对外只导出 `dist/`（见 `main`/`types`/`exports`）。
- 工作流：
  - 推荐：`pnpm dev`（tsup --watch）持续产出 `dist/`，供消费者项目热切换/刷新。
  - 备选：`pnpm build` 后在消费者项目执行一次 `pnpm install` 刷新 file 依赖。
