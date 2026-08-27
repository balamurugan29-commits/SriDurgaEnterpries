import React, { useState, useEffect, useMemo } from 'react';
import { 
  fetchProformas, 
  deleteProforma 
} from '../services/api';
import { printProformaInvoiceDirect } from '../utils/proformaInvoicePrint';
import { ProformaPrintModal } from '../components/ProformaPrintModal';
import { ExportDesignerModal } from '../components/ExportDesignerModal';
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
  FileText,
  Filter,
  FilterX,
  Download,
  Hash,
  User,
  CreditCard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PROFORMA_COLUMNS = [
  { key: 'proformaNumber', label: 'PROFORMA NO.' },
  { key: 'proformaDate', label: 'DATE' },
  { key: 'customerName', label: 'CUSTOMER NAME' },
  { key: 'customerGstin', label: 'CUSTOMER GSTIN' },
  { key: 'customerPan', label: 'CUSTOMER PAN' },
  { key: 'customerStateCode', label: 'STATE CODE' },
  { key: 'totalAmount', label: 'TOTAL AMOUNT (₹)' }
];

export const ProformaInvoiceListPage = ({ onEditProforma }) => {
  const navigate = useNavigate();
  const [proformas, setProformas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProformaIds, setSelectedProformaIds] = useState([]);
  const [selectedProforma, setSelectedProforma] = useState(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProformaNo, setFilterProformaNo] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterGstin, setFilterGstin] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [dateFilter, setDateFilter] = useState('ALL'); // 'ALL', 'THIS_MONTH', 'LAST_MONTH', 'THIS_FY'

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchProformas();
      setProformas(data || []);
      setSelectedProformaIds([]);
    } catch (err) {
      setToast({ message: 'Failed to load Proforma Invoices: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Multi-criteria Filtering
  const filteredProformas = useMemo(() => {
    return proformas.filter(p => {
      // 1. General Live Search
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        (p.proformaNumber && p.proformaNumber.toLowerCase().includes(q)) ||
        (p.customerName && p.customerName.toLowerCase().includes(q)) ||
        (p.customerGstin && p.customerGstin.toLowerCase().includes(q)) ||
        (p.customerPan && p.customerPan.toLowerCase().includes(q)) ||
        (p.equipmentHeader && p.equipmentHeader.toLowerCase().includes(q)) ||
        (p.notes && p.notes.toLowerCase().includes(q)) ||
        (p.items && p.items.some(i => i.description && i.description.toLowerCase().includes(q)));

      // 2. Proforma Number Filter
      const invQ = filterProformaNo.toLowerCase().trim();
      const matchesProformaNo = !invQ || (p.proformaNumber && p.proformaNumber.toLowerCase().includes(invQ));

      // 3. Customer Filter
      const custQ = filterCustomer.toLowerCase().trim();
      const matchesCustomer = !custQ || (p.customerName && p.customerName.toLowerCase().includes(custQ));

      // 4. GSTIN / PAN Filter
      const gstQ = filterGstin.toLowerCase().trim();
      const matchesGstin = !gstQ || 
        (p.customerGstin && p.customerGstin.toLowerCase().includes(gstQ)) ||
        (p.customerPan && p.customerPan.toLowerCase().includes(gstQ));

      // 5. Date Range (From Date & To Date)
      let matchesDateRange = true;
      if (p.proformaDate) {
        if (fromDate && p.proformaDate < fromDate) {
          matchesDateRange = false;
        }
        if (toDate && p.proformaDate > toDate) {
          matchesDateRange = false;
        }
      } else if (fromDate || toDate) {
        matchesDateRange = false;
      }

      // 6. Period Quick Filter
      let matchesPeriod = true;
      if (dateFilter !== 'ALL') {
        const now = new Date();
        if (!p.proformaDate) {
          matchesPeriod = false;
        } else {
          const d = new Date(p.proformaDate);
          if (dateFilter === 'THIS_MONTH') {
            matchesPeriod = d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          } else if (dateFilter === 'LAST_MONTH') {
            const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
            const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
            matchesPeriod = d.getMonth() === prevMonth && d.getFullYear() === prevYear;
          } else if (dateFilter === 'THIS_FY') {
            const fyStartYear = (now.getMonth() >= 3) ? now.getFullYear() : now.getFullYear() - 1;
            const pFyStartYear = (d.getMonth() >= 3) ? d.getFullYear() : d.getFullYear() - 1;
            matchesPeriod = fyStartYear === pFyStartYear;
          }
        }
      }

      return matchesSearch && matchesProformaNo && matchesCustomer && matchesGstin && matchesDateRange && matchesPeriod;
    });
  }, [proformas, searchQuery, filterProformaNo, filterCustomer, filterGstin, fromDate, toDate, dateFilter]);

  const activeFilterCount = [
    filterProformaNo,
    filterCustomer,
    filterGstin,
    fromDate,
    toDate,
    dateFilter !== 'ALL' ? dateFilter : null
  ].filter(Boolean).length;

  const handleResetAllFilters = () => {
    setSearchQuery('');
    setFilterProformaNo('');
    setFilterCustomer('');
    setFilterGstin('');
    setFromDate('');
    setToDate('');
    setDateFilter('ALL');
  };

  // Aggregate Metrics
  const totalCount = filteredProformas.length;
  const totalAmount = useMemo(() => {
    return filteredProformas.reduce((sum, p) => sum + (Number(p.totalAmount) || 0), 0);
  }, [filteredProformas]);

  // Select All Checkbox Handler
  const isAllSelected = filteredProformas.length > 0 && selectedProformaIds.length === filteredProformas.length;

  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      setSelectedProformaIds([]);
    } else {
      setSelectedProformaIds(filteredProformas.map(p => p.id));
    }
  };

  // Individual Row Checkbox Handler
  const handleSelectProformaToggle = (id) => {
    setSelectedProformaIds(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  // Bulk Delete Handler
  const handleBulkDeleteSelected = async () => {
    if (selectedProformaIds.length === 0) return;

    if (!window.confirm(`Are you sure you want to delete all ${selectedProformaIds.length} selected Proforma Invoices?`)) {
      return;
    }

    try {
      setLoading(true);
      await Promise.all(selectedProformaIds.map(id => deleteProforma(id)));
      setToast({ message: `Successfully deleted ${selectedProformaIds.length} selected Proforma Invoices!`, type: 'success' });
      setSelectedProformaIds([]);
      loadData();
    } catch (err) {
      setToast({ message: 'Bulk deletion failed: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
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
              background: showFilters ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : undefined,
              color: showFilters ? '#ffffff' : undefined,
              borderColor: activeFilterCount > 0 ? '#38bdf8' : undefined
            }}
            title="Toggle Filter Options"
          >
            <Filter size={16} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span style={{ 
                background: '#10b981', 
                color: '#ffffff', 
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

          {/* Export Designer */}
          <button 
            onClick={() => setExportModalOpen(true)} 
            className="btn btn-outline" 
            style={{ fontSize: '0.85rem', padding: '0.55rem 0.85rem', borderColor: 'rgba(56, 189, 248, 0.4)', color: '#38bdf8' }}
            title="Export to Excel / PDF"
          >
            <Download size={15} />
            <span>Export</span>
          </button>

          {selectedProformaIds.length > 0 && (
            <button 
              onClick={handleBulkDeleteSelected} 
              className="btn btn-danger"
              style={{ fontSize: '0.85rem', padding: '0.55rem 0.85rem' }}
              title="Delete all selected Proforma Invoices"
            >
              <Trash2 size={15} />
              <span>Delete Selected ({selectedProformaIds.length})</span>
            </button>
          )}

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

      {/* EXPANDABLE ADVANCED FILTER PANEL */}
      {showFilters && (
        <div 
          className="glass-panel animate-fade-in" 
          style={{ 
            padding: '1.25rem 1.5rem', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1rem',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1.5px solid rgba(56, 189, 248, 0.35)',
            borderRadius: '14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 800, color: '#38bdf8' }}>
              <Filter size={16} />
              <span>Advanced Filter Options</span>
            </div>
            {activeFilterCount > 0 && (
              <button 
                onClick={handleResetAllFilters} 
                className="btn btn-outline" 
                style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)' }}
              >
                <FilterX size={14} />
                <span>Clear All Filters</span>
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
            {/* Filter by Proforma No */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                <Hash size={13} color="#38bdf8" /> Proforma No.
              </label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. PC/01/26-27"
                style={{ fontSize: '0.825rem', padding: '0.45rem 0.75rem' }}
                value={filterProformaNo}
                onChange={e => setFilterProformaNo(e.target.value)}
              />
            </div>

            {/* Filter by Customer */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                <User size={13} color="#34d399" /> Customer Name
              </label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. ONGC, Ocean Sparkle..."
                style={{ fontSize: '0.825rem', padding: '0.45rem 0.75rem' }}
                value={filterCustomer}
                onChange={e => setFilterCustomer(e.target.value)}
              />
            </div>

            {/* Filter by GSTIN / PAN */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                <CreditCard size={13} color="#fbbf24" /> GSTIN / PAN
              </label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. 34AAACO... or PAN"
                style={{ fontSize: '0.825rem', padding: '0.45rem 0.75rem' }}
                value={filterGstin}
                onChange={e => setFilterGstin(e.target.value)}
              />
            </div>

            {/* From Date */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                <Calendar size={13} color="#818cf8" /> From Date
              </label>
              <input 
                type="date" 
                className="form-input" 
                style={{ fontSize: '0.825rem', padding: '0.45rem 0.75rem' }}
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
              />
            </div>

            {/* To Date */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                <Calendar size={13} color="#818cf8" /> To Date
              </label>
              <input 
                type="date" 
                className="form-input" 
                style={{ fontSize: '0.825rem', padding: '0.45rem 0.75rem' }}
                value={toDate}
                onChange={e => setToDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Live Search & Quick Period Toolbar */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '260px', maxWidth: '450px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.25rem', fontSize: '0.85rem', width: '100%' }}
            placeholder="Live search Proforma No, Customer, GSTIN, Items..."
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
              style={{ 
                fontSize: '0.75rem', 
                padding: '0.35rem 0.75rem',
                background: dateFilter === f ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : undefined,
                color: dateFilter === f ? '#ffffff' : undefined
              }}
            >
              {f === 'ALL' ? 'All Time' : f === 'THIS_MONTH' ? 'This Month' : f === 'LAST_MONTH' ? 'Last Month' : 'This FY'}
            </button>
          ))}
        </div>
      </div>

      {/* History Table with Select All Checkbox */}
      <div className="glass-panel" style={{ padding: '1.25rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: 'rgba(30, 41, 59, 0.6)', borderBottom: '1.5px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '10px', width: '40px', textAlign: 'center' }}>
                <input 
                  type="checkbox" 
                  checked={isAllSelected} 
                  onChange={handleSelectAllToggle}
                  title="Select All"
                  style={{ cursor: 'pointer' }}
                />
              </th>
              <th style={{ padding: '10px', width: '40px', textAlign: 'center' }}>#</th>
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
                <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  {loading ? 'Loading Proforma Invoices...' : 'No Proforma Invoices match the applied filters.'}
                </td>
              </tr>
            ) : (
              filteredProformas.map((p, idx) => {
                const isSelected = selectedProformaIds.includes(p.id);
                return (
                  <tr 
                    key={p.id || idx}
                    style={{ 
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                      background: isSelected ? 'rgba(56, 189, 248, 0.08)' : undefined
                    }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <input 
                        type="checkbox" 
                        checked={isSelected} 
                        onChange={() => handleSelectProformaToggle(p.id)}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
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
                );
              })
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

      {/* Export Designer Modal */}
      <ExportDesignerModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        title="Proforma Invoice History Register"
        data={filteredProformas}
        availableColumns={PROFORMA_COLUMNS}
      />
    </div>
  );
};
