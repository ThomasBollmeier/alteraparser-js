/**
 * Token class representing a lexical token with type, value, and position.
 * @constructor
 * @param {string} tokenType - The type of the token
 * @param {string} value - The string value of the token
 * @param {number} line - The line number where the token appears
 * @param {number} column - The column number where the token appears
 */
function Token(tokenType, value, line, column) {
  this.tokenType = tokenType;
  this.value = value;
  this.line = line;
  this.column = column;
}

/**
 * String representation of the token
 * @returns {string}
 */
Token.prototype.toString = function() {
  return 'Token(' + this.tokenType + ', ' + this.value + ', ' + this.line + ', ' + this.column + ')';
};

/**
 * TokenStream is an abstract base class for token streams.
 * @constructor
 */
function TokenStream() {}

/**
 * Advance to the next token in the stream.
 * @returns {Token|null}
 */
TokenStream.prototype.advance = function() {
  return null;
};

/**
 * TokenStreamFromList is a concrete implementation of TokenStream that reads from an array.
 * @constructor
 * @param {Token[]} tokens - Array of tokens
 */
function TokenStreamFromList(tokens) {
  TokenStream.call(this);
  this._tokens = tokens;
  this._index = 0;
}

TokenStreamFromList.prototype = Object.create(TokenStream.prototype);
TokenStreamFromList.prototype.constructor = TokenStreamFromList;

/**
 * Advance to the next token in the list
 * @returns {Token|null}
 */
TokenStreamFromList.prototype.advance = function() {
  if (this._index < this._tokens.length) {
    var token = this._tokens[this._index];
    this._index += 1;
    return token;
  }
  return null;
};

// Export for CommonJS and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Token: Token,
    TokenStream: TokenStream,
    TokenStreamFromList: TokenStreamFromList
  };
}
