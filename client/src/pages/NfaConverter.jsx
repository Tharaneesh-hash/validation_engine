import React, { useState, useEffect } from 'react';
import { GitFork, Sparkles, BookOpen, Clock, Layers, ArrowRight } from 'lucide-react';
import api from '../services/api';
import AutomataGraph from '../components/AutomataGraph';

const SAMPLE_REGEXES = [
  { label: 'Union: a|b', pattern: 'a|b' },
  { label: 'Kleene Star: a*', pattern: 'a*' },
  { label: 'Concat & Star: (a|b)*abb', pattern: '(a|b)*abb' },
  { label: 'Even Zeros: (1|01*0)*', pattern: '(1|01*0)*' },
  { label: 'Identifier: [a-z][a-z0-9]*', pattern: '[a-z][a-z0-9]*' },
  { label: 'Binary Ends with 01: (0|1)*01', pattern: '(0|1)*01' }
];

export default function NfaConverter() {
  const [pattern, setPattern] = useState('(a|b)*abb');
  const [nfaData, setNfaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNFA = async (targetPattern = pattern) => {
    if (!targetPattern.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/automata/nfa', { pattern: targetPattern.trim() });
      setNfaData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNFA('(a|b)*abb');
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '700', color: '#0f172a' }}>
            Thompson's Construction (Regex &rarr; NFA)
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
            Inductive structural transformation converting regular expressions into an ε-NFA with a single initial and single accepting state.
          </p>
        </div>

        {nfaData?.metadata && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: '#64748b' }}>
            <span>States: <strong>{nfaData.metadata.stateCount}</strong></span>
            <span>&bull;</span>
            <span>Alphabet: <strong>{nfaData.metadata.alphabetCount}</strong></span>
            <span>&bull;</span>
            <span>Time: <strong>{nfaData.metadata.executionTimeMs} ms</strong></span>
          </div>
        )}
      </div>

      {/* Preset Buttons */}
      <div className="card">
        <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
          Select Classical Automata Grammar:
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {SAMPLE_REGEXES.map((s) => (
            <button
              key={s.label}
              onClick={() => {
                setPattern(s.pattern);
                fetchNFA(s.pattern);
              }}
              className="btn btn-outline"
              style={{
                fontSize: '0.78rem',
                padding: '0.35rem 0.65rem',
                borderColor: pattern === s.pattern ? 'var(--color-primary)' : 'var(--color-border)',
                background: pattern === s.pattern ? 'var(--color-primary-light)' : '#ffffff',
                color: pattern === s.pattern ? 'var(--color-primary)' : '#475569'
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="card">
        <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.4rem', display: 'block' }}>
          Regular Expression Pattern
        </label>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchNFA()}
            placeholder="e.g. (a|b)*abb"
            style={{
              flex: 1,
              padding: '0.65rem 0.85rem',
              fontSize: '0.95rem',
              fontFamily: 'var(--font-mono)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              outline: 'none'
            }}
          />
          <button
            onClick={() => fetchNFA()}
            disabled={loading}
            className="btn btn-primary"
            style={{ padding: '0.65rem 1.25rem' }}
          >
            <GitFork size={16} />
            <span>{loading ? 'Constructing...' : 'Build Thompson NFA'}</span>
          </button>
        </div>

        {error && (
          <div style={{ marginTop: '0.75rem', color: 'var(--color-danger)', fontSize: '0.85rem' }}>
            &bull; {error}
          </div>
        )}
      </div>

      {/* Visual Graph Card */}
      {nfaData?.nfa && (
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '1rem' }}>
            <Layers size={18} color="var(--color-primary)" />
            Generated ε-NFA State Transition Graph
          </h3>
          <AutomataGraph automaton={nfaData.nfa} isNFA={true} height={380} />
          <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: '#64748b', display: 'flex', gap: '1.5rem' }}>
            <span>Initial State: <strong>{nfaData.nfa.startState}</strong> (indicated by green arrow)</span>
            <span>Accepting State: <strong>{nfaData.nfa.acceptStates.join(', ')}</strong> (double border)</span>
            <span>Alphabet: <code>{JSON.stringify(nfaData.nfa.alphabet)}</code></span>
          </div>
        </div>
      )}

      {/* Transition Table Card */}
      {nfaData?.transitionTable && (
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '1rem' }}>
            <BookOpen size={18} color="var(--color-secondary)" />
            NFA Formal Transition Table &delta;(q, a)
          </h3>
          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: '6px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--color-border)' }}>
                <tr>
                  {nfaData.transitionTable.columns.map((col) => (
                    <th key={col} style={{ padding: '0.6rem 0.85rem', fontWeight: '700', color: '#334155' }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {nfaData.transitionTable.rows.map((row) => (
                  <tr key={row.state} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.55rem 0.85rem', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>
                      {row.state}
                    </td>
                    <td style={{ padding: '0.55rem 0.85rem' }}>
                      <span className={`badge ${row.isStart && row.isAccept ? 'badge-primary' : row.isStart ? 'badge-warning' : row.isAccept ? 'badge-success' : 'badge-outline'}`}>
                        {row.type}
                      </span>
                    </td>
                    {nfaData.transitionTable.columns.slice(2).map((col) => (
                      <td key={col} style={{ padding: '0.55rem 0.85rem', fontFamily: 'var(--font-mono)', color: row.transitions[col] === '—' ? '#94a3b8' : '#0f172a' }}>
                        {row.transitions[col]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
