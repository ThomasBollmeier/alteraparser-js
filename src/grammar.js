/**
 * Load dependencies for Node.js or use browser globals
 */
function loadGrammarDeps() {
  if (typeof module !== 'undefined' && module.exports) {
    return {
      Ast: require('./ast.js').Ast
    };
  } else {
    return {
      Ast: window.alteraparser.Ast
    };
  }
}

/**
 * Enum for different types of grammar nodes
 */
var GrammarNodeType = {
  NORMAL: 1,
  TOKEN: 2,
  RULE_START: 3,
  RULE_END: 4
};

/**
 * A node in the grammar syntax graph
 * @constructor
 * @param {number} nodeType - The type of this node (from GrammarNodeType)
 * @param {string} [tokenType] - For TOKEN nodes, the token type
 * @param {string} [id_=''] - Optional identifier
 */
function GrammarNode(nodeType, tokenType, id_) {
  this.nodeType = nodeType;
  this.tokenType = tokenType || null;
  this.id = id_ || '';
  this.children = [];
}

/**
 * Clone this grammar node
 * @returns {GrammarNode}
 */
GrammarNode.prototype.clone = function() {
  return new GrammarNode(this.nodeType, this.tokenType, this.id);
};

/**
 * Get this node's identifier
 * @returns {string}
 */
GrammarNode.prototype.getId = function() {
  return this.id;
};

/**
 * Add a child node
 * @param {GrammarNode} childNode
 */
GrammarNode.prototype.addChild = function(childNode) {
  this.children.push(childNode);
};

/**
 * Get all child nodes
 * @returns {GrammarNode[]}
 */
GrammarNode.prototype.getChildren = function() {
  return this.children;
};

/**
 * Find all possible sequences of n tokens that can follow from this node
 * @param {number} [n=1] - Number of tokens to look ahead
 * @param {string[]} [tokenTypes] - Accumulated token types
 * @param {GrammarNode[]} [path] - Accumulated path
 * @param {boolean} [skipSelf=true] - Whether to skip this node initially
 * @returns {Array} Array of [tokenTypes, path] tuples
 */
GrammarNode.prototype.findFollowTokens = function(n, tokenTypes, path, skipSelf) {
  if (n === undefined) { n = 1; }
  if (tokenTypes === undefined) { tokenTypes = []; }
  if (path === undefined) { path = []; }
  if (skipSelf === undefined) { skipSelf = true; }
  
  var results = [];
  
  if (this.nodeType !== GrammarNodeType.NORMAL) {
    path = path.concat([this]);
  }
  
  if (this.nodeType === GrammarNodeType.TOKEN && !skipSelf) {
    tokenTypes = tokenTypes.concat([this.tokenType]);
    n -= 1;
    if (n === 0) {
      results.push([tokenTypes, path]);
      return results;
    }
  }
  
  // Use getChildren() instead of this.children to ensure lazy expansion
  var children = this.getChildren();
  for (var i = 0; i < children.length; i++) {
    var childResults = children[i].findFollowTokens(n, tokenTypes, path, false);
    results = results.concat(childResults);
  }
  
  return results;
};

/**
 * Find an epsilon path (no token consumption) to a target node
 * @param {Function} endReached - Function that returns true at target node
 * @param {GrammarNode[]} [path] - Accumulated path
 * @param {Set} [visited] - Set of visited nodes
 * @returns {GrammarNode[]|null} Path if found, null otherwise
 */
GrammarNode.prototype.findEpsilonPath = function(endReached, path, visited) {
  if (path === undefined) { path = []; }
  if (visited === undefined) { visited = {}; }
  
  if (this.nodeType !== GrammarNodeType.NORMAL) {
    path = path.concat([this]);
  }
  
  visited[this.id || Object.keys(visited).length] = true;
  
  if (endReached(this)) {
    return path;
  }
  
  for (var i = 0; i < this.children.length; i++) {
    var child = this.children[i];
    var childKey = child.id || Object.keys(visited).length;
    
    if (!visited[childKey] && child.nodeType !== GrammarNodeType.TOKEN) {
      var result = child.findEpsilonPath(endReached, path, visited);
      if (result !== null) {
        return result;
      }
    }
  }
  
  return null;
};

