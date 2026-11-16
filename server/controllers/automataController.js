/**
 * Automata Controller
 * Handles REST API endpoints for Thompson NFA, Subset DFA, Hopcroft Minimization,
 * DFA simulation, and differential testing against native RegExp.
 */

import { regexToNFA } from '../algorithms/nfaBuilder.js';
import { nfaToDFA } from '../algorithms/dfaConverter.js';
import { minimizeDFA } from '../algorithms/dfaMinimizer.js';
import { simulateDFA } from '../algorithms/dfaSimulator.js';
import { generateTransitionTable } from '../algorithms/transitionTable.js';

/**
 * POST /api/automata/nfa
 */
export const buildNFA = (req, res) => {
  const { pattern } = req.body;
  if (!pattern) {
    return res.status(400).json({ success: false, message: 'Regex pattern is required.' });
  }

  try {
    const startTime = performance.now();
    const nfa = regexToNFA(pattern);
    const table = generateTransitionTable(nfa, true);
    const timeMs = parseFloat((performance.now() - startTime).toFixed(3));

    return res.status(200).json({
      success: true,
      pattern,
      nfa,
      transitionTable: table,
      metadata: {
        algorithm: "Thompson's Inductive Construction",
        stateCount: nfa.states.length,
        alphabetCount: nfa.alphabet.length,
        executionTimeMs: timeMs
      }
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: `Failed to construct NFA: ${err.message}`
    });
  }
};

/**
 * POST /api/automata/dfa
 */
export const buildDFA = (req, res) => {
  const { pattern, includeDeadState = false } = req.body;
  if (!pattern) {
    return res.status(400).json({ success: false, message: 'Regex pattern is required.' });
  }

  try {
    const startTime = performance.now();
    const nfa = regexToNFA(pattern);
    const dfa = nfaToDFA(nfa, includeDeadState);
    const table = generateTransitionTable(dfa, false);
    const timeMs = parseFloat((performance.now() - startTime).toFixed(3));

    return res.status(200).json({
      success: true,
      pattern,
      dfa,
      stateMappings: dfa.stateMappings,
      transitionTable: table,
      metadata: {
        algorithm: 'Subset Construction (Powerset & ε-Closure)',
        nfaStateCount: nfa.states.length,
        dfaStateCount: dfa.states.length,
        executionTimeMs: timeMs
      }
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: `Failed to construct DFA: ${err.message}`
    });
  }
};

/**
 * POST /api/automata/minimize
 */
export const minimizeAutomata = (req, res) => {
  const { pattern } = req.body;
  if (!pattern) {
    return res.status(400).json({ success: false, message: 'Regex pattern is required.' });
  }

  try {
    const startTime = performance.now();
    const nfa = regexToNFA(pattern);
    const dfa = nfaToDFA(nfa, false);
    const minimizationResult = minimizeDFA(dfa);
    const beforeTable = generateTransitionTable(dfa, false);
    const afterTable = generateTransitionTable(minimizationResult.minimizedDFA, false);
    const timeMs = parseFloat((performance.now() - startTime).toFixed(3));

    return res.status(200).json({
      success: true,
      pattern,
      originalDFA: dfa,
      minimizedDFA: minimizationResult.minimizedDFA,
      originalStateCount: minimizationResult.originalStateCount,
      minimizedStateCount: minimizationResult.minimizedStateCount,
      reductionPercentage: minimizationResult.reductionPercentage,
      partitionTrace: minimizationResult.partitionTrace,
      stateMappings: minimizationResult.stateMappings,
      tables: {
        before: beforeTable,
        after: afterTable
      },
      metadata: {
        algorithm: "Hopcroft's DFA Minimization",
        executionTimeMs: timeMs
      }
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: `Failed to minimize DFA: ${err.message}`
    });
  }
};

/**
 * POST /api/automata/simulate
 */
export const simulateAutomata = (req, res) => {
  const { pattern, inputString = '', minimize = true } = req.body;
  if (!pattern) {
    return res.status(400).json({ success: false, message: 'Regex pattern is required.' });
  }

  try {
    const startTime = performance.now();
    const nfa = regexToNFA(pattern);
    const rawDfa = nfaToDFA(nfa, false);
    const targetDfa = minimize ? minimizeDFA(rawDfa).minimizedDFA : rawDfa;

    // 1. Simulate Custom DFA
    const simulation = simulateDFA(targetDfa, inputString);

    // 2. Differential Testing: Compare custom DFA against trusted Native RegExp
    let cleanPattern = pattern.trim();
    if (cleanPattern.startsWith('^')) cleanPattern = cleanPattern.slice(1);
    if (cleanPattern.endsWith('$')) cleanPattern = cleanPattern.slice(0, -1);
    const nativeRegex = new RegExp(`^(${cleanPattern})$`);
    const nativeMatch = nativeRegex.test(inputString);

    // Verify parity
    const hasDifferentialParity = simulation.isValid === nativeMatch;

    const timeMs = parseFloat((performance.now() - startTime).toFixed(3));

    return res.status(200).json({
      success: true,
      pattern,
      inputString,
      isAccepted: simulation.isValid,
      finalState: simulation.finalState,
      executionTrace: simulation.executionTrace,
      failureIndex: simulation.failureIndex,
      failureReason: simulation.failureReason,
      differentialTesting: {
        customDfaResult: simulation.isValid,
        nativeRegexResult: nativeMatch,
        parityAchieved: hasDifferentialParity
      },
      dfa: targetDfa,
      metadata: {
        dfaStateCount: targetDfa.states.length,
        executionTimeMs: timeMs
      }
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: `Simulation error: ${err.message}`
    });
  }
};
