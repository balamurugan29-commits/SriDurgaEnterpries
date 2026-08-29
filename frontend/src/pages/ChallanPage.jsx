import React, { useState, useEffect, useRef, useMemo } from 'react';
import { fetchItems, fetchItemByCode, fetchNextChallanNumber, createChallan, updateChallan, fetchCustomers, createCustomer, updateCustomer, getIndianFySuffix, formatUnitWithQty, fetchCertificates, fetchCompanyDetails } from '../services/api';
import { printTaxInvoiceDirect } from '../utils/taxInvoicePrint';
import { ChallanPrintModal } from '../components/ChallanPrintModal';
import { InvoiceImageUploadModal } from '../components/InvoiceImageUploadModal';
import { LineItemUploadModal } from '../components/LineItemUploadModal';
import { Toast } from '../components/Toast';
import { FileSpreadsheet, Plus, Trash2, Printer, Save, Zap, Edit3, X, RefreshCw, ShieldCheck, Building2, HelpCircle, CheckCircle2, XCircle, RotateCcw, ChevronDown, Eye, Upload, Sparkles } from 'lucide-react';

// Fast, responsive in-memory searchable Combobox for Item Code
const ItemCodeCombobox = React.memo(({ value, masterItems, isFetched, onChange, onSelect }) => {
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
            color: isFetched ? '#34d399' : '#818cf8',
            width: '100%'
          }}
          placeholder="Select / Type Code"
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
            justifyContent: 'center',
            borderRadius: '4px'
          }}
          title="Open Item Code Directory"
        >
          <ChevronDown size={14} />
        </button>
      </div>

      {isOpen && filteredItems.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            background: 'var(--bg-card-solid)',
            border: '1px solid var(--border-color-accent)',
            borderRadius: '10px',
            boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
            maxHeight: '220px',
            overflowY: 'auto',
            zIndex: 9999,
            padding: '4px'
          }}
        >
          {filteredItems.map(m => (
            <div
              key={m.id || m.itemCode}
              onClick={() => handleItemSelect(m)}
              style={{
                padding: '0.45rem 0.6rem',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem',
                borderBottom: '1px solid var(--border-color)',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.18)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ fontWeight: 700, color: '#818cf8', fontSize: '0.8rem' }}>
                    {m.itemCode}
                  </span>
                  {m.folderName && m.folderName !== 'General' && (
                    <span style={{ fontSize: '0.625rem', padding: '1px 5px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontWeight: 600 }}>
                      📁 {m.folderName}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
                  {m.description}
                </span>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', display: 'block' }}>
                  ₹{Number(m.rate || 0).toFixed(2)}
                </span>
                <span style={{ fontSize: '0.625rem', color: 'var(--text-subtle)' }}>
                  {m.unit || 'No'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

// Auto-Expanding Textarea that adjusts height dynamically as per content length
const AutoResizeTextarea = ({ value, onChange, placeholder, minRows = 2 }) => {
  const textareaRef = useRef(null);

  const adjustHeight = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      const scrollH = el.scrollHeight;
      el.style.height = `${Math.max(scrollH, minRows * 24)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      className="form-input"
      rows={minRows}
      style={{
        padding: '0.5rem 0.65rem',
        fontSize: '0.85rem',
        lineHeight: 1.45,
        resize: 'none',
        overflow: 'hidden',
        width: '100%',
        minHeight: `${minRows * 24}px`,
        transition: 'height 0.1s ease',
        boxSizing: 'border-box'
      }}
      placeholder={placeholder}
      value={value || ''}
      onChange={(e) => {
        onChange(e);
        adjustHeight();
      }}
    />
  );
};

const DRAFT_STORAGE_KEY = 'sri_durga_tax_invoice_draft';

export const ChallanPage = ({ initialChallan, clearEditingChallan }) => {
  const [masterItems, setMasterItems] = useState([]);
  const [masterCustomers, setMasterCustomers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [challanNumber, setChallanNumber] = useState('');
  const [challanDate, setChallanDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Tax Invoice / Customer Header Details (Clean Blank Defaults)
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [vendorCode, setVendorCode] = useState('840305');
  const [contractNo, setContractNo] = useState('9010038288');
  const [contractPeriod, setContractPeriod] = useState('01.05.2024 to 30.04.2027');
  const [bgNo, setBgNo] = useState('8110IPEBG240001  Validity Upto : 30.09.2027');
  const [poNumber, setPoNumber] = useState('5060173862');
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

  // Initial Line Items: Start with 1 blank row
  const [lineItems, setLineItems] = useState([
    { serialNumber: 1, itemCode: '', description: '', quantity: 1, unit: 'No', rate: 0, amount: 0, fetched: false }
  ]);

  const [savedChallan, setSavedChallan] = useState(null);
  const [saving, setSaving] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const isInitialMount = useRef(true);

  // Print Preview Modal States
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [currentPrintChallan, setCurrentPrintChallan] = useState(null);

  // Invoice Image OCR & Auto-Extraction Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Line Item Spreadsheet (Excel / CSV) Upload Modal State
  const [lineItemUploadModalOpen, setLineItemUploadModalOpen] = useState(false);

  // Auto-Row Generation & Sequential Serial Number Normalizer
  const autoExpandLineItems = (items) => {
    if (!items || items.length === 0) {
      return [{ serialNumber: 1, itemCode: '', description: '', quantity: 1, unit: 'No', rate: 0, amount: 0, fetched: false }];
    }

    // 1. Re-index all serial numbers to clean sequential 1..N
    const normalized = items.map((it, idx) => ({
      ...it,
      serialNumber: idx + 1
    }));

    // 2. Check if the last row contains any data (itemCode, description, or rate)
    const lastItem = normalized[normalized.length - 1];
    const isFilled = (lastItem.itemCode && lastItem.itemCode.trim() !== '') ||
                     (lastItem.description && lastItem.description.trim() !== '') ||
                     Number(lastItem.rate) > 0;

    // 3. Automatically append the next blank row below it
    if (isFilled) {
      normalized.push({
        serialNumber: normalized.length + 1,
        itemCode: '',
        description: '',
        quantity: 1,
        unit: 'No',
        rate: 0,
        amount: 0,
        fetched: false
      });
    }

    return normalized;
  };

  const handleApplyExtractedData = (data) => {
    if (!data) return;

    if (data.challanNumber) setChallanNumber(data.challanNumber);
    if (data.challanDate) setChallanDate(data.challanDate);
    if (data.customerName) setCustomerName(data.customerName);
    if (data.customerAddress) setCustomerAddress(data.customerAddress);
    if (data.customerPhone) setCustomerPhone(data.customerPhone);
    if (data.customerPan) setCustomerPan(data.customerPan);
    if (data.customerGstin) setCustomerGstin(data.customerGstin);
    if (data.customerStateCode) setCustomerStateCode(data.customerStateCode);
    if (data.poNumber) setPoNumber(data.poNumber);
    if (data.poDate) setPoDate(data.poDate);
    if (data.vendorCode) setVendorCode(data.vendorCode);
    if (data.sacCode) setSacCode(data.sacCode);
    if (data.contractNo) setContractNo(data.contractNo);
    if (data.contractPeriod) setContractPeriod(data.contractPeriod);
    if (data.bgNo) setBgNo(data.bgNo);
    if (data.equipmentHeader) setEquipmentHeader(data.equipmentHeader);
    if (data.gstPercent !== undefined && data.gstPercent !== '') setGstPercent(String(data.gstPercent));

    if (data.lineItems && Array.isArray(data.lineItems) && data.lineItems.length > 0) {
      const formattedItems = data.lineItems.map((item, idx) => {
        const itemCodeClean = (item.itemCode || '').trim().toUpperCase();
        const matched = masterItems.find(m => m.itemCode && m.itemCode.toUpperCase() === itemCodeClean);
        const qty = Number(item.quantity) || 1;
        const rate = Number(item.rate) || (matched ? Number(matched.rate) : 0);
        return {
          serialNumber: idx + 1,
          itemCode: item.itemCode || (matched ? matched.itemCode : 'CUSTOM'),
          description: item.description || (matched ? matched.description : ''),
          quantity: qty,
          unit: item.unit || (matched ? matched.unit : 'No'),
          rate: rate,
          amount: item.amount || (qty * rate),
          fetched: !!matched
        };
      });
      setLineItems(formattedItems);
    }

    setToast({
      message: `✨ Successfully populated Tax Invoice details from uploaded image!`,
      type: 'success'
    });
  };

  // WCC Selection Modal States
  const [wccModalOpen, setWccModalOpen] = useState(false);
  const [wccList, setWccList] = useState([]);
  const [wccLoading, setWccLoading] = useState(false);
  const [wccSearchQuery, setWccSearchQuery] = useState('');
  const [selectedWccIds, setSelectedWccIds] = useState([]);

  // WCC Multi-item Service Charge Selection States
  const [pendingScQueue, setPendingScQueue] = useState([]);
  const [tempMappedItems, setTempMappedItems] = useState([]);
  const [tempSelectedWccs, setTempSelectedWccs] = useState([]);

  const loadWccForTransfer = async () => {
    setWccLoading(true);
    try {
      const list = await fetchCertificates();
      setWccList(list || []);
    } catch (e) {
      console.error('Failed to fetch certificates for transfer:', e);
      setToast({ message: 'Failed to load Work Completion Certificates.', type: 'error' });
    } finally {
      setWccLoading(false);
    }
  };

  const handleOpenWccModal = () => {
    setWccSearchQuery('');
    setSelectedWccIds([]);
    setWccModalOpen(true);
    loadWccForTransfer();
  };

  const handleToggleWccSelect = (id) => {
    setSelectedWccIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAllWccs = (filteredList) => {
    const allFilteredIds = filteredList.map(c => c.id).filter(Boolean);
    const allAreSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selectedWccIds.includes(id));
    
    if (allAreSelected) {
      setSelectedWccIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
    } else {
      setSelectedWccIds(prev => {
        const uniqueNewIds = allFilteredIds.filter(id => !prev.includes(id));
        return [...prev, ...uniqueNewIds];
      });
    }
  };

  const finalizeTransfer = (finalItems, selectedWccsList) => {
    setLineItems(finalItems);

    // Combine Rate Contract Refs for PO Number (unique list)
    const rcRefs = Array.from(new Set(selectedWccsList.map(w => w.rateContractRef).filter(Boolean)));
    if (rcRefs.length > 0) {
      setPoNumber(rcRefs.join(', '));
    }
    
    // Combine equipment and locations into equipmentHeader (unique list)
    const eqHeaders = Array.from(new Set(selectedWccsList.map(w => {
      if (w.equipmentDescription === 'Service') {
        return `${w.equipment || ''} (${w.location || ''})`;
      } else {
        return `Materials for ${w.location || ''}`;
      }
    }).filter(Boolean)));

    if (eqHeaders.length > 0) {
      setEquipmentHeader(eqHeaders.join('; '));
    }

    setToast({ 
      message: `Successfully transferred ${finalItems.length} items from ${selectedWccsList.length} selected certificates!`, 
      type: 'success' 
    });

    // Clear temp states
    setTempMappedItems([]);
    setTempSelectedWccs([]);
    setPendingScQueue([]);
  };

  const handleTransferSelectedWccs = () => {
    if (selectedWccIds.length === 0) {
      setToast({ message: 'Please select at least one Certificate to transfer.', type: 'error' });
      return;
    }

    const selectedWccs = wccList.filter(w => selectedWccIds.includes(w.id));
    
    // Gather all items from all selected certificates
    const allItems = [];
    selectedWccs.forEach(wcc => {
      if (wcc.items) {
        allItems.push(...wcc.items);
      }
    });

    if (allItems.length === 0) {
      setToast({ message: 'The selected certificates have no items to transfer.', type: 'error' });
      return;
    }

    // Step 1: Map items and find which ones have service charges
    const mapped = [];
    const queue = [];

    allItems.forEach((item, idx) => {
      const matchedMaster = masterItems.find(
        m => m.itemCode && m.itemCode.toLowerCase().trim() === item.rcItemNo.toLowerCase().trim()
      );
      
      const baseRate = matchedMaster ? Number(matchedMaster.rate) : 0;
      const sc = matchedMaster ? Number(matchedMaster.serviceCharge) : 0;
      const qty = Number(item.quantity) || 1;
      const unit = item.unit || 'No';

      mapped.push({
        serialNumber: idx + 1,
        itemCode: item.rcItemNo || 'CUSTOM',
        description: item.description || '',
        quantity: qty,
        unit: unit,
        rate: baseRate, // Default to baseRate, will be adjusted if service charge is accepted
        amount: qty * baseRate,
        fetched: !!matchedMaster
      });

      if (matchedMaster && sc > 0) {
        queue.push({
          itemIndex: idx,
          itemCode: matchedMaster.itemCode,
          description: matchedMaster.description,
          unit: unit,
          baseRate: baseRate,
          serviceCharge: sc,
          qty: qty
        });
      }
    });

    // Save temporary state
    setTempMappedItems(mapped);
    setTempSelectedWccs(selectedWccs);
    setWccModalOpen(false); // Close the selector modal first

    if (queue.length > 0) {
      setPendingScQueue(queue);
      // Trigger the first prompt from the queue
      const first = queue[0];
      setServiceChargeModal({
        isOpen: true,
        rowIndex: first.itemIndex,
        itemCode: first.itemCode,
        description: first.description,
        unit: first.unit,
        baseRate: first.baseRate,
        serviceCharge: first.serviceCharge,
        qty: first.qty,
        isFromTransfer: true // Flag to distinguish from normal code selection
      });
    } else {
      // Finalize transfer directly
      finalizeTransfer(mapped, selectedWccs);
    }
  };

  // Pop-up Modal State for Service Charge Prompt (> 0)
  const [serviceChargeModal, setServiceChargeModal] = useState({
    isOpen: false,
    rowIndex: null,
    itemCode: '',
    description: '',
    unit: 'No',
    baseRate: 0,
    serviceCharge: 0,
    qty: 1,
    isFromTransfer: false
  });

  // GST Calculation Logic
  const customerGstPrefix = (customerGstin || '').trim().substring(0, 2);
  const isIntraState = !customerGstPrefix || customerGstPrefix === '34';

  const fullGstPercent = Number(gstPercent || 0);
  const halfGstPercent = fullGstPercent / 2;
  
  const totalSubTotalAmount = lineItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  
  const cgstAmount = isIntraState ? totalSubTotalAmount * (halfGstPercent / 100) : 0;
  const sgstAmount = isIntraState ? totalSubTotalAmount * (halfGstPercent / 100) : 0;
  const igstAmount = !isIntraState ? totalSubTotalAmount * (fullGstPercent / 100) : 0;

  const totalGstAmount = cgstAmount + sgstAmount + igstAmount;
  const grossTotalAmount = totalSubTotalAmount + totalGstAmount;

  // Helper to extract string from nextNum response safely (Indian FY format e.g. "01/26-27")
  const parseChallanString = (res) => {
    const fySuffix = getIndianFySuffix();
    const defaultNum = `01/${fySuffix}`;
    if (!res) return defaultNum;
    if (typeof res === 'string') return res;
    if (typeof res === 'object' && res.nextChallanNumber) return String(res.nextChallanNumber);
    if (typeof res === 'object' && res.challanNumber) return String(res.challanNumber);
    return defaultNum;
  };

  // Complete Reset of Form to open a 100% FRESH NEW TAX INVOICE
  const resetFormToNewBill = async () => {
    setEditingId(null);
    if (clearEditingChallan) clearEditingChallan();
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setHasDraft(false);

    setCustomerName('');
    setCustomerAddress('');
    setCustomerPhone('');
    setCustomerGstin('');
    setCustomerPan('');
    setPoNumber('');
    setPoDate('');
    setEquipmentHeader('');
    setGstPercent('18');
    setSacCode('995464');
    setVendorCode('253540');
    setChallanDate(new Date().toISOString().split('T')[0]);
    
    // Clear line items to 1 blank row
    setLineItems([
      { serialNumber: 1, itemCode: '', description: '', quantity: 1, unit: 'No', rate: 0, amount: 0, fetched: false }
    ]);

    // Fetch next fresh auto-incremented invoice number in FY format (e.g. 01/26-27)
    try {
      const [nextNum, company] = await Promise.all([
        fetchNextChallanNumber(),
        fetchCompanyDetails()
      ]);
      setChallanNumber(parseChallanString(nextNum));
      if (company) {
        if (company.gstin) setGstin(company.gstin);
        if (company.pan) setPan(company.pan);
        if (company.state) setStateCode(company.state);
        if (company.epfCode) setEpfCode(company.epfCode);
        if (company.esiCode) setEsiCode(company.esiCode);
      }
    } catch (e) {
      const fySuffix = getIndianFySuffix();
      setChallanNumber(`01/${fySuffix}`);
    }
    setToast({ message: 'Cleared all fields. Ready for new Tax Invoice!', type: 'info' });
  };

  // 1. Initial Load: Check for initialChallan or stored draft
  useEffect(() => {
    const initData = async () => {
      try {
        const [items, customers, nextNum, company] = await Promise.all([
          fetchItems(),
          fetchCustomers(),
          fetchNextChallanNumber(),
          fetchCompanyDetails()
        ]);
        setMasterItems(items || []);
        setMasterCustomers(customers || []);

        if (company && !initialChallan) {
          if (company.gstin) setGstin(company.gstin);
          if (company.pan) setPan(company.pan);
          if (company.state) setStateCode(company.state);
          if (company.epfCode) setEpfCode(company.epfCode);
          if (company.esiCode) setEsiCode(company.esiCode);
        }

        if (initialChallan) {
          // Editing existing invoice
          setEditingId(initialChallan.id || null);
          setChallanNumber(parseChallanString(initialChallan.challanNumber));
          setChallanDate(initialChallan.challanDate || new Date().toISOString().split('T')[0]);
          setCustomerName(initialChallan.customerName || '');
          setCustomerAddress(initialChallan.customerAddress || '');
          setCustomerPhone(initialChallan.customerPhone || '');
          setVendorCode(initialChallan.vendorCode || '253540');
          setPoNumber(initialChallan.poNumber || '');
          setPoDate(initialChallan.poDate || '');
          setEpfCode(initialChallan.epfCode || 'PC 1758');
          setEsiCode(initialChallan.esiCode || '55000426770000602');
          setGstin(initialChallan.gstin || '34ABDFS4476N1ZN');
          setPan(initialChallan.pan || 'ABDFS4476N');
          setStateCode(initialChallan.stateCode || 'Puducherry (34)');
          setCustomerPan(initialChallan.customerPan || '');
          setCustomerGstin(initialChallan.customerGstin || '');
          setCustomerStateCode(initialChallan.customerStateCode || 'PUDUCHERRY (34)');
          setSacCode(initialChallan.sacCode || '995464');
          setGstPercent(initialChallan.gstPercent !== undefined ? String(initialChallan.gstPercent) : '18');
          setEquipmentHeader(initialChallan.equipmentHeader || '');

          if (initialChallan.items && initialChallan.items.length > 0) {
            setLineItems(initialChallan.items.map((item, idx) => ({
              serialNumber: item.serialNumber || idx + 1,
              itemCode: item.itemCode || '',
              description: item.description || '',
              quantity: item.quantity || 1,
              unit: item.unit || 'No',
              rate: item.rate || 0,
              amount: item.amount || (item.quantity * item.rate),
              fetched: true
            })));
          }
          setToast({ message: `Editing Tax Invoice '${parseChallanString(initialChallan.challanNumber)}'`, type: 'info' });
        } else {
          // Check for saved draft in localStorage
          const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
          if (savedDraft) {
            try {
              const draft = JSON.parse(savedDraft);
              if (draft.customerName || draft.poNumber || (draft.lineItems && draft.lineItems.some(i => i.itemCode || i.description))) {
                setCustomerName(draft.customerName || '');
                setCustomerAddress(draft.customerAddress || '');
                setCustomerPhone(draft.customerPhone || '');
                setVendorCode(draft.vendorCode || '253540');
                setPoNumber(draft.poNumber || '');
                setPoDate(draft.poDate || '');
                setEpfCode(draft.epfCode || 'PC 1758');
                setEsiCode(draft.esiCode || '55000426770000602');
                setGstin(draft.gstin || '34ABDFS4476N1ZN');
                setPan(draft.pan || 'ABDFS4476N');
                setStateCode(draft.stateCode || 'Puducherry (34)');
                setCustomerPan(draft.customerPan || '');
                setCustomerGstin(draft.customerGstin || '');
                setCustomerStateCode(draft.customerStateCode || 'PUDUCHERRY (34)');
                setSacCode(draft.sacCode || '995464');
                setGstPercent(draft.gstPercent || '18');
                setEquipmentHeader(draft.equipmentHeader || '');
                setChallanDate(draft.challanDate || new Date().toISOString().split('T')[0]);
                if (draft.challanNumber) setChallanNumber(draft.challanNumber);
                else setChallanNumber(parseChallanString(nextNum));

                if (draft.lineItems && draft.lineItems.length > 0) {
                  setLineItems(draft.lineItems);
                }
                setHasDraft(true);
                return;
              }
            } catch (e) {
              console.error('Failed to parse invoice draft:', e);
            }
          }

          if (!challanNumber) {
            setChallanNumber(parseChallanString(nextNum));
          }
        }
      } catch (err) {
        console.error('Error initializing invoice data:', err);
      } finally {
        isInitialMount.current = false;
      }
    };
    initData();
  }, [initialChallan]);

  // 2. Real-time Draft Auto-Save: Whenever user types or modifies lines, save to localStorage
  useEffect(() => {
    if (isInitialMount.current || editingId || initialChallan) {
      return;
    }

    const draftData = {
      challanNumber,
      challanDate,
      customerName,
      customerAddress,
      customerPhone,
      vendorCode,
      poNumber,
      poDate,
      epfCode,
      esiCode,
      gstin,
      pan,
      stateCode,
      customerPan,
      customerGstin,
      customerStateCode,
      sacCode,
      gstPercent,
      equipmentHeader,
      lineItems
    };

    if (customerName || poNumber || equipmentHeader || lineItems.some(i => i.itemCode || i.description || i.rate > 0)) {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
      setHasDraft(true);
    }
  }, [
    challanNumber, challanDate, customerName, customerAddress, customerPhone,
    vendorCode, poNumber, poDate, epfCode, esiCode, gstin, pan, stateCode,
    customerPan, customerGstin, customerStateCode, sacCode, gstPercent,
    equipmentHeader, lineItems, editingId, initialChallan
  ]);

  const handleCancelEdit = () => {
    resetFormToNewBill();
    setToast({ message: 'Cleared editing mode. Now creating new Tax Invoice.', type: 'success' });
  };

  // AUTO-FETCH CUSTOMER DETAILS when user selects or types Customer Name
  const handleCustomerNameChange = (nameInput) => {
    setCustomerName(nameInput);
    if (!nameInput || !nameInput.trim()) return;

    const matchedCustomer = masterCustomers.find(
      c => c.customerName.toLowerCase().trim() === nameInput.toLowerCase().trim()
    );

    if (matchedCustomer) {
      if (matchedCustomer.gstin) setCustomerGstin(matchedCustomer.gstin);
      if (matchedCustomer.pan) setCustomerPan(matchedCustomer.pan);
      if (matchedCustomer.address) setCustomerAddress(matchedCustomer.address);
      if (matchedCustomer.stateCode) setCustomerStateCode(matchedCustomer.stateCode);
      if (matchedCustomer.phone) setCustomerPhone(matchedCustomer.phone);
      if (matchedCustomer.poNumber) setPoNumber(matchedCustomer.poNumber);
      if (matchedCustomer.poDate) setPoDate(matchedCustomer.poDate);
      if (matchedCustomer.vendorCode) setVendorCode(matchedCustomer.vendorCode);
      if (matchedCustomer.sacCode) setSacCode(matchedCustomer.sacCode);
      if (matchedCustomer.contractNo) setContractNo(matchedCustomer.contractNo);
      if (matchedCustomer.contractPeriod) setContractPeriod(matchedCustomer.contractPeriod);
      if (matchedCustomer.bgNo) setBgNo(matchedCustomer.bgNo);

      setToast({ 
        message: `Auto-fetched all billing & contract details for '${matchedCustomer.customerName}' from Customer Page!`, 
        type: 'success' 
      });
    }
  };

  // Apply Master Item details to a specific row
  const applyMasterItemToRow = (index, foundMasterItem) => {
    const updated = [...lineItems];
    const baseRate = Number(foundMasterItem.rate) || 0;
    const sc = Number(foundMasterItem.serviceCharge) || 0;
    const qty = updated[index].quantity || 1;
    const itemUnit = foundMasterItem.unit || 'No';

    if (sc > 0) {
      setServiceChargeModal({
        isOpen: true,
        rowIndex: index,
        itemCode: foundMasterItem.itemCode,
        description: foundMasterItem.description,
        unit: itemUnit,
        baseRate: baseRate,
        serviceCharge: sc,
        qty: qty
      });
    } else {
      updated[index].serialNumber = index + 1;
      updated[index].itemCode = foundMasterItem.itemCode;
      updated[index].description = foundMasterItem.description;
      updated[index].unit = itemUnit;
      updated[index].rate = baseRate;
      updated[index].amount = qty * baseRate;
      updated[index].fetched = true;
      setLineItems(autoExpandLineItems(updated));
      setToast({ message: `Fetched '${foundMasterItem.itemCode}' from Item Master (Unit: ${itemUnit}, Rate: ₹${baseRate.toFixed(2)})`, type: 'success' });
    }
  };

  // Direct typing in Item Code input (Instant 0ms response)
  const handleItemCodeChange = (index, inputCode) => {
    const updated = [...lineItems];
    const code = (inputCode || '').trim().toUpperCase();
    updated[index].itemCode = inputCode;

    if (!code) {
      updated[index].fetched = false;
      setLineItems(updated);
      return;
    }

    // Fast in-memory check if code exactly matches
    const foundMasterItem = masterItems.find(i => i.itemCode && i.itemCode.toUpperCase() === code);
    if (foundMasterItem) {
      applyMasterItemToRow(index, foundMasterItem);
    } else {
      updated[index].fetched = false;
      setLineItems(autoExpandLineItems(updated));
    }
  };

  // Dropdown Selection handler
  const handleSelectMasterItem = (index, selectedMaster) => {
    applyMasterItemToRow(index, selectedMaster);
  };

  // User Choice Handler for Service Charge Pop-up
  const handleServiceChargeChoice = (applyServiceCharge) => {
    const { rowIndex, description, unit: itemUnit, baseRate, serviceCharge, qty, itemCode, isFromTransfer } = serviceChargeModal;

    const finalRate = applyServiceCharge ? (baseRate + serviceCharge) : baseRate;
    const finalAmount = qty * finalRate;

    if (isFromTransfer) {
      // 1. Update the item in tempMappedItems
      const updatedTemp = [...tempMappedItems];
      if (updatedTemp[rowIndex]) {
        updatedTemp[rowIndex].rate = finalRate;
        updatedTemp[rowIndex].amount = finalAmount;
      }

      // 2. Remove the processed item from queue
      const nextQueue = pendingScQueue.slice(1);
      setPendingScQueue(nextQueue);

      if (nextQueue.length > 0) {
        // Update tempMappedItems state
        setTempMappedItems(updatedTemp);
        
        // Load the next item prompt
        const next = nextQueue[0];
        setServiceChargeModal({
          isOpen: true,
          rowIndex: next.itemIndex,
          itemCode: next.itemCode,
          description: next.description,
          unit: next.unit,
          baseRate: next.baseRate,
          serviceCharge: next.serviceCharge,
          qty: next.qty,
          isFromTransfer: true
        });

        if (applyServiceCharge) {
          setToast({ message: `Applied Service Charge for '${itemCode}'. Processing next...`, type: 'success' });
        } else {
          setToast({ message: `Skipped Service Charge for '${itemCode}'. Processing next...`, type: 'info' });
        }
      } else {
        // End of queue: Finalize!
        finalizeTransfer(updatedTemp, tempSelectedWccs);
        
        setServiceChargeModal({
          isOpen: false,
          rowIndex: null,
          itemCode: '',
          description: '',
          unit: 'No',
          baseRate: 0,
          serviceCharge: 0,
          qty: 1,
          isFromTransfer: false
        });
      }

    } else {
      // Normal single item code selection flow
      const updated = [...lineItems];
      updated[rowIndex].serialNumber = rowIndex + 1;
      updated[rowIndex].description = description;
      if (itemUnit) updated[rowIndex].unit = itemUnit;
      updated[rowIndex].rate = finalRate;
      updated[rowIndex].amount = finalAmount;
      updated[rowIndex].fetched = true;
      setLineItems(autoExpandLineItems(updated));

      setServiceChargeModal({
        isOpen: false,
        rowIndex: null,
        itemCode: '',
        description: '',
        unit: 'No',
        baseRate: 0,
        serviceCharge: 0,
        qty: 1,
        isFromTransfer: false
      });

      if (applyServiceCharge) {
        setToast({ 
          message: `Applied Service Charge ₹${serviceCharge.toFixed(2)} for '${itemCode}'. Total Rate: ₹${finalRate.toFixed(2)}`, 
          type: 'success' 
        });
      } else {
        setToast({ 
          message: `Skipped Service Charge for '${itemCode}'. Base Rate ₹${baseRate.toFixed(2)} applied.`, 
          type: 'info' 
        });
      }
    }
  };

  // Line Item Field Modifications (QTY, Rate, Description)
  const handleItemFieldChange = (index, field, value) => {
    const updated = [...lineItems];
    updated[index][field] = value;

    if (field === 'quantity') {
      const q = Number(value) || 0;
      const r = Number(updated[index].rate) || 0;
      updated[index].amount = q * r;
    } else if (field === 'rate') {
      const q = Number(updated[index].quantity) || 0;
      const r = Number(value) || 0;
      updated[index].amount = q * r;
    }

    setLineItems(autoExpandLineItems(updated));
  };

  const handleAddLine = () => {
    setLineItems(prev => [
      ...prev,
      { serialNumber: prev.length + 1, itemCode: '', description: '', quantity: 1, unit: 'No', rate: 0, amount: 0, fetched: false }
    ]);
  };

  const handleRemoveLine = (index) => {
    const filtered = lineItems.filter((_, idx) => idx !== index);
    if (filtered.length === 0) {
      setLineItems([
        { serialNumber: 1, itemCode: '', description: '', quantity: 1, unit: 'No', rate: 0, amount: 0, fetched: false }
      ]);
    } else {
      setLineItems(autoExpandLineItems(filtered));
    }
  };

  // Line Item Excel / CSV Spreadsheet Import Handler
  const handleImportLineItems = (importedItems, mode = 'REPLACE') => {
    if (!importedItems || importedItems.length === 0) return;

    let combined;
    if (mode === 'APPEND') {
      const existingValid = lineItems.filter(i => (i.itemCode && i.itemCode.trim()) || (i.description && i.description.trim()) || Number(i.rate) > 0);
      combined = [...existingValid, ...importedItems];
    } else {
      combined = [...importedItems];
    }

    setLineItems(autoExpandLineItems(combined));
    setToast({ 
      message: `Successfully imported ${importedItems.length} line items from spreadsheet!`, 
      type: 'success' 
    });
  };

  // SAVE TAX INVOICE & AUTO-SYNC CUSTOMER DETAILS
  const handleSaveInvoice = async (shouldPrint = false) => {
    const trimmedCustName = customerName.trim();
    if (!trimmedCustName) {
      setToast({ message: 'Customer Name is required to issue Tax Invoice', type: 'error' });
      return;
    }

    const cleanChallanNo = challanNumber.trim() || parseChallanString(null);

    const validItems = lineItems.filter(i => (i.itemCode && i.itemCode.trim()) || (i.description && i.description.trim()));
    if (validItems.length === 0) {
      setToast({ message: 'Please enter or select at least one item specification in the invoice line table.', type: 'error' });
      return;
    }

    // Auto-Save / Auto-Sync customer details into Customer Master
    try {
      const existingCustomer = masterCustomers.find(
        c => c.customerName.toLowerCase().trim() === trimmedCustName.toLowerCase()
      );

      const customerPayload = {
        customerName: trimmedCustName,
        gstin: customerGstin.trim(),
        pan: customerPan.trim(),
        stateCode: customerStateCode.trim(),
        phone: customerPhone.trim(),
        address: customerAddress.trim(),
        poNumber: poNumber.trim(),
        poDate: poDate ? poDate.trim() : '',
        vendorCode: vendorCode.trim(),
        sacCode: sacCode.trim(),
        contractNo: contractNo.trim(),
        contractPeriod: contractPeriod.trim(),
        bgNo: bgNo.trim()
      };

      if (existingCustomer) {
        await updateCustomer(existingCustomer.id, { ...existingCustomer, ...customerPayload });
      } else {
        const newCust = await createCustomer(customerPayload);
        setMasterCustomers(prev => [...prev, newCust]);
      }
    } catch (custErr) {
      console.warn('Customer auto-sync background notice:', custErr);
    }

    const challanData = {
      id: editingId || undefined,
      challanNumber: cleanChallanNo,
      challanDate,
      customerName: trimmedCustName,
      customerAddress: customerAddress.trim(),
      customerPhone: customerPhone.trim(),
      vendorCode: vendorCode.trim(),
      contractNo: contractNo.trim(),
      contractPeriod: contractPeriod.trim(),
      bgNo: bgNo.trim(),
      poNumber: poNumber.trim(),
      poDate: poDate || null,
      epfCode: epfCode.trim(),
      esiCode: esiCode.trim(),
      gstin: gstin.trim(),
      pan: pan.trim(),
      stateCode: stateCode.trim(),
      customerPan: customerPan.trim(),
      customerGstin: customerGstin.trim(),
      customerStateCode: customerStateCode.trim(),
      sacCode: sacCode.trim(),
      gstPercent: Number(gstPercent),
      equipmentHeader: equipmentHeader.trim(),
      totalAmount: grossTotalAmount,
      items: validItems.map(i => ({
        serialNumber: i.serialNumber,
        itemCode: i.itemCode || 'CUSTOM',
        description: i.description,
        quantity: i.quantity,
        unit: formatUnitWithQty(i.unit || 'No', i.quantity),
        rate: i.rate,
        amount: i.amount
      }))
    };

    try {
      setSaving(true);
      let result;
      if (editingId) {
        result = await updateChallan(editingId, challanData);
        setToast({ message: `Tax Invoice '${cleanChallanNo}' updated successfully!`, type: 'success' });
      } else {
        result = await createChallan(challanData);
        setToast({ message: `Tax Invoice '${cleanChallanNo}' created successfully! Customer auto-synced.`, type: 'success' });
      }
      setSavedChallan(result || challanData);
      
      // Clear saved draft on successful invoice creation
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setHasDraft(false);

      if (shouldPrint) {
        // Open Preview & Print Modal instead of raw browser print
        setCurrentPrintChallan(result || challanData);
        setPrintModalOpen(true);
      }
      resetFormToNewBill();
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('not found')) {
        setToast({ message: 'The Tax Invoice you are editing was not found in the database. Switched to New Invoice mode.', type: 'error' });
        setEditingId(null);
        if (clearEditingChallan) clearEditingChallan();
      } else {
        setToast({ message: err.message || 'Operation failed', type: 'error' });
      }
    } finally {
      setSaving(false);
    }
  };

  // Instant Live Preview of Current Draft Form
  const handlePreviewCurrentForm = () => {
    const cleanChallanNo = challanNumber.trim() || parseChallanString(null);
    const validItems = lineItems.filter(i => (i.itemCode && i.itemCode.trim()) || (i.description && i.description.trim()));
    if (validItems.length === 0) {
      setToast({ message: 'Please enter or select at least one item specification to preview.', type: 'error' });
      return;
    }
    const challanData = {
      id: editingId || undefined,
      challanNumber: cleanChallanNo,
      challanNo: cleanChallanNo,
      challanDate,
      customerName: customerName.trim() || 'Valued Customer',
      customerAddress: customerAddress.trim(),
      customerPhone: customerPhone.trim(),
      vendorCode: vendorCode.trim(),
      contractNo: contractNo.trim(),
      contractPeriod: contractPeriod.trim(),
      bgNo: bgNo.trim(),
      poNumber: poNumber.trim(),
      poDate: poDate || null,
      epfCode: epfCode.trim(),
      esiCode: esiCode.trim(),
      gstin: gstin.trim(),
      pan: pan.trim(),
      stateCode: stateCode.trim(),
      customerPan: customerPan.trim(),
      customerGstin: customerGstin.trim(),
      customerStateCode: customerStateCode.trim(),
      sacCode: sacCode.trim(),
      gstPercent: Number(gstPercent),
      equipmentHeader: equipmentHeader.trim(),
      totalAmount: grossTotalAmount,
      items: validItems.map((i, idx) => ({
        serialNumber: i.serialNumber || idx + 1,
        itemCode: i.itemCode || 'CUSTOM',
        description: i.description,
        quantity: i.quantity,
        unit: formatUnitWithQty(i.unit || 'No', i.quantity),
        rate: i.rate,
        amount: i.amount
      }))
    };
    setCurrentPrintChallan(challanData);
    setPrintModalOpen(true);
  };

  const displayChallanNumber = parseChallanString(challanNumber);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Service Charge Pop-up Dialog */}
      {serviceChargeModal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel animate-modal-entry" style={{ width: '100%', maxWidth: '520px', padding: '1.75rem', background: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.4)', boxShadow: '0 20px 40px rgba(0,0,0,0.8)' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: '#f59e0b' }}>
              <HelpCircle size={28} />
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', margin: 0 }}>
                  Apply Service Charge?
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Interactive Billing Decision
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'white', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Do you want to apply the <strong>Service Charge</strong> for this item?
            </p>

            {/* Price Breakdown Preview containing all requested details */}
            <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              
              {/* Item Info section */}
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Item Code:</span>
                <strong style={{ color: '#818cf8', wordBreak: 'break-all' }}>{serviceChargeModal.itemCode}</strong>
                
                <span style={{ color: 'var(--text-muted)' }}>Description:</span>
                <span style={{ color: 'white', fontWeight: 500 }}>{serviceChargeModal.description}</span>
                
                <span style={{ color: 'var(--text-muted)' }}>Quantity:</span>
                <strong style={{ color: 'white' }}>{serviceChargeModal.qty} {serviceChargeModal.unit || 'No'}</strong>
              </div>

              {/* Rate Details section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '0.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Rate (Base Rate):</span>
                  <strong style={{ color: 'white' }}>₹{Number(serviceChargeModal.baseRate || 0).toFixed(2)}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#fbbf24' }}>Service Charge:</span>
                  <strong style={{ color: '#fbbf24' }}>+ ₹{Number(serviceChargeModal.serviceCharge || 0).toFixed(2)}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#34d399' }}>Effective Rate (with SC):</span>
                  <strong style={{ color: '#34d399' }}>₹{(Number(serviceChargeModal.baseRate || 0) + Number(serviceChargeModal.serviceCharge || 0)).toFixed(2)}</strong>
                </div>
              </div>

              {/* Total Amount Comparisons section */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.75rem', marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Amount (No SC):</span>
                  <strong>₹{(Number(serviceChargeModal.qty || 1) * Number(serviceChargeModal.baseRate || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34d399', fontWeight: 800, fontSize: '0.95rem' }}>
                  <span>Amount (with SC):</span>
                  <strong>₹{(Number(serviceChargeModal.qty || 1) * (Number(serviceChargeModal.baseRate || 0) + Number(serviceChargeModal.serviceCharge || 0))).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              <button 
                type="button"
                onClick={() => handleServiceChargeChoice(false)} 
                className="btn btn-outline" 
                style={{ padding: '0.75rem', fontSize: '0.875rem', borderColor: 'rgba(255,255,255,0.2)' }}
              >
                <XCircle size={16} />
                <span>No (Skip SC)</span>
              </button>

              <button 
                type="button"
                onClick={() => handleServiceChargeChoice(true)} 
                className="btn btn-secondary" 
                style={{ padding: '0.75rem', fontSize: '0.875rem', background: '#34d399', borderColor: '#34d399', color: '#0f172a' }}
              >
                <CheckCircle2 size={16} />
                <span>Yes (Apply SC)</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Editing Mode Banner */}
      {editingId && (
        <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '12px', padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#fbbf24' }}>
            <Edit3 size={20} />
            <div>
              <strong style={{ color: 'white' }}>Editing Mode Active:</strong> Updating Invoice Number <strong style={{ color: '#fbbf24' }}>{displayChallanNumber}</strong>
            </div>
          </div>
          <button onClick={handleCancelEdit} className="btn btn-outline" style={{ fontSize: '0.8rem', borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fbbf24' }}>
            <X size={14} /> Cancel Edit & Create New Invoice
          </button>
        </div>
      )}

      {/* Auto-Fetch & Auto-Save Notice Banner */}
      <div style={{ background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.15) 0%, rgba(79, 70, 229, 0.15) 100%)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '14px', padding: '1rem 1.25rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.25)', padding: '0.625rem', borderRadius: '10px', color: '#34d399' }}>
            <Building2 size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Automatic Customer Sync & Draft Retention Active
              {hasDraft && !editingId && (
                <span className="badge badge-code" style={{ fontSize: '0.7rem', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.4)', background: 'rgba(16, 185, 129, 0.15)' }}>
                  Draft Preserved
                </span>
              )}
            </h4>
            <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Your entered invoice data is automatically retained when navigating pages until you explicitly click "+ New Invoice"!
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button 
            type="button"
            onClick={() => setUploadModalOpen(true)} 
            className="btn btn-secondary" 
            style={{ 
              fontSize: '0.825rem', 
              padding: '0.5rem 0.95rem', 
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              borderColor: 'rgba(99, 102, 241, 0.5)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)'
            }}
            title="Upload an Invoice/PO Image or Document to auto-populate all details"
          >
            <Upload size={15} />
            <span>Upload</span>
          </button>

          <button 
            onClick={resetFormToNewBill} 
            className="btn btn-outline" 
            style={{ fontSize: '0.8rem', padding: '0.5rem 0.85rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
            title="Clear all entered fields and start a fresh blank invoice"
          >
            <RotateCcw size={15} />
            <span>Clear / New Invoice</span>
          </button>

          <button 
            onClick={resetFormToNewBill} 
            className="btn btn-secondary" 
            style={{ fontSize: '0.85rem', padding: '0.55rem 1rem', flexShrink: 0 }}
            title="Open a fresh new Tax Invoice"
          >
            <Plus size={16} />
            <span>New Invoice</span>
          </button>
        </div>
      </div>

      {/* Header Customer Details & Tax Invoice Form */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileSpreadsheet size={20} color="#818cf8" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', margin: 0 }}>
              Tax Invoice Header & Customer Details
            </h3>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>
            GSTIN & Address Auto-Fetch Enabled
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          
          {/* Invoice Number & Date Row */}
          <div>
            <label className="form-label">
              Tax Invoice No <span style={{ color: '#f87171' }}>*</span> 
              <span style={{ fontSize: '0.7rem', color: '#fbbf24', marginLeft: '0.4rem', fontWeight: 700 }}>(Indian FY: 01/26-27)</span>
            </label>
            <input
              type="text"
              className="form-input"
              style={{ fontWeight: 700, color: '#fbbf24', fontSize: '1.05rem', letterSpacing: '0.05em' }}
              value={challanNumber}
              onChange={e => setChallanNumber(e.target.value)}
              placeholder="e.g. 01/26-27"
              required
            />
          </div>

          <div>
            <label className="form-label">Date <span style={{ color: '#f87171' }}>*</span></label>
            <input
              type="date"
              className="form-input"
              value={challanDate}
              onChange={e => setChallanDate(e.target.value)}
              required
            />
          </div>

          {/* Customer / Party Name with Auto-Suggest / Auto-Fetch */}
          <div style={{ gridColumn: 'span 1' }}>
            <label className="form-label">
              Customer / Party Name <span style={{ color: '#f87171' }}>*</span>
              <span style={{ fontSize: '0.7rem', color: '#34d399', marginLeft: '0.5rem', fontWeight: 600 }}>
                (Type or select to auto-load details)
              </span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                list="customer-suggestions"
                className="form-input"
                style={{ fontWeight: 600, color: 'var(--text-main)', paddingRight: '2rem' }}
                placeholder="e.g. M/s, Ocean Sparkle Ltd, Karaikal Port Pvt., Ltd."
                value={customerName}
                onChange={e => handleCustomerNameChange(e.target.value)}
                required
              />
              <datalist id="customer-suggestions">
                {masterCustomers.map(c => (
                  <option key={c.id} value={c.customerName}>
                    {c.gstin ? `GSTIN: ${c.gstin}` : ''} {c.address ? `| ${c.address.slice(0, 30)}...` : ''}
                  </option>
                ))}
              </datalist>
            </div>
          </div>

          {/* Transfer from WCC Button */}
          <div style={{ gridColumn: 'span 1', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleOpenWccModal}
              className="btn btn-secondary animate-pulse"
              style={{
                padding: '0.75rem 1rem',
                fontWeight: 700,
                fontSize: '0.85rem',
                background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                borderColor: 'rgba(99, 102, 241, 0.4)',
                height: '42px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                color: 'white'
              }}
              title="Click to select a completed Work Completion Certificate and load its items"
            >
              <Zap size={16} color="#fbbf24" />
              <span>Transfer from Work Completion Certificate</span>
            </button>
          </div>

          {/* Customer Address */}
          <div style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Customer Address</label>
            <textarea
              className="form-input"
              rows={2}
              placeholder="e.g. Keezhavanjore, Thirumalairajan Pattinam, Karaikal - 609606."
              value={customerAddress}
              onChange={e => setCustomerAddress(e.target.value)}
            />
          </div>

          {/* Customer Phone & PAN */}
          <div>
            <label className="form-label">Customer Phone / Mobile</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 9842492946"
              value={customerPhone}
              onChange={e => setCustomerPhone(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Customer PAN</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. AAACO2519H"
              value={customerPan}
              onChange={e => setCustomerPan(e.target.value)}
            />
          </div>

          {/* Customer GSTIN & State Code */}
          <div>
            <label className="form-label">Customer GSTIN</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 34AAACO2519H1ZR"
              value={customerGstin}
              onChange={e => setCustomerGstin(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Customer State Code</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. PUDUCHERRY (34)"
              value={customerStateCode}
              onChange={e => setCustomerStateCode(e.target.value)}
            />
          </div>

          {/* PO Number & PO Date */}
          <div>
            <label className="form-label">P.O. Number / Ref</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. PO/2026/089"
              value={poNumber}
              onChange={e => setPoNumber(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">P.O. Date</label>
            <input
              type="date"
              className="form-input"
              value={poDate}
              onChange={e => setPoDate(e.target.value)}
            />
          </div>

          {/* Vendor Code & SAC Code */}
          <div>
            <label className="form-label">Vendor Code</label>
            <input
              type="text"
              className="form-input"
              value={vendorCode}
              onChange={e => setVendorCode(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">SAC / HSN Code</label>
            <input
              type="text"
              className="form-input"
              value={sacCode}
              onChange={e => setSacCode(e.target.value)}
            />
          </div>

          {/* Contract No & Contract Period */}
          <div>
            <label className="form-label">Contract Number</label>
            <input
              type="text"
              className="form-input"
              value={contractNo}
              onChange={e => setContractNo(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">CON. Period</label>
            <input
              type="text"
              className="form-input"
              value={contractPeriod}
              onChange={e => setContractPeriod(e.target.value)}
            />
          </div>

          {/* Bank Guarantee (B.G. No) */}
          <div style={{ gridColumn: 'span 2' }}>
            <label className="form-label">B.G. No</label>
            <input
              type="text"
              className="form-input"
              value={bgNo}
              onChange={e => setBgNo(e.target.value)}
            />
          </div>

          {/* Equipment Header Description */}
          <div style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Equipment / Job Scope Header</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. OSL TIGER (KOK 022) / REPAIRING & FABRICATION CHARGES"
              value={equipmentHeader}
              onChange={e => setEquipmentHeader(e.target.value)}
            />
          </div>

        </div>
      </div>

      {/* Line Items Table with Auto-Fetched Unit Display (No Dropdown) */}
      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', background: 'rgba(15, 23, 42, 0.6)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Zap size={20} color="#34d399" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', margin: 0 }}>
              Tax Invoice Line Items (Auto-Fetch Enabled)
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <button 
              type="button"
              onClick={() => setLineItemUploadModalOpen(true)} 
              className="btn btn-outline" 
              style={{ 
                fontSize: '0.8rem', 
                padding: '0.4rem 0.85rem',
                borderColor: 'rgba(16, 185, 129, 0.4)',
                color: '#34d399',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(16, 185, 129, 0.1)'
              }}
              title="Upload Line Items from Excel (.xlsx/.xls) or CSV spreadsheet"
            >
              <Upload size={14} />
              <span>Upload Line Items (Excel / CSV)</span>
            </button>

            <button 
              type="button"
              onClick={handleAddLine} 
              className="btn btn-secondary" 
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
            >
              <Plus size={15} /> Add Line Item
            </button>
          </div>
        </div>

        <div className="custom-table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '50px', textAlign: 'center' }}>S.No</th>
                <th style={{ width: '180px' }}>Item Code</th>
                <th>Description</th>
                <th style={{ width: '120px', textAlign: 'right' }}>Qty</th>
                <th style={{ width: '110px', textAlign: 'center' }}>Unit</th>
                <th style={{ width: '150px', textAlign: 'right' }}>Rate (₹)</th>
                <th style={{ width: '170px', textAlign: 'right' }}>Amount (₹)</th>
                <th style={{ width: '60px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, idx) => {
                const itemQty = Number(item.quantity) || 1;
                const formattedUnitDisplay = formatUnitWithQty(item.unit || 'No', itemQty);

                return (
                  <tr key={idx}>
                    {/* Serial Number */}
                    <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--text-muted)', verticalAlign: 'top', paddingTop: '0.9rem' }}>
                      {idx + 1}
                    </td>

                    {/* Item Code Dropdown / Type-In (Fast Combobox) */}
                    <td style={{ position: 'relative', minWidth: '180px', verticalAlign: 'top' }}>
                      <ItemCodeCombobox
                        value={item.itemCode}
                        masterItems={masterItems}
                        isFetched={item.fetched}
                        onChange={(newCode) => handleItemCodeChange(idx, newCode)}
                        onSelect={(selectedMaster) => handleSelectMasterItem(idx, selectedMaster)}
                      />
                    </td>

                    {/* Description (Auto-Expands Dynamically as per Content Height) */}
                    <td style={{ verticalAlign: 'top', minWidth: '280px' }}>
                      <AutoResizeTextarea
                        value={item.description}
                        onChange={e => handleItemFieldChange(idx, 'description', e.target.value)}
                        placeholder="Item description & technical specifications..."
                        minRows={2}
                      />
                    </td>

                    {/* Quantity (Bolder, Bigger & Type-Only No Spinners) */}
                    <td style={{ textAlign: 'right', verticalAlign: 'top' }}>
                      <input
                        type="number"
                        min="0.01"
                        step="any"
                        className="form-input line-item-input-large"
                        style={{ 
                          textAlign: 'right', 
                          padding: '0.55rem 0.75rem', 
                          fontSize: '1rem', 
                          fontWeight: 800, 
                          color: 'var(--text-main)',
                          background: 'var(--input-bg)',
                          border: '1.5px solid rgba(99, 102, 241, 0.4)'
                        }}
                        value={item.quantity === 0 ? '' : item.quantity}
                        onChange={e => handleItemFieldChange(idx, 'quantity', e.target.value)}
                      />
                    </td>

                    {/* Unit Display (Auto-Fetched from Item Master & Auto-Pluralized with QTY, No Dropdown) */}
                    <td style={{ textAlign: 'center', verticalAlign: 'top' }}>
                      <div 
                        style={{ 
                          padding: '0.55rem 0.75rem', 
                          fontSize: '0.9rem', 
                          fontWeight: 800, 
                          textAlign: 'center',
                          color: '#10b981',
                          background: 'rgba(16, 185, 129, 0.12)',
                          border: '1px solid rgba(16, 185, 129, 0.35)',
                          borderRadius: '8px',
                          display: 'inline-block',
                          minWidth: '65px'
                        }}
                        title={`Auto-fetched unit from Item Master (Pluralized for Qty ${itemQty})`}
                      >
                        {formattedUnitDisplay}
                      </div>
                    </td>

                    {/* Rate (Bolder, Bigger & Type-Only No Spinners) */}
                    <td style={{ textAlign: 'right', verticalAlign: 'top' }}>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        className="form-input line-item-input-large"
                        style={{ 
                          textAlign: 'right', 
                          padding: '0.55rem 0.75rem', 
                          fontSize: '1rem', 
                          fontWeight: 800, 
                          color: '#10b981',
                          background: 'var(--input-bg)',
                          border: '1.5px solid rgba(16, 185, 129, 0.4)'
                        }}
                        value={item.rate === 0 ? '' : item.rate}
                        onChange={e => handleItemFieldChange(idx, 'rate', e.target.value)}
                      />
                    </td>

                    {/* Amount (Auto Amount = QTY * Rate) */}
                    <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--text-main)', fontSize: '1.05rem', verticalAlign: 'top', paddingTop: '0.85rem', whiteSpace: 'nowrap' }}>
                      ₹{Number(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Delete Line Button */}
                    <td style={{ textAlign: 'center', verticalAlign: 'top', paddingTop: '0.65rem' }}>
                      <button 
                        type="button"
                        onClick={() => handleRemoveLine(idx)}
                        className="btn btn-danger"
                        style={{ padding: '0.45rem', borderRadius: '6px' }}
                        title="Remove row"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Calculations & GST Breakdown Card */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.25rem' }}>
        
        {/* Notes & Summary Highlights */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>
              Tax Invoice GST Summary Details
            </h4>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              <div>• Supply Type: <strong style={{ color: '#818cf8' }}>{isIntraState ? 'Intra-State (Puducherry - 34)' : 'Inter-State (Outside Puducherry)'}</strong></div>
              <div>• Applied GST Tax Rates: <strong style={{ color: '#34d399' }}>{isIntraState ? `CGST: ${halfGstPercent}% + SGST: ${halfGstPercent}%` : `IGST: ${fullGstPercent}%`}</strong></div>
              <div>• Indian FY Format: <strong style={{ color: '#fbbf24' }}>{displayChallanNumber}</strong></div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handlePreviewCurrentForm}
              className="btn btn-outline"
              style={{ flex: 1, minWidth: '160px', padding: '0.85rem 1rem', fontSize: '0.9rem', fontWeight: 700, color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)' }}
            >
              <Eye size={18} />
              <span>Preview Invoice</span>
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => handleSaveInvoice(false)}
              className="btn btn-primary"
              style={{ flex: 1, minWidth: '160px', padding: '0.85rem 1rem', fontSize: '0.9rem', fontWeight: 700 }}
            >
              <Save size={18} />
              <span>{saving ? 'Saving...' : editingId ? 'Update Tax Invoice' : 'Save Tax Invoice'}</span>
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => handleSaveInvoice(true)}
              className="btn btn-secondary"
              style={{ flex: 1, minWidth: '180px', padding: '0.85rem 1.25rem', fontSize: '0.9rem', fontWeight: 800, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderColor: 'rgba(16, 185, 129, 0.4)' }}
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
            <strong style={{ color: 'white' }}>₹{totalSubTotalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
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
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>Gross Total Amount</span>
              <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 600 }}>(Including All GST Taxes)</span>
            </div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#34d399', margin: 0 }}>
              ₹{grossTotalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>

        </div>

      </div>

      {/* WCC Selection Modal */}
      {wccModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel animate-modal-entry" style={{ width: '100%', maxWidth: '780px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', background: '#0f172a', border: '1px solid rgba(99, 102, 241, 0.4)', borderRadius: '16px', overflow: 'hidden', padding: 0 }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', background: 'rgba(31, 41, 55, 0.95)', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', color: '#fbbf24' }}>
                <Zap size={20} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white', margin: 0 }}>
                  Transfer Items from Work Completion Certificate
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setWccModalOpen(false)} 
                className="btn btn-outline" 
                style={{ padding: '0.4rem', border: 'none', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Search Bar */}
            <div style={{ padding: '1rem 1.5rem', background: 'rgba(15, 23, 42, 0.4)', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input
                type="text"
                className="form-input"
                style={{ fontSize: '0.85rem' }}
                placeholder="Search by Certificate No, Location, Make or Equipment..."
                value={wccSearchQuery}
                onChange={e => setWccSearchQuery(e.target.value)}
              />
              <button 
                type="button"
                onClick={loadWccForTransfer}
                className="btn btn-outline"
                style={{ padding: '0.55rem 0.85rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
              >
                <RefreshCw size={14} className={wccLoading ? "animate-spin" : ""} /> Refresh
              </button>
            </div>

            {/* Modal Content / Table */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
              {wccLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem auto' }} />
                  <p>Fetching Work Completion Certificates...</p>
                </div>
              ) : wccList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No Work Completion Certificates found in the database.
                </div>
              ) : (() => {
                const filteredWccs = wccList.filter(cert => {
                  const q = wccSearchQuery.toLowerCase().trim();
                  return !q ||
                    (cert.certificateNo && cert.certificateNo.toLowerCase().includes(q)) ||
                    (cert.location && cert.location.toLowerCase().includes(q)) ||
                    (cert.make && cert.make.toLowerCase().includes(q)) ||
                    (cert.equipment && cert.equipment.toLowerCase().includes(q)) ||
                    (cert.equipmentDescription && cert.equipmentDescription.toLowerCase().includes(q));
                });
                
                const allFilteredAreSelected = filteredWccs.length > 0 && filteredWccs.every(c => selectedWccIds.includes(c.id));

                return (
                  <div className="custom-table-container" style={{ border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th style={{ width: '50px', textAlign: 'center', padding: '6px' }}>
                            <input
                              type="checkbox"
                              checked={allFilteredAreSelected}
                              onChange={() => handleToggleSelectAllWccs(filteredWccs)}
                              style={{ cursor: 'pointer', transform: 'scale(1.15)' }}
                            />
                          </th>
                          <th style={{ width: '140px' }}>Certificate No</th>
                          <th style={{ width: '110px' }}>Date</th>
                          <th>Equipment / Description</th>
                          <th>Location / Make</th>
                          <th style={{ width: '90px', textAlign: 'center' }}>Items</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredWccs.length === 0 ? (
                          <tr>
                            <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                              No matching Work Completion Certificates found.
                            </td>
                          </tr>
                        ) : (
                          filteredWccs.map((cert) => {
                            const isChecked = selectedWccIds.includes(cert.id);
                            return (
                              <tr 
                                key={cert.id} 
                                style={{ 
                                  background: isChecked ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                  cursor: 'pointer'
                                }}
                                onClick={() => handleToggleWccSelect(cert.id)}
                              >
                                <td 
                                  style={{ textAlign: 'center', padding: '6px' }}
                                  onClick={(e) => e.stopPropagation()} // Prevent double-triggering row click
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleToggleWccSelect(cert.id)}
                                    style={{ cursor: 'pointer', transform: 'scale(1.15)' }}
                                  />
                                </td>
                                <td>
                                  <span className="badge badge-code" style={{ color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.4)', background: 'rgba(16, 185, 129, 0.15)' }}>
                                    {cert.certificateNo}
                                  </span>
                                </td>
                                <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                  {cert.certificateDate}
                                </td>
                                <td style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>
                                  <div>{cert.equipmentDescription || 'Material'}</div>
                                  <div style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 'normal' }}>{cert.equipment || ''}</div>
                                </td>
                                <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                  <div>{cert.location || '-'}</div>
                                  <div style={{ fontSize: '0.75rem', color: '#fbbf24' }}>Make: {cert.make || '-'}</div>
                                </td>
                                <td style={{ textAlign: 'center', fontWeight: 600 }}>
                                  <span style={{ color: '#818cf8' }}>{cert.items ? cert.items.length : 0}</span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '1rem 1.5rem', background: 'rgba(31, 41, 55, 0.95)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setWccModalOpen(false)}
                className="btn btn-outline"
                style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem' }}
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={selectedWccIds.length === 0}
                onClick={handleTransferSelectedWccs}
                className="btn btn-primary"
                style={{
                  padding: '0.55rem 1.5rem',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  background: selectedWccIds.length > 0 ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'rgba(31, 41, 55, 0.5)',
                  borderColor: selectedWccIds.length > 0 ? 'rgba(16, 185, 129, 0.4)' : 'transparent'
                }}
              >
                <Zap size={14} color="#fbbf24" style={{ marginRight: '0.25rem' }} />
                <span>Transfer Selected ({selectedWccIds.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shared Datalist for Performance Optimization */}
      <datalist id="master-items-datalist">
        {masterItems.map(m => (
          <option key={m.id} value={m.itemCode}>
            {m.description ? m.description.slice(0, 45) + '...' : ''} (Unit: {m.unit || 'No'}, Rate: ₹{m.rate}{m.serviceCharge > 0 ? ` + SC: ₹${m.serviceCharge}` : ''})
          </option>
        ))}
      </datalist>

      {/* Tax Invoice Print & Preview Modal */}
      <ChallanPrintModal 
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        challan={currentPrintChallan}
      />

      {/* Invoice Image OCR & Auto-Extraction Modal */}
      <InvoiceImageUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onApplyExtractedData={handleApplyExtractedData}
        masterCustomers={masterCustomers}
        masterItems={masterItems}
      />

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