/**
 * String representation
 * @returns {string}
 */
GrammarNode.prototype.toString = function() {
  if (this.nodeType === GrammarNodeType.TOKEN) {
    return '->[' + this.tokenType + ']->';
  } else {
    return '->';
  }
};

/**
 * RuleStartNode marks the beginning of a rule
 * @constructor
 * @param {Rule} ruleObject - The rule being started
 */
function RuleStartNode(ruleObject) {
  GrammarNode.call(this, GrammarNodeType.RULE_START);
  this.rule = ruleObject;
}

RuleStartNode.prototype = Object.create(GrammarNode.prototype);
RuleStartNode.prototype.constructor = RuleStartNode;

/**
 * Clone this rule start node
 * @returns {RuleStartNode}
 */
RuleStartNode.prototype.clone = function() {
  return new RuleStartNode(this.rule.clone());
};

/**
 * Get this node's identifier
 * @returns {string}
 */
RuleStartNode.prototype.getId = function() {
  return this.rule.id;
};

/**
 * Get child nodes (ensuring rule is expanded first)
 * @returns {GrammarNode[]}
 */
RuleStartNode.prototype.getChildren = function() {
  this.rule.expand();
  return GrammarNode.prototype.getChildren.call(this);
};

/**
 * String representation
 * @returns {string}
 */
RuleStartNode.prototype.toString = function() {
  return '->(Start ' + this.rule.name + ')->';
};

/**
 * RuleEndNode marks the end of a rule
 * @constructor
 * @param {Rule} ruleObject - The rule being ended
 */
function RuleEndNode(ruleObject) {
  GrammarNode.call(this, GrammarNodeType.RULE_END);
  this.rule = ruleObject;
}

RuleEndNode.prototype = Object.create(GrammarNode.prototype);
RuleEndNode.prototype.constructor = RuleEndNode;

/**
 * Clone this rule end node
 * @returns {RuleEndNode}
 */
RuleEndNode.prototype.clone = function() {
  return new RuleEndNode(this.rule.clone());
};

/**
 * Get child nodes
 * @returns {GrammarNode[]}
 */
RuleEndNode.prototype.getChildren = function() {
  return GrammarNode.prototype.getChildren.call(this);
};

/**
 * String representation
 * @returns {string}
 */
RuleEndNode.prototype.toString = function() {
  return '->(End ' + this.rule.name + ')->';
};

/**
 * Abstract base class for grammar elements
 * @constructor
 * @param {string} [id_='']
 */
function GrammarElement(id_) {
  this.id = id_ || '';
}

/**
 * Get the entry point node
 * @returns {GrammarNode}
 */
GrammarElement.prototype.getInNode = function() {
  throw new Error('Not implemented');
};

/**
 * Get the exit point node
 * @returns {GrammarNode}
 */
GrammarElement.prototype.getOutNode = function() {
  throw new Error('Not implemented');
};

/**
 * Clone this element
 * @returns {GrammarElement}
 */
GrammarElement.prototype.clone = function() {
  throw new Error('Not implemented');
};

/**
 * Connect two grammar elements
 * @param {GrammarElement} element1 - Source element
 * @param {GrammarElement} element2 - Target element
 */
function connect(element1, element2) {
  var outNode = element1.getOutNode();
  var inNode = element2.getInNode();
  outNode.addChild(inNode);
}

/**
 * NormalElement wraps a GrammarNode
 * @constructor
 * @param {GrammarNode} node
 */
function NormalElement(node) {
  GrammarElement.call(this);
  this.node = node;
}

NormalElement.prototype = Object.create(GrammarElement.prototype);
NormalElement.prototype.constructor = NormalElement;

/**
 * Clone
 * @returns {NormalElement}
 */
NormalElement.prototype.clone = function() {
  return new NormalElement(this.node.clone());
};

/**
 * Get in node
 * @returns {GrammarNode}
 */
NormalElement.prototype.getInNode = function() {
  return this.node;
};

/**
 * Get out node
 * @returns {GrammarNode}
 */
NormalElement.prototype.getOutNode = function() {
  return this.node;
};

