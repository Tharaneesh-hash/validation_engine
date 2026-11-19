import React, { useState, useEffect } from 'react';
import { 
  Cookie, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Info, 
  Lock, 
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import api from '../services/api';

export default function CookieInspector() {
  const [cookieInput, setCookieInput] = useState(
    'session_id=s_9f8e7d6c5b4a3120ff98e7d6c5b4a312; Domain=example.com; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=86400'
  );
  const [isSetCookie, setIsSetCookie] = useState(true);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const presets = [
    {
      label: 'Fully Hardened Session Cookie (Recommended)',
      val: 'sess_token=c8f2a1b9d4e7f0321a5b6c7d8e9f0123; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=3600',
      isSet: true
    },
    {
      label: 'Insecure Cookie (XSS & Eavesdropping Risk)',
      val: 'user_auth=plaintext_token_12345; Path=/',
      isSet: true
    },
    {
      label: 'CSRF Vulnerable (SameSite=None without Secure)',
      val: 'tracking_id=xyz7890; Path=/; SameSite=None',
      isSet: true
    },
    {
      label: 'RFC 1123 Expires Date Cookie',
      val: 'prefs=dark_mode=true; Path=/; Expires=Wed, 21 Oct 2026 07:28:00 GMT; Secure; HttpOnly; SameSite=Lax',
      isSet: true
    }
  ];

  const handleValidate = async (textToValidate) => {
    setLoading(true);
    try {
      const res = await api.post('/http/validate-cookie', {
        cookieString: textToValidate || cookieInput,
        isSetCookie
      });
      setResult(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleValidate(cookieInput);
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Banner */}
      <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Module 4 • RFC 6265 Security Specification
          </span>
          <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.7rem', fontWeight: '600', padding: '0.15rem 0.5rem', borderRadius: '9999px' }}>
            Automated Attribute Scanner
          </span>
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>
          HTTP Cookie & Set-Cookie Security Validator
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Deconstructs HTTP cookies into structural attributes, audits against RFC 6265 standards, and evaluates defenses against Cross-Site Scripting (XSS), Network Eavesdropping, and Cross-Site Request Forgery (CSRF).
        </p>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.3fr', gap: '1.5rem' }}>
        
        {/* Left Column: Input & Presets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Cookie size={18} color="#0284c7" />
              Cookie String Input
            </h3>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="cookieType"
                  checked={isSetCookie}
                  onChange={() => setIsSetCookie(true)}
                />
                Set-Cookie (Response / Server)
              </label>
              <label style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="cookieType"
                  checked={!isSetCookie}
                  onChange={() => setIsSetCookie(false)}
                />
                Cookie (Request / Client)
              </label>
            </div>

            <textarea
              rows={5}
              value={cookieInput}
              onChange={(e) => setCookieInput(e.target.value)}
              placeholder="session_id=xyz; Secure; HttpOnly; SameSite=Strict..."
              style={{
                width: '100%',
                padding: '0.75rem',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#0f172a',
                color: '#38bdf8',
                resize: 'vertical'
              }}
            />

            <button
              onClick={() => handleValidate(cookieInput)}
              disabled={loading}
              style={{
                width: '100%',
                marginTop: '0.75rem',
                background: '#0284c7',
                color: 'white',
                padding: '0.65rem 1rem',
                borderRadius: '6px',
                fontWeight: '600',
                fontSize: '0.825rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Analyze Cookie Security
            </button>
          </div>

          {/* Quick Presets */}
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.75rem' }}>
              Standard Testing Presets
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCookieInput(p.val);
                    setIsSetCookie(p.isSet);
                    handleValidate(p.val);
                  }}
                  style={{
                    textAlign: 'left',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    fontSize: '0.75rem',
                    color: '#334155',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#e2e8f0'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#f8fafc'}
                >
                  <div style={{ fontWeight: '600', color: '#0f172a' }}>{p.label}</div>
                  <div style={{ color: '#64748b', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '0.15rem' }}>
                    {p.val}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Security Analysis Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Status Overview Card */}
          {result && (
            <div style={{
              background: result.isValid && !result.hasSecurityWarnings ? '#ecfdf5' : result.hasSecurityWarnings ? '#fffbeb' : '#fef2f2',
              borderRadius: '12px',
              padding: '1.25rem',
              border: result.isValid && !result.hasSecurityWarnings ? '1px solid #a7f3d0' : result.hasSecurityWarnings ? '1px solid #fde68a' : '1px solid #fecaca'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {result.isValid && !result.hasSecurityWarnings ? (
                    <ShieldCheck size={24} color="#059669" />
                  ) : (
                    <ShieldAlert size={24} color={result.isValid ? '#d97706' : '#dc2626'} />
                  )}
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '800', color: result.isValid && !result.hasSecurityWarnings ? '#065f46' : result.isValid ? '#92400e' : '#991b1b' }}>
                      {result.isValid && !result.hasSecurityWarnings 
                        ? 'Hardened Production Cookie' 
                        : result.isValid 
                        ? 'Valid Syntax with Security Vulnerabilities' 
                        : 'Invalid / Malformed Cookie'}
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Name: <strong>{result.name}</strong> • Token Length: {result.rawLength} chars {result.isSessionCookie && '• (Session Token)'}
                    </span>
                  </div>
                </div>

                <span style={{
                  padding: '0.25rem 0.6rem',
                  borderRadius: '9999px',
                  fontWeight: '700',
                  fontSize: '0.75rem',
                  background: result.isValid && !result.hasSecurityWarnings ? '#10b981' : result.isValid ? '#f59e0b' : '#ef4444',
                  color: 'white'
                }}>
                  {result.isValid && !result.hasSecurityWarnings ? 'SECURE' : result.isValid ? 'WARNINGS' : 'REJECTED'}
                </span>
              </div>
            </div>
          )}

          {/* Security Warnings Panel */}
          {result?.warnings?.length > 0 && (
            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #fed7aa', borderLeft: '4px solid #f97316' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#c2410c', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <AlertTriangle size={16} />
                Security Hardening Warnings ({result.warnings.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {result.warnings.map((w, idx) => (
                  <div key={idx} style={{ fontSize: '0.75rem', background: '#fff7ed', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ffedd5' }}>
                    <div style={{ fontWeight: '600', color: '#9a3412' }}>{w.message}</div>
                    <div style={{ color: '#0369a1', marginTop: '0.2rem' }}>💡 Recommendation: {w.suggestion}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Structural Attribute Grid */}
          {result?.attributes && (
            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.75rem' }}>
                Deconstructed Cookie Attributes
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                {/* HttpOnly */}
                <div style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: result.attributes.httpOnly ? '#ecfdf5' : '#fef2f2' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600' }}>HTTPONLY ATTRIBUTE</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem', fontWeight: '700', fontSize: '0.85rem', color: result.attributes.httpOnly ? '#059669' : '#dc2626' }}>
                    {result.attributes.httpOnly ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                    {result.attributes.httpOnly ? 'Enabled (Protected from XSS)' : 'Missing (Script Accessible)'}
                  </div>
                </div>

                {/* Secure */}
                <div style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: result.attributes.secure ? '#ecfdf5' : '#fef2f2' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600' }}>SECURE ATTRIBUTE</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem', fontWeight: '700', fontSize: '0.85rem', color: result.attributes.secure ? '#059669' : '#dc2626' }}>
                    {result.attributes.secure ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                    {result.attributes.secure ? 'Enabled (HTTPS Only)' : 'Missing (Plaintext Transmission)'}
                  </div>
                </div>

                {/* SameSite */}
                <div style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: result.attributes.sameSite ? '#f8fafc' : '#fffbeb' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600' }}>SAMESITE POLICY</div>
                  <div style={{ marginTop: '0.2rem', fontWeight: '700', fontSize: '0.85rem', color: '#0f172a' }}>
                    {result.attributes.sameSite || <span style={{ color: '#d97706' }}>Not Specified (CSRF Risk)</span>}
                  </div>
                </div>

                {/* Max-Age / Expires */}
                <div style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600' }}>EXPIRATION / LIFETIME</div>
                  <div style={{ marginTop: '0.2rem', fontWeight: '700', fontSize: '0.85rem', color: '#0f172a' }}>
                    {result.attributes.maxAge ? `${result.attributes.maxAge} seconds` : result.attributes.expires ? result.attributes.expires : 'Session Cookie (Closes with Browser)'}
                  </div>
                </div>

                {/* Domain */}
                <div style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600' }}>DOMAIN SCOPE</div>
                  <div style={{ marginTop: '0.2rem', fontWeight: '700', fontSize: '0.85rem', color: '#0f172a' }}>
                    {result.attributes.domain || 'Origin Host Only'}
                  </div>
                </div>

                {/* Path */}
                <div style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600' }}>PATH SCOPE</div>
                  <div style={{ marginTop: '0.2rem', fontWeight: '700', fontSize: '0.85rem', color: '#0f172a' }}>
                    {result.attributes.path || '/'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Validation Errors If Malformed */}
          {result?.errors?.length > 0 && (
            <div style={{ background: '#fef2f2', borderRadius: '12px', padding: '1.25rem', border: '1px solid #fecaca' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#991b1b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <XCircle size={16} />
                RFC 6265 Syntax Rejections ({result.errors.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {result.errors.map((e, idx) => (
                  <div key={idx} style={{ fontSize: '0.75rem', color: '#7f1d1d' }}>
                    <strong>{e.field || 'General'}:</strong> {e.message}
                    {e.suggestion && <div style={{ color: '#0369a1', marginTop: '0.15rem' }}>Suggested: {e.suggestion}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
