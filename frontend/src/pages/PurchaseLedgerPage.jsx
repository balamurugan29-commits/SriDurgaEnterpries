import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  fetchPurchaseLedgers, 
  createPurchaseLedger, 
  bulkCreatePurchaseLedgers,
  updatePurchaseLedger, 
  deletePurchaseLedger 
} from '../services/api';
import { Toast } from '../components/Toast';
import { 
  ShoppingBag, 
  Plus, 
  Search, 
  Calendar, 
  Download, 
  RefreshCw, 
  Filter, 
  FilterX, 
  IndianRupee, 
  Building2, 
  CheckCircle2, 
  Clock,
  Edit3, 
  Trash2, 
  X, 
  Save, 
  ChevronRight,
  TrendingDown,
  FileSpreadsheet,
  CheckSquare,
  Square,
  SlidersHorizontal,
  FileDown,
  FileText,
  Printer as PrintIcon,
  UploadCloud,
  FileUp,
  AlertCircle,
  Check,
  ArrowRight,
  Eye
} from 'lucide-react';

const PURCHASE_EXPORT_COLUMNS = [
  { key: 'slNo', label: 'Sl.No.', default: true },
  { key: 'dealerStoreName', label: 'Name of Dealer/Store', default: true },
  { key: 'invoiceNo', label: 'Invoice No.', default: true },
  { key: 'invoiceDate', label: 'Date', default: true },
  { key: 'taxableAmount', label: 'Taxable Amount', default: true },
  { key: 'taxAmount', label: 'Tax', default: true },
  { key: 'totalAmount', label: 'Total Amount', default: true },
  { key: 'paidAmount', label: 'Paid Amount', default: true },
  { key: 'paymentDate', label: 'Payment Date', default: true },
  { key: 'modeOfPayment', label: 'Mode of Payment', default: true },
  { key: 'balanceAmount', label: 'Balance Amount', default: true }
];

