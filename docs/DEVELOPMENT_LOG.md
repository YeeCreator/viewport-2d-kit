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

## 2026-03-10

### 阶段完成：core/ui 分层 + Radix 可选 UI 接入

- 新增多入口构建：`src/index.ts`、`src/core.ts`、`src/ui.ts`。
- 新增 `package.json` 子导出：`./core`、`./ui`。
- 新增可选 UI 组件：
  - `src/ui/ViewportToolbar.tsx`
  - `src/ui/ViewportOverlayMenu.tsx`
  - `src/ui/ViewportStatus.tsx`
- 核心保持不变：`Viewport2D`、交互、约束、渲染与坐标适配逻辑不受 UI 依赖影响。

### 依赖与包体策略

- `@radix-ui/react-toolbar`、`@radix-ui/react-dropdown-menu`、`@radix-ui/react-context-menu` 以可选 `peerDependencies` 方式声明。
- 核心入口不绑定 Radix，使用者按需安装并从 `2d-viewport-kit/ui` 引入。

### 文档与示例

- 新增 `docs/API手册.md`，同步 `core/ui` 入口与 UI 组件字段说明。
- 更新 `docs/使用指南.md`、`docs/DEVELOPER_GUIDE.md`、`README.md`。
- 新增示例与索引：
  - `docs/examples/map-editor-example.tsx`
  - `docs/examples/note-canvas-example.tsx`
  - `docs/examples/drawing-tool-example.tsx`
  - `docs/示例集成.md`

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
