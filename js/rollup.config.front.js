// import commonjs from 'rollup-plugin-commonjs';
import {
  terser,
} from 'rollup-plugin-terser'

import {
  terserOptions,
} from './rollup.config.js'

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

export default {
  input: 'src/front.js',
  output: {
    file: 'dist/front.js',
    format: 'iife', // immediately-invoked function expression — suitable for <script> tags
    name: 'SetRandomizer',
    // sourcemap: true
  },
  plugins: [
    // resolve(), // tells Rollup how to find date-fns in node_modules
    // commonjs(), // converts date-fns to ES modules
    production && terser(terserOptions),
  ]
};
