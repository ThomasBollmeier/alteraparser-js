# AlteraParser JS - Quick Start Guide

## Installation

### Browser
```html
<script src="path/to/src/index.js"></script>
```

### Node.js
```bash
npm install alteraparser
# or copy src/ into your project
```

## Basic Example: Simple Parser

```javascript
// Create lexer grammar (defines tokens)
var lexerGrammar = new alteraparser.LexerGrammar();
lexerGrammar.addRule('NUMBER', '[0-9]+');
lexerGrammar.addRule('PLUS', '\\+');
lexerGrammar.addRule('WS', '\\s+', true); // ignore whitespace

// Create parser grammar (defines syntax rules)
var grammar = new alteraparser.Grammar();
grammar.addRule('expr', function(g) {
  return alteraparser.seq(
    alteraparser.tok('NUMBER'),
    alteraparser.many(alteraparser.seq(
      alteraparser.tok('PLUS'),
      alteraparser.tok('NUMBER')
    ))
  );
}, true); // true = start rule

// Create parser and parse
var parser = new alteraparser.TextParser(grammar, lexerGrammar);
var ast = parser.parseText('1 + 2 + 3');

// Display results
var writer = new alteraparser.AstStrWriter();
console.log(writer.writeAstToStr(ast));
```

## Grammar Elements

### tok(type, [id])
Matches a specific token type.
```javascript
alteraparser.tok('NUMBER')
```

### seq(...elements)
Matches elements in sequence (all required).
```javascript
alteraparser.seq(tok('IF'), tok('LPAREN'), tok('EXPR'), tok('RPAREN'))
```

### choice(...branches)
Matches one alternative.
```javascript
alteraparser.choice(tok('NUMBER'), tok('ID'))
```

### opt(element)
Optional (zero or one).
```javascript
alteraparser.opt(tok('SEMICOLON'))
```

### many(element)
Zero or more repetitions.
```javascript
alteraparser.many(tok('ITEM'))
```

### oneOrMore(element)
One or more repetitions.
```javascript
alteraparser.oneOrMore(tok('DIGIT'))
```

## Working with AST

### Access nodes
```javascript
var ast = parser.parseText('input');
console.log(ast.name);           // Rule name
console.log(ast.value);          // Token value
console.log(ast.getChildren());  // Child nodes
```

### Find nodes
```javascript
var children = ast.getChildrenByName('operand');
var firstChild = ast.getNthChild(0);
```

### Attributes
```javascript
ast.setAttr('type', 'BinaryOp');
console.log(ast.getAttr('type'));
```

### Format as string
```javascript
var writer = new alteraparser.AstStrWriter();
var formatted = writer.writeAstToStr(ast);
console.log(formatted);
```

### Walk tree
```javascript
var MyWalker = function() {
  alteraparser.AstWalker.call(this);
};
MyWalker.prototype = Object.create(alteraparser.AstWalker.prototype);

MyWalker.prototype.onEnter = function(ast) {
  console.log('Enter: ' + ast.name);
};

MyWalker.prototype.onExit = function(ast) {
  console.log('Exit: ' + ast.name);
};

alteraparser.walk(ast, new MyWalker());
```

### Transform tree
```javascript
var transformer = new alteraparser.AstTransformer();

transformer.registerTransformer('number', function(ast) {
  ast.setAttr('type', 'numeric');
  return ast;
});

var transformed = transformer.transform(ast);
```

## Error Handling

```javascript
try {
  var ast = parser.parseText('invalid input');
} catch (e) {
  console.error('Parse error: ' + e.message);
  // e.message includes line and column info
}
```

## Real Example: Function Definition Parser

```javascript
var lexerGrammar = new alteraparser.LexerGrammar();
lexerGrammar.addRule('DEF', 'def');
lexerGrammar.addRule('RETURN', 'return');
lexerGrammar.addRule('ID', '[a-zA-Z_][a-zA-Z0-9_]*');
lexerGrammar.addRule('NUMBER', '[0-9]+');
lexerGrammar.addRule('LPAREN', '\\(');
lexerGrammar.addRule('RPAREN', '\\)');
lexerGrammar.addRule('COLON', ':');
lexerGrammar.addRule('WS', '\\s+', true);

var grammar = new alteraparser.Grammar();

grammar.addRule('program', function(g) {
  return alteraparser.many(g.getRule('funcDef'));
}, true);

grammar.addRule('funcDef', function(g) {
  return alteraparser.seq(
    alteraparser.tok('DEF'),
    alteraparser.tok('ID'),
    alteraparser.tok('LPAREN'),
    alteraparser.opt(g.getRule('params')),
    alteraparser.tok('RPAREN'),
    alteraparser.tok('COLON')
  );
});

grammar.addRule('params', function(g) {
  return alteraparser.seq(
    alteraparser.tok('ID'),
    alteraparser.many(alteraparser.seq(
      alteraparser.tok('COMMA'),
      alteraparser.tok('ID')
    ))
  );
});

var parser = new alteraparser.TextParser(grammar, lexerGrammar);
var ast = parser.parseText('def hello(x, y):');
console.log(ast);
```

## Tips

1. **Pattern Escaping**: In JavaScript regex, backslash must be escaped: `\\+` not `\+`
2. **Whitespace**: Usually add a whitespace rule with ignore flag: `lexerGrammar.addRule('WS', '\\s+', true)`
3. **Order Matters**: Lexer rules are checked in order - put longest patterns first
4. **Debugging**: Use `AstStrWriter` to visualize parse results
5. **Recursion**: Grammar rules can reference themselves via `g.getRule('name')`

## See Also

- `README.md` - Full documentation
- `IMPLEMENTATION_NOTES.md` - Technical details
- `DEVELOPMENT.md` - Architecture guide
- `example_arithmetic.js` - Working example
- `example_browser.html` - Interactive browser demo

