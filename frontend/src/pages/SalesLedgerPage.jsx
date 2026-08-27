import React, { useState, useEffect, useMemo } from 'react';
import { 
  fetchChallans,
  fetchSalesLedgers, 
  createSalesLedger, 
  updateSalesLedger, 
  deleteSalesLedger 
} from '../services/api';
import { Toast } from '../components/Toast';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Calendar, 
  Download, 
  Printer, 
  RefreshCw, 
  Filter, 
  FilterX, 
  IndianRupee, 
  Building2, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  X, 
  Save, 
  CreditCard,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  MessageSquare,
  Zap,
  Calculator,
  CheckSquare,
  Square,
  SlidersHorizontal,
  FileDown,
  FileText,
  Printer as PrintIcon
} from 'lucide-react';

const SALES_EXPORT_COLUMNS = [
  { key: 'slNo', label: 'Sl. No.', default: true },
  { key: 'invoiceNo', label: 'INVOICE NO', default: true },
  { key: 'invoiceDate', label: 'INVOICE Date', default: true },
  { key: 'billedTo', label: 'Billed To / Customer', default: true },
  { key: 'taxableAmount', label: 'Taxable Amount', default: true },
  { key: 'igst', label: 'GST - IGST', default: true },
  { key: 'sgst', label: 'GST - SGST', default: true },
  { key: 'ugst', label: 'GST - UGST', default: true },
  { key: 'taxAmount', label: 'Tax Amount', default: true },
  { key: 'totalAmount', label: 'Total Amount', default: true },
  { key: 'itTds', label: 'IT TDS (2%)', default: true },
  { key: 'gstTds', label: 'GST TDS (2%)', default: true },
  { key: 'passedAmount', label: 'Passed Amount', default: true },
  { key: 'passedDate', label: 'Passed Date', default: true },
  { key: 'modeOfPayment', label: 'Mode of Payment', default: true },
  { key: 'balanceAmount', label: 'Balance Amount', default: true },
  { key: 'remarks', label: 'Remarks', default: true }
];

// Helper: Calculate Active Financial Year Start Date formatted (e.g. 01/04/2026, 01/04/2027 etc.)
const getActiveFinancialYearStartDate = () => {
  const today = new Date();
  const currentMonth = today.getMonth(); // 0 = Jan, 3 = Apr
  const currentYear = today.getFullYear();
  const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;
  return `01/04/${fyStartYear}`;
};

// Helper: Get ISO Date for start of active Financial Year (e.g. '2026-04-01', '2027-04-01')
const getActiveFinancialYearStartIso = () => {
  const today = new Date();
  const currentMonth = today.getMonth(); // 0 = Jan, 3 = Apr
  const currentYear = today.getFullYear();
  const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;
  return `${fyStartYear}-04-01`;
};

const PAYMENT_MODES = [
  'NEFT',
  'RTGS',
  'CHEQUE',
  'BANK TRANSFER',
  'UPI',
  'CASH',
  'DEMAND DRAFT (DD)'
];

