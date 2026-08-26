import React, { useState, useEffect } from 'react';
import { fetchNextGatePassNo, createGatePass, updateGatePass, fetchCustomers } from '../services/api';
import { GatePassPrintModal } from '../components/GatePassPrintModal';
import { Toast } from '../components/Toast';
import { FileText, Plus, Save, Printer, RefreshCw, Trash2, ArrowLeft, PlusCircle } from 'lucide-react';

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
    receiverName: '',
    passType: 'OUT',
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
        // Load customers for selection dropdown
        const custList = await fetchCustomers();
        setCustomers(custList || []);

        if (editingGatePass) {
          // Editing mode
          setFormData({
            id: editingGatePass.id,
            gatePassNo: editingGatePass.gatePassNo,
            gatePassDate: editingGatePass.gatePassDate ? editingGatePass.gatePassDate : new Date().toISOString().split('T')[0],
            receiverName: editingGatePass.receiverName || '',
            passType: editingGatePass.passType || 'OUT',
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
      showToast('Receiver Name (To) is required.', 'error');
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
        showToast('Out Gate Pass updated successfully!');
      } else {
        result = await createGatePass(payload);
        showToast('Out Gate Pass created successfully!');
      }

      if (printImmediately) {
        setPrintPass(result);
        setIsPrintOpen(true);
      } else {
        // Delay navigation back
        setTimeout(() => {
          onCancelEdit();
        }, 1200);
      }
    } catch (err) {
      showToast('Failed to save Out Gate Pass.', 'error');
    } finally {
      setSaving(false);
    }
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
          {editingGatePass ? 'Edit Out Gate Pass' : 'New Out Gate Pass'}
        </h2>
      </div>

      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        
        {/* Section Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <FileText size={18} color="#fbbf24" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', margin: 0 }}>
            Gate Pass Header Info
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
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
              <option value="OUT">Out Gate Pass (To)</option>
              <option value="IN">In Gate Pass (From)</option>
            </select>
          </div>

          {/* To / Receiver Selector (Autocomplete) */}
          <div style={{ gridColumn: 'span 2' }}>
            <label className="form-label">
              {formData.passType === 'IN' ? 'From (Sender / Customer Details)' : 'To (Receiver / Customer Details)'}
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
              <input 
                type="text" 
                className="form-input" 
                value={formData.receiverName} 
                onChange={e => handleInputChange('receiverName', e.target.value)} 
                placeholder="Type customer name, agency, or select from dropdown below..."
              />
              <select 
                className="form-select" 
                onChange={e => {
                  if (e.target.value) {
                    const cust = customers.find(c => c.customerName === e.target.value);
                    const nameAndAddress = cust ? `${cust.customerName}\n${cust.address}` : e.target.value;
                    handleInputChange('receiverName', nameAndAddress);
                  }
                }}
                value=""
              >
                <option value="">-- Quick Load Customer from Directory --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.customerName}>{c.customerName}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Items Table Section */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white', margin: 0 }}>
            Gate Pass Items List
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

        <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-light)', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.05)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.75rem', width: '70px', textAlign: 'center' }}>Sl.No</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Description of Items</th>
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

        {/* Form Actions Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.875rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <button 
            type="button" 
            onClick={onCancelEdit} 
            className="btn btn-outline"
          >
            Cancel
          </button>

          <button 
            type="button" 
            onClick={() => handleSave(false)} 
            disabled={saving} 
            className="btn btn-outline"
            style={{ color: '#6366f1', borderColor: 'rgba(99, 102, 241, 0.4)' }}
          >
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save only'}</span>
          </button>

          <button 
            type="button" 
            onClick={() => handleSave(true)} 
            disabled={saving} 
            className="btn btn-primary"
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
          onClose={() => {
            setIsPrintOpen(false);
            onCancelEdit();
          }} 
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
