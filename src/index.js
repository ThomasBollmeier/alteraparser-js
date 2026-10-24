/**
 * Alteraparser - ES5 JavaScript version
 * Main entry point for CommonJS and browser
 */

(function(root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    // CommonJS/Node.js
    var token = require('./token.js');
    var lexerGrammar = require('./lexer_grammar.js');
    var lexer = require('./lexer.js');
    var ast = require('./ast.js');
    var grammar = require('./grammar.js');
    var parser = require('./parser.js');
    
    module.exports = factory(
      token, lexerGrammar, lexer, ast, grammar, parser
    );
  } else {
    // Browser globals
    root.alteraparser = factory(
      root.alteraparser,
      root.alteraparser,
      root.alteraparser,
      root.alteraparser,
      root.alteraparser,
      root.alteraparser
    );
  }
}(typeof self !== 'undefined' ? self : this, function(token, lexerGrammar, ast, grammar, lexer, parser) {
  
  return {
    // Token classes
    Token: token.Token,
    TokenStream: token.TokenStream,
    TokenStreamFromList: token.TokenStreamFromList,
    
    // Lexer classes
    LexerGrammar: lexerGrammar.LexerGrammar,
    Lexer: lexer.Lexer,
    
    // AST classes
    Ast: ast.Ast,
    AstStrWriter: ast.AstStrWriter,
    AstWalker: ast.AstWalker,
    walk: ast.walk,
    AstTransformer: ast.AstTransformer,
    transformAst: ast.transformAst,
    
    // Grammar classes and functions
    GrammarNodeType: grammar.GrammarNodeType,
    GrammarNode: grammar.GrammarNode,
    RuleStartNode: grammar.RuleStartNode,
    RuleEndNode: grammar.RuleEndNode,
    GrammarElement: grammar.GrammarElement,
    connect: grammar.connect,
    NormalElement: grammar.NormalElement,
    TokenElement: grammar.TokenElement,
    tok: grammar.tok,
    Sequence: grammar.Sequence,
    seq: grammar.seq,
    Choice: grammar.Choice,
    choice: grammar.choice,
    Optional: grammar.Optional,
    opt: grammar.opt,
    Many: grammar.Many,
    many: grammar.many,
    oneOrMore: grammar.oneOrMore,
    Rule: grammar.Rule,
    rule: grammar.rule,
    astTransformer: grammar.astTransformer,
    Grammar: grammar.Grammar,
    
    // Parser classes
    Parser: parser.Parser,
    TextParser: parser.TextParser
  };
}));