/**
 * TokenElement represents a terminal token
 * @constructor
 * @param {string} tokenType - The type of token
 * @param {string} [id_='']
 */
function TokenElement(tokenType, id_) {
  GrammarElement.call(this, id_);
  this.node = new GrammarNode(GrammarNodeType.TOKEN, tokenType, id_);
}

TokenElement.prototype = Object.create(GrammarElement.prototype);
TokenElement.prototype.constructor = TokenElement;

/**
 * Clone
 * @returns {TokenElement}
 */
TokenElement.prototype.clone = function() {
  return new TokenElement(this.node.tokenType, this.id);
};

/**
 * Get in node
 * @returns {GrammarNode}
 */
TokenElement.prototype.getInNode = function() {
  return this.node;
};

/**
 * Get out node
 * @returns {GrammarNode}
 */
TokenElement.prototype.getOutNode = function() {
  return this.node;
};

/**
 * Factory function for TokenElement
 * @param {string} tokenType
 * @param {string} [id_='']
 * @returns {TokenElement}
 */
function tok(tokenType, id_) {
  return new TokenElement(tokenType, id_);
}

/**
 * Sequence connects multiple elements in series
 * @constructor
 * @param {GrammarElement[]} elements
 */
function Sequence(elements) {
  GrammarElement.call(this);
  this.elements = [];
  for (var i = 0; i < elements.length; i++) {
    this.elements.push(elements[i].clone());
  }
  for (var j = 0; j < this.elements.length - 1; j++) {
    connect(this.elements[j], this.elements[j + 1]);
  }
}

Sequence.prototype = Object.create(GrammarElement.prototype);
Sequence.prototype.constructor = Sequence;

/**
 * Clone
 * @returns {Sequence}
 */
Sequence.prototype.clone = function() {
  return new Sequence(this.elements);
};

/**
 * Get in node
 * @returns {GrammarNode}
 */
Sequence.prototype.getInNode = function() {
  return this.elements[0].getInNode();
};

/**
 * Get out node
 * @returns {GrammarNode}
 */
Sequence.prototype.getOutNode = function() {
  return this.elements[this.elements.length - 1].getOutNode();
};

/**
 * Factory function for Sequence
 * @returns {Sequence}
 */
function seq() {
  var elements = Array.prototype.slice.call(arguments);
  return new Sequence(elements);
}

/**
 * Choice represents alternatives
 * @constructor
 * @param {GrammarElement[]} branches
 */
function Choice(branches) {
  GrammarElement.call(this);
  this.branches = [];
  for (var i = 0; i < branches.length; i++) {
    this.branches.push(branches[i].clone());
  }
  this.startNode = new GrammarNode(GrammarNodeType.NORMAL);
  this.endNode = new GrammarNode(GrammarNodeType.NORMAL);
  for (var j = 0; j < this.branches.length; j++) {
    this.startNode.addChild(this.branches[j].getInNode());
    this.branches[j].getOutNode().addChild(this.endNode);
  }
}

Choice.prototype = Object.create(GrammarElement.prototype);
Choice.prototype.constructor = Choice;

/**
 * Clone
 * @returns {Choice}
 */
Choice.prototype.clone = function() {
  return new Choice(this.branches);
};

/**
 * Get in node
 * @returns {GrammarNode}
 */
Choice.prototype.getInNode = function() {
  return this.startNode;
};

/**
 * Get out node
 * @returns {GrammarNode}
 */
Choice.prototype.getOutNode = function() {
  return this.endNode;
};

/**
 * Factory function for Choice
 * @returns {Choice}
 */
function choice() {
  var branches = Array.prototype.slice.call(arguments);
  return new Choice(branches);
}

/**
 * Optional makes an element optional
 * @constructor
 * @param {GrammarElement} element
 */
function Optional(element) {
  GrammarElement.call(this);
  this.element = element.clone();
  this.startNode = new GrammarNode(GrammarNodeType.NORMAL);
  this.endNode = new GrammarNode(GrammarNodeType.NORMAL);
  this.startNode.addChild(this.element.getInNode());
  this.startNode.addChild(this.endNode);
  this.element.getOutNode().addChild(this.endNode);
}

Optional.prototype = Object.create(GrammarElement.prototype);
Optional.prototype.constructor = Optional;

