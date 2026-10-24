import terser from '@rollup/plugin-terser';

export default [
  // ESM build (development)
  {
    input: 'src/index.js',
    output: {
      file: 'dist/alteraparser.esm.js',
      format: 'es',
      sourcemap: true
    }
  },
  // ESM build (minified)
  {
    input: 'src/index.js',
    output: {
      file: 'dist/alteraparser.esm.min.js',
      format: 'es',
      sourcemap: true
    },
    plugins: [terser()]
  },
  // CommonJS build (development)
  {
    input: 'src/index.js',
    output: {
      file: 'dist/alteraparser.cjs',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    }
  },
  // CommonJS build (minified)
  {
    input: 'src/index.js',
    output: {
      file: 'dist/alteraparser.cjs.min.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },
    plugins: [terser()]
  },
  // UMD build (development)
  {
    input: 'src/index.js',
    output: {
      file: 'dist/alteraparser.umd.js',
      format: 'umd',
      name: 'alteraparser',
      sourcemap: true,
      exports: 'named'
    }
  },
  // UMD build (minified)
  {
    input: 'src/index.js',
    output: {
      file: 'dist/alteraparser.umd.min.js',
      format: 'umd',
      name: 'alteraparser',
      sourcemap: true,
      exports: 'named'
    },
    plugins: [terser()]
  }
];
