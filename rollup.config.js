import terser from '@rollup/plugin-terser';

const VERSION = '3.1.0';

const filenamePrefix = `alteraparser-${VERSION}`;

export default [
  // ESM build (development)
  {
    input: 'src/index.js',
    output: {
      file: `dist/${filenamePrefix}.esm.js`,
      format: 'es',
      sourcemap: true,
      banner: `/* AlteraParser v${VERSION} */`
    }
  },
  // ESM build (minified)
  {
    input: 'src/index.js',
    output: {
      file: `dist/${filenamePrefix}.esm.min.js`,
      format: 'es',
      sourcemap: true,
      banner: `/* AlteraParser v${VERSION} */`
    },
    plugins: [terser()]
  },
  // CommonJS build (development)
  {
    input: 'src/index.js',
    output: {
      file: `dist/${filenamePrefix}.cjs`,
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
      banner: `/* AlteraParser v${VERSION} */`
    }
  },
  // CommonJS build (minified)
  {
    input: 'src/index.js',
    output: {
      file: `dist/${filenamePrefix}.cjs.min.js`,
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
      banner: `/* AlteraParser v${VERSION} */`
    },
    plugins: [terser()]
  },
  // UMD build (development)
  {
    input: 'src/index.js',
    output: {
      file: `dist/${filenamePrefix}.umd.js`,
      format: 'umd',
      name: 'alteraparser',
      sourcemap: true,
      exports: 'named',
      banner: `/* AlteraParser v${VERSION} */`
    }
  },
  // UMD build (minified)
  {
    input: 'src/index.js',
    output: {
      file: `dist/${filenamePrefix}.umd.min.js`,
      format: 'umd',
      name: 'alteraparser',
      sourcemap: true,
      exports: 'named',
      banner: `/* AlteraParser v${VERSION} */`
    },
    plugins: [terser()]
  }
];
