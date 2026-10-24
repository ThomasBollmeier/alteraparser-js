import { Token, TokenStream } from './token.js';

/**
 * Lexer class tokenizes input text according to lexer grammar rules.
 */
export class Lexer extends TokenStream {
  /**
   * @param {LexerGrammar} grammar - The lexer grammar defining tokenization rules
   * @param {string} [text=''] - The input text to tokenize
   */
  constructor(grammar, text = '') {
    super();
    this.grammar = grammar;
    this.input = text;
    this.line = 1;
    this.column = 1;
  }

  /**
   * Set the input text to tokenize
   * @param {string} text - The input text
   */
  setInput(text) {
    this.input = text;
    this.line = 1;
    this.column = 1;
  }

  /**
   * Advance to the next token
   * @returns {Token|null} The next token, or null if at end of input
   * @throws {SyntaxError} If an unexpected character is encountered
   */
  advance() {
    if (!this.input) {
      return null;
    }

    while (this.input) {
      let ignored = false;
      const rules = this.grammar.getRules();

      for (let i = 0; i < rules.length; i++) {
        const [tokenType, regex, ignore] = rules[i];
        const match = regex.exec(this.input);

        if (match) {
          const value = match[0];
          const token = new Token(tokenType, value, this.line, this.column);

          const lines = value.split('\n');
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

      throw new Error(`Unexpected token at line ${this.line}, column ${this.column}`);
    }

    return null;
  }
}
