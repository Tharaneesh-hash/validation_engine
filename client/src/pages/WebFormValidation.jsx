import React, { useState, useMemo, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Info, 
  Send, 
  Sparkles, 
  Code, 
  Clock, 
  Server, 
  Check, 
  RotateCcw 
} from 'lucide-react';
import { FORM_VALIDATION_RULES, validateFormField } from '../utils/validationRules';
import api from '../services/api';

export default function WebFormValidation() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    username: '',
    password: '',
    confirmPassword: '',
    pincode: '',
    website: '',
    dob: ''
  });

  const [touched, setTouched] = useState({});
  const [showRegex, setShowRegex] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverResponse, setServerResponse] = useState(null);
  const [dbRulesLoaded, setDbRulesLoaded] = useState(false);

  useEffect(() => {
    api.get('/rules')
      .then(() => setDbRulesLoaded(true))
      .catch((err) => console.warn('Using local fallback rules:', err.message));
  }, []);

  // Validate all fields in real-time
  const fieldValidationStates = useMemo(() => {
    const states = {};
    for (const fieldId of Object.keys(FORM_VALIDATION_RULES)) {
      states[fieldId] = validateFormField(fieldId, formData[fieldId], formData);
    }
    return states;
  }, [formData]);

  // Check if whole form is valid
  const isFormValid = useMemo(() => {
    return Object.keys(FORM_VALIDATION_RULES).every(fieldId => {
      const rule = FORM_VALIDATION_RULES[fieldId];
      const state = fieldValidationStates[fieldId];
      if (rule.required && !formData[fieldId]) return false;
      return state.isValid;
    });
  }, [fieldValidationStates, formData]);

  const handleChange = (fieldId, value) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    setTouched(prev => ({ ...prev, [fieldId]: true }));
    setServerResponse(null);
  };

  const handleBlur = (fieldId) => {
    setTouched(prev => ({ ...prev, [fieldId]: true }));
  };

  const handleFillValidSample = () => {
    const validData = {
      fullName: 'Alan Turing',
      email: 'alan.turing@automata-engine.org',
      mobile: '9876543210',
      username: 'turing_1912',
      password: 'Enigma@1940Secure',
      confirmPassword: 'Enigma@1940Secure',
      pincode: '560001',
      website: 'https://enigma-project.org',
      dob: '1995-06-23'
    };
    setFormData(validData);
    const allTouched = {};
    Object.keys(validData).forEach(k => allTouched[k] = true);
    setTouched(allTouched);
    setServerResponse(null);
  };

  const handleFillInvalidSample = () => {
    const invalidData = {
      fullName: 'Alan 123 Turing', // Contains numbers
      email: 'invalid-email-no-at-sign.com', // Missing @
      mobile: '1234567890', // Starts with 1 instead of 6-9
      username: 'tu@', // Too short and has @
      password: 'short', // Lacks uppercase, numbers, symbols
      confirmPassword: 'mismatch_pass',
      pincode: '012345', // Starts with 0
      website: 'not-a-url', // Missing http://
      dob: '2030-01-01' // In the future
    };
    setFormData(invalidData);
    const allTouched = {};
    Object.keys(invalidData).forEach(k => allTouched[k] = true);
    setTouched(allTouched);
    setServerResponse(null);
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      email: '',
      mobile: '',
      username: '',
      password: '',
      confirmPassword: '',
      pincode: '',
      website: '',
      dob: ''
    });
    setTouched({});
    setServerResponse(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setSubmitting(true);
    setServerResponse(null);

    try {
      const response = await api.post('/validate', formData);
      setServerResponse({
        status: response.status,
        statusText: response.statusText,
        latencyMs: response.latencyMs,
        data: response.data
      });
    } catch (err) {
      setServerResponse({
        status: err.response?.status || 500,
        statusText: err.response?.statusText || 'Error',
        latencyMs: err.latencyMs || 0,
        data: err.response?.data || { message: err.message }
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Password criteria helper
  const passwordCriteria = useMemo(() => {
    const pwd = formData.password || '';
    return [
      { label: 'Minimum 8 characters', met: pwd.length >= 8 },
      { label: 'Uppercase letter (A-Z)', met: /[A-Z]/.test(pwd) },
      { label: 'Lowercase letter (a-z)', met: /[a-z]/.test(pwd) },
      { label: 'Digit (0-9)', met: /\d/.test(pwd) },
      { label: 'Special symbol (@$!%*?&)', met: /[@$!%*?&]/.test(pwd) }
    ];
  }, [formData.password]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header & Controls Banner */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: '700', color: '#0f172a' }}>
              Interactive Web Form Validation Engine
            </h2>
            {dbRulesLoaded && (
              <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
                DB Rules Synced
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
            Real-time dual-layer character scanning using formal regular grammars, DFA mapping, and backend verification.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button 
            type="button" 
            onClick={handleFillValidSample}
            className="btn btn-outline"
            style={{ fontSize: '0.8rem', color: '#059669', borderColor: '#a7f3d0', background: '#ecfdf5' }}
          >
            <Sparkles size={14} />
            <span>Load Valid Sample</span>
          </button>

          <button 
            type="button" 
            onClick={handleFillInvalidSample}
            className="btn btn-outline"
            style={{ fontSize: '0.8rem', color: '#dc2626', borderColor: '#fecaca', background: '#fef2f2' }}
          >
            <AlertCircle size={14} />
            <span>Load Invalid Sample</span>
          </button>

          <button 
            type="button" 
            onClick={handleReset}
            className="btn btn-outline"
            style={{ fontSize: '0.8rem' }}
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={() => setShowRegex(!showRegex)}
            className="btn btn-outline"
            style={{ fontSize: '0.8rem', background: showRegex ? '#eef2ff' : 'transparent' }}
          >
            <Code size={14} />
            <span>{showRegex ? 'Hide Regex Formulae' : 'Show Regex Formulae'}</span>
          </button>
        </div>
      </div>

      {/* Main Form & Response Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1.2fr)', gap: '1.5rem' }}>
        {/* Registration Form Card */}
        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {Object.keys(FORM_VALIDATION_RULES).map((fieldId) => {
              const rule = FORM_VALIDATION_RULES[fieldId];
              const value = formData[fieldId];
              const isTouched = touched[fieldId];
              const validation = fieldValidationStates[fieldId];

              // Determine border and icon state
              const showSuccess = isTouched && value.length > 0 && validation.isValid;
              const showError = isTouched && !validation.isValid;

              const borderColor = showError 
                ? 'var(--color-danger)' 
                : showSuccess 
                ? 'var(--color-success)' 
                : 'var(--color-border)';

              return (
                <div key={fieldId} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {/* Field Label & Indicators */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>
                      {rule.label} {rule.required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
                    </label>

                    {showRegex && rule.regexStr && (
                      <code style={{ fontSize: '0.7rem', color: '#4f46e5', background: '#eef2ff', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                        /{rule.regexStr}/
                      </code>
                    )}
                  </div>

                  {/* Input with trailing indicator */}
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type={rule.type}
                      value={value}
                      placeholder={rule.placeholder}
                      onChange={(e) => handleChange(fieldId, e.target.value)}
                      onBlur={() => handleBlur(fieldId)}
                      style={{
                        width: '100%',
                        padding: '0.6rem 2.5rem 0.6rem 0.85rem',
                        fontSize: '0.9rem',
                        borderRadius: 'var(--radius-sm)',
                        border: `1.5px solid ${borderColor}`,
                        outline: 'none',
                        transition: 'border-color 0.15s ease',
                        backgroundColor: showError ? '#fff5f5' : showSuccess ? '#f6fff9' : '#ffffff'
                      }}
                    />

                    {/* Status Icon */}
                    <div style={{ position: 'absolute', right: '0.75rem', pointerEvents: 'none' }}>
                      {showSuccess && <CheckCircle2 size={18} color="var(--color-success)" />}
                      {showError && <XCircle size={18} color="var(--color-danger)" />}
                    </div>
                  </div>

                  {/* Error Message & First Invalid Character Position */}
                  {showError && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.2rem',
                      marginTop: '0.15rem'
                    }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-danger)', fontWeight: '500' }}>
                        &bull; {validation.error}
                      </span>
                      {validation.firstInvalidChar && (
                        <span style={{
                          fontSize: '0.72rem',
                          color: '#b91c1c',
                          background: '#fee2e2',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          display: 'inline-block',
                          width: 'fit-content'
                        }}>
                          Violating Character: <code>'{validation.firstInvalidChar}'</code> at zero-based index <code>{validation.firstInvalidIndex}</code>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Password Strength Checklist */}
                  {fieldId === 'password' && isTouched && value.length > 0 && (
                    <div style={{
                      background: '#f8fafc',
                      border: '1px solid var(--color-border)',
                      borderRadius: '6px',
                      padding: '0.6rem 0.85rem',
                      marginTop: '0.25rem',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '0.35rem'
                    }}>
                      {passwordCriteria.map((c, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}>
                          {c.met ? (
                            <Check size={13} color="var(--color-success)" strokeWidth={3} />
                          ) : (
                            <div style={{ width: '13px', height: '13px', borderRadius: '50%', border: '1.5px solid #cbd5e1' }} />
                          )}
                          <span style={{ color: c.met ? 'var(--color-success)' : '#64748b', fontWeight: c.met ? '600' : '400' }}>
                            {c.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Academic Syntactic Note */}
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontStyle: 'italic' }}>
                    {rule.syntacticNote}
                  </div>
                </div>
              );
            })}

            {/* Submit Button */}
            <div style={{ marginTop: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
              <button
                type="submit"
                disabled={!isFormValid || submitting}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '0.95rem',
                  opacity: (!isFormValid || submitting) ? 0.6 : 1,
                  cursor: (!isFormValid || submitting) ? 'not-allowed' : 'pointer'
                }}
              >
                <Send size={16} />
                <span>
                  {submitting 
                    ? 'Transmitting to Express Server...' 
                    : isFormValid 
                    ? 'Submit Form (All Grammar Rules Satisfied)' 
                    : 'Submit Disabled (Correct Errors to Enable)'}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Server Response & Educational Info Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Server Response Card */}
          <div className="card">
            <h3 className="card-title" style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>
              <Server size={18} color="var(--color-primary)" />
              Server Dual-Layer Validation
            </h3>
            
            {serverResponse ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{
                  padding: '0.75rem',
                  borderRadius: '6px',
                  background: serverResponse.status === 200 ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
                  border: `1px solid ${serverResponse.status === 200 ? 'var(--color-success-border)' : 'var(--color-danger-border)'}`,
                  color: serverResponse.status === 200 ? 'var(--color-success)' : 'var(--color-danger)'
                }}>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                    HTTP {serverResponse.status} {serverResponse.statusText}
                  </div>
                  <div style={{ fontSize: '0.82rem' }}>
                    {serverResponse.data.message}
                  </div>
                </div>

                {/* Network & Execution Metadata */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  padding: '0.75rem',
                  fontSize: '0.78rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Client-Server RTT:</span>
                    <span style={{ fontWeight: '600' }}>{serverResponse.latencyMs} ms</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Server Algorithm Time:</span>
                    <span style={{ fontWeight: '600' }}>
                      {serverResponse.data.metadata?.executionTimeMs || '---'} ms
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Engine:</span>
                    <span style={{ fontWeight: '500' }}>Server ECMA RegExp DFA</span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                background: '#f8fafc',
                border: '1px dashed var(--color-border)',
                borderRadius: '6px',
                padding: '1.5rem',
                textAlign: 'center',
                color: '#64748b',
                fontSize: '0.85rem'
              }}>
                <Clock size={28} color="#94a3b8" style={{ margin: '0 auto 0.5rem auto' }} />
                <p>Fill out the registration form and click submit to trigger dual-layer verification over the REST API.</p>
              </div>
            )}
          </div>

          {/* Syntactic vs Semantic Distinction Card */}
          <div className="card" style={{ borderLeft: '4px solid #0284c7' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Info size={18} color="#0284c7" />
              <h4 style={{ fontSize: '0.92rem', fontWeight: '700', color: '#0c4a6e' }}>
                Syntactic Validation vs Real-World Verification
              </h4>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
              Regular expressions and Finite Automata perform purely <strong>syntactic grammar validation</strong>. 
              Acceptance of an email address like <code>turing@automata.edu</code> proves the string conforms to the 
              formal grammar of RFC 5322, but does <em>not</em> prove that domain DNS records exist or that a mail server will accept messages.
            </p>
          </div>

          {/* Form Rules Summary */}
          <div className="card">
            <h4 style={{ fontSize: '0.92rem', fontWeight: '700', marginBottom: '0.5rem', color: '#0f172a' }}>
              Formal Grammar Checklist
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Required Fields:</span>
                <span style={{ fontWeight: '600' }}>8 of 9</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Strict Boundary Checking:</span>
                <span style={{ fontWeight: '600', color: 'var(--color-success)' }}>Active</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>First-Failure Scanning:</span>
                <span style={{ fontWeight: '600', color: 'var(--color-success)' }}>Linear O(n)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
