import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Database, 
  RefreshCw, 
  Sparkles, 
  Trash2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export default function Navbar({ 
  dbStatus, 
  onSeed, 
  onReset, 
  isOperating 
}) {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const isConnected = dbStatus?.connected;

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="brand">
          <div className="brand-icon">
            <ShieldCheck size={24} />
          </div>
          <div className="brand-text">
            <h1>CloudGuard</h1>
            <div className="brand-subtitle">Data Redundancy Removal System • CodeAlpha Task 1</div>
          </div>
        </div>

        {/* Actions & Status */}
        <div className="nav-actions">
          {/* Cloud Database Connection Status */}
          <div 
            className={`cloud-pill ${isConnected ? 'online' : 'offline'}`}
            title={isConnected 
              ? `Connected to MongoDB: ${dbStatus?.database || 'cloudguard_db'}`
              : `Database Status: ${dbStatus?.error || 'Configure MONGODB_URI in backend/.env'}`
            }
          >
            <span className="status-dot"></span>
            <Database size={13} />
            <span>{isConnected ? 'MongoDB: Connected' : 'Cloud DB: Standby'}</span>
          </div>

          {/* Seed Sample Records */}
          <button 
            className="btn btn-secondary btn-sm"
            onClick={onSeed}
            disabled={isOperating}
            title="Seed baseline records and audit logs for demonstration"
          >
            <Sparkles size={14} />
            <span>Seed Demo Data</span>
          </button>

          {/* Reset Cloud DB */}
          {!showConfirmReset ? (
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => setShowConfirmReset(true)}
              disabled={isOperating}
              title="Clear all records and audit history"
            >
              <Trash2 size={14} />
              <span>Reset</span>
            </button>
          ) : (
            <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
              <button 
                className="btn btn-danger btn-sm"
                onClick={() => {
                  setShowConfirmReset(false);
                  onReset();
                }}
                disabled={isOperating}
              >
                Confirm Clear
              </button>
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => setShowConfirmReset(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
