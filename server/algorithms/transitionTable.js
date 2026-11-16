/**
 * FLAT Algorithm 7: Transition Table Formatter
 * Generates structured matrices for both NFA and DFA suitable for UI tables and API transport.
 */

import { EPSILON } from './regexParser.js';

export function generateTransitionTable(automaton, isNFA = false) {
  const { states, alphabet, startState, acceptStates, transitions } = automaton;
  const acceptSet = new Set(acceptStates);

  const columns = ['State', 'Type', ...alphabet];
  if (isNFA) {
    columns.push(EPSILON);
  }

  const rows = states.map(state => {
    const isStart = state === startState;
    const isAccept = acceptSet.has(state);

    let type = 'Normal';
    if (isStart && isAccept) type = 'Initial & Accepting';
    else if (isStart) type = 'Initial (→)';
    else if (isAccept) type = 'Accepting (*)';

    const row = {
      state,
      type,
      isStart,
      isAccept,
      transitions: {}
    };

    const stateTransitions = transitions[state] || {};

    for (const sym of alphabet) {
      const target = stateTransitions[sym];
      if (isNFA) {
        row.transitions[sym] = Array.isArray(target) ? target.join(', ') : (target || '—');
      } else {
        row.transitions[sym] = target || '—';
      }
    }

    if (isNFA) {
      const epsTargets = stateTransitions[EPSILON];
      row.transitions[EPSILON] = Array.isArray(epsTargets) ? epsTargets.join(', ') : (epsTargets || '—');
    }

    return row;
  });

  return {
    columns,
    rows
  };
}
