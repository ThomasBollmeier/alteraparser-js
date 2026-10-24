/**
 * Simple test suite for AlteraParser
 */

var assert = typeof require !== 'undefined' ? require('assert') : window.assert;

function runTests() {
  console.log('Testing AlteraParser...\n');
  
  // Test 1: Basic Token creation
  console.log('Test 1: Token Creation');
  var Token = require ? require('./src/token.js').Token : window.alteraparser.Token;
  var token = new Token('NUMBER', '42', 1, 5);
  assert.equal(token.tokenType, 'NUMBER', 'Token type should be NUMBER');
  assert.equal(token.value, '42', 'Token value should be 42');
  assert.equal(token.line, 1, 'Token line should be 1');
  assert.equal(token.column, 5, 'Token column should be 5');
  console.log('✓ Token creation works\n');
  
  // Test 2: LexerGrammar
  console.log('Test 2: LexerGrammar');
  var LexerGrammar = require ? require('./src/lexer_grammar.js').LexerGrammar : window.alteraparser.LexerGrammar;
  var lexerGrammar = new LexerGrammar();
  lexerGrammar.addRule('NUMBER', '[0-9]+');
  lexerGrammar.addRule('PLUS', '\\+');
  var rules = lexerGrammar.getRules();
  assert.equal(rules.length, 2, 'Should have 2 rules');
  console.log('✓ LexerGrammar works\n');
  
  // Test 3: Lexer
  console.log('Test 3: Lexer');
  var Lexer = require ? require('./src/lexer.js').Lexer : window.alteraparser.Lexer;
  var testLexerGrammar = new LexerGrammar();
  testLexerGrammar.addRule('NUMBER', '[0-9]+');
  testLexerGrammar.addRule('PLUS', '\\+');
  testLexerGrammar.addRule('WS', '\\s+', true); // ignore whitespace
  var lexer = new Lexer(testLexerGrammar, '42 + 7');
  var t1 = lexer.advance();
  assert.equal(t1.tokenType, 'NUMBER', 'First token should be NUMBER');
  assert.equal(t1.value, '42', 'First token value should be 42');
  var t2 = lexer.advance();
  assert.equal(t2.tokenType, 'PLUS', 'Second token should be PLUS');
  var t3 = lexer.advance();
  assert.equal(t3.tokenType, 'NUMBER', 'Third token should be NUMBER');
  console.log('✓ Lexer works\n');
  
  // Test 4: AST
  console.log('Test 4: AST');
  var Ast = require ? require('./src/ast.js').Ast : window.alteraparser.Ast;
  var ast = new Ast('expression', null, 'expr1');
  var child1 = new Ast('operand', '42');
  var child2 = new Ast('operator', '+');
  var child3 = new Ast('operand', '7');
  ast.addChild(child1);
  ast.addChild(child2);
  ast.addChild(child3);
  assert.equal(ast.name, 'expression', 'AST name should be expression');
  assert.equal(ast.getChildren().length, 3, 'AST should have 3 children');
  assert.equal(ast.getNthChild(0).value, '42', 'First child should be 42');
  var cloned = ast.clone();
  assert.equal(cloned.name, ast.name, 'Cloned AST should have same name');
  assert.equal(cloned.getChildren().length, 3, 'Cloned AST should have same children');
  console.log('✓ AST works\n');
  
  // Test 5: AstStrWriter
  console.log('Test 5: AstStrWriter');
  var AstStrWriter = require ? require('./src/ast.js').AstStrWriter : window.alteraparser.AstStrWriter;
  var writer = new AstStrWriter();
  var output = writer.writeAstToStr(ast);
  assert(output.indexOf('expression') > -1, 'Output should contain expression');
  console.log('AST output:\n' + output);
  console.log('✓ AstStrWriter works\n');
  
  // Test 6: Grammar and Parser
  console.log('Test 6: Grammar and Parser');
  var Grammar = require ? require('./src/grammar.js').Grammar : window.alteraparser.Grammar;
  var tok = require ? require('./src/grammar.js').tok : window.alteraparser.tok;
  var seq = require ? require('./src/grammar.js').seq : window.alteraparser.seq;
  var choice = require ? require('./src/grammar.js').choice : window.alteraparser.choice;
  var many = require ? require('./src/grammar.js').many : window.alteraparser.many;
  
  var grammar = new Grammar();
  grammar.addRule('expr', function(g) {
    return seq(
      tok('NUMBER'),
      many(seq(tok('PLUS'), tok('NUMBER')))
    );
  }, true);
  
  var Parser = require ? require('./src/parser.js').Parser : window.alteraparser.Parser;
  var parser = new Parser(grammar);
  
  var simpleLexerGrammar = new LexerGrammar();
  simpleLexerGrammar.addRule('NUMBER', '[0-9]+');
  simpleLexerGrammar.addRule('PLUS', '\\+');
  simpleLexerGrammar.addRule('WS', '\\s+', true);
  
  var lexer2 = new Lexer(simpleLexerGrammar, '1 + 2 + 3');
  var parseResult = parser.parse(lexer2);
  assert(parseResult !== null, 'Parse should succeed');
  assert.equal(parseResult.name, 'expr', 'Root should be expr');
  console.log('✓ Grammar and Parser work\n');
  
  // Test 7: TextParser
  console.log('Test 7: TextParser');
  var TextParser = require ? require('./src/parser.js').TextParser : window.alteraparser.TextParser;
  var textParser = new TextParser(grammar, simpleLexerGrammar);
  var ast2 = textParser.parseText('5 + 10');
  assert(ast2 !== null, 'TextParser should produce AST');
  assert.equal(ast2.name, 'expr', 'Root should be expr');
  console.log('✓ TextParser works\n');
  
  console.log('=================================');
  console.log('All tests passed! ✓');
  console.log('=================================');
}

// Run tests in Node.js
if (typeof require !== 'undefined') {
  runTests();
}
