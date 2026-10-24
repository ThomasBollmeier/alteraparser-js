/**
 * LexerGrammar class defines tokenization rules for the lexer.
 * @constructor
 */
function LexerGrammar() {
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
LexerGrammar.prototype.addRule = function(tokenType, pattern, ignore, caseInsensitive) {
  if (ignore === undefined) {
    ignore = false;
  }
  if (caseInsensitive === undefined) {
    caseInsensitive = false;
  }
  
  if (!pattern.startsWith('^')) {
    pattern = '^' + pattern;
  }
  
  var flags = caseInsensitive ? 'i' : '';
  var regex = new RegExp(pattern, flags);
  
  this.rules.push([tokenType, regex, ignore]);
  return this;
};

/**
 * Get all the rules
 * @returns {Array} The array of rules
 */
LexerGrammar.prototype.getRules = function() {
  return this.rules;
};

// Export for CommonJS and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    LexerGrammar: LexerGrammar
  };
}
