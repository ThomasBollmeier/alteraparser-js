/**
 * Ast class represents a node in an Abstract Syntax Tree.
 * @constructor
 * @param {string} name - The name of the AST node
 * @param {*} [value] - The value associated with the node
 * @param {string} [id_=''] - An optional identifier for the node
 */
function Ast(name, value, id_) {
  this.name = name;
  this.value = value === undefined ? null : value;
  this.id = id_ === undefined ? '' : id_;
  this.children = [];
  this.attributes = {};
}

/**
 * Clone this AST node
 * @param {boolean} [deep=true] - Whether to perform a deep clone of children
 * @returns {Ast} A cloned copy of this node
 */
Ast.prototype.clone = function(deep) {
  if (deep === undefined) {
    deep = true;
  }
  
  var cloned = new Ast(this.name, this.value, this.id);
  
  // Copy attributes
  for (var key in this.attributes) {
    if (this.attributes.hasOwnProperty(key)) {
      cloned.attributes[key] = this.attributes[key];
    }
  }
  
  // Deep clone children if requested
  if (deep) {
    for (var i = 0; i < this.children.length; i++) {
      cloned.addChild(this.children[i].clone(deep));
    }
  }
  
  return cloned;
};

/**
 * Add a child node
 * @param {Ast} child - The child node to add
 */
Ast.prototype.addChild = function(child) {
  this.children.push(child);
};

/**
 * Get all children
 * @returns {Ast[]} Array of child nodes
 */
Ast.prototype.getChildren = function() {
  return this.children;
};

/**
 * Get the nth child
 * @param {number} n - The index of the child
 * @returns {Ast} The nth child node
 */
Ast.prototype.getNthChild = function(n) {
  return this.children[n];
};

/**
 * Get children with a specific name
 * @param {string} name - The name to search for
 * @returns {Ast[]} Array of child nodes with the specified name
 */
Ast.prototype.getChildrenByName = function(name) {
  var result = [];
  for (var i = 0; i < this.children.length; i++) {
    if (this.children[i].name === name) {
      result.push(this.children[i]);
    }
  }
  return result;
};

/**
 * Get a child by its id
 * @param {string} id_ - The id to search for
 * @param {boolean} [clearId=true] - Whether to clear the id in the returned clone
 * @returns {Ast|null} The child with the specified id, or null if not found
 */
Ast.prototype.getChildById = function(id_, clearId) {
  if (clearId === undefined) {
    clearId = true;
  }
  
  for (var i = 0; i < this.children.length; i++) {
    var child = this.children[i];
    if (child.id === id_) {
      if (clearId) {
        var cloned = child.clone();
        cloned.id = '';
        return cloned;
      }
      return child;
    }
  }
  return null;
};

/**
 * Get children by their id
 * @param {string} id_ - The id to search for
 * @param {boolean} [clearId=true] - Whether to clear the id in returned clones
 * @returns {Ast[]} Array of children with the specified id
 */
Ast.prototype.getChildrenById = function(id_, clearId) {
  if (clearId === undefined) {
    clearId = true;
  }
  
  var result = [];
  for (var i = 0; i < this.children.length; i++) {
    var child = this.children[i];
    if (child.id === id_) {
      if (clearId) {
        var cloned = child.clone();
        cloned.id = '';
        result.push(cloned);
      } else {
        result.push(child);
      }
    }
  }
  return result;
};

/**
 * Set an attribute on this node
 * @param {string} name - The attribute name
 * @param {*} [value=true] - The attribute value
 */
Ast.prototype.setAttr = function(name, value) {
  if (value === undefined) {
    value = true;
  }
  this.attributes[name] = value;
};

/**
 * Get an attribute value
 * @param {string} name - The attribute name
 * @returns {*} The attribute value, or undefined if not found
 */
Ast.prototype.getAttr = function(name) {
  return this.attributes[name];
};

/**
 * Check if an attribute exists
 * @param {string} name - The attribute name
 * @returns {boolean} True if the attribute exists
 */
Ast.prototype.hasAttr = function(name) {
  return this.attributes.hasOwnProperty(name);
};

/**
 * Array-style access to children
 * @param {number} index - The index of the child
 * @returns {Ast} The child at the specified index
 */
Ast.prototype.get = function(index) {
  return this.children[index];
};

/**
 * AstStrWriter writes AST nodes to string representation.
 * @constructor
 * @param {number} [indentSize=2] - Number of spaces per indent level
 */
