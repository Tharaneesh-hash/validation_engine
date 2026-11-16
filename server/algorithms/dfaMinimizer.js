/**
 * FLAT Algorithm 6: Hopcroft's DFA Minimization Algorithm
 * Partitions DFA states into equivalence classes to yield the unique, minimal state DFA.
 * Preserves the recognized regular language L(M) = L(M_min).
 */

/**
 * Step 1: Eliminates unreachable states via BFS starting from startState
 */
export function removeUnreachableStates(dfa) {
  const { states, alphabet, startState, acceptStates, transitions } = dfa;
  const reachable = new Set([startState]);
  const queue = [startState];

  while (queue.length > 0) {
    const curr = queue.shift();
    const stateTrans = transitions[curr] || {};

    for (const sym of alphabet) {
      const next = stateTrans[sym];
      if (next && !reachable.has(next)) {
        reachable.add(next);
        queue.push(next);
      }
    }
  }

  const reachableStates = states.filter(s => reachable.has(s));
  const reachableAccepts = acceptStates.filter(s => reachable.has(s));
  const reachableTransitions = {};

  for (const s of reachableStates) {
    reachableTransitions[s] = {};
    for (const sym of alphabet) {
      if (transitions[s] && transitions[s][sym] && reachable.has(transitions[s][sym])) {
        reachableTransitions[s][sym] = transitions[s][sym];
      }
    }
  }

  return {
    states: reachableStates,
    alphabet,
    startState,
    acceptStates: reachableAccepts,
    transitions: reachableTransitions
  };
}

/**
 * Hopcroft's Minimization Algorithm
 */
export function minimizeDFA(rawDfa) {
  const dfa = removeUnreachableStates(rawDfa);
  const { states, alphabet, startState, acceptStates, transitions } = dfa;

  const acceptSet = new Set(acceptStates);
  const nonAcceptStates = states.filter(s => !acceptSet.has(s));

  // Initial Partition P0: [Accepting, Non-Accepting]
  let partitions = [];
  if (acceptStates.length > 0) partitions.push(acceptStates.slice().sort());
  if (nonAcceptStates.length > 0) partitions.push(nonAcceptStates.slice().sort());

  const partitionTrace = [
    {
      step: 0,
      description: 'Initial partition into Accepting (F) and Non-Accepting (Q \\ F) states',
      partitions: partitions.map(p => [...p])
    }
  ];

  let changed = true;
  let iteration = 0;

  // Helper to find the index of partition containing state `s`
  const getPartitionIndex = (s, partList) => {
    return partList.findIndex(group => group.includes(s));
  };

  while (changed) {
    changed = false;
    iteration++;
    const newPartitions = [];

    for (const group of partitions) {
      if (group.length <= 1) {
        newPartitions.push(group);
        continue;
      }

      // Sub-divide group based on transitions for each symbol
      const subGroups = new Map();

      for (const state of group) {
        // Construct signature: array of target partition indices for each alphabet symbol
        const signature = alphabet.map(sym => {
          const targetState = transitions[state] ? transitions[state][sym] : null;
          return targetState ? getPartitionIndex(targetState, partitions) : -1;
        }).join('|');

        if (!subGroups.has(signature)) {
          subGroups.set(signature, []);
        }
        subGroups.get(signature).push(state);
      }

      const splitResults = Array.from(subGroups.values());
      if (splitResults.length > 1) {
        changed = true;
      }
      for (const sg of splitResults) {
        newPartitions.push(sg.sort());
      }
    }

    partitions = newPartitions;
    partitionTrace.push({
      step: iteration,
      description: changed ? `Refinement step ${iteration}: partitioned equivalent states` : `Fixed point reached: partitions stabilized`,
      partitions: partitions.map(p => [...p])
    });

    if (iteration > 50) break; // Safety limit
  }

  // Construct Minimized DFA from final partitions
  // Name minimized states M0, M1, ...
  const stateToMinState = {};
  const minStates = [];
  const minTransitions = {};
  const minAcceptStates = [];
  let minStartState = null;

  partitions.forEach((group, idx) => {
    const minName = `M${idx}`;
    minStates.push(minName);
    minTransitions[minName] = {};

    group.forEach(s => {
      stateToMinState[s] = minName;
    });

    if (group.includes(startState)) {
      minStartState = minName;
    }

    if (group.some(s => acceptSet.has(s))) {
      minAcceptStates.push(minName);
    }
  });

  // Populate transitions for minimized DFA
  partitions.forEach((group, idx) => {
    const minName = `M${idx}`;
    const representative = group[0]; // Any state in equivalence class behaves identically

    for (const sym of alphabet) {
      const originalTarget = transitions[representative] ? transitions[representative][sym] : null;
      if (originalTarget && stateToMinState[originalTarget]) {
        minTransitions[minName][sym] = stateToMinState[originalTarget];
      }
    }
  });

  const originalCount = rawDfa.states.length;
  const minimizedCount = minStates.length;
  const reductionPercentage = originalCount > 0 
    ? parseFloat((((originalCount - minimizedCount) / originalCount) * 100).toFixed(1))
    : 0;

  return {
    originalStateCount: originalCount,
    minimizedStateCount: minimizedCount,
    reductionPercentage,
    partitionTrace,
    stateMappings: stateToMinState,
    minimizedDFA: {
      states: minStates,
      alphabet,
      startState: minStartState,
      acceptStates: minAcceptStates,
      transitions: minTransitions
    }
  };
}