/**
 * Clone
 * @returns {Optional}
 */
Optional.prototype.clone = function() {
  return new Optional(this.element);
};

/**
 * Get in node
 * @returns {GrammarNode}
 */
Optional.prototype.getInNode = function() {
  return this.startNode;
};

/**
 * Get out node
 * @returns {GrammarNode}
 */
Optional.prototype.getOutNode = function() {
  return this.endNode;
};

/**
 * Factory function for Optional
 * @param {GrammarElement} element
 * @returns {Optional}
 */
function opt(element) {
  return new Optional(element);
}

/**
 * Many allows zero or more repetitions
 * @constructor
 * @param {GrammarElement} element
 */
function Many(element) {
  GrammarElement.call(this);
  this.element = element.clone();
  this.startNode = new GrammarNode(GrammarNodeType.NORMAL);
  this.endNode = new GrammarNode(GrammarNodeType.NORMAL);
  this.startNode.addChild(this.element.getInNode());
  this.startNode.addChild(this.endNode);
  this.element.getOutNode().addChild(this.startNode);
}

Many.prototype = Object.create(GrammarElement.prototype);
Many.prototype.constructor = Many;

/**
 * Clone
 * @returns {Many}
 */
Many.prototype.clone = function() {
  return new Many(this.element);
};

/**
 * Get in node
 * @returns {GrammarNode}
 */
Many.prototype.getInNode = function() {
  return this.startNode;
};

/**
 * Get out node
 * @returns {GrammarNode}
 */
Many.prototype.getOutNode = function() {
  return this.endNode;
};

/**
 * Factory function for Many
 * @param {GrammarElement} element
 * @returns {Many}
 */
function many(element) {
  return new Many(element);
}

/**
 * Factory function for one or more repetitions
 * @param {GrammarElement} element
 * @returns {Sequence}
 */
function oneOrMore(element) {
  return seq(element, many(element));
}

/**
 * Rule represents a named grammar rule
 * @constructor
 * @param {Grammar} grammar - The grammar this rule belongs to
 * @param {string} name - The rule name
 * @param {Function} expander - Function that returns the rule's GrammarElement
 * @param {string} [id_='']
 */
function Rule(grammar, name, expander, id_) {
  GrammarElement.call(this, id_);
  this.grammar = grammar;
  this.name = name;
  this.expander = expander;
  this.isExpanded = false;
  this.startNode = new RuleStartNode(this);
  this.endNode = new RuleEndNode(this);
}

Rule.prototype = Object.create(GrammarElement.prototype);
Rule.prototype.constructor = Rule;

/**
 * Clone
 * @returns {Rule}
 */
Rule.prototype.clone = function() {
  return new Rule(this.grammar, this.name, this.expander, this.id);
};

/**
 * Set the identifier
 * @param {string} id_
 * @returns {Rule}
 */
Rule.prototype.setId = function(id_) {
  this.id = id_;
  return this;
};

/**
 * Get in node
 * @returns {GrammarNode}
 */
Rule.prototype.getInNode = function() {
  return this.startNode;
};

/**
 * Get out node
 * @returns {GrammarNode}
 */
Rule.prototype.getOutNode = function() {
  return this.endNode;
};

/**
 * Expand the rule definition
 */
Rule.prototype.expand = function() {
  if (!this.isExpanded) {
    var ruleRootElem = this.expander(this.grammar);
    var startElem = new NormalElement(this.startNode);
    var endElem = new NormalElement(this.endNode);
    connect(startElem, ruleRootElem);
    connect(ruleRootElem, endElem);
    this.isExpanded = true;
  }
};

/**
 * Decorator for rule definitions
 * @param {Grammar} grammar
 * @param {string} name
 * @param {boolean} [isStartRule=false]
 * @returns {Function}
 */
function rule(grammar, name, isStartRule) {
  if (isStartRule === undefined) {
    isStartRule = false;
  }
  return function(expander) {
    grammar.addRule(name, expander, isStartRule);
  };
}

/**
 * Decorator for AST transformers
 * @param {Grammar} grammar
 * @param {string} ruleName
 * @returns {Function}
 */
