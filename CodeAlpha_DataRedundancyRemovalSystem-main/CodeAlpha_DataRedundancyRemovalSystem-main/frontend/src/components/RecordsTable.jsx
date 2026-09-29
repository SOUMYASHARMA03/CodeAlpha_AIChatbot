import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  Trash2, 
  ExternalLink, 
  Calendar, 
  Building, 
  Mail, 
  Phone, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

export default function RecordsTable({ 
  records = [], 
  onDeleteRecord, 
  onInspectRecord,
  searchTerm, 
  onSearchChange,
  statusFilter, 
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange
}) {
  const [recordToDelete, setRecordToDelete] = useState(null);

  const categories = ['ALL', 'Cloud Engineering', 'Database Administration', 'AI Research', 'Healthcare', 'Security', 'General', 'Research'];

  return (
    <div className="glass-card" style={{ marginTop: '1.5rem' }}>
      <div className="card-title-row">
        <h2 className="card-title">
          <Database size={20} color="var(--accent-cyan)" />
          <span>Verified Cloud Database Records</span>
        </h2>
        <span className="badge badge-unique">
          {records.length} Verified Entries in MongoDB
        </span>
      </div>

      {/* Toolbar / Filters */}
      <div className="table-toolbar">
        <div className="search-box">
          <Search className="input-icon" size={16} />
          <input
            type="text"
            className="search-input"
            placeholder="Search records by name, email, phone, city..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="filter-group">
          {/* Status Filter */}
          <select 
            className="form-select" 
            style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="UNIQUE">Verified Unique Only</option>
            <option value="FALSE_POSITIVE">False Positives (Verified)</option>
          </select>

          {/* Category Filter */}
          <select 
            className="form-select" 
            style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
            value={categoryFilter}
            onChange={(e) => onCategoryFilterChange(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'ALL' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {records.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Database size={24} />
          </div>
          <p style={{ fontWeight: 600 }}>No cloud records found</p>
          <span style={{ fontSize: '0.78rem' }}>
            {searchTerm || statusFilter !== 'ALL' || categoryFilter !== 'ALL'
              ? 'Try adjusting your search filters or clearing the search box.'
              : 'Add your first record using the form above or click "Seed Demo Data".'}
          </span>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Entity Name</th>
                <th>Credentials (Email / Phone)</th>
                <th>Organization & Location</th>
                <th>Category</th>
                <th>Verification Status</th>
                <th>Date Appended</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => {
                const isFp = r.validationStatus === 'FALSE_POSITIVE';
                return (
                  <tr key={r._id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                        {r.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>
                        Hash: {r.dataHash ? `${r.dataHash.substring(0, 10)}...` : 'N/A'}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}>
                        <Mail size={12} color="var(--accent-cyan)" />
                        <span>{r.email}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <Phone size={12} />
                        <span>{r.phone}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                        {r.organization || 'Independent'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>
                        {r.city || 'N/A'}
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-main)', border: '1px solid var(--border-subtle)' }}>
                        {r.category || 'General'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${isFp ? 'badge-false-positive' : 'badge-unique'}`}>
                        {isFp ? <AlertTriangle size={11} /> : <CheckCircle2 size={11} />}
                        <span>{isFp ? 'False Positive' : 'Unique'}</span>
                      </span>
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(r.createdAt || Date.now()).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        {recordToDelete === r._id ? (
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button 
                              className="btn btn-danger btn-sm"
                              onClick={() => {
                                onDeleteRecord(r._id);
                                setRecordToDelete(null);
                              }}
                              title="Confirm delete"
                            >
                              Confirm
                            </button>
                            <button 
                              className="btn btn-outline btn-sm"
                              onClick={() => setRecordToDelete(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button 
                            className="btn btn-outline btn-sm"
                            style={{ color: 'var(--status-exact)' }}
                            onClick={() => setRecordToDelete(r._id)}
                            title="Delete record from MongoDB"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
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
