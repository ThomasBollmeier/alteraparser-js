# AlteraParser JavaScript - Development Guide

## Overview

This is an ES5 JavaScript port of the Python AlteraParser library. It provides a complete parser generator that can build Abstract Syntax Trees (ASTs) from text input using a declarative grammar DSL.

## Architecture

### Core Components

1. **Token & TokenStream** (`src/token.js`)
   - `Token`: Represents a lexical token with type, value, and position information
   - `TokenStream`: Abstract base class for token sources
   - `TokenStreamFromList`: Concrete implementation that reads from a token array

2. **Lexer Grammar** (`src/lexer_grammar.js`)
   - `LexerGrammar`: Defines tokenization rules using regex patterns
   - Rules can be marked as "ignore" (e.g., for whitespace)
   - Supports case-insensitive matching

3. **Lexer** (`src/lexer.js`)
   - `Lexer`: Performs single-pass tokenization of input text
   - Extends `TokenStream` to provide tokens via `advance()`
   - Tracks line and column numbers for error reporting

4. **AST** (`src/ast.js`)
   - `Ast`: Represents nodes in the Abstract Syntax Tree
   - `AstStrWriter`: Converts AST to readable XML-like string format
   - `AstWalker`: Base class for tree traversal
   - `walk()`: Function to traverse AST with a walker
   - `AstTransformer`: Transforms AST nodes based on registered handlers

5. **Grammar** (`src/grammar.js`)
   - `GrammarNodeType`: Enum for node types (NORMAL, TOKEN, RULE_START, RULE_END)
   - `GrammarNode`: Nodes in the syntax graph
   - `RuleStartNode` / `RuleEndNode`: Mark rule boundaries
   - `GrammarElement`: Abstract base for grammar elements
   - Grammar element types: `TokenElement`, `Sequence`, `Choice`, `Optional`, `Many`, `Rule`
   - Factory functions: `tok()`, `seq()`, `choice()`, `opt()`, `many()`, `oneOrMore()`
   - `Rule`: Represents named grammar rules with lazy expansion
   - `Grammar`: Main class managing the complete grammar definition

6. **Parser** (`src/parser.js`)
   - `Parser`: Parses token streams to AST using backtracking
   - `TextParser`: Combines lexing and parsing in one step
   - Supports ambiguity detection and detailed error reporting

### Key Design Decisions

1. **ES5 Compatibility**
   - No ES6 classes, arrow functions, or destructuring
   - Uses constructor functions with prototype-based inheritance
   - All modern array methods preserved (supported in ES5)

2. **No External Dependencies**
   - Uses only built-in JavaScript features
   - Regular expressions are native to JavaScript

3. **Lazy Rule Expansion**
   - Rules are expanded only when needed (on first access)
   - Allows support for recursive grammar definitions
   - Controlled through `rule.expand()` and `RuleStartNode.getChildren()`

4. **Backtracking Parser**
   - Maintains all possible parse paths during parsing
   - Each token advance filters to only matching paths
   - Detects ambiguity if multiple valid paths remain at end
   - Efficient for most grammars, may be slower for highly ambiguous ones

5. **AST ID System**
   - Grammar elements and AST nodes can have optional IDs
   - IDs are preserved through the parse tree
   - Useful for identifying specific matched elements

## Module Dependencies

```
token.js (no dependencies)
    ↓
lexer_grammar.js (no dependencies)
    ↓
lexer.js (depends on: token.js, lexer_grammar.js)
    ↓
ast.js (no dependencies)
    ↓
grammar.js (depends on: ast.js)
    ↓
parser.js (depends on: token.js, grammar.js, ast.js, lexer.js)
    ↓
index.js (UMD wrapper combining all modules)
```

## Implementation Notes

### Important Implementation Details

1. **getChildren() vs this.children**
   - `RuleStartNode.getChildren()` calls `rule.expand()` first
   - `findFollowTokens()` must use `getChildren()` not direct property access
   - This ensures lazy expansion happens correctly

2. **Path Management in Parsing**
   - Paths accumulate grammar nodes as parsing progresses
   - Used to reconstruct the AST from the parse path
   - Each successful parse ends with a path from start to end node

3. **Epsilon Paths**
   - `findEpsilonPath()` finds paths without consuming tokens
   - Used to determine if grammar can reach end state without more input
   - Prevents infinite loops using a visited set

4. **AST Transformation**
   - Transformers can customize AST based on rule names
   - Applied during AST construction (after rule completion)
   - Preserve node IDs across transformations

## Testing

Run tests with:
```bash
node test.js
```

Tests cover:
- Token creation and stream handling
- Lexer grammar and tokenization
- AST creation and manipulation
- Grammar definition and rule expansion
- Parsing and AST generation
- Text parsing (lexing + parsing combined)

## Examples

### Simple Expression Parser
See `example_arithmetic.js` for a complete arithmetic expression parser supporting:
- Numbers, operators (+, -, *, /)
- Proper precedence (*, / before +, -)
- Parentheses for grouping

### Browser Usage
See `example_browser.html` for an interactive web-based parser demo.

## Performance Considerations

1. **Lexer**: O(n) where n is input length (single pass)
2. **Parser**: Depends on grammar complexity
   - Simple unambiguous grammars: O(n)
   - Highly ambiguous grammars: exponential in worst case
3. **Memory**: Maintains all active parse paths

## Browser Compatibility

- Requires ES5 or later
- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- Also works in Node.js 0.10+
- No polyfills needed

## Future Improvements

Potential enhancements for future versions:
- Memoization for parser optimization
- LALR(1) parser for better performance
- Better error recovery
- Grammar validation and warnings
- PEG (Parsing Expression Grammar) support
- Built-in AST optimization passes
