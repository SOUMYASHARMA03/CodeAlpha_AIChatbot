import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import StatsOverview from './components/StatsOverview';
import DemoScenarioBar from './components/DemoScenarioBar';
import AddRecordForm from './components/AddRecordForm';
import RecordsTable from './components/RecordsTable';
import AuditLogTable from './components/AuditLogTable';
import ValidationResultModal from './components/ValidationResultModal';

import { 
  fetchStats, 
  fetchRecords, 
  createRecord, 
  deleteRecord, 
  fetchAuditLogs, 
  clearAuditLogs, 
  seedDatabase, 
  resetDatabase 
} from './services/api';

import { Database, ClipboardList, Info, AlertTriangle } from 'lucide-react';

export default function App() {
  // Application Data States
  const [stats, setStats] = useState({});
  const [dbStatus, setDbStatus] = useState({ connected: false });
  const [records, setRecords] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  
  // UI Control States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOperating, setIsOperating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [demoPreset, setDemoPreset] = useState(null);
  const [activeTab, setActiveTab] = useState('records');
  const [toastMessage, setToastMessage] = useState(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [auditClassificationFilter, setAuditClassificationFilter] = useState('ALL');

  // Show transient toast
  const showToast = (msg, type = 'info') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load all initial data
  const loadDashboardData = useCallback(async () => {
    try {
      // 1. Fetch Stats & DB Health
      const statsRes = await fetchStats().catch(() => ({ stats: {}, dbStatus: { connected: false } }));
      if (statsRes.stats) setStats(statsRes.stats);
      if (statsRes.dbStatus) setDbStatus(statsRes.dbStatus);

      // 2. Fetch Records
      const recordsRes = await fetchRecords({
        search: searchTerm,
        status: statusFilter,
        category: categoryFilter
      }).catch(() => ({ records: [] }));
      if (recordsRes.records) setRecords(recordsRes.records);

      // 3. Fetch Audit Logs
      const auditRes = await fetchAuditLogs({
        classification: auditClassificationFilter
      }).catch(() => ({ logs: [] }));
      if (auditRes.logs) setAuditLogs(auditRes.logs);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  }, [searchTerm, statusFilter, categoryFilter, auditClassificationFilter]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handle Record Submission
  const handleRecordSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const response = await createRecord(formData);
      
      // Trigger Result Inspection Modal
      setValidationResult({
        ...response,
        submittedData: formData
      });

      if (response.action === 'INSERTED') {
        showToast(
          response.classification === 'FALSE_POSITIVE'
            ? '✓ False Positive Verified & Appended to Cloud DB!'
            : '✓ Unique Record Verified & Appended to Cloud DB!',
          'success'
        );
      } else {
        showToast(
          response.classification === 'REDUNDANT_EXACT'
            ? '✕ Exact duplicate rejected from cloud database.'
            : '✕ Similar redundant record rejected.',
          'error'
        );
      }

      // Refresh Dashboard
      await loadDashboardData();
    } catch (err) {
      setValidationResult({
        success: false,
        classification: 'INVALID',
        action: 'REJECTED',
        message: err.message || 'Validation or network error occurred.',
        submittedData: formData
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Record
  const handleDeleteRecord = async (id) => {
    try {
      await deleteRecord(id);
      showToast('Record deleted from cloud storage.', 'info');
      await loadDashboardData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Clear Audit Logs
  const handleClearAuditLogs = async () => {
    try {
      await clearAuditLogs();
      showToast('Audit log history cleared.', 'info');
      await loadDashboardData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Seed Baseline Data
  const handleSeed = async () => {
    setIsOperating(true);
    try {
      await seedDatabase();
      showToast('✓ Seeded 5 baseline records & historical audit logs!', 'success');
      await loadDashboardData();
    } catch (err) {
      showToast(`Seeding failed: ${err.message}`, 'error');
    } finally {
      setIsOperating(false);
    }
  };

  // Reset Cloud Data
  const handleReset = async () => {
    setIsOperating(true);
    try {
      await resetDatabase();
      showToast('Cloud database cleared. Ready for clean test.', 'info');
      await loadDashboardData();
    } catch (err) {
      showToast(`Reset failed: ${err.message}`, 'error');
    } finally {
      setIsOperating(false);
    }
  };

  // Handle Preset Click
  const handleSelectScenario = (preset, label) => {
    setDemoPreset({ ...preset, _t: Date.now() });
    showToast(`Loaded ${label} into form. Ready to test!`, 'info');
  };

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div 
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            background: toastMessage.type === 'success' ? '#065f46' : toastMessage.type === 'error' ? '#881337' : '#1e293b',
            color: '#fff',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--glass-shadow)',
            zIndex: 9999,
            fontSize: '0.85rem',
            fontWeight: 600,
            border: '1px solid rgba(255,255,255,0.2)',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          {toastMessage.msg}
        </div>
      )}

      {/* Navigation */}
      <Navbar 
        dbStatus={dbStatus}
        onSeed={handleSeed}
        onReset={handleReset}
        isOperating={isOperating}
      />

      <main className="main-content">
        {/* KPI Metrics */}
        <StatsOverview stats={stats} />

        {/* 1-Click Evaluator Demonstration Controls */}
        <DemoScenarioBar onSelectScenario={handleSelectScenario} />

        {/* Workspace: Form + Live Overview */}
        <div className="workspace-grid">
          {/* Submission Form */}
          <AddRecordForm 
            onSubmit={handleRecordSubmit}
            isSubmitting={isSubmitting}
            initialValues={demoPreset}
          />

          {/* Quick Technical Overview Card */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="card-title-row">
              <h2 className="card-title">
                <Info size={19} color="var(--accent-cyan)" />
                <span>Verification Engine Pipeline</span>
              </h2>
              <span className="badge badge-action-inserted">Authoritative Backend</span>
            </div>

            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Every submitted record undergoes strict server-side canonical normalization, deterministic 
              SHA-256 fingerprint matching, and weighted fuzzy similarity scoring before any write 
              to <strong>MongoDB</strong> is permitted.
            </p>

            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: 'auto' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                Authoritative Decision Flow:
              </div>
              <ul style={{ paddingLeft: '1.15rem', fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <li><strong style={{ color: 'var(--status-unique)' }}>UNIQUE</strong>: New entity with no matching credentials → Appended.</li>
                <li><strong style={{ color: 'var(--status-exact)' }}>REDUNDANT_EXACT</strong>: Identical SHA-256 fingerprint → Blocked with 409.</li>
                <li><strong style={{ color: 'var(--status-similar)' }}>REDUNDANT_SIMILAR</strong>: Typo/variation with same key identifiers → Blocked.</li>
                <li><strong style={{ color: 'var(--status-fp)' }}>FALSE_POSITIVE</strong>: Same name, distinct credentials → Disambiguated & Appended!</li>
                <li><strong style={{ color: 'var(--status-invalid)' }}>INVALID</strong>: Violates format/length constraints → Intercepted with 400.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tab Navigation for Tables */}
        <div>
          <div className="tabs-nav">
            <button 
              className={`tab-btn ${activeTab === 'records' ? 'active' : ''}`}
              onClick={() => setActiveTab('records')}
            >
              <Database size={16} />
              <span>Verified Database Records ({records.length})</span>
            </button>
            <button 
              className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
              onClick={() => setActiveTab('audit')}
            >
              <ClipboardList size={16} />
              <span>Deduplication Audit Trail ({auditLogs.length})</span>
            </button>
          </div>

          {activeTab === 'records' ? (
            <RecordsTable 
              records={records}
              onDeleteRecord={handleDeleteRecord}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
            />
          ) : (
            <AuditLogTable 
              logs={auditLogs}
              onClearLogs={handleClearAuditLogs}
              classificationFilter={auditClassificationFilter}
              onClassificationFilterChange={setAuditClassificationFilter}
            />
          )}
        </div>
      </main>

      {/* Validation Result Modal (Inspector) */}
      <ValidationResultModal 
        result={validationResult}
        onClose={() => setValidationResult(null)}
      />

      {/* Footer */}
      <footer className="app-footer">
        <p>
          <strong>CloudGuard</strong> — Data Redundancy Removal System • CodeAlpha Cloud Computing Task 1
        </p>
        <p style={{ marginTop: '0.25rem' }}>
          Designed for MongoDB Atlas • Developed by Chahat Kumari (@chahat1409) • Repository: <code className="mono">CodeAlpha_DataRedundancyRemovalSystem</code>
        </p>
      </footer>
    </div>
  );
}
