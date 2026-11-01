/**
 * Alteraparser - ES6 JavaScript version
 * Main entry point for ES6 modules
 */

import { VERSION } from './version.js';

export { VERSION };
export const version = VERSION;

export { Token, TokenStream, TokenStreamFromList } from './token.js';
export { LexerGrammar } from './lexer_grammar.js';
export { Lexer } from './lexer.js';
export {
  Ast,
  AstStrWriter,
  AstVisualizer,
  AstWalker,
  walk,
  AstTransformer,
  transformAst
} from './ast.js';
export {
  GrammarNodeType,
  GrammarNode,
  RuleStartNode,
  RuleEndNode,
  GrammarElement,
  connect,
  NormalElement,
  TokenElement,
  tok,
  Sequence,
  seq,
  Choice,
  choice,
  Optional,
  opt,
  Many,
  many,
  oneOrMore,
  Rule,
  rule,
  astTransformer,
  Grammar
} from './grammar.js';
export { Parser, TextParser } from './parser.js';