function AstStrWriter(indentSize) {
  this._indentLevel = 0;
  this._indentSize = indentSize || 2;
  this._output = '';
}

/**
 * Write an AST to a string
 * @param {Ast} ast - The AST to write
 * @returns {string} The string representation
 */
AstStrWriter.prototype.writeAstToStr = function(ast) {
  this._output = '';
  this._indentLevel = 0;
  this._writeAst(ast);
  return this._output;
};

/**
 * Internal method to write an AST node
 * @private
 * @param {Ast} ast - The AST node to write
 */
AstStrWriter.prototype._writeAst = function(ast) {
  var idStr = ast.id ? ' id="' + ast.id + '"' : '';
  var attrStr = '';
  
  for (var name in ast.attributes) {
    if (ast.attributes.hasOwnProperty(name)) {
      attrStr += ' ' + name + '="' + ast.attributes[name] + '"';
    }
  }
  if (attrStr) {
    idStr += attrStr;
  }
  
  if (ast.value === null) {
    if (ast.children.length > 0) {
      this._writeLine('<' + ast.name + idStr + '>');
    } else {
      this._writeLine('<' + ast.name + idStr + '/>');
    }
  } else {
    if (ast.children.length > 0) {
      this._writeLine('<' + ast.name + idStr + '> ' + ast.value);
    } else {
      this._writeLine('<' + ast.name + idStr + '> ' + ast.value + ' </' + ast.name + '>');
    }
  }
  
  this._indentLevel += 1;
  
  for (var i = 0; i < ast.children.length; i++) {
    this._writeAst(ast.children[i]);
  }
  
  this._indentLevel -= 1;
  
  if (ast.children.length > 0) {
    this._writeLine('</' + ast.name + '>');
  }
};

/**
 * Internal method to write indented text
 * @private
 * @param {string} text - The text to write
 */
AstStrWriter.prototype._write = function(text) {
  for (var i = 0; i < this._indentLevel * this._indentSize; i++) {
    this._output += ' ';
  }
  this._output += text;
};

/**
 * Internal method to write indented text with newline
 * @private
 * @param {string} text - The text to write
 */
AstStrWriter.prototype._writeLine = function(text) {
  this._write(text);
  this._output += '\n';
};

/**
 * AstWalker is an abstract base class for traversing AST nodes.
 * @constructor
 */
function AstWalker() {}

/**
 * Called when entering an AST node
 * @param {Ast} ast - The AST node being entered
 */
AstWalker.prototype.onEnter = function(ast) {};

/**
 * Called when exiting an AST node
 * @param {Ast} ast - The AST node being exited
 */
AstWalker.prototype.onExit = function(ast) {};

/**
 * Walk an AST using a walker
 * @param {Ast} ast - The root AST node to start from
 * @param {AstWalker} walker - The walker to use for traversal
 */
function walk(ast, walker) {
  walker.onEnter(ast);
  for (var i = 0; i < ast.children.length; i++) {
    walk(ast.children[i], walker);
  }
  walker.onExit(ast);
}

/**
 * AstTransformer transforms AST nodes based on registered transformer functions.
 * @constructor
 */
function AstTransformer() {
  this._transformers = {};
}

/**
 * Register a transformer function for a specific AST node type
 * @param {string} name - The name of the node type
 * @param {Function} transformer - The transformer function
 */
AstTransformer.prototype.registerTransformer = function(name, transformer) {
  this._transformers[name] = transformer;
};

/**
 * Transform an AST and all its children recursively
 * @param {Ast} ast - The AST to transform
 * @returns {Ast} The transformed AST
 */
AstTransformer.prototype.transform = function(ast) {
  for (var i = 0; i < ast.children.length; i++) {
    ast.children[i] = this.transform(ast.children[i]);
  }
  
  var savedId = ast.id;
  var transformedAst = ast;
  
  if (ast.name in this._transformers) {
    transformedAst = this._transformers[ast.name](ast);
  }
  
  transformedAst.id = savedId;
  return transformedAst;
};

/**
 * Decorator function for registering AST transformers
 * @param {AstTransformer} astTransformer - The transformer registry
 * @param {string} astName - The name of the AST node type
 * @returns {Function} A decorator function
 */
function transformAst(astTransformer, astName) {
  return function(fn) {
    astTransformer.registerTransformer(astName, fn);
    return fn;
  };
}

// Export for CommonJS and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Ast: Ast,
    AstStrWriter: AstStrWriter,
    AstWalker: AstWalker,
    walk: walk,
    AstTransformer: AstTransformer,
    transformAst: transformAst
  };
}
