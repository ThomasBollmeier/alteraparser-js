# AlteraParser - JavaScript Edition

A JavaScript port of the Python AlteraParser library. Build parsers and parse text to Abstract Syntax Trees (AST) using a declarative grammar DSL.

## Features

- **ES6 Compatible**: Works in all browsers and Node.js environments
- **No Dependencies**: Zero external dependencies
- **Grammar DSL**: Express grammars declaratively with an easy-to-use API
- **Tree Walking**: Built-in AST walkers for traversing and transforming parse trees
- **Ambiguity Detection**: Detects and reports ambiguous grammars
- **Flexible**: Support for sequences, choices, optional elements, and repetitions

## Installation

### Browser

```html
<script src="path/to/alteraparser/src/index.js"></script>
```

Then access the library via `window.alteraparser`.

### Node.js

```bash
npm install alteraparser
```

Then:

```javascript
var alteraparser = require('alteraparser');
```

## Quick Start

Here's a simple example that parses basic arithmetic expressions:

```javascript
// Create a grammar
var Grammar = alteraparser.Grammar;
var seq = alteraparser.seq;
var choice = alteraparser.choice;
var tok = alteraparser.tok;
var many = alteraparser.many;
var opt = alteraparser.opt;

var grammar = new Grammar();

// Define rules (simplified)
grammar.addRule('expr', function(g) {
  return seq(
    tok('NUMBER'),
    many(seq(tok('OP'), tok('NUMBER')))
  );
}, true); // true marks this as the start rule

grammar.setStartRule('expr');

// Create a lexer grammar
var LexerGrammar = alteraparser.LexerGrammar;
var lexerGrammar = new LexerGrammar();

lexerGrammar.addRule('NUMBER', '[0-9]+');
lexerGrammar.addRule('OP', '[+\\-*/]');
lexerGrammar.addRule('WS', '\\s+', true); // true means ignore whitespace

// Create a parser and parse text
var TextParser = alteraparser.TextParser;
var parser = new TextParser(grammar, lexerGrammar);

var ast = parser.parseText('1 + 2 * 3');
console.log(ast);
```

## Core Classes

### Token

Represents a lexical token.

```javascript
var Token = alteraparser.Token;
var token = new Token('NUMBER', '42', 1, 0);
```

### TokenStream

Base class for token sources. `TokenStream.advance()` returns the next token.

### LexerGrammar

Defines tokenization rules for the lexer.

```javascript
var lexerGrammar = new alteraparser.LexerGrammar();
lexerGrammar.addRule('ID', '[a-zA-Z_][a-zA-Z0-9_]*');
lexerGrammar.addRule('NUMBER', '[0-9]+');
lexerGrammar.addRule('WS', '\\s+', true); // true = ignore
```

### Lexer

Tokenizes input text according to lexer grammar rules.

```javascript
var lexer = new alteraparser.Lexer(lexerGrammar, 'var x = 42;');
var token = lexer.advance(); // Returns next token
```

### Grammar

The main grammar definition class.

```javascript
var grammar = new alteraparser.Grammar();

// Add rules
grammar.addRule('myRule', function(g) {
  return alteraparser.seq(
    alteraparser.tok('KEYWORD'),
    alteraparser.tok('ID')
  );
}, true); // true = start rule

grammar.setStartRule('myRule');
```

### Grammar Elements

#### `tok(tokenType, [id])`

Matches a specific token type.

```javascript
var nameToken = alteraparser.tok('ID');
```

#### `seq(...elements)`

Matches elements in sequence (all must match in order).

```javascript
var sequence = alteraparser.seq(
  alteraparser.tok('IF'),
  alteraparser.tok('LPAREN'),
  alteraparser.tok('EXPR'),
  alteraparser.tok('RPAREN')
);
```

#### `choice(...branches)`

Matches one of several alternatives.

```javascript
var either = alteraparser.choice(
  alteraparser.tok('NUMBER'),
  alteraparser.tok('ID')
);
```

#### `opt(element)`

Makes an element optional (zero or one match).

```javascript
var optional = alteraparser.opt(alteraparser.tok('SEMICOLON'));
```

#### `many(element)`

Matches zero or more repetitions.

```javascript
var zeroOrMore = alteraparser.many(alteraparser.tok('ITEM'));
```

#### `oneOrMore(element)`

Matches one or more repetitions.

```javascript
var oneOrMore = alteraparser.oneOrMore(alteraparser.tok('DIGIT'));
```

### Ast

Represents nodes in the Abstract Syntax Tree.

```javascript
var ast = new alteraparser.Ast('expression', '1 + 2');
ast.setAttr('type', 'BinaryOp');
ast.getAttr('type'); // 'BinaryOp'
```

