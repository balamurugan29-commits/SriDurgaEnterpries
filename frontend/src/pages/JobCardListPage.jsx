import React, { useState, useEffect } from 'react';
import { fetchJobCards, deleteJobCard } from '../services/api';
import { JobCardPrintModal } from '../components/JobCardPrintModal';
import { Toast } from '../components/Toast';
import { ClipboardList, Search, RefreshCw, Printer, Edit3, Trash2, Plus, ChevronRight, Filter, FilterX, Calendar, Hash, User, Wrench, Paperclip, FileText, Image as ImageIcon, Download, Eye, X } from 'lucide-react';

export const JobCardListPage = ({ onEditJobCard, onNewJobCard }) => {
  const [jobCards, setJobCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobCardForPrint, setSelectedJobCardForPrint] = useState(null);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterJobNo, setFilterJobNo] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterEquipment, setFilterEquipment] = useState('');
  const [filterMake, setFilterMake] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const loadJobCards = async () => {
    try {
      setLoading(true);
      const data = await fetchJobCards();
      setJobCards(data || []);
    } catch (err) {
      console.error('Failed to load Job Cards:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobCards();
  }, []);

  const handleDelete = async (card) => {
    if (!window.confirm(`Are you sure you want to delete Job Card '${card.jobNo}'?`)) {
      return;
    }
    try {
      await deleteJobCard(card.id);
      setToast({ message: `Job Card '${card.jobNo}' deleted successfully`, type: 'success' });
      loadJobCards();
    } catch (err) {
      setToast({ message: 'Delete failed: ' + err.message, type: 'error' });
    }
  };

  const handleOpenPrintPreview = (card) => {
    setSelectedJobCardForPrint(card);
    setPrintModalOpen(true);
  };

  const handleDownloadAttachment = (attachment) => {
    if (!attachment?.url) return;
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name || `JobCard_${attachment.jobNo || 'Document'}.${attachment.type === 'pdf' ? 'pdf' : 'png'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterJobNo('');
    setFilterCustomer('');
    setFilterEquipment('');
    setFilterMake('');
    setFromDate('');
    setToDate('');
  };

  // Multi-criteria Filtering
  const filteredJobCards = jobCards.filter(c => {
    // 1. General Live Search
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      (c.jobNo && c.jobNo.toLowerCase().includes(q)) ||
      (c.customerName && c.customerName.toLowerCase().includes(q)) ||
      (c.equipment && c.equipment.toLowerCase().includes(q)) ||
      (c.slNo && c.slNo.toLowerCase().includes(q)) ||
      (c.make && c.make.toLowerCase().includes(q));

    // 2. Job No Filter
    const jobQ = filterJobNo.toLowerCase().trim();
    const matchesJobNo = !jobQ || (c.jobNo && c.jobNo.toLowerCase().includes(jobQ));

    // 3. Customer Filter
    const custQ = filterCustomer.toLowerCase().trim();
    const matchesCustomer = !custQ || (c.customerName && c.customerName.toLowerCase().includes(custQ));

    // 4. Equipment Filter
    const eqQ = filterEquipment.toLowerCase().trim();
    const matchesEquipment = !eqQ || (c.equipment && c.equipment.toLowerCase().includes(eqQ));

    // 5. Make Filter
    const makeQ = filterMake.toLowerCase().trim();
    const matchesMake = !makeQ || (c.make && c.make.toLowerCase().includes(makeQ));

    // 6. Date Range Filter
    let matchesDate = true;
    if (c.jobDate) {
      if (fromDate && c.jobDate < fromDate) {
        matchesDate = false;
      }
      if (toDate && c.jobDate > toDate) {
        matchesDate = false;
      }
    } else if (fromDate || toDate) {
      matchesDate = false;
    }

    return matchesSearch && matchesJobNo && matchesCustomer && matchesEquipment && matchesMake && matchesDate;
  });

  const activeFilterCount = [
    searchQuery,
    filterJobNo,
    filterCustomer,
    filterEquipment,
    filterMake,
    fromDate,
    toDate
  ].filter(Boolean).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.18) 0%, rgba(99, 102, 241, 0.12) 100%)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '16px', padding: '1.25rem 1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{ background: 'rgba(56, 189, 248, 0.25)', padding: '0.75rem', borderRadius: '12px', color: '#38bdf8' }}>
            <ClipboardList size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
              <span style={{ fontWeight: 600 }}>Sri Durga Management</span>
              <ChevronRight size={12} />
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>Job Card History</span>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Issued Job Cards History
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              View, search, filter, edit, and print issued equipment job cards.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
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
              background: showFilters ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : undefined,
              borderColor: activeFilterCount > 0 ? '#38bdf8' : undefined
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

          {onNewJobCard && (
            <button onClick={onNewJobCard} className="btn btn-primary" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Plus size={15} />
              <span>New Job Card</span>
            </button>
          )}
        </div>
      </div>

      {/* EXPANDABLE FILTER PANEL */}
      {showFilters && (
        <div className="glass-panel animate-modal-entry" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1.5px solid rgba(56, 189, 248, 0.35)', background: 'rgba(15, 23, 42, 0.95)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8', fontWeight: 800, fontSize: '0.95rem' }}>
              <Filter size={18} />
              <span>Job Card Filters</span>
              {activeFilterCount > 0 && (
                <span style={{ fontSize: '0.75rem', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '2px 8px', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.4)' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.875rem' }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.35rem' }}>Search Keywords</label>
              <div style={{ position: 'relative' }}>
                <Search size={15} color="var(--text-subtle)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
                  placeholder="Search Sl.No, Equipment..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.35rem', color: '#fbbf24' }}>Job Card No</label>
              <div style={{ position: 'relative' }}>
                <Hash size={15} color="#fbbf24" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.25rem', fontSize: '0.85rem', color: '#fbbf24', fontWeight: 600 }}
                  placeholder="e.g. 101/26-27"
                  value={filterJobNo}
                  onChange={e => setFilterJobNo(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.35rem' }}>Customer Name</label>
              <div style={{ position: 'relative' }}>
                <User size={15} color="var(--text-subtle)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
                  placeholder="e.g. ONGC..."
                  value={filterCustomer}
                  onChange={e => setFilterCustomer(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.35rem' }}>Equipment / Motor</label>
              <div style={{ position: 'relative' }}>
                <Wrench size={15} color="var(--text-subtle)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
                  placeholder="e.g. Induction Motor..."
                  value={filterEquipment}
                  onChange={e => setFilterEquipment(e.target.value)}
                />
              </div>
            </div>

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
              Showing <strong>{filteredJobCards.length}</strong> of <strong>{jobCards.length}</strong> Job Cards
            </span>
            {activeFilterCount > 0 && (
              <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                Filtered
              </span>
            )}
          </div>
          <button onClick={loadJobCards} className="btn btn-outline" style={{ fontSize: '0.8rem' }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        <div className="custom-table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '50px', textAlign: 'center' }}>S.No</th>
                <th style={{ width: '130px' }}>Job No</th>
                <th style={{ width: '110px' }}>Date</th>
                <th>Customer</th>
                <th>Equipment Description</th>
                <th style={{ width: '110px' }}>Make</th>
                <th style={{ width: '110px' }}>Sl.No</th>
                <th style={{ width: '110px', textAlign: 'center' }}>Attachment</th>
                <th style={{ width: '160px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem auto' }} />
                    <p style={{ margin: 0 }}>Loading Job Card records...</p>
                  </td>
                </tr>
              ) : filteredJobCards.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No Job Cards found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredJobCards.map((card, idx) => (
                  <tr key={card.id || idx}>
                    <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)' }}>{idx + 1}</td>
                    <td><span className="badge badge-code" style={{ color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.4)', background: 'rgba(245, 158, 11, 0.15)' }}>{card.jobNo}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{card.jobDate}</td>
                    <td style={{ fontWeight: 600, color: 'white' }}>{card.customerName || 'N/A'}</td>
                    <td style={{ color: 'var(--text-main)' }}>{card.equipment || 'N/A'} {card.ratingHp ? `(${card.ratingHp} HP)` : ''}</td>
                    <td style={{ color: 'var(--text-subtle)' }}>{card.make || 'N/A'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{card.slNo || 'N/A'}</td>
                    <td style={{ textAlign: 'center' }}>
                      {card.diagramPhoto ? (
                        (card.attachmentType === 'pdf' || card.diagramPhoto.startsWith('data:application/pdf')) ? (
                          <button onClick={() => setPreviewAttachment({ url: card.diagramPhoto, name: card.attachmentName || `${card.jobNo.replace(/\//g, '_')}_Document.pdf`, type: 'pdf', jobNo: card.jobNo })} className="btn btn-outline" style={{ padding: '0.25rem 0.55rem', fontSize: '0.725rem', color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.4)', background: 'rgba(244, 63, 94, 0.12)', gap: '4px', fontWeight: 700 }}>
                            <FileText size={12} /> <span>PDF</span>
                          </button>
                        ) : (
                          <button onClick={() => setPreviewAttachment({ url: card.diagramPhoto, name: card.attachmentName || `${card.jobNo.replace(/\//g, '_')}_Photo.png`, type: 'image', jobNo: card.jobNo })} className="btn btn-outline" style={{ padding: '0.25rem 0.55rem', fontSize: '0.725rem', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.4)', background: 'rgba(16, 185, 129, 0.12)', gap: '4px', fontWeight: 700 }}>
                            <ImageIcon size={12} /> <span>Photo</span>
                          </button>
                        )
                      ) : <span style={{ color: 'var(--text-subtle)', fontSize: '0.75rem' }}>-</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                        <button onClick={() => handleOpenPrintPreview(card)} className="btn btn-primary" style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }} title="View & Print Job Card PDF"><Printer size={13} /> Print</button>
                        <button onClick={() => onEditJobCard && onEditJobCard(card)} className="btn btn-outline" style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', color: '#818cf8', borderColor: 'rgba(99, 102, 241, 0.3)' }} title="Edit Job Card"><Edit3 size={13} /> Edit</button>
                        <button onClick={() => handleDelete(card)} className="btn btn-danger" style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem' }} title="Delete Job Card"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {previewAttachment && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999999, background: 'rgba(15, 23, 42, 0.88)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', animation: 'fadeIn 0.2s ease-out' }} onClick={() => setPreviewAttachment(null)}>
          <div style={{ background: 'var(--bg-card, #0f172a)', border: '1.5px solid var(--border-color-accent, rgba(99, 102, 241, 0.4))', borderRadius: '16px', width: '100%', maxWidth: '960px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.6)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', background: 'rgba(15, 23, 42, 0.6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: previewAttachment.type === 'pdf' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: previewAttachment.type === 'pdf' ? '#f43f5e' : '#10b981' }}>
                  {previewAttachment.type === 'pdf' ? <FileText size={20} /> : <ImageIcon size={20} />}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>{previewAttachment.name}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Job Card: <strong style={{ color: '#818cf8' }}>{previewAttachment.jobNo}</strong> &bull; {previewAttachment.type === 'pdf' ? 'PDF Document Viewer' : 'Photo Viewer'}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button type="button" onClick={() => handleDownloadAttachment(previewAttachment)} className="btn btn-outline" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', color: '#34d399', borderColor: 'rgba(52, 211, 153, 0.4)' }}><Download size={14} /> Download</button>
                <button type="button" onClick={() => setPreviewAttachment(null)} className="btn btn-outline" style={{ width: '36px', height: '36px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Close (Esc)"><X size={16} /></button>
              </div>
            </div>
            <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '480px' }}>
              {previewAttachment.type === 'pdf' ? (
                <iframe src={previewAttachment.url} title="PDF Attachment Viewer" style={{ width: '100%', height: '70vh', border: 'none', borderRadius: '8px', background: '#fff' }} />
              ) : (
                <img src={previewAttachment.url} alt="Attachment Fullscreen" style={{ maxWidth: '100%', maxHeight: '72vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }} />
              )}
            </div>
          </div>
        </div>
      )}

      <JobCardPrintModal 
        isOpen={printModalOpen} 
        onClose={() => setPrintModalOpen(false)} 
        jobCard={selectedJobCardForPrint} 
      />
    </div>
  );
};
