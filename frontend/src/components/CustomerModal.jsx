import React, { useState, useEffect } from 'react';
import { X, Save, Building2 } from 'lucide-react';

export const CustomerModal = ({ isOpen, onClose, onSave, customer }) => {
  const [customerName, setCustomerName] = useState('');
  const [gstin, setGstin] = useState('');
  const [pan, setPan] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (customer) {
      setCustomerName(customer.customerName || '');
      setGstin(customer.gstin || '');
      setPan(customer.pan || '');
      setPhone(customer.phone || '');
      setAddress(customer.address || '');
    } else {
      setCustomerName('');
      setGstin('');
      setPan('');
      setPhone('');
      setAddress('');
    }
  }, [customer, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Please enter Customer / Company Name');
      return;
    }

    onSave({
      id: customer ? customer.id : undefined,
      serialNumber: customer ? customer.serialNumber : undefined,
      customerName: customerName.trim(),
      gstin: gstin.trim(),
      pan: pan.trim(),
      phone: phone.trim(),
      address: address.trim()
    });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', background: '#0f172a', border: '1px solid rgba(99, 102, 241, 0.4)', borderRadius: '16px', overflow: 'hidden' }}>
        
        {/* Modal Header */}
        <div style={{ padding: '1.25rem 1.5rem', background: 'rgba(30, 41, 59, 0.8)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', color: '#34d399' }}>
            <Building2 size={20} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', margin: 0 }}>
              {customer ? 'Edit Customer Details' : 'Add New Customer'}
            </h3>
          </div>
          <button onClick={onClose} className="btn btn-outline" style={{ padding: '0.4rem' }}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div>
            <label className="form-label">Customer / Company Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. M/s, Ocean Sparkle Ltd, Karaikal Port Pvt., Ltd."
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="form-label">GSTIN</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 34AAACO2519H1ZR"
                value={gstin}
                onChange={e => setGstin(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label">PAN</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. AAACO2519H"
                value={pan}
                onChange={e => setPan(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label">Contact Phone</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 9842492946"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Delivery & Billed Address</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Keezhavanjore, Thirumalairajan Pattinam, Karaikal - 609606."
              value={address}
              onChange={e => setAddress(e.target.value)}
            />
          </div>

          {/* Modal Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-secondary">
              <Save size={16} />
              <span>{customer ? 'Update Customer' : 'Save Customer'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
