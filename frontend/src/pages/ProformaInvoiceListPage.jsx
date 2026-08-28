import React, { useState, useEffect, useMemo } from 'react';
import { 
  fetchProformas, 
  deleteProforma,
  fetchNextChallanNumber,
  createChallan,
  formatUnitWithQty
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
  CreditCard,
  ArrowRightLeft,
  CheckCircle,
  ExternalLink,
  X
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

  // Transfer to Tax Invoice Modal States
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [proformasToTransfer, setProformasToTransfer] = useState([]);
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);
  const [nextTaxInvoiceNumber, setNextTaxInvoiceNumber] = useState('');
  const [transferring, setTransferring] = useState(false);
  const [transferSuccessData, setTransferSuccessData] = useState(null);

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

  // Open Transfer Modal for Single or Multiple Proformas
  const handleOpenTransferModal = async (itemsToTransfer) => {
    try {
      const nextNum = await fetchNextChallanNumber();
      setNextTaxInvoiceNumber(nextNum || '01/26-27');
    } catch (err) {
      setNextTaxInvoiceNumber('01/26-27');
    }
    setTransferDate(new Date().toISOString().split('T')[0]);
    setProformasToTransfer(itemsToTransfer);
    setTransferSuccessData(null);
    setTransferModalOpen(true);
  };

  // Bulk Transfer Handler
  const handleBulkTransferSelected = () => {
    const selectedList = filteredProformas.filter(p => selectedProformaIds.includes(p.id));
    if (selectedList.length === 0) return;
    handleOpenTransferModal(selectedList);
  };

  // Execute Transfer to Tax Invoice
  const handleConfirmTransfer = async () => {
    if (proformasToTransfer.length === 0) return;

    setTransferring(true);
    try {
      const transferredTaxInvoices = [];

      for (let i = 0; i < proformasToTransfer.length; i++) {
        const p = proformasToTransfer[i];
        
        // Next sequential invoice number calculation
        let targetInvoiceNumber = nextTaxInvoiceNumber;
        if (i > 0) {
          const parts = targetInvoiceNumber.split('/');
          if (parts.length === 2 && !isNaN(parseInt(parts[0], 10))) {
            const nextSeq = parseInt(parts[0], 10) + i;
            targetInvoiceNumber = `${String(nextSeq).padStart(2, '0')}/${parts[1]}`;
          }
        }

        const validItems = (p.items || []).map((it, idx) => ({
          serialNumber: it.serialNumber || (idx + 1),
          itemCode: it.itemCode || 'CUSTOM',
          description: it.description || '',
          quantity: Number(it.quantity) || 1,
          unit: formatUnitWithQty(it.unit || 'No', it.quantity),
          rate: Number(it.rate) || 0,
          amount: Number(it.amount) || ((Number(it.quantity) || 1) * (Number(it.rate) || 0))
        }));

        const taxInvoicePayload = {
          challanNumber: targetInvoiceNumber,
          challanDate: transferDate,
          customerName: p.customerName || '',
          customerAddress: p.customerAddress || '',
          customerPhone: p.customerPhone || '',
          vendorCode: p.vendorCode || '840305',
          contractNo: p.contractNo || '9010038288',
          contractPeriod: p.contractPeriod || '01.05.2024 to 30.04.2027',
          bgNo: p.bgNo || '8110IPEBG240001  Validity Upto : 30.09.2027',
          poNumber: p.poNumber || '5060173862',
          poDate: p.poDate || null,
          epfCode: p.epfCode || 'PC 1758',
          esiCode: p.esiCode || '55000426770000602',
          gstin: p.gstin || '34ABDFS4476N1ZN',
          pan: p.pan || 'ABDFS4476N',
          stateCode: p.stateCode || 'Puducherry (34)',
          customerPan: p.customerPan || '',
          customerGstin: p.customerGstin || '',
          customerStateCode: p.customerStateCode || 'PUDUCHERRY (34)',
          sacCode: p.sacCode || '995469',
          gstPercent: Number(p.gstPercent !== undefined ? p.gstPercent : 18),
          equipmentHeader: p.equipmentHeader || '',
          totalAmount: Number(p.totalAmount) || 0,
          items: validItems
        };

        const createdChallan = await createChallan(taxInvoicePayload);
        transferredTaxInvoices.push({
          proformaNumber: p.proformaNumber,
          taxInvoiceNumber: targetInvoiceNumber,
          customerName: p.customerName,
          totalAmount: p.totalAmount,
          result: createdChallan
        });
      }

      setTransferSuccessData(transferredTaxInvoices);
      setToast({
        message: `Successfully transferred ${proformasToTransfer.length} Proforma Invoice(s) to Tax Invoice History!`,
        type: 'success'
      });
      setSelectedProformaIds([]);
      await loadData();
    } catch (err) {
      setToast({ message: 'Transfer to Tax Invoice failed: ' + err.message, type: 'error' });
    } finally {
      setTransferring(false);
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
              Search, filter, view estimates, print, or transfer approved records to Tax Invoice.
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

          {/* BULK TRANSFER TO TAX INVOICE BUTTON */}
          {selectedProformaIds.length > 0 && (
            <button 
              onClick={handleBulkTransferSelected} 
              className="btn btn-secondary" 
              style={{ 
                fontSize: '0.85rem', 
                padding: '0.55rem 1rem', 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                color: '#ffffff', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.45rem',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
              }}
              title="Transfer all selected Proforma Invoices to Tax Invoice History"
            >
              <ArrowRightLeft size={16} />
              <span>Transfer to Tax Invoice ({selectedProformaIds.length})</span>
            </button>
          )}

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
              <th style={{ padding: '10px', width: '13%', textAlign: 'left' }}>Proforma No</th>
              <th style={{ padding: '10px', width: '10%', textAlign: 'center' }}>Date</th>
              <th style={{ padding: '10px', width: '28%', textAlign: 'left' }}>Customer Name & Subject</th>
              <th style={{ padding: '10px', width: '7%', textAlign: 'center' }}>Items</th>
              <th style={{ padding: '10px', width: '13%', textAlign: 'right' }}>Total (₹)</th>
              <th style={{ padding: '10px', width: '23%', textAlign: 'center' }}>Actions</th>
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
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                        
                        {/* TRANSFER TO TAX INVOICE BUTTON */}
                        <button
                          onClick={() => handleOpenTransferModal([p])}
                          className="btn btn-outline"
                          style={{ 
                            padding: '0.35rem 0.6rem', 
                            fontSize: '0.75rem', 
                            borderColor: 'rgba(16, 185, 129, 0.45)', 
                            background: 'rgba(16, 185, 129, 0.12)',
                            color: '#34d399',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                          title="Transfer / Convert to Tax Invoice (Current Date)"
                        >
                          <ArrowRightLeft size={13} />
                          <span>Transfer</span>
                        </button>

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

      {/* TRANSFER TO TAX INVOICE CONFIRMATION & EXECUTION MODAL */}
      {transferModalOpen && (
        <div 
          style={{ 
            position: 'fixed', 
            inset: 0, 
            zIndex: 99999, 
            background: 'rgba(0,0,0,0.85)', 
            backdropFilter: 'blur(8px)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '1rem' 
          }}
          onClick={(e) => { if (e.target === e.currentTarget && !transferring) setTransferModalOpen(false); }}
        >
          <div 
            className="glass-panel" 
            style={{ 
              width: '100%', 
              maxWidth: '600px', 
              background: 'var(--bg-card-solid)', 
              border: '1.5px solid rgba(16, 185, 129, 0.4)', 
              borderRadius: '16px', 
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0,0,0,0.7)'
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: '1.25rem 1.5rem', background: 'rgba(16, 185, 129, 0.15)', borderBottom: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowRightLeft size={20} color="#34d399" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    Transfer to Tax Invoice
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Convert approved proforma estimate into real Tax Invoice History
                  </span>
                </div>
              </div>
              {!transferring && (
                <button onClick={() => setTransferModalOpen(false)} className="btn btn-outline" style={{ padding: '0.4rem' }}>
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              
              {transferSuccessData ? (
                /* SUCCESS STATE VIEW */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'center', padding: '1rem 0' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                    <CheckCircle size={32} color="#34d399" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399', margin: 0 }}>
                      Transfer Successful!
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                      The following record(s) have been successfully saved into <strong>Tax Invoice History</strong>:
                    </p>
                  </div>

                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.85rem', textAlign: 'left', maxHeight: '180px', overflowY: 'auto' }}>
                    {transferSuccessData.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: idx < transferSuccessData.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none', fontSize: '0.825rem' }}>
                        <div>
                          <span style={{ color: '#38bdf8', fontWeight: 700 }}>{item.proformaNumber}</span>
                          <span style={{ color: 'var(--text-muted)', margin: '0 0.5rem' }}>➡️</span>
                          <span style={{ color: '#34d399', fontWeight: 800 }}>Tax Invoice: {item.taxInvoiceNumber}</span>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.customerName}</div>
                        </div>
                        <div style={{ fontWeight: 800, color: '#34d399' }}>
                          ₹{Number(item.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', marginTop: '0.5rem' }}>
                    <button
                      onClick={() => {
                        setTransferModalOpen(false);
                        navigate('/challan-list');
                      }}
                      className="btn btn-primary"
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        padding: '0.65rem 1.25rem',
                        fontSize: '0.875rem'
                      }}
                    >
                      <ExternalLink size={16} />
                      <span>Go to Tax Invoice History</span>
                    </button>
                    <button
                      onClick={() => setTransferModalOpen(false)}
                      className="btn btn-outline"
                      style={{ fontSize: '0.875rem', padding: '0.65rem 1.15rem' }}
                    >
                      Stay Here
                    </button>
                  </div>
                </div>
              ) : (
                /* INPUT / CONFIRMATION VIEW */
                <>
                  {/* Selected Proformas Summary Box */}
                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.85rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      Proforma Invoice(s) Selected for Transfer ({proformasToTransfer.length}):
                    </div>
                    {proformasToTransfer.map((p, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.35rem 0', fontSize: '0.825rem', borderBottom: idx < proformasToTransfer.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                        <div>
                          <strong style={{ color: '#38bdf8' }}>{p.proformaNumber}</strong>
                          <span style={{ color: 'var(--text-main)', marginLeft: '0.5rem' }}>{p.customerName}</span>
                        </div>
                        <div style={{ fontWeight: 800, color: '#34d399' }}>
                          ₹{Number(p.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Transfer Form Controls */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Calendar size={14} color="#34d399" />
                        <span>Tax Invoice Date (Current Date)</span>
                      </label>
                      <input
                        type="date"
                        className="form-input"
                        value={transferDate}
                        onChange={e => setTransferDate(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Hash size={14} color="#38bdf8" />
                        <span>Tax Invoice Number</span>
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={nextTaxInvoiceNumber}
                        onChange={e => setNextTaxInvoiceNumber(e.target.value)}
                        placeholder="e.g. 13/26-27"
                        required
                      />
                    </div>
                  </div>

                  <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '8px', padding: '0.75rem', fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.4 }}>
                    ℹ️ Upon confirmation, a new verified <strong>Tax Invoice</strong> will be created in <strong>Tax Invoice History</strong> with current date and line item specifications. The original Proforma record will remain safely in history.
                  </div>

                  {/* Modal Footer Actions */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                    <button
                      type="button"
                      onClick={() => setTransferModalOpen(false)}
                      className="btn btn-outline"
                      disabled={transferring}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmTransfer}
                      className="btn btn-secondary"
                      style={{ 
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.55rem 1.25rem'
                      }}
                      disabled={transferring}
                    >
                      <ArrowRightLeft size={16} className={transferring ? 'animate-spin' : ''} />
                      <span>{transferring ? 'Transferring...' : 'Confirm & Transfer'}</span>
                    </button>
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
