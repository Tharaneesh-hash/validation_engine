import React, { useState, useEffect } from 'react';
import { 
  GitFork, 
  Cpu, 
  Play, 
  AlertOctagon, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldAlert, 
  ArrowRight, 
  RefreshCw, 
  Plus, 
  Ban, 
  Zap,
  RotateCcw
} from 'lucide-react';
import api from '../services/api';

export default function SessionCookieDFA() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [dfaGraph, setDfaGraph] = useState(null);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/sessions');
      const list = res.data.sessions || [];
      setSessions(list);
      if (list.length > 0 && !selectedSession) {
        setSelectedSession(list[0]);
      } else if (selectedSession) {
        const updated = list.find(s => s.sessionId === selectedSession.sessionId);
        if (updated) setSelectedSession(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDfaGraph = async () => {
    try {
      const res = await api.get('/sessions/dfa-graph');
      setDfaGraph(res.data.graph);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSessions();
    fetchDfaGraph();
  }, []);

  const handleCreateSession = async () => {
    setLoading(true);
    setActionMessage(null);
    try {
      const res = await api.post('/sessions/create', { ttlSeconds: 3600 });
      setActionMessage({ type: 'success', text: `New session cookie issued: ${res.data.session.sessionId}` });
      setSelectedSession(res.data.session);
      await fetchSessions();
    } catch (err) {
      setActionMessage({ type: 'error', text: err.response?.data?.error || err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleTransition = async (action) => {
    if (!selectedSession) return;
    setLoading(true);
    setActionMessage(null);

    let endpoint = '/sessions/activate';
    let reason = 'User authenticated request via session cookie.';

    if (action === 'EXPIRE') {
      endpoint = '/sessions/expire';
      reason = 'Session inactivity threshold reached / TTL elapsed.';
    } else if (action === 'REVOKE') {
      endpoint = '/sessions/revoke';
      reason = 'Security administrator manually revoked session token.';
    }

    try {
      const res = await api.post(endpoint, {
        sessionId: selectedSession.sessionId,
        reason
      });
      setActionMessage({ type: 'success', text: res.data.message });
      setSelectedSession(res.data.session);
      await fetchSessions();
    } catch (err) {
      const errData = err.response?.data;
      setActionMessage({
        type: 'error',
        text: errData?.error || err.message,
        explanation: errData?.explanation
      });
      if (errData?.session) {
        setSelectedSession(errData.session);
      }
      await fetchSessions();
    } finally {
      setLoading(false);
    }
  };

  // State colors
  const getStateColor = (st) => {
    switch (st) {
      case 'ISSUED': return '#f59e0b';
      case 'ACTIVE': return '#10b981';
      case 'EXPIRED': return '#64748b';
      case 'REVOKED': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Banner */}
      <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Module 5 • Finite Automata State Machine
              </span>
              <span style={{ background: '#f5f3ff', color: '#7c3aed', fontSize: '0.7rem', fontWeight: '600', padding: '0.15rem 0.5rem', borderRadius: '9999px' }}>
                Absorbing State Enforcement
              </span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>
              DFA-Based Session Cookie Lifecycle State Machine
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Formal deterministic state tracking: <code>M = (&#123;ISSUED, ACTIVE, EXPIRED, REVOKED&#125;, &#931;, &#948;, q0, &#123;ACTIVE&#125;)</code>. Enforces non-revival invariants and protects against session replay attacks.
            </p>
          </div>

          <button
            onClick={handleCreateSession}
            disabled={loading}
            style={{
              background: '#4f46e5',
              color: 'white',
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '0.85rem',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 2px 4px rgba(79,70,229,0.2)'
            }}
          >
            <Plus size={16} />
            Issue New Session Cookie
          </button>
        </div>
      </div>

      {/* Visual DFA State Diagram */}
      <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e293b', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Cpu size={18} color="#8b5cf6" />
          Interactive Finite State Transition Diagram
        </h3>

        {/* State Nodes Visualizer */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', position: 'relative' }}>
          
          {/* Node 1: ISSUED */}
          <div style={{
            background: selectedSession?.currentState === 'ISSUED' ? '#fffbeb' : '#f8fafc',
            border: selectedSession?.currentState === 'ISSUED' ? '3px solid #f59e0b' : '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.25rem',
            textAlign: 'center',
            boxShadow: selectedSession?.currentState === 'ISSUED' ? '0 0 15px rgba(245,158,11,0.25)' : 'none',
            transition: 'all 0.2s ease'
          }}>
            <div style={{ fontSize: '0.7rem', color: '#d97706', fontWeight: '800' }}>START STATE (q0)</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#b45309', margin: '0.25rem 0' }}>ISSUED</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Cookie created, awaiting first verified request.</div>
          </div>

          {/* Node 2: ACTIVE */}
          <div style={{
            background: selectedSession?.currentState === 'ACTIVE' ? '#ecfdf5' : '#f8fafc',
            border: selectedSession?.currentState === 'ACTIVE' ? '3px solid #10b981' : '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.25rem',
            textAlign: 'center',
            boxShadow: selectedSession?.currentState === 'ACTIVE' ? '0 0 15px rgba(16,185,129,0.25)' : 'none',
            transition: 'all 0.2s ease'
          }}>
            <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: '800' }}>ACCEPTING STATE (F)</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#047857', margin: '0.25rem 0' }}>ACTIVE</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Operational state. Requests authorized.</div>
          </div>

          {/* Node 3: EXPIRED */}
          <div style={{
            background: selectedSession?.currentState === 'EXPIRED' ? '#f1f5f9' : '#f8fafc',
            border: selectedSession?.currentState === 'EXPIRED' ? '3px solid #475569' : '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.25rem',
            textAlign: 'center',
            boxShadow: selectedSession?.currentState === 'EXPIRED' ? '0 0 15px rgba(71,85,105,0.25)' : 'none',
            transition: 'all 0.2s ease'
          }}>
            <div style={{ fontSize: '0.7rem', color: '#475569', fontWeight: '800' }}>TERMINAL ABSORBING</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#334155', margin: '0.25rem 0' }}>EXPIRED</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>TTL elapsed. Cannot transition back.</div>
          </div>

          {/* Node 4: REVOKED */}
          <div style={{
            background: selectedSession?.currentState === 'REVOKED' ? '#fef2f2' : '#f8fafc',
            border: selectedSession?.currentState === 'REVOKED' ? '3px solid #ef4444' : '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.25rem',
            textAlign: 'center',
            boxShadow: selectedSession?.currentState === 'REVOKED' ? '0 0 15px rgba(239,68,68,0.25)' : 'none',
            transition: 'all 0.2s ease'
          }}>
            <div style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: '800' }}>TERMINAL ABSORBING</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#b91c1c', margin: '0.25rem 0' }}>REVOKED</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Revoked by admin/logout. Irrevocable.</div>
          </div>
        </div>

        {/* Transition Table Legend */}
        <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-around', fontSize: '0.75rem', color: '#475569', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div><strong>&#948;(ISSUED, ACTIVATE)</strong> &rarr; ACTIVE</div>
          <div><strong>&#948;(ISSUED, EXPIRE)</strong> &rarr; EXPIRED</div>
          <div><strong>&#948;(ISSUED, REVOKE)</strong> &rarr; REVOKED</div>
          <div><strong>&#948;(ACTIVE, EXPIRE)</strong> &rarr; EXPIRED</div>
          <div><strong>&#948;(ACTIVE, REVOKE)</strong> &rarr; REVOKED</div>
          <div style={{ color: '#dc2626', fontWeight: '600' }}>&#948;(EXPIRED/REVOKED, *) &rarr; &#8709; (REJECTED)</div>
        </div>
      </div>

      {/* Interactive Controls & History */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: '1.5rem' }}>
        
        {/* Session Selection & Transition Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Active Session Card */}
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.75rem' }}>
              Target Session Details
            </h4>

            {selectedSession ? (
              <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div>
                  <span style={{ color: '#64748b' }}>Session ID:</span>
                  <div style={{ fontFamily: 'monospace', fontWeight: '700', color: '#0f172a', wordBreak: 'break-all' }}>
                    {selectedSession.sessionId}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Current DFA State:</span>
                  <span style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: '6px',
                    fontWeight: '800',
                    fontSize: '0.75rem',
                    background: getStateColor(selectedSession.currentState),
                    color: 'white'
                  }}>
                    {selectedSession.currentState}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Expires At:</span>
                  <span style={{ fontWeight: '600', color: '#334155' }}>
                    {new Date(selectedSession.expiresAt).toLocaleTimeString()}
                  </span>
                </div>

                {/* Transition Action Buttons */}
                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>
                    Execute State Transition (&#948;):
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleTransition('ACTIVATE')}
                      disabled={loading || selectedSession.currentState === 'ACTIVE' || selectedSession.currentState === 'EXPIRED' || selectedSession.currentState === 'REVOKED'}
                      style={{
                        background: '#10b981',
                        color: 'white',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        fontWeight: '600',
                        fontSize: '0.75rem',
                        border: 'none',
                        cursor: (selectedSession.currentState === 'ACTIVE' || selectedSession.currentState === 'EXPIRED' || selectedSession.currentState === 'REVOKED') ? 'not-allowed' : 'pointer',
                        opacity: (selectedSession.currentState === 'ACTIVE' || selectedSession.currentState === 'EXPIRED' || selectedSession.currentState === 'REVOKED') ? 0.4 : 1
                      }}
                    >
                      ACTIVATE (q1)
                    </button>

                    <button
                      onClick={() => handleTransition('EXPIRE')}
                      disabled={loading || selectedSession.currentState === 'EXPIRED' || selectedSession.currentState === 'REVOKED'}
                      style={{
                        background: '#64748b',
                        color: 'white',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        fontWeight: '600',
                        fontSize: '0.75rem',
                        border: 'none',
                        cursor: (selectedSession.currentState === 'EXPIRED' || selectedSession.currentState === 'REVOKED') ? 'not-allowed' : 'pointer',
                        opacity: (selectedSession.currentState === 'EXPIRED' || selectedSession.currentState === 'REVOKED') ? 0.4 : 1
                      }}
                    >
                      EXPIRE (q2)
                    </button>
                  </div>

                  <button
                    onClick={() => handleTransition('REVOKE')}
                    disabled={loading || selectedSession.currentState === 'REVOKED' || selectedSession.currentState === 'EXPIRED'}
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      fontWeight: '600',
                      fontSize: '0.75rem',
                      border: 'none',
                      cursor: (selectedSession.currentState === 'REVOKED' || selectedSession.currentState === 'EXPIRED') ? 'not-allowed' : 'pointer',
                      opacity: (selectedSession.currentState === 'REVOKED' || selectedSession.currentState === 'EXPIRED') ? 0.4 : 1
                    }}
                  >
                    REVOKE (q3)
                  </button>

                  {/* Illegal Transition Test Button */}
                  {(selectedSession.currentState === 'EXPIRED' || selectedSession.currentState === 'REVOKED') && (
                    <button
                      onClick={() => handleTransition('ACTIVATE')}
                      style={{
                        marginTop: '0.5rem',
                        background: '#fef2f2',
                        color: '#b91c1c',
                        border: '1px dashed #ef4444',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        fontWeight: '700',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      ⚠️ Test Illegal Transition: Re-Activate from {selectedSession.currentState}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ color: '#64748b', fontSize: '0.8rem', textAlign: 'center', padding: '1.5rem 0' }}>
                No active session selected. Issue a new session to begin.
              </div>
            )}
          </div>

          {/* Action Feedback Banner */}
          {actionMessage && (
            <div style={{
              background: actionMessage.type === 'success' ? '#ecfdf5' : '#fef2f2',
              border: actionMessage.type === 'success' ? '1px solid #a7f3d0' : '1px solid #fecaca',
              padding: '0.85rem',
              borderRadius: '8px',
              fontSize: '0.775rem'
            }}>
              <div style={{ fontWeight: '700', color: actionMessage.type === 'success' ? '#065f46' : '#991b1b', marginBottom: '0.2rem' }}>
                {actionMessage.type === 'success' ? 'Transition Accepted' : 'DFA Invariant Rejection'}
              </div>
              <div style={{ color: actionMessage.type === 'success' ? '#047857' : '#b91c1c' }}>
                {actionMessage.text}
              </div>
              {actionMessage.explanation && (
                <div style={{ color: '#0369a1', marginTop: '0.35rem', fontWeight: '500' }}>
                  {actionMessage.explanation}
                </div>
              )}
            </div>
          )}

          {/* Session Switcher List */}
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0', maxHeight: '250px', overflowY: 'auto' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>
              All Tracked Sessions ({sessions.length})
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {sessions.map((s) => (
                <div
                  key={s.sessionId}
                  onClick={() => setSelectedSession(s)}
                  style={{
                    padding: '0.5rem 0.6rem',
                    borderRadius: '6px',
                    background: selectedSession?.sessionId === s.sessionId ? '#ede9fe' : '#f8fafc',
                    border: selectedSession?.sessionId === s.sessionId ? '1px solid #c4b5fd' : '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    fontSize: '0.75rem'
                  }}
                >
                  <span style={{ fontFamily: 'monospace', fontWeight: '600', color: '#334155' }}>
                    {s.sessionId.substring(0, 16)}...
                  </span>
                  <span style={{
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    fontSize: '0.65rem',
                    fontWeight: '800',
                    background: getStateColor(s.currentState),
                    color: 'white'
                  }}>
                    {s.currentState}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Step-by-Step Transition Log */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={16} color="#8b5cf6" />
            Audit State Transition History for Current Session
          </h4>

          {selectedSession?.transitionHistory?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {selectedSession.transitionHistory.map((h, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: h.success ? '1px solid #e2e8f0' : '1px solid #fca5a5',
                    background: h.success ? '#ffffff' : '#fff1f2',
                    borderLeft: h.success ? '4px solid #8b5cf6' : '4px solid #ef4444'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: '700' }}>
                      {h.success ? (
                        <>
                          <span style={{ color: getStateColor(h.fromState || 'ISSUED') }}>{h.fromState || 'START'}</span>
                          <ArrowRight size={14} />
                          <span style={{ color: getStateColor(h.toState) }}>{h.toState}</span>
                          <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '400' }}>[Event: {h.event}]</span>
                        </>
                      ) : (
                        <span style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <XCircle size={14} /> REJECTED: {h.fromState} &rarr; {h.attemptedEvent}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                      {new Date(h.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                    {h.reason}
                  </div>

                  {h.explanation && (
                    <div style={{ fontSize: '0.7rem', color: '#b91c1c', marginTop: '0.2rem', fontWeight: '500' }}>
                      {h.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#64748b', fontSize: '0.8rem', textAlign: 'center', padding: '2rem 0' }}>
              No transitions recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
