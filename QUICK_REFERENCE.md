# AlteraParser Quick Reference

## Core Classes

| Class | Purpose |
|-------|---------|
| `Token` | Represents a lexical token |
| `TokenStream` | Abstract token source |
| `Lexer` | Tokenizes input text |
| `LexerGrammar` | Defines tokenization rules |
| `Grammar` | Defines parsing rules |
| `Parser` | Parses tokens to AST |
| `TextParser` | Lexes and parses text in one step |
| `Ast` | AST node |
| `AstWalker` | Tree traversal visitor |
| `AstTransformer` | Tree node transformation |
| `AstStrWriter` | Convert AST to string |

## Grammar DSL Functions

| Function | Behavior |
|----------|----------|
| `tok(type, id)` | Match a single token type |
| `seq(...elements)` | Match elements in sequence |
| `choice(...branches)` | Match one of several alternatives |
| `opt(element)` | Optional element (0 or 1) |
| `many(element)` | Repeat 0 or more times |
| `oneOrMore(element)` | Repeat 1 or more times |
| `connect(elem1, elem2)` | Connect grammar elements |

## Lexer Grammar API

```javascript
var lg = new LexerGrammar();
lg.addRule(tokenType, pattern, [ignore], [caseInsensitive]);
lg.getRules();
```

## Grammar API

```javascript
var g = new Grammar();
g.addRule(name, expanderFn, [isStartRule]);
g.setStartRule(name);
g.getRule(name);
g.getAstTransformer(ruleName);
g.get(name);  // dictionary-style access
g[name];      // attribute-style access
```

## Parser API

```javascript
var parser = new Parser(grammar);
parser.parse(tokenStream, [ruleName]);

var textParser = new TextParser(grammar, lexerGrammar);
textParser.parseText(text, [ruleName]);
```

## AST API

```javascript
var ast = new Ast(name, [value], [id]);

// Navigation
ast.getChildren();
ast.getNthChild(n);
ast.getChildrenByName(name);
ast.getChildById(id, [clearId]);
ast.getChildrenById(id, [clearId]);

// Modification
ast.addChild(child);
ast.setAttr(name, [value]);
ast.getAttr(name);
ast.hasAttr(name);
ast.clone([deep]);
```

## Common Patterns

### Minimal Parser
```javascript
var lexerGrammar = new LexerGrammar();
lexerGrammar.addRule('X', 'pattern');
lexerGrammar.addRule('WS', '\\s+', true);

var grammar = new Grammar();
grammar.addRule('root', g => seq(tok('X')), true);

var parser = new TextParser(grammar, lexerGrammar);
var ast = parser.parseText('x');
```

### With Multiple Rules
```javascript
grammar.addRule('expr', g => seq(
  g.getRule('term'),
  many(seq(tok('PLUS'), g.getRule('term')))
), true);

grammar.addRule('term', g => choice(
  tok('NUMBER'),
  seq(tok('LPAREN'), g.getRule('expr'), tok('RPAREN'))
));
```

### Tree Processing
```javascript
var walker = new AstWalker();
walker.onEnter = function(ast) { /* ... */ };
walker.onExit = function(ast) { /* ... */ };
walk(ast, walker);

var transformer = new AstTransformer();
transformer.registerTransformer('ruleName', ast => {
  // transform and return ast
});
var result = transformer.transform(ast);
```

## Error Handling

All parsing errors throw JavaScript Error objects:
- `SyntaxError` from lexer when token not recognized
- `Error` from parser when grammar not matched
- Message format: `"Unexpected token @(line, col): 'value'"`

## Regex Pattern Tips

| Pattern | Matches |
|---------|---------|
| `[0-9]+` | One or more digits |
| `[a-zA-Z_][a-zA-Z0-9_]*` | Identifier |
| `\\+` | Plus sign (escaped) |
| `\\s+` | Whitespace |
| `[+\\-*/]` | Operators |
| `"[^"]*"` | Quoted string |
| `//.*$` | Comment (needs multiline) |

**Note**: JavaScript requires double-backslash for escape sequences in strings

## Performance Tips

1. Put longer token patterns first in lexer
2. Avoid deeply nested choice() operations
3. Use many() for repetition, not recursive rules
4. Grammar rules are lazy-loaded (efficient)
5. Parser keeps all paths (can be slow for ambiguous grammars)

## Browser Support

- Modern browsers: Full support
- Node.js: 0.10+
- IE 9+

## File Structure

```
alteraparser/
├── src/
│   ├── token.js
│   ├── lexer_grammar.js
│   ├── lexer.js
│   ├── ast.js
│   ├── grammar.js
│   ├── parser.js
│   └── index.js
├── test.js
├── example_arithmetic.js
├── example_browser.html
└── README.md
```

## Getting Started

1. **Read**: QUICKSTART.md for 5-minute intro
2. **Run**: `node test.js` to verify installation
3. **Try**: `node example_arithmetic.js` for working example
4. **Browse**: `example_browser.html` in browser for interactive demo
5. **Study**: README.md for comprehensive documentation

## Version

Current: 2.5.3
License: Apache-2.0
