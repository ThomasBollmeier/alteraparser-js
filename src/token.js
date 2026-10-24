/**
 * Token class representing a lexical token with type, value, and position.
 */
export class Token {
  /**
   * @param {string} tokenType - The type of the token
   * @param {string} value - The string value of the token
   * @param {number} line - The line number where the token appears
   * @param {number} column - The column number where the token appears
   */
  constructor(tokenType, value, line, column) {
    this.tokenType = tokenType;
    this.value = value;
    this.line = line;
    this.column = column;
  }

  /**
   * String representation of the token
   * @returns {string}
   */
  toString() {
    return `Token(${this.tokenType}, ${this.value}, ${this.line}, ${this.column})`;
  }
}

/**
 * TokenStream is an abstract base class for token streams.
 */
export class TokenStream {
  /**
   * Advance to the next token in the stream.
   * @returns {Token|null}
   */
  advance() {
    return null;
  }
}

/**
 * TokenStreamFromList is a concrete implementation of TokenStream that reads from an array.
 */
export class TokenStreamFromList extends TokenStream {
  /**
   * @param {Token[]} tokens - Array of tokens
   */
  constructor(tokens) {
    super();
    this._tokens = tokens;
    this._index = 0;
  }

  /**
   * Advance to the next token in the list
   * @returns {Token|null}
   */
  advance() {
    if (this._index < this._tokens.length) {
      const token = this._tokens[this._index];
      this._index += 1;
      return token;
    }
    return null;
  }
}
