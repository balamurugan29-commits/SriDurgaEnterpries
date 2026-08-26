import React, { useState, useEffect } from 'react';
import { fetchGatePasses, deleteGatePass } from '../services/api';
import { GatePassPrintModal } from '../components/GatePassPrintModal';
import { Toast } from '../components/Toast';
import { Search, Plus, Calendar, User, Clipboard, Printer, Edit3, Trash2, ShieldAlert, Eye, Filter, FilterX, Hash, MapPin, ArrowLeftRight, RefreshCw } from 'lucide-react';

export const GatePassListPage = ({ onEditGatePass, onNewGatePass }) => {
  const [gatePasses, setGatePasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPassNo, setFilterPassNo] = useState('');
  const [filterPassType, setFilterPassType] = useState(''); // '' (All), 'IN', 'OUT'
  const [filterReceiver, setFilterReceiver] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Print Preview state
  const [selectedPass, setSelectedPass] = useState(null);
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const loadGatePasses = async () => {
    try {
      setLoading(true);
      const list = await fetchGatePasses();
      setGatePasses(list || []);
    } catch (err) {
      showToast('Failed to load Out Gate Passes.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGatePasses();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Out Gate Pass record?')) return;
    try {
      await deleteGatePass(id);
      showToast('Gate Pass record deleted successfully.');
      loadGatePasses();
    } catch (err) {
      showToast('Failed to delete Gate Pass.', 'error');
    }
  };

  const triggerPrintPreview = (gp) => {
    setSelectedPass(gp);
    setIsPrintOpen(true);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterPassNo('');
    setFilterPassType('');
    setFilterReceiver('');
    setFilterSite('');
    setFromDate('');
    setToDate('');
  };

  // Multi-criteria Filtering
  const filteredGatePasses = gatePasses.filter(gp => {
    // 1. General Search
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      (gp.gatePassNo && gp.gatePassNo.toLowerCase().includes(q)) ||
      (gp.receiverName && gp.receiverName.toLowerCase().includes(q)) ||
      (gp.siteName && gp.siteName.toLowerCase().includes(q)) ||
      (gp.purpose && gp.purpose.toLowerCase().includes(q)) ||
      (gp.items && gp.items.some(i => i.description && i.description.toLowerCase().includes(q)));

    // 2. Pass No Filter
    const passQ = filterPassNo.toLowerCase().trim();
    const matchesPassNo = !passQ || (gp.gatePassNo && gp.gatePassNo.toLowerCase().includes(passQ));

    // 3. Pass Type Filter (IN / OUT)
    const matchesPassType = !filterPassType || gp.passType === filterPassType;

    // 4. Receiver Filter
    const recQ = filterReceiver.toLowerCase().trim();
    const matchesReceiver = !recQ || (gp.receiverName && gp.receiverName.toLowerCase().includes(recQ));

    // 5. Site Filter
    const siteQ = filterSite.toLowerCase().trim();
    const matchesSite = !siteQ || (gp.siteName && gp.siteName.toLowerCase().includes(siteQ));

    // 6. Date Range Filter
    let matchesDate = true;
    if (gp.gatePassDate) {
      if (fromDate && gp.gatePassDate < fromDate) {
        matchesDate = false;
      }
      if (toDate && gp.gatePassDate > toDate) {
        matchesDate = false;
      }
    } else if (fromDate || toDate) {
      matchesDate = false;
    }

    return matchesSearch && matchesPassNo && matchesPassType && matchesReceiver && matchesSite && matchesDate;
  });

  const activeFilterCount = [
    searchQuery,
    filterPassNo,
    filterPassType,
    filterReceiver,
    filterSite,
    fromDate,
    toDate
  ].filter(Boolean).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Upper Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'white', marginBottom: '0.25rem' }}>
            In & Out Gate Pass History
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
            List, search, filter, edit, delete, and reprint gate passes issued for material dispatch.
          </p>
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

          <button onClick={onNewGatePass} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={16} />
            <span>New Gate Pass</span>
          </button>
        </div>
      </div>

      {/* EXPANDABLE FILTER PANEL */}
      {showFilters && (
        <div className="glass-panel animate-modal-entry" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1.5px solid rgba(16, 185, 129, 0.35)', background: 'rgba(15, 23, 42, 0.95)' }}>
          {/* Filter Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontWeight: 800, fontSize: '0.95rem' }}>
              <Filter size={18} />
              <span>Gate Pass Filters</span>
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
                  placeholder="Search Receiver, Item..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* 2. Gate Pass Number */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.35rem', color: '#34d399' }}>Gate Pass No</label>
              <div style={{ position: 'relative' }}>
                <Hash size={15} color="#34d399" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.25rem', fontSize: '0.85rem', color: '#34d399', fontWeight: 600 }}
                  placeholder="e.g. SDE/GP/..."
                  value={filterPassNo}
                  onChange={e => setFilterPassNo(e.target.value)}
                />
              </div>
            </div>

            {/* 3. Pass Type (IN / OUT / ALL) */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.35rem' }}>Pass Type</label>
              <select
                className="form-input"
                style={{ fontSize: '0.85rem' }}
                value={filterPassType}
                onChange={e => setFilterPassType(e.target.value)}
              >
                <option value="">All Types (IN & OUT)</option>
                <option value="OUT">OUT PASS (To / Dispatch)</option>
                <option value="IN">IN PASS (From / Inward)</option>
              </select>
            </div>

            {/* 4. Receiver / Sender Name */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.35rem' }}>Receiver / Sender</label>
              <div style={{ position: 'relative' }}>
                <User size={15} color="var(--text-subtle)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
                  placeholder="e.g. ONGC, Contractor..."
                  value={filterReceiver}
                  onChange={e => setFilterReceiver(e.target.value)}
                />
              </div>
            </div>

            {/* 5. Site Name */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.35rem' }}>Site Name / Location</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={15} color="var(--text-subtle)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
                  placeholder="e.g. Karaikal Site..."
                  value={filterSite}
                  onChange={e => setFilterSite(e.target.value)}
                />
              </div>
            </div>

            {/* 6. From Date */}
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

            {/* 7. To Date */}
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

      {/* Grid List of Records */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', background: 'rgba(15, 23, 42, 0.6)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <span style={{ fontSize: '0.9rem', color: '#f8fafc', fontWeight: 700 }}>
              Showing <strong>{filteredGatePasses.length}</strong> of <strong>{gatePasses.length}</strong> Gate Passes
            </span>
            {activeFilterCount > 0 && (
              <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                Filtered
              </span>
            )}
          </div>

          <button onClick={loadGatePasses} className="btn btn-outline" style={{ fontSize: '0.8rem' }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {loading && gatePasses.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading records...
          </div>
        ) : filteredGatePasses.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={36} color="var(--text-subtle)" />
            <span>No Gate Passes found matching the filter criteria.</span>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-light)', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '0.9rem 1.25rem', textAlign: 'left' }}>Gate Pass Details</th>
                  <th style={{ padding: '0.9rem 1.25rem', textAlign: 'left' }}>Date</th>
                  <th style={{ padding: '0.9rem 1.25rem', textAlign: 'left' }}>Receiver / Sender</th>
                  <th style={{ padding: '0.9rem 1.25rem', textAlign: 'left' }}>Site Name</th>
                  <th style={{ padding: '0.9rem 1.25rem', textAlign: 'center' }}>Items Count</th>
                  <th style={{ padding: '0.9rem 1.25rem', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGatePasses.map((gp) => {
                  const dateStr = gp.gatePassDate 
                    ? new Date(gp.gatePassDate).toLocaleDateString('en-GB')
                    : 'N/A';
                  return (
                    <tr key={gp.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.02)', transition: 'background-color 0.2s' }} className="hover-row">
                      <td style={{ padding: '0.9rem 1.25rem', fontWeight: '700', color: 'white' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <span>{gp.gatePassNo}</span>
                          <span style={{ 
                            alignSelf: 'flex-start',
                            fontSize: '0.65rem',
                            fontWeight: 'bold',
                            padding: '0.1rem 0.4rem',
                            borderRadius: '4px',
                            background: gp.passType === 'IN' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            color: gp.passType === 'IN' ? '#38bdf8' : '#34d399',
                            border: gp.passType === 'IN' ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)'
                          }}>
                            {gp.passType === 'IN' ? 'IN PASS (From)' : 'OUT PASS (To)'}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem', color: 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Calendar size={14} color="#818cf8" />
                          <span>{dateStr}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem', whiteSpace: 'pre-line' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                          <User size={14} color="#34d399" style={{ marginTop: '3px' }} />
                          <span>{gp.receiverName}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem' }}>
                        <span style={{ fontWeight: '500', color: gp.siteName ? 'white' : 'var(--text-muted)' }}>
                          {gp.siteName || '-'}
                        </span>
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem', textAlign: 'center' }}>
                        <span style={{ background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700' }}>
                          {gp.items ? gp.items.length : 0} items
                        </span>
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button 
                            onClick={() => triggerPrintPreview(gp)} 
                            className="btn btn-outline" 
                            style={{ padding: '0.45rem', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                            title="View Details"
                          >
                            <Eye size={15} color="#34d399" />
                          </button>

                          <button 
                            onClick={() => triggerPrintPreview(gp)} 
                            className="btn btn-outline" 
                            style={{ padding: '0.45rem', borderColor: 'rgba(56, 189, 248, 0.3)' }}
                            title="Print Preview / PDF"
                          >
                            <Printer size={15} color="#38bdf8" />
                          </button>
                          
                          <button 
                            onClick={() => onEditGatePass(gp)} 
                            className="btn btn-outline" 
                            style={{ padding: '0.45rem', borderColor: 'rgba(99, 102, 241, 0.3)' }}
                            title="Edit"
                          >
                            <Edit3 size={15} color="#818cf8" />
                          </button>

                          <button 
                            onClick={() => handleDelete(gp.id)} 
                            className="btn btn-outline" 
                            style={{ padding: '0.45rem', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                            title="Delete"
                          >
                            <Trash2 size={15} color="#ef4444" />
                          </button>
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

      {/* Render Print Preview Modal */}
      {isPrintOpen && (
        <GatePassPrintModal 
          isOpen={isPrintOpen} 
          onClose={() => {
            setIsPrintOpen(false);
            setSelectedPass(null);
          }} 
          gatePass={selectedPass} 
        />
      )}

      {/* Toast Alert */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

    </div>
  );
};
