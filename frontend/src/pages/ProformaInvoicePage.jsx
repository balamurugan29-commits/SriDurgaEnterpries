import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  fetchItems, 
  fetchCustomers, 
  createCustomer, 
  updateCustomer, 
  fetchNextProformaNumber, 
  createProforma, 
  updateProforma, 
  formatUnitWithQty 
} from '../services/api';
import { printProformaInvoiceDirect } from '../utils/proformaInvoicePrint';
import { ProformaPrintModal } from '../components/ProformaPrintModal';
import { Toast } from '../components/Toast';
import { 
  FileSpreadsheet, 
  Plus, 
  Trash2, 
  Printer, 
  Save, 
  RotateCcw, 
  Building2, 
  Eye, 
  ChevronDown, 
  History,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Fast in-memory searchable Combobox for Item Code
const ItemCodeCombobox = React.memo(({ value, masterItems, onChange, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value || '');
  const containerRef = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredItems = useMemo(() => {
    if (!masterItems || masterItems.length === 0) return [];
    const q = (query || '').trim().toLowerCase();
    if (!q) return masterItems.slice(0, 30);
    return masterItems.filter(m => 
      (m.itemCode && m.itemCode.toLowerCase().includes(q)) ||
      (m.description && m.description.toLowerCase().includes(q))
    ).slice(0, 30);
  }, [masterItems, query]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
  };

  const handleItemSelect = (m) => {
    setQuery(m.itemCode);
    onSelect(m);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', minWidth: '160px' }}>
      <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
        <input
          type="text"
          className="form-input"
          style={{
            padding: '0.5rem 1.75rem 0.5rem 0.65rem',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: '#38bdf8',
            width: '100%'
          }}
          placeholder="Type / Select Code"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setIsOpen(!isOpen)}
          style={{
            position: 'absolute',
            right: '4px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ChevronDown size={14} />
        </button>
      </div>

      {isOpen && filteredItems.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 99999,
            background: 'var(--bg-card-solid, #1e293b)',
            border: '1.5px solid var(--border-color-accent, #6366f1)',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            maxHeight: '220px',
            overflowY: 'auto',
            padding: '4px'
          }}
        >
          {filteredItems.map(m => (
            <div
              key={m.id || m.itemCode}
              onClick={() => handleItemSelect(m)}
              style={{
                padding: '6px 10px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                gap: '8px',
                color: 'var(--text-main, #f8fafc)',
                borderBottom: '1px solid rgba(255,255,255,0.05)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(56, 189, 248, 0.15)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ fontWeight: 800, color: '#38bdf8' }}>{m.itemCode}</div>
              <div style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {m.description}
              </div>
              <div style={{ color: '#34d399', fontWeight: 700 }}>₹{Number(m.rate || 0).toFixed(2)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export const ProformaInvoicePage = ({ initialProforma, clearEditingProforma }) => {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Master Lists for auto-completion
  const [masterItems, setMasterItems] = useState([]);
  const [masterCustomers, setMasterCustomers] = useState([]);
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);

  // Form State
  const [proformaId, setProformaId] = useState(null);
  const [proformaNumber, setProformaNumber] = useState('');
  const [proformaDate, setProformaDate] = useState(new Date().toISOString().split('T')[0]);
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [vendorCode, setVendorCode] = useState('840305');
  const [poNumber, setPoNumber] = useState('');
  const [poDate, setPoDate] = useState('');
  const [epfCode, setEpfCode] = useState('PC 1758');
  const [esiCode, setEsiCode] = useState('55000426770000602');
  const [gstin, setGstin] = useState('34ABDFS4476N1ZN');
  const [pan, setPan] = useState('ABDFS4476N');
  const [stateCode, setStateCode] = useState('Puducherry (34)');
  const [customerPan, setCustomerPan] = useState('');
  const [customerGstin, setCustomerGstin] = useState('');
  const [customerStateCode, setCustomerStateCode] = useState('TAMILNADU (33)');
  const [sacCode, setSacCode] = useState('995469');
  const [gstPercent, setGstPercent] = useState('18');
  const [equipmentHeader, setEquipmentHeader] = useState('');
  const [notes, setNotes] = useState('');

  // Line items
  const [items, setItems] = useState([
    { serialNumber: 1, itemCode: '', description: '', unit: 'No', quantity: 1, rate: 0, amount: 0 }
  ]);

  // Load masters & next Proforma number
  useEffect(() => {
    const initData = async () => {
      try {
        const [itemsData, customersData] = await Promise.all([
          fetchItems(),
          fetchCustomers()
        ]);
        setMasterItems(itemsData || []);
        setMasterCustomers(customersData || []);

        if (initialProforma) {
          populateFormWithProforma(initialProforma);
        } else {
          const nextNum = await fetchNextProformaNumber();
          setProformaNumber(nextNum);
        }
      } catch (err) {
        console.error('Failed to init Proforma Invoice:', err);
      }
    };
    initData();
  }, [initialProforma]);

  const populateFormWithProforma = (p) => {
    setProformaId(p.id || null);
    setProformaNumber(p.proformaNumber || '');
    setProformaDate(p.proformaDate || new Date().toISOString().split('T')[0]);
    setCustomerName(p.customerName || '');
    setCustomerAddress(p.customerAddress || '');
    setCustomerPhone(p.customerPhone || '');
    setVendorCode(p.vendorCode || '840305');
    setPoNumber(p.poNumber || '');
    setPoDate(p.poDate || '');
    setEpfCode(p.epfCode || 'PC 1758');
    setEsiCode(p.esiCode || '55000426770000602');
    setGstin(p.gstin || '34ABDFS4476N1ZN');
    setPan(p.pan || 'ABDFS4476N');
    setStateCode(p.stateCode || 'Puducherry (34)');
    setCustomerPan(p.customerPan || '');
    setCustomerGstin(p.customerGstin || '');
    setCustomerStateCode(p.customerStateCode || 'TAMILNADU (33)');
    setSacCode(p.sacCode || '995469');
    setGstPercent(String(p.gstPercent || 18));
    setEquipmentHeader(p.equipmentHeader || '');
    setNotes(p.notes || '');

    if (p.items && p.items.length > 0) {
      setItems(p.items.map((i, idx) => ({
        serialNumber: i.serialNumber || idx + 1,
        itemCode: i.itemCode || '',
        description: i.description || '',
        unit: i.unit || 'No',
        quantity: Number(i.quantity) || 1,
        rate: Number(i.rate) || 0,
        amount: Number(i.amount) || ((Number(i.quantity) || 1) * (Number(i.rate) || 0))
      })));
    }
  };

  // Customer Selection from Directory
  const handleSelectCustomer = (c) => {
    setCustomerName(c.customerName || '');
    setCustomerAddress(c.address || '');
    setCustomerPhone(c.phone || '');
    setCustomerGstin(c.gstin || '');
    setCustomerPan(c.pan || '');
    if (c.stateCode) setCustomerStateCode(c.stateCode);
    if (c.vendorCode) setVendorCode(c.vendorCode);
    setCustomerSearchOpen(false);
    setToast({ message: `Auto-filled details for '${c.customerName}' from Customer Directory!`, type: 'info' });
  };

  // Item Table Manipulation
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === 'quantity' || field === 'rate') {
      const q = parseFloat(field === 'quantity' ? value : newItems[index].quantity) || 0;
      const r = parseFloat(field === 'rate' ? value : newItems[index].rate) || 0;
      newItems[index].amount = Math.round(q * r * 100) / 100;
    }

    setItems(newItems);
  };

  const handleSelectItem = (index, masterItem) => {
    const newItems = [...items];
    const qty = newItems[index].quantity || 1;
    const rate = Number(masterItem.rate) || 0;
    newItems[index] = {
      ...newItems[index],
      itemCode: masterItem.itemCode,
      description: masterItem.description,
      unit: masterItem.unit || 'No',
      rate: rate,
      amount: Math.round(qty * rate * 100) / 100
    };
    setItems(newItems);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      { serialNumber: items.length + 1, itemCode: '', description: '', unit: 'No', quantity: 1, rate: 0, amount: 0 }
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) {
      setItems([{ serialNumber: 1, itemCode: '', description: '', unit: 'No', quantity: 1, rate: 0, amount: 0 }]);
      return;
    }
    const filtered = items.filter((_, idx) => idx !== index);
    const renumbered = filtered.map((item, idx) => ({ ...item, serialNumber: idx + 1 }));
    setItems(renumbered);
  };

  const handleResetForm = async () => {
    if (clearEditingProforma) clearEditingProforma();
    setProformaId(null);
    const nextNum = await fetchNextProformaNumber();
    setProformaNumber(nextNum);
    setProformaDate(new Date().toISOString().split('T')[0]);
    setCustomerName('');
    setCustomerAddress('');
    setCustomerPhone('');
    setCustomerPan('');
    setCustomerGstin('');
    setEquipmentHeader('');
    setNotes('');
    setItems([{ serialNumber: 1, itemCode: '', description: '', unit: 'No', quantity: 1, rate: 0, amount: 0 }]);
    setToast({ message: 'Cleared all fields. Ready for new Proforma Invoice!', type: 'info' });
  };

  // Calculations
  const subTotal = useMemo(() => {
    return items.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
  }, [items]);

  const gstPctNum = parseFloat(gstPercent) || 0;
  const gstAmount = (subTotal * gstPctNum) / 100;
  const grossTotal = subTotal + gstAmount;

  const isIntraState = customerStateCode && (
    customerStateCode.toLowerCase().includes('puducherry') || 
    customerStateCode.includes('34')
  );

  // Build Payload
  const getPayload = () => {
    return {
      proformaNumber: proformaNumber.trim(),
      proformaDate,
      customerName: customerName.trim(),
      customerAddress: customerAddress.trim(),
      customerPhone: customerPhone.trim(),
      vendorCode: vendorCode.trim(),
      poNumber: poNumber.trim(),
      poDate: poDate.trim(),
      epfCode: epfCode.trim(),
      esiCode: esiCode.trim(),
      gstin: gstin.trim(),
      pan: pan.trim(),
      stateCode: stateCode.trim(),
      customerPan: customerPan.trim(),
      customerGstin: customerGstin.trim(),
      customerStateCode: customerStateCode.trim(),
      sacCode: sacCode.trim(),
      gstPercent: parseFloat(gstPercent) || 18,
      equipmentHeader: equipmentHeader.trim(),
      totalAmount: grossTotal,
      notes: notes.trim(),
      items: items.map((i, idx) => ({
        serialNumber: idx + 1,
        itemCode: (i.itemCode || '').trim(),
        description: (i.description || '').trim(),
        unit: i.unit || 'No',
        quantity: parseFloat(i.quantity) || 0,
        rate: parseFloat(i.rate) || 0,
        amount: parseFloat(i.amount) || 0
      }))
    };
  };

  // SAVE PROFORMA INVOICE & AUTO-SYNC CUSTOMER DIRECTORY
  const handleSave = async () => {
    if (!customerName.trim()) {
      setToast({ message: 'Customer Name is required!', type: 'error' });
      return;
    }
    if (!proformaNumber.trim()) {
      setToast({ message: 'Proforma Invoice Number is required!', type: 'error' });
      return;
    }

    setSaving(true);
    const payload = getPayload();

    try {
      // 1. Two-Way Customer Directory Sync
      const existingCustomer = masterCustomers.find(c => 
        c.customerName && c.customerName.trim().toLowerCase() === customerName.trim().toLowerCase()
      );

      const customerPayload = {
        customerName: customerName.trim(),
        address: customerAddress.trim(),
        phone: customerPhone.trim(),
        gstin: customerGstin.trim(),
        pan: customerPan.trim(),
        stateCode: customerStateCode.trim()
      };

      if (existingCustomer && existingCustomer.id) {
        try {
          await updateCustomer(existingCustomer.id, customerPayload);
        } catch (e) {
          console.warn('Customer directory update notice:', e);
        }
      } else {
        try {
          await createCustomer({ ...customerPayload, serialNumber: masterCustomers.length + 1 });
        } catch (e) {
          console.warn('Customer directory create notice:', e);
        }
      }

      // 2. Save Proforma Invoice
      let result;
      if (proformaId) {
        result = await updateProforma(proformaId, payload);
        setToast({ message: `Proforma Invoice '${payload.proformaNumber}' updated successfully!`, type: 'success' });
      } else {
        result = await createProforma(payload);
        setProformaId(result.id);
        setToast({ message: `Proforma Invoice '${payload.proformaNumber}' created & Customer Directory synced!`, type: 'success' });
      }

      // Refresh customers list
      const refreshedCustomers = await fetchCustomers();
      setMasterCustomers(refreshedCustomers || []);
    } catch (err) {
      setToast({ message: 'Failed to save Proforma Invoice: ' + err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDirectPrint = () => {
    const payload = getPayload();
    printProformaInvoiceDirect(payload);
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Top Banner & Quick Controls */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileSpreadsheet size={22} color="#38bdf8" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
              {proformaId ? `Edit Proforma Invoice (${proformaNumber})` : 'Create Proforma Invoice'}
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
              Generate advance estimates with sequential <strong style={{ color: '#38bdf8' }}>PC/XX/YY-ZZ</strong> numbering & two-way Customer Directory sync.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/proforma-invoice-history')}
            className="btn btn-outline"
            style={{ fontSize: '0.85rem', padding: '0.55rem 1rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <History size={16} color="#38bdf8" />
            <span>Proforma History</span>
          </button>

          <button
            onClick={handleResetForm}
            className="btn btn-outline"
            style={{ fontSize: '0.85rem', padding: '0.55rem 0.85rem' }}
            title="Clear form and start new Proforma Invoice"
          >
            <RotateCcw size={16} />
            <span>New Invoice</span>
          </button>

          <button
            onClick={() => setIsPreviewOpen(true)}
            className="btn btn-outline"
            style={{ fontSize: '0.85rem', padding: '0.55rem 1rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <Eye size={16} color="#fbbf24" />
            <span>Preview</span>
          </button>

          <button
            onClick={handleDirectPrint}
            className="btn btn-outline"
            style={{ fontSize: '0.85rem', padding: '0.55rem 1rem', display: 'flex', alignItems: 'center', gap: '0.45rem', borderColor: 'rgba(56, 189, 248, 0.4)', background: 'rgba(56, 189, 248, 0.12)' }}
          >
            <Printer size={16} color="#38bdf8" />
            <span>Print (A4)</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary"
            style={{ fontSize: '0.85rem', padding: '0.55rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <Save size={16} />
            <span>{saving ? 'Saving...' : proformaId ? 'Update Proforma' : 'Save Proforma'}</span>
          </button>
        </div>
      </div>

      {/* Header Customer Details Form */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.65rem' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            1. Proforma Invoice & Customer Details
          </div>
          <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
            <Building2 size={13} /> Two-Way Customer Directory Sync Active
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Proforma Invoice No <span style={{ color: '#f87171' }}>*</span></label>
            <input
              type="text"
              className="form-input"
              style={{ fontWeight: 800, color: '#38bdf8', letterSpacing: '0.05em' }}
              value={proformaNumber}
              onChange={(e) => setProformaNumber(e.target.value)}
              placeholder="e.g. PC/01/26-27"
            />
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Invoice Date <span style={{ color: '#f87171' }}>*</span></label>
            <input
              type="date"
              className="form-input"
              value={proformaDate}
              onChange={(e) => setProformaDate(e.target.value)}
            />
          </div>

          <div style={{ gridColumn: 'span 2', position: 'relative' }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>
              Customer / Billed To Name <span style={{ color: '#f87171' }}>*</span> (Auto-Search Directory)
            </label>
            <div style={{ display: 'flex', position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                style={{ fontWeight: 700 }}
                placeholder="Type or select from Customer Directory..."
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  setCustomerSearchOpen(true);
                }}
                onFocus={() => setCustomerSearchOpen(true)}
              />
            </div>

            {customerSearchOpen && masterCustomers.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 99999,
                  background: 'var(--bg-card-solid, #1e293b)',
                  border: '1.5px solid var(--border-color-accent, #6366f1)',
                  borderRadius: '8px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
                  maxHeight: '220px',
                  overflowY: 'auto',
                  padding: '4px'
                }}
              >
                {masterCustomers
                  .filter(c => !customerName || (c.customerName && c.customerName.toLowerCase().includes(customerName.toLowerCase())))
                  .slice(0, 15)
                  .map(c => (
                    <div
                      key={c.id || c.customerName}
                      onClick={() => handleSelectCustomer(c)}
                      style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        color: 'var(--text-main, #f8fafc)'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(56, 189, 248, 0.15)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div style={{ fontWeight: 800, color: '#38bdf8', fontSize: '0.85rem' }}>{c.customerName}</div>
                      <div style={{ fontSize: '0.725rem', color: '#94a3b8' }}>
                        {c.address ? `${c.address} | ` : ''}{c.gstin ? `GST: ${c.gstin}` : ''}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Customer Address</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Keezhavanjore, T.R. Pattinam, Karaikal"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Customer Phone</label>
            <input
              type="text"
              className="form-input"
              placeholder="9842492946"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Customer GSTIN</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 34AAACO2519H1ZR"
              value={customerGstin}
              onChange={(e) => setCustomerGstin(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Customer PAN</label>
            <input
              type="text"
              className="form-input"
              placeholder="AAACO2519H"
              value={customerPan}
              onChange={(e) => setCustomerPan(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Customer State & Code</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. PUDUCHERRY (34) / TAMILNADU (33)"
              value={customerStateCode}
              onChange={(e) => setCustomerStateCode(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Vendor Code</label>
            <input
              type="text"
              className="form-input"
              value={vendorCode}
              onChange={(e) => setVendorCode(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>PO Number / Ref</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. PO/2026/089"
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Equipment / Work Subject</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Supply & Installation of Electrical Panel"
              value={equipmentHeader}
              onChange={(e) => setEquipmentHeader(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Dynamic Line Items Table */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            2. Line Items (Auto-Fetch from Item Master)
          </div>
          <button
            onClick={handleAddItem}
            className="btn btn-outline"
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', borderColor: '#38bdf8', color: '#38bdf8' }}
          >
            <Plus size={14} />
            <span>Add Item Row</span>
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'rgba(30, 41, 59, 0.6)', borderBottom: '1.5px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '8px', width: '5%', textAlign: 'center' }}>#</th>
                <th style={{ padding: '8px', width: '18%', textAlign: 'left' }}>Item Code</th>
                <th style={{ padding: '8px', width: '40%', textAlign: 'left' }}>Description of Goods / Services</th>
                <th style={{ padding: '8px', width: '9%', textAlign: 'center' }}>Unit</th>
                <th style={{ padding: '8px', width: '9%', textAlign: 'center' }}>Qty</th>
                <th style={{ padding: '8px', width: '10%', textAlign: 'right' }}>Rate (₹)</th>
                <th style={{ padding: '8px', width: '11%', textAlign: 'right' }}>Amount (₹)</th>
                <th style={{ padding: '8px', width: '5%', textAlign: 'center' }}>Act</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <td style={{ padding: '8px', textAlign: 'center', fontWeight: 700, color: '#94a3b8' }}>
                    {idx + 1}
                  </td>
                  <td style={{ padding: '6px' }}>
                    <ItemCodeCombobox
                      value={item.itemCode}
                      masterItems={masterItems}
                      onChange={(val) => handleItemChange(idx, 'itemCode', val)}
                      onSelect={(m) => handleSelectItem(idx, m)}
                    />
                  </td>
                  <td style={{ padding: '6px' }}>
                    <input
                      type="text"
                      className="form-input"
                      style={{ fontSize: '0.85rem' }}
                      placeholder="Item description..."
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                    />
                  </td>
                  <td style={{ padding: '6px' }}>
                    <input
                      type="text"
                      className="form-input"
                      style={{ textAlign: 'center', fontSize: '0.85rem' }}
                      value={item.unit}
                      onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                    />
                  </td>
                  <td style={{ padding: '6px' }}>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      style={{ textAlign: 'center', fontWeight: 700, fontSize: '0.85rem' }}
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                    />
                  </td>
                  <td style={{ padding: '6px' }}>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      style={{ textAlign: 'right', fontWeight: 700, fontSize: '0.85rem' }}
                      value={item.rate}
                      onChange={(e) => handleItemChange(idx, 'rate', e.target.value)}
                    />
                  </td>
                  <td style={{ padding: '6px', textAlign: 'right', fontWeight: 800, color: '#34d399' }}>
                    ₹{Number(item.amount || 0).toFixed(2)}
                  </td>
                  <td style={{ padding: '6px', textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                      title="Remove Row"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Financial Summary & Tax Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        
        {/* Left: Notes & Terms */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#818cf8', textTransform: 'uppercase' }}>
            3. Notes & Remarks
          </div>
          <textarea
            className="form-input"
            rows={4}
            placeholder="Special conditions, delivery terms, payment timelines..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Right: Calculations */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase' }}>
            4. Proforma Financial Summary
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Taxable SubTotal:</span>
            <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.95rem' }}>₹{subTotal.toFixed(2)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.35rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>GST Rate:</span>
              <select
                className="form-input"
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', width: '80px' }}
                value={gstPercent}
                onChange={(e) => setGstPercent(e.target.value)}
              >
                <option value="0">0%</option>
                <option value="5">5%</option>
                <option value="12">12%</option>
                <option value="18">18%</option>
                <option value="28">28%</option>
              </select>
            </div>
            <span style={{ fontWeight: 700, color: '#818cf8', fontSize: '0.9rem' }}>₹{gstAmount.toFixed(2)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'rgba(56, 189, 248, 0.12)', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
            <span style={{ fontWeight: 900, color: '#38bdf8', fontSize: '1rem' }}>Gross Estimate Total:</span>
            <span style={{ fontWeight: 900, color: '#34d399', fontSize: '1.2rem' }}>₹{grossTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <ProformaPrintModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          proforma={getPayload()}
        />
      )}
    </div>
  );
};
