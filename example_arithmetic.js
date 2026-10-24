/**
 * Example: Simple arithmetic expression parser
 * This example shows how to create a parser for arithmetic expressions like "1 + 2 * 3"
 */

import {
  LexerGrammar,
  Grammar,
  TextParser,
  AstStrWriter,
  tok,
  seq,
  choice,
  many
} from './src/index.js';

// Create a simple arithmetic expression lexer grammar
const lexerGrammar = new LexerGrammar();
lexerGrammar.addRule('NUMBER', '[0-9]+');
lexerGrammar.addRule('PLUS', '\\+');
lexerGrammar.addRule('MINUS', '-');
lexerGrammar.addRule('MULT', '\\*');
lexerGrammar.addRule('DIV', '/');
lexerGrammar.addRule('LPAREN', '\\(');
lexerGrammar.addRule('RPAREN', '\\)');
lexerGrammar.addRule('WS', '\\s+', true); // ignore whitespace

// Create the grammar for arithmetic expressions
const grammar = new Grammar();

// expression = term (('+' | '-') term)*
grammar.addRule('expression', (g) => {
  return seq(
    g.getRule('term'),
    many(seq(
      choice(
        tok('PLUS'),
        tok('MINUS')
      ),
      g.getRule('term')
    ))
  );
}, true); // true marks this as the start rule

// term = factor (('*' | '/') factor)*
grammar.addRule('term', (g) => {
  return seq(
    g.getRule('factor'),
    many(seq(
      choice(
        tok('MULT'),
        tok('DIV')
      ),
      g.getRule('factor')
    ))
  );
});

// factor = NUMBER | '(' expression ')'
grammar.addRule('factor', (g) => {
  return choice(
    tok('NUMBER'),
    seq(
      tok('LPAREN'),
      g.getRule('expression'),
      tok('RPAREN')
    )
  );
});

// Create parser
const parser = new TextParser(grammar, lexerGrammar);

// Test parsing various expressions
const testCases = [
  '42',
  '1 + 2',
  '3 - 4',
  '2 * 3 + 4',
  '(1 + 2) * 3',
  '10 / 2 - 3'
];

console.log('Parsing arithmetic expressions...\n');

testCases.forEach((expr) => {
  try {
    console.log(`Parsing: ${expr}`);
    const ast = parser.parseText(expr);

    // Print the AST
    const writer = new AstStrWriter();
    const astString = writer.writeAstToStr(ast);
    console.log('AST:');
    console.log(astString);
  } catch (e) {
    console.error(`Parse error: ${e.message}`);
  }
});
