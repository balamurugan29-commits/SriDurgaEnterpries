import React, { useState, useEffect } from 'react';
import { fetchChallans, deleteChallan, calculateChallanTotalAmount } from '../services/api';
import { printTaxInvoiceDirect } from '../utils/taxInvoicePrint';
import { MultiInvoiceExportModal } from '../components/MultiInvoiceExportModal';
import { ExportDesignerModal } from '../components/ExportDesignerModal';
import { Toast } from '../components/Toast';
import { History, Search, Printer, Edit3, Trash2, RefreshCw, Download, Filter, FilterX, Calendar, Hash, FileText } from 'lucide-react';

const CHALLAN_COLUMNS = [
  { key: 'challanNumber', label: 'INVOICE NO.' },
  { key: 'challanDate', label: 'DATE' },
  { key: 'customerName', label: 'CUSTOMER NAME' },
  { key: 'customerGstin', label: 'CUSTOMER GSTIN' },
  { key: 'customerPan', label: 'CUSTOMER PAN' },
  { key: 'totalAmount', label: 'TOTAL AMOUNT (₹)' }
];

export const ChallanListPage = ({ onEditChallan }) => {
  const [challans, setChallans] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterInvoiceNo, setFilterInvoiceNo] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedChallanIds, setSelectedChallanIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallan, setSelectedChallan] = useState(null);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [batchExportModalOpen, setBatchExportModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const loadChallans = async () => {
    try {
      setLoading(true);
      const data = await fetchChallans();
      setChallans(data || []);
      setSelectedChallanIds([]);
    } catch (err) {
      console.error('Failed to load challans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChallans();
  }, []);

  // Multi-criteria Filtering
  const filteredChallans = challans.filter(c => {
    // 1. Search Query
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      (c.challanNumber && c.challanNumber.toLowerCase().includes(q)) ||
      (c.customerName && c.customerName.toLowerCase().includes(q)) ||
      (c.customerGstin && c.customerGstin.toLowerCase().includes(q)) ||
      (c.items && c.items.some(i => i.itemCode && i.itemCode.toLowerCase().includes(q))) ||
      (c.items && c.items.some(i => i.description && i.description.toLowerCase().includes(q)));

    // 2. Invoice Number Filter
    const invQ = filterInvoiceNo.toLowerCase().trim();
    const matchesInvoiceNo = !invQ || (c.challanNumber && c.challanNumber.toLowerCase().includes(invQ));

    // 3. Date Range (From Date & To Date)
    let matchesDate = true;
    if (c.challanDate) {
      if (fromDate && c.challanDate < fromDate) {
        matchesDate = false;
      }
      if (toDate && c.challanDate > toDate) {
        matchesDate = false;
      }
    } else if (fromDate || toDate) {
      matchesDate = false;
    }

    return matchesSearch && matchesInvoiceNo && matchesDate;
  });

  const isFilterActive = searchQuery || filterInvoiceNo || fromDate || toDate;

  const handleResetAllFilters = () => {
    setSearchQuery('');
    setFilterInvoiceNo('');
    setFromDate('');
    setToDate('');
  };

  // Select All Checkbox Handler
  const isAllSelected = filteredChallans.length > 0 && selectedChallanIds.length === filteredChallans.length;

  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      setSelectedChallanIds([]);
    } else {
      setSelectedChallanIds(filteredChallans.map(c => c.id));
    }
  };

  // Individual Row Checkbox Handler
  const handleSelectChallanToggle = (id) => {
    setSelectedChallanIds(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  // Bulk Delete Handler for Selected Invoices
  const handleBulkDeleteSelected = async () => {
    if (selectedChallanIds.length === 0) return;

    if (!window.confirm(`Are you sure you want to delete all ${selectedChallanIds.length} selected Tax Invoices?`)) {
      return;
    }

    try {
      setLoading(true);
      await Promise.all(selectedChallanIds.map(id => deleteChallan(id)));
      setToast({ message: `Successfully deleted ${selectedChallanIds.length} selected Tax Invoices!`, type: 'success' });
      setSelectedChallanIds([]);
      loadChallans();
    } catch (err) {
      setToast({ message: 'Bulk deletion failed: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPrint = (challan) => {
    setSelectedChallan(challan);
    setPrintModalOpen(true);
  };

  const handleDelete = async (challan) => {
    if (!window.confirm(`Are you sure you want to delete Tax Invoice '${challan.challanNumber}'?`)) {
      return;
    }
    try {
      await deleteChallan(challan.id);
      setToast({ message: `Tax Invoice '${challan.challanNumber}' deleted successfully`, type: 'success' });
      loadChallans();
    } catch (err) {
      setToast({ message: 'Delete failed: ' + err.message, type: 'error' });
    }
  };

  const selectedInvoicesForExport = selectedChallanIds.length > 0
    ? filteredChallans.filter(c => selectedChallanIds.includes(c.id))
    : filteredChallans;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Advanced Filter & Search Toolbar */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* Top Row: Search & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24', fontWeight: 700, fontSize: '1.05rem' }}>
            <Filter size={18} />
            <span>Tax Invoice History Filters</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {selectedChallanIds.length > 0 && (
              <button 
                onClick={handleBulkDeleteSelected} 
                className="btn btn-danger"
                style={{ fontSize: '0.85rem' }}
                title="Delete all selected Tax Invoices"
              >
                <Trash2 size={16} />
                <span>Delete Selected ({selectedChallanIds.length})</span>
              </button>
            )}

            {/* Batch Export Invoices PDF / Print Button (1 Invoice Per Page) */}
            <button 
              onClick={() => setBatchExportModalOpen(true)} 
              className="btn btn-primary" 
              style={{ fontSize: '0.85rem', padding: '0.55rem 1rem', background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)' }}
              title="Export each selected invoice on a dedicated separate page ready to print/save"
              disabled={filteredChallans.length === 0}
            >
              <Printer size={16} />
              <span>Export {selectedChallanIds.length > 0 ? `Selected (${selectedChallanIds.length})` : 'All'} Invoices (PDF)</span>
            </button>

            <button onClick={() => setExportModalOpen(true)} className="btn btn-outline" style={{ border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34d399' }} title="Open Export Designer for Excel Table Export">
              <Download size={16} /> Export Designer (Excel)
            </button>

            <button onClick={loadChallans} className="btn btn-outline" style={{ fontSize: '0.8rem' }}>
              <RefreshCw size={15} /> Refresh List
            </button>
          </div>
        </div>

        {/* Filter Controls Row: Search + Invoice No + From Date + To Date */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.875rem', alignItems: 'flex-end' }}>
          
          {/* Filter 1: General Live Search */}
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.35rem' }}>Search Keywords</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} color="var(--text-subtle)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.5rem', fontSize: '0.85rem' }}
                placeholder="Search Customer, GSTIN, Items..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Filter 2: Invoice Number Filter */}
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.35rem', color: '#fbbf24' }}>Invoice Number</label>
            <div style={{ position: 'relative' }}>
              <Hash size={16} color="#fbbf24" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.5rem', fontSize: '0.85rem', color: '#fbbf24', fontWeight: 600, borderColor: filterInvoiceNo ? 'rgba(245, 158, 11, 0.5)' : undefined }}
                placeholder="e.g. 01/26-27"
                value={filterInvoiceNo}
                onChange={e => setFilterInvoiceNo(e.target.value)}
              />
            </div>
          </div>

          {/* Filter 3: From Date */}
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.35rem' }}>From Date</label>
            <div style={{ position: 'relative' }}>
              <Calendar size={16} color="var(--text-subtle)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="date"
                className="form-input"
                style={{ paddingLeft: '2.5rem', fontSize: '0.85rem' }}
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
              />
            </div>
          </div>

          {/* Filter 4: To Date */}
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.35rem' }}>To Date</label>
            <div style={{ position: 'relative' }}>
              <Calendar size={16} color="var(--text-subtle)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="date"
                className="form-input"
                style={{ paddingLeft: '2.5rem', fontSize: '0.85rem' }}
                value={toDate}
                onChange={e => setToDate(e.target.value)}
              />
            </div>
          </div>

          {/* Reset Filters Button */}
          {isFilterActive && (
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button 
                onClick={handleResetAllFilters} 
                className="btn btn-outline" 
                style={{ width: '100%', padding: '0.625rem 0.85rem', fontSize: '0.8rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.1)' }}
              >
                <FilterX size={15} /> Clear Filters
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Challan Records List Table */}
      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', background: 'rgba(15, 23, 42, 0.6)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <History size={20} color="#fbbf24" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', margin: 0 }}>
              Issued Tax Invoices
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {selectedChallanIds.length > 0 && (
              <span className="badge badge-code" style={{ color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.4)', background: 'rgba(245, 158, 11, 0.15)' }}>
                {selectedChallanIds.length} of {filteredChallans.length} Selected
              </span>
            )}
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Showing: <strong>{filteredChallans.length}</strong> of <strong>{challans.length}</strong> Invoices
            </span>
          </div>
        </div>

        <div className="custom-table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="custom-table">
            <thead>
              <tr>
                {/* Select All Checkbox Header */}
                <th style={{ width: '45px', textAlign: 'center', paddingLeft: '1rem' }}>
                  <input
                    type="checkbox"
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#f59e0b' }}
                    checked={isAllSelected}
                    onChange={handleSelectAllToggle}
                    title="Select All Tax Invoices"
                  />
                </th>
                <th style={{ width: '140px' }}>Invoice No</th>
                <th style={{ width: '120px' }}>Date</th>
                <th>Customer / Party Name</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Items</th>
                <th style={{ width: '160px', textAlign: 'right' }}>Total Amount (₹)</th>
                <th style={{ width: '180px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem auto' }} />
                    <p style={{ margin: 0 }}>Loading Tax Invoice records...</p>
                  </td>
                </tr>
              ) : filteredChallans.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    {isFilterActive ? 'No Tax Invoices match your filter criteria. Click "Clear Filters" to view all records.' : "No Tax Invoices created yet. Go to 'Tax Invoice' page to create one."}
                  </td>
                </tr>
              ) : (
                filteredChallans.map((challan) => {
                  const isSelected = selectedChallanIds.includes(challan.id);
                  const totalAmt = calculateChallanTotalAmount(challan);

                  return (
                    <tr key={challan.id} style={{ background: isSelected ? 'rgba(245, 158, 11, 0.12)' : undefined }}>
                      {/* Row Checkbox */}
                      <td style={{ textAlign: 'center', paddingLeft: '1rem' }}>
                        <input
                          type="checkbox"
                          style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#f59e0b' }}
                          checked={isSelected}
                          onChange={() => handleSelectChallanToggle(challan.id)}
                        />
                      </td>

                      <td>
                        <span className="badge badge-code" style={{ color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.3)', background: 'rgba(245, 158, 11, 0.15)' }}>
                          {challan.challanNumber}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {challan.challanDate}
                      </td>
                      <td style={{ fontWeight: 600, color: 'white' }}>
                        {challan.customerName}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>
                        {challan.items ? challan.items.length : 0} items
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="badge badge-amount" style={{ fontSize: '0.85rem', padding: '0.35rem 0.65rem' }}>
                          ₹{totalAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                          <button 
                            onClick={() => onEditChallan && onEditChallan(challan)} 
                            className="btn btn-outline" 
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', color: '#818cf8', borderColor: 'rgba(99, 102, 241, 0.3)' }} 
                            title="Edit Tax Invoice"
                          >
                            <Edit3 size={13} /> Edit
                          </button>
                          
                          <button 
                            onClick={() => printTaxInvoiceDirect(challan)} 
                            className="btn btn-primary" 
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }} 
                            title="Direct Print Tax Invoice"
                          >
                            <Printer size={13} /> Print
                          </button>

                          <button 
                            onClick={() => handleDelete(challan)} 
                            className="btn btn-danger" 
                            style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem' }} 
                            title="Delete Tax Invoice"
                          >
                            <Trash2 size={14} />
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
      </div>

      {/* Multi-Invoice Batch Export / Multipage PDF Print Modal (1 Invoice Per Page) */}
      <MultiInvoiceExportModal
        isOpen={batchExportModalOpen}
        onClose={() => setBatchExportModalOpen(false)}
        selectedChallans={selectedInvoicesForExport}
      />

      {/* Export Designer Modal (Excel Tabular Export) */}
      <ExportDesignerModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        title="Tax Invoice History Details"
        data={selectedChallanIds.length > 0 ? filteredChallans.filter(c => selectedChallanIds.includes(c.id)).map(c => ({ ...c, totalAmount: calculateChallanTotalAmount(c) })) : filteredChallans.map(c => ({ ...c, totalAmount: calculateChallanTotalAmount(c) }))}
        availableColumns={CHALLAN_COLUMNS}
      />
    </div>
  );
};
