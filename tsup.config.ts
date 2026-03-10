import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/core.ts', 'src/ui.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: [
    'react',
    '@radix-ui/react-toolbar',
    '@radix-ui/react-dropdown-menu',
    '@radix-ui/react-context-menu',
  ],
});
