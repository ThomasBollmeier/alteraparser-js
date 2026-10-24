/**
 * Load dependencies for Node.js or use browser globals
 */
function loadParserDeps() {
  if (typeof module !== 'undefined' && module.exports) {
    return {
      Ast: require('./ast.js').Ast,
      GrammarNodeType: require('./grammar.js').GrammarNodeType
    };
  } else {
    return {
      Ast: window.alteraparser.Ast,
      GrammarNodeType: window.alteraparser.GrammarNodeType
    };
  }
}

/**
 * Parser parses tokens according to a grammar to build an AST.
 * @constructor
 * @param {Grammar} grammar - The grammar definition for parsing
 */
function Parser(grammar) {
  this._grammar = grammar;
}

/**
 * Parse a token stream using the grammar
 * @param {TokenStream} tokens - Token stream to parse
 * @param {string} [ruleName=''] - Optional rule name to use as root
 * @returns {Ast} The parsed AST
 * @throws {Error} If parsing fails
 */
Parser.prototype.parse = function(tokens, ruleName) {
  if (ruleName === undefined) {
    ruleName = '';
  }
  
  var startNode;
  if (ruleName) {
    startNode = this._grammar.createSyntaxGraphForRule(ruleName);
  } else {
    startNode = this._grammar.createSyntaxGraph();
  }
  
  var matchedPaths = [[startNode]];
  var processedTokens = [];
  
  while (true) {
    var expectedToken = tokens.advance();
    if (expectedToken === null) {
      break;
    }
    processedTokens.push(expectedToken);
    
    var newMatchedPaths = [];
    for (var i = 0; i < matchedPaths.length; i++) {
      var path = matchedPaths[i];
      var currNode = path[path.length - 1];
      var followTokens = currNode.findFollowTokens(1);
      
      for (var j = 0; j < followTokens.length; j++) {
        var tokenTypes = followTokens[j][0];
        var followPath = followTokens[j][1];
        
        if (tokenTypes[0] === expectedToken.tokenType) {
          var newPath = path.slice();
          if (newPath[newPath.length - 1] !== followPath[0]) {
            newPath.push(followPath[0]);
          }
          for (var k = 1; k < followPath.length; k++) {
            newPath.push(followPath[k]);
          }
          newMatchedPaths.push(newPath);
        }
      }
    }
    
    if (newMatchedPaths.length === 0) {
      var line = expectedToken.line;
      var col = expectedToken.column;
      var value = expectedToken.value;
      throw new Error("Unexpected token @(" + line + ", " + col + "): '" + value + "'");
    }
    
    matchedPaths = newMatchedPaths;
  }
  
  var validMatchedPaths = [];
  for (var i = 0; i < matchedPaths.length; i++) {
    var path = matchedPaths[i];
    var lastNode = path[path.length - 1];
    var pathToEnd = this._grammar.findPathToEnd(lastNode);
    if (pathToEnd !== null) {
      validMatchedPaths.push(path.concat(pathToEnd.slice(1)));
    }
  }
  
  if (validMatchedPaths.length > 1) {
    throw new Error('Ambiguous parse, multiple valid paths found');
  }
  if (validMatchedPaths.length === 0) {
    throw new Error('Incomplete parse, cannot reach end');
  }
  
  return Parser._buildAst(validMatchedPaths[0], processedTokens);
};

/**
 * Build an AST from a parse path and tokens
 * @private
 * @static
 * @param {GrammarNode[]} parsePath - The valid parse path
 * @param {Token[]} tokens - The tokens that were parsed
 * @returns {Ast} The root AST node
 */
Parser._buildAst = function(parsePath, tokens) {
  var deps = loadParserDeps();
  var Ast = deps.Ast;
  var GrammarNodeType = deps.GrammarNodeType;
  
  var ret = null;
  var astStack = [];
  var tokenIdx = 0;
  
  for (var i = 0; i < parsePath.length; i++) {
    var node = parsePath[i];
    
    if (node.nodeType === GrammarNodeType.RULE_START) {
      var startNode = node;
      var astNode = new Ast(startNode.rule.name, null, startNode.getId());
      astStack.push(astNode);
    } else if (node.nodeType === GrammarNodeType.RULE_END) {
      var completedAst = astStack.pop();
      var endNode = node;
      var transformer = endNode.rule.grammar.getAstTransformer(endNode.rule.name);
      if (transformer) {
        var id_ = completedAst.id;
        completedAst = transformer(completedAst);
        completedAst.id = id_;
      }
      if (astStack.length > 0) {
        astStack[astStack.length - 1].addChild(completedAst);
      } else {
        ret = completedAst;
      }
    } else if (node.nodeType === GrammarNodeType.TOKEN) {
      var token = tokens[tokenIdx];
      tokenIdx += 1;
      var astNode = new Ast(token.tokenType, token.value, node.getId());
      if (astStack.length > 0) {
        astStack[astStack.length - 1].addChild(astNode);
      }
    }
  }
  
  return ret;
};

/**
 * TextParser combines lexing and parsing
 * @constructor
 * @param {Grammar} grammar - The grammar definition
 * @param {LexerGrammar} lexerGrammar - The lexer grammar definition
 */
function TextParser(grammar, lexerGrammar) {
  Parser.call(this, grammar);
  this._lexerGrammar = lexerGrammar;
}

TextParser.prototype = Object.create(Parser.prototype);
TextParser.prototype.constructor = TextParser;

/**
 * Parse raw text input
 * @param {string} text - The text to parse
 * @param {string} [ruleName=''] - Optional rule name to use as root
 * @returns {Ast} The parsed AST
 * @throws {Error} If parsing fails
 */
TextParser.prototype.parseText = function(text, ruleName) {
  if (ruleName === undefined) {
    ruleName = '';
  }
  
  var Lexer;
  if (typeof module !== 'undefined' && module.exports) {
    Lexer = require('./lexer.js').Lexer;
  } else {
    Lexer = window.alteraparser.Lexer;
  }
  
  var lexer = new Lexer(this._lexerGrammar, text);
  return this.parse(lexer, ruleName);
};

// Export for CommonJS and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Parser: Parser,
    TextParser: TextParser
  };
}
