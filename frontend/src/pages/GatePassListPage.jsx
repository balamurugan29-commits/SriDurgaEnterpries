import React, { useState, useEffect } from 'react';
import { fetchGatePasses, deleteGatePass } from '../services/api';
import { GatePassPrintModal } from '../components/GatePassPrintModal';
import { Toast } from '../components/Toast';
import { Search, Plus, Calendar, User, Clipboard, Printer, Edit3, Trash2, ShieldAlert } from 'lucide-react';

export const GatePassListPage = ({ onEditGatePass, onNewGatePass }) => {
  const [gatePasses, setGatePasses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Print Preview state
  const [selectedPass, setSelectedPass] = useState(null);
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const loadGatePasses = async (query = '') => {
    try {
      setLoading(true);
      const list = await fetchGatePasses(query);
      setGatePasses(list || []);
    } catch (err) {
      showToast('Failed to load Out Gate Passes.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGatePasses(searchQuery);
  }, [searchQuery]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Out Gate Pass record?')) return;
    try {
      await deleteGatePass(id);
      showToast('Gate Pass record deleted successfully.');
      loadGatePasses(searchQuery);
    } catch (err) {
      showToast('Failed to delete Gate Pass.', 'error');
    }
  };

  const triggerPrintPreview = (gp) => {
    setSelectedPass(gp);
    setIsPrintOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Upper Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'white', marginBottom: '0.25rem' }}>
            Out Gate Pass History
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
            List, search, edit, delete, and reprint gate passes issued for material dispatch.
          </p>
        </div>

        <button onClick={onNewGatePass} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} />
          <span>New Gate Pass</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Search size={18} color="var(--text-muted)" />
        <input 
          type="text" 
          className="form-input" 
          placeholder="Search by Gate Pass No, receiver, or description..." 
          style={{ border: 'none', background: 'transparent', padding: 0 }}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Grid List of Records */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        {loading && gatePasses.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading records...
          </div>
        ) : gatePasses.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={36} color="var(--text-subtle)" />
            <span>No Out Gate Passes found. Click 'New Gate Pass' to create one!</span>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-light)', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '0.9rem 1.25rem', textAlign: 'left' }}>Gate Pass Details</th>
                  <th style={{ padding: '0.9rem 1.25rem', textAlign: 'left' }}>Date</th>
                  <th style={{ padding: '0.9rem 1.25rem', textAlign: 'left' }}>Receiver / Sender</th>
                  <th style={{ padding: '0.9rem 1.25rem', textAlign: 'center' }}>Items Count</th>
                  <th style={{ padding: '0.9rem 1.25rem', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {gatePasses.map((gp) => {
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
