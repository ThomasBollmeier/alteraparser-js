# Bundling Guide for AlteraParser

This library is configured with **Rollup** and **Terser** to produce multiple output formats and minified versions for different use cases.

## Output Formats

Each format is available in two versions: development (with full code) and minified (for production).

### ESM (ECMAScript Modules)
- **Development**: `dist/alteraparser.esm.js` (26 KB)
- **Minified**: `dist/alteraparser.esm.min.js` (12 KB, 56% reduction)
- **Use case**: Modern JavaScript applications, ES6 imports, tree-shakeable
- **Import**: `import { Parser, Grammar } from 'alteraparser'`
- **Direct import**: `import { Parser, Grammar } from 'alteraparser/esm'`

### CommonJS
- **Development**: `dist/alteraparser.cjs` (26 KB)
- **Minified**: `dist/alteraparser.cjs.min.js` (12 KB, 57% reduction)
- **Use case**: Node.js with CommonJS, maximum compatibility
- **Require**: `const { Parser, Grammar } = require('alteraparser')`
- **Direct require**: `const { Parser, Grammar } = require('alteraparser/cjs')`

### UMD (Universal Module Definition)
- **Development**: `dist/alteraparser.umd.js` (29 KB)
- **Minified**: `dist/alteraparser.umd.min.js` (12 KB, 60% reduction)
- **Use case**: Browser globals, legacy environments, direct script loading
- **Browser usage**: `<script src="dist/alteraparser.umd.min.js"></script>`
- **Browser global**: `window.alteraparser`

## Building

### Development Build (with source maps)
```bash
npm run build
```
Generates all six bundle formats (3 formats × 2 versions: dev + minified) with source maps for debugging.

### Watch Mode
```bash
npm run build:watch
```
Automatically rebuild when source files change. Useful during development.

## Distribution Build
The default build output includes both development and minified versions. Minified versions are recommended for production use.

## Bundle Sizes

| Format | Development | Minified | Reduction |
|--------|-------------|----------|-----------|
| ESM    | 26 KB       | 12 KB    | 56.4%     |
| CJS    | 26 KB       | 12 KB    | 57.0%     |
| UMD    | 29 KB       | 12 KB    | 60.4%     |

All versions include source maps (54 KB each) for debugging in production.

## Using in Browser

### Modern Approach (ES6 modules, minified)
```html
<script type="module">
  import { Parser, Grammar, tok, seq } from './dist/alteraparser.esm.min.js';
  // Use the library
</script>
```

### Legacy Approach (UMD global, minified)
```html
<script src="dist/alteraparser.umd.min.js"></script>
<script>
  const { Parser, Grammar, tok, seq } = window.alteraparser;
  // Use the library
</script>
```

## Using in Node.js

### With NPM Package
```bash
npm install alteraparser
```

### ESM (Node.js 12+, minified)
```javascript
import { Parser, Grammar } from 'alteraparser';
// or explicitly from minified build
import { Parser, Grammar } from 'alteraparser/esm';
```

### CommonJS (Node.js 12+, minified)
```javascript
const { Parser, Grammar } = require('alteraparser');
// or explicitly from minified build
const { Parser, Grammar } = require('alteraparser/cjs');
```

## Entry Point Resolution

The package.json configures conditional exports for automatic format selection:

```json
"exports": {
  ".": {
    "import": "./dist/alteraparser.esm.js",  // ESM import
    "require": "./dist/alteraparser.cjs",    // CJS require
    "default": "./dist/alteraparser.esm.js"  // Fallback
  }
}
```

This means:
- `import` statements automatically use the ESM bundle (development version)
- `require()` statements automatically use the CJS bundle (development version)
- Tools that don't support conditional exports fall back to ESM

Note: In production, you can explicitly import minified versions:
- `import { Parser } from 'alteraparser/esm'` → uses esm.min.js
- `require('alteraparser/cjs')` → uses cjs.min.js

## Configuration

The Rollup configuration is in `rollup.config.js`. Key settings:
- **Input**: `src/index.js` (the main entry point)
- **Outputs**: Six formats (3 formats × 2 versions)
- **Minification**: Terser plugin for minified versions
- **Source maps**: Enabled for all formats
- **Exports**: Named exports on CJS and UMD
- **External dependencies**: None (zero dependencies!)

## Minification Details

The minified versions use **Terser** for JavaScript minification:
- Variable name shortening
- Dead code elimination
- Function inlining
- Comment removal
- Whitespace optimization

Minified versions still include source maps for debugging. Use the `.map` files to get original source locations in browser DevTools.

## Tree Shaking

The ESM bundle supports tree-shaking, meaning unused exports will be eliminated when bundled by downstream consumers using Rollup, Webpack, or similar tools.

## Updating the Build

When modifying source files in `src/`:
1. Make your changes
2. Run `npm run build` to regenerate all bundles (dev + minified)
3. Verify bundles work with appropriate test suite
4. Commit both source changes and updated bundles

## Quality Checks

The bundles are designed to:
- ✅ Have zero external dependencies
- ✅ Support ES6 module syntax (ESM)
- ✅ Support CommonJS (CJS)
- ✅ Support browser globals (UMD)
- ✅ Work in modern Node.js (12+)
- ✅ Work in modern browsers
- ✅ Support older browsers via UMD
- ✅ Include minified versions for production
- ✅ Include inline source maps for debugging
- ✅ Support conditional exports for automatic format selection
- ✅ Reduce bundle size by ~56-60% with minification
