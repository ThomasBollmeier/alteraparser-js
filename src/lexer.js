/**
 * Load dependencies for Node.js or use browser globals
 */
function loadDeps() {
  var Token, TokenStream;
  
  if (typeof module !== 'undefined' && module.exports) {
    var tokenModule = require('./token.js');
    Token = tokenModule.Token;
    TokenStream = tokenModule.TokenStream;
  } else {
    Token = window.alteraparser.Token;
    TokenStream = window.alteraparser.TokenStream;
  }
  
  return { Token: Token, TokenStream: TokenStream };
}

/**
 * Lexer class tokenizes input text according to lexer grammar rules.
 * @constructor
 * @param {LexerGrammar} grammar - The lexer grammar defining tokenization rules
 * @param {string} [text=''] - The input text to tokenize
 */
function Lexer(grammar, text) {
  var deps = loadDeps();
  deps.TokenStream.call(this);
  
  this.grammar = grammar;
  this.input = text || '';
  this.line = 1;
  this.column = 1;
}

Lexer.prototype = Object.create((function() {
  if (typeof module !== 'undefined' && module.exports) {
    var tokenModule = require('./token.js');
    return tokenModule.TokenStream.prototype;
  } else {
    return window.alteraparser.TokenStream.prototype;
  }
}()));

Lexer.prototype.constructor = Lexer;

/**
 * Set the input text to tokenize
 * @param {string} text - The input text
 */
Lexer.prototype.setInput = function(text) {
  this.input = text;
  this.line = 1;
  this.column = 1;
};

/**
 * Advance to the next token
 * @returns {Token|null} The next token, or null if at end of input
 * @throws {SyntaxError} If an unexpected character is encountered
 */
Lexer.prototype.advance = function() {
  var deps = loadDeps();
  var Token = deps.Token;
  
  if (!this.input) {
    return null;
  }
  
  while (this.input) {
    var ignored = false;
    var rules = this.grammar.getRules();
    
    for (var i = 0; i < rules.length; i++) {
      var rule = rules[i];
      var tokenType = rule[0];
      var regex = rule[1];
      var ignore = rule[2];
      
      var match = regex.exec(this.input);
      
      if (match) {
        var value = match[0];
        var token = new Token(tokenType, value, this.line, this.column);
        
        var lines = value.split('\n');
        if (lines.length > 1) {
          this.line += lines.length - 1;
          this.column = lines[lines.length - 1].length + 1;
        } else {
          this.column += value.length;
        }
        
        this.input = this.input.substring(value.length);
        
        if (ignore) {
          ignored = true;
          break;
        }
        
        return token;
      }
    }
    
    if (ignored) {
      continue;
    }
    
    throw new Error('Unexpected token at line ' + this.line + ', column ' + this.column);
  }
  
  return null;
};

// Export for CommonJS and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Lexer: Lexer
  };
}
