import React, { useState, useEffect } from 'react';
import { fetchNextGatePassNo, createGatePass, updateGatePass, fetchCustomers } from '../services/api';
import { GatePassPrintModal } from '../components/GatePassPrintModal';
import { Toast } from '../components/Toast';
import { FileText, Plus, Save, Printer, RefreshCw, Trash2, ArrowLeft, Building2, Truck, MapPin, Eye } from 'lucide-react';

export const GatePassPage = ({ editingGatePass, onCancelEdit }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nextNo, setNextNo] = useState('');
  
  // Modal & Toast state
  const [printPass, setPrintPass] = useState(null);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    gatePassNo: '',
    gatePassDate: new Date().toISOString().split('T')[0],
    passType: 'OUT',
    receiverName: '',
    siteName: '',
    vehicleNo: '',
    purposeForTransport: '',
    items: [
      { serialNumber: 1, description: '', quantity: '', remarks: '' }
    ]
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        setLoading(true);
        // Load customers for quick auto-load
        const custList = await fetchCustomers();
        setCustomers(custList || []);

        if (editingGatePass) {
          // Editing mode
          setFormData({
            id: editingGatePass.id,
            gatePassNo: editingGatePass.gatePassNo || '',
            gatePassDate: editingGatePass.gatePassDate ? editingGatePass.gatePassDate : new Date().toISOString().split('T')[0],
            passType: editingGatePass.passType || 'OUT',
            receiverName: editingGatePass.receiverName || '',
            siteName: editingGatePass.siteName || '',
            vehicleNo: editingGatePass.vehicleNo || '',
            purposeForTransport: editingGatePass.purposeForTransport || editingGatePass.reasonForTransfer || '',
            items: editingGatePass.items && editingGatePass.items.length > 0
              ? editingGatePass.items.map((it, idx) => ({
                  id: it.id,
                  serialNumber: it.serialNumber || (idx + 1),
                  description: it.description || '',
                  quantity: it.quantity || '',
                  remarks: it.remarks || ''
                }))
              : [{ serialNumber: 1, description: '', quantity: '', remarks: '' }]
          });
        } else {
          // Creation mode
          const num = await fetchNextGatePassNo();
          setNextNo(num);
          setFormData(prev => ({
            ...prev,
            gatePassNo: num,
            passType: 'OUT'
          }));
        }
      } catch (err) {
        showToast('Failed to load gate pass setup details.', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadMetadata();
  }, [editingGatePass]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleQuickCustomerSelect = (customerName) => {
    if (!customerName) return;
    const cust = customers.find(c => c.customerName === customerName);
    if (cust) {
      setFormData(prev => ({
        ...prev,
        receiverName: cust.customerName || ''
      }));
      showToast(`Selected '${cust.customerName}'!`, 'success');
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;
    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const addItemRow = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { serialNumber: prev.items.length + 1, description: '', quantity: '', remarks: '' }
      ]
    }));
  };

  const removeItemRow = (index) => {
    if (formData.items.length <= 1) return;
    const updated = formData.items.filter((_, idx) => idx !== index)
      .map((item, idx) => ({ ...item, serialNumber: idx + 1 }));
    setFormData(prev => ({
      ...prev,
      items: updated
    }));
  };

  const refreshGatePassNo = async () => {
    if (editingGatePass) return;
    try {
      const num = await fetchNextGatePassNo();
      setNextNo(num);
      handleInputChange('gatePassNo', num);
      showToast('Gate Pass number refreshed!');
    } catch (e) {
      showToast('Failed to refresh Gate Pass number', 'error');
    }
  };

  const validateForm = () => {
    if (!formData.gatePassNo || !formData.gatePassNo.trim()) {
      showToast('Gate Pass Number is required.', 'error');
      return false;
    }
    if (!formData.receiverName || !formData.receiverName.trim()) {
      showToast('Customer / Recipient Name is required.', 'error');
      return false;
    }
    const validItems = formData.items.filter(i => i.description && i.description.trim());
    if (validItems.length === 0) {
      showToast('At least one item with a description is required.', 'error');
      return false;
    }
    return true;
  };

  const handleSave = async (printImmediately = false) => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      // Clean blank item entries
      const cleanedItems = formData.items
        .filter(item => item.description && item.description.trim() !== '')
        .map((item, idx) => ({
          id: item.id,
          serialNumber: idx + 1,
          description: item.description,
          quantity: item.quantity,
          remarks: item.remarks
        }));

      const payload = {
        ...formData,
        items: cleanedItems
      };

      let result;
      if (editingGatePass) {
        result = await updateGatePass(editingGatePass.id, payload);
        showToast('Gate Pass updated successfully!');
      } else {
        result = await createGatePass(payload);
        showToast('Gate Pass created successfully!');
      }

      if (printImmediately) {
        setPrintPass(result || payload);
        setIsPrintOpen(true);
      } else {
        setTimeout(() => {
          onCancelEdit();
        }, 1000);
      }
    } catch (err) {
      showToast('Failed to save Gate Pass: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePreviewGatePass = () => {
    const validItems = items.filter(i => (i.itemCode && i.itemCode.trim()) || (i.description && i.description.trim()));
    const payload = {
      ...formData,
      items: validItems.length > 0 ? validItems.map((item, idx) => ({ ...item, serialNumber: idx + 1 })) : items
    };
    setPrintPass(payload);
    setIsPrintOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Top action header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onCancelEdit} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={16} />
          <span>Back to List</span>
        </button>

        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'white', margin: 0 }}>
          {editingGatePass ? `Edit Gate Pass (${formData.gatePassNo})` : 'New Gate Pass'}
        </h2>
      </div>

      {/* Main Form Container */}
      <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Section 1: Gate Pass Header Information */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.65rem' }}>
            <FileText size={18} color="#fbbf24" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white', margin: 0 }}>
              1. Gate Pass Header
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {/* Gate Pass Number */}
            <div>
              <label className="form-label">Gate Pass No</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.gatePassNo} 
                  onChange={e => handleInputChange('gatePassNo', e.target.value)} 
                  disabled={editingGatePass} 
                  placeholder="e.g. GP-01/26-27"
                />
                {!editingGatePass && (
                  <button 
                    type="button" 
                    onClick={refreshGatePassNo} 
                    className="btn btn-outline" 
                    style={{ padding: '0.5rem' }} 
                    title="Generate next number"
                  >
                    <RefreshCw size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="form-label">Date</label>
              <input 
                type="date" 
                className="form-input" 
                value={formData.gatePassDate} 
                onChange={e => handleInputChange('gatePassDate', e.target.value)} 
              />
            </div>

            {/* Gate Pass Type Toggle */}
            <div>
              <label className="form-label">Gate Pass Type</label>
              <select 
                className="form-select" 
                value={formData.passType || 'OUT'} 
                onChange={e => handleInputChange('passType', e.target.value)}
              >
                <option value="OUT">Out Gate Pass (Delivery Challan - To)</option>
                <option value="IN">In Gate Pass (Receipt - From)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Customer & Site Details */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={18} color="#34d399" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white', margin: 0 }}>
                2. Party & Site Details ({formData.passType === 'IN' ? 'From' : 'To'})
              </h3>
            </div>

            {/* Quick Customer Load Dropdown */}
            <div style={{ width: '280px' }}>
              <select 
                className="form-select" 
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
                onChange={e => handleQuickCustomerSelect(e.target.value)}
                value=""
              >
                <option value="">-- Quick Load Customer from Master --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.customerName}>{c.customerName}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {/* Customer Name */}
            <div>
              <label className="form-label">
                Customer / Party Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input 
                type="text" 
                className="form-input" 
                value={formData.receiverName} 
                onChange={e => handleInputChange('receiverName', e.target.value)} 
                placeholder="e.g. ONGC / Oil and Natural Gas Corporation Ltd"
              />
            </div>

            {/* Site Name Field */}
            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#38bdf8' }}>
                <MapPin size={14} /> Site Name
              </label>
              <input 
                type="text" 
                className="form-input" 
                value={formData.siteName || ''} 
                onChange={e => handleInputChange('siteName', e.target.value)} 
                placeholder="e.g. Neravy Site / KVK#GCS / Karaikal Yard"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Transport & Vehicle Details */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.65rem' }}>
            <Truck size={18} color="#818cf8" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white', margin: 0 }}>
              3. Transport Details
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {/* Vehicle Number */}
            <div>
              <label className="form-label" style={{ fontWeight: 700, color: '#818cf8' }}>
                Vehicle Number
              </label>
              <input 
                type="text" 
                className="form-input" 
                value={formData.vehicleNo || ''} 
                onChange={e => handleInputChange('vehicleNo', e.target.value)} 
                placeholder="e.g. PY-02-C-1234 / TN-49-AB-5678"
              />
            </div>

            {/* Purpose for Transport */}
            <div>
              <label className="form-label">
                Purpose for Transport
              </label>
              <input 
                type="text" 
                className="form-input" 
                value={formData.purposeForTransport || ''} 
                onChange={e => handleInputChange('purposeForTransport', e.target.value)} 
                placeholder="e.g. For Repair & Rewinding / Material Dispatch / Returnable"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Items Table Section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white', margin: 0 }}>
              4. Description & Item Specifications
            </h3>
            <button 
              type="button" 
              onClick={addItemRow} 
              className="btn btn-outline" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
            >
              <Plus size={14} />
              <span>Add Item Row</span>
            </button>
          </div>

          <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-light)', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.05)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '0.75rem', width: '70px', textAlign: 'center' }}>Sl.No</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center' }}>Description of Items</th>
                  <th style={{ padding: '0.75rem', width: '180px', textAlign: 'center' }}>Quantity</th>
                  <th style={{ padding: '0.75rem', width: '220px', textAlign: 'left' }}>Remarks</th>
                  <th style={{ padding: '0.75rem', width: '70px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)', transition: 'background-color 0.2s' }}>
                    <td style={{ padding: '0.5rem', textAlign: 'center', fontWeight: '600' }}>
                      {index + 1}
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="e.g. 25 Sq.mm GI Rope with lugs"
                        value={item.description} 
                        onChange={e => handleItemChange(index, 'description', e.target.value)} 
                      />
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="e.g. 100 mtr / 05 nos"
                        style={{ textAlign: 'center' }}
                        value={item.quantity} 
                        onChange={e => handleItemChange(index, 'quantity', e.target.value)} 
                      />
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="e.g. Spare / Returnable"
                        value={item.remarks} 
                        onChange={e => handleItemChange(index, 'remarks', e.target.value)} 
                      />
                    </td>
                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                      <button 
                        type="button" 
                        disabled={formData.items.length <= 1}
                        onClick={() => removeItemRow(index)} 
                        className="btn btn-outline" 
                        style={{ padding: '0.4rem', border: 'none', color: '#ef4444' }}
                        title="Remove Row"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Form Actions Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.875rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', flexWrap: 'wrap' }}>
          <button 
            type="button" 
            onClick={onCancelEdit} 
            className="btn btn-outline"
          >
            Cancel
          </button>

          <button 
            type="button" 
            onClick={handlePreviewGatePass} 
            className="btn btn-outline"
            style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)', display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700 }}
          >
            <Eye size={16} />
            <span>Preview Out Pass</span>
          </button>

          <button 
            type="button" 
            onClick={() => handleSave(false)} 
            disabled={saving} 
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700 }}
          >
            <Save size={16} />
            <span>{saving ? 'Saving...' : editingGatePass ? 'Update Out Pass' : 'Save Out Pass'}</span>
          </button>

          <button 
            type="button" 
            onClick={() => handleSave(true)} 
            disabled={saving} 
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700 }}
          >
            <Printer size={16} />
            <span>{saving ? 'Processing...' : 'Save & Print'}</span>
          </button>
        </div>

      </div>

      {/* Render High-fidelity Print Preview Modal */}
      {isPrintOpen && (
        <GatePassPrintModal 
          isOpen={isPrintOpen} 
          onClose={() => setIsPrintOpen(false)} 
          gatePass={printPass} 
        />
      )}

      {/* Toast Alert */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

    </div>
  );
};
