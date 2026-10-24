export default [
  // ESM build
  {
    input: 'src/index.js',
    output: {
      file: 'dist/alteraparser.esm.js',
      format: 'es',
      sourcemap: true
    }
  },
  // UMD build (browser global + Node.js CommonJS)
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
  // CommonJS build (for Node.js)
  {
    input: 'src/index.js',
    output: {
      file: 'dist/alteraparser.cjs',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    }
  }
];
