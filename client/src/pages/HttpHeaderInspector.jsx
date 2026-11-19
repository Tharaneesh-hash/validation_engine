import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Send, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  ArrowRightLeft, 
  Terminal, 
  Lock, 
  Layers,
  HelpCircle
} from 'lucide-react';
import api from '../services/api';

export default function HttpHeaderInspector() {
  const [activeMode, setActiveMode] = useState('request'); // 'request' | 'response' | 'custom'
  const [loading, setLoading] = useState(false);
  const [liveData, setLiveData] = useState(null);

  // Custom Header Test State
  const [headerName, setHeaderName] = useState('Authorization');
  const [headerValue, setHeaderValue] = useState('Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.t-IDcSemACt8x4iTMCda8Yhe3iZaWbvV5XKSTbuAn0M');
  const [customValidation, setCustomValidation] = useState(null);

  // Sample Request Header Testing
  const [requestHeadersText, setRequestHeadersText] = useState(
`Host: validationengine.onrender.com:443
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
Accept: application/json, text/plain, */*
Content-Type: application/json; charset=utf-8
Authorization: Bearer sample_secure_token_12345
Origin: https://validationenginedfa.vercel.app
Referer: https://validationenginedfa.vercel.app/header-inspector`
  );
  const [requestInspectionResult, setRequestInspectionResult] = useState(null);

  // Sample Response Header Testing
  const [responseHeadersText, setResponseHeadersText] = useState(
`Content-Type: application/json; charset=utf-8
Content-Length: 512
Cache-Control: no-store, no-cache, must-revalidate
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Strict-Transport-Security: max-age=31536000; includeSubDomains`
  );
  const [responseInspectionResult, setResponseInspectionResult] = useState(null);

  // Run live inspection on mount
  useEffect(() => {
    runRequestInspection();
  }, []);

  const runRequestInspection = async () => {
    setLoading(true);
    try {
      // Parse header text into key-value map
      const headersMap = {};
      requestHeadersText.split('\n').forEach(line => {
        const idx = line.indexOf(':');
        if (idx > 0) {
          const k = line.substring(0, idx).trim();
          const v = line.substring(idx + 1).trim();
          headersMap[k] = v;
        }
      });

      const res = await api.post('/http/inspect-request', {
        headers: headersMap,
        method: 'POST',
        url: '/api/http/inspect-request'
      });
      setRequestInspectionResult(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const runResponseInspection = async () => {
    setLoading(true);
    try {
      const headersMap = {};
      responseHeadersText.split('\n').forEach(line => {
        const idx = line.indexOf(':');
        if (idx > 0) {
          const k = line.substring(0, idx).trim();
          const v = line.substring(idx + 1).trim();
          headersMap[k] = v;
        }
      });

      const res = await api.post('/http/inspect-response', {
        headers: headersMap,
        statusCode: 200
      });
      setResponseInspectionResult(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const runSingleHeaderValidation = async () => {
    setLoading(true);
    try {
      const res = await api.post('/http/validate-header', {
        name: headerName.trim(),
        value: headerValue
      });
      setCustomValidation(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Banner */}
      <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Module 1 & 2 • RFC 7230 / RFC 7231
              </span>
              <span style={{ background: '#ecfdf5', color: '#059669', fontSize: '0.7rem', fontWeight: '600', padding: '0.15rem 0.5rem', borderRadius: '9999px' }}>
                Live Verification
              </span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>
              HTTP Request & Response Header Inspector
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Inspect and validate actual HTTP headers exchanged between client and server using regular expressions. Identifies malformed headers, CRLF injection, and missing security flags.
            </p>
          </div>

          {/* Navigation Pill Buttons */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '0.25rem', borderRadius: '8px', gap: '0.25rem' }}>
            <button
              onClick={() => { setActiveMode('request'); runRequestInspection(); }}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                fontSize: '0.825rem',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                background: activeMode === 'request' ? '#ffffff' : 'transparent',
                color: activeMode === 'request' ? '#4f46e5' : '#64748b',
                boxShadow: activeMode === 'request' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              Request Headers
            </button>
            <button
              onClick={() => { setActiveMode('response'); runResponseInspection(); }}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                fontSize: '0.825rem',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                background: activeMode === 'response' ? '#ffffff' : 'transparent',
                color: activeMode === 'response' ? '#4f46e5' : '#64748b',
                boxShadow: activeMode === 'response' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              Response Headers
            </button>
            <button
              onClick={() => { setActiveMode('custom'); runSingleHeaderValidation(); }}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                fontSize: '0.825rem',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                background: activeMode === 'custom' ? '#ffffff' : 'transparent',
                color: activeMode === 'custom' ? '#4f46e5' : '#64748b',
                boxShadow: activeMode === 'custom' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              Single Header Tester
            </button>
          </div>
        </div>
      </div>

      {/* MODE 1: Request Headers Inspection */}
      {activeMode === 'request' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
          {/* Input Panel */}
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Terminal size={18} color="#4f46e5" />
              Incoming Request Headers
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.75rem' }}>
              Format as <code>Header-Name: Value</code> (one per line). Edit or test malicious injection attacks.
            </p>
            <textarea
              rows={12}
              value={requestHeadersText}
              onChange={(e) => setRequestHeadersText(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#0f172a',
                color: '#38bdf8',
                resize: 'vertical'
              }}
            />
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={runRequestInspection}
                disabled={loading}
                style={{
                  flex: 1,
                  background: '#4f46e5',
                  color: 'white',
                  padding: '0.6rem 1rem',
                  borderRadius: '6px',
                  fontWeight: '600',
                  fontSize: '0.8rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                Validate Request Headers
              </button>
              <button
                onClick={() => setRequestHeadersText(
`Host: example.com
Content-Type: text/html
Content-Length: -50
X-Inject: test\r\nInjected: hack
User-Agent: sqlmap/1.5.2#stable`
                )}
                style={{
                  background: '#fee2e2',
                  color: '#dc2626',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '6px',
                  fontWeight: '600',
                  fontSize: '0.75rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Load Malformed Sample
              </button>
            </div>
          </div>

          {/* Results Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Quick Metrics */}
            {requestInspectionResult && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600' }}>TOTAL HEADERS</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>{requestInspectionResult.totalHeaders}</div>
                </div>
                <div style={{ background: '#ecfdf5', padding: '0.75rem', borderRadius: '8px', border: '1px solid #a7f3d0', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: '600' }}>VALID FORMAT</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#059669' }}>{requestInspectionResult.validCount}</div>
                </div>
                <div style={{ background: requestInspectionResult.invalidCount > 0 ? '#fef2f2' : '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: requestInspectionResult.invalidCount > 0 ? '1px solid #fecaca' : '1px solid #e2e8f0', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: requestInspectionResult.invalidCount > 0 ? '#dc2626' : '#64748b', fontWeight: '600' }}>MALFORMED</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: requestInspectionResult.invalidCount > 0 ? '#dc2626' : '#64748b' }}>{requestInspectionResult.invalidCount}</div>
                </div>
                <div style={{ background: '#fffbeb', padding: '0.75rem', borderRadius: '8px', border: '1px solid #fde68a', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: '#d97706', fontWeight: '600' }}>MISSING STANDARD</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#d97706' }}>{requestInspectionResult.missingStandardHeaders?.length || 0}</div>
                </div>
              </div>
            )}

            {/* Validation Table */}
            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.75rem' }}>
                Header-by-Header Validation Analysis
              </h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                    <th style={{ padding: '0.5rem' }}>Status</th>
                    <th style={{ padding: '0.5rem' }}>Header Name</th>
                    <th style={{ padding: '0.5rem' }}>Value</th>
                    <th style={{ padding: '0.5rem' }}>Diagnostics / Corrections</th>
                  </tr>
                </thead>
                <tbody>
                  {requestInspectionResult?.validations?.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: !item.isValid ? '#fff1f2' : item.warnings?.length > 0 ? '#fffbeb' : '#ffffff' }}>
                      <td style={{ padding: '0.6rem 0.5rem' }}>
                        {item.isValid ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#059669', fontWeight: '600', fontSize: '0.75rem' }}>
                            <CheckCircle2 size={16} /> Valid
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#dc2626', fontWeight: '600', fontSize: '0.75rem' }}>
                            <XCircle size={16} /> Malformed
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.6rem 0.5rem', fontWeight: '600', color: '#0f172a' }}>
                        {item.name}
                      </td>
                      <td style={{ padding: '0.6rem 0.5rem', fontFamily: 'monospace', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.value}
                      </td>
                      <td style={{ padding: '0.6rem 0.5rem' }}>
                        {item.errors?.map((err, eIdx) => (
                          <div key={eIdx} style={{ color: '#b91c1c', fontSize: '0.72rem', marginBottom: '0.25rem' }}>
                            &bull; {err.message}
                            <div style={{ color: '#0369a1', fontWeight: '500' }}>Suggested: {err.suggestion}</div>
                          </div>
                        ))}
                        {item.warnings?.map((warn, wIdx) => (
                          <div key={wIdx} style={{ color: '#d97706', fontSize: '0.72rem' }}>
                            &bull; ⚠️ {warn.message}
                          </div>
                        ))}
                        {item.isValid && item.warnings?.length === 0 && (
                          <span style={{ color: '#64748b', fontSize: '0.72rem' }}>Complies with RFC 7230 specification.</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: Response Headers Inspection */}
      {activeMode === 'response' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
          {/* Input Panel */}
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={18} color="#10b981" />
              Outgoing Response Headers
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.75rem' }}>
              Analyze actual HTTP response headers sent to browser clients. Evaluates critical defense-in-depth security flags.
            </p>
            <textarea
              rows={12}
              value={responseHeadersText}
              onChange={(e) => setResponseHeadersText(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#0f172a',
                color: '#4ade80',
                resize: 'vertical'
              }}
            />
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={runResponseInspection}
                disabled={loading}
                style={{
                  flex: 1,
                  background: '#10b981',
                  color: 'white',
                  padding: '0.6rem 1rem',
                  borderRadius: '6px',
                  fontWeight: '600',
                  fontSize: '0.8rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                Audit Response Security
              </button>
              <button
                onClick={() => setResponseHeadersText(
`Content-Type: text/plain
Server: Apache/2.4.41 (Ubuntu)
X-Powered-By: PHP/7.4.3`
                )}
                style={{
                  background: '#fee2e2',
                  color: '#dc2626',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '6px',
                  fontWeight: '600',
                  fontSize: '0.75rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Load Insecure Response
              </button>
            </div>
          </div>

          {/* Results Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Security Posture Assessment */}
            {responseInspectionResult && (
              <div style={{
                background: responseInspectionResult.isSecure ? '#ecfdf5' : '#fffbeb',
                border: responseInspectionResult.isSecure ? '1px solid #6ee7b7' : '1px solid #fde68a',
                borderRadius: '10px',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                {responseInspectionResult.isSecure ? (
                  <CheckCircle2 size={24} color="#059669" />
                ) : (
                  <AlertTriangle size={24} color="#d97706" />
                )}
                <div>
                  <div style={{ fontWeight: '700', color: responseInspectionResult.isSecure ? '#065f46' : '#92400e', fontSize: '0.9rem' }}>
                    {responseInspectionResult.isSecure ? 'Full Security Header Hardening Detected' : 'Security Hardening Deficiencies Detected'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: responseInspectionResult.isSecure ? '#047857' : '#b45309' }}>
                    {responseInspectionResult.missingSecurityHeaders.length === 0
                      ? 'All standard HTTP defense headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options) are present and properly formed.'
                      : `${responseInspectionResult.missingSecurityHeaders.length} recommended security headers are missing from the response.`}
                  </div>
                </div>
              </div>
            )}

            {/* Missing Security Headers Alert Cards */}
            {responseInspectionResult?.missingSecurityHeaders?.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {responseInspectionResult.missingSecurityHeaders.map((item, idx) => (
                  <div key={idx} style={{ background: '#ffffff', borderRadius: '8px', padding: '0.75rem', border: '1px solid #fed7aa', borderLeft: '4px solid #f97316' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#c2410c', fontWeight: '700', fontSize: '0.8rem' }}>
                      <AlertTriangle size={14} /> Missing: {item.header}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>{item.risk}</div>
                    <div style={{ fontSize: '0.7rem', color: '#0284c7', marginTop: '0.35rem', fontWeight: '600' }}>
                      Fix: {item.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Response Validation Table */}
            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.75rem' }}>
                Response Headers Verified
              </h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                    <th style={{ padding: '0.5rem' }}>Status</th>
                    <th style={{ padding: '0.5rem' }}>Header</th>
                    <th style={{ padding: '0.5rem' }}>Configured Value</th>
                    <th style={{ padding: '0.5rem' }}>Compliance Note</th>
                  </tr>
                </thead>
                <tbody>
                  {responseInspectionResult?.validations?.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.5rem' }}>
                        {item.isValid ? (
                          <span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: '600', fontSize: '0.75rem' }}>
                            <CheckCircle2 size={14} /> Valid
                          </span>
                        ) : (
                          <span style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: '600', fontSize: '0.75rem' }}>
                            <XCircle size={14} /> Invalid
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.5rem', fontWeight: '600' }}>{item.name}</td>
                      <td style={{ padding: '0.5rem', fontFamily: 'monospace' }}>{item.value}</td>
                      <td style={{ padding: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                        {item.errors?.[0]?.message || 'Valid according to HTTP specification.'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: Single Header Regex Tester */}
      {activeMode === 'custom' && (
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowRightLeft size={18} color="#4f46e5" />
            Interactive HTTP Header Regex Tester
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '0.35rem' }}>
                Header Name:
              </label>
              <input
                type="text"
                value={headerName}
                onChange={(e) => setHeaderName(e.target.value)}
                placeholder="e.g. Host, Content-Type, Authorization"
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.825rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '0.35rem' }}>
                Header Value:
              </label>
              <input
                type="text"
                value={headerValue}
                onChange={(e) => setHeaderValue(e.target.value)}
                placeholder="e.g. application/json; charset=utf-8"
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.825rem', fontFamily: 'monospace' }}
              />
            </div>
          </div>

          <button
            onClick={runSingleHeaderValidation}
            disabled={loading}
            style={{
              background: '#4f46e5',
              color: 'white',
              padding: '0.6rem 1.5rem',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '0.825rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Execute Regex Engine
          </button>

          {/* Detailed Verification Feedback */}
          {customValidation && (
            <div style={{ marginTop: '1.5rem', background: customValidation.isValid ? '#f0fdf4' : '#fef2f2', border: customValidation.isValid ? '1px solid #bbf7d0' : '1px solid #fecaca', borderRadius: '8px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                {customValidation.isValid ? (
                  <CheckCircle2 size={20} color="#16a34a" />
                ) : (
                  <XCircle size={20} color="#dc2626" />
                )}
                <span style={{ fontWeight: '700', fontSize: '0.95rem', color: customValidation.isValid ? '#15803d' : '#b91c1c' }}>
                  {customValidation.isValid ? 'Header Format Valid' : 'Malformed Header Format'}
                </span>
              </div>

              <div style={{ fontSize: '0.8rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div><strong>RFC Specification Rule:</strong> {customValidation.description}</div>
                <div><strong>Applied Regular Expression:</strong> <code style={{ background: 'rgba(0,0,0,0.06)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>{customValidation.appliedRegex}</code></div>
                {!customValidation.isValid && (
                  <div style={{ color: '#b91c1c', marginTop: '0.5rem' }}>
                    <strong>Error Diagnostic:</strong> {customValidation.errors?.[0]?.message}
                    <div style={{ color: '#0369a1', marginTop: '0.2rem' }}>
                      <strong>Suggested Correction:</strong> {customValidation.suggestion}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
