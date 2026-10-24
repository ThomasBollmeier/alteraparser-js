import { Ast } from './ast.js';

export const GrammarNodeType = {
  NORMAL: 1,
  TOKEN: 2,
  RULE_START: 3,
  RULE_END: 4
};

export class GrammarNode {
  constructor(nodeType, tokenType, id_ = '') {
    this.nodeType = nodeType;
    this.tokenType = tokenType || null;
    this.id = id_;
    this.children = [];
  }

  clone() {
    return new GrammarNode(this.nodeType, this.tokenType, this.id);
  }

  getId() {
    return this.id;
  }

  addChild(childNode) {
    this.children.push(childNode);
  }

  getChildren() {
    return this.children;
  }

  findFollowTokens(n = 1, tokenTypes = [], path = [], skipSelf = true) {
    const results = [];

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

    const children = this.getChildren();
    for (let i = 0; i < children.length; i++) {
      const childResults = children[i].findFollowTokens(n, tokenTypes, path, false);
      results.push(...childResults);
    }

    return results;
  }

  findEpsilonPath(endReached, path = [], visited = {}) {
    if (this.nodeType !== GrammarNodeType.NORMAL) {
      path = path.concat([this]);
    }

    visited[this.id || Object.keys(visited).length] = true;

    if (endReached(this)) {
      return path;
    }

    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      const childKey = child.id || Object.keys(visited).length;

      if (!visited[childKey] && child.nodeType !== GrammarNodeType.TOKEN) {
        const result = child.findEpsilonPath(endReached, path, visited);
        if (result !== null) {
          return result;
        }
      }
    }

    return null;
  }

  toString() {
    if (this.nodeType === GrammarNodeType.TOKEN) {
      return `->[${this.tokenType}]->`;
    } else {
      return '->';
    }
  }
}

export class RuleStartNode extends GrammarNode {
  constructor(ruleObject) {
    super(GrammarNodeType.RULE_START);
    this.rule = ruleObject;
  }

  clone() {
    return new RuleStartNode(this.rule.clone());
  }

  getId() {
    return this.rule.id;
  }

  getChildren() {
    this.rule.expand();
    return super.getChildren();
  }

  toString() {
    return `->(Start ${this.rule.name})->`;
  }
}

export class RuleEndNode extends GrammarNode {
  constructor(ruleObject) {
    super(GrammarNodeType.RULE_END);
    this.rule = ruleObject;
  }

  clone() {
    return new RuleEndNode(this.rule.clone());
  }

  getChildren() {
    return super.getChildren();
  }

  toString() {
    return `->(End ${this.rule.name})->`;
  }
}

export class GrammarElement {
  constructor(id_ = '') {
    this.id = id_;
  }

  getInNode() {
    throw new Error('Not implemented');
  }

  getOutNode() {
    throw new Error('Not implemented');
  }

  clone() {
    throw new Error('Not implemented');
  }
}

export function connect(element1, element2) {
  const outNode = element1.getOutNode();
  const inNode = element2.getInNode();
  outNode.addChild(inNode);
}

export class NormalElement extends GrammarElement {
  constructor(node) {
    super();
    this.node = node;
  }

  clone() {
    return new NormalElement(this.node.clone());
  }

  getInNode() {
    return this.node;
  }

  getOutNode() {
    return this.node;
  }
}

export class TokenElement extends GrammarElement {
  constructor(tokenType, id_ = '') {
    super(id_);
    this.node = new GrammarNode(GrammarNodeType.TOKEN, tokenType, id_);
  }

  clone() {
    return new TokenElement(this.node.tokenType, this.id);
  }

  getInNode() {
    return this.node;
  }

  getOutNode() {
    return this.node;
  }
}

export function tok(tokenType, id_ = '') {
  return new TokenElement(tokenType, id_);
}

export class Sequence extends GrammarElement {
  constructor(elements) {
    super();
    this.elements = [];
    for (let i = 0; i < elements.length; i++) {
      this.elements.push(elements[i].clone());
    }
    for (let j = 0; j < this.elements.length - 1; j++) {
      connect(this.elements[j], this.elements[j + 1]);
    }
  }

  clone() {
    return new Sequence(this.elements);
  }

  getInNode() {
    return this.elements[0].getInNode();
  }

  getOutNode() {
    return this.elements[this.elements.length - 1].getOutNode();
  }
}

export function seq(...args) {
  return new Sequence(args);
}

export class Choice extends GrammarElement {
  constructor(branches) {
    super();
    this.branches = [];
    for (let i = 0; i < branches.length; i++) {
      this.branches.push(branches[i].clone());
    }
    this.startNode = new GrammarNode(GrammarNodeType.NORMAL);
    this.endNode = new GrammarNode(GrammarNodeType.NORMAL);
    for (let j = 0; j < this.branches.length; j++) {
      this.startNode.addChild(this.branches[j].getInNode());
      this.branches[j].getOutNode().addChild(this.endNode);
    }
  }

  clone() {
    return new Choice(this.branches);
  }

  getInNode() {
    return this.startNode;
  }

  getOutNode() {
    return this.endNode;
  }
}

