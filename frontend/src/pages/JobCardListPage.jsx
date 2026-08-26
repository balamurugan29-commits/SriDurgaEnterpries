import React, { useState, useEffect } from 'react';
import { fetchJobCards, deleteJobCard } from '../services/api';
import { JobCardPrintModal } from '../components/JobCardPrintModal';
import { Toast } from '../components/Toast';
import { ClipboardList, Search, RefreshCw, Printer, Edit3, Trash2, Plus, ChevronRight } from 'lucide-react';

export const JobCardListPage = ({ onEditJobCard, onNewJobCard }) => {
  const [jobCards, setJobCards] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedJobCardForPrint, setSelectedJobCardForPrint] = useState(null);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

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

  const filteredJobCards = jobCards.filter(c => {
    const q = searchQuery.toLowerCase().trim();
    return !q ||
      (c.jobNo && c.jobNo.toLowerCase().includes(q)) ||
      (c.customerName && c.customerName.toLowerCase().includes(q)) ||
      (c.equipment && c.equipment.toLowerCase().includes(q)) ||
      (c.slNo && c.slNo.toLowerCase().includes(q)) ||
      (c.make && c.make.toLowerCase().includes(q));
  });

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
              View, search, edit, and print issued equipment job cards.
            </p>
          </div>
        </div>

        {onNewJobCard && (
          <button onClick={onNewJobCard} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
            <Plus size={15} /> + New Job Card
          </button>
        )}
      </div>

      {/* Records Table */}
      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        
        <div style={{ padding: '1rem 1.5rem', background: 'rgba(15, 23, 42, 0.6)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={16} color="var(--text-subtle)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              className="form-input" 
              style={{ paddingLeft: '2.5rem', fontSize: '0.85rem' }} 
              placeholder="Search by Job No, Customer, Equipment, Sl.No..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Total: <strong>{filteredJobCards.length}</strong> Job Cards
            </span>
            <button onClick={loadJobCards} className="btn btn-outline" style={{ fontSize: '0.8rem' }}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        <div className="custom-table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '60px', textAlign: 'center' }}>S.No</th>
                <th style={{ width: '140px' }}>Job No</th>
                <th style={{ width: '120px' }}>Date</th>
                <th>Customer</th>
                <th>Equipment Description</th>
                <th style={{ width: '130px' }}>Make</th>
                <th style={{ width: '130px' }}>Sl.No</th>
                <th style={{ width: '160px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem auto' }} />
                    <p style={{ margin: 0 }}>Loading Job Card records...</p>
                  </td>
                </tr>
              ) : filteredJobCards.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No Job Cards found matching your query.
                  </td>
                </tr>
              ) : (
                filteredJobCards.map((card, idx) => (
                  <tr key={card.id || idx}>
                    <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)' }}>
                      {idx + 1}
                    </td>
                    <td>
                      <span className="badge badge-code" style={{ color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.4)', background: 'rgba(245, 158, 11, 0.15)' }}>
                        {card.jobNo}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {card.jobDate}
                    </td>
                    <td style={{ fontWeight: 600, color: 'white' }}>
                      {card.customerName || 'N/A'}
                    </td>
                    <td style={{ color: 'var(--text-main)' }}>
                      {card.equipment || 'N/A'} {card.ratingHp ? `(${card.ratingHp} HP)` : ''}
                    </td>
                    <td style={{ color: 'var(--text-subtle)' }}>
                      {card.make || 'N/A'}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {card.slNo || 'N/A'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                        <button 
                          onClick={() => handleOpenPrintPreview(card)} 
                          className="btn btn-primary" 
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }} 
                          title="View & Print Job Card PDF"
                        >
                          <Printer size={13} /> Print
                        </button>

                        <button 
                          onClick={() => onEditJobCard && onEditJobCard(card)} 
                          className="btn btn-outline" 
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', color: '#818cf8', borderColor: 'rgba(99, 102, 241, 0.3)' }} 
                          title="Edit Job Card"
                        >
                          <Edit3 size={13} /> Edit
                        </button>

                        <button 
                          onClick={() => handleDelete(card)} 
                          className="btn btn-danger" 
                          style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem' }} 
                          title="Delete Job Card"
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

      <JobCardPrintModal 
        isOpen={printModalOpen} 
        onClose={() => setPrintModalOpen(false)} 
        jobCard={selectedJobCardForPrint} 
      />

    </div>
  );
};
