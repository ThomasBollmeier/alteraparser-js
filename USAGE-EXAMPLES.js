/**
 * Example: Using AlteraParser from different bundle formats
 */

// ============================================================
// EXAMPLE 1: ESM Import (Modern JavaScript)
// ============================================================
// File: example-esm.js
// Usage: node --input-type=module example-esm.js
/*
import { 
  LexerGrammar, 
  Grammar, 
  tok, 
  seq, 
  many, 
  TextParser 
} from './dist/alteraparser.esm.js';

const lexerGrammar = new LexerGrammar();
lexerGrammar.addRule('NUM', '[0-9]+');
lexerGrammar.addRule('PLUS', '\\+');
lexerGrammar.addRule('WS', '\\s+', true);

const grammar = new Grammar();
grammar.addRule('expr', g => seq(tok('NUM'), many(seq(tok('PLUS'), tok('NUM')))), true);

const parser = new TextParser(grammar, lexerGrammar);
const ast = parser.parseText('1 + 2 + 3');
console.log('Parsed:', ast);
*/

// ============================================================
// EXAMPLE 2: CommonJS Require (Node.js)
// ============================================================
// File: example-cjs.js
// Usage: node example-cjs.js
/*
const { 
  LexerGrammar, 
  Grammar, 
  tok, 
  seq, 
  many, 
  TextParser 
} = require('./dist/alteraparser.cjs');

const lexerGrammar = new LexerGrammar();
lexerGrammar.addRule('NUM', '[0-9]+');
lexerGrammar.addRule('PLUS', '\\+');
lexerGrammar.addRule('WS', '\\s+', true);

const grammar = new Grammar();
grammar.addRule('expr', g => seq(tok('NUM'), many(seq(tok('PLUS'), tok('NUM')))), true);

const parser = new TextParser(grammar, lexerGrammar);
const ast = parser.parseText('1 + 2 + 3');
console.log('Parsed:', ast);
*/

// ============================================================
// EXAMPLE 3: Browser with UMD (Global Namespace)
// ============================================================
// File: example.html
/*
<!DOCTYPE html>
<html>
<head>
  <title>AlteraParser Example</title>
</head>
<body>
  <h1>AlteraParser Parser</h1>
  <input id="input" type="text" value="1 + 2 + 3">
  <button onclick="parseInput()">Parse</button>
  <pre id="output"></pre>

  <script src="dist/alteraparser.umd.js"></script>
  <script>
    const { 
      LexerGrammar, 
      Grammar, 
      tok, 
      seq, 
      many, 
      TextParser 
    } = window.alteraparser;

    const lexerGrammar = new LexerGrammar();
    lexerGrammar.addRule('NUM', '[0-9]+');
    lexerGrammar.addRule('PLUS', '\\+');
    lexerGrammar.addRule('WS', '\\s+', true);

    const grammar = new Grammar();
    grammar.addRule('expr', g => 
      seq(tok('NUM'), many(seq(tok('PLUS'), tok('NUM')))), 
      true
    );

    const parser = new TextParser(grammar, lexerGrammar);

    function parseInput() {
      const input = document.getElementById('input').value;
      try {
        const ast = parser.parseText(input);
        document.getElementById('output').textContent = JSON.stringify(ast, null, 2);
      } catch (e) {
        document.getElementById('output').textContent = 'Error: ' + e.message;
      }
    }

    // Parse on load
    parseInput();
  </script>
</body>
</html>
*/

// ============================================================
// EXAMPLE 4: Browser with ES6 Modules (Modern)
// ============================================================
// File: example-modern.html
/*
<!DOCTYPE html>
<html>
<head>
  <title>AlteraParser Example (Modern)</title>
</head>
<body>
  <h1>AlteraParser Parser</h1>
  <input id="input" type="text" value="1 + 2 + 3">
  <button onclick="parseInput()">Parse</button>
  <pre id="output"></pre>

  <script type="module">
    import { 
      LexerGrammar, 
      Grammar, 
      tok, 
      seq, 
      many, 
      TextParser 
    } from './dist/alteraparser.esm.js';

    const lexerGrammar = new LexerGrammar();
    lexerGrammar.addRule('NUM', '[0-9]+');
    lexerGrammar.addRule('PLUS', '\\+');
    lexerGrammar.addRule('WS', '\\s+', true);

    const grammar = new Grammar();
    grammar.addRule('expr', g => 
      seq(tok('NUM'), many(seq(tok('PLUS'), tok('NUM')))), 
      true
    );

    const parser = new TextParser(grammar, lexerGrammar);

    window.parseInput = function() {
      const input = document.getElementById('input').value;
      try {
        const ast = parser.parseText(input);
        document.getElementById('output').textContent = JSON.stringify(ast, null, 2);
      } catch (e) {
        document.getElementById('output').textContent = 'Error: ' + e.message;
      }
    };

    // Parse on load
    window.parseInput();
  </script>
</body>
</html>
*/

// ============================================================
// EXAMPLE 5: NPM Package Installation
// ============================================================
/*
// Installation
npm install alteraparser

// Usage with automatic format selection
import { LexerGrammar, Grammar, tok, seq, many, TextParser } from 'alteraparser';
// In CommonJS:
// const { LexerGrammar, Grammar, tok, seq, many, TextParser } = require('alteraparser');
*/
