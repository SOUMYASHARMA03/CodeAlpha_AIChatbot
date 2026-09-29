import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Tag, 
  FileText, 
  PlusCircle, 
  RotateCcw, 
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const CATEGORIES = [
  'General',
  'Cloud Engineering',
  'Database Administration',
  'AI Research',
  'Healthcare',
  'Security',
  'Finance',
  'DevOps'
];

export default function AddRecordForm({ onSubmit, isSubmitting, initialValues }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    organization: '',
    category: 'General',
    description: ''
  });

  const [touched, setTouched] = useState({});
  const [clientErrors, setClientErrors] = useState({});

  // Sync initial values when a demo preset is clicked
  useEffect(() => {
    if (initialValues) {
      setFormData(prev => ({
        ...prev,
        ...initialValues
      }));
      setTouched({});
    }
  }, [initialValues]);

  // Live client-side validation
  useEffect(() => {
    const errors = {};
    const trimmedName = (formData.name || '').trim();
    const trimmedEmail = (formData.email || '').trim();
    const cleanDigits = (formData.phone || '').replace(/\D/g, '');

    if (touched.name && trimmedName.length < 2) {
      errors.name = 'Full name must be at least 2 characters.';
    }

    if (touched.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!trimmedEmail) {
        errors.email = 'Email address is required.';
      } else if (!emailRegex.test(trimmedEmail)) {
        errors.email = 'Please enter a valid email format (e.g. user@domain.com).';
      }
    }

    if (touched.phone) {
      if (!formData.phone) {
        errors.phone = 'Phone number is required.';
      } else if (cleanDigits.length < 7 || cleanDigits.length > 15) {
        errors.phone = 'Phone number must have between 7 and 15 digits.';
      }
    }

    setClientErrors(errors);
  }, [formData, touched]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      city: '',
      organization: '',
      category: 'General',
      description: ''
    });
    setTouched({});
    setClientErrors({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mark all required fields as touched
    setTouched({
      name: true,
      email: true,
      phone: true
    });

    // Validate
    const trimmedName = (formData.name || '').trim();
    const trimmedEmail = (formData.email || '').trim();
    const cleanDigits = (formData.phone || '').replace(/\D/g, '');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (trimmedName.length < 2 || !emailRegex.test(trimmedEmail) || cleanDigits.length < 7) {
      return; // Prevent submission if invalid
    }

    onSubmit(formData);
  };

  // Canonical preview strings
  const canonicalEmail = (formData.email || '').trim().toLowerCase();
  const canonicalPhone = (formData.phone || '').replace(/\D/g, '');

  return (
    <div className="glass-card">
      <div className="card-title-row">
        <h2 className="card-title">
          <ShieldCheck size={20} color="var(--accent-cyan)" />
          <span>Add New Data Record</span>
        </h2>
        <span className="badge badge-unique">
          Multi-Stage Validation Enabled
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="record-name">
              <span>Full Name</span>
              <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <User className="input-icon" size={16} />
              <input
                id="record-name"
                name="name"
                type="text"
                className="form-input"
                placeholder="e.g. Dr. Sarah Connor"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              />
            </div>
            {clientErrors.name && (
              <span className="input-hint" style={{ color: 'var(--status-invalid)' }}>
                {clientErrors.name}
              </span>
            )}
          </div>

          {/* Email Address */}
          <div className="form-group">
            <label className="form-label" htmlFor="record-email">
              <span>Email Address</span>
              <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={16} />
              <input
                id="record-email"
                name="email"
                type="email"
                className="form-input"
                placeholder="e.g. sarah.connor@cyberdyne.io"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              />
            </div>
            {clientErrors.email ? (
              <span className="input-hint" style={{ color: 'var(--status-invalid)' }}>
                {clientErrors.email}
              </span>
            ) : canonicalEmail ? (
              <span className="input-hint">Normalized: {canonicalEmail}</span>
            ) : null}
          </div>

          {/* Phone Number */}
          <div className="form-group">
            <label className="form-label" htmlFor="record-phone">
              <span>Phone Number</span>
              <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <Phone className="input-icon" size={16} />
              <input
                id="record-phone"
                name="phone"
                type="text"
                className="form-input"
                placeholder="e.g. (415) 555-0199"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              />
            </div>
            {clientErrors.phone ? (
              <span className="input-hint" style={{ color: 'var(--status-invalid)' }}>
                {clientErrors.phone}
              </span>
            ) : canonicalPhone ? (
              <span className="input-hint">Digits: {canonicalPhone}</span>
            ) : null}
          </div>

          {/* City */}
          <div className="form-group">
            <label className="form-label" htmlFor="record-city">
              <span>City</span>
            </label>
            <div className="input-wrapper">
              <MapPin className="input-icon" size={16} />
              <input
                id="record-city"
                name="city"
                type="text"
                className="form-input"
                placeholder="e.g. San Francisco"
                value={formData.city}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Organization */}
          <div className="form-group">
            <label className="form-label" htmlFor="record-org">
              <span>Organization</span>
            </label>
            <div className="input-wrapper">
              <Building className="input-icon" size={16} />
              <input
                id="record-org"
                name="organization"
                type="text"
                className="form-input"
                placeholder="e.g. Cyberdyne Systems"
                value={formData.organization}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label" htmlFor="record-category">
              <span>Category</span>
            </label>
            <div className="input-wrapper">
              <Tag className="input-icon" size={16} />
              <select
                id="record-category"
                name="category"
                className="form-select"
                value={formData.category}
                onChange={handleChange}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="form-group full-width">
            <label className="form-label" htmlFor="record-description">
              <span>Description / Notes</span>
            </label>
            <textarea
              id="record-description"
              name="description"
              className="form-textarea"
              placeholder="Optional notes or details about this entry..."
              rows={2}
              value={formData.description}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={handleReset}
            disabled={isSubmitting}
          >
            <RotateCcw size={14} />
            <span>Reset Form</span>
          </button>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            <PlusCircle size={15} />
            <span>{isSubmitting ? 'Evaluating Record...' : 'Verify & Append Record'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