function astTransformer(grammar, ruleName) {
  return function(fn) {
    grammar.addAstTransformer(ruleName, fn);
    return fn;
  };
}

/**
 * Grammar class manages a complete grammar definition
 * @constructor
 */
function Grammar() {
  this.rules = {};
  this.astTransformers = {};
  this.startRuleName = null;
  this.startElement = this._createNormal();
  this.endElement = this._createNormal();
  this.syntaxGraphCreated = false;
}

/**
 * Create a normal element
 * @private
 * @returns {NormalElement}
 */
Grammar.prototype._createNormal = function() {
  return new NormalElement(new GrammarNode(GrammarNodeType.NORMAL));
};

/**
 * Set the start rule
 * @param {string} name
 */
Grammar.prototype.setStartRule = function(name) {
  this.startRuleName = name;
};

/**
 * Create the complete syntax graph
 * @returns {GrammarNode}
 * @throws {Error} If no start rule has been set
 */
Grammar.prototype.createSyntaxGraph = function() {
  if (!this.syntaxGraphCreated) {
    if (this.startRuleName === null) {
      throw new Error('Start rule not set.');
    }
    var startRule = this.getRule(this.startRuleName);
    connect(this.startElement, startRule);
    connect(startRule, this.endElement);
    this.syntaxGraphCreated = true;
  }
  return this.startElement.getInNode();
};

/**
 * Create a syntax graph for a specific rule
 * @param {string} ruleName
 * @returns {GrammarNode}
 * @throws {Error} If graph already created
 */
Grammar.prototype.createSyntaxGraphForRule = function(ruleName) {
  if (this.syntaxGraphCreated) {
    throw new Error('Syntax graph has already been created. Cannot create a new one.');
  }
  this.syntaxGraphCreated = true;
  var rule_ = this.getRule(ruleName);
  connect(this.startElement, rule_);
  connect(rule_, this.endElement);
  return this.startElement.getInNode();
};

/**
 * Find an epsilon path to the end node
 * @param {GrammarNode} node
 * @returns {GrammarNode[]|null}
 */
Grammar.prototype.findPathToEnd = function(node) {
  var endNode = this.endElement.getOutNode();
  var self = this;
  return node.findEpsilonPath(function(n) { return n === endNode; });
};

/**
 * Add a rule to this grammar
 * @param {string} name
 * @param {Function} expander
 * @param {boolean} [isStartRule=false]
 */
Grammar.prototype.addRule = function(name, expander, isStartRule) {
  if (isStartRule === undefined) {
    isStartRule = false;
  }
  this.rules[name] = expander;
  if (isStartRule) {
    this.setStartRule(name);
  }
};

/**
 * Add an AST transformer
 * @param {string} ruleName
 * @param {Function} transformer
 */
Grammar.prototype.addAstTransformer = function(ruleName, transformer) {
  this.astTransformers[ruleName] = transformer;
};

/**
 * Get a rule instance by name
 * @param {string} name
 * @returns {Rule}
 */
Grammar.prototype.getRule = function(name) {
  var expander = this.rules[name];
  return new Rule(this, name, expander);
};

/**
 * Get an AST transformer for a rule
 * @param {string} ruleName
 * @returns {Function|null}
 */
Grammar.prototype.getAstTransformer = function(ruleName) {
  return this.astTransformers[ruleName] || null;
};

/**
 * Dictionary-style access
 * @param {string} item
 * @returns {Rule}
 */
Grammar.prototype.get = function(item) {
  return this.getRule(item);
};

// Export for CommonJS and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    GrammarNodeType: GrammarNodeType,
    GrammarNode: GrammarNode,
    RuleStartNode: RuleStartNode,
    RuleEndNode: RuleEndNode,
    GrammarElement: GrammarElement,
    connect: connect,
    NormalElement: NormalElement,
    TokenElement: TokenElement,
    tok: tok,
    Sequence: Sequence,
    seq: seq,
    Choice: Choice,
    choice: choice,
    Optional: Optional,
    opt: opt,
    Many: Many,
    many: many,
    oneOrMore: oneOrMore,
    Rule: Rule,
    rule: rule,
    astTransformer: astTransformer,
    Grammar: Grammar
  };
}
