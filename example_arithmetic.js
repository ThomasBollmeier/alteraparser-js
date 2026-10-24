/**
 * Example: Simple arithmetic expression parser
 * This example shows how to create a parser for arithmetic expressions like "1 + 2 * 3"
 */

var alteraparser = require('./src/index.js');

// Create a simple arithmetic expression lexer grammar
var lexerGrammar = new alteraparser.LexerGrammar();
lexerGrammar.addRule('NUMBER', '[0-9]+');
lexerGrammar.addRule('PLUS', '\\+');
lexerGrammar.addRule('MINUS', '-');
lexerGrammar.addRule('MULT', '\\*');
lexerGrammar.addRule('DIV', '/');
lexerGrammar.addRule('LPAREN', '\\(');
lexerGrammar.addRule('RPAREN', '\\)');
lexerGrammar.addRule('WS', '\\s+', true); // ignore whitespace

// Create the grammar for arithmetic expressions
var grammar = new alteraparser.Grammar();

// expression = term (('+' | '-') term)*
grammar.addRule('expression', function(g) {
  return alteraparser.seq(
    g.getRule('term'),
    alteraparser.many(alteraparser.seq(
      alteraparser.choice(
        alteraparser.tok('PLUS'),
        alteraparser.tok('MINUS')
      ),
      g.getRule('term')
    ))
  );
}, true); // true marks this as the start rule

// term = factor (('*' | '/') factor)*
grammar.addRule('term', function(g) {
  return alteraparser.seq(
    g.getRule('factor'),
    alteraparser.many(alteraparser.seq(
      alteraparser.choice(
        alteraparser.tok('MULT'),
        alteraparser.tok('DIV')
      ),
      g.getRule('factor')
    ))
  );
});

// factor = NUMBER | '(' expression ')'
grammar.addRule('factor', function(g) {
  return alteraparser.choice(
    alteraparser.tok('NUMBER'),
    alteraparser.seq(
      alteraparser.tok('LPAREN'),
      g.getRule('expression'),
      alteraparser.tok('RPAREN')
    )
  );
});

// Create parser
var parser = new alteraparser.TextParser(grammar, lexerGrammar);

// Test parsing various expressions
var testCases = [
  '42',
  '1 + 2',
  '3 - 4',
  '2 * 3 + 4',
  '(1 + 2) * 3',
  '10 / 2 - 3'
];

console.log('Parsing arithmetic expressions...\n');

testCases.forEach(function(expr) {
  try {
    console.log('Parsing: ' + expr);
    var ast = parser.parseText(expr);
    
    // Print the AST
    var writer = new alteraparser.AstStrWriter();
    var astString = writer.writeAstToStr(ast);
    console.log('AST:');
    console.log(astString);
  } catch (e) {
    console.error('Parse error: ' + e.message);
  }
});
