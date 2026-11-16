import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  XCircle,
  Layers,
  ArrowRight
} from 'lucide-react';
import api from '../services/api';
import AutomataGraph from '../components/AutomataGraph';

const VISUALIZER_PRESETS = [
  { pattern: '(a|b)*abb', testString: 'ababb', desc: 'Valid string ending in abb' },
  { pattern: '(a|b)*abb', testString: 'ababa', desc: 'Invalid string ending in ba' },
  { pattern: '(1|01*0)*', testString: '01011', desc: 'Binary with even zeros (valid)' },
  { pattern: '(1|01*0)*', testString: '101', desc: 'Binary with odd zeros (invalid)' }
];

export default function DfaVisualizer() {
  const [pattern, setPattern] = useState('(a|b)*abb');
  const [testString, setTestString] = useState('ababb');
  const [automataData, setAutomataData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Animation playback state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeedMs, setPlaybackSpeedMs] = useState(1000);
  const timerRef = useRef(null);

  const fetchSimulation = async (pat = pattern, str = testString) => {
    if (!pat.trim()) return;
    setLoading(true);
    setError(null);
    setIsPlaying(false);
    setCurrentStepIndex(0);

    try {
      const response = await api.post('/automata/simulate', {
        pattern: pat.trim(),
        inputString: str,
        minimize: true
      });
      setAutomataData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSimulation('(a|b)*abb', 'ababb');
  }, []);

  // Animation loop
  useEffect(() => {
    if (isPlaying && automataData?.executionTrace) {
      timerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < automataData.executionTrace.length) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, playbackSpeedMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, automataData, playbackSpeedMs]);

  // Compute active state and active transition based on currentStepIndex
  const currentStep = automataData?.executionTrace && currentStepIndex > 0
    ? automataData.executionTrace[currentStepIndex - 1]
    : null;

  const activeState = currentStep 
    ? currentStep.toState || currentStep.fromState 
    : automataData?.dfa?.startState;

  const activeTransition = currentStep
    ? { from: currentStep.fromState, to: currentStep.toState }
    : null;

  const isCompleted = automataData?.executionTrace 
    ? currentStepIndex >= automataData.executionTrace.length 
    : false;

  const handleStepNext = () => {
    if (automataData?.executionTrace && currentStepIndex < automataData.executionTrace.length) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handleStepPrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '700', color: '#0f172a' }}>
            Interactive DFA State Transition Visualizer
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
            Step-by-step playback animation highlighting the live active state, input tape symbol cursor, and transition trajectory.
          </p>
        </div>

        {automataData?.dfa && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: '#64748b' }}>
            <span>States: <strong>{automataData.dfa.states.length}</strong></span>
            <span>&bull;</span>
            <span>Start: <strong>{automataData.dfa.startState}</strong></span>
            <span>&bull;</span>
            <span>Accept: <strong>{automataData.dfa.acceptStates.join(', ')}</strong></span>
          </div>
        )}
      </div>

      {/* Preset Buttons */}
      <div className="card">
        <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
          Select Animation Demo Scenario:
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {VISUALIZER_PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPattern(p.pattern);
                setTestString(p.testString);
                fetchSimulation(p.pattern, p.testString);
              }}
              className="btn btn-outline"
              style={{
                fontSize: '0.78rem',
                padding: '0.35rem 0.65rem',
                borderColor: pattern === p.pattern && testString === p.testString ? 'var(--color-primary)' : 'var(--color-border)',
                background: pattern === p.pattern && testString === p.testString ? 'var(--color-primary-light)' : '#ffffff',
                color: pattern === p.pattern && testString === p.testString ? 'var(--color-primary)' : '#475569'
              }}
            >
              <span>{p.pattern} &bull; <code>"{p.testString}"</code></span>
            </button>
          ))}
        </div>
      </div>

      {/* Inputs */}
      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.35rem', display: 'block' }}>
              Regular Expression Pattern
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
              Input String to Animate
            </label>
            <input
              type="text"
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchSimulation()}
              placeholder="Enter string..."
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
            onClick={() => fetchSimulation()}
            disabled={loading}
            className="btn btn-primary"
            style={{ padding: '0.65rem 1.4rem' }}
          >
            <span>Load Simulation</span>
          </button>
        </div>

        {error && (
          <div style={{ marginTop: '0.75rem', color: 'var(--color-danger)', fontSize: '0.85rem' }}>
            &bull; {error}
          </div>
        )}
      </div>

      {/* Interactive Playback Control Bar */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        {/* Playback Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={!automataData || isCompleted}
            className="btn btn-primary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            <span>{isPlaying ? 'Pause' : isCompleted ? 'Finished' : 'Animate Execution'}</span>
          </button>

          <button
            onClick={handleStepPrev}
            disabled={currentStepIndex === 0}
            className="btn btn-outline"
            style={{ padding: '0.5rem 0.75rem' }}
            title="Step Backward"
          >
            <SkipBack size={16} />
          </button>

          <button
            onClick={handleStepNext}
            disabled={isCompleted || !automataData}
            className="btn btn-outline"
            style={{ padding: '0.5rem 0.75rem' }}
            title="Step Forward"
          >
            <SkipForward size={16} />
          </button>

          <button
            onClick={handleReset}
            className="btn btn-outline"
            style={{ padding: '0.5rem 0.75rem' }}
            title="Reset"
          >
            <RotateCcw size={16} />
          </button>

          <span style={{ fontSize: '0.82rem', color: '#64748b', marginLeft: '0.5rem' }}>
            Step: <strong>{currentStepIndex}</strong> of {automataData?.executionTrace?.length || 0}
          </span>
        </div>

        {/* Speed Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#475569' }}>
          <span>Speed:</span>
          {[
            { label: '0.5x', ms: 1500 },
            { label: '1.0x', ms: 1000 },
            { label: '2.0x', ms: 500 }
          ].map((s) => (
            <button
              key={s.label}
              onClick={() => setPlaybackSpeedMs(s.ms)}
              style={{
                border: '1px solid var(--color-border)',
                background: playbackSpeedMs === s.ms ? '#4f46e5' : '#ffffff',
                color: playbackSpeedMs === s.ms ? '#ffffff' : '#475569',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Tape & Current Step Explanation */}
      {automataData && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Tape Visualizer */}
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b', marginBottom: '0.5rem' }}>
              Automaton Input Tape & Head Position:
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', padding: '0.5rem 0' }}>
              {testString.split('').map((char, idx) => {
                const isConsumed = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex - 1;
                const isNext = idx === currentStepIndex;

                let bg = '#ffffff';
                let border = '1px solid var(--color-border)';
                let color = '#0f172a';

                if (isCurrent) {
                  bg = '#4f46e5';
                  border = '1px solid #4f46e5';
                  color = '#ffffff';
                } else if (isConsumed) {
                  bg = '#ecfdf5';
                  border = '1px solid #a7f3d0';
                  color = '#059669';
                }

                return (
                  <div
                    key={idx}
                    style={{
                      width: '40px',
                      height: '42px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: bg,
                      border,
                      color,
                      borderRadius: '6px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: '700',
                      fontSize: '1rem',
                      boxShadow: isCurrent ? '0 0 10px rgba(79, 70, 229, 0.4)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span>{char}</span>
                    <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>{idx}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Explanation Callout */}
          <div style={{
            background: isCompleted 
              ? (automataData.isAccepted ? 'var(--color-success-bg)' : 'var(--color-danger-bg)')
              : '#f8fafc',
            border: `1px solid ${isCompleted ? (automataData.isAccepted ? 'var(--color-success-border)' : 'var(--color-danger-border)') : 'var(--color-border)'}`,
            borderRadius: '6px',
            padding: '0.75rem 1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#0f172a' }}>
                Active State: <code>{activeState}</code>
              </span>
              <p style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.15rem' }}>
                {currentStep ? currentStep.explanation : `Simulation starting at initial state ${automataData.dfa?.startState}.`}
              </p>
            </div>

            {isCompleted && (
              <span className={`badge ${automataData.isAccepted ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.85rem' }}>
                {automataData.isAccepted ? 'ACCEPTED' : 'REJECTED'}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Animated SVG Graph */}
      {automataData?.dfa && (
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '1rem' }}>
            <Layers size={18} color="var(--color-primary)" />
            Live State Machine Diagram (Active State Glowing)
          </h3>
          <AutomataGraph
            automaton={automataData.dfa}
            activeState={activeState}
            activeTransition={activeTransition}
            height={380}
          />
        </div>
      )}
    </div>
  );
}
