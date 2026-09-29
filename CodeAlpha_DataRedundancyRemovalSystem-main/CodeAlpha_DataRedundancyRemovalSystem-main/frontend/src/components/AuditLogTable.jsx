import React, { useState } from 'react';
import { 
  ClipboardList, 
  Trash2, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldAlert, 
  AlertOctagon 
} from 'lucide-react';

export default function AuditLogTable({ 
  logs = [], 
  onClearLogs, 
  classificationFilter, 
  onClassificationFilterChange 
}) {
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const getBadgeForClassification = (c) => {
    switch (c) {
      case 'UNIQUE':
        return <span className="badge badge-unique"><CheckCircle2 size={11} /> Unique</span>;
      case 'FALSE_POSITIVE':
        return <span className="badge badge-false-positive"><AlertTriangle size={11} /> False Positive</span>;
      case 'REDUNDANT_EXACT':
        return <span className="badge badge-redundant-exact"><XCircle size={11} /> Exact Duplicate</span>;
      case 'REDUNDANT_SIMILAR':
        return <span className="badge badge-redundant-similar"><ShieldAlert size={11} /> Similar Duplicate</span>;
      case 'INVALID':
        return <span className="badge badge-invalid"><AlertOctagon size={11} /> Invalid</span>;
      default:
        return <span className="badge">{c}</span>;
    }
  };

  return (
    <div className="glass-card" style={{ marginTop: '1.5rem' }}>
      <div className="card-title-row">
        <h2 className="card-title">
          <ClipboardList size={20} color="var(--accent-indigo)" />
          <span>Deduplication & Validation Audit Log</span>
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Classification Filter */}
          <select 
            className="form-select"
            style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
            value={classificationFilter}
            onChange={(e) => onClassificationFilterChange(e.target.value)}
          >
            <option value="ALL">All Classifications</option>
            <option value="UNIQUE">Unique Only</option>
            <option value="FALSE_POSITIVE">False Positives Only</option>
            <option value="REDUNDANT_EXACT">Redundant Exact Only</option>
            <option value="REDUNDANT_SIMILAR">Redundant Similar Only</option>
            <option value="INVALID">Invalid Attempts Only</option>
          </select>

          {/* Clear Logs */}
          {!showConfirmClear ? (
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => setShowConfirmClear(true)}
              title="Clear audit trail history"
            >
              <Trash2 size={13} />
              <span>Clear Log</span>
            </button>
          ) : (
            <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
              <button 
                className="btn btn-danger btn-sm"
                onClick={() => {
                  setShowConfirmClear(false);
                  onClearLogs();
                }}
              >
                Confirm
              </button>
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => setShowConfirmClear(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <ClipboardList size={24} />
          </div>
          <p style={{ fontWeight: 600 }}>No audit logs recorded yet</p>
          <span style={{ fontSize: '0.78rem' }}>
            Submit a record or trigger a demo scenario above to generate validation history.
          </span>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Submitted Entity</th>
                <th>Classification</th>
                <th>Similarity</th>
                <th>Database Action</th>
                <th>Validation Explanation / Reason</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const isInserted = log.action === 'INSERTED';
                return (
                  <tr key={log._id}>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp || log.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-sub)' }}>
                        {new Date(log.timestamp || log.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                        {log.submittedData?.name || 'Anonymous / Unspecified'}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {log.submittedData?.email || 'N/A'} • {log.submittedData?.phone || 'N/A'}
                      </div>
                    </td>
                    <td>
                      {getBadgeForClassification(log.classification)}
                    </td>
                    <td>
                      <span style={{ 
                        fontWeight: 700, 
                        fontSize: '0.82rem',
                        color: log.similarityScore >= 80 ? 'var(--status-exact)' : 'var(--accent-cyan)'
                      }}>
                        {log.similarityScore !== undefined ? `${log.similarityScore}%` : 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${isInserted ? 'badge-action-inserted' : 'badge-action-rejected'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-main)', maxWidth: '350px' }}>
                      {log.reason}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
