# @chess-games/viewport-kit

Reusable 2D viewport (pan + zoom) for React.

This package is extracted from the `chess-games-react` project and is kept private (no git repo on purpose).

## Development

- Build once: `pnpm -C viewport-kit-react build`
- Watch: `pnpm -C viewport-kit-react dev`

## Usage (inside workspace)

```ts
import { Viewport2D, installPreventPageZoom } from '@chess-games/viewport-kit';
```
