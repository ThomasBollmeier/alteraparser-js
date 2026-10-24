import { Ast } from './ast.js';
import { GrammarNodeType } from './grammar.js';
import { Lexer } from './lexer.js';

export class Parser {
  constructor(grammar) {
    this._grammar = grammar;
  }

  parse(tokens, ruleName = '') {
    let startNode;
    if (ruleName) {
      startNode = this._grammar.createSyntaxGraphForRule(ruleName);
    } else {
      startNode = this._grammar.createSyntaxGraph();
    }

    let matchedPaths = [[startNode]];
    const processedTokens = [];

    while (true) {
      const expectedToken = tokens.advance();
      if (expectedToken === null) {
        break;
      }
      processedTokens.push(expectedToken);

      const newMatchedPaths = [];
      for (let i = 0; i < matchedPaths.length; i++) {
        const path = matchedPaths[i];
        const currNode = path[path.length - 1];
        const followTokens = currNode.findFollowTokens(1);

        for (let j = 0; j < followTokens.length; j++) {
          const [tokenTypes, followPath] = followTokens[j];

          if (tokenTypes[0] === expectedToken.tokenType) {
            const newPath = path.slice();
            if (newPath[newPath.length - 1] !== followPath[0]) {
              newPath.push(followPath[0]);
            }
            for (let k = 1; k < followPath.length; k++) {
              newPath.push(followPath[k]);
            }
            newMatchedPaths.push(newPath);
          }
        }
      }

      if (newMatchedPaths.length === 0) {
        const { line, column, value } = expectedToken;
        throw new Error(`Unexpected token @(${line}, ${column}): '${value}'`);
      }

      matchedPaths = newMatchedPaths;
    }

    const validMatchedPaths = [];
    for (let i = 0; i < matchedPaths.length; i++) {
      const path = matchedPaths[i];
      const lastNode = path[path.length - 1];
      const pathToEnd = this._grammar.findPathToEnd(lastNode);
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
  }

  static _buildAst(parsePath, tokens) {
    let ret = null;
    const astStack = [];
    let tokenIdx = 0;

    for (let i = 0; i < parsePath.length; i++) {
      const node = parsePath[i];

      if (node.nodeType === GrammarNodeType.RULE_START) {
        const startNode = node;
        const astNode = new Ast(startNode.rule.name, null, startNode.getId());
        astStack.push(astNode);
      } else if (node.nodeType === GrammarNodeType.RULE_END) {
        let completedAst = astStack.pop();
        const endNode = node;
        const transformer = endNode.rule.grammar.getAstTransformer(endNode.rule.name);
        if (transformer) {
          const id_ = completedAst.id;
          completedAst = transformer(completedAst);
          completedAst.id = id_;
        }
        if (astStack.length > 0) {
          astStack[astStack.length - 1].addChild(completedAst);
        } else {
          ret = completedAst;
        }
      } else if (node.nodeType === GrammarNodeType.TOKEN) {
        const token = tokens[tokenIdx];
        tokenIdx += 1;
        const astNode = new Ast(token.tokenType, token.value, node.getId());
        if (astStack.length > 0) {
          astStack[astStack.length - 1].addChild(astNode);
        }
      }
    }

    return ret;
  }
}

export class TextParser extends Parser {
  constructor(grammar, lexerGrammar) {
    super(grammar);
    this._lexerGrammar = lexerGrammar;
  }

  parseText(text, ruleName = '') {
    const lexer = new Lexer(this._lexerGrammar, text);
    return this.parse(lexer, ruleName);
  }
}