**Methods:**
- `addChild(child)` - Add a child node
- `getChildren()` - Get all children
- `getNthChild(n)` - Get the nth child
- `getChildrenByName(name)` - Find children by name
- `getChildById(id, [clearId])` - Find a child by ID
- `clone([deep])` - Clone the node
- `setAttr(name, [value])` - Set an attribute
- `getAttr(name)` - Get an attribute
- `hasAttr(name)` - Check if attribute exists

### AstWalker

Base class for traversing AST trees.

```javascript
var MyWalker = function() {
  alteraparser.AstWalker.call(this);
};
MyWalker.prototype = Object.create(alteraparser.AstWalker.prototype);
MyWalker.prototype.constructor = MyWalker;

MyWalker.prototype.onEnter = function(ast) {
  console.log('Entering: ' + ast.name);
};

MyWalker.prototype.onExit = function(ast) {
  console.log('Exiting: ' + ast.name);
};

alteraparser.walk(ast, new MyWalker());
```

### AstTransformer

Transforms AST nodes based on registered transformers.

```javascript
var transformer = new alteraparser.AstTransformer();

transformer.registerTransformer('binop', function(ast) {
  // Transform binary operation nodes
  return ast;
});

var transformed = transformer.transform(ast);
```

### Parser

Parses a token stream to produce an AST.

```javascript
var parser = new alteraparser.Parser(grammar);
var ast = parser.parse(tokenStream);
```

### TextParser

Combines lexing and parsing in one step.

```javascript
var parser = new alteraparser.TextParser(grammar, lexerGrammar);
var ast = parser.parseText('input text here');
```

## Complete Example

Here's a more complete example parsing simple function definitions:

```javascript
var Grammar = alteraparser.Grammar;
var LexerGrammar = alteraparser.LexerGrammar;
var TextParser = alteraparser.TextParser;
var seq = alteraparser.seq;
var choice = alteraparser.choice;
var tok = alteraparser.tok;
var many = alteraparser.many;
var opt = alteraparser.opt;

// Lexer grammar
var lexerGrammar = new LexerGrammar();
lexerGrammar.addRule('DEF', 'def');
lexerGrammar.addRule('RETURN', 'return');
lexerGrammar.addRule('ID', '[a-zA-Z_][a-zA-Z0-9_]*');
lexerGrammar.addRule('NUMBER', '[0-9]+');
lexerGrammar.addRule('LPAREN', '\\(');
lexerGrammar.addRule('RPAREN', '\\)');
lexerGrammar.addRule('COLON', ':');
lexerGrammar.addRule('COMMA', ',');
lexerGrammar.addRule('WS', '\\s+', true);

// Parser grammar
var grammar = new Grammar();

grammar.addRule('program', function(g) {
  return many(g.getRule('funcDef'));
}, true);

grammar.addRule('funcDef', function(g) {
  return seq(
    tok('DEF'),
    tok('ID'),
    tok('LPAREN'),
    opt(g.getRule('params')),
    tok('RPAREN'),
    tok('COLON'),
    g.getRule('body')
  );
});

grammar.addRule('params', function(g) {
  return seq(
    tok('ID'),
    many(seq(tok('COMMA'), tok('ID')))
  );
});

grammar.addRule('body', function(g) {
  return many(choice(
    seq(tok('RETURN'), tok('ID')),
    tok('ID')
  ));
});

// Create parser and parse
var parser = new TextParser(grammar, lexerGrammar);
var ast = parser.parseText('def add(x, y): return x');
console.log(ast);
```

## Browser Usage

```html
<!DOCTYPE html>
<html>
<head>
  <script src="alteraparser/src/token.js"></script>
  <script src="alteraparser/src/lexer_grammar.js"></script>
  <script src="alteraparser/src/ast.js"></script>
  <script src="alteraparser/src/grammar.js"></script>
  <script src="alteraparser/src/lexer.js"></script>
  <script src="alteraparser/src/parser.js"></script>
</head>
<body>
  <script>
    // Create grammar, lexer grammar, parser, and use it
    var grammar = new alteraparser.Grammar();
    // ... set up grammar ...
    var lexerGrammar = new alteraparser.LexerGrammar();
    // ... set up lexer grammar ...
    var parser = new alteraparser.TextParser(grammar, lexerGrammar);
    var ast = parser.parseText('some input');
  </script>
</body>
</html>
```

Or use the bundled index.js:

```html
<script src="alteraparser/src/index.js"></script>
```

## Error Handling

The parser throws errors for:
- Unexpected tokens during parsing
- Ambiguous grammars (multiple valid parse paths)
- Incomplete parses (cannot reach end state)
- Malformed lexer patterns

```javascript
try {
  var ast = parser.parseText('invalid input');
} catch (e) {
  console.error('Parse error:', e.message);
}
```

## Performance Notes

- The parser uses backtracking and maintains all possible parse paths
- For ambiguous grammars, parsing may be slower as all paths are explored
- The lexer performs efficient single-pass tokenization

## License

Apache-2.0

## Credits

This is a JavaScript port of the Python AlteraParser library by Thomas Bollmeier.
