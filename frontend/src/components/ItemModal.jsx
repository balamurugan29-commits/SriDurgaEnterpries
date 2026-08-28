import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Folder, Plus } from 'lucide-react';
import { formatUnitWithQty } from '../services/api';

export const ItemModal = ({ isOpen, onClose, onSave, editItem, nextSno, availableFolders = [], defaultFolder = 'General' }) => {
  const [itemCode, setItemCode] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('0');
  const [unit, setUnit] = useState('No');
  const [rate, setRate] = useState('');
  const [serviceCharge, setServiceCharge] = useState('');
  const [serialNumber, setSerialNumber] = useState(1);
  const [folderName, setFolderName] = useState('General');
  const [isCustomFolder, setIsCustomFolder] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editItem) {
      setSerialNumber(editItem.serialNumber);
      setItemCode(editItem.itemCode || '');
      setDescription(editItem.description || '');
      setQuantity(editItem.quantity !== undefined ? String(editItem.quantity) : '0');
      setUnit(editItem.unit || 'No');
      setRate(editItem.rate !== undefined ? String(editItem.rate) : '');
      setServiceCharge(editItem.serviceCharge !== undefined ? String(editItem.serviceCharge) : '0.00');
      setFolderName(editItem.folderName || 'General');
      setIsCustomFolder(!availableFolders.includes(editItem.folderName || 'General'));
    } else {
      setSerialNumber(nextSno || 1);
      setItemCode('');
      setDescription('');
      setQuantity('0');
      setUnit('No');
      setRate('');
      setServiceCharge('0.00');
      setFolderName(defaultFolder || 'General');
      setIsCustomFolder(false);
    }
    setError('');
  }, [editItem, isOpen, nextSno, defaultFolder]);

  if (!isOpen) return null;

  const numRate = parseFloat(rate) || 0;
  const numServiceCharge = parseFloat(serviceCharge) || 0;
  const numQty = parseFloat(quantity) || 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!itemCode.trim()) {
      setError('Item Code is required (e.g., W101)');
      return;
    }
    if (!description.trim()) {
      setError('Item Description is required');
      return;
    }
    if (numRate < 0) {
      setError('Rate cannot be negative');
      return;
    }

    const formattedUnit = formatUnitWithQty(unit, numQty);
    const calcAmount = numQty * (numRate + numServiceCharge);
    const finalFolder = folderName.trim() || 'General';

    onSave({
      id: editItem ? editItem.id : undefined,
      serialNumber: Number(serialNumber),
      itemCode: itemCode.trim().toUpperCase(),
      description: description.trim(),
      quantity: numQty,
      unit: formattedUnit,
      rate: numRate,
      serviceCharge: numServiceCharge,
      folderName: finalFolder,
      amount: calcAmount
    });
  };

  const folderOptions = Array.from(new Set(['General', ...availableFolders.filter(Boolean)]));

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '640px', padding: '1.75rem', border: '1px solid rgba(99, 102, 241, 0.3)', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.875rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {editItem ? 'Edit Master Item' : 'Add New Item to Master Page'}
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
              Master Page Item Details (Folder, Code, Description, Qty, Unit, Rate, Service Charge)
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '0.625rem 0.875rem', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Folder Selection Row */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', margin: 0 }}>
                <Folder size={14} color="#38bdf8" />
                <span>Folder / Category *</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsCustomFolder(prev => !prev);
                  if (!isCustomFolder) setFolderName('');
                  else setFolderName(defaultFolder || 'General');
                }}
                style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
              >
                <Plus size={12} />
                <span>{isCustomFolder ? 'Select Existing Folder' : '+ Create New Folder'}</span>
              </button>
            </div>

            {isCustomFolder ? (
              <input
                type="text"
                className="form-input"
                placeholder="Enter new folder name (e.g. Overhauling Motors, Electrical Spares)..."
                value={folderName}
                onChange={e => setFolderName(e.target.value)}
                required
                autoFocus
              />
            ) : (
              <select
                className="form-select"
                value={folderName}
                onChange={e => setFolderName(e.target.value)}
              >
                {folderOptions.map(f => (
                  <option key={f} value={f}>📁 {f}</option>
                ))}
              </select>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.875rem' }}>
            <div>
              <label className="form-label">S.No (Serial)</label>
              <input type="number" className="form-input" value={serialNumber} onChange={e => setSerialNumber(e.target.value)} required />
            </div>
            <div>
              <label className="form-label">Item Code *</label>
              <input type="text" className="form-input" placeholder="e.g. W101, B201" value={itemCode} onChange={e => setItemCode(e.target.value)} required />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label className="form-label" style={{ margin: 0 }}>Description / Item Name *</label>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {description.length} characters
              </span>
            </div>
            <textarea 
              className="form-textarea" 
              rows={3} 
              style={{ fontSize: '0.875rem', lineHeight: 1.5 }}
              placeholder="Type full item specifications, detailed descriptions, technical parameters..." 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              required 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label className="form-label">Qty</label>
              <input 
                type="number" 
                step="any" 
                min="0" 
                className="form-input" 
                value={quantity} 
                onChange={e => setQuantity(e.target.value)} 
              />
            </div>

            <div>
              <label className="form-label">Unit Type</label>
              <select 
                className="form-select" 
                value={unit} 
                onChange={e => setUnit(e.target.value)}
              >
                <option value="No">No / Nos</option>
                <option value="Mtr">Mtr / Mtrs</option>
                <option value="Set">Set / Sets</option>
                <option value="Kg">Kg / Kgs</option>
                <option value="Ltr">Ltr / Ltrs</option>
                <option value="Pair">Pair / Pairs</option>
                <option value="Box">Box / Boxes</option>
                <option value="Pcs">Pcs</option>
              </select>
            </div>

            <div>
              <label className="form-label">Rate (₹) *</label>
              <input type="number" step="any" min="0" className="form-input" placeholder="0.00" value={rate} onChange={e => setRate(e.target.value)} required />
            </div>

            <div>
              <label className="form-label">Service Charge (₹)</label>
              <input type="number" step="any" min="0" className="form-input" placeholder="0.00" value={serviceCharge} onChange={e => setServiceCharge(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-secondary">
              <Save size={16} />
              <span>{editItem ? 'Update Item' : 'Save Item'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
