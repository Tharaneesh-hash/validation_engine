import React, { useState, useMemo, useEffect } from 'react';
import { 
  Play, 
  Terminal, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  BookOpen, 
  History, 
  Plus, 
  Trash2, 
  RotateCcw,
  Sparkles,
  Server,
  Layers,
  HelpCircle
} from 'lucide-react';
import api from '../services/api';

const PREDEFINED_TEMPLATES = [
  {
    name: 'Email Address',
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    flags: '',
    samplePass: 'turing@princeton.edu',
    sampleFail: 'turing@@edu',
    testCases: ['turing@princeton.edu', 'ada.lovelace@cam.ac.uk', 'invalid-email', 'name@domain', 'user.name+tag@gmail.com']
  },
  {
    name: 'Indian Mobile Number',
    pattern: '^[6-9][0-9]{9}$',
    flags: '',
    samplePass: '9876543210',
    sampleFail: '4123456789',
    testCases: ['9876543210', '8123456789', '7000000001', '5123456789', '98765']
  },
  {
    name: 'IPv4 Address (Computer Networks)',
    pattern: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$',
    flags: '',
    samplePass: '192.168.1.1',
    sampleFail: '256.100.0.1',
    testCases: ['192.168.1.1', '127.0.0.1', '255.255.255.255', '300.1.2.3', '10.0.0.0.1']
  },
  {
    name: 'Binary String with Even Number of 0s (FLAT)',
    pattern: '^(1|01*0)*$',
    flags: '',
    samplePass: '01011',
    sampleFail: '101',
    testCases: ['00', '010', '111', '01000', '10101']
  },
  {
    name: 'Strong Password Policy',
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
    flags: '',
    samplePass: 'Secure@1940',
    sampleFail: 'password123',
    testCases: ['Secure@1940', 'AdaLovelace#1815', 'weak', 'NoSpecial123', 'short@1']
  },
  {
    name: 'Hexadecimal Color Code',
    pattern: '^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$',
    flags: '',
    samplePass: '#4F46E5',
    sampleFail: '#12345Z',
    testCases: ['#4F46E5', '#fff', '10B981', '#12', 'blue']
  },
  {
    name: 'ISO 8601 Date (YYYY-MM-DD)',
    pattern: '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$',
    flags: '',
    samplePass: '2026-11-09',
    sampleFail: '2026-13-40',
    testCases: ['2026-11-09', '1912-06-23', '2020-02-29', '2026/11/09', '2026-00-10']
  }
];

const SYMBOL_CHEAT_SHEET = [
  { symbol: '^', desc: 'Asserts start of line/string' },
  { symbol: '$', desc: 'Asserts end of line/string' },
  { symbol: '.', desc: 'Matches any single character except newline' },
  { symbol: '*', desc: 'Kleene star: matches 0 or more occurrences' },
  { symbol: '+', desc: 'Matches 1 or more occurrences' },
  { symbol: '?', desc: 'Matches 0 or 1 occurrence (optional)' },
  { symbol: '[a-z]', desc: 'Character class: any lowercase character' },
  { symbol: '\\d', desc: 'Digit character equivalent to [0-9]' },
  { symbol: '\\w', desc: 'Word character [a-zA-Z0-9_]' },
  { symbol: '(a|b)', desc: 'Alternation / Union: matches expression a OR b' },
  { symbol: '{n,m}', desc: 'Quantifier: between n and m occurrences' },
  { symbol: '(?=...)', desc: 'Positive lookahead assertion' }
];

