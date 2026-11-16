import React, { useState, useEffect } from 'react';
import { Minimize2, TrendingDown, BookOpen, Layers, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import AutomataGraph from '../components/AutomataGraph';

const SAMPLE_REGEXES = [
  { label: 'Redundant States: (a|b)*abb', pattern: '(a|b)*abb' },
  { label: 'Even Zeros: (1|01*0)*', pattern: '(1|01*0)*' },
  { label: 'Ends with 01: (0|1)*01', pattern: '(0|1)*01' },
  { label: 'Union: a|b', pattern: 'a|b' }
];

export default function DfaMinimizer() {
  const [pattern, setPattern] = useState('(a|b)*abb');
  const [minimizeData, setMinimizeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMinimization = async (pat = pattern) => {
    if (!pat.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/automata/minimize', { pattern: pat.trim() });
      setMinimizeData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMinimization('(a|b)*abb');
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '700', color: '#0f172a' }}>
            Hopcroft's DFA Minimization Engine
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
            Partitions DFA states into equivalence classes, removing redundant states to synthesize the minimal canonical automaton.
          </p>
        </div>

        {minimizeData && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#059669',
              padding: '0.4rem 0.85rem',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              <TrendingDown size={16} />
              <span>State Reduction: {minimizeData.reductionPercentage}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Preset Selector */}
      <div className="card">
        <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
          Select Automata to Minimize:
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {SAMPLE_REGEXES.map((s) => (
            <button
              key={s.label}
              onClick={() => {
                setPattern(s.pattern);
                fetchMinimization(s.pattern);
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

      {/* Input */}
      <div className="card">
        <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.35rem', display: 'block' }}>
          Regular Expression Pattern
        </label>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchMinimization()}
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
            onClick={() => fetchMinimization()}
            disabled={loading}
            className="btn btn-primary"
            style={{ padding: '0.65rem 1.4rem' }}
          >
            <Minimize2 size={16} />
            <span>{loading ? 'Minimizing...' : 'Run Hopcroft Minimization'}</span>
          </button>
        </div>

        {error && (
          <div style={{ marginTop: '0.75rem', color: 'var(--color-danger)', fontSize: '0.85rem' }}>
            &bull; {error}
          </div>
        )}
      </div>

      {/* Metrics Row */}
      {minimizeData && (
        <div className="grid-cols-4">
          <div className="card">
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Original DFA States</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e293b', marginTop: '0.2rem' }}>
              {minimizeData.originalStateCount}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Subset Construction states</div>
          </div>

          <div className="card">
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Minimized DFA States</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#4f46e5', marginTop: '0.2rem' }}>
              {minimizeData.minimizedStateCount}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Canonical minimal states</div>
          </div>

          <div className="card">
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>States Eliminated</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#10b981', marginTop: '0.2rem' }}>
              {minimizeData.originalStateCount - minimizeData.minimizedStateCount}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Redundant / equivalent states</div>
          </div>

          <div className="card">
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Language Preserved</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0284c7', marginTop: '0.2rem' }}>
              100%
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>L(M) = L(M_min) identity</div>
          </div>
        </div>
      )}

      {/* Visual Minimized Graph Card */}
      {minimizeData?.minimizedDFA && (
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '1rem' }}>
            <Layers size={18} color="var(--color-primary)" />
            Minimized DFA Canonical State Machine
          </h3>
          <AutomataGraph automaton={minimizeData.minimizedDFA} isNFA={false} height={360} />
          <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: '#64748b', display: 'flex', gap: '1.5rem' }}>
            <span>Start State: <strong>{minimizeData.minimizedDFA.startState}</strong></span>
            <span>Accepting States: <strong>{minimizeData.minimizedDFA.acceptStates.join(', ')}</strong></span>
            <span>Alphabet: <code>{JSON.stringify(minimizeData.minimizedDFA.alphabet)}</code></span>
          </div>
        </div>
      )}

      {/* Partition Refinement Trace */}
      {minimizeData?.partitionTrace && (
        <div className="card">
          <h3 className="card-title" style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>
            <BookOpen size={18} color="var(--color-secondary)" />
            Hopcroft's Partition Refinement History
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {minimizeData.partitionTrace.map((trace) => (
              <div key={trace.step} style={{
                background: '#f8fafc',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                padding: '0.65rem 0.85rem',
                fontSize: '0.82rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: '700', color: '#1e293b' }}>Iteration #{trace.step}</span>
                  <span style={{ color: '#64748b' }}>{trace.description}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', color: '#4f46e5', fontSize: '0.8rem' }}>
                  P_{trace.step} = &#123; {trace.partitions.map(g => `{${g.join(', ')}}`).join(', ')} &#125;
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
