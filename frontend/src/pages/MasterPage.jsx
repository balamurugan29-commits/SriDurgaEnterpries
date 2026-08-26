import React, { useState, useEffect, useRef } from 'react';
import { fetchItems, createItem, updateItem, deleteItem, bulkCreateItems, formatUnitWithQty } from '../services/api';
import { ItemModal } from '../components/ItemModal';
import { ExportDesignerModal } from '../components/ExportDesignerModal';
import { Toast } from '../components/Toast';
import { Search, Plus, Download, Upload, Edit3, Trash2, Database, RefreshCw, Layers, FilterX, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, AlertTriangle, CheckCircle2, ShieldAlert, X, ChevronRight as BreadcrumbChevron } from 'lucide-react';
import * as XLSX from 'xlsx';

const ITEM_MASTER_COLUMNS = [
  { key: 'serialNumber', label: 'S.NO.' },
  { key: 'itemCode', label: 'ITEM CODE' },
  { key: 'description', label: 'DESCRIPTION' },
  { key: 'quantity', label: 'QTY' },
  { key: 'unit', label: 'UNIT' },
  { key: 'rate', label: 'RATE (₹)' },
  { key: 'serviceCharge', label: 'SERVICE CHARGE (₹)' },
  { key: 'amount', label: 'AMOUNT (₹)' }
];

