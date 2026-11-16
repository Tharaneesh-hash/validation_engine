import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Trash2, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Download
} from 'lucide-react';
import api from '../services/api';

export default function ValidationHistory() {
  const [history, setHistory] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, pages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterField, setFilterField] = useState('all');
  const [filterValid, setFilterValid] = useState('all');

  const fetchHistory = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: pagination.limit
      };
      if (search.trim()) params.search = search.trim();
      if (filterField !== 'all') params.fieldId = filterField;
      if (filterValid !== 'all') params.isValid = filterValid;

      const response = await api.get('/history', { params });
      setHistory(response.data.data || []);
      setPagination(response.data.pagination || { page: 1, limit: 15, total: 0, pages: 1 });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(1);
  }, [filterField, filterValid]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHistory(1);
  };

  const handleDeleteItem = async (id) => {
    try {
      await api.delete(`/history/${id}`);
      fetchHistory(pagination.page);
    } catch (err) {
      alert(`Failed to delete record: ${err.message}`);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to purge all validation audit records?')) {
      try {
        await api.delete('/history');
        fetchHistory(1);
      } catch (err) {
        alert(`Failed to clear records: ${err.message}`);
      }
    }
  };

  const handleExportCSV = () => {
    if (history.length === 0) return alert('No history data to export.');
    const headers = ['Status', 'FieldID', 'RuleName', 'Category', 'ErrorMessage', 'ExecutionTimeMs', 'Timestamp'];
    const rows = history.map(r => [
      r.isValid ? 'VALID' : 'INVALID',
      r.fieldId,
      `"${r.ruleName}"`,
      r.errorCategory,
      `"${(r.errorMessage || '').replace(/"/g, '""')}"`,
      r.executionTimeMs,
      r.createdAt || ''
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `validation_audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    if (history.length === 0) return alert('No history data to export.');
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `validation_audit_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.removeChild(downloadAnchor);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '700', color: '#0f172a' }}>
            Validation Audit History & MongoDB Persistence
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
            Searchable, paginated audit records stored in MongoDB Atlas without sensitive credential payload logging.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleExportCSV}
            className="btn btn-outline"
            style={{ fontSize: '0.8rem', color: '#0284c7', borderColor: '#bae6fd', background: '#f0f9ff' }}
            title="Download audit records as CSV"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="btn btn-outline"
            style={{ fontSize: '0.8rem', color: '#4f46e5', borderColor: '#c7d2fe', background: '#eef2ff' }}
            title="Download audit records as JSON"
          >
            <Download size={14} />
            <span>Export JSON</span>
          </button>

          <button
            onClick={() => fetchHistory(pagination.page)}
            disabled={loading}
            className="btn btn-outline"
            style={{ fontSize: '0.8rem' }}
          >
            <RotateCcw size={14} />
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <button
            onClick={handleClearAll}
            className="btn btn-outline"
            style={{ fontSize: '0.8rem', color: '#dc2626', borderColor: '#fecaca', background: '#fef2f2' }}
          >
            <Trash2 size={14} />
            <span>Purge Audit Log</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '260px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by rule or error category..."
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem 0.5rem 2rem',
                fontSize: '0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                outline: 'none'
              }}
            />
            <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '0.65rem', top: '0.7rem' }} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.5rem 0.85rem' }}>
            Search
          </button>
        </form>

        {/* Filter Dropdowns */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {/* Field Filter */}
          <select
            value={filterField}
            onChange={(e) => setFilterField(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              fontSize: '0.82rem',
              outline: 'none'
            }}
          >
            <option value="all">All Form Fields</option>
            <option value="fullName">Full Name</option>
            <option value="email">Email Address</option>
            <option value="mobile">Mobile Number</option>
            <option value="username">Username</option>
            <option value="password">Password</option>
            <option value="confirmPassword">Confirm Password</option>
            <option value="pincode">PIN Code</option>
            <option value="website">Website URL</option>
            <option value="dob">Date of Birth</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterValid}
            onChange={(e) => setFilterValid(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              fontSize: '0.82rem',
              outline: 'none'
            }}
          >
            <option value="all">All Results (Valid & Invalid)</option>
            <option value="true">Valid Grammars Only</option>
            <option value="false">Invalid / Rejected Only</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--color-border)' }}>
              <tr>
                <th style={{ padding: '0.65rem 0.85rem', fontWeight: '700', color: '#475569' }}>Status</th>
                <th style={{ padding: '0.65rem 0.85rem', fontWeight: '700', color: '#475569' }}>Field & Rule</th>
                <th style={{ padding: '0.65rem 0.85rem', fontWeight: '700', color: '#475569' }}>Category</th>
                <th style={{ padding: '0.65rem 0.85rem', fontWeight: '700', color: '#475569' }}>Error Details</th>
                <th style={{ padding: '0.65rem 0.85rem', fontWeight: '700', color: '#475569' }}>Time</th>
                <th style={{ padding: '0.65rem 0.85rem', fontWeight: '700', color: '#475569' }}>Timestamp</th>
                <th style={{ padding: '0.65rem 0.85rem', fontWeight: '700', color: '#475569', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {history.length > 0 ? (
                history.map((record) => (
                  <tr key={record._id || record.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.55rem 0.85rem' }}>
                      <span className={`badge ${record.isValid ? 'badge-success' : 'badge-danger'}`}>
                        {record.isValid ? 'VALID' : 'INVALID'}
                      </span>
                    </td>
                    <td style={{ padding: '0.55rem 0.85rem', fontWeight: '600' }}>
                      <div>{record.ruleName}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>ID: {record.fieldId}</div>
                    </td>
                    <td style={{ padding: '0.55rem 0.85rem' }}>
                      <code style={{ fontSize: '0.72rem', color: '#4f46e5' }}>{record.errorCategory}</code>
                    </td>
                    <td style={{ padding: '0.55rem 0.85rem', color: record.errorMessage ? '#b91c1c' : '#64748b', maxWidth: '260px' }}>
                      {record.errorMessage || '— None (Passed formal grammar)'}
                    </td>
                    <td style={{ padding: '0.55rem 0.85rem', color: '#64748b' }}>
                      {record.executionTimeMs} ms
                    </td>
                    <td style={{ padding: '0.55rem 0.85rem', color: '#64748b', fontSize: '0.75rem' }}>
                      {record.createdAt ? new Date(record.createdAt).toLocaleString() : 'Just now'}
                    </td>
                    <td style={{ padding: '0.55rem 0.85rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteItem(record._id || record.id)}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
                        title="Delete log entry"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8' }}>
                    <History size={32} color="#cbd5e1" style={{ margin: '0 auto 0.5rem auto' }} />
                    <p>No validation audit records found matching your filter criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div style={{
          padding: '0.75rem 1rem',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.8rem',
          color: '#64748b'
        }}>
          <div>
            Showing <strong>{history.length}</strong> of <strong>{pagination.total}</strong> records
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button
              onClick={() => fetchHistory(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
              className="btn btn-outline"
              style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
            >
              <ChevronLeft size={14} />
              <span>Prev</span>
            </button>

            <span>
              Page {pagination.page} of {pagination.pages}
            </span>

            <button
              onClick={() => fetchHistory(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages || loading}
              className="btn btn-outline"
              style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
