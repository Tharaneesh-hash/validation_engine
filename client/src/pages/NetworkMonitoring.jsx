import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Wifi, 
  Server, 
  Radio, 
  RotateCcw, 
  Globe, 
  ShieldCheck, 
  Zap, 
  Cpu, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import api from '../services/api';

export default function NetworkMonitoring() {
  const [healthData, setHealthData] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pingLatency, setPingLatency] = useState(null);
  const [pingHistory, setPingHistory] = useState([]);

  const fetchNetworkData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/health');
      setHealthData(response.data.data);
      setRecentRequests(response.data.data?.network?.recentRequests || []);
      setPingLatency(response.latencyMs);

      setPingHistory(prev => [
        {
          id: Date.now(),
          latency: response.latencyMs,
          time: new Date().toLocaleTimeString()
        },
        ...prev.slice(0, 7)
      ]);
    } catch (err) {
      console.error('Network telemetry error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetworkData();
    const interval = setInterval(fetchNetworkData, 15000);
    return () => clearInterval(interval);
  }, []);

  const networkMetrics = healthData?.network || {};
  const serverInfo = healthData?.server || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '700', color: '#0f172a' }}>
            Computer Networks Telemetry & Latency Center
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
            Real-time HTTP/TCP request-response metrics, round-trip time (RTT), status code distributions, and client-server architecture analysis.
          </p>
        </div>

        <button
          onClick={fetchNetworkData}
          disabled={loading}
          className="btn btn-outline"
          style={{ fontSize: '0.8rem' }}
        >
          <RotateCcw size={14} className={loading ? 'animate-spin' : ''} />
          <span>{loading ? 'Pinging Server...' : 'Send HTTP Ping'}</span>
        </button>
      </div>

      {/* Network Overview Cards Grid */}
      <div className="grid-cols-4">
        {/* Card 1: Live Round-trip Time */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Live Round-trip Time (RTT)</span>
            <Wifi size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#10b981', margin: '0.35rem 0' }}>
            {pingLatency !== null ? `${pingLatency} ms` : '---'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Client TCP &rarr; HTTP/1.1 REST round-trip</div>
        </div>

        {/* Card 2: Server Processing Avg Latency */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Avg API Processing</span>
            <Zap size={18} color="#4f46e5" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#4f46e5', margin: '0.35rem 0' }}>
            {networkMetrics.averageLatencyMs || 0} ms
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Internal Express router latency</div>
        </div>

        {/* Card 3: Total Requests */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Total HTTP Requests</span>
            <Activity size={18} color="#0284c7" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#0284c7', margin: '0.35rem 0' }}>
            {networkMetrics.totalRequests || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Processed since server start</div>
        </div>

        {/* Card 4: Successful vs Failed */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Success / Failure</span>
            <Radio size={18} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#1e293b', margin: '0.35rem 0' }}>
            {networkMetrics.successfulRequests || 0} / {networkMetrics.failedRequests || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>2xx, 3xx vs 4xx, 5xx responses</div>
        </div>
      </div>

      {/* Protocol Stack & Academic Networks Architecture */}
      <div className="grid-cols-3">
        <div className="card" style={{ borderTop: '4px solid #4f46e5' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e1b4b', marginBottom: '0.5rem' }}>
            Application Layer (HTTP/1.1 & REST)
          </h4>
          <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
            Stateless client-server architecture communicating via standardized HTTP verbs (<code>GET</code>, <code>POST</code>, <code>DELETE</code>). 
            Payload serialized in application/json format with strict CORS and size constraints.
          </p>
        </div>

        <div style={{ borderTop: '4px solid #0284c7' }} className="card">
          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0c4a6e', marginBottom: '0.5rem' }}>
            Transport Layer (TCP / 3-Way Handshake)
          </h4>
          <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
            Reliable, ordered, connection-oriented packet transport. Operating on local loopback socket 
            <code>127.0.0.1:5000</code> with TCP stream buffering, flow control, and keep-alive socket reuse.
          </p>
        </div>

        <div style={{ borderTop: '4px solid #10b981' }} className="card">
          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#064e3b', marginBottom: '0.5rem' }}>
            Security & TLS Layer (HTTPS Ready)
          </h4>
          <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
            Ready for production TLS 1.3 cryptographic encapsulation. Eliminates credential leakage by omitting password 
            strings from network telemetry logs and enforcing HTTP status code semantics.
          </p>
        </div>
      </div>

      {/* Recent Network Request Logs & Status Code Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1.2fr)', gap: '1.5rem' }}>
        {/* Network Request Log Table */}
        <div className="card">
          <h3 className="card-title" style={{ fontSize: '1rem', marginBottom: '1rem' }}>
            <Activity size={18} color="var(--color-primary)" />
            Real-Time HTTP Traffic Stream (Last 50 Requests)
          </h3>

          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: '6px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--color-border)' }}>
                <tr>
                  <th style={{ padding: '0.55rem 0.75rem', fontWeight: '700' }}>Status</th>
                  <th style={{ padding: '0.55rem 0.75rem', fontWeight: '700' }}>Method</th>
                  <th style={{ padding: '0.55rem 0.75rem', fontWeight: '700' }}>Endpoint URL</th>
                  <th style={{ padding: '0.55rem 0.75rem', fontWeight: '700' }}>Duration</th>
                  <th style={{ padding: '0.55rem 0.75rem', fontWeight: '700' }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.length > 0 ? (
                  recentRequests.slice(0, 15).map((req) => (
                    <tr key={req.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '0.45rem 0.75rem' }}>
                        <span className={`badge ${req.statusCode < 400 ? 'badge-success' : 'badge-danger'}`}>
                          {req.statusCode}
                        </span>
                      </td>
                      <td style={{ padding: '0.45rem 0.75rem', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>
                        {req.method}
                      </td>
                      <td style={{ padding: '0.45rem 0.75rem', fontFamily: 'var(--font-mono)', color: '#334155' }}>
                        {req.path}
                      </td>
                      <td style={{ padding: '0.45rem 0.75rem', color: '#64748b' }}>
                        {req.durationMs} ms
                      </td>
                      <td style={{ padding: '0.45rem 0.75rem', color: '#94a3b8', fontSize: '0.75rem' }}>
                        {new Date(req.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8' }}>
                      No network requests tracked yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Server & Status Code Breakdown Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Status Code Distribution Card */}
          <div className="card">
            <h4 className="card-title" style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>
              <Radio size={18} color="var(--color-secondary)" />
              HTTP Status Code Distribution
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {networkMetrics.statusCodes && Object.entries(networkMetrics.statusCodes).map(([code, count]) => (
                <div key={code} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', padding: '0.35rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className={`badge ${parseInt(code) < 400 ? 'badge-success' : 'badge-danger'}`}>
                      {code}
                    </span>
                    <span style={{ color: '#475569' }}>
                      {code === '200' ? 'OK' : code === '422' ? 'Unprocessable Entity' : code === '404' ? 'Not Found' : 'Code ' + code}
                    </span>
                  </div>
                  <strong style={{ color: '#0f172a' }}>{count} reqs</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Host Resources Telemetry */}
          <div className="card">
            <h4 className="card-title" style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>
              <Cpu size={18} color="#8b5cf6" />
              Node.js Process Telemetry
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Platform:</span>
                <span style={{ fontWeight: '600' }}>{serverInfo.platform} ({serverInfo.arch})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>CPU Cores:</span>
                <span style={{ fontWeight: '600' }}>{serverInfo.cpuCount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Heap Memory:</span>
                <span style={{ fontWeight: '600' }}>{serverInfo.processMemoryUsageMB?.heapUsed} MB</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Server Uptime:</span>
                <span style={{ fontWeight: '600' }}>{healthData?.uptimeSeconds} seconds</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
