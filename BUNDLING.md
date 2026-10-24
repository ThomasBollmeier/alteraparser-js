# Bundling Guide for AlteraParser

This library is configured with **Rollup** to produce multiple output formats for different use cases.

## Output Formats

### ESM (ECMAScript Modules)
- **File**: `dist/alteraparser.esm.js`
- **Use case**: Modern JavaScript applications, ES6 imports, tree-shakeable
- **Import**: `import { Parser, Grammar } from 'alteraparser'`
- **Direct import**: `import { Parser, Grammar } from 'alteraparser/esm'`

### CommonJS
- **File**: `dist/alteraparser.cjs`
- **Use case**: Node.js with CommonJS, maximum compatibility
- **Require**: `const { Parser, Grammar } = require('alteraparser')`
- **Direct require**: `const { Parser, Grammar } = require('alteraparser/cjs')`

### UMD (Universal Module Definition)
- **File**: `dist/alteraparser.umd.js`
- **Use case**: Browser globals, legacy environments, direct script loading
- **Browser usage**: `<script src="dist/alteraparser.umd.js"></script>`
- **Direct import**: Import from `alteraparser/umd`
- **Browser global**: `window.alteraparser`

## Building

### Development Build (with source maps)
```bash
npm run build
```
Generates all three bundle formats (ESM, CJS, UMD) with source maps for debugging.

### Watch Mode
```bash
npm run build:watch
```
Automatically rebuild when source files change. Useful during development.

## Distribution Build
The default build output is optimized and includes source maps. For production, the bundles are ready to use as-is.

## Bundle Sizes

Current approximate sizes (before gzip):
- ESM: ~26 KB
- CJS: ~27 KB
- UMD: ~29 KB

## Using in Browser

### Modern Approach (ES6 modules)
```html
<script type="module">
  import { Parser, Grammar, tok, seq } from './dist/alteraparser.esm.js';
  // Use the library
</script>
```

### Legacy Approach (UMD global)
```html
<script src="dist/alteraparser.umd.js"></script>
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

### ESM (Node.js 12+)
```javascript
import { Parser, Grammar } from 'alteraparser';
// or explicitly from ESM build
import { Parser, Grammar } from 'alteraparser/esm';
```

### CommonJS (Node.js 12+)
```javascript
const { Parser, Grammar } = require('alteraparser');
// or explicitly from CJS build
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
- `import` statements automatically use the ESM bundle
- `require()` statements automatically use the CJS bundle
- Tools that don't support conditional exports fall back to ESM

## Configuration

The Rollup configuration is in `rollup.config.js`. Key settings:
- **Input**: `src/index.js` (the main entry point)
- **Outputs**: Three formats (ESM, CJS, UMD)
- **Source maps**: Enabled for all formats
- **Exports**: Named exports on CJS and UMD
- **External dependencies**: None (zero dependencies!)

## Tree Shaking

The ESM bundle supports tree-shaking, meaning unused exports will be eliminated when bundled by downstream consumers using Rollup, Webpack, or similar tools.

## Updating the Build

When modifying source files in `src/`:
1. Make your changes
2. Run `npm run build` to regenerate all bundles
3. Test with appropriate test suite (ESM, CJS, or browser)
4. Commit both source changes and updated bundles

## Updating the Build

When modifying source files in `src/`:
1. Make your changes
2. Run `npm run build` to regenerate all bundles
3. Verify bundles work with existing tests
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
- ✅ Include inline source maps for debugging
- ✅ Support conditional exports for automatic format selection