export function choice(...args) {
  return new Choice(args);
}

export class Optional extends GrammarElement {
  constructor(element) {
    super();
    this.element = element.clone();
    this.startNode = new GrammarNode(GrammarNodeType.NORMAL);
    this.endNode = new GrammarNode(GrammarNodeType.NORMAL);
    this.startNode.addChild(this.element.getInNode());
    this.startNode.addChild(this.endNode);
    this.element.getOutNode().addChild(this.endNode);
  }

  clone() {
    return new Optional(this.element);
  }

  getInNode() {
    return this.startNode;
  }

  getOutNode() {
    return this.endNode;
  }
}

export function opt(element) {
  return new Optional(element);
}

export class Many extends GrammarElement {
  constructor(element) {
    super();
    this.element = element.clone();
    this.startNode = new GrammarNode(GrammarNodeType.NORMAL);
    this.endNode = new GrammarNode(GrammarNodeType.NORMAL);
    this.startNode.addChild(this.element.getInNode());
    this.startNode.addChild(this.endNode);
    this.element.getOutNode().addChild(this.startNode);
  }

  clone() {
    return new Many(this.element);
  }

  getInNode() {
    return this.startNode;
  }

  getOutNode() {
    return this.endNode;
  }
}

export function many(element) {
  return new Many(element);
}

export function oneOrMore(element) {
  return seq(element, many(element));
}

export class Rule extends GrammarElement {
  constructor(grammar, name, expander, id_ = '') {
    super(id_);
    this.grammar = grammar;
    this.name = name;
    this.expander = expander;
    this.isExpanded = false;
    this.startNode = new RuleStartNode(this);
    this.endNode = new RuleEndNode(this);
  }

  clone() {
    return new Rule(this.grammar, this.name, this.expander, this.id);
  }

  setId(id_) {
    this.id = id_;
    return this;
  }

  getInNode() {
    return this.startNode;
  }

  getOutNode() {
    return this.endNode;
  }

  expand() {
    if (!this.isExpanded) {
      const ruleRootElem = this.expander(this.grammar);
      const startElem = new NormalElement(this.startNode);
      const endElem = new NormalElement(this.endNode);
      connect(startElem, ruleRootElem);
      connect(ruleRootElem, endElem);
      this.isExpanded = true;
    }
  }
}

export function rule(grammar, name, isStartRule = false) {
  return function(expander) {
    grammar.addRule(name, expander, isStartRule);
  };
}

export function astTransformer(grammar, ruleName) {
  return function(fn) {
    grammar.addAstTransformer(ruleName, fn);
    return fn;
  };
}

export class Grammar {
  constructor() {
    this.rules = {};
    this.astTransformers = {};
    this.startRuleName = null;
    this.startElement = this._createNormal();
    this.endElement = this._createNormal();
    this.syntaxGraphCreated = false;
  }

  _createNormal() {
    return new NormalElement(new GrammarNode(GrammarNodeType.NORMAL));
  }

  setStartRule(name) {
    this.startRuleName = name;
  }

  createSyntaxGraph() {
    if (!this.syntaxGraphCreated) {
      if (this.startRuleName === null) {
        throw new Error('Start rule not set.');
      }
      const startRule = this.getRule(this.startRuleName);
      connect(this.startElement, startRule);
      connect(startRule, this.endElement);
      this.syntaxGraphCreated = true;
    }
    return this.startElement.getInNode();
  }

  createSyntaxGraphForRule(ruleName) {
    if (this.syntaxGraphCreated) {
      throw new Error('Syntax graph has already been created. Cannot create a new one.');
    }
    this.syntaxGraphCreated = true;
    const rule_ = this.getRule(ruleName);
    connect(this.startElement, rule_);
    connect(rule_, this.endElement);
    return this.startElement.getInNode();
  }

  findPathToEnd(node) {
    const endNode = this.endElement.getOutNode();
    return node.findEpsilonPath(n => n === endNode);
  }

  addRule(name, expander, isStartRule = false) {
    this.rules[name] = expander;
    if (isStartRule) {
      this.setStartRule(name);
    }
  }

  addAstTransformer(ruleName, transformer) {
    this.astTransformers[ruleName] = transformer;
  }

  defineRule(name, expander) {
    return new RuleConfig(this, name, expander);
  }

  getRule(name) {
    const expander = this.rules[name];
    return new Rule(this, name, expander);
  }

  getAstTransformer(ruleName) {
    return this.astTransformers[ruleName] || null;
  }

  get(item) {
    return this.getRule(item);
  }
}

class RuleConfig {
  
  constructor(grammar, name, expander) {
    this.grammar = grammar;
    this.name = name;
    this.expander = expander;
    this.isStartRule = false  ;
    this.transformer = null;
  }

  setAsStartRule() {
    this.isStartRule = true;
    return this;
  }

  transform(transformer) {
    this.transformer = transformer;
    return this;
  }

  finalize() {
    this.grammar.addRule(this.name, this.expander, this.isStartRule);
    if (this.transformer) {
      this.grammar.addAstTransformer(this.name, this.transformer);
    }
    return this;
  }

}