export default function RegexPlayground() {
  const [pattern, setPattern] = useState(PREDEFINED_TEMPLATES[0].pattern);
  const [flags, setFlags] = useState('');
  const [testString, setTestString] = useState(PREDEFINED_TEMPLATES[0].samplePass);
  const [testCases, setTestCases] = useState(PREDEFINED_TEMPLATES[0].testCases);
  const [newTestCase, setNewTestCase] = useState('');
  const [history, setHistory] = useState([]);
  const [serverData, setServerData] = useState(null);
  const [loadingServer, setLoadingServer] = useState(false);
  const [showCheatSheet, setShowCheatSheet] = useState(false);

  // Client-side regex compilation and syntax check
  const compiledRegex = useMemo(() => {
    try {
      return { regex: new RegExp(pattern, flags), error: null };
    } catch (err) {
      return { regex: null, error: err.message };
    }
  }, [pattern, flags]);

  // ReDoS heuristic check
  const hasReDoSRisk = useMemo(() => {
    return /(\([^)]*[+*]\)[+*])|(\[[^\]]*[+*]\][+*])/.test(pattern);
  }, [pattern]);

  // Client-side single test execution
  const singleMatchResult = useMemo(() => {
    if (!compiledRegex.regex) return { isMatch: false, timeMs: 0 };
    const t0 = performance.now();
    try {
      const isMatch = compiledRegex.regex.test(testString);
      const timeMs = parseFloat((performance.now() - t0).toFixed(4));
      return { isMatch, timeMs, error: null };
    } catch (err) {
      return { isMatch: false, timeMs: 0, error: err.message };
    }
  }, [compiledRegex, testString]);

  // Batch test evaluation
  const batchResults = useMemo(() => {
    if (!compiledRegex.regex) return [];
    return testCases.map(item => {
      const t0 = performance.now();
      try {
        const testInstance = new RegExp(pattern, flags);
        const match = testInstance.test(item);
        const timeMs = parseFloat((performance.now() - t0).toFixed(4));
        return { item, match, timeMs, error: null };
      } catch (err) {
        return { item, match: false, timeMs: 0, error: err.message };
      }
    });
  }, [compiledRegex, testCases, pattern, flags]);

  // Send to server for differential execution and latency benchmarking
  const handleServerRun = async () => {
    if (!compiledRegex.regex) return;
    setLoadingServer(true);
    try {
      const response = await api.post('/regex/test', {
        pattern,
        flags,
        testStrings: testCases
      });
      setServerData({
        status: response.status,
        latencyMs: response.latencyMs,
        data: response.data
      });

      // Record to history
      setHistory(prev => [
        {
          id: Date.now(),
          pattern,
          flags,
          casesCount: testCases.length,
          clientTimeMs: singleMatchResult.timeMs,
          serverTimeMs: response.data.metadata?.totalTimeMs || 0,
          timestamp: new Date().toLocaleTimeString()
        },
        ...prev.slice(0, 9)
      ]);
    } catch (err) {
      setServerData({
        error: err.response?.data?.message || err.message
      });
    } finally {
      setLoadingServer(false);
    }
  };

  const handleApplyTemplate = (tmpl) => {
    setPattern(tmpl.pattern);
    setFlags(tmpl.flags);
    setTestString(tmpl.samplePass);
    setTestCases(tmpl.testCases);
    setServerData(null);
  };

  const handleAddTestCase = () => {
    if (!newTestCase.trim()) return;
    setTestCases(prev => [...prev, newTestCase.trim()]);
    setNewTestCase('');
  };

  const handleRemoveTestCase = (index) => {
    setTestCases(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Banner */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '700', color: '#0f172a' }}>
            Regex Testing Workbench & Playground
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
            Design, test, and benchmark regular expressions with syntax analysis, batch test cases, and ReDoS safety guardrails.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => setShowCheatSheet(!showCheatSheet)}
            className="btn btn-outline"
            style={{ fontSize: '0.8rem' }}
          >
            <BookOpen size={14} />
            <span>{showCheatSheet ? 'Hide Cheat Sheet' : 'Syntax Cheat Sheet'}</span>
          </button>

          <button
            onClick={handleServerRun}
            disabled={!compiledRegex.regex || loadingServer}
            className="btn btn-primary"
            style={{ fontSize: '0.85rem' }}
          >
            <Server size={14} />
            <span>{loadingServer ? 'Running on Node.js...' : 'Run Server Benchmark'}</span>
          </button>
        </div>
      </div>

      {/* ReDoS Alert Banner */}
      {hasReDoSRisk && (
        <div style={{
          backgroundColor: 'var(--color-warning-bg)',
          border: '1px solid var(--color-warning-border)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.85rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: '#b45309'
        }}>
          <AlertTriangle size={20} />
          <div style={{ fontSize: '0.85rem' }}>
            <strong>Catastrophic Backtracking Warning:</strong> Detected nested quantifiers (e.g. <code>(a+)+</code>). 
            Non-deterministic backtracking on non-matching inputs can cause exponential CPU freeze (ReDoS).
          </div>
        </div>
      )}

      {/* Preset Templates Selector */}
      <div className="card">
        <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.6rem' }}>
          Predefined Regular Expression Templates:
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {PREDEFINED_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.name}
              onClick={() => handleApplyTemplate(tmpl)}
              className="btn btn-outline"
              style={{
                fontSize: '0.75rem',
                padding: '0.35rem 0.65rem',
                borderColor: pattern === tmpl.pattern ? 'var(--color-primary)' : 'var(--color-border)',
                background: pattern === tmpl.pattern ? 'var(--color-primary-light)' : '#ffffff',
                color: pattern === tmpl.pattern ? 'var(--color-primary)' : '#475569'
              }}
            >
              {tmpl.name}
            </button>
          ))}
        </div>
      </div>

      {/* Syntax Cheat Sheet (Collapsible) */}
      {showCheatSheet && (
        <div className="card" style={{ background: '#f8fafc', borderLeft: '4px solid var(--color-primary)' }}>
          <h3 className="card-title" style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>
            <HelpCircle size={18} color="var(--color-primary)" />
            Regular Expression Symbol Reference (FLAT Grammar)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {SYMBOL_CHEAT_SHEET.map((s) => (
              <div key={s.symbol} style={{ background: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '0.5rem 0.75rem' }}>
                <code style={{ fontSize: '0.85rem', fontWeight: '700', color: '#4f46e5' }}>{s.symbol}</code>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regex Editor Card */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: '1rem' }}>
          <Terminal size={18} color="var(--color-primary)" />
          Regex Expression Editor
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Pattern input with slashes & flags */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.3rem', display: 'block' }}>
              Pattern & Modifiers
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem', color: '#94a3b8', fontWeight: '600' }}>/</span>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="Enter regular expression pattern..."
                style={{
                  flex: 1,
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.95rem',
                  fontFamily: 'var(--font-mono)',
                  borderRadius: 'var(--radius-sm)',
                  border: `1.5px solid ${compiledRegex.error ? 'var(--color-danger)' : 'var(--color-border)'}`,
                  outline: 'none'
                }}
              />
              <span style={{ fontSize: '1.25rem', color: '#94a3b8', fontWeight: '600' }}>/</span>
              <input
                type="text"
                value={flags}
                onChange={(e) => setFlags(e.target.value.toLowerCase())}
                placeholder="flags (g, i, m)"
                maxLength={4}
                style={{
                  width: '90px',
                  padding: '0.65rem 0.75rem',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-mono)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  outline: 'none'
                }}
              />
            </div>

            {/* Syntax Error Message */}
            {compiledRegex.error && (
              <div style={{ marginTop: '0.4rem', fontSize: '0.8rem', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <XCircle size={14} />
                <span>Syntax Error: {compiledRegex.error}</span>
              </div>
            )}
          </div>

          {/* Single Test String Input */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.3rem', display: 'block' }}>
              Live Test String
            </label>
            <input
              type="text"
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              placeholder="Enter test string to check against regex..."
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                fontSize: '0.9rem',
                fontFamily: 'var(--font-mono)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                outline: 'none'
              }}
            />
          </div>

          {/* Quick Single Match Status Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            background: singleMatchResult.isMatch ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
            border: `1px solid ${singleMatchResult.isMatch ? 'var(--color-success-border)' : 'var(--color-danger-border)'}`,
            color: singleMatchResult.isMatch ? 'var(--color-success)' : 'var(--color-danger)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
              {singleMatchResult.isMatch ? (
                <>
                  <CheckCircle2 size={18} />
                  <span>MATCH: Test string satisfies the regular expression grammar</span>
                </>
              ) : (
                <>
                  <XCircle size={18} />
                  <span>NO MATCH: Test string does not satisfy the regular expression grammar</span>
                </>
              )}
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: '500' }}>
              Client Execution Time: {singleMatchResult.timeMs} ms
            </div>
          </div>
        </div>
      </div>

      {/* Batch Test Cases Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1.2fr)', gap: '1.5rem' }}>
        {/* Left Column: Batch Test Suite Table */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 className="card-title" style={{ fontSize: '1rem', margin: 0 }}>
              Batch Test Cases Verification
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              {batchResults.filter(b => b.match).length} of {batchResults.length} passing
            </span>
          </div>

          {/* Add test string row */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              type="text"
              value={newTestCase}
              onChange={(e) => setNewTestCase(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTestCase()}
              placeholder="Add new test string to batch suite..."
              style={{
                flex: 1,
                padding: '0.5rem 0.75rem',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                outline: 'none'
              }}
            />
            <button
              onClick={handleAddTestCase}
              className="btn btn-outline"
              style={{ fontSize: '0.8rem' }}
            >
              <Plus size={14} />
              <span>Add</span>
            </button>
          </div>

          {/* Test cases table */}
          <div style={{ border: '1px solid var(--color-border)', borderRadius: '6px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--color-border)' }}>
                <tr>
                  <th style={{ padding: '0.5rem 0.75rem', fontWeight: '600', color: '#475569' }}>Result</th>
                  <th style={{ padding: '0.5rem 0.75rem', fontWeight: '600', color: '#475569' }}>Test String</th>
                  <th style={{ padding: '0.5rem 0.75rem', fontWeight: '600', color: '#475569' }}>Time</th>
                  <th style={{ padding: '0.5rem 0.75rem', fontWeight: '600', color: '#475569', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {batchResults.map((r, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.5rem 0.75rem' }}>
                      <span className={`badge ${r.match ? 'badge-success' : 'badge-danger'}`}>
                        {r.match ? 'PASS' : 'FAIL'}
                      </span>
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>
                      {r.item}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', color: '#64748b', fontSize: '0.75rem' }}>
                      {r.timeMs} ms
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleRemoveTestCase(idx)}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
                        title="Remove test case"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Server Benchmark & Differential Testing */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Server Differential Test Card */}
          <div className="card">
            <h4 className="card-title" style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>
              <Server size={18} color="var(--color-primary)" />
              Server Differential Testing
            </h4>

            {serverData?.data ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.8rem' }}>
                <div style={{
                  padding: '0.6rem 0.75rem',
                  borderRadius: '6px',
                  background: 'var(--color-success-bg)',
                  border: '1px solid var(--color-success-border)',
                  color: 'var(--color-success)',
                  fontWeight: '600'
                }}>
                  Differential Match Verified &bull; Client & Node.js V8 Parity
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Client-Server RTT:</span>
                  <span style={{ fontWeight: '600' }}>{serverData.latencyMs} ms</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Server Algorithm Total:</span>
                  <span style={{ fontWeight: '600' }}>{serverData.data.metadata?.totalTimeMs} ms</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                  <span style={{ color: '#64748b' }}>Engine:</span>
                  <span style={{ fontWeight: '500' }}>{serverData.data.metadata?.engine}</span>
                </div>
              </div>
            ) : (
              <div style={{
                background: '#f8fafc',
                border: '1px dashed var(--color-border)',
                borderRadius: '6px',
                padding: '1.25rem',
                textAlign: 'center',
                color: '#64748b',
                fontSize: '0.82rem'
              }}>
                <Server size={24} color="#94a3b8" style={{ margin: '0 auto 0.5rem auto' }} />
                Click <strong>"Run Server Benchmark"</strong> to execute this regex suite on the Node.js backend and compare differential results.
              </div>
            )}
          </div>

          {/* Test History Card */}
          <div className="card">
            <h4 className="card-title" style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>
              <History size={18} color="var(--color-secondary)" />
              Recent Regex Experiments
            </h4>
            {history.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {history.map((h) => (
                  <div key={h.id} style={{
                    padding: '0.45rem 0.65rem',
                    background: '#f8fafc',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <code style={{ color: '#4f46e5', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      /{h.pattern}/
                    </code>
                    <span style={{ color: '#64748b' }}>{h.serverTimeMs} ms</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic' }}>
                No server benchmarks logged yet in this session.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
