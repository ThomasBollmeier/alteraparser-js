/**
 * Simple test suite for AlteraParser
 */

import assert from 'assert';
import {
  Token,
  LexerGrammar,
  Lexer,
  Ast,
  Grammar,
  rule,
  tok,
  seq,
  choice,
  many,
  opt,
  Parser,
  TextParser
} from './src/index.js';

async function runTests() {
  console.log('Testing AlteraParser...\n');

  // Test 1: Basic Token creation
  console.log('Test 1: Token Creation');
  const token = new Token('NUMBER', '42', 1, 5);
  assert.strictEqual(token.tokenType, 'NUMBER', 'Token type should be NUMBER');
  assert.strictEqual(token.value, '42', 'Token value should be 42');
  assert.strictEqual(token.line, 1, 'Token line should be 1');
  assert.strictEqual(token.column, 5, 'Token column should be 5');
  console.log('✓ Token creation works\n');

  // Test 2: LexerGrammar
  console.log('Test 2: LexerGrammar');
  const lexerGrammar = new LexerGrammar();
  lexerGrammar.addRule('NUMBER', '[0-9]+');
  lexerGrammar.addRule('PLUS', '\\+');
  const rules = lexerGrammar.getRules();
  assert.strictEqual(rules.length, 2, 'Should have 2 rules');
  console.log('✓ LexerGrammar works\n');

  // Test 3: Lexer
  console.log('Test 3: Lexer');
  const testLexerGrammar = new LexerGrammar();
  testLexerGrammar.addRule('NUMBER', '[0-9]+');
  testLexerGrammar.addRule('PLUS', '\\+');
  testLexerGrammar.addRule('WS', '\\s+', true);
  const lexer = new Lexer(testLexerGrammar, '42 + 7');
  const t1 = lexer.advance();
  assert.strictEqual(t1.tokenType, 'NUMBER', 'First token should be NUMBER');
  assert.strictEqual(t1.value, '42', 'First token value should be 42');
  const t2 = lexer.advance();
  assert.strictEqual(t2.tokenType, 'PLUS', 'Second token should be PLUS');
  const t3 = lexer.advance();
  assert.strictEqual(t3.tokenType, 'NUMBER', 'Third token should be NUMBER');
  console.log('✓ Lexer works\n');

  // Test 4: AST
  console.log('Test 4: AST');
  const ast = new Ast('expression', null, 'expr1');
  assert.strictEqual(ast.name, 'expression', 'AST name should be expression');
  const childAst = new Ast('number', '42');
  ast.addChild(childAst);
  assert.strictEqual(ast.getChildren().length, 1, 'Should have 1 child');
  console.log('✓ AST works\n');

  // Test 5: Grammar and Parser
  console.log('Test 5: Grammar and Parser');
  const grammar = new Grammar();

  rule(grammar, 'expression', true)(g =>
    seq(tok('NUMBER'), opt(seq(tok('PLUS'), g.get('expression'))))
  );

  const parserLexerGrammar = new LexerGrammar();
  parserLexerGrammar.addRule('NUMBER', '[0-9]+');
  parserLexerGrammar.addRule('PLUS', '\\+');
  parserLexerGrammar.addRule('WS', '\\s+', true);

  const textParser = new TextParser(grammar, parserLexerGrammar);
  const resultAst = textParser.parseText('42 + 7 + 3');
  assert.strictEqual(resultAst.name, 'expression', 'Result should be expression');
  console.log('✓ Grammar and Parser work\n');

  console.log('All tests passed! ✓');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
