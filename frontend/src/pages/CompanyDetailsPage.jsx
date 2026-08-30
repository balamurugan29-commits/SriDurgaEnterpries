import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  CreditCard, 
  FileText, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Hash, 
  Layers, 
  Sparkles,
  ChevronRight,
  Eye,
  Lock,
  Unlock,
  Edit3,
  X,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { fetchCompanyDetails, saveCompanyDetails, DEFAULT_COMPANY_DETAILS } from '../services/api';
import { Toast } from '../components/Toast';

export const CompanyDetailsPage = () => {
  const [formData, setFormData] = useState(DEFAULT_COMPANY_DETAILS);
  const [savedData, setSavedData] = useState(DEFAULT_COMPANY_DETAILS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Determine if the logged-in user is Main Admin
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    try {
      const userJson = localStorage.getItem('sri_durga_user');
      if (userJson) {
        const user = JSON.parse(userJson);
        setIsAdmin(user.role === 'ADMIN' || user.userId?.toLowerCase() === 'admin');
      }
    } catch (e) {
      setIsAdmin(false);
    }
    loadCompanyDetails();
  }, []);

  const loadCompanyDetails = async () => {
    try {
      setLoading(true);
      const data = await fetchCompanyDetails();
      if (data) {
        const clean = {
          ...DEFAULT_COMPANY_DETAILS,
          ...data
        };
        setFormData(clean);
        setSavedData(clean);
      }
    } catch (err) {
      console.error('Failed to load company details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGstChange = (val) => {
    const upper = val.toUpperCase().trim();
    handleChange('gstin', upper);

    // Auto-extract PAN from GSTIN (chars 3 to 12) if PAN not already entered
    if (upper.length >= 12 && !formData.pan) {
      handleChange('pan', upper.substring(2, 12));
    }
  };

  const handleStartEdit = () => {
    if (!isAdmin) {
      setToast({ message: 'Access Denied: Only Main Admin can edit Company Details.', type: 'error' });
      return;
    }
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setFormData(savedData);
    setIsEditing(false);
    setToast({ message: 'Editing cancelled. Restored saved details.', type: 'info' });
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all company fields?')) {
      setFormData(DEFAULT_COMPANY_DETAILS);
      setToast({ message: 'Cleared all fields. Click "Save Company Details" to commit changes.', type: 'info' });
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!isAdmin) {
      setToast({ message: 'Access Denied: Only Main Admin can save Company Details.', type: 'error' });
      return;
    }

    try {
      setSaving(true);
      const saved = await saveCompanyDetails(formData);
      const clean = {
        ...DEFAULT_COMPANY_DETAILS,
        ...saved
      };
      setFormData(clean);
      setSavedData(clean);
      setIsEditing(false);
      setToast({ 
        message: '✨ Company Details saved permanently! All Tax Invoices will now use these updated details.', 
        type: 'success' 
      });
    } catch (err) {
      setToast({ message: 'Save failed: ' + err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* TOP HERO BANNER */}
      <div 
        style={{ 
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(16, 185, 129, 0.15) 100%)', 
          border: '1.5px solid rgba(99, 102, 241, 0.35)', 
          borderRadius: '18px', 
          padding: '1.5rem 1.75rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.25rem',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.25)', border: '1px solid rgba(99, 102, 241, 0.4)', padding: '0.85rem', borderRadius: '14px', color: '#818cf8' }}>
            <Building2 size={32} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
              <span style={{ fontWeight: 600 }}>Master Page</span>
              <ChevronRight size={12} />
              <span style={{ color: '#818cf8', fontWeight: 700 }}>Company Details Master</span>
            </div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Company Details Master Profile
            </h1>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '4px 0 0 0', maxWidth: '680px', lineHeight: 1.5 }}>
              Enter and save your enterprise registration, GST, PAN, EPF, ESI identifiers, and Bank payment details once. These details will permanently remain saved and will be automatically printed on every <strong>Tax Invoice</strong>.
            </p>
          </div>
        </div>

        {/* Action Controls: Edit Mode / Lock Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {!isEditing ? (
            isAdmin ? (
              <button 
                type="button"
                onClick={handleStartEdit} 
                className="btn btn-primary" 
                style={{ fontSize: '0.875rem', padding: '0.6rem 1.4rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Edit3 size={16} />
                <span>Edit Company Details</span>
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', padding: '0.5rem 1rem', borderRadius: '8px', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>
                <Lock size={14} color="#f59e0b" />
                <span>Locked (Admin Access Only)</span>
              </div>
            )
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <button 
                type="button"
                onClick={handleClearAll} 
                className="btn btn-outline" 
                style={{ fontSize: '0.825rem', padding: '0.55rem 0.85rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                title="Clear all fields"
              >
                <Trash2 size={14} />
                <span>Clear</span>
              </button>

              <button 
                type="button"
                onClick={handleCancelEdit} 
                className="btn btn-outline" 
                style={{ fontSize: '0.825rem', padding: '0.55rem 0.9rem' }}
              >
                <X size={14} />
                <span>Cancel</span>
              </button>

              <button 
                type="button"
                onClick={handleSubmit} 
                disabled={saving || loading}
                className="btn btn-secondary" 
                style={{ fontSize: '0.875rem', padding: '0.55rem 1.35rem', fontWeight: 700 }}
              >
                {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* LOCK / EDIT STATUS NOTICE */}
      {!isEditing && (
        <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '12px', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.825rem', color: '#e2e8f0' }}>
            <Lock size={16} color="#38bdf8" />
            <span>
              <strong>Company Profile is locked.</strong> Once set, these details remain permanently saved. {isAdmin ? 'Click "Edit Company Details" above to make changes.' : 'Only Main Admin has permission to edit company details.'}
            </span>
          </div>
          {isAdmin && (
            <button 
              onClick={handleStartEdit}
              className="btn btn-outline"
              style={{ padding: '0.3rem 0.8rem', fontSize: '0.75rem', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)' }}
            >
              <Edit3 size={13} />
              <span>Edit Now</span>
            </button>
          )}
        </div>
      )}

      {/* QUICK STATUS BADGES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '0.6rem', borderRadius: '10px' }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Tax Invoice Auto-Sync</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#38bdf8' }}>Active & Live</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', padding: '0.6rem', borderRadius: '10px' }}>
            <Hash size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Registered GSTIN</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#34d399', fontFamily: 'monospace' }}>{formData.gstin || '(Not Set)'}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', padding: '0.6rem', borderRadius: '10px' }}>
            <CreditCard size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Permanent PAN</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fbbf24', fontFamily: 'monospace' }}>{formData.pan || '(Not Set)'}</div>
          </div>
        </div>
      </div>

      {/* MAIN FORM AND LIVE PREVIEW SPLIT */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: DETAILS FORM */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* SECTION 1: STATUTORY TAX & COMPLIANCE IDENTIFIERS */}
          <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <ShieldCheck size={20} color="#38bdf8" />
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                    Statutory & Tax Compliance Identifiers
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Printed in Rows 4, 5, 6, 7 of the Tax Invoice Metadata Grid
                  </span>
                </div>
              </div>

              {!isEditing ? (
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                  <Lock size={12} /> Read-Only
                </span>
              ) : (
                <span style={{ fontSize: '0.75rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(52,211,153,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                  <Unlock size={12} /> Editable
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* GST Number */}
              <div>
                <label className="form-label" style={{ fontWeight: 700, color: '#38bdf8' }}>
                  GST Number (GSTIN)
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  className="form-input"
                  placeholder="Enter GSTIN (e.g. 34XXXXX...)"
                  value={formData.gstin || ''}
                  onChange={e => handleGstChange(e.target.value)}
                  style={{ 
                    textTransform: 'uppercase', 
                    fontFamily: 'monospace', 
                    fontWeight: 700,
                    opacity: !isEditing ? 0.85 : 1,
                    background: !isEditing ? 'rgba(0,0,0,0.2)' : undefined,
                    cursor: !isEditing ? 'default' : 'text'
                  }}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                  15-digit GSTIN used in Tax Invoice Print
                </span>
              </div>

              {/* PAN Number */}
              <div>
                <label className="form-label" style={{ fontWeight: 700, color: '#38bdf8' }}>
                  PAN Number
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  className="form-input"
                  placeholder="Enter PAN (e.g. ABDFS4476N)"
                  value={formData.pan || ''}
                  onChange={e => handleChange('pan', e.target.value.toUpperCase())}
                  style={{ 
                    textTransform: 'uppercase', 
                    fontFamily: 'monospace', 
                    fontWeight: 700,
                    opacity: !isEditing ? 0.85 : 1,
                    background: !isEditing ? 'rgba(0,0,0,0.2)' : undefined,
                    cursor: !isEditing ? 'default' : 'text'
                  }}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                  10-digit Permanent Account Number
                </span>
              </div>

              {/* State & State Code */}
              <div>
                <label className="form-label">
                  State & State Code
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  className="form-input"
                  placeholder="e.g. Tamil Nadu (33) or Puducherry (34)"
                  value={formData.state || ''}
                  onChange={e => handleChange('state', e.target.value)}
                  style={{ 
                    opacity: !isEditing ? 0.85 : 1,
                    background: !isEditing ? 'rgba(0,0,0,0.2)' : undefined,
                    cursor: !isEditing ? 'default' : 'text'
                  }}
                />
              </div>

              {/* EPF Code */}
              <div>
                <label className="form-label">
                  EPF Code
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  className="form-input"
                  placeholder="e.g. PC 1758"
                  value={formData.epfCode || ''}
                  onChange={e => handleChange('epfCode', e.target.value)}
                  style={{ 
                    opacity: !isEditing ? 0.85 : 1,
                    background: !isEditing ? 'rgba(0,0,0,0.2)' : undefined,
                    cursor: !isEditing ? 'default' : 'text'
                  }}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                  Employees' Provident Fund registration
                </span>
              </div>

              {/* ESI Code */}
              <div>
                <label className="form-label">
                  ESI Code
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  className="form-input"
                  placeholder="e.g. 55000426770000602"
                  value={formData.esiCode || ''}
                  onChange={e => handleChange('esiCode', e.target.value)}
                  style={{ 
                    opacity: !isEditing ? 0.85 : 1,
                    background: !isEditing ? 'rgba(0,0,0,0.2)' : undefined,
                    cursor: !isEditing ? 'default' : 'text'
                  }}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                  Employee State Insurance statutory registration code
                </span>
              </div>

              {/* Vendor Code */}
              <div>
                <label className="form-label">
                  Default Vendor Code
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  className="form-input"
                  placeholder="e.g. 840305"
                  value={formData.vendorCode || ''}
                  onChange={e => handleChange('vendorCode', e.target.value)}
                  style={{ 
                    opacity: !isEditing ? 0.85 : 1,
                    background: !isEditing ? 'rgba(0,0,0,0.2)' : undefined,
                    cursor: !isEditing ? 'default' : 'text'
                  }}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                  Default ONGC/Client Vendor Code
                </span>
              </div>

              {/* Contract Number */}
              <div>
                <label className="form-label">
                  Default Contract Number
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  className="form-input"
                  placeholder="e.g. 9010038288"
                  value={formData.contractNo || ''}
                  onChange={e => handleChange('contractNo', e.target.value)}
                  style={{ 
                    opacity: !isEditing ? 0.85 : 1,
                    background: !isEditing ? 'rgba(0,0,0,0.2)' : undefined,
                    cursor: !isEditing ? 'default' : 'text'
                  }}
                />
              </div>

              {/* CON. Period */}
              <div>
                <label className="form-label" style={{ fontWeight: 700, color: '#fbbf24' }}>
                  CON. Period
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  className="form-input"
                  placeholder="e.g. 01.05.2024 to 30.04.2027"
                  value={formData.contractPeriod || ''}
                  onChange={e => handleChange('contractPeriod', e.target.value)}
                  style={{ 
                    opacity: !isEditing ? 0.85 : 1,
                    background: !isEditing ? 'rgba(0,0,0,0.2)' : undefined,
                    cursor: !isEditing ? 'default' : 'text',
                    borderColor: 'rgba(245, 158, 11, 0.4)'
                  }}
                />
              </div>

              {/* B.G. No */}
              <div style={{ gridColumn: 'span 2' }}>
                <label className="form-label" style={{ fontWeight: 700, color: '#fbbf24' }}>
                  B.G. No
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  className="form-input"
                  placeholder="e.g. 8110IPEBG240001  Validity Upto : 30.09.2027"
                  value={formData.bgNo || ''}
                  onChange={e => handleChange('bgNo', e.target.value)}
                  style={{ 
                    opacity: !isEditing ? 0.85 : 1,
                    background: !isEditing ? 'rgba(0,0,0,0.2)' : undefined,
                    cursor: !isEditing ? 'default' : 'text',
                    borderColor: 'rgba(245, 158, 11, 0.4)'
                  }}
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: ENTERPRISE & CONTACT PROFILE */}
          <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <Building2 size={20} color="#818cf8" />
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                    Enterprise & Contact Profile
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Printed in the top header banner and signatory stamps
                  </span>
                </div>
              </div>

              {!isEditing ? (
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                  <Lock size={12} /> Read-Only
                </span>
              ) : (
                <span style={{ fontSize: '0.75rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(52,211,153,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                  <Unlock size={12} /> Editable
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Company Name */}
              <div>
                <label className="form-label" style={{ fontWeight: 700, color: '#818cf8' }}>
                  Company Name
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  className="form-input"
                  placeholder="e.g. SRI DURGA ENTERPRISES"
                  value={formData.companyName || ''}
                  onChange={e => handleChange('companyName', e.target.value)}
                  style={{ 
                    fontWeight: 700, 
                    textTransform: 'uppercase',
                    opacity: !isEditing ? 0.85 : 1,
                    background: !isEditing ? 'rgba(0,0,0,0.2)' : undefined,
                    cursor: !isEditing ? 'default' : 'text'
                  }}
                />
              </div>

              {/* Address */}
              <div>
                <label className="form-label">
                  Registered Office Address
                </label>
                <textarea
                  disabled={!isEditing}
                  className="form-textarea"
                  rows={2}
                  placeholder="Enter office address..."
                  value={formData.address || ''}
                  onChange={e => handleChange('address', e.target.value)}
                  style={{ 
                    opacity: !isEditing ? 0.85 : 1,
                    background: !isEditing ? 'rgba(0,0,0,0.2)' : undefined,
                    cursor: !isEditing ? 'default' : 'text'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Phone */}
                <div>
                  <label className="form-label">
                    Primary Phone / Cell
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    className="form-input"
                    placeholder="e.g. 9842492946"
                    value={formData.phone || ''}
                    onChange={e => handleChange('phone', e.target.value)}
                    style={{ 
                      opacity: !isEditing ? 0.85 : 1,
                      background: !isEditing ? 'rgba(0,0,0,0.2)' : undefined,
                      cursor: !isEditing ? 'default' : 'text'
                    }}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="form-label">
                    Official Email Address
                  </label>
                  <input
                    type="email"
                    disabled={!isEditing}
                    className="form-input"
                    placeholder="e.g. enterprise@email.com"
                    value={formData.email || ''}
                    onChange={e => handleChange('email', e.target.value)}
                    style={{ 
                      opacity: !isEditing ? 0.85 : 1,
                      background: !isEditing ? 'rgba(0,0,0,0.2)' : undefined,
                      cursor: !isEditing ? 'default' : 'text'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: BANK & SETTLEMENT COORDINATES */}
          <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <CreditCard size={20} color="#fbbf24" />
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                    Bank & Settlement Coordinates
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Printed in the Payment & Settlement footer of Tax Invoices
                  </span>
                </div>
              </div>

              {!isEditing ? (
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                  <Lock size={12} /> Read-Only
                </span>
              ) : (
                <span style={{ fontSize: '0.75rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(52,211,153,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                  <Unlock size={12} /> Editable
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Bank Name */}
              <div>
                <label className="form-label" style={{ fontWeight: 700, color: '#fbbf24' }}>
                  Bank Name
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  className="form-input"
                  placeholder="Enter Bank Name..."
                  value={formData.bankName || ''}
                  onChange={e => handleChange('bankName', e.target.value)}
                  style={{ 
                    opacity: !isEditing ? 0.85 : 1,
                    background: !isEditing ? 'rgba(0,0,0,0.2)' : undefined,
                    cursor: !isEditing ? 'default' : 'text'
                  }}
                />
              </div>

              {/* Branch Name */}
              <div>
                <label className="form-label" style={{ fontWeight: 700, color: '#fbbf24' }}>
                  Branch Name
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  className="form-input"
                  placeholder="Enter Branch Name..."
                  value={formData.branch || ''}
                  onChange={e => handleChange('branch', e.target.value)}
                  style={{ 
                    opacity: !isEditing ? 0.85 : 1,
                    background: !isEditing ? 'rgba(0,0,0,0.2)' : undefined,
                    cursor: !isEditing ? 'default' : 'text'
                  }}
                />
              </div>

              {/* Account Number */}
              <div>
                <label className="form-label" style={{ fontWeight: 700, color: '#fbbf24' }}>
                  Account Number
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  className="form-input"
                  placeholder="Enter Bank Account Number..."
                  value={formData.accountNumber || ''}
                  onChange={e => handleChange('accountNumber', e.target.value)}
                  style={{ 
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    opacity: !isEditing ? 0.85 : 1,
                    background: !isEditing ? 'rgba(0,0,0,0.2)' : undefined,
                    cursor: !isEditing ? 'default' : 'text'
                  }}
                />
              </div>

              {/* IFSC Code */}
              <div>
                <label className="form-label" style={{ fontWeight: 700, color: '#fbbf24' }}>
                  IFSC Code
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  className="form-input"
                  placeholder="Enter IFSC Code..."
                  value={formData.ifscCode || ''}
                  onChange={e => handleChange('ifscCode', e.target.value.toUpperCase())}
                  style={{ 
                    textTransform: 'uppercase',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    opacity: !isEditing ? 0.85 : 1,
                    background: !isEditing ? 'rgba(0,0,0,0.2)' : undefined,
                    cursor: !isEditing ? 'default' : 'text'
                  }}
                />
              </div>
            </div>
          </div>

          {/* BOTTOM ACTION BUTTONS */}
          {isEditing && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button 
                type="button" 
                onClick={handleCancelEdit} 
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={saving || loading}
                className="btn btn-secondary" 
                style={{ fontWeight: 800, padding: '0.65rem 1.75rem' }}
              >
                {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                <span>{saving ? 'Saving...' : 'Save Company Details'}</span>
              </button>
            </div>
          )}
        </form>

        {/* RIGHT COLUMN: LIVE TAX INVOICE PRINT PREVIEW */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.25rem', border: '1.5px solid rgba(52, 211, 153, 0.35)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.6rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontWeight: 800, fontSize: '0.95rem' }}>
                <Eye size={18} />
                <span>Live Tax Invoice Print Preview</span>
              </div>
              <span style={{ fontSize: '0.7rem', color: '#34d399', background: 'rgba(52, 211, 153, 0.15)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                Real-time Preview
              </span>
            </div>

            {/* MINIFIED INVOICE PREVIEW CONTAINER */}
            <div style={{ 
              background: '#ffffff', 
              color: '#000000', 
              padding: '12px', 
              borderRadius: '4px', 
              border: '1.5px solid #000', 
              fontSize: '9.5px', 
              fontFamily: 'Arial, sans-serif',
              lineHeight: 1.3
            }}>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '6px' }}>
                <div style={{ fontSize: '9px', fontWeight: 'bold', letterSpacing: '0.5px' }}>TAX INVOICE</div>
                <div style={{ fontSize: '13px', fontWeight: '900', fontFamily: 'Georgia, serif' }}>
                  {formData.companyName || 'SRI DURGA ENTERPRISES'}
                </div>
                <div style={{ fontSize: '8px' }}>
                  {formData.address || 'Enterprise Address'}
                </div>
                <div style={{ fontSize: '8px' }}>
                  E-mail : {formData.email || '-'} &nbsp;&bull;&nbsp; Cell: {formData.phone || '-'}
                </div>
              </div>

              {/* Mini Table with Live Metadata Values */}
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '8.5px', marginBottom: '6px' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #000' }}>
                    <td style={{ width: '22%', padding: '2px 4px', fontWeight: 'bold', borderRight: '1px solid #000' }}>Invoice No.</td>
                    <td style={{ width: '28%', padding: '2px 4px', borderRight: '1px solid #000' }}>04/26-27</td>
                    <td style={{ width: '22%', padding: '2px 4px', fontWeight: 'bold', borderRight: '1px solid #000' }}>Date</td>
                    <td style={{ width: '28%', padding: '2px 4px' }}>28/08/2026</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #000' }}>
                    <td style={{ width: '25%', padding: '2px 4px', fontWeight: 'bold', borderRight: '1px solid #000' }}>Contract No.</td>
                    <td style={{ width: '25%', padding: '2px 4px', borderRight: '1px solid #000' }}>{formData.contractNo || '9010038288'}</td>
                    <td style={{ width: '25%', padding: '2px 4px', fontWeight: 'bold', borderRight: '1px solid #000' }}>Page</td>
                    <td style={{ width: '25%', padding: '2px 4px' }}>1 of 1</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #000' }}>
                    <td style={{ padding: '2px 4px', fontWeight: 'bold', borderRight: '1px solid #000' }}>CON. Period</td>
                    <td style={{ padding: '2px 4px', borderRight: '1px solid #000' }}>{formData.contractPeriod || '01.05.2024 to 30.04.2027'}</td>
                    <td style={{ padding: '2px 4px', fontWeight: 'bold', borderRight: '1px solid #000' }}>Vendor Code</td>
                    <td style={{ padding: '2px 4px' }}>{formData.vendorCode || '840305'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #000' }}>
                    <td style={{ padding: '2px 4px', fontWeight: 'bold', borderRight: '1px solid #000' }}>P.O. No.</td>
                    <td style={{ padding: '2px 4px', borderRight: '1px solid #000' }}>5000173952</td>
                    <td style={{ padding: '2px 4px', fontWeight: 'bold', borderRight: '1px solid #000', background: '#dbe2ea' }}>GSTIN</td>
                    <td style={{ padding: '2px 4px', fontWeight: 'bold', background: '#dbe2ea' }}>{formData.gstin || '-'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #000' }}>
                    <td style={{ padding: '2px 4px', fontWeight: 'bold', borderRight: '1px solid #000' }}>B.G. No</td>
                    <td style={{ padding: '2px 4px', borderRight: '1px solid #000' }}>{formData.bgNo || '8110IPEBG240001 Validity : 30.09.2027'}</td>
                    <td style={{ padding: '2px 4px', fontWeight: 'bold', borderRight: '1px solid #000', background: '#dbe2ea' }}>PAN</td>
                    <td style={{ padding: '2px 4px', fontWeight: 'bold', background: '#dbe2ea' }}>{formData.pan || '-'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #000' }}>
                    <td style={{ padding: '2px 4px', fontWeight: 'bold', borderRight: '1px solid #000' }}>EPF Code</td>
                    <td style={{ padding: '2px 4px', borderRight: '1px solid #000' }}>{formData.epfCode || '-'}</td>
                    <td style={{ padding: '2px 4px', fontWeight: 'bold', borderRight: '1px solid #000', background: '#dbe2ea' }}>State Code</td>
                    <td style={{ padding: '2px 4px', fontWeight: 'bold', background: '#dbe2ea' }}>{formData.state || '-'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '2px 4px', fontWeight: 'bold', borderRight: '1px solid #000' }}>ESI CODE</td>
                    <td style={{ padding: '2px 4px', borderRight: '1px solid #000' }}>{formData.esiCode || '-'}</td>
                    <td style={{ padding: '2px 4px', fontWeight: 'bold', borderRight: '1px solid #000' }}>Invoice Value</td>
                    <td style={{ padding: '2px 4px', fontWeight: 'bold' }}>Rs. 11,800.00</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '7px', color: '#475569', marginTop: '6px' }}>
                <span>We hereby certify statutory clauses & remittances complied. E & O.E.</span>
                <span style={{ fontWeight: 'bold' }}>For {formData.companyName || 'SRI DURGA ENTERPRISES'}</span>
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.12)', borderRadius: '10px', padding: '0.85rem 1rem', fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={16} color="#fbbf24" style={{ flexShrink: 0 }} />
            <span>Changes saved here immediately update across all existing and new Tax Invoices and Proforma Invoices!</span>
          </div>
        </div>

      </div>

    </div>
  );
};
