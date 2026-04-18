import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/core.ts',
    'src/ui.ts',
    'src/modes/index.ts',
    'src/mode-lite.ts',
    'src/mode-game.ts',
    'src/mode-map.ts',
  ],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: [
    'react',
    'react-infinite-viewer',
    'pixi.js',
    'pixi-viewport',
    '@pixi/react',
    '@radix-ui/react-toolbar',
    '@radix-ui/react-dropdown-menu',
    '@radix-ui/react-context-menu',
  ],
});