export const MasterPage = () => {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [editItemData, setEditItemData] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const fileInputRef = useRef(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Excel Duplicate Inspection Modal Prompt State
  const [duplicateModal, setDuplicateModal] = useState({
    isOpen: false,
    newItems: [],
    duplicateItems: [],
    totalCount: 0
  });

  const loadItems = async (query = '') => {
    try {
      setLoading(true);
      const data = await fetchItems(query);
      setItems(data || []);
      setSelectedItemIds([]);
      setCurrentPage(1);
    } catch (err) {
      setToast({ message: 'Failed to load Master Page items: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems(searchQuery);
  }, [searchQuery]);

  // Select All Checkbox Handler
  const handleSelectAllToggle = () => {
    if (selectedItemIds.length === items.length && items.length > 0) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(items.map(i => i.id));
    }
  };

  // Individual Row Select Handler
  const handleSelectItemToggle = (id) => {
    setSelectedItemIds(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  // Bulk Delete Handler for Selected Items
  const handleBulkDeleteSelected = async () => {
    if (selectedItemIds.length === 0) return;

    if (!window.confirm(`Are you sure you want to delete all ${selectedItemIds.length} selected items from Master Page?`)) {
      return;
    }

    try {
      setLoading(true);
      await Promise.all(selectedItemIds.map(id => deleteItem(id)));
      setToast({ message: `Successfully deleted ${selectedItemIds.length} selected items!`, type: 'success' });
      setSelectedItemIds([]);
      loadItems(searchQuery);
    } catch (err) {
      setToast({ message: 'Bulk deletion failed: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditItemData(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditItemData(item);
    setIsModalOpen(true);
  };

  // Save / Add Single Item with Duplicate Item Code Validation
  const handleSaveItem = async (itemData) => {
    try {
      const code = (itemData.itemCode || '').trim().toUpperCase();
      
      // Strict No-Duplicate Rule Check
      if (!itemData.id) {
        const isDuplicate = items.some(i => i.itemCode.toUpperCase() === code);
        if (isDuplicate) {
          setToast({ message: `Duplicate Item Code '${code}' is not allowed! Item Code already exists in catalog.`, type: 'error' });
          return;
        }
      } else {
        const isDuplicateOther = items.some(i => i.id !== itemData.id && i.itemCode.toUpperCase() === code);
        if (isDuplicateOther) {
          setToast({ message: `Item Code '${code}' is already used by another item in catalog!`, type: 'error' });
          return;
        }
      }

      if (itemData.id) {
        await updateItem(itemData.id, itemData);
        setToast({ message: `Item '${itemData.itemCode}' updated successfully!`, type: 'success' });
      } else {
        await createItem(itemData);
        setToast({ message: `Item '${itemData.itemCode}' added to Master Page!`, type: 'success' });
      }
      setIsModalOpen(false);
      loadItems(searchQuery);
    } catch (err) {
      setToast({ message: err.message || 'Operation failed', type: 'error' });
    }
  };

  const handleDeleteItem = async (id, itemCode) => {
    if (!window.confirm(`Are you sure you want to delete Item Code '${itemCode}' from Master Page?`)) {
      return;
    }
    try {
      await deleteItem(id);
      setToast({ message: `Item '${itemCode}' removed from Master Page`, type: 'success' });
      loadItems(searchQuery);
    } catch (err) {
      setToast({ message: 'Delete failed: ' + err.message, type: 'error' });
    }
  };

  const handleTriggerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Process Batch Import Helper (Uploads in chunks of 200 items with full description & unit support)
  const processBatchImport = async (itemsToUpload, modeLabel = 'items') => {
    if (!itemsToUpload || itemsToUpload.length === 0) {
      setToast({ message: 'No items to upload.', type: 'info' });
      return;
    }

    setUploading(true);
    const batchSize = 200;
    let totalUploaded = 0;

    try {
      for (let i = 0; i < itemsToUpload.length; i += batchSize) {
        const chunk = itemsToUpload.slice(i, i + batchSize);
        await bulkCreateItems(chunk);
        totalUploaded += chunk.length;
        setToast({ 
          message: `Uploading (${modeLabel}): ${totalUploaded} of ${itemsToUpload.length} saved...`, 
          type: 'info' 
        });
      }

      setToast({ message: `Successfully imported ${itemsToUpload.length} ${modeLabel} to Master Page!`, type: 'success' });
      loadItems(searchQuery);
    } catch (err) {
      setToast({ message: 'Excel import failed: ' + err.message, type: 'error' });
    } finally {
      setUploading(false);
      setDuplicateModal({ isOpen: false, newItems: [], duplicateItems: [], totalCount: 0 });
    }
  };

  // Excel Upload Handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary', raw: false });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

        if (rows.length < 2) {
          throw new Error('The uploaded file contains no data rows.');
        }

        // Header column detection
        let headerRowIndex = 0;
        let sNoIdx = -1, itemCodeIdx = -1, descIdx = -1, qtyIdx = -1, unitIdx = -1, rateIdx = -1, scIdx = -1;

        for (let r = 0; r < Math.min(5, rows.length); r++) {
          const row = rows[r];
          row.forEach((cell, colIdx) => {
            const h = String(cell || '').trim().toLowerCase();
            if (h.includes('s.no') || h.includes('sno') || h === 'sl no' || h === 'sl.no') sNoIdx = colIdx;
            else if (h.includes('code') || h.includes('item code') || h.includes('item_code')) itemCodeIdx = colIdx;
            else if (h.includes('desc') || h.includes('particular') || h.includes('item name')) descIdx = colIdx;
            else if (h.includes('qty') || h.includes('quantity')) qtyIdx = colIdx;
            else if (h.includes('unit') || h.includes('uom')) unitIdx = colIdx;
            else if (h.includes('service') || h.includes('sc') || h.includes('service charge')) scIdx = colIdx;
            else if (h.includes('rate') || h.includes('price') || h.includes('unit price')) rateIdx = colIdx;
          });
          if (itemCodeIdx !== -1 || descIdx !== -1) {
            headerRowIndex = r;
            break;
          }
        }

        // Column fallback mapping
        if (itemCodeIdx === -1 && descIdx === -1) {
          sNoIdx = 0; itemCodeIdx = 1; descIdx = 2; qtyIdx = 3; rateIdx = 4;
        } else {
          if (itemCodeIdx === -1) itemCodeIdx = 1;
          if (descIdx === -1) descIdx = 2;
          if (qtyIdx === -1) qtyIdx = 3;
          if (rateIdx === -1) rateIdx = 4;
        }

        const parsedItems = [];
        const existingCodesMap = new Map(items.map(i => [i.itemCode.toUpperCase().trim(), i]));
        const seenInFileCodes = new Set();

        const duplicateItemsList = [];
        const newItemsList = [];

        for (let i = headerRowIndex + 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length === 0) continue;

          let rawCode = row[itemCodeIdx] !== undefined ? String(row[itemCodeIdx]).trim() : '';
          let rawDesc = row[descIdx] !== undefined ? String(row[descIdx]).trim() : '';
          let rawQty = row[qtyIdx] !== undefined ? String(row[qtyIdx]).trim() : '1';
          let rawUnit = unitIdx !== -1 && row[unitIdx] !== undefined ? String(row[unitIdx]).trim() : 'No';
          let rawRate = row[rateIdx] !== undefined ? String(row[rateIdx]).trim() : '0';
          let rawSc = scIdx !== -1 && row[scIdx] !== undefined ? String(row[scIdx]).trim() : '0';

          if (!rawCode && !rawDesc) continue;

          if (!rawCode && rawDesc) {
            rawCode = `ITEM-${i}`;
          }

          rawCode = rawCode.toUpperCase();
          if (seenInFileCodes.has(rawCode)) {
            continue;
          }
          seenInFileCodes.add(rawCode);

          const cleanQty = parseFloat(rawQty.replace(/[^0-9.-]+/g, '')) || 1;
          const cleanRate = parseFloat(rawRate.replace(/[^0-9.-]+/g, '')) || 0;
          const cleanSc = parseFloat(rawSc.replace(/[^0-9.-]+/g, '')) || 0;
          const cleanUnit = formatUnitWithQty(rawUnit, cleanQty);

          const itemObj = {
            serialNumber: parsedItems.length + 1,
            itemCode: rawCode,
            description: rawDesc || 'Specification details',
            quantity: cleanQty,
            unit: cleanUnit,
            rate: cleanRate,
            serviceCharge: cleanSc,
            amount: cleanQty * (cleanRate + cleanSc)
          };

          parsedItems.push(itemObj);

          if (existingCodesMap.has(rawCode)) {
            duplicateItemsList.push(itemObj);
          } else {
            newItemsList.push(itemObj);
          }
        }

        if (parsedItems.length === 0) {
          throw new Error('No valid item records found in Excel/CSV file.');
        }

        if (duplicateItemsList.length > 0) {
          setDuplicateModal({
            isOpen: true,
            newItems: newItemsList,
            duplicateItems: duplicateItemsList,
            totalCount: parsedItems.length
          });
          setUploading(false);
          return;
        }

        await processBatchImport(parsedItems, 'new items');

      } catch (err) {
        setToast({ message: 'Error reading file: ' + err.message, type: 'error' });
        setUploading(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleImportNewOnly = () => {
    processBatchImport(duplicateModal.newItems, 'new items');
  };

  const handleImportAllOverwrite = () => {
    const allItemsToImport = [...duplicateModal.newItems, ...duplicateModal.duplicateItems];
    processBatchImport(allItemsToImport, 'items (with updates)');
  };

  const handleCancelDuplicateUpload = () => {
    setDuplicateModal({ isOpen: false, newItems: [], duplicateItems: [], totalCount: 0 });
    setToast({ message: 'Excel bulk upload cancelled.', type: 'info' });
  };

  // Pagination Slice
  const totalItemsCount = items.length;
  const totalPages = Math.ceil(totalItemsCount / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentPagedItems = items.slice(startIndex, startIndex + pageSize);

  const isAllSelected = selectedItemIds.length === items.length && items.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Duplicate Inspection Modal */}
      {duplicateModal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel animate-modal-entry" style={{ width: '100%', maxWidth: '540px', padding: '2rem', background: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.4)', boxShadow: '0 20px 50px rgba(0,0,0,0.9)' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.25rem', color: '#f59e0b' }}>
              <ShieldAlert size={32} />
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', margin: 0 }}>
                  Duplicate Items Detected
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Total Items in File: <strong style={{ color: 'white' }}>{duplicateModal.totalCount}</strong>
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', padding: '0.875rem', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: '#34d399', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>✨ New Items</span>
                <strong style={{ fontSize: '1.35rem', color: '#34d399' }}>{duplicateModal.newItems.length}</strong>
              </div>

              <div style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', padding: '0.875rem', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: '#fbbf24', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>⚠️ Duplicates</span>
                <strong style={{ fontSize: '1.35rem', color: '#fbbf24' }}>{duplicateModal.duplicateItems.length}</strong>
              </div>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'white', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              The uploaded file contains <strong style={{ color: '#fbbf24' }}>{duplicateModal.duplicateItems.length} duplicate Item Code(s)</strong> that already exist in your Master Catalog.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button 
                onClick={handleImportNewOnly} 
                className="btn btn-secondary" 
                style={{ padding: '0.85rem 1rem', fontSize: '0.875rem', justifyContent: 'space-between' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={18} />
                  <span>Import <strong>{duplicateModal.newItems.length} New Items Only</strong> (Skip Duplicates)</span>
                </div>
                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>(Recommended)</span>
              </button>

              <button 
                onClick={handleImportAllOverwrite} 
                className="btn btn-outline" 
                style={{ padding: '0.85rem 1rem', fontSize: '0.875rem', borderColor: 'rgba(99, 102, 241, 0.5)', color: '#818cf8', justifyContent: 'space-between' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <RefreshCw size={18} />
                  <span>Import All <strong>{duplicateModal.totalCount} Items</strong> (Update Duplicates)</span>
                </div>
                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Overwrite</span>
              </button>

              <button 
                onClick={handleCancelDuplicateUpload} 
                className="btn btn-danger" 
                style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', justifyContent: 'center' }}
              >
                <X size={16} />
                <span>Cancel Upload</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Hidden File Input for Excel Upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept=".xlsx, .xls, .csv" 
        style={{ display: 'none' }} 
      />

      {/* Breadcrumb & Module Navigation Indicator Header */}
      <div style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.18) 0%, rgba(16, 185, 129, 0.12) 100%)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '16px', padding: '1.25rem 1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.25)', padding: '0.75rem', borderRadius: '12px', color: '#818cf8' }}>
            <Database size={28} />
          </div>
          <div>
            {/* Breadcrumb Navigation Trail */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
              <span style={{ fontWeight: 600 }}>Master Page</span>
              <BreadcrumbChevron size={12} />
              <span style={{ color: '#818cf8', fontWeight: 700 }}>Item Master Inventory Catalog</span>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Item Master Catalog Management
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Central item specifications, units, rates, and automatic service charge repository.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span className="badge badge-code" style={{ color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.4)', background: 'rgba(16, 185, 129, 0.15)', fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>
            Catalog: <strong>{totalItemsCount}</strong> Items Active
          </span>
        </div>
      </div>

      {/* Top Search & Actions Bar (Perfect Alignment) */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        
        {/* Search Input */}
        <div style={{ flex: '1', minWidth: '280px', maxWidth: '500px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.75rem', paddingRight: searchQuery ? '2.5rem' : '1rem' }}
              placeholder="Search by Item Code (e.g. W101) or Description..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <FilterX size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons Group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {selectedItemIds.length > 0 && (
            <button 
              onClick={handleBulkDeleteSelected} 
              className="btn btn-danger"
              style={{ fontSize: '0.85rem' }}
              title="Delete all selected items"
            >
              <Trash2 size={16} />
              <span>Delete Selected ({selectedItemIds.length})</span>
            </button>
          )}

          <button 
            onClick={() => setExportModalOpen(true)} 
            className="btn btn-outline" 
            style={{ border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34d399' }} 
            title="Open Export Designer for Excel / PDF"
          >
            <Download size={16} />
            <span>Export Designer</span>
          </button>

          <button 
            onClick={handleTriggerUpload} 
            className="btn btn-outline" 
            style={{ border: '1px solid rgba(99, 102, 241, 0.4)', color: '#818cf8' }} 
            title="Upload Bulk Items from Excel/CSV"
            disabled={uploading}
          >
            {uploading ? <RefreshCw size={16} className="animate-spin" /> : <Upload size={16} />}
            <span>{uploading ? 'Uploading...' : 'Upload Excel'}</span>
          </button>
          
          <button onClick={handleOpenAddModal} className="btn btn-primary">
            <Plus size={16} />
            <span>+ Add New Item</span>
          </button>

          <button onClick={() => loadItems(searchQuery)} className="btn btn-outline" title="Refresh catalog">
            <RefreshCw size={15} />
          </button>
        </div>

      </div>

      {/* Main Items Catalog Table */}
      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        
        {/* Table Header Bar */}
        <div style={{ padding: '1rem 1.5rem', background: 'rgba(15, 23, 42, 0.6)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Layers size={20} color="#818cf8" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white', margin: 0 }}>
              Master Items Inventory Catalog
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {selectedItemIds.length > 0 && (
              <span className="badge badge-code" style={{ color: '#818cf8', borderColor: 'rgba(99, 102, 241, 0.4)', background: 'rgba(99, 102, 241, 0.15)' }}>
                {selectedItemIds.length} Selected
              </span>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span>Show</span>
              <select 
                value={pageSize} 
                onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="form-select"
                style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={500}>500</option>
              </select>
              <span>per page</span>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="custom-table-container" style={{ border: 'none', borderRadius: 0, maxHeight: '65vh', overflowY: 'auto' }}>
          <table className="custom-table" style={{ position: 'relative' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: '#0f172a' }}>
              <tr>
                <th style={{ width: '45px', textAlign: 'center', paddingLeft: '1rem' }}>
                  <input
                    type="checkbox"
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#6366f1' }}
                    checked={isAllSelected}
                    onChange={handleSelectAllToggle}
                    title="Select All Catalog Items"
                  />
                </th>
                <th style={{ width: '60px', textAlign: 'center' }}>S.No</th>
                <th style={{ width: '140px' }}>Item Code</th>
                <th>Description</th>
                <th style={{ width: '80px', textAlign: 'right' }}>Qty</th>
                <th style={{ width: '90px', textAlign: 'center' }}>Unit</th>
                <th style={{ width: '120px', textAlign: 'right' }}>Rate (₹)</th>
                <th style={{ width: '140px', textAlign: 'right' }}>Service Charge (₹)</th>
                <th style={{ width: '130px', textAlign: 'right' }}>Amount (₹)</th>
                <th style={{ width: '110px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem auto' }} />
                    <p style={{ margin: 0 }}>Loading master items database...</p>
                  </td>
                </tr>
              ) : currentPagedItems.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No items found. Click 'Add Item' or 'Upload Excel' to add records.
                  </td>
                </tr>
              ) : (
                currentPagedItems.map((item, index) => {
                  const isSelected = selectedItemIds.includes(item.id);
                  const displaySNo = startIndex + index + 1;
                  const itemUnitDisplay = formatUnitWithQty(item.unit || 'No', item.quantity || 1);

                  return (
                    <tr key={item.id} style={{ background: isSelected ? 'rgba(99, 102, 241, 0.12)' : undefined }}>
                      <td style={{ textAlign: 'center', paddingLeft: '1rem' }}>
                        <input
                          type="checkbox"
                          style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#6366f1' }}
                          checked={isSelected}
                          onChange={() => handleSelectItemToggle(item.id)}
                        />
                      </td>

                      <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)' }}>
                        {displaySNo}
                      </td>

                      <td>
                        <span className="badge badge-code">
                          {item.itemCode}
                        </span>
                      </td>

                      <td style={{ maxWidth: '400px', wordBreak: 'break-word', color: 'var(--text-main)', lineHeight: 1.4 }}>
                        {item.description}
                      </td>

                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {item.quantity || 1}
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.3)', fontSize: '0.75rem', padding: '0.2rem 0.5rem', fontWeight: 700 }}>
                          {itemUnitDisplay}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right', fontWeight: 600, color: '#e5e7eb' }}>
                        ₹{Number(item.rate || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      <td style={{ textAlign: 'right', fontWeight: 600, color: Number(item.serviceCharge) > 0 ? '#fbbf24' : 'var(--text-subtle)' }}>
                        {Number(item.serviceCharge) > 0 ? `+ ₹${Number(item.serviceCharge).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹0.00'}
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <span className="badge badge-amount">
                          ₹{Number(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="btn btn-outline"
                            style={{ padding: '0.35rem 0.5rem', color: '#818cf8', borderColor: 'rgba(99, 102, 241, 0.3)' }}
                            title="Edit Item"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id, item.itemCode)}
                            className="btn btn-danger"
                            style={{ padding: '0.35rem 0.5rem' }}
                            title="Delete Item"
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

        {/* Pagination Footer Controls */}
        {totalItemsCount > pageSize && (
          <div style={{ padding: '0.875rem 1.5rem', background: 'rgba(15, 23, 42, 0.6)', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Showing <strong>{startIndex + 1}</strong> to <strong>{Math.min(startIndex + pageSize, totalItemsCount)}</strong> of <strong>{totalItemsCount}</strong> items
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button 
                onClick={() => setCurrentPage(1)} 
                disabled={currentPage === 1} 
                className="btn btn-outline" 
                style={{ padding: '0.3rem 0.5rem' }}
                title="First Page"
              >
                <ChevronsLeft size={16} />
              </button>

              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                disabled={currentPage === 1} 
                className="btn btn-outline" 
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
              >
                <ChevronLeft size={16} /> Prev
              </button>

              <span style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem', color: '#818cf8', fontWeight: 700 }}>
                Page {currentPage} of {totalPages}
              </span>

              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                disabled={currentPage === totalPages} 
                className="btn btn-outline" 
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
              >
                Next <ChevronRight size={16} />
              </button>

              <button 
                onClick={() => setCurrentPage(totalPages)} 
                disabled={currentPage === totalPages} 
                className="btn btn-outline" 
                style={{ padding: '0.3rem 0.5rem' }}
                title="Last Page"
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        )}

      </div>

      <ItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveItem}
        item={editItemData}
      />

      <ExportDesignerModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        title="Master Items Inventory Catalog"
        data={selectedItemIds.length > 0 ? items.filter(i => selectedItemIds.includes(i.id)) : items}
        availableColumns={ITEM_MASTER_COLUMNS}
      />
    </div>
  );
};