export const SalesLedgerPage = () => {
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Modal State for Manual Entry / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Export Customizer Modal State (Default: 7 core columns pre-selected)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportSelectedCols, setExportSelectedCols] = useState({
    slNo: true,
    invoiceNo: true,
    invoiceDate: true,
    billedTo: false,
    taxableAmount: false,
    igst: false,
    sgst: false,
    ugst: false,
    taxAmount: false,
    totalAmount: true,
    itTds: false,
    gstTds: false,
    passedAmount: true,
    passedDate: true,
    modeOfPayment: true,
    remarks: false
  });
  // PDF Statement Modal State
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [exportIncludeTotals, setExportIncludeTotals] = useState(true);
  const [exportScope, setExportScope] = useState('FILTERED'); // 'FILTERED' or 'ALL'

  // Customer Opening Balance Map from localStorage
  const [customerOpenings, setCustomerOpenings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('CUSTOMER_OPENING_BALANCES') || '{}');
    } catch {
      return {};
    }
  });

  // Selected Rows for Bulk Operations
  const [selectedItemIds, setSelectedItemIds] = useState([]);

  const [formData, setFormData] = useState({
    invoiceNo: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    billedTo: '',
    taxableAmount: '',
    igst: '',
    sgst: '',
    ugst: '',
    taxAmount: '',
    totalAmount: '',
    itTds: '',
    gstTds: '',
    passedAmount: '',
    passedDate: '',
    modeOfPayment: 'NEFT',
    remarks: ''
  });

  // Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('ALL'); // 'ALL', 'PASSED', 'PENDING'
  const [filterMode, setFilterMode] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [periodPreset, setPeriodPreset] = useState('ALL');

  // Pagination States (Page Split & Page Size Selector)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50); // 25, 50, 100, 250, 'ALL'

  // Reset page when filter criteria changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCustomer, filterPaymentStatus, filterMode, fromDate, toDate, periodPreset]);

  // Automatic Fetch & Merge from Tax Invoice History (DeliveryChallans)
  const loadAllSalesLedgerData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch live Tax Invoices from Tax Invoice History
      const challans = await fetchChallans();
      
      // 2. Fetch saved Sales Ledger overrides/metadata (IT TDS, GST TDS, Passed Amount/Date, Mode, Remarks)
      const savedLedgers = await fetchSalesLedgers();
      const savedMap = new Map();
      (savedLedgers || []).forEach(l => {
        if (l.invoiceNo) {
          savedMap.set(l.invoiceNo.trim().toUpperCase(), l);
        }
      });

      // 3. Auto-populate each Tax Invoice into Sales Ledger
      const autoFetchedList = (challans || []).map((c, idx) => {
        const invNo = (c.challanNumber || c.challanNo || `INV-${idx + 1}`).trim();
        const saved = savedMap.get(invNo.toUpperCase()) || {};

        // Calculate SubTotal
        const items = c.items || [];
        const subTotal = items.length > 0
          ? items.reduce((sum, i) => sum + (Number(i.amount) || (Number(i.quantity || 0) * Number(i.rate || 0))), 0)
          : Number(c.totalAmount || 0);

        const gstPercent = Number(c.gstPercent !== undefined && c.gstPercent !== null ? c.gstPercent : 18);
        const halfGst = gstPercent / 2;

        const customerGstPrefix = (c.customerGstin || '').trim().substring(0, 2);
        const isIntraState = customerGstPrefix === '34' || customerGstPrefix === '';

        let igst = 0;
        let sgst = 0;
        let ugst = 0;

        if (isIntraState) {
          sgst = subTotal * (halfGst / 100);
          ugst = subTotal * (halfGst / 100);
          igst = 0;
        } else {
          igst = subTotal * (gstPercent / 100);
          sgst = 0;
          ugst = 0;
        }

        const taxAmount = igst + sgst + ugst;
        const totalAmount = subTotal + taxAmount;

        return {
          id: saved.id || `challan-${c.id || idx}`,
          isFromChallan: true,
          challanId: c.id,
          invoiceNo: invNo,
          invoiceDate: saved.invoiceDate || c.challanDate || new Date().toISOString().split('T')[0],
          billedTo: c.customerName ? `${c.customerName}${c.customerGstin ? ` (GST: ${c.customerGstin})` : ''}` : (saved.billedTo || ''),
          taxableAmount: saved.taxableAmount !== undefined ? Number(saved.taxableAmount) : subTotal,
          igst: saved.igst !== undefined ? Number(saved.igst) : igst,
          sgst: saved.sgst !== undefined ? Number(saved.sgst) : sgst,
          ugst: saved.ugst !== undefined ? Number(saved.ugst) : ugst,
          taxAmount: saved.taxAmount !== undefined ? Number(saved.taxAmount) : taxAmount,
          totalAmount: saved.totalAmount !== undefined ? Number(saved.totalAmount) : totalAmount,
          itTds: saved.itTds !== undefined ? Number(saved.itTds) : 0,
          gstTds: saved.gstTds !== undefined ? Number(saved.gstTds) : 0,
          passedAmount: saved.passedAmount !== undefined ? Number(saved.passedAmount) : 0,
          passedDate: saved.passedDate || '',
          modeOfPayment: saved.modeOfPayment || 'NEFT',
          remarks: saved.remarks !== undefined ? saved.remarks : (saved.billedToRemarks || '')
        };
      });

      // 4. Also include any standalone manual entries created directly in Sales Ledger
      const existingChallanInvNos = new Set((challans || []).map(c => (c.challanNumber || c.challanNo || '').trim().toUpperCase()));
      const standaloneEntries = (savedLedgers || []).filter(l => {
        return l.invoiceNo && !existingChallanInvNos.has(l.invoiceNo.trim().toUpperCase());
      }).map(l => ({
        ...l,
        isFromChallan: false,
        billedTo: l.billedTo || l.billedToRemarks || '',
        remarks: l.remarks || ''
      }));

      // Combine and sort chronologically by invoice date descending
      const combined = [...autoFetchedList, ...standaloneEntries].sort((a, b) => {
        return new Date(b.invoiceDate || 0) - new Date(a.invoiceDate || 0);
      });

      setLedgerEntries(combined);
    } catch (err) {
      console.error('Failed to auto-fetch Sales Ledger records:', err);
      setToast({ message: 'Failed to auto-fetch Tax Invoices: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllSalesLedgerData();
  }, []);

  // Form Field Change with Auto-Calculation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };

      // Auto-compute Tax Amount and Total Amount if amount fields change
      if (['taxableAmount', 'igst', 'sgst', 'ugst'].includes(name)) {
        const taxable = parseFloat(name === 'taxableAmount' ? value : prev.taxableAmount) || 0;
        const igstVal = parseFloat(name === 'igst' ? value : prev.igst) || 0;
        const sgstVal = parseFloat(name === 'sgst' ? value : prev.sgst) || 0;
        const ugstVal = parseFloat(name === 'ugst' ? value : prev.ugst) || 0;

        const taxSum = igstVal + sgstVal + ugstVal;
        updated.taxAmount = taxSum > 0 ? taxSum.toFixed(2) : '';
        updated.totalAmount = (taxable + taxSum).toFixed(2);
      }

      // Auto-adjust passedAmount if IT TDS, GST TDS or Total Amount is edited
      if (['itTds', 'gstTds', 'totalAmount'].includes(name)) {
        const total = parseFloat(name === 'totalAmount' ? value : prev.totalAmount) || 0;
        const it = parseFloat(name === 'itTds' ? value : prev.itTds) || 0;
        const gst = parseFloat(name === 'gstTds' ? value : prev.gstTds) || 0;
        if (total > 0 && (it > 0 || gst > 0)) {
          updated.passedAmount = Math.max(0, total - (it + gst)).toFixed(2);
        }
      }

      return updated;
    });
  };

  // Auto-Calculate 2% IT TDS, 2% GST TDS and Net Passed Amount inside Modal
  const handleModalAutoTds = () => {
    const taxable = parseFloat(formData.taxableAmount) || 0;
    const total = parseFloat(formData.totalAmount) || 0;
    
    // IT TDS = 2% of Taxable Amount
    const itTds = (taxable * 0.02).toFixed(2);
    // GST TDS = 2% of Taxable Amount
    const gstTds = (taxable * 0.02).toFixed(2);
    // Net Passed Amount = Total Amount - (IT TDS + GST TDS)
    const passedAmount = Math.max(0, total - (parseFloat(itTds) + parseFloat(gstTds))).toFixed(2);
    const passedDate = formData.passedDate || new Date().toISOString().split('T')[0];

    setFormData(prev => ({
      ...prev,
      itTds,
      gstTds,
      passedAmount,
      passedDate
    }));

    setToast({ 
      message: `⚡ Applied: IT TDS (2%): ₹${Number(itTds).toLocaleString('en-IN')}, GST TDS (2%): ₹${Number(gstTds).toLocaleString('en-IN')} → Passed Amount: ₹${Number(passedAmount).toLocaleString('en-IN')}`, 
      type: 'success' 
    });
  };

  // Open Modal for New Manual Entry
  const handleOpenNewModal = () => {
    setEditingItem(null);
    setFormData({
      invoiceNo: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      billedTo: '',
      taxableAmount: '',
      igst: '',
      sgst: '',
      ugst: '',
      taxAmount: '',
      totalAmount: '',
      itTds: '',
      gstTds: '',
      passedAmount: '',
      passedDate: '',
      modeOfPayment: '',
      remarks: ''
    });
    setIsModalOpen(true);
  };

  // Open Modal for Editing an Existing Entry
  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    const passed = Number(item.passedAmount) || 0;
    setFormData({
      invoiceNo: item.invoiceNo || '',
      invoiceDate: item.invoiceDate || '',
      billedTo: item.billedTo || item.billedToRemarks || '',
      taxableAmount: item.taxableAmount !== undefined ? String(item.taxableAmount) : '',
      igst: item.igst !== undefined ? String(item.igst) : '',
      sgst: item.sgst !== undefined ? String(item.sgst) : '',
      ugst: item.ugst !== undefined ? String(item.ugst) : '',
      taxAmount: item.taxAmount !== undefined ? String(item.taxAmount) : '',
      totalAmount: item.totalAmount !== undefined ? String(item.totalAmount) : '',
      itTds: item.itTds !== undefined ? String(item.itTds) : '',
      gstTds: item.gstTds !== undefined ? String(item.gstTds) : '',
      passedAmount: item.passedAmount !== undefined ? String(item.passedAmount) : '',
      passedDate: item.passedDate || '',
      modeOfPayment: item.modeOfPayment || (passed > 0 ? 'NEFT' : ''),
      remarks: item.remarks || ''
    });
    setIsModalOpen(true);
  };

  // Direct Row Action: Auto Calculate 2% IT TDS + 2% GST TDS and Net Passed Amount
  const handleAutoCalculateTds = async (item) => {
    const taxable = parseFloat(item.taxableAmount) || 0;
    const total = parseFloat(item.totalAmount) || 0;
    
    // IT TDS = 2% of Taxable Amount
    const itTds = Math.round(taxable * 0.02 * 100) / 100;
    // GST TDS = 2% of Taxable Amount
    const gstTds = Math.round(taxable * 0.02 * 100) / 100;
    // Passed Amount = Total Amount - (IT TDS + GST TDS)
    const passedAmount = Math.max(0, Math.round((total - (itTds + gstTds)) * 100) / 100);
    const passedDate = item.passedDate || new Date().toISOString().split('T')[0];

    const payload = {
      invoiceNo: item.invoiceNo,
      invoiceDate: item.invoiceDate,
      billedToRemarks: item.billedTo || item.billedToRemarks || '',
      taxableAmount: taxable,
      igst: parseFloat(item.igst) || 0,
      sgst: parseFloat(item.sgst) || 0,
      ugst: parseFloat(item.ugst) || 0,
      taxAmount: parseFloat(item.taxAmount) || 0,
      totalAmount: total,
      itTds: itTds,
      gstTds: gstTds,
      passedAmount: passedAmount,
      passedDate: passedDate,
      modeOfPayment: item.modeOfPayment || 'NEFT',
      remarks: item.remarks || ''
    };

    // Update local state immediately for instant feedback
    setLedgerEntries(prev => prev.map(entry => {
      if (entry.invoiceNo === item.invoiceNo) {
        return {
          ...entry,
          itTds,
          gstTds,
          passedAmount,
          passedDate
        };
      }
      return entry;
    }));

    try {
      const existingSaved = await fetchSalesLedgers();
      const found = (existingSaved || []).find(l => (l.invoiceNo || '').trim().toUpperCase() === item.invoiceNo.toUpperCase());
      if (found && found.id) {
        await updateSalesLedger(found.id, payload);
      } else {
        await createSalesLedger(payload);
      }
      setToast({ 
        message: `⚡ Calculated & Passed for ${item.invoiceNo}: IT (2%): ₹${itTds.toLocaleString('en-IN')}, GST TDS (2%): ₹${gstTds.toLocaleString('en-IN')}, Passed Amount: ₹${passedAmount.toLocaleString('en-IN')}`, 
        type: 'success' 
      });
      loadAllSalesLedgerData();
    } catch (err) {
      setToast({ message: 'Failed to save TDS calculation: ' + err.message, type: 'error' });
    }
  };

  // Save Form (Create / Update)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.invoiceNo || !formData.invoiceDate) {
      setToast({ message: 'Invoice No and Invoice Date are required!', type: 'error' });
      return;
    }

    const payload = {
      invoiceNo: formData.invoiceNo.trim(),
      invoiceDate: formData.invoiceDate,
      billedToRemarks: formData.billedTo.trim(),
      taxableAmount: parseFloat(formData.taxableAmount) || 0,
      igst: parseFloat(formData.igst) || 0,
      sgst: parseFloat(formData.sgst) || 0,
      ugst: parseFloat(formData.ugst) || 0,
      taxAmount: parseFloat(formData.taxAmount) || 0,
      totalAmount: parseFloat(formData.totalAmount) || 0,
      itTds: parseFloat(formData.itTds) || 0,
      gstTds: parseFloat(formData.gstTds) || 0,
      passedAmount: parseFloat(formData.passedAmount) || 0,
      passedDate: formData.passedDate || null,
      modeOfPayment: formData.modeOfPayment || (parseFloat(formData.passedAmount) > 0 ? 'NEFT' : ''),
      remarks: (formData.remarks || '').trim()
    };

    try {
      // 1. If it originated from a Delivery Challan, also update the Delivery Challan record if challanId exists
      if (editingItem && editingItem.challanId) {
        try {
          const challanList = await fetchChallans();
          const targetChallan = (challanList || []).find(c => c.id === editingItem.challanId);
          if (targetChallan) {
            await updateChallan(targetChallan.id, {
              ...targetChallan,
              challanDate: formData.invoiceDate
            });
          }
        } catch (challanErr) {
          console.warn('Could not update delivery challan date directly:', challanErr);
        }
      }

      // 2. Check if updating an existing sales_ledger database record or creating new
      if (editingItem && typeof editingItem.id === 'number') {
        await updateSalesLedger(editingItem.id, payload);
      } else {
        // Find if this invoiceNo was previously saved in sales_ledger
        const existingSaved = await fetchSalesLedgers();
        const found = (existingSaved || []).find(l => (l.invoiceNo || '').trim().toUpperCase() === payload.invoiceNo.toUpperCase());
        if (found && found.id && typeof found.id === 'number') {
          await updateSalesLedger(found.id, payload);
        } else {
          await createSalesLedger(payload);
        }
      }
      setToast({ message: `Sales Ledger for Invoice ${payload.invoiceNo} saved successfully!`, type: 'success' });
      setIsModalOpen(false);
      await loadAllSalesLedgerData();
    } catch (err) {
      setToast({ message: 'Failed to save Sales Ledger: ' + err.message, type: 'error' });
    }
  };

  // Direct Inline Remarks Update
  const handleInlineRemarksChange = async (item, newRemarks) => {
    // Update locally first for instant UI response
    setLedgerEntries(prev => prev.map(entry => {
      if (entry.invoiceNo === item.invoiceNo) {
        return { ...entry, remarks: newRemarks };
      }
      return entry;
    }));

    // Persist to backend/storage
    try {
      const payload = {
        invoiceNo: item.invoiceNo,
        invoiceDate: item.invoiceDate,
        billedToRemarks: item.billedTo,
        taxableAmount: item.taxableAmount,
        igst: item.igst,
        sgst: item.sgst,
        ugst: item.ugst,
        taxAmount: item.taxAmount,
        totalAmount: item.totalAmount,
        itTds: item.itTds,
        gstTds: item.gstTds,
        passedAmount: item.passedAmount,
        passedDate: item.passedDate,
        modeOfPayment: item.modeOfPayment,
        remarks: newRemarks
      };

      const existingSaved = await fetchSalesLedgers();
      const found = (existingSaved || []).find(l => (l.invoiceNo || '').trim().toUpperCase() === item.invoiceNo.toUpperCase());
      if (found && found.id) {
        await updateSalesLedger(found.id, payload);
      } else {
        await createSalesLedger(payload);
      }
    } catch (e) {
      console.warn('Failed to save inline remarks:', e);
    }
  };

  // Delete Entry
  const handleDelete = async (item) => {
    const inv = item.invoiceNo && item.invoiceNo !== '-' ? `Invoice "${item.invoiceNo}"` : `entry for "${item.billedTo || 'this customer'}"`;
    if (!window.confirm(`Are you sure you want to delete Sales Ledger ${inv}?`)) {
      return;
    }
    try {
      if (item.id) {
        await deleteSalesLedger(item.id);
      }
      setLedgerEntries(prev => prev.filter(p => p.id !== item.id && String(p.id) !== String(item.id)));
      setToast({ message: `Sales Ledger entry deleted successfully!`, type: 'success' });
      loadAllSalesLedgerData();
    } catch (err) {
      setToast({ message: 'Failed to delete: ' + err.message, type: 'error' });
    }
  };

  // Period Preset Quick Selector
  const handlePresetChange = (preset) => {
    setPeriodPreset(preset);
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    if (preset === 'ALL') {
      setFromDate('');
      setToDate('');
    } else if (preset === 'THIS_MONTH') {
      const firstDay = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
      const lastDay = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0];
      setFromDate(firstDay);
      setToDate(lastDay);
    } else if (preset === 'LAST_MONTH') {
      const firstDay = new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0];
      const lastDay = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];
      setFromDate(firstDay);
      setToDate(lastDay);
    } else if (preset === 'THIS_QUARTER') {
      const quarterIndex = Math.floor(currentMonth / 3);
      const firstDay = new Date(currentYear, quarterIndex * 3, 1).toISOString().split('T')[0];
      const lastDay = new Date(currentYear, (quarterIndex + 1) * 3, 0).toISOString().split('T')[0];
      setFromDate(firstDay);
      setToDate(lastDay);
    } else if (preset === 'THIS_FY') {
      const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;
      const firstDay = `${fyStartYear}-04-01`;
      const lastDay = `${fyStartYear + 1}-03-31`;
      setFromDate(firstDay);
      setToDate(lastDay);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterCustomer('');
    setFilterPaymentStatus('ALL');
    setFilterMode('ALL');
    setFromDate('');
    setToDate('');
    setPeriodPreset('ALL');
  };

  // Filtered List
  const filteredLedgers = useMemo(() => {
    return ledgerEntries.filter(item => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        (item.invoiceNo && item.invoiceNo.toLowerCase().includes(q)) ||
        (item.billedTo && item.billedTo.toLowerCase().includes(q)) ||
        (item.remarks && item.remarks.toLowerCase().includes(q)) ||
        (item.modeOfPayment && item.modeOfPayment.toLowerCase().includes(q));

      const custQ = filterCustomer.toLowerCase().trim();
      const matchesCust = !custQ || (item.billedTo && item.billedTo.toLowerCase().includes(custQ));

      // Payment Status (Passed vs Pending)
      let matchesStatus = true;
      const isPassed = Number(item.passedAmount) > 0 || (item.passedDate && item.passedDate.trim() !== '');
      if (filterPaymentStatus === 'PASSED') matchesStatus = isPassed;
      if (filterPaymentStatus === 'PENDING') matchesStatus = !isPassed;

      // Mode
      const matchesMode = filterMode === 'ALL' || item.modeOfPayment === filterMode;

      // Date
      let matchesDate = true;
      if (item.invoiceDate) {
        if (fromDate && item.invoiceDate < fromDate) matchesDate = false;
        if (toDate && item.invoiceDate > toDate) matchesDate = false;
      } else if (fromDate || toDate) {
        matchesDate = false;
      }

      return matchesSearch && matchesCust && matchesStatus && matchesMode && matchesDate;
    });
  }, [ledgerEntries, searchQuery, filterCustomer, filterPaymentStatus, filterMode, fromDate, toDate]);

  // Pagination Slice Calculation
  const totalPages = pageSize === 'ALL' ? 1 : Math.max(1, Math.ceil(filteredLedgers.length / (Number(pageSize) || 50)));
  const effectivePage = Math.min(currentPage, totalPages);
  const startIndex = pageSize === 'ALL' ? 0 : (effectivePage - 1) * Number(pageSize);
  const endIndex = pageSize === 'ALL' ? filteredLedgers.length : Math.min(startIndex + Number(pageSize), filteredLedgers.length);
  const paginatedLedgers = useMemo(() => {
    return filteredLedgers.slice(startIndex, endIndex);
  }, [filteredLedgers, startIndex, endIndex]);

  // Safe Date Formatting Helper to prevent "Invalid Date"
  const formatCellDate = (val) => {
    if (!val || val === '-' || val === '--' || String(val).trim() === '') return '-';
    const d = new Date(val);
    return isNaN(d.getTime()) ? String(val) : d.toLocaleDateString('en-GB');
  };

  // Select All & Bulk Selection Handlers
  const isAllSelected = filteredLedgers.length > 0 && selectedItemIds.length === filteredLedgers.length;
  const isIndeterminate = selectedItemIds.length > 0 && selectedItemIds.length < filteredLedgers.length;

  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(filteredLedgers.map(l => l.id || l.invoiceNo));
    }
  };

  const handleSelectItemToggle = (id) => {
    setSelectedItemIds(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const handleBulkDeleteSelected = async () => {
    if (selectedItemIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete all ${selectedItemIds.length} selected sales ledger records?`)) return;

    try {
      setLoading(true);
      await Promise.all(selectedItemIds.map(id => {
        const item = ledgerEntries.find(l => (l.id === id || l.invoiceNo === id));
        return item && item.id ? deleteSalesLedger(item.id) : null;
      }));
      setToast({ message: `Successfully deleted ${selectedItemIds.length} sales ledger records!`, type: 'success' });
      setSelectedItemIds([]);
      await loadAllSalesLedgerData();
    } catch (err) {
      console.error('Bulk delete failed:', err);
      setToast({ message: 'Failed to delete some records: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Unique Customer Names for Autocomplete Filter
  const uniqueCustomerOptions = useMemo(() => {
    const names = new Set();
    ledgerEntries.forEach(item => {
      if (item.billedTo && item.billedTo.trim()) {
        names.add(item.billedTo.trim());
      }
    });
    return Array.from(names).sort();
  }, [ledgerEntries]);

  // Full Resolved Customer Name for Statement (resolves 'oc' -> 'M/s, Ocean Sparkle Ltd...')
  const resolvedCustomerName = useMemo(() => {
    if (!filterCustomer || !filterCustomer.trim()) {
      return 'SRI DURGA ENTERPRISES, KARAIKAL.';
    }
    const q = filterCustomer.trim().toLowerCase();
    const matched = uniqueCustomerOptions.find(name => name.toLowerCase().includes(q));
    if (matched) return matched;

    const firstWithBilledTo = filteredLedgers.find(l => l.billedTo && l.billedTo.toLowerCase().includes(q));
    if (firstWithBilledTo && firstWithBilledTo.billedTo) return firstWithBilledTo.billedTo;

    return filterCustomer.trim();
  }, [filterCustomer, uniqueCustomerOptions, filteredLedgers]);

  // Calculate Dynamic Opening Balance for current Customer & Date Filter
  // Auto-fetches all unpaid balances dated BEFORE the current Financial Year / fromDate (e.g. 01/04/2025, 01/04/2026)
  const openingBalance = useMemo(() => {
    const targetCust = (resolvedCustomerName && resolvedCustomerName !== 'SRI DURGA ENTERPRISES, KARAIKAL.') 
      ? resolvedCustomerName.trim().toUpperCase() 
      : (filterCustomer || '').trim().toUpperCase();

    let baseOpening = 0;
    
    // 1. Saved explicit opening balance for this party
    if (targetCust) {
      for (const [k, val] of Object.entries(customerOpenings)) {
        const cleanK = k.trim().toUpperCase();
        if (cleanK === targetCust || cleanK.includes(targetCust) || targetCust.includes(cleanK)) {
          baseOpening = Number(val) || 0;
          break;
        }
      }
    } else if (customerOpenings['DEFAULT'] !== undefined) {
      baseOpening = Number(customerOpenings['DEFAULT']) || 0;
    }

    const cutoffDate = fromDate || getActiveFinancialYearStartIso();

    // 2. Sum unpaid balances from prior invoices (dated before cutoffDate e.g. 01/04/2025, 01/04/2026)
    let priorUnpaid = 0;
    ledgerEntries.forEach(item => {
      const matchesCust = !targetCust || (item.billedTo && (item.billedTo.toUpperCase().includes(targetCust) || targetCust.includes(item.billedTo.toUpperCase())));
      if (matchesCust) {
        const itemDate = item.invoiceDate || item.passedDate;
        let isPrior = false;
        if (itemDate && itemDate < cutoffDate) {
          isPrior = true;
        } else if (!itemDate && item.invoiceNo && (item.invoiceNo.includes('/25-26') || item.invoiceNo.includes('/24-25')) && cutoffDate >= '2026-04-01') {
          isPrior = true;
        }

        if (isPrior) {
          const invTotal = Number(item.totalAmount) || 0;
          const invPassed = Number(item.passedAmount) || 0;
          priorUnpaid += Math.max(0, invTotal - invPassed);
        }
      }
    });

    return baseOpening + priorUnpaid;
  }, [customerOpenings, filterCustomer, resolvedCustomerName, fromDate, ledgerEntries]);

  // Aggregate Totals (Balance Amount = Opening Balance + Total Invoiced Amount - Total Passed Amount)
  const totals = useMemo(() => {
    const agg = filteredLedgers.reduce((acc, item) => {
      const taxable = Number(item.taxableAmount) || 0;
      const igst = Number(item.igst) || 0;
      const sgst = Number(item.sgst) || 0;
      const ugst = Number(item.ugst) || 0;
      const tax = Number(item.taxAmount) || (igst + sgst + ugst);
      const total = Number(item.totalAmount) || (taxable + tax);
      const it = Number(item.itTds) || 0;
      const gst = Number(item.gstTds) || 0;
      const passed = Number(item.passedAmount) || 0;

      acc.taxableAmount += taxable;
      acc.igst += igst;
      acc.sgst += sgst;
      acc.ugst += ugst;
      acc.taxAmount += tax;
      acc.totalAmount += total;
      acc.itTds += it;
      acc.gstTds += gst;
      acc.passedAmount += passed;
      return acc;
    }, {
      taxableAmount: 0,
      igst: 0,
      sgst: 0,
      ugst: 0,
      taxAmount: 0,
      totalAmount: 0,
      itTds: 0,
      gstTds: 0,
      passedAmount: 0
    });

    if (filterCustomer && filterCustomer.trim()) {
      // For a specific customer: Opening Balance + Total Invoiced - Total Passed
      agg.balanceAmount = Math.max(0, (openingBalance + agg.totalAmount) - agg.passedAmount);
    } else {
      // For ALL customers: Group by customer, subtract payments against invoices party-wise, and sum true net pending receivables
      const partyMap = {};

      filteredLedgers.forEach(item => {
        const custName = (item.billedTo || item.billedToRemarks || 'UNKNOWN').trim().toUpperCase();
        if (!partyMap[custName]) {
          partyMap[custName] = { total: 0, passed: 0 };
        }
        const total = Number(item.totalAmount) || 0;
        const passed = Number(item.passedAmount) || 0;
        partyMap[custName].total += total;
        partyMap[custName].passed += passed;
      });

      let totalAllPartiesBalance = 0;
      const allCustomerKeys = new Set([
        ...Object.keys(partyMap),
        ...Object.keys(customerOpenings).map(k => k.trim().toUpperCase()).filter(k => k !== 'DEFAULT')
      ]);

      allCustomerKeys.forEach(custUpper => {
        const pData = partyMap[custUpper] || { total: 0, passed: 0 };
        
        let opBal = 0;
        for (const [k, val] of Object.entries(customerOpenings)) {
          const cleanK = k.trim().toUpperCase();
          if (cleanK === custUpper || cleanK.includes(custUpper) || custUpper.includes(cleanK)) {
            opBal = Number(val) || 0;
            break;
          }
        }

        const partyNetBalance = (opBal + pData.total) - pData.passed;
        if (partyNetBalance > 0) {
          totalAllPartiesBalance += partyNetBalance;
        }
      });

      agg.balanceAmount = totalAllPartiesBalance;
    }
    return agg;
  }, [filteredLedgers, openingBalance, filterCustomer, customerOpenings]);

  // Handler to set/save Opening Balance for current customer
  const handleSaveOpeningBalance = (newAmount) => {
    const custKey = (resolvedCustomerName && resolvedCustomerName !== 'SRI DURGA ENTERPRISES, KARAIKAL.')
      ? resolvedCustomerName.trim()
      : (filterCustomer ? filterCustomer.trim() : 'DEFAULT');

    const updated = {
      ...customerOpenings,
      [custKey]: Number(newAmount) || 0
    };
    setCustomerOpenings(updated);
    localStorage.setItem('CUSTOMER_OPENING_BALANCES', JSON.stringify(updated));
    setToast({ message: `Opening Balance of ₹${(Number(newAmount) || 0).toLocaleString('en-IN')} saved for ${custKey}!`, type: 'success' });
  };

  const activeFilterCount = [
    searchQuery,
    filterCustomer,
    filterPaymentStatus !== 'ALL' ? filterPaymentStatus : null,
    filterMode !== 'ALL' ? filterMode : null,
    fromDate,
    toDate,
    periodPreset !== 'ALL' ? periodPreset : null
  ].filter(Boolean).length;

  // Open Export Modal
  const handleOpenExportModal = () => {
    if (filteredLedgers.length === 0 && ledgerEntries.length === 0) {
      setToast({ message: 'No records available to export.', type: 'error' });
      return;
    }
    setIsExportModalOpen(true);
  };

  // Toggle single export column
  const handleToggleExportCol = (key) => {
    setExportSelectedCols(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Select all / Deselect all export columns
  const handleSelectAllExportCols = (selectAll = true) => {
    const updated = {};
    SALES_EXPORT_COLUMNS.forEach(c => {
      updated[c.key] = selectAll;
    });
    setExportSelectedCols(updated);
  };

  // Execute Customized Excel Export
  const executeExportCSV = () => {
    const activeColumns = SALES_EXPORT_COLUMNS.filter(c => exportSelectedCols[c.key]);

    if (activeColumns.length === 0) {
      setToast({ message: 'Please select at least 1 column to export!', type: 'error' });
      return;
    }

    const recordsToExport = exportScope === 'ALL' ? ledgerEntries : filteredLedgers;

    if (recordsToExport.length === 0) {
      setToast({ message: 'No records matching export scope.', type: 'error' });
      return;
    }

    // Build Header List
    const headers = activeColumns.map(c => c.label);

    // Build Row List
    const rows = recordsToExport.map((l, idx) => {
      return activeColumns.map(col => {
        switch (col.key) {
          case 'slNo': return idx + 1;
          case 'invoiceNo': return `"${l.invoiceNo || ''}"`;
          case 'invoiceDate': return `"${l.invoiceDate || ''}"`;
          case 'billedTo': return `"${(l.billedTo || '').replace(/"/g, '""')}"`;
          case 'taxableAmount': return (Number(l.taxableAmount) || 0).toFixed(2);
          case 'igst': return (Number(l.igst) || 0).toFixed(2);
          case 'sgst': return (Number(l.sgst) || 0).toFixed(2);
          case 'ugst': return (Number(l.ugst) || 0).toFixed(2);
          case 'taxAmount': return (Number(l.taxAmount) || 0).toFixed(2);
          case 'totalAmount': return (Number(l.totalAmount) || 0).toFixed(2);
          case 'itTds': return (Number(l.itTds) || 0).toFixed(2);
          case 'gstTds': return (Number(l.gstTds) || 0).toFixed(2);
          case 'passedAmount': return (Number(l.passedAmount) || 0).toFixed(2);
          case 'passedDate': return `"${l.passedDate || ''}"`;
          case 'modeOfPayment': return `"${l.modeOfPayment || ''}"`;
          case 'remarks': return `"${(l.remarks || '').replace(/"/g, '""')}"`;
          default: return '""';
        }
      });
    });

    // Optional Grand Total Summary Row
    if (exportIncludeTotals) {
      const scopeTotals = recordsToExport.reduce((acc, item) => {
        acc.taxableAmount += Number(item.taxableAmount) || 0;
        acc.igst += Number(item.igst) || 0;
        acc.sgst += Number(item.sgst) || 0;
        acc.ugst += Number(item.ugst) || 0;
        acc.taxAmount += Number(item.taxAmount) || 0;
        acc.totalAmount += Number(item.totalAmount) || 0;
        acc.itTds += Number(item.itTds) || 0;
        acc.gstTds += Number(item.gstTds) || 0;
        acc.passedAmount += Number(item.passedAmount) || 0;
        return acc;
      }, { taxableAmount: 0, igst: 0, sgst: 0, ugst: 0, taxAmount: 0, totalAmount: 0, itTds: 0, gstTds: 0, passedAmount: 0 });

      const totalRow = activeColumns.map(col => {
        switch (col.key) {
          case 'slNo': return '';
          case 'invoiceNo': return '"TOTAL"';
          case 'invoiceDate': return '""';
          case 'billedTo': return '""';
          case 'taxableAmount': return scopeTotals.taxableAmount.toFixed(2);
          case 'igst': return scopeTotals.igst.toFixed(2);
          case 'sgst': return scopeTotals.sgst.toFixed(2);
          case 'ugst': return scopeTotals.ugst.toFixed(2);
          case 'taxAmount': return scopeTotals.taxAmount.toFixed(2);
          case 'totalAmount': return scopeTotals.totalAmount.toFixed(2);
          case 'itTds': return scopeTotals.itTds.toFixed(2);
          case 'gstTds': return scopeTotals.gstTds.toFixed(2);
          case 'passedAmount': return scopeTotals.passedAmount.toFixed(2);
          case 'passedDate': return '""';
          case 'modeOfPayment': return '""';
          case 'remarks': return '""';
          default: return '""';
        }
      });
      rows.push(totalRow);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `Sales_Ledger_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsExportModalOpen(false);
    setToast({ 
      message: `Exported ${recordsToExport.length} invoices (${activeColumns.length} columns) to Excel successfully!`, 
      type: 'success' 
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header Banner */}
      <div 
        className="no-print"
        style={{ 
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.18) 0%, rgba(16, 185, 129, 0.12) 100%)', 
          border: '1px solid rgba(99, 102, 241, 0.3)', 
          borderRadius: '16px', 
          padding: '1.25rem 1.5rem', 
          display: 'flex', 
          flexWrap: 'wrap', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          gap: '1rem' 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.25)', padding: '0.75rem', borderRadius: '12px', color: '#818cf8' }}>
            <BookOpen size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
              <span style={{ fontWeight: 600 }}>Accounting & Finance</span>
              <ChevronRight size={12} />
              <span style={{ color: '#818cf8', fontWeight: 700 }}>Sales Ledger</span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Sales Ledger Register & Payment Tracker
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Auto-fetched from Tax Invoice History with customizable Remarks, IT TDS, GST TDS, passed amounts, and payment modes.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
          {/* 1. FILTER BUTTON WITH ACTIVE BADGE */}
          <button 
            onClick={() => setShowFilters(prev => !prev)} 
            className={`btn ${showFilters || activeFilterCount > 0 ? 'btn-primary' : 'btn-outline'}`}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              padding: '0.55rem 1rem', 
              fontSize: '0.85rem',
              fontWeight: 700
            }}
            title="Toggle Filters"
          >
            <Filter size={16} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span style={{ 
                background: '#fbbf24', 
                color: '#0f172a', 
                borderRadius: '50%', 
                width: '18px', 
                height: '18px', 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '0.75rem', 
                fontWeight: 900 
              }}>
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* 2. Refresh & Sync */}
          <button onClick={loadAllSalesLedgerData} className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '0.55rem 0.85rem' }} title="Refresh & Sync from Tax Invoices">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div 
        className="no-print"
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', 
          gap: '1rem' 
        }}
      >
        {/* Card 1: Gross Sales Turnover */}
        <div className="glass-panel" style={{ padding: '1.15rem 1.25rem', borderLeft: '4px solid #34d399', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Gross Amount
            </span>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#34d399' }}>
            ₹{totals.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
            Across <strong>{filteredLedgers.length}</strong> Invoices
          </span>
        </div>

        {/* Card 2: Taxable Amount */}
        <div className="glass-panel" style={{ padding: '1.15rem 1.25rem', borderLeft: '4px solid #38bdf8', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Taxable Amount
            </span>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
              <FileSpreadsheet size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#38bdf8' }}>
            ₹{totals.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
            Base Net Value
          </span>
        </div>

        {/* Card 3: Total GST (IGST + SGST + UGST) */}
        <div className="glass-panel" style={{ padding: '1.15rem 1.25rem', borderLeft: '4px solid #818cf8', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total GST Tax
            </span>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
              <IndianRupee size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#818cf8' }}>
            ₹{totals.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
            IGST: ₹{totals.igst.toLocaleString('en-IN', { minimumFractionDigits: 1 })} | SGST+UGST: ₹{(totals.sgst + totals.ugst).toLocaleString('en-IN', { minimumFractionDigits: 1 })}
          </span>
        </div>

        {/* Card 4: Total Passed Amount */}
        <div className="glass-panel" style={{ padding: '1.15rem 1.25rem', borderLeft: '4px solid #fbbf24', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Passed / Realized
            </span>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fbbf24' }}>
            ₹{totals.passedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
            Realized to Bank Account
          </span>
        </div>

        {/* Card 5: Total Deducted (IT + GST TDS) */}
        <div className="glass-panel" style={{ padding: '1.15rem 1.25rem', borderLeft: '4px solid #f472b6', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total TDS (IT + GST)
            </span>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(244, 114, 182, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f472b6' }}>
              <CreditCard size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f472b6' }}>
            ₹{(totals.itTds + totals.gstTds).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
            IT: ₹{totals.itTds.toLocaleString('en-IN', { minimumFractionDigits: 1 })} | GST TDS: ₹{totals.gstTds.toLocaleString('en-IN', { minimumFractionDigits: 1 })}
          </span>
        </div>
      </div>

      {/* FILTER PANEL */}
      {showFilters && (
        <div className="glass-panel animate-modal-entry no-print" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1.5px solid rgba(99, 102, 241, 0.35)', background: 'rgba(15, 23, 42, 0.95)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#818cf8', fontWeight: 800, fontSize: '0.95rem' }}>
              <Filter size={18} />
              <span>Sales Ledger Filters & Inspector</span>
              {activeFilterCount > 0 && (
                <span style={{ fontSize: '0.75rem', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', padding: '2px 8px', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.4)' }}>
                  {activeFilterCount} active
                </span>
              )}
            </div>

            {/* Quick Period Presets */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handlePresetChange('ALL')}
                className={`btn ${periodPreset === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
              >
                All Time
              </button>
              <button
                type="button"
                onClick={() => handlePresetChange('THIS_MONTH')}
                className={`btn ${periodPreset === 'THIS_MONTH' ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
              >
                This Month
              </button>
              <button
                type="button"
                onClick={() => handlePresetChange('LAST_MONTH')}
                className={`btn ${periodPreset === 'LAST_MONTH' ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
              >
                Last Month
              </button>
              <button
                type="button"
                onClick={() => handlePresetChange('THIS_QUARTER')}
                className={`btn ${periodPreset === 'THIS_QUARTER' ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
              >
                This Quarter
              </button>
              <button
                type="button"
                onClick={() => handlePresetChange('THIS_FY')}
                className={`btn ${periodPreset === 'THIS_FY' ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
              >
                FY 2026-27
              </button>
            </div>

            {activeFilterCount > 0 && (
              <button 
                onClick={handleResetFilters}
                className="btn btn-outline"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.35)' }}
              >
                <FilterX size={14} /> Clear Filters
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.875rem' }}>
            {/* Search */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.35rem' }}>Search Keywords</label>
              <div style={{ position: 'relative' }}>
                <Search size={15} color="var(--text-subtle)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
                  placeholder="Invoice No, Remarks..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Customer */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.35rem' }}>Billed To / Customer</label>
              <div style={{ position: 'relative' }}>
                <Building2 size={15} color="var(--text-subtle)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  list="sales-customer-options"
                  className="form-input"
                  style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
                  placeholder="e.g. Ocean Sparkle, ONGC..."
                  value={filterCustomer}
                  onChange={e => setFilterCustomer(e.target.value)}
                />
                <datalist id="sales-customer-options">
                  {uniqueCustomerOptions.map(name => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Payment Status */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.35rem' }}>Payment Status</label>
              <select
                className="form-input"
                style={{ fontSize: '0.85rem' }}
                value={filterPaymentStatus}
                onChange={e => setFilterPaymentStatus(e.target.value)}
              >
                <option value="ALL">All Payments</option>
                <option value="PASSED">Passed / Realized</option>
                <option value="PENDING">Pending / Unpassed</option>
              </select>
            </div>

            {/* Mode of Payment */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.35rem' }}>Mode of Payment</label>
              <select
                className="form-input"
                style={{ fontSize: '0.85rem' }}
                value={filterMode}
                onChange={e => setFilterMode(e.target.value)}
              >
                <option value="ALL">All Modes</option>
                {PAYMENT_MODES.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* From Date */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.35rem' }}>From Date</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={15} color="var(--text-subtle)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="date"
                  className="form-input"
                  style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                />
              </div>
            </div>

            {/* To Date */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.35rem' }}>To Date</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={15} color="var(--text-subtle)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="date"
                  className="form-input"
                  style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SALES LEDGER REGISTER TABLE (EXACT 2-TIER HEADER WITH REMARKS AS REQUESTED) */}
      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div 
          className="no-print"
          style={{ 
            padding: '1rem 1.5rem', 
            background: 'rgba(15, 23, 42, 0.6)', 
            borderBottom: '1px solid var(--border-color)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            flexWrap: 'wrap', 
            gap: '1rem' 
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <BookOpen size={18} color="#818cf8" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white', margin: 0 }}>
              Sales Ledger Register
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
              Showing <strong>{filteredLedgers.length}</strong> of <strong>{ledgerEntries.length}</strong> Invoices
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            {/* Export Excel Button (Opens Customizer Dialog) */}
            <button 
              onClick={handleOpenExportModal} 
              className="btn btn-outline" 
              style={{ border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34d399', fontSize: '0.8rem', padding: '0.4rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }} 
              title="Select Columns and Export Sales Ledger to Excel"
              disabled={ledgerEntries.length === 0}
            >
              <Download size={15} />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        {/* Selected Items Bulk Action Toolbar */}
        {selectedItemIds.length > 0 && (
          <div 
            className="no-print animate-fade-in"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 1.5rem',
              background: 'rgba(99, 102, 241, 0.16)',
              borderBottom: '1px solid rgba(99, 102, 241, 0.4)',
              color: '#c7d2fe',
              fontSize: '0.85rem',
              fontWeight: 700
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <CheckSquare size={17} color="#818cf8" />
              <span><strong>{selectedItemIds.length}</strong> of <strong>{filteredLedgers.length}</strong> sales invoices selected</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={handleBulkDeleteSelected}
                className="btn btn-outline"
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}
              >
                <Trash2 size={13} />
                <span>Delete Selected ({selectedItemIds.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedItemIds([])}
                className="btn btn-outline"
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', color: '#94a3b8' }}
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        <div 
          className="custom-table-container" 
          style={{ 
            border: 'none', 
            borderRadius: 0, 
            overflowX: 'auto',
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 320px)',
            position: 'relative'
          }}
        >
          <table className="custom-table" style={{ fontSize: '0.825rem', borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              {/* Top Grouped Header Row */}
              <tr style={{ background: '#0f172a', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', position: 'sticky', top: 0, zIndex: 16 }}>
                <th rowSpan={2} style={{ width: '45px', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.1)', background: '#0f172a' }} className="no-print">
                  <input
                    type="checkbox"
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#6366f1' }}
                    checked={isAllSelected}
                    ref={input => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={handleSelectAllToggle}
                    title="Select All / Deselect All Invoices"
                  />
                </th>
                <th rowSpan={2} style={{ width: '55px', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.1)', background: '#0f172a' }}>Sl. No.</th>
                <th rowSpan={2} style={{ width: '110px', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.1)', color: '#fbbf24', background: '#0f172a' }}>INVOICE NO</th>
                <th rowSpan={2} style={{ width: '95px', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', background: '#0f172a' }}>INVOICE Date</th>
                <th rowSpan={2} style={{ minWidth: '160px', borderRight: '1px solid rgba(255,255,255,0.1)', background: '#0f172a' }}>Billed To</th>
                <th rowSpan={2} style={{ width: '115px', textAlign: 'right', borderRight: '1px solid rgba(255,255,255,0.1)', color: '#38bdf8', background: '#0f172a' }}>Taxable Amount</th>
                
                {/* Group: GST Breakdown */}
                <th colSpan={3} style={{ background: '#1e293b', borderRight: '1px solid rgba(255,255,255,0.1)', color: '#fde047', fontSize: '0.75rem', padding: '4px' }}>
                  GST BREAKDOWN
                </th>

                <th rowSpan={2} style={{ width: '105px', textAlign: 'right', borderRight: '1px solid rgba(255,255,255,0.1)', color: '#818cf8', background: '#0f172a' }}>Tax Amount</th>
                <th rowSpan={2} style={{ width: '125px', textAlign: 'right', borderRight: '1px solid rgba(255,255,255,0.1)', color: '#34d399', fontWeight: 800, background: '#0f172a' }}>Total Amount</th>
                <th rowSpan={2} style={{ width: '95px', textAlign: 'right', borderRight: '1px solid rgba(255,255,255,0.1)', color: '#f87171', background: '#0f172a' }}>IT TDS (2%)</th>
                <th rowSpan={2} style={{ width: '95px', textAlign: 'right', borderRight: '1px solid rgba(255,255,255,0.1)', color: '#f87171', background: '#0f172a' }}>GST TDS (2%)</th>
                
                {/* Group: Passed Payment */}
                <th colSpan={2} style={{ background: '#064e3b', borderRight: '1px solid rgba(255,255,255,0.1)', color: '#6ee7b7', fontSize: '0.75rem', padding: '4px' }}>
                  PASSED / REALIZED
                </th>

                <th rowSpan={2} style={{ width: '100px', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.1)', background: '#0f172a' }}>Mode of Payment</th>
                <th rowSpan={2} style={{ minWidth: '150px', borderRight: '1px solid rgba(255,255,255,0.1)', background: '#0f172a' }}>Remarks</th>
                <th rowSpan={2} style={{ width: '120px', textAlign: 'center', background: '#0f172a' }} className="no-print">Actions</th>
              </tr>

              {/* Sub-header Row for Grouped Columns */}
              <tr style={{ background: '#0f172a', textAlign: 'center', position: 'sticky', top: '28px', zIndex: 15, boxShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
                {/* Under GST Breakdown */}
                <th style={{ width: '85px', textAlign: 'right', borderRight: '1px solid rgba(255,255,255,0.1)', color: '#fde047', background: '#1e293b' }}>IGST</th>
                <th style={{ width: '85px', textAlign: 'right', borderRight: '1px solid rgba(255,255,255,0.1)', color: '#fde047', background: '#1e293b' }}>SGST</th>
                <th style={{ width: '85px', textAlign: 'right', borderRight: '1px solid rgba(255,255,255,0.1)', color: '#fde047', background: '#1e293b' }}>UGST</th>

                {/* Under Passed */}
                <th style={{ width: '105px', textAlign: 'right', borderRight: '1px solid rgba(255,255,255,0.1)', color: '#86efac', background: '#064e3b' }}>Amount</th>
                <th style={{ width: '85px', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.1)', color: '#86efac', background: '#064e3b' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={17} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem auto' }} />
                    <p style={{ margin: 0 }}>Auto-fetching Tax Invoices from History...</p>
                  </td>
                </tr>
              ) : filteredLedgers.length === 0 ? (
                <tr>
                  <td colSpan={17} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <BookOpen size={32} style={{ margin: '0 auto 0.75rem auto', opacity: 0.4 }} />
                    <p style={{ fontWeight: 600, color: 'white', marginBottom: '0.35rem' }}>No Tax Invoices found</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginBottom: '1rem' }}>
                      Invoices created in Tax Invoice History will automatically appear here, or you can add manual sales entries!
                    </p>
                    <button onClick={handleOpenNewModal} className="btn btn-primary" style={{ fontSize: '0.8rem' }}>
                      <Plus size={14} /> Add Entry Manually
                    </button>
                  </td>
                </tr>
              ) : (
                paginatedLedgers.map((l, pIdx) => {
                  const globalIdx = startIndex + pIdx;
                  const isPassed = Number(l.passedAmount) > 0 || (l.passedDate && l.passedDate.trim() !== '');
                  const itemKey = l.id || l.invoiceNo || globalIdx;
                  const isSelected = selectedItemIds.includes(itemKey);

                  return (
                    <tr key={l.invoiceNo || globalIdx} style={{ background: isSelected ? 'rgba(99, 102, 241, 0.14)' : undefined }}>
                      {/* Row Checkbox */}
                      <td style={{ textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.05)' }} className="no-print">
                        <input
                          type="checkbox"
                          style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#6366f1' }}
                          checked={isSelected}
                          onChange={() => handleSelectItemToggle(itemKey)}
                        />
                      </td>

                      {/* Sl. No. */}
                      <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)' }}>
                        {globalIdx + 1}
                      </td>

                      {/* INVOICE NO */}
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge badge-code" style={{ color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.4)', background: 'rgba(245, 158, 11, 0.15)', fontWeight: 800 }}>
                          {l.invoiceNo || '-'}
                        </span>
                      </td>

                      {/* INVOICE Date */}
                      <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        {formatCellDate(l.invoiceDate)}
                      </td>

                      {/* Billed To */}
                      <td style={{ fontWeight: 600, color: 'white' }}>
                        {l.billedTo || '-'}
                      </td>

                      {/* Taxable Amount */}
                      <td style={{ textAlign: 'right', fontWeight: 600, color: '#38bdf8' }}>
                        ₹{(Number(l.taxableAmount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* GST -> IGST */}
                      <td style={{ textAlign: 'right', color: Number(l.igst) > 0 ? '#fde047' : 'var(--text-subtle)' }}>
                        {Number(l.igst) > 0 ? `₹${Number(l.igst).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                      </td>

                      {/* GST -> SGST */}
                      <td style={{ textAlign: 'right', color: Number(l.sgst) > 0 ? '#fde047' : 'var(--text-subtle)' }}>
                        {Number(l.sgst) > 0 ? `₹${Number(l.sgst).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                      </td>

                      {/* GST -> UGST */}
                      <td style={{ textAlign: 'right', color: Number(l.ugst) > 0 ? '#fde047' : 'var(--text-subtle)' }}>
                        {Number(l.ugst) > 0 ? `₹${Number(l.ugst).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                      </td>

                      {/* Tax Amount */}
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#818cf8' }}>
                        ₹{(Number(l.taxAmount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Total Amount */}
                      <td style={{ textAlign: 'right', fontWeight: 900, color: '#34d399', fontSize: '0.88rem' }}>
                        ₹{(Number(l.totalAmount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* IT TDS */}
                      <td style={{ textAlign: 'right', color: Number(l.itTds) > 0 ? '#f87171' : 'var(--text-subtle)' }}>
                        {Number(l.itTds) > 0 ? `₹${Number(l.itTds).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                      </td>

                      {/* GST TDS */}
                      <td style={{ textAlign: 'right', color: Number(l.gstTds) > 0 ? '#f87171' : 'var(--text-subtle)' }}>
                        {Number(l.gstTds) > 0 ? `₹${Number(l.gstTds).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                      </td>

                      {/* Passed -> Amount */}
                      <td style={{ textAlign: 'right', fontWeight: 700, color: isPassed ? '#34d399' : '#f59e0b' }}>
                        {Number(l.passedAmount) > 0 ? `₹${Number(l.passedAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : (isPassed ? 'Passed' : 'Pending')}
                      </td>

                      {/* Passed -> Date */}
                      <td style={{ textAlign: 'center', fontSize: '0.78rem', color: l.passedDate ? '#34d399' : 'var(--text-subtle)' }}>
                        {formatCellDate(l.passedDate)}
                      </td>

                      {/* Mode of Payment */}
                      <td style={{ textAlign: 'center' }}>
                        {(Number(l.passedAmount) > 0 || isPassed) && l.modeOfPayment && l.modeOfPayment !== '-' && l.modeOfPayment !== 'N/A' ? (
                          <span style={{ 
                            fontSize: '0.72rem', 
                            fontWeight: 700, 
                            background: 'rgba(255,255,255,0.06)', 
                            padding: '2px 6px', 
                            borderRadius: '4px',
                            color: '#e2e8f0'
                          }}>
                            {l.modeOfPayment}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-subtle)', fontSize: '0.78rem' }}>-</span>
                        )}
                      </td>

                      {/* Remarks (Editable input directly on row) */}
                      <td>
                        <input
                          type="text"
                          defaultValue={l.remarks || ''}
                          placeholder="Type remarks..."
                          onBlur={(e) => handleInlineRemarksChange(l, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.target.blur();
                            }
                          }}
                          className="form-input"
                          style={{
                            padding: '3px 6px',
                            fontSize: '0.78rem',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '4px',
                            width: '100%',
                            minWidth: '140px'
                          }}
                        />
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'center' }} className="no-print">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                          {/* ⚡ Quick Action Button: Auto Calculate 2% IT + 2% GST TDS & Passed Amount */}
                          <button
                            onClick={() => handleAutoCalculateTds(l)}
                            className="btn btn-outline"
                            style={{ 
                              padding: '0.28rem 0.55rem', 
                              color: '#fbbf24', 
                              borderColor: 'rgba(245, 158, 11, 0.4)', 
                              background: 'rgba(245, 158, 11, 0.12)',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                            title="⚡ Auto Calculate 2% IT TDS + 2% GST TDS & Net Passed Amount"
                          >
                            <Zap size={13} color="#fbbf24" />
                            <span>Pass (4% TDS)</span>
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(l)}
                            className="btn btn-outline"
                            style={{ padding: '0.28rem 0.45rem', color: '#818cf8', borderColor: 'rgba(99, 102, 241, 0.3)' }}
                            title="Edit Entry & Payment Details"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(l)}
                            className="btn btn-outline"
                            style={{ padding: '0.28rem 0.45rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                            title="Delete Entry"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Table Grand Total Summary Footer */}
            {filteredLedgers.length > 0 && (
              <tfoot>
                <tr style={{ background: '#0f172a', borderTop: '2px solid rgba(99, 102, 241, 0.6)', fontWeight: 900, position: 'sticky', bottom: 0, zIndex: 14, boxShadow: '0 -2px 8px rgba(0,0,0,0.6)' }}>
                  <td colSpan={5} style={{ textAlign: 'right', padding: '0.85rem 1rem', color: '#f8fafc', fontSize: '0.9rem', background: '#0f172a' }}>
                    GRAND TOTALS:
                  </td>
                  {/* Taxable Amount */}
                  <td style={{ textAlign: 'right', color: '#38bdf8', fontSize: '0.9rem', background: '#0f172a' }}>
                    ₹{totals.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  {/* IGST */}
                  <td style={{ textAlign: 'right', color: '#fde047', fontSize: '0.85rem', background: '#0f172a' }}>
                    ₹{totals.igst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  {/* SGST */}
                  <td style={{ textAlign: 'right', color: '#fde047', fontSize: '0.85rem', background: '#0f172a' }}>
                    ₹{totals.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  {/* UGST */}
                  <td style={{ textAlign: 'right', color: '#fde047', fontSize: '0.85rem', background: '#0f172a' }}>
                    ₹{totals.ugst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  {/* Tax Amount */}
                  <td style={{ textAlign: 'right', color: '#818cf8', fontSize: '0.9rem', background: '#0f172a' }}>
                    ₹{totals.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  {/* Total Amount */}
                  <td style={{ textAlign: 'right', color: '#34d399', fontSize: '1rem', fontWeight: 900, background: '#0f172a' }}>
                    ₹{totals.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  {/* IT */}
                  <td style={{ textAlign: 'right', color: '#f87171', fontSize: '0.85rem', background: '#0f172a' }}>
                    ₹{totals.itTds.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  {/* GST TDS */}
                  <td style={{ textAlign: 'right', color: '#f87171', fontSize: '0.85rem', background: '#0f172a' }}>
                    ₹{totals.gstTds.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  {/* Passed Amount */}
                  <td style={{ textAlign: 'right', color: '#fbbf24', fontSize: '0.95rem', background: '#0f172a' }}>
                    ₹{totals.passedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td colSpan={3} className="no-print" style={{ background: '#0f172a' }}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* PAGINATION & BOTTOM STATUS BAR */}
        <div 
          className="no-print"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            flexWrap: 'wrap', 
            gap: '1rem',
            padding: '0.85rem 1.5rem', 
            background: 'rgba(15, 23, 42, 0.98)', 
            borderTop: '1px solid var(--border-color)',
            fontSize: '0.825rem',
            color: 'var(--text-muted)'
          }}
        >
          {/* Left: Row Counts & Page Size Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span>
              Showing <strong style={{ color: '#f8fafc' }}>{filteredLedgers.length === 0 ? 0 : startIndex + 1} - {endIndex}</strong> of <strong style={{ color: '#f8fafc' }}>{filteredLedgers.length}</strong> Invoices
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem' }}>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  const val = e.target.value === 'ALL' ? 'ALL' : Number(e.target.value);
                  setPageSize(val);
                  setCurrentPage(1);
                }}
                className="form-input"
                style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.8rem', height: '30px' }}
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={250}>250</option>
                <option value="ALL">All ({filteredLedgers.length})</option>
              </select>
            </div>
          </div>

          {/* Right: Page Navigation Buttons */}
          {pageSize !== 'ALL' && totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={effectivePage <= 1}
                className="btn btn-outline"
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}
                title="First Page"
              >
                « First
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={effectivePage <= 1}
                className="btn btn-outline"
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}
                title="Previous Page"
              >
                ‹ Prev
              </button>

              <span style={{ padding: '0 0.5rem', fontWeight: 700, color: '#f8fafc' }}>
                Page {effectivePage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={effectivePage >= totalPages}
                className="btn btn-outline"
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}
                title="Next Page"
              >
                Next ›
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={effectivePage >= totalPages}
                className="btn btn-outline"
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}
                title="Last Page"
              >
                Last »
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* MANUAL ENTRY / EDIT SALES LEDGER MODAL                        */}
      {/* ============================================================ */}
      {isModalOpen && (
        <div 
          className="no-print-modal-overlay"
          style={{ 
            position: 'fixed', 
            inset: 0, 
            zIndex: 100000, 
            background: 'rgba(0, 0, 0, 0.88)', 
            backdropFilter: 'blur(8px)', 
            display: 'flex', 
            alignItems: 'flex-start', 
            justifyContent: 'center', 
            padding: '6.5rem 1rem 3rem 1rem',
            overflowY: 'auto'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div 
            className="glass-panel animate-modal-entry"
            style={{ 
              width: '100%', 
              maxWidth: '750px', 
              background: '#0f172a', 
              border: '1.5px solid rgba(99, 102, 241, 0.4)', 
              borderRadius: '16px', 
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: 'calc(100vh - 8rem)',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '1rem 1.5rem', 
                background: 'rgba(30, 41, 59, 0.95)', 
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                flexShrink: 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={18} color="#818cf8" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                    {editingItem ? 'Edit Sales Ledger Entry' : 'Add New Sales Ledger Entry'}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Enter invoice details, taxes, deductions, passed amount and remarks.
                  </span>
                </div>
              </div>

              <button 
                onClick={() => setIsModalOpen(false)} 
                className="btn btn-outline" 
                style={{ width: '32px', height: '32px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '75vh', overflowY: 'auto' }}>
              
              {/* Section 1: Invoice Information */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                  1. Invoice Information
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Invoice No <span style={{ color: '#f87171' }}>*</span></label>
                    <input
                      type="text"
                      name="invoiceNo"
                      required
                      placeholder="e.g. 61/25-26"
                      className="form-input"
                      value={formData.invoiceNo}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Invoice Date <span style={{ color: '#f87171' }}>*</span></label>
                    <input
                      type="date"
                      name="invoiceDate"
                      required
                      className="form-input"
                      value={formData.invoiceDate}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Billed To</label>
                    <input
                      type="text"
                      name="billedTo"
                      placeholder="e.g. M/s. Ocean Sparkle Ltd, Karaikal Port (GST: 34AAACO2519H1ZR)"
                      className="form-input"
                      value={formData.billedTo}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Financials & Tax Split */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                  2. Taxable Value & GST Split
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Taxable Amount (₹) <span style={{ color: '#f87171' }}>*</span></label>
                    <input
                      type="number"
                      step="0.01"
                      name="taxableAmount"
                      required
                      placeholder="0.00"
                      className="form-input"
                      value={formData.taxableAmount}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>IGST (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="igst"
                      placeholder="0.00"
                      className="form-input"
                      value={formData.igst}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>SGST (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="sgst"
                      placeholder="0.00"
                      className="form-input"
                      value={formData.sgst}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>UGST (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="ugst"
                      placeholder="0.00"
                      className="form-input"
                      value={formData.ugst}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Auto Calculated Tax Amount & Total Amount */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.75rem', background: 'rgba(30, 41, 59, 0.5)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem', color: '#818cf8' }}>Calculated Tax Amount (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="taxAmount"
                      className="form-input"
                      style={{ background: 'rgba(0,0,0,0.3)', fontWeight: 700, color: '#818cf8' }}
                      value={formData.taxAmount}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem', color: '#34d399' }}>Gross Total Amount (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="totalAmount"
                      className="form-input"
                      style={{ background: 'rgba(0,0,0,0.3)', fontWeight: 900, color: '#34d399' }}
                      value={formData.totalAmount}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Deductions & Realization */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    3. Deductions & Payment Realization
                  </div>
                  
                  {/* Auto-Calculate 2% IT + 2% GST TDS Button inside Modal */}
                  <button
                    type="button"
                    onClick={handleModalAutoTds}
                    className="btn btn-outline"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.75rem',
                      padding: '0.3rem 0.75rem',
                      color: '#fbbf24',
                      borderColor: 'rgba(245, 158, 11, 0.4)',
                      background: 'rgba(245, 158, 11, 0.12)',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                    title="Calculate IT TDS (2%) + GST TDS (2%) from Taxable Amount and set Passed Amount"
                  >
                    <Zap size={13} color="#fbbf24" />
                    <span>⚡ Auto Calculate 2% IT + 2% GST TDS</span>
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>IT TDS (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="itTds"
                      placeholder="0.00"
                      className="form-input"
                      value={formData.itTds}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>GST TDS (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="gstTds"
                      placeholder="0.00"
                      className="form-input"
                      value={formData.gstTds}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Passed Amount (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="passedAmount"
                      placeholder="0.00"
                      className="form-input"
                      value={formData.passedAmount}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Passed Date</label>
                    <input
                      type="date"
                      name="passedDate"
                      className="form-input"
                      value={formData.passedDate}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Mode of Payment</label>
                    <select
                      name="modeOfPayment"
                      className="form-input"
                      value={formData.modeOfPayment || ''}
                      onChange={handleInputChange}
                    >
                      <option value="">-- None / Unpaid --</option>
                      {PAYMENT_MODES.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Remarks</label>
                    <input
                      type="text"
                      name="remarks"
                      placeholder="Custom notes..."
                      className="form-input"
                      value={formData.remarks}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-outline"
                  style={{ padding: '0.55rem 1.25rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '0.55rem 1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Save size={16} />
                  <span>{editingItem ? 'Update Entry' : 'Save Sales Entry'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* EXPORT COLUMNS & SCOPE CUSTOMIZER MODAL                      */}
      {/* ============================================================ */}
      {isExportModalOpen && (
        <div 
          className="no-print-modal-overlay"
          style={{ 
            position: 'fixed', 
            inset: 0, 
            zIndex: 100000, 
            background: 'rgba(0, 0, 0, 0.88)', 
            backdropFilter: 'blur(8px)', 
            display: 'flex', 
            alignItems: 'flex-start', 
            justifyContent: 'center', 
            padding: '6.5rem 1rem 3rem 1rem',
            overflowY: 'auto'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsExportModalOpen(false);
          }}
        >
          <div 
            className="glass-panel animate-modal-entry"
            style={{ 
              width: '100%', 
              maxWidth: '650px', 
              background: '#0f172a', 
              border: '1.5px solid rgba(16, 185, 129, 0.4)', 
              borderRadius: '16px', 
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.95)',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: 'calc(100vh - 8rem)',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '1.15rem 1.5rem', 
                background: 'rgba(30, 41, 59, 0.95)', 
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                flexShrink: 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileDown size={20} color="#34d399" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                    Customize & Export to Excel
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Select which columns and options to include in your Excel CSV download.
                  </span>
                </div>
              </div>

              <button 
                onClick={() => setIsExportModalOpen(false)} 
                className="btn btn-outline" 
                style={{ width: '32px', height: '32px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '72vh', overflowY: 'auto' }}>
              
              {/* Quick Select Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <SlidersHorizontal size={15} color="#34d399" />
                  <span style={{ fontSize: '0.825rem', fontWeight: 800, color: '#e2e8f0' }}>
                    Choose Columns to Export:
                  </span>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>
                    {Object.values(exportSelectedCols).filter(Boolean).length} of {SALES_EXPORT_COLUMNS.length} Selected
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <button 
                    type="button" 
                    onClick={() => handleSelectAllExportCols(true)}
                    className="btn btn-outline"
                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.4)' }}
                  >
                    Select All
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleSelectAllExportCols(false)}
                    className="btn btn-outline"
                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Checkboxes Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.625rem' }}>
                {SALES_EXPORT_COLUMNS.map(col => {
                  const isChecked = !!exportSelectedCols[col.key];
                  return (
                    <label 
                      key={col.key}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.625rem', 
                        padding: '0.55rem 0.75rem', 
                        borderRadius: '8px', 
                        background: isChecked ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.03)', 
                        border: isChecked ? '1px solid rgba(16, 185, 129, 0.45)' : '1px solid rgba(255, 255, 255, 0.08)', 
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onClick={() => handleToggleExportCol(col.key)}
                    >
                      <input 
                        type="checkbox" 
                        checked={isChecked} 
                        onChange={() => {}} 
                        style={{ cursor: 'pointer', width: '15px', height: '15px', accentColor: '#10b981' }} 
                      />
                      <span style={{ fontSize: '0.8rem', fontWeight: isChecked ? 700 : 500, color: isChecked ? '#f8fafc' : '#94a3b8' }}>
                        {col.label}
                      </span>
                    </label>
                  );
                })}
              </div>

              {/* Export Scope & Options */}
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '0.875rem 1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Export Scope & Summary
                </span>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {/* Scope Selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#e2e8f0', cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="exportScope" 
                        value="FILTERED" 
                        checked={exportScope === 'FILTERED'} 
                        onChange={() => setExportScope('FILTERED')} 
                        style={{ accentColor: '#10b981' }}
                      />
                      <span>Current Filtered ({filteredLedgers.length} Invoices)</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#e2e8f0', cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="exportScope" 
                        value="ALL" 
                        checked={exportScope === 'ALL'} 
                        onChange={() => setExportScope('ALL')} 
                        style={{ accentColor: '#10b981' }}
                      />
                      <span>All Records ({ledgerEntries.length} Invoices)</span>
                    </label>
                  </div>

                  {/* Grand Total Toggle */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#fbbf24', cursor: 'pointer', fontWeight: 600 }}>
                    <input 
                      type="checkbox" 
                      checked={exportIncludeTotals} 
                      onChange={e => setExportIncludeTotals(e.target.checked)} 
                      style={{ accentColor: '#fbbf24', width: '15px', height: '15px' }}
                    />
                    <span>Include Grand Total Row</span>
                  </label>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', padding: '1rem 1.5rem', background: 'rgba(30, 41, 59, 0.95)', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="btn btn-outline"
                style={{ padding: '0.55rem 1.25rem' }}
              >
                Cancel
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {/* 🖨️ PDF Statement Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsExportModalOpen(false);
                    setIsPdfModalOpen(true);
                  }}
                  className="btn btn-outline"
                  style={{ 
                    padding: '0.55rem 1.25rem', 
                    fontWeight: 800, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    color: '#c084fc',
                    borderColor: 'rgba(192, 132, 252, 0.5)',
                    background: 'rgba(192, 132, 252, 0.12)'
                  }}
                >
                  <FileText size={16} color="#c084fc" />
                  <span>View & Print PDF Statement</span>
                </button>

                {/* 📥 Download Excel CSV Button */}
                <button
                  type="button"
                  onClick={executeExportCSV}
                  className="btn btn-primary"
                  style={{ 
                    padding: '0.55rem 1.5rem', 
                    fontWeight: 800, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)', 
                    border: 'none',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
                  }}
                  disabled={Object.values(exportSelectedCols).filter(Boolean).length === 0}
                >
                  <Download size={16} />
                  <span>Download Excel (.csv)</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PDF STATEMENT MODAL & PRINT SHEET (MATCHES USER SPEC)        */}
      {/* ============================================================ */}
      {isPdfModalOpen && (
        <div 
          className="no-print-modal-overlay"
          style={{ 
            position: 'fixed', 
            inset: 0, 
            zIndex: 100000, 
            background: 'rgba(0, 0, 0, 0.88)', 
            backdropFilter: 'blur(8px)', 
            display: 'flex', 
            alignItems: 'flex-start', 
            justifyContent: 'center', 
            padding: '6.5rem 1rem 3rem 1rem',
            overflowY: 'auto'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsPdfModalOpen(false);
          }}
        >
          {/* Strict Isolated @media print CSS for Perfect Multi-Page A4 PDF Output */}
          <style>{`
            @media print {
              @page {
                size: A4 portrait;
                margin: 12mm 10mm;
              }
              html, body {
                background: #ffffff !important;
                color: #000000 !important;
                margin: 0 !important;
                padding: 0 !important;
                overflow: visible !important;
                height: auto !important;
                min-height: 100% !important;
              }
              body * {
                visibility: hidden !important;
              }
              .no-print-modal-overlay, 
              .no-print-modal-overlay * {
                visibility: visible !important;
              }
              .no-print-modal-overlay {
                position: static !important;
                background: transparent !important;
                backdrop-filter: none !important;
                padding: 0 !important;
                margin: 0 !important;
                overflow: visible !important;
                height: auto !important;
                min-height: auto !important;
                display: block !important;
              }
              .no-print-modal-overlay > div {
                max-width: 100% !important;
                max-height: none !important;
                height: auto !important;
                background: transparent !important;
                border: none !important;
                box-shadow: none !important;
                overflow: visible !important;
                display: block !important;
              }
              .no-print-modal-overlay > div > div {
                background: transparent !important;
                overflow: visible !important;
                height: auto !important;
                padding: 0 !important;
                display: block !important;
              }
              #sales-statement-print-sheet {
                position: static !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                background: #ffffff !important;
                color: #000000 !important;
                box-shadow: none !important;
                border: none !important;
                display: block !important;
                overflow: visible !important;
                min-height: auto !important;
                height: auto !important;
              }
              table {
                page-break-inside: auto !important;
                width: 100% !important;
                border-collapse: collapse !important;
              }
              tr {
                page-break-inside: avoid !important;
                page-break-after: auto !important;
              }
              thead {
                display: table-header-group !important;
              }
              tfoot {
                display: table-footer-group !important;
              }
              .no-print, .no-print * {
                display: none !important;
                visibility: hidden !important;
              }
            }
          `}</style>

          <div 
            style={{ 
              width: '100%', 
              maxWidth: '920px', 
              background: '#0f172a', 
              border: '1.5px solid rgba(192, 132, 252, 0.4)', 
              borderRadius: '16px', 
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '92vh',
              overflow: 'hidden'
            }}
          >
            {/* Modal Top Bar - Clean Title, Print Button & Close */}
            <div 
              className="no-print"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '1rem 1.5rem', 
                background: 'rgba(30, 41, 59, 0.95)', 
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                flexShrink: 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <FileText size={20} color="#c084fc" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                  Customer Ledger Statement (PDF Preview)
                </h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn btn-primary"
                  style={{
                    padding: '0.45rem 1rem',
                    fontSize: '0.825rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'linear-gradient(135deg, #c084fc 0%, #9333ea 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                  title="Print Multi-Page Statement on A4"
                >
                  <Printer size={16} />
                  <span>Print Statement (A4)</span>
                </button>
                <button 
                  onClick={() => setIsPdfModalOpen(false)} 
                  className="btn btn-outline" 
                  style={{ width: '32px', height: '32px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Close Preview"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Statement Printable Paper (White Background like Bank/Tally Ledger) */}
            <div style={{ padding: '1.25rem', overflowY: 'auto', background: '#334155' }}>
              <div 
                id="sales-statement-print-sheet"
                style={{ 
                  background: '#ffffff', 
                  color: '#000000', 
                  fontFamily: 'Calibri, "Segoe UI", Arial, sans-serif', 
                  padding: '2.5rem 2rem', 
                  borderRadius: '4px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                  minHeight: '600px'
                }}
              >
                {/* 1. Statement Header */}
                <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                  <h1 style={{ color: '#000000', fontSize: '1.5rem', fontWeight: 900, letterSpacing: '0.05em', margin: '0 0 0.35rem 0', textTransform: 'uppercase' }}>
                    SRI DURGA ENTERPRISES, KARAIKAL.
                  </h1>
                  <div style={{ color: '#000000', fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                    Customer Sales Ledger for: <span style={{ textDecoration: 'underline' }}>{filterCustomer && filterCustomer.trim() ? resolvedCustomerName.toUpperCase() : 'ALL CUSTOMERS'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#000000', fontSize: '0.9rem', fontWeight: 800, padding: '0 1rem' }}>
                    <span>From: &nbsp; {fromDate ? new Date(fromDate).toLocaleDateString('en-GB') : getActiveFinancialYearStartDate()} &nbsp; To: &nbsp; {toDate ? new Date(toDate).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')}</span>
                    <span>Page No &nbsp; 1</span>
                  </div>
                </div>

                {/* 2. Top Double Black Border Line */}
                <div style={{ borderTop: '2px solid #000000', borderBottom: '1px solid #000000', height: '3px', marginBottom: '0.5rem' }}></div>

                {/* 3. Dynamic Statement Table: Consolidated Summary for ALL Customers OR Detailed FIFO for Single Customer */}
                {(() => {
                  const activeStatementCols = SALES_EXPORT_COLUMNS.filter(col => exportSelectedCols[col.key]);
                  const cutoffDate = fromDate || getActiveFinancialYearStartIso();
                  const isAllCustomersMode = !filterCustomer || !filterCustomer.trim();

                  // Bills prior to cutoffDate (e.g. up to 31/03/2026) roll into Opening Balance on 01/04/2026
                  const rawEntries = exportScope === 'ALL' ? ledgerEntries : filteredLedgers;
                  const statementEntries = rawEntries.filter(item => {
                    const itemDate = item.invoiceDate || item.passedDate;
                    if (itemDate && itemDate < cutoffDate) {
                      return false;
                    }
                    if (!itemDate && item.invoiceNo && (item.invoiceNo.includes('/25-26') || item.invoiceNo.includes('/24-25')) && cutoffDate >= '2026-04-01') {
                      return false;
                    }
                    return true;
                  });

                  const formatStDate = (val) => {
                    if (!val || val === '-' || val === '--') return '-';
                    const d = new Date(val);
                    return isNaN(d.getTime()) ? String(val) : d.toLocaleDateString('en-GB');
                  };

                  // =========================================================================
                  // MODE A: ALL CUSTOMERS CONSOLIDATED SUMMARY (1 ROW PER CUSTOMER)
                  // =========================================================================
                  if (isAllCustomersMode) {
                    const partyMap = {};

                    statementEntries.forEach(item => {
                      const cName = (item.billedTo || item.billedToRemarks || 'UNKNOWN').trim();
                      const cUpper = cName.toUpperCase();
                      if (!partyMap[cUpper]) {
                        partyMap[cUpper] = {
                          customerName: cName,
                          totalAmount: 0,
                          passedAmount: 0,
                          taxableAmount: 0,
                          taxAmount: 0,
                          billCount: 0
                        };
                      }
                      const taxable = Number(item.taxableAmount) || 0;
                      const tax = Number(item.taxAmount) || 0;
                      const total = Number(item.totalAmount) || (taxable + tax);
                      const passed = Number(item.passedAmount) || 0;

                      partyMap[cUpper].taxableAmount += taxable;
                      partyMap[cUpper].taxAmount += tax;
                      partyMap[cUpper].totalAmount += total;
                      partyMap[cUpper].passedAmount += passed;
                      if (total > 0) partyMap[cUpper].billCount += 1;
                    });

                    // Include any customers with saved opening balances that had no bills in this period
                    Object.entries(customerOpenings).forEach(([k, val]) => {
                      const cleanK = k.trim();
                      const cleanUpper = cleanK.toUpperCase();
                      if (cleanK && cleanK !== 'DEFAULT' && !partyMap[cleanUpper]) {
                        partyMap[cleanUpper] = {
                          customerName: cleanK,
                          totalAmount: 0,
                          passedAmount: 0,
                          taxableAmount: 0,
                          taxAmount: 0,
                          billCount: 0
                        };
                      }
                    });

                    let totalOpeningSum = 0;
                    let totalSalesSum = 0;
                    let totalPassedSum = 0;
                    let totalPendingDue = 0;
                    let totalExtraAmount = 0;

                    const consolidatedCustomers = Object.values(partyMap).map(c => {
                      const upper = c.customerName.toUpperCase();
                      let opBal = 0;
                      for (const [k, val] of Object.entries(customerOpenings)) {
                        const cleanK = k.trim().toUpperCase();
                        if (cleanK === upper || cleanK.includes(upper) || upper.includes(cleanK)) {
                          opBal = Number(val) || 0;
                          break;
                        }
                      }
                      const netBal = (opBal + c.totalAmount) - c.passedAmount;

                      totalOpeningSum += opBal;
                      totalSalesSum += c.totalAmount;
                      totalPassedSum += c.passedAmount;
                      if (netBal > 0) {
                        totalPendingDue += netBal;
                      } else if (netBal < 0) {
                        totalExtraAmount += Math.abs(netBal);
                      }

                      return {
                        ...c,
                        openingBalance: opBal,
                        netBalance: netBal
                      };
                    }).sort((a, b) => a.customerName.localeCompare(b.customerName));

                    return (
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', fontFamily: 'Calibri, "Segoe UI", Arial, sans-serif' }}>
                        <thead>
                          <tr style={{ borderBottom: '1.5px solid #000000', color: '#000000', fontWeight: 800 }}>
                            <th style={{ textAlign: 'center', padding: '8px 4px', width: '50px' }}>Sl. No.</th>
                            <th style={{ textAlign: 'left', padding: '8px 6px' }}>Customer / Client Name</th>
                            <th style={{ textAlign: 'right', padding: '8px 6px' }}>Opening Balance</th>
                            <th style={{ textAlign: 'right', padding: '8px 6px' }}>Total Sales</th>
                            <th style={{ textAlign: 'right', padding: '8px 6px' }}>Passed Amount</th>
                            <th style={{ textAlign: 'right', padding: '8px 6px' }}>Balance Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {consolidatedCustomers.map((cust, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                              <td style={{ textAlign: 'center', padding: '6px 4px', fontWeight: 700 }}>{idx + 1}</td>
                              <td style={{ padding: '6px 6px', fontWeight: 700, color: '#111827' }}>{cust.customerName}</td>
                              <td style={{ textAlign: 'right', padding: '6px 6px', color: cust.openingBalance > 0 ? '#16a34a' : '#9ca3af' }}>
                                {cust.openingBalance !== 0 ? cust.openingBalance.toFixed(2) : '-'}
                              </td>
                              <td style={{ textAlign: 'right', padding: '6px 6px', fontWeight: 700 }}>
                                {cust.totalAmount > 0 ? cust.totalAmount.toFixed(2) : '-'}
                              </td>
                              <td style={{ textAlign: 'right', padding: '6px 6px', color: cust.passedAmount > 0 ? '#1e40af' : '#9ca3af', fontWeight: cust.passedAmount > 0 ? 700 : 400 }}>
                                {cust.passedAmount > 0 ? cust.passedAmount.toFixed(2) : '-'}
                              </td>
                              <td style={{ 
                                textAlign: 'right', 
                                padding: '6px 6px', 
                                fontWeight: 800, 
                                color: cust.netBalance > 0 ? '#dc2626' : (cust.netBalance < 0 ? '#1e40af' : '#16a34a') 
                              }}>
                                {cust.netBalance > 0 ? (
                                  cust.netBalance.toFixed(2)
                                ) : cust.netBalance < 0 ? (
                                  <span>
                                    -{Math.abs(cust.netBalance).toFixed(2)}{' '}
                                    <small style={{ fontSize: '0.7rem', fontWeight: 800, color: '#1e40af', background: '#dbeafe', padding: '1px 3px', borderRadius: '3px' }}>
                                      Extra
                                    </small>
                                  </span>
                                ) : (
                                  '0.00'
                                )}
                              </td>
                            </tr>
                          ))}

                          {/* Grand Totals & Extra / Advance Breakdown Summary */}
                          {exportIncludeTotals && (
                            <>
                              <tr style={{ borderTop: '2px solid #000000', borderBottom: '1px solid #000000', fontWeight: 900, fontSize: '0.925rem' }}>
                                <td colSpan={2} style={{ padding: '8px 6px', fontWeight: 900, textTransform: 'uppercase' }}>
                                  GRAND TOTAL :
                                </td>
                                <td style={{ textAlign: 'right', padding: '8px 6px' }}>{totalOpeningSum.toFixed(2)}</td>
                                <td style={{ textAlign: 'right', padding: '8px 6px' }}>{totalSalesSum.toFixed(2)}</td>
                                <td style={{ textAlign: 'right', padding: '8px 6px' }}>{totalPassedSum.toFixed(2)}</td>
                                <td style={{ textAlign: 'right', padding: '8px 6px', color: totalPendingDue > 0 ? '#dc2626' : '#16a34a' }}>
                                  {totalPendingDue.toFixed(2)}
                                </td>
                              </tr>

                              {/* Extra / Advance Payment Total Row */}
                              <tr style={{ borderBottom: '1px solid #000000', fontWeight: 800, fontSize: '0.88rem', background: 'rgba(30, 64, 175, 0.04)' }}>
                                <td colSpan={5} style={{ padding: '6px 6px', textAlign: 'right', color: '#1e40af', fontWeight: 800, textTransform: 'uppercase' }}>
                                  EXTRA / ADVANCE AMOUNT RECEIVED (முன்தொகை / அதிகப்பணம்) :
                                </td>
                                <td style={{ textAlign: 'right', padding: '6px 6px', color: '#1e40af', fontWeight: 900 }}>
                                  {totalExtraAmount > 0 ? `₹${totalExtraAmount.toFixed(2)}` : '0.00'}
                                </td>
                              </tr>
                            </>
                          )}
                        </tbody>
                      </table>
                    );
                  }

                  // =========================================================================
                  // MODE B: SINGLE CUSTOMER DETAILED CHRONOLOGICAL FIFO STATEMENT
                  // =========================================================================
                  const sortedStatementEntries = [...statementEntries].sort((a, b) => {
                    const dateA = a.invoiceDate || a.passedDate || '';
                    const dateB = b.invoiceDate || b.passedDate || '';
                    if (dateA && dateB && dateA !== dateB) return dateA.localeCompare(dateB);
                    if (!dateA && dateB) return 1;
                    if (dateA && !dateB) return -1;
                    return (a.id || 0) - (b.id || 0);
                  });

                  let runningBalance = openingBalance;
                  const entriesWithRunningBalance = sortedStatementEntries.map(item => {
                    const totalAmt = Number(item.totalAmount) || 0;
                    const passedAmt = Number(item.passedAmount) || 0;
                    runningBalance = (runningBalance + totalAmt) - passedAmt;
                    return {
                      ...item,
                      currentRunningBalance: runningBalance
                    };
                  });

                  let sumTaxable = 0, sumIgst = 0, sumSgst = 0, sumUgst = 0, sumTax = 0, sumTotal = 0, sumItTds = 0, sumGstTds = 0, sumPassed = 0;
                  statementEntries.forEach(item => {
                    sumTaxable += parseFloat(item.taxableAmount) || 0;
                    sumIgst += parseFloat(item.igst) || 0;
                    sumSgst += parseFloat(item.sgst) || 0;
                    sumUgst += parseFloat(item.ugst) || 0;
                    sumTax += parseFloat(item.taxAmount) || 0;
                    sumTotal += parseFloat(item.totalAmount) || 0;
                    sumItTds += parseFloat(item.itTds) || 0;
                    sumGstTds += parseFloat(item.gstTds) || 0;
                    sumPassed += parseFloat(item.passedAmount) || 0;
                  });
                  const sumBalance = (openingBalance + sumTotal) - sumPassed;

                  return (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', fontFamily: 'Calibri, "Segoe UI", Arial, sans-serif' }}>
                      <thead>
                        <tr style={{ borderBottom: '1.5px solid #000000', color: '#000000', fontWeight: 800 }}>
                          {activeStatementCols.map(col => {
                            let textAlign = 'left';
                            if (['slNo', 'invoiceDate', 'passedDate'].includes(col.key)) textAlign = 'center';
                            if (['taxableAmount', 'igst', 'sgst', 'ugst', 'taxAmount', 'totalAmount', 'itTds', 'gstTds', 'passedAmount', 'balanceAmount'].includes(col.key)) textAlign = 'right';

                            return (
                              <th key={col.key} style={{ textAlign, padding: '6px 4px' }}>
                                {col.label}
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {/* Subheader Opening Balance Row (Always rendered on top of table) */}
                        <tr style={{ borderBottom: '1px solid #e5e7eb', fontWeight: 800 }}>
                          {activeStatementCols.map((col, cIdx) => {
                            if (col.key === 'slNo') {
                              return <td key={col.key} style={{ textAlign: 'center', padding: '6px 4px', color: '#9ca3af' }}>-</td>;
                            }
                            if (col.key === 'invoiceDate') {
                              return (
                                <td key={col.key} style={{ textAlign: 'center', padding: '6px 4px', color: '#16a34a', fontWeight: 800 }}>
                                  {fromDate ? new Date(fromDate).toLocaleDateString('en-GB') : getActiveFinancialYearStartDate()}
                                </td>
                              );
                            }
                            // Column to hold the "Opening Balance" label
                            const isLabelCol = (
                              col.key === 'billedTo' || 
                              (!activeStatementCols.some(c => c.key === 'billedTo') && col.key === 'invoiceNo') ||
                              (!activeStatementCols.some(c => ['billedTo', 'invoiceNo'].includes(c.key)) && cIdx === 1)
                            );

                            if (isLabelCol) {
                              return (
                                <td key={col.key} style={{ padding: '6px 4px', color: '#16a34a', fontWeight: 800 }}>
                                  Opening Balance
                                </td>
                              );
                            }

                            // Amount Column to hold the opening balance amount
                            if (col.key === 'totalAmount' || col.key === 'balanceAmount') {
                              return (
                                <td key={col.key} style={{ textAlign: 'right', padding: '6px 4px', color: '#16a34a', fontWeight: 800 }}>
                                  {openingBalance.toFixed(2)}
                                </td>
                              );
                            }

                            return <td key={col.key} style={{ textAlign: 'center', padding: '6px 4px', color: '#9ca3af' }}>-</td>;
                          })}
                        </tr>

                        {/* Transaction Rows with Running Balance */}
                        {entriesWithRunningBalance.map((l, idx) => {
                          const taxableAmt = Number(l.taxableAmount) || 0;
                          const igstAmt = Number(l.igst) || 0;
                          const sgstAmt = Number(l.sgst) || 0;
                          const ugstAmt = Number(l.ugst) || 0;
                          const taxAmt = Number(l.taxAmount) || 0;
                          const totalAmt = Number(l.totalAmount) || 0;
                          const itTdsAmt = Number(l.itTds) || 0;
                          const gstTdsAmt = Number(l.gstTds) || 0;
                          const passedAmt = Number(l.passedAmount) || 0;
                          const runningBal = l.currentRunningBalance !== undefined ? l.currentRunningBalance : ((openingBalance + totalAmt) - passedAmt);

                          return (
                            <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                              {activeStatementCols.map(col => {
                                if (col.key === 'slNo') return <td key={col.key} style={{ textAlign: 'center', padding: '5px 4px', fontWeight: 700 }}>{idx + 1}</td>;
                                if (col.key === 'billedTo') return <td key={col.key} style={{ padding: '5px 4px', fontWeight: 700, color: '#111827' }}>{l.billedTo || l.billedToRemarks || '-'}</td>;
                                if (col.key === 'invoiceNo') return <td key={col.key} style={{ padding: '5px 4px', fontWeight: 700 }}>{l.invoiceNo || '-'}</td>;
                                if (col.key === 'invoiceDate') return <td key={col.key} style={{ textAlign: 'center', padding: '5px 4px' }}>{formatStDate(l.invoiceDate || l.passedDate)}</td>;
                                if (col.key === 'taxableAmount') return <td key={col.key} style={{ textAlign: 'right', padding: '5px 4px' }}>{taxableAmt > 0 ? taxableAmt.toFixed(2) : '-'}</td>;
                                if (col.key === 'igst') return <td key={col.key} style={{ textAlign: 'right', padding: '5px 4px' }}>{igstAmt > 0 ? igstAmt.toFixed(2) : '-'}</td>;
                                if (col.key === 'sgst') return <td key={col.key} style={{ textAlign: 'right', padding: '5px 4px' }}>{sgstAmt > 0 ? sgstAmt.toFixed(2) : '-'}</td>;
                                if (col.key === 'ugst') return <td key={col.key} style={{ textAlign: 'right', padding: '5px 4px' }}>{ugstAmt > 0 ? ugstAmt.toFixed(2) : '-'}</td>;
                                if (col.key === 'taxAmount') return <td key={col.key} style={{ textAlign: 'right', padding: '5px 4px' }}>{taxAmt > 0 ? taxAmt.toFixed(2) : '-'}</td>;
                                if (col.key === 'totalAmount') return <td key={col.key} style={{ textAlign: 'right', padding: '5px 4px', fontWeight: 700 }}>{totalAmt > 0 ? totalAmt.toFixed(2) : (passedAmt > 0 ? '0.00' : '-')}</td>;
                                if (col.key === 'itTds') return <td key={col.key} style={{ textAlign: 'right', padding: '5px 4px' }}>{itTdsAmt > 0 ? itTdsAmt.toFixed(2) : '-'}</td>;
                                if (col.key === 'gstTds') return <td key={col.key} style={{ textAlign: 'right', padding: '5px 4px' }}>{gstTdsAmt > 0 ? gstTdsAmt.toFixed(2) : '-'}</td>;
                                if (col.key === 'passedAmount') return <td key={col.key} style={{ textAlign: 'right', padding: '5px 4px', color: passedAmt > 0 ? '#1e40af' : '#9ca3af', fontWeight: passedAmt > 0 ? 700 : 400 }}>{passedAmt > 0 ? passedAmt.toFixed(2) : '-'}</td>;
                                if (col.key === 'passedDate') return <td key={col.key} style={{ textAlign: 'center', padding: '5px 4px', color: '#4b5563' }}>{formatStDate(l.passedDate)}</td>;
                                if (col.key === 'modeOfPayment') {
                                  const hasPayment = passedAmt > 0 && l.modeOfPayment && l.modeOfPayment !== '-' && l.modeOfPayment !== 'N/A';
                                  return <td key={col.key} style={{ textAlign: 'center', padding: '5px 4px' }}>{hasPayment ? l.modeOfPayment : '-'}</td>;
                                }
                                if (col.key === 'balanceAmount') {
                                  return <td key={col.key} style={{ textAlign: 'right', padding: '5px 4px', fontWeight: 700, color: runningBal > 0 ? '#dc2626' : (runningBal < 0 ? '#1e40af' : '#16a34a') }}>{runningBal.toFixed(2)}</td>;
                                }
                                if (col.key === 'remarks') return <td key={col.key} style={{ padding: '5px 4px', color: '#4b5563' }}>{l.remarks || '-'}</td>;
                                return <td key={col.key} style={{ padding: '5px 4px' }}>-</td>;
                              })}
                            </tr>
                          );
                        })}

                        {/* Grand Totals Summary Row */}
                        {exportIncludeTotals && (
                          <>
                            <tr style={{ borderTop: '2px solid #000000', borderBottom: '1px solid #000000', fontWeight: 900, fontSize: '0.925rem' }}>
                              {activeStatementCols.map((col, cIdx) => {
                                if (cIdx === 0) {
                                  return (
                                    <td key={col.key} style={{ padding: '8px 4px', fontWeight: 900, textTransform: 'uppercase' }}>
                                      TOTAL :
                                    </td>
                                  );
                                }
                                if (col.key === 'taxableAmount') return <td key={col.key} style={{ textAlign: 'right', padding: '8px 4px' }}>{sumTaxable.toFixed(2)}</td>;
                                if (col.key === 'igst') return <td key={col.key} style={{ textAlign: 'right', padding: '8px 4px' }}>{sumIgst.toFixed(2)}</td>;
                                if (col.key === 'sgst') return <td key={col.key} style={{ textAlign: 'right', padding: '8px 4px' }}>{sumSgst.toFixed(2)}</td>;
                                if (col.key === 'ugst') return <td key={col.key} style={{ textAlign: 'right', padding: '8px 4px' }}>{sumUgst.toFixed(2)}</td>;
                                if (col.key === 'taxAmount') return <td key={col.key} style={{ textAlign: 'right', padding: '8px 4px' }}>{sumTax.toFixed(2)}</td>;
                                if (col.key === 'totalAmount') return <td key={col.key} style={{ textAlign: 'right', padding: '8px 4px' }}>{(openingBalance + sumTotal).toFixed(2)}</td>;
                                if (col.key === 'itTds') return <td key={col.key} style={{ textAlign: 'right', padding: '8px 4px' }}>{sumItTds.toFixed(2)}</td>;
                                if (col.key === 'gstTds') return <td key={col.key} style={{ textAlign: 'right', padding: '8px 4px' }}>{sumGstTds.toFixed(2)}</td>;
                                if (col.key === 'passedAmount') return <td key={col.key} style={{ textAlign: 'right', padding: '8px 4px' }}>{sumPassed.toFixed(2)}</td>;
                                if (col.key === 'balanceAmount') return <td key={col.key} style={{ textAlign: 'right', padding: '8px 4px', color: sumBalance > 0 ? '#dc2626' : '#16a34a' }}>{sumBalance.toFixed(2)}</td>;
                                return <td key={col.key} style={{ padding: '8px 4px' }}></td>;
                              })}
                            </tr>

                            {/* Subfooter Closing Balance Row (Counterpart to Opening Balance) */}
                            <tr style={{ borderBottom: '2px solid #000000', fontWeight: 800 }}>
                              {activeStatementCols.map((col, cIdx) => {
                                if (col.key === 'slNo') {
                                  return <td key={col.key} style={{ textAlign: 'center', padding: '6px 4px', color: '#9ca3af' }}>-</td>;
                                }
                                if (col.key === 'invoiceDate') {
                                  return (
                                    <td key={col.key} style={{ textAlign: 'center', padding: '6px 4px', color: '#16a34a', fontWeight: 800 }}>
                                      {toDate ? new Date(toDate).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')}
                                    </td>
                                  );
                                }
                                // Column to hold the "Closing Balance" label
                                const isLabelCol = (
                                  col.key === 'billedTo' || 
                                  (!activeStatementCols.some(c => c.key === 'billedTo') && col.key === 'invoiceNo') ||
                                  (!activeStatementCols.some(c => ['billedTo', 'invoiceNo'].includes(c.key)) && cIdx === 1)
                                );

                                if (isLabelCol) {
                                  return (
                                    <td key={col.key} style={{ padding: '6px 4px', color: '#16a34a', fontWeight: 800 }}>
                                      Closing Balance
                                    </td>
                                  );
                                }

                                // Amount Column to hold the closing balance amount
                                const isAmtCol = (
                                  col.key === 'totalAmount' ||
                                  (!activeStatementCols.some(c => c.key === 'totalAmount') && col.key === 'taxableAmount')
                                );

                                if (isAmtCol) {
                                  const closingBal = Math.max(0, (openingBalance + sumTotal) - sumPassed);
                                  return (
                                    <td key={col.key} style={{ textAlign: 'right', padding: '6px 4px', color: '#16a34a', fontWeight: 800 }}>
                                      {closingBal.toFixed(2)}
                                    </td>
                                  );
                                }

                                return <td key={col.key} style={{ textAlign: 'center', padding: '6px 4px', color: '#9ca3af' }}>-</td>;
                              })}
                            </tr>
                          </>
                        )}
                      </tbody>
                    </table>
                  );
                })()}
              </div>
            </div>

            {/* Modal Bottom Actions (Opening Balance & Print Buttons) */}
            <div 
              className="no-print"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                flexWrap: 'wrap',
                gap: '0.75rem',
                padding: '0.85rem 1.5rem', 
                background: 'rgba(30, 41, 59, 0.95)', 
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                flexShrink: 0
              }}
            >
              {/* Editable Opening Balance Tool at Bottom Left */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', color: '#e2e8f0', background: 'rgba(22, 163, 74, 0.15)', border: '1px solid rgba(22, 163, 74, 0.4)', padding: '0.35rem 0.75rem', borderRadius: '8px' }}>
                <span style={{ fontWeight: 700, color: '#4ade80' }}>Opening Bal (₹):</span>
                <input
                  type="number"
                  step="0.01"
                  defaultValue={openingBalance}
                  key={`opening-${filterCustomer}-${openingBalance}`}
                  onBlur={(e) => handleSaveOpeningBalance(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { handleSaveOpeningBalance(e.target.value); e.target.blur(); } }}
                  title="Edit Opening Balance for this Customer / Period"
                  style={{
                    width: '120px',
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '4px',
                    color: '#ffffff',
                    padding: '4px 8px',
                    fontSize: '0.825rem',
                    fontWeight: 800,
                    textAlign: 'right'
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsPdfModalOpen(false)}
                  className="btn btn-outline"
                  style={{ padding: '0.5rem 1.25rem' }}
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn btn-primary"
                  style={{ 
                    padding: '0.5rem 1.5rem', 
                    fontWeight: 800, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)', 
                    border: 'none',
                    boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
                  }}
                >
                  <PrintIcon size={16} />
                  <span>Print / Save as PDF</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
