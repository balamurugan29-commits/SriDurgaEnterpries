import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  fetchItems, 
  createItem, 
  updateItem, 
  deleteItem, 
  bulkCreateItems, 
  formatUnitWithQty,
  moveItemsToFolder,
  renameFolder as apiRenameFolder,
  deleteFolder as apiDeleteFolder
} from '../services/api';
import { ItemModal } from '../components/ItemModal';
import { ExportDesignerModal } from '../components/ExportDesignerModal';
import { Toast } from '../components/Toast';
import { 
  Search, 
  Plus, 
  Download, 
  Upload, 
  Edit3, 
  Trash2, 
  Database, 
  RefreshCw, 
  Layers, 
  FilterX, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  X, 
  ChevronRight as BreadcrumbChevron,
  Folder,
  FolderPlus,
  FolderOpen,
  FolderEdit,
  FolderX as FolderXIcon,
  MoveRight,
  CheckSquare
} from 'lucide-react';
import * as XLSX from 'xlsx';

const ITEM_MASTER_COLUMNS = [
  { key: 'serialNumber', label: 'S.NO.' },
  { key: 'folderName', label: 'FOLDER' },
  { key: 'itemCode', label: 'ITEM CODE' },
  { key: 'description', label: 'DESCRIPTION' },
  { key: 'quantity', label: 'QTY' },
  { key: 'unit', label: 'UNIT' },
  { key: 'rate', label: 'RATE (₹)' },
  { key: 'serviceCharge', label: 'SERVICE CHARGE (₹)' },
  { key: 'amount', label: 'AMOUNT (₹)' }
];

