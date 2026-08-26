import React, { useState, useEffect, useRef } from 'react';
import { fetchCertificates, fetchNextCertificateNo, createCertificate, updateCertificate, deleteCertificate, fetchItems, fetchItemByCode } from '../services/api';
import { WorkCompletionPrintModal } from '../components/WorkCompletionPrintModal';
import { Toast } from '../components/Toast';
import { Award, Plus, Save, Printer, Trash2, Edit3, ChevronRight, FileCheck, Building, Sparkles, RotateCcw, Calendar, HelpCircle, CheckCircle2, ShieldCheck, Wrench, Package } from 'lucide-react';

const WCC_DRAFT_KEY = 'sri_durga_wcc_draft';

export const WorkCompletionPage = ({ editingCertificate, onCancelEdit }) => {
  const [masterItems, setMasterItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [savedCertificate, setSavedCertificate] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const isInitialMount = useRef(true);

  // Clean blank template for 100% fresh data entry
  const getBlankCertificateForm = (nextNo = '') => ({
    certificateNo: nextNo,
    certificateDate: new Date().toISOString().split('T')[0],
    agency: 'SRI DURGA ENTERPRISES, # 10 V.G. Nagar, Kovilpathu, Karaikal',
    rateContractRef: 'KKL/CAU-ASSET/SUPPORT/2023/1240914/SDE/9010038288',
    equipmentDescription: 'Material', // Default option: "Material" (or "Service")
    equipment: '', // Populated when "Service" is selected
    location: 'RMD#GCS',
    make: '-',
    slNo: '-',
    capacity: '-',
    typeModel: '-',
    completionTime: '5 Day(s)',
    dateHandingOver: '',
    dateCompletion: '',
    delayInCompletion: 'NIL',
    performanceOfMachines: 'OK',
    defectiveSparesReturned: 'NA',
    items: [
      { serialNumber: 1, rcItemNo: '', description: '', quantity: 1, unit: 'No.', itemType: 'MATERIAL' }
    ]
  });

  const [formData, setFormData] = useState(getBlankCertificateForm(''));

  const loadData = async () => {
    try {
      setLoading(true);
      const [items, nextNo] = await Promise.all([
        fetchItems(),
        fetchNextCertificateNo()
      ]);
      setMasterItems(items || []);

      if (editingCertificate) {
        setEditingId(editingCertificate.id);
        const mappedItems = (editingCertificate.items || []).map(item => ({
          ...item,
          itemType: item.itemType || 'MATERIAL'
        }));
        setFormData({ 
          ...editingCertificate,
          items: mappedItems.length > 0 ? mappedItems : [{ serialNumber: 1, rcItemNo: '', description: '', quantity: 1, unit: 'No.', itemType: 'MATERIAL' }]
        });
        setToast({ message: `Editing Certificate '${editingCertificate.certificateNo}'`, type: 'info' });
      } else {
        // Check for saved draft in localStorage
        const savedDraft = localStorage.getItem(WCC_DRAFT_KEY);
        if (savedDraft) {
          try {
            const parsedDraft = JSON.parse(savedDraft);
            if (parsedDraft.equipmentDescription || parsedDraft.equipment || parsedDraft.location || (parsedDraft.items && parsedDraft.items.some(i => i.rcItemNo || i.description))) {
              setFormData(parsedDraft);
              setHasDraft(true);
              return;
            }
          } catch (e) {
            console.error('Failed to parse certificate draft:', e);
          }
        }

        setFormData(getBlankCertificateForm(nextNo));
      }
    } catch (err) {
      console.error('Failed to load Work Completion data:', err);
    } finally {
      setLoading(false);
      isInitialMount.current = false;
    }
  };

  useEffect(() => {
    loadData();
  }, [editingCertificate]);

  // Real-time Draft Auto-Save: Whenever user types or modifies fields, save to localStorage
  useEffect(() => {
    if (isInitialMount.current || editingId || editingCertificate) {
      return;
    }

    if (formData.equipmentDescription || formData.equipment || formData.location || formData.items.some(i => i.rcItemNo || i.description)) {
      localStorage.setItem(WCC_DRAFT_KEY, JSON.stringify(formData));
      setHasDraft(true);
    }
  }, [formData, editingId, editingCertificate]);

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // If toggled to Service and there are no SERVICE items, add a blank one
      if (field === 'equipmentDescription' && value === 'Service') {
        const hasServiceItem = prev.items.some(i => i.itemType === 'SERVICE');
        if (!hasServiceItem) {
          updated.items = [
            { serialNumber: 1, rcItemNo: '', description: '', quantity: 1, unit: 'No.', itemType: 'SERVICE' },
            ...prev.items.map((item, idx) => ({ ...item, serialNumber: idx + 2, itemType: item.itemType || 'MATERIAL' }))
          ];
        }
      }
      return updated;
    });
  };

  // Helper to filter items with mainIndex
  const getFilteredItems = (type) => {
    return formData.items
      .map((item, index) => ({ ...item, mainIndex: index }))
      .filter(item => (item.itemType || 'MATERIAL') === type);
  };

  // RC Item No Change & Auto-fetch from Item Master
  const handleRcItemChange = async (index, code) => {
    const updated = [...formData.items];
    const trimmedCode = (code || '').trim();
    updated[index].rcItemNo = trimmedCode;

    if (!trimmedCode) {
      setFormData(prev => ({ ...prev, items: updated }));
      return;
    }

    let matchedItem = masterItems.find(
      i => i.itemCode && i.itemCode.toLowerCase().trim() === trimmedCode.toLowerCase().trim()
    );

    if (!matchedItem) {
      try {
        matchedItem = await fetchItemByCode(trimmedCode);
      } catch (e) {}
    }

    if (matchedItem) {
      updated[index].description = matchedItem.description || updated[index].description;
      updated[index].unit = matchedItem.unit || 'No.';
      updated[index].quantity = matchedItem.quantity || 1;
      setToast({ 
        message: `Auto-fetched '${matchedItem.itemCode}' from Item Master!`, 
        type: 'success' 
      });
    }

    setFormData(prev => ({ ...prev, items: updated }));
  };

  const handleItemFieldChange = (index, field, value) => {
    const updated = [...formData.items];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, items: updated }));
  };

  const handleAddItem = (type = 'MATERIAL') => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { serialNumber: prev.items.length + 1, rcItemNo: '', description: '', quantity: 1, unit: 'No.', itemType: type }
      ]
    }));
  };

  const handleAutoFillSample = () => {
    setFormData({
      certificateNo: formData.certificateNo || 'WCC-01/26-27',
      certificateDate: '2026-02-21',
      agency: 'SRI DURGA ENTERPRISES, # 10 V.G. Nagar, Kovilpathu, Karaikal',
      rateContractRef: 'KKL/CAU-ASSET/SUPPORT/2023/1240914/SDE/9010038288',
      equipmentDescription: 'Service',
      equipment: 'Self Starter',
      location: 'KVK#GCS',
      make: 'Lucas',
      slNo: '-',
      capacity: '24V',
      typeModel: '-',
      completionTime: '10 Day(s)',
      dateHandingOver: '18/02/2026',
      dateCompletion: '21/02/2026',
      delayInCompletion: 'NIL',
      performanceOfMachines: 'OK',
      defectiveSparesReturned: 'NA',
      items: [
        { serialNumber: 1, rcItemNo: '43.1', description: 'Rewinding of Armature of 24V Self Starter', quantity: 1, unit: 'No.', itemType: 'SERVICE' },
        { serialNumber: 2, rcItemNo: '43.3', description: 'S&F of Solenoid Coil with Plunger', quantity: 1, unit: 'No.', itemType: 'MATERIAL' },
        { serialNumber: 3, rcItemNo: '43.7', description: 'S&F of Clutch Assembly', quantity: 1, unit: 'No.', itemType: 'MATERIAL' },
        { serialNumber: 4, rcItemNo: '43.4', description: 'S&F of Bentex Assembly', quantity: 1, unit: 'No.', itemType: 'MATERIAL' },
        { serialNumber: 5, rcItemNo: '43.6', description: 'S&F of Carbon Brush', quantity: 2, unit: 'Nos', itemType: 'MATERIAL' }
      ]
    });
    setToast({ message: 'Auto-populated fields with PDF sample data!', type: 'success' });
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length <= 1) {
      setToast({ message: 'Certificate must have at least one line item', type: 'error' });
      return;
    }
    const updated = formData.items.filter((_, idx) => idx !== index).map((item, idx) => ({
      ...item,
      serialNumber: idx + 1
    }));
    setFormData(prev => ({ ...prev, items: updated }));
  };

  // Complete Reset of Form to Enter 100% Fresh New Data
  const handleResetForm = async () => {
    setEditingId(null);
    if (onCancelEdit) onCancelEdit();
    localStorage.removeItem(WCC_DRAFT_KEY);
    setHasDraft(false);

    try {
      const nextNo = await fetchNextCertificateNo();
      setFormData(getBlankCertificateForm(nextNo));
    } catch (e) {
      setFormData(getBlankCertificateForm('WCC-01/26-27'));
    }
    setToast({ message: 'Cleared all fields. Ready for fresh new certificate entry!', type: 'info' });
  };

  const handleSave = async (shouldPrint = false) => {
    if (!formData.certificateNo || !formData.certificateNo.trim()) {
      setToast({ message: 'Certificate No is required', type: 'error' });
      return;
    }

    const validItems = formData.items.filter(i => (i.rcItemNo && i.rcItemNo.trim()) || (i.description && i.description.trim()));
    if (validItems.length === 0) {
      setToast({ message: 'Please enter at least one RC Item or specification description', type: 'error' });
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        items: validItems.map((item, idx) => ({
          ...item,
          serialNumber: idx + 1
        }))
      };

      let saved;
      if (editingId) {
        saved = await updateCertificate(editingId, payload);
        setToast({ message: `Work Completion Certificate '${formData.certificateNo}' updated!`, type: 'success' });
      } else {
        saved = await createCertificate(payload);
        setToast({ message: `Work Completion Certificate '${formData.certificateNo}' generated successfully!`, type: 'success' });
      }

      setSavedCertificate(saved || payload);
      localStorage.removeItem(WCC_DRAFT_KEY);
      setHasDraft(false);

      if (shouldPrint) {
        setPrintModalOpen(true);
      } else {
        setPrintModalOpen(true);
      }
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('not found')) {
        setToast({ message: 'The Certificate you are editing was not found in the database. Switched to New Certificate mode.', type: 'error' });
        setEditingId(null);
        if (onCancelEdit) onCancelEdit();
      } else {
        setToast({ message: 'Generation failed: ' + err.message, type: 'error' });
      }
    } finally {
      setSaving(false);
    }
  };

  const renderTableRows = (itemsList, type) => (
    <div className="custom-table-container" style={{ border: 'none', borderRadius: 0 }}>
      <table className="custom-table">
        <thead>
          <tr>
            <th style={{ width: '60px', textAlign: 'center' }}>Sl.No.</th>
            <th style={{ width: '180px' }}>RC Item No.</th>
            <th>Description</th>
            <th style={{ width: '120px', textAlign: 'right' }}>Qty</th>
            <th style={{ width: '110px', textAlign: 'center' }}>Unit</th>
            <th style={{ width: '60px', textAlign: 'center' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {itemsList.length > 0 ? (
            itemsList.map((item, idx) => (
              <tr key={idx}>
                <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {idx + 1}
                </td>
                <td>
                  <input 
                    type="text" 
                    list={`rc-items-${type}-${idx}`} 
                    className="form-input" 
                    style={{ fontWeight: 700, color: type === 'SERVICE' ? '#fbbf24' : '#34d399' }} 
                    placeholder="Select / Type RC Item" 
                    value={item.rcItemNo || ''} 
                    onChange={e => handleRcItemChange(item.mainIndex, e.target.value)} 
                  />
                  <datalist id={`rc-items-${type}-${idx}`}>
                    {masterItems.map(m => (
                      <option key={m.id} value={m.itemCode}>
                        {m.description ? m.description.slice(0, 45) + '...' : ''}
                      </option>
                    ))}
                  </datalist>
                </td>
                <td>
                  <textarea 
                    className="form-input" 
                    rows={1} 
                    placeholder={type === 'SERVICE' ? "Service/repair description..." : "Material specification description..."} 
                    value={item.description || ''} 
                    onChange={e => handleItemFieldChange(item.mainIndex, 'description', e.target.value)} 
                  />
                </td>
                <td style={{ textAlign: 'right' }}>
                  <input 
                    type="number" 
                    step="any" 
                    className="form-input" 
                    style={{ textAlign: 'right', fontWeight: 700 }} 
                    value={item.quantity} 
                    onChange={e => handleItemFieldChange(item.mainIndex, 'quantity', Number(e.target.value))} 
                  />
                </td>
                <td style={{ textAlign: 'center' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ textAlign: 'center', fontWeight: 600, color: '#818cf8' }} 
                    value={item.unit || 'No.'} 
                    onChange={e => handleItemFieldChange(item.mainIndex, 'unit', e.target.value)} 
                  />
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveItem(item.mainIndex)} 
                    className="btn btn-danger" 
                    style={{ padding: '0.4rem', borderRadius: '6px' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No items added yet. Click the button on the top right to add one.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderItemsSection = () => {
    if (isServiceSelected) {
      const serviceItems = getFilteredItems('SERVICE');
      const materialItems = getFilteredItems('MATERIAL');

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Service Items Table */}
          <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', background: 'rgba(15, 23, 42, 0.6)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <Sparkles size={18} color="#fbbf24" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white', margin: 0 }}>
                  3a. Work to be Carried Out (Service Items)
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => handleAddItem('SERVICE')} 
                className="btn btn-secondary" 
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', borderColor: 'rgba(245, 158, 11, 0.4)' }}
              >
                <Plus size={15} /> Add Work Item
              </button>
            </div>
            {renderTableRows(serviceItems, 'SERVICE')}
          </div>

          {/* Material Items Table */}
          <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', background: 'rgba(15, 23, 42, 0.6)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <Sparkles size={18} color="#34d399" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white', margin: 0 }}>
                  3b. Materials Used (Material Items)
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => handleAddItem('MATERIAL')} 
                className="btn btn-secondary" 
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
              >
                <Plus size={15} /> Add Material Item
              </button>
            </div>
            {renderTableRows(materialItems, 'MATERIAL')}
          </div>
        </div>
      );
    }

    // Material mode - standard single table
    const materialItems = getFilteredItems('MATERIAL');
    return (
      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', background: 'rgba(15, 23, 42, 0.6)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Sparkles size={18} color="#34d399" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white', margin: 0 }}>
              3. Materials & RC Item No. (Auto-Fetch Enabled)
            </h3>
          </div>
          <button 
            type="button"
            onClick={() => handleAddItem('MATERIAL')} 
            className="btn btn-secondary" 
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
          >
            <Plus size={15} /> Add Material Item
          </button>
        </div>
        {renderTableRows(materialItems, 'MATERIAL')}
      </div>
    );
  };

  const isServiceSelected = formData.equipmentDescription === 'Service';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(79, 70, 229, 0.15) 100%)', border: '1px solid rgba(16, 185, 129, 0.35)', borderRadius: '16px', padding: '1.25rem 1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.25)', padding: '0.75rem', borderRadius: '12px', color: '#34d399' }}>
            <Award size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
              <span style={{ fontWeight: 600 }}>Workflow:</span>
              <span style={{ color: '#34d399', fontWeight: 700 }}>Work Completion Certificate</span>
              <ChevronRight size={12} />
              <span style={{ color: 'var(--text-muted)' }}>Tax Invoice</span>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {editingId ? `Editing Certificate (${formData.certificateNo})` : 'Work Completion Certificate & Joint Inspection Report'}
              {hasDraft && !editingId && (
                <span className="badge badge-code" style={{ fontSize: '0.7rem', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.4)', background: 'rgba(16, 185, 129, 0.15)' }}>
                  Draft Preserved
                </span>
              )}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Auto-generate official Work Completion Certificates and Joint Inspection / Defect Reports directly from Item Master.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {isServiceSelected && (
            <button 
              type="button"
              onClick={handleAutoFillSample} 
              className="btn btn-secondary" 
              style={{ fontSize: '0.85rem', color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.4)', background: 'rgba(245, 158, 11, 0.1)' }}
              title="Auto-fill sample data from the Lucas Self Starter PDF"
            >
              <Sparkles size={15} />
              <span>Auto-fill PDF Sample</span>
            </button>
          )}
          <button 
            type="button"
            onClick={handleResetForm} 
            className="btn btn-outline" 
            style={{ fontSize: '0.85rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)' }}
            title="Clear all fields and enter fresh new certificate data"
          >
            <RotateCcw size={15} />
            <span>Clear All / New Certificate</span>
          </button>
        </div>
      </div>

      {/* Auto-Fetched Organization & Rate Contract Details Header */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', background: 'rgba(15, 23, 42, 0.7)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          <Building size={18} color="#34d399" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white', margin: 0 }}>
            1. Auto-Populated Agency & Master Details
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div>
            <label className="form-label">Agency (Auto-Populated)</label>
            <input 
              type="text" 
              className="form-input" 
              style={{ color: '#34d399', fontWeight: 600 }} 
              value={formData.agency} 
              onChange={e => handleInputChange('agency', e.target.value)} 
            />
          </div>

          <div>
            <label className="form-label">Rate Contract Ref. (Auto-Populated)</label>
            <input 
              type="text" 
              className="form-input" 
              style={{ color: '#fbbf24', fontWeight: 600 }} 
              value={formData.rateContractRef} 
              onChange={e => handleInputChange('rateContractRef', e.target.value)} 
            />
          </div>

          <div>
            <label className="form-label">Certificate No.</label>
            <input 
              type="text" 
              className="form-input" 
              style={{ fontWeight: 700, color: '#38bdf8' }} 
              value={formData.certificateNo} 
              onChange={e => handleInputChange('certificateNo', e.target.value)} 
            />
          </div>

          <div>
            <label className="form-label">Certificate Date</label>
            <input 
              type="date" 
              className="form-input" 
              value={formData.certificateDate} 
              onChange={e => handleInputChange('certificateDate', e.target.value)} 
            />
          </div>
        </div>
      </div>

      {/* Equipment Details Section with 2-Option Dropdown: Material vs Service */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileCheck size={18} color="#818cf8" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white', margin: 0 }}>
              2. Equipment & Requirement Details
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: isServiceSelected ? '#fbbf24' : '#34d399', fontWeight: 700 }}>
            {isServiceSelected ? <Wrench size={14} /> : <Package size={14} />}
            <span>Mode: {formData.equipmentDescription}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          
          {/* Requirement Dropdown: ONLY 2 Options (Material / Service) */}
          <div>
            <label className="form-label" style={{ fontWeight: 700, color: '#fbbf24' }}>
              Requirement Details <span style={{ color: '#f87171' }}>*</span>
            </label>
            <select
              className="form-select"
              style={{ fontWeight: 700, color: isServiceSelected ? '#fbbf24' : '#34d399', borderColor: isServiceSelected ? 'rgba(245, 158, 11, 0.4)' : 'rgba(16, 185, 129, 0.4)' }}
              value={formData.equipmentDescription || 'Material'}
              onChange={e => handleInputChange('equipmentDescription', e.target.value)}
            >
              <option value="Material">Material</option>
              <option value="Service">Service</option>
            </select>
          </div>

          {/* Conditional Field: Equipment appears BEFORE Location ONLY when "Service" is selected */}
          {isServiceSelected && (
            <div style={{ gridColumn: 'span 2' }}>
              <label className="form-label" style={{ color: '#fbbf24', fontWeight: 700 }}>
                Equipment <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>(Appears for Service mode)</span>
              </label>
              <input 
                type="text" 
                className="form-input" 
                style={{ borderColor: 'rgba(245, 158, 11, 0.4)', fontWeight: 600, color: '#ffffff' }}
                placeholder="e.g. Induction Motor 50HP / Submersible Pump / Contactor Assembly" 
                value={formData.equipment} 
                onChange={e => handleInputChange('equipment', e.target.value)} 
              />
            </div>
          )}

          {/* Location Field */}
          <div>
            <label className="form-label">Location</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. RMD#GCS" 
              value={formData.location} 
              onChange={e => handleInputChange('location', e.target.value)} 
            />
          </div>

          <div>
            <label className="form-label">Make</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. -" 
              value={formData.make} 
              onChange={e => handleInputChange('make', e.target.value)} 
            />
          </div>

          <div>
            <label className="form-label">Sl. No.</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. -" 
              value={formData.slNo} 
              onChange={e => handleInputChange('slNo', e.target.value)} 
            />
          </div>

          <div>
            <label className="form-label">Capacity</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. -" 
              value={formData.capacity} 
              onChange={e => handleInputChange('capacity', e.target.value)} 
            />
          </div>

          <div>
            <label className="form-label">Type / Model</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. -" 
              value={formData.typeModel} 
              onChange={e => handleInputChange('typeModel', e.target.value)} 
            />
          </div>
        </div>
      </div>

      {/* Materials & RC Item No. Table (Auto-Fetched from Item Master) */}
      {renderItemsSection()}

      {/* 4. Other Details / Certificate Details */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          <Calendar size={18} color="#fbbf24" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white', margin: 0 }}>
            4. Other Certificate Details (Inspection Dates & Completion Status)
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div>
            <label className="form-label">a. Date of Handing Over for Repairs <span style={{ color: '#34d399' }}>(Editable)</span></label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. 03/04/2026" 
              value={formData.dateHandingOver} 
              onChange={e => handleInputChange('dateHandingOver', e.target.value)} 
            />
          </div>

          <div>
            <label className="form-label">b. Date of Completion of Work <span style={{ color: '#34d399' }}>(Editable)</span></label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. 06/04/2026" 
              value={formData.dateCompletion} 
              onChange={e => handleInputChange('dateCompletion', e.target.value)} 
            />
          </div>

          <div>
            <label className="form-label">c. Delay in Completion of Work, if any</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. NIL" 
              value={formData.delayInCompletion} 
              onChange={e => handleInputChange('delayInCompletion', e.target.value)} 
            />
          </div>

          <div>
            <label className="form-label">d. Performance of Machines/Equipment after Repair</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. OK" 
              value={formData.performanceOfMachines} 
              onChange={e => handleInputChange('performanceOfMachines', e.target.value)} 
            />
          </div>

          <div>
            <label className="form-label">e. Defective Spares/Material Returned</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. NA" 
              value={formData.defectiveSparesReturned} 
              onChange={e => handleInputChange('defectiveSparesReturned', e.target.value)} 
            />
          </div>

          <div>
            <label className="form-label">Completion Time (For Joint Inspection Report)</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. 5 Day(s)" 
              value={formData.completionTime} 
              onChange={e => handleInputChange('completionTime', e.target.value)} 
            />
          </div>
        </div>
      </div>

      {/* 5. Generation Action Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <button 
          type="button" 
          onClick={handleResetForm} 
          className="btn btn-outline" 
          style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)' }}
        >
          <RotateCcw size={16} />
          <span>Clear All / New Certificate</span>
        </button>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            type="button" 
            disabled={saving} 
            onClick={() => handleSave(false)} 
            className="btn btn-primary" 
            style={{ padding: '0.85rem 1.75rem', fontWeight: 800, fontSize: '1rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
          >
            <Sparkles size={18} />
            <span>{saving ? 'Generating...' : editingId ? 'Update Certificate' : 'Generate Certificate'}</span>
          </button>

          <button 
            type="button" 
            disabled={saving} 
            onClick={() => handleSave(true)} 
            className="btn btn-secondary" 
            style={{ padding: '0.85rem 1.75rem', fontWeight: 800, fontSize: '1rem' }}
          >
            <Printer size={18} />
            <span>Generate & Print Certificate</span>
          </button>
        </div>
      </div>

      {/* Printable Preview Modal */}
      <WorkCompletionPrintModal 
        isOpen={printModalOpen} 
        onClose={() => setPrintModalOpen(false)} 
        certificate={savedCertificate} 
      />

    </div>
  );
};