const PAYMENT_MODES = [
  'NEFT',
  'RTGS',
  'CHEQUE',
  'BANK TRANSFER',
  'UPI',
  'CASH',
  'DEMAND DRAFT (DD)'
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

export const PurchaseLedgerPage = () => {
  const [purchaseEntries, setPurchaseEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Modal State for Manual Entry / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Export Customizer Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [exportSelectedCols, setExportSelectedCols] = useState({
    slNo: true,
    dealerStoreName: true,
    invoiceNo: true,
    invoiceDate: true,
    taxableAmount: true,
    taxAmount: true,
    totalAmount: true,
    paidAmount: true,
    paymentDate: true,
    modeOfPayment: true,
    balanceAmount: true
  });
  const [exportIncludeTotals, setExportIncludeTotals] = useState(true);
  const [exportScope, setExportScope] = useState('FILTERED'); // 'FILTERED' or 'ALL'

  // Excel Upload & Import Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewRows, setPreviewRows] = useState([]);
  const [duplicateRows, setDuplicateRows] = useState([]);
  const [isDuplicatesModalOpen, setIsDuplicatesModalOpen] = useState(false);
  const [duplicateSearch, setDuplicateSearch] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadStats, setUploadStats] = useState({ totalRows: 0, totalAmount: 0, totalPaid: 0, totalBalance: 0 });
  const fileInputRef = useRef(null);

  // Selected Rows for Bulk Operations
  const [selectedItemIds, setSelectedItemIds] = useState([]);

  // Dealer Opening Balance Map from localStorage
  const [dealerOpenings, setDealerOpenings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('DEALER_OPENING_BALANCES') || '{}');
    } catch {
      return {};
    }
  });

  const [formData, setFormData] = useState({
    dealerStoreName: '',
    invoiceNo: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    taxableAmount: '',
    taxAmount: '',
    totalAmount: '',
    paidAmount: '',
    paymentDate: '',
    modeOfPayment: 'NEFT',
    balanceAmount: ''
  });

  // Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDealer, setFilterDealer] = useState('');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('ALL'); // 'ALL', 'PAID', 'PARTIAL', 'PENDING'
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
  }, [searchQuery, filterDealer, filterPaymentStatus, filterMode, fromDate, toDate, periodPreset]);

  // Load Purchase Ledger Data
  const loadPurchaseData = async () => {
    try {
      setLoading(true);
      const data = await fetchPurchaseLedgers();
      setPurchaseEntries(data || []);
    } catch (err) {
      console.error('Failed to load Purchase Ledger records:', err);
      setToast({ message: 'Failed to load Purchase Ledger: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPurchaseData();
  }, []);

  // Form Field Change with Real-Time Calculations
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };

      // Auto-compute Total Amount and Balance Amount
      const taxable = parseFloat(name === 'taxableAmount' ? value : prev.taxableAmount) || 0;
      const tax = parseFloat(name === 'taxAmount' ? value : prev.taxAmount) || 0;
      let total = parseFloat(name === 'totalAmount' ? value : prev.totalAmount);

      if (['taxableAmount', 'taxAmount'].includes(name)) {
        total = taxable + tax;
        updated.totalAmount = total > 0 ? total.toFixed(2) : '';
      }

      const currentTotal = total || 0;
      const paid = parseFloat(name === 'paidAmount' ? value : prev.paidAmount) || 0;
      const balance = Math.max(0, currentTotal - paid);
      updated.balanceAmount = balance.toFixed(2);

      return updated;
    });
  };

  // Open Modal for New Manual Entry
  const handleOpenNewModal = () => {
    setEditingItem(null);
    setFormData({
      dealerStoreName: '',
      invoiceNo: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      taxableAmount: '',
      taxAmount: '',
      totalAmount: '',
      paidAmount: '',
      paymentDate: '',
      modeOfPayment: '',
      balanceAmount: ''
    });
    setIsModalOpen(true);
  };

  // Open Modal for Editing an Existing Entry
  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    const total = Number(item.totalAmount) || 0;
    const paid = Number(item.paidAmount || item.passedAmount) || 0;
    const balance = item.balanceAmount !== undefined && item.balanceAmount !== null ? Number(item.balanceAmount) : Math.max(0, total - paid);

    setFormData({
      dealerStoreName: item.dealerStoreName || item.supplierRemarks || '',
      invoiceNo: item.invoiceNo || '',
      invoiceDate: item.invoiceDate || '',
      taxableAmount: item.taxableAmount !== undefined ? String(item.taxableAmount) : '',
      taxAmount: item.taxAmount !== undefined ? String(item.taxAmount) : '',
      totalAmount: item.totalAmount !== undefined ? String(item.totalAmount) : '',
      paidAmount: (item.paidAmount !== undefined && item.paidAmount !== null) ? String(item.paidAmount) : (item.passedAmount !== undefined ? String(item.passedAmount) : ''),
      paymentDate: item.paymentDate || item.passedDate || '',
      modeOfPayment: item.modeOfPayment || (paid > 0 ? 'NEFT' : ''),
      balanceAmount: String(balance.toFixed(2))
    });
    setIsModalOpen(true);
  };

  // Save Form (Create / Update)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.dealerStoreName.trim()) {
      setToast({ message: 'Name of Dealer/Store is required!', type: 'error' });
      return;
    }
    if (!formData.invoiceNo.trim()) {
      setToast({ message: 'Invoice No. is required!', type: 'error' });
      return;
    }
    if (!formData.invoiceDate) {
      setToast({ message: 'Invoice Date is required!', type: 'error' });
      return;
    }

    // Dealer + Invoice No Duplicate Check (ignoring dashes and empty invoices)
    const trimmedDealer = formData.dealerStoreName.trim().toUpperCase();
    const trimmedInv = formData.invoiceNo.trim().toUpperCase();
    const isDash = !trimmedInv || trimmedInv === '-' || trimmedInv === '--' || trimmedInv === 'N/A' || trimmedInv === 'NA';

    if (trimmedDealer && !isDash) {
      const isDuplicate = purchaseEntries.some(item => {
        if (editingItem && item.id === editingItem.id) return false;
        const existingDealer = (item.dealerStoreName || item.supplierRemarks || '').trim().toUpperCase();
        const existingInv = (item.invoiceNo || '').trim().toUpperCase();
        return existingDealer === trimmedDealer && existingInv === trimmedInv;
      });

      if (isDuplicate) {
        setToast({ 
          message: `Duplicate Entry! A bill with Invoice No. "${formData.invoiceNo}" already exists for "${formData.dealerStoreName}".`, 
          type: 'error' 
        });
        return;
      }
    }

    const taxable = parseFloat(formData.taxableAmount) || 0;
    const tax = parseFloat(formData.taxAmount) || 0;
    const total = parseFloat(formData.totalAmount) || (taxable + tax);
    const paid = parseFloat(formData.paidAmount) || 0;
    const balance = Math.max(0, total - paid);

    const payload = {
      dealerStoreName: formData.dealerStoreName.trim(),
      supplierRemarks: formData.dealerStoreName.trim(), // fallback
      invoiceNo: formData.invoiceNo.trim(),
      invoiceDate: formData.invoiceDate,
      taxableAmount: taxable,
      taxAmount: tax,
      totalAmount: total,
      paidAmount: paid,
      passedAmount: paid, // fallback
      paymentDate: formData.paymentDate || null,
      passedDate: formData.paymentDate || null, // fallback
      modeOfPayment: formData.modeOfPayment || (paid > 0 ? 'NEFT' : ''),
      balanceAmount: balance
    };

    try {
      if (editingItem && editingItem.id) {
        await updatePurchaseLedger(editingItem.id, payload);
        setToast({ message: `Purchase record ${payload.invoiceNo} updated successfully!`, type: 'success' });
      } else {
        await createPurchaseLedger(payload);
        setToast({ message: `New purchase record for ${payload.dealerStoreName} created successfully!`, type: 'success' });
      }
      setIsModalOpen(false);
      loadPurchaseData();
    } catch (err) {
      setToast({ message: 'Failed to save purchase record: ' + err.message, type: 'error' });
    }
  };

  // Delete Entry
  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete purchase record for Invoice: ${item.invoiceNo}?`)) {
      return;
    }
    try {
      if (item.id) {
        await deletePurchaseLedger(item.id);
      }
      setToast({ message: `Purchase record ${item.invoiceNo} deleted.`, type: 'success' });
      loadPurchaseData();
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
    setFilterDealer('');
    setFilterPaymentStatus('ALL');
    setFilterMode('ALL');
    setFromDate('');
    setToDate('');
    setPeriodPreset('ALL');
  };

  // Filtered List
  const filteredPurchases = useMemo(() => {
    return purchaseEntries.filter(item => {
      const dealer = (item.dealerStoreName || item.supplierRemarks || '').toLowerCase();
      const invNo = (item.invoiceNo || '').toLowerCase();
      const mode = (item.modeOfPayment || '').toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || dealer.includes(q) || invNo.includes(q) || mode.includes(q);

      const dealerQ = filterDealer.toLowerCase().trim();
      const matchesDealer = !dealerQ || dealer.includes(dealerQ);

      // Payment Status
      const total = Number(item.totalAmount) || 0;
      const paid = Number(item.paidAmount || item.passedAmount) || 0;
      const balance = item.balanceAmount !== undefined && item.balanceAmount !== null ? Number(item.balanceAmount) : Math.max(0, total - paid);

      let matchesStatus = true;
      if (filterPaymentStatus === 'PAID') matchesStatus = (total > 0 && balance === 0);
      if (filterPaymentStatus === 'PARTIAL') matchesStatus = (paid > 0 && balance > 0);
      if (filterPaymentStatus === 'PENDING') matchesStatus = (paid === 0 && total > 0);

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

      return matchesSearch && matchesDealer && matchesStatus && matchesMode && matchesDate;
    });
  }, [purchaseEntries, searchQuery, filterDealer, filterPaymentStatus, filterMode, fromDate, toDate]);

  // Pagination Slice Calculation
  const totalPages = pageSize === 'ALL' ? 1 : Math.max(1, Math.ceil(filteredPurchases.length / (Number(pageSize) || 50)));
  const effectivePage = Math.min(currentPage, totalPages);
  const startIndex = pageSize === 'ALL' ? 0 : (effectivePage - 1) * Number(pageSize);
  const endIndex = pageSize === 'ALL' ? filteredPurchases.length : Math.min(startIndex + Number(pageSize), filteredPurchases.length);
  const paginatedPurchases = useMemo(() => {
    return filteredPurchases.slice(startIndex, endIndex);
  }, [filteredPurchases, startIndex, endIndex]);

  // Safe Date Formatting Helper to prevent "Invalid Date"
  const formatCellDate = (val) => {
    if (!val || val === '-' || val === '--' || String(val).trim() === '') return '-';
    const d = new Date(val);
    return isNaN(d.getTime()) ? String(val) : d.toLocaleDateString('en-GB');
  };

  // Select All & Bulk Selection Handlers
  const isAllSelected = filteredPurchases.length > 0 && selectedItemIds.length === filteredPurchases.length;
  const isIndeterminate = selectedItemIds.length > 0 && selectedItemIds.length < filteredPurchases.length;

  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(filteredPurchases.map(p => p.id));
    }
  };

  const handleSelectItemToggle = (id) => {
    setSelectedItemIds(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const handleBulkDeleteSelected = async () => {
    if (selectedItemIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete all ${selectedItemIds.length} selected purchase bills?`)) return;

    try {
      setLoading(true);
      await Promise.all(selectedItemIds.map(id => deletePurchaseLedger(id)));
      setToast({ message: `Successfully deleted ${selectedItemIds.length} purchase records!`, type: 'success' });
      setSelectedItemIds([]);
      await loadPurchaseData();
    } catch (err) {
      console.error('Bulk delete failed:', err);
      setToast({ message: 'Failed to delete some records: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Unique Dealer/Store Names for Autocomplete Filter
  const uniqueDealerOptions = useMemo(() => {
    const names = new Set();
    purchaseEntries.forEach(item => {
      const d = item.dealerStoreName || item.supplierRemarks;
      if (d && d.trim()) {
        names.add(d.trim());
      }
    });
    return Array.from(names).sort();
  }, [purchaseEntries]);

  // Full Resolved Dealer Name for Statement (resolves substring search -> full dealer name)
  const resolvedDealerName = useMemo(() => {
    if (!filterDealer || !filterDealer.trim()) {
      return 'SRI DURGA ENTERPRISES, KARAIKAL.';
    }
    const q = filterDealer.trim().toLowerCase();
    const matched = uniqueDealerOptions.find(name => name.toLowerCase().includes(q));
    if (matched) return matched;

    const firstWithDealer = filteredPurchases.find(l => (l.dealerStoreName || l.supplierRemarks || '').toLowerCase().includes(q));
    if (firstWithDealer && (firstWithDealer.dealerStoreName || firstWithDealer.supplierRemarks)) {
      return firstWithDealer.dealerStoreName || firstWithDealer.supplierRemarks;
    }

    return filterDealer.trim();
  }, [filterDealer, uniqueDealerOptions, filteredPurchases]);

  // Calculate Dynamic Opening Balance for current Dealer & Date Filter
  // Auto-fetches all unpaid balances dated BEFORE the current Financial Year / fromDate (e.g. 01/04/2025, 01/04/2026)
  const openingBalance = useMemo(() => {
    const targetDealer = (resolvedDealerName && resolvedDealerName !== 'SRI DURGA ENTERPRISES, KARAIKAL.') 
      ? resolvedDealerName.trim().toUpperCase() 
      : (filterDealer || '').trim().toUpperCase();

    let baseOpening = 0;
    
    // 1. Saved explicit opening balance for this store
    if (targetDealer) {
      for (const [k, val] of Object.entries(dealerOpenings)) {
        const cleanK = k.trim().toUpperCase();
        if (cleanK === targetDealer || cleanK.includes(targetDealer) || targetDealer.includes(cleanK)) {
          baseOpening = Number(val) || 0;
          break;
        }
      }
    } else if (dealerOpenings['DEFAULT'] !== undefined) {
      baseOpening = Number(dealerOpenings['DEFAULT']) || 0;
    }

    const cutoffDate = fromDate || getActiveFinancialYearStartIso();

    // 2. Sum unpaid balances from prior purchases (dated before cutoffDate e.g. 01/04/2025, 01/04/2026)
    let priorUnpaid = 0;
    purchaseEntries.forEach(item => {
      const dealer = (item.dealerStoreName || item.supplierRemarks || '').toUpperCase();
      const matchesDealer = !targetDealer || dealer.includes(targetDealer) || targetDealer.includes(dealer);
      if (matchesDealer) {
        const itemDate = item.invoiceDate || item.paymentDate || item.passedDate;
        let isPrior = false;
        if (itemDate && itemDate < cutoffDate) {
          isPrior = true;
        } else if (!itemDate && item.invoiceNo && (item.invoiceNo.includes('/25-26') || item.invoiceNo.includes('/24-25')) && cutoffDate >= '2026-04-01') {
          isPrior = true;
        }

        if (isPrior) {
          const total = Number(item.totalAmount) || 0;
          const paid = Number(item.paidAmount || item.passedAmount) || 0;
          const bal = item.balanceAmount !== undefined && item.balanceAmount !== null ? Number(item.balanceAmount) : Math.max(0, total - paid);
          priorUnpaid += bal;
        }
      }
    });

    return baseOpening + priorUnpaid;
  }, [dealerOpenings, filterDealer, resolvedDealerName, fromDate, purchaseEntries]);

  // Aggregate Totals (Balance Amount = Opening Balance + Total Purchase Amount - Total Paid Amount)
  const totals = useMemo(() => {
    const agg = filteredPurchases.reduce((acc, item) => {
      const taxable = Number(item.taxableAmount) || 0;
      const tax = Number(item.taxAmount) || 0;
      const total = Number(item.totalAmount) || (taxable + tax);
      const paid = Number(item.paidAmount || item.passedAmount) || 0;

      acc.taxableAmount += taxable;
      acc.taxAmount += tax;
      acc.totalAmount += total;
      acc.paidAmount += paid;
      return acc;
    }, {
      taxableAmount: 0,
      taxAmount: 0,
      totalAmount: 0,
      paidAmount: 0
    });

    // Exact formula: (Opening Balance as of From Date + Purchases in Period) - Payments in Period
    const effectiveOpening = (filterDealer || fromDate) ? openingBalance : 0;
    agg.balanceAmount = Math.max(0, (effectiveOpening + agg.totalAmount) - agg.paidAmount);
    return agg;
  }, [filteredPurchases, openingBalance, filterDealer, fromDate]);

  // Handler to set/save Opening Balance for current dealer
  const handleSaveOpeningBalance = (newAmount) => {
    const dealerKey = (resolvedDealerName && resolvedDealerName !== 'SRI DURGA ENTERPRISES, KARAIKAL.')
      ? resolvedDealerName.trim()
      : (filterDealer ? filterDealer.trim() : 'DEFAULT');

    const updated = {
      ...dealerOpenings,
      [dealerKey]: Number(newAmount) || 0
    };
    setDealerOpenings(updated);
    localStorage.setItem('DEALER_OPENING_BALANCES', JSON.stringify(updated));
    setToast({ message: `Opening Balance of ₹${(Number(newAmount) || 0).toLocaleString('en-IN')} saved for ${dealerKey}!`, type: 'success' });
  };

  const activeFilterCount = [
    searchQuery,
    filterDealer,
    filterPaymentStatus !== 'ALL' ? filterPaymentStatus : null,
    filterMode !== 'ALL' ? filterMode : null,
    fromDate,
    toDate,
    periodPreset !== 'ALL' ? periodPreset : null
  ].filter(Boolean).length;

  // Robust Date Parser for Excel Input (Supports Serial, DD/MM/YYYY, YYYY-MM-DD)
  const parseExcelDate = (val) => {
    if (!val && val !== 0) return '';
    if (typeof val === 'number') {
      const date = new Date(Math.round((val - 25569) * 86400 * 1000));
      return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
    }
    const str = String(val).trim();
    if (!str) return '';
    const dmyMatch = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (dmyMatch) {
      const day = dmyMatch[1].padStart(2, '0');
      const month = dmyMatch[2].padStart(2, '0');
      const year = dmyMatch[3];
      return `${year}-${month}-${day}`;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      return str;
    }
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
    return str;
  };

  // Handle Excel/CSV File Selection & Parsing
  const handleFileSelected = (file) => {
    if (!file) return;
    setUploadFile(file);
    setUploading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        if (jsonRows.length < 2) {
          setToast({ message: 'The selected file contains no data rows.', type: 'error' });
          setUploading(false);
          return;
        }

        // Header detection
        let headerIdx = -1;
        let dealerCol = -1, invNoCol = -1, dateCol = -1, taxableCol = -1, taxCol = -1, totalCol = -1, paidCol = -1, payDateCol = -1, modeCol = -1, balCol = -1;

        for (let r = 0; r < Math.min(6, jsonRows.length); r++) {
          const row = jsonRows[r];
          row.forEach((cell, cIdx) => {
            const h = String(cell || '').trim().toLowerCase();
            if (h.includes('dealer') || h.includes('store') || h.includes('supplier') || h.includes('party') || h.includes('name of')) dealerCol = cIdx;
            else if (h.includes('invoice') || h.includes('bill no') || h.includes('inv no') || h.includes('bill #')) invNoCol = cIdx;
            else if (h.includes('payment date') || h.includes('paid date') || h.includes('pay date')) payDateCol = cIdx;
            else if (h.includes('date') && dateCol === -1) dateCol = cIdx;
            else if (h.includes('taxable') || h.includes('base') || h.includes('basic')) taxableCol = cIdx;
            else if (h === 'tax' || h.includes('tax amount') || h.includes('gst amount') || h === 'gst') taxCol = cIdx;
            else if (h.includes('total') || h.includes('gross') || h.includes('bill amt') || h.includes('net amount')) totalCol = cIdx;
            else if (h.includes('paid') || h.includes('passed') || h.includes('received')) paidCol = cIdx;
            else if (h.includes('mode') || h.includes('payment mode')) modeCol = cIdx;
            else if (h.includes('balance') || h.includes('due') || h.includes('pending')) balCol = cIdx;
          });
          if (dealerCol !== -1 || invNoCol !== -1 || totalCol !== -1) {
            headerIdx = r;
            break;
          }
        }

        if (headerIdx === -1) {
          headerIdx = 0;
          dealerCol = 1; invNoCol = 2; dateCol = 3; taxableCol = 4; taxCol = 5; totalCol = 6; paidCol = 7; payDateCol = 8; modeCol = 9; balCol = 10;
        }

        const parsed = [];
        const duplicatesList = [];
        const isDashOrEmpty = (val) => {
          if (!val && val !== 0) return true;
          const s = String(val).trim();
          return !s || s === '-' || s === '--' || s.toUpperCase() === 'N/A' || s.toUpperCase() === 'NA';
        };

        // Existing keys per (Dealer Name + Invoice No)
        const existingKeys = new Set(
          purchaseEntries.map(e => {
            const d = (e.dealerStoreName || e.supplierRemarks || '').trim().toUpperCase();
            const inv = (e.invoiceNo || '').trim().toUpperCase();
            return (d && inv && !isDashOrEmpty(inv)) ? `${d}___${inv}` : null;
          }).filter(Boolean)
        );

        let duplicateCount = 0;
        let sumTotal = 0;
        let sumPaid = 0;

        for (let r = headerIdx + 1; r < jsonRows.length; r++) {
          const row = jsonRows[r];
          if (!row || row.every(c => String(c || '').trim() === '')) continue;

          const dealerStoreName = dealerCol !== -1 ? String(row[dealerCol] || '').trim() : '';
          const rawInv = invNoCol !== -1 ? String(row[invNoCol] || '').trim() : '';
          if (!dealerStoreName && !rawInv) continue;

          const invoiceDate = dateCol !== -1 ? parseExcelDate(row[dateCol]) : new Date().toISOString().split('T')[0];
          const taxableAmount = taxableCol !== -1 ? (parseFloat(row[taxableCol]) || 0) : 0;
          const taxAmount = taxCol !== -1 ? (parseFloat(row[taxCol]) || 0) : 0;
          let totalAmount = totalCol !== -1 ? (parseFloat(row[totalCol]) || 0) : 0;
          if (totalAmount === 0 && (taxableAmount > 0 || taxAmount > 0)) {
            totalAmount = taxableAmount + taxAmount;
          }
          const paidAmount = paidCol !== -1 ? (parseFloat(row[paidCol]) || 0) : 0;

          // Duplicate check ONLY for the SAME Dealer with the SAME Invoice No (ignoring dashes / empty)
          const dealerKey = dealerStoreName.trim().toUpperCase();
          const invKey = rawInv.trim().toUpperCase();
          if (dealerKey && invKey && !isDashOrEmpty(invKey)) {
            const rowKey = `${dealerKey}___${invKey}`;
            if (existingKeys.has(rowKey)) {
              duplicateCount++;
              duplicatesList.push({
                rowNum: r + 1,
                dealerStoreName: dealerStoreName || 'Dealer Store',
                invoiceNo: rawInv,
                invoiceDate: invoiceDate || '-',
                taxableAmount,
                taxAmount,
                totalAmount,
                paidAmount,
                reason: 'Already exists for this Dealer in Database'
              });
              continue; // Skip duplicate for this specific dealer
            }
            existingKeys.add(rowKey);
          }

          const paymentDate = payDateCol !== -1 ? parseExcelDate(row[payDateCol]) : (paidAmount > 0 ? invoiceDate : '');
          const modeRaw = modeCol !== -1 && String(row[modeCol] || '').trim() ? String(row[modeCol]).trim().toUpperCase() : 'NEFT';
          const modeOfPayment = PAYMENT_MODES.includes(modeRaw) ? modeRaw : 'NEFT';
          let balanceAmount = balCol !== -1 && row[balCol] !== '' ? (parseFloat(row[balCol]) || 0) : Math.max(0, totalAmount - paidAmount);

          sumTotal += totalAmount;
          sumPaid += paidAmount;

          parsed.push({
            dealerStoreName: dealerStoreName || 'Dealer Store',
            invoiceNo: rawInv || '-',
            invoiceDate: invoiceDate || new Date().toISOString().split('T')[0],
            taxableAmount,
            taxAmount,
            totalAmount,
            paidAmount,
            paymentDate,
            modeOfPayment,
            balanceAmount
          });
        }

        setDuplicateRows(duplicatesList);

        if (parsed.length === 0) {
          if (duplicateCount > 0) {
            setToast({ message: `All ${duplicateCount} bills in the file are already in the Purchase Ledger (Duplicates skipped). Click 'Duplicates Skipped' to view them.`, type: 'error' });
          } else {
            setToast({ message: 'No valid purchase entries could be extracted from this sheet.', type: 'error' });
          }
          setUploading(false);
          return;
        }

        setPreviewRows(parsed);
        setUploadStats({
          totalRows: parsed.length,
          duplicateRows: duplicateCount,
          totalAmount: sumTotal,
          totalPaid: sumPaid,
          totalBalance: Math.max(0, sumTotal - sumPaid)
        });
        const dupMsg = duplicateCount > 0 ? ` (${duplicateCount} duplicates skipped - Click Duplicates box to inspect)` : '';
        setToast({ message: `Parsed ${parsed.length} new bills from "${file.name}"${dupMsg}. Click Confirm to Import!`, type: 'success' });
      } catch (err) {
        console.error('Failed to parse Excel:', err);
        setToast({ message: 'Failed to read file: ' + err.message, type: 'error' });
      } finally {
        setUploading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Confirm Batch Import
  const handleConfirmImport = async () => {
    if (previewRows.length === 0) return;
    try {
      setUploading(true);
      await bulkCreatePurchaseLedgers(previewRows);
      setToast({ message: `Successfully imported ${previewRows.length} purchase bills into Purchase Ledger!`, type: 'success' });
      setIsUploadModalOpen(false);
      setPreviewRows([]);
      setUploadFile(null);
      await loadPurchaseData();
    } catch (err) {
      console.error('Import failed:', err);
      setToast({ message: 'Failed to import records: ' + err.message, type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  // Download Sample Purchase Ledger Excel Template
  const handleDownloadSampleTemplate = () => {
    const sampleHeaders = [
      'Sl.No.',
      'Name of Dealer/Store',
      'Invoice No.',
      'Date',
      'Taxable Amount',
      'Tax',
      'Total Amount',
      'Paid Amount',
      'Payment Date',
      'Mode of Payment',
      'Balance Amount'
    ];

    const sampleRows = [
      sampleHeaders,
      [1, 'India Bearing & Mill Stores', 'IB/26-27/012', '26/08/2026', 15000, 2700, 17700, 17700, '26/08/2026', 'NEFT', 0],
      [2, 'Sri Balaji Hardware & Tools', 'SB/984', '25/08/2026', 8500, 1530, 10030, 5000, '25/08/2026', 'UPI', 5030],
      [3, 'Apex Electricals & Industrial Corp', 'APX/104', '24/08/2026', 42000, 7560, 49560, 0, '', 'NEFT', 49560]
    ];

    const ws = XLSX.utils.aoa_to_sheet(sampleRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Purchase Ledger');
    XLSX.writeFile(wb, 'Purchase_Ledger_Sample_Template.xlsx');
  };

  // Download Skipped Duplicates List as Excel
  const handleDownloadDuplicatesExcel = () => {
    if (duplicateRows.length === 0) return;
    const headers = ['Sl.No.', 'Excel Row #', 'Dealer / Store Name', 'Invoice No.', 'Date', 'Taxable Amount', 'Tax', 'Total Amount', 'Paid Amount', 'Reason'];
    const rows = duplicateRows.map((d, i) => [
      i + 1,
      d.rowNum || '-',
      d.dealerStoreName,
      d.invoiceNo,
      d.invoiceDate,
      d.taxableAmount,
      d.taxAmount,
      d.totalAmount,
      d.paidAmount,
      d.reason
    ]);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Skipped Duplicates');
    XLSX.writeFile(wb, `Skipped_Duplicates_${Date.now()}.xlsx`);
  };

  // Open Export Modal
  const handleOpenExportModal = () => {
    if (filteredPurchases.length === 0 && purchaseEntries.length === 0) {
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
    PURCHASE_EXPORT_COLUMNS.forEach(c => {
      updated[c.key] = selectAll;
    });
    setExportSelectedCols(updated);
  };

  // Execute Customized Excel Export
  const executeExportCSV = () => {
    const activeColumns = PURCHASE_EXPORT_COLUMNS.filter(c => exportSelectedCols[c.key]);

    if (activeColumns.length === 0) {
      setToast({ message: 'Please select at least 1 column to export!', type: 'error' });
      return;
    }

    const recordsToExport = exportScope === 'ALL' ? purchaseEntries : filteredPurchases;

    if (recordsToExport.length === 0) {
      setToast({ message: 'No records matching export scope.', type: 'error' });
      return;
    }

    // Build Header List
    const headers = activeColumns.map(c => c.label);

    // Build Row List
    const rows = recordsToExport.map((l, idx) => {
      const taxable = Number(l.taxableAmount) || 0;
      const tax = Number(l.taxAmount) || 0;
      const total = Number(l.totalAmount) || (taxable + tax);
      const paid = Number(l.paidAmount || l.passedAmount) || 0;
      const balance = l.balanceAmount !== undefined && l.balanceAmount !== null ? Number(l.balanceAmount) : Math.max(0, total - paid);

      return activeColumns.map(col => {
        switch (col.key) {
          case 'slNo': return idx + 1;
          case 'dealerStoreName': return `"${(l.dealerStoreName || l.supplierRemarks || '').replace(/"/g, '""')}"`;
          case 'invoiceNo': return `"${l.invoiceNo || ''}"`;
          case 'invoiceDate': return `"${l.invoiceDate || ''}"`;
          case 'taxableAmount': return taxable.toFixed(2);
          case 'taxAmount': return tax.toFixed(2);
          case 'totalAmount': return total.toFixed(2);
          case 'paidAmount': return paid.toFixed(2);
          case 'paymentDate': return `"${l.paymentDate || l.passedDate || ''}"`;
          case 'modeOfPayment': return `"${l.modeOfPayment || ''}"`;
          case 'balanceAmount': return balance.toFixed(2);
          default: return '""';
        }
      });
    });

    // Optional Grand Total Summary Row
    if (exportIncludeTotals) {
      const scopeTotals = recordsToExport.reduce((acc, item) => {
        const taxable = Number(item.taxableAmount) || 0;
        const tax = Number(item.taxAmount) || 0;
        const total = Number(item.totalAmount) || (taxable + tax);
        const paid = Number(item.paidAmount || item.passedAmount) || 0;
        const balance = item.balanceAmount !== undefined && item.balanceAmount !== null ? Number(item.balanceAmount) : Math.max(0, total - paid);

        acc.taxableAmount += taxable;
        acc.taxAmount += tax;
        acc.totalAmount += total;
        acc.paidAmount += paid;
        acc.balanceAmount += balance;
        return acc;
      }, { taxableAmount: 0, taxAmount: 0, totalAmount: 0, paidAmount: 0, balanceAmount: 0 });

      const totalRow = activeColumns.map(col => {
        switch (col.key) {
          case 'slNo': return '';
          case 'dealerStoreName': return '"TOTAL"';
          case 'invoiceNo': return '""';
          case 'invoiceDate': return '""';
          case 'taxableAmount': return scopeTotals.taxableAmount.toFixed(2);
          case 'taxAmount': return scopeTotals.taxAmount.toFixed(2);
          case 'totalAmount': return scopeTotals.totalAmount.toFixed(2);
          case 'paidAmount': return scopeTotals.paidAmount.toFixed(2);
          case 'paymentDate': return '""';
          case 'modeOfPayment': return '""';
          case 'balanceAmount': return scopeTotals.balanceAmount.toFixed(2);
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
    link.setAttribute('download', `Purchase_Ledger_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsExportModalOpen(false);
    setToast({ 
      message: `Exported ${recordsToExport.length} purchase records (${activeColumns.length} columns) to Excel successfully!`, 
      type: 'success' 
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header Banner */}
      <div 
        className="no-print"
        style={{ 
          background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.18) 0%, rgba(99, 102, 241, 0.12) 100%)', 
          border: '1px solid rgba(236, 72, 153, 0.3)', 
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
          <div style={{ background: 'rgba(236, 72, 153, 0.22)', padding: '0.75rem', borderRadius: '12px', color: '#f472b6' }}>
            <ShoppingBag size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
              <span style={{ fontWeight: 600 }}>Accounting & Finance</span>
              <ChevronRight size={12} />
              <span style={{ color: '#f472b6', fontWeight: 700 }}>Purchase Ledger</span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Purchase Ledger & Supplier Payments
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Track dealer & store bills, taxable amounts, tax, payments, and outstanding balances.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
          {/* 1. MANUAL ENTRY BUTTON */}
          <button 
            onClick={handleOpenNewModal} 
            className="btn btn-primary"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              padding: '0.55rem 1.15rem', 
              fontSize: '0.85rem', 
              fontWeight: 800,
              background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
              border: 'none',
              boxShadow: '0 4px 15px rgba(236, 72, 153, 0.4)' 
            }}
          >
            <Plus size={16} />
            <span>+ New Purchase Entry</span>
          </button>

          {/* 2. FILTER BUTTON WITH ACTIVE BADGE */}
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

          {/* 3. Refresh */}
          <button onClick={loadPurchaseData} className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '0.55rem 0.85rem' }} title="Refresh Records">
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
        {/* Card 1: Gross Purchase Turnover */}
        <div className="glass-panel" style={{ padding: '1.15rem 1.25rem', borderLeft: '4px solid #f472b6', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Purchase Amount
            </span>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(244, 114, 182, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f472b6' }}>
              <TrendingDown size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f472b6' }}>
            ₹{totals.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
            Across <strong>{filteredPurchases.length}</strong> Bills
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
            Base Purchase Value
          </span>
        </div>

        {/* Card 3: Total Tax */}
        <div className="glass-panel" style={{ padding: '1.15rem 1.25rem', borderLeft: '4px solid #818cf8', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Tax (GST)
            </span>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
              <IndianRupee size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#818cf8' }}>
            ₹{totals.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
            Input Tax Credit
          </span>
        </div>

        {/* Card 4: Total Paid Amount */}
        <div className="glass-panel" style={{ padding: '1.15rem 1.25rem', borderLeft: '4px solid #34d399', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Paid Amount
            </span>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#34d399' }}>
            ₹{totals.paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
            Paid to Dealers / Stores
          </span>
        </div>

        {/* Card 5: Total Balance Due */}
        <div className="glass-panel" style={{ padding: '1.15rem 1.25rem', borderLeft: '4px solid #fbbf24', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Balance Amount
            </span>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24' }}>
              <Clock size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: totals.balanceAmount > 0 ? '#fbbf24' : '#34d399' }}>
            ₹{totals.balanceAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
            {totals.balanceAmount > 0 ? 'Pending Outward Dues' : 'All Dues Cleared'}
          </span>
        </div>
      </div>

      {/* FILTER PANEL */}
      {showFilters && (
        <div className="glass-panel animate-modal-entry no-print" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1.5px solid rgba(236, 72, 153, 0.35)', background: 'rgba(15, 23, 42, 0.95)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f472b6', fontWeight: 800, fontSize: '0.95rem' }}>
              <Filter size={18} />
              <span>Purchase Ledger Filters & Period Inspector</span>
              {activeFilterCount > 0 && (
                <span style={{ fontSize: '0.75rem', background: 'rgba(236, 72, 153, 0.2)', color: '#f472b6', padding: '2px 8px', borderRadius: '12px', border: '1px solid rgba(236, 72, 153, 0.4)' }}>
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
                  placeholder="Dealer, Invoice No..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Dealer/Store */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.35rem' }}>Dealer / Store</label>
              <div style={{ position: 'relative' }}>
                <Building2 size={15} color="var(--text-subtle)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  list="purchase-dealer-options"
                  className="form-input"
                  style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
                  placeholder="e.g. India Bearing & Mill Store..."
                  value={filterDealer}
                  onChange={e => setFilterDealer(e.target.value)}
                />
                <datalist id="purchase-dealer-options">
                  {uniqueDealerOptions.map(name => (
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
                <option value="PAID">Fully Paid (Balance 0)</option>
                <option value="PARTIAL">Partially Paid</option>
                <option value="PENDING">Pending (Unpaid)</option>
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

      {/* PURCHASE LEDGER REGISTER TABLE */}
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
            <ShoppingBag size={18} color="#f472b6" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white', margin: 0 }}>
              Purchase Ledger Register
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
              Showing <strong>{filteredPurchases.length}</strong> of <strong>{purchaseEntries.length}</strong> Purchase Bills
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            {/* 📤 Upload Excel Button */}
            <button 
              onClick={() => {
                setPreviewRows([]);
                setUploadFile(null);
                setIsUploadModalOpen(true);
              }} 
              className="btn btn-outline" 
              style={{ 
                border: '1px solid rgba(56, 189, 248, 0.45)', 
                color: '#38bdf8', 
                background: 'rgba(56, 189, 248, 0.08)',
                fontSize: '0.8rem', 
                padding: '0.4rem 0.85rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.45rem', 
                fontWeight: 700 
              }} 
              title="Upload Excel (.xlsx, .xls, .csv) to batch import multiple purchase bills"
            >
              <UploadCloud size={16} />
              <span>Upload Excel</span>
            </button>

            {/* Export Excel Button (Opens Customizer Dialog) */}
            <button 
              onClick={handleOpenExportModal} 
              className="btn btn-outline" 
              style={{ border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34d399', fontSize: '0.8rem', padding: '0.4rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }} 
              title="Select Columns and Export Purchase Ledger to Excel"
              disabled={purchaseEntries.length === 0}
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
              background: 'rgba(236, 72, 153, 0.16)',
              borderBottom: '1px solid rgba(236, 72, 153, 0.4)',
              color: '#fbcfe8',
              fontSize: '0.85rem',
              fontWeight: 700
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <CheckSquare size={17} color="#f472b6" />
              <span><strong>{selectedItemIds.length}</strong> of <strong>{filteredPurchases.length}</strong> purchase bills selected</span>
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
              <tr style={{ background: '#0f172a', textAlign: 'left', position: 'sticky', top: 0, zIndex: 15, boxShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
                {/* Select All Checkbox */}
                <th style={{ width: '45px', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.1)', background: '#0f172a' }} className="no-print">
                  <input
                    type="checkbox"
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#ec4899' }}
                    checked={isAllSelected}
                    ref={input => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={handleSelectAllToggle}
                    title="Select All / Deselect All Bills"
                  />
                </th>
                <th style={{ width: '55px', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.1)', background: '#0f172a' }}>
                  Sl.No.
                </th>
                <th style={{ minWidth: '180px', borderRight: '1px solid rgba(255,255,255,0.1)', color: '#fbcfe8', background: '#0f172a' }}>
                  Name of Dealer/Store
                </th>
                <th style={{ width: '120px', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.1)', color: '#f472b6', background: '#0f172a' }}>
                  Invoice No.
                </th>
                <th style={{ width: '95px', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', background: '#0f172a' }}>
                  Date
                </th>
                <th style={{ width: '120px', textAlign: 'right', borderRight: '1px solid rgba(255,255,255,0.1)', color: '#38bdf8', background: '#0f172a' }}>
                  Taxable Amount
                </th>
                <th style={{ width: '105px', textAlign: 'right', borderRight: '1px solid rgba(255,255,255,0.1)', color: '#818cf8', background: '#0f172a' }}>
                  Tax
                </th>
                <th style={{ width: '125px', textAlign: 'right', borderRight: '1px solid rgba(255,255,255,0.1)', color: '#f472b6', fontWeight: 800, background: '#0f172a' }}>
                  Total Amount
                </th>
                <th style={{ width: '120px', textAlign: 'right', borderRight: '1px solid rgba(255,255,255,0.1)', color: '#34d399', fontWeight: 700, background: '#0f172a' }}>
                  Paid Amount
                </th>
                <th style={{ width: '95px', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.1)', color: '#34d399', background: '#0f172a' }}>
                  Payment Date
                </th>
                <th style={{ width: '110px', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.1)', background: '#0f172a' }}>
                  Mode of Payment
                </th>
                <th style={{ width: '120px', textAlign: 'right', borderRight: '1px solid rgba(255,255,255,0.1)', color: '#fbbf24', fontWeight: 800, background: '#0f172a' }}>
                  Balance Amount
                </th>
                <th style={{ width: '75px', textAlign: 'center', background: '#0f172a' }} className="no-print">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={13} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem auto' }} />
                    <p style={{ margin: 0 }}>Loading Purchase Ledger entries...</p>
                  </td>
                </tr>
              ) : filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={13} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <ShoppingBag size={32} style={{ margin: '0 auto 0.75rem auto', opacity: 0.4, color: '#f472b6' }} />
                    <p style={{ fontWeight: 600, color: 'white', marginBottom: '0.35rem' }}>No Purchase Ledger records found</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginBottom: '1rem' }}>
                      Click <strong>"+ New Purchase Entry"</strong> to add dealer bills, tax values, paid amounts, and balances.
                    </p>
                    <button onClick={handleOpenNewModal} className="btn btn-primary" style={{ fontSize: '0.8rem', background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)', border: 'none' }}>
                      <Plus size={14} /> Add Purchase Entry
                    </button>
                  </td>
                </tr>
              ) : (
                paginatedPurchases.map((l, pIdx) => {
                  const globalIdx = startIndex + pIdx;
                  const taxable = Number(l.taxableAmount) || 0;
                  const tax = Number(l.taxAmount) || 0;
                  const total = Number(l.totalAmount) || (taxable + tax);
                  const paid = Number(l.paidAmount || l.passedAmount) || 0;
                  const balance = l.balanceAmount !== undefined && l.balanceAmount !== null ? Number(l.balanceAmount) : Math.max(0, total - paid);
                  const isSelected = selectedItemIds.includes(l.id);

                  return (
                    <tr key={l.id || globalIdx} style={{ background: isSelected ? 'rgba(236, 72, 153, 0.14)' : undefined }}>
                      {/* Row Checkbox */}
                      <td style={{ textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.05)' }} className="no-print">
                        <input
                          type="checkbox"
                          style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#ec4899' }}
                          checked={isSelected}
                          onChange={() => handleSelectItemToggle(l.id)}
                        />
                      </td>

                      {/* Sl.No. */}
                      <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)' }}>
                        {globalIdx + 1}
                      </td>

                      {/* Name of Dealer/Store */}
                      <td style={{ fontWeight: 600, color: 'white' }}>
                        {l.dealerStoreName || l.supplierRemarks || '-'}
                      </td>

                      {/* Invoice No. */}
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge badge-code" style={{ color: '#f472b6', borderColor: 'rgba(236, 72, 153, 0.4)', background: 'rgba(236, 72, 153, 0.15)', fontWeight: 800 }}>
                          {l.invoiceNo || '-'}
                        </span>
                      </td>

                      {/* Date */}
                      <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        {formatCellDate(l.invoiceDate)}
                      </td>

                      {/* Taxable Amount */}
                      <td style={{ textAlign: 'right', fontWeight: 600, color: '#38bdf8' }}>
                        ₹{taxable.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Tax */}
                      <td style={{ textAlign: 'right', fontWeight: 600, color: '#818cf8' }}>
                        ₹{tax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Total Amount */}
                      <td style={{ textAlign: 'right', fontWeight: 900, color: '#f472b6', fontSize: '0.88rem' }}>
                        ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Paid Amount */}
                      <td style={{ textAlign: 'right', fontWeight: 700, color: paid > 0 ? '#34d399' : 'var(--text-subtle)' }}>
                        ₹{paid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Payment Date */}
                      <td style={{ textAlign: 'center', fontSize: '0.78rem', color: (l.paymentDate || l.passedDate) ? '#34d399' : 'var(--text-subtle)' }}>
                        {formatCellDate(l.paymentDate || l.passedDate)}
                      </td>

                      {/* Mode of Payment */}
                      <td style={{ textAlign: 'center' }}>
                        {paid > 0 && l.modeOfPayment && l.modeOfPayment !== '-' && l.modeOfPayment !== 'N/A' ? (
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

                      {/* Balance Amount */}
                      <td style={{ textAlign: 'right', fontWeight: 800, color: balance > 0 ? '#fbbf24' : '#34d399' }}>
                        ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'center' }} className="no-print">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                          <button
                            onClick={() => handleOpenEditModal(l)}
                            className="btn btn-outline"
                            style={{ padding: '0.3rem 0.5rem', color: '#f472b6', borderColor: 'rgba(236, 72, 153, 0.3)' }}
                            title="Edit Entry & Payment Details"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(l)}
                            className="btn btn-outline"
                            style={{ padding: '0.3rem 0.5rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
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
            {filteredPurchases.length > 0 && (
              <tfoot>
                <tr style={{ background: '#0f172a', borderTop: '2px solid rgba(236, 72, 153, 0.6)', fontWeight: 900, position: 'sticky', bottom: 0, zIndex: 14, boxShadow: '0 -2px 8px rgba(0,0,0,0.6)' }}>
                  <td colSpan={5} style={{ textAlign: 'right', padding: '0.85rem 1rem', color: '#f8fafc', fontSize: '0.9rem', background: '#0f172a' }}>
                    GRAND TOTALS:
                  </td>
                  {/* Taxable Amount */}
                  <td style={{ textAlign: 'right', color: '#38bdf8', fontSize: '0.9rem', background: '#0f172a' }}>
                    ₹{totals.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  {/* Tax */}
                  <td style={{ textAlign: 'right', color: '#818cf8', fontSize: '0.9rem', background: '#0f172a' }}>
                    ₹{totals.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  {/* Total Amount */}
                  <td style={{ textAlign: 'right', color: '#f472b6', fontSize: '1rem', fontWeight: 900, background: '#0f172a' }}>
                    ₹{totals.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  {/* Paid Amount */}
                  <td style={{ textAlign: 'right', color: '#34d399', fontSize: '0.95rem', background: '#0f172a' }}>
                    ₹{totals.paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ textAlign: 'center', background: '#0f172a' }}>-</td>
                  <td style={{ textAlign: 'center', background: '#0f172a' }}>-</td>
                  {/* Balance Amount */}
                  <td style={{ textAlign: 'right', color: totals.balanceAmount > 0 ? '#fbbf24' : '#34d399', fontSize: '0.95rem', background: '#0f172a' }}>
                    ₹{totals.balanceAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="no-print" style={{ background: '#0f172a' }}></td>
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
              Showing <strong style={{ color: '#f8fafc' }}>{filteredPurchases.length === 0 ? 0 : startIndex + 1} - {endIndex}</strong> of <strong style={{ color: '#f8fafc' }}>{filteredPurchases.length}</strong> Purchase Bills
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
                <option value="ALL">All ({filteredPurchases.length})</option>
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
      {/* MANUAL ENTRY / EDIT PURCHASE LEDGER MODAL                    */}
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
              border: '1.5px solid rgba(236, 72, 153, 0.4)', 
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
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(236, 72, 153, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingBag size={18} color="#f472b6" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                    {editingItem ? 'Edit Purchase Entry' : 'Add New Purchase Entry'}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Enter dealer/store details, taxable value, tax, payment and balance.
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
              
              {/* Section 1: Dealer & Bill Information */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f472b6', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                  1. Dealer & Invoice Details
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Name of Dealer/Store <span style={{ color: '#f87171' }}>*</span></label>
                    <input
                      type="text"
                      name="dealerStoreName"
                      required
                      placeholder="e.g. Sri Lakshmi Hardwares / Standard Tools & Spares"
                      className="form-input"
                      value={formData.dealerStoreName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Invoice No. <span style={{ color: '#f87171' }}>*</span></label>
                    <input
                      type="text"
                      name="invoiceNo"
                      required
                      placeholder="e.g. INV-2026/410"
                      className="form-input"
                      value={formData.invoiceNo}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Date <span style={{ color: '#f87171' }}>*</span></label>
                    <input
                      type="date"
                      name="invoiceDate"
                      required
                      className="form-input"
                      value={formData.invoiceDate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Amounts & Tax */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                  2. Valuation & Tax
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
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
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Tax (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="taxAmount"
                      placeholder="0.00"
                      className="form-input"
                      value={formData.taxAmount}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem', color: '#f472b6' }}>Total Amount (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="totalAmount"
                      className="form-input"
                      style={{ background: 'rgba(236, 72, 153, 0.1)', borderColor: 'rgba(236, 72, 153, 0.4)', fontWeight: 900, color: '#f472b6' }}
                      value={formData.totalAmount}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Payment & Balance */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                  3. Payment & Settlement
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Paid Amount (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="paidAmount"
                      placeholder="0.00"
                      className="form-input"
                      value={formData.paidAmount}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Payment Date</label>
                    <input
                      type="date"
                      name="paymentDate"
                      className="form-input"
                      value={formData.paymentDate}
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
                    <label className="form-label" style={{ fontSize: '0.75rem', color: '#fbbf24' }}>Balance Amount (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="balanceAmount"
                      readOnly
                      className="form-input"
                      style={{ background: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.4)', fontWeight: 900, color: '#fbbf24', cursor: 'not-allowed' }}
                      value={formData.balanceAmount}
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
                  style={{ padding: '0.55rem 1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)', border: 'none' }}
                >
                  <Save size={16} />
                  <span>{editingItem ? 'Update Purchase Entry' : 'Save Purchase Entry'}</span>
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
              border: '1.5px solid rgba(139, 92, 246, 0.4)', 
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
                    Customize & Export Purchase Ledger
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
                    {Object.values(exportSelectedCols).filter(Boolean).length} of {PURCHASE_EXPORT_COLUMNS.length} Selected
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
                {PURCHASE_EXPORT_COLUMNS.map(col => {
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
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f472b6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Export Scope & Summary
                </span>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {/* Scope Selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#e2e8f0', cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="purchaseExportScope" 
                        value="FILTERED" 
                        checked={exportScope === 'FILTERED'} 
                        onChange={() => setExportScope('FILTERED')} 
                        style={{ accentColor: '#10b981' }}
                      />
                      <span>Current Filtered ({filteredPurchases.length} Bills)</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#e2e8f0', cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="purchaseExportScope" 
                        value="ALL" 
                        checked={exportScope === 'ALL'} 
                        onChange={() => setExportScope('ALL')} 
                        style={{ accentColor: '#10b981' }}
                      />
                      <span>All Records ({purchaseEntries.length} Bills)</span>
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
          {/* Strict Isolated @media print CSS for Perfect PDF Output */}
          <style>{`
            @media print {
              @page {
                size: A4 portrait;
                margin: 10mm;
              }
              html, body {
                background: #ffffff !important;
                color: #000000 !important;
                margin: 0 !important;
                padding: 0 !important;
                overflow: visible !important;
                height: auto !important;
              }
              body * {
                visibility: hidden !important;
              }
              #purchase-statement-print-sheet, #purchase-statement-print-sheet * {
                visibility: visible !important;
              }
              #purchase-statement-print-sheet {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                background: #ffffff !important;
                color: #000000 !important;
                box-shadow: none !important;
                border: none !important;
                display: block !important;
              }
              .no-print, .no-print * {
                display: none !important;
                visibility: hidden !important;
              }
              .no-print-modal-overlay {
                position: static !important;
                background: transparent !important;
                backdrop-filter: none !important;
                padding: 0 !important;
                margin: 0 !important;
                display: block !important;
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
            {/* Modal Top Bar - Clean Title & Close Only */}
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
                  Supplier / Dealer Ledger Statement (PDF Preview)
                </h3>
              </div>

              <button 
                onClick={() => setIsPdfModalOpen(false)} 
                className="btn btn-outline" 
                style={{ width: '32px', height: '32px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Close Preview"
              >
                <X size={16} />
              </button>
            </div>

            {/* Statement Printable Paper (White Background like Bank/Tally Ledger) */}
            <div style={{ padding: '1.25rem', overflowY: 'auto', background: '#334155' }}>
              <div 
                id="purchase-statement-print-sheet"
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
                    Supplier / Dealer Ledger for: <span style={{ textDecoration: 'underline' }}>{filterDealer && filterDealer.trim() ? resolvedDealerName.toUpperCase() : 'ALL SUPPLIERS & DEALERS'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#000000', fontSize: '0.9rem', fontWeight: 800, padding: '0 1rem' }}>
                    <span>From: &nbsp; {fromDate ? new Date(fromDate).toLocaleDateString('en-GB') : getActiveFinancialYearStartDate()} &nbsp; To: &nbsp; {toDate ? new Date(toDate).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')}</span>
                    <span>Page No &nbsp; 1</span>
                  </div>
                </div>

                {/* 2. Top Double Black Border Line */}
                <div style={{ borderTop: '2px solid #000000', borderBottom: '1px solid #000000', height: '3px', marginBottom: '0.5rem' }}></div>

                {/* 3. Dynamic Columns Statement Table */}
                {(() => {
                  const activeStatementCols = PURCHASE_EXPORT_COLUMNS.filter(col => exportSelectedCols[col.key]);
                  const cutoffDate = fromDate || getActiveFinancialYearStartIso();
                  
                  // Bills prior to cutoffDate (e.g. up to 31/03/2026) roll into Opening Balance on 01/04/2026
                  // Only bills for the current period (>= cutoffDate e.g. 01/04/2026 onwards) appear in table rows!
                  const rawEntries = exportScope === 'ALL' ? purchaseEntries : filteredPurchases;
                  const statementEntries = rawEntries.filter(item => {
                    const itemDate = item.invoiceDate || item.paymentDate || item.passedDate;
                    if (itemDate && itemDate < cutoffDate) {
                      return false;
                    }
                    if (!itemDate && item.invoiceNo && (item.invoiceNo.includes('/25-26') || item.invoiceNo.includes('/24-25')) && cutoffDate >= '2026-04-01') {
                      return false;
                    }
                    return true;
                  });

                  let sumTaxable = 0, sumTax = 0, sumTotal = 0, sumPaid = 0;
                  statementEntries.forEach(item => {
                    sumTaxable += parseFloat(item.taxableAmount) || 0;
                    sumTax += parseFloat(item.taxAmount) || 0;
                    sumTotal += parseFloat(item.totalAmount) || 0;
                    sumPaid += parseFloat(item.paidAmount || item.passedAmount) || 0;
                  });
                  const sumBalance = Math.max(0, (openingBalance + sumTotal) - sumPaid);

                  const formatStDate = (val) => {
                    if (!val || val === '-' || val === '--') return '-';
                    const d = new Date(val);
                    return isNaN(d.getTime()) ? String(val) : d.toLocaleDateString('en-GB');
                  };

                  return (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', fontFamily: 'Calibri, "Segoe UI", Arial, sans-serif' }}>
                      <thead>
                        <tr style={{ borderBottom: '1.5px solid #000000', color: '#000000', fontWeight: 800 }}>
                          {activeStatementCols.map(col => {
                            let textAlign = 'left';
                            if (['slNo', 'invoiceDate', 'paymentDate'].includes(col.key)) textAlign = 'center';
                            if (['taxableAmount', 'taxAmount', 'totalAmount', 'paidAmount', 'balanceAmount'].includes(col.key)) textAlign = 'right';

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
                              col.key === 'dealerStoreName' || 
                              (!activeStatementCols.some(c => c.key === 'dealerStoreName') && col.key === 'invoiceNo') ||
                              (!activeStatementCols.some(c => ['dealerStoreName', 'invoiceNo'].includes(c.key)) && cIdx === 1)
                            );

                            if (isLabelCol) {
                              return (
                                <td key={col.key} style={{ padding: '6px 4px', color: '#16a34a', fontWeight: 800 }}>
                                  Opening Balance
                                </td>
                              );
                            }

                            // Amount Column to hold the opening balance amount
                            const isAmtCol = (
                              col.key === 'totalAmount' ||
                              (!activeStatementCols.some(c => c.key === 'totalAmount') && col.key === 'balanceAmount') ||
                              (!activeStatementCols.some(c => ['totalAmount', 'balanceAmount'].includes(c.key)) && col.key === 'taxableAmount')
                            );

                            if (isAmtCol) {
                              return (
                                <td key={col.key} style={{ textAlign: 'right', padding: '6px 4px', color: '#16a34a', fontWeight: 800 }}>
                                  {openingBalance.toFixed(2)}
                                </td>
                              );
                            }

                            return <td key={col.key} style={{ textAlign: 'center', padding: '6px 4px', color: '#9ca3af' }}>-</td>;
                          })}
                        </tr>

                        {/* Transaction Rows */}
                        {statementEntries.map((l, idx) => {
                          const taxableAmt = Number(l.taxableAmount) || 0;
                          const taxAmt = Number(l.taxAmount) || 0;
                          const totalAmt = Number(l.totalAmount) || 0;
                          const paidAmt = Number(l.paidAmount || l.passedAmount) || 0;
                          const balAmt = l.balanceAmount !== undefined ? Number(l.balanceAmount) : Math.max(0, totalAmt - paidAmt);

                          return (
                            <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                              {activeStatementCols.map(col => {
                                if (col.key === 'slNo') {
                                  return <td key={col.key} style={{ textAlign: 'center', padding: '5px 4px', fontWeight: 700 }}>{idx + 1}</td>;
                                }
                                if (col.key === 'dealerStoreName') {
                                  return <td key={col.key} style={{ padding: '5px 4px', fontWeight: 700, color: '#111827' }}>{l.dealerStoreName || l.supplierRemarks || '-'}</td>;
                                }
                                if (col.key === 'invoiceNo') {
                                  return <td key={col.key} style={{ padding: '5px 4px', fontWeight: 700 }}>{l.invoiceNo || '-'}</td>;
                                }
                                if (col.key === 'invoiceDate') {
                                  return <td key={col.key} style={{ textAlign: 'center', padding: '5px 4px' }}>{formatStDate(l.invoiceDate)}</td>;
                                }
                                if (col.key === 'taxableAmount') {
                                  return <td key={col.key} style={{ textAlign: 'right', padding: '5px 4px' }}>{taxableAmt > 0 ? taxableAmt.toFixed(2) : '-'}</td>;
                                }
                                if (col.key === 'taxAmount') {
                                  return <td key={col.key} style={{ textAlign: 'right', padding: '5px 4px' }}>{taxAmt > 0 ? taxAmt.toFixed(2) : '-'}</td>;
                                }
                                if (col.key === 'totalAmount') {
                                  return <td key={col.key} style={{ textAlign: 'right', padding: '5px 4px', fontWeight: 700 }}>{totalAmt.toFixed(2)}</td>;
                                }
                                if (col.key === 'paidAmount') {
                                  return <td key={col.key} style={{ textAlign: 'right', padding: '5px 4px', color: paidAmt > 0 ? '#1e40af' : '#9ca3af', fontWeight: paidAmt > 0 ? 700 : 400 }}>{paidAmt > 0 ? paidAmt.toFixed(2) : '-'}</td>;
                                }
                                if (col.key === 'paymentDate') {
                                  return <td key={col.key} style={{ textAlign: 'center', padding: '5px 4px', color: '#4b5563' }}>{formatStDate(l.paymentDate)}</td>;
                                }
                                if (col.key === 'modeOfPayment') {
                                  const hasPayment = paidAmt > 0 && l.modeOfPayment && l.modeOfPayment !== '-' && l.modeOfPayment !== 'N/A';
                                  return <td key={col.key} style={{ textAlign: 'center', padding: '5px 4px' }}>{hasPayment ? l.modeOfPayment : '-'}</td>;
                                }
                                if (col.key === 'balanceAmount') {
                                  return <td key={col.key} style={{ textAlign: 'right', padding: '5px 4px', fontWeight: 700, color: balAmt > 0 ? '#dc2626' : '#16a34a' }}>{balAmt.toFixed(2)}</td>;
                                }
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
                                if (col.key === 'taxableAmount') {
                                  return <td key={col.key} style={{ textAlign: 'right', padding: '8px 4px' }}>{sumTaxable.toFixed(2)}</td>;
                                }
                                if (col.key === 'taxAmount') {
                                  return <td key={col.key} style={{ textAlign: 'right', padding: '8px 4px' }}>{sumTax.toFixed(2)}</td>;
                                }
                                if (col.key === 'totalAmount') {
                                  return <td key={col.key} style={{ textAlign: 'right', padding: '8px 4px' }}>{(openingBalance + sumTotal).toFixed(2)}</td>;
                                }
                                if (col.key === 'paidAmount') {
                                  return <td key={col.key} style={{ textAlign: 'right', padding: '8px 4px' }}>{sumPaid.toFixed(2)}</td>;
                                }
                                if (col.key === 'balanceAmount') {
                                  return <td key={col.key} style={{ textAlign: 'right', padding: '8px 4px', color: '#16a34a' }}>{sumBalance.toFixed(2)}</td>;
                                }
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
                                  col.key === 'dealerStoreName' || 
                                  (!activeStatementCols.some(c => c.key === 'dealerStoreName') && col.key === 'invoiceNo') ||
                                  (!activeStatementCols.some(c => ['dealerStoreName', 'invoiceNo'].includes(c.key)) && cIdx === 1)
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
                                  (!activeStatementCols.some(c => c.key === 'totalAmount') && col.key === 'taxableAmount') ||
                                  col.key === 'balanceAmount'
                                );

                                if (isAmtCol) {
                                  return (
                                    <td key={col.key} style={{ textAlign: 'right', padding: '6px 4px', color: '#16a34a', fontWeight: 800 }}>
                                      {sumBalance.toFixed(2)}
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
                  key={`opening-dealer-${filterDealer}-${openingBalance}`}
                  onBlur={(e) => handleSaveOpeningBalance(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { handleSaveOpeningBalance(e.target.value); e.target.blur(); } }}
                  title="Edit Opening Balance for this Store / Period"
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

      {/* ============================================================ */}
      {/* EXCEL UPLOAD & BATCH IMPORT MODAL                            */}
      {/* ============================================================ */}
      {isUploadModalOpen && (
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
            if (e.target === e.currentTarget && !uploading) setIsUploadModalOpen(false);
          }}
        >
          <div 
            style={{ 
              width: '100%', 
              maxWidth: '850px', 
              background: '#0f172a', 
              border: '1.5px solid rgba(56, 189, 248, 0.4)', 
              borderRadius: '16px', 
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.95)',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: 'calc(100vh - 8rem)',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: '1rem 1.5rem', background: 'rgba(30, 41, 59, 0.95)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <UploadCloud size={22} color="#38bdf8" />
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                    Upload & Import Purchase Bills (Excel / CSV)
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Upload any Excel (.xlsx, .xls) or CSV file with dealer bills to import multiple records instantly
                  </span>
                </div>
              </div>

              <button 
                onClick={() => setIsUploadModalOpen(false)} 
                className="btn btn-outline" 
                style={{ width: '32px', height: '32px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                disabled={uploading}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Sample Template Helper Banner */}
              <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px dashed rgba(56, 189, 248, 0.4)', padding: '0.85rem 1.25rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <FileSpreadsheet size={20} color="#38bdf8" />
                  <span style={{ fontSize: '0.825rem', color: '#e0f2fe' }}>
                    Need the standard column format? Download the ready-to-use template:
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSampleTemplate}
                  className="btn btn-outline"
                  style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem', color: '#38bdf8', borderColor: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
                >
                  <Download size={14} />
                  <span>Download Sample Template (.xlsx)</span>
                </button>
              </div>

              {/* Drag and Drop / File Input Box */}
              <div 
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                onDragOver={(e) => { e.preventDefault(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileSelected(e.dataTransfer.files[0]);
                  }
                }}
                style={{
                  border: '2px dashed rgba(148, 163, 184, 0.35)',
                  borderRadius: '12px',
                  padding: '2rem 1.5rem',
                  textAlign: 'center',
                  background: 'rgba(15, 23, 42, 0.6)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept=".xlsx, .xls, .csv"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelected(e.target.files[0]);
                    }
                  }}
                  style={{ display: 'none' }}
                />

                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                  <FileUp size={24} />
                </div>

                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.25rem' }}>
                    {uploadFile ? `Selected: ${uploadFile.name}` : 'Click to Browse or Drag & Drop Excel/CSV File here'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Supports <strong>.xlsx, .xls, .csv</strong> files with any number of rows
                  </div>
                </div>
              </div>

              {/* Parsed Preview Table & Statistics */}
              {previewRows.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* Metric Summary Badges */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.625rem' }}>
                    <div style={{ background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '0.65rem 0.85rem', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>New Bills to Import</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#38bdf8' }}>{uploadStats.totalRows} Bills</div>
                    </div>
                    {uploadStats.duplicateRows > 0 && (
                      <div 
                        onClick={() => setIsDuplicatesModalOpen(true)}
                        style={{ 
                          background: 'rgba(239, 68, 68, 0.16)', 
                          border: '1.5px solid rgba(239, 68, 68, 0.5)', 
                          padding: '0.65rem 0.85rem', 
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)',
                          transition: 'all 0.2s ease'
                        }}
                        title="Click to view all skipped duplicate bills in detail"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.7rem', color: '#fca5a5', textTransform: 'uppercase', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <AlertCircle size={12} color="#f87171" /> Duplicates Skipped
                          </span>
                          <span style={{ fontSize: '0.625rem', background: '#ef4444', color: 'white', padding: '1px 6px', borderRadius: '4px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <Eye size={10} /> View ({duplicateRows.length})
                          </span>
                        </div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f87171' }}>
                          {uploadStats.duplicateRows} Duplicate(s)
                        </div>
                      </div>
                    )}
                    <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.65rem 0.85rem', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Total Value</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399' }}>₹{uploadStats.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    </div>
                    <div style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.65rem 0.85rem', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Paid Amount</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fbbf24' }}>₹{uploadStats.totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    </div>
                    <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.65rem 0.85rem', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Balance Due</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f87171' }}>₹{uploadStats.totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    </div>
                  </div>

                  {/* Preview Scrollable Table */}
                  <div style={{ maxHeight: '240px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.8)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', color: '#f8fafc' }}>
                      <thead>
                        <tr style={{ background: 'rgba(30, 41, 59, 0.95)', borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                          <th style={{ padding: '6px 8px' }}>#</th>
                          <th style={{ padding: '6px 8px' }}>Dealer/Store</th>
                          <th style={{ padding: '6px 8px' }}>Invoice No.</th>
                          <th style={{ padding: '6px 8px' }}>Date</th>
                          <th style={{ textAlign: 'right', padding: '6px 8px' }}>Total (₹)</th>
                          <th style={{ textAlign: 'right', padding: '6px 8px' }}>Paid (₹)</th>
                          <th style={{ textAlign: 'right', padding: '6px 8px' }}>Balance (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewRows.map((r, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '5px 8px', color: '#94a3b8' }}>{idx + 1}</td>
                            <td style={{ padding: '5px 8px', fontWeight: 700, color: '#fbcfe8' }}>{r.dealerStoreName}</td>
                            <td style={{ padding: '5px 8px', color: '#38bdf8' }}>{r.invoiceNo}</td>
                            <td style={{ padding: '5px 8px' }}>{r.invoiceDate}</td>
                            <td style={{ textAlign: 'right', padding: '5px 8px', fontWeight: 700, color: '#34d399' }}>₹{r.totalAmount.toFixed(2)}</td>
                            <td style={{ textAlign: 'right', padding: '5px 8px', color: '#fbbf24' }}>₹{r.paidAmount.toFixed(2)}</td>
                            <td style={{ textAlign: 'right', padding: '5px 8px', fontWeight: 700, color: r.balanceAmount > 0 ? '#f87171' : '#34d399' }}>₹{r.balanceAmount.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div style={{ padding: '0.85rem 1.5rem', background: 'rgba(30, 41, 59, 0.95)', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="btn btn-outline"
                style={{ padding: '0.5rem 1.25rem' }}
                disabled={uploading}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmImport}
                className="btn btn-primary"
                disabled={previewRows.length === 0 || uploading}
                style={{ 
                  padding: '0.5rem 1.5rem', 
                  fontWeight: 800, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  background: previewRows.length > 0 ? 'linear-gradient(135deg, #0ea5e9 0%, #10b981 100%)' : 'rgba(255,255,255,0.1)', 
                  border: 'none',
                  boxShadow: previewRows.length > 0 ? '0 4px 15px rgba(14, 165, 233, 0.4)' : 'none',
                  cursor: previewRows.length > 0 ? 'pointer' : 'not-allowed'
                }}
              >
                {uploading ? (
                  <>
                    <RefreshCw size={16} className="spin" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    <span>Confirm & Import ({previewRows.length}) Bills</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* VIEW SKIPPED DUPLICATES POP-UP MODAL                         */}
      {/* ============================================================ */}
      {isDuplicatesModalOpen && (
        <div 
          className="no-print-modal-overlay"
          style={{ 
            position: 'fixed', 
            inset: 0, 
            zIndex: 100001, 
            background: 'rgba(0, 0, 0, 0.9)', 
            backdropFilter: 'blur(8px)', 
            display: 'flex', 
            alignItems: 'flex-start', 
            justifyContent: 'center', 
            padding: '6.5rem 1rem 3rem 1rem',
            overflowY: 'auto'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsDuplicatesModalOpen(false);
          }}
        >
          <div 
            style={{ 
              width: '100%', 
              maxWidth: '920px', 
              background: '#0f172a', 
              border: '1.5px solid rgba(239, 68, 68, 0.5)', 
              borderRadius: '16px', 
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.98)',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: 'calc(100vh - 8rem)',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: '1rem 1.5rem', background: 'rgba(30, 41, 59, 0.95)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>
                  <AlertCircle size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                    Skipped Duplicate Bills ({duplicateRows.length})
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    The following bills were skipped because the same Dealer & Invoice No. already exists in your database
                  </span>
                </div>
              </div>

              <button 
                onClick={() => setIsDuplicatesModalOpen(false)} 
                className="btn btn-outline" 
                style={{ width: '32px', height: '32px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Search & Filter Toolbar */}
            <div style={{ padding: '0.85rem 1.5rem', background: 'rgba(15, 23, 42, 0.7)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ position: 'relative', width: '280px' }}>
                <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.2rem', fontSize: '0.8rem', height: '36px' }}
                  placeholder="Search dealer or invoice no..."
                  value={duplicateSearch}
                  onChange={e => setDuplicateSearch(e.target.value)}
                />
              </div>

              <button
                type="button"
                onClick={handleDownloadDuplicatesExcel}
                className="btn btn-outline"
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
              >
                <Download size={14} />
                <span>Export Duplicate List (.xlsx)</span>
              </button>
            </div>

            {/* Modal Body - Scrollable Duplicates Table */}
            <div style={{ padding: '1rem 1.5rem', overflowY: 'auto', maxHeight: '55vh' }}>
              {duplicateRows.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                  No duplicate records to show.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', color: '#f8fafc' }}>
                  <thead>
                    <tr style={{ background: 'rgba(30, 41, 59, 0.95)', borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                      <th style={{ padding: '8px 10px', width: '45px', textAlign: 'center' }}>#</th>
                      <th style={{ padding: '8px 10px', width: '80px', textAlign: 'center', color: '#94a3b8' }}>Excel Row</th>
                      <th style={{ padding: '8px 10px', color: '#fbcfe8' }}>Dealer / Store Name</th>
                      <th style={{ padding: '8px 10px', width: '110px', textAlign: 'center', color: '#f87171' }}>Invoice No.</th>
                      <th style={{ padding: '8px 10px', width: '95px', textAlign: 'center' }}>Date</th>
                      <th style={{ padding: '8px 10px', width: '110px', textAlign: 'right', color: '#34d399' }}>Amount (₹)</th>
                      <th style={{ padding: '8px 10px', minWidth: '150px', color: '#fbbf24' }}>Status / Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {duplicateRows
                      .filter(d => {
                        if (!duplicateSearch.trim()) return true;
                        const q = duplicateSearch.toLowerCase();
                        return (d.dealerStoreName || '').toLowerCase().includes(q) || (d.invoiceNo || '').toLowerCase().includes(q);
                      })
                      .map((d, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '7px 10px', textAlign: 'center', color: '#94a3b8' }}>{idx + 1}</td>
                          <td style={{ padding: '7px 10px', textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem' }}>Row {d.rowNum}</td>
                          <td style={{ padding: '7px 10px', fontWeight: 700, color: '#fbcfe8' }}>{d.dealerStoreName}</td>
                          <td style={{ padding: '7px 10px', textAlign: 'center' }}>
                            <span style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>
                              {d.invoiceNo}
                            </span>
                          </td>
                          <td style={{ padding: '7px 10px', textAlign: 'center', color: '#94a3b8' }}>{d.invoiceDate}</td>
                          <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 700, color: '#34d399' }}>₹{Number(d.totalAmount).toFixed(2)}</td>
                          <td style={{ padding: '7px 10px', color: '#fbbf24', fontSize: '0.75rem' }}>
                            ⚠️ {d.reason}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '0.85rem 1.5rem', background: 'rgba(30, 41, 59, 0.95)', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setIsDuplicatesModalOpen(false)}
                className="btn btn-primary"
                style={{ padding: '0.5rem 1.5rem', fontWeight: 700 }}
              >
                Back to Import Preview
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
