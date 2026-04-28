import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/core/index.ts',
    'src/vue/index.ts',
    'src/react/index.ts',
    'src/react/ui/index.ts',
    'src/react/modes/index.ts',
    'src/react/mode-lite.ts',
    'src/react/mode-game.ts',
    'src/react/mode-map.ts',
  ],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: [
    'vue',
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
