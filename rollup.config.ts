import tsPlugin from '@rollup/plugin-typescript';

import { defineConfig } from 'rollup';

const config = defineConfig({
  input: 'src/index.ts',
  output: [
    {
      file: 'lib/index.mjs',
      format: 'module',
    },
    {
      file: 'lib/index.cjs',
      format: 'cjs',
    },
  ],
  plugins: [
    tsPlugin({
      tsconfig: 'tsconfig.build.json',
    }),
  ],
});

export default config;
