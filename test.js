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
  TextParser,
  VERSION,
  version
} from './src/index.js';

function testTokenCreation() {
  console.log('Test 1: Token Creation');
  const token = new Token('NUMBER', '42', 1, 5);
  assert.strictEqual(token.tokenType, 'NUMBER', 'Token type should be NUMBER');
  assert.strictEqual(token.value, '42', 'Token value should be 42');
  assert.strictEqual(token.line, 1, 'Token line should be 1');
  assert.strictEqual(token.column, 5, 'Token column should be 5');
  console.log('✓ Token creation works\n');
}

function testLexerGrammar() {
  console.log('Test 2: LexerGrammar');
  const lexerGrammar = new LexerGrammar();
  lexerGrammar.addRule('NUMBER', '[0-9]+');
  lexerGrammar.addRule('PLUS', '\\+');
  const rules = lexerGrammar.getRules();
  assert.strictEqual(rules.length, 2, 'Should have 2 rules');
  console.log('✓ LexerGrammar works\n');
}

function testLexer() {
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
}

function testAst() {
  console.log('Test 4: AST');
  const ast = new Ast('expression', null, 'expr1');
  assert.strictEqual(ast.name, 'expression', 'AST name should be expression');
  const childAst = new Ast('number', '42');
  ast.addChild(childAst);
  assert.strictEqual(ast.getChildren().length, 1, 'Should have 1 child');
  console.log('✓ AST works\n');
}

function testGrammarAndParser() {
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
}

function testDefineRuleAndRuleConfig() {
  console.log('Test 6: defineRule and RuleConfig');
  const grammar = new Grammar();
  const transformer = ast => ast;
  const expander = g => seq(tok('NUMBER'), opt(seq(tok('PLUS'), g.get('expression'))));

  const config = grammar
    .defineRule('expression', expander)
    .setAsStartRule()
    .transform(transformer)
    .finalize();

  assert.strictEqual(config.name, 'expression', 'Rule name should be expression');
  assert.strictEqual(config.isStartRule, true, 'Rule should be marked as start rule');
  assert.strictEqual(config.transformer, transformer, 'Rule transformer should be registered');
  assert.strictEqual(grammar.rules.expression, expander, 'Grammar should store the rule expander');
  assert.strictEqual(grammar.startRuleName, 'expression', 'Grammar start rule should be expression');
  assert.strictEqual(grammar.getAstTransformer('expression'), transformer, 'AST transformer should be registered');
  assert.strictEqual(typeof grammar.getRule('expression').expand, 'function', 'Rule should be constructible');
  console.log('✓ defineRule and RuleConfig works\n');
}

function testVersionMetadata() {
  console.log('Test 7: Version metadata');
  assert.strictEqual(typeof VERSION, 'string', 'VERSION should be a string');
  assert.strictEqual(VERSION, '3.1.0', 'VERSION should match package version');
  assert.strictEqual(version, VERSION, 'version alias should match VERSION');
  console.log('✓ Version metadata works\n');
}

async function runTests() {
  console.log('Testing AlteraParser...\n');

  testTokenCreation();
  testLexerGrammar();
  testLexer();
  testAst();
  testGrammarAndParser();
  testDefineRuleAndRuleConfig();
  testVersionMetadata();

  console.log('All tests passed! ✓');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
