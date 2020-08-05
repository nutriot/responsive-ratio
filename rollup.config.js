import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

const plugins = [
  commonjs(),
  typescript()
];

export default [
  {
    input: 'src/index.ts',
    output: {
      file: './dist/index.cjs',
      format: 'cjs'
    },
    plugins: plugins
  },
  {
    input: 'src/index.ts',
    output: {
      file: './dist/index.js',
      format: 'esm'
    },
    plugins: plugins
  }
];
