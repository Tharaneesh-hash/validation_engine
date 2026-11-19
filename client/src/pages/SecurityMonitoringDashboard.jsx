import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Activity,
  Layers,
  ArrowRightLeft,
  Cookie,
  GitFork,
  Radio,
  Clock,
  ExternalLink,
  ChevronRight,
  Database
} from 'lucide-react';
import api from '../services/api';

export default function SecurityMonitoringDashboard() {
  const [stats, setStats] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'warnings' | 'activity' | 'sessions'

  const fetchDashboardData = async () => {
    try {
      const [statsRes, warnRes] = await Promise.all([
        api.get('/http/dashboard/stats').catch(() => ({ data: { success: false } })),
        api.get('/http/warnings').catch(() => ({ data: { success: false } }))
      ]);

      if (statsRes.data?.success) {
        setStats(statsRes.data.data);
      }
      if (warnRes.data?.success) {
        setWarnings(warnRes.data.warnings || []);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    if (!autoRefresh) return;
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const http = stats?.httpMetrics || {
    totalRequests: 0,
    totalResponses: 0,
    validHeaders: 0,
    invalidHeaders: 0,
    totalCookies: 0,
    validCookies: 0,
    invalidCookies: 0,
    headerComplianceRate: 100,
    cookieComplianceRate: 100
  };

  const sessions = stats?.sessionMetrics || {
    totalSessions: 0,
    issuedSessions: 0,
    activeSessions: 0,
    expiredSessions: 0,
    revokedSessions: 0,
    stateDistribution: { ISSUED: 0, ACTIVE: 0, EXPIRED: 0, REVOKED: 0 }
  };

  const recent = stats?.recentActivity || {
    requests: [],
    responses: [],
    headerValidations: [],
    cookies: [],
    warnings: []
  };

  const totalHeadersEvaluated = http.validHeaders + http.invalidHeaders;
  const totalCookiesEvaluated = http.validCookies + http.invalidCookies;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header Card */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <div style={{ padding: '0.4rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', color: '#ef4444' }}>
                <ShieldAlert size={22} />
              </div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>
                Security & Compliance Monitoring Dashboard
              </h1>
              <span className="badge" style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>
                Module 6
              </span>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
              Live telemetry for RFC 7230/7231 HTTP headers, RFC 6265 cookies, and DFA session state transitions.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="btn"
              style={{
                fontSize: '0.8rem',
                padding: '0.45rem 0.85rem',
                background: autoRefresh ? '#ecfdf5' : '#f1f5f9',
                color: autoRefresh ? '#059669' : '#64748b',
                border: '1px solid ' + (autoRefresh ? '#a7f3d0' : '#cbd5e1'),
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Radio size={14} className={autoRefresh ? 'pulse' : ''} />
              <span>{autoRefresh ? 'Live Auto-Poll (10s)' : 'Polling Paused'}</span>
            </button>

            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem', padding: '0.45rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Status Indicator Legend */}
        <div style={{
          marginTop: '1.25rem',
          padding: '0.75rem 1rem',
          background: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          flexWrap: 'wrap',
          fontSize: '0.8rem',
          color: '#475569'
        }}>
          <span style={{ fontWeight: '600', color: '#1e293b' }}>Visual Indicators:</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }}></span>
            <strong>Green:</strong> Valid / Compliant
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }}></span>
            <strong>Red:</strong> Malformed / Invalid
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }}></span>
            <strong>Orange:</strong> Security Warning
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#3b82f6' }}></span>
            <strong>Blue:</strong> Active Session
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#64748b' }}></span>
            <strong>Grey:</strong> Expired / Revoked
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        {/* Request / Response KPI */}
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #4f46e5' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: '700' }}>
                Traffic Inspected
              </span>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', marginTop: '0.2rem' }}>
                {http.totalRequests + http.totalResponses}
              </div>
            </div>
            <div style={{ padding: '0.5rem', background: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5', borderRadius: '8px' }}>
              <ArrowRightLeft size={20} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
            <span>Requests: <strong style={{ color: '#0f172a' }}>{http.totalRequests}</strong></span>
            <span>Responses: <strong style={{ color: '#0f172a' }}>{http.totalResponses}</strong></span>
          </div>
        </div>

        {/* Header Validation KPI */}
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: '700' }}>
                Headers Validated
              </span>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', marginTop: '0.2rem' }}>
                {totalHeadersEvaluated}
              </div>
            </div>
            <div style={{ padding: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '8px' }}>
              <ShieldCheck size={20} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <CheckCircle size={14} /> Valid: {http.validHeaders}
            </span>
            <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <XCircle size={14} /> Invalid: {http.invalidHeaders}
            </span>
          </div>
        </div>

        {/* Cookie Validation KPI */}
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: '700' }}>
                Cookies Inspected
              </span>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', marginTop: '0.2rem' }}>
                {http.totalCookies}
              </div>
            </div>
            <div style={{ padding: '0.5rem', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: '8px' }}>
              <Cookie size={20} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <CheckCircle size={14} /> Valid: {http.validCookies}
            </span>
            <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <XCircle size={14} /> Invalid: {http.invalidCookies}
            </span>
          </div>
        </div>

        {/* DFA Sessions KPI */}
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: '700' }}>
                DFA Session Pool
              </span>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', marginTop: '0.2rem' }}>
                {sessions.totalSessions}
              </div>
            </div>
            <div style={{ padding: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '8px' }}>
              <GitFork size={20} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#3b82f6', fontWeight: '600' }}>
              Active: {sessions.activeSessions}
            </span>
            <span style={{ color: '#64748b' }}>
              Terminated: {sessions.expiredSessions + sessions.revokedSessions}
            </span>
          </div>
        </div>
      </div>

      {/* DFA State Distribution Bar Chart */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.75rem' }}>
          DFA Session Cookie Finite-State Distribution
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
          Formal machine tracking: <code style={{ color: '#4f46e5' }}>ISSUED (q0)</code> → <code style={{ color: '#3b82f6' }}>ACTIVE (q1)</code> → <code style={{ color: '#64748b' }}>EXPIRED (q2) / REVOKED (q3)</code>. Terminated states are strictly absorbing.
        </p>

        {/* Horizontal Stacked Distribution Bar */}
        <div style={{ height: '24px', borderRadius: '8px', overflow: 'hidden', display: 'flex', background: '#e2e8f0', marginBottom: '1rem' }}>
          {sessions.totalSessions === 0 ? (
            <div style={{ width: '100%', background: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: '#475569' }}>
              No sessions simulated yet
            </div>
          ) : (
            <>
              {sessions.issuedSessions > 0 && (
                <div
                  title={`ISSUED: ${sessions.issuedSessions}`}
                  style={{
                    width: `${(sessions.issuedSessions / sessions.totalSessions) * 100}%`,
                    background: '#818cf8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.72rem',
                    fontWeight: '700'
                  }}
                >
                  {sessions.issuedSessions}
                </div>
              )}
              {sessions.activeSessions > 0 && (
                <div
                  title={`ACTIVE: ${sessions.activeSessions}`}
                  style={{
                    width: `${(sessions.activeSessions / sessions.totalSessions) * 100}%`,
                    background: '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.72rem',
                    fontWeight: '700'
                  }}
                >
                  {sessions.activeSessions}
                </div>
              )}
              {sessions.expiredSessions > 0 && (
                <div
                  title={`EXPIRED: ${sessions.expiredSessions}`}
                  style={{
                    width: `${(sessions.expiredSessions / sessions.totalSessions) * 100}%`,
                    background: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.72rem',
                    fontWeight: '700'
                  }}
                >
                  {sessions.expiredSessions}
                </div>
              )}
              {sessions.revokedSessions > 0 && (
                <div
                  title={`REVOKED: ${sessions.revokedSessions}`}
                  style={{
                    width: `${(sessions.revokedSessions / sessions.totalSessions) * 100}%`,
                    background: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.72rem',
                    fontWeight: '700'
                  }}
                >
                  {sessions.revokedSessions}
                </div>
              )}
            </>
          )}
        </div>

        {/* State Breakdown Badges */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
          <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #818cf8' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>q0: ISSUED</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1e293b' }}>{sessions.issuedSessions}</div>
            <span style={{ fontSize: '0.7rem', color: '#818cf8' }}>Awaiting first verified request</span>
          </div>

          <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>q1: ACTIVE (Blue)</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1e293b' }}>{sessions.activeSessions}</div>
            <span style={{ fontSize: '0.7rem', color: '#3b82f6' }}>Operational session</span>
          </div>

          <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #94a3b8' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>q2: EXPIRED (Grey)</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1e293b' }}>{sessions.expiredSessions}</div>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Absorbing dead state</span>
          </div>

          <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #64748b' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>q3: REVOKED (Grey)</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1e293b' }}>{sessions.revokedSessions}</div>
            <span style={{ fontSize: '0.7rem', color: '#ef4444' }}>Revoked (Non-revivable)</span>
          </div>
        </div>
      </div>

      {/* Tabs Selection */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', gap: '1.5rem', fontSize: '0.9rem', fontWeight: '600' }}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '0.6rem 0',
            border: 'none',
            background: 'none',
            color: activeTab === 'overview' ? '#4f46e5' : '#64748b',
            borderBottom: activeTab === 'overview' ? '2px solid #4f46e5' : '2px solid transparent',
            cursor: 'pointer'
          }}
        >
          Compliance Tables
        </button>

        <button
          onClick={() => setActiveTab('warnings')}
          style={{
            padding: '0.6rem 0',
            border: 'none',
            background: 'none',
            color: activeTab === 'warnings' ? '#ef4444' : '#64748b',
            borderBottom: activeTab === 'warnings' ? '2px solid #ef4444' : '2px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <span>Security Warnings</span>
          {warnings.length > 0 && (
            <span style={{ padding: '0.1rem 0.45rem', borderRadius: '999px', background: '#fee2e2', color: '#dc2626', fontSize: '0.72rem' }}>
              {warnings.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          style={{
            padding: '0.6rem 0',
            border: 'none',
            background: 'none',
            color: activeTab === 'activity' ? '#4f46e5' : '#64748b',
            borderBottom: activeTab === 'activity' ? '2px solid #4f46e5' : '2px solid transparent',
            cursor: 'pointer'
          }}
        >
          Real-Time Network Activity Feed
        </button>
      </div>

      {/* TAB CONTENT 1: Compliance Tables */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
          {/* Recent Header Validations Table */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowRightLeft size={16} color="#4f46e5" />
              Recent Header Validations (RFC 7230/7231)
            </h4>

            {recent.headerValidations.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                No HTTP headers intercepted yet. Send requests through the inspector to populate.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', fontSize: '0.82rem', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                      <th style={{ padding: '0.45rem 0.5rem' }}>Status</th>
                      <th style={{ padding: '0.45rem 0.5rem' }}>Header Name</th>
                      <th style={{ padding: '0.45rem 0.5rem' }}>Value (Truncated)</th>
                      <th style={{ padding: '0.45rem 0.5rem' }}>Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.headerValidations.map((h, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.45rem 0.5rem' }}>
                          <span style={{
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: '600',
                            background: h.isValid ? '#ecfdf5' : '#fef2f2',
                            color: h.isValid ? '#059669' : '#dc2626'
                          }}>
                            {h.isValid ? 'VALID' : 'INVALID'}
                          </span>
                        </td>
                        <td style={{ padding: '0.45rem 0.5rem', fontFamily: 'monospace', fontWeight: '600', color: '#0f172a' }}>
                          {h.headerName}
                        </td>
                        <td style={{ padding: '0.45rem 0.5rem', fontFamily: 'monospace', color: '#475569', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {h.headerValue}
                        </td>
                        <td style={{ padding: '0.45rem 0.5rem', color: '#64748b' }}>
                          {h.category || 'Standard'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Cookie Interceptions Table */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Cookie size={16} color="#f59e0b" />
              Recent Cookie Validations (RFC 6265)
            </h4>

            {recent.cookies.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                No cookies intercepted yet. Run cookie verification to populate.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', fontSize: '0.82rem', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                      <th style={{ padding: '0.45rem 0.5rem' }}>Status</th>
                      <th style={{ padding: '0.45rem 0.5rem' }}>Cookie Name</th>
                      <th style={{ padding: '0.45rem 0.5rem' }}>Flags</th>
                      <th style={{ padding: '0.45rem 0.5rem' }}>SameSite</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.cookies.map((c, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.45rem 0.5rem' }}>
                          <span style={{
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: '600',
                            background: c.isValid ? '#ecfdf5' : '#fef2f2',
                            color: c.isValid ? '#059669' : '#dc2626'
                          }}>
                            {c.isValid ? 'VALID' : 'INVALID'}
                          </span>
                        </td>
                        <td style={{ padding: '0.45rem 0.5rem', fontFamily: 'monospace', fontWeight: '600', color: '#0f172a' }}>
                          {c.name}
                        </td>
                        <td style={{ padding: '0.45rem 0.5rem' }}>
                          <div style={{ display: 'flex', gap: '0.2rem' }}>
                            <span style={{
                              padding: '0.1rem 0.3rem',
                              borderRadius: '3px',
                              fontSize: '0.68rem',
                              background: c.attributes?.httpOnly ? '#ecfdf5' : '#fef2f2',
                              color: c.attributes?.httpOnly ? '#059669' : '#dc2626'
                            }}>
                              HttpOnly
                            </span>
                            <span style={{
                              padding: '0.1rem 0.3rem',
                              borderRadius: '3px',
                              fontSize: '0.68rem',
                              background: c.attributes?.secure ? '#ecfdf5' : '#fef2f2',
                              color: c.attributes?.secure ? '#059669' : '#dc2626'
                            }}>
                              Secure
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '0.45rem 0.5rem', fontFamily: 'monospace', color: '#475569' }}>
                          {c.attributes?.sameSite || 'None'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: Security Warnings Table */}
      {activeTab === 'warnings' && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} color="#f59e0b" />
            Security & Compliance Warnings Audit Log
          </h4>

          {warnings.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#10b981' }}>
              <ShieldCheck size={36} style={{ margin: '0 auto 0.5rem' }} />
              <div style={{ fontWeight: '600', fontSize: '1rem' }}>No Security Warnings Detected</div>
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                All inspected HTTP traffic, cookies, and DFA session transitions satisfy security policies.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Severity</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Timestamp</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Warning Type</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Affected Target</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Security Explanation</th>
                  </tr>
                </thead>
                <tbody>
                  {warnings.map((w, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.6rem 0.75rem' }}>
                        <span style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          background: w.severity === 'high' ? '#fee2e2' : w.severity === 'medium' ? '#fef3c7' : '#f1f5f9',
                          color: w.severity === 'high' ? '#dc2626' : w.severity === 'medium' ? '#d97706' : '#475569'
                        }}>
                          {(w.severity || 'WARNING').toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem', color: '#64748b', fontSize: '0.75rem' }}>
                        {new Date(w.timestamp || Date.now()).toLocaleTimeString()}
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem', fontWeight: '600', color: '#0f172a' }}>
                        {w.warningType || 'Rule Breach'}
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem', fontFamily: 'monospace', color: '#4f46e5' }}>
                        {w.target || 'N/A'}
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem', color: '#334155' }}>
                        {w.message}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 3: Real-Time Network Activity Feed */}
      {activeTab === 'activity' && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} color="#0284c7" />
            Live HTTP Network Activity Stream
          </h4>

          {recent.requests.length === 0 && recent.responses.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
              No network packets captured yet. Initiate requests using the inspector or application endpoints.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {recent.requests.map((r, i) => (
                <div key={i} style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.82rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontWeight: '700',
                      fontSize: '0.72rem',
                      background: '#dbeafe',
                      color: '#1d4ed8'
                    }}>
                      {r.method}
                    </span>
                    <span style={{ fontFamily: 'monospace', fontWeight: '600', color: '#0f172a' }}>
                      {r.url}
                    </span>
                    <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
                      ({Object.keys(r.headers || {}).length} headers)
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.75rem' }}>
                    <Clock size={12} />
                    <span>{new Date(r.timestamp || Date.now()).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
