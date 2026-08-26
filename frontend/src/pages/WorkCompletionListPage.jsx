import React, { useState, useEffect } from 'react';
import { fetchCertificates, deleteCertificate } from '../services/api';
import { WorkCompletionPrintModal } from '../components/WorkCompletionPrintModal';
import { Toast } from '../components/Toast';
import { Award, Search, RefreshCw, Printer, Edit3, Trash2, Plus, ChevronRight, Filter, FilterX, Calendar, Hash, MapPin, FileText } from 'lucide-react';

export const WorkCompletionListPage = ({ onEditCertificate, onNewCertificate }) => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCertForPrint, setSelectedCertForPrint] = useState(null);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCertNo, setFilterCertNo] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterRcRef, setFilterRcRef] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const data = await fetchCertificates();
      setCertificates(data || []);
    } catch (err) {
      console.error('Failed to load certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCertificates();
  }, []);

  const handleDelete = async (cert) => {
    if (!window.confirm(`Are you sure you want to delete Certificate '${cert.certificateNo}'?`)) {
      return;
    }
    try {
      await deleteCertificate(cert.id);
      setToast({ message: `Certificate '${cert.certificateNo}' deleted successfully`, type: 'success' });
      loadCertificates();
    } catch (err) {
      setToast({ message: 'Delete failed: ' + err.message, type: 'error' });
    }
  };

  const handleOpenPrint = (cert) => {
    setSelectedCertForPrint(cert);
    setPrintModalOpen(true);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterCertNo('');
    setFilterLocation('');
    setFilterRcRef('');
    setFromDate('');
    setToDate('');
  };

  // Filter Logic
  const filteredCertificates = certificates.filter(c => {
    // 1. General Search
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      (c.certificateNo && c.certificateNo.toLowerCase().includes(q)) ||
      (c.rateContractRef && c.rateContractRef.toLowerCase().includes(q)) ||
      (c.equipmentDescription && c.equipmentDescription.toLowerCase().includes(q)) ||
      (c.location && c.location.toLowerCase().includes(q)) ||
      (c.items && c.items.some(i => i.rcItemNo && i.rcItemNo.toLowerCase().includes(q))) ||
      (c.items && c.items.some(i => i.description && i.description.toLowerCase().includes(q)));

    // 2. Certificate No Filter
    const certQ = filterCertNo.toLowerCase().trim();
    const matchesCertNo = !certQ || (c.certificateNo && c.certificateNo.toLowerCase().includes(certQ));

    // 3. Location Filter
    const locQ = filterLocation.toLowerCase().trim();
    const matchesLocation = !locQ || (c.location && c.location.toLowerCase().includes(locQ));

    // 4. Rate Contract Ref Filter
    const rcQ = filterRcRef.toLowerCase().trim();
    const matchesRcRef = !rcQ || (c.rateContractRef && c.rateContractRef.toLowerCase().includes(rcQ));

    // 5. Date Range Filter
    let matchesDate = true;
    if (c.certificateDate) {
      if (fromDate && c.certificateDate < fromDate) {
        matchesDate = false;
      }
      if (toDate && c.certificateDate > toDate) {
        matchesDate = false;
      }
    } else if (fromDate || toDate) {
      matchesDate = false;
    }

    return matchesSearch && matchesCertNo && matchesLocation && matchesRcRef && matchesDate;
  });

  const activeFilterCount = [
    searchQuery,
    filterCertNo,
    filterLocation,
    filterRcRef,
    fromDate,
    toDate
  ].filter(Boolean).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(56, 189, 248, 0.15) 100%)', border: '1px solid rgba(16, 185, 129, 0.35)', borderRadius: '16px', padding: '1.25rem 1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.25)', padding: '0.75rem', borderRadius: '12px', color: '#34d399' }}>
            <Award size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
              <span style={{ fontWeight: 600 }}>Workflow:</span>
              <span style={{ color: '#34d399', fontWeight: 700 }}>Work Completion History</span>
              <ChevronRight size={12} />
              <span style={{ color: 'var(--text-muted)' }}>Tax Invoice</span>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Issued Work Completion Certificates History
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              View, search, filter, edit, and print generated Work Completion Certificates & Joint Inspection Reports.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* FILTER BUTTON WITH ACTIVE BADGE */}
          <button 
            onClick={() => setShowFilters(prev => !prev)} 
            className={`btn ${showFilters || activeFilterCount > 0 ? 'btn-primary' : 'btn-outline'}`}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              padding: '0.55rem 1rem', 
              fontSize: '0.85rem',
              fontWeight: 700,
              background: showFilters ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : undefined,
              borderColor: activeFilterCount > 0 ? '#34d399' : undefined
            }}
            title="Toggle Filter Options"
          >
            <Filter size={16} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span style={{ 
                background: '#fbbf24', 
                color: '#0f172a', 
                borderRadius: '50%', 
                width: '20px', 
                height: '20px', 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '0.75rem', 
                fontWeight: 900,
                marginLeft: '0.2rem'
              }}>
                {activeFilterCount}
              </span>
            )}
          </button>

          {onNewCertificate && (
            <button onClick={onNewCertificate} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
              <Plus size={15} /> + New Certificate
            </button>
          )}
        </div>
      </div>

      {/* EXPANDABLE FILTER PANEL */}
      {showFilters && (
        <div className="glass-panel animate-modal-entry" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1.5px solid rgba(16, 185, 129, 0.35)', background: 'rgba(15, 23, 42, 0.95)' }}>
          {/* Filter Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontWeight: 800, fontSize: '0.95rem' }}>
              <Filter size={18} />
              <span>Search & Filter Parameters</span>
              {activeFilterCount > 0 && (
                <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '2px 8px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                  {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} applied
                </span>
              )}
            </div>

            {activeFilterCount > 0 && (
              <button 
                onClick={handleResetFilters}
                className="btn btn-outline"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.35)' }}
                title="Clear all active filter fields"
              >
                <FilterX size={14} /> Clear All Filters
              </button>
            )}
          </div>

          {/* Filter Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.875rem' }}>
            {/* 1. Global Live Search */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.35rem' }}>Search Keywords</label>
              <div style={{ position: 'relative' }}>
                <Search size={15} color="var(--text-subtle)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
                  placeholder="Search Description, Items..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* 2. Certificate Number */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.35rem', color: '#34d399' }}>Certificate No</label>
              <div style={{ position: 'relative' }}>
                <Hash size={15} color="#34d399" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.25rem', fontSize: '0.85rem', color: '#34d399', fontWeight: 600 }}
                  placeholder="e.g. SDE/WCC/..."
                  value={filterCertNo}
                  onChange={e => setFilterCertNo(e.target.value)}
                />
              </div>
            </div>

            {/* 3. Location Filter */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.35rem' }}>Location / Site</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={15} color="var(--text-subtle)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
                  placeholder="e.g. RMD#GCS..."
                  value={filterLocation}
                  onChange={e => setFilterLocation(e.target.value)}
                />
              </div>
            </div>

            {/* 4. Rate Contract Ref */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.35rem' }}>Rate Contract Ref</label>
              <div style={{ position: 'relative' }}>
                <FileText size={15} color="var(--text-subtle)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
                  placeholder="e.g. 9010038288..."
                  value={filterRcRef}
                  onChange={e => setFilterRcRef(e.target.value)}
                />
              </div>
            </div>

            {/* 5. From Date */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.35rem' }}>From Date</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={15} color="var(--text-subtle)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="date"
                  className="form-input"
                  style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                />
              </div>
            </div>

            {/* 6. To Date */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.35rem' }}>To Date</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={15} color="var(--text-subtle)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="date"
                  className="form-input"
                  style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Records Table */}
      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        
        <div style={{ padding: '1rem 1.5rem', background: 'rgba(15, 23, 42, 0.6)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <span style={{ fontSize: '0.9rem', color: '#f8fafc', fontWeight: 700 }}>
              Showing <strong>{filteredCertificates.length}</strong> of <strong>{certificates.length}</strong> Certificates
            </span>
            {activeFilterCount > 0 && (
              <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                Filtered
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={loadCertificates} className="btn btn-outline" style={{ fontSize: '0.8rem' }}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        <div className="custom-table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '60px', textAlign: 'center' }}>S.No</th>
                <th style={{ width: '150px' }}>Certificate No</th>
                <th style={{ width: '120px' }}>Date</th>
                <th>Description / Location</th>
                <th>Rate Contract Ref</th>
                <th style={{ width: '100px', textAlign: 'center' }}>RC Items</th>
                <th style={{ width: '180px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem auto' }} />
                    <p style={{ margin: 0 }}>Loading Certificate records...</p>
                  </td>
                </tr>
              ) : filteredCertificates.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No Work Completion Certificates found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredCertificates.map((cert, idx) => (
                  <tr key={cert.id || idx}>
                    <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)' }}>
                      {idx + 1}
                    </td>
                    <td>
                      <span className="badge badge-code" style={{ color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.4)', background: 'rgba(16, 185, 129, 0.15)' }}>
                        {cert.certificateNo}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {cert.certificateDate}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'white' }}>{cert.equipmentDescription || 'Material'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#38bdf8' }}>Location: {cert.location || 'RMD#GCS'}</div>
                    </td>
                    <td style={{ color: 'var(--text-subtle)', fontSize: '0.8rem' }}>
                      {cert.rateContractRef ? cert.rateContractRef.slice(0, 35) + '...' : '-'}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>
                      <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                        {cert.items ? cert.items.length : 0} items
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                        <button 
                          onClick={() => handleOpenPrint(cert)} 
                          className="btn btn-primary" 
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }} 
                          title="View & Print Certificate PDF"
                        >
                          <Printer size={13} /> Print
                        </button>

                        <button 
                          onClick={() => onEditCertificate && onEditCertificate(cert)} 
                          className="btn btn-outline" 
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', color: '#818cf8', borderColor: 'rgba(99, 102, 241, 0.3)' }} 
                          title="Edit Certificate"
                        >
                          <Edit3 size={13} /> Edit
                        </button>

                        <button 
                          onClick={() => handleDelete(cert)} 
                          className="btn btn-danger" 
                          style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem' }} 
                          title="Delete Certificate"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <WorkCompletionPrintModal 
        isOpen={printModalOpen} 
        onClose={() => setPrintModalOpen(false)} 
        certificate={selectedCertForPrint} 
      />

    </div>
  );
};
