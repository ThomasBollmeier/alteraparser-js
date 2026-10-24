/**
 * LexerGrammar class defines tokenization rules for the lexer.
 */
export class LexerGrammar {
  constructor() {
    /**
     * Array of rules, each containing [token_type, regex_pattern, ignore_flag]
     * @type {Array}
     */
    this.rules = [];
  }

  /**
   * Add a tokenization rule
   * @param {string} tokenType - The type of token to recognize
   * @param {string} pattern - The regex pattern to match
   * @param {boolean} [ignore=false] - Whether to ignore this token
   * @param {boolean} [caseInsensitive=false] - Whether the pattern is case-insensitive
   * @returns {LexerGrammar} - this for chaining
   */
  addRule(tokenType, pattern, ignore = false, caseInsensitive = false) {
    if (!pattern.startsWith('^')) {
      pattern = '^' + pattern;
    }

    const flags = caseInsensitive ? 'i' : '';
    const regex = new RegExp(pattern, flags);

    this.rules.push([tokenType, regex, ignore]);
    return this;
  }

  /**
   * Get all the rules
   * @returns {Array} The array of rules
   */
  getRules() {
    return this.rules;
  }
}
