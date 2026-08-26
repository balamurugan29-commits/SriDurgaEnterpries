import React, { useState, useEffect } from 'react';
import { fetchChallans, calculateChallanTotalAmount } from '../services/api';
import { ExportDesignerModal } from '../components/ExportDesignerModal';
import { Toast } from '../components/Toast';
import { ShieldCheck, Search, Download, RefreshCw, Filter, FilterX, CheckCircle2, Calendar, Hash, X, CheckSquare, Square, SlidersHorizontal } from 'lucide-react';

const ALL_AUDIT_COLUMNS = [
  { key: 'serialNumber', label: 'S.NO.' },
  { key: 'challanDate', label: 'DATE' },
  { key: 'challanNumber', label: 'INVOICE NO.' },
  { key: 'customerName', label: 'CUSTOMER / PARTY NAME' },
  { key: 'itemSummary', label: 'ITEMS AUDIT SUMMARY' },
  { key: 'totalAmount', label: 'TOTAL AMOUNT (₹)' },
  { key: 'status', label: 'AUDIT STATUS' }
];

export const AuditMasterPage = () => {
  const [challans, setChallans] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoiceNumber, setSelectedInvoiceNumber] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState('');
  const [visibleColumnKeys, setVisibleColumnKeys] = useState([
    'serialNumber', 'challanDate', 'challanNumber', 'customerName', 'itemSummary', 'totalAmount', 'status'
  ]);
  const [selectedLogIds, setSelectedLogIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Temporary filter state inside Modal
  const [tempSearchQuery, setTempSearchQuery] = useState('');
  const [tempInvoiceNumber, setTempInvoiceNumber] = useState('ALL');
  const [tempDate, setTempDate] = useState('');
  const [tempVisibleColumns, setTempVisibleColumns] = useState([...visibleColumnKeys]);

  const loadAuditData = async () => {
    try {
      setLoading(true);
      const data = await fetchChallans();
      setChallans(data || []);
      setSelectedLogIds([]);
    } catch (err) {
      setToast({ message: 'Failed to load Audit Master data: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditData();
  }, []);

  const handleOpenFilterModal = () => {
    setTempSearchQuery(searchQuery);
    setTempInvoiceNumber(selectedInvoiceNumber);
    setTempDate(selectedDate);
    setTempVisibleColumns([...visibleColumnKeys]);
    setFilterModalOpen(true);
  };

  const handleToggleColumn = (key) => {
    setTempVisibleColumns(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleApplyFilters = () => {
    if (tempVisibleColumns.length === 0) {
      setToast({ message: 'Please select at least one column to display', type: 'error' });
      return;
    }
    setSearchQuery(tempSearchQuery);
    setSelectedInvoiceNumber(tempInvoiceNumber);
    setSelectedDate(tempDate);
    setVisibleColumnKeys(tempVisibleColumns);
    setFilterModalOpen(false);
    setToast({ message: 'Filters and column preferences applied successfully!', type: 'success' });
  };

  const handleResetFilters = () => {
    setTempSearchQuery('');
    setTempInvoiceNumber('ALL');
    setTempDate('');
    setTempVisibleColumns(ALL_AUDIT_COLUMNS.map(c => c.key));
    
    setSearchQuery('');
    setSelectedInvoiceNumber('ALL');
    setSelectedDate('');
    setVisibleColumnKeys(ALL_AUDIT_COLUMNS.map(c => c.key));
    setFilterModalOpen(false);
    setToast({ message: 'All filters reset to default view', type: 'info' });
  };

  // Filtered dataset
  const filteredChallans = challans.filter(c => {
    const matchesInvoiceNum = selectedInvoiceNumber === 'ALL' || c.challanNumber === selectedInvoiceNumber;
    const matchesDate = !selectedDate || c.challanDate === selectedDate;
    
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || 
      (c.challanNumber && c.challanNumber.toLowerCase().includes(q)) ||
      (c.customerName && c.customerName.toLowerCase().includes(q)) ||
      (c.items && c.items.some(i => i.itemCode && i.itemCode.toLowerCase().includes(q))) ||
      (c.items && c.items.some(i => i.description && i.description.toLowerCase().includes(q)));

    return matchesInvoiceNum && matchesDate && matchesSearch;
  });

  const isAllSelected = filteredChallans.length > 0 && selectedLogIds.length === filteredChallans.length;

  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      setSelectedLogIds([]);
    } else {
      setSelectedLogIds(filteredChallans.map(c => c.id));
    }
  };

  const handleSelectLogToggle = (id) => {
    setSelectedLogIds(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  const isFilterActive = searchQuery || selectedInvoiceNumber !== 'ALL' || selectedDate || visibleColumnKeys.length !== ALL_AUDIT_COLUMNS.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Audit Master Header Banner with Actions */}
      <div style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.18) 0%, rgba(16, 185, 129, 0.12) 100%)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '16px', padding: '1.25rem 1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.25)', padding: '0.75rem', borderRadius: '12px', color: '#818cf8' }}>
            <ShieldCheck size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Audit Master Control & Verification
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Direct audit verification fetched from Tax Invoice History records.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {selectedLogIds.length > 0 && (
            <span className="badge badge-code" style={{ color: '#818cf8', borderColor: 'rgba(99, 102, 241, 0.4)', background: 'rgba(99, 102, 241, 0.15)' }}>
              {selectedLogIds.length} Selected
            </span>
          )}

          {/* Filter Action Button */}
          <button 
            onClick={handleOpenFilterModal} 
            className="btn btn-outline" 
            style={{ 
              border: isFilterActive ? '1px solid #818cf8' : '1px solid rgba(99, 102, 241, 0.4)', 
              color: isFilterActive ? '#818cf8' : 'var(--text-main)',
              background: isFilterActive ? 'rgba(99, 102, 241, 0.15)' : undefined
            }}
            title="Filter invoices, search criteria, and choose columns"
          >
            <Filter size={16} />
            <span>Filter {isFilterActive && '• Active'}</span>
          </button>

          {/* Export Audit Logs Button */}
          <button onClick={() => setExportModalOpen(true)} className="btn btn-outline" style={{ border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34d399' }}>
            <Download size={16} /> Export Audit Logs
          </button>

          {/* Refresh Button */}
          <button onClick={loadAuditData} className="btn btn-outline">
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      {/* Active Filter Tags Indicator (Visible when filters are applied) */}
      {isFilterActive && (
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: '12px', padding: '0.65rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Active Filters:</span>
            {selectedInvoiceNumber !== 'ALL' && (
              <span className="badge badge-code" style={{ color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.4)', background: 'rgba(245, 158, 11, 0.15)' }}>
                Invoice: {selectedInvoiceNumber}
              </span>
            )}
            {selectedDate && (
              <span className="badge badge-code" style={{ color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.4)', background: 'rgba(16, 185, 129, 0.15)' }}>
                Date: {selectedDate}
              </span>
            )}
            {searchQuery && (
              <span className="badge badge-code" style={{ color: '#818cf8', borderColor: 'rgba(99, 102, 241, 0.4)', background: 'rgba(99, 102, 241, 0.15)' }}>
                Search: "{searchQuery}"
              </span>
            )}
            {visibleColumnKeys.length !== ALL_AUDIT_COLUMNS.length && (
              <span className="badge badge-code" style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)', background: 'rgba(56, 189, 248, 0.15)' }}>
                {visibleColumnKeys.length} of {ALL_AUDIT_COLUMNS.length} Columns Visible
              </span>
            )}
          </div>

          <button 
            onClick={handleResetFilters} 
            className="btn btn-outline" 
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
          >
            <FilterX size={13} /> Reset Filters
          </button>
        </div>
      )}

      {/* Main Audit Data Table */}
      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', background: 'rgba(15, 23, 42, 0.6)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <ShieldCheck size={20} color="#34d399" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white', margin: 0 }}>
              Audit Master History Log Table
            </h3>
          </div>

          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing <strong>{filteredChallans.length}</strong> of <strong>{challans.length}</strong> Tax Invoices Audited
          </span>
        </div>

        <div className="custom-table-container" style={{ border: 'none', borderRadius: 0, maxHeight: '60vh', overflowY: 'auto' }}>
          <table className="custom-table" style={{ position: 'relative' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: '#0f172a' }}>
              <tr>
                <th style={{ width: '45px', textAlign: 'center', paddingLeft: '1rem' }}>
                  <input
                    type="checkbox"
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#6366f1' }}
                    checked={isAllSelected}
                    onChange={handleSelectAllToggle}
                    title="Select All Invoices"
                  />
                </th>
                {visibleColumnKeys.includes('serialNumber') && <th style={{ width: '60px', textAlign: 'center' }}>S.No</th>}
                {visibleColumnKeys.includes('challanDate') && <th style={{ width: '130px' }}>Date</th>}
                {visibleColumnKeys.includes('challanNumber') && <th style={{ width: '150px' }}>Invoice No</th>}
                {visibleColumnKeys.includes('customerName') && <th style={{ minWidth: '220px' }}>Customer / Party Name</th>}
                {visibleColumnKeys.includes('itemSummary') && <th>Items Audit Summary</th>}
                {visibleColumnKeys.includes('totalAmount') && <th style={{ width: '160px', textAlign: 'right' }}>Total Amount (₹)</th>}
                {visibleColumnKeys.includes('status') && <th style={{ width: '120px', textAlign: 'center' }}>Audit Status</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={visibleColumnKeys.length + 1} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem auto' }} />
                    <p style={{ margin: 0 }}>Loading Audit Master data from Tax Invoice History...</p>
                  </td>
                </tr>
              ) : filteredChallans.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumnKeys.length + 1} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No Tax Invoices match the applied filter criteria. Click 'Filter' to adjust.
                  </td>
                </tr>
              ) : (
                filteredChallans.map((challan, idx) => {
                  const isSelected = selectedLogIds.includes(challan.id);
                  const grossTotal = calculateChallanTotalAmount(challan);
                  const itemCount = challan.items ? challan.items.length : 0;

                  let itemSummaryText = `${itemCount} Item(s)`;
                  if (challan.items && challan.items.length > 0) {
                    const codes = challan.items.map(i => i.itemCode || 'Custom Item').filter(Boolean).slice(0, 3).join(', ');
                    itemSummaryText = `${itemCount} Item(s) (${codes}${challan.items.length > 3 ? '...' : ''})`;
                  }

                  return (
                    <tr key={challan.id || idx} style={{ background: isSelected ? 'rgba(99, 102, 241, 0.12)' : undefined }}>
                      <td style={{ textAlign: 'center', paddingLeft: '1rem' }}>
                        <input
                          type="checkbox"
                          style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#6366f1' }}
                          checked={isSelected}
                          onChange={() => handleSelectLogToggle(challan.id)}
                        />
                      </td>

                      {visibleColumnKeys.includes('serialNumber') && (
                        <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)' }}>
                          {idx + 1}
                        </td>
                      )}

                      {visibleColumnKeys.includes('challanDate') && (
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {challan.challanDate}
                        </td>
                      )}

                      {visibleColumnKeys.includes('challanNumber') && (
                        <td>
                          <span className="badge badge-code" style={{ color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.4)', background: 'rgba(245, 158, 11, 0.15)' }}>
                            {challan.challanNumber}
                          </span>
                        </td>
                      )}

                      {visibleColumnKeys.includes('customerName') && (
                        <td style={{ fontWeight: 600, color: 'white', wordBreak: 'break-word' }}>
                          {challan.customerName}
                        </td>
                      )}

                      {visibleColumnKeys.includes('itemSummary') && (
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                          {itemSummaryText}
                        </td>
                      )}

                      {visibleColumnKeys.includes('totalAmount') && (
                        <td style={{ textAlign: 'right' }}>
                          <span className="badge badge-amount" style={{ fontSize: '0.85rem', padding: '0.35rem 0.65rem' }}>
                            ₹{grossTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                      )}

                      {visibleColumnKeys.includes('status') && (
                        <td style={{ textAlign: 'center' }}>
                          <span className="badge badge-amount" style={{ fontSize: '0.725rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                            <CheckCircle2 size={13} /> AUDITED
                          </span>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FILTER & COLUMN CUSTOMIZATION MODAL */}
      {filterModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel animate-modal-entry" style={{ width: '100%', maxWidth: '580px', padding: '1.75rem', background: '#0f172a', border: '1px solid rgba(99, 102, 241, 0.4)', boxShadow: '0 20px 50px rgba(0,0,0,0.9)' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#818cf8' }}>
                <SlidersHorizontal size={24} />
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white', margin: 0 }}>
                    Audit Master Search & Filter Inspector
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Filter records and select which columns to display
                  </span>
                </div>
              </div>
              <button onClick={() => setFilterModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Filter 1: Search Query */}
              <div>
                <label className="form-label">Search Query</label>
                <div style={{ position: 'relative' }}>
                  <Search size={16} color="var(--text-subtle)" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="Search Customer, Item Specifications, or Description..."
                    value={tempSearchQuery}
                    onChange={e => setTempSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Filter 2 & 3: Invoice Number & Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Invoice Number</label>
                  <select 
                    className="form-select" 
                    value={tempInvoiceNumber}
                    onChange={e => setTempInvoiceNumber(e.target.value)}
                  >
                    <option value="ALL">-- All Invoices --</option>
                    {challans.map(c => (
                      <option key={c.id} value={c.challanNumber}>
                        {c.challanNumber}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Specific Date</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={tempDate}
                    onChange={e => setTempDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Filter 4: Choose Visible Columns (Include / Exclude) */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Choose Visible Columns</label>
                  <span style={{ fontSize: '0.7rem', color: '#818cf8' }}>
                    {tempVisibleColumns.length} of {ALL_AUDIT_COLUMNS.length} Selected
                  </span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.75rem' }}>
                  {ALL_AUDIT_COLUMNS.map(col => {
                    const isChecked = tempVisibleColumns.includes(col.key);
                    return (
                      <div 
                        key={col.key} 
                        onClick={() => handleToggleColumn(col.key)}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem', 
                          padding: '0.4rem 0.6rem', 
                          borderRadius: '6px', 
                          background: isChecked ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                      >
                        {isChecked ? (
                          <CheckSquare size={16} color="#818cf8" />
                        ) : (
                          <Square size={16} color="var(--text-subtle)" />
                        )}
                        <span style={{ fontSize: '0.8rem', color: isChecked ? 'white' : 'var(--text-muted)', fontWeight: isChecked ? 600 : 400 }}>
                          {col.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <button 
                type="button" 
                onClick={handleResetFilters} 
                className="btn btn-outline" 
                style={{ fontSize: '0.8rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
              >
                <FilterX size={14} /> Reset All
              </button>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  type="button" 
                  onClick={() => setFilterModalOpen(false)} 
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                
                <button 
                  type="button" 
                  onClick={handleApplyFilters} 
                  className="btn btn-primary"
                >
                  <CheckCircle2 size={16} /> Apply Filters
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Export Designer Modal */}
      <ExportDesignerModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        title="Audit Master Tax Invoice Verification Report"
        data={selectedLogIds.length > 0 ? filteredChallans.filter(c => selectedLogIds.includes(c.id)).map(c => ({ ...c, totalAmount: calculateChallanTotalAmount(c), itemSummary: `${c.items ? c.items.length : 0} items`, status: 'AUDITED' })) : filteredChallans.map(c => ({ ...c, totalAmount: calculateChallanTotalAmount(c), itemSummary: `${c.items ? c.items.length : 0} items`, status: 'AUDITED' }))}
        availableColumns={ALL_AUDIT_COLUMNS.filter(c => visibleColumnKeys.includes(c.key))}
      />
    </div>
  );
};
