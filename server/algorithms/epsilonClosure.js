/**
 * FLAT Algorithm 3: Epsilon Closure (ε-Closure) & Move Operations
 * Essential component of Subset Construction.
 */

import { EPSILON } from './regexParser.js';

/**
 * Calculates ε-closure for a set of NFA states.
 * ε-closure(T) = T ∪ { s | t ∈ T and t --ε*--> s }
 * @param {Array<string>|Set<string>} stateSet - Set of states
 * @param {Object} transitions - NFA transition table { fromState: { symbol: [toStates] } }
 * @returns {Array<string>} - Sorted array of state names in the ε-closure
 */
export function getEpsilonClosure(stateSet, transitions) {
  const closure = new Set(Array.from(stateSet));
  const stack = Array.from(stateSet);

  while (stack.length > 0) {
    const currentState = stack.pop();
    const stateTransitions = transitions[currentState];

    if (stateTransitions && stateTransitions[EPSILON]) {
      for (const nextState of stateTransitions[EPSILON]) {
        if (!closure.has(nextState)) {
          closure.add(nextState);
          stack.push(nextState);
        }
      }
    }
  }

  return Array.from(closure).sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)));
}

/**
 * Computes move(T, symbol): the set of states directly reachable from set T on symbol
 * @param {Array<string>|Set<string>} stateSet - Set of source states
 * @param {string} symbol - Alphabet character
 * @param {Object} transitions - NFA transition table
 * @returns {Array<string>} - Sorted array of target states
 */
export function getMove(stateSet, symbol, transitions) {
  const targetStates = new Set();

  for (const state of stateSet) {
    const stateTransitions = transitions[state];
    if (stateTransitions && stateTransitions[symbol]) {
      for (const target of stateTransitions[symbol]) {
        targetStates.add(target);
      }
    }
  }

  return Array.from(targetStates).sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)));
}
