# 开发日志（Development Log）

> 记录每一次功能新增/改动/修复的摘要，便于回溯。

## 2026-08-26

### 方案 B：V2D 内核化 pixi（渲染内核唯一化）

背景：battle-games 实际预览发现三大问题（内容视口错位 / 地图卡住 / 地形马赛克），
根因是“V2D 相机数学 + 自研 CanvasRenderer”两套视口并存。经决策采用**方案 B**：
V2D 作为视口外壳（core 纯函数），pixi.js 作为唯一渲染内核。

代码：

1. 新增 `src/pixi/PixiViewport.ts`：
  - 管理 `PIXI.Application` + world 容器，统一应用相机矩阵（`world.scale.set(scale)` + `world.position.set(pan)`）。
  - 复用 core 纯函数：`fitCameraToViewBox` / `panBy` / `zoomAtScreenPoint` / `screenToWorld`。
  - 交互：pointer 拖拽平移（增量）、wheel 锚点缩放、ResizeObserver 自适应（挂载后读真实尺寸 + rAF 兜底）。
  - `destroy()` 完整释放（事件/RO/应用）。
2. 新增 `src/pixi/PixiViewportCanvas.ts`（Vue 组件）：
  - `@ready` 事件暴露 `PixiViewport`；`@camera-change` 同步相机；expose `getViewport/getWorld/getCamera/fitToBounds/screenToWorld`。
3. 新增 `src/pixi/index.ts`，`package.json` exports 增加 `./pixi`；tsup entry + external（pixi.js）；tsconfig include。
4. pixi.js 为 peerDependencies（^8.0.0）+ devDependencies（8.20.0），业务侧自行安装。

调试验证：

1. `pnpm typecheck` 通过。
2. `pnpm build` 通过（dist/pixi 产物生成）。
3. battle-games 集成后浏览器实测：平移（100 CSS px 拖拽 → 200 device px @dpr2，精确）、缩放（面积 203%）、地形平滑（中心行 150 色/695 采样点）、无控制台错误。
4. 修复初始化尺寸 bug：`init()` 读容器尺寸需在 `appendChild(canvas)` 之后（空 div 在 flex 下高度塌陷为 1px）。


## 2026-03-11

### 第二轮补全：mode-lite 迁移能力增强 + 调试验证通过

本轮围绕“兼容映射表”和“弃用批次计划”补齐剩余关键能力。

代码补全：

1. `ViewportLite` 新增：
  - `overlay`（支持固定屏幕层）
  - `controllerRef`（便于复用旧工具栏控制逻辑）
  - `paddingPx`、`autoFitOnViewBoxChange`
2. `createLiteModeController` 新增：
  - `animateToCamera` 动画控制
3. `ViewportModeHost` 新增：
  - `liteProps` 可选
  - `fallback` 兜底渲染
4. 新增模式化示例：
  - `docs/examples/lite-basic-example.tsx`
  - `docs/examples/mode-host-example.tsx`

调试验证：

1. `pnpm typecheck` 通过。
2. `pnpm build` 通过。
3. `dist` 产物已生成模式化入口与类型声明。

### 阶段进展：2D 视口引擎切换（第一轮）

本次改造对齐 `.github/docs/design/design-2d-viewport-engine-strategy-20260311-001.md` 与 `.github/docs/plan/plan-2d-viewport-engine-switch-20260311-001.md`。

已完成：

1. 新增模式化目录与协议：
  - `src/modes/contracts.ts`
  - `src/modes/engineSelector.ts`
  - `src/modes/ViewportModeHost.tsx`
2. 新增 `mode-lite` 适配层（`react-infinite-viewer`）：
  - `src/modes/modeLite/*`
  - `src/mode-lite.ts`
3. 新增 `mode-game` / `mode-map` 元信息入口（`pixi-viewport`）：
  - `src/modes/modeGame/index.ts`
  - `src/modes/modeMap/index.ts`
  - `src/mode-game.ts`
  - `src/mode-map.ts`
4. 更新导出与构建：
  - `package.json` 新增 `./modes`、`./mode-lite`、`./mode-game`、`./mode-map`
  - `tsup.config.ts` 新增模式入口构建
5. 兼容层策略落地：
  - `src/index.ts` 将 `Viewport2D` 标注为兼容导出并补充模式化导出

验证情况：

1. `pnpm install` 已通过。
2. `pnpm typecheck` 可执行，无阻塞性 TypeScript 编译错误。
3. `get_errors` 仍有示例/组件内联样式规范告警，不影响当前功能链路。

计划完成度（按实施方案阶段）：

1. 阶段 0：已完成（基线冻结和方向落地）。
2. 阶段 1：已完成（模式协议与适配接口已落地代码）。
3. 阶段 2：进行中（`mode-lite` 主体完成，仍需补示例与回归测试）。
4. 阶段 3：进行中（`game/map` 元信息已完成，Pixi 接入规范与回归待补）。
5. 阶段 4：未开始（业务迁移清单、弃用批次计划待执行）。

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
- 核心入口不绑定 Radix，使用者按需安装并从 `viewport-2d-kit/ui` 引入。

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
