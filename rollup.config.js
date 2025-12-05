import terser from '@rollup/plugin-terser'

export default [
  {
    input: 'public/js/client.js',
    output: {
      file: 'public/js/client.min.js',
      format: 'iife', // for browsers
    },
    plugins: [terser()],
  },
  {
    input: 'src/server.mjs',
    output: {
      file: 'dist/main.mjs',
      format: 'esm', // ES modules for Node.js
    },
    plugins: [terser()],
    external: ['fs', 'http', 'path', 'serve-static', 'ejs'],
  },
]
