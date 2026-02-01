# viewport-kit

Reusable 2D viewport (pan + zoom) for React, designed for games, drawing apps, and infinite canvas tools.

This package is private and meant to be used inside this workspace.

## Development

- Build once: `pnpm -C viewport-kit-react build`
- Watch: `pnpm -C viewport-kit-react dev`
- Typecheck: `pnpm -C viewport-kit-react typecheck`

## Usage (inside workspace)

```ts
import {
  Viewport2D,
  createViewportController,
  type ViewportController,
  type ViewportInteractionMode,
  screenToWorld,
  worldToScreen,
  getVisibleWorldBox,
  applyCameraToCanvas2D,
  serializeCamera,
  deserializeCamera,
} from 'viewport-kit';
```

## Core concepts

- **World space**: your content's coordinate system (game map, drawing canvas, board, etc.)
- **Screen space**: pixels inside the viewport container
- Camera model:
  - `screen = pan + world * scale`
  - `pan` is in **screen pixels**
  - `scale` is **world -> screen**

## `Viewport2D` (React component)

`Viewport2D` provides a transformed content layer + pointer/wheel interactions:

- Pan: drag / trackpad wheel
- Zoom: ctrl+wheel / touch pinch
- Reset: `fitToCenter`

### Customize interactions

```ts
const interactions: ViewportInteractionMode = {
  // drawing-app style zoom
  wheelZoomAnchor: 'cursor',
};
```

## Controller (imperative commands + animation)

When you need toolbars / hotkeys / animations:

- `createViewportController({ getCamera, setCamera, fitToCenter, getViewportCenterPx })`
- Built-in commands:
  - `zoomIn()` / `zoomOut()` / `zoomTo(scale)`
  - `animateToCamera(target)`

Tip: you can persist camera state with `serializeCamera()`.

## Constraints

- `constraints.panBounds.worldBounds`: clamp panning to a world rectangle
- `constraints.scale`: absolute min/max scale

## Virtualization / performance

For large scenes, compute visible world bounds and only render what's needed:

- `getVisibleWorldBox(camera, viewportPx)`

## Renderers (multi-backend helpers)

- Canvas2D: `applyCameraToCanvas2D(ctx, camera)`
- SVG: `cameraToSvgMatrix(camera)`
- HiDPI canvas sizing: `getHiDpiCanvasPixelSize(viewportPx, dpr)`

## Persistence

- `serializeCamera(camera)`
- `deserializeCamera(data)`

These are designed to be stable across versions.
