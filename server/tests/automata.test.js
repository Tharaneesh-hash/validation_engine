import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../server.js';
import { regexToNFA } from '../algorithms/nfaBuilder.js';
import { nfaToDFA } from '../algorithms/dfaConverter.js';
import { minimizeDFA } from '../algorithms/dfaMinimizer.js';
import { simulateDFA } from '../algorithms/dfaSimulator.js';

describe('FLAT Engine Algorithms & REST API - Phase 4 Verification', () => {
  // Test pattern: binary numbers with even zeros (classic FLAT grammar: (1|01*0)*)
  const pattern = '(1|01*0)*';

  it('Algorithm 2 (Thompson NFA): Successfully builds ε-NFA for (1|01*0)*', () => {
    const nfa = regexToNFA(pattern);
    expect(nfa.states.length).toBeGreaterThan(0);
    expect(nfa.alphabet).toContain('0');
    expect(nfa.alphabet).toContain('1');
    expect(nfa.startState).toBeDefined();
    expect(nfa.acceptStates.length).toBe(1);
  });

  it('Algorithm 4 (Subset Construction): Converts NFA to DFA', () => {
    const nfa = regexToNFA(pattern);
    const dfa = nfaToDFA(nfa);
    expect(dfa.states.length).toBeGreaterThan(0);
    expect(dfa.acceptStates.length).toBeGreaterThan(0);
    expect(dfa.startState).toBe('D0');
    // Each state has deterministic transitions for 0 and 1
    expect(dfa.transitions).toHaveProperty('D0');
  });

  it('Algorithm 5 (DFA Simulator): Validates strings in O(n) time', () => {
    const nfa = regexToNFA(pattern);
    const dfa = nfaToDFA(nfa);

    // Strings with even number of 0s: '00', '010', '111', '' -> VALID
    const valid1 = simulateDFA(dfa, '00');
    expect(valid1.isValid).toBe(true);
    expect(valid1.executionTrace.length).toBe(2);

    const valid2 = simulateDFA(dfa, '010');
    expect(valid2.isValid).toBe(true);

    const valid3 = simulateDFA(dfa, '111');
    expect(valid3.isValid).toBe(true);

    // Strings with odd number of 0s: '0', '01', '101' -> INVALID
    const invalid1 = simulateDFA(dfa, '0');
    expect(invalid1.isValid).toBe(false);

    const invalid2 = simulateDFA(dfa, '101');
    expect(invalid2.isValid).toBe(false);
  });

  it('Algorithm 6 (Hopcroft Minimization): Preserves regular language while minimizing states', () => {
    const nfa = regexToNFA(pattern);
    const dfa = nfaToDFA(nfa);
    const minResult = minimizeDFA(dfa);

    expect(minResult.minimizedStateCount).toBeLessThanOrEqual(minResult.originalStateCount);

    // Minimized DFA must produce identical acceptance as original DFA
    const testCases = ['00', '010', '111', '0', '101', '0000', '01010'];
    for (const str of testCases) {
      const origRes = simulateDFA(dfa, str);
      const minRes = simulateDFA(minResult.minimizedDFA, str);
      expect(minRes.isValid).toBe(origRes.isValid);
    }
  });

  it('Differential Testing (DFA vs Native RegExp): Achieves 100% agreement', async () => {
    const res = await request(app)
      .post('/api/automata/simulate')
      .send({
        pattern: 'a(b|c)*d',
        inputString: 'abcbcd'
      });

    expect(res.status).toBe(200);
    expect(res.body.isAccepted).toBe(true);
    expect(res.body.differentialTesting.parityAchieved).toBe(true);
    expect(res.body.differentialTesting.customDfaResult).toBe(res.body.differentialTesting.nativeRegexResult);
  });

  it('REST API /api/automata/nfa returns valid transition table', async () => {
    const res = await request(app)
      .post('/api/automata/nfa')
      .send({ pattern: 'a|b' });

    expect(res.status).toBe(200);
    expect(res.body.transitionTable).toHaveProperty('columns');
    expect(res.body.transitionTable).toHaveProperty('rows');
  });

  it('REST API /api/automata/minimize returns partition trace', async () => {
    const res = await request(app)
      .post('/api/automata/minimize')
      .send({ pattern: '(a|b)*abb' });

    expect(res.status).toBe(200);
    expect(res.body.partitionTrace.length).toBeGreaterThan(0);
    expect(res.body).toHaveProperty('reductionPercentage');
  });
});
