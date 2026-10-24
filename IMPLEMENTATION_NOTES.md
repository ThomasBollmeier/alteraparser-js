# AlteraParser ES5 JavaScript Port - Implementation Notes

## Overview

This is a complete port of the Python AlteraParser package (v2.5.3) to ES5 JavaScript, designed to be browser-compatible with zero external dependencies.

## Conversion Strategy

### Python to JavaScript Translation

1. **Classes → Constructor Functions with Prototypes**
   - Python class definitions converted to function constructors
   - Methods converted to prototype methods
   - Inheritance handled with Object.create() and .call()

2. **Type Hints → JSDoc Comments**
   - Python type annotations converted to JSDoc @param, @returns
   - Provides documentation without runtime overhead

3. **Collections**
   - Python lists → JavaScript arrays
   - Python dicts → JavaScript objects
   - List comprehensions → Array.prototype methods

4. **Regex Handling**
   - Python's re.compile() → JavaScript RegExp constructor
   - Pattern flags (IGNORECASE) → RegExp flags ('i')
   - re.IGNORECASE → JavaScript 'i' flag

5. **Module System**
   - CommonJS require/module.exports for Node.js
   - UMD wrapper for browser globals
   - Dynamic dependency loading based on environment

## Module Structure

### Core Modules (1,725 lines total)

#### token.js (72 lines)
- Token class: Represents lexical tokens with type, value, line, column
- TokenStream: Abstract base class for token sources
- TokenStreamFromList: Concrete implementation reading from arrays

#### lexer_grammar.js (53 lines)
- LexerGrammar: Defines tokenization rules
- Regex-based pattern matching
- Support for case-insensitive matching and token ignoring

#### lexer.js (119 lines)
- Lexer: Performs lexical analysis on input text
- Tracks line and column position
- Produces Token objects in sequence

#### ast.js (358 lines)
- Ast: Abstract Syntax Tree node representation
- Attributes and child node management
- AstStrWriter: Formats AST as XML-like string
- AstWalker: Base class for tree traversal
- AstTransformer: Applies transformations to AST nodes
- walk(): DFS tree walking function

#### grammar.js (842 lines)
- GrammarNode: Nodes in the parse graph
- GrammarNodeType: Enum for node types
- RuleStartNode/RuleEndNode: Marks rule boundaries
- GrammarElement hierarchy:
  - NormalElement: Wraps basic nodes
  - TokenElement: Terminal symbol
  - Sequence: Sequential matching (all required)
  - Choice: Alternative matching (one required)
  - Optional: Zero or one match
  - Many: Zero or more repetitions
  - Rule: Named rules with lazy expansion
- Helper functions: tok(), seq(), choice(), opt(), many(), oneOrMore()
- Grammar: Complete grammar definition and syntax graph builder

#### parser.js (203 lines)
- Parser: Processes token streams according to grammar
- Implements backtracking for ambiguous grammars
- AST construction from parse paths
- TextParser: Combines lexing and parsing

#### index.js (78 lines)
- UMD wrapper for module distribution
- Exports all public APIs
- Works in browsers and Node.js

## Key Features Preserved

1. **Grammar DSL**: Declarative grammar definition with familiar operators
2. **Lazy Rule Expansion**: Handles recursive and circular rule definitions
3. **Backtracking Parser**: Supports ambiguous grammars with full exploration
4. **AST Generation**: Builds structured syntax trees from parsed text
5. **Tree Manipulation**: Walking, cloning, and transforming AST nodes
6. **Ambiguity Detection**: Reports multiple valid parse paths
7. **Line/Column Tracking**: Precise error reporting with position info

## Browser Compatibility

- **ES5 Compatible**: No arrow functions, classes, let/const, template literals
- **No Dependencies**: Uses only built-in JavaScript features
- **Module Loading**: UMD pattern supports all environments
  - Browser: Global `window.alteraparser`
  - CommonJS: `require('./src/index.js')`
  - AMD: Standard AMD loaders

## Performance Characteristics

- **Lexer**: Single-pass, O(n) tokenization
- **Parser**: Backtracking with memoization of paths
  - Unambiguous grammars: O(n)
  - Ambiguous grammars: O(n²) or worse (explores all paths)
- **Memory**: Maintains all parse paths simultaneously during parsing

## Differences from Python Version

1. **String Methods**: Python's str methods adapted to JavaScript equivalents
2. **Regex Syntax**: Minor differences in escape sequences (JavaScript regex)
3. **Null/None**: JavaScript `null` replaces Python `None`
4. **Iteration**: Array methods (forEach, map) vs Python iteration
5. **Type Checking**: typeof vs Python's type hints (enforced via JSDoc)

## Testing

- **test.js**: Comprehensive test suite (all passing ✓)
  - Token creation and stream handling
  - Lexer grammar and tokenization
  - AST construction and manipulation
  - Grammar definition and syntax graphs
  - Full parsing pipeline
  - TextParser integration

- **example_arithmetic.js**: Real-world example
  - Arithmetic expression parser
  - Demonstrates full grammar DSL usage
  - Shows AST formatting and inspection

## Usage Patterns

### Node.js
```javascript
var alteraparser = require('./src/index.js');
var grammar = new alteraparser.Grammar();
// ... set up grammar ...
```

### Browser (Global)
```html
<script src="src/token.js"></script>
<script src="src/lexer_grammar.js"></script>
<script src="src/ast.js"></script>
<script src="src/grammar.js"></script>
<script src="src/lexer.js"></script>
<script src="src/parser.js"></script>
<script>
  var grammar = new window.alteraparser.Grammar();
</script>
```

### Browser (Bundled)
```html
<script src="src/index.js"></script>
<script>
  var grammar = new window.alteraparser.Grammar();
</script>
```

## Files

- `src/token.js` - Token and TokenStream classes
- `src/lexer_grammar.js` - Lexer grammar definition
- `src/ast.js` - AST node classes and tree utilities
- `src/grammar.js` - Grammar DSL and parser infrastructure
- `src/lexer.js` - Lexical analyzer
- `src/parser.js` - Syntax parser
- `src/index.js` - UMD bundle and main export
- `test.js` - Test suite
- `example_arithmetic.js` - Arithmetic parser example
- `README.md` - User documentation
- `package.json` - NPM package metadata
- `LICENSE` - Apache 2.0 license

## Conclusion

This port maintains full feature parity with the Python version while being optimized for browser use. The ES5 compatibility ensures it works in all JavaScript environments without transpilation or bundling.
