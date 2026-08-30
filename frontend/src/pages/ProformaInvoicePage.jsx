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
import { LineItemUploadModal } from '../components/LineItemUploadModal';
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
  CheckCircle2,
  Upload,
  Zap,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Keyboard-Driven Interactive Service Charge Option Popup Modal
const ServiceChargeChoiceModal = ({ data, onChoice, onClose }) => {
  const [selectedChoice, setSelectedChoice] = useState('yes'); // Default: 'yes' (S option)
  const { itemCode, description, unit, baseRate, serviceCharge } = data;

  const baseRateNum = Number(baseRate || 0);
  const serviceChargeNum = Number(serviceCharge || 0);
  const totalRateNum = baseRateNum + serviceChargeNum;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setSelectedChoice('no');
      } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 's') {
        e.preventDefault();
        setSelectedChoice('yes');
      } else if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        onChoice(selectedChoice === 'yes');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [selectedChoice, onChoice, onClose]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      background: 'rgba(0, 0, 0, 0.82)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div 
        className="glass-panel animate-modal-entry"
        style={{
          width: '100%',
          maxWidth: '560px',
          background: '#0b1329',
          border: '1.5px solid rgba(99, 102, 241, 0.5)',
          borderRadius: '18px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
          padding: 0
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(16, 185, 129, 0.15) 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(251, 191, 36, 0.2)', border: '1px solid rgba(251, 191, 36, 0.4)', padding: '0.5rem', borderRadius: '10px', color: '#fbbf24' }}>
              <Zap size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white', margin: 0 }}>
                Service Charge Selection
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Item Code: <strong style={{ color: '#818cf8', fontFamily: 'monospace' }}>{itemCode}</strong> ({unit || 'No'})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Item Description Info */}
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(15, 23, 42, 0.5)' }}>
          <p style={{ fontSize: '0.85rem', color: '#e2e8f0', margin: 0, lineHeight: 1.45 }}>
            {description}
          </p>
        </div>

        {/* 2 Interactive Options (Left: No | Right: S / Yes) */}
        <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          
          {/* Option 1: NO (Left Arrow) */}
          <div
            onClick={() => {
              setSelectedChoice('no');
              onChoice(false);
            }}
            onMouseEnter={() => setSelectedChoice('no')}
            style={{
              padding: '1.25rem 1rem',
              borderRadius: '14px',
              cursor: 'pointer',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '0.6rem',
              background: selectedChoice === 'no' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
              border: selectedChoice === 'no' ? '2px solid #818cf8' : '1.5px solid rgba(255, 255, 255, 0.12)',
              boxShadow: selectedChoice === 'no' ? '0 0 20px rgba(99, 102, 241, 0.35)' : 'none',
              transform: selectedChoice === 'no' ? 'scale(1.02)' : 'scale(1)',
              transition: 'all 0.18s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', color: '#94a3b8' }}>
                ← LEFT ARROW (N)
              </span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>
              No
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Base Rate Only
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#38bdf8' }}>
              ₹{baseRateNum.toFixed(2)}
            </div>
            {selectedChoice === 'no' && (
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                <CheckCircle2 size={13} /> Selected (Press Enter)
              </div>
            )}
          </div>

          {/* Option 2: S / YES (Right Arrow) */}
          <div
            onClick={() => {
              setSelectedChoice('yes');
              onChoice(true);
            }}
            onMouseEnter={() => setSelectedChoice('yes')}
            style={{
              padding: '1.25rem 1rem',
              borderRadius: '14px',
              cursor: 'pointer',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '0.6rem',
              background: selectedChoice === 'yes' ? 'rgba(16, 185, 129, 0.22)' : 'rgba(255, 255, 255, 0.03)',
              border: selectedChoice === 'yes' ? '2px solid #34d399' : '1.5px solid rgba(255, 255, 255, 0.12)',
              boxShadow: selectedChoice === 'yes' ? '0 0 22px rgba(16, 185, 129, 0.4)' : 'none',
              transform: selectedChoice === 'yes' ? 'scale(1.02)' : 'scale(1)',
              transition: 'all 0.18s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>
                RIGHT ARROW (S) →
              </span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
              <span>S / Yes</span>
              <span style={{ fontSize: '0.75rem', padding: '1px 6px', borderRadius: '4px', background: '#34d399', color: '#064e3b', fontWeight: 900 }}>S</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#fbbf24' }}>
              + ₹{serviceChargeNum.toFixed(2)} Service Charge
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#34d399' }}>
              ₹{totalRateNum.toFixed(2)}
            </div>
            {selectedChoice === 'yes' && (
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                <CheckCircle2 size={13} /> Selected (Press Enter)
              </div>
            )}
          </div>

        </div>

        {/* Keyboard Helper Banner & Confirmation Action */}
        <div style={{
          padding: '1rem 1.5rem',
          background: 'rgba(15, 23, 42, 0.8)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span>⌨️ <strong>←</strong> = No</span>
            <span>|</span>
            <span><strong>→</strong> = S / Yes</span>
            <span>|</span>
            <span><strong style={{ color: 'white' }}>⏎ Enter</strong> = Confirm</span>
          </div>

          <button
            type="button"
            onClick={() => onChoice(selectedChoice === 'yes')}
            className="btn btn-secondary"
            style={{
              padding: '0.6rem 1.4rem',
              fontWeight: 800,
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <CheckCircle2 size={16} />
            <span>Confirm ({selectedChoice === 'yes' ? 'S / Yes' : 'No'})</span>
          </button>
        </div>

      </div>
    </div>
  );
};

// Fast in-memory searchable Combobox for Item Code with Enter key settlement
const ItemCodeCombobox = React.memo(({ id, value, masterItems, onChange, onSelect, onEnterNext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value || '');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

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

  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredItems]);

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

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      const cleanQ = (query || '').trim().toUpperCase();
      // 1. Exact match check
      const exactMatch = masterItems.find(m => m.itemCode && m.itemCode.trim().toUpperCase() === cleanQ);
      if (exactMatch) {
        handleItemSelect(exactMatch);
        return;
      }
      // 2. Highlighted or first dropdown item
      if (isOpen && filteredItems.length > 0) {
        const selected = filteredItems[highlightedIndex] || filteredItems[0];
        if (selected) {
          handleItemSelect(selected);
          return;
        }
      }
      // 3. First match if query not empty
      if (filteredItems.length > 0 && cleanQ) {
        handleItemSelect(filteredItems[0]);
        return;
      }
      // 4. Custom manual entry
      onChange(query);
      setIsOpen(false);
      if (onEnterNext) onEnterNext();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', minWidth: '160px' }}>
      <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
        <input
          ref={inputRef}
          id={id}
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
          onKeyDown={handleKeyDown}
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
          {filteredItems.map((m, idx) => {
            const isHighlighted = idx === highlightedIndex;
            return (
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
                  background: isHighlighted ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={() => setHighlightedIndex(idx)}
              >
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: 700, color: '#38bdf8' }}>{m.itemCode}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {m.description}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 700, color: '#34d399' }}>₹{Number(m.rate || 0).toFixed(2)}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{m.unit || 'No'}</div>
                </div>
              </div>
            );
          })}
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

  // Service charge modal state
  const [serviceChargeModal, setServiceChargeModal] = useState({
    isOpen: false,
    rowIndex: null,
    itemCode: '',
    description: '',
    unit: 'No',
    baseRate: 0,
    serviceCharge: 0,
    qty: 1
  });

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
    if (c.poNumber) setPoNumber(c.poNumber);
    if (c.poDate) setPoDate(c.poDate);
    if (c.sacCode) setSacCode(c.sacCode);
    setCustomerSearchOpen(false);
    setToast({ message: `Auto-filled all details for '${c.customerName}' from Customer Directory!`, type: 'info' });
  };

  // Line Item Spreadsheet (Excel / CSV) Upload Modal State
  const [lineItemUploadModalOpen, setLineItemUploadModalOpen] = useState(false);

  // Auto-Row Generation & Sequential Serial Number Normalizer
  const autoExpandLineItems = (itemsList) => {
    if (!itemsList || itemsList.length === 0) {
      return [{ serialNumber: 1, itemCode: '', description: '', unit: 'No', quantity: 1, rate: 0, amount: 0 }];
    }

    const normalized = itemsList.map((it, idx) => ({
      ...it,
      serialNumber: idx + 1
    }));

    const lastItem = normalized[normalized.length - 1];
    const isFilled = (lastItem.itemCode && lastItem.itemCode.trim() !== '') ||
                     (lastItem.description && lastItem.description.trim() !== '') ||
                     Number(lastItem.rate) > 0;

    if (isFilled) {
      normalized.push({
        serialNumber: normalized.length + 1,
        itemCode: '',
        description: '',
        unit: 'No',
        quantity: 1,
        rate: 0,
        amount: 0
      });
    }

    return normalized;
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

    setItems(autoExpandLineItems(newItems));
  };

  const handleSelectItem = (index, masterItem) => {
    const newItems = [...items];
    const existingQty = newItems[index]?.quantity;
    const qty = (existingQty !== undefined && existingQty !== '' && !isNaN(Number(existingQty)) && Number(existingQty) > 0) ? Number(existingQty) : 1;
    const baseRate = Number(masterItem.rate) || 0;
    const sc = Number(masterItem.serviceCharge) || 0;
    const itemUnit = masterItem.unit || 'No';

    if (sc > 0) {
      setServiceChargeModal({
        isOpen: true,
        rowIndex: index,
        itemCode: masterItem.itemCode,
        description: masterItem.description,
        unit: itemUnit,
        baseRate: baseRate,
        serviceCharge: sc,
        qty: qty
      });
    } else {
      newItems[index] = {
        ...newItems[index],
        itemCode: masterItem.itemCode,
        description: masterItem.description,
        unit: itemUnit,
        quantity: qty,
        rate: baseRate,
        amount: Math.round(qty * baseRate * 100) / 100
      };
      setItems(autoExpandLineItems(newItems));

      setTimeout(() => {
        const qtyEl = document.getElementById(`proforma-qty-input-${index}`);
        if (qtyEl) {
          qtyEl.focus();
          qtyEl.select();
        }
      }, 60);
    }
  };

  const handleServiceChargeChoice = (applyServiceCharge) => {
    const { rowIndex, itemCode, description, unit: itemUnit, baseRate, serviceCharge, qty } = serviceChargeModal;
    const finalRate = applyServiceCharge ? (baseRate + serviceCharge) : baseRate;
    const newItems = [...items];
    newItems[rowIndex] = {
      ...newItems[rowIndex],
      itemCode: itemCode,
      description: description,
      unit: itemUnit,
      quantity: qty,
      rate: finalRate,
      amount: Math.round(qty * finalRate * 100) / 100
    };
    setItems(autoExpandLineItems(newItems));

    setServiceChargeModal({
      isOpen: false,
      rowIndex: null,
      itemCode: '',
      description: '',
      unit: 'No',
      baseRate: 0,
      serviceCharge: 0,
      qty: 1
    });

    setTimeout(() => {
      const qtyEl = document.getElementById(`proforma-qty-input-${rowIndex}`);
      if (qtyEl) {
        qtyEl.focus();
        qtyEl.select();
      }
    }, 60);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      { serialNumber: items.length + 1, itemCode: '', description: '', unit: 'No', quantity: 1, rate: 0, amount: 0 }
    ]);
  };

  const handleRemoveItem = (index) => {
    const filtered = items.filter((_, idx) => idx !== index);
    if (filtered.length === 0) {
      setItems([{ serialNumber: 1, itemCode: '', description: '', unit: 'No', quantity: 1, rate: 0, amount: 0 }]);
      return;
    }
    setItems(autoExpandLineItems(filtered));
  };

  // Line Item Excel / CSV Spreadsheet Import Handler
  const handleImportLineItems = (importedItems, mode = 'REPLACE') => {
    if (!importedItems || importedItems.length === 0) return;

    let combined;
    if (mode === 'APPEND') {
      const existingValid = items.filter(i => (i.itemCode && i.itemCode.trim()) || (i.description && i.description.trim()) || Number(i.rate) > 0);
      combined = [...existingValid, ...importedItems];
    } else {
      combined = [...importedItems];
    }

    setItems(autoExpandLineItems(combined));
    setToast({ 
      message: `Successfully imported ${importedItems.length} line items from spreadsheet!`, 
      type: 'success' 
    });
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

  const customerGstPrefix = (customerGstin || '').trim().substring(0, 2);
  const isIntraState = !customerGstPrefix || customerGstPrefix === '34' || (customerStateCode && (customerStateCode.includes('34') || customerStateCode.toLowerCase().includes('puducherry')));

  const fullGstPercent = Number(gstPercent !== undefined ? gstPercent : 18);
  const halfGstPercent = fullGstPercent / 2;

  const cgstAmount = isIntraState ? subTotal * (halfGstPercent / 100) : 0;
  const sgstAmount = isIntraState ? subTotal * (halfGstPercent / 100) : 0;
  const igstAmount = !isIntraState ? subTotal * (fullGstPercent / 100) : 0;

  const totalGstAmount = cgstAmount + sgstAmount + igstAmount;
  const grossTotal = subTotal + totalGstAmount;

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
        stateCode: customerStateCode.trim(),
        poNumber: poNumber.trim(),
        poDate: poDate ? poDate.trim() : '',
        vendorCode: vendorCode.trim(),
        sacCode: sacCode.trim()
      };

      if (existingCustomer && existingCustomer.id) {
        try {
          await updateCustomer(existingCustomer.id, { ...existingCustomer, ...customerPayload });
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            2. Line Items (Auto-Fetch from Item Master)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <button
              type="button"
              onClick={() => setLineItemUploadModalOpen(true)}
              className="btn btn-outline"
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', borderColor: 'rgba(16, 185, 129, 0.4)', color: '#34d399', background: 'rgba(16, 185, 129, 0.1)' }}
              title="Upload Line Items from Excel (.xlsx/.xls) or CSV spreadsheet"
            >
              <Upload size={14} />
              <span>Upload Items (Excel / CSV)</span>
            </button>

            <button
              type="button"
              onClick={handleAddItem}
              className="btn btn-outline"
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', borderColor: '#38bdf8', color: '#38bdf8' }}
            >
              <Plus size={14} />
              <span>Add Item Row</span>
            </button>
          </div>
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
                      id={`proforma-item-code-input-${idx}`}
                      value={item.itemCode}
                      masterItems={masterItems}
                      onChange={(val) => handleItemChange(idx, 'itemCode', val)}
                      onSelect={(m) => handleSelectItem(idx, m)}
                      onEnterNext={() => {
                        const qtyEl = document.getElementById(`proforma-qty-input-${idx}`);
                        if (qtyEl) {
                          qtyEl.focus();
                          qtyEl.select();
                        }
                      }}
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
                      id={`proforma-qty-input-${idx}`}
                      type="number"
                      min="0.001"
                      step="any"
                      className="form-input"
                      style={{ textAlign: 'center', fontWeight: 700, fontSize: '0.85rem' }}
                      placeholder="Qty"
                      value={item.quantity === 0 || item.quantity === '' ? '' : item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const nextIdx = idx + 1;
                          const nextInput = document.getElementById(`proforma-item-code-input-${nextIdx}`);
                          if (nextInput) {
                            nextInput.focus();
                          } else {
                            handleAddItem();
                            setTimeout(() => {
                              document.getElementById(`proforma-item-code-input-${nextIdx}`)?.focus();
                            }, 60);
                          }
                        }
                      }}
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

      {/* Summary Calculations & GST Breakdown Card */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.25rem' }}>
        
        {/* Notes & Summary Highlights */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Proforma Invoice GST Summary Details
            </h4>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              <div>• Supply Type: <strong style={{ color: '#818cf8' }}>{isIntraState ? 'Intra-State (Puducherry - 34)' : 'Inter-State (Outside Puducherry)'}</strong></div>
              <div>• Applied GST Tax Rates: <strong style={{ color: '#34d399' }}>{isIntraState ? `CGST: ${halfGstPercent}% + SGST: ${halfGstPercent}%` : `IGST: ${fullGstPercent}%`}</strong></div>
              <div>• Proforma Number: <strong style={{ color: '#fbbf24' }}>{proformaNumber}</strong></div>
            </div>

            <div style={{ marginTop: '0.75rem' }}>
              <label className="form-label" style={{ fontSize: '0.725rem' }}>Notes & Remarks</label>
              <textarea
                className="form-input"
                rows={2}
                placeholder="Special conditions, delivery terms, payment timelines..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="btn btn-outline"
              style={{ flex: 1, minWidth: '150px', padding: '0.85rem 1rem', fontSize: '0.9rem', fontWeight: 700, color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)' }}
            >
              <Eye size={18} />
              <span>Preview Proforma</span>
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="btn btn-primary"
              style={{ flex: 1, minWidth: '160px', padding: '0.85rem 1rem', fontSize: '0.9rem', fontWeight: 700 }}
            >
              <Save size={18} />
              <span>{saving ? 'Saving...' : proformaId ? 'Update Proforma' : 'Save Proforma'}</span>
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={async () => {
                await handleSave();
                handleDirectPrint();
              }}
              className="btn btn-secondary"
              style={{ flex: 1, minWidth: '180px', padding: '0.85rem 1.25rem', fontSize: '0.9rem', fontWeight: 800, background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', borderColor: 'rgba(16, 185, 129, 0.4)' }}
            >
              <Printer size={18} />
              <span>Save & Preview / Print</span>
            </button>
          </div>
        </div>

        {/* GST Amount Calculation Table */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Sub Total (Items Total):</span>
            <strong style={{ color: 'var(--text-main)' }}>₹{subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>GST Rate:</span>
            <select
              className="form-input"
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', width: '90px' }}
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

          {isIntraState ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>CGST ({halfGstPercent}%):</span>
                <strong style={{ color: '#38bdf8' }}>+ ₹{cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>SGST / UTGST ({halfGstPercent}%):</span>
                <strong style={{ color: '#38bdf8' }}>+ ₹{sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>IGST ({fullGstPercent}%):</span>
              <strong style={{ color: '#38bdf8' }}>+ ₹{igstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </div>
          )}

          <div style={{ borderTop: '1.5px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>Gross Estimate Total</span>
              <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 600 }}>(Including All GST Taxes)</span>
            </div>
            <strong style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)' }}>
              ₹{grossTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </strong>
          </div>
        </div>

      </div>

      {/* Service Charge Selection Interactive Popup Modal */}
      {serviceChargeModal.isOpen && (
        <ServiceChargeChoiceModal
          data={serviceChargeModal}
          onChoice={handleServiceChargeChoice}
          onClose={() => handleServiceChargeChoice(false)}
        />
      )}

      {/* Preview Modal */}
      {isPreviewOpen && (
        <ProformaPrintModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          proforma={getPayload()}
        />
      )}

      {/* Line Items Spreadsheet (Excel / CSV) Upload Modal */}
      <LineItemUploadModal
        isOpen={lineItemUploadModalOpen}
        onClose={() => setLineItemUploadModalOpen(false)}
        onImport={handleImportLineItems}
        masterItems={masterItems}
      />
    </div>
  );
};
