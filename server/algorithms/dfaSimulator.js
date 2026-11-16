/**
 * FLAT Algorithm 5: DFA Simulator & Execution Trace Engine
 * Runs in strict O(n) linear execution time for string of length n.
 * Uses transition function δ(q, a) = q'.
 */

export function simulateDFA(dfa, inputString) {
  const startTime = performance.now();
  const { states, alphabet, startState, acceptStates, transitions, deadState } = dfa;

  const acceptSet = new Set(acceptStates);
  const alphabetSet = new Set(alphabet);

  let currentState = startState;
  const executionTrace = [];
  let failureIndex = -1;
  let failureReason = null;

  // Handle empty input string: check if startState is an accepting state
  if (!inputString || inputString.length === 0) {
    const isStartAccepting = acceptSet.has(currentState);
    const durationMs = parseFloat((performance.now() - startTime).toFixed(4));

    return {
      isValid: isStartAccepting,
      finalState: currentState,
      executionTrace: [{
        step: 0,
        fromState: currentState,
        char: 'ε',
        toState: currentState,
        isAccepting: isStartAccepting,
        explanation: isStartAccepting 
          ? `Initial state ${currentState} is an accepting state. Empty string ε accepted.`
          : `Initial state ${currentState} is not an accepting state. Empty string ε rejected.`
      }],
      failureIndex: isStartAccepting ? -1 : 0,
      failureReason: isStartAccepting ? null : 'Empty input string rejected: initial state is not an accepting state.',
      executionTimeMs: durationMs
    };
  }

  for (let i = 0; i < inputString.length; i++) {
    const char = inputString[i];
    const stateTransitions = transitions[currentState] || {};
    const nextState = stateTransitions[char];

    // Case 1: Symbol not in alphabet
    if (!alphabetSet.has(char)) {
      failureIndex = i;
      failureReason = `Symbol '${char}' at index ${i} is not part of the language alphabet Σ={${alphabet.join(', ')}}.`;
      executionTrace.push({
        step: i + 1,
        fromState: currentState,
        char,
        toState: null,
        isAccepting: false,
        explanation: failureReason
      });
      break;
    }

    // Case 2: No valid transition from current state
    if (!nextState) {
      failureIndex = i;
      failureReason = `No valid transition δ(${currentState}, '${char}') exists. Automata halted in non-accepting configuration.`;
      executionTrace.push({
        step: i + 1,
        fromState: currentState,
        char,
        toState: null,
        isAccepting: false,
        explanation: failureReason
      });
      break;
    }

    // Case 3: Transition to Dead State
    if (deadState && nextState === deadState) {
      failureIndex = i;
      failureReason = `Transition δ(${currentState}, '${char}') entered trap state (${deadState}). Input cannot be accepted.`;
      executionTrace.push({
        step: i + 1,
        fromState: currentState,
        char,
        toState: nextState,
        isAccepting: false,
        explanation: failureReason
      });
      currentState = nextState;
      break;
    }

    // Case 4: Successful step
    const isAccepting = acceptSet.has(nextState);
    executionTrace.push({
      step: i + 1,
      fromState: currentState,
      char,
      toState: nextState,
      isAccepting,
      explanation: `δ(${currentState}, '${char}') = ${nextState}${isAccepting ? ' (Accepting State)' : ''}`
    });

    currentState = nextState;
  }

  const isAccepted = failureIndex === -1 && acceptSet.has(currentState);
  if (!isAccepted && failureIndex === -1) {
    failureIndex = inputString.length;
    failureReason = `Halted in non-accepting state ${currentState}.`;
  }

  const durationMs = parseFloat((performance.now() - startTime).toFixed(4));

  return {
    isValid: isAccepted,
    finalState: currentState,
    isFinalStateAccepting: acceptSet.has(currentState),
    executionTrace,
    failureIndex,
    failureReason,
    executionTimeMs: durationMs
  };
}
