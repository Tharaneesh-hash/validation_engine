/**
 * FLAT Algorithm 2: Thompson's Construction (Regex to NFA)
 * Inductive construction producing an ε-NFA with a single initial state and single accepting state.
 */

import { EPSILON, infixToPostfix } from './regexParser.js';

class StateCounter {
  constructor() {
    this.count = 0;
  }
  next() {
    return `q${this.count++}`;
  }
}

/**
 * Builds an NFA fragment for a single character literal
 */
function createLiteralFragment(counter, symbol) {
  const start = counter.next();
  const accept = counter.next();
  const transitions = {
    [start]: { [symbol]: [accept] },
    [accept]: {}
  };
  return { start, accept, transitions, alphabet: symbol === EPSILON ? [] : [symbol] };
}

/**
 * Builds an NFA from a postfix token list using Thompson's Construction
 */
export function buildNFAFromPostfix(postfixTokens) {
  const counter = new StateCounter();
  const stack = [];
  const alphabetSet = new Set();

  for (const token of postfixTokens) {
    if (token === '.') {
      // Concatenation: A . B
      if (stack.length < 2) throw new Error('Malformed regular expression: missing operand for concatenation.');
      const b = stack.pop();
      const a = stack.pop();

      // Connect A.accept to B.start with epsilon
      const transitions = { ...a.transitions, ...b.transitions };
      transitions[a.accept] = transitions[a.accept] || {};
      transitions[a.accept][EPSILON] = transitions[a.accept][EPSILON] || [];
      transitions[a.accept][EPSILON].push(b.start);

      stack.push({
        start: a.start,
        accept: b.accept,
        transitions
      });
    } else if (token === '|') {
      // Union: A | B
      if (stack.length < 2) throw new Error('Malformed regular expression: missing operand for union (|).');
      const b = stack.pop();
      const a = stack.pop();

      const start = counter.next();
      const accept = counter.next();
      const transitions = { ...a.transitions, ...b.transitions };

      transitions[start] = {
        [EPSILON]: [a.start, b.start]
      };
      transitions[accept] = {};

      transitions[a.accept] = transitions[a.accept] || {};
      transitions[a.accept][EPSILON] = transitions[a.accept][EPSILON] || [];
      transitions[a.accept][EPSILON].push(accept);

      transitions[b.accept] = transitions[b.accept] || {};
      transitions[b.accept][EPSILON] = transitions[b.accept][EPSILON] || [];
      transitions[b.accept][EPSILON].push(accept);

      stack.push({ start, accept, transitions });
    } else if (token === '*') {
      // Kleene Star: A*
      if (stack.length < 1) throw new Error('Malformed regular expression: missing operand for Kleene star (*).');
      const a = stack.pop();

      const start = counter.next();
      const accept = counter.next();
      const transitions = { ...a.transitions };

      transitions[start] = {
        [EPSILON]: [a.start, accept]
      };
      transitions[accept] = {};

      transitions[a.accept] = transitions[a.accept] || {};
      transitions[a.accept][EPSILON] = transitions[a.accept][EPSILON] || [];
      transitions[a.accept][EPSILON].push(a.start);
      transitions[a.accept][EPSILON].push(accept);

      stack.push({ start, accept, transitions });
    } else if (token === '+') {
      // Plus Operator: A+ (1 or more)
      if (stack.length < 1) throw new Error('Malformed regular expression: missing operand for plus (+).');
      const a = stack.pop();

      const start = counter.next();
      const accept = counter.next();
      const transitions = { ...a.transitions };

      transitions[start] = {
        [EPSILON]: [a.start]
      };
      transitions[accept] = {};

      transitions[a.accept] = transitions[a.accept] || {};
      transitions[a.accept][EPSILON] = transitions[a.accept][EPSILON] || [];
      transitions[a.accept][EPSILON].push(a.start);
      transitions[a.accept][EPSILON].push(accept);

      stack.push({ start, accept, transitions });
    } else if (token === '?') {
      // Optional Operator: A? (0 or 1)
      if (stack.length < 1) throw new Error('Malformed regular expression: missing operand for optional (?).');
      const a = stack.pop();

      const start = counter.next();
      const accept = counter.next();
      const transitions = { ...a.transitions };

      transitions[start] = {
        [EPSILON]: [a.start, accept]
      };
      transitions[accept] = {};

      transitions[a.accept] = transitions[a.accept] || {};
      transitions[a.accept][EPSILON] = transitions[a.accept][EPSILON] || [];
      transitions[a.accept][EPSILON].push(accept);

      stack.push({ start, accept, transitions });
    } else {
      // Literal character token (possibly escaped e.g. '\.' or ordinary 'a')
      const sym = token.startsWith('\\') ? token.slice(1) : token;
      alphabetSet.add(sym);
      stack.push(createLiteralFragment(counter, sym));
    }
  }

  if (stack.length !== 1) {
    throw new Error('Malformed regular expression: unbalanced operators.');
  }

  const finalFragment = stack.pop();

  // Collect all states in sorted order
  const allStates = new Set();
  allStates.add(finalFragment.start);
  allStates.add(finalFragment.accept);
  for (const [fromState, transMap] of Object.entries(finalFragment.transitions)) {
    allStates.add(fromState);
    for (const toStates of Object.values(transMap)) {
      toStates.forEach(s => allStates.add(s));
    }
  }

  return {
    states: Array.from(allStates).sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1))),
    alphabet: Array.from(alphabetSet).sort(),
    startState: finalFragment.start,
    acceptStates: [finalFragment.accept],
    transitions: finalFragment.transitions
  };
}

/**
 * High-level entry: Converts a regex string to an NFA
 */
export function regexToNFA(regexStr) {
  // Strip starting ^ and ending $ anchors if present for FLAT standard grammar
  let cleanRegex = regexStr.trim();
  if (cleanRegex.startsWith('^')) cleanRegex = cleanRegex.slice(1);
  if (cleanRegex.endsWith('$')) cleanRegex = cleanRegex.slice(0, -1);

  if (!cleanRegex) {
    // Empty language matches only empty string ε
    return {
      states: ['q0'],
      alphabet: [],
      startState: 'q0',
      acceptStates: ['q0'],
      transitions: { q0: {} }
    };
  }

  const postfix = infixToPostfix(cleanRegex);
  return buildNFAFromPostfix(postfix);
}
