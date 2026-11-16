import React, { useState, useEffect } from 'react';
import { PlayCircle, CheckCircle2, XCircle, Clock, Zap, BookOpen, Layers } from 'lucide-react';
import api from '../services/api';
import AutomataGraph from '../components/AutomataGraph';

const SIMULATION_PRESETS = [
  { pattern: '(a|b)*abb', testString: 'ababb', note: 'Valid string ending in abb' },
  { pattern: '(a|b)*abb', testString: 'abab', note: 'Invalid string ending in ab' },
  { pattern: '(1|01*0)*', testString: '01011', note: 'Valid binary with even 0s' },
  { pattern: '(1|01*0)*', testString: '101', note: 'Invalid binary with odd 0s' },
  { pattern: '(0|1)*01', testString: '1001', note: 'Valid binary ending in 01' }
];

export default function DfaSimulator() {
  const [pattern, setPattern] = useState('(a|b)*abb');
  const [inputString, setInputString] = useState('ababb');
  const [simulationData, setSimulationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runSimulation = async (pat = pattern, str = inputString) => {
    if (!pat.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/automata/simulate', {
        pattern: pat.trim(),
        inputString: str,
        minimize: true
      });
      setSimulationData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation('(a|b)*abb', 'ababb');
  }, []);

  const handleApplyPreset = (preset) => {
    setPattern(preset.pattern);
    setInputString(preset.testString);
    runSimulation(preset.pattern, preset.testString);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '700', color: '#0f172a' }}>
            DFA Execution & Simulation Engine
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
            Deterministic transition simulation applying &delta;(q, a) = q' in strict O(n) linear execution time with character-level trace inspection.
          </p>
        </div>

        {simulationData?.metadata && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: '#64748b' }}>
            <span>Time Complexity: <strong>O(n) Linear</strong></span>
            <span>&bull;</span>
            <span>Sim Time: <strong>{simulationData.metadata.executionTimeMs} ms</strong></span>
          </div>
        )}
      </div>

      {/* Presets */}
      <div className="card">
        <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
          Test Scenarios & Edge Cases:
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {SIMULATION_PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(p)}
              className="btn btn-outline"
              style={{
                fontSize: '0.78rem',
                padding: '0.35rem 0.65rem',
                borderColor: pattern === p.pattern && inputString === p.testString ? 'var(--color-primary)' : 'var(--color-border)',
                background: pattern === p.pattern && inputString === p.testString ? 'var(--color-primary-light)' : '#ffffff',
                color: pattern === p.pattern && inputString === p.testString ? 'var(--color-primary)' : '#475569'
              }}
            >
              <span>{p.pattern} &rarr; <code>"{p.testString}"</code></span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Configuration */}
      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.35rem', display: 'block' }}>
              DFA Regular Grammar Pattern
            </label>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="e.g. (a|b)*abb"
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                fontSize: '0.9rem',
                fontFamily: 'var(--font-mono)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.35rem', display: 'block' }}>
              Input Test String w &isin; &Sigma;*
            </label>
            <input
              type="text"
              value={inputString}
              onChange={(e) => setInputString(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runSimulation()}
              placeholder="Enter string to simulate..."
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                fontSize: '0.9rem',
                fontFamily: 'var(--font-mono)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                outline: 'none'
              }}
            />
          </div>

          <button
            onClick={() => runSimulation()}
            disabled={loading}
            className="btn btn-primary"
            style={{ padding: '0.65rem 1.4rem' }}
          >
            <PlayCircle size={16} />
            <span>{loading ? 'Simulating...' : 'Simulate DFA'}</span>
          </button>
        </div>

        {error && (
          <div style={{ marginTop: '0.75rem', color: 'var(--color-danger)', fontSize: '0.85rem' }}>
            &bull; {error}
          </div>
        )}
      </div>

      {/* Simulation Result Banner */}
      {simulationData && (
        <div style={{
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          background: simulationData.isAccepted ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
          border: `1.5px solid ${simulationData.isAccepted ? 'var(--color-success-border)' : 'var(--color-danger-border)'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {simulationData.isAccepted ? (
              <CheckCircle2 size={28} color="var(--color-success)" />
            ) : (
              <XCircle size={28} color="var(--color-danger)" />
            )}
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: '700', color: simulationData.isAccepted ? 'var(--color-success)' : 'var(--color-danger)' }}>
                {simulationData.isAccepted ? 'ACCEPTED BY AUTOMATON' : 'REJECTED BY AUTOMATON'}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.15rem' }}>
                Final State reached: <code>{simulationData.finalState || 'None (Halted)'}</code> &bull; 
                {simulationData.isAccepted 
                  ? ' Reached an accepting double-circle state.' 
                  : ` ${simulationData.failureReason || 'Failed to reach accepting state.'}`}
              </div>
            </div>
          </div>

          {/* Differential Parity Badge */}
          <div style={{
            background: '#ffffff',
            padding: '0.5rem 0.85rem',
            borderRadius: '6px',
            border: '1px solid var(--color-border)',
            fontSize: '0.8rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.2rem'
          }}>
            <div style={{ fontWeight: '600', color: '#1e293b' }}>Differential Parity Check:</div>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <span>DFA: <strong>{simulationData.differentialTesting?.customDfaResult ? 'ACCEPTED' : 'REJECTED'}</strong></span>
              <span>&bull;</span>
              <span>RegExp: <strong>{simulationData.differentialTesting?.nativeRegexResult ? 'ACCEPTED' : 'REJECTED'}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* Visual Graph & Execution Trace Grid */}
      {simulationData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: '1.5rem' }}>
          {/* DFA Graph Card */}
          <div className="card">
            <h3 className="card-title" style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>
              <Layers size={18} color="var(--color-primary)" />
              Automaton State Graph (Final State: {simulationData.finalState})
            </h3>
            <AutomataGraph
              automaton={simulationData.dfa}
              activeState={simulationData.finalState}
              height={320}
            />
          </div>

          {/* Execution Trace Table Card */}
          <div className="card">
            <h3 className="card-title" style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>
              <BookOpen size={18} color="var(--color-secondary)" />
              Step-by-Step Execution Trace Table
            </h3>
            <div style={{ overflowY: 'auto', maxHeight: '320px', border: '1px solid var(--color-border)', borderRadius: '6px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0 }}>
                  <tr>
                    <th style={{ padding: '0.45rem 0.65rem' }}>Step</th>
                    <th style={{ padding: '0.45rem 0.65rem' }}>&delta;(q, a)</th>
                    <th style={{ padding: '0.45rem 0.65rem' }}>Next State</th>
                    <th style={{ padding: '0.45rem 0.65rem' }}>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {simulationData.executionTrace?.map((step) => (
                    <tr key={step.step} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '0.45rem 0.65rem', fontWeight: '600' }}>#{step.step}</td>
                      <td style={{ padding: '0.45rem 0.65rem', fontFamily: 'var(--font-mono)' }}>
                        &delta;({step.fromState}, '{step.char}')
                      </td>
                      <td style={{ padding: '0.45rem 0.65rem', fontFamily: 'var(--font-mono)', fontWeight: '700', color: step.toState ? '#4f46e5' : '#ef4444' }}>
                        {step.toState || 'HALT'}
                      </td>
                      <td style={{ padding: '0.45rem 0.65rem' }}>
                        <span className={`badge ${step.isAccepting ? 'badge-success' : 'badge-outline'}`}>
                          {step.isAccepting ? 'Accepting' : 'Non-Accept'}
                        </span>
                      </td>
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
