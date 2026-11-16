/**
 * FLAT Algorithm 4: Subset Construction (NFA to DFA)
 * Converts arbitrary Non-Deterministic Finite Automata to Deterministic Finite Automata
 * via the powerset construction with ε-closure.
 */

import { getEpsilonClosure, getMove } from './epsilonClosure.js';

export function nfaToDFA(nfa, includeDeadState = false, maxDfaStates = 250) {
  const { states: nfaStates, alphabet, startState: nfaStart, acceptStates: nfaAccepts, transitions: nfaTransitions } = nfa;

  // Helper to serialize an array of NFA states into a unique canonical key
  const serializeStateSet = (set) => set.slice().sort().join(',');

  const dfaStateMap = new Map(); // serializedKey -> dfaStateName ('D0', 'D1', ...)
  const dfaStateCompositions = {}; // dfaStateName -> [nfaStates]
  const dfaTransitions = {}; // dfaStateName -> { symbol -> nextDfaState }
  const dfaStates = [];
  const dfaAcceptStates = [];

  let stateCounter = 0;

  // 1. Initial DFA state: ε-closure of NFA start state
  const initialClosure = getEpsilonClosure([nfaStart], nfaTransitions);
  const initialKey = serializeStateSet(initialClosure);
  const initialDfaState = `D${stateCounter++}`;

  dfaStateMap.set(initialKey, initialDfaState);
  dfaStateCompositions[initialDfaState] = initialClosure;
  dfaStates.push(initialDfaState);
  dfaTransitions[initialDfaState] = {};

  const worklist = [initialClosure];

  // 2. Iterate through unmarked DFA states
  while (worklist.length > 0) {
    if (dfaStates.length > maxDfaStates) {
      throw new Error(`DFA state explosion limit exceeded (${maxDfaStates} states). Pattern requires optimization.`);
    }

    const currentNfaSet = worklist.shift();
    const currentKey = serializeStateSet(currentNfaSet);
    const currentDfaState = dfaStateMap.get(currentKey);

    // For every input symbol in alphabet
    for (const symbol of alphabet) {
      const moved = getMove(currentNfaSet, symbol, nfaTransitions);
      const nextClosure = getEpsilonClosure(moved, nfaTransitions);

      if (nextClosure.length > 0) {
        const nextKey = serializeStateSet(nextClosure);

        let targetDfaState;
        if (!dfaStateMap.has(nextKey)) {
          // New DFA state discovered
          targetDfaState = `D${stateCounter++}`;
          dfaStateMap.set(nextKey, targetDfaState);
          dfaStateCompositions[targetDfaState] = nextClosure;
          dfaStates.push(targetDfaState);
          dfaTransitions[targetDfaState] = {};
          worklist.push(nextClosure);
        } else {
          targetDfaState = dfaStateMap.get(nextKey);
        }

        dfaTransitions[currentDfaState][symbol] = targetDfaState;
      }
    }
  }

  // 3. Mark Accepting States
  const nfaAcceptSet = new Set(nfaAccepts);
  for (const dfaState of dfaStates) {
    const composition = dfaStateCompositions[dfaState];
    const isAccepting = composition.some(s => nfaAcceptSet.has(s));
    if (isAccepting) {
      dfaAcceptStates.push(dfaState);
    }
  }

  // 4. Optional: Insert Dead/Trap State for total transition function completeness
  let deadStateName = null;
  if (includeDeadState) {
    let hasMissingTransitions = false;
    for (const state of dfaStates) {
      for (const symbol of alphabet) {
        if (!dfaTransitions[state][symbol]) {
          hasMissingTransitions = true;
          break;
        }
      }
    }

    if (hasMissingTransitions) {
      deadStateName = 'D_dead';
      dfaStates.push(deadStateName);
      dfaStateCompositions[deadStateName] = ['TRAP_STATE'];
      dfaTransitions[deadStateName] = {};

      // Dead state loops to itself on all symbols
      for (const symbol of alphabet) {
        dfaTransitions[deadStateName][symbol] = deadStateName;
      }

      // Route all missing transitions to dead state
      for (const state of dfaStates) {
        if (state !== deadStateName) {
          for (const symbol of alphabet) {
            if (!dfaTransitions[state][symbol]) {
              dfaTransitions[state][symbol] = deadStateName;
            }
          }
        }
      }
    }
  }

  return {
    states: dfaStates,
    alphabet,
    startState: initialDfaState,
    acceptStates: dfaAcceptStates,
    transitions: dfaTransitions,
    stateMappings: dfaStateCompositions,
    deadState: deadStateName
  };
}
