import React, { useState, useEffect, useMemo } from 'react';
import { 
  fetchProformas, 
  deleteProforma 
} from '../services/api';
import { printProformaInvoiceDirect } from '../utils/proformaInvoicePrint';
import { ProformaPrintModal } from '../components/ProformaPrintModal';
import { Toast } from '../components/Toast';
import { 
  FileSpreadsheet, 
  Search, 
  Plus, 
  Trash2, 
  Printer, 
  Edit3, 
  Eye, 
  RefreshCw, 
  TrendingUp, 
  Calendar,
  Building2,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ProformaInvoiceListPage = ({ onEditProforma }) => {
  const navigate = useNavigate();
  const [proformas, setProformas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('ALL'); // 'ALL', 'THIS_MONTH', 'LAST_MONTH', 'THIS_FY'
  const [selectedProforma, setSelectedProforma] = useState(null);
  const [toast, setToast] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchProformas();
      setProformas(data || []);
    } catch (err) {
      setToast({ message: 'Failed to load Proforma Invoices: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtering Logic
  const filteredProformas = useMemo(() => {
    let result = proformas;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        (p.proformaNumber && p.proformaNumber.toLowerCase().includes(q)) ||
        (p.customerName && p.customerName.toLowerCase().includes(q)) ||
        (p.equipmentHeader && p.equipmentHeader.toLowerCase().includes(q)) ||
        (p.notes && p.notes.toLowerCase().includes(q))
      );
    }

    if (dateFilter !== 'ALL') {
      const now = new Date();
      result = result.filter(p => {
        if (!p.proformaDate) return false;
        const d = new Date(p.proformaDate);
        if (dateFilter === 'THIS_MONTH') {
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }
        if (dateFilter === 'LAST_MONTH') {
          const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
          const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
          return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
        }
        if (dateFilter === 'THIS_FY') {
          const fyStartYear = (now.getMonth() >= 3) ? now.getFullYear() : now.getFullYear() - 1;
          const pFyStartYear = (d.getMonth() >= 3) ? d.getFullYear() : d.getFullYear() - 1;
          return fyStartYear === pFyStartYear;
        }
        return true;
      });
    }

    return result;
  }, [proformas, searchQuery, dateFilter]);

  // Aggregate Metrics
  const totalCount = filteredProformas.length;
  const totalAmount = useMemo(() => {
    return filteredProformas.reduce((sum, p) => sum + (Number(p.totalAmount) || 0), 0);
  }, [filteredProformas]);

  const handleDelete = async (p) => {
    if (!window.confirm(`Are you sure you want to delete Proforma Invoice '${p.proformaNumber}'?`)) {
      return;
    }
    try {
      await deleteProforma(p.id);
      setToast({ message: `Proforma Invoice '${p.proformaNumber}' deleted successfully!`, type: 'success' });
      await loadData();
    } catch (err) {
      setToast({ message: 'Failed to delete Proforma Invoice: ' + err.message, type: 'error' });
    }
  };

  const handleEdit = (p) => {
    if (onEditProforma) {
      onEditProforma(p);
    } else {
      navigate('/proforma-invoice', { state: { proforma: p } });
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileSpreadsheet size={22} color="#38bdf8" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
              Proforma Invoice History
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
              Search, filter, view estimates, print, or convert previous proforma records.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <button
            onClick={loadData}
            className="btn btn-outline"
            style={{ fontSize: '0.85rem', padding: '0.55rem 0.85rem' }}
            title="Refresh Data"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => navigate('/proforma-invoice')}
            className="btn btn-primary"
            style={{ fontSize: '0.85rem', padding: '0.55rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <Plus size={16} />
            <span>Create Proforma</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        <div className="glass-panel" style={{ padding: '1.15rem 1.35rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={20} color="#38bdf8" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Proforma Invoices Count
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '2px' }}>
              {totalCount}
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.15rem 1.35rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(52, 211, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={20} color="#34d399" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Estimate Value
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#34d399', marginTop: '2px' }}>
              ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '260px', maxWidth: '450px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.25rem', fontSize: '0.85rem', width: '100%' }}
            placeholder="Search Proforma No, Customer, Work..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Period:</span>
          {['ALL', 'THIS_MONTH', 'LAST_MONTH', 'THIS_FY'].map(f => (
            <button
              key={f}
              onClick={() => setDateFilter(f)}
              className={`btn ${dateFilter === f ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
            >
              {f === 'ALL' ? 'All Time' : f === 'THIS_MONTH' ? 'This Month' : f === 'LAST_MONTH' ? 'Last Month' : 'This FY'}
            </button>
          ))}
        </div>
      </div>

      {/* History Table */}
      <div className="glass-panel" style={{ padding: '1.25rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: 'rgba(30, 41, 59, 0.6)', borderBottom: '1.5px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '10px', width: '5%', textAlign: 'center' }}>#</th>
              <th style={{ padding: '10px', width: '14%', textAlign: 'left' }}>Proforma No</th>
              <th style={{ padding: '10px', width: '11%', textAlign: 'center' }}>Date</th>
              <th style={{ padding: '10px', width: '30%', textAlign: 'left' }}>Customer Name & Subject</th>
              <th style={{ padding: '10px', width: '8%', textAlign: 'center' }}>Items</th>
              <th style={{ padding: '10px', width: '14%', textAlign: 'right' }}>Total (₹)</th>
              <th style={{ padding: '10px', width: '18%', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProformas.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  {loading ? 'Loading Proforma Invoices...' : 'No Proforma Invoices found.'}
                </td>
              </tr>
            ) : (
              filteredProformas.map((p, idx) => (
                <tr 
                  key={p.id || idx}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <td style={{ padding: '10px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    {idx + 1}
                  </td>
                  <td style={{ padding: '10px', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.03em' }}>
                    {p.proformaNumber}
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center', color: 'var(--text-main)' }}>
                    {p.proformaDate ? new Date(p.proformaDate).toLocaleDateString('en-GB') : '-'}
                  </td>
                  <td style={{ padding: '10px' }}>
                    <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{p.customerName || 'N/A'}</div>
                    {p.equipmentHeader && (
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {p.equipmentHeader}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center', fontWeight: 700 }}>
                    {Array.isArray(p.items) ? p.items.length : '-'}
                  </td>
                  <td style={{ padding: '10px', textAlign: 'right', fontWeight: 900, color: '#34d399', fontSize: '0.95rem' }}>
                    ₹{Number(p.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                      <button
                        onClick={() => setSelectedProforma(p)}
                        className="btn btn-outline"
                        style={{ padding: '0.35rem 0.55rem', fontSize: '0.75rem' }}
                        title="Preview & Export PDF"
                      >
                        <Eye size={14} color="#38bdf8" />
                      </button>

                      <button
                        onClick={() => printProformaInvoiceDirect(p)}
                        className="btn btn-outline"
                        style={{ padding: '0.35rem 0.55rem', fontSize: '0.75rem' }}
                        title="Direct Print (A4)"
                      >
                        <Printer size={14} color="#34d399" />
                      </button>

                      <button
                        onClick={() => handleEdit(p)}
                        className="btn btn-outline"
                        style={{ padding: '0.35rem 0.55rem', fontSize: '0.75rem' }}
                        title="Edit Proforma Invoice"
                      >
                        <Edit3 size={14} color="#fbbf24" />
                      </button>

                      <button
                        onClick={() => handleDelete(p)}
                        className="btn btn-outline"
                        style={{ padding: '0.35rem 0.55rem', fontSize: '0.75rem', borderColor: 'rgba(239,68,68,0.3)' }}
                        title="Delete Proforma Invoice"
                      >
                        <Trash2 size={14} color="#ef4444" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Preview Modal */}
      {selectedProforma && (
        <ProformaPrintModal
          isOpen={!!selectedProforma}
          onClose={() => setSelectedProforma(null)}
          proforma={selectedProforma}
        />
      )}
    </div>
  );
};
