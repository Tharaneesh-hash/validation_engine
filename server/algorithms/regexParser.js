/**
 * FLAT Algorithm 1: Regular Expression Parser & AST Generator
 * Supports: Literals, Concatenation (implicit & explicit), Union (|), 
 * Kleene Star (*), Plus (+), Optional (?), Character Classes [a-z], and Grouping ().
 */

export const EPSILON = 'ε';

// Precedence levels for Shunting-Yard
const PRECEDENCE = {
  '*': 3,
  '+': 3,
  '?': 3,
  '.': 2, // Explicit concatenation operator
  '|': 1
};

/**
 * Expands character classes like [a-z], [0-9], [A-Z] into alternation groups
 * e.g. [0-3] -> (0|1|2|3)
 */
export function expandCharacterClasses(regexStr) {
  let result = '';
  let i = 0;

  while (i < regexStr.length) {
    if (regexStr[i] === '[') {
      let j = i + 1;
      let classContent = '';
      let isNegated = false;

      if (j < regexStr.length && regexStr[j] === '^') {
        isNegated = true;
        j++;
      }

      while (j < regexStr.length && regexStr[j] !== ']') {
        if (regexStr[j] === '\\' && j + 1 < regexStr.length) {
          classContent += regexStr[j] + regexStr[j + 1];
          j += 2;
        } else {
          classContent += regexStr[j];
          j++;
        }
      }

      if (j >= regexStr.length) {
        throw new Error('Unclosed character class "[" in regular expression.');
      }

      // Expand ranges inside class e.g. a-d -> a|b|c|d
      const expandedChars = [];
      let k = 0;
      while (k < classContent.length) {
        if (classContent[k] === '\\' && k + 1 < classContent.length) {
          const esc = classContent[k + 1];
          if (esc === 'd') {
            for (let d = 0; d <= 9; d++) expandedChars.push(String(d));
          } else if (esc === 'w') {
            for (let c = 97; c <= 122; c++) expandedChars.push(String.fromCharCode(c));
            for (let c = 65; c <= 90; c++) expandedChars.push(String.fromCharCode(c));
            for (let d = 0; d <= 9; d++) expandedChars.push(String(d));
            expandedChars.push('_');
          } else {
            expandedChars.push(esc);
          }
          k += 2;
        } else if (k + 2 < classContent.length && classContent[k + 1] === '-') {
          const startCode = classContent.charCodeAt(k);
          const endCode = classContent.charCodeAt(k + 2);
          if (startCode > endCode) {
            throw new Error(`Invalid range [${classContent[k]}-${classContent[k + 2]}] in character class.`);
          }
          for (let code = startCode; code <= endCode; code++) {
            expandedChars.push(String.fromCharCode(code));
          }
          k += 3;
        } else {
          expandedChars.push(classContent[k]);
          k++;
        }
      }

      if (expandedChars.length === 0) {
        throw new Error('Empty character class [] encountered.');
      }

      result += '(' + expandedChars.join('|') + ')';
      i = j + 1;
    } else if (regexStr[i] === '\\' && i + 1 < regexStr.length) {
      const esc = regexStr[i + 1];
      if (esc === 'd') {
        result += '(0|1|2|3|4|5|6|7|8|9)';
      } else if (esc === 'w') {
        result += '([a-zA-Z0-9_])';
      } else {
        result += '\\' + esc;
      }
      i += 2;
    } else {
      result += regexStr[i];
      i++;
    }
  }

  return result;
}

/**
 * Inserts explicit concatenation operator '.' between adjacent tokens
 * e.g. "ab" -> "a.b", "a(b)" -> "a.(b)", "a*" -> "a*", "a*b" -> "a*.b"
 */
export function insertExplicitConcat(regexStr) {
  let output = '';
  const isUnary = (c) => c === '*' || c === '+' || c === '?';
  const isBinary = (c) => c === '|' || c === '.';

  for (let i = 0; i < regexStr.length; i++) {
    const c1 = regexStr[i];
    output += c1;

    // Handle escaped char
    if (c1 === '\\' && i + 1 < regexStr.length) {
      output += regexStr[i + 1];
      i++;
    }

    if (i + 1 < regexStr.length) {
      const c2 = regexStr[i + 1];

      // A concat operator is needed if c1 can end an expression and c2 can start an expression
      const c1CanEnd = (c1 !== '(' && !isBinary(c1)) || isUnary(c1);
      const c2CanStart = (c2 !== ')' && !isBinary(c2) && !isUnary(c2));

      if (c1CanEnd && c2CanStart) {
        output += '.';
      }
    }
  }

  return output;
}

/**
 * Shunting-Yard Algorithm: Converts Infix Regular Expression to Postfix (RPN)
 */
export function infixToPostfix(regexStr) {
  const expanded = expandCharacterClasses(regexStr);
  const formatted = insertExplicitConcat(expanded);

  let postfix = [];
  let operatorStack = [];

  for (let i = 0; i < formatted.length; i++) {
    const c = formatted[i];

    if (c === '\\' && i + 1 < formatted.length) {
      // Literal escaped character
      postfix.push('\\' + formatted[i + 1]);
      i++;
    } else if (c === '(') {
      operatorStack.push(c);
    } else if (c === ')') {
      while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
        postfix.push(operatorStack.pop());
      }
      if (operatorStack.length === 0) {
        throw new Error('Mismatched parentheses: missing opening "(" in regular expression.');
      }
      operatorStack.pop(); // Pop '('
    } else if (c === '*' || c === '+' || c === '?' || c === '.' || c === '|') {
      while (
        operatorStack.length > 0 &&
        operatorStack[operatorStack.length - 1] !== '(' &&
        PRECEDENCE[operatorStack[operatorStack.length - 1]] >= PRECEDENCE[c]
      ) {
        postfix.push(operatorStack.pop());
      }
      operatorStack.push(c);
    } else {
      // Ordinary character literal
      postfix.push(c);
    }
  }

  while (operatorStack.length > 0) {
    const op = operatorStack.pop();
    if (op === '(') {
      throw new Error('Mismatched parentheses: unclosed "(" in regular expression.');
    }
    postfix.push(op);
  }

  return postfix;
}
