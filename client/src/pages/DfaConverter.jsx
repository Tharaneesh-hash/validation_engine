import React, { useState, useEffect } from 'react';
import { Cpu, BookOpen, Layers, CheckCircle2, ShieldAlert } from 'lucide-react';
import api from '../services/api';
import AutomataGraph from '../components/AutomataGraph';

const SAMPLE_REGEXES = [
  { label: 'Concat & Star: (a|b)*abb', pattern: '(a|b)*abb' },
  { label: 'Even Zeros: (1|01*0)*', pattern: '(1|01*0)*' },
  { label: 'Ends with 01: (0|1)*01', pattern: '(0|1)*01' },
  { label: 'Alternation: a|b', pattern: 'a|b' },
  { label: 'Identifier: [a-z][a-z0-9]*', pattern: '[a-z][a-z0-9]*' }
];

export default function DfaConverter() {
  const [pattern, setPattern] = useState('(a|b)*abb');
  const [includeDeadState, setIncludeDeadState] = useState(false);
  const [dfaData, setDfaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDFA = async (targetPattern = pattern, deadState = includeDeadState) => {
    if (!targetPattern.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/automata/dfa', {
        pattern: targetPattern.trim(),
        includeDeadState: deadState
      });
      setDfaData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDFA('(a|b)*abb', false);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '700', color: '#0f172a' }}>
            Subset Construction (NFA &rarr; DFA)
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
            Powerset ε-closure algorithm determining equivalent deterministic states from arbitrary non-deterministic automata.
          </p>
        </div>

        {dfaData?.metadata && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: '#64748b' }}>
            <span>NFA States: <strong>{dfaData.metadata.nfaStateCount}</strong></span>
            <span>&bull;</span>
            <span>DFA States: <strong>{dfaData.metadata.dfaStateCount}</strong></span>
            <span>&bull;</span>
            <span>Execution Time: <strong>{dfaData.metadata.executionTimeMs} ms</strong></span>
          </div>
        )}
      </div>

      {/* Preset Buttons */}
      <div className="card">
        <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
          Select Classical Grammar:
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {SAMPLE_REGEXES.map((s) => (
            <button
              key={s.label}
              onClick={() => {
                setPattern(s.pattern);
                fetchDFA(s.pattern, includeDeadState);
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

      {/* Controls & Input */}
      <div className="card">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e293b' }}>
            Regular Expression Pattern
          </label>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchDFA()}
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
              onClick={() => fetchDFA()}
              disabled={loading}
              className="btn btn-primary"
              style={{ padding: '0.65rem 1.25rem' }}
            >
              <Cpu size={16} />
              <span>{loading ? 'Converting...' : 'Construct DFA'}</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
            <input
              type="checkbox"
              id="deadStateCheck"
              checked={includeDeadState}
              onChange={(e) => {
                setIncludeDeadState(e.target.checked);
                fetchDFA(pattern, e.target.checked);
              }}
              style={{ cursor: 'pointer' }}
            />
            <label htmlFor="deadStateCheck" style={{ fontSize: '0.82rem', color: '#475569', cursor: 'pointer' }}>
              Include Dead/Trap State (<strong>D_dead</strong>) for complete transition functions
            </label>
          </div>
        </div>

        {error && (
          <div style={{ marginTop: '0.75rem', color: 'var(--color-danger)', fontSize: '0.85rem' }}>
            &bull; {error}
          </div>
        )}
      </div>

      {/* Visual Graph Card */}
      {dfaData?.dfa && (
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '1rem' }}>
            <Layers size={18} color="var(--color-primary)" />
            Generated Deterministic Finite Automaton (DFA)
          </h3>
          <AutomataGraph automaton={dfaData.dfa} isNFA={false} height={380} />
          <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: '#64748b', display: 'flex', gap: '1.5rem' }}>
            <span>Initial State: <strong>{dfaData.dfa.startState}</strong></span>
            <span>Accepting States: <strong>{dfaData.dfa.acceptStates.join(', ')}</strong></span>
            <span>Alphabet: <code>{JSON.stringify(dfaData.dfa.alphabet)}</code></span>
          </div>
        </div>
      )}

      {/* State Mappings & Transition Table Grid */}
      {dfaData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.8fr)', gap: '1.5rem' }}>
          {/* State Mappings Card */}
          <div className="card">
            <h3 className="card-title" style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>
              <CheckCircle2 size={18} color="var(--color-success)" />
              NFA &rarr; DFA State Compositions
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.75rem' }}>
              Each DFA state represents a subset of reachable NFA states under ε-closure:
            </p>
            <div style={{ border: '1px solid var(--color-border)', borderRadius: '6px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--color-border)' }}>
                  <tr>
                    <th style={{ padding: '0.5rem 0.75rem', fontWeight: '700' }}>DFA State</th>
                    <th style={{ padding: '0.5rem 0.75rem', fontWeight: '700' }}>NFA Subset States</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(dfaData.stateMappings || {}).map(([dfaState, nfaList]) => (
                    <tr key={dfaState} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '0.45rem 0.75rem', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>
                        {dfaState}
                      </td>
                      <td style={{ padding: '0.45rem 0.75rem', fontFamily: 'var(--font-mono)', color: '#4f46e5' }}>
                        &#123; {nfaList.join(', ')} &#125;
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Transition Table Card */}
          <div className="card">
            <h3 className="card-title" style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>
              <BookOpen size={18} color="var(--color-secondary)" />
              DFA Transition Table &delta;(D, a)
            </h3>
            <div style={{ overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: '6px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--color-border)' }}>
                  <tr>
                    {dfaData.transitionTable.columns.map((col) => (
                      <th key={col} style={{ padding: '0.55rem 0.75rem', fontWeight: '700', color: '#334155' }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dfaData.transitionTable.rows.map((row) => (
                    <tr key={row.state} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '0.5rem 0.75rem', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>
                        {row.state}
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem' }}>
                        <span className={`badge ${row.isStart && row.isAccept ? 'badge-primary' : row.isStart ? 'badge-warning' : row.isAccept ? 'badge-success' : 'badge-outline'}`}>
                          {row.type}
                        </span>
                      </td>
                      {dfaData.transitionTable.columns.slice(2).map((col) => (
                        <td key={col} style={{ padding: '0.5rem 0.75rem', fontFamily: 'var(--font-mono)', color: row.transitions[col] === '—' ? '#94a3b8' : '#0f172a' }}>
                          {row.transitions[col]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
