# viewport-kit-react

可复用的 React 2D 视口组件（平移 + 缩放）。

该包从 `chess-games-react` 项目中抽离，保持私有（不建立独立远程仓库）。

## 开发

- 单次构建：`pnpm -C viewport-kit-react build`
- 监听构建：`pnpm -C viewport-kit-react dev`

## 使用（本地项目）

本地联调用法请参考 [docs/使用指南.md](docs/使用指南.md)。

```ts
import { Viewport2D, installPreventPageZoom } from 'viewport-kit-react';
```
