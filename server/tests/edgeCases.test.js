import { describe, it, expect } from 'vitest';
import { regexToNFA } from '../algorithms/nfaBuilder.js';
import { nfaToDFA } from '../algorithms/dfaConverter.js';
import { minimizeDFA } from '../algorithms/dfaMinimizer.js';
import { simulateDFA } from '../algorithms/dfaSimulator.js';

describe('Deep Algorithm Edge Cases - Bug Audit', () => {
  const edgeCases = [
    { pattern: 'a', input: 'a', expected: true, desc: 'Single literal exact match' },
    { pattern: 'a', input: 'b', expected: false, desc: 'Single literal mismatch' },
    { pattern: 'a*', input: '', expected: true, desc: 'Kleene star empty string' },
    { pattern: 'a*', input: 'aaaa', expected: true, desc: 'Kleene star multiple occurrences' },
    { pattern: 'a+', input: '', expected: false, desc: 'Plus operator empty string' },
    { pattern: 'a+', input: 'a', expected: true, desc: 'Plus operator single match' },
    { pattern: 'a?', input: '', expected: true, desc: 'Optional operator empty string' },
    { pattern: 'a?', input: 'a', expected: true, desc: 'Optional operator single char' },
    { pattern: 'a?', input: 'aa', expected: false, desc: 'Optional operator overflow' },
    { pattern: '[0-9]+', input: '560001', expected: true, desc: 'Character class numbers' },
    { pattern: '[a-c]', input: 'b', expected: true, desc: 'Character class range match' },
    { pattern: '[a-c]', input: 'd', expected: false, desc: 'Character class range fail' },
    { pattern: '(a|b)*abb', input: 'ababb', expected: true, desc: 'Complex union and star match' },
    { pattern: '(a|b)*abb', input: 'abab', expected: false, desc: 'Complex union and star mismatch' },
    { pattern: '(1|01*0)*', input: '01011', expected: true, desc: 'Binary with even zeros' },
    { pattern: '(1|01*0)*', input: '101', expected: false, desc: 'Binary with odd zeros' }
  ];

  edgeCases.forEach((tc) => {
    it(`Edge case: ${tc.desc} (/${tc.pattern}/ with "${tc.input}")`, () => {
      const nfa = regexToNFA(tc.pattern);
      const dfa = nfaToDFA(nfa);
      const minDfa = minimizeDFA(dfa).minimizedDFA;
      const simResult = simulateDFA(minDfa, tc.input);

      expect(simResult.isValid).toBe(tc.expected);
    });
  });
});
