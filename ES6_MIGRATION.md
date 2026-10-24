# ES6 Migration Complete

## Summary

The AlteraParser project has been successfully migrated from CommonJS with ES5 constructor functions to modern ES6 modules and classes.

## Changes Made

### 1. Module System
- **Before**: CommonJS (`require`/`module.exports`) with UMD wrapper for browser compatibility
- **After**: ES6 modules (`import`/`export`)
- **Package.json**: Added `"type": "module"` to indicate ESM support

### 2. Constructor Functions → ES6 Classes

All constructor functions have been converted to ES6 class syntax:

#### Token System (`src/token.js`)
- `Token` - Basic token representation
- `TokenStream` - Abstract base class
- `TokenStreamFromList` - Concrete implementation

#### Lexer (`src/lexer.js`)
- `Lexer` - Now extends `TokenStream` using class inheritance

#### Lexer Grammar (`src/lexer_grammar.js`)
- `LexerGrammar` - Tokenization rules manager

#### AST (`src/ast.js`)
- `Ast` - Abstract syntax tree node
- `AstStrWriter` - AST to string converter
- `AstWalker` - Abstract tree traversal base class
- `AstTransformer` - Transformer registry for AST nodes
- Functions: `walk()`, `transformAst()`

#### Grammar (`src/grammar.js`)
- `GrammarNode` - Base syntax graph node
- `RuleStartNode` - Rule start marker (extends `GrammarNode`)
- `RuleEndNode` - Rule end marker (extends `GrammarNode`)
- `GrammarElement` - Abstract base for grammar elements
- `NormalElement` - Normal node wrapper
- `TokenElement` - Terminal token element
- `Sequence` - Series of elements
- `Choice` - Alternative branches
- `Optional` - Optional element
- `Many` - Zero or more repetitions
- `Rule` - Named grammar rule
- `Grammar` - Complete grammar definition
- Functions: `connect()`, `tok()`, `seq()`, `choice()`, `opt()`, `many()`, `oneOrMore()`, `rule()`, `astTransformer()`

#### Parser (`src/parser.js`)
- `Parser` - Base parser class
- `TextParser` - Combines lexing and parsing

### 3. Language Features Modernized

- **`var` → `const`/`let`**: All variable declarations use proper block scoping
- **Template literals**: String concatenation replaced with backtick templates
- **Arrow functions**: Function expressions converted to arrow functions where appropriate
- **Default parameters**: Replaced manual undefined checks with ES6 defaults
- **Class inheritance**: `extends` keyword replaces prototype manipulation
- **Spread operator**: Used in function arguments and array operations
- **Destructuring**: Used for cleaner array/object access

### 4. Files Updated

- `src/token.js` - ✅ Migrated
- `src/lexer_grammar.js` - ✅ Migrated
- `src/lexer.js` - ✅ Migrated
- `src/ast.js` - ✅ Migrated
- `src/grammar.js` - ✅ Migrated
- `src/parser.js` - ✅ Migrated
- `src/index.js` - ✅ Updated to use ES6 exports
- `test.js` - ✅ Updated to use ES6 imports
- `example_arithmetic.js` - ✅ Updated to use ES6 imports
- `package.json` - ✅ Updated with `"type": "module"`

### 5. Version Update

- Previous: `2.5.3`
- Current: `3.0.0` (major version bump for breaking changes)

### 6. Node Version Requirements

- **Before**: `>= 0.10.0`
- **After**: `>= 12.0.0` (ES6 module support in Node.js)

## Testing

✅ All tests pass successfully:
- Token creation and manipulation
- Lexer grammar rules
- Tokenization
- AST operations
- Grammar definitions
- Parsing with simple arithmetic expressions

## Browser Compatibility

The code is still browser-compatible. The ES6 module syntax works in all modern browsers that support `<script type="module">`. For older browser support, use a bundler like webpack, rollup, or esbuild.

## Breaking Changes

This is a major version (v3.0.0) due to:
1. ES6 module system - requires Node.js 12+ or bundler for older environments
2. ES6 class syntax - slightly different inheritance patterns
3. Removed UMD wrapper - browser usage requires bundling

## Migration Guide for Users

### Before (CommonJS)
```javascript
const alteraparser = require('./src/index.js');
const lexer = new alteraparser.Lexer(grammar, text);
```

### After (ES6 Modules)
```javascript
import { Lexer } from './src/index.js';
const lexer = new Lexer(grammar, text);
```

## Future Improvements

- Add TypeScript definitions
- Consider CommonJS compatibility layer via `exports` field in package.json
- Add ESM-native build for browsers