const CUSTOM_FOLDERS_STORAGE_KEY = 'sri_durga_custom_folders';

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

  // Folder Management State (Folder-by-Folder Navigation)
  const [selectedFolder, setSelectedFolder] = useState(() => {
    const saved = localStorage.getItem(CUSTOM_FOLDERS_STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : ['General'];
    return parsed[0] || 'General';
  });
  const [customFolders, setCustomFolders] = useState(() => {
    const saved = localStorage.getItem(CUSTOM_FOLDERS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : ['General'];
  });

  // Folder Action Modals (Create, Rename, Delete with 2-Step Confirmation, Move)
  const [folderModal, setFolderModal] = useState({
    isOpen: false,
    mode: 'create', // 'create', 'rename', 'delete', 'move'
    targetFolder: '',
    newFolderName: '',
    deleteStep: 1, // 1 for first confirmation, 2 for final confirmation
    deleteItems: true, // permanently deletes folder and its items
    itemIds: []
  });

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

      // Auto-discover folder names from items
      if (data && data.length > 0) {
        const itemFolders = data.map(i => i.folderName || 'General').filter(Boolean);
        setCustomFolders(prev => {
          const merged = Array.from(new Set([...prev, ...itemFolders]));
          localStorage.setItem(CUSTOM_FOLDERS_STORAGE_KEY, JSON.stringify(merged));
          return merged;
        });
      }
    } catch (err) {
      setToast({ message: 'Failed to load Master Page items: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems(searchQuery);
  }, [searchQuery]);

  // Compute Distinct Folders and Counts
  const folderCounts = useMemo(() => {
    const counts = {};
    items.forEach(i => {
      const f = i.folderName || 'General';
      counts[f] = (counts[f] || 0) + 1;
    });
    return counts;
  }, [items]);

  const allAvailableFolders = useMemo(() => {
    const set = new Set([...customFolders, ...Object.keys(folderCounts)]);
    const list = Array.from(set).filter(Boolean);
    return list.length > 0 ? list : ['General'];
  }, [customFolders, folderCounts]);

  // Filter items strictly by Selected Folder (Folder-by-Folder view)
  const folderFilteredItems = useMemo(() => {
    const active = (selectedFolder || 'General').toLowerCase().trim();
    return items.filter(i => (i.folderName || 'General').toLowerCase().trim() === active);
  }, [items, selectedFolder]);

  // Select All Checkbox Handler
  const isAllSelected = folderFilteredItems.length > 0 && selectedItemIds.length === folderFilteredItems.length;

  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(folderFilteredItems.map(i => i.id));
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

  // Bulk Move Selected Items to Folder
  const handleOpenMoveModal = () => {
    if (selectedItemIds.length === 0) return;
    setFolderModal({
      isOpen: true,
      mode: 'move',
      targetFolder: selectedFolder !== 'ALL' ? selectedFolder : 'General',
      newFolderName: '',
      deleteItems: false,
      itemIds: selectedItemIds
    });
  };

  const handleConfirmMove = async () => {
    const target = folderModal.newFolderName.trim() || folderModal.targetFolder.trim() || 'General';
    try {
      setLoading(true);
      await moveItemsToFolder(folderModal.itemIds, target);
      
      // Add target folder to list if not present
      if (!allAvailableFolders.includes(target)) {
        const updated = Array.from(new Set([...customFolders, target]));
        setCustomFolders(updated);
        localStorage.setItem(CUSTOM_FOLDERS_STORAGE_KEY, JSON.stringify(updated));
      }

      setToast({ message: `Successfully moved ${folderModal.itemIds.length} item(s) to folder '${target}'!`, type: 'success' });
      setFolderModal({ isOpen: false, mode: 'create', targetFolder: '', newFolderName: '', deleteItems: false, itemIds: [] });
      setSelectedItemIds([]);
      await loadItems(searchQuery);
    } catch (err) {
      setToast({ message: 'Move failed: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Create Folder Handler
  const handleCreateFolder = () => {
    const name = folderModal.newFolderName.trim();
    if (!name) {
      setToast({ message: 'Please enter a folder name', type: 'error' });
      return;
    }
    if (allAvailableFolders.some(f => f.toLowerCase() === name.toLowerCase())) {
      setToast({ message: `Folder '${name}' already exists!`, type: 'error' });
      return;
    }
    const updated = Array.from(new Set([...customFolders, name]));
    setCustomFolders(updated);
    localStorage.setItem(CUSTOM_FOLDERS_STORAGE_KEY, JSON.stringify(updated));
    setSelectedFolder(name);
    setToast({ message: `Folder '${name}' created successfully!`, type: 'success' });
    setFolderModal({ isOpen: false, mode: 'create', targetFolder: '', newFolderName: '', deleteItems: false, itemIds: [] });
  };

  // Rename Folder Handler (Works for ANY folder including General)
  const handleRenameFolder = async () => {
    const oldName = folderModal.targetFolder;
    const newName = folderModal.newFolderName.trim();
    if (!newName || newName.toLowerCase() === oldName.toLowerCase()) {
      setFolderModal({ isOpen: false, mode: 'create', targetFolder: '', newFolderName: '', deleteStep: 1, deleteItems: true, itemIds: [] });
      return;
    }

    try {
      setLoading(true);
      await apiRenameFolder(oldName, newName);
      
      let updated = customFolders.map(f => f.toLowerCase() === oldName.toLowerCase() ? newName : f);
      if (!updated.some(f => f.toLowerCase() === newName.toLowerCase())) {
        updated.push(newName);
      }
      const uniqueFolders = Array.from(new Set(updated.filter(Boolean)));
      setCustomFolders(uniqueFolders);
      localStorage.setItem(CUSTOM_FOLDERS_STORAGE_KEY, JSON.stringify(uniqueFolders));

      if (selectedFolder.toLowerCase() === oldName.toLowerCase()) {
        setSelectedFolder(newName);
      }

      setToast({ message: `✨ Folder renamed from '${oldName}' to '${newName}'!`, type: 'success' });
      setFolderModal({ isOpen: false, mode: 'create', targetFolder: '', newFolderName: '', deleteStep: 1, deleteItems: true, itemIds: [] });
      await loadItems(searchQuery);
    } catch (err) {
      setToast({ message: 'Rename failed: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Delete Folder Handler (Permanent Deletion after Double Confirmation)
  const handleDeleteFolder = async () => {
    const target = folderModal.targetFolder;
    if (!target) {
      setToast({ message: 'No folder specified to delete', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      // Permanently delete folder and all its items from database
      await apiDeleteFolder(target, true);

      const remainingCustom = customFolders.filter(f => f.toLowerCase() !== target.toLowerCase());
      const remainingAll = allAvailableFolders.filter(f => f.toLowerCase() !== target.toLowerCase());
      const nextFolder = remainingAll.length > 0 ? remainingAll[0] : (remainingCustom.length > 0 ? remainingCustom[0] : 'General');

      const finalCustomList = remainingCustom.length > 0 ? remainingCustom : [nextFolder];
      setCustomFolders(finalCustomList);
      localStorage.setItem(CUSTOM_FOLDERS_STORAGE_KEY, JSON.stringify(finalCustomList));

      setSelectedFolder(nextFolder);
      setToast({ 
        message: `🗑️ Folder '${target}' and all its items were permanently deleted.`, 
        type: 'success' 
      });
      setFolderModal({ isOpen: false, mode: 'create', targetFolder: '', newFolderName: '', deleteStep: 1, deleteItems: true, itemIds: [] });
      await loadItems(searchQuery);
    } catch (err) {
      setToast({ message: 'Delete folder failed: ' + err.message, type: 'error' });
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

  // Save / Add Single Item with Folder-Scoped Duplicate Item Code Validation
  const handleSaveItem = async (itemData) => {
    try {
      const code = (itemData.itemCode || '').trim().toUpperCase();
      const targetFolder = (itemData.folderName || selectedFolder || 'General').trim();
      const folderKey = targetFolder.toLowerCase();
      
      // Scoped Duplicate Check: Only check for duplicates within the SAME folder!
      if (!itemData.id) {
        const isDuplicateInFolder = items.some(i => 
          (i.folderName || 'General').toLowerCase().trim() === folderKey && 
          i.itemCode.toUpperCase().trim() === code
        );
        if (isDuplicateInFolder) {
          setToast({ message: `Duplicate Item Code '${code}' already exists in folder '${targetFolder}'! (Same item code can be used in other folders)`, type: 'error' });
          return;
        }
      } else {
        const isDuplicateInFolderOther = items.some(i => 
          i.id !== itemData.id && 
          (i.folderName || 'General').toLowerCase().trim() === folderKey && 
          i.itemCode.toUpperCase().trim() === code
        );
        if (isDuplicateInFolderOther) {
          setToast({ message: `Item Code '${code}' is already used by another item in folder '${targetFolder}'!`, type: 'error' });
          return;
        }
      }

      if (itemData.id) {
        await updateItem(itemData.id, { ...itemData, folderName: targetFolder });
        setToast({ message: `Item '${itemData.itemCode}' updated in folder '${targetFolder}'!`, type: 'success' });
      } else {
        await createItem({ ...itemData, folderName: targetFolder });
        setToast({ message: `Item '${itemData.itemCode}' added to folder '${targetFolder}'!`, type: 'success' });
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

  // Process Batch Import Helper
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
        let sNoIdx = -1, itemCodeIdx = -1, descIdx = -1, qtyIdx = -1, unitIdx = -1, rateIdx = -1, scIdx = -1, folderIdx = -1;

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
            else if (h.includes('folder') || h.includes('category') || h.includes('group')) folderIdx = colIdx;
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
        const defaultAssignedFolder = (selectedFolder || 'General').trim();
        const targetFolderKey = defaultAssignedFolder.toLowerCase();

        // Duplicate checking scoped ONLY to the target folder
        const existingCodesInFolder = new Set(
          items
            .filter(i => (i.folderName || 'General').toLowerCase().trim() === targetFolderKey)
            .map(i => i.itemCode.toUpperCase().trim())
        );
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
          let rawFolder = folderIdx !== -1 && row[folderIdx] !== undefined ? String(row[folderIdx]).trim() : defaultAssignedFolder;

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
          const cleanFolder = rawFolder || defaultAssignedFolder;

          const itemObj = {
            serialNumber: parsedItems.length + 1,
            itemCode: rawCode,
            description: rawDesc || 'Specification details',
            quantity: cleanQty,
            unit: cleanUnit,
            rate: cleanRate,
            serviceCharge: cleanSc,
            folderName: cleanFolder,
            amount: cleanQty * (cleanRate + cleanSc)
          };

          parsedItems.push(itemObj);

          // Check if duplicate in the target folder
          if (existingCodesInFolder.has(rawCode)) {
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
  const totalItemsCount = folderFilteredItems.length;
  const totalPages = Math.ceil(totalItemsCount / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentPagedItems = folderFilteredItems.slice(startIndex, startIndex + pageSize);

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
              <BreadcrumbChevron size={12} />
              <span style={{ color: '#34d399', fontWeight: 800 }}>📁 {selectedFolder}</span>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Item Master Catalog Management
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Folder-scoped item specifications, units, rates, and automatic service charge repository.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.4rem 0.85rem', borderRadius: '10px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399' }}>
              Folder '{selectedFolder}': {folderFilteredItems.length} Items Active
            </span>
          </div>
        </div>
      </div>

      {/* FOLDER NAVIGATION / CATEGORY MANAGEMENT BAR */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '1rem 1.25rem', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.85rem',
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1.5px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '14px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 800, color: '#38bdf8' }}>
            <FolderOpen size={18} />
            <span>Item Folders & Categories</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {/* Create Folder Button */}
            <button
              onClick={() => setFolderModal({ isOpen: true, mode: 'create', targetFolder: '', newFolderName: '', deleteStep: 1, deleteItems: true, itemIds: [] })}
              className="btn btn-outline"
              style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem', borderColor: 'rgba(56, 189, 248, 0.4)', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              title="Create New Folder"
            >
              <FolderPlus size={14} />
              <span>Create Folder</span>
            </button>

            {/* Rename Folder Button (for active folder) */}
            <button
              onClick={() => {
                const target = selectedFolder || allAvailableFolders[0] || 'General';
                setFolderModal({ isOpen: true, mode: 'rename', targetFolder: target, newFolderName: target, deleteStep: 1, deleteItems: true, itemIds: [] });
              }}
              className="btn btn-outline"
              style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem', color: '#fbbf24', borderColor: 'rgba(251, 191, 36, 0.4)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              title={`Rename active folder '${selectedFolder}'`}
            >
              <Edit3 size={13} />
              <span>Rename Folder</span>
            </button>

            {/* Delete Folder Button (for active folder with 2-step confirmation) */}
            <button
              onClick={() => {
                const target = selectedFolder || allAvailableFolders[0] || 'General';
                setFolderModal({ isOpen: true, mode: 'delete', targetFolder: target, newFolderName: '', deleteStep: 1, deleteItems: true, itemIds: [] });
              }}
              className="btn btn-outline"
              style={{ fontSize: '0.78rem', padding: '0.4rem 0.65rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              title={`Delete active folder '${selectedFolder}' (Double confirmation)`}
            >
              <Trash2 size={13} />
              <span>Delete Folder</span>
            </button>
          </div>
        </div>

        {/* Scrollable Folder Pills (No "All Items" - Pure Folder Navigation) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Individual Folder Pills with Inline Rename & Delete */}
          {allAvailableFolders.map(folder => {
            const count = folderCounts[folder] || 0;
            const isSelected = (selectedFolder || '').toLowerCase() === folder.toLowerCase();

            return (
              <div
                key={folder}
                style={{
                  borderRadius: '10px',
                  border: isSelected ? '1.5px solid #34d399' : '1px solid var(--border-color)',
                  background: isSelected ? 'linear-gradient(135deg, rgba(52, 211, 153, 0.25) 0%, rgba(5, 150, 105, 0.3) 100%)' : 'rgba(255, 255, 255, 0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px',
                  transition: 'all 0.15s ease'
                }}
              >
                {/* Main Folder Click Area */}
                <button
                  onClick={() => { setSelectedFolder(folder); setCurrentPage(1); }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '0.4rem 0.65rem 0.4rem 0.75rem',
                    color: isSelected ? '#34d399' : 'var(--text-main)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem'
                  }}
                >
                  <Folder size={15} color={isSelected ? '#34d399' : 'var(--text-muted)'} />
                  <span>{folder}</span>
                  <span style={{ background: isSelected ? 'rgba(52, 211, 153, 0.25)' : 'rgba(255,255,255,0.1)', padding: '1px 6px', borderRadius: '12px', fontSize: '0.72rem', color: isSelected ? '#34d399' : 'var(--text-muted)' }}>
                    {count}
                  </span>
                </button>

                {/* Inline Rename Quick Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFolderModal({ isOpen: true, mode: 'rename', targetFolder: folder, newFolderName: folder, deleteStep: 1, deleteItems: true, itemIds: [] });
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '0.35rem 0.45rem',
                    color: '#fbbf24',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: '6px',
                    opacity: 0.8
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(251, 191, 36, 0.18)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.8'; e.currentTarget.style.background = 'transparent'; }}
                  title={`Rename '${folder}' folder`}
                >
                  <Edit3 size={12} />
                </button>

                {/* Inline Delete Quick Button for EVERY folder */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFolderModal({ isOpen: true, mode: 'delete', targetFolder: folder, newFolderName: '', deleteStep: 1, deleteItems: true, itemIds: [] });
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '0.35rem 0.45rem',
                    color: '#ef4444',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: '6px',
                    opacity: 0.7,
                    marginRight: '2px'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.18)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7'; e.currentTarget.style.background = 'transparent'; }}
                  title={`Delete '${folder}' folder (Double confirmation)`}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Action Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Search Input */}
        <div style={{ position: 'relative', flex: 1, minWidth: '280px', maxWidth: '420px' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.5rem', fontSize: '0.85rem', width: '100%' }}
            placeholder={`Search in '${selectedFolder}'...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
          
          {/* BULK MOVE TO FOLDER BUTTON */}
          {selectedItemIds.length > 0 && (
            <button
              onClick={handleOpenMoveModal}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem', padding: '0.55rem 0.95rem', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              title="Move selected items to another folder"
            >
              <Folder size={15} />
              <span>Move to Folder ({selectedItemIds.length})</span>
            </button>
          )}

          {selectedItemIds.length > 0 && (
            <button
              onClick={handleBulkDeleteSelected}
              className="btn btn-danger"
              style={{ fontSize: '0.85rem', padding: '0.55rem 0.85rem' }}
              title="Delete all selected items"
            >
              <Trash2 size={15} />
              <span>Delete Selected ({selectedItemIds.length})</span>
            </button>
          )}

          {/* Export Designer Button */}
          <button 
            onClick={() => setExportModalOpen(true)}
            className="btn btn-outline"
            style={{ fontSize: '0.85rem', padding: '0.55rem 0.85rem', borderColor: 'rgba(52, 211, 153, 0.4)', color: '#34d399' }}
            title={`Export items from '${selectedFolder}' to Excel / PDF`}
          >
            <Download size={15} />
            <span>Export Designer</span>
          </button>

          {/* Folder-Specific Upload Button */}
          <button
            onClick={handleTriggerUpload}
            className="btn btn-secondary"
            style={{
              fontSize: '0.85rem',
              padding: '0.55rem 0.95rem',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              borderColor: 'rgba(99, 102, 241, 0.5)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)'
            }}
            disabled={uploading}
            title={`Upload Excel/Document directly into folder '${selectedFolder}'`}
          >
            <Upload size={15} />
            <span>{uploading ? 'Uploading...' : `Upload to ${selectedFolder}`}</span>
          </button>

          {/* Add New Item Button */}
          <button
            onClick={handleOpenAddModal}
            className="btn btn-primary"
            style={{ fontSize: '0.85rem', padding: '0.55rem 1.15rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            title={`Add single new item to folder '${selectedFolder}'`}
          >
            <Plus size={16} />
            <span>Add Item</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => loadItems(searchQuery)}
            className="btn btn-outline"
            style={{ padding: '0.55rem', fontSize: '0.85rem' }}
            title="Refresh Catalog"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Catalog Table Panel */}
      <div className="glass-panel" style={{ padding: '1.25rem', overflowX: 'auto' }}>
        
        {/* Table Header Controls: Sub-title & Page Size Selector */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>
            <Layers size={16} color="#818cf8" />
            <span>
              {selectedFolder === 'ALL' ? 'Master Items Inventory Catalog' : `Folder: ${selectedFolder}`}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              ({folderFilteredItems.length} items found)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span>Show</span>
            <select
              className="form-select"
              style={{ width: 'auto', padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="250">250</option>
              <option value="500">500</option>
            </select>
            <span>per page</span>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: 'rgba(30, 41, 59, 0.6)', borderBottom: '1.5px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '10px', width: '40px', textAlign: 'center' }}>
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAllToggle}
                  style={{ cursor: 'pointer' }}
                  title="Select All"
                />
              </th>
              <th style={{ padding: '10px', width: '50px', textAlign: 'center' }}>S.NO</th>
              <th style={{ padding: '10px', width: '12%', textAlign: 'center' }}>FOLDER</th>
              <th style={{ padding: '10px', width: '10%', textAlign: 'center' }}>ITEM CODE</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>DESCRIPTION</th>
              <th style={{ padding: '10px', width: '60px', textAlign: 'center' }}>QTY</th>
              <th style={{ padding: '10px', width: '70px', textAlign: 'center' }}>UNIT</th>
              <th style={{ padding: '10px', width: '100px', textAlign: 'right' }}>RATE (₹)</th>
              <th style={{ padding: '10px', width: '120px', textAlign: 'right' }}>SERVICE CHARGE (₹)</th>
              <th style={{ padding: '10px', width: '100px', textAlign: 'right' }}>AMOUNT (₹)</th>
              <th style={{ padding: '10px', width: '90px', textAlign: 'center' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={11} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  Loading catalog items...
                </td>
              </tr>
            ) : currentPagedItems.length === 0 ? (
              <tr>
                <td colSpan={11} style={{ textAlign: 'center', padding: '3.5rem 1.5rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                    <Folder size={44} color="#34d399" style={{ opacity: 0.6 }} />
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.25rem 0' }}>
                        {searchQuery ? `No items matched '${searchQuery}'` : `Folder '${selectedFolder}' is currently empty`}
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                        {searchQuery ? 'Try clearing your search query.' : `Start by adding items or uploading an Excel/document directly into '${selectedFolder}'.`}
                      </p>
                    </div>
                    {!searchQuery && (
                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                        <button 
                          onClick={handleOpenAddModal} 
                          className="btn btn-primary" 
                          style={{ fontSize: '0.8rem', padding: '0.45rem 1rem' }}
                        >
                          <Plus size={14} />
                          <span>Add Item to {selectedFolder}</span>
                        </button>
                        <button 
                          onClick={handleTriggerUpload} 
                          className="btn btn-secondary" 
                          style={{ fontSize: '0.8rem', padding: '0.45rem 1rem', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white' }}
                        >
                          <Upload size={14} />
                          <span>Upload to {selectedFolder}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              currentPagedItems.map((item, idx) => {
                const isSelected = selectedItemIds.includes(item.id);
                const overallSNo = startIndex + idx + 1;

                return (
                  <tr
                    key={item.id || idx}
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                      background: isSelected ? 'rgba(99, 102, 241, 0.08)' : undefined
                    }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectItemToggle(item.id)}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      {item.serialNumber || overallSNo}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <span style={{ 
                        fontSize: '0.725rem', 
                        padding: '2px 8px', 
                        borderRadius: '12px', 
                        background: 'rgba(56, 189, 248, 0.12)', 
                        color: '#38bdf8', 
                        border: '1px solid rgba(56, 189, 248, 0.25)',
                        fontWeight: 600,
                        whiteSpace: 'nowrap'
                      }}>
                        📁 {item.folderName || 'General'}
                      </span>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <span style={{ 
                        background: 'rgba(99, 102, 241, 0.15)', 
                        color: '#818cf8', 
                        padding: '2px 8px', 
                        borderRadius: '6px', 
                        fontWeight: 800, 
                        fontSize: '0.8rem' 
                      }}>
                        {item.itemCode}
                      </span>
                    </td>
                    <td style={{ padding: '10px', lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>
                      {item.description}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center', fontWeight: 600 }}>
                      {item.quantity}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <span style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>
                        {item.unit || 'No'}
                      </span>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700 }}>
                      ₹{Number(item.rate || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right', color: item.serviceCharge > 0 ? '#fbbf24' : 'var(--text-muted)' }}>
                      ₹{Number(item.serviceCharge || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 800, color: '#34d399' }}>
                      ₹{Number(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="btn btn-outline"
                          style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}
                          title="Edit Item"
                        >
                          <Edit3 size={13} color="#818cf8" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id, item.itemCode)}
                          className="btn btn-outline"
                          style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem', borderColor: 'rgba(239,68,68,0.3)' }}
                          title="Delete Item"
                        >
                          <Trash2 size={13} color="#ef4444" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.25rem', flexWrap: 'wrap', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Showing <strong>{startIndex + 1}</strong> to <strong>{Math.min(startIndex + pageSize, totalItemsCount)}</strong> of <strong>{totalItemsCount}</strong> items
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="btn btn-outline"
                style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                title="First Page"
              >
                <ChevronsLeft size={14} />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="btn btn-outline"
                style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                title="Previous Page"
              >
                <ChevronLeft size={14} />
              </button>

              <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '0 0.5rem', color: 'var(--text-main)' }}>
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="btn btn-outline"
                style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                title="Next Page"
              >
                <ChevronRight size={14} />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="btn btn-outline"
                style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                title="Last Page"
              >
                <ChevronsRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Item Modal */}
      <ItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveItem}
        editItem={editItemData}
        nextSno={folderFilteredItems.length + 1}
        availableFolders={allAvailableFolders}
        defaultFolder={selectedFolder || 'General'}
      />

      {/* Export Designer Modal */}
      <ExportDesignerModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        title="Item Master Inventory Catalog"
        data={folderFilteredItems}
        availableColumns={ITEM_MASTER_COLUMNS}
      />

      {/* FOLDER ACTION MODAL (Create / Rename / Delete / Move) */}
      {folderModal.isOpen && (
        <div 
          style={{ 
            position: 'fixed', 
            inset: 0, 
            zIndex: 10000, 
            background: 'rgba(0,0,0,0.8)', 
            backdropFilter: 'blur(6px)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '1rem' 
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setFolderModal({ isOpen: false, mode: 'create', targetFolder: '', newFolderName: '', deleteItems: false, itemIds: [] }); }}
        >
          <div 
            className="glass-panel" 
            style={{ 
              width: '100%', 
              maxWidth: '480px', 
              background: 'var(--bg-card-solid)', 
              border: '1.5px solid rgba(56, 189, 248, 0.4)', 
              borderRadius: '16px', 
              padding: '1.5rem',
              boxShadow: '0 25px 60px rgba(0,0,0,0.7)'
            }}
          >
            {/* Modal Title */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8', fontWeight: 800, fontSize: '1.1rem' }}>
                <Folder size={20} />
                <span>
                  {folderModal.mode === 'create' && 'Create New Folder'}
                  {folderModal.mode === 'rename' && `Rename Folder '${folderModal.targetFolder}'`}
                  {folderModal.mode === 'delete' && `Delete Folder '${folderModal.targetFolder}'`}
                  {folderModal.mode === 'move' && `Move ${folderModal.itemIds.length} Items to Folder`}
                </span>
              </div>
              <button 
                onClick={() => setFolderModal({ isOpen: false, mode: 'create', targetFolder: '', newFolderName: '', deleteItems: false, itemIds: [] })} 
                className="btn btn-outline" 
                style={{ padding: '0.35rem' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            {folderModal.mode === 'create' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="form-label">Folder Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Overhauling Motors, Electrical Spares, HT Rewinding..."
                    value={folderModal.newFolderName}
                    onChange={e => setFolderModal(prev => ({ ...prev, newFolderName: e.target.value }))}
                    autoFocus
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button onClick={() => setFolderModal({ isOpen: false, mode: 'create', targetFolder: '', newFolderName: '', deleteItems: false, itemIds: [] })} className="btn btn-outline">
                    Cancel
                  </button>
                  <button onClick={handleCreateFolder} className="btn btn-primary">
                    Create Folder
                  </button>
                </div>
              </div>
            )}

            {folderModal.mode === 'rename' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="form-label">Folder to Rename</label>
                  <select
                    className="form-select"
                    value={folderModal.targetFolder}
                    onChange={e => setFolderModal(prev => ({ ...prev, targetFolder: e.target.value, newFolderName: e.target.value }))}
                  >
                    {allAvailableFolders.map(f => (
                      <option key={f} value={f}>📁 {f}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">New Folder Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter new folder name..."
                    value={folderModal.newFolderName}
                    onChange={e => setFolderModal(prev => ({ ...prev, newFolderName: e.target.value }))}
                    autoFocus
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button onClick={() => setFolderModal({ isOpen: false, mode: 'create', targetFolder: '', newFolderName: '', deleteItems: false, itemIds: [] })} className="btn btn-outline">
                    Cancel
                  </button>
                  <button onClick={handleRenameFolder} className="btn btn-secondary">
                    Save Name
                  </button>
                </div>
              </div>
            )}

            {/* 2-Step Permanent Delete Confirmation */}
            {folderModal.mode === 'delete' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {folderModal.deleteStep === 1 ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#fbbf24' }}>
                      <AlertTriangle size={28} />
                      <div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', margin: 0 }}>
                          Delete Folder: '{folderModal.targetFolder}'
                        </h4>
                        <span style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 600 }}>
                          Confirmation Step 1 of 2
                        </span>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '10px', padding: '1rem', lineHeight: 1.5, fontSize: '0.875rem' }}>
                      <p style={{ margin: '0 0 0.5rem 0', color: 'white' }}>
                        Are you sure you want to delete folder <strong style={{ color: '#fbbf24' }}>'{folderModal.targetFolder}'</strong>?
                      </p>
                      <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                        This folder contains <strong>{folderCounts[folderModal.targetFolder] || 0} item(s)</strong> which will also be permanently deleted.
                      </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.25rem' }}>
                      <button 
                        type="button"
                        onClick={() => setFolderModal({ isOpen: false, mode: 'create', targetFolder: '', newFolderName: '', deleteStep: 1, deleteItems: true, itemIds: [] })} 
                        className="btn btn-outline"
                      >
                        Cancel
                      </button>
                      <button 
                        type="button"
                        onClick={() => setFolderModal(prev => ({ ...prev, deleteStep: 2 }))} 
                        className="btn btn-secondary"
                        style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', fontWeight: 700 }}
                      >
                        Proceed to Final Confirmation &rarr;
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ef4444' }}>
                      <ShieldAlert size={32} />
                      <div>
                        <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ef4444', margin: 0 }}>
                          FINAL WARNING: Permanent Deletion
                        </h4>
                        <span style={{ fontSize: '0.75rem', color: '#f87171', fontWeight: 700 }}>
                          Confirmation Step 2 of 2 (Irreversible Action)
                        </span>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1.5px solid rgba(239, 68, 68, 0.4)', borderRadius: '10px', padding: '1rem', lineHeight: 1.5, fontSize: '0.875rem' }}>
                      <p style={{ margin: '0 0 0.5rem 0', color: 'white', fontWeight: 700 }}>
                        ⚠️ This action CANNOT be undone!
                      </p>
                      <p style={{ margin: 0, color: '#fca5a5', fontSize: '0.825rem' }}>
                        Folder <strong style={{ color: 'white' }}>'{folderModal.targetFolder}'</strong> and all <strong style={{ color: 'white' }}>{folderCounts[folderModal.targetFolder] || 0} item(s)</strong> inside it will be permanently erased from your database.
                      </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.25rem' }}>
                      <button 
                        type="button"
                        onClick={() => setFolderModal(prev => ({ ...prev, deleteStep: 1 }))} 
                        className="btn btn-outline"
                      >
                        &larr; Back
                      </button>
                      <button 
                        type="button"
                        onClick={handleDeleteFolder} 
                        className="btn btn-danger"
                        style={{ fontWeight: 800, padding: '0.6rem 1.25rem' }}
                      >
                        <Trash2 size={15} />
                        <span>Yes, Permanently Delete Folder</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {folderModal.mode === 'move' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="form-label">Select Target Folder</label>
                  <select
                    className="form-select"
                    value={folderModal.targetFolder}
                    onChange={e => setFolderModal(prev => ({ ...prev, targetFolder: e.target.value }))}
                  >
                    {allAvailableFolders.map(f => (
                      <option key={f} value={f}>📁 {f}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Or Create New Folder & Move:
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Type new folder name..."
                    value={folderModal.newFolderName}
                    onChange={e => setFolderModal(prev => ({ ...prev, newFolderName: e.target.value }))}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button onClick={() => setFolderModal({ isOpen: false, mode: 'create', targetFolder: '', newFolderName: '', deleteItems: false, itemIds: [] })} className="btn btn-outline">
                    Cancel
                  </button>
                  <button onClick={handleConfirmMove} className="btn btn-primary">
                    Move Items
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};
