import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  AlertOctagon, 
  Database, 
  ArrowRight, 
  X, 
  Fingerprint, 
  ShieldAlert 
} from 'lucide-react';

export default function ValidationResultModal({ result, onClose }) {
  if (!result) return null;

  const {
    success,
    classification = 'UNIQUE',
    action = 'INSERTED',
    message = '',
    similarityScore = 0,
    matchedRecord = null,
    fieldBreakdown = {},
    matchedFields = [],
    differentFields = [],
    reason = '',
    record = null
  } = result;

  // Determine styling theme based on classification
  let theme = {
    badgeClass: 'badge-unique',
    accentColor: 'var(--status-unique)',
    icon: CheckCircle2,
    title: 'Unique Record Verified',
    headerSub: 'No duplication detected. Entry approved.'
  };

  if (classification === 'FALSE_POSITIVE') {
    theme = {
      badgeClass: 'badge-false-positive',
      accentColor: 'var(--status-fp)',
      icon: AlertTriangle,
      title: 'False Positive Disambiguated',
      headerSub: 'Profile similarity detected, but credentials prove distinct entity.'
    };
  } else if (classification === 'REDUNDANT_EXACT') {
    theme = {
      badgeClass: 'badge-redundant-exact',
      accentColor: 'var(--status-exact)',
      icon: XCircle,
      title: 'Exact Redundant Record Blocked',
      headerSub: 'Identical record already exists in cloud database.'
    };
  } else if (classification === 'REDUNDANT_SIMILAR') {
    theme = {
      badgeClass: 'badge-redundant-similar',
      accentColor: 'var(--status-similar)',
      icon: ShieldAlert,
      title: 'Similar Redundant Record Blocked',
      headerSub: 'High similarity and matching key identifiers detected.'
    };
  } else if (classification === 'INVALID') {
    theme = {
      badgeClass: 'badge-invalid',
      accentColor: 'var(--status-invalid)',
      icon: AlertOctagon,
      title: 'Input Validation Failed',
      headerSub: 'Payload rejected before database evaluation.'
    };
  }

  const IconComponent = theme.icon;
  const isInserted = action === 'INSERTED';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div 
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                background: `rgba(255, 255, 255, 0.05)`,
                border: `1px solid ${theme.accentColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.accentColor
              }}
            >
              <IconComponent size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{theme.title}</h3>
                <span className={`badge ${theme.badgeClass}`}>
                  {classification}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {theme.headerSub}
              </p>
            </div>
          </div>
          <button 
            className="btn btn-outline btn-sm"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Action Status Banner */}
          <div 
            style={{
              padding: '0.85rem 1.15rem',
              borderRadius: 'var(--radius-md)',
              background: isInserted ? 'var(--status-unique-bg)' : 'var(--status-exact-bg)',
              border: `1px solid ${isInserted ? 'var(--status-unique-border)' : 'var(--status-exact-border)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Database size={16} color={isInserted ? 'var(--status-unique)' : 'var(--status-exact)'} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Database Action: {isInserted ? 'APPENDED TO CLOUD DATABASE' : 'REJECTED — STORE BLOCKED'}
              </span>
            </div>
            <span className={`badge ${isInserted ? 'badge-action-inserted' : 'badge-action-rejected'}`}>
              {action}
            </span>
          </div>

          {/* Explanation / Reason */}
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              Decision Rationale
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
              {reason || message}
            </div>
          </div>

          {/* Similarity Gauge (if applicable) */}
          {similarityScore !== undefined && classification !== 'INVALID' && (
            <div className="similarity-meter">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                <span>Calculated Similarity Score</span>
                <span style={{ color: theme.accentColor }}>{similarityScore}%</span>
              </div>
              <div className="meter-track">
                <div 
                  className="meter-fill"
                  style={{
                    width: `${similarityScore}%`,
                    backgroundColor: theme.accentColor
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-sub)' }}>
                <span>0% (Completely Unique)</span>
                <span>50% (Ambiguity Threshold)</span>
                <span>80%+ (Potential Duplicate)</span>
              </div>
            </div>
          )}

          {/* Matched vs Different Fields Breakdown */}
          {(matchedFields.length > 0 || differentFields.length > 0) && (
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: '0.45rem' }}>
                Field-Level Similarity Breakdown
              </div>
              <div className="pill-group">
                {matchedFields.map((f, i) => (
                  <span key={i} className="field-pill match">
                    ✓ Matches: {f}
                  </span>
                ))}
                {differentFields.map((f, i) => (
                  <span key={i} className="field-pill unique">
                    ≠ Differs: {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Side-by-Side Comparison if duplicate or false positive */}
          {matchedRecord && (
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Side-by-Side Record Comparison
              </div>
              <div className="comparison-grid">
                {/* Incoming record */}
                <div className="comparison-card incoming">
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                    Incoming Submitted Record
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                    {record?.name || result?.submittedData?.name || 'Submitted Name'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Email: {record?.email || result?.submittedData?.email}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Phone: {record?.phone || result?.submittedData?.phone}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>
                    Org: {record?.organization || result?.submittedData?.organization || 'N/A'}
                  </div>
                </div>

                {/* Existing DB record */}
                <div className="comparison-card existing">
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--status-exact)' }}>
                    Existing MongoDB Atlas Record
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                    {matchedRecord.name}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Email: {matchedRecord.email}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Phone: {matchedRecord.phone}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>
                    Org: {matchedRecord.organization || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Acknowledge & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
